"use client";

import { PHASE_STEPS } from "@/lib/visual-identity";

interface PhaseBarProps {
  currentPhase: number;
}

export function PhaseBar({ currentPhase }: PhaseBarProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 0,
      background: "var(--card)", borderRadius: "16px", padding: "14px 16px",
      border: "1px solid var(--yatra-border)",
      boxShadow: "var(--yatra-shadow-1)",
    }}>
      {PHASE_STEPS.map((step, i) => {
        const stepNum = i + 1;
        const done = currentPhase > stepNum;
        const active = currentPhase === stepNum;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: "0 0 auto" }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: done ? "var(--yatra-green)" : active ? "var(--yatra-accent)" : "var(--yatra-bg-wash)",
                border: done ? "none" : active ? "2px solid var(--yatra-accent)" : "2px solid var(--yatra-border-strong)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .3s",
              }}>
                {done && (
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
                {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--yatra-accent)" }} />}
              </div>
              <span style={{
                fontSize: "9.5px", fontWeight: done || active ? 700 : 500,
                color: done ? "var(--yatra-green)" : active ? "var(--yatra-accent)" : "var(--yatra-text-faint)",
                letterSpacing: "0.02em", whiteSpace: "nowrap",
              }}>
                {step}
              </span>
            </div>
            {i < PHASE_STEPS.length - 1 && (
              <div style={{
                flex: 1, height: "2px", margin: "0 6px", marginBottom: "18px",
                background: done ? "var(--yatra-green)" : "var(--yatra-border)",
                borderRadius: "1px", transition: "background .3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
