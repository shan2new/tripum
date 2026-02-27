"use client";

import { useLanguage } from "@/hooks/use-language";
import { StepViewModel } from "@/lib/types";
import { MiniThumb } from "./mini-thumb";
import { TipCallout } from "./tip-callout";
import { getPhaseNumber } from "@/lib/visual-identity";

interface TimelineCardProps {
  step: StepViewModel;
  isDone: boolean;
  isCurrent: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export function TimelineCard({ step, isDone, isCurrent, isExpanded, onToggle }: TimelineCardProps) {
  const { t } = useLanguage();
  const { card } = step;
  const phaseNum = getPhaseNumber(card.phase);

  return (
    <div style={{ position: "relative", marginBottom: "2px" }}>
      {/* Timeline dot */}
      <div style={{
        position: "absolute", left: "-26px", top: "20px",
        width: "14px", height: "14px",
        borderRadius: "50%", zIndex: 2,
        background: isDone ? "var(--yatra-green)" : isCurrent ? "var(--yatra-accent)" : "var(--yatra-bg)",
        border: isDone ? "none" : isCurrent ? "2.5px solid var(--yatra-accent)" : "2px solid var(--yatra-border-strong)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s",
      }}>
        {isDone && (
          <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
        {isCurrent && (
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--yatra-accent)" }} />
        )}
      </div>
      {/* Pulse ring for current */}
      {isCurrent && (
        <div style={{
          position: "absolute", left: "-26px", top: "20px",
          width: 14, height: 14, borderRadius: "50%",
          border: "2px solid var(--yatra-accent)",
          animation: "pulse-ring 2s ease-out infinite",
          zIndex: 1,
        }} />
      )}

      {/* Card content */}
      <div
        onClick={onToggle}
        style={{
          padding: "12px 14px", borderRadius: "16px", cursor: "pointer",
          background: isCurrent ? "var(--card)" : "transparent",
          border: isCurrent ? "1px solid var(--yatra-border)" : "1px solid transparent",
          boxShadow: isCurrent ? "var(--yatra-shadow-2)" : "none",
          transition: "all .2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <MiniThumb slug={card.slug} size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: "14.5px",
              fontWeight: isDone ? 400 : 500,
              color: isDone ? "var(--yatra-text-faint)" : "var(--yatra-text)",
              textDecoration: isDone ? "line-through" : "none",
              marginBottom: "2px", lineHeight: 1.3,
            }}>
              {t(card.title)}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "12.5px", color: "var(--yatra-text-soft)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {card.timeWindow}
              </span>
              {phaseNum && (
                <span style={{
                  fontSize: "10px", fontWeight: 700,
                  color: "var(--yatra-accent)",
                  background: "var(--yatra-accent-pale)",
                  padding: "2px 8px", borderRadius: "100px",
                }}>
                  Phase {phaseNum}/3
                </span>
              )}
            </div>
          </div>
          {/* Chevron */}
          <div style={{
            transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
            transition: "transform .2s",
            color: "var(--yatra-text-faint)", flexShrink: 0,
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div style={{
            marginTop: "14px", paddingTop: "14px",
            borderTop: "1px solid var(--yatra-border)",
            animation: "slideUp .25s ease both",
          }}>
            <p style={{
              fontSize: "13px", color: "var(--yatra-text-soft)",
              lineHeight: 1.6, marginBottom: "10px",
            }}>
              {t(card.subtitle)}
            </p>
            <TipCallout tip={card.tip} />
            {card.carry.length > 0 && (
              <p style={{
                marginTop: "10px",
                fontSize: "12.5px", color: "var(--yatra-text-soft)",
              }}>
                <b>Carry:</b> {card.carry.map((c) => t(c)).join(" · ")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
