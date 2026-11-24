import { useState } from "react";
import { Play } from "lucide-react";
import { Button, TabBar, useMediaQuery } from "@nactech/sfui";
import { DocsLayout } from "@site/app/DocsLayout";
import { Callout, Chip, PageIntro, Prose, Section } from "@site/components/Page";
import { Stage } from "@site/components/Stage";
import { tabItems } from "@site/content/shared";
import { tokenGroup } from "@site/lib/tokens";
import { useTitle } from "@site/lib/useTitle";
import styles from "./foundations.module.scss";

const EASING_USE: Record<string, string> = {
  "--sf-ease-standard": "Most state changes: colour, opacity, small moves.",
  "--sf-ease-emphasized": "Things entering the screen: panels, pages, morphs.",
  "--sf-ease-spring": "Playful overshoot for small objects: knobs, checks, badges.",
};
const DURATION_USE: Record<string, string> = {
  "--sf-duration-fast": "Hover, press, colour — feedback that must feel instant.",
  "--sf-duration-medium": "Toggles and small transitions inside a component.",
  "--sf-duration-slow": "Larger moves: panels, height changes, page content.",
};

function bezier(value: string): [number, number, number, number] | null {
  const m = value.match(/cubic-bezier\(([^)]+)\)/);
  if (!m) return null;
  const n = m[1].split(",").map(Number);
  return n.length === 4 ? [n[0], n[1], n[2], n[3]] : null;
}

function Curve({ value }: { value: string }) {
  const p = bezier(value);
  if (!p) return null;
  // y range −0.1…1.5 so overshooting springs fit.
  const X = (x: number) => 8 + x * 104;
  const Y = (y: number) => 112 - ((y + 0.1) / 1.6) * 104;
  return (
    <svg viewBox="0 0 120 120" className={styles.curve} aria-hidden="true">
      <line x1={X(0)} y1={Y(1)} x2={X(1)} y2={Y(1)} className={styles.curveGuide} />
      <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(0)} className={styles.curveGuide} />
      <path d={`M${X(0)} ${Y(0)} C${X(p[0])} ${Y(p[1])} ${X(p[2])} ${Y(p[3])} ${X(1)} ${Y(1)}`} className={styles.curvePath} />
    </svg>
  );
}

export function Motion() {
  useTitle("Motion");
  const motion = tokenGroup("Motion")?.tokens ?? [];
  const easings = motion.filter((t) => t.name.includes("ease"));
  const durations = motion.filter((t) => t.name.includes("duration"));
  const [run, setRun] = useState(0);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [tab, setTab] = useState("library");

  return (
    <DocsLayout area="foundations">
      <PageIntro
        eyebrow="Foundations"
        title="Motion"
        lead="Quick feedback, springs for things you touch, and nothing that moves when you asked it not to."
      />

      <Section id="easing" title="Easing">
        <div className={styles.motionGrid}>
          {easings.map((t) => (
            <div key={t.name} className={styles.motionCard}>
              <Curve value={t.value} />
              <code className={styles.tokenName}>{t.name}</code>
              <span className={styles.tokenValue}>{t.value}</span>
              <span className={styles.tokenNote}>{EASING_USE[t.name]}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="duration" title="Duration">
        <div className={styles.tracks} data-run={run % 2 ? "b" : "a"}>
          {durations.map((t) => (
            <div key={t.name} className={styles.track}>
              <div className={styles.trackLabel}>
                <code className={styles.tokenName}>{t.name}</code>
                <span className={styles.tokenValue}>{t.value}</span>
              </div>
              <div className={styles.trackRail}>
                <span key={run} className={styles.trackDot} style={{ animationDuration: `var(${t.name})` }} />
              </div>
              <span className={styles.tokenNote}>{DURATION_USE[t.name]}</span>
            </div>
          ))}
        </div>
        <div>
          <Button variant="tonal" size="s" leadingIcon={<Play />} onClick={() => setRun((r) => r + 1)}>
            Replay
          </Button>
        </div>
      </Section>

      <Section
        id="springs"
        title="Springs you can grab"
        lead="The tab bar pill is physics, not a keyframe: it travels on a spring, stretches mid-way, grows while held and follows your finger. Tap a tab — or press and drag the pill."
      >
        <div className={styles.springs}>
          <Stage backdrop="photo" minHeight={10}>
            <div style={{ width: "min(24rem, 100%)" }}>
              <TabBar items={tabItems} value={tab} onValueChange={setTab} placement="bottom" layout="compact" pinned={false} aria-label="Android + Web pill" platform="web" />
            </div>
          </Stage>
          <Stage backdrop="photo" minHeight={10}>
            <div style={{ width: "min(24rem, 100%)" }}>
              <TabBar items={tabItems} value={tab} onValueChange={setTab} pinned={false} aria-label="iOS lens" platform="ios" />
            </div>
          </Stage>
        </div>
        <div className={styles.specs}>
          <div>
            <strong>Android + Web pill</strong>
            <span>Tap: stiffness 700, damping 0.9 (≈ 260–320 ms) · drag: 1400 / 1.0 · stretch × 1.4, trailing edge 40 ms late · hold: 56×32 → 62×36 in 120 ms</span>
          </div>
          <div>
            <strong>iOS lens</strong>
            <span>Tap: response 0.32, damping 0.82 · drag: 0.15 / 0.86 · stretch × 1.3 · hold: lens lifts to 1.15×</span>
          </div>
        </div>
      </Section>

      <Section id="reduced-motion" title="Reduced motion">
        <p>
          <Chip tone={reduced ? "warning" : "positive"}>Your setting: {reduced ? "reduce motion" : "full motion"}</Chip>
        </p>
        <Prose>
          <ul>
            <li>Every component honours <code>prefers-reduced-motion: reduce</code>.</li>
            <li>Travel, stretch and overshoot become an instant switch with a short fade (the tab bar pill: 150 ms).</li>
            <li>Submenus crossfade in 150 ms and their height snaps; the iOS menu grow-in becomes a fade.</li>
            <li>The scrubber stops waving; springy knobs and checks change without the bounce.</li>
            <li>Colour and opacity feedback stays — it doesn’t move anything.</li>
          </ul>
        </Prose>
        <Callout tone="neutral" title="This site follows the same rule">
          Page entrances, the hero animation and smooth scrolling turn off with reduced motion.
        </Callout>
      </Section>
    </DocsLayout>
  );
}
