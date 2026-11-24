import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { Image, Smile, Sticker } from "lucide-react";
import Segmented, { type SegmentedOption } from "./index";

const options: SegmentedOption[] = [
  { value: "stickers", label: "Stickers" },
  { value: "emoji", label: "Emoji" },
  { value: "masks", label: "Masks" },
];

// Stand-in for the "Over content → glass" photo strip (local gradient, no remote images).
const photo: CSSProperties = {
  display: "flex",
  alignItems: "center",
  height: "6.5rem",
  padding: "0 1.5rem",
  borderRadius: "1.25rem",
  overflow: "hidden",
  background:
    "radial-gradient(circle at 20% 80%, #4f7a3a 0 16%, transparent 17%), radial-gradient(circle at 75% 90%, #3d6b2f 0 20%, transparent 21%), linear-gradient(90deg, #c9b8a3 0 14%, #e7d9c4 14% 28%, #8aa1b8 28% 40%, #f1e6d6 40% 55%, #b86c5a 55% 68%, #e9e0cf 68% 82%, #6f8fa8 82%), linear-gradient(180deg, #a9c3dc, #f4efe6)",
};

const meta = {
  title: "Components/Segmented",
  component: Segmented,
  tags: ["autodocs"],
  args: {
    "aria-label": "Content",
    options,
    defaultValue: "stickers",
    size: "m",
    disabled: false,
    overContent: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["s", "m", "l"] },
    options: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "24.5rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Segmented>;
export default meta;

type Story = StoryObj<typeof meta>;

/** C/D1 Rest. Press an unselected segment to see it morph into a pill (C/D2); Tab for the ring (C/D3). */
export const Playground: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "1rem" }}>
      <Segmented {...args} aria-label="Small" size="s" />
      <Segmented {...args} aria-label="Medium" size="m" />
      <Segmented {...args} aria-label="Large" size="l" />
    </div>
  ),
};

/** Option icons; the selected segment swaps its icon for the check. */
export const WithIcons: Story = {
  args: {
    options: [
      { value: "stickers", label: "Stickers", icon: <Sticker /> },
      { value: "emoji", label: "Emoji", icon: <Smile /> },
      { value: "gifs", label: "GIFs", icon: <Image />, disabled: true },
    ],
  },
};

/** C/D4 Disabled — opaque; the selected segment keeps surface/2. */
export const Disabled: Story = { args: { disabled: true } };

/** "Over content → glass". */
export const OverContent: Story = {
  args: { overContent: true },
  decorators: [
    (Story) => (
      <div style={{ ...photo, width: "32rem" }}>
        <div style={{ flex: 1 }}>
          <Story />
        </div>
      </div>
    ),
  ],
};

export const OverContentDisabled: Story = {
  ...OverContent,
  args: { overContent: true, disabled: true },
};
