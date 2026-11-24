import React, { useState } from "react";
import { Ellipsis } from "lucide-react";
import classes from "./SelectionToolbar.module.scss";
import { buildClassName } from "/@/core/util";
import { PlatformContext, usePlatform, type PlatformSetting } from "/@/core/platform";
import Menu from "../Menu";

export interface SelectionToolbarAction {
  /** Visible label under the icon; also the button's accessible name. */
  label: string;
  /** Lucide icon (or any ReactNode), drawn at 22 design px. */
  icon: React.ReactNode;
  onSelect: () => void;
  /** Danger tint (Delete). */
  destructive?: boolean;
  /** Disable just this action (the whole bar is disabled at `count === 0`). */
  disabled?: boolean;
}

/**
 * final.pen → H/A3 "Header / Selection flow" (frame gQmek), master `Selection Toolbar/iOS` (RtAEo).
 * The bottom toolbar that replaces the tab bar while items are selected on iOS: a glass capsule of
 * icon-over-label actions (Share, Move, Duplicate, Delete) plus a separate round `•••` for the rest.
 * Pair it with `Header` in selection mode, which on iOS keeps only Cancel and Select All.
 *
 * Android + Web: renders the same actions in the Android + Web tab-bar grammar (72 capsule, Geist, state
 * layer on press, hover). The web flow normally uses `SelectionBar` in place of the header instead.
 */
export interface SelectionToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  ref?: React.Ref<HTMLDivElement>;
  /** Target actions in the capsule, in order. Keep it to about four; the rest go in `moreMenu`. */
  actions: SelectionToolbarAction[];
  /** Number of selected items. At `0` every action (and `•••`) is disabled (H/A3 step 2). */
  count?: number;
  /** `MenuItem`s for the round `•••` button. Omit to hide it. */
  moreMenu?: React.ReactNode;
  /** Accessible name of the `•••` button. Default `"More actions"`. */
  moreLabel?: string;
  /** Disable the whole toolbar regardless of `count`. */
  disabled?: boolean;
  /**
   * `true` (default): `position: fixed` at the bottom centre, clear of the home indicator
   * (`env(safe-area-inset-bottom)`). `false`: in flow (previews, custom shells).
   */
  pinned?: boolean;
  /** Accessible name of the toolbar. Default `"Selection actions"`. */
  "aria-label"?: string;
  /** Which implementation to render. Default: nearest `ConfigProvider`, else detected from the user agent. */
  platform?: PlatformSetting;
}

const SelectionToolbar = ({
  actions,
  count,
  moreMenu,
  moreLabel = "More actions",
  disabled = false,
  pinned = true,
  "aria-label": ariaLabel = "Selection actions",
  platform: platformProp,
  className,
  onKeyDown,
  ...rest
}: SelectionToolbarProps) => {
  const platform = usePlatform(platformProp);
  const allDisabled = disabled || count === 0;
  const hasMore = moreMenu != null;

  // Roving tabindex (WAI-ARIA toolbar): one Tab stop, arrows move between enabled controls.
  const enabled = [...actions.map((action) => !allDisabled && !action.disabled), ...(hasMore ? [!allDisabled] : [])];
  const [active, setActive] = useState(0);
  const firstEnabled = enabled.indexOf(true);
  const current = enabled[active] ? active : firstEnabled;
  const tabIndexFor = (index: number) => (index === current ? 0 : -1);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-toolbar-item]"));
    const from = items.indexOf(document.activeElement as HTMLElement);
    if (from === -1) return;
    const step = (dir: 1 | -1, start: number) => {
      for (let i = 1; i <= items.length; i++) {
        const next = (start + dir * i + items.length) % items.length;
        if (enabled[next]) return next;
      }
      return start;
    };
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    let target: number | undefined;
    if (event.key === "ArrowRight") target = step(rtl ? -1 : 1, from);
    else if (event.key === "ArrowLeft") target = step(rtl ? 1 : -1, from);
    else if (event.key === "Home") target = enabled.indexOf(true);
    else if (event.key === "End") target = enabled.lastIndexOf(true);
    if (target === undefined || target < 0) return;
    event.preventDefault();
    setActive(target);
    items[target]?.focus();
  };

  const moreIndex = actions.length;
  const moreButton = (
    <button
      type="button"
      className={classes.more}
      aria-label={moreLabel}
      disabled={allDisabled}
      tabIndex={tabIndexFor(moreIndex)}
      data-toolbar-item=""
      onFocus={() => setActive(moreIndex)}
    >
      <span className={classes.icon} aria-hidden="true">
        <Ellipsis />
      </span>
    </button>
  );

  return (
    <PlatformContext.Provider value={platform}>
      <div
        role="toolbar"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        aria-disabled={allDisabled || undefined}
        className={buildClassName(classes.root, className)}
        data-platform={platform}
        data-pinned={pinned ? undefined : "false"}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <div className={classes.capsule}>
          {actions.map((action, index) => (
            <button
              key={action.label}
              type="button"
              className={classes.action}
              data-tone={action.destructive ? "danger" : undefined}
              disabled={allDisabled || action.disabled}
              tabIndex={tabIndexFor(index)}
              data-toolbar-item=""
              onFocus={() => setActive(index)}
              onClick={() => action.onSelect()}
            >
              <span className={classes.icon} aria-hidden="true">
                {action.icon}
              </span>
              <span className={classes.label}>{action.label}</span>
            </button>
          ))}
        </div>
        {hasMore && (allDisabled ? moreButton : <Menu trigger={moreButton}>{moreMenu}</Menu>)}
      </div>
    </PlatformContext.Provider>
  );
};

export default SelectionToolbar;
