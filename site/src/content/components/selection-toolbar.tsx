import { Copy, Download, FolderInput, Share, Tag, Trash2 } from "lucide-react";
import { MenuItem, SelectionToolbar, type SelectionToolbarAction } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";

const actions: SelectionToolbarAction[] = [
  { label: "Share", icon: <Share />, onSelect: () => {} },
  { label: "Move", icon: <FolderInput />, onSelect: () => {} },
  { label: "Duplicate", icon: <Copy />, onSelect: () => {} },
  { label: "Delete", icon: <Trash2 />, onSelect: () => {}, destructive: true },
];

function Demo({ values }: DemoProps) {
  return (
    <div style={{ width: "min(24rem, 100%)", display: "flex", justifyContent: "center" }}>
      <SelectionToolbar
        actions={actions}
        count={Number(values.count)}
        pinned={false}
        moreMenu={
          <>
            <MenuItem icon={<Download />}>Export</MenuItem>
            <MenuItem icon={<Tag />}>Add tag</MenuItem>
          </>
        }
      />
    </div>
  );
}

// TODO(docs): Usage, Accessibility and a variants gallery.
const selectionToolbar: ComponentDoc = {
  slug: "selection-toolbar",
  name: "SelectionToolbar",
  group: "Navigation",
  summary: "iOS bottom toolbar of actions for the selected items, replacing the tab bar in edit mode.",
  docStatus: "stub",
  status: "stable",
  exports: ["SelectionToolbar"],
  platformSplit: "ios",
  stage: "photo",
  Demo,
  controls: [{ type: "number", name: "count", label: "Selected", min: 0, max: 24, default: 3 }],
  overview: { intro: "A glass capsule of icon-over-label actions plus a round ••• for the rest. Pair it with Header in selection mode, which on iOS keeps only Cancel and Select All. On Android + Web it renders in the tab-bar grammar; the web flow usually uses SelectionBar instead." },
  api: [
    {
      component: "SelectionToolbar",
      props: [
        { name: "actions", type: "SelectionToolbarAction[]", required: true, description: "`{ label, icon, onSelect, destructive?, disabled? }` — about four." },
        { name: "count", type: "number", description: "Selected items. At 0 every action (and •••) is disabled." },
        { name: "moreMenu", type: "ReactNode", description: "MenuItems for the round ••• button; omit to hide it." },
        { name: "moreLabel", type: "string", default: "\"More actions\"", description: "Name of the ••• button." },
        { name: "disabled", type: "boolean", default: "false", description: "Disable the whole toolbar." },
        { name: "pinned", type: "boolean", default: "true", description: "Fixed at the bottom centre above the home indicator; `false` renders in flow." },
        { name: "aria-label", type: "string", default: "\"Selection actions\"", description: "Toolbar name." },
        { name: "platform", type: "\"auto\" | \"ios\" | \"android\" | \"web\"", default: "ConfigProvider", description: "Force one implementation." },
      ],
    },
  ],
  storybook: { title: "Components/SelectionToolbar" },
  related: ["header", "list", "tabbar"],
};

export default selectionToolbar;
