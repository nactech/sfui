import { Switch } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column } from "../shared";

function Demo({ values }: DemoProps) {
  return (
    <Column gap={0.5} width="auto">
      <Switch label={String(values.label)} defaultChecked disabled={Boolean(values.disabled)} overContent={Boolean(values.overContent)} />
      <Switch label="Show frame numbers" disabled={Boolean(values.disabled)} overContent={Boolean(values.overContent)} />
    </Column>
  );
}

// TODO(docs): Usage, Accessibility and a variants gallery — see button.tsx / menu.tsx for the full page.
const switchDoc: ComponentDoc = {
  slug: "switch",
  name: "Switch",
  group: "Actions & selection",
  summary: "An on/off toggle that applies immediately, with an expressive knob and a glass track over content.",
  docStatus: "stub",
  status: "stable",
  exports: ["Switch"],
  platformSplit: "shared",
  Demo,
  controls: [
    { type: "text", name: "label", label: "Label", default: "Loop playback" },
    { type: "boolean", name: "disabled", label: "Disabled", default: false },
    { type: "boolean", name: "overContent", label: "Over content", default: false },
  ],
  overview: {
    intro: "A native checkbox with role=\"switch\" for settings that take effect immediately. Over photos and video the track turns to glass.",
  },
  api: [
    {
      component: "Switch",
      props: [
        { name: "checked", type: "boolean", description: "Controlled state." },
        { name: "defaultChecked", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Every user toggle (pointer, Space, label click)." },
        { name: "label", type: "ReactNode", description: "Visible label after the switch; wired as its accessible name." },
        { name: "overContent", type: "boolean", default: "false", description: "Glass track for switches over photos / video." },
        { name: "disabled", type: "boolean", description: "Opaque disabled look." },
        { name: "ref", type: "Ref<HTMLInputElement>", description: "The native <input type=\"checkbox\" role=\"switch\">." },
      ],
      extends: "Other native <input> attributes go to the input; className and style go to the label wrapper.",
    },
  ],
  storybook: { title: "Components/Switch" },
  related: ["checkbox", "list"],
};

export default switchDoc;
