"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { useSteps } from "@/hooks/use-steps";
import { useLanguage } from "@/hooks/use-language";
import { usePacking } from "@/hooks/use-packing";
import { CARDS as LIB_CARDS } from "@/lib/cards";
import { computeAdjustedPlanTimes, type AdjustedTime } from "@/lib/schedule";
import type { StepCard, BilingualText } from "@/lib/types";

/* ─── V8 Card Type & Adapter ─── */
export type V8Card = {
  slug: string; day: number; dayLabel: string; dayTitle: string; sort: number;
  title: string; sub: string; time: string; dur: number; tip: string;
  carry: string[]; skip: boolean; phase: number | null;
  next: string | null; nextTime: string | null; nextSlug: string | null;
};

const DAY_META: Record<number, [string, string]> = {
  0: ["Feb 28", "Arrival Day"], 1: ["Mar 1", "Core Darshan"], 2: ["Mar 2", "Return Day"],
};

function toV8Card(card: StepCard, t: (bi: BilingualText) => string): V8Card {
  const nextCard = card.nextSlug ? LIB_CARDS.find(c => c.slug === card.nextSlug) ?? null : null;
  const [dayLabel, dayTitle] = DAY_META[card.dayNumber] ?? ["", ""];
  const phaseNum = card.phase ? parseInt(card.phase.match(/\d/)?.[0] ?? "0") : null;
  return {
    slug: card.slug, day: card.dayNumber, dayLabel, dayTitle, sort: card.sortOrder,
    title: t(card.title), sub: t(card.subtitle), time: card.timeWindow, dur: card.durationMin,
    tip: t(card.tip), carry: card.carry.map(c => t(c)), skip: card.skipAllowed,
    phase: phaseNum, next: nextCard ? t(nextCard.title) : null,
    nextTime: nextCard ? nextCard.timeWindow : null, nextSlug: card.nextSlug,
  };
}

/* ─── Context ─── */
interface TripDataContextValue {
  cards: V8Card[];
  idx: number;
  allDone: boolean;
  card: V8Card;
  adjustedTimes: Record<string, AdjustedTime>;
  loading: boolean;
  advance: (status: "done" | "skipped") => Promise<void>;
  packing: ReturnType<typeof usePacking>;
  lightbox: { src: string; label: string } | null;
  setLightbox: (lb: { src: string; label: string } | null) => void;
}

const TripDataContext = createContext<TripDataContextValue | null>(null);

export function TripDataProvider({ children }: { children: ReactNode }) {
  const { steps, loading, refresh } = useSteps();
  const { t } = useLanguage();
  const packing = usePacking();
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);

  useEffect(() => { refresh(); packing.refresh(); }, [refresh, packing.refresh]);

  const cards = useMemo(() => LIB_CARDS.map(c => toV8Card(c, t)), [t]);

  const idx = useMemo(() => {
    if (!steps.length) return 0;
    const active = steps.find(s => s.state.status === "active");
    if (active) {
      const i = LIB_CARDS.findIndex(c => c.slug === active.state.slug);
      return i >= 0 ? i : 0;
    }
    const upcoming = steps.find(s => s.state.status === "upcoming");
    if (upcoming) {
      const i = LIB_CARDS.findIndex(c => c.slug === upcoming.state.slug);
      return i >= 0 ? i : 0;
    }
    return LIB_CARDS.length;
  }, [steps]);

  const completions = useMemo(() => {
    const map: Record<string, { status: string; completedAt: string | null }> = {};
    for (const step of steps) {
      map[step.state.slug] = { status: step.state.status, completedAt: step.state.completed_at };
    }
    return map;
  }, [steps]);

  const adjustedTimes = useMemo(
    () => computeAdjustedPlanTimes(LIB_CARDS, completions),
    [completions]
  );

  const allDone = idx >= cards.length;
  const card = allDone ? cards[cards.length - 1] : cards[idx];

  const advance = useCallback(async (status: "done" | "skipped") => {
    const activeStep = steps.find(s => s.state.status === "active");
    if (!activeStep) return;
    try {
      await fetch(`/api/steps/${activeStep.state.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await refresh();
    } catch (err) {
      console.error("Failed to advance step:", err);
    }
  }, [steps, refresh]);

  return (
    <TripDataContext.Provider value={{
      cards, idx, allDone, card, adjustedTimes, loading: loading && !steps.length,
      advance, packing, lightbox, setLightbox,
    }}>
      {children}
    </TripDataContext.Provider>
  );
}

export function useTripData() {
  const ctx = useContext(TripDataContext);
  if (!ctx) throw new Error("useTripData must be used within TripDataProvider");
  return ctx;
}
