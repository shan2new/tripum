"use client";

import { useState } from "react";
import { useRouteProgress } from "@/hooks/use-route-progress";

/* ─── Design Tokens (aligned with app T) ─── */
const t = {
  bg: "#FAFAF8",
  surface: "#FFFFFF",
  border: "rgba(0,0,0,0.06)",
  borderLight: "rgba(0,0,0,0.04)",
  text: "#1A1A1A",
  sub: "#86847E",
  muted: "#86847E",
  faint: "#B5B3AD",
  accent: "#C17F24",
  accentBg: "rgba(193,127,36,0.08)",
  accentBorder: "rgba(193,127,36,0.15)",
  critical: "#7A1B1B",
};

const ff = {
  sans: "'Instrument Sans', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
  mono: "'DM Mono', 'SF Mono', monospace",
};

/* ─── Static Data ─── */
const d = {
  vehicle: "MG Hector CVT 1.5T · 19″",
  mileage: "~11 km/l highway (loaded, 4 pax, AC)",
  route: "NH 44 → NH 87 via Salem & Madurai",
  totalDistance: "552 km",
  totalTime: "~10 hrs",
  fuelEstimate: "~50 L one-way",
};

const phases = [
  { type: "stop", fn: "Chiku Drop-off", name: "Pet boarding / sitter", time: "5:30 AM", note: "Share vet contact · Print feeding schedule · Pack 3 days food", img: "/images/home.jpg" },
  { type: "drive", from: "Bengaluru", to: "Salem", distance: "200 km", time: "6:00 – 9:00 AM", highway: "NH 44" },
  { type: "stop", fn: "Breakfast", name: "A2B, Thoppur · Salem", time: "9:00 – 10:00 AM", note: "SUV parking · Clean restrooms", img: "/images/a2b_salem.jpeg", maps: "https://www.google.com/maps/search/?api=1&query=Adyar+Ananda+Bhavan+-+A2B&query_place_id=ChIJk74wW78arDsRNzIOQHUwMQc" },
  { type: "drive", from: "Salem", to: "Madurai", distance: "160 km", time: "10:00 AM – 1:00 PM", highway: "NH 44 → NH 87" },
  { type: "stop", fn: "Lunch", name: "Gowri Krishna Veg · Madurai Bypass", time: "1:00 – 2:00 PM", note: "On bypass — avoids city traffic", img: "/images/gowri_krishna_veg.jpg", maps: "https://www.google.com/maps/search/?api=1&query=Gowri+Krishna-+Veg+Restaurant&query_place_id=ChIJ0e2cBp3PADsRGgSJVWsxwIg" },
  { type: "stop", fn: "Major Refuel", name: "IndianOil SWAGAT COCO · Madurai", time: "~1:45 PM", note: "XP95 available · Fill 100% — sparse stations ahead", critical: true, maps: "https://www.google.com/maps/search/?api=1&query=IndianOil+-+SWAGAT&query_place_id=ChIJ-2HjLkXBADsRhWXOEE6_scs" },
  { type: "drive", from: "Madurai", to: "Rameshwaram", distance: "192 km", time: "2:00 – 5:30 PM", highway: "NH 87" },
  { type: "stop", fn: "Tea", name: "Chaya Kada · Ramanathapuram", time: "~4:30 PM", note: "20 min before final stretch", img: "/images/chaya_kada.jpeg", maps: "https://www.google.com/maps/search/?api=1&query=CHAYA+KADA&query_place_id=ChIJ2W0mIAebATsR1d6E6dikzso" },
  { type: "arrival", name: "Rameshwaram", time: "~6:00 PM", note: "Via Pamban Bridge · Temple closes 1 – 3:30 PM — evening darshan available", img: "/images/temple.jpg", maps: "https://www.google.com/maps/search/?api=1&query=Pamban+Bridge&query_place_id=ChIJNRza64bvATsRL3U2O5svnYg" },
] as const;

type Phase = (typeof phases)[number];

/* ─── Page Component ─── */
export default function CarRoutePage() {
  const { completed, toggle, loading } = useRouteProgress("rameshwaram-car-route");
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes lbFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lbScaleIn {
          from { opacity: 0; transform: scale(0.88); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{
        fontFamily: ff.sans,
        background: t.bg,
        minHeight: "100vh",
        maxWidth: 430,
        margin: "0 auto",
      }}>
        {/* Vehicle grid */}
        <div style={{ padding: "20px 20px 0", animation: "fadeUp 0.3s ease both" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <MetaCell label="Vehicle" value={d.vehicle} />
            <MetaCell label="Mileage" value={d.mileage} />
            <MetaCell label="Route" value={d.route} />
            <MetaCell label="Fuel est." value={d.fuelEstimate} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ padding: "24px 20px 0" }}>
          <div style={{ height: 1, background: t.border }} />
        </div>

        {/* Timeline */}
        <div style={{
          padding: "20px 20px 48px",
          animation: "fadeUp 0.3s ease 0.08s both",
          opacity: loading ? 0.5 : 1,
          transition: "opacity 0.3s ease",
        }}>
          <div style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 20,
          }}>
            <span style={{
              fontSize: 9.5,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: t.faint,
            }}>Timeline</span>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: Object.values(completed).filter(Boolean).length === phases.length ? t.accent : t.faint,
              fontFamily: ff.mono,
              transition: "color 0.2s ease",
            }}>{Object.values(completed).filter(Boolean).length}/{phases.length}</span>
          </div>

          <div>
            {phases.map((p, i) => (
              <TimelineRow key={i} phase={p} isLast={i === phases.length - 1} index={i} done={!!completed[i]} onToggle={() => toggle(i)} totalPhases={phases.length} onImageTap={(src, label) => setLightbox({ src, label })} />
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox src={lightbox.src} label={lightbox.label} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

/* ─── MetaCell ─── */
function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: t.surface,
      borderRadius: 16,
      padding: "14px 16px",
      border: `1px solid ${t.border}`,
    }}>
      <div style={{
        fontSize: 9,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: t.accent,
        marginBottom: 5,
      }}>{label}</div>
      <div style={{
        fontSize: 12.5,
        fontWeight: 500,
        color: t.text,
        lineHeight: 1.4,
      }}>{value}</div>
    </div>
  );
}

/* ─── TimelineRow ─── */
function TimelineRow({ phase: p, isLast, index, done, onToggle, totalPhases, onImageTap }: {
  phase: Phase;
  isLast: boolean;
  index: number;
  done: boolean;
  onToggle: () => void;
  totalPhases: number;
  onImageTap: (src: string, label: string) => void;
}) {
  const isDrive = p.type === "drive";
  const isArrival = p.type === "arrival";
  const isStop = p.type === "stop";

  const dotColor = done
    ? t.faint
    : isArrival
      ? t.accent
      : isStop
        ? ("critical" in p && p.critical ? t.critical : t.text)
        : t.faint;

  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        gap: 20,
        minHeight: isDrive ? 84 : isArrival ? 84 : 80,
        animation: `fadeUp 0.3s ease ${0.12 + index * 0.035}s both`,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        opacity: done ? 0.4 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      {/* Rail */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 14,
        flexShrink: 0,
        paddingTop: isArrival ? 5 : isDrive ? 9 : 7,
      }}>
        {/* Dot / Check */}
        <div style={{
          width: isArrival ? 12 : isStop ? 8 : 5,
          height: isArrival ? 12 : isStop ? 8 : 5,
          borderRadius: "50%",
          background: done ? "none" : dotColor,
          border: done ? `2px solid ${t.faint}` : "none",
          flexShrink: 0,
          boxShadow: isArrival && !done ? `0 0 0 4px ${t.accentBg}` : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          position: "relative",
        }}>
          {done && (
            <svg width={isArrival ? 8 : isStop ? 6 : 4} height={isArrival ? 8 : isStop ? 6 : 4} viewBox="0 0 10 10" fill="none">
              <path d="M2 5.5L4 7.5L8 3" stroke={t.faint} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        {!isLast && (
          <div style={{
            width: 1.5,
            flex: 1,
            marginTop: 6,
            background: isDrive
              ? `repeating-linear-gradient(to bottom, ${done ? t.borderLight : t.faint} 0px, ${done ? t.borderLight : t.faint} 3px, transparent 3px, transparent 7px)`
              : done ? t.borderLight : t.border,
            transition: "background 0.2s ease",
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        paddingBottom: isLast ? 0 : 32,
        minWidth: 0,
      }}>
        {isDrive && "from" in p && (
          <>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 15,
                fontWeight: 600,
                color: t.text,
                letterSpacing: "-0.01em",
                textDecoration: done ? "line-through" : "none",
                textDecorationColor: t.faint,
              }}>
                {p.from} → {p.to}
              </span>
              <span style={{ fontSize: 11.5, color: t.faint, fontFamily: ff.mono }}>{p.distance}</span>
              <span style={{ fontSize: 11.5, color: t.faint, fontFamily: ff.mono }}>{p.highway}</span>
            </div>
            <div style={{ fontSize: 12.5, color: t.muted, fontFamily: ff.mono, marginTop: 8 }}>
              {p.time}
            </div>
          </>
        )}

        {isStop && "fn" in p && (
          <div style={{ display: "flex", gap: 12 }}>
            {"img" in p && p.img && (
              <div
                onClick={(e) => { e.stopPropagation(); onImageTap(p.img, p.name); }}
                style={{ width: 40, height: 40, borderRadius: 11, overflow: "hidden", flexShrink: 0, marginTop: 2, cursor: "pointer" }}
              >
                <img src={p.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: done ? t.faint : ("critical" in p && p.critical ? t.critical : t.accent),
                }}>{p.fn}</span>
                <span style={{ fontSize: 12, color: t.faint, fontFamily: ff.mono }}>{p.time}</span>
              </div>
              <div style={{
                fontSize: 15,
                fontWeight: 500,
                color: t.text,
                marginTop: 6,
                letterSpacing: "-0.01em",
                textDecoration: done ? "line-through" : "none",
                textDecorationColor: t.faint,
              }}>{p.name}</div>
              <div style={{
                fontSize: 12.5,
                color: t.muted,
                marginTop: 8,
                lineHeight: 1.65,
              }}>{p.note}</div>
              {"maps" in p && p.maps && <MapPill url={p.maps} />}
            </div>
          </div>
        )}

        {isArrival && (
          <div style={{ display: "flex", gap: 12 }}>
            {"img" in p && p.img && (
              <div
                onClick={(e) => { e.stopPropagation(); onImageTap(p.img, p.name); }}
                style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", flexShrink: 0, marginTop: 2, cursor: "pointer" }}
              >
                <img src={p.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{
                  fontSize: 19,
                  fontWeight: 700,
                  color: done ? t.faint : t.accent,
                  letterSpacing: "-0.025em",
                  textDecoration: done ? "line-through" : "none",
                  textDecorationColor: t.faint,
                }}>{p.name}</span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: done ? t.faint : t.accent,
                  fontFamily: ff.mono,
                }}>{p.time}</span>
              </div>
              <div style={{
                fontSize: 13,
                color: t.muted,
                marginTop: 8,
                lineHeight: 1.65,
              }}>{p.note}</div>
              {"maps" in p && p.maps && <MapPill url={p.maps} />}
            </div>
          </div>
        )}
      </div>
    </div>
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
        gap: 6,
        marginTop: 10,
        padding: "7px 14px",
        borderRadius: 100,
        background: t.accentBg,
        border: `1px solid ${t.accentBorder}`,
        color: t.accent,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: ff.sans,
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
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "lbFadeIn 0.2s ease both",
        cursor: "pointer",
        padding: 24,
      }}
    >
      {/* Close hint */}
      <div style={{
        position: "absolute",
        top: 16,
        right: 20,
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 12M12 2L2 12" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>

      {/* Image */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 380,
          width: "100%",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          animation: "lbScaleIn 0.25s ease both",
        }}
      >
        <img
          src={src}
          alt={label}
          style={{
            width: "100%",
            display: "block",
            maxHeight: "70vh",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Label */}
      <div style={{
        marginTop: 16,
        fontSize: 14,
        fontWeight: 600,
        color: "rgba(255,255,255,0.8)",
        fontFamily: ff.sans,
        letterSpacing: "-0.01em",
        textAlign: "center",
        animation: "lbScaleIn 0.25s ease 0.05s both",
      }}>{label}</div>
    </div>
  );
}
