import React, { useId } from "react";
import classes from "./InsetForm.module.scss";
import InsetRowShell from "./InsetRowShell";
import { useRowDisabled } from "./InsetFormContext";
import type { InsetFormRowCommonProps } from "./InsetFormRow";
import { focusOnContainerPress } from "../Field/FieldShell";
import {
  describedBy,
  hasError,
  helperMessage,
  useAutoGrow,
  useMergedRef,
  useTextValue,
} from "../Field/fieldUtils";

export interface InsetFormTextAreaRowProps
  extends InsetFormRowCommonProps,
    Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      "value" | "defaultValue" | "children" | "disabled" | "required"
    > {
  /** Forwarded to the native `<textarea>`. */
  ref?: React.Ref<HTMLTextAreaElement>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Soft limit: `n/max` counter next to the label, red and invalid past the limit. */
  maxCount?: number;
  /** Grow with the content (default) instead of scrolling. */
  autoGrow?: boolean;
}

/** Inset Form / Row / Multiline — label (and counter) on top, full-width text below. */
const InsetFormTextAreaRow = ({
  ref,
  label,
  error,
  helperText,
  disabled: ownDisabled,
  required,
  maxCount,
  autoGrow = true,
  rows = 1,
  value,
  defaultValue,
  onValueChange,
  onChange,
  id,
  className,
  style,
  "aria-describedby": ariaDescribedBy,
  ...rest
}: InsetFormTextAreaRowProps) => {
  const disabled = useRowDisabled(ownDisabled);
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const helperId = `${autoId}-helper`;
  const counterId = `${autoId}-counter`;

  const [inputRef, setInputRef] = useMergedRef(ref);
  const { controlled, current, track } = useTextValue(value, defaultValue);
  useAutoGrow(inputRef, autoGrow, current);

  const count = current.length;
  const over = maxCount !== undefined && count > maxCount;
  const invalid = hasError(error) || over;
  const helper = helperMessage(error, helperText);

  return (
    <InsetRowShell
      kind="multiline"
      inputId={inputId}
      label={label}
      invalid={invalid}
      disabled={disabled}
      helper={helper}
      helperId={helperId}
      counter={maxCount !== undefined ? `${count}/${maxCount}` : undefined}
      counterId={counterId}
      counterOver={over}
      className={className}
      style={style}
      onPointerDown={(event) => focusOnContainerPress(event, inputRef.current, disabled)}
    >
      <textarea
        {...rest}
        ref={setInputRef}
        id={inputId}
        rows={rows}
        className={classes.textarea}
        data-auto-grow={autoGrow || undefined}
        disabled={disabled}
        required={required}
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
      />
    </InsetRowShell>
  );
};

export default InsetFormTextAreaRow;
