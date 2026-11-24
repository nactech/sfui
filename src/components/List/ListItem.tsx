import React, { useCallback, useEffect, useId, useRef } from "react";
import { Check, ChevronRight } from "lucide-react";
import classes from "./List.module.scss";
import { useListContext } from "./ListContext";
import { useSwipeReveal } from "./useSwipeReveal";
import { buildClassName } from "/@/core/util";

export interface ListSwipeAction {
  /** Visible capsule label ("Pin", "Delete") and the button's accessible name. */
  label: string;
  /** Lucide icon (16). */
  icon: React.ReactNode;
  /** `default` — amber capsule (Pin); `danger` — red capsule (Delete). Default `default`. */
  tone?: "default" | "danger";
  onSelect: () => void;
}

export interface ListItemProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title" | "onClick" | "value" | "children"> {
  ref?: React.Ref<HTMLLIElement>;
  /** Identifies the row for edit-mode selection. Rows without a value get no selection circle (Control/Action rows). */
  value?: string;
  /** Leading media: `ListThumbnail` (icon, avatar or image) or any node. */
  leading?: React.ReactNode;
  /** Title (16/500; 17/500 in Flat). Names the row's action and its selection checkbox. */
  title: React.ReactNode;
  /** Single meta line under the title (13 muted; Geist Mono 11 subtle in Flat). Truncates. */
  subtitle?: React.ReactNode;
  /** Two-line secondary text (13/18 muted, wraps, clamped to two lines). */
  meta?: React.ReactNode;
  /**
   * Trailing slot: a string/number renders as the mono value ("41 KB"); otherwise pass `ListStatus`, `Switch`, a small
   * `Button`… Interactive trailing controls stay independently clickable above the row's own action.
   */
  trailing?: React.ReactNode;
  /** Trailing chevron (hidden in edit mode). */
  chevron?: boolean;
  /** Makes the whole row a link (pressed state on the row). */
  href?: string;
  /** Anchor attributes when `href` is set. */
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  /** Makes the whole row a button (pressed state on the row). */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /** Disabled row: opaque disabled colors, no press, no swipe, not selectable. Also pass `disabled` to trailing controls. */
  disabled?: boolean;
  /**
   * Capsule actions revealed by swiping the row left (touch or mouse drag). They are real buttons in the tab order:
   * focusing one reveals them, Escape closes them.
   */
  swipeActions?: ListSwipeAction[];
}

const INTERACTIVE = "a, button, input, label, select, textarea, [tabindex]";

const isPrimitive = (node: React.ReactNode): node is string | number =>
  typeof node === "string" || typeof node === "number";

const ListItem = ({
  ref,
  value,
  leading,
  title,
  subtitle,
  meta,
  trailing,
  chevron = false,
  href,
  target,
  rel,
  onClick,
  disabled = false,
  swipeActions,
  className,
  style,
  onKeyDown,
  onBlur,
  ...rest
}: ListItemProps) => {
  const ctx = useListContext();
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const itemRef = useRef<HTMLLIElement | null>(null);
  const primaryRef = useRef<HTMLElement | null>(null);

  const editing = ctx.selectable;
  const selectableRow = editing && value !== undefined;
  const selected = editing && value !== undefined && ctx.isSelected(value);
  const actions = swipeActions ?? [];
  const swipeEnabled = actions.length > 0 && !editing && !disabled;
  const open = swipeEnabled && ctx.openSwipe === id;

  const { setOpenSwipe } = ctx;
  const setOpen = useCallback(
    (next: boolean) => setOpenSwipe(next ? id : null),
    [id, setOpenSwipe],
  );
  // Only ever close our own row (another row may have claimed the slot meanwhile).
  const close = useCallback(() => {
    if (ctx.openSwipe === id) setOpenSwipe(null);
  }, [ctx.openSwipe, id, setOpenSwipe]);

  const swipe = useSwipeReveal({ enabled: swipeEnabled, count: actions.length, open, setOpen });

  // Tapping anywhere outside an open row closes it.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!itemRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, close]);

  const setItemRef = useCallback(
    (node: HTMLLIElement | null) => {
      itemRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.RefObject<HTMLLIElement | null>).current = node;
    },
    [ref],
  );

  const interactive = !selectableRow && (href != null || onClick != null);
  const describedBy = subtitle != null || meta != null ? descId : undefined;

  let primary: React.ReactNode;
  if (interactive && href != null) {
    primary = disabled ? (
      <a
        ref={(node) => void (primaryRef.current = node)}
        id={titleId}
        role="link"
        aria-disabled="true"
        aria-describedby={describedBy}
        className={buildClassName(classes.title, classes.primary)}
      >
        {title}
      </a>
    ) : (
      <a
        ref={(node) => void (primaryRef.current = node)}
        id={titleId}
        href={href}
        target={target}
        rel={rel}
        draggable={false}
        aria-describedby={describedBy}
        className={buildClassName(classes.title, classes.primary)}
        onClick={onClick}
      >
        {title}
      </a>
    );
  } else if (interactive) {
    primary = (
      <button
        ref={(node) => void (primaryRef.current = node)}
        id={titleId}
        type="button"
        disabled={disabled}
        aria-describedby={describedBy}
        className={buildClassName(classes.title, classes.primary)}
        onClick={onClick}
      >
        {title}
      </button>
    );
  } else {
    primary = (
      <span id={titleId} className={classes.title}>
        {title}
      </span>
    );
  }

  // The selection label's ::after covers the row; this catches clicks that land on the row itself anyway
  // (e.g. assistive tech clicking the title) so the whole row always toggles.
  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectableRow || disabled || value === undefined) return;
    const hit = (event.target as HTMLElement).closest(INTERACTIVE);
    if (hit && event.currentTarget.contains(hit)) return;
    ctx.toggle(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
    onKeyDown?.(event);
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      const inActions = (event.target as HTMLElement).closest(`.${classes.swipeActions}`) != null;
      setOpen(false);
      if (inActions) primaryRef.current?.focus();
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLLIElement>) => {
    onBlur?.(event);
    if (open && !event.currentTarget.contains(event.relatedTarget as Node | null)) close();
  };

  return (
    <li
      ref={setItemRef}
      data-state={selected ? "selected" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-swipe={swipeEnabled ? (open ? "open" : "closed") : undefined}
      data-dragging={swipe.dragging ? "" : undefined}
      className={buildClassName(classes.item, className)}
      style={{ "--_offset": swipe.offset, ...style } as React.CSSProperties}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      {...rest}
    >
      <div
        className={classes.content}
        data-interactive={(interactive || selectableRow) && !disabled ? "" : undefined}
        onClick={selectableRow ? handleContentClick : undefined}
        {...(swipeEnabled ? swipe.handlers : null)}
      >
        {editing && (
          <span className={classes.select}>
            {selectableRow && (
              <label className={classes.selectHit}>
                <input
                  type="checkbox"
                  className={classes.selectInput}
                  checked={selected}
                  disabled={disabled}
                  aria-labelledby={titleId}
                  aria-describedby={describedBy}
                  onChange={() => {
                    if (value !== undefined) ctx.toggle(value);
                  }}
                />
                <span className={classes.selectCircle} aria-hidden="true">
                  <Check className={classes.selectCheck} />
                </span>
              </label>
            )}
          </span>
        )}

        {leading != null && <span className={classes.leading}>{leading}</span>}

        <div className={classes.body}>
          <div className={classes.text}>
            {primary}
            {(subtitle != null || meta != null) && (
              <span id={descId} className={classes.description}>
                {subtitle != null && <span className={classes.subtitle}>{subtitle}</span>}
                {meta != null && <span className={classes.meta}>{meta}</span>}
              </span>
            )}
          </div>

          {(trailing != null || (chevron && !editing)) && (
            <div className={classes.trail}>
              {trailing != null &&
                (isPrimitive(trailing) ? (
                  <span className={classes.value}>{trailing}</span>
                ) : (
                  <span className={classes.trailing}>{trailing}</span>
                ))}
              {chevron && !editing && <ChevronRight className={classes.chevron} aria-hidden="true" />}
            </div>
          )}
        </div>
      </div>

      {swipeEnabled && (
        <div className={classes.swipeActions} role="group" aria-labelledby={titleId}>
          <div className={classes.swipeTrack}>
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                data-tone={action.tone ?? "default"}
                className={classes.swipeAction}
                onFocus={() => setOpen(true)}
                onClick={(event) => {
                  action.onSelect();
                  const keyboard = event.detail === 0;
                  // Keyboard users keep their place: focus returns to the row's own action, or the row stays open.
                  if (keyboard && !primaryRef.current) return;
                  setOpen(false);
                  if (keyboard) primaryRef.current?.focus();
                }}
              >
                <span className={classes.swipeIcon} aria-hidden="true">
                  {action.icon}
                </span>
                <span className={classes.swipeLabel}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </li>
  );
};

export default ListItem;
