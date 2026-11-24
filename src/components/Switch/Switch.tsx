import React from "react";
import { Check } from "lucide-react";
import classes from "./Switch.module.scss";
import { buildClassName } from "/@/core/util";
import { useControllableState } from "/@/hooks/useControllableState";

/** final.pen → C/D "Expressive × Glass", masters `Switch/On`, `Switch/Off`. */
export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "role" | "checked" | "defaultChecked" | "size"> {
  /** Forwarded to the native `<input type="checkbox" role="switch">`. */
  ref?: React.Ref<HTMLInputElement>;
  /** Controlled state. */
  checked?: boolean;
  /** Initial state when uncontrolled. Default `false`. */
  defaultChecked?: boolean;
  /** Fires with the next state on every user toggle (pointer, Space, label click). */
  onCheckedChange?: (checked: boolean) => void;
  /** Optional visible label, rendered after the switch and wired as its accessible name. */
  label?: React.ReactNode;
  /** Over photos/video the track turns to glass ("Over content → glass" row). */
  overContent?: boolean;
}

const Switch = ({
  checked,
  defaultChecked = false,
  onCheckedChange,
  onChange,
  label,
  overContent = false,
  disabled,
  className,
  style,
  ...inputProps
}: SwitchProps) => {
  const [isOn, setOn] = useControllableState(checked, defaultChecked, onCheckedChange);

  return (
    <label
      className={buildClassName(classes.root, className)}
      style={style}
      data-state={isOn ? "checked" : "unchecked"}
      data-disabled={disabled ? "" : undefined}
      data-over-content={overContent ? "" : undefined}
    >
      <span className={classes.control}>
        <input
          {...inputProps}
          type="checkbox"
          role="switch"
          className={classes.input}
          checked={isOn}
          disabled={disabled}
          onChange={(event) => {
            onChange?.(event);
            setOn(event.currentTarget.checked);
          }}
        />
        <span className={classes.track} aria-hidden="true">
          <span className={classes.knob}>
            <Check className={classes.check} />
          </span>
        </span>
      </span>
      {label != null && <span className={classes.label}>{label}</span>}
    </label>
  );
};

export default Switch;
