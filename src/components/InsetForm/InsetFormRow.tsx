import React, { useId } from "react";
import classes from "./InsetForm.module.scss";
import InsetRowShell from "./InsetRowShell";
import { useRowDisabled } from "./InsetFormContext";
import { focusOnContainerPress } from "../Field/FieldShell";
import { describedBy, hasError, helperMessage, useMergedRef } from "../Field/fieldUtils";

/** Props every Inset Form row shares. */
export interface InsetFormRowCommonProps {
  /** Row label on the left (96 wide). */
  label: React.ReactNode;
  /** `true` marks the row invalid; a string/node is also shown as the error line under the control. */
  error?: React.ReactNode;
  /** Muted line under the control (the frames only draw the error line; prefer the group `footer`). */
  helperText?: React.ReactNode;
  /** Defaults to the group's `disabled`. */
  disabled?: boolean;
  required?: boolean;
}

export interface InsetFormRowProps
  extends InsetFormRowCommonProps,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "prefix" | "size" | "value" | "defaultValue" | "children" | "disabled" | "required"
    > {
  /** Forwarded to the native `<input>`. */
  ref?: React.Ref<HTMLInputElement>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Fixed text or icon before the value (Inset Form/Row/Prefix). */
  prefix?: React.ReactNode;
}

/**
 * Inset Form / Row / Text and Row / Prefix. `className`/`style` go to the row; other native props to the `<input>`.
 */
const InsetFormRow = ({
  ref,
  label,
  error,
  helperText,
  disabled: ownDisabled,
  required,
  prefix,
  value,
  defaultValue,
  onValueChange,
  onChange,
  id,
  className,
  style,
  type = "text",
  "aria-describedby": ariaDescribedBy,
  ...rest
}: InsetFormRowProps) => {
  const disabled = useRowDisabled(ownDisabled);
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const helperId = `${autoId}-helper`;
  const prefixId = `${autoId}-prefix`;

  const [inputRef, setInputRef] = useMergedRef(ref);
  const controlled = value !== undefined;
  const invalid = hasError(error);
  const helper = helperMessage(error, helperText);
  const prefixIsText = typeof prefix === "string" || typeof prefix === "number";

  return (
    <InsetRowShell
      kind="text"
      inputId={inputId}
      label={label}
      invalid={invalid}
      disabled={disabled}
      prefix={prefix}
      prefixId={prefixId}
      helper={helper}
      helperId={helperId}
      className={className}
      style={style}
      onPointerDown={(event) => focusOnContainerPress(event, inputRef.current, disabled)}
    >
      <input
        {...rest}
        ref={setInputRef}
        id={inputId}
        type={type}
        className={classes.input}
        disabled={disabled}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy(prefixIsText && prefixId, helper != null && helperId, ariaDescribedBy)}
        {...(controlled ? { value } : { defaultValue })}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
      />
    </InsetRowShell>
  );
};

export default InsetFormRow;
