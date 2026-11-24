import { InsetForm, InsetFormRow, InsetFormSearch, InsetFormSelectRow, InsetFormTextAreaRow } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column } from "../shared";

function Demo({ values }: DemoProps) {
  const error = Boolean(values.error);
  return (
    <Column gap={0.875} width="min(30rem, 100%)">
      <InsetFormSearch label="Search stickers" shortcut="⌘K" />
      <InsetForm
        title="Pack"
        footer="Name and link are shown in Telegram. The link can't be changed later."
        disabled={Boolean(values.disabled)}
      >
        <InsetFormRow label="Name" placeholder="Name your pack" defaultValue="Foggy Stickers" error={error ? "Name is required" : undefined} />
        <InsetFormRow label="Link" prefix="t.me/addstickers/" placeholder="short_name" defaultValue="foggy_sf" />
        <InsetFormSelectRow
          label="Frame rate"
          placeholder="Choose…"
          defaultValue="60"
          options={[
            { value: "24", label: "24 fps" },
            { value: "30", label: "30 fps" },
            { value: "60", label: "60 fps" },
          ]}
        />
        <InsetFormTextAreaRow label="Description" maxCount={120} defaultValue="Foggy San Francisco in 24 stickers." />
      </InsetForm>
    </Column>
  );
}

// TODO(docs): Usage, Accessibility and a variants gallery.
const insetForm: ComponentDoc = {
  slug: "inset-form",
  name: "InsetForm",
  group: "Inputs",
  summary: "Settings-style grouped rows: label on the left, control on the right, a footer note under the group.",
  docStatus: "stub",
  status: "stable",
  exports: ["InsetForm", "InsetFormRow", "InsetFormSelectRow", "InsetFormTextAreaRow", "InsetFormSearch"],
  platformSplit: "shared",
  Demo,
  controls: [
    { type: "boolean", name: "error", label: "Error", default: false },
    { type: "boolean", name: "disabled", label: "Disabled", default: false },
  ],
  overview: { intro: "One surface/1 group of rows with inset hairlines — the dense form layout for settings and metadata." },
  api: [
    {
      component: "InsetForm",
      props: [
        { name: "title", type: "ReactNode", description: "Group header above the rows; names the group." },
        { name: "footer", type: "ReactNode", description: "Note under the rows; describes the group." },
        { name: "disabled", type: "boolean", description: "Disables every row inside." },
        { name: "children", type: "ReactNode", description: "InsetFormRow, InsetFormSelectRow, InsetFormTextAreaRow." },
      ],
    },
    {
      component: "InsetFormRow",
      description: "Text row. Shares label / error / helperText / disabled / required with the other rows.",
      props: [
        { name: "label", type: "ReactNode", required: true, description: "Row label on the left (96 wide)." },
        { name: "error", type: "ReactNode", description: "`true` marks it invalid; a node is shown as the error line." },
        { name: "helperText", type: "ReactNode", description: "Muted line under the control (prefer the group footer)." },
        { name: "value / defaultValue", type: "string", description: "Controlled or initial text." },
        { name: "onValueChange", type: "(value: string) => void", description: "New text." },
        { name: "prefix", type: "ReactNode", description: "Fixed text or icon before the value." },
      ],
    },
    {
      component: "InsetFormSelectRow",
      props: [
        { name: "options", type: "SelectOption[]", required: true, description: "Native options; value right-aligned with chevrons." },
        { name: "placeholder", type: "string", description: "Muted text while nothing is chosen." },
        { name: "value / defaultValue / onValueChange", type: "string", description: "Selection." },
      ],
    },
    {
      component: "InsetFormTextAreaRow",
      props: [
        { name: "maxCount", type: "number", description: "Counter next to the label." },
        { name: "autoGrow", type: "boolean", default: "true", description: "Grow with the content." },
      ],
    },
    {
      component: "InsetFormSearch",
      description: "SearchField at size \"sm\" (44 tall) — the capsule above a group.",
      props: [{ name: "…SearchFieldProps", type: "Omit<SearchFieldProps, \"size\">", description: "See SearchField." }],
    },
  ],
  storybook: { title: "Components/InsetForm" },
  related: ["text-field", "list"],
};

export default insetForm;
