"use client";

interface ConfettiProps {
  active: boolean;
}

const colors = ["#16A34A", "#C2830A", "#E2A832", "#22C55E", "#F59E0B", "#FBBF24"];

export function Confetti({ active }: ConfettiProps) {
  if (!active) return null;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10, overflow: "hidden" }}>
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * 360;
        const dist = 50 + Math.random() * 60;
        const size = 4 + Math.random() * 5;
        const color = colors[i % colors.length];
        const delay = Math.random() * 0.1;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: "50%", top: "50%", width: size, height: size,
              borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0",
              background: color,
              "--tx": `${Math.cos(angle * Math.PI / 180) * dist}px`,
              "--ty": `${Math.sin(angle * Math.PI / 180) * dist}px`,
              "--rot": `${Math.random() * 720}deg`,
              animation: `confettiBurst 0.7s ${delay}s ease-out both`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}
