import type React from "react";
import { useState } from "react";
import { Captions, Download, Repeat, Vibrate } from "lucide-react";
import { Button, Checkbox, List, ListItem, ListThumbnail, Switch } from "@nactech/sfui";
import { nightBeach } from "@site/lib/photos";
import type { ComponentDoc, DemoProps } from "../types";
import { Column, Row } from "../shared";

/** A dark photo strip (night beach) for the live demo: labels over media need a dark backdrop to stay legible. */
function OverPhoto({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        width: "min(24rem, 100%)",
        padding: "1.5rem",
        borderRadius: "var(--sf-radius-xl)",
        backgroundImage: nightBeach,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {children}
    </div>
  );
}

const onPhoto: React.CSSProperties = { textShadow: "0 1px 2px #000a", fontWeight: 500 };

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <span aria-live="polite" style={{ color: "var(--sf-fg-muted)", font: "500 0.75rem/1.4 var(--sf-font-mono)", letterSpacing: "0.04em" }}>
      {children}
    </span>
  );
}

function Demo({ values }: DemoProps) {
  const [loop, setLoop] = useState(true);
  const [frames, setFrames] = useState(false);
  const disabled = Boolean(values.disabled);
  const over = Boolean(values.overContent);
  const switches = (
    <>
      <Switch
        label={String(values.label)}
        checked={loop}
        onCheckedChange={setLoop}
        disabled={disabled}
        overContent={over}
        style={over ? onPhoto : undefined}
      />
      <Switch
        label="Show frame numbers"
        checked={frames}
        onCheckedChange={setFrames}
        disabled={disabled}
        overContent={over}
        style={over ? onPhoto : undefined}
      />
    </>
  );
  return (
    <Column gap={1} width="auto">
      {over ? (
        <OverPhoto>
          <Column gap={0.75} width="auto">
            {switches}
          </Column>
        </OverPhoto>
      ) : (
        <Column gap={0.75} width="auto">
          {switches}
        </Column>
      )}
      <Caption>
        loop: {loop ? "on" : "off"} · frames: {frames ? "on" : "off"}
      </Caption>
    </Column>
  );
}

function Preview() {
  return (
    <Column gap={0.75} width="auto">
      <Switch label="Loop playback" defaultChecked />
      <Switch label="Show frame numbers" />
    </Column>
  );
}

/** A settings group — the most common home of a switch. */
function SettingsGroup() {
  return (
    <List variant="inset" title="Playback" headingLevel={3} style={{ width: "min(24rem, 100%)" }}>
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
        subtitle="On supported phones"
        trailing={<Switch aria-label="Haptics" defaultChecked />}
      />
    </List>
  );
}

const switchDoc: ComponentDoc = {
  slug: "switch",
  name: "Switch",
  group: "Actions & selection",
  summary: "An on/off toggle that applies immediately, with an expressive knob and a glass track over content.",
  docStatus: "complete",
  status: "stable",
  exports: ["Switch"],
  platformSplit: "shared",
  Demo,
  Preview,
  controls: [
    { type: "text", name: "label", label: "Label", default: "Loop playback" },
    { type: "boolean", name: "overContent", label: "Over content", default: false },
    { type: "boolean", name: "disabled", label: "Disabled", default: false },
  ],
  code: (v) => {
    const attrs = [`label="${v.label}"`, "checked={loop}", "onCheckedChange={setLoop}", v.overContent && "overContent", v.disabled && "disabled"].filter(Boolean);
    return `import { useState } from "react";
import { Switch } from "@nactech/sfui";

const [loop, setLoop] = useState(true);

<Switch
  ${attrs.join("\n  ")}
/>`;
  },

  overview: {
    intro: (
      <>
        A switch turns one setting on or off, and the change takes effect the moment it flips — no Save button. The knob
        grows from a dot into a capsule with a check when it turns on, becomes a glass lens while you hold it, and springs
        into place on release. Over photos and video, <code>overContent</code> turns the track to glass so it reads as
        part of the layer above the media.
      </>
    ),
    whenToUse: [
      "A single setting that applies immediately: Loop playback, Haptics, Show frame numbers.",
      "Settings rows in an inset List — the switch sits in the trailing slot.",
      "A toggle floating over media (a player overlay) — with `overContent`.",
    ],
    whenNotToUse: [
      "Choices that are committed later with a Save or Export button — use Checkbox.",
      "Picking several items from a list — use Checkbox, or List edit mode.",
      "Choosing one of several options — use Radio or Segmented.",
      "Starting an action (Export, Delete) — use Button.",
    ],
  },

  variants: [
    {
      name: "Off and on",
      description: "Off: a small dot on the solid track. On: an accent track and a capsule knob with a check. Press and hold to see the glass lens.",
      render: () => (
        <Row gap={1.5}>
          <Switch label="Off" />
          <Switch label="On" defaultChecked />
        </Row>
      ),
    },
    {
      name: "In a settings row",
      description: "The usual home: the trailing slot of an inset List row. Give it the row title as its `aria-label`.",
      render: () => <SettingsGroup />,
    },
    {
      name: "Over content",
      description: "`overContent`: the track turns to glass and refracts the photo; on, it takes the accent glass.",
      stage: "photo",
      render: () => (
        <Row gap={1.5}>
          <Switch aria-label="Loop playback (off)" overContent />
          <Switch aria-label="Loop playback (on)" overContent defaultChecked />
        </Row>
      ),
    },
    {
      name: "Disabled",
      description: "Opaque disabled fill and hairline, knob in the disabled foreground. The shape keeps its state.",
      render: () => (
        <Row gap={1.5}>
          <Switch label="Off" disabled />
          <Switch label="On" defaultChecked disabled />
        </Row>
      ),
    },
    {
      name: "Disabled over content",
      description: "Disabled drops the glass and stays opaque, so an unavailable switch never vanishes into the image.",
      stage: "photo",
      render: () => (
        <Row gap={1.5}>
          <Switch aria-label="Unavailable (off)" overContent disabled />
          <Switch aria-label="Unavailable (on)" overContent defaultChecked disabled />
        </Row>
      ),
    },
  ],

  platforms: {
    intro: (
      <>
        Switch is shared: the same Expressive × Glass switch on iOS, Android and the web — it does not imitate the system
        toggle of each platform. Shown once, in its most common context, a settings group.
      </>
    ),
    Demo: SettingsGroup,
  },

  usage: {
    guidelines: [
      "Switch or Checkbox? A switch acts now: flipping it changes the app immediately. A checkbox records a choice that a later button commits (Export, Save), or selects items from a set.",
      "Label the setting, not the state. The switch itself shows on or off — the label never changes when it flips.",
      "Phrase settings positively (“Show frame numbers”), so on means “yes”.",
      "If a change takes time (a download, a sync), flip the switch at once and show progress next to it — don’t make the user wait on the knob.",
      "Over photos and video, set `overContent`. On the canvas and inside surfaces, keep the solid track.",
      "Keep the visible label or, in a list row, an `aria-label` matching the row title — a switch with no name is a guessing game for screen-reader users.",
    ],
    dos: [
      {
        kind: "do",
        title: "Use a switch for settings that apply now",
        caption: "Flip it and playback loops — nothing else to press.",
        render: () => (
          <Column gap={0.75} width="auto">
            <Switch label="Loop playback" defaultChecked />
            <Switch label="Haptics" />
          </Column>
        ),
      },
      {
        kind: "dont",
        title: "Don’t pair switches with a commit button",
        caption: "If the choice only counts after Export, it’s a checkbox.",
        render: () => (
          <Column gap={0.75} width="auto">
            <Switch label="Include .tgs" defaultChecked />
            <Switch label="Include .webm" />
            <Button size="s" leadingIcon={<Download />}>
              Export
            </Button>
          </Column>
        ),
      },
      {
        kind: "do",
        title: "Checkboxes for choices committed later",
        caption: "Pick the formats, then Export.",
        render: () => (
          <Column gap={0.25} width="auto">
            <Checkbox label="Include .tgs" defaultChecked />
            <Checkbox label="Include .webm" />
            <div style={{ padding: "0.5rem 0 0 0.625rem" }}>
              <Button size="s" leadingIcon={<Download />}>
                Export
              </Button>
            </div>
          </Column>
        ),
      },
      {
        kind: "dont",
        title: "Don’t name both states in the label",
        caption: "“On / off” is what the switch already shows.",
        render: () => <Switch label="Loop playback on/off?" defaultChecked />,
      },
      {
        kind: "do",
        title: "Glass track over media",
        caption: "`overContent` lets the photo show through.",
        stage: "photo",
        render: () => <Switch aria-label="Loop playback" overContent defaultChecked />,
      },
      {
        kind: "dont",
        title: "Don’t drop a solid track on a photo",
        caption: "The off track reads as a hole punched in the image.",
        stage: "photo",
        render: () => (
          <Row gap={1.5}>
            <Switch aria-label="Loop playback (off)" />
            <Switch aria-label="Loop playback (on)" defaultChecked />
          </Row>
        ),
      },
    ],
    writing: [
      "Name the setting in one to four words, sentence case, no punctuation: “Loop playback”.",
      "Describe what is on when the switch is on. Avoid negatives like “Disable haptics”.",
      "Put extra explanation in the row subtitle (“Applies to all stickers”), not in the label.",
      "Never use “on/off” or a question in the label.",
    ],
  },

  accessibility: {
    intro: (
      <>
        Switch renders a native <code>&lt;input type="checkbox" role="switch"&gt;</code> stretched over the track, inside
        a <code>&lt;label&gt;</code>. Screen readers announce it as a switch that is on or off, and the native input
        brings focus, keyboard and form submission for free.
      </>
    ),
    roles: [
      { element: "<input type=\"checkbox\">", role: "switch", notes: "Checked state is native — announced as on / off." },
      { element: "<label> wrapper", role: "label (native)", notes: "Wraps the input and the `label` text, so the text names the switch and clicking it toggles." },
      { element: "Track, knob, check", role: "aria-hidden=\"true\"", notes: "Decorative." },
    ],
    keyboard: [
      { keys: ["Tab"], action: "Moves focus to the switch." },
      { keys: ["Space"], action: "Toggles it (native checkbox behaviour; Enter does not toggle)." },
    ],
    focus: [
      "Keyboard focus draws a 2px focus-ring outline around the track (`:focus-visible` only — no ring on click).",
      "The whole label row is the hit target: the 3.5 × 2 rem track plus the label text.",
      "Without a visible `label`, pass `aria-label` (in list rows, the row title) or `aria-labelledby`.",
      "`disabled` uses the native attribute: the switch leaves the tab order and ignores clicks.",
    ],
    reducedMotion: [
      "With “reduce motion” on, the track colour, the knob’s travel and growth and the check’s scale all switch instantly — the states themselves stay the same.",
    ],
    screenReader: [
      "Announced as “Loop playback, switch, on”. Don’t repeat the state in the label.",
      "`onCheckedChange` fires for every user toggle — pointer, Space or a click on the label.",
    ],
  },

  api: [
    {
      component: "Switch",
      props: [
        { name: "checked", type: "boolean", description: "Controlled state." },
        { name: "defaultChecked", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Fires with the next state on every user toggle (pointer, Space, label click)." },
        { name: "label", type: "ReactNode", description: "Visible label after the switch; wired as its accessible name." },
        { name: "overContent", type: "boolean", default: "false", description: "Glass track for switches over photos and video." },
        { name: "disabled", type: "boolean", default: "false", description: "Opaque disabled look; removes the switch from the tab order." },
        { name: "onChange", type: "ChangeEventHandler<HTMLInputElement>", description: "Native change event, called before `onCheckedChange`." },
        { name: "ref", type: "Ref<HTMLInputElement>", description: "The native `<input type=\"checkbox\" role=\"switch\">`." },
      ],
      extends: "Other native <input> attributes (name, value, aria-*, onFocus…) go to the input; className and style go to the <label> wrapper.",
    },
  ],

  storybook: {
    title: "Components/Switch",
    stories: [
      { name: "Playground", export: "Playground" },
      { name: "States", export: "States" },
      { name: "Over content", export: "OverContent" },
      { name: "Selection controls · Rest", export: "SelectionRest" },
    ],
  },
  related: ["checkbox", "list", "segmented"],
};

export default switchDoc;
