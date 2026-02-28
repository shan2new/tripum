"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";
import { NAV } from "@/lib/strings";
import type { BilingualText } from "@/lib/types";

const tabs = [
  { href: "/now", label: NAV.now, id: "now" },
  { href: "/plan", label: NAV.plan, id: "plan" },
  { href: "/info", label: NAV.info, id: "info" },
] as const;

function NavIcon({ type, active }: { type: string; active: boolean }) {
  const stroke = active ? "var(--yatra-accent)" : "var(--yatra-text-faint)";
  const sw = "1.5";

  if (type === "now") return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={sw}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );

  if (type === "plan") return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={sw}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
    </svg>
  );

  // info
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={sw}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const activeIdx = tabs.findIndex((tab) => pathname === tab.href);

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, zIndex: 20,
      background: "rgba(248,246,241,0.8)",
      backdropFilter: "blur(24px) saturate(180%)",
      WebkitBackdropFilter: "blur(24px) saturate(180%)",
      borderTop: "1px solid var(--yatra-border)",
      display: "flex", justifyContent: "space-around",
      padding: "6px 0 max(10px, env(safe-area-inset-bottom))",
    }}>
      {/* Sliding pill indicator */}
      <div style={{
        position: "absolute",
        top: "6px",
        left: `${((activeIdx >= 0 ? activeIdx : 0) / tabs.length) * 100 + (100 / tabs.length / 2) - 15}%`,
        width: "30%",
        height: "calc(100% - 6px - max(10px, env(safe-area-inset-bottom)))",
        background: "var(--yatra-accent-pale)",
        borderRadius: "12px",
        transition: "left .35s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 0,
      }} />

      {tabs.map(({ href, label, id }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "2px",
              padding: "8px 24px",
              border: "none", background: "transparent",
              cursor: "pointer",
              color: isActive ? "var(--yatra-accent)" : "var(--yatra-text-faint)",
              transition: "color .2s",
              position: "relative", zIndex: 1,
              textDecoration: "none",
            }}
          >
            <div style={{
              transition: "transform .15s",
              transform: isActive ? "scale(1.1) translateY(1px)" : "scale(1)",
            }}>
              <NavIcon type={id} active={isActive} />
            </div>
            <span style={{
              fontSize: "10px",
              fontWeight: isActive ? 700 : 500,
              letterSpacing: "0.03em",
            }}>
              {t(label as BilingualText)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
