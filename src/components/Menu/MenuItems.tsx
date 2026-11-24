import React, { useCallback, useContext, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import classes from "./Menu.module.scss";
import { buildClassName } from "/@/core/util";
import { MenuRadioContext, useMenuPanel, type MenuRadioContextValue } from "./context";
import { MenuLayer } from "./MenuPanel";

type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect" | "children" | "type" | "role">;

/* ───────────────────────────── list rows ───────────────────────────── */

interface RowProps extends ButtonProps {
  ref?: React.Ref<HTMLButtonElement>;
  role: "menuitem" | "menuitemradio" | "menuitemcheckbox";
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  children?: React.ReactNode;
  rowClassName?: string;
}

/** 44px row: full-width state-layer band (`.item`) around the inset lens (`.lens`, focus ring). */
function MenuRow({
  ref,
  role,
  icon,
  trailing,
  disabled,
  destructive,
  children,
  className,
  rowClassName,
  onClick,
  ...rest
}: RowProps) {
  return (
    <button
      ref={ref}
      type="button"
      role={role}
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-menu-item=""
      data-destructive={destructive || undefined}
      className={buildClassName(classes.item, rowClassName, className)}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...rest}
    >
      <span className={classes.lens}>
        <span className={classes.icon} aria-hidden="true">
          {icon}
        </span>
        <span className={classes.label}>{children}</span>
        {trailing}
      </span>
    </button>
  );
}

export interface MenuItemProps extends ButtonProps {
  ref?: React.Ref<HTMLButtonElement>;
  /** Leading Lucide icon (20px). The 36px icon slot is always reserved so labels align. */
  icon?: React.ReactNode;
  /** Called on click / Enter / Space. Call `event.preventDefault()` to keep the menu open. */
  onSelect?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  /** Danger color for label and icon (e.g. Delete). */
  destructive?: boolean;
  /** Close the menu after selecting. Default `true`. */
  closeOnSelect?: boolean;
  children?: React.ReactNode;
}

export function MenuItem({ onSelect, closeOnSelect = true, onClick, ...rest }: MenuItemProps) {
  const ctx = useMenuPanel("MenuItem");
  return (
    <MenuRow
      role="menuitem"
      onClick={(event) => {
        onClick?.(event);
        onSelect?.(event);
        ctx.itemSelected(event, closeOnSelect);
      }}
      {...rest}
    />
  );
}

/* ───────────────────────────── separator & groups ───────────────────────────── */

export interface MenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

/** Inset hairline (12px vertical, 26px horizontal padding). */
export function MenuSeparator({ className, ...rest }: MenuSeparatorProps) {
  return (
    <div role="separator" className={buildClassName(classes.separator, className)} {...rest}>
      <span className={classes.separatorLine} />
    </div>
  );
}

export interface MenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /** Small muted caption above the group ("Sort by"). Also the group's accessible name. */
  label?: React.ReactNode;
  children?: React.ReactNode;
}

export function MenuGroup({ label, children, className, ...rest }: MenuGroupProps) {
  const labelId = useId();
  return (
    <div
      role="group"
      aria-labelledby={label != null ? labelId : undefined}
      className={buildClassName(classes.group, className)}
      {...rest}
    >
      {label != null && (
        <div id={labelId} className={classes.groupLabel} role="none">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

/* ───────────────────────────── single choice ───────────────────────────── */

export interface MenuRadioGroupProps extends Omit<MenuGroupProps, "defaultValue" | "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function MenuRadioGroup({ value, defaultValue, onValueChange, ...rest }: MenuRadioGroupProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value !== undefined ? value : uncontrolled;
  const select = useCallback(
    (next: string) => {
      if (value === undefined) setUncontrolled(next);
      onValueChange?.(next);
    },
    [value, onValueChange],
  );
  const ctx = useMemo<MenuRadioContextValue>(() => ({ value: current, select }), [current, select]);
  return (
    <MenuRadioContext.Provider value={ctx}>
      <MenuGroup {...rest} />
    </MenuRadioContext.Provider>
  );
}

export interface MenuRadioItemProps extends Omit<MenuItemProps, "destructive"> {
  value: string;
  /** Keep the menu open so the moving check stays visible (frame row 3). Default `false`. */
  closeOnSelect?: boolean;
}

/** Selected: the accent check replaces the icon, label turns accent at weight 500; no tonal fill. */
export function MenuRadioItem({ value, icon, onSelect, closeOnSelect = false, onClick, ...rest }: MenuRadioItemProps) {
  const ctx = useMenuPanel("MenuRadioItem");
  const radio = useContext(MenuRadioContext);
  if (!radio) throw new Error("<MenuRadioItem> must be rendered inside <MenuRadioGroup>.");
  const checked = radio.value === value;
  return (
    <MenuRow
      role="menuitemradio"
      aria-checked={checked}
      icon={checked ? <Check /> : icon}
      onClick={(event) => {
        onClick?.(event);
        onSelect?.(event);
        if (!event.defaultPrevented) radio.select(value);
        ctx.itemSelected(event, closeOnSelect);
      }}
      {...rest}
    />
  );
}

export interface MenuCheckboxItemProps extends Omit<MenuItemProps, "destructive"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Default `false` — toggles usually come in sets. */
  closeOnSelect?: boolean;
}

/** Same look as a selected radio item: check replaces the icon while checked. */
export function MenuCheckboxItem({
  checked,
  defaultChecked = false,
  onCheckedChange,
  icon,
  onSelect,
  closeOnSelect = false,
  onClick,
  ...rest
}: MenuCheckboxItemProps) {
  const ctx = useMenuPanel("MenuCheckboxItem");
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : uncontrolled;
  return (
    <MenuRow
      role="menuitemcheckbox"
      aria-checked={isChecked}
      icon={isChecked ? <Check /> : icon}
      onClick={(event) => {
        onClick?.(event);
        onSelect?.(event);
        if (!event.defaultPrevented) {
          if (checked === undefined) setUncontrolled(!isChecked);
          onCheckedChange?.(!isChecked);
        }
        ctx.itemSelected(event, closeOnSelect);
      }}
      {...rest}
    />
  );
}

/* ───────────────────────────── quick actions ───────────────────────────── */

export interface MenuQuickActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}

/** Top row of icon-over-label actions. One arrow-key stop vertically; ← → move inside it. */
export function MenuQuickActions({ className, children, ...rest }: MenuQuickActionsProps) {
  return (
    <div role="group" data-menu-quick-row="" className={buildClassName(classes.quickRow, className)} {...rest}>
      {children}
    </div>
  );
}

export interface MenuQuickActionProps extends ButtonProps {
  ref?: React.Ref<HTMLButtonElement>;
  icon: React.ReactNode;
  /** The label under the icon (13px semibold). */
  children: React.ReactNode;
  onSelect?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  /** Default `true`. */
  closeOnSelect?: boolean;
}

export function MenuQuickAction({
  ref,
  icon,
  children,
  onSelect,
  disabled,
  closeOnSelect = true,
  className,
  onClick,
  ...rest
}: MenuQuickActionProps) {
  const ctx = useMenuPanel("MenuQuickAction");
  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-menu-item=""
      data-menu-quick=""
      className={buildClassName(classes.quickAction, className)}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
        onSelect?.(event);
        ctx.itemSelected(event, closeOnSelect);
      }}
      {...rest}
    >
      <span className={classes.quickIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={classes.quickLabel}>{children}</span>
    </button>
  );
}

/* ───────────────────────────── submenu (in place) ───────────────────────────── */

export interface MenuSubProps extends Omit<ButtonProps, "onSelect"> {
  ref?: React.Ref<HTMLButtonElement>;
  /** Row label and the title of the Back row ("← Share"). */
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Submenu content — replaces the panel content in place. */
  children?: React.ReactNode;
}

/** A chevron row that swaps the panel content for its children (shared axis X + height spring).
 *  The submenu starts with a Back row (`ArrowLeft` + label). Never opens a cascading side panel. */
export function MenuSub({ ref, label, icon, disabled, children, onClick, ...rest }: MenuSubProps) {
  const ctx = useMenuPanel("MenuSub");
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const setRef = useCallback(
    (el: HTMLButtonElement | null) => {
      triggerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.RefObject<HTMLButtonElement | null>).current = el;
    },
    [ref],
  );
  const inPath = ctx.path.some((entry) => entry.id === id);
  const mounted = inPath || ctx.exitingView === id;

  return (
    <>
      <MenuRow
        ref={setRef}
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={inPath}
        data-menu-sub-trigger=""
        icon={icon}
        disabled={disabled}
        trailing={
          <span className={classes.chevron} aria-hidden="true">
            <ChevronRight />
          </span>
        }
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          // `detail === 0`: activated from the keyboard (Enter / Space / → via `.click()`).
          ctx.openSub({ id, label, trigger: triggerRef.current }, event.detail === 0 ? "keyboard" : "pointer");
        }}
        {...rest}
      >
        {label}
      </MenuRow>
      {mounted &&
        ctx.subHost &&
        createPortal(
          <MenuLayer viewId={id}>
            <MenuRow
              role="menuitem"
              rowClassName={classes.back}
              aria-label={`${label}, back`}
              data-menu-back=""
              icon={<ArrowLeft />}
              onClick={(event) => ctx.goBack(event.detail === 0 ? "keyboard" : "pointer")}
            >
              {label}
            </MenuRow>
            <MenuSeparator />
            {children}
          </MenuLayer>,
          ctx.subHost,
        )}
    </>
  );
}
