import React, { useSyncExternalStore } from "react";
import classes from "./SelectionBar.module.scss";
import { buildClassName } from "/@/core/util";
import Button from "../Button";
import Checkbox, { type CheckboxState } from "../Checkbox";
import { useSelectionShortcuts } from "./useSelectionShortcuts";

/**
 * final.pen → H/A4 "Header · Selection flow", WEB steps 6–7 (frame j5xOq), master `Selection Bar/Web`.
 * Replaces the page header while items are selected: tri-state select-all, "N selected", action buttons,
 * "⌘A all · Esc clear" hint, Clear; plus the "select everything" banner once the page is fully selected.
 */
export interface SelectionBarProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  ref?: React.Ref<HTMLElement>;
  /** Number of selected items. */
  count: number;
  /** Number of selectable items on the page. Drives the tri-state checkbox. */
  total?: number;
  /** Override "everything on the page is selected" (default: `total > 0 && count >= total`). */
  allSelected?: boolean;
  /** Select-all checkbox (and ⌘/Ctrl+A with `true`). Activating the mixed state selects all. */
  onSelectAllChange?: (checked: boolean) => void;
  /** Clear button (and Esc). */
  onClear?: () => void;
  /** Action `Button`s, size `"s"`: secondary (Share, Move) and danger (Delete). */
  actions?: React.ReactNode;
  /** Count text. Default `` `${count} selected` ``. */
  countLabel?: (count: number) => React.ReactNode;
  /** Accessible name of the select-all checkbox. Default `"Select all"`. */
  selectAllLabel?: string;
  /** Default `"Clear"`. */
  clearLabel?: React.ReactNode;
  /** Wire ⌘/Ctrl+A and Esc on the document while the bar is mounted. Default `true`. */
  keyboardShortcuts?: boolean;
  /** Show the "⌘A all · Esc clear" hint (pointer devices, wide bars only). Default `true`. */
  showKeyboardHint?: boolean;
  /** Custom hint text. Default `"⌘A all · Esc clear"` (`"Ctrl+A all · Esc clear"` off Apple platforms). */
  keyboardHint?: React.ReactNode;
  /** `position: sticky; top: 0` (override `top` via `style`). Default `true`. */
  sticky?: boolean;
  /** Accessible name of the bar region. Default `"Selection"`. */
  label?: string;

  /** Step 7 banner: offered once the page is fully selected and this is set. */
  onSelectEverything?: () => void;
  /** Size of the wider scope, e.g. 120. */
  scopeTotal?: number;
  /** Name of the wider scope, e.g. "Library". */
  scopeLabel?: string;
  /** Plural noun in the banner. Default `"items"`. */
  itemNoun?: string;
  /** The wider scope is selected: the banner confirms it and offers "Clear selection". */
  everythingSelected?: boolean;
  /** Override the banner sentence. */
  bannerText?: React.ReactNode;
  /** Override the banner link text. */
  bannerActionLabel?: React.ReactNode;
}

const subscribeNoop = () => () => {};
const getIsApple = () =>
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/i.test(
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
      navigator.platform ??
      "",
  );

const SelectionBar = ({
  count,
  total,
  allSelected,
  onSelectAllChange,
  onClear,
  actions,
  countLabel = (n) => `${n} selected`,
  selectAllLabel = "Select all",
  clearLabel = "Clear",
  keyboardShortcuts = true,
  showKeyboardHint = true,
  keyboardHint,
  sticky = true,
  label = "Selection",
  onSelectEverything,
  scopeTotal,
  scopeLabel,
  itemNoun = "items",
  everythingSelected = false,
  bannerText,
  bannerActionLabel,
  className,
  ...rest
}: SelectionBarProps) => {
  const isApple = useSyncExternalStore(subscribeNoop, getIsApple, () => false);

  const pageSelected = everythingSelected || (allSelected ?? (total !== undefined && total > 0 && count >= total));
  const checkState: CheckboxState = pageSelected ? true : count > 0 ? "mixed" : false;

  useSelectionShortcuts({
    enabled: keyboardShortcuts,
    onSelectAll: onSelectAllChange ? () => onSelectAllChange(true) : undefined,
    onClear,
  });

  const showBanner =
    everythingSelected ||
    (pageSelected && onSelectEverything !== undefined && (scopeTotal === undefined || scopeTotal > count));

  const scopeSuffix = scopeLabel ? ` in ${scopeLabel}` : "";
  const defaultBannerText = everythingSelected
    ? `All ${scopeTotal !== undefined ? `${scopeTotal} ` : ""}${itemNoun}${scopeSuffix} are selected.`
    : `All ${count} ${itemNoun} on this page are selected.`;
  const defaultBannerAction = everythingSelected
    ? "Clear selection"
    : `Select all${scopeTotal !== undefined ? ` ${scopeTotal}` : ""}${scopeSuffix}`;
  const bannerHandler = everythingSelected ? onClear : onSelectEverything;

  const hint = keyboardHint ?? `${isApple ? "⌘A" : "Ctrl+A"} all · Esc clear`;
  const shortcutsOn = keyboardShortcuts;

  return (
    <section
      aria-label={label}
      className={buildClassName(classes.root, className)}
      data-sticky={sticky ? "" : undefined}
      {...rest}
    >
      <div className={classes.bar}>
        <Checkbox
          className={classes.selectAll}
          aria-label={selectAllLabel}
          aria-keyshortcuts={shortcutsOn && onSelectAllChange ? "Meta+A Control+A" : undefined}
          checked={checkState}
          onCheckedChange={(next) => onSelectAllChange?.(next)}
        />
        <span className={classes.count} aria-live="polite" aria-atomic="true">
          {countLabel(count)}
        </span>
        {actions != null && (
          <>
            <span className={classes.divider} aria-hidden="true" />
            <div className={classes.actions}>{actions}</div>
          </>
        )}
        <span className={classes.spacer} />
        {shortcutsOn && showKeyboardHint && (
          <span className={classes.hint} aria-hidden="true">
            {hint}
          </span>
        )}
        <Button
          variant="ghost"
          size="s"
          aria-keyshortcuts={shortcutsOn && onClear ? "Escape" : undefined}
          onClick={() => onClear?.()}
        >
          {clearLabel}
        </Button>
      </div>

      {showBanner && (
        <div className={classes.banner} role="status">
          <span className={classes.bannerText}>{bannerText ?? defaultBannerText}</span>
          {bannerHandler && (
            <button type="button" className={classes.bannerAction} onClick={() => bannerHandler()}>
              {bannerActionLabel ?? defaultBannerAction}
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default SelectionBar;
