import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { Download, Ellipsis, Play, Trash2 } from "lucide-react";
import Button, { type ButtonVariant } from "./index";

const variants: ButtonVariant[] = ["primary", "tonal", "secondary", "ghost", "danger"];

// Stand-in for the "Over content" photo strip (local gradient, no remote images).
const photo: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  height: "7rem",
  padding: "0 1.75rem",
  borderRadius: "1.25rem",
  overflow: "hidden",
  background:
    "radial-gradient(circle at 18% 70%, #4f7a3a 0 18%, transparent 19%), radial-gradient(circle at 70% 85%, #3d6b2f 0 22%, transparent 23%), linear-gradient(90deg, #c9b8a3 0 12%, #e7d9c4 12% 24%, #8aa1b8 24% 36%, #f1e6d6 36% 50%, #b86c5a 50% 62%, #e9e0cf 62% 76%, #6f8fa8 76% 88%, #d8c7ad 88%), linear-gradient(180deg, #a9c3dc, #f4efe6)",
  backgroundBlendMode: "normal",
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "6.875rem repeat(5, 8.75rem)",
  alignItems: "center",
  rowGap: "0.75rem",
  color: "var(--sf-fg-muted)",
  fontFamily: "var(--sf-font-mono)",
  fontSize: "0.6875rem",
  textTransform: "uppercase",
};

const iconFor = (variant: ButtonVariant) => (variant === "danger" ? <Trash2 /> : <Play />);

const Matrix = ({ disabled = false }: { disabled?: boolean }) => (
  <div style={grid}>
    <span />
    <span>S · 32</span>
    <span>M · 40</span>
    <span>L · 48</span>
    <span>M + icon</span>
    <span>Icon only</span>
    {variants.map((variant) => (
      <div key={variant} style={{ display: "contents" }}>
        <span>{variant}</span>
        <span>
          <Button variant={variant} size="s" disabled={disabled}>
            Export
          </Button>
        </span>
        <span>
          <Button variant={variant} size="m" disabled={disabled}>
            Export
          </Button>
        </span>
        <span>
          <Button variant={variant} size="l" disabled={disabled}>
            Export
          </Button>
        </span>
        <span>
          <Button variant={variant} leadingIcon={<Download />} disabled={disabled}>
            Export
          </Button>
        </span>
        <span>
          <Button variant={variant} iconOnly aria-label={variant === "danger" ? "Delete" : "Play"} disabled={disabled}>
            {iconFor(variant)}
          </Button>
        </span>
      </div>
    ))}
  </div>
);

const OverContent = ({ disabled = false }: { disabled?: boolean }) => (
  <div style={{ width: "50rem" }}>
    <div style={photo}>
      <Button size="l" disabled={disabled}>
        Export
      </Button>
      <Button size="l" variant="secondary" disabled={disabled}>
        Export
      </Button>
      <Button size="l" variant="tonal" disabled={disabled}>
        Export
      </Button>
      <Button variant="secondary" iconOnly aria-label="More" disabled={disabled}>
        <Ellipsis />
      </Button>
    </div>
  </div>
);

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Export", variant: "primary", size: "m" },
  argTypes: {
    variant: { control: "inline-radio", options: variants },
    size: { control: "inline-radio", options: ["s", "m", "l"] },
    leadingIcon: { control: false },
    trailingIcon: { control: false },
  },
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** B/C1 Rest — every variant × size, icon + label, icon only. Press / Tab through it for B/C2 and B/C3. */
export const RestMatrix: Story = { render: () => <Matrix /> };

/** B/C4 Disabled — one neutral glass fill + disabled/fg, no opacity. */
export const DisabledMatrix: Story = { render: () => <Matrix disabled /> };

/** "Over content" row — the same glass set refracts the photo behind it. */
export const OverContentRow: Story = { render: () => <OverContent /> };

export const OverContentDisabled: Story = { render: () => <OverContent disabled /> };

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      <Button leadingIcon={<Download />}>Export</Button>
      <Button variant="tonal" trailingIcon={<Play />}>
        Play
      </Button>
      <Button variant="danger" size="l" leadingIcon={<Trash2 />}>
        Delete
      </Button>
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div style={{ width: "20rem", display: "grid", gap: "0.75rem" }}>
      <Button fullWidth size="l">
        Continue
      </Button>
      <Button fullWidth size="l" variant="secondary">
        Not now
      </Button>
    </div>
  ),
};
