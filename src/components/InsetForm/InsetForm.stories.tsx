import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import InsetForm, { InsetFormRow, InsetFormSearch, InsetFormSelectRow, InsetFormTextAreaRow } from "./index";

const fps = [
  { value: "24", label: "24 fps" },
  { value: "30", label: "30 fps" },
  { value: "60", label: "60 fps" },
];

const FOOTER = "Name and link are shown in Telegram. The link can't be changed later.";
const LONG =
  "Foggy San Francisco in 24 animated stickers — Mr. Chilly, Robotaxi, Painted Ladies, Waymo, Karl the Fog, the Bay Bridge and friends.";
const FILLED = "Foggy San Francisco in 24 stickers — Mr. Chilly, Robotaxi, Painted Ladies and more.";

/** Column with the frames' 14 gap (search → group → footer), 520 wide like the I/A frames. */
const Column = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", width: "32.5rem", maxWidth: "100%" }}>
    {children}
  </div>
);

/** Local stand-in for the "Over content" photo strip (CSS gradients only). */
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
    }}
  >
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

type Snapshot = "rest" | "filled" | "error" | "disabled";

/** Mirrors an I/A frame: search capsule, the group of four rows, footer, then the over-content row. */
const Frame = ({ state }: { state: Snapshot }) => {
  const filled = state !== "rest";
  const error = state === "error";
  const disabled = state === "disabled";
  const query = state === "filled" ? "chilly" : error ? "chily" : undefined;
  return (
    <Column>
      <InsetFormSearch label="Search stickers" shortcut="⌘K" defaultValue={query} error={error} disabled={disabled} />
      <InsetForm footer={FOOTER} disabled={disabled} aria-label="Pack details">
        <InsetFormRow
          label="Name"
          placeholder="Name your pack"
          defaultValue={filled && !error ? "Foggy Stickers" : undefined}
          error={error ? "Name is required" : undefined}
        />
        <InsetFormRow
          label="Link"
          prefix="t.me/addstickers/"
          placeholder="short_name"
          defaultValue={filled ? "foggy_sf" : undefined}
          error={error ? "foggy_sf is already taken" : undefined}
        />
        <InsetFormSelectRow
          label="Frame rate"
          options={fps}
          placeholder="Choose…"
          defaultValue={filled && !error ? "60" : undefined}
          error={error ? "Pick a frame rate" : undefined}
        />
        <InsetFormTextAreaRow
          label="Description"
          placeholder="What's in the pack?"
          defaultValue={error ? LONG : filled ? FILLED : undefined}
          maxCount={120}
          error={error ? "Too long" : undefined}
        />
      </InsetForm>
      <PhotoStrip>
        <InsetFormSearch label="Search stickers" shortcut="⌘K" defaultValue={query} error={error} disabled={disabled} />
      </PhotoStrip>
    </Column>
  );
};

const meta = {
  title: "Components/InsetForm",
  component: InsetForm,
  tags: ["autodocs"],
  args: { footer: FOOTER, disabled: false },
  argTypes: { title: { control: "text" }, footer: { control: "text" } },
} satisfies Meta<typeof InsetForm>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Group with controls (title/footer/disabled). */
export const Playground: Story = {
  render: (args) => (
    <div style={{ width: "32.5rem", maxWidth: "100%" }}>
      <InsetForm {...args}>
        <InsetFormRow label="Name" placeholder="Name your pack" />
        <InsetFormRow label="Link" prefix="t.me/addstickers/" placeholder="short_name" />
        <InsetFormSelectRow label="Frame rate" options={fps} placeholder="Choose…" />
        <InsetFormTextAreaRow label="Description" placeholder="What's in the pack?" maxCount={120} />
      </InsetForm>
    </div>
  ),
};

/** I/A1 — Rest. */
export const Rest: Story = { render: () => <Frame state="rest" /> };

/** I/A2 — Focus. Click or Tab into a row: it lifts to surface/2 and the label turns accent (select value too). */
export const Focus: Story = {
  render: () => (
    <Column>
      <InsetFormSearch label="Search stickers" defaultValue="chil" />
      <InsetForm footer={FOOTER} aria-label="Pack details">
        <InsetFormRow label="Name" defaultValue="Foggy Sti" autoFocus />
        <InsetFormRow label="Link" prefix="t.me/addstickers/" defaultValue="foggy_" />
        <InsetFormSelectRow label="Frame rate" options={fps} defaultValue="60" />
        <InsetFormTextAreaRow label="Description" defaultValue="Foggy San Francisco in 24 sti" maxCount={120} />
      </InsetForm>
    </Column>
  ),
};

/** I/A3 — Filled. */
export const Filled: Story = { render: () => <Frame state="filled" /> };

/** I/A4 — Error: danger label + CircleAlert, message under the control column; search gets the danger rim. */
export const ErrorState: Story = { name: "Error", render: () => <Frame state="error" /> };

/** I/A5 — Disabled: the group stays surface/1, every glyph turns disabled/fg; search uses disabled glass. */
export const Disabled: Story = { render: () => <Frame state="disabled" /> };

/** Optional group header (not drawn in the frames) plus a controlled form. */
export const WithTitleControlled: Story = {
  name: "With title (controlled)",
  render: function ControlledStory() {
    const [name, setName] = useState("");
    const [rate, setRate] = useState("30");
    const [about, setAbout] = useState("");
    return (
      <Column>
        <InsetForm title="Pack" footer={FOOTER}>
          <InsetFormRow
            label="Name"
            placeholder="Name your pack"
            value={name}
            onValueChange={setName}
            error={name.length > 0 && name.trim() === "" ? "Name is required" : undefined}
          />
          <InsetFormSelectRow label="Frame rate" options={fps} value={rate} onValueChange={setRate} />
          <InsetFormTextAreaRow label="Description" value={about} onValueChange={setAbout} maxCount={120} />
        </InsetForm>
      </Column>
    );
  },
};
