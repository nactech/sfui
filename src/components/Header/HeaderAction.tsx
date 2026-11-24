import React from "react";
import classes from "./Header.module.scss";
import { buildClassName } from "/@/core/util";

/**
 * 44×44 icon button that lives inside the Header's glass action capsule (masters
 * `Header/Android+Web/*` → `Actions` → `Action <icon>`). It has no fill of its own; the capsule is the glass.
 * Works as a `Menu` trigger (forwards ref, id, handlers and aria props).
 */
export interface HeaderActionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  ref?: React.Ref<HTMLButtonElement>;
  /** Lucide icon element, drawn at 19 design px. */
  icon: React.ReactNode;
  /** Required: icon-only buttons need an accessible name. */
  "aria-label": string;
}

const HeaderAction = ({ icon, type = "button", className, ...rest }: HeaderActionProps) => (
  <button type={type} className={buildClassName(classes.action, className)} {...rest}>
    <span className={classes.actionIcon} aria-hidden="true">
      {icon}
    </span>
  </button>
);

export default HeaderAction;
