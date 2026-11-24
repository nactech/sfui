import { useState } from "react";
import { Download } from "lucide-react";
import { Button, Checkbox, type CheckboxState } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column, Row } from "../shared";

const PACKS = ["Mr. Chilly", "Robotaxi", "Painted Ladies"];
const START: Record<string, boolean[]> = {
  none: [false, false, false],
  some: [true, false, true],
  all: [true, true, true],
};

const parentState = (checked: boolean[]): CheckboxState => (checked.every(Boolean) ? true : checked.some(Boolean) ? "mixed" : false);

function SelectAll({ start, disabled }: { start: string; disabled: boolean }) {
  const [checked, setChecked] = useState<boolean[]>(START[start] ?? START.some);
  const count = checked.filter(Boolean).length;
  return (
    <Column gap={0.75} width="auto">
      <div role="group" aria-label="Stickers to export" style={{ display: "flex", flexDirection: "column" }}>
        <Checkbox
          label="All stickers"
          checked={parentState(checked)}
          disabled={disabled}
          onCheckedChange={(next) => setChecked(checked.map(() => next))}
        />
        <div style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column" }}>
          {PACKS.map((name, i) => (
            <Checkbox
              key={name}
              label={name}
              checked={checked[i]}
              disabled={disabled}
              onCheckedChange={(next) => setChecked(checked.map((c, j) => (j === i ? next : c)))}
            />
          ))}
        </div>
      </div>
      <div style={{ paddingLeft: "0.625rem" }}>
        <Button size="s" leadingIcon={<Download />} disabled={disabled || count === 0}>
          {count === 0 ? "Export" : `Export ${count}`}
        </Button>
      </div>
    </Column>
  );
}

/** `key` restarts the local state when the starting selection changes. */
function Demo({ values }: DemoProps) {
  const start = String(values.start);
  return <SelectAll key={start} start={start} disabled={Boolean(values.disabled)} />;
}

function Preview() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Checkbox label="All stickers" defaultChecked="mixed" />
      <div style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column" }}>
        <Checkbox label="Mr. Chilly" defaultChecked />
        <Checkbox label="Robotaxi" />
      </div>
    </div>
  );
}

const checkbox: ComponentDoc = {
  slug: "checkbox",
  name: "Checkbox",
  group: "Actions & selection",
  summary: "Multiple choice from a set, with a mixed state for select-all.",
  docStatus: "complete",
  status: "stable",
  exports: ["Checkbox"],
  platformSplit: "shared",
  Demo,
  Preview,
  controls: [
    { type: "enum", name: "start", label: "Start with", options: ["none", "some", "all"], default: "some" },
    { type: "boolean", name: "disabled", label: "Disabled", default: false },
  ],
  code: (v) => `import { useState } from "react";
import { Checkbox, type CheckboxState } from "@nactech/sfui";

const packs = ["Mr. Chilly", "Robotaxi", "Painted Ladies"];
const [checked, setChecked] = useState(${JSON.stringify(START[String(v.start)] ?? START.some)});
const all: CheckboxState = checked.every(Boolean) ? true : checked.some(Boolean) ? "mixed" : false;

<div role="group" aria-label="Stickers to export">
  <Checkbox
    label="All stickers"
    checked={all}
    onCheckedChange={(next) => setChecked(checked.map(() => next))}${v.disabled ? "\n    disabled" : ""}
  />
  {packs.map((name, i) => (
    <Checkbox
      key={name}
      label={name}
      checked={checked[i]}
      onCheckedChange={(next) => setChecked(checked.map((c, j) => (j === i ? next : c)))}${v.disabled ? "\n      disabled" : ""}
    />
  ))}
</div>`,

  overview: {
    intro: (
      <>
        Checkboxes pick any number of options from a set — zero, one or all of them — and the choice counts when a later
        action commits it. The box is a rounded square when off and morphs into an accent circle with a check when on; a
        parent checkbox shows a dash (<code>"mixed"</code>) while only some of its children are checked. Every checkbox
        sits in a 2.5 rem touch target.
      </>
    ),
    whenToUse: [
      "Several independent options committed by a button: formats to include before Export.",
      "A parent “select all” over a short set, with the mixed state in between.",
      "A single opt-in that needs confirming: “Include sound” before Export, an agreement before Continue.",
    ],
    whenNotToUse: [
      "A setting that applies immediately — use Switch.",
      "Exactly one option from a set — use Radio or Segmented.",
      "Selecting rows of a List — use List edit mode (`selectable`), which draws its own selection circles.",
      "Over photos or video — Checkbox has no glass treatment; put it on a surface.",
    ],
  },

  variants: [
    {
      name: "States",
      description: "Off (rounded square), on (accent circle with a check), mixed (accent circle with a dash). Press to see the squish.",
      render: () => (
        <Row gap={1.5}>
          <Checkbox label="Off" />
          <Checkbox label="On" defaultChecked />
          <Checkbox label="Mixed" defaultChecked="mixed" />
        </Row>
      ),
    },
    {
      name: "Group",
      description: "A labelled stack of independent options. Each row is a 2.5 rem target, so rows stack with no extra gap.",
      render: () => (
        <div role="group" aria-label="Formats" style={{ display: "flex", flexDirection: "column" }}>
          <Checkbox label="Include .tgs" defaultChecked />
          <Checkbox label="Include .webm" defaultChecked />
          <Checkbox label="Include .gif preview" />
        </div>
      ),
    },
    {
      name: "Select all",
      description: "A parent drives `\"mixed\"` while some — not all — children are checked. Activating a mixed parent checks everything.",
      render: () => <SelectAll start="some" disabled={false} />,
    },
    {
      name: "Without a visible label",
      description: "In tables and toolbars the box can stand alone; it still needs an `aria-label`.",
      render: () => (
        <Row gap={1}>
          <Checkbox aria-label="Select Mr. Chilly" defaultChecked />
          <Checkbox aria-label="Select Robotaxi" />
          <Checkbox aria-label="Select all stickers" defaultChecked="mixed" />
        </Row>
      ),
    },
    {
      name: "Disabled",
      description: "Opaque disabled fill and hairline, marks in the disabled foreground. The shape keeps its state.",
      render: () => (
        <Row gap={1.5}>
          <Checkbox label="Off" disabled />
          <Checkbox label="On" defaultChecked disabled />
          <Checkbox label="Mixed" defaultChecked="mixed" disabled />
        </Row>
      ),
    },
  ],

  platforms: {
    intro: (
      <>
        Checkbox is shared: one implementation on iOS, Android and the web, with the same 2.5 rem target and shape morph
        everywhere.
      </>
    ),
  },

  usage: {
    guidelines: [
      "Checkbox or Switch? A checkbox records a choice that something else commits (Export, Save, Continue). A switch changes the app the moment it flips.",
      "Checkbox or Radio? Checkboxes allow any number of choices, including none. If exactly one must be chosen, it’s a radio group.",
      "Give a set of checkboxes a name: wrap it in `<fieldset>` with a `<legend>`, or a `role=\"group\"` with `aria-label`.",
      "Use `\"mixed\"` only on a parent whose children are partly checked — compute it from the children, never set it as a value of its own.",
      "Stack checkboxes vertically. A horizontal row is fine for two or three very short labels.",
      "Keep checkboxes off photos and video; place them on the canvas or inside a surface.",
    ],
    dos: [
      {
        kind: "do",
        title: "Use checkboxes for choices a button commits",
        caption: "Nothing happens until Export.",
        render: () => (
          <Column gap={0.5} width="auto">
            <div role="group" aria-label="Formats" style={{ display: "flex", flexDirection: "column" }}>
              <Checkbox label="Include .tgs" defaultChecked />
              <Checkbox label="Include .webm" />
            </div>
            <div style={{ paddingLeft: "0.625rem" }}>
              <Button size="s" leadingIcon={<Download />}>
                Export
              </Button>
            </div>
          </Column>
        ),
      },
      {
        kind: "dont",
        title: "Don’t use a checkbox for an instant setting",
        caption: "Loop playback changes the player at once — that’s a switch.",
        render: () => (
          <div role="group" aria-label="Playback" style={{ display: "flex", flexDirection: "column" }}>
            <Checkbox label="Loop playback" defaultChecked />
            <Checkbox label="Haptics" />
          </div>
        ),
      },
      {
        kind: "do",
        title: "Show “mixed” on a partly checked parent",
        caption: "The dash says “some of these”.",
        render: () => <SelectAll start="some" disabled={false} />,
      },
      {
        kind: "dont",
        title: "Don’t use “mixed” as a third answer",
        caption: "A lone checkbox is yes or no — “maybe” needs radios.",
        render: () => <Checkbox label="Notify me about new packs" defaultChecked="mixed" />,
      },
      {
        kind: "do",
        title: "Phrase options positively",
        caption: "Checked means “yes, include it”.",
        render: () => <Checkbox label="Include sound" defaultChecked />,
      },
      {
        kind: "dont",
        title: "Don’t make people decode negatives",
        caption: "Unchecking “don’t exclude” is a riddle.",
        render: () => <Checkbox label="Don’t exclude sound" />,
      },
    ],
    writing: [
      "Each label names one option in a few words, sentence case, no trailing punctuation: “Include .webm”.",
      "Write labels so that checked means “yes”. Avoid “Don’t…” and “Disable…”.",
      "Parent labels summarise the children: “All stickers”, not “Select all of the stickers below”.",
      "Name the group by what it decides: “Formats”, “Stickers to export”.",
    ],
  },

  accessibility: {
    intro: (
      <>
        Checkbox renders a native <code>&lt;input type="checkbox"&gt;</code> over a 2.5 rem target inside a{" "}
        <code>&lt;label&gt;</code>. The mixed state sets both the DOM <code>indeterminate</code> property and{" "}
        <code>aria-checked="mixed"</code>, so every screen reader announces it.
      </>
    ),
    roles: [
      { element: "<input type=\"checkbox\">", role: "checkbox (native)", notes: "Checked state is native; `\"mixed\"` adds aria-checked=\"mixed\" and indeterminate." },
      { element: "<label> wrapper", role: "label (native)", notes: "The `label` text names the checkbox; clicking it toggles." },
      { element: "Box, check, dash, state layer", role: "aria-hidden=\"true\"", notes: "Decorative." },
      { element: "Your group wrapper", role: "group / fieldset", notes: "Not built in — name related checkboxes with `<fieldset>` + `<legend>` or `role=\"group\"` + `aria-label`." },
    ],
    keyboard: [
      { keys: ["Tab"], action: "Moves focus to the next checkbox — every checkbox is its own tab stop." },
      { keys: ["Space"], action: "Toggles it. On a mixed checkbox, checks it." },
    ],
    focus: [
      "Keyboard focus draws a 2px focus ring on the 2.5 rem circle around the box (`:focus-visible` only).",
      "The target is 2.5 × 2.5 rem plus the label text, so it stays comfortable on touch.",
      "Without a visible `label`, pass `aria-label` or `aria-labelledby`.",
      "`disabled` uses the native attribute: the checkbox leaves the tab order and ignores clicks.",
    ],
    reducedMotion: [
      "With “reduce motion” on, the square-to-circle morph, the press squish, the state layer and the check / dash scale switch instantly.",
    ],
    screenReader: [
      "Announced as “All stickers, checkbox, mixed” (or “partially checked”, depending on the reader).",
      "`onCheckedChange` reports `true` or `false` only — never `\"mixed\"`. Recompute the parent’s state from its children.",
    ],
  },

  api: [
    {
      component: "Checkbox",
      props: [
        { name: "checked", type: "boolean | \"mixed\"", description: "Controlled state. `\"mixed\"` draws the dash and sets aria-checked=\"mixed\"." },
        { name: "defaultChecked", type: "boolean | \"mixed\"", default: "false", description: "Initial state when uncontrolled." },
        { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Fires with the next state on every user toggle. Activating a mixed checkbox reports `true`." },
        { name: "label", type: "ReactNode", description: "Visible label after the target; wired as its accessible name." },
        { name: "disabled", type: "boolean", default: "false", description: "Opaque disabled look; removes the checkbox from the tab order." },
        { name: "onChange", type: "ChangeEventHandler<HTMLInputElement>", description: "Native change event, called before `onCheckedChange`." },
        { name: "ref", type: "Ref<HTMLInputElement>", description: "The native `<input type=\"checkbox\">` (object and callback refs)." },
      ],
      extends: "Other native <input> attributes (name, value, required, aria-*…) go to the input; className and style go to the <label> wrapper.",
    },
    {
      component: "CheckboxState",
      description: "Exported type of `checked` / `defaultChecked`.",
      props: [{ name: "CheckboxState", type: "boolean | \"mixed\"", description: "Off, on, or partly checked." }],
    },
  ],

  storybook: {
    title: "Components/Checkbox",
    stories: [
      { name: "Playground", export: "Playground" },
      { name: "States", export: "States" },
      { name: "Select all", export: "SelectAll" },
      { name: "Disabled", export: "Disabled" },
    ],
  },
  related: ["switch", "radio", "list"],
};

export default checkbox;
