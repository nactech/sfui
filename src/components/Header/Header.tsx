import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCheck, ChevronLeft, Ellipsis, EllipsisVertical, ListX, X } from "lucide-react";
import classes from "./Header.module.scss";
import { buildClassName } from "/@/core/util";
import { PlatformContext, usePlatform, type PlatformSetting } from "/@/core/platform";
import Menu, { MenuItem } from "../Menu";
import HeaderAction from "./HeaderAction";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * final.pen → H/A2 "Header · Floating glass", implementation Android + Web (frame p6Vvp).
 * Masters `Header/Android+Web/Expanded`, `…/Collapsed`, `…/Selection`.
 *
 * iOS implementation (`platform` resolves to `"ios"`): H/A1 "Header / iOS" (frame AiKfF) and
 * H/A3 "Header / Selection flow" (frame gQmek). Masters `Header/iOS/Expanded`, `…/Collapsed`, `…/Browse`,
 * `…/Selection`. No bar background: a glass circular back button (`ChevronLeft`), a glass action capsule, and
 * a large title that docks into a centred glass title pill. Selection mode keeps only Cancel and
 * Select All ↔ Deselect All text buttons — the selection's target actions belong in `SelectionToolbar`
 * at the bottom, so `selectionActions` and `selectionOverflowMenu` are not rendered on iOS.
 */
export interface HeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  ref?: React.Ref<HTMLElement>;
  /** Page title: the large title when expanded, docked next to back when collapsed (iOS: a centred glass pill). */
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
  /** Back glyph. Default Lucide `ArrowLeft` (iOS: `ChevronLeft`). */
  backIcon?: React.ReactNode;

  /** `HeaderAction`s rendered in the glass action capsule (e.g. Share). */
  actions?: React.ReactNode;
  /** `MenuItem`s for the ⋮ overflow, rendered as the last action (iOS: a horizontal `•••`). */
  overflowMenu?: React.ReactNode;
  /** Accessible name of the ⋮ trigger. Default `"More options"`. */
  overflowLabel?: string;

  /**
   * `false` (default): expanded — bar + large title + subtitle.
   * `true`: collapsed — only the 48px bar, title docked next to back in one capsule
   * (iOS: the 44px bar row with the title in a centred glass pill).
   * `"auto"`: expanded in flow; docks once the large title scrolls under the bar (same on iOS).
   */
  collapsed?: boolean | "auto";
  /** Scroll container watched by `collapsed="auto"`. Default: the viewport. */
  scrollContainer?: HTMLElement | null;
  /** Fires when `collapsed="auto"` docks / undocks the title. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Keep the bar pinned to the top of the scroll container while the large title scrolls away. */
  sticky?: boolean;

  /**
   * Selection mode (row 4) when defined: × + "N selected" + `selectionActions` + ⋮.
   * iOS: Cancel + "N Selected" (centred) + Select All / Deselect All; actions go in `SelectionToolbar`.
   */
  selectionCount?: number;
  /** Text of the count. Default `` `${n} selected` `` (iOS: `"Select Items"` at 0, else `` `${n} Selected` ``). */
  selectionLabel?: (count: number) => React.ReactNode;
  /** The × in the tonal capsule (iOS: the Cancel text button): leave selection mode. */
  onCancelSelection?: () => void;
  /** Accessible name of the ×. Default `"Cancel selection"`. iOS: the visible Cancel text, default `"Cancel"`. */
  cancelSelectionLabel?: string;
  /** `HeaderAction`s for the selection (Share, Delete…). Not rendered on iOS — pass them to `SelectionToolbar`. */
  selectionActions?: React.ReactNode;
  /**
   * Whether every item is selected — flips the ⋮ first item from "Select all" to "Deselect all"
   * (iOS: flips the trailing text button from "Select All" to "Deselect All").
   */
  allSelected?: boolean;
  /** First ⋮ item while not everything is selected (iOS: the trailing "Select All" text button). */
  onSelectAll?: () => void;
  /** First ⋮ item once everything is selected (iOS: the trailing "Deselect All" text button). */
  onDeselectAll?: () => void;
  /** Default `"Select all"` (iOS: `"Select All"`). */
  selectAllLabel?: React.ReactNode;
  /** Default `"Deselect all"` (iOS: `"Deselect All"`). */
  deselectAllLabel?: React.ReactNode;
  /**
   * Further `MenuItem`s in the selection ⋮, after Select all / Deselect all (Move to…, Duplicate, Export).
   * Not rendered on iOS — pass them to `SelectionToolbar`'s `moreMenu`.
   */
  selectionOverflowMenu?: React.ReactNode;

  /**
   * iOS only (master `Header/iOS/Browse`): renders a glass "Select" text button at the trailing end that
   * enters selection mode (H/A3 step 1). Ignored on Android + Web, where selection starts from the list
   * itself (long-press / row checkboxes) and the web uses `SelectionBar`.
   */
  onStartSelection?: () => void;
  /** iOS only: text of the Browse "Select" button. Default `"Select"`. */
  startSelectionLabel?: React.ReactNode;

  /** Which implementation to render. Default: nearest `ConfigProvider`, else detected from the user agent. */
  platform?: PlatformSetting;
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

const androidSelectionLabel = (count: number): React.ReactNode => `${count} selected`;
const iosSelectionLabel = (count: number): React.ReactNode => (count === 0 ? "Select Items" : `${count} Selected`);

const Header = ({
  ref,
  title,
  subtitle,
  titleAs: TitleTag = "h1",
  onBack,
  backHref,
  backLabel = "Back",
  backIcon,
  actions,
  overflowMenu,
  overflowLabel = "More options",
  collapsed = false,
  scrollContainer,
  onCollapsedChange,
  sticky = false,
  selectionCount,
  selectionLabel,
  onCancelSelection,
  cancelSelectionLabel,
  selectionActions,
  allSelected = false,
  onSelectAll,
  onDeselectAll,
  selectAllLabel,
  deselectAllLabel,
  selectionOverflowMenu,
  onStartSelection,
  startSelectionLabel = "Select",
  platform: platformProp,
  className,
  children,
  ...rest
}: HeaderProps) => {
  const platform = usePlatform(platformProp);
  const ios = platform === "ios";

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
  const backClass = ios ? classes.iosBack : classes.dockButton;
  const backContent = (
    <span className={ios ? classes.iosBackIcon : classes.dockIcon} aria-hidden="true">
      {backIcon ?? (ios ? <ChevronLeft /> : <ArrowLeft />)}
    </span>
  );
  const backButton = backHref !== undefined ? (
    <a className={backClass} href={backHref} aria-label={backLabel} onClick={onBack}>
      {backContent}
    </a>
  ) : onBack !== undefined ? (
    <button type="button" className={backClass} aria-label={backLabel} onClick={onBack}>
      {backContent}
    </button>
  ) : null;

  // The docked title is the heading only when there is no large title (collapsed={true}).
  const InlineTag = hasLargeTitle ? "span" : TitleTag;

  const overflowTrigger = (
    <HeaderAction aria-label={overflowLabel} icon={ios ? <Ellipsis /> : <EllipsisVertical />} />
  );
  const hasSelectAllItem = selecting && (allSelected ? onDeselectAll : onSelectAll) !== undefined;
  const countText = (selectionLabel ?? (ios ? iosSelectionLabel : androidSelectionLabel))(selectionCount ?? 0);
  const selectAllText = selectAllLabel ?? (ios ? "Select All" : "Select all");
  const deselectAllText = deselectAllLabel ?? (ios ? "Deselect All" : "Deselect all");

  const browseActions = (
    <>
      {actions}
      {overflowMenu != null && <Menu trigger={overflowTrigger}>{overflowMenu}</Menu>}
    </>
  );
  const hasBrowseActions = actions != null || overflowMenu != null;

  let bar: React.ReactNode;
  if (ios) {
    // iOS: three slots on a grid so the centre (title pill / selection title) stays centred.
    bar = selecting ? (
      <>
        <div className={classes.iosStart}>
          <button type="button" className={classes.iosTextButton} onClick={() => onCancelSelection?.()}>
            {cancelSelectionLabel ?? "Cancel"}
          </button>
        </div>
        <div className={classes.iosCenter}>
          <span className={classes.iosSelectionTitle} aria-live="polite" aria-atomic="true">
            {countText}
          </span>
        </div>
        <div className={classes.iosEnd}>
          {hasSelectAllItem && (
            <button
              type="button"
              className={classes.iosTextButton}
              data-tone="accent"
              onClick={() => (allSelected ? onDeselectAll?.() : onSelectAll?.())}
            >
              {allSelected ? deselectAllText : selectAllText}
            </button>
          )}
        </div>
      </>
    ) : (
      <>
        <div className={classes.iosStart}>{backButton}</div>
        <div className={classes.iosCenter}>
          {(docked || collapsed === "auto") && (
            <span
              className={classes.iosPill}
              data-docked={docked ? "" : undefined}
              aria-hidden={hasLargeTitle ? true : undefined}
            >
              <InlineTag className={classes.iosPillText}>{title}</InlineTag>
            </span>
          )}
        </div>
        <div className={classes.iosEnd}>
          {hasBrowseActions && <div className={classes.actions}>{browseActions}</div>}
          {onStartSelection !== undefined && (
            <button type="button" className={classes.iosTextButton} onClick={() => onStartSelection()}>
              {startSelectionLabel}
            </button>
          )}
        </div>
      </>
    );
  } else {
    const actionContent = selecting ? (
      <>
        {selectionActions}
        {(hasSelectAllItem || selectionOverflowMenu != null) && (
          <Menu trigger={overflowTrigger}>
            {hasSelectAllItem &&
              (allSelected ? (
                <MenuItem icon={<ListX />} onSelect={() => onDeselectAll?.()}>
                  {deselectAllText}
                </MenuItem>
              ) : (
                <MenuItem icon={<CheckCheck />} onSelect={() => onSelectAll?.()}>
                  {selectAllText}
                </MenuItem>
              ))}
            {selectionOverflowMenu}
          </Menu>
        )}
      </>
    ) : (
      browseActions
    );
    const hasActions = selecting
      ? selectionActions != null || hasSelectAllItem || selectionOverflowMenu != null
      : hasBrowseActions;

    bar = (
      <>
        {selecting ? (
          <div className={classes.dock} data-tone="tonal" data-docked="">
            <button
              type="button"
              className={classes.dockButton}
              aria-label={cancelSelectionLabel ?? "Cancel selection"}
              onClick={() => onCancelSelection?.()}
            >
              <span className={classes.dockIcon} aria-hidden="true">
                <X />
              </span>
            </button>
            <span className={classes.dockTitle}>
              <span className={classes.dockText} aria-live="polite" aria-atomic="true">
                {countText}
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
      </>
    );
  }

  return (
    <PlatformContext.Provider value={platform}>
      <header
        ref={setRootRef}
        className={buildClassName(classes.root, className)}
        data-platform={platform}
        data-collapsed={docked ? "" : undefined}
        data-mode={selecting ? "selection" : undefined}
        data-sticky={sticky ? "" : undefined}
        {...rest}
      >
        <div ref={barRef} className={classes.bar}>
          {bar}
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
    </PlatformContext.Provider>
  );
};

export default Header;
