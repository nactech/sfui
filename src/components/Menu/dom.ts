/** DOM helpers shared by Menu (open focus) and MenuPanel (roving focus). */

export const ITEM_SELECTOR = "[data-menu-item]";

/** Enabled items of a layer in DOM order. Submenu content is portaled elsewhere, so it is never included. */
export function getEnabledItems(container: Element | null | undefined): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
    (el) => el.getAttribute("aria-disabled") !== "true",
  );
}

/** Groups items into vertical stops: each list row is a stop, a quick-actions row is one stop. */
export function getRows(items: HTMLElement[]): HTMLElement[][] {
  const rows: HTMLElement[][] = [];
  let quickRow: Element | null = null;
  for (const el of items) {
    const row = el.hasAttribute("data-menu-quick") ? el.closest("[data-menu-quick-row]") : null;
    if (row && row === quickRow) {
      rows[rows.length - 1].push(el);
    } else {
      rows.push([el]);
    }
    quickRow = row;
  }
  return rows;
}

export function itemText(el: HTMLElement) {
  return (el.dataset.menuText ?? el.textContent ?? "").trim().toLowerCase();
}

export function focusElement(el: HTMLElement | null | undefined) {
  el?.focus({ preventScroll: true });
}
