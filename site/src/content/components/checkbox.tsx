import { useState } from "react";
import { Checkbox, type CheckboxState } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column } from "../shared";

const PACKS = ["Mr. Chilly", "Robotaxi", "Painted Ladies"];

function Demo({ values }: DemoProps) {
  const [checked, setChecked] = useState<boolean[]>([true, false, true]);
  const all: CheckboxState = checked.every(Boolean) ? true : checked.some(Boolean) ? "mixed" : false;
  const disabled = Boolean(values.disabled);
  return (
    <Column gap={0.25} width="auto">
      <Checkbox label="All stickers" checked={all} disabled={disabled} onCheckedChange={(next) => setChecked(checked.map(() => next))} />
      <div style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {PACKS.map((name, i) => (
          <Checkbox
            key={name}
            label={name}
            checked={checked[i]}
            disabled={disabled}
            onCheckedChange={(next) => setChecked(checked.map((c, j) => (j === i ? next : c)))}
          />
        ))}
      </div>
    </Column>
  );
}

// TODO(docs): Usage, Accessibility and a variants gallery.
const checkbox: ComponentDoc = {
  slug: "checkbox",
  name: "Checkbox",
  group: "Actions & selection",
  summary: "Multiple choice from a set, with a mixed state for select-all.",
  docStatus: "stub",
  status: "stable",
  exports: ["Checkbox"],
  platformSplit: "shared",
  Demo,
  controls: [{ type: "boolean", name: "disabled", label: "Disabled", default: false }],
  overview: { intro: "A native checkbox in a 40×40 target. `checked=\"mixed\"` draws the dash and exposes aria-checked=\"mixed\" — the parent of a partly selected set." },
  api: [
    {
      component: "Checkbox",
      props: [
        { name: "checked", type: "boolean | \"mixed\"", description: "Controlled state. `\"mixed\"` renders the dash." },
        { name: "defaultChecked", type: "boolean | \"mixed\"", default: "false", description: "Initial state when uncontrolled." },
        { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Every user toggle. Activating a mixed checkbox checks it." },
        { name: "label", type: "ReactNode", description: "Visible label after the target; its accessible name." },
        { name: "disabled", type: "boolean", description: "Opaque disabled look." },
        { name: "ref", type: "Ref<HTMLInputElement>", description: "The native <input type=\"checkbox\">." },
      ],
      extends: "Other native <input> attributes go to the input.",
    },
  ],
  storybook: { title: "Components/Checkbox" },
  related: ["switch", "radio", "selection-bar"],
};

export default checkbox;
