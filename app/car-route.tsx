"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouteProgress } from "@/hooks/use-route-progress";
import { computeAdjustedRouteTimes, formatTime, type AdjustedTime } from "@/lib/schedule";

/* ─── Design Tokens ─── */
const T = {
  bg:        "#FAF9F6",
  surface:   "#FFFFFF",
  wash:      "#F3F2EF",
  sunken:    "#E8E6E1",
  text:      "#181511",
  secondary: "#6B665E",
  tertiary:  "#9B958C",
  accent:    "#9B6B2C",
  accentSoft:"rgba(155,107,44,0.06)",
  accentMid: "rgba(155,107,44,0.14)",
  done:      "#2D8B55",
  doneSoft:  "rgba(45,139,85,0.08)",
  critical:  "#8B3A3A",
  criticalSoft:"rgba(139,58,58,0.08)",
  blue:      "#2B6BBF",
  border:    "rgba(24,21,17,0.05)",
  sans:      "'Instrument Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  mono:      "'DM Mono', 'SF Mono', monospace",
  r:         "14px",
  rFull:     "999px",
  ease:      "cubic-bezier(0.22, 1, 0.36, 1)",
};

/* ─── Route Data ─── */
const DEFAULT_START = 510;

const phases = [
  { type: "stop", fn: "Chiku Drop-off", name: "Pet boarding / sitter", time: "8:30 AM", durationMin: 30, note: "Share vet contact · Print feeding schedule · Pack 3 days food", img: "/images/home.jpg", lat: 12.9716, lon: 77.5946, place: "Bengaluru" },
  { type: "drive", from: "Bengaluru", to: "Salem", distance: "200 km", time: "9:00 AM – 12:00 PM", durationMin: 180, highway: "NH 44", lat: 11.6643, lon: 78.1460, place: "Salem" },
  { type: "stop", fn: "Breakfast", name: "A2B, Thoppur · Salem", time: "12:00 – 1:00 PM", durationMin: 60, note: "SUV parking · Clean restrooms", img: "/images/a2b_salem.jpeg", maps: "https://www.google.com/maps/search/?api=1&query=Adyar+Ananda+Bhavan+-+A2B&query_place_id=ChIJk74wW78arDsRNzIOQHUwMQc", lat: 11.6643, lon: 78.1460, place: "Salem" },
  { type: "drive", from: "Salem", to: "Madurai", distance: "160 km", time: "1:00 – 4:00 PM", durationMin: 180, highway: "NH 44 → NH 87", lat: 9.9252, lon: 78.1198, place: "Madurai" },
  { type: "stop", fn: "Lunch", name: "Gowri Krishna Veg · Madurai Bypass", time: "4:00 – 5:00 PM", durationMin: 45, note: "On bypass — avoids city traffic", img: "/images/gowri_krishna_veg.jpg", maps: "https://www.google.com/maps/search/?api=1&query=Gowri+Krishna-+Veg+Restaurant&query_place_id=ChIJ0e2cBp3PADsRGgSJVWsxwIg", lat: 9.9252, lon: 78.1198, place: "Madurai" },
  { type: "stop", fn: "Major Refuel", name: "IndianOil SWAGAT COCO · Madurai", time: "~4:45 PM", durationMin: 15, note: "XP95 available · Fill 100% — sparse stations ahead", critical: true, maps: "https://www.google.com/maps/search/?api=1&query=IndianOil+-+SWAGAT&query_place_id=ChIJ-2HjLkXBADsRhWXOEE6_scs", lat: 9.9252, lon: 78.1198, place: "Madurai" },
  { type: "drive", from: "Madurai", to: "Rameshwaram", distance: "192 km", time: "5:00 – 8:30 PM", durationMin: 150, highway: "NH 87", lat: 9.2876, lon: 79.3129, place: "Rameshwaram" },
  { type: "stop", fn: "Tea", name: "Chaya Kada · Ramanathapuram", time: "~7:30 PM", durationMin: 90, note: "20 min before final stretch", img: "/images/chaya_kada.jpeg", maps: "https://www.google.com/maps/search/?api=1&query=CHAYA+KADA&query_place_id=ChIJ2W0mIAebATsR1d6E6dikzso", lat: 9.3639, lon: 78.8395, place: "Ramanathapuram" },
  { type: "arrival", name: "Rameshwaram", time: "~9:00 PM", durationMin: 0, note: "Via Pamban Bridge · Late arrival — head straight to hotel", img: "/images/temple.jpg", maps: "https://www.google.com/maps/search/?api=1&query=Pamban+Bridge&query_place_id=ChIJNRza64bvATsRL3U2O5svnYg", lat: 9.2876, lon: 79.3129, place: "Rameshwaram" },
] as const;

const PHASE_DURATIONS = phases.map(p => p.durationMin);
const PHASE_IS_RANGE = phases.map(p => p.time.includes("–"));

type Phase = (typeof phases)[number];

/* ─── Weather ─── */
interface CompactWeather {
  temp: number; code: number; wind: number; hi: number; lo: number;
}

function weatherLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code === 95 || code === 96 || code === 99) return "Thunderstorm";
  return "Cloudy";
}

function weatherConditionIcon(code: number): string {
  if (code === 0) return "☀";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫";
  if (code <= 57) return "🌦";
  if (code <= 67) return "🌧";
  if (code <= 77) return "❄";
  if (code <= 86) return "🌨";
  if (code === 95 || code === 96 || code === 99) return "⛈";
  return "☁";
}

const weatherCache: Record<string, CompactWeather> = {};

function usePlaceWeather(lat: number, lon: number, enabled: boolean) {
  const key = `${lat},${lon}`;
  const [data, setData] = useState<CompactWeather | null>(weatherCache[key] ?? null);
  const [loading, setLoading] = useState(!weatherCache[key] && enabled);

  useEffect(() => {
    if (!enabled) return;
    if (weatherCache[key]) { setData(weatherCache[key]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/weather?lat=${lat}&lon=${lon}&compact=1`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        if (cancelled) return;
        const w: CompactWeather = {
          temp: Math.round(d.current.temperature_2m),
          code: d.current.weather_code,
          wind: Math.round(d.current.wind_speed_10m),
          hi: Math.round(d.daily.temperature_2m_max[0]),
          lo: Math.round(d.daily.temperature_2m_min[0]),
        };
        weatherCache[key] = w;
        setData(w);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [lat, lon, key, enabled]);

  return { data, loading };
}

/* ─── Inline Weather ─── */
function PlaceWeather({ lat, lon, place, enabled }: { lat: number; lon: number; place: string; enabled: boolean }) {
  const { data, loading } = usePlaceWeather(lat, lon, enabled);
  if (!enabled) return null;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 0 2px" }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          border: `1.5px solid ${T.sunken}`, borderTopColor: T.tertiary,
          animation: "crSpin 0.8s linear infinite",
        }} />
        <span style={{ fontSize: 11, color: T.tertiary }}>Loading weather...</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px",
      marginTop: 12,
      background: T.wash,
      borderRadius: 10,
      animation: "crSlideIn .2s ease both",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>{weatherConditionIcon(data.code)}</span>
        <span style={{
          fontSize: 18, fontWeight: 300, color: T.text,
          letterSpacing: "-0.03em", lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}>{data.temp}°</span>
      </div>
      <div style={{ width: 1, height: 16, background: T.sunken }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: T.secondary, lineHeight: 1.3, margin: 0 }}>
          {weatherLabel(data.code)} · {place}
        </p>
        <p style={{
          fontSize: 10, color: T.tertiary, margin: "2px 0 0",
          fontVariantNumeric: "tabular-nums", fontFamily: T.mono,
        }}>
          H:{data.hi}° L:{data.lo}° · {data.wind} km/h
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════ */
export default function CarRoutePage() {
  const { completed, completedAt, startTime, toggle, setStartTime, loading } = useRouteProgress("rameshwaram-car-route");
  const [exp, setExp] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);
  const [editingStart, setEditingStart] = useState(false);

  const doneCount = Object.values(completed).filter(Boolean).length;
  const allDone = doneCount === phases.length && doneCount > 0;

  const adjustedTimes = useMemo<AdjustedTime[]>(
    () => computeAdjustedRouteTimes(PHASE_DURATIONS, DEFAULT_START, completedAt, startTime, PHASE_IS_RANGE),
    [completedAt, startTime]
  );

  const effectiveStart = startTime ?? DEFAULT_START;

  return (
    <>
      <style>{`
        @keyframes crSlideIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes crSpin { to { transform:rotate(360deg); } }
        @keyframes crPulse { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
        @keyframes crCheck { from { transform:scale(0.5); opacity:0; } to { transform:scale(1); opacity:1; } }
        @keyframes lbFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes lbScaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
      `}</style>

      <div style={{
        fontFamily: T.sans,
        opacity: loading ? 0.5 : 1,
        transition: "opacity 0.3s ease",
        padding: "12px 20px 32px",
      }}>

        {/* ── Departure + Day Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24,
        }}>
          <div>
            <p style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
              textTransform: "uppercase", color: T.tertiary,
              margin: "0 0 4px",
            }}>Feb 28 · Travel Day</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <p style={{
                fontSize: 22, fontWeight: 600, letterSpacing: "-0.03em",
                color: T.text, margin: 0, fontVariantNumeric: "tabular-nums",
              }}>{formatTime(effectiveStart)}</p>
              {startTime !== null && startTime !== DEFAULT_START && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: startTime > DEFAULT_START ? T.critical : T.done,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {startTime > DEFAULT_START ? `+${startTime - DEFAULT_START}m` : `${startTime - DEFAULT_START}m`}
                </span>
              )}
            </div>
          </div>

          {editingStart ? (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {[
                { label: "−", action: () => setStartTime(Math.max(0, effectiveStart - 15)) },
                { label: "+", action: () => setStartTime(Math.min(1440, effectiveStart + 15)) },
              ].map((btn) => (
                <button key={btn.label} onClick={btn.action} style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: `1px solid ${T.border}`, background: T.surface,
                  color: T.text, fontSize: 15, fontWeight: 500,
                  cursor: "pointer", fontFamily: T.mono,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{btn.label}</button>
              ))}
              {startTime !== null && (
                <button onClick={() => { setStartTime(null); setEditingStart(false); }} style={{
                  padding: "6px 10px", borderRadius: 8,
                  border: `1px solid ${T.border}`, background: T.surface,
                  color: T.tertiary, fontSize: 11, fontWeight: 600,
                  cursor: "pointer",
                }}>Reset</button>
              )}
              <button onClick={() => setEditingStart(false)} style={{
                padding: "6px 12px", borderRadius: 8,
                border: "none", background: T.accent,
                color: "white", fontSize: 11, fontWeight: 600,
                cursor: "pointer",
              }}>Done</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums",
                fontFamily: T.mono,
                color: allDone ? T.done : T.tertiary,
              }}>
                {doneCount}/{phases.length}
              </span>
              <button onClick={() => setEditingStart(true)} style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1px solid ${T.border}`, background: T.surface,
                color: T.secondary, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* ── Timeline ── */}
        <div style={{ position: "relative", paddingLeft: 28 }}>
          {/* Vertical rail */}
          <div style={{
            position: "absolute", left: 9, top: 12, bottom: 12,
            width: 1.5, background: T.sunken, borderRadius: 1, opacity: 0.5,
          }} />

          {phases.map((p, i) => {
            const done = !!completed[i];
            const isExp = exp === i;
            const isDrive = p.type === "drive";
            const isArrival = p.type === "arrival";
            const isCritical = "critical" in p && !!(p as unknown as Record<string, unknown>).critical;
            const hasImg = "img" in p;
            const hasNote = "note" in p;
            const hasMaps = "maps" in p;

            const title = "from" in p ? `${p.from} → ${p.to}` : "fn" in p ? p.fn : p.name;
            const adj = adjustedTimes[i];
            const displayTime = adj?.time ?? p.time;
            const isShifted = adj?.shifted ?? false;

            return (
              <div key={i} style={{ position: "relative", marginBottom: isDrive ? 0 : 2 }}>

                {/* ── Timeline dot ── */}
                <div
                  onClick={(e) => { e.stopPropagation(); toggle(i); }}
                  style={{
                    position: "absolute", left: -24, top: isDrive ? 16 : 18,
                    width: isDrive ? 12 : isArrival ? 18 : 14,
                    height: isDrive ? 12 : isArrival ? 18 : 14,
                    borderRadius: "50%", zIndex: 2,
                    background: done
                      ? T.done
                      : isArrival
                        ? T.accent
                        : isDrive
                          ? T.wash
                          : T.surface,
                    border: done || isArrival
                      ? "none"
                      : isDrive
                        ? `1.5px solid ${T.sunken}`
                        : `2px solid ${T.sunken}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: `all .25s ${T.ease}`,
                    cursor: "pointer",
                    marginLeft: isDrive ? 1 : isArrival ? -2 : 0,
                  }}
                >
                  {done && (
                    <svg width={isDrive ? 7 : 8} height={isDrive ? 7 : 8} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3.5" style={{ animation: "crCheck .2s ease both" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                  )}
                  {isArrival && !done && (
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "white" }} />
                  )}
                </div>

                {/* Arrival pulse ring */}
                {isArrival && !done && (
                  <div style={{
                    position: "absolute", left: -26, top: 16,
                    width: 18, height: 18, borderRadius: "50%",
                    border: `1.5px solid ${T.accent}`, opacity: 0.3,
                    animation: "crPulse 2s ease-in-out infinite", zIndex: 1,
                  }} />
                )}

                {/* ── Drive Segment ── */}
                {isDrive && (
                  <div
                    onClick={() => setExp(isExp ? null : i)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      cursor: "pointer",
                      background: done ? "transparent" : T.wash,
                      marginBottom: 6,
                      transition: `all .2s ${T.ease}`,
                      opacity: done ? 0.5 : 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {/* Arrow icon */}
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
                        stroke={done ? T.tertiary : T.secondary} strokeWidth="1.5" style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>
                      </svg>

                      <span style={{
                        fontSize: 14, fontWeight: 600,
                        color: done ? T.tertiary : T.text,
                        textDecoration: done ? "line-through" : "none",
                        letterSpacing: "-0.02em", flex: 1,
                      }}>{title}</span>

                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                        {"distance" in p && (
                          <span style={{
                            fontSize: 11, fontWeight: 500, color: T.tertiary,
                            fontFamily: T.mono, fontVariantNumeric: "tabular-nums",
                          }}>{p.distance}</span>
                        )}
                        <span style={{
                          fontSize: 11, color: isShifted ? T.blue : T.tertiary,
                          fontWeight: isShifted ? 600 : 400,
                          fontVariantNumeric: "tabular-nums", fontFamily: T.mono,
                        }}>{displayTime}</span>
                      </div>
                    </div>

                    {/* Expanded: highway + weather */}
                    {isExp && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}`, animation: "crSlideIn .2s ease both" }}>
                        {"highway" in p && (
                          <p style={{ fontSize: 12, color: T.secondary, margin: 0 }}>
                            {p.highway}
                          </p>
                        )}
                        {isShifted && adj && (
                          <span style={{
                            display: "inline-block", marginTop: 6,
                            fontSize: 10, fontWeight: 600,
                            color: adj.delta > 0 ? T.critical : T.done,
                            background: adj.delta > 0 ? T.criticalSoft : T.doneSoft,
                            padding: "2px 8px", borderRadius: 6,
                          }}>
                            {adj.delta > 0 ? `+${adj.delta}m` : `${adj.delta}m`}
                          </span>
                        )}
                        <PlaceWeather lat={p.lat} lon={p.lon} place={p.place} enabled={isExp} />
                      </div>
                    )}
                  </div>
                )}

                {/* ── Stop / Arrival Card ── */}
                {!isDrive && (
                  <div
                    onClick={() => setExp(isExp ? null : i)}
                    style={{
                      padding: isArrival ? "18px 16px" : "14px 16px",
                      borderRadius: T.r,
                      cursor: "pointer",
                      background: isArrival
                        ? (done ? T.doneSoft : T.accentSoft)
                        : (isExp ? T.surface : "transparent"),
                      border: isExp && !isArrival
                        ? `1px solid ${T.border}`
                        : isArrival
                          ? `1px solid ${done ? "rgba(45,139,85,0.12)" : "rgba(155,107,44,0.1)"}`
                          : "1px solid transparent",
                      boxShadow: isExp && !isArrival
                        ? "0 1px 3px rgba(24,21,17,0.03), 0 4px 16px rgba(24,21,17,0.03)"
                        : "none",
                      transition: `all .25s ${T.ease}`,
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Thumbnail */}
                      {hasImg ? (
                        <div
                          onClick={(e) => { e.stopPropagation(); setLightbox({ src: (p as unknown as Record<string, string>).img, label: title }); }}
                          style={{
                            width: isArrival ? 48 : 40, height: isArrival ? 48 : 40,
                            borderRadius: isArrival ? 14 : 10,
                            overflow: "hidden", flexShrink: 0, cursor: "pointer",
                          }}
                        >
                          <img
                            src={(p as unknown as Record<string, string>).img}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        </div>
                      ) : (
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: isCritical ? T.criticalSoft : T.accentSoft,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {isCritical ? (
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={T.critical} strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                          ) : (
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={T.accent} strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
                            </svg>
                          )}
                        </div>
                      )}

                      {/* Title + time */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: isArrival ? 16 : 14,
                          fontWeight: done ? 400 : isArrival ? 700 : 600,
                          color: done
                            ? T.tertiary
                            : isCritical
                              ? T.critical
                              : isArrival
                                ? (allDone ? T.done : T.accent)
                                : T.text,
                          textDecoration: done && !isArrival ? "line-through" : "none",
                          letterSpacing: "-0.02em",
                          lineHeight: 1.3, margin: 0,
                        }}>{title}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                          <span style={{
                            fontSize: 12,
                            color: isShifted ? T.blue : T.tertiary,
                            fontWeight: isShifted ? 600 : 400,
                            fontVariantNumeric: "tabular-nums", fontFamily: T.mono,
                          }}>{displayTime}</span>
                          {isShifted && adj && (
                            <span style={{
                              fontSize: 9, fontWeight: 600,
                              color: adj.delta > 0 ? T.critical : T.done,
                              background: adj.delta > 0 ? T.criticalSoft : T.doneSoft,
                              padding: "1px 6px", borderRadius: 4,
                            }}>
                              {adj.delta > 0 ? `+${adj.delta}m` : `${adj.delta}m`}
                            </span>
                          )}
                          {isCritical && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, color: T.critical,
                              letterSpacing: "0.04em", textTransform: "uppercase",
                            }}>Fuel</span>
                          )}
                        </div>
                      </div>

                      {/* Chevron */}
                      <div style={{
                        transform: isExp ? "rotate(180deg)" : "rotate(0)",
                        transition: `transform .25s ${T.ease}`,
                        color: T.tertiary, flexShrink: 0, opacity: 0.5,
                      }}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                        </svg>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExp && (
                      <div style={{
                        marginTop: 14, paddingTop: 14,
                        borderTop: `1px solid ${T.border}`,
                        animation: "crSlideIn .2s ease both",
                      }}>
                        {"name" in p && p.type !== "arrival" && (
                          <p style={{ fontSize: 13, fontWeight: 500, color: T.text, margin: "0 0 4px" }}>{p.name}</p>
                        )}
                        {hasNote && (
                          <p style={{
                            fontSize: 12.5, color: T.secondary, lineHeight: 1.65, margin: 0,
                          }}>
                            {(p as unknown as Record<string, string>).note}
                          </p>
                        )}
                        <PlaceWeather lat={p.lat} lon={p.lon} place={p.place} enabled={isExp} />
                        {hasMaps && (
                          <a
                            href={(p as unknown as Record<string, string>).maps}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 6,
                              marginTop: 12,
                              padding: "8px 14px",
                              borderRadius: 8,
                              background: T.accentSoft,
                              color: T.accent,
                              fontSize: 12, fontWeight: 600,
                              textDecoration: "none",
                              WebkitTapHighlightColor: "transparent",
                            }}
                          >
                            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
                            </svg>
                            Open in Maps
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            animation: "lbFadeIn 0.2s ease both",
            cursor: "pointer", padding: 24,
          }}
        >
          <div style={{
            position: "absolute", top: 16, right: 20,
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 360, width: "100%", borderRadius: 18, overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
              animation: "lbScaleIn 0.25s ease both",
            }}
          >
            <img src={lightbox.src} alt={lightbox.label} style={{ width: "100%", display: "block", maxHeight: "70vh", objectFit: "cover" }} />
          </div>
          <div style={{
            marginTop: 14, fontSize: 13, fontWeight: 600,
            color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em",
            textAlign: "center",
            animation: "lbScaleIn 0.25s ease 0.05s both",
          }}>{lightbox.label}</div>
        </div>
      )}
    </>
  );
}
