import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { Copy, Download, Ellipsis, FolderInput, Pencil, Share2, Trash2 } from "lucide-react";
import Header, { HeaderAction, PageHeader } from "./index";
import Button from "../Button";
import Menu, { MenuItem } from "../Menu";

// Stand-in for the Painted Ladies photo strip in rows 2 and 4 (local gradient, no remote images).
const photo =
  "radial-gradient(circle at 18% 80%, #4f7a3a 0 16%, transparent 17%), radial-gradient(circle at 72% 90%, #3d6b2f 0 20%, transparent 21%), linear-gradient(90deg, #c9b8a3 0 12%, #e7d9c4 12% 24%, #8aa1b8 24% 36%, #f1e6d6 36% 50%, #b86c5a 50% 62%, #e9e0cf 62% 76%, #6f8fa8 76% 88%, #d8c7ad 88%), linear-gradient(180deg, #a9c3dc, #f4efe6)";

// p6Vvp "Stage": black, rim/default, radius 20, padding 14 16 16.
const stage: CSSProperties = {
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: "0.875rem",
  width: "32.5rem",
  maxWidth: "100%",
  padding: "0.875rem 1rem 1rem",
  border: "1px solid var(--sf-rim-default)",
  borderRadius: "1.25rem",
  background: "var(--sf-surface-0)",
  overflow: "hidden",
};
const photoStage: CSSProperties = { ...stage, height: "6.25rem", border: 0, background: photo };
const caption: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  width: "32.5rem",
  maxWidth: "100%",
  color: "var(--sf-fg-muted)",
  fontFamily: "var(--sf-font-mono)",
  fontSize: "0.6875rem",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
const stubs = (
  <div style={{ display: "flex", gap: "0.625rem" }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          flex: 1,
          height: "3.5rem",
          borderRadius: "0.875rem",
          border: "1px solid var(--sf-rim-default)",
          background: "var(--sf-surface-1)",
        }}
      />
    ))}
  </div>
);

const share = <HeaderAction aria-label="Share" icon={<Share2 />} />;
const overflow = (
  <>
    <MenuItem icon={<Pencil />}>Rename</MenuItem>
    <MenuItem icon={<Copy />}>Duplicate</MenuItem>
    <MenuItem icon={<Download />}>Export</MenuItem>
  </>
);
const selectionOverflow = (
  <>
    <MenuItem icon={<FolderInput />}>Move to…</MenuItem>
    <MenuItem icon={<Copy />}>Duplicate</MenuItem>
    <MenuItem icon={<Download />}>Export</MenuItem>
  </>
);
const selectionActions = (
  <>
    <HeaderAction aria-label="Share" icon={<Share2 />} />
    <HeaderAction aria-label="Delete" icon={<Trash2 />} />
  </>
);

const pageActions = (
  <>
    <Menu trigger={<Button variant="ghost" size="s" iconOnly aria-label="More" leadingIcon={<Ellipsis />} />}>
      {overflow}
    </Menu>
    <Button variant="secondary" size="s">
      Share
    </Button>
    <Button variant="primary" size="s" leadingIcon={<Download />}>
      Export
    </Button>
  </>
);

const meta = {
  title: "Components/Header",
  component: Header,
  tags: ["autodocs"],
  args: {
    title: "Foggy Stickers",
    subtitle: "24 stickers · updated today",
    onBack: () => {},
    actions: share,
    overflowMenu: overflow,
  },
  argTypes: {
    collapsed: { control: "inline-radio", options: [false, true, "auto"] },
    actions: { control: false },
    overflowMenu: { control: false },
    selectionActions: { control: false },
    selectionOverflowMenu: { control: false },
  },
} satisfies Meta<typeof Header>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div style={stage}>
      <Header {...args} />
      {stubs}
    </div>
  ),
};

/** Mirrors frame H/A2 (p6Vvp), rows 1–5. */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <span style={caption}>1 · Expanded</span>
      <div style={stage}>
        <Header title="Foggy Stickers" subtitle="24 stickers · updated today" onBack={() => {}} actions={share} overflowMenu={overflow} />
        {stubs}
      </div>

      <span style={caption}>
        <span>2 · Collapsed</span>
        <span style={{ textTransform: "none" }}>title docks next to back</span>
      </span>
      <div style={photoStage}>
        <Header title="Foggy Stickers" collapsed onBack={() => {}} actions={share} overflowMenu={overflow} />
      </div>

      <span style={caption}>3 · Long title</span>
      <div style={stage}>
        <Header
          title="Foggy San Francisco — Winter Edition"
          subtitle="24 stickers · updated today"
          onBack={() => {}}
          actions={share}
          overflowMenu={overflow}
        />
        <Header
          title="Foggy San Francisco — Winter Edition"
          titleAs="h2"
          collapsed
          onBack={() => {}}
          actions={share}
          overflowMenu={overflow}
        />
      </div>

      <span style={caption}>4 · Selection mode</span>
      <div style={photoStage}>
        <Header
          title="Foggy Stickers"
          collapsed
          selectionCount={3}
          onCancelSelection={() => {}}
          selectionActions={selectionActions}
          onSelectAll={() => {}}
          selectionOverflowMenu={selectionOverflow}
        />
      </div>

      <span style={caption}>
        <span>5 · Web wide — in-page header</span>
        <span style={{ textTransform: "none" }}>breadcrumbs + buttons</span>
      </span>
      <div style={stage}>
        <PageHeader
          breadcrumbs={[{ label: "Library", href: "#" }, { label: "Foggy Stickers" }]}
          title="Foggy Stickers"
          description="24 stickers · updated today"
          actions={pageActions}
        />
        {stubs}
      </div>
    </div>
  ),
};

/** Rows 2 and 4 over a photo: the capsules are glass, content shows through between them. */
export const OverContent: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={photoStage}>
        <Header title="Foggy Stickers" collapsed onBack={() => {}} actions={share} overflowMenu={overflow} />
      </div>
      <div style={photoStage}>
        <Header
          title="Foggy Stickers"
          selectionCount={3}
          onCancelSelection={() => {}}
          selectionActions={selectionActions}
          onSelectAll={() => {}}
          selectionOverflowMenu={selectionOverflow}
        />
      </div>
    </div>
  ),
};

/** `collapsed="auto"` + `sticky` in a scroll container: scroll and the title docks next to back. */
export const AutoCollapse: Story = {
  render: function AutoCollapseStory() {
    const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
    return (
      <div ref={setScroller} style={{ ...stage, height: "26rem", overflowY: "auto", display: "block" }}>
        <Header
          title="Foggy San Francisco — Winter Edition"
          subtitle="24 stickers · updated today"
          onBack={() => {}}
          actions={share}
          overflowMenu={overflow}
          collapsed="auto"
          sticky
          scrollContainer={scroller}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginTop: "0.875rem" }}>
          {Array.from({ length: 14 }, (_, i) => (
            <div
              key={i}
              style={{
                height: "4.5rem",
                borderRadius: "0.875rem",
                background: i % 3 === 0 ? photo : "var(--sf-surface-1)",
                border: "1px solid var(--sf-rim-default)",
              }}
            />
          ))}
        </div>
      </div>
    );
  },
};

/** H/A4 Android steps 2–4: contextual header; ⋮ → Select all flips to Deselect all. */
export const SelectionMode: Story = {
  render: function SelectionModeStory() {
    const total = 24;
    const [count, setCount] = useState(2);
    const selecting = count > 0;
    return (
      <div style={stage}>
        <Header
          title="Foggy Stickers"
          collapsed
          onBack={() => {}}
          actions={share}
          overflowMenu={overflow}
          selectionCount={selecting ? count : undefined}
          onCancelSelection={() => setCount(0)}
          selectionActions={selectionActions}
          allSelected={count === total}
          onSelectAll={() => setCount(total)}
          onDeselectAll={() => setCount(0)}
          selectionOverflowMenu={selectionOverflow}
        />
        <Button variant="tonal" size="s" onClick={() => setCount((c) => Math.min(total, c + 1))}>
          Select one more
        </Button>
      </div>
    );
  },
};

export const WebPageHeader: Story = {
  render: () => (
    <div style={{ ...stage, width: "48rem" }}>
      <PageHeader
        breadcrumbs={[{ label: "Library", href: "#" }, { label: "Foggy Stickers" }]}
        title="Foggy Stickers"
        description="24 stickers · updated today"
        actions={pageActions}
      />
      {stubs}
    </div>
  ),
};
