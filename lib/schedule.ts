/**
 * Schedule cascade utilities for plan steps and route phases.
 * When a step/phase is completed, all subsequent times cascade forward/backward
 * based on the actual completion time vs the planned time.
 */

import type { StepCard } from "./types";

/* ─── Time Parsing ─── */

/** Parse "8:30 AM", "~4:45 PM", etc. into minutes from midnight. */
export function parseTime(s: string): number {
  const cleaned = s.replace(/^~\s*/, "").trim();
  const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const p = match[3].toUpperCase();
  if (p === "PM" && h !== 12) h += 12;
  if (p === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

/** Minutes from midnight → "8:30 AM" */
export function formatTime(mins: number): string {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

/** Parse "8:30 – 9:15 AM" or "11:45 AM – 12:30 PM" → { start, end } in minutes. */
export function parseTimeWindow(tw: string): { start: number; end: number | null } {
  if (/onwards/i.test(tw)) {
    return { start: parseTime(tw), end: null };
  }
  const parts = tw.split(/\s*[–-]\s*/);
  if (parts.length === 2) {
    const endMins = parseTime(parts[1].trim());
    let startStr = parts[0].trim();
    if (!/AM|PM/i.test(startStr)) {
      const ep = parts[1].match(/(AM|PM)/i)?.[1] || "AM";
      startStr += " " + ep;
    }
    return { start: parseTime(startStr), end: endMins };
  }
  return { start: parseTime(tw), end: null };
}

/** Format a time range, abbreviating the period when both sides share it. */
export function formatTimeWindow(start: number, end: number): string {
  const sp = Math.floor(start / 60) >= 12 ? "PM" : "AM";
  const ep = Math.floor(end / 60) >= 12 ? "PM" : "AM";
  if (sp === ep) {
    const sh = Math.floor(start / 60) % 24;
    const sh12 = sh > 12 ? sh - 12 : sh === 0 ? 12 : sh;
    const sm = start % 60;
    return `${sh12}:${sm.toString().padStart(2, "0")} – ${formatTime(end)}`;
  }
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/* ─── Plan Schedule Cascade ─── */

export interface AdjustedTime {
  time: string;
  shifted: boolean;
  delta: number; // minutes shifted (positive = delayed, negative = ahead)
}

/**
 * Compute adjusted schedule for plan steps based on actual completion times.
 * When a step finishes early/late, all subsequent steps on that day cascade.
 */
export function computeAdjustedPlanTimes(
  cards: StepCard[],
  completions: Record<string, { status: string; completedAt: string | null }>
): Record<string, AdjustedTime> {
  const result: Record<string, AdjustedTime> = {};
  let nextAvailable = 0;
  let lastDay = -1;

  for (const card of cards) {
    // Reset cascade on day boundary
    if (card.dayNumber !== lastDay) {
      nextAvailable = 0;
      lastDay = card.dayNumber;
    }

    const { start: origStart } = parseTimeWindow(card.timeWindow);
    const adjustedStart = Math.max(origStart, nextAvailable);
    const delta = adjustedStart - origStart;
    const comp = completions[card.slug];

    if (comp?.status === "done" && comp.completedAt) {
      const ct = new Date(comp.completedAt);
      const actualEnd = ct.getHours() * 60 + ct.getMinutes();
      result[card.slug] = {
        time: formatTimeWindow(adjustedStart, actualEnd),
        shifted: delta !== 0 || Math.abs(actualEnd - (origStart + card.durationMin)) > 1,
        delta,
      };
      nextAvailable = actualEnd;
    } else if (comp?.status === "skipped") {
      result[card.slug] = {
        time: card.timeWindow,
        shifted: delta !== 0,
        delta,
      };
      // Skipped = takes no time
      nextAvailable = adjustedStart;
    } else {
      // Upcoming / active — show projected adjusted time
      const adjustedEnd = adjustedStart + card.durationMin;
      result[card.slug] = {
        time: delta !== 0 ? formatTimeWindow(adjustedStart, adjustedEnd) : card.timeWindow,
        shifted: delta !== 0,
        delta,
      };
      nextAvailable = adjustedEnd;
    }
  }

  return result;
}

/* ─── Route Schedule Cascade ─── */

/**
 * Compute adjusted route phase times based on completion timestamps
 * and an optional custom start time.
 */
export function computeAdjustedRouteTimes(
  phaseDurations: number[],
  defaultStartMin: number,
  completedAt: Record<number, string>,
  customStartMin?: number | null,
  isRange?: boolean[]
): AdjustedTime[] {
  const results: AdjustedTime[] = [];
  let current = customStartMin ?? defaultStartMin;

  // Compute original phase start times for delta calculation
  let orig = defaultStartMin;
  const origStarts: number[] = [];
  for (let i = 0; i < phaseDurations.length; i++) {
    origStarts.push(orig);
    orig += phaseDurations[i];
  }

  for (let i = 0; i < phaseDurations.length; i++) {
    const delta = current - origStarts[i];
    const dur = phaseDurations[i];
    const range = isRange?.[i] ?? false;

    const timeStr = range
      ? formatTimeWindow(current, current + dur)
      : formatTime(current);

    results.push({ time: timeStr, shifted: Math.abs(delta) >= 1, delta });

    if (completedAt[i]) {
      const ct = new Date(completedAt[i]);
      current = ct.getHours() * 60 + ct.getMinutes();
    } else {
      current += dur;
    }
  }

  return results;
}
