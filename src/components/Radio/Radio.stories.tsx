import type { Meta, StoryObj } from "@storybook/react-vite";
import Radio, { RadioGroup } from "./index";

const meta = {
  title: "Components/Radio",
  component: RadioGroup,
  tags: ["autodocs"],
  args: { "aria-label": "Quality", defaultValue: "high", disabled: false, orientation: "vertical" },
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
  },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="auto" label="Auto" />
      <Radio value="high" label="High" />
      <Radio value="medium" label="Medium" />
      <Radio value="low" label="Low (unavailable)" disabled />
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Arrow keys move focus + selection (skipping disabled), Home/End jump. */
export const Playground: Story = {};

/** Off / On (C/D1). Press for the state layer + growing dot (C/D2); Tab for the ring (C/D3). */
export const States: Story = {
  args: { orientation: "horizontal", defaultValue: "on", "aria-label": "States" },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="off" aria-label="Off" />
      <Radio value="on" aria-label="On" />
    </RadioGroup>
  ),
};

/** C/D4 Disabled — opaque fill + hairline, dot in disabled/fg. */
export const Disabled: Story = {
  args: { disabled: true },
};

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
};
