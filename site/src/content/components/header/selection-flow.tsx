/*
 * Live selection flows shared by the Header, SelectionBar and SelectionToolbar pages.
 *
 * The same task — pick a few stickers and act on them — follows each platform's grammar:
 * - iOS: Header “Select” → Cancel / Select All in the header, the tab bar becomes a SelectionToolbar.
 * - Android (and the Android + Web Header on phones): long-press a row or ⋮ → Select; the header turns
 *   into the contextual bar (× · count · actions · ⋮ with Select all). Clearing the last item ends it.
 * - Web (wide): row checkboxes on hover; the page header is replaced by a sticky SelectionBar with ⌘A / Esc.
 */
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CableCar,
  Car,
  CarTaxiFront,
  CheckCheck,
  CloudFog,
  Copy,
  Download,
  Ellipsis,
  Fish,
  FolderInput,
  House,
  Mountain,
  RadioTower,
  Sailboat,
  Share,
  Ship,
  Snowflake,
  SquareCheck,
  Tag,
  Trash2,
  TramFront,
} from "lucide-react";
import {
  Button,
  Checkbox,
  Header,
  HeaderAction,
  List,
  ListItem,
  ListThumbnail,
  Menu,
  MenuItem,
  PageHeader,
  SelectionBar,
  SelectionToolbar,
  TabBar,
  useSelectionShortcuts,
  type ListTone,
  type Platform,
  type SelectionToolbarAction,
} from "@nactech/sfui";
import { paintedLadiesTall } from "@site/lib/photos";
import { tabItems } from "../../shared";

export interface Sticker {
  value: string;
  title: string;
  subtitle: string;
  size: string;
  icon: React.ReactNode;
  tone: ListTone;
}

/** One page of the Foggy Stickers pack (the Library holds 120). */
export const LIBRARY: Sticker[] = [
  { value: "chilly", title: "Mr. Chilly", subtitle: "2.4 s · 60 fps", size: "41 KB", icon: <Snowflake />, tone: "accent" },
  { value: "taxi", title: "Robotaxi", subtitle: "3.0 s · 60 fps", size: "71 KB", icon: <CarTaxiFront />, tone: "warning" },
  { value: "ladies", title: "Painted Ladies", subtitle: "2.0 s · 60 fps", size: "38 KB", icon: <House />, tone: "danger" },
  { value: "waymo", title: "Waymo", subtitle: "2.0 s · 60 fps", size: "52 KB", icon: <Car />, tone: "positive" },
  { value: "cable", title: "Cable Car", subtitle: "2.8 s · 60 fps", size: "64 KB", icon: <CableCar />, tone: "neutral" },
  { value: "fog", title: "Karl the Fog", subtitle: "3.0 s · 30 fps", size: "29 KB", icon: <CloudFog />, tone: "accent" },
  { value: "ferry", title: "Ferry Building", subtitle: "2.2 s · 60 fps", size: "47 KB", icon: <Ship />, tone: "warning" },
  { value: "sutro", title: "Sutro Tower", subtitle: "1.6 s · 60 fps", size: "33 KB", icon: <RadioTower />, tone: "danger" },
  { value: "lions", title: "Sea Lions", subtitle: "2.6 s · 60 fps", size: "58 KB", icon: <Fish />, tone: "positive" },
  { value: "tram", title: "F-Line Tram", subtitle: "2.0 s · 60 fps", size: "44 KB", icon: <TramFront />, tone: "neutral" },
  { value: "regatta", title: "Bay Regatta", subtitle: "3.0 s · 60 fps", size: "69 KB", icon: <Sailboat />, tone: "accent" },
  { value: "peaks", title: "Twin Peaks", subtitle: "1.8 s · 60 fps", size: "36 KB", icon: <Mountain />, tone: "warning" },
];

/** Size of the wider scope offered by the SelectionBar banner. */
export const LIBRARY_TOTAL = 120;

export const noun = (n: number) => `${n} sticker${n === 1 ? "" : "s"}`;
const noop = () => {};

/* ───────────────────────── Small pieces ───────────────────────── */

/** Feedback for demo actions: a pill in a polite live region. */
function useFlash() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const flash = useCallback((text: string) => {
    setMessage(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), 2200);
  }, []);
  return [message, flash] as const;
}

function Flash({ message, bottom }: { message: string | null; bottom: string }) {
  return (
    <div
      role="status"
      style={{ position: "absolute", insetInline: 0, bottom, zIndex: 20, display: "flex", justifyContent: "center", pointerEvents: "none" }}
    >
      {message && (
        <span
          style={{
            padding: "0.4375rem 0.875rem",
            borderRadius: "var(--sf-radius-full)",
            background: "var(--sf-surface-3)",
            color: "var(--sf-fg-default)",
            boxShadow: "0 0.5rem 1.5rem #00000080",
            font: "500 0.8125rem/1.3 var(--sf-font-sans)",
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
}

/** Instruction chip shown above a demo. */
export function Hint({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        alignSelf: "center",
        maxWidth: "100%",
        padding: "0.25rem 0.625rem",
        borderRadius: "var(--sf-radius-full)",
        background: "#000000a6",
        color: "var(--sf-fg-default)",
        font: "500 0.75rem/1.4 var(--sf-font-mono)",
        letterSpacing: "0.02em",
        textAlign: "center",
      }}
    >
      {children}
    </span>
  );
}

/**
 * The screen a flow runs in. `bare` fills a DeviceFrame screen edge to edge (bleeding over its padding);
 * otherwise it is a rounded phone-width (or full-width, for the web) panel.
 */
function Screen({
  platform,
  bare,
  height,
  wide,
  children,
}: {
  platform: Platform;
  bare?: boolean;
  height: number;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const bleed = platform === "web" ? "-1.5rem" : "0 -1rem -1.75rem";
  return (
    <div
      style={{
        position: "relative",
        boxSizing: "border-box",
        width: bare ? "auto" : wide ? "100%" : "min(24.375rem, 100%)",
        height: `${height}rem`,
        margin: bare ? bleed : undefined,
        overflow: "hidden",
        border: bare ? undefined : "1px solid var(--sf-rim-default)",
        borderRadius: bare ? undefined : wide ? "var(--sf-radius-xl)" : "2rem",
        background: "var(--sf-surface-0)",
        textAlign: "start",
      }}
    >
      {children}
    </div>
  );
}

/** Decorative cover under the large title, so the glass capsules have a photo to float over. */
function Cover() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: "6.5rem",
        margin: "0.875rem 0",
        borderRadius: "1.25rem",
        backgroundImage: paintedLadiesTall,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}

function EmptyState({ onRestore }: { onRestore: () => void }) {
  return (
    <div style={{ display: "grid", justifyItems: "center", gap: "0.75rem", padding: "2.5rem 1rem", color: "var(--sf-fg-muted)", font: "400 0.875rem var(--sf-font-sans)" }}>
      No stickers on this page.
      <Button variant="tonal" size="s" onClick={onRestore}>
        Restore stickers
      </Button>
    </div>
  );
}

/** Long-press (≈ 0.45 s, cancelled by moving) or right-click / context-menu key on a row. */
function useLongPress(onLongPress: (value: string) => void, delay = 450) {
  const callback = useRef(onLongPress);
  const timer = useRef<number | undefined>(undefined);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);
  useEffect(() => {
    callback.current = onLongPress;
  });
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (value: string) => {
    const cancel = () => {
      window.clearTimeout(timer.current);
      timer.current = undefined;
      origin.current = null;
    };
    return {
      onPointerDown: (event: React.PointerEvent) => {
        if (event.button !== 0) return;
        fired.current = false;
        cancel();
        origin.current = { x: event.clientX, y: event.clientY };
        timer.current = window.setTimeout(() => {
          fired.current = true;
          timer.current = undefined;
          callback.current(value);
        }, delay);
      },
      onPointerMove: (event: React.PointerEvent) => {
        const o = origin.current;
        if (o && Math.hypot(event.clientX - o.x, event.clientY - o.y) > 8) cancel();
      },
      onPointerUp: cancel,
      onPointerCancel: cancel,
      onPointerLeave: cancel,
      onContextMenu: (event: React.MouseEvent) => {
        event.preventDefault();
        cancel();
        callback.current(value);
      },
      // The click that ends a long-press must not toggle the row it just selected.
      onClickCapture: (event: React.MouseEvent) => {
        if (!fired.current) return;
        fired.current = false;
        event.preventDefault();
        event.stopPropagation();
      },
    };
  };
}

/** Tallest height (rem) the element has had — the expanded header, so the list starts below it. */
function useMaxHeightRem() {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!node) return;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.borderBoxSize?.[0]?.blockSize ?? entry?.contentRect.height ?? 0;
      setHeight((h) => Math.max(h, box / rem));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);
  return [setNode, height] as const;
}

/** Moves focus into the list after the control that had it disappears (Select, Cancel, ⋮ items). */
function focusFirstRow(root: HTMLElement | null) {
  requestAnimationFrame(() => {
    const active = document.activeElement;
    if (active && active !== document.body && root?.contains(active)) return;
    root?.querySelector<HTMLElement>("ul input, ul button")?.focus();
  });
}

/* ───────────────────────── Phone flow (iOS · Android · Web Header) ───────────────────────── */

export interface PhoneFlowProps {
  platform: Platform;
  /** Defined → start in selection mode with these rows selected. */
  startSelected?: string[];
  height?: number;
  bare?: boolean;
  title?: string;
  subtitle?: boolean;
  collapsed?: boolean | "auto";
  back?: boolean;
  /** Share in the action capsule and the ⋮ / ••• overflow. */
  actions?: boolean;
  /** iOS SelectionToolbar options. */
  moreMenu?: boolean;
  disableDuplicate?: boolean;
  /**
   * Use SelectionToolbar on every platform (its Android + Web fallback grammar off iOS) instead of the
   * contextual header — shows what the component renders there.
   */
  toolbarEverywhere?: boolean;
}

/**
 * A phone screen: Header floating over a sticker list, the tab bar at the bottom. With `collapsed="auto"` the
 * demo docks the title as soon as the list scrolls, by driving the boolean `collapsed` from the scroll position.
 * Selection follows the platform: iOS Select → toolbar; Android + Web long-press / ⋮ → contextual header.
 */
export function PhoneSelectionFlow({
  platform,
  startSelected,
  height = 30,
  bare = false,
  title = "Foggy Stickers",
  subtitle = true,
  collapsed = "auto",
  back = true,
  actions = true,
  moreMenu = true,
  disableDuplicate = false,
  toolbarEverywhere = false,
}: PhoneFlowProps) {
  const ios = platform === "ios";
  const toolbar = ios || toolbarEverywhere;
  const [items, setItems] = useState(LIBRARY);
  const [selecting, setSelecting] = useState(startSelected !== undefined);
  const [selected, setSelected] = useState<string[]>(startSelected ?? []);
  const [tab, setTab] = useState("library");
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [measureHeader, headerHeight] = useMaxHeightRem();
  const [message, flash] = useFlash();
  const count = selected.length;
  const docked = collapsed === "auto" ? scrolled : collapsed;

  const start = () => {
    setSelecting(true);
    setSelected([]);
    focusFirstRow(scroller);
  };
  const exit = () => {
    setSelecting(false);
    setSelected([]);
    focusFirstRow(scroller);
  };
  const longPress = useLongPress((value) => {
    setSelecting(true);
    setSelected((prev) => (prev.includes(value) ? prev : [...prev, value]));
  });
  const onSelectedChange = (next: string[]) => {
    setSelected(next);
    // Android: deselecting the last item ends the contextual mode. With a toolbar it stays, disabled.
    if (!toolbar && next.length === 0) exit();
  };
  const act = (verb: string) => () => flash(`${verb} ${noun(count)}`);
  const remove = () => {
    flash(`Deleted ${noun(count)}`);
    setItems((all) => all.filter((item) => !selected.includes(item.value)));
    exit();
  };
  const selectAll = () => setSelected(items.map((item) => item.value));

  const toolbarActions: SelectionToolbarAction[] = [
    { label: "Share", icon: <Share />, onSelect: act("Shared") },
    { label: "Move", icon: <FolderInput />, onSelect: act("Moved") },
    { label: "Duplicate", icon: <Copy />, onSelect: act("Duplicated"), disabled: disableDuplicate },
    { label: "Delete", icon: <Trash2 />, onSelect: remove, destructive: true },
  ];

  return (
    <Screen platform={platform} bare={bare} height={height}>
      <div
        ref={setScroller}
        onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 8)}
        style={{
          boxSizing: "border-box",
          height: "100%",
          overflowY: "auto",
          overscrollBehavior: "contain",
          padding: `${headerHeight + 0.75}rem 0.875rem 7.5rem`,
        }}
      >
        <Cover />
        {items.length > 0 ? (
          <List variant="inset" listLabel="Stickers" selectable={selecting} selectedValues={selected} onSelectedValuesChange={onSelectedChange}>
            {items.map((s) => (
              <ListItem
                key={s.value}
                value={s.value}
                leading={<ListThumbnail tone={s.tone}>{s.icon}</ListThumbnail>}
                title={s.title}
                subtitle={s.subtitle}
                trailing={s.size}
                chevron
                onClick={() => flash(`Opened ${s.title}`)}
                {...(ios ? null : longPress(s.value))}
              />
            ))}
          </List>
        ) : (
          <EmptyState onRestore={() => setItems(LIBRARY)} />
        )}
      </div>

      {/* The header floats over the list; content scrolls under its glass. */}
      <div ref={measureHeader} style={{ position: "absolute", insetInline: 0, top: 0, zIndex: 5, padding: "0.75rem 0.875rem 0" }}>
        <Header
          title={title}
          titleAs="h3"
          subtitle={subtitle ? `${noun(items.length)} · updated today` : undefined}
          collapsed={docked}
          onBack={back ? noop : undefined}
          actions={actions ? <HeaderAction aria-label="Share" icon={<Share />} onClick={() => flash("Shared the pack")} /> : undefined}
          overflowMenu={
            actions ? (
              <>
                {!ios && (
                  <MenuItem icon={<SquareCheck />} onSelect={start}>
                    Select
                  </MenuItem>
                )}
                <MenuItem icon={<Download />} onSelect={() => flash("Exported .tgs pack")}>
                  {ios ? "Export Pack" : "Export pack"}
                </MenuItem>
              </>
            ) : undefined
          }
          onStartSelection={start}
          selectionCount={selecting ? count : undefined}
          onCancelSelection={exit}
          allSelected={items.length > 0 && count === items.length}
          onSelectAll={selectAll}
          onDeselectAll={toolbar ? () => setSelected([]) : exit}
          selectionActions={
            toolbar ? undefined : (
              <>
                <HeaderAction aria-label="Share" icon={<Share />} onClick={act("Shared")} />
                <HeaderAction aria-label="Delete" icon={<Trash2 />} onClick={remove} />
              </>
            )
          }
          selectionOverflowMenu={
            toolbar ? undefined : (
              <>
                <MenuItem icon={<FolderInput />} onSelect={act("Moved")}>
                  Move to…
                </MenuItem>
                <MenuItem icon={<Copy />} onSelect={act("Duplicated")}>
                  Duplicate
                </MenuItem>
              </>
            )
          }
        />
      </div>

      <Flash message={message} bottom="6.75rem" />
      <div style={{ position: "absolute", insetInline: 0, bottom: ios ? "1.125rem" : "1rem", display: "flex", justifyContent: "center", padding: "0 0.875rem" }}>
        {toolbar && selecting ? (
          <SelectionToolbar
            pinned={false}
            count={count}
            actions={toolbarActions}
            moreMenu={
              moreMenu ? (
                <>
                  <MenuItem icon={<Download />} onSelect={act("Exported")}>
                    Export
                  </MenuItem>
                  <MenuItem icon={<Tag />} onSelect={act("Tagged")}>
                    {ios ? "Add Tag" : "Add tag"}
                  </MenuItem>
                </>
              ) : undefined
            }
          />
        ) : (
          <TabBar items={tabItems} value={tab} onValueChange={setTab} placement="bottom" layout="compact" pinned={false} aria-label="Sections" />
        )}
      </div>
    </Screen>
  );
}

/* ───────────────────────── Web flow (PageHeader ↔ SelectionBar) ───────────────────────── */

export interface WebFlowProps {
  startSelected?: string[];
  height?: number;
  bare?: boolean;
  /** SelectionBar `showKeyboardHint`. */
  hint?: boolean;
  /** Offer “Select all 120 stickers in Library” once the page is full. */
  scope?: boolean;
}

function useWidthRem() {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!node) return;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const observer = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width / rem));
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);
  return [setNode, width] as const;
}

/**
 * A desktop page: PageHeader over a list with hover-revealed checkboxes. Selecting replaces the header with
 * a sticky SelectionBar. ⌘/Ctrl+A and Esc work while the pointer or focus is inside the demo.
 */
export function WebSelectionFlow({ startSelected = [], height = 30, bare = false, hint = true, scope = true }: WebFlowProps) {
  const [items, setItems] = useState(LIBRARY);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(startSelected));
  const [everything, setEverything] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [measure, width] = useWidthRem();
  const anchor = useRef<number | null>(null);
  const shift = useRef(false);
  const [message, flash] = useFlash();

  const active = pointerInside || focusInside;
  const pageCount = selected.size;
  const count = everything ? LIBRARY_TOTAL : pageCount;

  const selectAll = () => {
    setEverything(false);
    setSelected(new Set(items.map((item) => item.value)));
    focusFirstRow(scroller);
  };
  const clear = () => {
    setSelected(new Set());
    setEverything(false);
    focusFirstRow(scroller);
  };
  // Before anything is selected there is no bar yet: the hook alone gives ⌘A.
  useSelectionShortcuts({ enabled: active && count === 0, onSelectAll: selectAll });

  const toggle = (index: number, on: boolean, range: boolean) => {
    const from = anchor.current;
    const values = items.map((item) => item.value);
    setEverything(false);
    setSelected((prev) => {
      const next = new Set(prev);
      const [a, b] = range && from !== null ? [Math.min(from, index), Math.max(from, index)] : [index, index];
      for (let i = a; i <= b; i++) {
        const value = values[i];
        if (value === undefined) continue;
        if (on) next.add(value);
        else next.delete(value);
      }
      return next;
    });
    anchor.current = index;
  };

  const remove = () => {
    flash(`Deleted ${noun(count)}`);
    setItems((all) => (everything ? [] : all.filter((item) => !selected.has(item.value))));
    clear();
  };
  const act = (verb: string) => () => flash(`${verb} ${noun(count)}`);

  // Labelled buttons where they fit; icon-only circles (with names) on narrow windows.
  const labelled = width >= 38;
  const barActions = labelled ? (
    <>
      <Button variant="secondary" size="s" leadingIcon={<Share />} onClick={act("Shared")}>
        Share
      </Button>
      <Button variant="secondary" size="s" leadingIcon={<FolderInput />} onClick={act("Moved")}>
        Move
      </Button>
      <Button variant="danger" size="s" leadingIcon={<Trash2 />} onClick={remove}>
        Delete
      </Button>
    </>
  ) : (
    <>
      {width >= 24 && (
        <Button variant="secondary" size="s" iconOnly aria-label="Share" onClick={act("Shared")}>
          <Share />
        </Button>
      )}
      <Button variant="danger" size="s" iconOnly aria-label="Delete" onClick={remove}>
        <Trash2 />
      </Button>
    </>
  );

  return (
    <Screen platform="web" bare={bare} height={height} wide>
      <div
        ref={(node) => {
          setScroller(node);
          measure(node);
        }}
        style={{ boxSizing: "border-box", height: "100%", overflowY: "auto", overscrollBehavior: "contain", padding: "1rem 1rem 3.5rem" }}
        onPointerEnter={() => setPointerInside(true)}
        onPointerLeave={() => setPointerInside(false)}
        onFocus={() => setFocusInside(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusInside(false);
        }}
      >
        {count > 0 ? (
          <SelectionBar
            count={count}
            total={items.length}
            everythingSelected={everything}
            onSelectAllChange={(on) => (on ? selectAll() : clear())}
            onClear={clear}
            actions={barActions}
            keyboardShortcuts={active}
            showKeyboardHint={hint}
            itemNoun="stickers"
            scopeTotal={scope ? LIBRARY_TOTAL : undefined}
            scopeLabel={scope ? "Library" : undefined}
            onSelectEverything={scope ? () => setEverything(true) : undefined}
          />
        ) : (
          <PageHeader
            breadcrumbs={[{ label: "Library", href: "#", onClick: (event) => event.preventDefault() }, { label: "Foggy Stickers" }]}
            title="Foggy Stickers"
            titleAs="h3"
            description={`${noun(items.length)} · updated today`}
            actions={
              <>
                <Menu
                  trigger={
                    <Button variant="ghost" size="s" iconOnly aria-label="More">
                      <Ellipsis />
                    </Button>
                  }
                >
                  <MenuItem icon={<CheckCheck />} onSelect={selectAll}>
                    Select all
                  </MenuItem>
                  <MenuItem icon={<Download />} onSelect={() => flash("Exported .tgs pack")}>
                    Export .tgs
                  </MenuItem>
                </Menu>
                <Button variant="secondary" size="s" onClick={() => flash("Shared the pack")}>
                  Share
                </Button>
              </>
            }
          />
        )}

        {items.length > 0 ? (
          <ul aria-label="Stickers" style={{ display: "flex", flexDirection: "column", gap: "0.125rem", margin: "0.75rem 0 0", padding: 0, listStyle: "none" }}>
            {items.map((s, index) => {
              const on = everything || selected.has(s.value);
              const reveal = on || count > 0 || hovered === s.value || focused === s.value;
              return (
                <li
                  key={s.value}
                  onPointerEnter={() => setHovered(s.value)}
                  onPointerLeave={() => setHovered((h) => (h === s.value ? null : h))}
                  onFocus={() => setFocused(s.value)}
                  onBlur={() => setFocused((f) => (f === s.value ? null : f))}
                  onClick={(event) => {
                    // While selecting, the whole row toggles; Shift extends from the last row.
                    if (count === 0 || (event.target as HTMLElement).closest("label, button, a, input")) return;
                    toggle(index, !on, event.shiftKey);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    minHeight: "3.75rem",
                    padding: "0 0.75rem 0 0.25rem",
                    borderRadius: "0.875rem",
                    background: on ? "var(--sf-surface-2)" : hovered === s.value ? "var(--sf-surface-1)" : "transparent",
                    cursor: count > 0 ? "pointer" : undefined,
                    userSelect: "none",
                  }}
                >
                  <span style={{ display: "inline-flex", opacity: reveal ? 1 : 0, transition: "opacity var(--sf-duration-fast) var(--sf-ease-standard)" }}>
                    <Checkbox
                      aria-label={`Select ${s.title}`}
                      checked={on}
                      onClick={(event) => {
                        shift.current = event.shiftKey;
                      }}
                      onCheckedChange={(next) => {
                        toggle(index, next, shift.current);
                        shift.current = false;
                      }}
                    />
                  </span>
                  <ListThumbnail tone={s.tone}>{s.icon}</ListThumbnail>
                  <span style={{ display: "flex", flexDirection: "column", gap: "0.125rem", flex: 1, minWidth: 0 }}>
                    <span style={{ overflow: "hidden", color: "var(--sf-fg-default)", font: "500 0.9375rem/1.3 var(--sf-font-sans)", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.title}
                    </span>
                    <span style={{ color: "var(--sf-fg-subtle)", font: "400 0.6875rem/1.3 var(--sf-font-mono)" }}>{s.subtitle}</span>
                  </span>
                  <span style={{ color: "var(--sf-fg-muted)", font: "400 0.75rem var(--sf-font-mono)" }}>{s.size}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState onRestore={() => setItems(LIBRARY)} />
        )}
      </div>
      <Flash message={message} bottom="1rem" />
    </Screen>
  );
}

/** The recommended flow for a platform: iOS / Android phone screens, the desktop web page. */
export function SelectionFlow({ platform, ...props }: PhoneFlowProps) {
  return platform === "web" ? (
    <WebSelectionFlow startSelected={props.startSelected} height={props.height} bare={props.bare} />
  ) : (
    <PhoneSelectionFlow platform={platform} {...props} />
  );
}
