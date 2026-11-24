import { useState } from "react";
import { Copy, Download, Pencil, Share, Trash2 } from "lucide-react";
import { Button, Header, HeaderAction, MenuItem, PageHeader } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column } from "../shared";

const overflow = (
  <>
    <MenuItem icon={<Pencil />}>Rename</MenuItem>
    <MenuItem icon={<Copy />}>Duplicate</MenuItem>
    <MenuItem icon={<Download />}>Export</MenuItem>
  </>
);

function Stubs() {
  return (
    <div style={{ display: "flex", gap: "0.625rem" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ flex: 1, height: "3.5rem", borderRadius: "0.875rem", border: "1px solid var(--sf-rim-default)", background: "var(--sf-surface-1)" }} />
      ))}
    </div>
  );
}

function Demo({ values }: DemoProps) {
  const [count, setCount] = useState(0);
  const selecting = Boolean(values.selection);
  return (
    <Column gap={0.875} width="min(26rem, 100%)">
      <Header
        title="Foggy Stickers"
        subtitle="24 stickers · updated today"
        collapsed={Boolean(values.collapsed)}
        onBack={() => {}}
        actions={<HeaderAction aria-label="Share" icon={<Share />} />}
        overflowMenu={overflow}
        selectionCount={selecting ? count : undefined}
        onCancelSelection={() => setCount(0)}
        onSelectAll={() => setCount(24)}
        onDeselectAll={() => setCount(0)}
        allSelected={count === 24}
        selectionActions={<HeaderAction aria-label="Delete" icon={<Trash2 />} />}
      />
      {selecting && (
        <Button variant="tonal" size="s" onClick={() => setCount((c) => Math.min(24, c + 1))}>
          Select one more
        </Button>
      )}
      <Stubs />
    </Column>
  );
}

// TODO(docs): Usage, Accessibility and a variants gallery (expanded, collapsed, auto-collapse, selection, PageHeader).
const header: ComponentDoc = {
  slug: "header",
  name: "Header",
  group: "Navigation",
  summary: "The screen header: glass back button and action capsule, a large title that docks when you scroll, selection mode.",
  docStatus: "stub",
  status: "stable",
  exports: ["Header", "HeaderAction", "PageHeader"],
  platformSplit: "split",
  Demo,
  controls: [
    { type: "boolean", name: "collapsed", label: "Collapsed", default: false },
    { type: "boolean", name: "selection", label: "Selection mode", default: false },
  ],
  overview: { intro: "No bar background: glass capsules float over the content. iOS docks the title into a centred glass pill and keeps only Cancel / Select All in selection mode. PageHeader is the wide in-page web header with breadcrumbs." },
  variants: [
    {
      name: "PageHeader · Web wide",
      description: "Breadcrumbs, a 28px title, a description and real Buttons on the right.",
      render: () => (
        <div style={{ width: "min(44rem, 100%)" }}>
          <PageHeader
            breadcrumbs={[{ label: "Library", href: "#" }, { label: "Foggy Stickers" }]}
            title="Foggy Stickers"
            description="24 stickers · updated today"
            actions={
              <>
                <Button variant="secondary" size="s">
                  Share
                </Button>
                <Button size="s" leadingIcon={<Download />}>
                  Export
                </Button>
              </>
            }
          />
        </div>
      ),
    },
  ],
  api: [
    {
      component: "Header",
      props: [
        { name: "title", type: "ReactNode", required: true, description: "Large title when expanded, docked when collapsed (iOS: centred glass pill)." },
        { name: "subtitle", type: "ReactNode", description: "Muted line under the large title." },
        { name: "titleAs", type: "\"h1\" … \"h6\"", default: "\"h1\"", description: "Heading level." },
        { name: "onBack / backHref", type: "(event) => void / string", description: "Renders the glass back button (button / link)." },
        { name: "backLabel", type: "string", default: "\"Back\"", description: "Accessible name of back." },
        { name: "backIcon", type: "ReactNode", default: "ArrowLeft (iOS: ChevronLeft)", description: "Back glyph." },
        { name: "actions", type: "ReactNode", description: "HeaderActions in the glass action capsule." },
        { name: "overflowMenu", type: "ReactNode", description: "MenuItems for the ⋮ overflow (iOS: •••)." },
        { name: "collapsed", type: "boolean | \"auto\"", default: "false", description: "Expanded, collapsed, or docks once the large title scrolls under the bar." },
        { name: "scrollContainer", type: "HTMLElement | null", default: "viewport", description: "Watched by collapsed=\"auto\"." },
        { name: "sticky", type: "boolean", description: "Keep the bar pinned while the large title scrolls away." },
        { name: "selectionCount", type: "number", description: "Selection mode when defined." },
        { name: "onCancelSelection / onSelectAll / onDeselectAll", type: "() => void", description: "Selection mode handlers." },
        { name: "allSelected", type: "boolean", description: "Flips Select all ↔ Deselect all." },
        { name: "selectionActions", type: "ReactNode", description: "HeaderActions for the selection.", platform: "android-web" },
        { name: "selectionOverflowMenu", type: "ReactNode", description: "More MenuItems in the selection ⋮.", platform: "android-web" },
        { name: "onStartSelection", type: "() => void", description: "Glass “Select” text button (Browse).", platform: "ios" },
        { name: "platform", type: "\"auto\" | \"ios\" | \"android\" | \"web\"", default: "ConfigProvider", description: "Force one implementation." },
      ],
    },
    {
      component: "HeaderAction",
      props: [
        { name: "icon", type: "ReactNode", required: true, description: "Lucide icon (19)." },
        { name: "aria-label", type: "string", required: true, description: "Icon-only buttons need a name." },
      ],
    },
    {
      component: "PageHeader",
      props: [
        { name: "title", type: "ReactNode", required: true, description: "28px title." },
        { name: "breadcrumbs", type: "PageHeaderCrumb[]", description: "Trail; the last crumb is the current page." },
        { name: "description", type: "ReactNode", description: "Muted line under the title." },
        { name: "actions", type: "ReactNode", description: "Size-s Buttons on the right." },
      ],
    },
  ],
  storybook: { title: "Components/Header" },
  related: ["menu", "selection-bar", "selection-toolbar"],
};

export default header;
