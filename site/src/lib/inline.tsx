import type React from "react";

/** Renders `backticks` in content strings as inline code (the only markup content strings use). */
export function md(text: React.ReactNode): React.ReactNode {
  if (typeof text !== "string" || !text.includes("`")) return text;
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") && part.length > 1 ? <code key={i}>{part.slice(1, -1)}</code> : part,
  );
}
