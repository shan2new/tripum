export interface CardVisualIdentity {
  layers: string[];
  shimmer: string;
  art: string;
  ambient: string;
}

export const VIS: Record<string, CardVisualIdentity> = {
  "check-in": {
    layers: [
      "linear-gradient(135deg, #D4A574 0%, #C4956A 30%, #A67B5B 60%, #8B6547 100%)",
      "radial-gradient(circle at 70% 30%, rgba(255,220,180,0.3) 0%, transparent 60%)",
    ],
    shimmer: "rgba(255,235,200,0.25)",
    art: "arch",
    ambient: "rgba(212,165,116,0.04)",
  },
  "evening-recon": {
    layers: [
      "linear-gradient(135deg, #E8B86D 0%, #D4944A 35%, #BF7034 65%, #A85D2E 100%)",
      "radial-gradient(circle at 30% 60%, rgba(255,200,100,0.25) 0%, transparent 55%)",
    ],
    shimmer: "rgba(255,210,130,0.3)",
    art: "gopuram",
    ambient: "rgba(232,184,109,0.05)",
  },
  "spatika-lingam": {
    layers: [
      "linear-gradient(135deg, #B8C6DB 0%, #9BAEC4 30%, #7D96AD 60%, #6B839C 100%)",
      "radial-gradient(circle at 50% 40%, rgba(200,220,255,0.3) 0%, transparent 50%)",
    ],
    shimmer: "rgba(220,235,255,0.3)",
    art: "crystal",
    ambient: "rgba(184,198,219,0.04)",
  },
  "agni-theertham": {
    layers: [
      "linear-gradient(135deg, #F7C59F 0%, #EDA56A 25%, #D4845A 50%, #4A90A4 75%, #2E6B80 100%)",
      "radial-gradient(circle at 80% 20%, rgba(255,210,160,0.35) 0%, transparent 50%)",
    ],
    shimmer: "rgba(255,220,180,0.3)",
    art: "waves",
    ambient: "rgba(74,144,164,0.04)",
  },
  "22-theerthams": {
    layers: [
      "linear-gradient(135deg, #C9A96E 0%, #B8944D 30%, #9E7B3C 60%, #7D6130 100%)",
      "radial-gradient(circle at 40% 70%, rgba(210,185,120,0.25) 0%, transparent 55%)",
    ],
    shimmer: "rgba(230,210,150,0.25)",
    art: "wells",
    ambient: "rgba(201,169,110,0.04)",
  },
  "main-darshan": {
    layers: [
      "linear-gradient(135deg, #E2B857 0%, #D4A340 25%, #C08C2E 50%, #A87525 75%, #8B5E1A 100%)",
      "radial-gradient(circle at 50% 30%, rgba(255,220,100,0.35) 0%, transparent 45%)",
    ],
    shimmer: "rgba(255,230,130,0.3)",
    art: "mandala",
    ambient: "rgba(226,184,87,0.05)",
  },
  "rest-hotel": {
    layers: [
      "linear-gradient(135deg, #D5C4A1 0%, #C4B391 30%, #B0A080 60%, #9A8D72 100%)",
      "radial-gradient(circle at 60% 50%, rgba(230,215,180,0.2) 0%, transparent 55%)",
    ],
    shimmer: "rgba(240,230,200,0.2)",
    art: "rest",
    ambient: "rgba(213,196,161,0.03)",
  },
  "dhanushkodi": {
    layers: [
      "linear-gradient(135deg, #87CEEB 0%, #5BA3C9 25%, #4A90A4 50%, #C2956E 75%, #A67B5B 100%)",
      "radial-gradient(circle at 75% 25%, rgba(180,230,255,0.3) 0%, transparent 50%)",
    ],
    shimmer: "rgba(200,240,255,0.25)",
    art: "horizon",
    ambient: "rgba(135,206,235,0.04)",
  },
  "gandhamadana": {
    layers: [
      "linear-gradient(135deg, #8FBC8F 0%, #6B9E6B 30%, #5A8A5A 55%, #E8C87A 80%, #D4A860 100%)",
      "radial-gradient(circle at 50% 70%, rgba(150,210,150,0.2) 0%, transparent 55%)",
    ],
    shimmer: "rgba(180,230,160,0.2)",
    art: "hill",
    ambient: "rgba(143,188,143,0.04)",
  },
  "panchamukhi-hanuman": {
    layers: [
      "linear-gradient(135deg, #E8A87C 0%, #D4885A 30%, #C47040 60%, #A85830 100%)",
      "radial-gradient(circle at 35% 40%, rgba(255,195,140,0.3) 0%, transparent 55%)",
    ],
    shimmer: "rgba(255,200,150,0.25)",
    art: "mandala",
    ambient: "rgba(232,168,124,0.04)",
  },
  "buffer-morning": {
    layers: [
      "linear-gradient(135deg, #F5E6C8 0%, #EDD9B5 30%, #E0C99E 60%, #D4BA8A 100%)",
      "radial-gradient(circle at 60% 30%, rgba(255,240,200,0.3) 0%, transparent 50%)",
    ],
    shimmer: "rgba(255,245,220,0.3)",
    art: "sun",
    ambient: "rgba(245,230,200,0.04)",
  },
  "abdul-kalam": {
    layers: [
      "linear-gradient(135deg, #94A3B8 0%, #7B8FA4 30%, #64748B 60%, #475569 100%)",
      "radial-gradient(circle at 40% 50%, rgba(170,190,220,0.2) 0%, transparent 55%)",
    ],
    shimmer: "rgba(190,210,240,0.2)",
    art: "geo",
    ambient: "rgba(148,163,184,0.04)",
  },
  "checkout-drive": {
    layers: [
      "linear-gradient(135deg, #A8D8A8 0%, #7BC47B 25%, #5AAF5A 50%, #64748B 75%, #475569 100%)",
      "radial-gradient(circle at 70% 40%, rgba(160,230,160,0.25) 0%, transparent 55%)",
    ],
    shimmer: "rgba(180,240,180,0.2)",
    art: "road",
    ambient: "rgba(168,216,168,0.04)",
  },
};

export const PHASE_STEPS = [
  { en: "Sea Bath", hi: "समुद्र स्नान" },
  { en: "22 Wells", hi: "22 कुंड" },
  { en: "Ramalingum & Vishwalingum", hi: "रामलिंगम और विश्वलिंगम" },
];
export const DAY_MILESTONES = [0, 2, 10]; // card indices where new days start

export function getVisualIdentity(slug: string): CardVisualIdentity {
  return VIS[slug] ?? VIS["check-in"];
}

/** Extract phase number (1, 2, or 3) from phase string like "Phase 1 of 3" */
export function getPhaseNumber(phase: string | null): number | null {
  if (!phase) return null;
  const match = phase.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
