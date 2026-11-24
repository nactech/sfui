import type React from "react";
import { Link as LinkIcon } from "lucide-react";
import { buildClassName } from "@nactech/sfui";
import styles from "./ui.module.scss";

/** Big page intro: eyebrow, confident title, lead, optional actions. */
export function PageIntro({
  eyebrow,
  title,
  lead,
  actions,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lead?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className={styles.intro}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h1 className={styles.introTitle}>{title}</h1>
      {lead && <p className={styles.lead}>{lead}</p>}
      {actions && <div className={styles.introActions}>{actions}</div>}
      {children}
    </header>
  );
}

/** A page section with a linkable heading. */
export function Section({
  id,
  title,
  lead,
  children,
  className,
  level = 2,
}: {
  id: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  level?: 2 | 3;
}) {
  const Heading = `h${level}` as const;
  return (
    <section id={id} className={buildClassName(styles.section, className)} aria-labelledby={`${id}-title`}>
      <Heading id={`${id}-title`} className={level === 2 ? styles.sectionTitle : styles.subTitle}>
        <a href={`#${id}`} className={styles.anchor} aria-label={`Link to this section`}>
          <LinkIcon aria-hidden="true" />
        </a>
        {title}
      </Heading>
      {lead && <p className={styles.sectionLead}>{lead}</p>}
      {children}
    </section>
  );
}

/** Long-form text: paragraphs, lists, inline code. */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={buildClassName(styles.prose, className)}>{children}</div>;
}

/** Highlighted note. */
export function Callout({
  title,
  children,
  tone = "accent",
  icon,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  tone?: "accent" | "warning" | "neutral";
  icon?: React.ReactNode;
}) {
  return (
    <aside className={styles.callout} data-tone={tone}>
      {icon && (
        <span className={styles.calloutIcon} aria-hidden="true">
          {icon}
        </span>
      )}
      <div className={styles.calloutBody}>
        {title && <strong className={styles.calloutTitle}>{title}</strong>}
        <div>{children}</div>
      </div>
    </aside>
  );
}

/** Small mono pill. */
export function Chip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" | "positive" | "warning" }) {
  return (
    <span className={styles.chip} data-tone={tone}>
      {children}
    </span>
  );
}
