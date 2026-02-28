"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { TripDataProvider, useTripData } from "@/hooks/use-trip-data";

/* ─── Design Tokens ─── */
const T = {
  bg:        "#FAF9F6",
  text:      "#1D1D1F",
  secondary: "#6E6E73",
  tertiary:  "#AEAEB2",
  accent:    "#9B6B2C",
  accentSoft:"rgba(155,107,44,0.07)",
  done:      "#34C759",
  doneSoft:  "rgba(52,199,89,0.08)",
  sans:      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Instrument Sans', system-ui, sans-serif",
  ease:      "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
};

/* ─── Icons ─── */
const NavIcons = {
  pin: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>,
  list: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"/></svg>,
  info: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/></svg>,
  car: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg>,
};

const tabs = [
  { id: "now",   href: "/now",   label: "Now",   icon: NavIcons.pin },
  { id: "plan",  href: "/plan",  label: "Plan",  icon: NavIcons.list },
  { id: "info",  href: "/info",  label: "Info",  icon: NavIcons.info },
  { id: "route", href: "/route", label: "Route", icon: NavIcons.car },
] as const;

function TabsLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, toggleLang } = useLanguage();
  const { allDone, idx, cards, lightbox, setLightbox } = useTripData();

  const activeTab = tabs.find(t => pathname === t.href)?.id ?? "now";
  const title = activeTab === "now" ? "Now" : activeTab === "plan" ? "Plan" : activeTab === "info" ? "Info" : "Route";

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: T.bg, fontFamily: T.sans }}>
      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(250,249,246,0.72)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        padding: "16px 24px 14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h1 style={{
            fontSize: 34, fontWeight: 700, color: T.text,
            letterSpacing: "-0.022em", lineHeight: 1.08,
            margin: 0, fontFamily: T.sans,
          }}>
            {title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button
              onClick={toggleLang}
              aria-label="Toggle language"
              style={{
                width: 34, height: 34, borderRadius: 17,
                border: "none", background: "rgba(120,120,128,0.08)",
                color: T.secondary, fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: T.sans,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: `background .2s ${T.ease}`,
              }}
            >
              {lang === "en" ? "हि" : "EN"}
            </button>
            {activeTab === "route" ? (
              <div style={{
                fontSize: 12, fontWeight: 500, color: T.accent,
                fontVariantNumeric: "tabular-nums",
                padding: "6px 12px", borderRadius: 20,
                background: T.accentSoft,
                letterSpacing: "-0.01em",
              }}>
                552 km
              </div>
            ) : (
              <div style={{
                fontSize: 12, fontWeight: 500, fontVariantNumeric: "tabular-nums",
                color: allDone ? T.done : T.secondary,
                padding: "6px 12px", borderRadius: 20,
                background: allDone ? T.doneSoft : "rgba(120,120,128,0.08)",
                letterSpacing: "-0.01em",
              }}>
                {allDone ? "Done" : `${idx + 1} of ${cards.length}`}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <div style={{ paddingBottom: 100 }}>
        {children}
      </div>

      {/* Lightbox */}
      {lightbox && <ImageLightbox src={lightbox.src} label={lightbox.label} onClose={() => setLightbox(null)} />}

      {/* Bottom nav */}
      <nav style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, zIndex: 20,
        background: "rgba(250,249,246,0.72)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderTop: "0.5px solid rgba(60,60,67,0.1)",
        display: "flex", justifyContent: "space-around",
        paddingTop: 6,
        paddingBottom: "max(6px, env(safe-area-inset-bottom, 0px))",
      }}>
        {tabs.map(t => {
          const active = activeTab === t.id;
          return (
            <Link
              key={t.id}
              href={t.href}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                padding: "6px 4px", background: "transparent",
                minWidth: 0,
                color: active ? T.accent : "rgba(142,142,147,0.8)",
                transition: `color .15s ease`,
                textDecoration: "none",
              }}
            >
              <div style={{ opacity: active ? 1 : 0.55 }}>{t.icon}</div>
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: "0.01em" }}>{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function ImageLightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
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
      <style>{`
        @keyframes lbFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes lbScaleIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
      `}</style>
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

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <TripDataProvider>
      <TabsLayoutInner>{children}</TabsLayoutInner>
    </TripDataProvider>
  );
}
