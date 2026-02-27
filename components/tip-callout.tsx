"use client";

import { useLanguage } from "@/hooks/use-language";
import { BilingualText } from "@/lib/types";

interface TipCalloutProps {
  tip: BilingualText;
}

export function TipCallout({ tip }: TipCalloutProps) {
  const { t } = useLanguage();

  return (
    <div style={{
      background: "var(--yatra-accent-pale)",
      border: "1px solid var(--yatra-accent-border)",
      borderRadius: "16px",
      padding: "14px 16px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        marginBottom: "5px",
      }}>
        <span style={{ color: "var(--yatra-accent)" }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </span>
        <span style={{
          fontSize: "10.5px", fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--yatra-accent)",
        }}>
          Insider Tip
        </span>
      </div>
      <p style={{
        fontSize: "13.5px", lineHeight: 1.6,
        color: "#6B5B1B",
      }}>
        {t(tip)}
      </p>
    </div>
  );
}
