import { Radio, RadioGroup, type RadioGroupOrientation } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";

function Demo({ values }: DemoProps) {
  return (
    <RadioGroup
      aria-label="Frame rate"
      defaultValue="60"
      orientation={values.orientation as RadioGroupOrientation}
      disabled={Boolean(values.disabled)}
    >
      <Radio value="24" label="24 fps" />
      <Radio value="30" label="30 fps" />
      <Radio value="60" label="60 fps" />
    </RadioGroup>
  );
}

// TODO(docs): Usage, Accessibility and a variants gallery.
const radio: ComponentDoc = {
  slug: "radio",
  name: "Radio",
  group: "Actions & selection",
  summary: "One choice from a short list, always inside a RadioGroup with a roving tab stop.",
  docStatus: "stub",
  status: "stable",
  exports: ["RadioGroup", "Radio"],
  platformSplit: "shared",
  source: "src/components/Radio",
  Demo,
  controls: [
    { type: "enum", name: "orientation", label: "Orientation", options: ["vertical", "horizontal"], default: "vertical" },
    { type: "boolean", name: "disabled", label: "Disabled", default: false },
  ],
  overview: { intro: "Native radios grouped by RadioGroup, which owns the name, the value and the arrow-key behaviour." },
  api: [
    {
      component: "RadioGroup",
      props: [
        { name: "value", type: "string", description: "Controlled selected value." },
        { name: "defaultValue", type: "string", description: "Initial value when uncontrolled." },
        { name: "onValueChange", type: "(value: string) => void", description: "Pointer, arrow keys or label click." },
        { name: "name", type: "string", default: "auto", description: "Native name shared by the radios." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables every radio." },
        { name: "orientation", type: "\"vertical\" | \"horizontal\"", default: "\"vertical\"", description: "Layout only; arrows work both ways." },
      ],
      extends: "Renders a role=\"radiogroup\" <div>; name it with aria-label or aria-labelledby.",
    },
    {
      component: "Radio",
      props: [
        { name: "value", type: "string", required: true, description: "Reported to RadioGroup.onValueChange." },
        { name: "label", type: "ReactNode", description: "Visible label; its accessible name." },
        { name: "disabled", type: "boolean", description: "Disables this radio." },
        { name: "ref", type: "Ref<HTMLInputElement>", description: "The native <input type=\"radio\">." },
      ],
    },
  ],
  storybook: { title: "Components/Radio" },
  related: ["segmented", "checkbox"],
};

export default radio;
