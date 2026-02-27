"use client";

import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { BilingualText } from "@/lib/types";

interface CarryChecklistProps {
  items: BilingualText[];
}

export function CarryChecklist({ items }: CarryChecklistProps) {
  const { t } = useLanguage();
  const [ck, setCk] = useState<Record<number, boolean>>({});

  if (items.length === 0) return null;

  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--yatra-border)",
      borderRadius: "16px",
      padding: "14px 16px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        marginBottom: "10px",
      }}>
        <span style={{ color: "var(--yatra-text-faint)" }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </span>
        <span style={{
          fontSize: "10.5px", fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--yatra-text-faint)",
        }}>
          Carry
        </span>
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => setCk((p) => ({ ...p, [i]: !p[i] }))}
          style={{
            display: "flex", alignItems: "center", gap: "11px",
            padding: "7px 0", cursor: "pointer", userSelect: "none",
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: "7px", flexShrink: 0,
            border: ck[i] ? "none" : "1.5px solid var(--yatra-text-faint)",
            background: ck[i] ? "var(--yatra-green)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .2s ease",
            animation: ck[i] ? "checkBounce .3s ease" : "none",
          }}>
            {ck[i] && (
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
          <span style={{
            fontSize: "14px",
            color: ck[i] ? "var(--yatra-text-faint)" : "var(--yatra-text)",
            textDecoration: ck[i] ? "line-through" : "none",
            transition: "all .2s",
          }}>
            {t(item)}
          </span>
        </div>
      ))}
    </div>
  );
}
