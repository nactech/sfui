import { DocsLayout } from "@site/app/DocsLayout";
import { CodeBlock } from "@site/components/CodeBlock";
import { PageIntro, Prose, Section } from "@site/components/Page";
import { useTitle } from "@site/lib/useTitle";
import styles from "./foundations.module.scss";

/** The sizes the components actually use (design px → rem), surveyed from the component styles. */
const SCALE = [
  { role: "Large title", spec: "32 / 700", size: 2, weight: 700, sample: "Foggy Stickers", where: "Header, expanded (Android + Web)" },
  { role: "Page title", spec: "28 / 700", size: 1.75, weight: 700, sample: "Foggy Stickers", where: "PageHeader (web wide)" },
  { role: "Section title", spec: "22 / 700", size: 1.375, weight: 700, sample: "Recent", where: "List title" },
  { role: "Bar title", spec: "18 / 600", size: 1.125, weight: 600, sample: "Foggy Stickers", where: "Header, collapsed" },
  { role: "Body large", spec: "17 / 500", size: 1.0625, weight: 500, sample: "Mr. Chilly", where: "Flat list rows" },
  { role: "Body", spec: "16 / 500", size: 1, weight: 500, sample: "Painted Ladies", where: "List rows, fields" },
  { role: "Body small", spec: "15 / 400", size: 0.9375, weight: 400, sample: "Name your pack", where: "Field values, menu rows" },
  { role: "Label", spec: "14 / 500", size: 0.875, weight: 500, sample: "Export", where: "Buttons, tabs" },
  { role: "Meta", spec: "13 / 400", size: 0.8125, weight: 400, sample: "Applies to all stickers", where: "Subtitles, quick actions" },
  { role: "Caption", spec: "12 / 400", size: 0.75, weight: 400, sample: "Shown in Telegram", where: "Helper text, counters" },
];

const MONO = [
  { role: "Value", spec: "Mono 13 / 600", size: 0.8125, weight: 600, sample: "MF · 41 KB" },
  { role: "Meta", spec: "Mono 11 / 500", size: 0.6875, weight: 500, sample: "2.4 s · 60 fps · 512²" },
  { role: "Micro", spec: "Mono 10 / 400", size: 0.625, weight: 400, sample: "1 · REST — M 44" },
];

export function Typography() {
  useTitle("Typography");
  return (
    <DocsLayout area="foundations">
      <PageIntro
        eyebrow="Foundations"
        title="Typography"
        lead="Geist for words, Geist Mono for numbers, and the system font on iOS. A compact scale, set in rem, tuned for a black canvas."
      />

      <Section id="families" title="Three families, three jobs">
        <div className={styles.families}>
          <div className={styles.family}>
            <span className={styles.familyGlyph} style={{ fontFamily: "var(--sf-font-sans)" }}>
              Aa
            </span>
            <h3>Geist</h3>
            <p>Every label, title and paragraph on Android and the web. Variable weights 400–700.</p>
            <code>--sf-font-sans</code>
          </div>
          <div className={styles.family}>
            <span className={styles.familyGlyph} style={{ fontFamily: "var(--sf-font-mono)" }}>
              0.9
            </span>
            <h3>Geist Mono</h3>
            <p>Numbers that change or get compared: sizes, durations, frame rates, counters, initials.</p>
            <code>--sf-font-mono</code>
          </div>
          <div className={styles.family}>
            <span className={styles.familyGlyph} style={{ fontFamily: "var(--sf-font-ios)" }}>
              Aa
            </span>
            <h3>SF Pro (system)</h3>
            <p>The iOS implementations use the system font, so iOS screens read as native. Elsewhere it falls back to the system UI font.</p>
            <code>--sf-font-ios</code>
          </div>
        </div>
      </Section>

      <Section id="scale" title="The scale" lead="Sizes and weights the components use. Size / weight in design px; 16 px = 1rem.">
        <div className={styles.scale}>
          {SCALE.map((s) => (
            <div key={s.role} className={styles.scaleRow}>
              <div className={styles.scaleMeta}>
                <strong>{s.role}</strong>
                <span>{s.spec}</span>
                <span>{s.where}</span>
              </div>
              <span className={styles.scaleSample} style={{ fontSize: `${s.size}rem`, fontWeight: s.weight }}>
                {s.sample}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="mono" title="Numbers in Geist Mono" lead="Tabular figures keep columns of sizes and timings steady while they change.">
        <div className={styles.scale}>
          {MONO.map((s) => (
            <div key={s.role} className={styles.scaleRow}>
              <div className={styles.scaleMeta}>
                <strong>{s.role}</strong>
                <span>{s.spec}</span>
              </div>
              <span className={styles.scaleSample} style={{ fontFamily: "var(--sf-font-mono)", fontSize: `${s.size}rem`, fontWeight: s.weight }}>
                {s.sample}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="ios" title="iOS reads as iOS">
        <div className={styles.iosCompare}>
          <div>
            <span className={styles.compareLabel}>Android + Web · Geist</span>
            <span style={{ fontFamily: "var(--sf-font-sans)", fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.0625rem" }}>Foggy Stickers</span>
            <span style={{ fontFamily: "var(--sf-font-sans)", color: "var(--sf-fg-muted)" }}>Sort by · Date added</span>
          </div>
          <div>
            <span className={styles.compareLabel}>iOS · SF Pro</span>
            <span style={{ fontFamily: "var(--sf-font-ios)", fontSize: "2.125rem", fontWeight: 700, letterSpacing: "0.025rem" }}>Foggy Stickers</span>
            <span style={{ fontFamily: "var(--sf-font-ios)", color: "var(--sf-ios-secondary-label)" }}>Sort By · Date Added</span>
          </div>
        </div>
        <Prose>
          <p>
            iOS implementations also follow iOS casing: Title Case in menus and buttons (“Move To…”, “See All”), sentence case
            everywhere else.
          </p>
        </Prose>
      </Section>

      <Section id="setup" title="Loading the fonts">
        <CodeBlock
          title="main.tsx"
          code={`// npm install @fontsource-variable/geist @fontsource-variable/geist-mono
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";`}
        />
      </Section>
    </DocsLayout>
  );
}
