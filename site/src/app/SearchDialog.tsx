import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, BookOpen, Palette, Shapes } from "lucide-react";
import { SearchField } from "@nactech/sfui";
import { COMPONENTS } from "@site/content/registry";
import { FOUNDATIONS, GET_STARTED } from "@site/content/navigation";
import styles from "./layout.module.scss";

interface Entry {
  path: string;
  title: string;
  summary: string;
  kind: "Component" | "Foundation" | "Guide";
  keywords: string;
}

const ENTRIES: Entry[] = [
  { ...GET_STARTED, kind: "Guide", keywords: "install npm styles fonts configprovider rem setup" },
  ...FOUNDATIONS.map((f) => ({ ...f, kind: "Foundation" as const, keywords: "" })),
  ...COMPONENTS.map((doc) => ({
    path: `/components/${doc.slug}`,
    title: doc.name,
    summary: doc.summary,
    kind: "Component" as const,
    keywords: `${doc.exports.join(" ")} ${doc.group}`,
  })),
];

const ICON = { Component: Shapes, Foundation: Palette, Guide: BookOpen };

function search(query: string): Entry[] {
  const q = query.trim().toLowerCase();
  if (!q) return ENTRIES.filter((e) => e.kind !== "Foundation").slice(0, 8);
  const score = (e: Entry) => {
    const title = e.title.toLowerCase();
    if (title.startsWith(q)) return 0;
    if (title.includes(q)) return 1;
    if (e.keywords.toLowerCase().includes(q)) return 2;
    if (e.summary.toLowerCase().includes(q)) return 3;
    return -1;
  };
  return ENTRIES.map((e) => [e, score(e)] as const)
    .filter(([, s]) => s >= 0)
    .sort((a, b) => a[1] - b[1])
    .map(([e]) => e);
}

/** ⌘K search over pages and components, in a native modal <dialog> (focus trap and Esc for free). */
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = useMemo(() => search(query), [query]);
  const current = Math.min(active, Math.max(results.length - 1, 0));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const go = (entry: Entry | undefined) => {
    if (!entry) return;
    onClose();
    navigate(entry.path);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActive((current + delta + results.length) % Math.max(results.length, 1));
    } else if (event.key === "Enter" && results.length) {
      event.preventDefault();
      go(results[current]);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.searchDialog}
      aria-label="Search the docs"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className={styles.searchPanel} onKeyDown={onKeyDown}>
        <SearchField
          label="Search components and guides"
          value={query}
          onValueChange={(v) => {
            setQuery(v);
            setActive(0);
          }}
          autoFocus
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-activedescendant={results.length ? `${listId}-${current}` : undefined}
          aria-autocomplete="list"
        />
        <ul id={listId} role="listbox" aria-label="Results" className={styles.searchResults}>
          {results.map((entry, i) => {
            const Icon = ICON[entry.kind];
            return (
              <li
                key={entry.path}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === current}
                className={styles.searchResult}
                onPointerMove={() => setActive(i)}
                onClick={() => go(entry)}
              >
                <span className={styles.searchResultIcon} aria-hidden="true">
                  <Icon />
                </span>
                <span className={styles.searchResultText}>
                  <span className={styles.searchResultTitle}>{entry.title}</span>
                  <span className={styles.searchResultSummary}>{entry.summary}</span>
                </span>
                <span className={styles.searchResultKind}>{entry.kind}</span>
                <ArrowRight className={styles.searchResultArrow} aria-hidden="true" />
              </li>
            );
          })}
          {results.length === 0 && <li className={styles.searchEmpty}>No matches for “{query}”.</li>}
        </ul>
      </div>
    </dialog>
  );
}
