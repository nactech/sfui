import React, { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import classes from "./Field.module.scss";
import FieldShell from "./FieldShell";
import type { FieldCommonProps } from "./Field";
import { describedBy, hasError, helperMessage, useMergedRef } from "./fieldUtils";

export interface SelectOption {
  value: string;
  /** Plain text: native `<option>`s cannot render markup. */
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps
  extends FieldCommonProps,
    Omit<
      React.SelectHTMLAttributes<HTMLSelectElement>,
      "value" | "defaultValue" | "children" | "multiple" | "size" | "disabled" | "required"
    > {
  /** Forwarded to the native `<select>`. */
  ref?: React.Ref<HTMLSelectElement>;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Muted text shown while nothing is chosen ("Choose…"). Rendered as a hidden empty option. */
  placeholder?: string;
}

type PickerSelect = HTMLSelectElement & { showPicker?: () => void };

/**
 * Field / Select — a native `<select>` dressed as a glass field with a floating label and a ChevronDown.
 * The popup is the platform's own; a Menu-based popup will replace it in a later version.
 */
const SelectField = ({
  ref,
  label,
  helperText,
  error,
  disabled = false,
  required,
  options,
  value,
  defaultValue,
  onValueChange,
  onChange,
  placeholder,
  id,
  className,
  style,
  "aria-describedby": ariaDescribedBy,
  ...rest
}: SelectFieldProps) => {
  const autoId = useId();
  const selectId = id ?? `${autoId}-select`;
  const helperId = `${autoId}-helper`;

  const [selectRef, setSelectRef] = useMergedRef(ref);
  const controlled = value !== undefined;
  const initial = defaultValue ?? (placeholder !== undefined ? "" : (options[0]?.value ?? ""));
  const [mirror, setMirror] = useState(initial);
  const current = controlled ? value : mirror;

  const invalid = hasError(error);
  const helper = helperMessage(error, helperText);
  const empty = current === "";

  return (
    <FieldShell
      kind="select"
      inputId={selectId}
      label={label}
      floating
      invalid={invalid}
      disabled={disabled}
      filled={!empty}
      trailing={
        <span className={classes.chevron} aria-hidden="true">
          <ChevronDown />
        </span>
      }
      helper={helper}
      helperId={helperId}
      className={className}
      style={style}
      onContainerPointerDown={(event) => {
        const select = selectRef.current as PickerSelect | null;
        if (disabled || !select || event.target === select) return;
        if ((event.target as HTMLElement).closest("label")) return;
        event.preventDefault();
        select.focus();
        try {
          select.showPicker?.();
        } catch {
          // showPicker needs a user gesture and is missing in older engines; focus is enough there.
        }
      }}
    >
      <select
        {...rest}
        ref={setSelectRef}
        id={selectId}
        className={classes.input}
        disabled={disabled}
        required={required}
        data-empty={empty || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy(helper != null && helperId, ariaDescribedBy)}
        {...(controlled ? { value } : { defaultValue: initial })}
        onChange={(event) => {
          if (!controlled) setMirror(event.target.value);
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
      >
        {placeholder !== undefined && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
};

export default SelectField;
