import React from "react";
import classes from "./Radio.module.scss";
import { buildClassName } from "/@/core/util";
import { useRadioGroup } from "./RadioContext";

/** final.pen → C/D "Expressive × Glass", masters `Radio/On`, `Radio/Off`. Use inside `RadioGroup`. */
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "size"> {
  /** Forwarded to the native `<input type="radio">`. */
  ref?: React.Ref<HTMLInputElement>;
  /** The value reported to `RadioGroup.onValueChange`. */
  value: string;
  /** Optional visible label, rendered after the 40×40 target and wired as its accessible name. */
  label?: React.ReactNode;
}

const Radio = ({ value, label, disabled, className, style, onChange, ...inputProps }: RadioProps) => {
  const group = useRadioGroup();
  const isDisabled = Boolean(disabled || group?.disabled);
  // Inside a group, the group owns name + checked; standalone it is a plain native radio.
  const groupProps = group
    ? { name: group.name, checked: group.value === value }
    : {};

  return (
    <label
      className={buildClassName(classes.root, className)}
      style={style}
      data-disabled={isDisabled ? "" : undefined}
    >
      <span className={classes.control}>
        <input
          {...inputProps}
          {...groupProps}
          type="radio"
          value={value}
          className={classes.input}
          disabled={isDisabled}
          onChange={(event) => {
            onChange?.(event);
            if (event.currentTarget.checked) group?.select(value);
          }}
        />
        <span className={classes.layer} aria-hidden="true" />
        <span className={classes.ring} aria-hidden="true">
          <span className={classes.dot} />
        </span>
      </span>
      {label != null && <span className={classes.label}>{label}</span>}
    </label>
  );
};

export default Radio;
