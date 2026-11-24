import { CircleCheck, CircleX } from "lucide-react";
import type { DoDont } from "@site/content/types";
import { Stage } from "./Stage";
import { md } from "@site/lib/inline";
import styles from "./ui.module.scss";

/** A rendered do / don't example with its rule. */
export function DoDontCard({ item }: { item: DoDont }) {
  const ok = item.kind === "do";
  return (
    <figure className={styles.doDont} data-kind={item.kind}>
      <Stage backdrop={item.stage ?? "canvas"} minHeight={11} className={styles.doDontStage}>
        {item.render()}
      </Stage>
      <figcaption className={styles.doDontCaption}>
        <span className={styles.doDontLabel}>
          {ok ? <CircleCheck aria-hidden="true" /> : <CircleX aria-hidden="true" />}
          {ok ? "Do" : "Don’t"}
        </span>
        <strong className={styles.doDontTitle}>{item.title}</strong>
        {item.caption && <span className={styles.doDontText}>{md(item.caption)}</span>}
      </figcaption>
    </figure>
  );
}
