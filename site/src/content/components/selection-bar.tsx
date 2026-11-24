import type React from "react";
import { FolderInput, Share, Trash2 } from "lucide-react";
import { Button, SelectionBar } from "@nactech/sfui";
import { DeviceFrame } from "@site/components/DeviceFrame";
import type { ComponentDoc, DemoProps } from "../types";
import { Column } from "../shared";
import { Hint, LIBRARY, PhoneSelectionFlow, WebSelectionFlow } from "./header/selection-flow";

const noop = () => {};

/** Width of a static example. */
function Slot({ children, width = "40rem" }: { children: React.ReactNode; width?: string }) {
  return <div style={{ width: `min(${width}, 100%)` }}>{children}</div>;
}

const iconActions = (
  <>
    <Button variant="secondary" size="s" iconOnly aria-label="Share">
      <Share />
    </Button>
    <Button variant="danger" size="s" iconOnly aria-label="Delete">
      <Trash2 />
    </Button>
  </>
);
const labelledActions = (
  <>
    <Button variant="secondary" size="s" leadingIcon={<Share />}>
      Share
    </Button>
    <Button variant="danger" size="s" leadingIcon={<Trash2 />}>
      Delete
    </Button>
  </>
);

function Demo({ values }: DemoProps) {
  const start = Number(values.startSelected);
  return (
    <Column gap={0.75} width="min(48rem, 100%)">
      <Hint>Hover a row and tick it · Shift-click for a range · ⌘/Ctrl+A all · Esc clear</Hint>
      <WebSelectionFlow
        key={JSON.stringify(values)}
        height={28}
        hint={Boolean(values.hint)}
        scope={Boolean(values.scope)}
        startSelected={LIBRARY.slice(0, start).map((s) => s.value)}
      />
    </Column>
  );
}

const FLOWS: { platform: "ios" | "android" | "web"; caption: string }[] = [
  { platform: "web", caption: "Web · the page header becomes a sticky SelectionBar; ⌘A selects the page, Esc clears." },
  { platform: "ios", caption: "iOS · Header keeps Cancel and Select All; the tab bar becomes a SelectionToolbar." },
  { platform: "android", caption: "Android · the contextual header: ×, count, actions and ⋮ with Select all." },
];

/** Shared component, platform-specific flow: the same task on each platform, side by side. */
function PlatformDemo() {
  const selected = ["chilly", "fog"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 25.5rem), 1fr))", gap: "2rem 1.5rem", width: "100%", alignItems: "start" }}>
      {FLOWS.map(({ platform, caption }) => (
        <div key={platform} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: 0 }}>
          <DeviceFrame platform={platform} height={28} align="end">
            {platform === "web" ? (
              <WebSelectionFlow bare height={30} startSelected={selected} />
            ) : (
              <PhoneSelectionFlow platform={platform} bare height={30} startSelected={selected} />
            )}
          </DeviceFrame>
          <p style={{ margin: 0, color: "var(--sf-fg-muted)", font: "400 0.875rem/1.5 var(--sf-font-sans)", textAlign: "center" }}>{caption}</p>
        </div>
      ))}
    </div>
  );
}

function Preview() {
  return (
    <Slot width="22rem">
      <SelectionBar count={2} total={12} sticky={false} keyboardShortcuts={false} actions={iconActions} />
    </Slot>
  );
}

const selectionBar: ComponentDoc = {
  slug: "selection-bar",
  name: "SelectionBar",
  group: "Navigation",
  summary: "Web selection header: tri-state select-all, count, actions, ⌘A / Esc and the “select everything” banner.",
  docStatus: "complete",
  status: "stable",
  exports: ["SelectionBar", "useSelectionShortcuts", "isEditableTarget"],
  platformSplit: "shared",
  Demo,
  Preview,
  controls: [
    { type: "number", name: "startSelected", label: "Start with selected", min: 0, max: 12, default: 2 },
    { type: "boolean", name: "hint", label: "Keyboard hint", default: true },
    { type: "boolean", name: "scope", label: "Offer the whole Library", default: true },
  ],
  code: (v) =>
    `import { Button, PageHeader, SelectionBar, useSelectionShortcuts } from "@nactech/sfui";
import { FolderInput, Share, Trash2 } from "lucide-react";

// Before anything is selected there is no bar: ⌘/Ctrl+A starts a selection.
useSelectionShortcuts({ enabled: selected.size === 0, onSelectAll: selectPage });

{selected.size > 0 ? (
  <SelectionBar
    count={everything ? 120 : selected.size}
    total={items.length}
    onSelectAllChange={(all) => (all ? selectPage() : clear())}
    onClear={clear}
    actions={
      <>
        <Button variant="secondary" size="s" leadingIcon={<Share />}>Share</Button>
        <Button variant="secondary" size="s" leadingIcon={<FolderInput />}>Move</Button>
        <Button variant="danger" size="s" leadingIcon={<Trash2 />}>Delete</Button>
      </>
    }${v.hint ? "" : "\n    showKeyboardHint={false}"}${
      v.scope
        ? `
    itemNoun="stickers"
    scopeTotal={120}
    scopeLabel="Library"
    onSelectEverything={() => setEverything(true)}
    everythingSelected={everything}`
        : ""
    }
  />
) : (
  <PageHeader title="Foggy Stickers" … />
)}`,

  overview: {
    intro: (
      <>
        SelectionBar is the selection header of the web. The moment a row is checked it takes the page header’s place —
        same spot, sticky at the top — with a tri-state select-all, the count, the actions for the selection and Clear.
        ⌘A (Ctrl+A) selects the page and Esc clears, with a quiet hint that says so. Once the whole page is selected, a
        banner offers the wider scope: “Select all 120 in Library”.
      </>
    ),
    whenToUse: [
      "Bulk actions on a list or grid on wide web pages: Share, Move, Delete a set of stickers.",
      "Lists that span pages or lazy-load — the banner extends the selection to everything (`onSelectEverything`).",
      "Anywhere ⌘A / Esc should select and clear items, not the page text — `useSelectionShortcuts` on its own.",
    ],
    whenNotToUse: [
      "iOS — use Header selection mode (Cancel / Select All) with SelectionToolbar at the bottom.",
      "Android and phone-width web apps — use Header selection mode, the contextual bar.",
      "A single choice — use Radio or a selectable List row.",
      "Selecting text or settings — this is for items you act on as a group.",
    ],
  },

  variants: [
    {
      name: "Selecting",
      description: "Some of the page is selected: the select-all checkbox is mixed. Activating it selects the page.",
      render: () => (
        <Slot>
          <SelectionBar count={2} total={12} sticky={false} keyboardShortcuts={false} actions={labelledActions} />
        </Slot>
      ),
    },
    {
      name: "Page selected · scope offered",
      description: "Everything on the page is selected; the banner offers the rest of the Library.",
      render: () => (
        <Slot>
          <SelectionBar
            count={12}
            total={12}
            sticky={false}
            keyboardShortcuts={false}
            actions={iconActions}
            itemNoun="stickers"
            scopeTotal={120}
            scopeLabel="Library"
            onSelectEverything={noop}
          />
        </Slot>
      ),
    },
    {
      name: "Everything selected",
      description: "`everythingSelected`: the banner confirms the wider scope and offers Clear selection.",
      render: () => (
        <Slot>
          <SelectionBar
            count={120}
            total={12}
            sticky={false}
            keyboardShortcuts={false}
            actions={iconActions}
            onClear={noop}
            itemNoun="stickers"
            scopeTotal={120}
            scopeLabel="Library"
            everythingSelected
          />
        </Slot>
      ),
    },
    {
      name: "Count only",
      description: "No `actions`: a picker that hands the selection on (“Add 3 to pack” lives outside the bar).",
      render: () => (
        <Slot width="28rem">
          <SelectionBar count={3} total={12} sticky={false} keyboardShortcuts={false} />
        </Slot>
      ),
    },
  ],

  platforms: {
    intro: (
      <>
        SelectionBar itself is one implementation: an opaque <code>surface-2</code> bar for pointer-and-keyboard pages. The
        flow around it is platform-specific — the same task, “pick two stickers and act on them”, looks like this on each
        platform. Every frame is live.
      </>
    ),
    Demo: PlatformDemo,
  },

  usage: {
    guidelines: [
      "Show the bar only while something is selected. It replaces the page header in place, so nothing below it moves.",
      "Selection starts from the rows: checkboxes appear on hover and focus; once one is ticked, every row shows its checkbox, a click anywhere on a row toggles it and Shift-click selects a range.",
      "Actions are size-s Buttons — secondary for Share and Move, danger for Delete, which goes last. Three at most; put the rest behind a ghost ••• Menu.",
      "`total` is what is on the page. Add `scopeTotal`, `scopeLabel` and `onSelectEverything` to offer the rest of the scope once the page is full.",
      "Keep `keyboardShortcuts` on for page-level lists. Turn it off where ⌘A must keep selecting text, and wire `useSelectionShortcuts` with a `target` instead.",
      "Before the bar exists, `useSelectionShortcuts` alone lets ⌘A start a selection.",
      "On phones use Header selection mode — with SelectionToolbar on iOS.",
    ],
    dos: [
      {
        kind: "do",
        title: "Delete in danger, last",
        caption: "Safe actions are secondary; the destructive one stands apart.",
        render: () => (
          <Slot>
            <SelectionBar count={2} total={12} sticky={false} keyboardShortcuts={false} actions={labelledActions} />
          </Slot>
        ),
      },
      {
        kind: "dont",
        title: "Don’t make every action primary",
        caption: "Delete looks as safe as Share.",
        render: () => (
          <Slot>
            <SelectionBar
              count={2}
              total={12}
              sticky={false}
              keyboardShortcuts={false}
              actions={
                <>
                  <Button size="s">Share</Button>
                  <Button size="s">Delete</Button>
                </>
              }
            />
          </Slot>
        ),
      },
      {
        kind: "do",
        title: "One verb per action",
        caption: "The count already says what the action applies to.",
        render: () => (
          <Slot>
            <SelectionBar
              count={2}
              total={12}
              sticky={false}
              keyboardShortcuts={false}
              actions={
                <Button variant="secondary" size="s" leadingIcon={<FolderInput />}>
                  Move
                </Button>
              }
            />
          </Slot>
        ),
      },
      {
        kind: "dont",
        title: "Don’t write sentences",
        caption: "Long labels truncate and crowd out the count.",
        render: () => (
          <Slot>
            <SelectionBar
              count={2}
              total={12}
              sticky={false}
              keyboardShortcuts={false}
              actions={
                <Button variant="secondary" size="s" leadingIcon={<FolderInput />}>
                  Move selected stickers
                </Button>
              }
            />
          </Slot>
        ),
      },
      {
        kind: "do",
        title: "Offer the wider scope explicitly",
        caption: "Select the page first; the banner asks before taking all 120.",
        render: () => (
          <Slot>
            <SelectionBar
              count={12}
              total={12}
              sticky={false}
              keyboardShortcuts={false}
              itemNoun="stickers"
              scopeTotal={120}
              scopeLabel="Library"
              onSelectEverything={noop}
            />
          </Slot>
        ),
      },
      {
        kind: "dont",
        title: "Don’t select what people can’t see",
        caption: "“120 selected” from one checkbox on a page of 12 is a surprise — and a risky Delete.",
        render: () => (
          <Slot>
            <SelectionBar
              count={120}
              total={12}
              sticky={false}
              keyboardShortcuts={false}
              actions={
                <Button variant="danger" size="s" leadingIcon={<Trash2 />}>
                  Delete
                </Button>
              }
            />
          </Slot>
        ),
      },
    ],
    writing: [
      "Count: “3 selected” — lowercase, no noun; `countLabel` localises it.",
      "Actions: one verb each — Share, Move, Download, Delete.",
      "Banner: “All 12 stickers on this page are selected. Select all 120 in Library” — set `itemNoun` and `scopeLabel` so it names real things.",
      "Clear is “Clear”, not “Cancel” — nothing is being undone.",
    ],
  },

  accessibility: {
    intro: (
      <>
        SelectionBar is a labelled <code>&lt;section&gt;</code> (a region landmark). The count is a polite live region,
        the shortcuts are declared with <code>aria-keyshortcuts</code>, and the banner is a status message.
      </>
    ),
    roles: [
      { element: "Bar", role: "region (<section>)", notes: "Named by `label` (“Selection”)." },
      { element: "Select all", role: "checkbox", notes: "Named by `selectAllLabel`; `aria-checked=\"mixed\"` while part of the page is selected; `aria-keyshortcuts=\"Meta+A Control+A\"`." },
      { element: "Count", role: "aria-live=\"polite\" aria-atomic", notes: "“3 selected” is announced on every change." },
      { element: "Actions", role: "button", notes: "Your Buttons — icon-only ones need `aria-label`." },
      { element: "Clear", role: "button", notes: "`aria-keyshortcuts=\"Escape\"` while shortcuts are on." },
      { element: "Keyboard hint", role: "aria-hidden", notes: "Visual only — the shortcuts are exposed on the controls. Hidden on touch screens and in bars narrower than 40rem." },
      { element: "Banner", role: "status", notes: "Its action is a real <button>." },
    ],
    keyboard: [
      { keys: ["⌘", "A"], action: "Selects every item on the page (Ctrl+A off Apple platforms). Text fields keep their own ⌘A." },
      { keys: ["Esc"], action: "Clears the selection — unless something else handled it first, such as an open Menu." },
      { keys: ["Tab"], action: "Select all → actions → Clear → banner action." },
      { keys: ["Space"], action: "On the select-all checkbox: from mixed or off selects the page; from on clears it." },
    ],
    focus: [
      "Shortcuts listen on the document while the bar is mounted. They skip text inputs, textareas, selects and contenteditable, IME composition, Alt and Shift+A, and events another handler already prevented.",
      "Clearing removes the bar, and the focused control with it. Return focus to the list — the demo moves it to the first row.",
      "Row checkboxes revealed on hover must also appear on focus — hide them with opacity, never `display` or `visibility`, so they stay in the tab order.",
    ],
    reducedMotion: ["The bar drops in (4 px, 220 ms). With reduce motion it simply appears."],
    screenReader: [
      "Pair each row checkbox with the item’s name (“Select Mr. Chilly”).",
      "The banner text and its action are announced as a status when the page fills up.",
    ],
  },

  api: [
    {
      component: "SelectionBar",
      props: [
        { name: "count", type: "number", required: true, description: "Number of selected items." },
        { name: "total", type: "number", description: "Selectable items on the page. Drives the tri-state checkbox." },
        { name: "allSelected", type: "boolean", default: "count ≥ total", description: "Override “everything on the page is selected”." },
        { name: "onSelectAllChange", type: "(checked: boolean) => void", description: "Select-all checkbox, and ⌘/Ctrl+A with `true`. The mixed state selects all." },
        { name: "onClear", type: "() => void", description: "Clear button, Esc, and the banner’s Clear selection." },
        { name: "actions", type: "ReactNode", description: "Size-s Buttons: secondary (Share, Move) and danger (Delete)." },
        { name: "countLabel", type: "(count: number) => ReactNode", default: "“N selected”", description: "Count text." },
        { name: "selectAllLabel", type: "string", default: '"Select all"', description: "Accessible name of the checkbox." },
        { name: "clearLabel", type: "ReactNode", default: '"Clear"', description: "Clear button text." },
        { name: "keyboardShortcuts", type: "boolean", default: "true", description: "Wire ⌘/Ctrl+A and Esc on the document while mounted." },
        { name: "showKeyboardHint", type: "boolean", default: "true", description: "Show the hint (pointer devices, bars from 40rem, shortcuts on)." },
        { name: "keyboardHint", type: "ReactNode", default: "“⌘A all · Esc clear”", description: "Custom hint. “Ctrl+A all · Esc clear” off Apple platforms." },
        { name: "sticky", type: "boolean", default: "true", description: "`position: sticky; top: 0` — override `top` via `style`." },
        { name: "label", type: "string", default: '"Selection"', description: "Accessible name of the region." },
        { name: "onSelectEverything", type: "() => void", description: "Offer the wider scope once the page is fully selected." },
        { name: "scopeTotal", type: "number", description: "Size of the wider scope (120). The banner only shows while it exceeds `count`." },
        { name: "scopeLabel", type: "string", description: "Name of the wider scope (“Library”)." },
        { name: "itemNoun", type: "string", default: '"items"', description: "Plural noun in the banner." },
        { name: "everythingSelected", type: "boolean", default: "false", description: "The wider scope is selected: the banner confirms it and offers Clear selection." },
        { name: "bannerText", type: "ReactNode", description: "Override the banner sentence." },
        { name: "bannerActionLabel", type: "ReactNode", description: "Override the banner link text." },
        { name: "ref", type: "Ref<HTMLElement>", description: "The <section> element." },
      ],
      extends: "Also accepts native <section> attributes (className, style, data-*), except `children`.",
    },
    {
      component: "useSelectionShortcuts",
      description: "`useSelectionShortcuts(options)` — ⌘/Ctrl+A and Esc for any selection UI. SelectionBar uses it internally.",
      props: [
        { name: "onSelectAll", type: "() => void", description: "⌘A on Apple platforms, Ctrl+A elsewhere. Prevents the browser’s text selection." },
        { name: "onClear", type: "() => void", description: "Esc (without ⌘, Ctrl or Alt)." },
        { name: "enabled", type: "boolean", default: "true", description: "Attach the listener." },
        { name: "target", type: "HTMLElement | Document | null", default: "document", description: "Where to listen." },
      ],
    },
    {
      component: "isEditableTarget",
      description: "`isEditableTarget(target: EventTarget | null): boolean` — the check the hook uses to leave text fields alone.",
      props: [{ name: "returns", type: "boolean", description: "True for contenteditable, <textarea>, <select> and text-like <input>s (not checkbox, radio, button, range…)." }],
    },
  ],

  storybook: {
    title: "Components/SelectionBar",
    stories: [
      { name: "Flow", export: "Flow" },
      { name: "Selecting", export: "Selecting" },
      { name: "All selected", export: "AllSelected" },
      { name: "Everything selected", export: "EverythingSelected" },
    ],
  },
  related: ["header", "selection-toolbar", "list", "button"],
};

export default selectionBar;
