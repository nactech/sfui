import { useState } from "react";
import { ArrowLeft, Ellipsis, Play, Share } from "lucide-react";
import { Button, Segmented, TabBar } from "@nactech/sfui";
import { DocsLayout } from "@site/app/DocsLayout";
import { DoDontCard } from "@site/components/DoDontCard";
import { PageIntro, Prose, Section } from "@site/components/Page";
import { tabItems } from "@site/content/shared";
import { bayFog, nightBeach, paintedLadiesTall } from "@site/lib/photos";
import { useTitle } from "@site/lib/useTitle";
import ui from "@site/components/ui.module.scss";
import styles from "./foundations.module.scss";

function SurfaceSteps() {
  return (
    <div className={styles.steps}>
      {[0, 1, 2, 3].map((n) => (
        <div key={n} className={styles.step} style={{ background: `var(--sf-surface-${n})` }}>
          <code>surface/{n}</code>
          <span>{["Canvas", "Cards, groups", "Controls, hover", "Pressed, selected"][n]}</span>
        </div>
      ))}
    </div>
  );
}

/** Live: scroll a "photo feed" under real glass chrome; flip to solid to see why glass exists. */
function GlassDemo() {
  const [mode, setMode] = useState("glass");
  return (
    <div className={styles.glassDemo}>
      <Segmented
        size="s"
        aria-label="Chrome"
        style={{ width: "min(12rem, 100%)" }}
        value={mode}
        onValueChange={setMode}
        options={[
          { value: "glass", label: "Glass" },
          { value: "solid", label: "Solid" },
        ]}
      />
      <div className={styles.glassViewport} data-mode={mode}>
        <div className={styles.glassTop}>
          <Button variant="secondary" iconOnly aria-label="Back">
            <ArrowLeft />
          </Button>
          <span className={styles.glassTitle}>Ocean Beach</span>
          <Button variant="secondary" iconOnly aria-label="Share">
            <Share />
          </Button>
          <Button variant="secondary" iconOnly aria-label="More">
            <Ellipsis />
          </Button>
        </div>
        <div className={styles.glassScroll} tabIndex={0} aria-label="Photo feed (scroll)">
          {[bayFog, paintedLadiesTall, nightBeach, bayFog, paintedLadiesTall].map((bg, i) => (
            <div key={i} className={styles.glassPhoto} style={{ backgroundImage: bg }}>
              {i === 0 && <span className={styles.glassHint}>Scroll — the photos slide under the chrome</span>}
            </div>
          ))}
        </div>
        <div className={styles.glassBottom}>
          <TabBar items={tabItems} defaultValue="player" placement="bottom" layout="compact" pinned={false} aria-label="Sections" platform="web" />
        </div>
      </div>
    </div>
  );
}

export function Elevation() {
  useTitle("Elevation & glass");
  return (
    <DocsLayout area="foundations">
      <PageIntro
        eyebrow="Foundations"
        title="Elevation & glass"
        lead="On a true-black canvas, shadows have nothing to fall on. Black Glass raises things by stepping up the surface and drawing a 1px rim — and saves glass for the chrome that floats over content."
      />

      <Section id="surfaces" title="Surface steps + rims">
        <SurfaceSteps />
        <Prose>
          <p>
            Each step is a little lighter than the one below and carries a <code>rim/default</code> hairline (white at 8%).
            Use at most two steps on one screen. <code>rim/strong</code> (16%) marks containers that need to stand out.
          </p>
        </Prose>
      </Section>

      <Section id="glass" title="Glass only over content" lead="Translucent fill, a 12 px blur, a light rim and a 1px top highlight — for chrome that floats over photos, video and scrolling feeds.">
        <GlassDemo />
        <Prose>
          <p>
            Glass lets the content keep its colour under the tab bar, the header capsules, menus and the player bar. On the
            plain black canvas it would just be grey — so there, components use solid surfaces. Buttons are the one
            set that is always glass: the same five variants work on black and over media.
          </p>
        </Prose>
      </Section>

      <Section id="rules" title="Do and don’t">
        <div className={ui.grid2}>
          <DoDontCard
            item={{
              kind: "do",
              title: "Step up the surface and draw a rim",
              stage: "canvas",
              render: () => (
                <div className={styles.cardSample} style={{ background: "var(--sf-surface-1)", border: "1px solid var(--sf-rim-default)" }}>
                  surface/1 + rim
                </div>
              ),
            }}
          />
          <DoDontCard
            item={{
              kind: "dont",
              title: "Don’t cast shadows on black",
              caption: "They’re invisible on #000 and muddy on surfaces.",
              stage: "canvas",
              render: () => (
                <div className={styles.cardSample} style={{ background: "#121214", boxShadow: "0 1.5rem 3rem #000, 0 0 2rem #ffffff10" }}>
                  drop shadow
                </div>
              ),
            }}
          />
          <DoDontCard
            item={{
              kind: "do",
              title: "Use glass where content shows through",
              stage: "photo",
              render: () => (
                <Button size="l" leadingIcon={<Play />}>
                  Play
                </Button>
              ),
            }}
          />
          <DoDontCard
            item={{
              kind: "dont",
              title: "Don’t make glass panels on the canvas",
              caption: "Over black, blur has nothing to blur — use surface/1.",
              stage: "canvas",
              render: () => (
                <div className={styles.cardSample} style={{ background: "var(--sf-glass-fill)", border: "1px solid var(--sf-glass-rim)", backdropFilter: "blur(0.75rem)" }}>
                  glass on black
                </div>
              ),
            }}
          />
        </div>
      </Section>
    </DocsLayout>
  );
}
