"use client";

import { useState, useCallback } from "react";
import { StepViewModel } from "@/lib/types";

export function useSteps() {
  const [steps, setSteps] = useState<StepViewModel[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/steps");
      const data = await res.json();
      setSteps(data);
    } catch (err) {
      console.error("Failed to fetch steps:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { steps, loading, refresh };
}

export function useCurrentStep() {
  const [step, setStep] = useState<StepViewModel | null>(null);
  const [allDone, setAllDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/steps/current");
      const data = await res.json();
      setStep(data.step ?? null);
      setAllDone(data.done ?? false);
    } catch (err) {
      console.error("Failed to fetch current step:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { step, allDone, loading, refresh };
}
