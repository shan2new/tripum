"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type CompletedState = Record<number, boolean>;
type CompletedAtState = Record<number, string>;

interface ProgressSnapshot {
  completed: CompletedState;
  completedAt: CompletedAtState;
  startTime: number | null; // minutes from midnight, null = use default
}

export function useRouteProgress(id: string) {
  const [completed, setCompleted] = useState<CompletedState>({});
  const [completedAt, setCompletedAt] = useState<CompletedAtState>({});
  const [startTime, setStartTimeState] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef<ProgressSnapshot>({
    completed: {},
    completedAt: {},
    startTime: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/route-progress");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (!cancelled) {
          const c = data.completed ?? {};
          const ca = data.completedAt ?? {};
          const st = data.startTime ?? null;
          setCompleted(c);
          setCompletedAt(ca);
          setStartTimeState(st);
          latestRef.current = { completed: c, completedAt: ca, startTime: st };
        }
      } catch (err) {
        console.error("Failed to fetch route progress:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  const syncToServer = useCallback(
    (state: ProgressSnapshot) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        try {
          await fetch("/api/route-progress", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id,
              completed: state.completed,
              completedAt: state.completedAt,
              startTime: state.startTime,
            }),
          });
        } catch (err) {
          console.error("Failed to sync route progress:", err);
        }
      }, 300);
    },
    [id]
  );

  const toggle = useCallback(
    (i: number) => {
      const wasDone = !!latestRef.current.completed[i];
      const nextCompleted = { ...latestRef.current.completed, [i]: !wasDone };
      const nextCompletedAt = { ...latestRef.current.completedAt };

      if (!wasDone) {
        nextCompletedAt[i] = new Date().toISOString();
      } else {
        delete nextCompletedAt[i];
      }

      latestRef.current = { ...latestRef.current, completed: nextCompleted, completedAt: nextCompletedAt };
      setCompleted(nextCompleted);
      setCompletedAt(nextCompletedAt);
      syncToServer(latestRef.current);
    },
    [syncToServer]
  );

  const setStartTime = useCallback(
    (time: number | null) => {
      setStartTimeState(time);
      latestRef.current = { ...latestRef.current, startTime: time };
      syncToServer(latestRef.current);
    },
    [syncToServer]
  );

  return { completed, completedAt, startTime, toggle, setStartTime, loading };
}
