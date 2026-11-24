import React, { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@nactech/sfui";
import styles from "./CodeBlock.module.scss";

/**
 * Tiny TSX / shell highlighter: comments, strings, JSX tags, attributes, keywords, numbers.
 * Enough for short docs snippets; no dependency.
 */
const TOKEN = new RegExp(
  [
    String.raw`(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/|(?<=^|\n)#[^\n]*)`,
    String.raw`(?<string>"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|\x60(?:[^\x60\\]|\\.)*\x60)`,
    String.raw`(?<tag><\/?[A-Za-z][\w.]*|\/?>)`,
    String.raw`(?<attr>\b[a-zA-Z-]+(?==))`,
    String.raw`(?<keyword>\b(?:import|from|export|default|const|let|return|function|type|interface|extends|as|true|false|null|undefined|npm|install|new)\b)`,
    String.raw`(?<number>\b\d+(?:\.\d+)?(?:rem|px|ms|s)?\b)`,
  ].join("|"),
  "g",
);

function highlight(code: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of code.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) out.push(code.slice(last, index));
    const groups = match.groups ?? {};
    const kind = Object.keys(groups).find((k) => groups[k] !== undefined) ?? "plain";
    out.push(
      <span key={key++} className={styles[kind]}>
        {match[0]}
      </span>,
    );
    last = index + match[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export interface CodeBlockProps {
  code: string;
  /** Caption in the header ("Terminal", "App.tsx"). */
  title?: string;
  className?: string;
}

export function CodeBlock({ code, title, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable (insecure context) — nothing to do */
    }
  };

  return (
    <figure className={[styles.block, className].filter(Boolean).join(" ")}>
      <figcaption className={styles.header}>
        <span className={styles.title}>{title ?? "Code"}</span>
        <Button variant="ghost" size="s" iconOnly aria-label={copied ? "Copied" : "Copy code"} onClick={copy}>
          {copied ? <Check /> : <Copy />}
        </Button>
      </figcaption>
      <pre className={styles.pre} tabIndex={0}>
        <code>{highlight(code.trim())}</code>
      </pre>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </figure>
  );
}
