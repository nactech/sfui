import type React from "react";
import { useState } from "react";
import { Gauge, Rabbit, Sun, Turtle, Volume1, Volume2 } from "lucide-react";
import { Slider, usePlatform, type Platform, type SliderSize, type SliderVariant } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column } from "../shared";
import { photo } from "@site/lib/photos";

const STEPS = [12, 24, 30, 60] as const;
const fps = (v: number) => `${v} fps`;
const percent = (v: number) => `${v}%`;

/** Photo panel for the glass variant on the canvas stage. */
function PhotoPanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "1rem",
        width: "100%",
        minHeight: "8rem",
        padding: "1.5rem",
        boxSizing: "border-box",
        borderRadius: "var(--sf-radius-xl)",
        backgroundImage: photo,
        backgroundSize: "cover",
      }}
    >
      {children}
    </div>
  );
}

function Readout({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ alignSelf: "center", color: "var(--sf-fg-muted)", font: "400 0.75rem/1.4 var(--sf-font-mono)", letterSpacing: "0.04em" }}>
      {children}
    </span>
  );
}

function LiveSlider({ values }: DemoProps) {
  const platform = usePlatform();
  const ios = platform === "ios";
  const stepped = Boolean(values.stepped);
  const icons = Boolean(values.icons);
  const [value, setValue] = useState(stepped ? 30 : 60);
  const [committed, setCommitted] = useState(value);
  const slider = (
    <Slider
      label="Frame rate"
      min={0}
      max={120}
      steps={stepped ? STEPS : undefined}
      value={value}
      onValueChange={setValue}
      onValueCommit={setCommitted}
      size={values.size as SliderSize}
      variant={values.variant as SliderVariant}
      disabled={Boolean(values.disabled)}
      // The iOS lens carries a short number; the unit goes to aria-valuetext.
      formatValue={ios ? undefined : fps}
      getValueText={fps}
      icon={icons ? <Gauge /> : undefined}
      leadingIcon={icons ? <Turtle /> : undefined}
      trailingIcon={icons ? <Rabbit /> : undefined}
    />
  );
  return (
    <Column gap={1}>
      {values.variant === "glass" ? <PhotoPanel>{slider}</PhotoPanel> : slider}
      <Readout>
        value {fps(value)} · committed {fps(committed)}
      </Readout>
    </Column>
  );
}

/** `key` resets the local value when stepped mode toggles. */
function Demo({ values }: DemoProps) {
  return (
    <div style={{ width: "min(26rem, 100%)" }}>
      <LiveSlider key={String(values.stepped)} values={values} />
    </div>
  );
}

function PlatformDemo({ platform }: { platform: Platform }) {
  const ios = platform === "ios";
  return (
    <Column gap={1.5}>
      <Slider
        label="Frame rate"
        min={0}
        max={120}
        defaultValue={60}
        formatValue={ios ? undefined : fps}
        getValueText={fps}
        icon={<Gauge />}
        leadingIcon={<Turtle />}
        trailingIcon={<Rabbit />}
      />
      <Slider label="Frame rate, stepped" steps={STEPS} defaultValue={30} getValueText={fps} />
      <Slider label="Brightness" defaultValue={8} formatValue={percent} icon={<Sun />} />
    </Column>
  );
}

function Preview() {
  return (
    <Column width="20rem">
      <Slider label="Frame rate" min={0} max={120} defaultValue={60} formatValue={fps} icon={<Gauge />} platform="web" />
    </Column>
  );
}

/** A settings-group composition: a visible label and value above the iOS slider. */
function IOSSettingsRow() {
  const [value, setValue] = useState(60);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
        width: "100%",
        boxSizing: "border-box",
        padding: "0.875rem 1rem 0.625rem",
        border: "1px solid var(--sf-rim-default)",
        borderRadius: "var(--sf-radius-lg)",
        background: "var(--sf-surface-1)",
        font: "400 0.9375rem/normal var(--sf-font-ios)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "var(--sf-fg-muted)" }}>Frame rate</span>
        <span style={{ color: "var(--sf-fg-default)" }}>{fps(value)}</span>
      </div>
      <Slider
        platform="ios"
        label="Frame rate"
        max={120}
        value={value}
        onValueChange={setValue}
        getValueText={fps}
        leadingIcon={<Turtle />}
        trailingIcon={<Rabbit />}
      />
    </div>
  );
}

const W = "min(24rem, 100%)";

const slider: ComponentDoc = {
  slug: "slider",
  name: "Slider",
  group: "Inputs",
  summary: "Pick a value from a range — the whole bar is the control on Android + Web, a glass lens on iOS.",
  docStatus: "complete",
  status: "stable",
  exports: ["Slider"],
  platformSplit: "split",
  Demo,
  Preview,
  controls: [
    { type: "boolean", name: "stepped", label: "Stepped", default: false },
    { type: "boolean", name: "icons", label: "Icons", default: true },
    { type: "enum", name: "variant", label: "Variant", options: ["solid", "glass"], default: "solid" },
    { type: "enum", name: "size", label: "Size (Android + Web)", options: ["m", "s"], default: "m" },
    { type: "boolean", name: "disabled", label: "Disabled", default: false },
  ],
  code: (v) => {
    const attrs = [
      'label="Frame rate"',
      v.stepped ? "steps={[12, 24, 30, 60]}" : "min={0}\n  max={120}",
      "value={rate}",
      "onValueChange={setRate}",
      "onValueCommit={saveRate}",
      "formatValue={(v) => `${v} fps`}",
      "getValueText={(v) => `${v} fps`}",
      v.icons && "icon={<Gauge />}            // Android + Web: inside the fill",
      v.icons && "leadingIcon={<Turtle />}    // iOS: min / max icons",
      v.icons && "trailingIcon={<Rabbit />}",
      v.variant !== "solid" && `variant="${v.variant}"`,
      v.size !== "m" && `size="${v.size}"`,
      v.disabled && "disabled",
    ].filter(Boolean);
    const icons = v.icons ? '\nimport { Gauge, Rabbit, Turtle } from "lucide-react";' : "";
    return `import { Slider } from "@nactech/sfui";${icons}\n\n<Slider\n  ${attrs.join("\n  ")}\n/>`;
  },

  overview: {
    intro: (
      <>
        A slider picks one value from a range — continuous, or a few named steps. On Android and the web the whole bar is
        the control, in the style of Control Center: the accent fill is the handle, the value sits inside it, and you can
        grab it anywhere or tap to jump. On iOS a thin native track carries a glass lens with the value, which grows and
        magnifies the track while you drag. One API drives both.
      </>
    ),
    whenToUse: [
      "Settings where the exact number matters less than the feel: frame rate, brightness, volume, playback speed.",
      "`steps` for a handful of meaningful values (12 · 24 · 30 · 60 fps) drawn as segments or ticks.",
      "Live adjustments where the effect is visible while dragging; save in `onValueCommit`.",
      "`variant=\"glass\"` for a slider floating over a photo or video.",
    ],
    whenNotToUse: [
      "Seeking through media — use Scrubber.",
      "Exact values people know in advance (a year, a price) — use a text field.",
      "Two or three named options — use Segmented.",
      "On / off — use Switch.",
    ],
  },

  variants: [
    {
      name: "Continuous · Android + Web",
      description: "44 tall. The fill is the handle: an icon at the start, the value next to the grip, the max in the empty track.",
      render: () => (
        <Column width={W}>
          <Slider platform="web" label="Frame rate" max={120} defaultValue={60} formatValue={fps} icon={<Gauge />} />
        </Column>
      ),
    },
    {
      name: "Low value · Android + Web",
      description: "When the value no longer fits inside the fill, it moves out into the empty track.",
      render: () => (
        <Column width={W}>
          <Slider platform="web" label="Brightness" defaultValue={8} formatValue={percent} icon={<Sun />} maxLabel={null} />
        </Column>
      ),
    },
    {
      name: "Stepped · Android + Web",
      description: "`steps`: connected segments with labels; the current one gets a dot.",
      render: () => (
        <Column width={W}>
          <Slider platform="web" label="Frame rate" steps={STEPS} defaultValue={30} getValueText={fps} />
        </Column>
      ),
    },
    {
      name: "Size S · Web",
      description: "32 tall for dense pointer layouts — toolbars, inspectors, desktop panels.",
      render: () => (
        <Column width={W}>
          <Slider platform="web" size="s" label="Volume" defaultValue={40} formatValue={percent} icon={<Volume2 />} maxLabel={null} />
          <Slider platform="web" size="s" label="Frame rate" steps={STEPS} defaultValue={24} getValueText={fps} />
        </Column>
      ),
    },
    {
      name: "Glass · Android + Web",
      description: "`variant=\"glass\"`: the bar itself turns to glass over content.",
      stage: "photo",
      render: () => (
        <Column width={W}>
          <Slider platform="web" variant="glass" label="Frame rate" max={120} defaultValue={60} formatValue={fps} icon={<Gauge />} />
          <Slider platform="web" variant="glass" label="Frame rate, stepped" steps={STEPS} defaultValue={30} />
        </Column>
      ),
    },
    {
      name: "iOS",
      description: "A 6px track and a glass lens carrying a short value. Press and drag: the lens grows to 68 × 44.",
      render: () => (
        <Column width={W}>
          <Slider platform="ios" label="Frame rate" max={120} defaultValue={60} getValueText={fps} />
        </Column>
      ),
    },
    {
      name: "iOS · Stepped",
      description: "Evenly spaced ticks with labels; the lens snaps to the nearest one.",
      render: () => (
        <Column width={W}>
          <Slider platform="ios" label="Frame rate" steps={STEPS} defaultValue={30} getValueText={fps} />
        </Column>
      ),
    },
    {
      name: "iOS · In a settings row",
      description: "`leadingIcon` / `trailingIcon` mark the min and max ends; the visible label and value live in the row.",
      render: () => (
        <Column width={W}>
          <IOSSettingsRow />
        </Column>
      ),
    },
    {
      name: "iOS · Over content",
      description: "`variant=\"glass\"` puts the slider in a 60-tall glass panel.",
      stage: "photo",
      render: () => (
        <Column width={W}>
          <Slider platform="ios" variant="glass" label="Volume" defaultValue={40} getValueText={percent} leadingIcon={<Volume1 />} trailingIcon={<Volume2 />} />
        </Column>
      ),
    },
    {
      name: "Disabled",
      description: "Opaque disabled tokens on both implementations — never opacity.",
      render: () => (
        <Column width={W}>
          <Slider platform="web" label="Frame rate" max={120} defaultValue={60} formatValue={fps} icon={<Gauge />} disabled />
          <Slider platform="ios" label="Frame rate" max={120} defaultValue={60} disabled />
        </Column>
      ),
    },
  ],

  platforms: {
    intro: (
      <>
        Slider has two implementations behind one API. Android and the web draw the whole bar as the control; iOS draws
        the native-feeling track with a glass lens. Platform-only props are ignored elsewhere — <code>size</code>,{" "}
        <code>icon</code> and <code>maxLabel</code> only affect Android + Web, <code>leadingIcon</code> and{" "}
        <code>trailingIcon</code> only iOS — so you can pass both sets and let ConfigProvider choose.
      </>
    ),
    Demo: PlatformDemo,
    notes: {
      ios: [
        "Thin 6px track, accent up to the lens. The lens (52 × 32) carries the value and grows to 68 × 44 while dragging, magnifying the track under it.",
        "Keep the lens text short — a number. Put the unit in `getValueText` and in a visible row label.",
        "Stepped: evenly spaced ticks with labels; the lens glides and snaps between them.",
        "One size; `leadingIcon` / `trailingIcon` are decorative and do nothing when tapped. No hover.",
        "Focus (iPad keyboard): the ring is drawn on the lens.",
      ],
      android: [
        "The 44 bar is the control: grab the fill’s edge to drag without a jump, tap anywhere else to jump there.",
        "While dragging the bar stretches 44 → 52 without moving the layout and the grip grows.",
        "The value sits inside the fill next to the grip and moves out when it no longer fits; the max sits in the empty track.",
        "Stepped: connected segments with labels.",
      ],
      web: [
        "Same bar as Android, plus hover: the rim brightens and the grip grows.",
        "A 2px focus ring around the whole bar on keyboard focus.",
        "`size=\"s\"` (32 tall) for dense pointer layouts.",
      ],
    },
  },

  usage: {
    guidelines: [
      "Always pass `label` — the slider has no visible label of its own. Put a visible label next to it in the layout (a settings row, a caption).",
      "Give `getValueText` the value with its unit (“60 fps”) so screen readers hear more than a bare number.",
      "Do expensive work (saving, re-encoding) in `onValueCommit`; it fires on release and on every key press. Use `onValueChange` for live previews.",
      "Use `steps` for up to about six values that mean something on their own. Labels have to fit each segment or tick.",
      "Keep `formatValue` short — on iOS it is drawn inside the lens.",
      "Use `variant=\"glass\"` only over photos or video; on the canvas use the default solid bar.",
    ],
    dos: [
      {
        kind: "do",
        title: "A few meaningful steps",
        caption: "Every segment is a choice people recognise.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <Slider platform="web" label="Frame rate" steps={STEPS} defaultValue={30} />
          </Column>
        ),
      },
      {
        kind: "dont",
        title: "Don’t step through a dozen values",
        caption: "Labels get crowded and targets get tiny — use a continuous slider.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <Slider platform="web" label="Frame rate" steps={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]} defaultValue={60} />
          </Column>
        ),
      },
      {
        kind: "do",
        title: "Short value in the iOS lens",
        caption: "The unit lives in the row label and in `getValueText`.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <Slider platform="ios" label="Frame rate" max={120} defaultValue={60} getValueText={fps} />
          </Column>
        ),
      },
      {
        kind: "dont",
        title: "Don’t write sentences in the lens",
        caption: "The lens stretches and hides the track.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <Slider platform="ios" label="Frame rate" max={120} defaultValue={60} formatValue={(v) => `${v} frames per second`} />
          </Column>
        ),
      },
      {
        kind: "do",
        title: "Glass over content",
        caption: "The bar blurs the photo behind it.",
        stage: "photo",
        render: () => (
          <Column width="min(20rem, 100%)">
            <Slider platform="web" variant="glass" label="Volume" defaultValue={40} formatValue={percent} icon={<Volume2 />} maxLabel={null} />
          </Column>
        ),
      },
      {
        kind: "dont",
        title: "Don’t use the solid bar over photos",
        caption: "The opaque track cuts a hole in the image.",
        stage: "photo",
        render: () => (
          <Column width="min(20rem, 100%)">
            <Slider platform="web" label="Volume" defaultValue={40} formatValue={percent} icon={<Volume2 />} maxLabel={null} />
          </Column>
        ),
      },
    ],
    writing: [
      "The accessible `label` names the setting, not the gesture: “Frame rate”, not “Drag to set frame rate”.",
      "Value text is a number with a short unit: “60 fps”, “40%”, “1.5×”. On iOS drop the unit from the lens.",
      "Step labels are bare numbers or one short word each.",
    ],
  },

  accessibility: {
    intro: (
      <>
        Both implementations render one focusable element with <code>role="slider"</code> that owns the value; the fill,
        lens, ticks and labels inside are <code>aria-hidden</code>. Name it with <code>label</code>.
      </>
    ),
    roles: [
      { element: "Root", role: "slider", notes: "`tabindex=\"0\"`, `aria-orientation=\"horizontal\"`." },
      { element: "Name", role: "aria-label", notes: "From `label` (or your own `aria-label`)." },
      { element: "Value", role: "aria-valuemin / aria-valuemax / aria-valuenow", notes: "Stepped: min and max are the first and last step." },
      { element: "Value text", role: "aria-valuetext", notes: "`getValueText(value)`, else `formatValue(value)` when it returns a string or number." },
      { element: "Disabled", role: "aria-disabled=\"true\"", notes: "Also removed from the tab order." },
      { element: "Fill, lens, ticks, icons", role: "aria-hidden", notes: "Decorative; the value is on the root." },
    ],
    keyboard: [
      { keys: ["←", "↓"], action: "Decrease by `step` (stepped: one step)." },
      { keys: ["→", "↑"], action: "Increase by `step` (stepped: one step)." },
      { keys: ["Page Down", "Page Up"], action: "Decrease / increase by a tenth of the range, rounded to `step` (stepped: one step)." },
      { keys: ["Home", "End"], action: "Minimum / maximum." },
    ],
    focus: [
      "Android + Web: a 2px focus ring around the bar, on keyboard focus only (`:focus-visible`).",
      "iOS: the ring is drawn on the lens instead of its rim.",
      "Pressing the slider focuses it without a ring, so arrow keys work right after a click.",
      "A key press that changes the value calls both `onValueChange` and `onValueCommit`; a press or drag commits once, on release.",
    ],
    reducedMotion: [
      "The fill, value and lens glides (220 ms) and the springy stretch of the bar, grip and lens are switched off — the value moves instantly.",
      "Dragging still follows the pointer 1:1.",
    ],
    screenReader: [
      "Without `getValueText` a custom `formatValue` that returns an element gives no value text — pass `getValueText` then.",
      "On iOS the lens shows a bare number; `getValueText` (“60 fps”) is what VoiceOver reads.",
    ],
  },

  api: [
    {
      component: "Slider",
      description: "One component, two implementations, chosen by `platform` or the nearest ConfigProvider.",
      props: [
        { name: "value", type: "number", description: "Controlled value." },
        { name: "defaultValue", type: "number", default: "min", description: "Initial value when uncontrolled (stepped: snapped to the nearest step, default the first)." },
        { name: "onValueChange", type: "(value: number) => void", description: "Every change: drag, click, keyboard." },
        { name: "onValueCommit", type: "(value: number) => void", description: "Pointer up after a drag, and every keyboard change." },
        { name: "min", type: "number", default: "0", description: "Range start (continuous mode)." },
        { name: "max", type: "number", default: "100", description: "Range end (continuous mode)." },
        { name: "step", type: "number", default: "1", description: "Value granularity; decimals are kept (`0.1`)." },
        { name: "steps", type: "readonly number[]", description: "Stepped mode: the allowed values, sorted and de-duplicated. Overrides `min`, `max` and `step`." },
        { name: "label", type: "string", description: "Accessible name (`aria-label`). There is no visible label." },
        { name: "variant", type: '"solid" | "glass"', default: '"solid"', description: "`glass` only over content: the bar turns to glass (Android + Web) or sits in a glass panel (iOS)." },
        { name: "size", type: '"m" | "s"', default: '"m"', description: "44 (touch) or 32 (dense web).", platform: "android-web" },
        { name: "icon", type: "ReactNode", description: "Lucide icon at the start of the fill.", platform: "android-web" },
        { name: "maxLabel", type: "ReactNode | null", default: "max", description: "Trailing label in the empty track; `null` hides it. Continuous mode only.", platform: "android-web" },
        { name: "leadingIcon", type: "ReactNode", description: "Decorative icon before the track (min end, e.g. Turtle).", platform: "ios" },
        { name: "trailingIcon", type: "ReactNode", description: "Decorative icon after the track (max end, e.g. Rabbit).", platform: "ios" },
        { name: "formatValue", type: "(value: number) => ReactNode", default: "the number", description: "Value text in the fill (Android + Web) or the lens (iOS)." },
        { name: "getValueText", type: "(value: number) => string", description: "`aria-valuetext`. Defaults to `formatValue(value)` when that is a string or number." },
        { name: "showValue", type: "boolean", default: "true", description: "Draw the value text." },
        { name: "formatStep", type: "(step: number) => ReactNode", default: "the number", description: "Segment (Android + Web) or tick (iOS) label in stepped mode." },
        { name: "disabled", type: "boolean", default: "false", description: "Opaque disabled look; `aria-disabled`, out of the tab order." },
        { name: "platform", type: '"auto" | "ios" | "android" | "web"', default: "ConfigProvider", description: "Force one implementation." },
        { name: "ref", type: "Ref<HTMLDivElement>", description: "The `role=\"slider\"` root." },
      ],
      extends: "Also accepts native <div> attributes (className, style, aria-*, pointer and key handlers), applied to the root.",
    },
  ],

  storybook: {
    title: "Components/Slider",
    stories: [
      { name: "Matrix", export: "Matrix" },
      { name: "Over content", export: "OverContent" },
      { name: "Controlled", export: "Controlled" },
      { name: "iOS · Matrix", export: "IOSMatrix" },
      { name: "iOS · In a settings row", export: "IOSSettingsRow" },
    ],
  },
  related: ["scrubber", "segmented", "inset-form"],
};

export default slider;
