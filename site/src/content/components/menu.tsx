import type React from "react";
import { useState } from "react";
import { Copy, FolderInput, Link, Pencil, Send, Share, Snowflake, Trash2 } from "lucide-react";
import {
  Menu,
  MenuCheckboxItem,
  MenuItem,
  MenuPanel,
  MenuSeparator,
  MenuSub,
  usePlatform,
  type MenuAlign,
  type Platform,
} from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column, FileMenuContent, MoreTrigger } from "../shared";

const flexAlign: Record<MenuAlign, string> = { start: "flex-start", center: "center", end: "flex-end" };

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: "0.25rem 0.625rem",
        borderRadius: "var(--sf-radius-full)",
        background: "#000000a6",
        color: "var(--sf-fg-default)",
        font: "500 0.75rem/1.4 var(--sf-font-mono)",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

function Demo({ values }: DemoProps) {
  const platform = usePlatform();
  const [sort, setSort] = useState("name");
  const align = values.align as MenuAlign;
  return (
    <div style={{ width: "min(26rem, 100%)", minHeight: "16rem", display: "flex", flexDirection: "column", alignItems: flexAlign[align], gap: "1rem" }}>
      <Menu trigger={<MoreTrigger />} align={align}>
        <FileMenuContent
          sort={sort}
          onSortChange={setSort}
          quickActions={Boolean(values.quickActions)}
          submenu={Boolean(values.submenu)}
          disabledQuick={Boolean(values.disabled)}
          titleCase={platform === "ios"}
        />
      </Menu>
      <Hint>Press ••• (or focus it and press ↓) · sort: {sort}</Hint>
    </div>
  );
}

function PlatformDemo({ platform }: { platform: Platform }) {
  const ios = platform === "ios";
  return (
    <Column gap={0.75}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Menu trigger={<MoreTrigger />}>
          <FileMenuContent titleCase={ios} />
        </Menu>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <MenuPanel aria-label="File (static preview)">
          <FileMenuContent titleCase={ios} sort="date" />
        </MenuPanel>
      </div>
    </Column>
  );
}

function Preview() {
  return (
    <MenuPanel aria-label="File" platform="web" style={{ transform: "scale(0.82)", transformOrigin: "center" }}>
      <FileMenuContent quickActions={false} submenu={false} />
    </MenuPanel>
  );
}

/** A long-pressable sticker card for the iOS context menu. */
function StickerPreview(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { "data-state"?: string }) {
  const lifted = props["data-state"] === "open";
  return (
    <button
      type="button"
      {...props}
      style={{
        display: "grid",
        placeItems: "center",
        gap: "0.5rem",
        width: "12rem",
        padding: "1.25rem",
        border: 0,
        borderRadius: "1.5rem",
        background: "#1c1c1e",
        color: "var(--sf-ios-label)",
        font: "600 1rem var(--sf-font-ios)",
        cursor: "pointer",
        WebkitTouchCallout: "none",
        userSelect: "none",
        transform: lifted ? "scale(1)" : "scale(0.96)",
        transition: "transform 200ms var(--sf-ease-standard)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "grid",
          placeItems: "center",
          width: "4rem",
          height: "4rem",
          borderRadius: "1.125rem",
          background: "var(--sf-accent-tonal)",
          color: "var(--sf-accent-on-tonal)",
        }}
      >
        <Snowflake size="2rem" />
      </span>
      Mr. Chilly
    </button>
  );
}

function ContextMenuDemo() {
  return (
    <Column gap={0.75}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Menu platform="ios" variant="context" trigger={<StickerPreview aria-label="Mr. Chilly sticker" />}>
          <MenuItem icon={<Send />}>Send</MenuItem>
          <MenuItem icon={<Copy />}>Copy</MenuItem>
          <MenuItem icon={<FolderInput />}>Move To…</MenuItem>
          <MenuSeparator />
          <MenuItem icon={<Trash2 />} destructive>
            Delete
          </MenuItem>
        </Menu>
      </div>
      <div style={{ textAlign: "center" }}>
        <Hint>Long-press or right-click the sticker</Hint>
      </div>
    </Column>
  );
}

const menu: ComponentDoc = {
  slug: "menu",
  name: "Menu",
  group: "Overlays",
  summary: "A floating glass panel of actions and choices, with quick actions and submenus that open in place.",
  docStatus: "complete",
  status: "stable",
  exports: [
    "Menu",
    "MenuItem",
    "MenuSeparator",
    "MenuGroup",
    "MenuRadioGroup",
    "MenuRadioItem",
    "MenuCheckboxItem",
    "MenuQuickActions",
    "MenuQuickAction",
    "MenuSub",
    "MenuPanel",
  ],
  platformSplit: "split",
  stage: "photo",
  Demo,
  Preview,
  controls: [
    { type: "enum", name: "align", label: "Align", options: ["start", "center", "end"], default: "end" },
    { type: "boolean", name: "quickActions", label: "Quick actions row", default: true },
    { type: "boolean", name: "submenu", label: "Share submenu", default: true },
    { type: "boolean", name: "disabled", label: "Disable Duplicate, Move", default: false },
  ],
  code: (v) =>
    `import { Menu, MenuItem, MenuQuickAction, MenuQuickActions, MenuRadioGroup,
  MenuRadioItem, MenuSeparator, MenuSub, Button } from "@nactech/sfui";

<Menu
  trigger={<Button variant="secondary" iconOnly aria-label="More"><Ellipsis /></Button>}${v.align !== "end" ? `\n  align="${v.align}"` : ""}
>${
      v.quickActions
        ? `
  <MenuQuickActions aria-label="Quick actions">
    <MenuQuickAction icon={<Pencil />}>Rename</MenuQuickAction>
    <MenuQuickAction icon={<Copy />}${v.disabled ? " disabled" : ""}>Duplicate</MenuQuickAction>
    <MenuQuickAction icon={<FolderInput />}${v.disabled ? " disabled" : ""}>Move to…</MenuQuickAction>
  </MenuQuickActions>
  <MenuSeparator />`
        : ""
    }${
      v.submenu
        ? `
  <MenuSub label="Share" icon={<Share />}>
    <MenuItem icon={<Send />}>Telegram</MenuItem>
    <MenuItem icon={<Link />}>Copy link</MenuItem>
  </MenuSub>`
        : `
  <MenuItem icon={<Share />}>Share</MenuItem>`
    }
  <MenuSeparator />
  <MenuRadioGroup label="Sort by" value={sort} onValueChange={setSort}>
    <MenuRadioItem value="name" icon={<ArrowDownAZ />}>Name</MenuRadioItem>
    <MenuRadioItem value="date" icon={<Calendar />}>Date added</MenuRadioItem>
  </MenuRadioGroup>
  <MenuSeparator />
  <MenuItem icon={<Trash2 />} destructive>Delete</MenuItem>
</Menu>`,

  overview: {
    intro: (
      <>
        A menu holds the secondary actions and choices for one object or view, behind a ••• button. The panel is Black
        Glass — it floats over content — and opens below its anchor, flipping above when there is no room. Submenus
        replace the panel content in place with a shared-axis slide and a height spring, so a menu never cascades
        sideways off a phone screen. On iOS the pull-down grows out of its button, and a context menu opens on long-press
        under a lifted preview.
      </>
    ),
    whenToUse: [
      "Secondary actions on an object: Rename, Duplicate, Move to…, Share, Delete.",
      "A single choice that changes the view (Sort by) — MenuRadioGroup; toggles — MenuCheckboxItem.",
      "A quick-actions row for the two to four most frequent actions, above the list.",
      "iOS: a context menu on long-press of content (a sticker, a message).",
    ],
    whenNotToUse: [
      "The primary action of the view — make it a visible Button.",
      "Navigation between destinations — use TabBar.",
      "Choosing a value in a form — use SelectField.",
      "Anything that needs text input or rich content — use a sheet or a page.",
    ],
  },

  variants: [
    {
      name: "Rest · Android + Web",
      description: "Quick actions, a submenu row, a labelled single-choice group and a destructive item last.",
      stage: "photo",
      render: () => (
        <MenuPanel aria-label="File" platform="web">
          <FileMenuContent />
        </MenuPanel>
      ),
    },
    {
      name: "Selection",
      description: "The accent check replaces the icon and the label turns accent — no tonal fill. Radio groups stay open.",
      stage: "photo",
      render: () => (
        <MenuPanel aria-label="Sort" platform="web">
          <FileMenuContent quickActions={false} sort="date" />
        </MenuPanel>
      ),
    },
    {
      name: "Disabled + destructive",
      description: "Unavailable actions use the opaque disabled colour; Delete uses danger.",
      stage: "photo",
      render: () => (
        <MenuPanel aria-label="File" platform="web">
          <FileMenuContent disabledQuick />
        </MenuPanel>
      ),
    },
    {
      name: "Submenu in place",
      description: "Choose Share: the content slides, the height springs, and a Back row appears on top.",
      render: () => (
        <MenuPanel aria-label="Share" platform="web">
          <MenuSub label="Share" icon={<Share />}>
            <MenuItem icon={<Send />}>Telegram</MenuItem>
            <MenuItem icon={<Link />}>Copy link</MenuItem>
          </MenuSub>
          <MenuItem icon={<Pencil />}>Rename</MenuItem>
          <MenuCheckboxItem defaultChecked>Loop playback</MenuCheckboxItem>
        </MenuPanel>
      ),
    },
    {
      name: "iOS pull-down",
      description: "SF Pro, Title Case, a leading check column and one sliding press lens instead of hover.",
      stage: "photo",
      render: () => (
        <MenuPanel aria-label="File" platform="ios">
          <FileMenuContent titleCase sort="date" />
        </MenuPanel>
      ),
    },
    {
      name: "iOS context menu",
      description: "`variant=\"context\"`: long-press (≈ 0.5 s), right-click or Shift+F10 opens it under the lifted content.",
      render: () => <ContextMenuDemo />,
    },
  ],

  platforms: {
    intro: (
      <>
        Menu has two implementations. Android and the web draw M3-style rows with a state layer and hover; iOS draws the
        iOS 26 menu: SF Pro, a check column, a press lens you can slide between items, and no hover. Each frame shows a
        static panel and a live ••• trigger.
      </>
    ),
    Demo: PlatformDemo,
    notes: {
      ios: [
        "Pull-down (260 wide) grows out of the trigger and covers it; context menu (290 wide) sits 12 below the long-pressed content.",
        "Press anywhere, slide, release on an item to choose it — one lens follows the finger.",
        "Selection draws a check in the leading column; icon and label keep their colour.",
        "Use Title Case labels (“Move To…”, “Date Added”).",
      ],
      android: [
        "Opens below the anchor, right edges aligned (`align=\"end\"`), 6 below; flips above when there is no room.",
        "Rows get a full-width state layer on press; the check replaces the icon when selected.",
      ],
      web: [
        "Same as Android, plus hover rows and full keyboard support (arrows, typeahead, → / ← for submenus).",
      ],
    },
  },

  usage: {
    guidelines: [
      "Group related items with MenuSeparator; give choice groups a label (“Sort by”).",
      "Put the destructive item last, after a separator.",
      "Give every row an icon or none — the icon slot is always reserved so labels line up.",
      "Use one level of MenuSub. If you need two, the content probably wants its own screen.",
      "Keep menus short: about seven rows plus a quick-actions row.",
      "Don’t put the only path to a feature in a menu.",
    ],
    dos: [
      {
        kind: "do",
        title: "Destructive action last, separated",
        stage: "photo",
        render: () => (
          <MenuPanel aria-label="Do" platform="web">
            <MenuItem icon={<Pencil />}>Rename</MenuItem>
            <MenuItem icon={<Copy />}>Duplicate</MenuItem>
            <MenuSeparator />
            <MenuItem icon={<Trash2 />} destructive>
              Delete
            </MenuItem>
          </MenuPanel>
        ),
      },
      {
        kind: "dont",
        title: "Don’t bury Delete between safe actions",
        caption: "One slip of the finger destroys the sticker.",
        stage: "photo",
        render: () => (
          <MenuPanel aria-label="Don't" platform="web">
            <MenuItem icon={<Pencil />}>Rename</MenuItem>
            <MenuItem icon={<Trash2 />} destructive>
              Delete
            </MenuItem>
            <MenuItem icon={<Copy />}>Duplicate</MenuItem>
          </MenuPanel>
        ),
      },
      {
        kind: "do",
        title: "One submenu level, opened in place",
        stage: "photo",
        render: () => (
          <MenuPanel aria-label="Do submenu" platform="web">
            <MenuSub label="Share" icon={<Share />}>
              <MenuItem icon={<Send />}>Telegram</MenuItem>
              <MenuItem icon={<Link />}>Copy link</MenuItem>
            </MenuSub>
            <MenuItem icon={<Pencil />}>Rename</MenuItem>
          </MenuPanel>
        ),
      },
      {
        kind: "dont",
        title: "Don’t nest submenus",
        caption: "Share › Telegram › Chats › … hides choices three taps deep.",
        stage: "photo",
        render: () => (
          <MenuPanel aria-label="Don't submenu" platform="web">
            <MenuSub label="Share" icon={<Share />}>
              <MenuSub label="Telegram" icon={<Send />}>
                <MenuSub label="Chats" icon={<Send />}>
                  <MenuItem>Saved Messages</MenuItem>
                </MenuSub>
              </MenuSub>
            </MenuSub>
            <MenuItem icon={<Pencil />}>Rename</MenuItem>
          </MenuPanel>
        ),
      },
    ],
    writing: [
      "Actions are verbs: Rename, Duplicate, Delete. Choices are nouns: Name, Date added, Size.",
      "Add an ellipsis (…) when the item asks for more input before acting: “Move to…”.",
      "Sentence case on Android and the web; Title Case on iOS (“Move To…”, “Copy Link”).",
      "Name groups by what they change: “Sort by”, not “Options”.",
    ],
  },

  accessibility: {
    intro: (
      <>
        Menu follows the WAI-ARIA menu button pattern. The trigger gets <code>aria-haspopup="menu"</code>,{" "}
        <code>aria-expanded</code> and <code>aria-controls</code>; the panel is portaled to <code>document.body</code>{" "}
        and labelled by the trigger.
      </>
    ),
    roles: [
      { element: "Trigger", role: "button + aria-haspopup=\"menu\"", notes: "aria-expanded, aria-controls, data-state=\"open\" while open." },
      { element: "Panel", role: "menu", notes: "aria-labelledby the trigger." },
      { element: "MenuItem / MenuSub", role: "menuitem", notes: "aria-disabled for unavailable items (they stay focusable)." },
      { element: "MenuRadioItem", role: "menuitemradio", notes: "aria-checked; inside a role=\"group\" named by its label." },
      { element: "MenuCheckboxItem", role: "menuitemcheckbox", notes: "aria-checked." },
      { element: "MenuSeparator", role: "separator" },
    ],
    keyboard: [
      { keys: ["Enter", "Space"], action: "On the trigger: opens with focus on the first item. On an item: selects it." },
      { keys: ["↓", "↑"], action: "On the trigger: opens on the first / last item. In the menu: move between items." },
      { keys: ["Home", "End"], action: "First / last item." },
      { keys: ["←", "→"], action: "Move inside the quick-actions row. → opens a submenu, ← goes back." },
      { keys: ["A–Z"], action: "Typeahead: jumps to the next item starting with the typed letters." },
      { keys: ["Esc"], action: "Back from a submenu; on the root closes and returns focus to the trigger." },
      { keys: ["Tab"], action: "Closes the menu and moves on." },
      { keys: ["Shift", "F10"], action: "iOS context menu: opens it from the focused content (also the context-menu key)." },
    ],
    focus: [
      "Opened from the keyboard, focus lands on the first (or last) item; opened by pointer, the panel itself takes focus so arrows and Esc work without a ring on an item.",
      "Selecting an item closes the menu and returns focus to the trigger (radio and checkbox items stay open).",
      "Clicking outside closes it and leaves focus where you clicked.",
    ],
    reducedMotion: [
      "Submenus crossfade in 150 ms and the height snaps — no slide, no spring.",
      "The iOS grow-in becomes a fade.",
    ],
  },

  api: [
    {
      component: "Menu",
      description: "Trigger + floating panel. Children are the items.",
      props: [
        { name: "trigger", type: "ReactElement", required: true, description: "The anchor (usually an icon Button). Gets ref, aria-haspopup, aria-expanded, data-state and handlers. For an iOS context menu: the content that gets long-pressed." },
        { name: "open", type: "boolean", description: "Controlled open state." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "Opened or closed by the user." },
        { name: "align", type: '"start" | "center" | "end"', default: '"end"', description: "Which anchor edge the panel lines up with. iOS context menus default to `center`." },
        { name: "variant", type: '"pulldown" | "context"', default: '"pulldown"', description: "iOS: pull-down from a button, or context menu on long-press.", platform: "ios" },
        { name: "platform", type: '"auto" | "ios" | "android" | "web"', default: "ConfigProvider", description: "Force one implementation." },
        { name: "ref", type: "Ref<HTMLDivElement>", description: "The panel element." },
      ],
      extends: "Other props (className, style, aria-*) go to the panel.",
    },
    {
      component: "MenuItem",
      props: [
        { name: "icon", type: "ReactNode", description: "Leading Lucide icon (20). The slot is always reserved so labels align." },
        { name: "onSelect", type: "(event) => void", description: "Click / Enter / Space. Call `event.preventDefault()` to keep the menu open." },
        { name: "disabled", type: "boolean", description: "Unavailable; stays focusable with aria-disabled." },
        { name: "destructive", type: "boolean", description: "Danger colour for label and icon." },
        { name: "closeOnSelect", type: "boolean", default: "true", description: "Close the menu after selecting." },
      ],
      extends: "Also accepts native <button> attributes.",
    },
    {
      component: "MenuRadioGroup / MenuRadioItem",
      description: "Single choice. The group renders a labelled role=\"group\".",
      props: [
        { name: "label", type: "ReactNode", description: "Group caption (“Sort by”); also its accessible name." },
        { name: "value / defaultValue", type: "string", description: "Selected value, controlled or initial." },
        { name: "onValueChange", type: "(value: string) => void", description: "Called with the chosen item’s value." },
        { name: "MenuRadioItem.value", type: "string", required: true, description: "The item’s value." },
        { name: "MenuRadioItem.closeOnSelect", type: "boolean", default: "false", description: "Keep the menu open so the moving check stays visible." },
      ],
    },
    {
      component: "MenuCheckboxItem",
      props: [
        { name: "checked / defaultChecked", type: "boolean", description: "Controlled or initial state." },
        { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Toggled." },
        { name: "closeOnSelect", type: "boolean", default: "false", description: "Toggles usually come in sets, so the menu stays open." },
      ],
    },
    {
      component: "MenuQuickActions / MenuQuickAction",
      description: "Top row of icon-over-label actions — one arrow-key stop vertically, ← → inside.",
      props: [
        { name: "icon", type: "ReactNode", required: true, description: "Lucide icon." },
        { name: "children", type: "ReactNode", required: true, description: "Label under the icon." },
        { name: "onSelect", type: "(event) => void", description: "Selected." },
        { name: "disabled", type: "boolean", description: "Unavailable." },
        { name: "closeOnSelect", type: "boolean", default: "true", description: "Close after selecting." },
      ],
    },
    {
      component: "MenuSub",
      description: "A chevron row that swaps the panel content for its children, with a Back row on top.",
      props: [
        { name: "label", type: "string", required: true, description: "Row label and title of the Back row." },
        { name: "icon", type: "ReactNode", description: "Leading icon." },
        { name: "disabled", type: "boolean", description: "Unavailable." },
        { name: "children", type: "ReactNode", description: "The submenu items." },
      ],
    },
    {
      component: "MenuGroup / MenuSeparator",
      props: [
        { name: "MenuGroup.label", type: "ReactNode", description: "Muted caption above the group; names it." },
        { name: "MenuSeparator", type: "—", description: "Inset hairline between groups." },
      ],
    },
    {
      component: "MenuPanel",
      description: "The panel on its own, rendered inline (documentation, custom popovers).",
      props: [
        { name: "platform", type: '"auto" | "ios" | "android" | "web"', default: "ConfigProvider", description: "Which anatomy to draw." },
        { name: "variant", type: '"pulldown" | "context"', default: '"pulldown"', description: "iOS width (260 / 290).", platform: "ios" },
        { name: "onRequestClose", type: "(reason) => void", description: "An item was selected, Esc on the root view, or Tab." },
      ],
    },
  ],

  storybook: {
    title: "Components/Menu",
    stories: [
      { name: "Over content", export: "OverContent" },
      { name: "Keyboard", export: "Keyboard" },
      { name: "iOS · Context menu", export: "IOSContextMenu" },
    ],
  },
  related: ["button", "header", "selection-toolbar"],
};

export default menu;
