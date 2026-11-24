import React from "react";
import { CircleAlert } from "lucide-react";
import classes from "./InsetForm.module.scss";
import { buildClassName } from "/@/core/util";

export interface InsetRowShellProps {
  kind: "text" | "select" | "multiline";
  inputId: string;
  label: React.ReactNode;
  invalid: boolean;
  disabled: boolean;
  prefix?: React.ReactNode;
  prefixId?: string;
  /** Drawn after the error icon (the select's chevrons). */
  trailing?: React.ReactNode;
  helper?: React.ReactNode;
  helperId?: string;
  counter?: React.ReactNode;
  counterId?: string;
  counterOver?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

/** Shared anatomy of an Inset Form row: label left, control right, error line under the control. */
const InsetRowShell = ({
  kind,
  inputId,
  label,
  invalid,
  disabled,
  prefix,
  prefixId,
  trailing,
  helper,
  helperId,
  counter,
  counterId,
  counterOver = false,
  className,
  style,
  onPointerDown,
  children,
}: InsetRowShellProps) => {
  const labelEl = (
    <label className={classes.rowLabel} htmlFor={inputId}>
      {label}
    </label>
  );

  return (
    <div
      className={buildClassName(classes.row, className)}
      style={style}
      data-kind={kind}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      onPointerDown={onPointerDown}
    >
      {kind === "multiline" ? (
        <div className={classes.main}>
          <div className={classes.top}>
            {labelEl}
            {counter != null && (
              <span className={classes.counter} id={counterId} data-over={counterOver || undefined}>
                {counter}
              </span>
            )}
          </div>
          {children}
        </div>
      ) : (
        <div className={classes.main}>
          {labelEl}
          <div className={classes.value}>
            {prefix != null && (
              <span className={classes.prefix} id={prefixId}>
                {prefix}
              </span>
            )}
            {children}
          </div>
          {invalid && (
            <span className={classes.alert} aria-hidden="true">
              <CircleAlert />
            </span>
          )}
          {trailing}
        </div>
      )}
      {helper != null && (
        <div className={classes.helper} id={helperId}>
          {helper}
        </div>
      )}
    </div>
  );
};

export default InsetRowShell;
