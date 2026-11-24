import React, { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import classes from "./TabBar.ios.module.scss";
import { buildClassName } from "/@/core/util";

/**
 * iOS search tab (`Tab Bar/iOS Search`): a separate glass circle beside the bar that expands into a search field.
 * iOS only — ignored on Android / Web.
 */
export interface TabBarSearch {
  /** Accessible name of the search circle, and the field's placeholder. Default `"Search"`. */
  label?: string;
  /** Accessible name of the close circle next to the expanded field. Default `"Close search"`. */
  closeLabel?: string;
  /** Called when the search circle is pressed, right before the field expands. */
  onActivate?: () => void;
  /** Controlled: whether the field is expanded (the bar is hidden meanwhile). */
  expanded?: boolean;
  /** Uncontrolled initial state. Default `false`. */
  defaultExpanded?: boolean;
  /** Search circle pressed (`true`), close circle or Esc (`false`). */
  onExpandedChange?: (expanded: boolean) => void;
  /** Props for the built-in `<input type="search">` (`value`, `onChange`, `placeholder`, `enterKeyHint`…). */
  inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;
  /** Replaces the built-in input inside the expanded field (e.g. your own controlled input). */
  children?: React.ReactNode;
}

interface SearchFieldIOSProps {
  search: TabBarSearch;
  onClose: () => void;
  /** Focus the field on mount (opened by the user, not rendered expanded from the start). */
  autoFocus: boolean;
}

const FOCUSABLE = "input, textarea, select, [contenteditable='true'], button, [tabindex]:not([tabindex='-1'])";

/** N/A1 row 5 "Search expanded": the search tab becomes a field, with a close circle. */
export const SearchFieldIOS = ({ search, onClose, autoFocus }: SearchFieldIOSProps) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const { label = "Search", closeLabel = "Close search", inputProps, children } = search;

  // Opened from the search circle: focused, like iOS raising the keyboard right away.
  useEffect(() => {
    if (autoFocus) fieldRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    // Mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !e.defaultPrevented) {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <>
      <div ref={fieldRef} className={classes.field} role="search" onKeyDown={onKeyDown}>
        <span className={classes.fieldIcon} aria-hidden="true">
          <Search />
        </span>
        {children ?? (
          <input
            aria-label={label}
            placeholder={label}
            autoComplete="off"
            enterKeyHint="search"
            {...inputProps}
            type="search"
            className={buildClassName(classes.input, inputProps?.className)}
          />
        )}
      </div>
      <button type="button" className={classes.close} aria-label={closeLabel} onClick={onClose} onKeyDown={onKeyDown}>
        <X aria-hidden="true" />
      </button>
    </>
  );
};
