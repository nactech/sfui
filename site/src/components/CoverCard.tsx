import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { ConfigProvider } from "@nactech/sfui";
import type { ComponentDoc } from "@site/content/types";
import { coverFor } from "@site/lib/promo";
import { defaultValues } from "./ControlsPanel";
import { Stage } from "./Stage";
import styles from "./ui.module.scss";

const SPLIT_LABEL = { shared: "All platforms", split: "iOS · Android + Web", ios: "iOS" } as const;

/**
 * Live, non-interactive render of a component for cards: `doc.Preview`, else `Demo` with its default values.
 * Forced to the web implementation so every card looks the same on every device.
 */
export function LivePreview({ doc }: { doc: ComponentDoc }) {
  const { Preview, Demo } = doc;
  return (
    <ConfigProvider platform="web">
      <div className={styles.previewInner} inert aria-hidden="true">
        {Preview ? <Preview /> : <Demo values={defaultValues(doc.controls)} />}
      </div>
    </ConfigProvider>
  );
}

/**
 * Component cover card. Uses the promo cover (`site/public/promo/covers/<slug>.*`) when it exists,
 * otherwise a live mini-preview of the component.
 */
export function CoverCard({ doc, headingLevel = 3 }: { doc: ComponentDoc; headingLevel?: 2 | 3 | 4 }) {
  const cover = coverFor(doc);
  const Heading = `h${headingLevel}` as const;
  return (
    <Link to={`/components/${doc.slug}`} className={styles.coverCard}>
      <div className={styles.coverMedia}>
        {cover ? (
          <img className={styles.coverImage} src={cover} alt="" loading="lazy" decoding="async" />
        ) : (
          <Stage backdrop={doc.stage ?? "canvas"} className={styles.coverStage} flush>
            <LivePreview doc={doc} />
          </Stage>
        )}
      </div>
      <div className={styles.coverBody}>
        <Heading className={styles.coverTitle}>
          {doc.name}
          <ArrowUpRight className={styles.coverArrow} aria-hidden="true" />
        </Heading>
        <p className={styles.coverSummary}>{doc.summary}</p>
        <span className={styles.coverMeta}>{SPLIT_LABEL[doc.platformSplit]}</span>
      </div>
    </Link>
  );
}
