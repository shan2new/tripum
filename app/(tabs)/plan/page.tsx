"use client";

import { useState } from "react";
import { useTripData, type V8Card } from "@/hooks/use-trip-data";
import { T, TINTS, CSS } from "@/lib/design-tokens";
import type { AdjustedTime } from "@/lib/schedule";

/* ─── Icons ─── */
const Icon = {
  chevDown: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>,
};

function Swatch({ slug, size = 44, radius = 14, onTap }: { slug: string; size?: number; radius?: number; onTap?: (src: string, label: string) => void }) {
  const t = TINTS[slug as keyof typeof TINTS] || TINTS["check-in"];
  return (
    <div onClick={onTap ? (e) => { e.stopPropagation(); onTap(t.img, slug); } : undefined} style={{ width: size, height: size, borderRadius: radius, flexShrink: 0, overflow: "hidden", background: `linear-gradient(145deg, ${t.tint}, ${t.tint}cc)`, cursor: onTap ? "pointer" : undefined }}>
      <img src={t.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

export default function PlanPage() {
  const { cards, idx, adjustedTimes, loading, setLightbox } = useTripData();
  const onImageTap = (src: string, label: string) => setLightbox({ src, label });

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
        <span style={{ fontSize: 13, color: T.tertiary }}>Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <style>{CSS}</style>
      <ScreenPlan cards={cards} currentIdx={idx} adjustedTimes={adjustedTimes} onImageTap={onImageTap} />
    </div>
  );
}

function ScreenPlan({ cards, currentIdx, adjustedTimes, onImageTap }: { cards: V8Card[]; currentIdx: number; adjustedTimes: Record<string, AdjustedTime>; onImageTap: (src: string, label: string) => void }) {
  const [exp, setExp] = useState<string | null>(null);
  const days: [number, string, string][] = [[0, "Feb 28", "Arrival"], [1, "Mar 1", "Core Darshan"], [2, "Mar 2", "Return"]];
  return (
    <div style={{ padding: "0 24px 24px" }}>
      {days.map(([dn, dt, lb]) => {
        const dc = cards.filter(c => c.day === dn);
        const doneCount = dc.filter(c => cards.indexOf(c) < currentIdx).length;
        const total = dc.length;
        return (
          <div key={dn} style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", color: T.accent }}>Day {dn}</span>
              <span style={{ fontSize: 12, color: T.tertiary, fontWeight: 400 }}>{dt}</span>
              <span style={{ fontSize: 12, color: T.tertiary, opacity: 0.5 }}>·</span>
              <span style={{ fontSize: 12, color: T.secondary, fontWeight: 400 }}>{lb}</span>
              <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: doneCount === total && doneCount > 0 ? T.done : T.tertiary }}>{doneCount}/{total}</span>
            </div>
            <div style={{ height: 2, borderRadius: T.rFull, background: "rgba(120,120,128,0.08)", marginBottom: 20 }}>
              <div style={{ width: `${total > 0 ? (doneCount / total) * 100 : 0}%`, height: "100%", borderRadius: T.rFull, background: doneCount === total && doneCount > 0 ? T.done : T.accent, transition: `width .4s ${T.ease}` }} />
            </div>
            <div style={{ position: "relative", paddingLeft: 32 }}>
              <div style={{ position: "absolute", left: 11, top: 12, bottom: 12, width: 1, background: T.sunken, opacity: 0.4 }} />
              {dc.map(card => {
                const gi = cards.indexOf(card), isCurr = gi === currentIdx, isDone = gi < currentIdx, isExp = exp === card.slug;
                const adj = adjustedTimes[card.slug];
                const planTime = adj?.shifted ? adj.time : card.time;
                const planShifted = adj?.shifted ?? false;
                return (
                  <div key={card.slug} style={{ position: "relative", marginBottom: 2 }}>
                    <div style={{ position: "absolute", left: -27, top: 20, width: 12, height: 12, borderRadius: "50%", zIndex: 2, background: isDone ? T.done : isCurr ? T.accent : T.bg, border: isDone || isCurr ? "none" : `1px solid rgba(60,60,67,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", transition: `all .2s ${T.ease}` }}>
                      {isDone && <svg width="7" height="7" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                      {isCurr && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "white" }} />}
                    </div>
                    {isCurr && <div style={{ position: "absolute", left: -28, top: 19, width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${T.accent}`, animation: "softPulse 2s ease-in-out infinite", zIndex: 1, opacity: 0.5 }} />}
                    <div onClick={() => setExp(isExp ? null : card.slug)} style={{ padding: "14px 16px", borderRadius: T.r, cursor: "pointer", background: isCurr ? T.surface : "transparent", border: isCurr ? `0.5px solid ${T.border}` : "0.5px solid transparent", boxShadow: isCurr ? T.shadow : "none", transition: `all .2s ${T.ease}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Swatch slug={card.slug} size={40} radius={11} onTap={onImageTap} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: isDone ? 400 : 500, color: isDone ? T.tertiary : T.text, textDecoration: isDone ? "line-through" : "none", marginBottom: 2, lineHeight: 1.3 }}>{card.title}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 13, color: planShifted ? T.blue : T.secondary, fontWeight: planShifted ? 600 : 400, fontVariantNumeric: "tabular-nums" }}>{planTime}</span>
                            {planShifted && adj && adj.delta !== 0 && (
                              <span style={{ fontSize: 10, fontWeight: 600, color: adj.delta > 0 ? "#8B3A3A" : T.done, background: adj.delta > 0 ? "rgba(139,58,58,0.1)" : T.doneSoft, padding: "2px 8px", borderRadius: 6 }}>
                                {adj.delta > 0 ? `+${adj.delta}m` : `${adj.delta}m`}
                              </span>
                            )}
                            {card.phase && <span style={{ fontSize: 10, fontWeight: 600, color: T.accent, background: T.accentSoft, padding: "2px 8px", borderRadius: T.rFull }}>Phase {card.phase}/3</span>}
                          </div>
                        </div>
                        <div style={{ transform: isExp ? "rotate(180deg)" : "rotate(0)", transition: `transform .25s ${T.ease}`, color: T.tertiary, flexShrink: 0 }}>{Icon.chevDown}</div>
                      </div>
                      {isExp && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}`, animation: "slideIn .2s ease both" }}>
                          <p style={{ fontSize: 13, color: T.secondary, lineHeight: 1.65, marginBottom: 12 }}>{card.sub}</p>
                          {card.carry.length > 0 && <p style={{ marginTop: 10, fontSize: 13, color: T.secondary }}><b style={{ fontWeight: 600 }}>Carry:</b> {card.carry.join(" · ")}</p>}
                          {(() => { const ti = TINTS[card.slug as keyof typeof TINTS]; return ti?.maps ? (
                            <a href={ti.maps} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "7px 14px", borderRadius: T.rFull, background: T.accentSoft, border: `1px solid ${T.accentMid}`, color: T.accent, fontSize: 12, fontWeight: 600, textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
                              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                              Open in Maps
                            </a>
                          ) : null; })()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
