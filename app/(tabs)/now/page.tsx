"use client";

import { useState } from "react";
import { useTripData, type V8Card } from "@/hooks/use-trip-data";
import WeatherWidget from "@/components/weather-widget";
import { T, TINTS, PHASE_STEPS, DAY_MILESTONES, CSS } from "@/lib/design-tokens";
import type { AdjustedTime } from "@/lib/schedule";

/* ─── Icons ─── */
const Icon = {
  check: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>,
  skip: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"/></svg>,
  clock: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>,
  bag: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg>,
};

/* ─── Sub-components ─── */
function Swatch({ slug, size = 44, radius = 14, onTap }: { slug: string; size?: number; radius?: number; onTap?: (src: string, label: string) => void }) {
  const t = TINTS[slug as keyof typeof TINTS] || TINTS["check-in"];
  return (
    <div
      onClick={onTap ? (e) => { e.stopPropagation(); onTap(t.img, slug); } : undefined}
      style={{ width: size, height: size, borderRadius: radius, flexShrink: 0, overflow: "hidden", background: `linear-gradient(145deg, ${t.tint}, ${t.tint}cc)`, cursor: onTap ? "pointer" : undefined }}
    >
      <img src={t.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

function HeroCard({ slug, phase, title, sub, onTap }: { slug: string; phase: number | null; title: string; sub: string; onTap?: (src: string, label: string) => void }) {
  const t = TINTS[slug as keyof typeof TINTS] || TINTS["check-in"];
  return (
    <div onClick={onTap ? () => onTap(t.img, title) : undefined} style={{ position: "relative", borderRadius: 16, overflow: "hidden", aspectRatio: "16/9", boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)", background: t.tint, cursor: onTap ? "pointer" : undefined }}>
      <img src={t.img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 100%)" }} />
      {phase && (
        <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(255,255,255,0.16)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 11, fontWeight: 500, letterSpacing: "0.02em", padding: "5px 14px", borderRadius: T.rFull }}>Phase {phase} of 3</div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 24px" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: "white", lineHeight: 1.14, letterSpacing: "-0.022em", marginBottom: 4 }}>{title}</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: 400, lineHeight: 1.4 }}>{sub}</p>
      </div>
    </div>
  );
}

function PhaseBar({ currentPhase }: { currentPhase: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderRadius: T.r, background: T.surface, border: `0.5px solid ${T.border}` }}>
      {PHASE_STEPS.map((step, i) => {
        const n = i + 1, done = currentPhase > n, active = currentPhase === n;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: "0 0 auto" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: done ? T.done : active ? T.accent : "rgba(120,120,128,0.06)", border: done || active ? "none" : `1px solid rgba(60,60,67,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", transition: `all .25s ${T.ease}` }}>
                {done && <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                {active && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "white" }} />}
              </div>
              <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.01em", color: done ? T.done : active ? T.accent : T.tertiary }}>{step}</span>
            </div>
            {i < PHASE_STEPS.length - 1 && <div style={{ flex: 1, height: 1, margin: "0 8px", marginBottom: 20, background: done ? T.done : T.sunken, borderRadius: 0.5, transition: `background .25s ${T.ease}`, opacity: done ? 1 : 0.5 }} />}
          </div>
        );
      })}
    </div>
  );
}

function TimeDisplay({ time, dur, shifted, delta }: { time: string; dur: number; shifted?: boolean; delta?: number }) {
  const durStr = dur >= 60 ? `${Math.floor(dur / 60)}h${dur % 60 ? ` ${dur % 60}m` : ''}` : `${dur}m`;
  const parts = time.split("–");
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ color: T.tertiary, display: "flex", alignItems: "center", marginRight: 2 }}>{Icon.clock}</span>
        <span style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-0.035em", lineHeight: 1, fontVariantNumeric: "tabular-nums", color: shifted ? T.blue : T.text }}>{parts[0]?.trim().split(" ")[0]}</span>
        <span style={{ fontSize: 14, fontWeight: 400, color: shifted ? T.blue : T.secondary, letterSpacing: "-0.01em" }}>{time.includes("–") ? `– ${parts[1]?.trim()}` : time.split(" ").slice(1).join(" ")}</span>
        {shifted && delta != null && delta !== 0 && (
          <span style={{ fontSize: 11, fontWeight: 600, color: delta > 0 ? "#FF3B30" : T.done, background: delta > 0 ? "rgba(255,59,48,0.06)" : T.doneSoft, padding: "2px 8px", borderRadius: 6, marginLeft: 4 }}>
            {delta > 0 ? `+${delta}m` : `${delta}m`}
          </span>
        )}
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, color: T.secondary, background: "rgba(120,120,128,0.06)", padding: "5px 12px", borderRadius: T.rFull }}>{durStr}</span>
    </div>
  );
}

function CarryList({ items }: { items: string[] }) {
  const [ck, setCk] = useState<Record<number, boolean>>({});
  if (!items.length) return null;
  return (
    <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: T.r, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <span style={{ color: T.tertiary }}>{Icon.bag}</span>
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.02em", color: T.tertiary }}>Carry</span>
      </div>
      {items.map((item, i) => (
        <div key={i} onClick={() => setCk(p => ({ ...p, [i]: !p[i] }))} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0", cursor: "pointer", userSelect: "none" }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: ck[i] ? "none" : `1px solid rgba(60,60,67,0.18)`, background: ck[i] ? T.done : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: `all .15s ${T.ease}`, animation: ck[i] ? "checkIn .3s ease" : "none" }}>
            {ck[i] && <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
          </div>
          <span style={{ fontSize: 15, fontWeight: 400, color: ck[i] ? T.tertiary : T.text, textDecoration: ck[i] ? "line-through" : "none", transition: `all .15s ease`, letterSpacing: "-0.01em" }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function NextPeek({ title, time, slug }: { title: string | null; time: string | null; slug: string | null }) {
  if (!title) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: T.r, background: T.surface, border: `0.5px solid ${T.border}` }}>
      <Swatch slug={slug || "check-in"} size={44} radius={12} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.02em", color: T.tertiary, marginBottom: 2 }}>Up next</p>
        <p style={{ fontSize: 15, fontWeight: 500, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em" }}>{title}</p>
      </div>
      <span style={{ fontSize: 13, color: T.secondary, fontVariantNumeric: "tabular-nums", flexShrink: 0, letterSpacing: "-0.01em" }}>{time}</span>
    </div>
  );
}

/* ─── Page ─── */
export default function NowPage() {
  const { card, allDone, adjustedTimes, loading, advance, setLightbox } = useTripData();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
        <span style={{ fontSize: 13, color: T.tertiary }}>Loading...</span>
      </div>
    );
  }

  if (allDone) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center" as const }}>
        <style>{CSS}</style>
        <div style={{ fontSize: 52, marginBottom: 20 }}>🙏</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Yatra Complete</h2>
        <p style={{ fontSize: 15, color: T.secondary, lineHeight: 1.6, fontWeight: 400 }}>All steps done. Har Har Mahadev!</p>
      </div>
    );
  }

  const adjusted = adjustedTimes[card.slug];
  const displayTime = adjusted?.shifted ? adjusted.time : card.time;
  const onImageTap = (src: string, label: string) => setLightbox({ src, label });

  return (
    <div>
      <style>{CSS}</style>
      <ScreenNow card={card} adjusted={adjusted} onDone={() => advance("done")} onSkip={() => advance("skipped")} onImageTap={onImageTap} />
    </div>
  );
}

function ScreenNow({ card, adjusted, onDone, onSkip, onImageTap }: { card: V8Card; adjusted?: AdjustedTime; onDone: () => void; onSkip: () => void; onImageTap: (src: string, label: string) => void }) {
  const [done, setDone] = useState(false);
  const displayTime = adjusted?.shifted ? adjusted.time : card.time;
  const handleDone = () => { setDone(true); setTimeout(() => { setDone(false); onDone(); }, 500); };

  return (
    <div key={card.slug} style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="s1" style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", color: T.accent }}>Day {card.day}</span>
        <span style={{ fontSize: 12, color: T.tertiary, fontWeight: 400 }}>{card.dayLabel}</span>
        <span style={{ fontSize: 12, color: T.tertiary, opacity: 0.5 }}>·</span>
        <span style={{ fontSize: 12, color: T.secondary, fontWeight: 400 }}>{card.dayTitle}</span>
      </div>
      <div className="s2"><WeatherWidget /></div>
      <div className="s3"><HeroCard slug={card.slug} phase={card.phase} title={card.title} sub={card.sub} onTap={onImageTap} /></div>
      {card.phase && <div className="s4"><PhaseBar currentPhase={card.phase} /></div>}
      <div className={card.phase ? "s5" : "s4"}><TimeDisplay time={displayTime} dur={card.dur} shifted={adjusted?.shifted} delta={adjusted?.delta} /></div>
      {(() => { const ti = TINTS[card.slug as keyof typeof TINTS]; return ti?.maps ? (
        <div className={card.phase ? "s6" : "s5"}>
          <a href={ti.maps} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: T.rFull, background: T.accentSoft, border: `1px solid ${T.accentMid}`, color: T.accent, fontSize: 13, fontWeight: 600, textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
            Open in Maps
          </a>
        </div>
      ) : null; })()}
      {card.carry.length > 0 && <div className={card.phase ? "s7" : "s6"}><CarryList items={card.carry} /></div>}
      <div className={card.phase ? "s7" : "s6"} style={{ display: "flex", gap: 10, marginTop: 4 }}>
        {card.skip && (
          <button className="press" onClick={onSkip} style={{ flex: "0 0 auto", padding: "16px 22px", borderRadius: T.r, border: `1px solid rgba(60,60,67,0.1)`, background: "transparent", color: T.secondary, fontSize: 15, fontWeight: 400, fontFamily: T.sans, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>{Icon.skip} Skip</button>
        )}
        <button className="press" onClick={handleDone} style={{ flex: 1, padding: "16px 24px", borderRadius: T.r, border: "none", background: done ? T.done : T.text, color: "white", fontSize: 16, fontWeight: 600, fontFamily: T.sans, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: `background .2s ease`, letterSpacing: "-0.01em" }}>
          {done ? <><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> Done</> : <>{Icon.check} Mark Complete</>}
        </button>
      </div>
      <div className={card.phase ? "s8" : "s7"}><NextPeek title={card.next} time={card.nextTime} slug={card.nextSlug} /></div>
    </div>
  );
}
