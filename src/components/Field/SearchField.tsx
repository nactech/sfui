import React, { useId } from "react";
import { CircleX, Search } from "lucide-react";
import classes from "./Field.module.scss";
import FieldShell, { focusOnContainerPress } from "./FieldShell";
import { describedBy, hasError, helperMessage, useMergedRef, useTextValue } from "./fieldUtils";

export interface SearchFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "prefix" | "size" | "value" | "defaultValue" | "children" | "type" | "disabled"
  > {
  /** Forwarded to the native `<input type="search">`. */
  ref?: React.Ref<HTMLInputElement>;
  /** Accessible name (the search kind has no visible label). Also the default placeholder. */
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called after the clear button (or Escape) empties the field. */
  onClear?: () => void;
  /**
   * Keyboard hint drawn as a key cap while the field is empty, e.g. `"⌘K"`. Visual only — bind the shortcut
   * yourself and pass `aria-keyshortcuts` if you want it announced.
   */
  shortcut?: React.ReactNode;
  /** Shown under the field (e.g. "No matches for …" with `error`). */
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  /** `md` — Field/Search, 48 tall. `sm` — Inset Form/Search, 44 tall, no error icon. */
  size?: "md" | "sm";
  /** Accessible name of the clear button. */
  clearLabel?: string;
}

/** Field / Search — glass capsule with a leading search icon, a clear button when filled and an optional key hint. */
const SearchField = ({
  ref,
  label = "Search",
  value,
  defaultValue,
  onValueChange,
  onClear,
  onChange,
  onKeyDown,
  shortcut,
  helperText,
  error,
  disabled = false,
  size = "md",
  clearLabel = "Clear search",
  placeholder,
  id,
  className,
  style,
  "aria-describedby": ariaDescribedBy,
  ...rest
}: SearchFieldProps) => {
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const helperId = `${autoId}-helper`;

  const [inputRef, setInputRef] = useMergedRef(ref);
  const { controlled, current, track } = useTextValue(value, defaultValue);

  const invalid = hasError(error);
  const helper = helperMessage(error, helperText);
  const filled = current.length > 0;

  const clear = () => {
    const input = inputRef.current;
    if (!controlled && input) input.value = "";
    track("");
    onValueChange?.("");
    onClear?.();
    input?.focus();
  };

  let trailing: React.ReactNode = null;
  if (filled && !disabled) {
    trailing = (
      <button
        type="button"
        className={classes.clear}
        aria-label={clearLabel}
        aria-controls={inputId}
        // Keep focus in the input while clicking.
        onPointerDown={(event) => event.preventDefault()}
        onClick={clear}
      >
        <CircleX />
      </button>
    );
  } else if (!filled && !disabled && shortcut != null) {
    trailing = (
      <kbd className={classes.kbd} aria-hidden="true">
        {shortcut}
      </kbd>
    );
  }

  return (
    <FieldShell
      kind="search"
      size={size}
      inputId={inputId}
      floating
      invalid={invalid}
      disabled={disabled}
      filled={filled}
      leading={<Search />}
      trailing={trailing}
      errorIcon={size === "md"}
      helper={helper}
      helperId={helperId}
      className={className}
      style={style}
      onContainerPointerDown={(event) => focusOnContainerPress(event, inputRef.current, disabled)}
    >
      <input
        {...rest}
        ref={setInputRef}
        id={inputId}
        type="search"
        className={classes.input}
        disabled={disabled}
        aria-label={label}
        placeholder={placeholder ?? label}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy(helper != null && helperId, ariaDescribedBy)}
        {...(controlled ? { value } : { defaultValue })}
        onChange={(event) => {
          track(event.target.value);
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && event.key === "Escape" && filled) {
            event.preventDefault();
            clear();
          }
        }}
      />
    </FieldShell>
  );
};

export default SearchField;
