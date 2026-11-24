import { DocsLayout } from "@site/app/DocsLayout";
import { PageIntro, Prose, Section } from "@site/components/Page";
import { tokenGroup } from "@site/lib/tokens";
import { useTitle } from "@site/lib/useTitle";
import styles from "./foundations.module.scss";

const USAGE: Record<string, { use: string; px: string }> = {
  "--sf-radius-sm": { px: "10", use: "Small controls and thumbnails: checkbox boxes, list thumbnails, swatches." },
  "--sf-radius-md": { px: "14", use: "Inputs and cells: inset rows, segmented cells, field containers." },
  "--sf-radius-lg": { px: "20", use: "Cards and stages: list groups, photo cards, code blocks." },
  "--sf-radius-xl": { px: "26", use: "Panels: menus, sheets, large cards." },
  "--sf-radius-full": { px: "∞", use: "Capsules and circles: buttons, the tab bar, chips, icon buttons." },
};

export function Shape() {
  useTitle("Shape");
  const radii = tokenGroup("Radius")?.tokens ?? [];
  return (
    <DocsLayout area="foundations">
      <PageIntro
        eyebrow="Foundations"
        title="Shape"
        lead="Five radii. Interactive chrome is a capsule; containers get rounder as they get bigger."
      />
      <Section id="radius" title="Radius tokens">
        <div className={styles.radii}>
          {radii.map((t) => (
            <div key={t.name} className={styles.radius}>
              <div className={styles.radiusShape} style={{ borderRadius: `var(${t.name})` }} />
              <code className={styles.tokenName}>{t.name}</code>
              <span className={styles.tokenValue}>
                {t.value} · {USAGE[t.name]?.px ?? "—"} px
              </span>
              {USAGE[t.name] && <span className={styles.tokenNote}>{USAGE[t.name].use}</span>}
            </div>
          ))}
        </div>
      </Section>
      <Section id="nesting" title="Nesting">
        <div className={styles.nesting}>
          <div className={styles.nestOuter}>
            <div className={styles.nestInner}>
              <span>inner = outer − padding</span>
            </div>
          </div>
        </div>
        <Prose>
          <p>
            When a rounded element sits inside another, subtract the padding from the outer radius so the curves stay
            concentric — a 26 panel with 12 padding holds 14 cells.
          </p>
        </Prose>
      </Section>
    </DocsLayout>
  );
}
