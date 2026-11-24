import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  ArrowDownAZ,
  Calendar,
  Copy,
  Download,
  Ellipsis,
  FolderInput,
  HardDrive,
  Link,
  Pencil,
  Send,
  Share,
  Trash2,
} from "lucide-react";

import Menu from "./Menu";
import MenuPanel from "./MenuPanel";
import {
  MenuItem,
  MenuQuickAction,
  MenuQuickActions,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
} from "./MenuItems";

/* Local stand-in for the Painted Ladies photo of the frames: sky, a row of houses, the park. */
const photo: React.CSSProperties = {
  backgroundImage: [
    "radial-gradient(ellipse 30% 18% at 22% 58%, #8d8fb0 0%, transparent 70%)",
    "radial-gradient(ellipse 26% 16% at 48% 56%, #c9b48f 0%, transparent 70%)",
    "radial-gradient(ellipse 24% 16% at 74% 57%, #7f8a9e 0%, transparent 70%)",
    "repeating-linear-gradient(90deg, #ffffff22 0 0.25rem, transparent 0.25rem 1.5rem)",
    "linear-gradient(180deg, #4f86c6 0%, #8db4e2 38%, #a7a3a0 50%, #5e5a57 62%, #3f5b2c 74%, #5f7f3a 100%)",
  ].join(", "),
};

const stage = (background: React.CSSProperties): React.CSSProperties => ({
  ...background,
  position: "relative",
  width: "32.5rem",
  height: "30.3125rem",
  borderRadius: "1.25rem",
  overflow: "hidden",
});

const darkStage: React.CSSProperties = {
  backgroundColor: "var(--sf-surface-1)",
  border: "1px solid var(--sf-rim-default)",
};

const anchorStyle: React.CSSProperties = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  width: "2.75rem",
  height: "2.75rem",
  display: "grid",
  placeItems: "center",
  padding: 0,
  borderRadius: "1.375rem",
  border: "1px solid var(--sf-glass-rim)",
  background: "var(--sf-glass-fill)",
  color: "var(--sf-fg-default)",
  backdropFilter: "blur(var(--sf-glass-blur))",
  cursor: "pointer",
};

const MoreButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="button" aria-label="More" style={anchorStyle} {...props}>
    <Ellipsis size="1.25rem" />
  </button>
);

interface ContentProps {
  sort?: string;
  onSortChange?: (value: string) => void;
  disabledQuick?: boolean;
  sortIcons?: boolean;
}

/** The menu of frame M/A2: quick row, Share submenu, Sort by single choice, Delete. */
function FileMenuContent({ sort, onSortChange, disabledQuick, sortIcons }: ContentProps) {
  return (
    <>
      <MenuQuickActions aria-label="Quick actions">
        <MenuQuickAction icon={<Pencil />}>Rename</MenuQuickAction>
        <MenuQuickAction icon={<Copy />} disabled={disabledQuick}>
          Duplicate
        </MenuQuickAction>
        <MenuQuickAction icon={<FolderInput />} disabled={disabledQuick}>
          Move to…
        </MenuQuickAction>
      </MenuQuickActions>
      <MenuSeparator />
      <MenuSub label="Share" icon={<Share />}>
        <MenuItem icon={<Send />}>Telegram</MenuItem>
        <MenuItem icon={<Link />}>Copy link</MenuItem>
        <MenuItem icon={<Download />}>Export .tgs</MenuItem>
      </MenuSub>
      <MenuSeparator />
      <MenuRadioGroup label="Sort by" value={sort} defaultValue="name" onValueChange={onSortChange}>
        <MenuRadioItem value="name" icon={sortIcons ? <ArrowDownAZ /> : <Calendar />}>
          Name
        </MenuRadioItem>
        <MenuRadioItem value="date" icon={<Calendar />}>
          Date added
        </MenuRadioItem>
        <MenuRadioItem value="size" icon={<HardDrive />}>
          Size
        </MenuRadioItem>
      </MenuRadioGroup>
      <MenuSeparator />
      <MenuItem icon={<Trash2 />} destructive>
        Delete
      </MenuItem>
    </>
  );
}

const meta = {
  title: "Components/Menu",
  component: Menu,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    trigger: <MoreButton />,
    align: "end",
  },
  argTypes: {
    align: { control: "inline-radio", options: ["start", "end"] },
    trigger: { control: false },
  },
} satisfies Meta<typeof Menu>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Row 1 · Rest — opens below •••, right edges aligned, 6px gap. Hover/press rows for M3 state layers (row 2). */
export const OverContent: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <div style={stage(photo)}>
      <Menu {...args}>
        <FileMenuContent />
      </Menu>
    </div>
  ),
};

/** Rows 1, 3, 5 side by side as static panels over the photo: Rest, Selection (Date added), Disabled + destructive. */
export const Matrix: Story = {
  render: () => (
    <div style={{ ...photo, display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "1.5rem", padding: "2rem", borderRadius: "1.25rem" }}>
      <MenuPanel aria-label="Rest">
        <FileMenuContent />
      </MenuPanel>
      <MenuPanel aria-label="Selection">
        <FileMenuContent sort="date" sortIcons />
      </MenuPanel>
      <MenuPanel aria-label="Disabled and destructive">
        <FileMenuContent disabledQuick />
      </MenuPanel>
    </div>
  ),
};

/** Row 3 · Selection — the check replaces the icon, label in accent at weight 500, no tonal fill. Stays open. */
export const Selection: Story = {
  render: function SelectionStory(args) {
    const [sort, setSort] = useState("date");
    return (
      <div style={stage(photo)}>
        <Menu {...args} defaultOpen>
          <FileMenuContent sort={sort} onSortChange={setSort} sortIcons />
        </Menu>
      </div>
    );
  },
};

/** Row 4 / 4B · Submenu — Share replaces the content in place: shared axis X + height spring, Back row on top. */
export const Submenu: Story = {
  render: () => (
    <div style={{ ...photo, padding: "2rem", borderRadius: "1.25rem", minHeight: "30rem" }}>
      <MenuPanel aria-label="File">
        <FileMenuContent />
      </MenuPanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("menuitem", { name: "Share" }));
    await expect(canvas.getByRole("menuitem", { name: "Share, back" })).toBeInTheDocument();
  },
};

/** Row 5 · Disabled + destructive — Duplicate and Move to… unavailable (opaque disabled fg, no opacity). */
export const Disabled: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <div style={stage(photo)}>
      <Menu {...args}>
        <FileMenuContent disabledQuick />
      </Menu>
    </div>
  ),
};

/** Row 6 · Web — keyboard. ↓ opens on the first action, → moves inside the top row (focus on Move to…),
 *  ↑↓ between rows, → / Enter opens Share in place, ← / Esc go back, Esc on the root closes. */
export const Keyboard: Story = {
  render: (args) => (
    <div style={stage(darkStage)}>
      <Menu {...args}>
        <FileMenuContent />
      </Menu>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "More" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}{ArrowRight}{ArrowRight}");
  },
};

/** Opens upwards when there is no room below; the bottom edge then stays anchored while the height springs. */
export const FlipAbove: Story = {
  args: { align: "start" },
  render: (args) => (
    <div style={{ ...stage(photo), height: "100vh", width: "100vw", borderRadius: 0 }}>
      <Menu {...args} trigger={<MoreButton style={{ ...anchorStyle, top: "auto", bottom: "1rem", left: "1rem", right: "auto" }} />}>
        <FileMenuContent />
      </Menu>
    </div>
  ),
  parameters: { layout: "fullscreen" },
};
