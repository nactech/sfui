import { useState } from "react";
import { FolderInput, Share, Trash2 } from "lucide-react";
import { Button, SelectionBar } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";

function Demo({ values }: DemoProps) {
  const total = 24;
  const [count, setCount] = useState(2);
  const [everything, setEverything] = useState(false);
  return (
    <div style={{ width: "min(46rem, 100%)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <SelectionBar
        count={everything ? 120 : count}
        total={total}
        sticky={false}
        keyboardShortcuts={false}
        showKeyboardHint={Boolean(values.hint)}
        onSelectAllChange={(all) => {
          setEverything(false);
          setCount(all ? total : 0);
        }}
        onClear={() => {
          setEverything(false);
          setCount(0);
        }}
        itemNoun="stickers"
        scopeTotal={120}
        scopeLabel="Library"
        onSelectEverything={() => setEverything(true)}
        everythingSelected={everything}
        actions={
          <>
            <Button variant="secondary" size="s" leadingIcon={<Share />}>
              Share
            </Button>
            <Button variant="secondary" size="s" leadingIcon={<FolderInput />}>
              Move
            </Button>
            <Button variant="danger" size="s" leadingIcon={<Trash2 />}>
              Delete
            </Button>
          </>
        }
      />
      <div>
        <Button variant="tonal" size="s" onClick={() => setCount((c) => Math.min(total, c + 1))}>
          Select one more
        </Button>
      </div>
    </div>
  );
}

// TODO(docs): Usage, Accessibility and a variants gallery.
const selectionBar: ComponentDoc = {
  slug: "selection-bar",
  name: "SelectionBar",
  group: "Navigation",
  summary: "Web selection header: tri-state select-all, count, actions, ⌘A / Esc and the “select everything” banner.",
  docStatus: "stub",
  status: "stable",
  exports: ["SelectionBar", "useSelectionShortcuts"],
  platformSplit: "shared",
  Demo,
  controls: [{ type: "boolean", name: "hint", label: "Keyboard hint", default: true }],
  overview: { intro: "Replaces the page header while items are selected on the web. Once the page is fully selected it offers the wider scope (“Select all 120 stickers in Library”)." },
  api: [
    {
      component: "SelectionBar",
      props: [
        { name: "count", type: "number", required: true, description: "Number of selected items." },
        { name: "total", type: "number", description: "Selectable items on the page; drives the tri-state checkbox." },
        { name: "allSelected", type: "boolean", description: "Override “everything on the page is selected”." },
        { name: "onSelectAllChange", type: "(checked: boolean) => void", description: "Select-all checkbox (and ⌘/Ctrl+A)." },
        { name: "onClear", type: "() => void", description: "Clear button (and Esc)." },
        { name: "actions", type: "ReactNode", description: "Size-s Buttons: secondary and danger." },
        { name: "countLabel", type: "(count: number) => ReactNode", description: "Count text." },
        { name: "keyboardShortcuts", type: "boolean", default: "true", description: "Wire ⌘/Ctrl+A and Esc on the document." },
        { name: "showKeyboardHint / keyboardHint", type: "boolean / ReactNode", default: "true", description: "The “⌘A all · Esc clear” hint." },
        { name: "sticky", type: "boolean", default: "true", description: "position: sticky; top: 0." },
        { name: "onSelectEverything", type: "() => void", description: "Offer the wider scope once the page is fully selected." },
        { name: "scopeTotal / scopeLabel / itemNoun", type: "number / string / string", description: "Banner wording: “Select all 120 stickers in Library”." },
        { name: "everythingSelected", type: "boolean", description: "The wider scope is selected." },
      ],
    },
  ],
  storybook: { title: "Components/SelectionBar" },
  related: ["list", "header", "selection-toolbar"],
};

export default selectionBar;
