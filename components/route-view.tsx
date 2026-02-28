"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouteProgress } from "@/hooks/use-route-progress";
import { useGeolocation, projectOntoRoute, haversineKm } from "@/hooks/use-geolocation";
import { formatTime } from "@/lib/schedule";

/* ─── Design Tokens ─── */
const T = {
  bg:        "#FAF9F6",
  surface:   "#FFFFFF",
  wash:      "#F5F5F3",
  sunken:    "#E8E6E1",
  text:      "#1D1D1F",
  secondary: "#6E6E73",
  tertiary:  "#AEAEB2",
  accent:    "#9B6B2C",
  accentSoft:"rgba(155,107,44,0.06)",
  done:      "#34C759",
  doneSoft:  "rgba(52,199,89,0.08)",
  live:      "#007AFF",
  liveSoft:  "rgba(0,122,255,0.08)",
  liveGlow:  "rgba(0,122,255,0.12)",
  border:    "rgba(60,60,67,0.06)",
  routeGray: "#D1D1D6",
  routeActive:"#9B6B2C",
  sans:      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Instrument Sans', system-ui, sans-serif",
  mono:      "'SF Mono', 'DM Mono', ui-monospace, monospace",
  ease:      "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  spring:    "cubic-bezier(0.34, 1.56, 0.64, 1)",
};

/* ─── Route Waypoints ─── */
const waypoints = [
  { name: "Bengaluru",       short: "BLR", lat: 12.9716, lon: 77.5946, km: 0,   type: "origin" as const },
  { name: "Salem",           short: "SLM", lat: 11.6643, lon: 78.1460, km: 200, type: "city"   as const },
  { name: "Madurai",         short: "MDU", lat: 9.9252,  lon: 78.1198, km: 360, type: "city"   as const },
  { name: "Ramanathapuram",  short: "RMD", lat: 9.3639,  lon: 78.8395, km: 462, type: "stop"   as const },
  { name: "Rameshwaram",     short: "RMM", lat: 9.2876,  lon: 79.3129, km: 552, type: "dest"   as const },
];

const TOTAL_KM = 552;
const PHASE_KM: number[] = [0, 200, 200, 360, 360, 360, 552, 462, 552];

/* ─── Geometry ─── */
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function kmToPoint(km: number, w: number, h: number): { x: number; y: number } {
  const t = km / TOTAL_KM;
  const pad = 56;
  const usableW = w - pad * 2;
  const usableH = h - pad * 2;

  let x: number, y: number;
  if (t <= 0.36) {
    const s = t / 0.36;
    x = pad + usableW * lerp(0.32, 0.65, s);
    y = pad + usableH * lerp(0.0, 0.36, s);
  } else if (t <= 0.65) {
    const s = (t - 0.36) / 0.29;
    x = pad + usableW * lerp(0.65, 0.3, s);
    y = pad + usableH * lerp(0.36, 0.65, s);
  } else if (t <= 0.84) {
    const s = (t - 0.65) / 0.19;
    x = pad + usableW * lerp(0.3, 0.56, s);
    y = pad + usableH * lerp(0.65, 0.84, s);
  } else {
    const s = (t - 0.84) / 0.16;
    x = pad + usableW * lerp(0.56, 0.72, s);
    y = pad + usableH * lerp(0.84, 1.0, s);
  }
  return { x, y };
}

function routePath(w: number, h: number): string {
  const steps = 100;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const km = (i / steps) * TOTAL_KM;
    const { x, y } = kmToPoint(km, w, h);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

/* ─── Weather ─── */
interface CompactWeather { temp: number; code: number; }

function useDestWeather() {
  const [data, setData] = useState<CompactWeather | null>(null);
  useEffect(() => {
    fetch("/api/weather?lat=9.2876&lon=79.3129&compact=1")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.current) setData({ temp: Math.round(d.current.temperature_2m), code: d.current.weather_code });
      })
      .catch(() => {});
  }, []);
  return data;
}

function weatherIcon(code: number): string {
  if (code === 0) return "☀";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫";
  if (code <= 67) return "🌧";
  if (code === 95 || code === 96 || code === 99) return "⛈";
  return "☁";
}

/* ─── RouteView ─── */
export default function RouteView() {
  const { completed, startTime, loading } = useRouteProgress("rameshwaram-car-route");
  const destWeather = useDestWeather();
  const geo = useGeolocation();

  const progressKm = useMemo(() => {
    let maxKm = 0;
    for (const [idx, done] of Object.entries(completed)) {
      if (done && PHASE_KM[Number(idx)] !== undefined) {
        maxKm = Math.max(maxKm, PHASE_KM[Number(idx)]);
      }
    }
    return maxKm;
  }, [completed]);

  const livePosition = useMemo(() => {
    if (!geo.position) return null;
    const proj = projectOntoRoute(geo.position.lat, geo.position.lon, waypoints);
    if (proj.offRouteKm > 25) return null;
    return {
      routeKm: Math.round(proj.routeKm),
      offRouteKm: proj.offRouteKm,
      speed: geo.position.speed !== null ? Math.round(geo.position.speed * 3.6) : null,
    };
  }, [geo.position]);

  const nextWaypoint = useMemo(() => {
    if (!geo.position) return null;
    const liveKm = livePosition?.routeKm ?? 0;
    for (const wp of waypoints) {
      if (wp.km > liveKm) {
        const dist = haversineKm(geo.position.lat, geo.position.lon, wp.lat, wp.lon);
        return { name: wp.short, distKm: Math.round(dist) };
      }
    }
    return null;
  }, [geo.position, livePosition]);

  const doneCount = Object.values(completed).filter(Boolean).length;
  const allDone = doneCount >= 9;
  const pct = Math.round((progressKm / TOTAL_KM) * 100);
  const effectiveStart = startTime ?? 510;

  const svgW = 382;
  const svgH = 420;
  const fullPath = routePath(svgW, svgH);
  const carPos = kmToPoint(progressKm, svgW, svgH);
  const livePos = livePosition ? kmToPoint(livePosition.routeKm, svgW, svgH) : null;

  const wpPositions = waypoints.map(wp => ({
    ...wp,
    ...kmToPoint(wp.km, svgW, svgH),
    passed: progressKm >= wp.km,
  }));

  return (
    <div style={{
      fontFamily: T.sans,
      padding: "0 20px 12px",
      opacity: loading ? 0.4 : 1,
      transition: "opacity 0.3s ease",
    }}>
      <style>{`
        @keyframes rvPulse { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(2); opacity: 0; } }
        @keyframes rvFadeUp { from { opacity:0; transform:translateY(8px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes rvLivePulse { 0%,100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(2.5); opacity: 0; } }
        @keyframes rvLiveDot { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* ── Map Card ── */}
      <div style={{
        background: T.surface,
        borderRadius: 16,
        boxShadow: "0 0.5px 0 rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.03)",
        overflow: "hidden",
        animation: "rvFadeUp .4s ease both",
      }}>
        {/* ── Location toggle ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "14px 16px 0",
        }}>
          <button
            onClick={() => geo.watching ? geo.stop() : geo.start()}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 12px",
              borderRadius: 20,
              border: "none",
              background: geo.watching ? T.liveSoft : "rgba(120,120,128,0.08)",
              color: geo.watching ? T.live : T.secondary,
              fontSize: 12, fontWeight: 500,
              cursor: "pointer",
              transition: `all .25s ${T.ease}`,
              letterSpacing: "-0.01em",
            }}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth="2">
              {geo.watching ? (
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-5.07-1.41 1.41M8.34 15.66l-1.41 1.41m0-10.14 1.41 1.41m7.32 7.32 1.41 1.41" />
                </>
              )}
            </svg>
            {geo.watching ? "Live" : "Location"}
          </button>
        </div>

        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          style={{ display: "block" }}
        >
          <defs>
            <linearGradient id="rv-route-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={allDone ? T.done : T.routeActive} stopOpacity="1" />
              <stop offset="100%" stopColor={allDone ? T.done : T.routeActive} stopOpacity="0.7" />
            </linearGradient>
            <filter id="rv-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>
          </defs>

          {/* Full route trail */}
          <path d={fullPath} fill="none" stroke={T.routeGray} strokeWidth="2" strokeLinecap="round" opacity="0.5" />

          {/* Completed route glow */}
          {progressKm > 0 && (() => {
            const pts: string[] = [];
            const steps = 100;
            for (let i = 0; i <= steps; i++) {
              const km = (i / steps) * TOTAL_KM;
              if (km > progressKm) break;
              const { x, y } = kmToPoint(km, svgW, svgH);
              pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
            }
            return (
              <path d={pts.join(" ")} fill="none" stroke={allDone ? T.done : T.routeActive} strokeWidth="5" strokeLinecap="round" opacity="0.08" filter="url(#rv-glow)" />
            );
          })()}

          {/* Completed route */}
          {progressKm > 0 && (() => {
            const pts: string[] = [];
            const steps = 100;
            for (let i = 0; i <= steps; i++) {
              const km = (i / steps) * TOTAL_KM;
              if (km > progressKm) break;
              const { x, y } = kmToPoint(km, svgW, svgH);
              pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
            }
            return (
              <path d={pts.join(" ")} fill="none" stroke="url(#rv-route-grad)" strokeWidth="2.5" strokeLinecap="round" />
            );
          })()}

          {/* Highway labels — subtle, cartographic */}
          {[
            { km: 100, label: "NH 44", angle: -22 },
            { km: 420, label: "NH 87", angle: 12 },
          ].map((hw, i) => {
            const p = kmToPoint(hw.km, svgW, svgH);
            return (
              <text key={i} x={p.x + 16} y={p.y - 14}
                fontSize="7" fontFamily={T.mono} fontWeight="400"
                fill={T.tertiary} opacity={0.35}
                transform={`rotate(${hw.angle}, ${p.x + 16}, ${p.y - 14})`}
                letterSpacing="0.03em"
              >{hw.label}</text>
            );
          })}

          {/* Pamban Bridge */}
          {(() => {
            const p1 = kmToPoint(518, svgW, svgH);
            const p2 = kmToPoint(542, svgW, svgH);
            return (
              <g opacity="0.3">
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={T.tertiary} strokeWidth="0.6" strokeDasharray="2,2.5" />
                <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 7}
                  fontSize="6" fontFamily={T.sans} fontWeight="500"
                  fill={T.tertiary} textAnchor="middle"
                  letterSpacing="0.02em"
                >Pamban Bridge</text>
              </g>
            );
          })()}

          {/* Waypoint markers — Apple Maps style */}
          {wpPositions.map((wp, i) => {
            const isDest = wp.type === "dest";
            const isOrigin = wp.type === "origin";
            const isSmall = wp.type === "stop";
            const r = isDest ? 7 : isOrigin ? 5.5 : isSmall ? 2.5 : 4;
            const labelSide = i % 2 === 0 ? -1 : 1;

            return (
              <g key={wp.name}>
                {/* Destination halo */}
                {isDest && !allDone && (
                  <circle cx={wp.x} cy={wp.y} r={14} fill={T.accent} opacity="0.05" />
                )}
                {isDest && allDone && (
                  <circle cx={wp.x} cy={wp.y} r={14} fill={T.done} opacity="0.06" />
                )}

                {/* Dot */}
                <circle cx={wp.x} cy={wp.y} r={r}
                  fill={wp.passed ? (allDone ? T.done : T.accent) : T.surface}
                  stroke={wp.passed ? "none" : T.routeGray}
                  strokeWidth={isSmall ? 1 : 1.5}
                />

                {/* Checkmark for passed waypoints */}
                {wp.passed && !isSmall && (
                  <path
                    d={`M${wp.x - 2.5},${wp.y} L${wp.x - 0.5},${wp.y + 2} L${wp.x + 3},${wp.y - 2}`}
                    fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                )}

                {/* Label — name */}
                <text
                  x={wp.x + labelSide * (r + 10)}
                  y={wp.y + (isDest ? -13 : 0)}
                  textAnchor={labelSide < 0 ? "end" : "start"}
                  fontSize={isDest || isOrigin ? "11" : isSmall ? "8" : "9.5"}
                  fontFamily={T.sans}
                  fontWeight={isDest ? "700" : isOrigin ? "600" : "500"}
                  fill={wp.passed ? T.text : T.tertiary}
                  dominantBaseline="central"
                  letterSpacing="-0.02em"
                >{wp.name}</text>

                {/* Label — distance */}
                {!isSmall && (
                  <text
                    x={wp.x + labelSide * (r + 10)}
                    y={wp.y + (isDest ? 0 : 14)}
                    textAnchor={labelSide < 0 ? "end" : "start"}
                    fontSize="7.5" fontFamily={T.mono} fontWeight="400"
                    fill={T.tertiary} dominantBaseline="central"
                    opacity="0.6"
                    letterSpacing="0.01em"
                  >{wp.km === 0 ? "Start" : `${wp.km} km`}</text>
                )}
              </g>
            );
          })}

          {/* Progress position (from checklist) */}
          {!allDone && progressKm < TOTAL_KM && !livePos && (
            <g>
              <circle cx={carPos.x} cy={carPos.y} r="7"
                fill="none" stroke={T.accent} strokeWidth="1"
                style={{ animation: "rvPulse 2s ease-in-out infinite", transformOrigin: `${carPos.x}px ${carPos.y}px` }}
              />
              <circle cx={carPos.x} cy={carPos.y} r="4.5" fill={T.accent} />
              <circle cx={carPos.x} cy={carPos.y} r="1.8" fill="white" />
            </g>
          )}

          {/* Live GPS position (Apple Maps blue dot) */}
          {livePos && !allDone && (
            <g style={{ animation: "rvLiveDot .3s ease both" }}>
              <circle cx={livePos.x} cy={livePos.y} r="12"
                fill={T.live} opacity="0.06" />
              <circle cx={livePos.x} cy={livePos.y} r="7"
                fill="none" stroke={T.live} strokeWidth="1"
                style={{ animation: "rvLivePulse 2s ease-in-out infinite", transformOrigin: `${livePos.x}px ${livePos.y}px` }}
              />
              <circle cx={livePos.x} cy={livePos.y} r="5.5" fill={T.live} />
              <circle cx={livePos.x} cy={livePos.y} r="2" fill="white" />
            </g>
          )}

          {/* Completed destination */}
          {allDone && (
            <g>
              <circle cx={carPos.x} cy={carPos.y} r="8" fill={T.done} />
              <path
                d={`M${carPos.x - 3},${carPos.y} L${carPos.x - 0.5},${carPos.y + 2.8} L${carPos.x + 4},${carPos.y - 2.8}`}
                fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
            </g>
          )}
        </svg>

        {/* ── Progress strip ── */}
        <div style={{ padding: "0 20px 20px" }}>
          {/* Thin progress bar */}
          <div style={{
            height: 2, borderRadius: 1,
            background: "rgba(120,120,128,0.08)", overflow: "hidden",
            marginBottom: 18,
          }}>
            <div style={{
              width: `${pct}%`, height: "100%", borderRadius: 1,
              background: allDone ? T.done : T.accent,
              transition: `width 0.6s ${T.ease}`,
            }} />
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex", alignItems: "baseline",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{
                fontSize: 28, fontWeight: 200, color: allDone ? T.done : T.text,
                letterSpacing: "-0.04em", lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}>{livePosition ? livePosition.routeKm : progressKm}</span>
              <span style={{
                fontSize: 13, fontWeight: 400, color: T.tertiary,
                letterSpacing: "-0.01em",
              }}>/ {TOTAL_KM} km</span>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 10,
            }}>
              {/* Live info: speed + next waypoint */}
              {livePosition && livePosition.speed !== null && livePosition.speed > 0 && (
                <>
                  <span style={{
                    fontSize: 13, fontWeight: 500, color: T.live,
                    fontFamily: T.mono, fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.02em",
                  }}>{livePosition.speed} km/h</span>
                  <span style={{ width: 0.5, height: 12, background: T.tertiary, opacity: 0.3, display: "block" }} />
                </>
              )}
              {livePosition && nextWaypoint && (
                <>
                  <span style={{
                    fontSize: 12, color: T.secondary,
                    letterSpacing: "-0.01em",
                  }}>{nextWaypoint.distKm} km to {nextWaypoint.name}</span>
                  <span style={{ width: 0.5, height: 12, background: T.tertiary, opacity: 0.3, display: "block" }} />
                </>
              )}
              {!livePosition && (
                <>
                  <span style={{
                    fontSize: 13, color: T.secondary,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.01em",
                  }}>{formatTime(effectiveStart)}</span>
                  {destWeather && (
                    <>
                      <span style={{ width: 0.5, height: 12, background: T.tertiary, opacity: 0.3, display: "block" }} />
                      <span style={{ fontSize: 13, color: T.secondary }}>
                        {weatherIcon(destWeather.code)} {destWeather.temp}°
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
