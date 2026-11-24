import React from "react";
import classes from "./Button.module.scss";
import { buildClassName } from "/@/core/util";

/** final.pen → B/C "Glass · Tinted": masters `Button/{Primary|Tonal|Secondary|Ghost|Danger}/{S|M|L}`. */
export type ButtonVariant = "primary" | "tonal" | "secondary" | "ghost" | "danger";
/** S · 32, M · 40, L · 48 (height in design px). */
export type ButtonSize = "s" | "m" | "l";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  /** Visual treatment. Every variant is a translucent glass pill (one set for canvas and media). */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon before the label (lucide-react element). Sized by the button: 14 / 16 / 18 design px. */
  leadingIcon?: React.ReactNode;
  /** Icon after the label. */
  trailingIcon?: React.ReactNode;
  /**
   * Circular icon button (width = height). Renders `leadingIcon ?? children` as the icon.
   * Give it an accessible name with `aria-label`.
   */
  iconOnly?: boolean;
  /** Stretch to the container width. */
  fullWidth?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: classes.primary,
  tonal: classes.tonal,
  secondary: classes.secondary,
  ghost: classes.ghost,
  danger: classes.danger,
};

const sizeClass: Record<ButtonSize, string> = {
  s: classes.sizeS,
  m: classes.sizeM,
  l: classes.sizeL,
};

const Button = ({
  variant = "primary",
  size = "m",
  leadingIcon,
  trailingIcon,
  iconOnly = false,
  fullWidth = false,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) => {
  return (
    <button
      type={type}
      data-variant={variant}
      data-size={size}
      className={buildClassName(
        classes.button,
        variantClass[variant],
        sizeClass[size],
        iconOnly && classes.iconOnly,
        fullWidth && classes.fullWidth,
        className,
      )}
      {...rest}
    >
      {iconOnly ? (
        <span className={classes.icon} aria-hidden="true">
          {leadingIcon ?? children}
        </span>
      ) : (
        <>
          {leadingIcon != null && (
            <span className={classes.icon} aria-hidden="true">
              {leadingIcon}
            </span>
          )}
          {children != null && <span className={classes.label}>{children}</span>}
          {trailingIcon != null && (
            <span className={classes.icon} aria-hidden="true">
              {trailingIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
