"use client";

import { useState, useCallback } from "react";

type PackingState = Record<string, Record<number, boolean>>;

export function usePacking() {
  const [state, setState] = useState<PackingState>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/packing");
      const data = await res.json();
      setState(data);
    } catch (err) {
      console.error("Failed to fetch packing state:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggle = useCallback(
    async (listKey: string, itemIndex: number) => {
      const current = state[listKey]?.[itemIndex] ?? false;
      const next = !current;

      // Optimistic update
      setState((prev) => ({
        ...prev,
        [listKey]: { ...prev[listKey], [itemIndex]: next },
      }));

      try {
        await fetch("/api/packing", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            list_key: listKey,
            item_index: itemIndex,
            checked: next,
          }),
        });
      } catch (err) {
        // Revert on failure
        setState((prev) => ({
          ...prev,
          [listKey]: { ...prev[listKey], [itemIndex]: current },
        }));
        console.error("Failed to toggle packing item:", err);
      }
    },
    [state]
  );

  const isChecked = useCallback(
    (listKey: string, itemIndex: number) => state[listKey]?.[itemIndex] ?? false,
    [state]
  );

  return { state, loading, refresh, toggle, isChecked };
}
