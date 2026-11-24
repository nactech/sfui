import type React from "react";
import { Copy, Download, FolderInput, Pencil, Share, Star, Trash2, X } from "lucide-react";
import { Button, Header, HeaderAction, MenuItem, PageHeader, usePlatform, type Platform } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column } from "../shared";
import { Hint, PhoneSelectionFlow } from "./header/selection-flow";

const noop = () => {};
const LONG_TITLE = "Foggy San Francisco — Winter Edition";

const overflow = (
  <>
    <MenuItem icon={<Pencil />}>Rename</MenuItem>
    <MenuItem icon={<Copy />}>Duplicate</MenuItem>
    <MenuItem icon={<Download />}>Export</MenuItem>
  </>
);
const share = <HeaderAction aria-label="Share" icon={<Share />} />;
const selectionActions = (
  <>
    <HeaderAction aria-label="Share" icon={<Share />} />
    <HeaderAction aria-label="Delete" icon={<Trash2 />} />
  </>
);
const selectionOverflow = (
  <>
    <MenuItem icon={<FolderInput />}>Move to…</MenuItem>
    <MenuItem icon={<Copy />}>Duplicate</MenuItem>
  </>
);

/** Width of a static example. */
function Slot({ children, width = "24rem" }: { children: React.ReactNode; width?: string }) {
  return <div style={{ width: `min(${width}, 100%)` }}>{children}</div>;
}

/** `scroll`: the demo sets the boolean `collapsed` from the list’s scroll position. */
const COLLAPSED: Record<string, boolean | "auto"> = { scroll: "auto", false: false, true: true };

function Demo({ values }: DemoProps) {
  const platform = usePlatform();
  const ios = platform === "ios";
  return (
    <Column gap={0.75} width="min(24.375rem, 100%)">
      <Hint>
        {values.collapsed === "scroll" ? "Scroll to dock the title · " : ""}
        {ios ? "Tap Select, then tick rows" : "Long-press (or right-click) a row, or ⋮ → Select"}
      </Hint>
      <PhoneSelectionFlow
        key={`${platform}-${JSON.stringify(values)}`}
        platform={platform}
        height={28}
        title={values.longTitle ? LONG_TITLE : "Foggy Stickers"}
        subtitle={Boolean(values.subtitle)}
        collapsed={COLLAPSED[String(values.collapsed)] ?? false}
        back={Boolean(values.back)}
        actions={Boolean(values.actions)}
        startSelected={values.selection ? ["chilly", "fog"] : undefined}
      />
    </Column>
  );
}

function PlatformDemo({ platform }: { platform: Platform }) {
  return <PhoneSelectionFlow platform={platform} bare height={30} />;
}

function Preview() {
  return (
    <Slot width="22rem">
      <Header title="Foggy Stickers" titleAs="h3" collapsed onBack={noop} actions={share} overflowMenu={overflow} platform="web" />
    </Slot>
  );
}

const header: ComponentDoc = {
  slug: "header",
  name: "Header",
  group: "Navigation",
  summary: "The screen header: glass back button and action capsule, a large title that docks when you scroll, selection mode.",
  docStatus: "complete",
  status: "stable",
  exports: ["Header", "HeaderAction", "PageHeader"],
  platformSplit: "split",
  Demo,
  Preview,
  controls: [
    { type: "enum", name: "collapsed", label: "Collapsed", options: ["scroll", "false", "true"], default: "scroll" },
    { type: "boolean", name: "back", label: "Back button", default: true },
    { type: "boolean", name: "actions", label: "Actions + overflow", default: true },
    { type: "boolean", name: "subtitle", label: "Subtitle", default: true },
    { type: "boolean", name: "longTitle", label: "Long title", default: false },
    { type: "boolean", name: "selection", label: "Selection mode", default: false },
  ],
  code: (v) => {
    const title = v.longTitle ? LONG_TITLE : "Foggy Stickers";
    const lines = [
      `  title="${title}"`,
      v.subtitle && `  subtitle="12 stickers · updated today"`,
      v.collapsed === "scroll" && `  collapsed={scrolled} // list.scrollTop > 8 — the header floats over the list`,
      v.collapsed === "true" && `  collapsed`,
      v.back && `  onBack={() => history.back()}`,
      v.actions && `  actions={<HeaderAction aria-label="Share" icon={<Share />} onClick={share} />}`,
      v.actions && `  overflowMenu={<MenuItem icon={<SquareCheck />} onSelect={startSelection}>Select</MenuItem>}`,
      `  onStartSelection={startSelection} // iOS: the glass “Select” button`,
      `  selectionCount={selecting ? selected.length : undefined}`,
      `  onCancelSelection={endSelection}`,
      `  allSelected={selected.length === items.length}`,
      `  onSelectAll={selectAll}`,
      `  onDeselectAll={deselectAll}`,
      `  selectionActions={<HeaderAction aria-label="Delete" icon={<Trash2 />} onClick={remove} />}`,
    ].filter(Boolean);
    return `import { Header, HeaderAction, MenuItem } from "@nactech/sfui";
import { Share, SquareCheck, Trash2 } from "lucide-react";

<Header
${lines.join("\n")}
/>`;
  },

  overview: {
    intro: (
      <>
        The header names the screen and carries its navigation and actions. There is no bar background: a glass back
        button and a glass action capsule float over the content, and the large title lives in the content. Scroll, and
        the title docks into the bar — next to back on Android and the web, into a centred glass pill on iOS. While items
        are selected the same header becomes the selection’s contextual bar, in each platform’s grammar. PageHeader is
        its wide-web sibling: breadcrumbs, a large title and labelled buttons.
      </>
    ),
    whenToUse: [
      "The top of every app screen: title, back, one or two actions and an overflow menu.",
      "Scrolling screens — `collapsed=\"auto\"` with `sticky` docks the large title as it scrolls away.",
      "Selection mode on phones: the contextual bar on Android, Cancel and Select All on iOS.",
      "PageHeader for wide web pages: breadcrumbs, title, description and labelled buttons.",
    ],
    whenNotToUse: [
      "Selection on wide web pages — swap PageHeader for SelectionBar, with ⌘A and Esc.",
      "Acting on a selection on iOS — those actions belong in SelectionToolbar at the bottom.",
      "Switching between top-level destinations — use TabBar.",
      "A row of four or more actions — keep two in the capsule and move the rest into `overflowMenu`.",
    ],
  },

  variants: [
    {
      name: "Expanded · Android + Web",
      description: "Back circle, an action capsule with Share and ⋮, the large title and a muted subtitle.",
      render: () => (
        <Slot>
          <Header platform="android" title="Foggy Stickers" titleAs="h3" subtitle="24 stickers · updated today" onBack={noop} actions={share} overflowMenu={overflow} />
        </Slot>
      ),
    },
    {
      name: "Collapsed · Android + Web",
      description: "`collapsed`: the back circle grows into one capsule with the title. Long titles truncate.",
      render: () => (
        <Column gap={0.75} width="min(24rem, 100%)">
          <Header platform="android" title="Foggy Stickers" titleAs="h3" collapsed onBack={noop} actions={share} overflowMenu={overflow} />
          <Header platform="android" title={LONG_TITLE} titleAs="h3" collapsed onBack={noop} actions={share} overflowMenu={overflow} />
        </Column>
      ),
    },
    {
      name: "Selection · Android + Web",
      description: "A tonal capsule with × and the count, `selectionActions`, and ⋮ starting with Select all.",
      render: () => (
        <Slot>
          <Header
            platform="android"
            title="Foggy Stickers"
            titleAs="h3"
            collapsed
            selectionCount={3}
            onCancelSelection={noop}
            selectionActions={selectionActions}
            onSelectAll={noop}
            selectionOverflowMenu={selectionOverflow}
          />
        </Slot>
      ),
    },
    {
      name: "iOS · Expanded",
      description: "A glass back circle with ChevronLeft, a ••• capsule and the bold 34 large title.",
      render: () => (
        <Slot>
          <Header platform="ios" title="Foggy Stickers" titleAs="h3" subtitle="24 stickers · updated today" onBack={noop} actions={share} overflowMenu={overflow} />
        </Slot>
      ),
    },
    {
      name: "iOS · Collapsed",
      description: "The title docks into a centred glass pill between back and the actions.",
      render: () => (
        <Slot>
          <Header platform="ios" title="Foggy Stickers" titleAs="h3" collapsed onBack={noop} actions={share} overflowMenu={overflow} />
        </Slot>
      ),
    },
    {
      name: "iOS · Browse → Selection",
      description: "`onStartSelection` adds the glass Select button. Selecting keeps only Cancel, the count and Select All.",
      render: () => (
        <Column gap={0.75} width="min(24rem, 100%)">
          <Header platform="ios" title="Foggy Stickers" titleAs="h3" collapsed onBack={noop} onStartSelection={noop} />
          <Header platform="ios" title="Foggy Stickers" titleAs="h3" collapsed selectionCount={2} onCancelSelection={noop} onSelectAll={noop} onDeselectAll={noop} />
        </Column>
      ),
    },
    {
      name: "Over content",
      description: "Back, title and actions are glass — they refract whatever scrolls beneath them.",
      stage: "photo",
      render: () => (
        <Column gap={0.75} width="min(24rem, 100%)">
          <Header platform="android" title="Foggy Stickers" titleAs="h3" collapsed onBack={noop} actions={share} overflowMenu={overflow} />
          <Header platform="ios" title="Foggy Stickers" titleAs="h3" collapsed onBack={noop} actions={share} overflowMenu={overflow} />
        </Column>
      ),
    },
    {
      name: "PageHeader · Web wide",
      description: "Breadcrumbs, a 28 title, a description and size-s Buttons aligned to the bottom.",
      render: () => (
        <Slot width="44rem">
          <PageHeader
            breadcrumbs={[{ label: "Library", href: "#", onClick: (e) => e.preventDefault() }, { label: "Foggy Stickers" }]}
            title="Foggy Stickers"
            titleAs="h3"
            description="24 stickers · updated today"
            actions={
              <>
                <Button variant="secondary" size="s" leadingIcon={<Share />}>
                  Share
                </Button>
                <Button size="s" leadingIcon={<Download />}>
                  Export
                </Button>
              </>
            }
          />
        </Slot>
      ),
    },
  ],

  platforms: {
    intro: (
      <>
        Header has two implementations behind one API. iOS gets the iOS 26 grammar — glass circle, centred title pill,
        text buttons for selection; Android and the web share the capsule grammar, and the web adds hover and focus rings.
        Each frame below is live: scroll to dock the title, then start a selection the platform’s way.
      </>
    ),
    Demo: PlatformDemo,
    notes: {
      ios: [
        "Back is a 44 glass circle with `ChevronLeft`; actions sit in a glass capsule with a horizontal ••• overflow.",
        "The large title is 34 / 700 SF Pro; it docks into a centred glass pill that scales in on a spring.",
        "`onStartSelection` adds Select. Selecting shows Cancel · “N Selected” · Select All ↔ Deselect All — `selectionActions` and `selectionOverflowMenu` are not rendered: actions go to SelectionToolbar, which replaces the tab bar.",
      ],
      android: [
        "Back is an `ArrowLeft` circle that widens into a back + title capsule when the title docks.",
        "Selection starts from the content — long-press a row — or from ⋮ → Select.",
        "The contextual bar: × and “N selected” in a tonal capsule, `selectionActions`, then ⋮ with Select all ↔ Deselect all and `selectionOverflowMenu`. Deselecting the last item ends the mode.",
      ],
      web: [
        "The Android grammar plus hover and `:focus-visible` rings — the right header for phone-width web apps. Long-press is right-click with a mouse.",
        "Wide pages use PageHeader instead, and replace it with SelectionBar while items are selected (⌘A all · Esc clear).",
      ],
    },
  },

  usage: {
    guidelines: [
      "One header per screen. Its title is the page heading — `h1` by default, change the level with `titleAs`.",
      "Keep one or two `HeaderAction`s in the capsule; everything else goes in `overflowMenu`.",
      "On scrolling screens dock the title as the content moves: `collapsed=\"auto\"` with `sticky` (plus `scrollContainer` when an element scrolls, not the window), or set `collapsed` from your own scroll state when the header floats over the list.",
      "Use `collapsed` for pushed detail screens that never need a large title.",
      "Selection mode is on while `selectionCount` is defined. On iOS keep it defined at 0 (“Select Items”) until Cancel; on Android leave the mode when the count reaches 0.",
      "Pass the same handlers on every platform — the header renders what belongs: Select only on iOS, `selectionActions` only on Android + Web.",
      "Move focus to the list when the bar swaps into or out of selection mode — the button that was pressed is gone.",
    ],
    dos: [
      {
        kind: "do",
        title: "Two actions, the rest in ⋮",
        caption: "The most used action stays one tap away.",
        render: () => (
          <Slot>
            <Header platform="android" title="Foggy Stickers" titleAs="h3" collapsed onBack={noop} actions={share} overflowMenu={overflow} />
          </Slot>
        ),
      },
      {
        kind: "dont",
        title: "Don’t line up every action",
        caption: "The capsule pushes the title out and nothing stands out.",
        render: () => (
          <Slot>
            <Header
              platform="android"
              title="Foggy Stickers"
              titleAs="h3"
              collapsed
              onBack={noop}
              actions={
                <>
                  {share}
                  <HeaderAction aria-label="Favourite" icon={<Star />} />
                  <HeaderAction aria-label="Rename" icon={<Pencil />} />
                  <HeaderAction aria-label="Duplicate" icon={<Copy />} />
                  <HeaderAction aria-label="Delete" icon={<Trash2 />} />
                </>
              }
            />
          </Slot>
        ),
      },
      {
        kind: "do",
        title: "Back goes back",
        caption: "A pushed screen keeps the back arrow; × belongs to selection mode.",
        render: () => (
          <Slot>
            <Header platform="android" title="Mr. Chilly" titleAs="h3" collapsed onBack={noop} actions={share} />
          </Slot>
        ),
      },
      {
        kind: "dont",
        title: "Don’t swap back for ×",
        caption: "× reads as “cancel the selection”, not “leave this screen”.",
        render: () => (
          <Slot>
            <Header platform="android" title="Mr. Chilly" titleAs="h3" collapsed onBack={noop} backIcon={<X />} backLabel="Close" actions={share} />
          </Slot>
        ),
      },
      {
        kind: "do",
        title: "Say how many are selected",
        caption: "The count is the title of selection mode — and it is announced.",
        render: () => (
          <Slot>
            <Header platform="ios" title="Foggy Stickers" titleAs="h3" collapsed selectionCount={3} onCancelSelection={noop} onSelectAll={noop} />
          </Slot>
        ),
      },
      {
        kind: "dont",
        title: "Don’t keep the page title",
        caption: "Without the count, people lose track of what an action will touch.",
        render: () => (
          <Slot>
            <Header
              platform="ios"
              title="Foggy Stickers"
              titleAs="h3"
              collapsed
              selectionCount={3}
              selectionLabel={() => "Foggy Stickers"}
              onCancelSelection={noop}
              onSelectAll={noop}
            />
          </Slot>
        ),
      },
    ],
    writing: [
      "Title: the name of the place or object — “Foggy Stickers”, not “Sticker pack details”.",
      "Subtitle: one short line of facts — “24 stickers · updated today”.",
      "Count: “3 selected” on Android and the web; iOS uses Title Case — “3 Selected”, “Select Items” at zero, “Select All”, “Cancel”.",
      "Name every `HeaderAction` with its verb — “Share”, “Delete”. The overflow is “More options”.",
    ],
  },

  accessibility: {
    intro: (
      <>
        Header renders a <code>&lt;header&gt;</code> whose title is a real heading. The floating controls are native buttons
        and links with names, and the selection count is a polite live region, so every change is announced once.
      </>
    ),
    roles: [
      { element: "Root", role: "<header>", notes: "A banner landmark at the top level of the page, a plain group inside `main` / `article`. `data-mode=\"selection\"` while selecting." },
      { element: "Large title", role: "h1 (`titleAs`)", notes: "The docked copy in the bar is aria-hidden while the large title exists; with `collapsed` the docked title is the heading." },
      { element: "Back", role: "button · link", notes: "A link with `backHref`. Named by `backLabel` (“Back”); the glyph is aria-hidden." },
      { element: "HeaderAction", role: "button", notes: "`aria-label` is required by the type; the icon is aria-hidden." },
      { element: "Overflow ⋮ / •••", role: "button + aria-haspopup=\"menu\"", notes: "Named by `overflowLabel` (“More options”); opens a Menu." },
      { element: "Selection count", role: "aria-live=\"polite\" aria-atomic", notes: "“3 selected” / “3 Selected” is spoken on every change." },
      { element: "Cancel (Android + Web)", role: "button", notes: "The × is named by `cancelSelectionLabel` (“Cancel selection”)." },
      { element: "Select · Cancel · Select All (iOS)", role: "button", notes: "Text buttons — the visible label is the name." },
      { element: "Select all (Android + Web)", role: "menuitem", notes: "First item of the selection ⋮; flips to Deselect all with `allSelected`." },
      { element: "PageHeader breadcrumbs", role: "navigation", notes: "Named “Breadcrumb”; an ordered list, the last crumb has `aria-current=\"page\"`." },
    ],
    keyboard: [
      { keys: ["Tab"], action: "Back → actions → ⋮. In selection mode: × (or Cancel) → selection actions → ⋮ (or Select All)." },
      { keys: ["Enter", "Space"], action: "Activates the focused control." },
      { keys: ["↓"], action: "On ⋮ / •••: opens the menu on its first item (see Menu)." },
      { keys: ["Esc"], action: "Closes an open menu. Header binds no global keys — add `useSelectionShortcuts` for Esc to cancel and ⌘A to select all." },
    ],
    focus: [
      "`:focus-visible` rings on back, actions and text buttons — inside the capsule on Android + Web, 2 outside the glass on iOS.",
      "Entering or leaving selection mode swaps the bar, so the pressed control (Select, ⋮ → Select, ×, Cancel) disappears. Move focus to the first row — the demos on this page do.",
      "Long-press is never the only way in: offer ⋮ → Select on Android + Web; iOS has the Select button.",
      "`collapsed=\"auto\"` only changes the look — the tab order and the heading stay the same.",
    ],
    reducedMotion: [
      "Docking animates the capsule width and the title column (220 ms, emphasized easing) and the iOS pill’s scale and fade (spring). With reduce motion they switch instantly.",
      "Hover and press colour changes drop their 120 ms transition too.",
    ],
    screenReader: [
      "Localise the spoken names with `backLabel`, `overflowLabel`, `cancelSelectionLabel` and `selectionLabel`.",
      "With `collapsed=\"auto\"` the title is read once — the docked copy is hidden from assistive tech.",
    ],
  },

  api: [
    {
      component: "Header",
      props: [
        { name: "title", type: "ReactNode", required: true, description: "The large title when expanded; docked next to back when collapsed (iOS: a centred glass pill)." },
        { name: "subtitle", type: "ReactNode", description: "Muted line under the large title (expanded only)." },
        { name: "titleAs", type: '"h1" | … | "h6"', default: '"h1"', description: "Heading level of the title." },
        { name: "onBack", type: "(event: MouseEvent) => void", description: "Renders the glass back button as a <button>." },
        { name: "backHref", type: "string", description: "Renders back as a link. `onBack` still fires on click if given." },
        { name: "backLabel", type: "string", default: '"Back"', description: "Accessible name of back." },
        { name: "backIcon", type: "ReactNode", default: "ArrowLeft · iOS ChevronLeft", description: "Back glyph." },
        { name: "actions", type: "ReactNode", description: "`HeaderAction`s in the glass action capsule." },
        { name: "overflowMenu", type: "ReactNode", description: "`MenuItem`s for the ⋮ overflow, rendered as the last action (iOS: •••)." },
        { name: "overflowLabel", type: "string", default: '"More options"', description: "Accessible name of the overflow trigger." },
        { name: "collapsed", type: 'boolean | "auto"', default: "false", description: "Expanded, collapsed (title docked, no large title), or `auto`: docks once the large title scrolls under the bar." },
        { name: "scrollContainer", type: "HTMLElement | null", default: "viewport", description: "Scroll container watched by `collapsed=\"auto\"`." },
        { name: "onCollapsedChange", type: "(collapsed: boolean) => void", description: "`collapsed=\"auto\"` docked or undocked the title." },
        { name: "sticky", type: "boolean", default: "false", description: "Keep the bar pinned to the top of the scroll container while the large title scrolls away." },
        { name: "selectionCount", type: "number", description: "Selection mode while defined." },
        { name: "selectionLabel", type: "(count: number) => ReactNode", default: "“N selected” · iOS “N Selected”", description: "Count text. iOS shows “Select Items” at 0." },
        { name: "onCancelSelection", type: "() => void", description: "The × (iOS: Cancel) — leave selection mode." },
        { name: "cancelSelectionLabel", type: "string", default: '"Cancel selection" · iOS "Cancel"', description: "Name of the ×; on iOS the visible Cancel text." },
        { name: "allSelected", type: "boolean", default: "false", description: "Flips Select all to Deselect all." },
        { name: "onSelectAll", type: "() => void", description: "First ⋮ item while not everything is selected (iOS: the trailing Select All button)." },
        { name: "onDeselectAll", type: "() => void", description: "First ⋮ item once everything is selected (iOS: Deselect All)." },
        { name: "selectAllLabel", type: "ReactNode", default: '"Select all" · iOS "Select All"', description: "Label of Select all." },
        { name: "deselectAllLabel", type: "ReactNode", default: '"Deselect all" · iOS "Deselect All"', description: "Label of Deselect all." },
        { name: "selectionActions", type: "ReactNode", description: "`HeaderAction`s for the selection (Share, Delete).", platform: "android-web" },
        { name: "selectionOverflowMenu", type: "ReactNode", description: "More `MenuItem`s in the selection ⋮, after Select all.", platform: "android-web" },
        { name: "onStartSelection", type: "() => void", description: "Renders the glass Select text button that enters selection mode.", platform: "ios" },
        { name: "startSelectionLabel", type: "ReactNode", default: '"Select"', description: "Text of the Select button.", platform: "ios" },
        { name: "platform", type: '"auto" | "ios" | "android" | "web"', default: "ConfigProvider", description: "Force one implementation." },
        { name: "children", type: "ReactNode", description: "Rendered at the end of the <header>, after the title." },
        { name: "ref", type: "Ref<HTMLElement>", description: "The <header> element." },
      ],
      extends: "Also accepts native <header> attributes (className, style, aria-*), except `title`.",
    },
    {
      component: "HeaderAction",
      description: "A 44 icon button for the action capsule. Works as a Menu trigger.",
      props: [
        { name: "icon", type: "ReactNode", required: true, description: "Lucide icon, drawn at 19." },
        { name: "aria-label", type: "string", required: true, description: "Icon-only buttons need a name." },
        { name: "type", type: '"button" | "submit" | "reset"', default: '"button"', description: "Native button type." },
        { name: "ref", type: "Ref<HTMLButtonElement>", description: "The native <button>." },
      ],
      extends: "Also accepts native <button> attributes (onClick, disabled…), except `children`.",
    },
    {
      component: "PageHeader",
      description: "The wide in-page web header.",
      props: [
        { name: "title", type: "ReactNode", required: true, description: "The 28 title." },
        { name: "titleAs", type: '"h1" | … | "h6"', default: '"h1"', description: "Heading level." },
        { name: "breadcrumbs", type: "PageHeaderCrumb[]", description: "Trail above the title; the last crumb is the current page." },
        { name: "breadcrumbsLabel", type: "string", default: '"Breadcrumb"', description: "Name of the breadcrumb <nav>." },
        { name: "description", type: "ReactNode", description: "Muted line under the title." },
        { name: "actions", type: "ReactNode", description: "Size-s Buttons on the right: ghost ••• (a Menu trigger), secondary, primary." },
        { name: "children", type: "ReactNode", description: "Rendered at the end of the <header>." },
        { name: "ref", type: "Ref<HTMLElement>", description: "The <header> element." },
      ],
      extends: "Also accepts native <header> attributes, except `title`.",
    },
    {
      component: "PageHeaderCrumb",
      description: "One breadcrumb.",
      props: [
        { name: "label", type: "ReactNode", required: true, description: "Crumb text." },
        { name: "href", type: "string", description: "Link target. Crumbs without it (and the last crumb) are plain text." },
        { name: "onClick", type: "(event: MouseEvent<HTMLAnchorElement>) => void", description: "For client-side routing — call `event.preventDefault()` to stop the navigation." },
      ],
    },
  ],

  storybook: {
    title: "Components/Header",
    stories: [
      { name: "Auto-collapse", export: "AutoCollapse" },
      { name: "Selection mode", export: "SelectionMode" },
      { name: "iOS · Auto-collapse", export: "IOSAutoCollapse" },
      { name: "iOS · Selection mode", export: "IOSSelectionMode" },
      { name: "Web page header", export: "WebPageHeader" },
    ],
  },
  related: ["selection-bar", "selection-toolbar", "tabbar", "menu"],
};

export default header;
