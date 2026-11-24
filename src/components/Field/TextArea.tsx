import React, { useId, useState } from "react";
import classes from "./Field.module.scss";
import FieldShell, { focusOnContainerPress } from "./FieldShell";
import type { FieldCommonProps } from "./Field";
import { describedBy, hasError, helperMessage, useAutoGrow, useMergedRef, useTextValue } from "./fieldUtils";

export interface TextAreaProps
  extends FieldCommonProps,
    Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      "value" | "defaultValue" | "children" | "disabled" | "required"
    > {
  /** Forwarded to the native `<textarea>`. */
  ref?: React.Ref<HTMLTextAreaElement>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Soft limit with an `n/max` counter, red and invalid past the limit (see `TextField`). */
  maxCount?: number;
  /** Grow with the content instead of scrolling. */
  autoGrow?: boolean;
}

/** Field / Multiline — glass text area with a floating label, helper line and optional counter. */
const TextArea = ({
  ref,
  label,
  helperText,
  error,
  disabled = false,
  required,
  maxCount,
  autoGrow = false,
  rows = 3,
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
  "aria-describedby": ariaDescribedBy,
  ...rest
}: TextAreaProps) => {
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const helperId = `${autoId}-helper`;
  const counterId = `${autoId}-counter`;

  const [inputRef, setInputRef] = useMergedRef(ref);
  const { controlled, current, track } = useTextValue(value, defaultValue);
  const [focused, setFocused] = useState(false);
  useAutoGrow(inputRef, autoGrow, current);

  const count = current.length;
  const over = maxCount !== undefined && count > maxCount;
  const invalid = hasError(error) || over;
  const helper = helperMessage(error, helperText);
  const filled = count > 0;

  return (
    <FieldShell
      kind="multiline"
      inputId={inputId}
      label={label}
      floating={focused || filled || Boolean(placeholder)}
      invalid={invalid}
      disabled={disabled}
      filled={filled}
      helper={helper}
      helperId={helperId}
      counter={maxCount !== undefined ? `${count}/${maxCount}` : undefined}
      counterId={counterId}
      counterOver={over}
      className={className}
      style={style}
      onContainerPointerDown={(event) => focusOnContainerPress(event, inputRef.current, disabled)}
    >
      <textarea
        {...rest}
        ref={setInputRef}
        id={inputId}
        rows={rows}
        className={classes.input}
        data-auto-grow={autoGrow || undefined}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy(
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

export default TextArea;
