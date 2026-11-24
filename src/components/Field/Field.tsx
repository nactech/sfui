import React, { useId, useState } from "react";
import classes from "./Field.module.scss";
import FieldShell, { focusOnContainerPress } from "./FieldShell";
import { describedBy, hasError, helperMessage, useMergedRef, useTextValue } from "./fieldUtils";

/** Props every Field kind shares (label, helper/error line, disabled). */
export interface FieldCommonProps {
  /** Floating label inside the field. */
  label: React.ReactNode;
  /** Muted line under the field. Replaced by the error message while `error` is a node. */
  helperText?: React.ReactNode;
  /**
   * `true` marks the field invalid (helper text turns red); a string/node also replaces the helper text
   * with that message. Sets `aria-invalid` and links the message with `aria-describedby`.
   */
  error?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
}

export interface TextFieldProps
  extends FieldCommonProps,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "prefix" | "size" | "value" | "defaultValue" | "children" | "disabled" | "required"
    > {
  /** Forwarded to the native `<input>`. */
  ref?: React.Ref<HTMLInputElement>;
  value?: string;
  defaultValue?: string;
  /** Called with the new text on every change (alongside the native `onChange`). */
  onValueChange?: (value: string) => void;
  /** Fixed text or icon before the value (the "Prefix" kind, e.g. `t.me/addstickers/`). */
  prefix?: React.ReactNode;
  /**
   * Soft limit: shows an `n/max` counter at the end of the helper line. Typing past it is allowed; the counter
   * turns red and the field becomes invalid. Use the native `maxLength` for a hard limit.
   */
  maxCount?: number;
}

/**
 * Field / Text and Field / Prefix — glass field with a floating label (M3 filled anatomy).
 * `className`/`style` go to the outer wrapper; every other native prop goes to the `<input>`.
 */
const TextField = ({
  ref,
  label,
  helperText,
  error,
  disabled = false,
  required,
  prefix,
  maxCount,
  value,
  defaultValue,
  onValueChange,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  id,
  className,
  style,
  type = "text",
  "aria-describedby": ariaDescribedBy,
  ...rest
}: TextFieldProps) => {
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const helperId = `${autoId}-helper`;
  const counterId = `${autoId}-counter`;
  const prefixId = `${autoId}-prefix`;

  const [inputRef, setInputRef] = useMergedRef(ref);
  const { controlled, current, track } = useTextValue(value, defaultValue);
  const [focused, setFocused] = useState(false);

  const count = current.length;
  const over = maxCount !== undefined && count > maxCount;
  const invalid = hasError(error) || over;
  const helper = helperMessage(error, helperText);
  const filled = count > 0;
  const floating = focused || filled || Boolean(placeholder) || prefix != null;
  const prefixIsText = typeof prefix === "string" || typeof prefix === "number";

  return (
    <FieldShell
      kind="text"
      inputId={inputId}
      label={label}
      floating={floating}
      invalid={invalid}
      disabled={disabled}
      filled={filled}
      errorIcon
      prefix={prefix}
      prefixId={prefixId}
      helper={helper}
      helperId={helperId}
      counter={maxCount !== undefined ? `${count}/${maxCount}` : undefined}
      counterId={counterId}
      counterOver={over}
      className={className}
      style={style}
      onContainerPointerDown={(event) => focusOnContainerPress(event, inputRef.current, disabled)}
    >
      <input
        {...rest}
        ref={setInputRef}
        id={inputId}
        type={type}
        className={classes.input}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy(
          prefixIsText && prefixId,
          helper != null && helperId,
          maxCount !== undefined && counterId,
          ariaDescribedBy,
        )}
        {...(controlled ? { value } : { defaultValue })}
        onChange={(event) => {
          track(event.target.value);
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
      />
    </FieldShell>
  );
};

export default TextField;
