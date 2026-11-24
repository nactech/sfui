import type React from "react";
import { Link } from "react-router";
import type { ButtonSize, ButtonVariant } from "@nactech/sfui";
import { buildClassName } from "@nactech/sfui";
// The library's own Button styles on an anchor: navigation must be a link, not a <button>.
import buttonClasses from "/@/components/Button/Button.module.scss";
import styles from "./ButtonLink.module.scss";

const variantClass: Record<ButtonVariant, string> = {
  primary: buttonClasses.primary,
  tonal: buttonClasses.tonal,
  secondary: buttonClasses.secondary,
  ghost: buttonClasses.ghost,
  danger: buttonClasses.danger,
};

const sizeClass: Record<ButtonSize, string> = {
  s: buttonClasses.sizeS,
  m: buttonClasses.sizeM,
  l: buttonClasses.sizeL,
};

export interface ButtonLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** Internal route ("/components") or an absolute URL (opens in a new tab). */
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  iconOnly?: boolean;
  /** Plain `<a href>` even for a same-origin path (e.g. Storybook, served outside the SPA). */
  native?: boolean;
}

/** A link that looks exactly like the library `Button`. */
export function ButtonLink({
  to,
  variant = "secondary",
  size = "m",
  leadingIcon,
  trailingIcon,
  iconOnly,
  native,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const external = /^https?:\/\//.test(to);
  const cls = buildClassName(
    buttonClasses.button,
    variantClass[variant],
    sizeClass[size],
    iconOnly && buttonClasses.iconOnly,
    styles.link,
    className,
  );
  const content = iconOnly ? (
    <span className={buttonClasses.icon} aria-hidden="true">
      {leadingIcon ?? children}
    </span>
  ) : (
    <>
      {leadingIcon && (
        <span className={buttonClasses.icon} aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <span className={buttonClasses.label}>{children}</span>
      {trailingIcon && (
        <span className={buttonClasses.icon} aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </>
  );
  if (external || native) {
    return (
      <a
        href={to}
        className={cls}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        data-variant={variant}
        {...rest}
      >
        {content}
      </a>
    );
  }
  return (
    <Link to={to} className={cls} data-variant={variant} {...rest}>
      {content}
    </Link>
  );
}
