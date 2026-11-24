import { Image, Smile, Sticker } from "lucide-react";
import { Segmented, type SegmentedSize } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";

function Demo({ values }: DemoProps) {
  return (
    <Segmented
      aria-label="Content"
      style={{ width: "min(22rem, 100%)" }}
      size={values.size as SegmentedSize}
      defaultValue="stickers"
      disabled={Boolean(values.disabled)}
      overContent={Boolean(values.overContent)}
      options={[
        { value: "stickers", label: "Stickers", icon: values.icons ? <Sticker /> : undefined },
        { value: "emoji", label: "Emoji", icon: values.icons ? <Smile /> : undefined },
        { value: "masks", label: "Masks", icon: values.icons ? <Image /> : undefined },
      ]}
    />
  );
}

// TODO(docs): Usage, Accessibility and a variants gallery.
const segmented: ComponentDoc = {
  slug: "segmented",
  name: "Segmented",
  group: "Actions & selection",
  summary: "Connected segments that switch between two to five views of the same content.",
  docStatus: "stub",
  status: "stable",
  exports: ["Segmented"],
  platformSplit: "shared",
  Demo,
  controls: [
    { type: "enum", name: "size", label: "Size", options: ["s", "m", "l"], default: "m" },
    { type: "boolean", name: "icons", label: "Icons", default: false },
    { type: "boolean", name: "disabled", label: "Disabled", default: false },
    { type: "boolean", name: "overContent", label: "Over content", default: false },
  ],
  overview: { intro: "Segments morph on press; the selected one shows a check. Over photos the segments switch to glass." },
  api: [
    {
      component: "Segmented",
      props: [
        { name: "options", type: "SegmentedOption[]", required: true, description: "`{ value, label, icon?, disabled? }` — the icon is replaced by the check while selected." },
        { name: "value", type: "string", description: "Controlled selected value." },
        { name: "defaultValue", type: "string", description: "Initial value when uncontrolled." },
        { name: "onValueChange", type: "(value: string) => void", description: "Pointer, Space / Enter or arrow keys." },
        { name: "size", type: "\"s\" | \"m\" | \"l\"", default: "\"m\"", description: "Height 32 / 40 / 48." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables every segment." },
        { name: "overContent", type: "boolean", default: "false", description: "Glass segments over photos / video." },
        { name: "ref", type: "Ref<HTMLDivElement>", description: "The root element." },
      ],
      extends: "Name it with aria-label / aria-labelledby. Other <div> attributes go to the root.",
    },
  ],
  storybook: { title: "Components/Segmented" },
  related: ["tabbar", "radio"],
};

export default segmented;
