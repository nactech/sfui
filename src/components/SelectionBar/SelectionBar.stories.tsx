import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { Download, Ellipsis, FolderInput, Share2, Trash2 } from "lucide-react";
import SelectionBar from "./index";
import Button from "../Button";
import Checkbox from "../Checkbox";
import Menu, { MenuItem } from "../Menu";
import { PageHeader } from "../Header";

// j5xOq "Desktop": black, rim/strong, radius 18, padding 20, gap 12.
const desktop: CSSProperties = {
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  width: "48rem",
  maxWidth: "100%",
  padding: "1.25rem",
  border: "1px solid var(--sf-rim-strong)",
  borderRadius: "1.125rem",
  background: "var(--sf-surface-0)",
};

const actions = (
  <>
    <Button variant="secondary" size="s" leadingIcon={<Share2 />}>
      Share
    </Button>
    <Button variant="secondary" size="s" leadingIcon={<FolderInput />}>
      Move
    </Button>
    <Button variant="danger" size="s" leadingIcon={<Trash2 />}>
      Delete
    </Button>
  </>
);

const meta = {
  title: "Components/SelectionBar",
  component: SelectionBar,
  tags: ["autodocs"],
  args: {
    count: 2,
    total: 24,
    actions,
    itemNoun: "stickers",
    scopeTotal: 120,
    scopeLabel: "Library",
    onSelectEverything: () => {},
    keyboardShortcuts: false,
  },
  argTypes: { actions: { control: false } },
} satisfies Meta<typeof SelectionBar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Step 6 · Selecting: mixed select-all. */
export const Selecting: Story = {
  render: (args) => (
    <div style={desktop}>
      <SelectionBar {...args} />
    </div>
  ),
};

/** Step 7 · All selected: checkbox full, banner offers the wider scope. */
export const AllSelected: Story = {
  args: { count: 24 },
  render: (args) => (
    <div style={desktop}>
      <SelectionBar {...args} />
    </div>
  ),
};

export const EverythingSelected: Story = {
  args: { count: 120, everythingSelected: true },
  render: (args) => (
    <div style={desktop}>
      <SelectionBar {...args} />
    </div>
  ),
};

const items = ["Mr. Chilly", "Robotaxi", "Painted Ladies", "Waymo", "Cable Car", "Golden Gate", "Coit Tower", "Ferry"];

// Mock rows only to show how the pieces combine — the real rows (hover-revealed checkboxes,
// Shift-click ranges) belong to List.
const row: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  minHeight: "4.5rem",
  padding: "0 0.75rem",
  borderRadius: "0.875rem",
  color: "var(--sf-fg-default)",
  fontFamily: "var(--sf-font-sans)",
};

/**
 * H/A4 web steps 5–7: the page header is replaced by the sticky SelectionBar as soon as something is
 * selected; ⌘/Ctrl+A selects all, Esc clears; the banner extends the selection to the Library.
 */
export const Flow: Story = {
  args: { keyboardShortcuts: true },
  render: function FlowStory() {
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [everything, setEverything] = useState(false);
    const [hovered, setHovered] = useState<number | null>(null);
    const total = items.length;
    const count = everything ? 120 : selected.size;
    const selectAll = () => setSelected(new Set(items.map((_, i) => i)));
    const clear = () => {
      setSelected(new Set());
      setEverything(false);
    };
    const toggle = (i: number, on: boolean) => {
      setEverything(false);
      setSelected((prev) => {
        const next = new Set(prev);
        if (on) next.add(i);
        else next.delete(i);
        return next;
      });
    };

    return (
      <div style={{ ...desktop, height: "30rem", overflowY: "auto", display: "block" }}>
        {count > 0 ? (
          <SelectionBar
            count={count}
            total={total}
            everythingSelected={everything}
            onSelectAllChange={(on) => (on ? selectAll() : clear())}
            onClear={clear}
            actions={actions}
            itemNoun="stickers"
            scopeTotal={120}
            scopeLabel="Library"
            onSelectEverything={() => setEverything(true)}
          />
        ) : (
          <PageHeader
            breadcrumbs={[{ label: "Library", href: "#" }, { label: "Foggy Stickers" }]}
            title="Foggy Stickers"
            description={`${total} stickers · updated today`}
            actions={
              <>
                <Menu trigger={<Button variant="ghost" size="s" iconOnly aria-label="More" leadingIcon={<Ellipsis />} />}>
                  <MenuItem onSelect={selectAll}>Select all</MenuItem>
                </Menu>
                <Button variant="secondary" size="s">
                  Share
                </Button>
                <Button variant="primary" size="s" leadingIcon={<Download />}>
                  Export
                </Button>
              </>
            }
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.75rem" }}>
          {items.map((name, i) => {
            const on = everything || selected.has(i);
            const reveal = on || count > 0 || hovered === i;
            return (
              <div
                key={name}
                style={{ ...row, background: on || hovered === i ? "var(--sf-surface-1)" : "transparent" }}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
              >
                <span style={{ visibility: reveal ? "visible" : "hidden", display: "inline-flex" }}>
                  <Checkbox aria-label={`Select ${name}`} checked={on} onCheckedChange={(next) => toggle(i, next)} />
                </span>
                <span>{name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
