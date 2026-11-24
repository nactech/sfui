import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fireEvent, fn, userEvent, within } from "storybook/test";
import { CloudFog, Library, Play, Search, Settings2, Upload } from "lucide-react";
import TabBar, { type TabBarItem } from ".";

// Frames: final.pen → N/A2 "Tab bar / Android + Web", N/A3 "Tab bar / Motion", N/A4 "Tab bar / Web top placement".

const items: TabBarItem[] = [
  { value: "library", label: "Library", icon: <Library /> },
  { value: "player", label: "Player", icon: <Play /> },
  { value: "export", label: "Export", icon: <Upload /> },
  { value: "settings", label: "Settings", icon: <Settings2 /> },
];

/** Local stand-in for the Painted Ladies photo: sky, rooftops, trees, street. */
const photo =
  "linear-gradient(180deg, #8fb3dd 0%, #b9cde6 34%, #d9cbb3 35%, #9a7f6a 52%, #4e6b3c 60%, #2f4a2a 74%, #6b6f75 75%, #8a8d92 100%)";

const Stage = ({ children, height = 7.25, caption }: { children: React.ReactNode; height?: number; caption?: string }) => (
  <div style={{ display: "grid", gap: "0.5rem", width: "32.5rem", maxWidth: "100%" }}>
    {caption && (
      <div style={{ font: "500 0.6875rem/1 var(--sf-font-mono)", letterSpacing: "0.08em", color: "var(--sf-fg-muted)" }}>
        {caption}
      </div>
    )}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: `${height}rem`,
        padding: "0 1rem",
        borderRadius: "1.25rem",
        background: photo,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  </div>
);

const Logo = () => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "2.25rem",
      height: "2.25rem",
      borderRadius: "0.75rem",
      background: "var(--sf-accent-default)",
      color: "var(--sf-accent-on)",
    }}
  >
    <CloudFog size="1.25rem" aria-hidden />
  </span>
);

const glassChip: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  boxSizing: "border-box",
  height: "2.75rem",
  border: "1px solid var(--sf-glass-rim)",
  background: "var(--sf-glass-fill)",
  backdropFilter: "blur(var(--sf-glass-blur))",
  WebkitBackdropFilter: "blur(var(--sf-glass-blur))",
  color: "var(--sf-fg-default)",
  borderRadius: "1.375rem",
};

const Account = () => (
  <button
    type="button"
    aria-label="Account"
    style={{ ...glassChip, width: "2.75rem", justifyContent: "center", font: "700 0.8125rem var(--sf-font-mono)", cursor: "pointer" }}
  >
    MF
  </button>
);

const SearchStub = () => (
  <span style={{ ...glassChip, gap: "0.5rem", padding: "0 0.75rem 0 1rem", width: "13.75rem", color: "var(--sf-fg-subtle)" }}>
    <Search size="1.125rem" aria-hidden />
    <span style={{ flex: 1, font: "400 0.9375rem var(--sf-font-sans)" }}>Search stickers</span>
    <kbd style={{ font: "500 0.6875rem var(--sf-font-mono)", color: "var(--sf-fg-muted)" }}>⌘K</kbd>
  </span>
);

const Cards = ({ count = 6 }: { count?: number }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.875rem" }}>
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        style={{ height: "5.625rem", borderRadius: "1rem", background: "var(--sf-surface-1)", border: "1px solid var(--sf-rim-default)" }}
      />
    ))}
  </div>
);

const meta = {
  title: "Components/TabBar",
  component: TabBar,
  tags: ["autodocs"],
  args: {
    items,
    defaultValue: "library",
    "aria-label": "Sections",
    placement: "bottom",
    layout: "compact",
    pinned: false,
    onValueChange: fn(),
  },
  argTypes: {
    placement: { control: "inline-radio", options: ["auto", "bottom", "top"] },
    layout: { control: "inline-radio", options: ["auto", "compact", "wide"] },
    align: { control: "inline-radio", options: ["center", "start"] },
  },
  render: (args) => (
    <Stage>
      <TabBar {...args} />
    </Stage>
  ),
} satisfies Meta<typeof TabBar>;
export default meta;

type Story = StoryObj<typeof meta>;

/** N/A2 row 1 · Rest — compact capsule over content. Tap a tab, or press and drag the pill. */
export const Default: Story = {};

/** N/A2 rows 1–5 side by side. Rows 2 and 4 are put into their state by the story's play function. */
export const Matrix: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <Stage caption="1 · REST">
        <TabBar {...args} />
      </Stage>
      <Stage caption="2 · PRESSED — state layer on the pill">
        <TabBar {...args} data-row="pressed" />
      </Stage>
      <Stage caption="3 · BADGE">
        <TabBar {...args} items={items.map((i) => (i.value === "export" ? { ...i, badge: 3 } : i))} />
      </Stage>
      <Stage caption="4 · FOCUS — web keyboard">
        <TabBar {...args} data-row="focus" />
      </Stage>
      <Stage caption="5 · WIDE (WEB ≥ 600) — labels beside icons" height={6}>
        <TabBar {...args} layout="wide" />
      </Stage>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const pressedRow = canvasElement.querySelector('[data-row="pressed"]') as HTMLElement;
    fireEvent.pointerDown(within(pressedRow).getByRole("tab", { name: "Player" }), { pointerId: 99, isPrimary: true, button: 0 });
    const focusRow = canvasElement.querySelector('[data-row="focus"]') as HTMLElement;
    within(focusRow).getByRole("tab", { name: "Library" }).focus();
    await userEvent.keyboard("{ArrowRight}");
  },
};

/** N/A2 row 3 · Badge: counts (99+ cap) and a dot. */
export const Badges: Story = {
  args: {
    items: [
      { ...items[0] },
      { ...items[1], badge: true, badgeLabel: "new" },
      { ...items[2], badge: 3 },
      { ...items[3], badge: 120 },
    ],
  },
};

/** Disabled tabs use the opaque disabled foreground, are skipped by arrows and by the drag snap. */
export const Disabled: Story = {
  args: { items: items.map((i) => (i.value === "player" ? { ...i, disabled: true } : i)) },
};

/** N/A2 row 5 · Wide (web ≥ 600): `Tab Bar/Web Top` layout at the bottom. */
export const Wide: Story = {
  args: { layout: "wide" },
};

/**
 * N/A3 · Motion. Tap: the pill slides and stretches (× 1.4, trailing edge lags 40 ms; spring 700 / 0.9), the tint
 * swaps at 50 %. Hold: pill grows to 62 × 36. Drag: it follows the pointer (spring 1400 / 1.0); the tab opens only on
 * release, snapping to the nearest one. Drag > 40 px away from the bar to cancel. With "Reduce motion" on, the pill
 * switches instantly.
 */
export const Motion: Story = {
  render: function Render(args) {
    const [value, setValue] = useState("library");
    return (
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {(["compact", "wide"] as const).map((layout) => (
          <Stage key={layout} caption={`${layout.toUpperCase()} · CONTENT: ${value.toUpperCase()}`}>
            <TabBar
              {...args}
              layout={layout}
              value={value}
              onValueChange={(v) => {
                setValue(v);
                args.onValueChange?.(v);
              }}
            />
          </Stage>
        ))}
      </div>
    );
  },
};

/** Links mode: items with `href` render a `<nav>` with `aria-current="page"` (no router dependency). */
export const Links: Story = {
  args: {
    items: items.map((i) => ({ ...i, href: `#${i.value}` })),
    "aria-label": "Main",
  },
};

/** N/A4 row 1 · Web ≥ 600, top, centred — logo and account sit outside the capsule. */
export const TopCentered: Story = {
  parameters: { layout: "padded" },
  args: { placement: "top", layout: "auto", align: "center" },
  render: (args) => (
    <div
      style={{
        display: "grid",
        gap: "0.875rem",
        maxWidth: "51.25rem",
        padding: "1rem",
        borderRadius: "1.125rem",
        border: "1px solid var(--sf-rim-strong)",
        background: "var(--sf-surface-0)",
      }}
    >
      <TabBar {...args} leading={<Logo />} trailing={<Account />} />
      <Cards />
    </div>
  ),
};

/** N/A4 row 2 · Web ≥ 600, top, left — dense tools: search on the right. */
export const TopStart: Story = {
  ...TopCentered,
  args: { placement: "top", layout: "auto", align: "start" },
  render: (args) => (
    <div
      style={{
        display: "grid",
        gap: "0.875rem",
        maxWidth: "51.25rem",
        padding: "1rem",
        borderRadius: "1.125rem",
        border: "1px solid var(--sf-rim-strong)",
        background: "var(--sf-surface-0)",
      }}
    >
      <TabBar
        {...args}
        leading={<Logo />}
        trailing={
          <>
            <SearchStub />
            <Account />
          </>
        }
      />
      <Cards count={3} />
    </div>
  ),
};

/** N/A4 row 3 · Scrolled — sticky 16 from the top, glass over content. Scroll inside the frame. */
export const TopScrolled: Story = {
  parameters: { layout: "padded" },
  args: { placement: "top", layout: "auto", pinned: true },
  render: (args) => (
    <div
      style={{
        height: "20rem",
        maxWidth: "51.25rem",
        overflowY: "auto",
        borderRadius: "1.125rem",
        border: "1px solid var(--sf-rim-strong)",
        background: "var(--sf-surface-0)",
      }}
    >
      <div style={{ padding: "1rem", display: "grid", gap: "0.875rem" }}>
        <TabBar {...args} defaultValue="export" leading={<Logo />} trailing={<Account />} />
        <div style={{ height: "16rem", borderRadius: "1rem", background: photo }} />
        <Cards />
        <div style={{ height: "16rem", borderRadius: "1rem", background: photo }} />
      </div>
    </div>
  ),
};

/**
 * N/A4 row 4 + placement `auto` on a real page: resize the viewport. From 600 px the bar is the sticky top navigation
 * (wide layout); below 600 px it floats at the bottom (compact layout, `position: fixed`) and the slots hide.
 */
export const Responsive: Story = {
  parameters: { layout: "fullscreen" },
  args: { placement: "auto", layout: "auto", pinned: true },
  render: (args) => (
    <div style={{ minHeight: "200vh", padding: "1rem 1rem 7rem", display: "grid", gap: "0.875rem", alignContent: "start" }}>
      <TabBar {...args} leading={<Logo />} trailing={<Account />} />
      <div style={{ height: "18rem", borderRadius: "1rem", background: photo }} />
      <Cards count={9} />
      <div style={{ height: "18rem", borderRadius: "1rem", background: photo }} />
    </div>
  ),
};

// ── iOS implementation ──────────────────────────────────────────────────────
// Frames: final.pen → N/A1 "Tab bar / iOS" (rows 1–5) and N/A3 "Tab bar / Motion" row I + SPEC (iOS column).
// Pinned to `platform: "ios"`; 390 px phone-width stages.

const PhoneStage = ({ children, height = 6.875, caption }: { children: React.ReactNode; height?: number; caption?: string }) => (
  <div style={{ display: "grid", gap: "0.5rem", width: "24.375rem", maxWidth: "100%" }}>
    {caption && (
      <div style={{ font: "500 0.6875rem/1 var(--sf-font-mono)", letterSpacing: "0.08em", color: "var(--sf-fg-muted)" }}>
        {caption}
      </div>
    )}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: `${height}rem`,
        padding: "0 1rem",
        borderRadius: "1.25rem",
        background: photo,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  </div>
);

const iosParams = { platform: "ios", layout: "centered" } as const;

/** N/A1 row 1 · Rest — floating glass bar, the selected tab sits in the lens, search is a separate circle. */
export const IOSRest: Story = {
  name: "iOS · Rest",
  parameters: iosParams,
  args: { search: { label: "Search stickers" } },
  render: (args) => (
    <PhoneStage>
      <TabBar {...args} />
    </PhoneStage>
  ),
};

/**
 * N/A1 rows 1–5 side by side. Row 2 is put into its pressed state by the play function; row 4 is `minimized`,
 * row 5 renders the search field expanded.
 */
export const IOSMatrix: Story = {
  name: "iOS · Matrix",
  parameters: iosParams,
  args: { search: { label: "Search stickers" } },
  render: (args) => (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <PhoneStage caption="1 · REST">
        <TabBar {...args} />
      </PhoneStage>
      <PhoneStage caption="2 · PRESSED — lens grows under the finger">
        <TabBar {...args} data-row="pressed" />
      </PhoneStage>
      <PhoneStage caption="3 · BADGE">
        <TabBar {...args} items={items.map((i) => (i.value === "export" ? { ...i, badge: 3 } : i))} />
      </PhoneStage>
      <PhoneStage caption="4 · MINIMIZED ON SCROLL" height={6}>
        <TabBar {...args} minimized />
      </PhoneStage>
      <PhoneStage caption="5 · SEARCH EXPANDED — search tab becomes a field" height={6}>
        <TabBar {...args} search={{ label: "Search stickers", defaultExpanded: true }} />
      </PhoneStage>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const pressedRow = canvasElement.querySelector('[data-row="pressed"]') as HTMLElement;
    fireEvent.pointerDown(within(pressedRow).getByRole("tab", { name: "Player" }), { pointerId: 99, isPrimary: true, button: 0 });
  },
};

/** N/A1 row 3 · Badge (count, 99+ cap, dot) on iOS. */
export const IOSBadges: Story = {
  name: "iOS · Badges",
  parameters: iosParams,
  args: {
    search: { label: "Search stickers" },
    items: [{ ...items[0] }, { ...items[1], badge: true, badgeLabel: "new" }, { ...items[2], badge: 3 }, { ...items[3], badge: 120 }],
  },
  render: IOSRest.render,
};

/**
 * N/A3 row I + SPEC (iOS): the lens travels with the iOS spring (response 0.32, damping 0.82) and stretches × 1.3.
 * Press and hold: the lens lifts into glass at 1.15×; drag: it follows the finger (0.15 / 0.86) and the tab opens only
 * on release. Drag > 40 px away from the bar to cancel. Reduce motion: instant switch.
 */
export const IOSMotion: Story = {
  name: "iOS · Motion",
  parameters: iosParams,
  args: { search: { label: "Search stickers" } },
  render: function Render(args) {
    const [value, setValue] = useState("library");
    return (
      <PhoneStage caption={`CONTENT: ${value.toUpperCase()}`}>
        <TabBar
          {...args}
          value={value}
          onValueChange={(v) => {
            setValue(v);
            args.onValueChange?.(v);
          }}
        />
      </PhoneStage>
    );
  },
};

/** N/A1 row 5 · Search: tap the circle — it becomes a field (Esc or ✕ closes it). */
export const IOSSearch: Story = {
  name: "iOS · Search",
  parameters: iosParams,
  render: function Render(args) {
    const [query, setQuery] = useState("");
    return (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <PhoneStage height={6}>
          <TabBar
            {...args}
            search={{
              label: "Search stickers",
              inputProps: { value: query, onChange: (e) => setQuery(e.target.value) },
              onExpandedChange: (open) => !open && setQuery(""),
            }}
          />
        </PhoneStage>
        <div style={{ font: "500 0.75rem var(--sf-font-mono)", color: "var(--sf-fg-muted)" }}>query: “{query}”</div>
      </div>
    );
  },
};

/**
 * N/A1 row 4 · `minimized="auto"` on a phone-sized scroller: scroll down — the bar collapses to the selected tab and
 * the search circle; scroll up (or tap the circle) — it comes back.
 */
export const IOSMinimizeOnScroll: Story = {
  name: "iOS · Minimize on scroll",
  parameters: iosParams,
  render: function Render(args) {
    const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
    return (
      <div
        style={{
          position: "relative",
          width: "24.375rem",
          height: "40rem",
          borderRadius: "2.5rem",
          border: "1px solid var(--sf-rim-strong)",
          overflow: "hidden",
          background: "var(--sf-surface-0)",
        }}
      >
        <div ref={setScroller} style={{ height: "100%", overflowY: "auto" }}>
          <div style={{ padding: "1rem 1rem 7rem", display: "grid", gap: "0.875rem" }}>
            <div style={{ height: "14rem", borderRadius: "1rem", background: photo }} />
            <Cards count={12} />
            <div style={{ height: "14rem", borderRadius: "1rem", background: photo }} />
            <Cards count={9} />
          </div>
        </div>
        <div style={{ position: "absolute", insetInline: "1rem", bottom: "1.3125rem" }}>
          <TabBar {...args} minimized="auto" scrollContainer={scroller} search={{ label: "Search stickers" }} />
        </div>
      </div>
    );
  },
};

/** Links mode on iOS: a `<nav>` with `aria-current="page"`. */
export const IOSLinks: Story = {
  name: "iOS · Links",
  parameters: iosParams,
  args: { items: items.map((i) => ({ ...i, href: `#${i.value}` })), "aria-label": "Main", search: { label: "Search stickers" } },
  render: IOSRest.render,
};
