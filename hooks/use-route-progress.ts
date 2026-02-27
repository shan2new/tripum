"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type CompletedState = Record<number, boolean>;

export function useRouteProgress(id: string) {
  const [completed, setCompleted] = useState<CompletedState>({});
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef<CompletedState>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/route-progress");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (!cancelled) {
          setCompleted(data);
          latestRef.current = data;
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
    (state: CompletedState) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        try {
          await fetch("/api/route-progress", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, completed: state }),
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
      setCompleted((prev) => {
        const next = { ...prev, [i]: !prev[i] };
        latestRef.current = next;
        syncToServer(next);
        return next;
      });
    },
    [syncToServer]
  );

  return { completed, toggle, loading };
}
