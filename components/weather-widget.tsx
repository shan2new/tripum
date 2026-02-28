"use client";

import { useState, useEffect, useMemo, useRef } from "react";

/* ─── Design Tokens (mirrored from v8-app) ─── */
const T = {
  bg:        "#FAF9F6",
  surface:   "#FFFFFF",
  wash:      "#F3F2EF",
  sunken:    "#E8E6E1",
  text:      "#181511",
  secondary: "#5C574F",
  tertiary:  "#8E8A82",
  accent:    "#9B6B2C",
  border:    "rgba(24,21,17,0.06)",
  shadow:    "0 2px 8px rgba(24,21,17,0.04)",
  shadowMd:  "0 4px 20px rgba(24,21,17,0.06)",
  sans:      "'Instrument Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  mono:      "'DM Mono', 'SF Mono', monospace",
  r:         "12px",
  rLg:       "16px",
  rFull:     "999px",
  ease:      "cubic-bezier(0.22, 1, 0.36, 1)",
};

/* ─── WMO Weather Code Mapping ─── */
function weatherMeta(code: number): { label: string; icon: string; gradient: string } {
  if (code === 0)                         return { label: "Clear Sky",       icon: "sun",          gradient: "linear-gradient(135deg, #F5C563 0%, #E8913A 100%)" };
  if (code <= 3)                          return { label: "Partly Cloudy",   icon: "partlyCloudy", gradient: "linear-gradient(135deg, #A8C4D8 0%, #7BA3BE 100%)" };
  if (code <= 48)                         return { label: "Foggy",           icon: "fog",          gradient: "linear-gradient(135deg, #C8C3BA 0%, #A09B93 100%)" };
  if (code <= 57)                         return { label: "Drizzle",         icon: "drizzle",      gradient: "linear-gradient(135deg, #8BABC4 0%, #6B8DA8 100%)" };
  if (code <= 67)                         return { label: "Rain",            icon: "rain",         gradient: "linear-gradient(135deg, #6B8DA8 0%, #4A6F87 100%)" };
  if (code <= 77)                         return { label: "Snow",            icon: "snow",         gradient: "linear-gradient(135deg, #D4D8E0 0%, #B0B8C4 100%)" };
  if (code <= 82)                         return { label: "Rain Showers",    icon: "rain",         gradient: "linear-gradient(135deg, #6B8DA8 0%, #4A6F87 100%)" };
  if (code <= 86)                         return { label: "Snow Showers",    icon: "snow",         gradient: "linear-gradient(135deg, #D4D8E0 0%, #B0B8C4 100%)" };
  if (code === 95 || code === 96 || code === 99) return { label: "Thunderstorm",  icon: "storm",   gradient: "linear-gradient(135deg, #5A6A7A 0%, #3A4A5A 100%)" };
  return { label: "Cloudy", icon: "partlyCloudy", gradient: "linear-gradient(135deg, #C8C3BA 0%, #A09B93 100%)" };
}

/* ─── SVG Weather Icons (minimal, Apple-grade) ─── */
function WeatherIcon({ type, size = 48 }: { type: string; size?: number }) {
  const s = size;
  const common = { width: s, height: s, viewBox: "0 0 64 64", fill: "none" };

  if (type === "sun") {
    return (
      <svg {...common}>
        <circle cx="32" cy="32" r="12" fill="rgba(255,255,255,0.95)" />
        <circle cx="32" cy="32" r="12" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
          <line key={angle} x1="32" y1={32 - 18} x2="32" y2={32 - 22} stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${angle} 32 32)`} />
        ))}
      </svg>
    );
  }

  if (type === "partlyCloudy") {
    return (
      <svg {...common}>
        <circle cx="40" cy="22" r="9" fill="rgba(255,255,255,0.85)" />
        {[0, 60, 120, 180, 240, 300].map(angle => (
          <line key={angle} x1="40" y1={22 - 13} x2="40" y2={22 - 16} stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" transform={`rotate(${angle} 40 22)`} />
        ))}
        <ellipse cx="30" cy="40" rx="18" ry="10" fill="rgba(255,255,255,0.92)" />
        <ellipse cx="24" cy="36" rx="9" ry="9" fill="rgba(255,255,255,0.92)" />
        <ellipse cx="36" cy="34" rx="11" ry="11" fill="rgba(255,255,255,0.92)" />
      </svg>
    );
  }

  if (type === "rain" || type === "drizzle") {
    return (
      <svg {...common}>
        <ellipse cx="32" cy="26" rx="18" ry="10" fill="rgba(255,255,255,0.88)" />
        <ellipse cx="26" cy="22" rx="9" ry="9" fill="rgba(255,255,255,0.88)" />
        <ellipse cx="38" cy="20" rx="11" ry="11" fill="rgba(255,255,255,0.88)" />
        {[22, 30, 38].map((x, i) => (
          <line key={i} x1={x} y1={38 + i * 2} x2={x - 2} y2={46 + i * 2} stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
        ))}
      </svg>
    );
  }

  if (type === "storm") {
    return (
      <svg {...common}>
        <ellipse cx="32" cy="24" rx="18" ry="10" fill="rgba(255,255,255,0.82)" />
        <ellipse cx="26" cy="20" rx="9" ry="9" fill="rgba(255,255,255,0.82)" />
        <ellipse cx="38" cy="18" rx="11" ry="11" fill="rgba(255,255,255,0.82)" />
        <polygon points="34,32 28,44 33,44 30,54 40,40 35,40 38,32" fill="rgba(255,255,255,0.9)" />
      </svg>
    );
  }

  if (type === "fog") {
    return (
      <svg {...common}>
        {[24, 32, 40].map((y, i) => (
          <line key={i} x1={14 + i * 2} y1={y} x2={50 - i * 2} y2={y} stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" />
        ))}
      </svg>
    );
  }

  // snow
  return (
    <svg {...common}>
      <ellipse cx="32" cy="24" rx="18" ry="10" fill="rgba(255,255,255,0.88)" />
      <ellipse cx="26" cy="20" rx="9" ry="9" fill="rgba(255,255,255,0.88)" />
      <ellipse cx="38" cy="18" rx="11" ry="11" fill="rgba(255,255,255,0.88)" />
      {[24, 32, 40].map((x, i) => (
        <circle key={i} cx={x} cy={40 + i * 4} r="2.5" fill="rgba(255,255,255,0.8)" />
      ))}
    </svg>
  );
}

/* ─── Wind direction ─── */
function windDir(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

/* ─── Format time from ISO ─── */
function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/* ─── Day name from ISO date ─── */
function dayName(iso: string, i: number): string {
  if (i === 0) return "Today";
  if (i === 1) return "Tmrw";
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short" });
}

/* ─── Types ─── */
interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    weather_code: number[];
  };
}

/* ─── Main Widget ─── */
export default function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const expandRef = useRef<HTMLDivElement>(null);
  const [expandHeight, setExpandHeight] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/weather")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  // Measure expanded content height for smooth animation
  useEffect(() => {
    if (expandRef.current) {
      setExpandHeight(expandRef.current.scrollHeight);
    }
  }, [data, expanded]);

  const meta = useMemo(() => data ? weatherMeta(data.current.weather_code) : null, [data]);

  const hourly = useMemo(() => {
    if (!data) return [];
    const now = new Date();
    const startIdx = data.hourly.time.findIndex(t => new Date(t) >= now);
    if (startIdx < 0) return [];
    return data.hourly.time.slice(startIdx, startIdx + 8).map((t, i) => ({
      hour: i === 0 ? "Now" : new Date(t).toLocaleTimeString("en-IN", { hour: "numeric", hour12: true }),
      temp: Math.round(data.hourly.temperature_2m[startIdx + i]),
      code: data.hourly.weather_code[startIdx + i],
    }));
  }, [data]);

  if (loading) {
    return (
      <div style={{
        borderRadius: T.rLg, overflow: "hidden",
        background: "linear-gradient(135deg, #C8B291 0%, #A89070 100%)",
        padding: "16px 20px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 14, height: 14, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "rgba(255,255,255,0.9)",
            animation: "spin 0.8s linear infinite",
          }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: T.sans, fontWeight: 500 }}>Loading weather...</span>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error || !data || !meta) {
    return (
      <div style={{
        borderRadius: T.rLg, overflow: "hidden",
        background: "linear-gradient(135deg, #C8B291 0%, #A89070 100%)",
        padding: "16px 20px",
      }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: T.sans }}>Weather unavailable</p>
      </div>
    );
  }

  const { current, daily } = data;
  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const hi = Math.round(daily.temperature_2m_max[0]);
  const lo = Math.round(daily.temperature_2m_min[0]);

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        borderRadius: T.rLg, overflow: "hidden",
        background: meta.gradient,
        position: "relative",
        fontFamily: T.sans,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        transition: `box-shadow .4s ${T.ease}`,
        boxShadow: expanded ? T.shadowMd : T.shadow,
      }}
    >
      {/* Glass shimmer */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(165deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.04) 100%)",
        pointerEvents: "none",
      }} />

      {/* ── Compact Header (always visible) ── */}
      <div style={{
        position: "relative",
        padding: "14px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flexShrink: 0 }}>
            <WeatherIcon type={meta.icon} size={36} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{
                fontSize: 28, fontWeight: 300, color: "white",
                lineHeight: 1, letterSpacing: "-0.03em",
                fontVariantNumeric: "tabular-nums",
              }}>
                {temp}°
              </span>
              <span style={{
                fontSize: 12, fontWeight: 500,
                color: "rgba(255,255,255,0.6)",
              }}>
                {meta.label}
              </span>
            </div>
            <div style={{
              fontSize: 11, color: "rgba(255,255,255,0.45)",
              fontWeight: 400, marginTop: 1,
              fontVariantNumeric: "tabular-nums",
            }}>
              Rameshwaram · H:{hi}° L:{lo}°
            </div>
          </div>
        </div>

        {/* Expand chevron */}
        <div style={{
          flexShrink: 0,
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: `transform .35s ${T.ease}`,
          color: "rgba(255,255,255,0.4)",
        }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>

      {/* ── Expandable Content ── */}
      <div
        ref={expandRef}
        onClick={e => e.stopPropagation()}
        style={{
          overflow: "hidden",
          maxHeight: expanded ? expandHeight : 0,
          opacity: expanded ? 1 : 0,
          transition: `max-height .45s ${T.ease}, opacity .3s ${T.ease}`,
        }}
      >
        {/* Hourly forecast strip */}
        <div style={{
          padding: "12px 0",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none" as const,
        }}>
          <div style={{
            display: "flex", gap: 0, paddingLeft: 18, paddingRight: 18,
            minWidth: "min-content",
          }}>
            {hourly.map((h, i) => {
              const hMeta = weatherMeta(h.code);
              return (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 5, minWidth: 46, padding: "2px 0",
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 500,
                    color: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
                  }}>
                    {h.hour}
                  </span>
                  <WeatherIcon type={hMeta.icon} size={18} />
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    color: "rgba(255,255,255,0.85)",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {h.temp}°
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail strip */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          padding: "12px 18px 14px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}>
          {[
            { label: "Feels", value: `${feelsLike}°` },
            { label: "Humidity", value: `${current.relative_humidity_2m}%` },
            { label: "Wind", value: `${Math.round(current.wind_speed_10m)} ${windDir(current.wind_direction_10m)}` },
            { label: "UV", value: `${Math.round(daily.uv_index_max[0])}` },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <span style={{ fontSize: 9, fontWeight: 500, color: "rgba(255,255,255,0.4)", letterSpacing: "0.02em" }}>
                {item.label}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontVariantNumeric: "tabular-nums" }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* 5-day forecast */}
        <div style={{
          padding: "0 18px 16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{
            fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            color: "rgba(255,255,255,0.35)",
            padding: "10px 0 6px",
          }}>
            5-Day Forecast
          </div>
          {daily.time.map((day, i) => {
            const dayMeta = weatherMeta(daily.weather_code[i]);
            const dMax = Math.round(daily.temperature_2m_max[i]);
            const dMin = Math.round(daily.temperature_2m_min[i]);
            const allMax = Math.max(...daily.temperature_2m_max);
            const allMin = Math.min(...daily.temperature_2m_min);
            const range = allMax - allMin || 1;
            const barLeft = ((dMin - allMin) / range) * 100;
            const barWidth = ((dMax - dMin) / range) * 100;

            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 0",
                borderBottom: i < daily.time.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 500,
                  color: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.65)",
                  width: 40, flexShrink: 0,
                }}>
                  {dayName(day, i)}
                </span>
                <div style={{ width: 18, flexShrink: 0, display: "flex", justifyContent: "center" }}>
                  <WeatherIcon type={dayMeta.icon} size={16} />
                </div>
                <span style={{
                  fontSize: 12, color: "rgba(255,255,255,0.4)", width: 24, textAlign: "right" as const,
                  fontVariantNumeric: "tabular-nums", flexShrink: 0,
                }}>
                  {dMin}°
                </span>
                <div style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: "rgba(255,255,255,0.1)",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: 0, bottom: 0,
                    left: `${barLeft}%`, width: `${Math.max(barWidth, 8)}%`,
                    borderRadius: 2,
                    background: "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.6))",
                  }} />
                </div>
                <span style={{
                  fontSize: 12, color: "rgba(255,255,255,0.8)", width: 24, textAlign: "left" as const,
                  fontVariantNumeric: "tabular-nums", fontWeight: 500, flexShrink: 0,
                }}>
                  {dMax}°
                </span>
              </div>
            );
          })}
        </div>

        {/* Sunrise/Sunset */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 24,
          padding: "10px 18px 16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v3m0 14v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3m14 0h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
            </svg>
            <div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Sunrise</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {formatTime(daily.sunrise[0])}
              </div>
            </div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.08)", alignSelf: "stretch" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v3m0 14v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3m14 0h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            </svg>
            <div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Sunset</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {formatTime(daily.sunset[0])}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
