import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import Checkbox, { type CheckboxState } from "./index";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: { label: "Select", defaultChecked: false, disabled: false },
  argTypes: {
    defaultChecked: { control: "inline-radio", options: [false, true, "mixed"] },
  },
} satisfies Meta<typeof Checkbox>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Off / On / Mixed (C/D1). Press for the squish + state layer (C/D2); Tab for the ring (C/D3). */
export const States: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem" }}>
      <Checkbox aria-label="Off" />
      <Checkbox aria-label="On" defaultChecked />
      <Checkbox aria-label="Mixed" defaultChecked="mixed" />
    </div>
  ),
};

/** C/D4 Disabled — opaque fill + hairline, marks in disabled/fg. */
export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem" }}>
      <Checkbox aria-label="Off" disabled />
      <Checkbox aria-label="On" defaultChecked disabled />
      <Checkbox aria-label="Mixed" defaultChecked="mixed" disabled />
    </div>
  ),
};

const files = ["sticker-pack.tgs", "mr-chilly.tgs", "robotaxi.tgs"];

/** Select-all parent driving `"mixed"` (the way List / Header use it). */
export const SelectAll: Story = {
  render: function SelectAllStory() {
    const [selected, setSelected] = useState<string[]>([files[0]]);
    const all: CheckboxState =
      selected.length === 0 ? false : selected.length === files.length ? true : "mixed";
    return (
      <div style={{ display: "grid" }}>
        <Checkbox label="Select all" checked={all} onCheckedChange={(on) => setSelected(on ? files : [])} />
        {files.map((file) => (
          <Checkbox
            key={file}
            label={file}
            checked={selected.includes(file)}
            onCheckedChange={(on) =>
              setSelected((prev) => (on ? [...prev, file] : prev.filter((item) => item !== file)))
            }
            style={{ paddingLeft: "1.5rem" }}
          />
        ))}
      </div>
    );
  },
};
