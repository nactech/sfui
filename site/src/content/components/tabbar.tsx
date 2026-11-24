import type React from "react";
import { useState } from "react";
import { CloudFog, Search } from "lucide-react";
import { TabBar, type Platform, type TabBarItem, type TabBarLayout } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column, tabItems } from "../shared";

const withBadges = (items: TabBarItem[]): TabBarItem[] =>
  items.map((i) =>
    i.value === "player" ? { ...i, badge: true, badgeLabel: "new" } : i.value === "export" ? { ...i, badge: 3, badgeLabel: "3 new exports" } : i,
  );

function Caption({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "var(--sf-fg-default)", font: "500 0.75rem/1 var(--sf-font-mono)", letterSpacing: "0.06em", textShadow: "0 1px 2px #0008" }}>{children}</span>;
}

function LiveBar({ values }: DemoProps) {
  const [value, setValue] = useState("library");
  const [minimized, setMinimized] = useState(Boolean(values.minimized));
  const items = tabItems.map((i) => ({
    ...i,
    badge: values.badge && i.value === "export" ? 3 : undefined,
    badgeLabel: values.badge && i.value === "export" ? "3 new exports" : undefined,
    disabled: Boolean(values.disabledTab) && i.value === "settings",
  }));
  return (
    <Column gap={1}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Caption>CONTENT · {value.toUpperCase()}</Caption>
      </div>
      <TabBar
        items={items}
        value={value}
        onValueChange={setValue}
        placement="bottom"
        layout={values.layout as TabBarLayout}
        pinned={false}
        aria-label="Sections"
        search={values.search ? { label: "Search stickers" } : undefined}
        minimized={minimized}
        onMinimizedChange={setMinimized}
      />
    </Column>
  );
}

/** `key` resets the local minimized state when the control changes. */
function Demo({ values }: DemoProps) {
  return (
    <div style={{ width: "min(26rem, 100%)" }}>
      <LiveBar key={String(values.minimized)} values={values} />
    </div>
  );
}

function PlatformDemo({ platform }: { platform: Platform }) {
  const [value, setValue] = useState("library");
  return (
    <Column gap={1}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Caption>CONTENT · {value.toUpperCase()}</Caption>
      </div>
      <TabBar
        items={withBadges(tabItems)}
        value={value}
        onValueChange={setValue}
        placement="bottom"
        layout={platform === "web" ? "wide" : "compact"}
        pinned={false}
        aria-label="Sections"
        search={platform === "ios" ? { label: "Search stickers" } : undefined}
      />
    </Column>
  );
}

function Preview() {
  return (
    <div style={{ width: "22rem" }}>
      <TabBar items={tabItems} defaultValue="library" placement="bottom" layout="compact" pinned={false} aria-label="Sections" platform="web" />
    </div>
  );
}

const Logo = () => (
  <span
    style={{
      display: "inline-grid",
      placeItems: "center",
      width: "2.25rem",
      height: "2.25rem",
      borderRadius: "0.75rem",
      background: "var(--sf-accent-default)",
      color: "var(--sf-accent-on)",
    }}
  >
    <CloudFog size="1.25rem" aria-hidden="true" />
  </span>
);

const glassChip: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "2.75rem",
  minWidth: "2.75rem",
  border: "1px solid var(--sf-glass-rim)",
  borderRadius: "1.375rem",
  background: "var(--sf-glass-fill)",
  backdropFilter: "blur(var(--sf-glass-blur))",
  color: "var(--sf-fg-default)",
  font: "700 0.8125rem var(--sf-font-mono)",
};

const tabbar: ComponentDoc = {
  slug: "tabbar",
  name: "TabBar",
  group: "Navigation",
  summary: "Top-level navigation: a floating glass capsule whose selection pill travels, stretches and can be dragged.",
  docStatus: "complete",
  status: "stable",
  exports: ["TabBar"],
  platformSplit: "split",
  stage: "photo",
  Demo,
  Preview,
  controls: [
    { type: "boolean", name: "badge", label: "Badge on Export", default: true },
    { type: "boolean", name: "disabledTab", label: "Disable Settings", default: false },
    { type: "enum", name: "layout", label: "Layout (Android + Web)", options: ["compact", "wide"], default: "compact" },
    { type: "boolean", name: "search", label: "Search tab (iOS)", default: true },
    { type: "boolean", name: "minimized", label: "Minimized (iOS)", default: false },
  ],
  code: (v) =>
    `import { TabBar } from "@nactech/sfui";
import { Library, Play, Settings2, Upload } from "lucide-react";

const items = [
  { value: "library", label: "Library", icon: <Library /> },
  { value: "player", label: "Player", icon: <Play /> },
  { value: "export", label: "Export", icon: <Upload />${v.badge ? ", badge: 3" : ""} },
  { value: "settings", label: "Settings", icon: <Settings2 />${v.disabledTab ? ", disabled: true" : ""} },
];

<TabBar
  items={items}
  value={tab}
  onValueChange={setTab}
  aria-label="Sections"${v.layout === "wide" ? '\n  layout="wide"' : ""}${v.search ? '\n  search={{ label: "Search stickers" }}' : ""}${v.minimized ? "\n  minimized" : ""}
/>`,

  overview: {
    intro: (
      <>
        The tab bar switches between the three to five top-level destinations of an app. It floats over the content as a
        glass capsule; the selected tab sits in a pill (a glass lens on iOS) that travels with a spring, stretches mid-way,
        grows when you hold it and follows your finger when you drag — the tab opens only on release. From 600 px wide on
        the web it becomes the sticky top navigation with labels beside the icons.
      </>
    ),
    whenToUse: [
      "Three to five peer destinations the user moves between all the time: Library, Player, Export, Settings.",
      "As the app’s main navigation — with `href` items it renders a real <nav> with links.",
      "As tabs over in-page panels — without `href` it is a WAI-ARIA tablist.",
    ],
    whenNotToUse: [
      "Two or three views of the same content (filters, display modes) — use Segmented.",
      "Actions (Share, Delete) — use Button, or SelectionToolbar while items are selected on iOS.",
      "More than five destinations — group them, or move the rest into a Settings / More screen.",
    ],
  },

  variants: [
    {
      name: "Compact · Android + Web",
      description: "Tonal pill behind the icon, label under it. Floating at the bottom below 600 px.",
      stage: "photo",
      render: () => (
        <div style={{ width: "min(24rem, 100%)" }}>
          <TabBar items={tabItems} defaultValue="library" placement="bottom" layout="compact" pinned={false} aria-label="Sections" platform="android" />
        </div>
      ),
    },
    {
      name: "Badges",
      description: "A count (0 hides it, over 99 shows 99+) or a dot. The meaning goes into the tab’s accessible name.",
      stage: "photo",
      render: () => (
        <div style={{ width: "min(24rem, 100%)" }}>
          <TabBar
            items={tabItems.map((i, n) => ({ ...i, badge: [undefined, true, 3, 120][n] as number | boolean | undefined }))}
            defaultValue="library"
            placement="bottom"
            layout="compact"
            pinned={false}
            aria-label="Sections"
            platform="web"
          />
        </div>
      ),
    },
    {
      name: "Wide · Web",
      description: "Labels beside the icons — the web layout from 600 px, also available at the bottom.",
      stage: "photo",
      render: () => (
        <div style={{ width: "min(34rem, 100%)", display: "flex", justifyContent: "center" }}>
          <TabBar items={tabItems} defaultValue="player" placement="bottom" layout="wide" pinned={false} aria-label="Sections" platform="web" />
        </div>
      ),
    },
    {
      name: "Top navigation · Web",
      description: "`placement=\"top\"`: the sticky top bar. A logo and account sit outside the capsule, never inside it.",
      render: () => (
        <div style={{ width: "min(44rem, 100%)", overflowX: "auto" }}>
          <TabBar
            items={tabItems}
            defaultValue="export"
            placement="top"
            pinned={false}
            aria-label="Main"
            platform="web"
            leading={<Logo />}
            trailing={
              <span style={glassChip} aria-hidden="true">
                MF
              </span>
            }
          />
        </div>
      ),
    },
    {
      name: "iOS",
      description: "A Liquid-Glass bar with a lens, and search as a separate circle beside it.",
      stage: "photo",
      render: () => (
        <div style={{ width: "min(24rem, 100%)" }}>
          <TabBar items={tabItems} defaultValue="library" pinned={false} aria-label="Sections" platform="ios" search={{ label: "Search stickers" }} />
        </div>
      ),
    },
    {
      name: "iOS · Minimized",
      description: "`minimized` (or `\"auto\"` on scroll) collapses the bar to the selected tab. Tap it to restore.",
      stage: "photo",
      render: () => (
        <div style={{ width: "min(24rem, 100%)" }}>
          <TabBar items={tabItems} defaultValue="player" pinned={false} aria-label="Sections" platform="ios" minimized search={{ label: "Search stickers" }} />
        </div>
      ),
    },
    {
      name: "iOS · Search expanded",
      description: "The search circle grows into a field; the bar steps aside. Esc or ✕ closes it.",
      stage: "photo",
      render: () => (
        <div style={{ width: "min(24rem, 100%)" }}>
          <TabBar items={tabItems} defaultValue="library" pinned={false} aria-label="Sections" platform="ios" search={{ label: "Search stickers", defaultExpanded: true }} />
        </div>
      ),
    },
  ],

  platforms: {
    intro: (
      <>
        TabBar has two implementations. iOS gets the floating Liquid-Glass bar with a lens; Android and the web share the
        tonal-pill capsule, and the web adds hover, a keyboard focus ring and the wide top placement. Both use the same
        timing rules — the springs differ.
      </>
    ),
    Demo: PlatformDemo,
    notes: {
      ios: [
        "Glass lens selection; holding lifts it to 1.15×. Spring: response 0.32, damping 0.82.",
        "Always floats at the bottom above the home indicator — `placement`, `layout`, `leading` and `trailing` are ignored.",
        "`minimized=\"auto\"` collapses it on scroll; `search` adds the separate search circle.",
        "Labels in SF Pro (the system font).",
      ],
      android: [
        "Tonal pill behind the icon, label under it; the compact capsule floats at the bottom.",
        "Tap spring: stiffness 700, damping 0.9; the pill stretches × 1.4 with a 40 ms trailing edge.",
        "A haptic tick for every tab crossed while dragging (where `navigator.vibrate` exists).",
      ],
      web: [
        "Same pill as Android, plus hover and a `:focus-visible` ring.",
        "`placement=\"auto\"`: floating at the bottom below 600 px, sticky top navigation with labels beside icons from 600 px.",
        "`leading` / `trailing` slots for the logo, search and account in the top placement.",
      ],
    },
  },

  usage: {
    guidelines: [
      "Keep it to three to five destinations, always in the same order.",
      "Every destination gets a short label and a Lucide icon — the same icon on every platform.",
      "Use `href` items for real navigation (a <nav> with `aria-current=\"page\"`); omit `href` for in-page tabs (a tablist).",
      "Badges are for things that need attention in that destination: a count for actionable items, a dot for “something new”. Set `badgeLabel` so screen readers hear what it means.",
      "Content scrolls under the glass — leave room at the bottom of scrolling views (about 6.5rem on phones).",
      "Don’t hide the tab bar on push navigation inside a tab; minimize it on scroll on iOS instead (`minimized=\"auto\"`).",
    ],
    dos: [
      {
        kind: "do",
        title: "Four destinations, one word each",
        caption: "Short nouns, one icon per destination.",
        stage: "photo",
        render: () => (
          <div style={{ width: "min(22rem, 100%)" }}>
            <TabBar items={tabItems} defaultValue="library" placement="bottom" layout="compact" pinned={false} aria-label="Sections" platform="web" />
          </div>
        ),
      },
      {
        kind: "dont",
        title: "Don’t use it as a filter",
        caption: "Switching views of the same list is a Segmented control’s job.",
        stage: "photo",
        render: () => (
          <div style={{ width: "min(22rem, 100%)" }}>
            <TabBar
              items={[
                { value: "all", label: "All", icon: <Search /> },
                { value: "new", label: "Newest", icon: <Search /> },
                { value: "big", label: "Largest", icon: <Search /> },
              ]}
              defaultValue="all"
              placement="bottom"
              layout="compact"
              pinned={false}
              aria-label="Filter"
              platform="web"
            />
          </div>
        ),
      },
      {
        kind: "do",
        title: "Badge the destination that needs attention",
        caption: "One count, with a spoken label.",
        stage: "photo",
        render: () => (
          <div style={{ width: "min(22rem, 100%)" }}>
            <TabBar
              items={tabItems.map((i) => (i.value === "export" ? { ...i, badge: 3, badgeLabel: "3 new exports" } : i))}
              defaultValue="library"
              placement="bottom"
              layout="compact"
              pinned={false}
              aria-label="Sections"
              platform="web"
            />
          </div>
        ),
      },
      {
        kind: "dont",
        title: "Don’t badge everything",
        caption: "When every tab shouts, users stop looking.",
        stage: "photo",
        render: () => (
          <div style={{ width: "min(22rem, 100%)" }}>
            <TabBar
              items={tabItems.map((i, n) => ({ ...i, badge: [12, true, 3, 99][n] as number | boolean }))}
              defaultValue="library"
              placement="bottom"
              layout="compact"
              pinned={false}
              aria-label="Sections"
              platform="web"
            />
          </div>
        ),
      },
    ],
    writing: [
      "One word, a noun, sentence case: Library, Player, Export, Settings.",
      "Name the place, not the action — “Export”, not “Export your pack”.",
      "Keep labels identical across platforms; only the font changes.",
    ],
  },

  accessibility: {
    intro: (
      <>
        Without <code>href</code> the bar is a WAI-ARIA tablist with a roving tab stop; with <code>href</code> it is a{" "}
        <code>&lt;nav&gt;</code> of links. Give it a name with <code>aria-label</code> either way.
      </>
    ),
    roles: [
      { element: "Bar (tabs mode)", role: "tablist", notes: "aria-orientation=\"horizontal\", named by aria-label / aria-labelledby." },
      { element: "Tab (tabs mode)", role: "tab", notes: "aria-selected; only the focused or selected tab is in the Tab order." },
      { element: "Bar (links mode)", role: "navigation (<nav>)", notes: "Any item with href switches to links." },
      { element: "Item (links mode)", role: "link", notes: "aria-current=\"page\" on the selected one." },
      { element: "Badge", role: "aria-hidden", notes: "Folded into the name: “Export (3 new exports)”." },
      { element: "iOS minimized circle / search", role: "button", notes: "Named after the selected tab / the search label." },
    ],
    keyboard: [
      { keys: ["Tab"], action: "Enters the bar on the selected tab, then leaves it." },
      { keys: ["←", "→"], action: "Move focus between tabs (mirrored in right-to-left). Disabled tabs are skipped." },
      { keys: ["Home", "End"], action: "First / last enabled tab." },
      { keys: ["Enter", "Space"], action: "Selects the focused tab; the pill travels on commit." },
      { keys: ["Esc"], action: "iOS search field: closes it and returns focus to the search circle." },
    ],
    focus: [
      "Focus ring on the focused tab (web); arrows move focus without changing the selection.",
      "When the iOS bar minimizes or the search opens, focus moves to the control that is still visible, and back.",
      "Pointer: hold and drag the pill, release to open the tab under it; drag more than 40 px away from the bar to cancel.",
    ],
    reducedMotion: [
      "With “reduce motion” on, the pill switches instantly with a 150 ms fade — no travel, stretch or overshoot.",
      "The iOS minimize and search morphs become crossfades.",
    ],
  },

  api: [
    {
      component: "TabBar",
      props: [
        { name: "items", type: "TabBarItem[]", required: true, description: "The destinations, in order (see TabBarItem)." },
        { name: "value", type: "string", description: "Controlled selected value." },
        { name: "defaultValue", type: "string", default: "first enabled", description: "Initial value when uncontrolled." },
        { name: "onValueChange", type: "(value: string) => void", description: "Tap, keyboard, or drag release on another tab." },
        { name: "placement", type: '"auto" | "bottom" | "top"', default: '"auto"', description: "`auto`: floating at the bottom below 600 px, sticky top navigation from 600 px.", platform: "android-web" },
        { name: "layout", type: '"auto" | "compact" | "wide"', default: '"auto"', description: "Compact (label under icon) or wide (label beside icon). The top placement is always wide.", platform: "android-web" },
        { name: "align", type: '"center" | "start"', default: '"center"', description: "Top placement: centre the capsule or put it after `leading`.", platform: "android-web" },
        { name: "pinned", type: "boolean", default: "true", description: "Pin to the viewport (fixed at the bottom / sticky at the top). `false` renders it in flow — previews and custom shells." },
        { name: "leading", type: "ReactNode", description: "Top placement only: content before the capsule (logo).", platform: "android-web" },
        { name: "trailing", type: "ReactNode", description: "Top placement only: content after the capsule (search, account).", platform: "android-web" },
        { name: "minimized", type: 'boolean | "auto"', default: "false", description: "Collapse to a circle with the selected tab’s icon; `auto` minimizes on scroll down.", platform: "ios" },
        { name: "onMinimizedChange", type: "(minimized: boolean) => void", description: "Minimized or restored by scrolling or by tapping the circle.", platform: "ios" },
        { name: "scrollContainer", type: "HTMLElement | null", default: "window", description: "With `minimized=\"auto\"`: the element whose scrolling minimizes the bar.", platform: "ios" },
        { name: "search", type: "TabBarSearch", description: "A separate search circle that expands into a field (see TabBarSearch).", platform: "ios" },
        { name: "platform", type: '"auto" | "ios" | "android" | "web"', default: "ConfigProvider", description: "Force one implementation." },
        { name: "aria-label", type: "string", description: "Accessible name of the tablist / navigation." },
        { name: "aria-labelledby", type: "string", description: "Alternative to `aria-label`." },
        { name: "ref", type: "Ref<HTMLDivElement>", description: "The root element." },
      ],
      extends: "Also accepts native <div> attributes (className, style, data-*), applied to the root.",
    },
    {
      component: "TabBarItem",
      description: "One destination.",
      props: [
        { name: "value", type: "string", required: true, description: "Identifies the tab." },
        { name: "label", type: "string", required: true, description: "Visible label." },
        { name: "icon", type: "ReactNode", required: true, description: "Lucide icon, sized by the bar (22 compact and iOS, 18 wide)." },
        { name: "badge", type: "number | boolean", description: "A count (0 hides it, > 99 shows 99+) or `true` for a dot." },
        { name: "badgeLabel", type: "string", default: "the count", description: "Screen-reader text for the badge, e.g. “3 new exports”." },
        { name: "href", type: "string", description: "Any item with `href` turns the bar into a <nav> of links." },
        { name: "disabled", type: "boolean", description: "Opaque disabled colour; skipped by arrows and the drag snap." },
      ],
    },
    {
      component: "TabBarSearch",
      description: "iOS search tab — the `search` prop.",
      props: [
        { name: "label", type: "string", default: '"Search"', description: "Name of the circle and placeholder of the field." },
        { name: "closeLabel", type: "string", default: '"Close search"', description: "Name of the close circle." },
        { name: "expanded", type: "boolean", description: "Controlled expanded state." },
        { name: "defaultExpanded", type: "boolean", default: "false", description: "Uncontrolled initial state." },
        { name: "onExpandedChange", type: "(expanded: boolean) => void", description: "Circle pressed, or ✕ / Esc." },
        { name: "onActivate", type: "() => void", description: "Called right before the field expands." },
        { name: "inputProps", type: "InputHTMLAttributes", description: "Props for the built-in <input type=\"search\">." },
        { name: "children", type: "ReactNode", description: "Replaces the built-in input." },
      ],
    },
  ],

  storybook: {
    title: "Components/TabBar",
    stories: [
      { name: "Motion", export: "Motion" },
      { name: "Responsive", export: "Responsive" },
      { name: "iOS · Minimize on scroll", export: "IOSMinimizeOnScroll" },
    ],
  },
  related: ["segmented", "header", "selection-toolbar"],
};

export default tabbar;
