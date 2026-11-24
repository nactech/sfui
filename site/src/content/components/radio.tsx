import type React from "react";
import { useId, useState } from "react";
import { Radio, RadioGroup, Segmented, Switch, type RadioGroupOrientation } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column } from "../shared";

const QUALITY = [
  { value: "auto", label: "Auto" },
  { value: "high", label: "High · 60 fps" },
  { value: "medium", label: "Medium · 30 fps" },
  { value: "low", label: "Low · 24 fps" },
];

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <span aria-live="polite" style={{ color: "var(--sf-fg-muted)", font: "500 0.75rem/1.4 var(--sf-font-mono)", letterSpacing: "0.04em" }}>
      {children}
    </span>
  );
}

function GroupLabel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <span id={id} style={{ color: "var(--sf-fg-default)", font: "600 0.875rem/1.4 var(--sf-font-sans)" }}>
      {children}
    </span>
  );
}

function Demo({ values }: DemoProps) {
  const [quality, setQuality] = useState("high");
  const labelId = useId();
  return (
    <Column gap={0.5} width="auto">
      <GroupLabel id={labelId}>Export quality</GroupLabel>
      <RadioGroup
        aria-labelledby={labelId}
        value={quality}
        onValueChange={setQuality}
        orientation={values.orientation as RadioGroupOrientation}
        disabled={Boolean(values.disabled)}
      >
        {QUALITY.map((q) => (
          <Radio key={q.value} value={q.value} label={q.label} disabled={Boolean(values.unavailable) && q.value === "low"} />
        ))}
      </RadioGroup>
      <Caption>value: {quality}</Caption>
    </Column>
  );
}

function Preview() {
  return (
    <RadioGroup aria-label="Frame rate" defaultValue="60">
      <Radio value="24" label="24 fps" />
      <Radio value="30" label="30 fps" />
      <Radio value="60" label="60 fps" />
    </RadioGroup>
  );
}

const radio: ComponentDoc = {
  slug: "radio",
  name: "Radio",
  group: "Actions & selection",
  summary: "One choice from a short list, always inside a RadioGroup with a roving tab stop.",
  docStatus: "complete",
  status: "stable",
  exports: ["RadioGroup", "Radio"],
  platformSplit: "shared",
  source: "src/components/Radio",
  Demo,
  Preview,
  controls: [
    { type: "enum", name: "orientation", label: "Orientation", options: ["vertical", "horizontal"], default: "vertical" },
    { type: "boolean", name: "unavailable", label: "Disable “Low”", default: false },
    { type: "boolean", name: "disabled", label: "Disable group", default: false },
  ],
  code: (v) => `import { useState } from "react";
import { Radio, RadioGroup } from "@nactech/sfui";

const [quality, setQuality] = useState("high");

<RadioGroup
  aria-label="Export quality"
  value={quality}
  onValueChange={setQuality}${v.orientation !== "vertical" ? `\n  orientation="${v.orientation}"` : ""}${v.disabled ? "\n  disabled" : ""}
>
  <Radio value="auto" label="Auto" />
  <Radio value="high" label="High · 60 fps" />
  <Radio value="medium" label="Medium · 30 fps" />
  <Radio value="low" label="Low · 24 fps"${v.unavailable ? " disabled" : ""} />
</RadioGroup>`,

  overview: {
    intro: (
      <>
        Radios choose exactly one option from a short list where every option deserves its own line — a label long enough
        to read, maybe a detail after it. <code>RadioGroup</code> owns the value, the shared native <code>name</code> and
        the keyboard: the group is a single tab stop and the arrow keys move the selection. The ring fills with accent
        and a dot springs in; pressing grows the dot inside a state-layer circle.
      </>
    ),
    whenToUse: [
      "One option from two to about six, when the labels need room: export quality, frame rate, file format.",
      "Forms and settings pages where the options should all be visible at once for comparison.",
      "A choice with a recommended default you can preselect.",
    ],
    whenNotToUse: [
      "Switching the view of the content on screen — use Segmented.",
      "Moving between top-level destinations — use TabBar.",
      "A single on/off setting — use Switch (or a single Checkbox in a form).",
      "Several options at once — use Checkbox.",
      "Long lists (more than about seven) — use a SelectField.",
    ],
  },

  variants: [
    {
      name: "Vertical",
      description: "The default: one option per line, each in a 2.5 rem target. Best for labels of different lengths.",
      render: () => (
        <RadioGroup aria-label="Export quality" defaultValue="high">
          {QUALITY.slice(0, 3).map((q) => (
            <Radio key={q.value} value={q.value} label={q.label} />
          ))}
        </RadioGroup>
      ),
    },
    {
      name: "Horizontal",
      description: "`orientation=\"horizontal\"` for two to four short labels; wraps when it runs out of room.",
      render: () => (
        <RadioGroup aria-label="Frame rate" defaultValue="60" orientation="horizontal">
          <Radio value="24" label="24 fps" />
          <Radio value="30" label="30 fps" />
          <Radio value="60" label="60 fps" />
        </RadioGroup>
      ),
    },
    {
      name: "States",
      description: "Off: a 1.5px ring. On: accent fill with a dot. Press to see the state layer and the dot grow.",
      render: () => (
        <RadioGroup aria-label="States" defaultValue="on" orientation="horizontal">
          <Radio value="off" label="Off" />
          <Radio value="on" label="On" />
        </RadioGroup>
      ),
    },
    {
      name: "Unavailable option",
      description: "A disabled radio stays in place with the opaque disabled look; arrow keys skip it.",
      render: () => (
        <RadioGroup aria-label="Export quality" defaultValue="high">
          <Radio value="auto" label="Auto" />
          <Radio value="high" label="High · 60 fps" />
          <Radio value="low" label="Low · 24 fps (not for this pack)" disabled />
        </RadioGroup>
      ),
    },
    {
      name: "Disabled group",
      description: "`disabled` on RadioGroup disables every radio and sets aria-disabled on the group.",
      render: () => (
        <RadioGroup aria-label="Export quality" defaultValue="high" disabled>
          {QUALITY.slice(0, 3).map((q) => (
            <Radio key={q.value} value={q.value} label={q.label} />
          ))}
        </RadioGroup>
      ),
    },
  ],

  platforms: {
    intro: (
      <>
        Radio and RadioGroup are shared: one implementation on iOS, Android and the web, with the same target size,
        keyboard model and motion.
      </>
    ),
  },

  usage: {
    guidelines: [
      "Radio, Segmented or TabBar? Radios pick a value in a form or settings page. Segmented switches the view of the content right next to it. TabBar moves between top-level destinations of the app.",
      "Always put radios inside a RadioGroup and give the group a name — `aria-label` or `aria-labelledby` pointing at a visible heading.",
      "Preselect a sensible default when one exists (usually the recommended or current option).",
      "Order options logically: by size, quality or frequency — not alphabetically by accident.",
      "Keep an unavailable option visible and disabled when its absence would confuse; say why in its label.",
      "Use the vertical layout unless the labels are very short and there are no more than four.",
    ],
    dos: [
      {
        kind: "do",
        title: "Radios for a choice inside a form",
        caption: "Every option visible, the recommended one preselected.",
        render: () => (
          <RadioGroup aria-label="Export quality" defaultValue="high">
            {QUALITY.slice(0, 3).map((q) => (
              <Radio key={q.value} value={q.value} label={q.label} />
            ))}
          </RadioGroup>
        ),
      },
      {
        kind: "dont",
        title: "Don’t use radios to switch views",
        caption: "Changing what’s on screen is Segmented’s job.",
        render: () => (
          <RadioGroup aria-label="Show" defaultValue="all" orientation="horizontal">
            <Radio value="all" label="All" />
            <Radio value="emoji" label="Emoji" />
            <Radio value="masks" label="Masks" />
          </RadioGroup>
        ),
      },
      {
        kind: "do",
        title: "Segmented for views of the same content",
        caption: "It sits right above the content it switches.",
        render: () => (
          <Segmented
            aria-label="Show"
            defaultValue="all"
            style={{ width: "min(20rem, 100%)" }}
            options={[
              { value: "all", label: "All" },
              { value: "emoji", label: "Emoji" },
              { value: "masks", label: "Masks" },
            ]}
          />
        ),
      },
      {
        kind: "dont",
        title: "Don’t build on/off from two radios",
        caption: "A single setting is a switch.",
        render: () => (
          <RadioGroup aria-label="Loop playback" defaultValue="on" orientation="horizontal">
            <Radio value="on" label="Loop on" />
            <Radio value="off" label="Loop off" />
          </RadioGroup>
        ),
      },
      {
        kind: "do",
        title: "One switch for one setting",
        caption: "Same meaning, half the reading.",
        render: () => <Switch label="Loop playback" defaultChecked />,
      },
      {
        kind: "dont",
        title: "Don’t squeeze long labels into a row",
        caption: "Horizontal radios wrap into a ragged grid.",
        render: () => (
          <div style={{ width: "min(18rem, 100%)" }}>
            <RadioGroup aria-label="Export quality" defaultValue="high" orientation="horizontal">
              {QUALITY.map((q) => (
                <Radio key={q.value} value={q.value} label={q.label} />
              ))}
            </RadioGroup>
          </div>
        ),
      },
    ],
    writing: [
      "Labels are parallel nouns or short phrases, sentence case: “High · 60 fps”, “Medium · 30 fps”.",
      "Put the distinguishing detail after a middle dot rather than in a second sentence.",
      "Name the group by the question it answers: “Export quality”, “Frame rate”.",
      "Avoid “Other” unless it opens a field to type the value.",
    ],
  },

  accessibility: {
    intro: (
      <>
        RadioGroup renders a <code>role="radiogroup"</code> around native <code>&lt;input type="radio"&gt;</code>{" "}
        elements that share one <code>name</code>. It keeps a roving tab stop — only the checked radio (or the first
        enabled one) is in the tab order — and implements arrow-key selection with wrapping and Home / End.
      </>
    ),
    roles: [
      { element: "RadioGroup", role: "radiogroup", notes: "aria-orientation from `orientation`; aria-disabled when `disabled`. Name it with aria-label / aria-labelledby." },
      { element: "Radio <input>", role: "radio (native)", notes: "Shares the group’s `name`; tabindex is 0 on the active radio, -1 on the rest." },
      { element: "<label> wrapper", role: "label (native)", notes: "The `label` text names the radio; clicking it selects." },
      { element: "Ring, dot, state layer", role: "aria-hidden=\"true\"", notes: "Decorative." },
    ],
    keyboard: [
      { keys: ["Tab"], action: "Enters the group on the checked radio (or the first enabled one), then leaves it." },
      { keys: ["↓", "→"], action: "Next enabled radio — moves focus and selects it. Wraps from last to first." },
      { keys: ["↑", "←"], action: "Previous enabled radio — moves focus and selects it. Wraps from first to last." },
      { keys: ["Home", "End"], action: "First / last enabled radio." },
      { keys: ["Space"], action: "Selects the focused radio if it isn’t selected yet." },
    ],
    focus: [
      "Keyboard focus draws a 2px focus ring on the 2.5 rem circle around the radio (`:focus-visible` only).",
      "Arrow keys work in both directions in either orientation; disabled radios are skipped.",
      "A disabled radio, or every radio of a disabled group, leaves the tab order (native `disabled`).",
      "A Radio used outside a RadioGroup is a plain native radio without the roving tab stop — always group them.",
    ],
    reducedMotion: ["With “reduce motion” on, the fill, the state layer and the dot’s spring switch instantly."],
    screenReader: [
      "Announced as “High · 60 fps, radio button, checked, 2 of 4” inside the named group.",
      "`onValueChange` fires once per new value — re-selecting the current radio reports nothing.",
    ],
  },

  api: [
    {
      component: "RadioGroup",
      description: "Owns the value, the shared name and the keyboard. Children are Radio elements (anywhere inside).",
      props: [
        { name: "value", type: "string", description: "Controlled selected value." },
        { name: "defaultValue", type: "string", description: "Initial value when uncontrolled. Without one, nothing is selected." },
        { name: "onValueChange", type: "(value: string) => void", description: "Fires with the newly selected value (pointer, arrow keys, label click)." },
        { name: "name", type: "string", default: "auto (useId)", description: "Native `name` shared by every radio — set it for form submission." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables every radio; sets aria-disabled on the group." },
        { name: "orientation", type: "\"vertical\" | \"horizontal\"", default: "\"vertical\"", description: "Layout and aria-orientation. Arrow keys work in both directions either way." },
        { name: "children", type: "ReactNode", description: "The Radio elements." },
        { name: "ref", type: "Ref<HTMLDivElement>", description: "The radiogroup element." },
      ],
      extends: "Also accepts native <div> attributes (aria-label, aria-labelledby, className, style, onKeyDown…).",
    },
    {
      component: "Radio",
      props: [
        { name: "value", type: "string", required: true, description: "The value reported to `RadioGroup.onValueChange`." },
        { name: "label", type: "ReactNode", description: "Visible label after the 2.5 rem target; its accessible name." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables this radio (the group’s `disabled` wins)." },
        { name: "onChange", type: "ChangeEventHandler<HTMLInputElement>", description: "Native change event, called before the group is updated." },
        { name: "ref", type: "Ref<HTMLInputElement>", description: "The native `<input type=\"radio\">`." },
      ],
      extends: "Other native <input> attributes go to the input; className and style go to the <label> wrapper. Inside a group, name and checked come from RadioGroup.",
    },
  ],

  storybook: {
    title: "Components/Radio",
    stories: [
      { name: "Playground", export: "Playground" },
      { name: "States", export: "States" },
      { name: "Horizontal", export: "Horizontal" },
      { name: "Disabled", export: "Disabled" },
    ],
  },
  related: ["segmented", "checkbox", "switch"],
};

export default radio;
