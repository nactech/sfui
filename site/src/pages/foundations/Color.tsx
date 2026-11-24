import { DocsLayout } from "@site/app/DocsLayout";
import { Callout, PageIntro, Prose, Section } from "@site/components/Page";
import { paintedLadiesTall } from "@site/lib/photos";
import { TOKEN_GROUPS, isColor, type Token } from "@site/lib/tokens";
import { useTitle } from "@site/lib/useTitle";
import styles from "./foundations.module.scss";

/** Hand-written usage notes. Tokens without a note still render (the list comes from the source). */
const USAGE: Record<string, string> = {
  "--sf-surface-0": "The canvas. True black — pixels off on OLED.",
  "--sf-surface-1": "Cards, list groups, side panels: the first step up.",
  "--sf-surface-2": "Controls and fills on surface/1, hovered rows.",
  "--sf-surface-3": "The highest step: pressed and selected rows on surface/2.",
  "--sf-rim-default": "The 1px hairline around every raised surface.",
  "--sf-rim-strong": "Emphasised rims: avatars, frames, outlined containers.",
  "--sf-fg-default": "Primary text and icons.",
  "--sf-fg-muted": "Secondary text: subtitles, descriptions.",
  "--sf-fg-subtle": "Tertiary text: meta, placeholders, captions.",
  "--sf-accent-default": "Primary actions, checks, selected states, links.",
  "--sf-accent-pressed": "Accent while pressed.",
  "--sf-accent-on": "Text and icons on the accent fill.",
  "--sf-accent-tonal": "Tonal fills: the selected tab pill, tonal buttons, callouts.",
  "--sf-accent-tonal-pressed": "Tonal fill while pressed.",
  "--sf-accent-on-tonal": "Text and icons on the tonal fill.",
  "--sf-positive-default": "Success, done, within budget.",
  "--sf-positive-tonal": "Background of positive status pills.",
  "--sf-warning-default": "Needs attention soon.",
  "--sf-warning-tonal": "Background of warning status pills.",
  "--sf-danger-default": "Destructive actions, errors, over budget.",
  "--sf-danger-tonal": "Danger button fill, error status pills.",
  "--sf-danger-tonal-pressed": "Danger fill while pressed.",
  "--sf-glass-fill": "Neutral glass: tab bar, header capsules, menus, fields.",
  "--sf-glass-fill-pressed": "Neutral glass while pressed.",
  "--sf-glass-rim": "Rim of glass chrome.",
  "--sf-glass-rim-light": "Brighter rim for small glass controls.",
  "--sf-glass-rim-accent": "Rim of accent and tonal glass.",
  "--sf-glass-rim-danger": "Rim of danger glass.",
  "--sf-glass-highlight": "The 1px inset top highlight of glass.",
  "--sf-glass-highlight-soft": "A softer highlight for large glass panels.",
  "--sf-glass-accent": "Primary button glass.",
  "--sf-glass-tonal": "Tonal button glass.",
  "--sf-glass-danger": "Danger button glass.",
  "--sf-focus-ring": "2px keyboard focus outline.",
  "--sf-focus-glow": "Soft glow around focused fields.",
  "--sf-disabled-fill": "Opaque disabled fill — never opacity.",
  "--sf-disabled-fg": "Disabled text and icons.",
  "--sf-disabled-glass": "Disabled glass: stays legible over photos.",
  "--sf-list-selected": "Selected row tint over canvas.",
  "--sf-list-selected-surface": "Selected row on surface/1.",
  "--sf-ios-red": "iOS systemRed for destructive menu items.",
  "--sf-ios-label": "iOS label colour.",
  "--sf-ios-secondary-label": "iOS secondaryLabel.",
  "--sf-ios-separator": "iOS separator.",
};

const isTranslucent = (value: string) => /^#[0-9a-f]{8}$/i.test(value) && !/ff$/i.test(value);

/** Hairline tokens (rims, separators) are drawn as lines, not fills. */
const isLine = (name: string) => /rim|separator/.test(name);

function Swatch({ token }: { token: Token }) {
  const line = isLine(token.name);
  const translucent = !line && isTranslucent(token.value);
  return (
    <div className={styles.swatch}>
      <div
        className={styles.swatchColor}
        data-translucent={translucent ? "" : undefined}
        data-line={line ? "" : undefined}
        style={translucent ? { backgroundImage: paintedLadiesTall } : undefined}
      >
        <span style={line ? { borderColor: `var(${token.name})` } : { background: `var(${token.name})` }} />
      </div>
      <div className={styles.swatchText}>
        <code className={styles.tokenName}>{token.name}</code>
        <span className={styles.tokenValue}>{token.value}</span>
        {(USAGE[token.name] ?? token.note) && <span className={styles.tokenNote}>{USAGE[token.name] ?? token.note}</span>}
      </div>
    </div>
  );
}

export function Color() {
  useTitle("Color");
  const groups = TOKEN_GROUPS.map((g) => ({ ...g, tokens: g.tokens.filter((t) => isColor(t.value)) })).filter((g) => g.tokens.length);
  return (
    <DocsLayout area="foundations">
      <PageIntro
        eyebrow="Foundations"
        title="Color"
        lead="True black, four surface steps, a periwinkle accent used mostly as a tonal fill, and status colours only where status lives. Every colour is a --sf- custom property; this page renders them straight from the library source."
      />
      <Section id="principles" title="How colour works here">
        <div className={styles.rules}>
          <div>
            <h3>Black is the canvas</h3>
            <p>
              <code>surface/0</code> is <code>#000</code>. Depth comes from stepping up to surface/1–3 and drawing a 1px rim
              — never from shadows.
            </p>
          </div>
          <div>
            <h3>Accent, mostly tonal</h3>
            <p>
              The solid periwinkle marks the single primary action and checks. Selection and emphasis use the tonal pair
              (<code>accent/tonal</code> + <code>accent/on-tonal</code>).
            </p>
          </div>
          <div>
            <h3>Disabled is opaque</h3>
            <p>Disabled controls use their own opaque colours. Opacity would make them vanish over photos.</p>
          </div>
        </div>
      </Section>
      {groups.map((group) => (
        <Section key={group.title} id={group.title.toLowerCase().replace(/[^a-z]+/g, "-")} title={group.title} lead={group.description && group.description[0].toUpperCase() + group.description.slice(1) + "."}>
          <div className={styles.swatches}>
            {group.tokens.map((t) => (
              <Swatch key={t.name} token={t} />
            ))}
          </div>
        </Section>
      ))}
      <Section id="using" title="Using tokens">
        <Prose>
          <p>
            Use the custom properties in your own CSS so your screens stay in step with the components:{" "}
            <code>background: var(--sf-surface-1); border: 1px solid var(--sf-rim-default);</code>
          </p>
        </Prose>
        <Callout tone="neutral" title="Translucent tokens are shown over a photo">
          Glass fills, rims and highlights are translucent by design; their swatches sit on a photo so you can see what they
          do over content.
        </Callout>
      </Section>
    </DocsLayout>
  );
}
