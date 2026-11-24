/**
 * The Black Glass tokens, parsed from the library source (src/core/styles/_tokens.scss) at build time,
 * so Foundations always lists exactly the tokens the components use.
 */
import source from "/@/core/styles/_tokens.scss?raw";

export interface Token {
  name: string;
  value: string;
  /** A one-line comment directly above the token in the source. */
  note?: string;
}

export interface TokenGroup {
  /** "Surfaces", "Accent", … (the part of the source comment before " — " or " ("). */
  title: string;
  /** The rest of the source comment ("elevation is a surface step plus a 1px rim, never a shadow"). */
  description?: string;
  tokens: Token[];
}

function parse(scss: string): TokenGroup[] {
  const groups: TokenGroup[] = [];
  let current: TokenGroup | null = null;
  let pendingNote: string | undefined;
  let blank = true;
  for (const raw of scss.split("\n")) {
    const line = raw.trim();
    if (!line) {
      blank = true;
      continue;
    }
    const comment = line.match(/^\/\*\s*(.*?)\s*\*\/$/);
    if (comment) {
      if (blank) {
        const text = comment[1];
        const match = text.match(/^(.*?)(?:\s+[—(]\s*(.*?)\)?)?$/);
        const title = (match?.[1] ?? text).trim();
        current = { title, description: match?.[2]?.trim() || undefined, tokens: [] };
        groups.push(current);
      } else {
        pendingNote = comment[1];
      }
      blank = false;
      continue;
    }
    const token = line.match(/^(--sf-[\w-]+)\s*:\s*(.+?);$/);
    if (token && current) {
      current.tokens.push({ name: token[1], value: token[2], note: pendingNote });
      pendingNote = undefined;
    }
    blank = false;
  }
  return groups.filter((g) => g.tokens.length > 0);
}

export const TOKEN_GROUPS = parse(source);

export const tokenGroup = (title: string) => TOKEN_GROUPS.find((g) => g.title.toLowerCase().startsWith(title.toLowerCase()));

export const isColor = (value: string) => /^#[0-9a-f]{3,8}$/i.test(value);
