import React from "react";
import { CircleAlert } from "lucide-react";
import classes from "./Field.module.scss";
import { buildClassName } from "/@/core/util";

export type FieldKind = "text" | "search" | "select" | "multiline";

export interface FieldShellProps {
  kind: FieldKind;
  /** Search only: `md` = 48 tall (Field/Search), `sm` = 44 tall (Inset Form/Search). */
  size?: "md" | "sm";
  inputId: string;
  label?: React.ReactNode;
  /** Label sits in the small top position (focus also floats it, via CSS). */
  floating: boolean;
  invalid: boolean;
  disabled: boolean;
  filled: boolean;
  leading?: React.ReactNode;
  /** Trailing controls (clear button, chevron…), drawn before the error icon. */
  trailing?: React.ReactNode;
  /** Draws the trailing CircleAlert while invalid (Text, Prefix, Search). */
  errorIcon?: boolean;
  prefix?: React.ReactNode;
  prefixId?: string;
  helper?: React.ReactNode;
  helperId?: string;
  counter?: React.ReactNode;
  counterId?: string;
  counterOver?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Pointer-down on the container outside the control (focuses it, opens a select…). */
  onContainerPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

/** Shared anatomy for every Field kind: glass container, floating label, value row, helper/error line, counter. */
const FieldShell = ({
  kind,
  size = "md",
  inputId,
  label,
  floating,
  invalid,
  disabled,
  filled,
  leading,
  trailing,
  errorIcon = false,
  prefix,
  prefixId,
  helper,
  helperId,
  counter,
  counterId,
  counterOver = false,
  className,
  style,
  onContainerPointerDown,
  children,
}: FieldShellProps) => {
  const hasHelperRow = helper != null || counter != null;

  return (
    <div
      className={buildClassName(classes.field, className)}
      style={style}
      data-kind={kind}
      data-size={kind === "search" ? size : undefined}
      data-floating={floating || undefined}
      data-filled={filled || undefined}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
    >
      <div className={classes.container} onPointerDown={onContainerPointerDown}>
        {leading != null && (
          <span className={classes.leading} aria-hidden="true">
            {leading}
          </span>
        )}
        <div className={classes.stack}>
          {label != null && (
            <label className={classes.label} htmlFor={inputId}>
              {label}
            </label>
          )}
          <div className={classes.valueRow}>
            {prefix != null && (
              <span className={classes.prefix} id={prefixId}>
                {prefix}
              </span>
            )}
            {children}
          </div>
        </div>
        {trailing}
        {errorIcon && invalid && (
          <span className={classes.alert} aria-hidden="true">
            <CircleAlert />
          </span>
        )}
      </div>
      {hasHelperRow && (
        <div className={classes.helperRow}>
          {helper != null && (
            <div className={classes.helper} id={helperId}>
              {helper}
            </div>
          )}
          {counter != null && (
            <div className={classes.counter} id={counterId} data-over={counterOver || undefined}>
              {counter}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldShell;

/** Focuses the control when the container (not the control or a button in it) is pressed. */
export function focusOnContainerPress(
  event: React.PointerEvent<HTMLDivElement>,
  control: HTMLElement | null,
  disabled: boolean,
) {
  if (disabled || !control) return;
  const target = event.target as HTMLElement;
  if (target === control || target.closest("button, a, label, input, select, textarea")) return;
  event.preventDefault();
  control.focus();
}
