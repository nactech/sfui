import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
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
  Snowflake,
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
  /** iOS copy is Title Case (M/A1): "Move To…", "Copy Link", "Sort By", "Date Added". */
  titleCase?: boolean;
}

/** The menu of frames M/A2 / M/A1: quick row, Share submenu, Sort by single choice, Delete. */
function FileMenuContent({ sort, onSortChange, disabledQuick, sortIcons, titleCase }: ContentProps) {
  const t = (sentence: string, title: string) => (titleCase ? title : sentence);
  return (
    <>
      <MenuQuickActions aria-label="Quick actions">
        <MenuQuickAction icon={<Pencil />}>Rename</MenuQuickAction>
        <MenuQuickAction icon={<Copy />} disabled={disabledQuick}>
          Duplicate
        </MenuQuickAction>
        <MenuQuickAction icon={<FolderInput />} disabled={disabledQuick}>
          {t("Move to…", "Move To…")}
        </MenuQuickAction>
      </MenuQuickActions>
      <MenuSeparator />
      <MenuSub label="Share" icon={<Share />}>
        <MenuItem icon={<Send />}>Telegram</MenuItem>
        <MenuItem icon={<Link />}>{t("Copy link", "Copy Link")}</MenuItem>
        <MenuItem icon={<Download />}>Export .tgs</MenuItem>
      </MenuSub>
      <MenuSeparator />
      <MenuRadioGroup label={t("Sort by", "Sort By")} value={sort} defaultValue="name" onValueChange={onSortChange}>
        <MenuRadioItem value="name" icon={sortIcons ? <ArrowDownAZ /> : <Calendar />}>
          Name
        </MenuRadioItem>
        <MenuRadioItem value="date" icon={<Calendar />}>
          {t("Date added", "Date Added")}
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
  // Web stories render M/A2 whatever the toolbar says; the iOS stories below pin `platform: "ios"`.
  parameters: { layout: "centered", platform: "web" },
  args: {
    trigger: <MoreButton />,
    align: "end",
  },
  argTypes: {
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    variant: { control: "inline-radio", options: ["pulldown", "context"] },
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

/* ───────────────────────────── iOS (final.pen M/A1 "Menu / iOS") ───────────────────────────── */

/** Phone-width stage (390) with the frames' 500 height. */
const phoneStage = (background: React.CSSProperties): React.CSSProperties => ({
  ...stage(background),
  width: "24.375rem",
  height: "31.25rem",
});

const ios = { platform: "ios" } as const;

/** Waits for the grow-in, then holds a finger down on an item (the lens stays while the pointer is down). */
async function pressAndHold(name: string, role: "menuitem" | "menuitemradio") {
  const body = within(document.body);
  const target = await body.findByRole(role, { name });
  await new Promise((resolve) => setTimeout(resolve, 450));
  const r = target.getBoundingClientRect();
  await userEvent.pointer({
    keys: "[TouchA>]",
    target,
    coords: { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 },
  });
}

/** iOS row 1 · Rest — grows out of ••• and covers it (top-right corners aligned), no dimming. Title Case copy,
 *  check column (the view has a single choice), Lucide outline icons where iOS draws filled SF Symbols. */
export const IOSRest: Story = {
  name: "iOS · Rest",
  parameters: ios,
  args: { defaultOpen: true },
  render: (args) => (
    <div style={phoneStage(photo)}>
      <Menu {...args}>
        <FileMenuContent titleCase sortIcons />
      </Menu>
    </div>
  ),
};

/** iOS row 2 · Pressed — one lens (capsule inset 10, white 14%) under the finger; press anywhere, slide, and
 *  release on an item to choose it. Labels keep their colour. This story holds a finger on Date Added. */
export const IOSPressed: Story = {
  name: "iOS · Pressed (slide to highlight)",
  parameters: ios,
  args: { defaultOpen: true },
  render: IOSRest.render,
  play: async () => {
    await pressAndHold("Date Added", "menuitemradio");
    await waitFor(() => expect(document.querySelector("[data-menu-press-lens][data-visible]")).not.toBeNull());
  },
};

/** iOS row 2B · Pressed · quick action — the same lens morphs into the medium-row cell (r 22). */
export const IOSPressedQuickAction: Story = {
  name: "iOS · Pressed · quick action",
  parameters: ios,
  args: { defaultOpen: true },
  render: IOSRest.render,
  play: async () => {
    await pressAndHold("Duplicate", "menuitem");
  },
};

/** iOS row 3 · Selection — a white check in the leading column; icon and label unchanged. Stays open. */
export const IOSSelection: Story = {
  name: "iOS · Selection",
  parameters: ios,
  render: function IOSSelectionStory(args) {
    const [sort, setSort] = useState("date");
    return (
      <div style={phoneStage(photo)}>
        <Menu {...args} defaultOpen>
          <FileMenuContent sort={sort} onSortChange={setSort} sortIcons titleCase />
        </Menu>
      </div>
    );
  },
};

/** iOS rows 4 / 4B · Submenu — Share replaces the content in place under a "‹ Share" back row; the panel keeps
 *  its anchored edge and springs to the new height (shared axis X, damping 1.0). */
export const IOSSubmenu: Story = {
  name: "iOS · Submenu",
  parameters: ios,
  args: { defaultOpen: true },
  render: IOSRest.render,
  play: async () => {
    const body = within(document.body);
    await userEvent.click(await body.findByRole("menuitem", { name: "Share" }));
    await expect(await body.findByRole("menuitem", { name: "Share, back" })).toBeInTheDocument();
  },
};

/** iOS row 5 · Disabled + destructive — Duplicate and Move To… in tertiaryLabel (a colour, not opacity),
 *  Delete in systemRed. */
export const IOSDisabled: Story = {
  name: "iOS · Disabled + destructive",
  parameters: ios,
  args: { defaultOpen: true },
  render: (args) => (
    <div style={phoneStage(photo)}>
      <Menu {...args}>
        <FileMenuContent disabledQuick titleCase sortIcons />
      </Menu>
    </div>
  ),
};

const previewCard: React.CSSProperties = {
  position: "absolute",
  top: "1.5rem",
  left: "50%",
  width: "18.125rem",
  height: "9.375rem",
  marginLeft: "-9.0625rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: 0,
  border: 0,
  borderRadius: "1.875rem",
  background: "#1c1c1e", // iOS secondarySystemBackground (dark) — the lifted preview card of row 6
  color: "var(--sf-ios-label)",
  fontFamily: "var(--sf-font-ios)",
  fontSize: "1.0625rem",
  fontWeight: 600,
  letterSpacing: "-0.025rem",
  cursor: "pointer",
  WebkitTouchCallout: "none",
  userSelect: "none",
  transition: "transform 200ms var(--sf-ease-standard), box-shadow 200ms var(--sf-ease-standard)",
};

/** The long-pressed sticker. `data-state="open"` (set by Menu) lifts it: shadow 0 18 50, black 50%. */
function StickerPreview(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { "data-state"?: string }) {
  const lifted = props["data-state"] === "open";
  return (
    <button
      type="button"
      {...props}
      style={{
        ...previewCard,
        transform: lifted ? "scale(1)" : "scale(0.94)",
        boxShadow: lifted ? "0 1.125rem 3.125rem #00000080" : "none",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "grid",
          placeItems: "center",
          width: "4.5rem",
          height: "4.5rem",
          borderRadius: "1.25rem",
          background: "var(--sf-accent-tonal)",
          color: "var(--sf-accent-on-tonal)",
        }}
      >
        <Snowflake size="2.25rem" />
      </span>
      Mr. Chilly
    </button>
  );
}

/** iOS row 6 · Context menu — `variant="context"`: 290 wide, centred 12 below the lifted preview, background
 *  stays sharp (no blur, no dim). Opens on long-press / right-click / ↓; a tap is the sticker's own action. */
export const IOSContextMenu: Story = {
  name: "iOS · Context menu",
  parameters: ios,
  args: { defaultOpen: true, variant: "context", align: "center" },
  render: (args) => (
    <div style={{ ...phoneStage(photo), height: "38.0625rem" }}>
      <Menu {...args} trigger={<StickerPreview />}>
        <FileMenuContent titleCase sortIcons />
      </Menu>
    </div>
  ),
};

/** iOS rows 1, 3, 5 and the context width side by side as static panels (no lens, no positioning). */
export const IOSMatrix: Story = {
  name: "iOS · Matrix",
  parameters: ios,
  render: () => (
    <div style={{ ...photo, display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "1.5rem", padding: "2rem", borderRadius: "1.25rem" }}>
      <MenuPanel aria-label="Rest">
        <FileMenuContent titleCase sortIcons />
      </MenuPanel>
      <MenuPanel aria-label="Selection">
        <FileMenuContent sort="date" titleCase sortIcons />
      </MenuPanel>
      <MenuPanel aria-label="Disabled and destructive">
        <FileMenuContent disabledQuick titleCase sortIcons />
      </MenuPanel>
      <MenuPanel aria-label="Share">
        <MenuItem icon={<Send />}>Telegram</MenuItem>
        <MenuItem icon={<Link />}>Copy Link</MenuItem>
        <MenuItem icon={<Download />}>Export .tgs</MenuItem>
      </MenuPanel>
      <MenuPanel aria-label="Context" variant="context">
        <FileMenuContent titleCase sortIcons />
      </MenuPanel>
    </div>
  ),
};

/** iOS · iPad keyboard — the same roving focus as web; the focused row shows the lens fill + focus ring. */
export const IOSKeyboard: Story = {
  name: "iOS · Keyboard (iPad)",
  parameters: ios,
  render: (args) => (
    <div style={phoneStage(darkStage)}>
      <Menu {...args}>
        <FileMenuContent titleCase sortIcons />
      </Menu>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "More" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
  },
};
