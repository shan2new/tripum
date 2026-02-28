"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "@/hooks/use-language";
import { StepViewModel } from "@/lib/types";
import { DAY_LABELS } from "@/lib/cards";
import { getVisualIdentity, getPhaseNumber } from "@/lib/visual-identity";
import { DAY_TITLES, ACTION } from "@/lib/strings";
import { HeroCard } from "./hero-card";
import { PhaseBar } from "./phase-bar";
import { TipCallout } from "./tip-callout";
import { CarryChecklist } from "./carry-checklist";
import { Confetti } from "./confetti";
import { NextStepPeek } from "./next-step-peek";
import { SkipDialog } from "./skip-dialog";
import { toast } from "sonner";

interface NowCardProps {
  step: StepViewModel;
  nextStep?: StepViewModel | null;
  onAction: () => void;
}

export function NowCard({ step, nextStep, onAction }: NowCardProps) {
  const { user } = useUser();
  const { t } = useLanguage();
  const [skipOpen, setSkipOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [celeb, setCeleb] = useState(false);

  const isAdmin = (user?.publicMetadata as { role?: string })?.role === "admin";
  const { card, state } = step;
  const v = getVisualIdentity(card.slug);
  const phaseNum = getPhaseNumber(card.phase);

  const dayLabel = DAY_LABELS[card.dayNumber];

  async function handleMarkDone() {
    setLoading(true);
    try {
      const res = await fetch(`/api/steps/${card.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });
      if (!res.ok) throw new Error("Failed to mark done");
      setCeleb(true);
      setTimeout(() => {
        setCeleb(false);
        onAction();
      }, 700);
    } catch {
      toast.error("Failed to update step");
    } finally {
      setLoading(false);
    }
  }

  async function handleSkip() {
    setLoading(true);
    try {
      const res = await fetch(`/api/steps/${card.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "skipped", skip_reason: "manual" }),
      });
      if (!res.ok) throw new Error("Failed to skip");
      setSkipOpen(false);
      onAction();
    } catch {
      toast.error("Failed to skip step");
    } finally {
      setLoading(false);
    }
  }

  // Duration display
  const dur = card.durationMin;
  const durStr = dur >= 60
    ? `${Math.floor(dur / 60)}h${dur % 60 ? ` ${dur % 60}m` : ""}`
    : `${dur}m`;

  // Parse time for editorial display
  const timeParts = card.timeWindow.split("–");
  const startTimeFull = timeParts[0]?.trim() || card.timeWindow;
  const startTimeParts = startTimeFull.split(" ");
  const startTimeNum = startTimeParts[0]; // e.g. "4:00"
  const restOfTime = card.timeWindow.includes("–")
    ? `– ${timeParts[1]?.trim()}`
    : startTimeParts.slice(1).join(" ");

  // Day title (bilingual)
  const dayTitleBi = DAY_TITLES[card.dayNumber];

  const sBase = phaseNum ? 4 : 3; // stagger class offset

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Ambient background tint */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: v.ambient,
        transition: "background 0.6s ease",
      }} />

      {/* Day label header */}
      <div className="s1" style={{ display: "flex", alignItems: "baseline", gap: "8px", position: "relative", zIndex: 1 }}>
        <span style={{
          fontSize: "11px", fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--yatra-accent)",
        }}>
          Day {card.dayNumber}
        </span>
        <span style={{ fontSize: "11px", color: "var(--yatra-text-faint)", fontWeight: 500 }}>
          {dayLabel ? t(dayLabel).replace(/Day \d+ · /, "").replace(/दिन \d+ · /, "") : ""}
        </span>
        <span style={{ fontSize: "11px", color: "var(--yatra-text-faint)" }}>·</span>
        <span style={{ fontSize: "11px", color: "var(--yatra-text-soft)", fontStyle: "italic" }}>
          {dayTitleBi ? t(dayTitleBi) : ""}
        </span>
      </div>

      {/* Hero gradient card */}
      <div className="s2" style={{ position: "relative", zIndex: 1 }}>
        <HeroCard
          slug={card.slug}
          phase={phaseNum}
          title={t(card.title)}
          sub={t(card.subtitle)}
        />
      </div>

      {/* Phase bar (only for phase cards) */}
      {phaseNum && (
        <div className="s3" style={{ position: "relative", zIndex: 1 }}>
          <PhaseBar currentPhase={phaseNum} />
        </div>
      )}

      {/* Editorial time display — exact match to reference TimeDisplay */}
      <div className={phaseNum ? "s4" : "s3"} style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ color: "var(--yatra-text-faint)", display: "flex", alignItems: "center" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </span>
            <span style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: "28px", fontWeight: 700,
              letterSpacing: "-0.03em", lineHeight: 1,
            }}>
              {startTimeNum}
            </span>
            <span style={{
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "13px", fontWeight: 300,
              color: "var(--yatra-text-soft)",
              letterSpacing: "0.02em",
            }}>
              {restOfTime}
            </span>
          </div>
          <span style={{
            fontSize: "12px", fontWeight: 500,
            color: "var(--yatra-text-faint)",
            background: "var(--yatra-bg-wash)",
            padding: "4px 10px", borderRadius: "100px",
          }}>
            {durStr}
          </span>
        </div>
      </div>

      {/* Tip callout */}
      <div className={phaseNum ? "s5" : "s4"} style={{ position: "relative", zIndex: 1 }}>
        <TipCallout tip={card.tip} />
      </div>

      {/* Carry checklist */}
      {card.carry.length > 0 && (
        <div className={phaseNum ? "s6" : "s5"} style={{ position: "relative", zIndex: 1 }}>
          <CarryChecklist items={card.carry} />
        </div>
      )}

      {/* Action buttons (admin only) */}
      {isAdmin && (
        <div className={phaseNum ? "s6" : "s5"} style={{
          display: "flex", gap: "10px", marginTop: "4px",
          position: "relative", zIndex: 1,
        }}>
          {celeb && <Confetti active={celeb} />}
          {card.skipAllowed && (
            <button
              onClick={() => setSkipOpen(true)}
              disabled={loading}
              className="press"
              style={{
                flex: "0 0 auto", padding: "15px 20px",
                borderRadius: "16px",
                border: "1.5px solid var(--yatra-border-strong)",
                background: "transparent",
                color: "var(--yatra-text-soft)",
                fontSize: "13.5px", fontWeight: 500,
                cursor: "pointer",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "2px",
                opacity: loading ? 0.5 : 1,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                </svg>
                {t(ACTION.skip)}
              </span>
              <span style={{ fontSize: "9px", color: "var(--yatra-text-faint)", fontWeight: 400 }}>{t(ACTION.skipSubtext)}</span>
            </button>
          )}
          <button
            onClick={handleMarkDone}
            disabled={loading}
            className="press"
            style={{
              flex: 1, padding: "15px 24px",
              borderRadius: "16px", border: "none",
              background: celeb ? "var(--yatra-green)" : "var(--yatra-text)",
              color: "white",
              fontSize: "15px", fontWeight: 600,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: celeb ? "none" : "0 2px 8px rgba(28,25,23,0.15)",
              animation: celeb ? "celebGlow .6s ease" : "none",
              transition: "background .3s ease",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {celeb ? (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            {celeb ? t(ACTION.done) : loading ? t(ACTION.updating) : t(ACTION.markDone)}
          </button>
        </div>
      )}

      {/* Next step peek */}
      {nextStep && (
        <div className={phaseNum ? "s7" : "s6"} style={{ position: "relative", zIndex: 1 }}>
          <NextStepPeek nextStep={nextStep} />
        </div>
      )}

      {/* Skip dialog */}
      {card.skipAllowed && (
        <SkipDialog
          open={skipOpen}
          onOpenChange={setSkipOpen}
          stepTitle={card.title}
          consequence={card.skipConsequence}
          onConfirm={handleSkip}
          loading={loading}
        />
      )}
    </div>
  );
}
