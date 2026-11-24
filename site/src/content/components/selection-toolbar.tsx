import type React from "react";
import { Copy, Download, FolderInput, Pencil, Share, Star, Tag, Trash2 } from "lucide-react";
import { MenuItem, SelectionToolbar, TabBar, usePlatform, type Platform, type SelectionToolbarAction } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column, tabItems } from "../shared";
import { Hint, SelectionFlow } from "./header/selection-flow";

const noop = () => {};

const actions: SelectionToolbarAction[] = [
  { label: "Share", icon: <Share />, onSelect: noop },
  { label: "Move", icon: <FolderInput />, onSelect: noop },
  { label: "Duplicate", icon: <Copy />, onSelect: noop },
  { label: "Delete", icon: <Trash2 />, onSelect: noop, destructive: true },
];
const moreMenu = (
  <>
    <MenuItem icon={<Download />}>Export</MenuItem>
    <MenuItem icon={<Tag />}>Add Tag</MenuItem>
  </>
);

/** Width of a static example. */
function Slot({ children, width = "24rem" }: { children: React.ReactNode; width?: string }) {
  return <div style={{ width: `min(${width}, 100%)`, display: "flex", justifyContent: "center" }}>{children}</div>;
}

function Demo({ values }: DemoProps) {
  const platform = usePlatform();
  const ios = platform === "ios";
  return (
    <Column gap={0.75} width="min(24.375rem, 100%)">
      <Hint>
        {ios
          ? "Tick rows · Select All · press an action · Cancel"
          : "The Android + Web fallback grammar · these platforms usually select from the header (see Platforms)"}
      </Hint>
      <SelectionFlow
        key={`${platform}-${JSON.stringify(values)}`}
        platform={platform === "web" ? "android" : platform}
        height={28}
        toolbarEverywhere
        startSelected={values.startSelecting ? ["chilly", "fog"] : undefined}
        moreMenu={Boolean(values.moreMenu)}
        disableDuplicate={Boolean(values.disableDuplicate)}
      />
    </Column>
  );
}

function PlatformDemo({ platform }: { platform: Platform }) {
  return <SelectionFlow platform={platform} bare height={30} startSelected={["chilly", "fog"]} />;
}

function Preview() {
  return <SelectionToolbar platform="ios" pinned={false} count={3} actions={actions} moreMenu={moreMenu} />;
}

const selectionToolbar: ComponentDoc = {
  slug: "selection-toolbar",
  name: "SelectionToolbar",
  group: "Navigation",
  summary: "iOS bottom toolbar of actions for the selected items, replacing the tab bar in edit mode.",
  docStatus: "complete",
  status: "stable",
  exports: ["SelectionToolbar"],
  platformSplit: "ios",
  stage: "photo",
  Demo,
  Preview,
  controls: [
    { type: "boolean", name: "startSelecting", label: "Start with 2 selected", default: true },
    { type: "boolean", name: "moreMenu", label: "More menu (•••)", default: true },
    { type: "boolean", name: "disableDuplicate", label: "Disable Duplicate", default: false },
  ],
  code: (v) =>
    `import { Header, MenuItem, SelectionToolbar, TabBar } from "@nactech/sfui";
import { Copy, Download, FolderInput, Share, Tag, Trash2 } from "lucide-react";

<Header
  title="Foggy Stickers"
  onStartSelection={() => setSelecting(true)}
  selectionCount={selecting ? selected.length : undefined}
  onCancelSelection={endSelection}
  allSelected={selected.length === items.length}
  onSelectAll={selectAll}
  onDeselectAll={() => setSelected([])}
/>

{selecting ? (
  <SelectionToolbar
    count={selected.length}
    actions={[
      { label: "Share", icon: <Share />, onSelect: share },
      { label: "Move", icon: <FolderInput />, onSelect: move },
      { label: "Duplicate", icon: <Copy />, onSelect: duplicate${v.disableDuplicate ? ", disabled: true" : ""} },
      { label: "Delete", icon: <Trash2 />, onSelect: remove, destructive: true },
    ]}${
      v.moreMenu
        ? `
    moreMenu={
      <>
        <MenuItem icon={<Download />}>Export</MenuItem>
        <MenuItem icon={<Tag />}>Add Tag</MenuItem>
      </>
    }`
        : ""
    }
  />
) : (
  <TabBar items={tabs} value={tab} onValueChange={setTab} aria-label="Sections" />
)}`,

  overview: {
    intro: (
      <>
        On iOS, selecting items is a mode. Header keeps only Cancel, the count and Select All; the actions move to the
        bottom, where the tab bar morphs into SelectionToolbar — a glass capsule of icon-over-label actions with a round
        ••• for the rest. At zero selected every action is disabled but stays in place, so the layout never jumps while
        people pick.
      </>
    ),
    whenToUse: [
      "iOS selection mode: the actions for the selected items — Share, Move, Duplicate, Delete.",
      "In place of the tab bar, from Select to Cancel (or until a destructive action ends the mode).",
      "Together with Header selection mode, which carries Cancel, the count and Select All.",
    ],
    whenNotToUse: [
      "Wide web pages — use SelectionBar in place of the page header.",
      "Android — the contextual header holds the actions (`selectionActions` on Header).",
      "Actions on a single item — use a Menu or the iOS context menu.",
      "Permanent tools that are not about a selection — use Buttons in the content or the header.",
    ],
  },

  variants: [
    {
      name: "iOS · Selected",
      description: "Four actions in the capsule, Delete in danger, ••• opens a Menu with the rest.",
      stage: "photo",
      render: () => (
        <Slot>
          <SelectionToolbar platform="ios" pinned={false} count={3} actions={actions} moreMenu={moreMenu} />
        </Slot>
      ),
    },
    {
      name: "iOS · Nothing selected",
      description: "`count={0}`: every action and ••• is disabled on the unchanged glass.",
      stage: "photo",
      render: () => (
        <Slot>
          <SelectionToolbar platform="ios" pinned={false} count={0} actions={actions} moreMenu={moreMenu} />
        </Slot>
      ),
    },
    {
      name: "iOS · One action unavailable",
      description: "`disabled` on an action greys out just that one — here Duplicate, for a locked sticker.",
      stage: "photo",
      render: () => (
        <Slot>
          <SelectionToolbar
            platform="ios"
            pinned={false}
            count={2}
            actions={actions.map((a) => (a.label === "Duplicate" ? { ...a, disabled: true } : a))}
            moreMenu={moreMenu}
          />
        </Slot>
      ),
    },
    {
      name: "iOS · Without •••",
      description: "Omit `moreMenu` when every action fits in the capsule.",
      stage: "photo",
      render: () => (
        <Slot>
          <SelectionToolbar platform="ios" pinned={false} count={2} actions={actions.filter((a) => a.label !== "Duplicate")} />
        </Slot>
      ),
    },
    {
      name: "Android + Web fallback",
      description: "Off iOS it renders in the tab-bar grammar: a 72 capsule, Geist labels, a state layer and hover.",
      stage: "photo",
      render: () => (
        <Slot width="28rem">
          <SelectionToolbar platform="web" pinned={false} count={3} actions={actions} moreMenu={moreMenu} />
        </Slot>
      ),
    },
  ],

  platforms: {
    intro: (
      <>
        SelectionToolbar is the iOS half of a flow that differs on every platform. On iOS the tab bar becomes the toolbar;
        on Android the header becomes the contextual bar and the tab bar stays; on the wide web the page header becomes a
        SelectionBar. All three frames start with two stickers selected and are live.
      </>
    ),
    Demo: PlatformDemo,
    notes: {
      ios: [
        "A 290-wide glass capsule (22 icons over 10 / 600 labels) and a separate 62 ••• circle, pinned 18 above the bottom edge or clear of the home indicator.",
        "It rises in on a spring where the tab bar was. Header shows Cancel · “2 Selected” · Select All.",
        "At 0 selected every action and ••• is disabled; Cancel returns the tab bar.",
      ],
      android: [
        "No toolbar: the contextual header carries the actions (`selectionActions`) and ⋮ with Select all and `selectionOverflowMenu`. The tab bar stays.",
        "Rendered here anyway, SelectionToolbar takes the tab-bar grammar — see the fallback variant.",
      ],
      web: [
        "Wide pages: SelectionBar replaces the page header — select-all checkbox, count, actions, ⌘A / Esc.",
        "Phone-width web apps follow Android: Header selection mode.",
      ],
    },
  },

  usage: {
    guidelines: [
      "Show it only in selection mode, in place of the tab bar — never both at once.",
      "Up to four actions, most frequent first, Delete last with `destructive`. Everything else goes into `moreMenu`.",
      "Keep it on screen at 0 selected (disabled) so nothing moves while people pick.",
      "Pair it with Header selection mode: Cancel, the count and Select All live at the top, the actions at the bottom.",
      "Stay in selection mode after Share, Move or Duplicate so people can keep going; leave it after Delete.",
      "Content scrolls under the glass — keep the bottom padding you used for the tab bar.",
      "Render it with `pinned={false}` only inside previews or custom shells; in an app it pins itself above the home indicator.",
    ],
    dos: [
      {
        kind: "do",
        title: "Four actions, the rest in •••",
        caption: "Every label fits, the frequent ones stay one tap away.",
        stage: "photo",
        render: () => (
          <Slot>
            <SelectionToolbar platform="ios" pinned={false} count={3} actions={actions} moreMenu={moreMenu} />
          </Slot>
        ),
      },
      {
        kind: "dont",
        title: "Don’t squeeze everything in",
        caption: "Six actions shrink the targets and truncate the labels.",
        stage: "photo",
        render: () => (
          <Slot>
            <SelectionToolbar
              platform="ios"
              pinned={false}
              count={3}
              actions={[
                ...actions.slice(0, 3),
                { label: "Rename", icon: <Pencil />, onSelect: noop },
                { label: "Favourite", icon: <Star />, onSelect: noop },
                actions[3]!,
              ]}
              moreMenu={moreMenu}
            />
          </Slot>
        ),
      },
      {
        kind: "do",
        title: "Replace the tab bar",
        caption: "Selection is a mode: the toolbar takes the tab bar’s place.",
        stage: "photo",
        render: () => (
          <Slot>
            <SelectionToolbar platform="ios" pinned={false} count={2} actions={actions} moreMenu={moreMenu} />
          </Slot>
        ),
      },
      {
        kind: "dont",
        title: "Don’t stack it on the tab bar",
        caption: "Two glass bars compete, and switching tabs mid-selection loses the selection.",
        stage: "photo",
        render: () => (
          <Column gap={0.5} width="min(24rem, 100%)">
            <SelectionToolbar platform="ios" pinned={false} count={2} actions={actions} moreMenu={moreMenu} />
            <TabBar platform="ios" items={tabItems} defaultValue="library" pinned={false} aria-label="Sections" />
          </Column>
        ),
      },
      {
        kind: "do",
        title: "Delete last, in red",
        caption: "Only the destructive action gets danger.",
        stage: "photo",
        render: () => (
          <Slot>
            <SelectionToolbar platform="ios" pinned={false} count={2} actions={actions} />
          </Slot>
        ),
      },
      {
        kind: "dont",
        title: "Don’t paint every action red",
        caption: "When everything warns, Delete stops standing out.",
        stage: "photo",
        render: () => (
          <Slot>
            <SelectionToolbar platform="ios" pinned={false} count={2} actions={actions.map((a) => ({ ...a, destructive: true }))} />
          </Slot>
        ),
      },
    ],
    writing: [
      "One verb per action, one word: Share, Move, Duplicate, Delete. Labels are about 70 wide.",
      "Title Case in the ••• menu on iOS: “Add Tag”, “Export”.",
      "Use the same verb as everywhere else in the app — Delete in the toolbar is Delete in the context menu.",
      "Set `moreLabel` when the ••• holds something more specific than “More actions”.",
    ],
  },

  accessibility: {
    intro: (
      <>
        SelectionToolbar is a WAI-ARIA toolbar: one Tab stop, arrow keys move between actions. Every action is a native
        button named by its visible label. The count is not repeated here — Header’s live region announces it.
      </>
    ),
    roles: [
      { element: "Root", role: "toolbar", notes: "Named by `aria-label` (“Selection actions”), `aria-orientation=\"horizontal\"`, `aria-disabled` when everything is disabled." },
      { element: "Action", role: "button", notes: "The visible label is the name; the icon is aria-hidden. `disabled` when `count` is 0, `disabled` is set, or the action is disabled." },
      { element: "Destructive action", role: "button", notes: "Danger colour only — the label carries the meaning." },
      { element: "•••", role: "button + aria-haspopup=\"menu\"", notes: "Named by `moreLabel` (“More actions”); opens a Menu. At 0 it is a plain disabled button." },
    ],
    keyboard: [
      { keys: ["Tab"], action: "Enters the toolbar on the last focused action (roving tab index), then leaves it." },
      { keys: ["←", "→"], action: "Previous / next enabled action, wrapping around; mirrored in right-to-left. Disabled actions are skipped." },
      { keys: ["Home", "End"], action: "First / last enabled action." },
      { keys: ["Enter", "Space"], action: "Activates the focused action." },
      { keys: ["↓"], action: "On •••: opens the menu on its first item (see Menu)." },
    ],
    focus: [
      "`:focus-visible` ring — inside the capsule on actions, 2 outside on •••.",
      "At 0 selected nothing in the toolbar is focusable, so it has no Tab stop until something is selected.",
      "Entering selection removes Select from the header and swapping the tab bar removes its tabs — move focus to the first row, as the demos do.",
    ],
    reducedMotion: [
      "On mount the toolbar rises 12 and scales up from 0.96 on a spring (220 ms). With reduce motion it simply appears.",
      "Press and colour changes drop their 120 ms transition.",
    ],
    screenReader: [
      "The selection count is announced by Header (“2 Selected”) — keep Header in selection mode while the toolbar is shown.",
      "Rename the toolbar with `aria-label` when a screen has more than one.",
    ],
  },

  api: [
    {
      component: "SelectionToolbar",
      props: [
        { name: "actions", type: "SelectionToolbarAction[]", required: true, description: "Actions in the capsule, in order. Keep it to about four." },
        { name: "count", type: "number", description: "Selected items. At `0` every action and ••• is disabled." },
        { name: "moreMenu", type: "ReactNode", description: "`MenuItem`s for the round ••• button. Omit to hide it." },
        { name: "moreLabel", type: "string", default: '"More actions"', description: "Accessible name of •••." },
        { name: "disabled", type: "boolean", default: "false", description: "Disable the whole toolbar regardless of `count`." },
        { name: "pinned", type: "boolean", default: "true", description: "Fixed at the bottom centre, clear of the home indicator (`env(safe-area-inset-bottom)`). `false` renders it in flow." },
        { name: "aria-label", type: "string", default: '"Selection actions"', description: "Accessible name of the toolbar." },
        { name: "platform", type: '"auto" | "ios" | "android" | "web"', default: "ConfigProvider", description: "Force one implementation. Off iOS it renders in the tab-bar grammar." },
        { name: "ref", type: "Ref<HTMLDivElement>", description: "The toolbar element." },
      ],
      extends: "Also accepts native <div> attributes (className, style, onKeyDown…), except `children`.",
    },
    {
      component: "SelectionToolbarAction",
      description: "One action in the capsule.",
      props: [
        { name: "label", type: "string", required: true, description: "Visible label under the icon; also the accessible name." },
        { name: "icon", type: "ReactNode", required: true, description: "Lucide icon, drawn at 22." },
        { name: "onSelect", type: "() => void", required: true, description: "Pressed." },
        { name: "destructive", type: "boolean", description: "Danger tint (Delete)." },
        { name: "disabled", type: "boolean", description: "Disable just this action." },
      ],
    },
  ],

  storybook: {
    title: "Components/SelectionToolbar",
    stories: [
      { name: "iOS selection flow", export: "IOSSelectionFlow" },
      { name: "Flow · steps", export: "IOSSelectionFlowSteps" },
      { name: "Nothing selected", export: "NothingSelected" },
      { name: "Android + Web", export: "AndroidWeb" },
    ],
  },
  related: ["header", "selection-bar", "tabbar", "list"],
};

export default selectionToolbar;
