import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ChevronLeft,
  Copy,
  Download,
  Ellipsis,
  EllipsisVertical,
  FolderInput,
  Link,
  Pause,
  Pencil,
  Play,
  Search,
  Send,
  Settings2,
  Share,
  Trash2,
  X,
} from "lucide-react";
import { Header } from "@nactech/sfui";
import { DocsLayout } from "@site/app/DocsLayout";
import { CodeBlock } from "@site/components/CodeBlock";
import { DeviceFrame } from "@site/components/DeviceFrame";
import { Callout, PageIntro, Prose, Section } from "@site/components/Page";
import { LINKS } from "@site/lib/links";
import { useTitle } from "@site/lib/useTitle";
import styles from "./foundations.module.scss";

const ACTIONS: { action: string; icon: LucideIcon; name: string }[] = [
  { action: "Export", icon: Download, name: "Download" },
  { action: "Share", icon: Share, name: "Share" },
  { action: "Delete", icon: Trash2, name: "Trash2" },
  { action: "Rename", icon: Pencil, name: "Pencil" },
  { action: "Duplicate", icon: Copy, name: "Copy" },
  { action: "Move to…", icon: FolderInput, name: "FolderInput" },
  { action: "Copy link", icon: Link, name: "Link" },
  { action: "Send", icon: Send, name: "Send" },
  { action: "Search", icon: Search, name: "Search" },
  { action: "Settings", icon: Settings2, name: "Settings2" },
  { action: "Play", icon: Play, name: "Play" },
  { action: "Pause", icon: Pause, name: "Pause" },
  { action: "Close", icon: X, name: "X" },
  { action: "More", icon: Ellipsis, name: "Ellipsis" },
];

const SIZES = [
  ["Button S / M / L", "14 / 16 / 18"],
  ["TabBar compact, iOS / wide", "22 / 18"],
  ["Menu rows", "20"],
  ["Header actions", "19"],
  ["List thumbnails (flat: 24)", "20"],
];

export function Iconography() {
  useTitle("Iconography");
  return (
    <DocsLayout area="foundations">
      <PageIntro
        eyebrow="Foundations"
        title="Iconography"
        lead="One icon set — Lucide — at one stroke weight. The same icon for the same action on every platform, so people learn it once."
      />

      <Section id="lucide" title="Lucide only">
        <Prose>
          <p>
            Components take icons as elements (<code>{"leadingIcon={<Download />}"}</code>) and size them themselves, so
            pass the bare component without a <code>size</code>. No Material Symbols, no SF Symbols, no Phosphor — even on
            iOS. Browse the set at <a href={LINKS.lucide}>lucide.dev</a>.
          </p>
        </Prose>
        <CodeBlock
          title="Example"
          code={`import { Download } from "lucide-react";
import { Button } from "@nactech/sfui";

<Button leadingIcon={<Download />}>Export</Button>`}
        />
      </Section>

      <Section id="actions" title="One icon per action" lead="Use these for these actions — in buttons, menus, toolbars and tab bars alike.">
        <div className={styles.iconGrid}>
          {ACTIONS.map(({ action, icon: Icon, name }) => (
            <div key={action} className={styles.iconCell}>
              <Icon aria-hidden="true" />
              <strong>{action}</strong>
              <code>{name}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section id="back" title="The exception: back" lead="Back follows the platform: ArrowLeft on Android and the web, ChevronLeft on iOS. Header picks it for you.">
        <div className={styles.backRow}>
          <div className={styles.backGlyphs}>
            <div>
              <ArrowLeft aria-hidden="true" />
              <span>Android + Web · ArrowLeft</span>
            </div>
            <div>
              <ChevronLeft aria-hidden="true" />
              <span>iOS · ChevronLeft</span>
            </div>
          </div>
        </div>
        <div className={styles.backFrames}>
          {(["ios", "android", "web"] as const).map((p) => (
            <DeviceFrame key={p} platform={p} height={6} align="start">
              <Header title="Foggy Stickers" collapsed onBack={() => {}} />
            </DeviceFrame>
          ))}
        </div>
        <Callout tone="neutral" title="The overflow glyph is the component’s, too">
          Header draws its overflow as <code>EllipsisVertical</code> (⋮) on Android + Web and <code>Ellipsis</code> (•••)
          on iOS — like back, it follows the platform. Everywhere else “More” is <code>Ellipsis</code>.{" "}
          <EllipsisVertical aria-hidden="true" style={{ width: "1rem", height: "1rem", verticalAlign: "-0.1875rem" }} />
        </Callout>
      </Section>

      <Section id="sizes" title="Sizes are set by the component">
        <div className={styles.sizeTable}>
          {SIZES.map(([where, px]) => (
            <div key={where}>
              <span>{where}</span>
              <code>{px}</code>
            </div>
          ))}
        </div>
        <Prose>
          <p>
            Icons are decorative inside labelled controls and are hidden from assistive tech (<code>aria-hidden</code>).
            Icon-only buttons need an <code>aria-label</code>.
          </p>
        </Prose>
      </Section>
    </DocsLayout>
  );
}
