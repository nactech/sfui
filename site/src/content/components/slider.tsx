import { Gauge, Rabbit, Turtle } from "lucide-react";
import { Slider, type SliderSize, type SliderVariant } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column } from "../shared";

const fps = (v: number) => `${v} fps`;

function Demo({ values }: DemoProps) {
  const stepped = Boolean(values.stepped);
  return (
    <Column width="min(26rem, 100%)">
      <Slider
        label="Frame rate"
        min={0}
        max={120}
        defaultValue={stepped ? 30 : 60}
        steps={stepped ? [12, 24, 30, 60] : undefined}
        size={values.size as SliderSize}
        variant={values.variant as SliderVariant}
        disabled={Boolean(values.disabled)}
        formatValue={fps}
        icon={<Gauge />}
        leadingIcon={<Turtle />}
        trailingIcon={<Rabbit />}
      />
    </Column>
  );
}

function Preview() {
  return (
    <Column width="20rem">
      <Slider label="Frame rate" min={0} max={120} defaultValue={60} formatValue={fps} icon={<Gauge />} />
    </Column>
  );
}

// TODO(docs): Usage, Accessibility and a variants gallery.
const slider: ComponentDoc = {
  slug: "slider",
  name: "Slider",
  group: "Inputs",
  summary: "Pick a value from a range — the whole bar is the control on Android + Web, a glass lens on iOS.",
  docStatus: "stub",
  status: "stable",
  exports: ["Slider"],
  platformSplit: "split",
  Demo,
  Preview,
  controls: [
    { type: "boolean", name: "stepped", label: "Stepped", default: false },
    { type: "enum", name: "size", label: "Size (Android + Web)", options: ["m", "s"], default: "m" },
    { type: "enum", name: "variant", label: "Variant", options: ["solid", "glass"], default: "solid" },
    { type: "boolean", name: "disabled", label: "Disabled", default: false },
  ],
  overview: { intro: "Continuous or stepped (`steps`). Android + Web draw the value inside the fill; iOS uses a thin track with a lens that carries the value and grows while dragging." },
  api: [
    {
      component: "Slider",
      props: [
        { name: "value / defaultValue", type: "number", description: "Controlled or initial value (default: min)." },
        { name: "onValueChange", type: "(value: number) => void", description: "Every change (drag, click, keyboard)." },
        { name: "onValueCommit", type: "(value: number) => void", description: "Pointer up and every keyboard change." },
        { name: "min / max / step", type: "number", default: "0 / 100 / 1", description: "Range." },
        { name: "steps", type: "readonly number[]", description: "Discrete stepped mode, e.g. [12, 24, 30, 60]." },
        { name: "label", type: "string", description: "Accessible name (no visible label)." },
        { name: "variant", type: "\"solid\" | \"glass\"", default: "\"solid\"", description: "`glass` only over content." },
        { name: "size", type: "\"m\" | \"s\"", default: "\"m\"", description: "44 (touch) or 32 (dense web).", platform: "android-web" },
        { name: "icon", type: "ReactNode", description: "Icon inside the fill.", platform: "android-web" },
        { name: "maxLabel", type: "ReactNode | null", default: "max", description: "Trailing label in the empty track.", platform: "android-web" },
        { name: "leadingIcon / trailingIcon", type: "ReactNode", description: "Min / max icons around the track.", platform: "ios" },
        { name: "formatValue", type: "(value: number) => ReactNode", description: "Value text in the fill / lens." },
        { name: "getValueText", type: "(value: number) => string", description: "aria-valuetext." },
        { name: "showValue", type: "boolean", default: "true", description: "Draw the value text." },
        { name: "formatStep", type: "(step: number) => ReactNode", description: "Segment / tick label in stepped mode." },
        { name: "disabled", type: "boolean", description: "Opaque disabled look." },
        { name: "platform", type: "\"auto\" | \"ios\" | \"android\" | \"web\"", default: "ConfigProvider", description: "Force one implementation." },
      ],
    },
  ],
  storybook: { title: "Components/Slider" },
  related: ["scrubber"],
};

export default slider;
