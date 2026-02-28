"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouteProgress } from "@/hooks/use-route-progress";
import { formatTime } from "@/lib/schedule";

/* ─── Design Tokens (matching v8-app Ive Edition) ─── */
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
  done:      "#28784A",
  doneSoft:  "rgba(40,120,74,0.1)",
  critical:  "#8B3A3A",
  border:    "rgba(24,21,17,0.06)",
  sans:      "'Instrument Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  mono:      "'DM Mono', 'SF Mono', monospace",
  ease:      "cubic-bezier(0.22, 1, 0.36, 1)",
};

/* ─── Route Waypoints ─── */
const waypoints = [
  { name: "Bengaluru",       short: "BLR", lat: 12.9716, lon: 77.5946, km: 0,   type: "origin"  as const },
  { name: "Salem",           short: "SLM", lat: 11.6643, lon: 78.1460, km: 200, type: "city"    as const },
  { name: "Madurai",         short: "MDU", lat: 9.9252,  lon: 78.1198, km: 360, type: "city"    as const },
  { name: "Ramanathapuram",  short: "RMD", lat: 9.3639,  lon: 78.8395, km: 462, type: "stop"    as const },
  { name: "Rameshwaram",     short: "RMM", lat: 9.2876,  lon: 79.3129, km: 552, type: "dest"    as const },
];

const TOTAL_KM = 552;

/* ─── Phase-to-distance mapping ─── */
// phases in car-route.tsx: 0=Chiku(0km), 1=BLR→SLM(200km), 2=Salem stop, 3=SLM→MDU(360km),
// 4=Madurai lunch, 5=Madurai refuel, 6=MDU→RMM(552km), 7=Tea stop(~462km), 8=Arrival(552km)
const PHASE_KM: number[] = [0, 200, 200, 360, 360, 360, 552, 462, 552];

/* ─── Helpers ─── */
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/**
 * Map a km value (0–552) to a point on the SVG route curve.
 * The route is drawn as a gentle S-curve flowing south.
 */
function kmToPoint(km: number, w: number, h: number): { x: number; y: number } {
  const t = km / TOTAL_KM; // 0→1
  // S-curve control: starts center-left, sweeps right through Salem,
  // curves left past Madurai, then drifts right to Rameshwaram
  const pad = 48;
  const usableW = w - pad * 2;
  const usableH = h - pad * 2;

  // Piecewise cubic for a natural road feel
  let x: number, y: number;
  if (t <= 0.36) {
    // Bengaluru → Salem: gentle rightward curve
    const s = t / 0.36;
    x = pad + usableW * lerp(0.35, 0.62, s);
    y = pad + usableH * lerp(0.0, 0.36, s);
  } else if (t <= 0.65) {
    // Salem → Madurai: sweep back left
    const s = (t - 0.36) / 0.29;
    x = pad + usableW * lerp(0.62, 0.32, s);
    y = pad + usableH * lerp(0.36, 0.65, s);
  } else if (t <= 0.84) {
    // Madurai → Ramanathapuram: drift right along coast
    const s = (t - 0.65) / 0.19;
    x = pad + usableW * lerp(0.32, 0.58, s);
    y = pad + usableH * lerp(0.65, 0.84, s);
  } else {
    // Ramanathapuram → Rameshwaram: final stretch east
    const s = (t - 0.84) / 0.16;
    x = pad + usableW * lerp(0.58, 0.72, s);
    y = pad + usableH * lerp(0.84, 1.0, s);
  }
  return { x, y };
}

/** Generate the SVG path d attribute for the full route */
function routePath(w: number, h: number): string {
  const steps = 80;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const km = (i / steps) * TOTAL_KM;
    const { x, y } = kmToPoint(km, w, h);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

/* ─── Weather hook (compact) ─── */
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

/* ─── RouteView Component ─── */
export default function RouteView() {
  const { completed, startTime, loading } = useRouteProgress("rameshwaram-car-route");
  const destWeather = useDestWeather();

  // Compute progress km from completed phases
  const progressKm = useMemo(() => {
    let maxKm = 0;
    for (const [idx, done] of Object.entries(completed)) {
      if (done && PHASE_KM[Number(idx)] !== undefined) {
        maxKm = Math.max(maxKm, PHASE_KM[Number(idx)]);
      }
    }
    return maxKm;
  }, [completed]);

  const doneCount = Object.values(completed).filter(Boolean).length;
  const allDone = doneCount >= 9;
  const pct = Math.round((progressKm / TOTAL_KM) * 100);
  const remaining = TOTAL_KM - progressKm;
  const effectiveStart = startTime ?? 510; // 8:30 AM

  // SVG dimensions
  const svgW = 382;
  const svgH = 440;
  const fullPath = routePath(svgW, svgH);

  // Current position on the curve
  const carPos = kmToPoint(progressKm, svgW, svgH);

  // Waypoint positions
  const wpPositions = waypoints.map(wp => ({
    ...wp,
    ...kmToPoint(wp.km, svgW, svgH),
    passed: progressKm >= wp.km,
  }));

  // Active segment label
  const activeSegment = useMemo(() => {
    if (allDone) return "Arrived";
    for (let i = waypoints.length - 1; i >= 0; i--) {
      if (progressKm >= waypoints[i].km) {
        if (i < waypoints.length - 1) {
          return `${waypoints[i].short} → ${waypoints[i + 1].short}`;
        }
        return waypoints[i].name;
      }
    }
    return waypoints[0].name;
  }, [progressKm, allDone]);

  return (
    <div style={{
      fontFamily: T.sans,
      padding: "0 24px 32px",
      opacity: loading ? 0.4 : 1,
      transition: "opacity 0.4s ease",
    }}>
      <style>{`
        @keyframes carPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dash { to { stroke-dashoffset: 0; } }
        @keyframes softGlow { 0%,100% { opacity:0.4 } 50% { opacity:0.8 } }
      `}</style>

      {/* ── Hero Stats ── */}
      <div style={{
        display: "flex",
        alignItems: "stretch",
        gap: 12,
        marginBottom: 24,
        animation: "fadeUp .4s ease both",
      }}>
        {/* Progress ring */}
        <div style={{
          width: 88, height: 88, flexShrink: 0,
          position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="44" cy="44" r="38" fill="none"
              stroke={T.wash} strokeWidth="5" />
            <circle cx="44" cy="44" r="38" fill="none"
              stroke={allDone ? T.done : T.accent} strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 38}`}
              strokeDashoffset={`${2 * Math.PI * 38 * (1 - pct / 100)}`}
              style={{ transition: `stroke-dashoffset 0.8s ${T.ease}` }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontSize: 24, fontWeight: 700, color: allDone ? T.done : T.text,
              letterSpacing: "-0.04em", lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}>
              {pct}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 600, color: T.tertiary,
              letterSpacing: "0.08em", textTransform: "uppercase",
              marginTop: 2,
            }}>
              %
            </span>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{
          flex: 1,
          display: "flex", flexDirection: "column",
          justifyContent: "center",
          gap: 6,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{
              fontSize: 28, fontWeight: 300, color: T.text,
              letterSpacing: "-0.04em", lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}>
              {progressKm}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 500, color: T.tertiary,
              letterSpacing: "-0.01em",
            }}>
              of {TOTAL_KM} km
            </span>
          </div>

          <div style={{
            display: "flex", gap: 16,
          }}>
            <div>
              <span style={{ fontSize: 10, color: T.tertiary, letterSpacing: "0.04em", textTransform: "uppercase" as const, fontWeight: 600 }}>Left</span>
              <p style={{ fontSize: 15, fontWeight: 500, color: T.secondary, margin: 0, fontVariantNumeric: "tabular-nums", fontFamily: T.mono }}>
                {remaining} km
              </p>
            </div>
            <div style={{ width: 1, background: T.sunken }} />
            <div>
              <span style={{ fontSize: 10, color: T.tertiary, letterSpacing: "0.04em", textTransform: "uppercase" as const, fontWeight: 600 }}>Depart</span>
              <p style={{ fontSize: 15, fontWeight: 500, color: T.secondary, margin: 0, fontVariantNumeric: "tabular-nums", fontFamily: T.mono }}>
                {formatTime(effectiveStart)}
              </p>
            </div>
            {destWeather && (
              <>
                <div style={{ width: 1, background: T.sunken }} />
                <div>
                  <span style={{ fontSize: 10, color: T.tertiary, letterSpacing: "0.04em", textTransform: "uppercase" as const, fontWeight: 600 }}>Dest</span>
                  <p style={{ fontSize: 15, fontWeight: 500, color: T.secondary, margin: 0 }}>
                    {weatherIcon(destWeather.code)} {destWeather.temp}°
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Active segment pill ── */}
      {!allDone && (
        <div style={{
          display: "inline-flex",
          alignItems: "center", gap: 8,
          padding: "8px 16px",
          borderRadius: 999,
          background: T.accentSoft,
          marginBottom: 20,
          animation: "fadeUp .4s ease .05s both",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: T.accent,
            animation: "softGlow 2s ease-in-out infinite",
          }} />
          <span style={{
            fontSize: 13, fontWeight: 600, color: T.accent,
            letterSpacing: "-0.01em",
          }}>
            {activeSegment}
          </span>
        </div>
      )}
      {allDone && (
        <div style={{
          display: "inline-flex",
          alignItems: "center", gap: 8,
          padding: "8px 16px",
          borderRadius: 999,
          background: T.doneSoft,
          marginBottom: 20,
          animation: "fadeUp .4s ease .05s both",
        }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={T.done} strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.done }}>
            Journey complete
          </span>
        </div>
      )}

      {/* ── SVG Route Map ── */}
      <div style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 20,
        padding: "20px 8px 16px",
        boxShadow: "0 2px 12px rgba(24,21,17,0.03)",
        overflow: "hidden",
        animation: "fadeUp .5s ease .1s both",
      }}>
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          style={{ display: "block" }}
        >
          {/* Background grid dots */}
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.5" fill={T.sunken} />
            </pattern>
          </defs>
          <rect width={svgW} height={svgH} fill="url(#grid)" rx="16" />

          {/* Route: full trail (faint) */}
          <path d={fullPath} fill="none" stroke={T.sunken} strokeWidth="3" strokeLinecap="round" />

          {/* Route: completed portion */}
          {progressKm > 0 && (() => {
            const completedPath: string[] = [];
            const steps = 80;
            for (let i = 0; i <= steps; i++) {
              const km = (i / steps) * TOTAL_KM;
              if (km > progressKm) break;
              const { x, y } = kmToPoint(km, svgW, svgH);
              completedPath.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
            }
            return (
              <path
                d={completedPath.join(" ")}
                fill="none"
                stroke={allDone ? T.done : T.accent}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            );
          })()}

          {/* Highway labels along route */}
          {[
            { km: 100, label: "NH 44", angle: -25 },
            { km: 280, label: "NH 44", angle: 15 },
            { km: 500, label: "NH 87", angle: -5 },
          ].map((hw, i) => {
            const p = kmToPoint(hw.km, svgW, svgH);
            return (
              <text
                key={i}
                x={p.x + 14} y={p.y - 10}
                fontSize="8" fontFamily={T.mono} fontWeight="600"
                fill={T.tertiary} opacity={0.5}
                transform={`rotate(${hw.angle}, ${p.x + 14}, ${p.y - 10})`}
              >
                {hw.label}
              </text>
            );
          })}

          {/* Waypoint markers */}
          {wpPositions.map((wp, i) => {
            const isOrigin = wp.type === "origin";
            const isDest = wp.type === "dest";
            const isSmall = wp.type === "stop";
            const dotR = isDest ? 8 : isOrigin ? 7 : isSmall ? 4 : 5.5;

            return (
              <g key={wp.name}>
                {/* Glow ring for destination */}
                {isDest && !allDone && (
                  <circle cx={wp.x} cy={wp.y} r={14}
                    fill="none" stroke={T.accent} strokeWidth="1"
                    opacity="0.2"
                    style={{ animation: "softGlow 2.5s ease-in-out infinite" }}
                  />
                )}
                {isDest && allDone && (
                  <circle cx={wp.x} cy={wp.y} r={14}
                    fill="none" stroke={T.done} strokeWidth="1.5"
                    opacity="0.35"
                  />
                )}

                {/* Dot */}
                <circle cx={wp.x} cy={wp.y} r={dotR}
                  fill={wp.passed ? (allDone ? T.done : T.accent) : T.surface}
                  stroke={wp.passed ? (allDone ? T.done : T.accent) : T.sunken}
                  strokeWidth={isSmall ? 1.5 : 2}
                />

                {/* Checkmark for passed major waypoints */}
                {wp.passed && !isSmall && (
                  <path
                    d={`M${wp.x - 3},${wp.y} L${wp.x - 1},${wp.y + 2.5} L${wp.x + 3.5},${wp.y - 2.5}`}
                    fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  />
                )}

                {/* Label */}
                <text
                  x={wp.x + (i % 2 === 0 ? -dotR - 6 : dotR + 6)}
                  y={wp.y + (isDest ? -14 : 1)}
                  textAnchor={i % 2 === 0 ? "end" : "start"}
                  fontSize={isDest || isOrigin ? "12" : isSmall ? "9" : "10.5"}
                  fontFamily={T.sans}
                  fontWeight={isDest || isOrigin ? "700" : "500"}
                  fill={wp.passed ? T.text : T.tertiary}
                  dominantBaseline="central"
                >
                  {wp.name}
                </text>

                {/* Distance label below for major stops */}
                {!isSmall && (
                  <text
                    x={wp.x + (i % 2 === 0 ? -dotR - 6 : dotR + 6)}
                    y={wp.y + (isDest ? -2 : 14)}
                    textAnchor={i % 2 === 0 ? "end" : "start"}
                    fontSize="8.5"
                    fontFamily={T.mono}
                    fontWeight="500"
                    fill={T.tertiary}
                    dominantBaseline="central"
                  >
                    {wp.km === 0 ? "Start" : `${wp.km} km`}
                  </text>
                )}
              </g>
            );
          })}

          {/* Car indicator */}
          {!allDone && (
            <g style={{ animation: "carPulse 3s ease-in-out infinite" }}>
              {/* Shadow */}
              <ellipse cx={carPos.x} cy={carPos.y + 2} rx="10" ry="4"
                fill="rgba(24,21,17,0.08)"
              />
              {/* Car body */}
              <circle cx={carPos.x} cy={carPos.y} r="11"
                fill={T.accent}
              />
              <circle cx={carPos.x} cy={carPos.y} r="9"
                fill={T.surface}
              />
              {/* Car icon */}
              <g transform={`translate(${carPos.x - 6}, ${carPos.y - 5})`}>
                <path d="M2 6.5 L3.5 3 Q4 2, 5 2 L7 2 Q8 2, 8.5 3 L10 6.5 Q10.5 7.5, 10 8 L2 8 Q1.5 7.5, 2 6.5Z"
                  fill={T.accent} />
                <rect x="2.5" y="8" width="7" height="2" rx="0.5" fill={T.accent} />
                <circle cx="3.8" cy="10.2" r="1" fill={T.text} />
                <circle cx="8.2" cy="10.2" r="1" fill={T.text} />
              </g>
            </g>
          )}
          {allDone && (
            <g>
              <circle cx={carPos.x} cy={carPos.y} r="11" fill={T.done} />
              <path
                d={`M${carPos.x - 4},${carPos.y} L${carPos.x - 1},${carPos.y + 3.5} L${carPos.x + 5},${carPos.y - 3.5}`}
                fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              />
            </g>
          )}

          {/* Pamban Bridge indicator near destination */}
          {(() => {
            const bridgeKm = 530;
            const p1 = kmToPoint(bridgeKm - 12, svgW, svgH);
            const p2 = kmToPoint(bridgeKm + 12, svgW, svgH);
            return (
              <g opacity="0.5">
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={T.tertiary} strokeWidth="1" strokeDasharray="3,2" />
                <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 8}
                  fontSize="7.5" fontFamily={T.mono} fontWeight="500"
                  fill={T.tertiary} textAnchor="middle"
                >
                  Pamban Bridge
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* ── Leg Breakdown ── */}
      <div style={{
        marginTop: 20,
        animation: "fadeUp .5s ease .2s both",
      }}>
        {[
          { from: "Bengaluru", to: "Salem", km: 200, highway: "NH 44", idx: 1 },
          { from: "Salem", to: "Madurai", km: 160, highway: "NH 44 → NH 87", idx: 3 },
          { from: "Madurai", to: "Rameshwaram", km: 192, highway: "NH 87", idx: 6 },
        ].map((leg, i) => {
          const done = !!completed[leg.idx];
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center",
              padding: "14px 0",
              borderBottom: i < 2 ? `1px solid ${T.border}` : "none",
              gap: 14,
            }}>
              {/* Leg dot */}
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: done ? T.doneSoft : T.wash,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {done ? (
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={T.done} strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                ) : (
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={T.tertiary} strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>
                  </svg>
                )}
              </div>

              {/* Leg info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 14, fontWeight: 600,
                  color: done ? T.tertiary : T.text,
                  textDecoration: done ? "line-through" : "none",
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}>
                  {leg.from} → {leg.to}
                </p>
                <p style={{
                  fontSize: 11, color: T.tertiary, margin: "3px 0 0",
                  fontFamily: T.mono, fontVariantNumeric: "tabular-nums",
                }}>
                  {leg.highway}
                </p>
              </div>

              {/* Distance */}
              <span style={{
                fontSize: 13, fontWeight: 500,
                color: done ? T.done : T.secondary,
                fontFamily: T.mono,
                fontVariantNumeric: "tabular-nums",
                flexShrink: 0,
              }}>
                {leg.km} km
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
