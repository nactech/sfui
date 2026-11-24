import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactNode } from "react";
import Switch from "./index";
import Checkbox from "../Checkbox";
import Radio, { RadioGroup } from "../Radio";
import Segmented from "../Segmented";

// Stand-in for the "Over content → glass" photo strip (local gradient, no remote images).
const photo: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.25rem",
  height: "6.5rem",
  padding: "0 1.5rem",
  borderRadius: "1.25rem",
  overflow: "hidden",
  background:
    "radial-gradient(circle at 20% 80%, #4f7a3a 0 16%, transparent 17%), radial-gradient(circle at 75% 90%, #3d6b2f 0 20%, transparent 21%), linear-gradient(90deg, #c9b8a3 0 14%, #e7d9c4 14% 28%, #8aa1b8 28% 40%, #f1e6d6 40% 55%, #b86c5a 55% 68%, #e9e0cf 68% 82%, #6f8fa8 82%), linear-gradient(180deg, #a9c3dc, #f4efe6)",
};

const row: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "6.875rem 1fr",
  alignItems: "center",
  gap: "1rem",
  padding: "0.875rem 0",
  borderTop: "1px solid var(--sf-rim-default)",
};

const kind: CSSProperties = {
  color: "var(--sf-fg-muted)",
  fontFamily: "var(--sf-font-mono)",
  fontSize: "0.6875rem",
  textTransform: "uppercase",
};

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div style={row}>
    <span style={kind}>{label}</span>
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>{children}</div>
  </div>
);

const segments = [
  { value: "stickers", label: "Stickers" },
  { value: "emoji", label: "Emoji" },
  { value: "masks", label: "Masks" },
];

/** Mirrors the C/D frame grid (slider row excluded). */
const SelectionMatrix = ({ disabled = false }: { disabled?: boolean }) => (
  <div style={{ width: "32.5rem" }}>
    <Row label="Switch">
      <Switch aria-label="Off" disabled={disabled} />
      <Switch aria-label="On" defaultChecked disabled={disabled} />
    </Row>
    <Row label="Checkbox">
      <Checkbox aria-label="Off" disabled={disabled} />
      <Checkbox aria-label="On" defaultChecked disabled={disabled} />
      <Checkbox aria-label="Mixed" defaultChecked="mixed" disabled={disabled} />
    </Row>
    <Row label="Radio">
      <RadioGroup aria-label="Radio" orientation="horizontal" defaultValue="on" disabled={disabled}>
        <Radio value="off" aria-label="Off" />
        <Radio value="on" aria-label="On" />
      </RadioGroup>
    </Row>
    <Row label="Segmented">
      <Segmented
        aria-label="Content"
        options={segments}
        defaultValue="stickers"
        disabled={disabled}
        style={{ flex: 1 }}
      />
    </Row>
    <div style={{ ...kind, fontSize: "0.625rem", color: "var(--sf-fg-subtle)", margin: "0.5rem 0 0.625rem" }}>
      Over content → glass
    </div>
    <div style={photo}>
      <Segmented
        aria-label="Content over photo"
        options={segments}
        defaultValue="stickers"
        overContent
        disabled={disabled}
        style={{ flex: 1 }}
      />
      <Switch aria-label="On over photo" defaultChecked overContent disabled={disabled} />
    </div>
  </div>
);

const meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: { label: "Wi-Fi", defaultChecked: false, disabled: false, overContent: false },
} satisfies Meta<typeof Switch>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Off / On. Press and hold to see the glass lens (C/D2); Tab for the focus ring (C/D3). */
export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      <Switch label="Off" />
      <Switch label="On" defaultChecked />
      <Switch label="Disabled off" disabled />
      <Switch label="Disabled on" defaultChecked disabled />
    </div>
  ),
};

/** "Over content → glass": the track turns to glass over media; disabled stays opaque. */
export const OverContent: Story = {
  render: () => (
    <div style={{ ...photo, width: "30rem" }}>
      <Switch aria-label="Off" overContent />
      <Switch aria-label="On" overContent defaultChecked />
      <Switch aria-label="Disabled" overContent defaultChecked disabled />
    </div>
  ),
};

/** C/D1 Rest frame (switch, checkbox, radio, segmented + over content). */
export const SelectionRest: Story = { render: () => <SelectionMatrix /> };

/** C/D4 Disabled frame. */
export const SelectionDisabled: Story = { render: () => <SelectionMatrix disabled /> };
