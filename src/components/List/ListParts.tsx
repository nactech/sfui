import React from "react";
import classes from "./List.module.scss";
import { buildClassName } from "/@/core/util";

/** Tonal pairs from the masters: accent (snowflake), warning (taxi), positive (repeat), danger (house), neutral. */
export type ListTone = "accent" | "positive" | "warning" | "danger" | "neutral";

const toneClass: Record<ListTone, string> = {
  accent: classes.toneAccent,
  positive: classes.tonePositive,
  warning: classes.toneWarning,
  danger: classes.toneDanger,
  neutral: classes.toneNeutral,
};

/* ------------------------------------------------------------------------------------------------ */

export interface ListThumbnailProps extends React.HTMLAttributes<HTMLSpanElement> {
  ref?: React.Ref<HTMLSpanElement>;
  /** Tonal fill + icon color. Default `accent`. Ignored for `avatar`. */
  tone?: ListTone;
  /**
   * Avatar: always a circle on surface/3 with a rim/strong hairline, initials in Geist Mono 13/600 ("MF").
   * Otherwise the shape follows the list style: Segmented 44 circle, Flat 52 r14, Inset 44 r12.
   */
  avatar?: boolean;
  /** Image thumbnail (cover). */
  src?: string;
  /** Alt text for `src`. Without it the thumbnail is decorative (hidden from assistive tech). */
  alt?: string;
  /** Lucide icon or initials. Icons are sized by the list (20, or 24 in Flat). */
  children?: React.ReactNode;
}

export const ListThumbnail = ({
  tone = "accent",
  avatar = false,
  src,
  alt,
  className,
  children,
  ...rest
}: ListThumbnailProps) => {
  const decorative = !alt && rest["aria-label"] == null;
  return (
    <span
      aria-hidden={decorative ? true : undefined}
      data-avatar={avatar ? "" : undefined}
      className={buildClassName(classes.thumb, avatar ? classes.toneAvatar : toneClass[tone], className)}
      {...rest}
    >
      {src != null ? <img className={classes.thumbImage} src={src} alt={alt ?? ""} draggable={false} /> : children}
    </span>
  );
};

/* ------------------------------------------------------------------------------------------------ */

export interface ListStatusProps extends React.HTMLAttributes<HTMLSpanElement> {
  ref?: React.Ref<HTMLSpanElement>;
  /** Default `danger` (the "71 KB over budget" badge in the masters). */
  tone?: ListTone;
  /** Leading 12px icon (e.g. `<CircleAlert />`). */
  icon?: React.ReactNode;
  /** Show a small status dot instead of an icon. */
  dot?: boolean;
  children?: React.ReactNode;
}

/** Trailing status pill of the Status row: 24 high, tonal fill, Geist Mono 11/600. */
export const ListStatus = ({ tone = "danger", icon, dot = false, className, children, ...rest }: ListStatusProps) => (
  <span className={buildClassName(classes.status, toneClass[tone], className)} {...rest}>
    {icon != null ? (
      <span className={classes.statusIcon} aria-hidden="true">
        {icon}
      </span>
    ) : dot ? (
      <span className={classes.statusDot} aria-hidden="true" />
    ) : null}
    {children}
  </span>
);

/* ------------------------------------------------------------------------------------------------ */

type ListActionAnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  ref?: React.Ref<HTMLAnchorElement>;
  href: string;
};
type ListActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: React.Ref<HTMLButtonElement>;
  href?: undefined;
};
/** A link when `href` is set, otherwise a button. */
export type ListActionProps = ListActionAnchorProps | ListActionButtonProps;

/** Section header action ("See All", 17 accent). */
export const ListAction = (props: ListActionProps) => {
  if (props.href != null) {
    const { className, ...rest } = props;
    return <a className={buildClassName(classes.action, className)} {...rest} />;
  }
  const { className, type = "button", ...rest } = props;
  return <button type={type} className={buildClassName(classes.action, className)} {...rest} />;
};
