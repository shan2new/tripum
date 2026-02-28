"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouteProgress } from "@/hooks/use-route-progress";
import { computeAdjustedRouteTimes, formatTime, type AdjustedTime } from "@/lib/schedule";

/* ─── Design Tokens (matching v8-app) ─── */
const T = {
  bg:        "#FAF9F6",
  surface:   "#FFFFFF",
  wash:      "#F3F2EF",
  sunken:    "#E8E6E1",
  text:      "#181511",
  secondary: "#5C574F",
  tertiary:  "#8E8A82",
  accent:    "#9B6B2C",
  accentSoft:"rgba(155,107,44,0.09)",
  accentMid: "rgba(155,107,44,0.16)",
  done:      "#28784A",
  doneSoft:  "rgba(40,120,74,0.1)",
  critical:  "#8B3A3A",
  criticalSoft:"rgba(139,58,58,0.1)",
  blue:      "#2B6BBF",
  blueSoft:  "rgba(43,107,191,0.08)",
  border:    "rgba(24,21,17,0.06)",
  shadow:    "0 2px 8px rgba(24,21,17,0.04)",
  sans:      "'Instrument Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  mono:      "'DM Mono', 'SF Mono', monospace",
  r:         "12px",
  rFull:     "999px",
  ease:      "cubic-bezier(0.22, 1, 0.36, 1)",
};

/* ─── Route Data ─── */
const DEFAULT_START = 510; // 8:30 AM in minutes from midnight

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

/* ─── Compact Weather Types ─── */
interface CompactWeather {
  temp: number;
  code: number;
  wind: number;
  hi: number;
  lo: number;
}

function weatherLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow";
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

/* ─── Weather Cache + Fetcher ─── */
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

/* ─── Inline Weather Strip (minimalist) ─── */
function PlaceWeather({ lat, lon, place, enabled }: { lat: number; lon: number; place: string; enabled: boolean }) {
  const { data, loading } = usePlaceWeather(lat, lon, enabled);

  if (!enabled) return null;

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 0 2px",
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          border: `1.5px solid ${T.sunken}`,
          borderTopColor: T.tertiary,
          animation: "spin 0.8s linear infinite",
        }} />
        <span style={{ fontSize: 11, color: T.tertiary, fontFamily: T.sans }}>
          Loading weather...
        </span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "12px 14px",
      marginTop: 10,
      background: T.wash,
      borderRadius: 10,
      animation: "slideIn .25s ease both",
    }}>
      {/* Icon + Temp */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>
          {weatherConditionIcon(data.code)}
        </span>
        <span style={{
          fontSize: 20, fontWeight: 300, color: T.text,
          letterSpacing: "-0.03em", lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}>
          {data.temp}°
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: T.sunken }} />

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 11, fontWeight: 500, color: T.secondary,
          letterSpacing: "-0.01em", lineHeight: 1.3,
        }}>
          {weatherLabel(data.code)} · {place}
        </p>
        <p style={{
          fontSize: 10, color: T.tertiary, marginTop: 2,
          fontVariantNumeric: "tabular-nums",
          fontFamily: T.mono,
        }}>
          H:{data.hi}°  L:{data.lo}°  Wind {data.wind} km/h
        </p>
      </div>
    </div>
  );
}

/* ─── Page Component ─── */
export default function CarRoutePage() {
  const { completed, completedAt, startTime, toggle, setStartTime, loading } = useRouteProgress("rameshwaram-car-route");
  const [exp, setExp] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);
  const [editingStart, setEditingStart] = useState(false);

  const doneCount = Object.values(completed).filter(Boolean).length;

  // Compute adjusted times based on completions and custom start time
  const adjustedTimes = useMemo<AdjustedTime[]>(
    () => computeAdjustedRouteTimes(PHASE_DURATIONS, DEFAULT_START, completedAt, startTime, PHASE_IS_RANGE),
    [completedAt, startTime]
  );

  const effectiveStart = startTime ?? DEFAULT_START;

  return (
    <>
      <style>{`
        @keyframes slideIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes softPulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes lbFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes lbScaleIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
      `}</style>

      <div style={{
        fontFamily: T.sans,
        opacity: loading ? 0.5 : 1,
        transition: "opacity 0.3s ease",
        padding: "24px 24px 32px",
      }}>
        {/* Departure time editor */}
        <div style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: T.r,
          padding: "14px 18px",
          marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.tertiary, marginBottom: 4 }}>Departure</p>
              <p style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: T.text, fontVariantNumeric: "tabular-nums" }}>
                {formatTime(effectiveStart)}
              </p>
            </div>
            {editingStart ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => setStartTime(Math.max(0, effectiveStart - 15))}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    border: `1.5px solid ${T.border}`, background: T.wash,
                    color: T.text, fontSize: 14, fontWeight: 600,
                    cursor: "pointer", fontFamily: T.mono,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >-</button>
                <button
                  onClick={() => setStartTime(Math.min(1440, effectiveStart + 15))}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    border: `1.5px solid ${T.border}`, background: T.wash,
                    color: T.text, fontSize: 14, fontWeight: 600,
                    cursor: "pointer", fontFamily: T.mono,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >+</button>
                {startTime !== null && (
                  <button
                    onClick={() => { setStartTime(null); setEditingStart(false); }}
                    style={{
                      padding: "6px 12px", borderRadius: 10,
                      border: `1.5px solid ${T.border}`, background: T.wash,
                      color: T.secondary, fontSize: 11, fontWeight: 600,
                      cursor: "pointer", fontFamily: T.sans,
                    }}
                  >Reset</button>
                )}
                <button
                  onClick={() => setEditingStart(false)}
                  style={{
                    padding: "6px 12px", borderRadius: 10,
                    border: "none", background: T.accent,
                    color: "white", fontSize: 11, fontWeight: 600,
                    cursor: "pointer", fontFamily: T.sans,
                  }}
                >Done</button>
              </div>
            ) : (
              <button
                onClick={() => setEditingStart(true)}
                style={{
                  padding: "8px 14px", borderRadius: 10,
                  border: `1.5px solid ${T.border}`, background: "transparent",
                  color: T.secondary, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: T.sans,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
                Edit
              </button>
            )}
          </div>
          {startTime !== null && startTime !== DEFAULT_START && (
            <p style={{ fontSize: 11, color: T.accent, fontWeight: 500, marginTop: 6 }}>
              {startTime > DEFAULT_START ? `+${startTime - DEFAULT_START}m` : `${startTime - DEFAULT_START}m`} from original {formatTime(DEFAULT_START)}
            </p>
          )}
        </div>

        {/* Day header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.accent }}>Day 0</span>
          <span style={{ fontSize: 12, color: T.tertiary }}>Feb 28</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: T.tertiary, opacity: 0.6 }} />
          <span style={{ fontSize: 12, color: T.secondary }}>Travel Day</span>
          <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums", fontFamily: T.mono, color: doneCount === phases.length && doneCount > 0 ? T.done : T.tertiary }}>
            {doneCount}/{phases.length}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, borderRadius: T.rFull, background: T.wash, marginBottom: 24, overflow: "hidden" }}>
          <div style={{
            width: `${phases.length > 0 ? (doneCount / phases.length) * 100 : 0}%`,
            height: "100%", borderRadius: T.rFull,
            background: doneCount === phases.length && doneCount > 0 ? T.done : T.accent,
            transition: `width .5s ${T.ease}`,
          }} />
        </div>

        {/* Timeline card list */}
        <div style={{ position: "relative", paddingLeft: 36 }}>
          {/* Vertical rail */}
          <div style={{ position: "absolute", left: 15, top: 14, bottom: 14, width: 2, background: T.wash, borderRadius: 1 }} />

          {phases.map((p, i) => {
            const done = !!completed[i];
            const isExp = exp === i;
            const isDrive = p.type === "drive";
            const isArrival = p.type === "arrival";
            const isCritical = "critical" in p && !!(p as unknown as Record<string, unknown>).critical;
            const hasImg = "img" in p;
            const hasNote = "note" in p;
            const hasMaps = "maps" in p;
            const expandable = true; // all cards expand for weather

            // Card title
            const title = "from" in p ? `${p.from} → ${p.to}` : "fn" in p ? p.fn : p.name;

            // Adjusted time from cascade
            const adj = adjustedTimes[i];
            const displayTime = adj?.time ?? p.time;
            const isShifted = adj?.shifted ?? false;

            return (
              <div key={i} style={{ position: "relative", marginBottom: 2 }}>
                {/* Timeline dot */}
                <div
                  onClick={(e) => { e.stopPropagation(); toggle(i); }}
                  style={{
                    position: "absolute", left: -31, top: 22,
                    width: 16, height: 16, borderRadius: "50%", zIndex: 2,
                    background: done ? T.done : isArrival ? T.accent : T.surface,
                    border: done || isArrival ? "none" : `2px solid ${T.wash}`,
                    boxShadow: isArrival && !done ? `0 0 0 3px ${T.accentSoft}` : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: `all .25s ${T.ease}`, cursor: "pointer",
                  }}
                >
                  {done && <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                  {isArrival && !done && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "white" }} />}
                </div>
                {isArrival && !done && (
                  <div style={{ position: "absolute", left: -31, top: 22, width: 16, height: 16, borderRadius: "50%", border: `2px solid ${T.accent}`, opacity: 0.4, animation: "softPulse 2s ease-in-out infinite", zIndex: 1 }} />
                )}

                {/* Card body */}
                <div
                  onClick={() => expandable ? setExp(isExp ? null : i) : toggle(i)}
                  style={{
                    padding: "16px 18px",
                    borderRadius: T.r,
                    cursor: "pointer",
                    background: isArrival ? T.surface : "transparent",
                    border: isArrival ? `1px solid ${T.border}` : "1px solid transparent",
                    boxShadow: isArrival ? T.shadow : "none",
                    transition: `all .25s ${T.ease}`,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Swatch */}
                    {hasImg ? (
                      <div
                        onClick={(e) => { e.stopPropagation(); setLightbox({ src: (p as unknown as Record<string, string>).img, label: title }); }}
                        style={{
                          width: 44, height: 44, borderRadius: 12,
                          overflow: "hidden", flexShrink: 0, cursor: "pointer",
                        }}
                      >
                        <img src={(p as unknown as Record<string, string>).img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </div>
                    ) : (
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                        background: isDrive ? T.wash : T.accentSoft,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: isDrive ? T.tertiary : T.accent,
                      }}>
                        {isDrive ? (
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
                          </svg>
                        )}
                      </div>
                    )}

                    {/* Title + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: isArrival ? 16 : 15,
                        fontWeight: done ? 400 : isArrival ? 700 : 600,
                        color: done ? T.tertiary : isCritical ? T.critical : isArrival ? T.accent : T.text,
                        textDecoration: done ? "line-through" : "none",
                        letterSpacing: "-0.02em",
                        marginBottom: 4, lineHeight: 1.35,
                      }}>{title}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: 13,
                          color: isShifted ? T.blue : T.secondary,
                          fontWeight: isShifted ? 600 : 400,
                          fontVariantNumeric: "tabular-nums",
                          fontFamily: T.mono,
                        }}>
                          {displayTime}
                        </span>
                        {isShifted && adj && (
                          <span style={{
                            fontSize: 10, fontWeight: 600,
                            color: adj.delta > 0 ? T.critical : T.done,
                            background: adj.delta > 0 ? T.criticalSoft : T.doneSoft,
                            padding: "2px 8px", borderRadius: 6,
                          }}>
                            {adj.delta > 0 ? `+${adj.delta}m` : `${adj.delta}m`}
                          </span>
                        )}
                        {isDrive && "distance" in p && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: T.tertiary, background: T.wash, padding: "4px 10px", borderRadius: 8 }}>
                            {p.distance} · {"highway" in p ? p.highway : ""}
                          </span>
                        )}
                        {isCritical && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: T.critical, background: T.criticalSoft, padding: "4px 10px", borderRadius: 8 }}>Critical</span>
                        )}
                      </div>
                    </div>

                    {/* Chevron (only for expandable cards) */}
                    {expandable && (
                      <div style={{
                        transform: isExp ? "rotate(180deg)" : "rotate(0)",
                        transition: `transform .25s ${T.ease}`,
                        color: T.tertiary, flexShrink: 0,
                      }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Expanded details */}
                  {isExp && expandable && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}`, animation: "slideIn .2s ease both" }}>
                      {"name" in p && !isDrive && (
                        <p style={{ fontSize: 14, fontWeight: 500, color: T.text, marginBottom: 6 }}>{p.name}</p>
                      )}
                      {hasNote && (
                        <p style={{ fontSize: 13, color: T.secondary, lineHeight: 1.65 }}>
                          {(p as unknown as Record<string, string>).note}
                        </p>
                      )}
                      <PlaceWeather lat={p.lat} lon={p.lon} place={p.place} enabled={isExp} />
                      {hasMaps && <MapPill url={(p as unknown as Record<string, string>).maps} />}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox src={lightbox.src} label={lightbox.label} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

/* ─── MapPill ─── */
function MapPill({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
        padding: "10px 16px",
        borderRadius: 10,
        background: T.accentSoft,
        color: T.accent,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: T.sans,
        textDecoration: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
      </svg>
      Open in Maps
    </a>
  );
}

/* ─── Lightbox ─── */
function Lightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        animation: "lbFadeIn 0.2s ease both",
        cursor: "pointer", padding: 24,
      }}
    >
      <div style={{
        position: "absolute", top: 16, right: 20,
        width: 32, height: 32, borderRadius: "50%",
        background: "rgba(255,255,255,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 12M12 2L2 12" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 380, width: "100%", borderRadius: 16, overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          animation: "lbScaleIn 0.25s ease both",
        }}
      >
        <img src={src} alt={label} style={{ width: "100%", display: "block", maxHeight: "70vh", objectFit: "cover" }} />
      </div>
      <div style={{
        marginTop: 16, fontSize: 14, fontWeight: 600,
        color: "rgba(255,255,255,0.8)", fontFamily: T.sans,
        letterSpacing: "-0.01em", textAlign: "center",
        animation: "lbScaleIn 0.25s ease 0.05s both",
      }}>{label}</div>
    </div>
  );
}
