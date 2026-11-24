import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AtSign } from "lucide-react";
import TextField, { SearchField, SelectField, TextArea } from "./index";

const fps = [
  { value: "24", label: "24 fps" },
  { value: "30", label: "30 fps" },
  { value: "60", label: "60 fps" },
];

const LONG =
  "Foggy San Francisco in 24 animated stickers — Mr. Chilly, Robotaxi, Painted Ladies, Waymo, Karl the Fog, the Bay Bridge and friends.";
const FILLED = "Foggy San Francisco in 24 stickers — Mr. Chilly, Robotaxi, Painted Ladies and more.";

/** Column with the frames' 22 gap, 520 wide like the F/B frames. */
const Column = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.375rem", width: "32.5rem", maxWidth: "100%" }}>
    {children}
  </div>
);

/** Local stand-in for the "Over content" photo strip: sky, fog and rooftops as CSS gradients. */
const PhotoStrip = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      height: "7rem",
      padding: "0 1.75rem",
      borderRadius: "1.25rem",
      overflow: "hidden",
      background: [
        "linear-gradient(180deg, transparent 55%, #2f3b2a 55%, #3d4a33 100%)",
        "repeating-linear-gradient(90deg, #c9b8a4 0 2.5rem, #8aa1b8 2.5rem 4rem, #e8e2d6 4rem 6rem, #6b7f91 6rem 7rem)",
        "linear-gradient(180deg, #9fc1e6 0%, #dfe9f2 100%)",
      ].join(", "),
      backgroundBlendMode: "normal, multiply, normal",
    }}
  >
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

type Snapshot = "rest" | "filled" | "error" | "disabled";

/** One column of the five kinds, mirroring an F/B frame. */
const Kinds = ({ state }: { state: Snapshot }) => {
  const filled = state !== "rest";
  const error = state === "error";
  const disabled = state === "disabled";
  return (
    <Column>
      <TextField
        label="Pack name"
        placeholder="Name your pack"
        defaultValue={filled && !error ? "Foggy Stickers" : undefined}
        helperText="Shown as the pack title in Telegram"
        error={error ? "Name is required" : undefined}
        disabled={disabled}
      />
      <TextField
        label="Short link"
        prefix="t.me/addstickers/"
        placeholder="short_name"
        defaultValue={filled ? "foggy_sf" : undefined}
        helperText="Letters, digits and underscores"
        error={error ? "foggy_sf is already taken" : undefined}
        disabled={disabled}
      />
      <SearchField
        label="Search stickers"
        shortcut="⌘K"
        defaultValue={state === "filled" ? "chilly" : error ? "chily" : undefined}
        error={error ? "No matches for “chily”" : undefined}
        disabled={disabled}
      />
      <SelectField
        label="Frame rate"
        options={fps}
        placeholder="Choose…"
        defaultValue={filled && !error ? "60" : undefined}
        helperText="Higher is smoother, files get larger"
        error={error ? "Pick a frame rate" : undefined}
        disabled={disabled}
      />
      <TextArea
        label="Description"
        placeholder="What's in the pack?"
        defaultValue={error ? LONG : filled ? FILLED : undefined}
        helperText="Shown on the pack page"
        error={error ? "Too long" : undefined}
        maxCount={120}
        disabled={disabled}
      />
    </Column>
  );
};

const meta = {
  title: "Components/Field",
  component: TextField,
  tags: ["autodocs"],
  args: {
    label: "Pack name",
    placeholder: "Name your pack",
    helperText: "Shown as the pack title in Telegram",
    disabled: false,
  },
  argTypes: {
    error: { control: "text" },
    prefix: { control: "text" },
    maxCount: { control: "number" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "32.5rem", maxWidth: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextField>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Single text field with controls. */
export const Playground: Story = {};

/** F/B1 — Rest. Kinds: Text, Prefix, Search, Select, Multiline. */
export const Rest: Story = { render: () => <Kinds state="rest" /> };

/** F/B2 — Focus. Click or Tab into any field: 1.5 accent rim + glow, accent label, accent caret. */
export const Focus: Story = {
  render: () => (
    <Column>
      <TextField label="Pack name" defaultValue="Foggy Sti" helperText="Shown as the pack title in Telegram" autoFocus />
      <TextField label="Short link" prefix="t.me/addstickers/" defaultValue="foggy_" helperText="Letters, digits and underscores" />
      <SearchField label="Search stickers" defaultValue="chil" />
      <SelectField label="Frame rate" options={fps} defaultValue="60" helperText="Higher is smoother, files get larger" />
      <TextArea label="Description" defaultValue="Foggy San Francisco in 24 sti" helperText="Shown on the pack page" maxCount={120} />
    </Column>
  ),
};

/** F/B3 — Filled. */
export const Filled: Story = { render: () => <Kinds state="filled" /> };

/** F/B4 — Error: danger rim, label, helper; CircleAlert on Text/Prefix/Search; counter turns red past the limit. */
export const ErrorState: Story = { name: "Error", render: () => <Kinds state="error" /> };

/** F/B5 — Disabled: opaque disabled glass, all glyphs disabled/fg, no clear button or key hint. */
export const Disabled: Story = { render: () => <Kinds state="disabled" /> };

/** Floating label: without a placeholder the label rests in the field and floats up on focus / when filled. */
export const FloatingLabel: Story = {
  render: () => (
    <Column>
      <TextField label="Pack name" helperText="No placeholder — the label rests inside until focus" />
      <TextArea label="Description" helperText="Same for multiline" />
      <TextField label="Handle" prefix={<AtSign />} placeholder="username" helperText="Icon prefix" />
    </Column>
  ),
};

/** "Over content" rows of F/B1–F/B5: the glass search over a photo. */
export const OverContent: Story = {
  render: () => (
    <Column>
      <PhotoStrip>
        <SearchField label="Search stickers" shortcut="⌘K" />
      </PhotoStrip>
      <PhotoStrip>
        <SearchField label="Search stickers" defaultValue="chilly" />
      </PhotoStrip>
      <PhotoStrip>
        <SearchField label="Search stickers" defaultValue="chily" error="No matches for “chily”" />
      </PhotoStrip>
      <PhotoStrip>
        <SearchField label="Search stickers" disabled />
      </PhotoStrip>
      <PhotoStrip>
        <TextField label="Pack name" placeholder="Name your pack" />
      </PhotoStrip>
    </Column>
  ),
};

/** Controlled usage of every kind. */
export const Controlled: Story = {
  render: function ControlledStory() {
    const [name, setName] = useState("Foggy Stickers");
    const [query, setQuery] = useState("");
    const [rate, setRate] = useState("30");
    const [about, setAbout] = useState("");
    return (
      <Column>
        <TextField
          label="Pack name"
          value={name}
          onValueChange={setName}
          error={name.trim() === "" ? "Name is required" : undefined}
          helperText="Shown as the pack title in Telegram"
          required
        />
        <SearchField label="Search stickers" value={query} onValueChange={setQuery} shortcut="⌘K" />
        <SelectField label="Frame rate" options={fps} value={rate} onValueChange={setRate} />
        <TextArea label="Description" value={about} onValueChange={setAbout} maxCount={120} autoGrow rows={2} />
      </Column>
    );
  },
};
