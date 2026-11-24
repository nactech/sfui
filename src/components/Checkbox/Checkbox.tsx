import React, { useCallback, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import classes from "./Checkbox.module.scss";
import { buildClassName } from "/@/core/util";
import { useControllableState } from "/@/hooks/useControllableState";

export type CheckboxState = boolean | "mixed";

/** final.pen → C/D "Expressive × Glass", masters `Checkbox/On`, `Checkbox/Off`, `Checkbox/Mixed`. */
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "defaultChecked" | "size"> {
  /** Forwarded to the native `<input type="checkbox">`. */
  ref?: React.Ref<HTMLInputElement>;
  /** Controlled state. `"mixed"` renders the dash and exposes `aria-checked="mixed"`. */
  checked?: CheckboxState;
  /** Initial state when uncontrolled. Default `false`. */
  defaultChecked?: CheckboxState;
  /** Fires with the next state on every user toggle. Activating a mixed checkbox checks it (`true`). */
  onCheckedChange?: (checked: boolean) => void;
  /** Optional visible label, rendered after the 40×40 target and wired as its accessible name. */
  label?: React.ReactNode;
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as React.RefObject<T | null>).current = node;
}

const Checkbox = ({
  ref,
  checked,
  defaultChecked = false,
  onCheckedChange,
  onChange,
  label,
  disabled,
  className,
  style,
  ...inputProps
}: CheckboxProps) => {
  const [state, setState] = useControllableState<CheckboxState>(checked, defaultChecked);
  const mixed = state === "mixed";

  const inputRef = useRef<HTMLInputElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  // `indeterminate` only exists as a DOM property.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = mixed;
  }, [mixed]);

  return (
    <label
      className={buildClassName(classes.root, className)}
      style={style}
      data-state={mixed ? "mixed" : state ? "checked" : "unchecked"}
      data-disabled={disabled ? "" : undefined}
    >
      <span className={classes.control}>
        <input
          {...inputProps}
          ref={setRefs}
          type="checkbox"
          className={classes.input}
          checked={state === true}
          aria-checked={mixed ? "mixed" : undefined}
          disabled={disabled}
          onChange={(event) => {
            const next = event.currentTarget.checked;
            onChange?.(event);
            setState(next);
            onCheckedChange?.(next);
          }}
        />
        <span className={classes.layer} aria-hidden="true" />
        <span className={classes.box} aria-hidden="true">
          <Check className={classes.check} />
          <span className={classes.dash} />
        </span>
      </span>
      {label != null && <span className={classes.label}>{label}</span>}
    </label>
  );
};

export default Checkbox;
