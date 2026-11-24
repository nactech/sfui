import { useMemo, useState } from "react";
import { SearchField } from "@nactech/sfui";
import { DocsLayout } from "@site/app/DocsLayout";
import { CoverCard } from "@site/components/CoverCard";
import { PageIntro, Section } from "@site/components/Page";
import { componentsByGroup } from "@site/content/registry";
import { useTitle } from "@site/lib/useTitle";
import ui from "@site/components/ui.module.scss";
import styles from "./pages.module.scss";

export function ComponentsIndex() {
  useTitle("Components");
  const [query, setQuery] = useState("");
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return componentsByGroup()
      .map(({ group, docs }) => ({
        group,
        docs: q
          ? docs.filter((d) => `${d.name} ${d.summary} ${d.exports.join(" ")} ${group}`.toLowerCase().includes(q))
          : docs,
      }))
      .filter((g) => g.docs.length);
  }, [query]);
  const total = groups.reduce((n, g) => n + g.docs.length, 0);

  return (
    <DocsLayout area="components">
      <PageIntro
        eyebrow="Components"
        title="Everything on the glass."
        lead="Fifteen pages, one per component family. Each has a live demo, the platform implementations side by side, usage rules, accessibility notes and the full API."
      >
        <div className={styles.filter}>
          <SearchField label="Filter components" value={query} onValueChange={setQuery} />
          <span className={styles.filterCount} aria-live="polite">
            {total} {total === 1 ? "component" : "components"}
          </span>
        </div>
      </PageIntro>
      {groups.map(({ group, docs }) => (
        <Section key={group} id={group.toLowerCase().replace(/[^a-z]+/g, "-")} title={group}>
          <div className={ui.coverGrid}>
            {docs.map((doc) => (
              <CoverCard key={doc.slug} doc={doc} />
            ))}
          </div>
        </Section>
      ))}
      {groups.length === 0 && <p className={styles.empty}>Nothing matches “{query}”.</p>}
    </DocsLayout>
  );
}
