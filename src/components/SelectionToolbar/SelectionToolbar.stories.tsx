import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import {
  Car,
  CarTaxiFront,
  CircleAlert,
  Copy,
  Download,
  FolderInput,
  House,
  Library,
  Play,
  Settings2,
  Share,
  Snowflake,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import SelectionToolbar, { type SelectionToolbarAction } from "./index";
import Header from "../Header";
import List, { ListItem, ListStatus, ListThumbnail } from "../List";
import { MenuItem } from "../Menu";
import TabBar from "../TabBar";

const actions: SelectionToolbarAction[] = [
  { label: "Share", icon: <Share />, onSelect: () => {} },
  { label: "Move", icon: <FolderInput />, onSelect: () => {} },
  { label: "Duplicate", icon: <Copy />, onSelect: () => {} },
  { label: "Delete", icon: <Trash2 />, onSelect: () => {}, destructive: true },
];
const moreMenu = (
  <>
    <MenuItem icon={<Download />}>Export</MenuItem>
    <MenuItem icon={<Tag />}>Add tag</MenuItem>
  </>
);

// Over-content stand-in (local gradient, no remote images).
const photo =
  "radial-gradient(circle at 18% 80%, #4f7a3a 0 16%, transparent 17%), radial-gradient(circle at 72% 90%, #3d6b2f 0 20%, transparent 21%), linear-gradient(90deg, #c9b8a3 0 12%, #e7d9c4 12% 24%, #8aa1b8 24% 36%, #f1e6d6 36% 50%, #b86c5a 50% 62%, #e9e0cf 62% 76%, #6f8fa8 76% 88%, #d8c7ad 88%), linear-gradient(180deg, #a9c3dc, #f4efe6)";

const stage: CSSProperties = {
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-end",
  width: "24.375rem",
  maxWidth: "100%",
  height: "7.5rem",
  padding: "0 0.875rem 1.125rem",
  borderRadius: "1.25rem",
  border: "1px solid var(--sf-rim-default)",
  background: "var(--sf-surface-0)",
};
const caption: CSSProperties = {
  color: "var(--sf-fg-muted)",
  fontFamily: "var(--sf-font-mono)",
  fontSize: "0.6875rem",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const meta = {
  title: "Components/SelectionToolbar",
  component: SelectionToolbar,
  tags: ["autodocs"],
  parameters: { platform: "ios" },
  args: { actions, count: 3, moreMenu, pinned: false },
  argTypes: {
    actions: { control: false },
    moreMenu: { control: false },
  },
  render: (args) => (
    <div style={stage}>
      <SelectionToolbar {...args} />
    </div>
  ),
} satisfies Meta<typeof SelectionToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Master `Selection Toolbar/iOS` (RtAEo): enabled, Delete in danger. */
export const Default: Story = {};

/** H/A3 step 2 — 0 selected: every action and ••• disabled on the unchanged glass. */
export const NothingSelected: Story = { args: { count: 0 } };

/** Over content: the capsule and ••• are glass. */
export const OverContent: Story = {
  render: (args) => (
    <div style={{ ...stage, background: photo, border: 0 }}>
      <SelectionToolbar {...args} />
    </div>
  ),
};

/**
 * Android + Web: no dedicated master — the same actions in the Android + Web tab-bar grammar. The web flow
 * normally uses `SelectionBar` (top) instead.
 */
export const AndroidWeb: Story = {
  parameters: { platform: "web" },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <span style={caption}>3 selected</span>
      <div style={{ ...stage, height: "8.5rem", padding: "0 1rem 1rem" }}>
        <SelectionToolbar {...args} />
      </div>
      <span style={caption}>0 selected</span>
      <div style={{ ...stage, height: "8.5rem", padding: "0 1rem 1rem" }}>
        <SelectionToolbar {...args} count={0} />
      </div>
    </div>
  ),
};

// ── H/A3 "Header / Selection flow" (frame gQmek) ────────────────────────────

const designs = [
  {
    title: "Mr. Chilly",
    leading: (
      <ListThumbnail tone="accent">
        <Snowflake />
      </ListThumbnail>
    ),
    subtitle: "2.4 s · 60 fps · 512²",
    trailing: "41 KB",
  },
  {
    title: "Robotaxi",
    leading: (
      <ListThumbnail tone="warning">
        <CarTaxiFront />
      </ListThumbnail>
    ),
    subtitle: "3.0 s · 60 fps",
    trailing: <ListStatus icon={<CircleAlert />}>71 KB</ListStatus>,
  },
  {
    title: "Painted Ladies",
    leading: (
      <ListThumbnail tone="danger">
        <House />
      </ListThumbnail>
    ),
    meta: "Three houses, one fog layer and a cable car. Draft — needs a lighter fog pass.",
  },
  {
    title: "Waymo",
    leading: (
      <ListThumbnail tone="accent">
        <Car />
      </ListThumbnail>
    ),
    subtitle: "2.0 s · 60 fps",
    trailing: "44 KB",
  },
];
const stickers = Array.from({ length: 24 }, (_, i) => ({
  ...designs[i % designs.length]!,
  value: `sticker-${i}`,
  title: i < designs.length ? designs[i]!.title : `${designs[i % designs.length]!.title} ${Math.floor(i / designs.length) + 1}`,
}));
const allValues = stickers.map((s) => s.value);

const tabs = [
  { value: "library", label: "Library", icon: <Library /> },
  { value: "player", label: "Player", icon: <Play /> },
  { value: "export", label: "Export", icon: <Upload /> },
  { value: "settings", label: "Settings", icon: <Settings2 /> },
];

// iPhone-sized screen (390 × 760 pt): content scrolls under the floating glass header and bottom chrome.
const phone: CSSProperties = {
  position: "relative",
  boxSizing: "border-box",
  width: "24.375rem",
  maxWidth: "100%",
  height: "47.5rem",
  overflow: "hidden",
  borderRadius: "2.5rem",
  border: "1px solid var(--sf-rim-default)",
  background: "var(--sf-surface-0)",
};
const scroller: CSSProperties = { height: "100%", overflowY: "auto", padding: "0.875rem 0.875rem 7rem" };
const bottomChrome: CSSProperties = {
  position: "absolute",
  insetInline: 0,
  bottom: "1.125rem",
  display: "flex",
  justifyContent: "center",
  padding: "0 0.875rem",
};

interface FlowPhoneProps {
  initialSelecting?: boolean;
  initialSelected?: string[];
}

/** One screen of the flow: Browse (header Select + tab bar) ↔ selecting (Cancel/Select All + toolbar). */
const FlowPhone = ({ initialSelecting = false, initialSelected = [] }: FlowPhoneProps) => {
  const [selecting, setSelecting] = useState(initialSelecting);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [tab, setTab] = useState("library");
  const count = selected.length;
  const exit = () => {
    setSelecting(false);
    setSelected([]);
  };

  return (
    <div style={phone}>
      <div style={scroller}>
        <Header
          title="Foggy Stickers"
          collapsed
          sticky
          onBack={selecting ? undefined : () => {}}
          onStartSelection={() => setSelecting(true)}
          selectionCount={selecting ? count : undefined}
          onCancelSelection={exit}
          allSelected={count === stickers.length}
          onSelectAll={() => setSelected(allValues)}
          onDeselectAll={() => setSelected([])}
        />
        <List
          variant="flat"
          listLabel="Stickers"
          selectable={selecting}
          selectedValues={selected}
          onSelectedValuesChange={setSelected}
          style={{ marginTop: "0.75rem" }}
        >
          {stickers.map(({ value, ...row }) => (
            <ListItem key={value} value={value} {...row} chevron onClick={() => {}} />
          ))}
        </List>
      </div>
      <div style={bottomChrome}>
        {selecting ? (
          <SelectionToolbar
            pinned={false}
            count={count}
            actions={actions.map((a) => ({ ...a, onSelect: a.label === "Delete" ? exit : a.onSelect }))}
            moreMenu={moreMenu}
          />
        ) : (
          <TabBar pinned={false} items={tabs} value={tab} onValueChange={setTab} aria-label="Sections" />
        )}
      </div>
    </div>
  );
};

/**
 * H/A3 at phone width, interactive: tap **Select** → Cancel / "Select Items" / Select All and the tab bar
 * becomes the toolbar (disabled at 0). Tick rows to enable it; Select All ↔ Deselect All; Cancel or Delete
 * returns to Browse.
 */
export const IOSSelectionFlow: Story = {
  name: "iOS Selection Flow",
  parameters: { layout: "centered" },
  render: () => <FlowPhone />,
};

/** H/A3 steps 1–4 side by side: Browse · 0 selected · 2 selected · all selected. */
export const IOSSelectionFlowSteps: Story = {
  name: "iOS Selection Flow · Steps",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", padding: "1rem" }}>
      {[
        { label: "1 · Browse — Select lives in the header", props: {} },
        { label: "2 · Select mode, 0 selected — actions disabled", props: { initialSelecting: true } },
        {
          label: "3 · 2 selected — toolbar enabled",
          props: { initialSelecting: true, initialSelected: ["sticker-0", "sticker-2"] },
        },
        { label: "4 · All selected — Select All → Deselect All", props: { initialSelecting: true, initialSelected: allValues } },
      ].map(({ label, props }) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span style={caption}>{label}</span>
          <FlowPhone {...props} />
        </div>
      ))}
    </div>
  ),
};
