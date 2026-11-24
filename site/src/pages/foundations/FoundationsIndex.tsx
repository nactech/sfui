import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { DocsLayout } from "@site/app/DocsLayout";
import { PageIntro } from "@site/components/Page";
import { FOUNDATIONS } from "@site/content/navigation";
import { useTitle } from "@site/lib/useTitle";
import styles from "./foundations.module.scss";

export function FoundationsIndex() {
  useTitle("Foundations");
  return (
    <DocsLayout area="foundations">
      <PageIntro
        eyebrow="Foundations"
        title="The rules under every component."
        lead="Colour, type, shape, elevation, motion, icons and platforms. The tokens on these pages are read from the library source, so they never drift."
      />
      <div className={styles.indexGrid}>
        {FOUNDATIONS.map((f, i) => (
          <Link key={f.path} to={f.path} className={styles.indexCard}>
            <span className={styles.indexNumber}>{String(i + 1).padStart(2, "0")}</span>
            <h2>
              {f.title}
              <ArrowUpRight aria-hidden="true" />
            </h2>
            <p>{f.summary}</p>
          </Link>
        ))}
      </div>
    </DocsLayout>
  );
}
