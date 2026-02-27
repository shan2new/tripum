"use client";

import { DAY_MILESTONES } from "@/lib/visual-identity";
import { CARDS } from "@/lib/cards";

interface StepProgressProps {
  doneCount: number;
  totalCount: number;
}

export function StepProgress({ doneCount, totalCount }: StepProgressProps) {
  const pct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div style={{ padding: "2px 20px 6px", position: "relative" }}>
      {/* Track */}
      <div style={{
        height: "3px",
        borderRadius: "2px",
        background: "var(--yatra-bg-wash)",
        position: "relative",
        overflow: "visible",
      }}>
        {/* Fill gradient */}
        <div style={{
          height: "100%",
          borderRadius: "2px",
          background: "linear-gradient(90deg, var(--yatra-accent), #E2A832)",
          width: `${pct}%`,
          transition: "width 0.5s ease",
        }} />

        {/* Day milestone dots */}
        {DAY_MILESTONES.map((cardIdx) => {
          const dotPct = totalCount > 0 ? (cardIdx / totalCount) * 100 : 0;
          const isDone = doneCount > cardIdx;
          const dayNum = CARDS[cardIdx]?.dayNumber ?? 0;
          return (
            <div
              key={cardIdx}
              style={{
                position: "absolute",
                top: "50%",
                left: `${dotPct}%`,
                transform: "translate(-50%, -50%)",
                width: "7px", height: "7px",
                borderRadius: "50%",
                background: isDone ? "var(--yatra-accent)" : "var(--yatra-bg-wash)",
                border: isDone ? "none" : "1.5px solid var(--yatra-border-strong)",
                transition: "background 0.3s",
              }}
              title={`Day ${dayNum}`}
            />
          );
        })}
      </div>
    </div>
  );
}
