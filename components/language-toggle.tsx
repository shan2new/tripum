"use client";

import { useLanguage } from "@/hooks/use-language";

export function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  const options = [
    { label: "EN", isActive: lang === "en" },
    { label: "हि", isActive: lang === "hi" },
  ];

  return (
    <div style={{
      display: "flex",
      background: "var(--yatra-bg-wash)",
      borderRadius: "100px",
      padding: "3px",
      border: "1px solid var(--yatra-border)",
    }}>
      {options.map(({ label, isActive }) => (
        <button
          key={label}
          onClick={isActive ? undefined : toggleLang}
          style={{
            padding: "4px 12px",
            borderRadius: "100px",
            border: "none",
            background: isActive ? "var(--yatra-text)" : "transparent",
            color: isActive ? "white" : "var(--yatra-text-faint)",
            fontSize: "11.5px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all .15s",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
