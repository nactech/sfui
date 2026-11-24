import type React from "react";
import { useState } from "react";
import { Captions, CarTaxiFront, CircleAlert, Ellipsis, House, Pin, Repeat, Share, Snowflake, Trash2, Vibrate } from "lucide-react";
import {
  Button,
  List,
  ListAction,
  ListItem,
  ListStatus,
  ListThumbnail,
  Switch,
  type ListSwipeAction,
  type ListVariant,
} from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column } from "../shared";

const VARIANTS: ListVariant[] = ["segmented", "flat", "inset"];

interface Sticker {
  value: string;
  title: string;
  subtitle?: string;
  meta?: string;
  size: string;
  icon: React.ReactNode;
  tone: "accent" | "warning" | "danger";
  overBudget?: boolean;
}

const STICKERS: Sticker[] = [
  { value: "chilly", title: "Mr. Chilly", subtitle: "2.4 s · 60 fps · 512²", size: "41 KB", icon: <Snowflake />, tone: "accent" },
  { value: "taxi", title: "Robotaxi", subtitle: "Over budget · 3.0 s · 60 fps", size: "71 KB", icon: <CarTaxiFront />, tone: "warning", overBudget: true },
  {
    value: "ladies",
    title: "Painted Ladies",
    meta: "Three houses, one fog layer and a cable car. Draft — needs a lighter fog pass.",
    size: "38 KB",
    icon: <House />,
    tone: "danger",
  },
];

const noop = () => {};
const staticSwipe: ListSwipeAction[] = [
  { label: "Pin", icon: <Pin />, onSelect: noop },
  { label: "Delete", icon: <Trash2 />, tone: "danger", onSelect: noop },
];

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <span aria-live="polite" style={{ color: "var(--sf-fg-muted)", font: "500 0.75rem/1.4 var(--sf-font-mono)", letterSpacing: "0.04em" }}>
      {children}
    </span>
  );
}

const thumb = (s: Sticker) => <ListThumbnail tone={s.tone}>{s.icon}</ListThumbnail>;
const trailingOf = (s: Sticker) =>
  s.overBudget ? (
    <ListStatus icon={<CircleAlert />}>{s.size}</ListStatus>
  ) : (
    s.size
  );

/** The live list: Pin moves a row to the top, Delete removes it; edit mode counts the selection in the title. */
function LiveList({ values }: DemoProps) {
  const [rows, setRows] = useState(STICKERS);
  const [selected, setSelected] = useState<string[]>(["chilly"]);
  const [last, setLast] = useState("Drag a row left — or Tab to its actions");
  const editing = Boolean(values.selectable);
  const swipe = Boolean(values.swipe);

  const pin = (s: Sticker) => {
    setRows((r) => [s, ...r.filter((x) => x.value !== s.value)]);
    setLast(`Pinned ${s.title}`);
  };
  const remove = (s: Sticker) => {
    setRows((r) => r.filter((x) => x.value !== s.value));
    setSelected((sel) => sel.filter((v) => v !== s.value));
    setLast(`Deleted ${s.title}`);
  };

  return (
    <Column gap={1} width="min(30rem, 100%)">
      <List
        variant={values.variant as ListVariant}
        title={editing ? `${selected.length} selected` : "Recent"}
        action={rows.length < STICKERS.length ? <ListAction onClick={() => setRows(STICKERS)}>Restore</ListAction> : <ListAction href="#all">See All</ListAction>}
        selectable={editing}
        selectedValues={selected}
        onSelectedValuesChange={setSelected}
      >
        {rows.map((s) => (
          <ListItem
            key={s.value}
            value={s.value}
            leading={thumb(s)}
            title={s.title}
            subtitle={s.subtitle}
            meta={s.meta}
            trailing={trailingOf(s)}
            chevron
            onClick={() => setLast(`Opened ${s.title}`)}
            disabled={Boolean(values.disabled) && s.value === "taxi"}
            swipeActions={
              swipe
                ? [
                    { label: "Pin", icon: <Pin />, onSelect: () => pin(s) },
                    { label: "Delete", icon: <Trash2 />, tone: "danger", onSelect: () => remove(s) },
                  ]
                : undefined
            }
          />
        ))}
        <ListItem
          leading={
            <ListThumbnail tone="positive">
              <Repeat />
            </ListThumbnail>
          }
          title="Loop playback"
          subtitle="Applies to all stickers"
          trailing={<Switch aria-label="Loop playback" defaultChecked />}
        />
        <ListItem
          leading={<ListThumbnail avatar>MF</ListThumbnail>}
          title="Mark Fomin"
          subtitle="Owner · you"
          trailing={
            <Button variant="secondary" size="s" onClick={() => setLast("Share sheet")}>
              Share
            </Button>
          }
        />
      </List>
      {!editing && swipe && (
        <div style={{ textAlign: "center" }}>
          <Caption>{last}</Caption>
        </div>
      )}
    </Column>
  );
}

/** `key` restarts the demo state when the style changes. */
function Demo({ values }: DemoProps) {
  return <LiveList key={String(values.variant)} values={values} />;
}

function Preview() {
  return (
    <List variant="segmented" listLabel="Recent" style={{ width: "22rem" }}>
      {STICKERS.slice(0, 2).map((s) => (
        <ListItem key={s.value} leading={thumb(s)} title={s.title} subtitle={s.subtitle} trailing={trailingOf(s)} chevron onClick={noop} />
      ))}
    </List>
  );
}

/** Three sticker rows in one style — the gallery entries. */
function Stickers({ variant, ...props }: { variant: ListVariant } & Partial<React.ComponentProps<typeof List>>) {
  return (
    <List variant={variant} title="Recent" headingLevel={3} action={<ListAction href="#all">See All</ListAction>} style={{ width: "min(28rem, 100%)" }} {...props}>
      {STICKERS.map((s) => (
        <ListItem
          key={s.value}
          value={s.value}
          leading={thumb(s)}
          title={s.title}
          subtitle={s.subtitle}
          meta={s.meta}
          trailing={trailingOf(s)}
          chevron
          onClick={noop}
          swipeActions={staticSwipe}
        />
      ))}
    </List>
  );
}

function Settings({ title = "Playback" }: { title?: string }) {
  return (
    <List variant="inset" title={title} headingLevel={3} style={{ width: "min(26rem, 100%)" }}>
      <ListItem
        leading={
          <ListThumbnail tone="positive">
            <Repeat />
          </ListThumbnail>
        }
        title="Loop playback"
        subtitle="Applies to all stickers"
        trailing={<Switch aria-label="Loop playback" defaultChecked />}
      />
      <ListItem
        leading={
          <ListThumbnail tone="accent">
            <Captions />
          </ListThumbnail>
        }
        title="Show frame numbers"
        trailing={<Switch aria-label="Show frame numbers" />}
      />
      <ListItem
        leading={
          <ListThumbnail tone="warning">
            <Vibrate />
          </ListThumbnail>
        }
        title="Haptics"
        trailing="On"
        chevron
        onClick={noop}
      />
    </List>
  );
}

function SettingsFrame() {
  return <Settings />;
}

const list: ComponentDoc = {
  slug: "list",
  name: "List",
  group: "Lists",
  summary: "Rows of media, status, controls and actions in three styles — segmented, flat and inset — with swipe and edit mode.",
  docStatus: "complete",
  status: "stable",
  exports: ["List", "ListItem", "ListThumbnail", "ListStatus", "ListAction"],
  platformSplit: "shared",
  Demo,
  Preview,
  controls: [
    { type: "enum", name: "variant", label: "Style", options: VARIANTS, default: "inset" },
    { type: "boolean", name: "swipe", label: "Swipe actions", default: true },
    { type: "boolean", name: "selectable", label: "Edit mode", default: false },
    { type: "boolean", name: "disabled", label: "Disable Robotaxi", default: false },
  ],
  code: (v) => `import { useState } from "react";
import { List, ListAction, ListItem, ListStatus, ListThumbnail, Switch } from "@nactech/sfui";
import { CarTaxiFront, CircleAlert, Pin, Repeat, Snowflake, Trash2 } from "lucide-react";

${v.selectable ? "const [selected, setSelected] = useState<string[]>([]);\n\n" : ""}<List${v.variant !== "inset" ? `\n  variant="${v.variant}"` : ""}
  title=${v.selectable ? "{`${selected.length} selected`}" : '"Recent"'}
  action={<ListAction href="/recent">See All</ListAction>}${v.selectable ? "\n  selectable\n  selectedValues={selected}\n  onSelectedValuesChange={setSelected}" : ""}
>
  <ListItem
    value="chilly"
    leading={<ListThumbnail tone="accent"><Snowflake /></ListThumbnail>}
    title="Mr. Chilly"
    subtitle="2.4 s · 60 fps · 512²"
    trailing="41 KB"
    chevron
    onClick={() => open("chilly")}${
      v.swipe
        ? `
    swipeActions={[
      { label: "Pin", icon: <Pin />, onSelect: () => pin("chilly") },
      { label: "Delete", icon: <Trash2 />, tone: "danger", onSelect: () => remove("chilly") },
    ]}`
        : ""
    }
  />
  <ListItem
    value="taxi"
    leading={<ListThumbnail tone="warning"><CarTaxiFront /></ListThumbnail>}
    title="Robotaxi"
    subtitle="Over budget · 3.0 s · 60 fps"
    trailing={<ListStatus icon={<CircleAlert />}>71 KB</ListStatus>}
    chevron
    onClick={() => open("taxi")}${v.disabled ? "\n    disabled" : ""}
  />
  <ListItem
    leading={<ListThumbnail tone="positive"><Repeat /></ListThumbnail>}
    title="Loop playback"
    trailing={<Switch aria-label="Loop playback" defaultChecked />}
  />
</List>`,

  overview: {
    intro: (
      <>
        A list is a titled section of rows. Each row has a leading thumbnail, a title with one or two lines of detail, and
        a trailing slot for a value, a status pill, a switch or a small button. Rows can be links or buttons as a whole,
        reveal capsule actions when swiped left, and switch to an edit mode with selection circles. One component, three
        styles: <strong>segmented</strong> cells for feeds, <strong>flat</strong> rows on the canvas for media, and an{" "}
        <strong>inset</strong> group for settings.
      </>
    ),
    whenToUse: [
      "Collections the user browses and opens: recent exports, sticker packs, members.",
      "Settings: a titled inset group of switches and values.",
      "Quick per-row actions (Pin, Delete) with `swipeActions`; bulk actions with edit mode (`selectable`).",
    ],
    whenNotToUse: [
      "A grid of visual items where the image is the content — use a grid of cards.",
      "Data with many comparable columns — use a table.",
      "A short set of choices in a form — use Radio or Checkbox.",
      "A list of actions on one object — use Menu.",
    ],
  },

  variants: [
    {
      name: "Segmented",
      description: "Every row is its own surface cell with 2px gaps; the group rounds the outer corners. Pressing morphs the cell. For feeds of independent items.",
      render: () => <Stickers variant="segmented" />,
    },
    {
      name: "Flat on canvas",
      description: "Rows sit directly on the canvas between full-width hairlines, with larger 3.25 rem media. A rounded highlight appears only on press. For media.",
      render: () => <Stickers variant="flat" />,
    },
    {
      name: "Inset group",
      description: "Rows inside one surface with a rim; hairlines start after the media. The default. For settings and short related sets.",
      render: () => <Stickers variant="inset" />,
    },
    {
      name: "Row types",
      description: "Media (value + chevron), Status (tonal pill), Control (Switch), Action (small Button), Two-line (`meta`).",
      render: () => (
        <List variant="inset" listLabel="Row types" style={{ width: "min(28rem, 100%)" }}>
          <ListItem leading={thumb(STICKERS[0])} title="Mr. Chilly" subtitle="Media" trailing="41 KB" chevron onClick={noop} />
          <ListItem leading={thumb(STICKERS[1])} title="Robotaxi" subtitle="Status" trailing={trailingOf(STICKERS[1])} chevron onClick={noop} />
          <ListItem
            leading={
              <ListThumbnail tone="positive">
                <Repeat />
              </ListThumbnail>
            }
            title="Loop playback"
            subtitle="Control"
            trailing={<Switch aria-label="Loop playback" defaultChecked />}
          />
          <ListItem
            leading={<ListThumbnail avatar>MF</ListThumbnail>}
            title="Mark Fomin"
            subtitle="Action"
            trailing={
              <Button variant="secondary" size="s" leadingIcon={<Share />}>
                Share
              </Button>
            }
          />
          <ListItem
            leading={thumb(STICKERS[2])}
            title="Painted Ladies"
            meta={STICKERS[2].meta}
            trailing={
              <Button variant="ghost" size="s" iconOnly aria-label="More">
                <Ellipsis />
              </Button>
            }
          />
        </List>
      ),
    },
    {
      name: "Edit mode",
      description: "`selectable`: rows with a `value` get a selection circle and toggle as a whole; chevrons hide, swipe turns off.",
      render: () => <Stickers variant="segmented" selectable defaultSelectedValues={["chilly", "ladies"]} title="2 selected" />,
    },
    {
      name: "Swipe actions",
      description: "Drag a row left (touch or mouse) to reveal Pin and Delete. From the keyboard, Tab past the row to reach them.",
      render: () => <Stickers variant="flat" />,
    },
    {
      name: "Disabled rows",
      description: "Opaque disabled colours, no press, no swipe, not selectable. Disable the trailing control too.",
      render: () => (
        <List variant="inset" listLabel="Disabled rows" style={{ width: "min(28rem, 100%)" }}>
          <ListItem leading={thumb(STICKERS[1])} title="Robotaxi" subtitle="Exporting…" trailing="71 KB" chevron onClick={noop} disabled />
          <ListItem
            leading={
              <ListThumbnail tone="positive">
                <Repeat />
              </ListThumbnail>
            }
            title="Loop playback"
            subtitle="Not available for drafts"
            trailing={<Switch aria-label="Loop playback" defaultChecked disabled />}
            disabled
          />
        </List>
      ),
    },
  ],

  platforms: {
    intro: (
      <>
        List is shared: one implementation on iOS, Android and the web. Swipe works with touch, pen and mouse drag; hover
        highlights appear only with a fine pointer. Shown once as a settings group, its most common use on phones.
      </>
    ),
    Demo: SettingsFrame,
  },

  usage: {
    guidelines: [
      "Which style? Segmented for feeds of independent items the user opens one by one (recent exports, messages). Flat for media-led content on the canvas, where the thumbnail matters (sticker packs). Inset for settings and short related sets of controls.",
      "Use one style per screen. Mixing a segmented feed and an inset settings group on one screen is fine when they are separate sections with their own titles.",
      "A row does one thing: either the whole row opens something (`onClick` / `href`, with a chevron if it navigates), or its trailing control acts. Don’t make a row with a Switch clickable.",
      "One trailing element per row — a value, a status pill, a switch or a small button.",
      "Status pills are for exceptions (“over budget”), not for every row. Put their meaning in text, not only in colour.",
      "Swipe actions are shortcuts: two at most, the destructive one last (`tone: \"danger\"`). Anything a swipe does must also be reachable another way, e.g. from the row’s screen or a Menu.",
      "Edit mode: give selectable rows a `value`, show the count in the title and pair the list with SelectionBar or SelectionToolbar for the bulk actions. A ListAction (Select / Done) toggles it.",
    ],
    dos: [
      {
        kind: "do",
        title: "Inset group for settings",
        caption: "Switches in the trailing slot, the row itself stays still.",
        render: () => <Settings />,
      },
      {
        kind: "dont",
        title: "Don’t give a row two jobs",
        caption: "A chevron row with a switch: does a tap open it or flip it?",
        render: () => (
          <List variant="inset" listLabel="Playback" style={{ width: "min(26rem, 100%)" }}>
            <ListItem
              leading={
                <ListThumbnail tone="positive">
                  <Repeat />
                </ListThumbnail>
              }
              title="Loop playback"
              subtitle="Applies to all stickers"
              trailing={<Switch aria-label="Loop playback" defaultChecked />}
              chevron
              onClick={noop}
            />
          </List>
        ),
      },
      {
        kind: "do",
        title: "Flag the exception",
        caption: "One pill draws the eye to the sticker that needs work.",
        render: () => (
          <List variant="segmented" listLabel="Recent" style={{ width: "min(26rem, 100%)" }}>
            {STICKERS.slice(0, 2).map((s) => (
              <ListItem key={s.value} leading={thumb(s)} title={s.title} subtitle={s.subtitle} trailing={trailingOf(s)} chevron onClick={noop} />
            ))}
          </List>
        ),
      },
      {
        kind: "dont",
        title: "Don’t put a pill on every row",
        caption: "When everything is a status, nothing stands out.",
        render: () => (
          <List variant="segmented" listLabel="Recent" style={{ width: "min(26rem, 100%)" }}>
            {STICKERS.slice(0, 2).map((s) => (
              <ListItem
                key={s.value}
                leading={thumb(s)}
                title={s.title}
                subtitle={s.subtitle}
                trailing={<ListStatus tone={s.overBudget ? "danger" : "positive"} dot>{s.size}</ListStatus>}
                chevron
                onClick={noop}
              />
            ))}
          </List>
        ),
      },
      {
        kind: "do",
        title: "Use `meta` for a longer description",
        caption: "Two wrapped lines, then it clamps.",
        render: () => (
          <List variant="flat" listLabel="Drafts" style={{ width: "min(26rem, 100%)" }}>
            <ListItem leading={thumb(STICKERS[2])} title="Painted Ladies" meta={STICKERS[2].meta} chevron onClick={noop} />
          </List>
        ),
      },
      {
        kind: "dont",
        title: "Don’t cram prose into the subtitle",
        caption: "`subtitle` is one line — the rest is cut off.",
        render: () => (
          <List variant="flat" listLabel="Drafts" style={{ width: "min(26rem, 100%)" }}>
            <ListItem leading={thumb(STICKERS[2])} title="Painted Ladies" subtitle={STICKERS[2].meta} chevron onClick={noop} />
          </List>
        ),
      },
    ],
    writing: [
      "Section titles are short nouns: “Recent”, “Playback”, “Members”.",
      "Row titles name the thing (“Mr. Chilly”), not the action (“Open Mr. Chilly”).",
      "Subtitles carry facts separated by a middle dot: “3.0 s · 60 fps”.",
      "Trailing values are short and unit-bearing (“41 KB”, “On”) — they render in mono.",
      "Swipe labels are one verb: Pin, Delete, Archive.",
    ],
  },

  accessibility: {
    intro: (
      <>
        List renders a <code>&lt;section&gt;</code> labelled by its title and a <code>&lt;ul role="list"&gt;</code> of{" "}
        <code>&lt;li&gt;</code> rows. A row’s action is a real <code>&lt;button&gt;</code> or <code>&lt;a&gt;</code>{" "}
        wrapping the title and described by the subtitle, so screen readers hear “Mr. Chilly, button, 2.4 s · 60 fps”.
        Swipe actions are real buttons in the tab order — nothing in a list needs a gesture.
      </>
    ),
    roles: [
      { element: "List", role: "<section> + aria-labelledby", notes: "Named by the title heading (`headingLevel`, default h2)." },
      { element: "Group", role: "list (<ul role=\"list\">)", notes: "Labelled by the title, or by `listLabel` when there is no title." },
      { element: "Row action", role: "button / link", notes: "The title becomes a <button> (`onClick`) or <a> (`href`); aria-describedby points at the subtitle / meta. A disabled link gets role=\"link\" + aria-disabled." },
      { element: "Edit-mode selection", role: "checkbox (native)", notes: "aria-labelledby the row title, aria-describedby the subtitle. The circle is decorative." },
      { element: "Swipe actions", role: "group of buttons", notes: "role=\"group\" labelled by the row title; each capsule is a <button> named by its `label`." },
      { element: "ListThumbnail", role: "aria-hidden=\"true\"", notes: "Decorative unless it has `alt` (image) or `aria-label`." },
      { element: "ListStatus", role: "text", notes: "Its icon / dot is hidden and colour is not announced — make the pill text or the subtitle say what is wrong (“over budget”)." },
      { element: "ListAction", role: "button / link", notes: "A link with `href`, otherwise a button." },
    ],
    keyboard: [
      { keys: ["Tab"], action: "Row by row: the row’s action, then its trailing control, then its swipe actions. Focusing a swipe action slides the row open." },
      { keys: ["Enter"], action: "Activates the row’s link or button, a swipe action or the header action." },
      { keys: ["Space"], action: "Activates a row button or swipe action; in edit mode toggles the row’s selection." },
      { keys: ["Esc"], action: "Closes an open row; from a swipe action, focus returns to the row’s own action." },
      { keys: ["Shift", "Tab"], action: "Moves back; leaving the row closes it." },
    ],
    focus: [
      "Keyboard focus on a row’s action or selection checkbox rings the whole row with an inset 2px focus ring; swipe capsules and ListAction have their own ring.",
      "After a swipe action runs from the keyboard, the row closes and focus returns to the row’s action (rows without one stay open with focus on the capsule).",
      "Rows clip with `overflow: clip`, so focusing a hidden capsule reveals it without scrolling the page sideways.",
      "One row is open per list. Tapping outside closes it; tapping an open row closes it instead of activating it.",
      "A drag never activates the row, and vertical drags are left to page scrolling.",
      "Trailing Switches and Buttons stay independent of the row action — give them their own `aria-label` (usually the row title).",
      "Disabled rows: the action is disabled, swipe actions are removed and the row can’t be selected.",
    ],
    reducedMotion: [
      "With “reduce motion” on, the row slide, the capsule reveal, the press morph and the selection circle switch instantly; the edit-mode circles appear without their entrance animation.",
      "A drag still follows the finger — it is direct manipulation, not animation.",
    ],
    screenReader: [
      "Edit mode is announced per row as “Mr. Chilly, checkbox, checked”. Update the title (“2 selected”) so the count is reachable.",
      "Swipe actions are announced as a group named after the row: “Mr. Chilly, group — Pin, button”.",
    ],
  },

  api: [
    {
      component: "List",
      description: "A titled section with a list of rows.",
      props: [
        { name: "variant", type: "\"segmented\" | \"flat\" | \"inset\"", default: "\"inset\"", description: "Cells with gaps (feeds), rows on the canvas (media), or one grouped surface (settings)." },
        { name: "title", type: "ReactNode", description: "Section title; labels the section and the list." },
        { name: "headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "2", description: "Heading level of `title`." },
        { name: "action", type: "ReactNode", description: "Trailing header action, usually a ListAction (See All, Select / Done)." },
        { name: "selectable", type: "boolean", default: "false", description: "Edit mode: rows with a `value` get a selection circle; chevrons hide; swipe is disabled." },
        { name: "selectedValues", type: "string[]", description: "Controlled selection (values of the selected rows)." },
        { name: "defaultSelectedValues", type: "string[]", default: "[]", description: "Initial selection when uncontrolled." },
        { name: "onSelectedValuesChange", type: "(values: string[]) => void", description: "Fires with the next selection on every toggle (click / Space)." },
        { name: "listLabel", type: "string", description: "Accessible name of the list when there is no `title`." },
        { name: "children", type: "ReactNode", description: "ListItem rows." },
        { name: "ref", type: "Ref<HTMLElement>", description: "The <section> element." },
      ],
      extends: "Also accepts native <section> attributes (className, style, aria-*…).",
    },
    {
      component: "ListItem",
      description: "One row.",
      props: [
        { name: "title", type: "ReactNode", required: true, description: "Row title; names the row action and its selection checkbox." },
        { name: "value", type: "string", description: "Identifies the row for edit-mode selection. Rows without one get no selection circle." },
        { name: "leading", type: "ReactNode", description: "Leading media: a ListThumbnail (icon, avatar or image) or any node." },
        { name: "subtitle", type: "ReactNode", description: "One meta line under the title (mono in Flat). Truncates." },
        { name: "meta", type: "ReactNode", description: "Two-line secondary text; wraps, clamped to two lines." },
        { name: "trailing", type: "ReactNode", description: "A string or number renders as the mono value (“41 KB”); otherwise pass ListStatus, Switch or a small Button — they stay independently clickable." },
        { name: "chevron", type: "boolean", default: "false", description: "Trailing chevron (hidden in edit mode)." },
        { name: "href", type: "string", description: "Makes the whole row a link." },
        { name: "target", type: "HTMLAttributeAnchorTarget", description: "Anchor target when `href` is set." },
        { name: "rel", type: "string", description: "Anchor rel when `href` is set." },
        { name: "onClick", type: "(event: MouseEvent<HTMLElement>) => void", description: "Makes the whole row a button." },
        { name: "disabled", type: "boolean", default: "false", description: "Opaque disabled row: no press, no swipe, not selectable. Disable trailing controls yourself." },
        { name: "swipeActions", type: "ListSwipeAction[]", description: "Capsule actions revealed by swiping left; real buttons in the tab order (see ListSwipeAction)." },
        { name: "ref", type: "Ref<HTMLLIElement>", description: "The <li> element." },
      ],
      extends: "Also accepts native <li> attributes (className, style, onKeyDown, onBlur…).",
    },
    {
      component: "ListSwipeAction",
      description: "One capsule in `swipeActions`.",
      props: [
        { name: "label", type: "string", required: true, description: "Visible capsule label and the button’s accessible name." },
        { name: "icon", type: "ReactNode", required: true, description: "Lucide icon (1 rem)." },
        { name: "tone", type: "\"default\" | \"danger\"", default: "\"default\"", description: "Amber capsule (Pin) or red capsule (Delete)." },
        { name: "onSelect", type: "() => void", required: true, description: "Runs the action; the row then closes. From the keyboard, focus returns to the row’s own action." },
      ],
    },
    {
      component: "ListThumbnail",
      props: [
        { name: "tone", type: "\"accent\" | \"positive\" | \"warning\" | \"danger\" | \"neutral\"", default: "\"accent\"", description: "Tonal fill and icon colour. Ignored for `avatar`." },
        { name: "avatar", type: "boolean", default: "false", description: "A circle with mono initials, whatever the list style." },
        { name: "src", type: "string", description: "Image thumbnail (cover)." },
        { name: "alt", type: "string", description: "Alt text for `src`. Without it the thumbnail is decorative." },
        { name: "children", type: "ReactNode", description: "A Lucide icon or initials. The shape follows the style: 2.75 rem circle (Segmented), 3.25 rem rounded (Flat), 2.75 rem rounded (Inset)." },
        { name: "ref", type: "Ref<HTMLSpanElement>", description: "The thumbnail element." },
      ],
      extends: "Also accepts native <span> attributes.",
    },
    {
      component: "ListStatus",
      description: "Trailing status pill: tonal fill, mono label.",
      props: [
        { name: "tone", type: "ListTone", default: "\"danger\"", description: "accent | positive | warning | danger | neutral." },
        { name: "icon", type: "ReactNode", description: "Leading 0.75 rem icon (e.g. CircleAlert)." },
        { name: "dot", type: "boolean", default: "false", description: "A small dot instead of an icon." },
        { name: "children", type: "ReactNode", description: "The status text." },
        { name: "ref", type: "Ref<HTMLSpanElement>", description: "The pill element." },
      ],
      extends: "Also accepts native <span> attributes (className, style…).",
    },
    {
      component: "ListAction",
      description: "Section header action in accent text.",
      props: [
        { name: "href", type: "string", description: "Renders a link when set, otherwise a <button type=\"button\">." },
        { name: "ref", type: "Ref<HTMLAnchorElement | HTMLButtonElement>", description: "The link or button." },
      ],
      extends: "Also accepts native <a> attributes (with href) or <button> attributes (without).",
    },
  ],

  storybook: {
    title: "Components/List",
    stories: [
      { name: "Playground", export: "Default" },
      { name: "Rest · three styles", export: "Rest" },
      { name: "Edit mode", export: "EditMode" },
      { name: "Swipe", export: "Swipe" },
      { name: "Disabled", export: "Disabled" },
    ],
  },
  related: ["selection-bar", "selection-toolbar", "switch"],
};

export default list;
