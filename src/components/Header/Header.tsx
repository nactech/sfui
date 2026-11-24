import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCheck, EllipsisVertical, ListX, X } from "lucide-react";
import classes from "./Header.module.scss";
import { buildClassName } from "/@/core/util";
import Menu, { MenuItem } from "../Menu";
import HeaderAction from "./HeaderAction";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * final.pen → H/A2 "Header · Floating glass", implementation Android + Web (frame p6Vvp).
 * Masters `Header/Android+Web/Expanded`, `…/Collapsed`, `…/Selection`.
 */
export interface HeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  ref?: React.Ref<HTMLElement>;
  /** Page title: the large title when expanded, docked next to back when collapsed. */
  title: React.ReactNode;
  /** Muted line under the large title (expanded only). */
  subtitle?: React.ReactNode;
  /** Heading level of the title. Default `"h1"`. */
  titleAs?: HeadingTag;

  /** Renders the glass back button as a `<button>`. */
  onBack?: (event: React.MouseEvent<HTMLElement>) => void;
  /** Renders the glass back button as a link. `onBack` still fires on click if given. */
  backHref?: string;
  /** Accessible name of the back button. Default `"Back"`. */
  backLabel?: string;
  /** Back glyph. Default Lucide `ArrowLeft`. */
  backIcon?: React.ReactNode;

  /** `HeaderAction`s rendered in the glass action capsule (e.g. Share). */
  actions?: React.ReactNode;
  /** `MenuItem`s for the ⋮ overflow, rendered as the last action. */
  overflowMenu?: React.ReactNode;
  /** Accessible name of the ⋮ trigger. Default `"More options"`. */
  overflowLabel?: string;

  /**
   * `false` (default): expanded — bar + large title + subtitle.
   * `true`: collapsed — only the 48px bar, title docked next to back in one capsule.
   * `"auto"`: expanded in flow; docks once the large title scrolls under the bar.
   */
  collapsed?: boolean | "auto";
  /** Scroll container watched by `collapsed="auto"`. Default: the viewport. */
  scrollContainer?: HTMLElement | null;
  /** Fires when `collapsed="auto"` docks / undocks the title. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Keep the bar pinned to the top of the scroll container while the large title scrolls away. */
  sticky?: boolean;

  /** Selection mode (row 4) when defined: × + "N selected" + `selectionActions` + ⋮. */
  selectionCount?: number;
  /** Text of the count. Default `` `${n} selected` ``. */
  selectionLabel?: (count: number) => React.ReactNode;
  /** The × in the tonal capsule: leave selection mode. */
  onCancelSelection?: () => void;
  /** Accessible name of the ×. Default `"Cancel selection"`. */
  cancelSelectionLabel?: string;
  /** `HeaderAction`s for the selection (Share, Delete…). */
  selectionActions?: React.ReactNode;
  /** Whether every item is selected — flips the ⋮ first item from "Select all" to "Deselect all". */
  allSelected?: boolean;
  /** First ⋮ item while not everything is selected. */
  onSelectAll?: () => void;
  /** First ⋮ item once everything is selected. */
  onDeselectAll?: () => void;
  /** Default `"Select all"`. */
  selectAllLabel?: React.ReactNode;
  /** Default `"Deselect all"`. */
  deselectAllLabel?: React.ReactNode;
  /** Further `MenuItem`s in the selection ⋮, after Select all / Deselect all (Move to…, Duplicate, Export). */
  selectionOverflowMenu?: React.ReactNode;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

const rootFontSize = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

/** Docks the title when the large title has scrolled under the bar. */
function useAutoCollapse(
  enabled: boolean,
  titleRef: React.RefObject<HTMLElement | null>,
  barRef: React.RefObject<HTMLElement | null>,
  scrollContainer: HTMLElement | null | undefined,
  onChange: ((collapsed: boolean) => void) | undefined,
) {
  const [docked, setDocked] = useState(false);
  const dockedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const title = titleRef.current;
    if (!enabled || !title || typeof IntersectionObserver === "undefined") return;
    // IntersectionObserver only takes px / % margins: shrink the root by the bar so the title
    // counts as gone once it slides under the floating capsules.
    const barHeight = barRef.current?.offsetHeight ?? 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const rootTop = entry.rootBounds?.top ?? 0;
        const next = !entry.isIntersecting && entry.boundingClientRect.top < rootTop;
        if (next === dockedRef.current) return;
        dockedRef.current = next;
        setDocked(next);
        onChangeRef.current?.(next);
      },
      { root: scrollContainer ?? null, rootMargin: `-${barHeight}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(title);
    return () => observer.disconnect();
  }, [enabled, titleRef, barRef, scrollContainer]);

  return enabled && docked;
}

const Header = ({
  ref,
  title,
  subtitle,
  titleAs: TitleTag = "h1",
  onBack,
  backHref,
  backLabel = "Back",
  backIcon = <ArrowLeft />,
  actions,
  overflowMenu,
  overflowLabel = "More options",
  collapsed = false,
  scrollContainer,
  onCollapsedChange,
  sticky = false,
  selectionCount,
  selectionLabel = (count) => `${count} selected`,
  onCancelSelection,
  cancelSelectionLabel = "Cancel selection",
  selectionActions,
  allSelected = false,
  onSelectAll,
  onDeselectAll,
  selectAllLabel = "Select all",
  deselectAllLabel = "Deselect all",
  selectionOverflowMenu,
  className,
  children,
  ...rest
}: HeaderProps) => {
  const rootRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  const setRootRef = useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  const selecting = selectionCount !== undefined;
  const hasLargeTitle = collapsed !== true;
  const autoDocked = useAutoCollapse(collapsed === "auto", titleRef, barRef, scrollContainer, onCollapsedChange);
  const docked = collapsed === true || autoDocked;

  // Sticky: pin the root at a negative top so only the bar row stays in view while the large title
  // scrolls away underneath (keeps the title inside the <header> and the bar in one sticky box).
  useLayoutEffect(() => {
    const root = rootRef.current;
    const bar = barRef.current;
    if (!sticky || !root || !bar) return;
    const update = () => {
      const offset = Math.min(0, bar.offsetTop + bar.offsetHeight - root.offsetHeight);
      root.style.setProperty("--_sticky-top", `${offset / rootFontSize()}rem`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--_sticky-top");
    };
  }, [sticky, hasLargeTitle]);

  const hasBack = onBack !== undefined || backHref !== undefined;
  const backContent = (
    <span className={classes.dockIcon} aria-hidden="true">
      {backIcon}
    </span>
  );
  const backButton = backHref !== undefined ? (
    <a className={classes.dockButton} href={backHref} aria-label={backLabel} onClick={onBack}>
      {backContent}
    </a>
  ) : onBack !== undefined ? (
    <button type="button" className={classes.dockButton} aria-label={backLabel} onClick={onBack}>
      {backContent}
    </button>
  ) : null;

  // The docked title is the heading only when there is no large title (collapsed={true}).
  const InlineTag = hasLargeTitle ? "span" : TitleTag;

  const overflowTrigger = <HeaderAction aria-label={overflowLabel} icon={<EllipsisVertical />} />;
  const hasSelectAllItem = selecting && (allSelected ? onDeselectAll : onSelectAll) !== undefined;

  const actionContent = selecting ? (
    <>
      {selectionActions}
      {(hasSelectAllItem || selectionOverflowMenu != null) && (
        <Menu trigger={overflowTrigger}>
          {hasSelectAllItem &&
            (allSelected ? (
              <MenuItem icon={<ListX />} onSelect={() => onDeselectAll?.()}>
                {deselectAllLabel}
              </MenuItem>
            ) : (
              <MenuItem icon={<CheckCheck />} onSelect={() => onSelectAll?.()}>
                {selectAllLabel}
              </MenuItem>
            ))}
          {selectionOverflowMenu}
        </Menu>
      )}
    </>
  ) : (
    <>
      {actions}
      {overflowMenu != null && <Menu trigger={overflowTrigger}>{overflowMenu}</Menu>}
    </>
  );
  const hasActions = selecting
    ? selectionActions != null || hasSelectAllItem || selectionOverflowMenu != null
    : actions != null || overflowMenu != null;

  return (
    <header
      ref={setRootRef}
      className={buildClassName(classes.root, className)}
      data-collapsed={docked ? "" : undefined}
      data-mode={selecting ? "selection" : undefined}
      data-sticky={sticky ? "" : undefined}
      {...rest}
    >
      <div ref={barRef} className={classes.bar}>
        {selecting ? (
          <div className={classes.dock} data-tone="tonal" data-docked="">
            <button
              type="button"
              className={classes.dockButton}
              aria-label={cancelSelectionLabel}
              onClick={() => onCancelSelection?.()}
            >
              <span className={classes.dockIcon} aria-hidden="true">
                <X />
              </span>
            </button>
            <span className={classes.dockTitle}>
              <span className={classes.dockText} aria-live="polite" aria-atomic="true">
                {selectionLabel(selectionCount)}
              </span>
            </span>
          </div>
        ) : (
          (hasBack || docked) && (
            <div
              className={classes.dock}
              data-docked={docked ? "" : undefined}
              data-back={hasBack ? undefined : "none"}
            >
              {backButton}
              <span className={classes.dockTitle} aria-hidden={hasLargeTitle ? true : undefined}>
                <InlineTag className={classes.dockText}>{title}</InlineTag>
              </span>
            </div>
          )
        )}
        {hasActions && <div className={classes.actions}>{actionContent}</div>}
      </div>

      {hasLargeTitle && (
        <>
          <TitleTag ref={titleRef} className={classes.title}>
            {title}
          </TitleTag>
          {subtitle != null && <p className={classes.subtitle}>{subtitle}</p>}
        </>
      )}
      {children}
    </header>
  );
};

export default Header;
