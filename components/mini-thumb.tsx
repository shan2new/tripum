"use client";

import { getVisualIdentity } from "@/lib/visual-identity";

interface MiniThumbProps {
  slug: string;
  size?: number;
}

export function MiniThumb({ slug, size = 40 }: MiniThumbProps) {
  const v = getVisualIdentity(slug);

  return (
    <div style={{
      width: size, height: size,
      borderRadius: size > 40 ? "16px" : "10px",
      overflow: "hidden", flexShrink: 0,
      background: v.layers[0],
      position: "relative",
    }}>
      {v.layers[1] && (
        <div style={{
          position: "absolute", inset: 0,
          background: v.layers[1],
          borderRadius: "inherit",
        }} />
      )}
    </div>
  );
}
