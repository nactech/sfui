import React, { useId, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import classes from "./InsetForm.module.scss";
import InsetRowShell from "./InsetRowShell";
import { useRowDisabled } from "./InsetFormContext";
import type { InsetFormRowCommonProps } from "./InsetFormRow";
import type { SelectOption } from "../Field/SelectField";
import { describedBy, hasError, helperMessage, useMergedRef } from "../Field/fieldUtils";

export interface InsetFormSelectRowProps
  extends InsetFormRowCommonProps,
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
  /** Muted text while nothing is chosen ("Choose…"). Rendered as a hidden empty option. */
  placeholder?: string;
}

type PickerSelect = HTMLSelectElement & { showPicker?: () => void };

/** Inset Form / Row / Select — native `<select>`, value right-aligned, ChevronsUpDown at the end. */
const InsetFormSelectRow = ({
  ref,
  label,
  error,
  helperText,
  disabled: ownDisabled,
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
}: InsetFormSelectRowProps) => {
  const disabled = useRowDisabled(ownDisabled);
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

  return (
    <InsetRowShell
      kind="select"
      inputId={selectId}
      label={label}
      invalid={invalid}
      disabled={disabled}
      trailing={
        <span className={classes.chevrons} aria-hidden="true">
          <ChevronsUpDown />
        </span>
      }
      helper={helper}
      helperId={helperId}
      className={className}
      style={style}
      onPointerDown={(event) => {
        const select = selectRef.current as PickerSelect | null;
        const target = event.target as HTMLElement;
        if (disabled || !select || target === select || target.closest("label, button, a")) return;
        event.preventDefault();
        select.focus();
        try {
          select.showPicker?.();
        } catch {
          // Needs a user gesture / newer engine; focus alone is fine.
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
        data-empty={current === "" || undefined}
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
    </InsetRowShell>
  );
};

export default InsetFormSelectRow;
