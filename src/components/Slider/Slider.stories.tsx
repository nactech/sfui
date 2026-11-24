import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Gauge, Rabbit, Turtle } from "lucide-react";
import Slider from "./Slider";

const fps = (v: number) => `${v} fps`;

const meta = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
  args: {
    label: "Frame rate",
    defaultValue: 60,
    min: 0,
    max: 120,
    step: 1,
    size: "m",
    variant: "solid",
    disabled: false,
    showValue: true,
    formatValue: fps,
    icon: <Gauge />,
  },
  argTypes: {
    icon: { control: false },
    leadingIcon: { control: false },
    trailingIcon: { control: false },
    formatValue: { control: false },
    steps: { control: "object" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "32.5rem", maxWidth: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Row 1 · Rest — M 44. Hover (row 2), drag (row 3) and focus (row 4) are live: point, drag or Tab. */
export const Default: Story = {};

const Row = ({ caption, note, children }: { caption: string; note?: string; children: React.ReactNode }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.625rem",
      padding: "0.75rem 0 0.25rem",
      borderTop: "1px solid var(--sf-rim-default)",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        font: "400 0.625rem/normal var(--sf-font-mono)",
        letterSpacing: "0.05rem",
        color: "var(--sf-fg-subtle)",
      }}
    >
      <span>{caption}</span>
      {note && <span style={{ color: "var(--sf-fg-muted)", fontSize: "0.6875rem", letterSpacing: 0 }}>{note}</span>}
    </div>
    {children}
  </div>
);

/** Mirrors frame UD8xo (R/E1 · Android + Web) row by row. Pinned to `web`; see "iOS · Matrix" for R/E2. */
export const Matrix: Story = {
  parameters: { platform: "web" },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Row caption="1 · REST — M 44" note="touch, default">
        <Slider {...args} label="Rest" />
      </Row>
      <Row caption="2–4 · HOVER / DRAGGING / FOCUS" note="live: point, drag, Tab + ← →">
        <Slider {...args} label="Interactive" />
      </Row>
      <Row caption="5 · DISABLED">
        <Slider {...args} label="Disabled" disabled />
      </Row>
      <Row caption="6 · LOW VALUE" note="label moves outside">
        <Slider {...args} label="Low value" defaultValue={8} />
      </Row>
      <Row caption="7 · STEPPED — 12 / 24 / 30 / 60" note="connected segments">
        <Slider {...args} label="Stepped" steps={[12, 24, 30, 60]} defaultValue={30} />
      </Row>
      <Row caption="8 · SIZE S — 32" note="dense web">
        <Slider {...args} label="Size S" size="s" icon={undefined} />
      </Row>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Slider {...args} label="M" size="m" />
      <Slider {...args} label="M, no icon" size="m" icon={undefined} />
      <Slider {...args} label="S" size="s" icon={undefined} />
      <Slider {...args} label="S, icon" size="s" />
    </div>
  ),
};

/** Row 6: drag towards the left — the value text leaves the fill when it no longer fits. */
export const LowValue: Story = {
  args: { defaultValue: 8 },
};

export const Stepped: Story = {
  args: { steps: [12, 24, 30, 60], defaultValue: 30 },
};

export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Slider {...args} disabled />
      <Slider {...args} disabled steps={[12, 24, 30, 60]} defaultValue={30} />
    </div>
  ),
};

/** Controlled value with `onValueCommit` (fires on release / per key press). */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = React.useState(40);
    const [committed, setCommitted] = React.useState(40);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <Slider {...args} value={value} onValueChange={setValue} onValueCommit={setCommitted} />
        <span style={{ font: "400 0.75rem var(--sf-font-mono)", color: "var(--sf-fg-muted)" }}>
          value {value} · committed {committed}
        </span>
      </div>
    );
  },
};

const photo: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "1rem",
  padding: "1.5rem",
  borderRadius: "1.25rem",
  background:
    "radial-gradient(circle at 78% 30%, #f6e7c1 0 10%, transparent 30%), linear-gradient(180deg, #7fa7d6 0%, #c9d6e4 38%, #b48a64 39%, #7d5a44 62%, #3d4a2f 63%, #26301f 100%)",
};

/** Over content → glass. */
export const OverContent: Story = {
  args: { variant: "glass" },
  render: (args) => (
    <div style={photo}>
      <Slider {...args} />
      <Slider {...args} steps={[12, 24, 30, 60]} defaultValue={30} />
      <Slider {...args} disabled />
    </div>
  ),
};

// ---------------------------------------------------------------- iOS (R/E2 · frame OjKFn)

/** iOS stage: phone width (390). The lens carries a short number; the unit goes to `getValueText`. */
const ios = {
  parameters: { platform: "ios" },
  args: { formatValue: undefined, getValueText: fps, icon: undefined, max: 100 },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: "24.375rem", maxWidth: "100%", fontFamily: "var(--sf-font-ios)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Pick<Story, "parameters" | "args" | "decorators">;

const steps = [12, 24, 30, 60] as const;

/** Row 6 composition: a settings group with label + live value above `Slider/iOS/With Icons`. */
const SettingsRow = (args: React.ComponentProps<typeof Slider>) => {
  const [value, setValue] = React.useState(60);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
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
        {...args}
        label="Frame rate"
        value={value}
        onValueChange={setValue}
        defaultValue={undefined}
        leadingIcon={<Turtle />}
        trailingIcon={<Rabbit />}
      />
    </div>
  );
};

/** Frame OjKFn row "Over content": the slider in a glass panel over a photo (`variant="glass"`). */
const PhotoStrip = ({ children }: { children: React.ReactNode }) => (
  <div style={{ ...photo, minHeight: "7rem", padding: "1.5rem", gap: "0.75rem" }}>{children}</div>
);

/** Mirrors frame OjKFn (R/E2 · iOS) row by row. Rows 2–3 are live: press and drag (the lens grows), Tab + ← →. */
export const IOSMatrix: Story = {
  name: "iOS · Matrix",
  ...ios,
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Row caption="1 · REST" note="value lives in the lens">
        <Slider {...args} label="Rest" />
      </Row>
      <Row caption="2 · DRAGGING" note="live: press and drag — lens grows">
        <Slider {...args} label="Dragging" defaultValue={72} />
      </Row>
      <Row caption="3 · FOCUS" note="live: Tab (iPad keyboard)">
        <Slider {...args} label="Focus" />
      </Row>
      <Row caption="4 · DISABLED">
        <Slider {...args} label="Disabled" disabled />
      </Row>
      <Row caption="5 · STEPPED — 12 / 24 / 30 / 60" note="snaps to ticks">
        <Slider {...args} label="Stepped" steps={steps} defaultValue={30} />
      </Row>
      <Row caption="6 · IN A SETTINGS ROW" note="with min / max icons">
        <SettingsRow {...args} />
      </Row>
      <Row caption="OVER CONTENT">
        <PhotoStrip>
          <Slider {...args} label="Over content" variant="glass" leadingIcon={<Turtle />} trailingIcon={<Rabbit />} />
        </PhotoStrip>
      </Row>
    </div>
  ),
};

/** Row 1 · Rest — `Slider/iOS/Continuous`. Drag it: the lens grows to 68 × 44 and magnifies the track. */
export const IOSDefault: Story = {
  name: "iOS · Continuous",
  ...ios,
};

/** Row 5 — `Slider/iOS/Stepped`: evenly spaced ticks, the lens snaps to the nearest one. */
export const IOSStepped: Story = {
  name: "iOS · Stepped",
  ...ios,
  args: { ...ios.args, steps, defaultValue: 30 },
};

/** Row 6 — `Slider/iOS/With Icons` (`leadingIcon` / `trailingIcon`, Lucide Turtle / Rabbit) in a settings group. */
export const IOSSettingsRow: Story = {
  name: "iOS · In a settings row",
  ...ios,
  render: (args) => <SettingsRow {...args} />,
};

export const IOSDisabled: Story = {
  name: "iOS · Disabled",
  ...ios,
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Slider {...args} disabled />
      <Slider {...args} disabled steps={steps} defaultValue={30} />
      <Slider {...args} disabled leadingIcon={<Turtle />} trailingIcon={<Rabbit />} />
    </div>
  ),
};

/** "Over content" — `variant="glass"` puts the slider in a glass panel. */
export const IOSOverContent: Story = {
  name: "iOS · Over content",
  ...ios,
  args: { ...ios.args, variant: "glass", leadingIcon: <Turtle />, trailingIcon: <Rabbit /> },
  render: (args) => (
    <PhotoStrip>
      <Slider {...args} />
      <Slider {...args} steps={steps} defaultValue={30} />
      <Slider {...args} disabled />
    </PhotoStrip>
  ),
};
