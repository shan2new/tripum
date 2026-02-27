"use client";

interface CardArtProps {
  type: string;
}

export function CardArt({ type }: CardArtProps) {
  const base: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    opacity: 0.12,
    pointerEvents: "none",
    overflow: "hidden",
  };
  const w = 280, cx = 140, cy = 140;

  if (type === "mandala") return (
    <div style={base}>
      <svg width={w} height={w} viewBox={`0 0 ${w} ${w}`} fill="none" style={{ position: "absolute", right: "-30px", top: "-20px", transform: "rotate(12deg)" }}>
        {[120, 90, 60, 30].map(r => <circle key={r} cx={cx} cy={cy} r={r} stroke="white" strokeWidth="0.5" />)}
        {[0, 30, 60, 90, 120, 150].map(a => <line key={a} x1={cx} y1="20" x2={cx} y2="260" stroke="white" strokeWidth="0.5" transform={`rotate(${a} ${cx} ${cy})`} />)}
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => <circle key={a} cx={cx + 80 * Math.cos(a * Math.PI / 180)} cy={cy + 80 * Math.sin(a * Math.PI / 180)} r="6" stroke="white" strokeWidth="0.5" />)}
      </svg>
    </div>
  );

  if (type === "gopuram") return (
    <div style={base}>
      <svg width="200" height="260" viewBox="0 0 200 260" fill="none" style={{ position: "absolute", right: "-10px", bottom: "-20px" }}>
        <rect x="60" y="40" width="80" height="220" rx="2" stroke="white" strokeWidth="0.5" />
        <rect x="70" y="20" width="60" height="30" rx="2" stroke="white" strokeWidth="0.5" />
        <rect x="80" y="5" width="40" height="20" rx="8" stroke="white" strokeWidth="0.5" />
        {[70, 100, 130, 160, 190, 220].map(y => (
          <g key={y}>
            <rect x="68" y={y} width="64" height="18" rx="1" stroke="white" strokeWidth="0.3" />
            <line x1="100" y1={y} x2="100" y2={y + 18} stroke="white" strokeWidth="0.3" />
          </g>
        ))}
        <circle cx="100" cy="12" r="4" stroke="white" strokeWidth="0.5" />
      </svg>
    </div>
  );

  if (type === "waves") return (
    <div style={{ ...base, opacity: 0.1 }}>
      <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0 }}>
        <path d="M0 120 C40 100,80 140,120 120 S200 100,240 120 S320 140,360 120 S400 100,400 120 V200 H0Z" fill="white" opacity="0.4" />
        <path d="M0 140 C50 120,100 160,150 140 S250 120,300 140 S380 160,400 140 V200 H0Z" fill="white" opacity="0.3" />
        <path d="M0 160 C60 145,120 175,180 160 S280 145,340 160 S400 175,400 160 V200 H0Z" fill="white" opacity="0.2" />
      </svg>
    </div>
  );

  if (type === "crystal") return (
    <div style={base}>
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none" style={{ position: "absolute", right: "-20px", top: "-10px", transform: "rotate(-5deg)" }}>
        <polygon points="120,20 180,80 160,180 80,180 60,80" stroke="white" strokeWidth="0.5" />
        <polygon points="120,50 160,90 148,160 92,160 80,90" stroke="white" strokeWidth="0.4" />
        <line x1="120" y1="20" x2="120" y2="180" stroke="white" strokeWidth="0.3" />
        <line x1="60" y1="80" x2="180" y2="80" stroke="white" strokeWidth="0.3" />
        <line x1="80" y1="180" x2="180" y2="80" stroke="white" strokeWidth="0.2" />
        <line x1="160" y1="180" x2="60" y2="80" stroke="white" strokeWidth="0.2" />
      </svg>
    </div>
  );

  if (type === "wells") return (
    <div style={base}>
      <svg width="260" height="200" viewBox="0 0 260 200" fill="none" style={{ position: "absolute", right: "-20px", bottom: "-10px" }}>
        {[0, 1, 2, 3, 4, 5].map(i => {
          const x = 30 + i * 40, y = i % 2 === 0 ? 60 : 100;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="16" stroke="white" strokeWidth="0.5" />
              <circle cx={x} cy={y} r="8" stroke="white" strokeWidth="0.3" />
              <circle cx={x} cy={y} r="3" fill="white" opacity="0.3" />
            </g>
          );
        })}
        {[0, 1, 2, 3, 4].map(i => {
          const x = 50 + i * 40, y = i % 2 === 0 ? 140 : 170;
          return (
            <g key={i + 6}>
              <circle cx={x} cy={y} r="14" stroke="white" strokeWidth="0.4" />
              <circle cx={x} cy={y} r="6" stroke="white" strokeWidth="0.3" />
            </g>
          );
        })}
      </svg>
    </div>
  );

  if (type === "arch") return (
    <div style={base}>
      <svg width="200" height="220" viewBox="0 0 200 220" fill="none" style={{ position: "absolute", right: "0", bottom: "-10px" }}>
        <path d="M40 220 V100 A60 60 0 0 1 160 100 V220" stroke="white" strokeWidth="0.6" />
        <path d="M55 220 V110 A45 45 0 0 1 145 110 V220" stroke="white" strokeWidth="0.4" />
        <path d="M70 220 V120 A30 30 0 0 1 130 120 V220" stroke="white" strokeWidth="0.3" />
        <line x1="100" y1="60" x2="100" y2="220" stroke="white" strokeWidth="0.2" />
      </svg>
    </div>
  );

  if (type === "hill") return (
    <div style={{ ...base, opacity: 0.1 }}>
      <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0 }}>
        <path d="M0 180 Q100 60,200 120 Q280 80,360 140 Q390 150,400 160 V200 H0Z" fill="white" opacity="0.4" />
        <path d="M0 190 Q80 130,160 160 Q240 120,320 170 L400 180 V200 H0Z" fill="white" opacity="0.25" />
      </svg>
    </div>
  );

  if (type === "sun") return (
    <div style={base}>
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" style={{ position: "absolute", right: "10px", top: "10px" }}>
        <circle cx="100" cy="100" r="35" stroke="white" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="25" stroke="white" strokeWidth="0.3" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = i * 30 * Math.PI / 180;
          return <line key={i} x1={100 + 45 * Math.cos(a)} y1={100 + 45 * Math.sin(a)} x2={100 + 65 * Math.cos(a)} y2={100 + 65 * Math.sin(a)} stroke="white" strokeWidth="0.5" />;
        })}
      </svg>
    </div>
  );

  if (type === "horizon") return (
    <div style={{ ...base, opacity: 0.1 }}>
      <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0 }}>
        <line x1="0" y1="120" x2="400" y2="120" stroke="white" strokeWidth="0.6" />
        <line x1="0" y1="140" x2="400" y2="140" stroke="white" strokeWidth="0.3" />
        <line x1="0" y1="155" x2="400" y2="155" stroke="white" strokeWidth="0.2" />
        <circle cx="320" cy="60" r="30" stroke="white" strokeWidth="0.5" opacity="0.4" />
      </svg>
    </div>
  );

  if (type === "road") return (
    <div style={{ ...base, opacity: 0.08 }}>
      <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0 }}>
        <path d="M160 200 L190 60 L210 60 L240 200Z" fill="white" opacity="0.3" />
        {[170, 150, 130, 110, 90].map((y, i) => <rect key={i} x={200 - 3 - i * 0.5} y={y} width={6 + i} height={8 - i} rx="1" fill="white" opacity={0.4 - i * 0.05} />)}
      </svg>
    </div>
  );

  if (type === "geo") return (
    <div style={base}>
      <svg width="220" height="220" viewBox="0 0 220 220" fill="none" style={{ position: "absolute", right: "-10px", top: "-10px", transform: "rotate(8deg)" }}>
        <rect x="40" y="40" width="140" height="140" rx="4" stroke="white" strokeWidth="0.4" />
        <rect x="60" y="60" width="100" height="100" rx="3" stroke="white" strokeWidth="0.3" transform="rotate(15 110 110)" />
        <circle cx="110" cy="110" r="50" stroke="white" strokeWidth="0.4" />
        <circle cx="110" cy="110" r="30" stroke="white" strokeWidth="0.3" />
      </svg>
    </div>
  );

  // rest — minimal dots
  return (
    <div style={{ ...base, opacity: 0.04 }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {Array.from({ length: 64 }).map((_, i) => {
          const x = (i % 8) * 25 + 12, y = Math.floor(i / 8) * 25 + 12;
          return <circle key={i} cx={x} cy={y} r="1.2" fill="white" />;
        })}
      </svg>
    </div>
  );
}
