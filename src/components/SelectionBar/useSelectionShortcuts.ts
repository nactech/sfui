import { useEffect, useLayoutEffect, useRef } from "react";

export interface SelectionShortcutsOptions {
  /** ⌘A (Apple) / Ctrl+A (others). */
  onSelectAll?: () => void;
  /** Esc. */
  onClear?: () => void;
  /** Default `true`. */
  enabled?: boolean;
  /** Where to listen. Default `document`. */
  target?: HTMLElement | Document | null;
}

const TEXTLESS_INPUTS = new Set(["checkbox", "radio", "button", "submit", "reset", "range", "color", "file", "image"]);

/** True when the key belongs to a text field (native ⌘A / Esc must keep working there). */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement) return !TEXTLESS_INPUTS.has(target.type);
  return false;
}

/**
 * Web selection keyboard (final.pen H/A4 web steps 6–7, "⌘A all · Esc clear"):
 * ⌘/Ctrl+A selects all, Esc clears. Ignored inside text inputs / contenteditable and when another
 * handler already called `preventDefault()` (e.g. an open Menu consuming Esc).
 */
export function useSelectionShortcuts({ onSelectAll, onClear, enabled = true, target }: SelectionShortcutsOptions) {
  const handlers = useRef({ onSelectAll, onClear });
  useLayoutEffect(() => {
    handlers.current = { onSelectAll, onClear };
  });

  useEffect(() => {
    if (!enabled) return;
    const node = target ?? (typeof document !== "undefined" ? document : null);
    if (!node) return;

    const onKeyDown = (event: Event) => {
      if (!(event instanceof KeyboardEvent) || event.defaultPrevented || event.isComposing) return;
      if (isEditableTarget(event.target)) return;
      const { onSelectAll: selectAll, onClear: clear } = handlers.current;

      if (
        selectAll &&
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "a"
      ) {
        event.preventDefault(); // don't select the page's text
        selectAll();
      } else if (clear && event.key === "Escape" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        clear();
      }
    };

    node.addEventListener("keydown", onKeyDown);
    return () => node.removeEventListener("keydown", onKeyDown);
  }, [enabled, target]);
}

export default useSelectionShortcuts;
