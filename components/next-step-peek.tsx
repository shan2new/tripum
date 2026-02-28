"use client";

import { useLanguage } from "@/hooks/use-language";
import { StepViewModel } from "@/lib/types";
import { SECTION } from "@/lib/strings";
import { MiniThumb } from "./mini-thumb";

interface NextStepPeekProps {
  nextStep: StepViewModel | null;
}

export function NextStepPeek({ nextStep }: NextStepPeekProps) {
  const { t } = useLanguage();

  if (!nextStep) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "14px",
      padding: "12px 14px",
      borderRadius: "16px",
      background: "var(--card)",
      border: "1px solid var(--yatra-border)",
      animation: "breathe 3s ease-in-out infinite",
    }}>
      <MiniThumb slug={nextStep.card.slug} size={48} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: "10.5px", fontWeight: 600,
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: "var(--yatra-text-faint)",
          marginBottom: "2px",
        }}>
          {t(SECTION.upNext)}
        </p>
        <p style={{
          fontSize: "14px", fontWeight: 500,
          color: "var(--yatra-text)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {t(nextStep.card.title)}
        </p>
      </div>
      <span style={{
        fontSize: "13px",
        color: "var(--yatra-text-soft)",
        fontVariantNumeric: "tabular-nums",
        flexShrink: 0,
      }}>
        {nextStep.card.timeWindow.split("–")[0]?.trim()}
      </span>
    </div>
  );
}
