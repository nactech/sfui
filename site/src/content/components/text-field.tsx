import { SearchField, SelectField, TextArea, TextField } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column } from "../shared";

const common = [
  { name: "label", type: "ReactNode", required: true, description: "Floating label inside the field." },
  { name: "helperText", type: "ReactNode", description: "Muted line under the field; replaced by the error message." },
  { name: "error", type: "ReactNode", description: "`true` marks the field invalid; a node also replaces the helper text. Sets aria-invalid / aria-describedby." },
  { name: "disabled", type: "boolean", description: "Opaque disabled look." },
  { name: "required", type: "boolean", description: "Native required." },
];

function Demo({ values }: DemoProps) {
  const error = Boolean(values.error);
  const disabled = Boolean(values.disabled);
  return (
    <Column gap={1} width="min(24rem, 100%)">
      <SearchField label="Search stickers" shortcut="⌘K" disabled={disabled} />
      <TextField
        label="Pack name"
        defaultValue="Foggy Stickers"
        helperText="Shown in Telegram"
        maxCount={32}
        error={error ? "Name is required" : undefined}
        disabled={disabled}
      />
      <TextField label="Link" prefix="t.me/addstickers/" defaultValue="foggy_sf" error={error ? "foggy_sf is already taken" : undefined} disabled={disabled} />
      <SelectField
        label="Frame rate"
        placeholder="Choose…"
        defaultValue="60"
        options={[
          { value: "24", label: "24 fps" },
          { value: "30", label: "30 fps" },
          { value: "60", label: "60 fps" },
        ]}
        disabled={disabled}
      />
      <TextArea label="Description" maxCount={120} autoGrow defaultValue="Foggy San Francisco in 24 stickers." disabled={disabled} />
    </Column>
  );
}

function Preview() {
  return (
    <Column gap={0.75} width="20rem">
      <SearchField label="Search stickers" shortcut="⌘K" />
      <TextField label="Pack name" defaultValue="Foggy Stickers" />
    </Column>
  );
}

// TODO(docs): Usage, Accessibility and a variants gallery (one per kind: text, prefix, search, select, multiline).
const textField: ComponentDoc = {
  slug: "text-field",
  name: "Text fields",
  group: "Inputs",
  summary: "Glass fields with a floating label: TextField, SearchField, SelectField and TextArea.",
  docStatus: "stub",
  status: "stable",
  exports: ["TextField", "SearchField", "SelectField", "TextArea"],
  platformSplit: "shared",
  source: "src/components/Field",
  Demo,
  Preview,
  controls: [
    { type: "boolean", name: "error", label: "Error", default: false },
    { type: "boolean", name: "disabled", label: "Disabled", default: false },
  ],
  overview: { intro: "Four field kinds share one anatomy: a glass container, a floating label, a helper / error line and an optional counter." },
  api: [
    {
      component: "TextField",
      props: [
        ...common,
        { name: "value / defaultValue", type: "string", description: "Controlled or initial text." },
        { name: "onValueChange", type: "(value: string) => void", description: "New text on every change (alongside the native onChange)." },
        { name: "prefix", type: "ReactNode", description: "Fixed text or icon before the value (e.g. t.me/addstickers/)." },
        { name: "maxCount", type: "number", description: "Soft limit with an n/max counter; red and invalid past it. Use maxLength for a hard limit." },
        { name: "ref", type: "Ref<HTMLInputElement>", description: "The native <input>." },
      ],
      extends: "className / style go to the wrapper; every other native <input> attribute goes to the input.",
    },
    {
      component: "SearchField",
      props: [
        { name: "label", type: "string", description: "Accessible name (no visible label) and default placeholder." },
        { name: "value / defaultValue", type: "string", description: "Controlled or initial text." },
        { name: "onValueChange", type: "(value: string) => void", description: "New text." },
        { name: "onClear", type: "() => void", description: "After the clear button or Escape empties the field." },
        { name: "shortcut", type: "ReactNode", description: "Key cap shown while empty, e.g. ⌘K. Visual only — bind it yourself." },
        { name: "helperText / error", type: "ReactNode", description: "Line under the field / invalid state." },
        { name: "size", type: "\"md\" | \"sm\"", default: "\"md\"", description: "48 tall, or 44 (Inset Form search)." },
        { name: "clearLabel", type: "string", description: "Accessible name of the clear button." },
        { name: "disabled", type: "boolean", description: "Opaque disabled look." },
      ],
    },
    {
      component: "SelectField",
      props: [
        ...common,
        { name: "options", type: "SelectOption[]", required: true, description: "`{ value, label, disabled? }` — native <option>s, plain text." },
        { name: "value / defaultValue", type: "string", description: "Controlled or initial value." },
        { name: "onValueChange", type: "(value: string) => void", description: "New value." },
        { name: "placeholder", type: "string", description: "Muted text while nothing is chosen (“Choose…”)." },
      ],
    },
    {
      component: "TextArea",
      props: [
        ...common,
        { name: "value / defaultValue", type: "string", description: "Controlled or initial text." },
        { name: "onValueChange", type: "(value: string) => void", description: "New text." },
        { name: "maxCount", type: "number", description: "Soft limit with a counter." },
        { name: "autoGrow", type: "boolean", description: "Grow with the content instead of scrolling." },
      ],
    },
  ],
  storybook: { title: "Components/Field" },
  related: ["inset-form"],
};

export default textField;
