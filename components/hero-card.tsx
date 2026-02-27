"use client";

import { CardArt } from "./card-art";
import { getVisualIdentity } from "@/lib/visual-identity";

interface HeroCardProps {
  slug: string;
  phase: number | null;
  title: string;
  sub: string;
}

export function HeroCard({ slug, phase, title, sub }: HeroCardProps) {
  const v = getVisualIdentity(slug);

  return (
    <div style={{
      position: "relative",
      borderRadius: "24px",
      overflow: "hidden",
      aspectRatio: "5/3",
      boxShadow: "var(--yatra-shadow-3)",
      background: v.layers[0],
    }}>
      {/* Radial glow layer */}
      {v.layers[1] && (
        <div style={{ position: "absolute", inset: 0, background: v.layers[1] }} />
      )}

      {/* SVG art */}
      <CardArt type={v.art} />

      {/* Shimmer sweep */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
          background: `linear-gradient(90deg, transparent 0%, ${v.shimmer} 50%, transparent 100%)`,
          animation: "shimmer 3.5s ease-in-out infinite",
        }} />
      </div>

      {/* Scrim */}
      <div style={{
        position: "absolute", inset: 0,
        background: "var(--yatra-overlay)",
      }} />

      {/* Phase badge */}
      {phase && (
        <div style={{
          position: "absolute", top: "16px", left: "16px",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white", fontSize: "11px", fontWeight: 600,
          letterSpacing: "0.06em", padding: "5px 14px", borderRadius: "100px",
        }}>
          Phase {phase} of 3
        </div>
      )}

      {/* Title area */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 22px" }}>
        <h1 style={{
          fontFamily: "var(--font-serif), Georgia, serif",
          fontSize: "26px", fontWeight: 600, color: "white",
          lineHeight: 1.15, letterSpacing: "-0.01em",
          textShadow: "0 2px 12px rgba(0,0,0,0.3)", marginBottom: "6px",
        }}>
          {title}
        </h1>
        <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>
          {sub}
        </p>
      </div>
    </div>
  );
}
