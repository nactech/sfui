import { InsetForm, InsetFormRow, InsetFormSearch, InsetFormSelectRow, InsetFormTextAreaRow, type SelectOption } from "@nactech/sfui";
import type { ComponentDoc, DemoProps, PropDoc } from "../types";
import { Column } from "../shared";

const FPS: SelectOption[] = [
  { value: "24", label: "24 fps" },
  { value: "30", label: "30 fps" },
  { value: "60", label: "60 fps" },
];
const FORMATS: SelectOption[] = [
  { value: "tgs", label: ".tgs" },
  { value: "webm", label: ".webm" },
  { value: "lottie", label: "Lottie JSON" },
];

const FOOTER = "Name and link are shown in Telegram. The link can’t be changed later.";
const DESCRIPTION = "Foggy San Francisco in 24 stickers — Mr. Chilly, Robotaxi, Painted Ladies and more.";

function Demo({ values }: DemoProps) {
  const error = Boolean(values.error);
  return (
    <Column gap={0.875} width="min(30rem, 100%)">
      {Boolean(values.search) && <InsetFormSearch label="Search settings" shortcut="⌘K" disabled={Boolean(values.disabled)} />}
      <InsetForm title={values.title ? "Pack" : undefined} footer={values.footer ? FOOTER : undefined} disabled={Boolean(values.disabled)}>
        <InsetFormRow label="Name" placeholder="Name your pack" defaultValue="Foggy Stickers" error={error ? "Name is required" : undefined} />
        <InsetFormRow label="Link" prefix="t.me/addstickers/" placeholder="short_name" defaultValue="foggy_sf" error={error ? "foggy_sf is already taken" : undefined} />
        <InsetFormSelectRow label="Frame rate" placeholder="Choose…" defaultValue="60" options={FPS} />
        <InsetFormTextAreaRow label="Description" placeholder="What’s in the pack?" maxCount={120} defaultValue={DESCRIPTION} />
      </InsetForm>
    </Column>
  );
}

function Preview() {
  return (
    <Column width="22rem">
      <InsetForm>
        <InsetFormRow label="Name" defaultValue="Foggy Stickers" />
        <InsetFormRow label="Link" prefix="t.me/addstickers/" defaultValue="foggy_sf" />
        <InsetFormSelectRow label="Frame rate" options={FPS} defaultValue="60" />
      </InsetForm>
    </Column>
  );
}

/** Two groups the way a real settings screen stacks them. */
function SettingsScreen() {
  return (
    <Column gap={1.5} width="min(26rem, 100%)">
      <InsetForm title="Pack" footer={FOOTER}>
        <InsetFormRow label="Name" defaultValue="Foggy Stickers" />
        <InsetFormRow label="Link" prefix="t.me/addstickers/" defaultValue="foggy_sf" />
      </InsetForm>
      <InsetForm title="Export" footer="Telegram plays stickers at up to 60 fps.">
        <InsetFormSelectRow label="Format" options={FORMATS} defaultValue="tgs" />
        <InsetFormSelectRow label="Frame rate" options={FPS} defaultValue="60" />
      </InsetForm>
    </Column>
  );
}

const rowCommon: PropDoc[] = [
  { name: "label", type: "ReactNode", required: true, description: "Row label on the left (96 wide; on top for the multiline row)." },
  { name: "error", type: "ReactNode", description: "`true` marks the row invalid (danger label + alert icon); a string or node is also shown as the error line under the control." },
  { name: "helperText", type: "ReactNode", description: "Muted line under the control. Prefer the group `footer`." },
  { name: "disabled", type: "boolean", default: "group’s", description: "Defaults to the InsetForm’s `disabled`; set it on a row to override the group either way." },
  { name: "required", type: "boolean", description: "Native `required` on the control." },
];

const insetForm: ComponentDoc = {
  slug: "inset-form",
  name: "InsetForm",
  group: "Inputs",
  summary: "Settings-style grouped rows: label on the left, control on the right, a footer note under the group.",
  docStatus: "complete",
  status: "stable",
  exports: ["InsetForm", "InsetFormRow", "InsetFormSelectRow", "InsetFormTextAreaRow", "InsetFormSearch"],
  platformSplit: "shared",
  Demo,
  Preview,
  controls: [
    { type: "boolean", name: "title", label: "Group title", default: true },
    { type: "boolean", name: "footer", label: "Footer note", default: true },
    { type: "boolean", name: "search", label: "Search capsule", default: false },
    { type: "boolean", name: "error", label: "Error", default: false },
    { type: "boolean", name: "disabled", label: "Disabled", default: false },
  ],
  code: (v) =>
    `import { InsetForm, InsetFormRow, InsetFormSelectRow, InsetFormTextAreaRow${v.search ? ", InsetFormSearch" : ""} } from "@nactech/sfui";
${v.search ? `\n<InsetFormSearch label="Search settings" shortcut="⌘K"${v.disabled ? " disabled" : ""} />` : ""}
<InsetForm${v.title ? '\n  title="Pack"' : ""}${v.footer ? `\n  footer="${FOOTER}"` : ""}${v.disabled ? "\n  disabled" : ""}${v.title || v.footer || v.disabled ? "\n" : ""}>
  <InsetFormRow label="Name" placeholder="Name your pack" value={name} onValueChange={setName}${v.error ? ' error="Name is required"' : ""} />
  <InsetFormRow label="Link" prefix="t.me/addstickers/" value={link} onValueChange={setLink}${v.error ? ' error="foggy_sf is already taken"' : ""} />
  <InsetFormSelectRow label="Frame rate" options={fps} value={rate} onValueChange={setRate} />
  <InsetFormTextAreaRow label="Description" maxCount={120} value={about} onValueChange={setAbout} />
</InsetForm>`,

  overview: {
    intro: (
      <>
        InsetForm is the dense form layout of settings and metadata screens: rows grouped on one surface with inset
        hairlines, the label on the left and the value on the right. A title names the group, a footer explains it, and
        focus lifts the active row one surface step instead of drawing a rim. Four row kinds — text (with an optional
        prefix), select, multiline and a separate search capsule — share the validation and disabled behaviour of the text
        fields.
      </>
    ),
    whenToUse: [
      "Settings screens and object details: pack name, link, frame rate, description.",
      "Many short values that people scan and edit one at a time.",
      "Grouping related settings, each group with a title and a footer note.",
      "`InsetFormSearch` above the groups to filter long settings screens.",
    ],
    whenNotToUse: [
      "Short standalone forms (sign-up, a single dialog field) or long labels — use the text fields.",
      "On / off settings and lists of navigation rows — use List with Switch rows.",
      "Choosing a value from a range — use Slider.",
      "Content that is read rather than edited — use List.",
    ],
  },

  variants: [
    {
      name: "Rows",
      description: "Text, prefix, select (value right-aligned with ChevronsUpDown) and multiline (label and counter on top).",
      render: () => (
        <Column width="min(24rem, 100%)">
          <InsetForm aria-label="Pack details">
            <InsetFormRow label="Name" placeholder="Name your pack" />
            <InsetFormRow label="Link" prefix="t.me/addstickers/" placeholder="short_name" />
            <InsetFormSelectRow label="Frame rate" options={FPS} placeholder="Choose…" />
            <InsetFormTextAreaRow label="Description" placeholder="What’s in the pack?" maxCount={120} />
          </InsetForm>
        </Column>
      ),
    },
    {
      name: "Title and footer",
      description: "The title names the group, the footer describes it — both are wired to the group for screen readers.",
      render: () => (
        <Column width="min(24rem, 100%)">
          <InsetForm title="Pack" footer={FOOTER}>
            <InsetFormRow label="Name" defaultValue="Foggy Stickers" />
            <InsetFormRow label="Link" prefix="t.me/addstickers/" defaultValue="foggy_sf" />
          </InsetForm>
        </Column>
      ),
    },
    {
      name: "Several groups",
      description: "A settings screen is a stack of groups, 1.5rem apart, each with its own footer.",
      render: () => <SettingsScreen />,
    },
    {
      name: "Search",
      description: "`InsetFormSearch`: the 44-tall glass search capsule that sits above the groups.",
      render: () => (
        <Column gap={0.875} width="min(24rem, 100%)">
          <InsetFormSearch label="Search settings" shortcut="⌘K" />
          <InsetForm aria-label="Pack details">
            <InsetFormRow label="Name" defaultValue="Foggy Stickers" />
          </InsetForm>
        </Column>
      ),
    },
    {
      name: "Error",
      description: "Danger label and alert icon; the message sits under the control column. Past `maxCount` the counter turns red.",
      render: () => (
        <Column width="min(24rem, 100%)">
          <InsetForm aria-label="Pack details">
            <InsetFormRow label="Link" prefix="t.me/addstickers/" defaultValue="foggy_sf" error="foggy_sf is already taken" />
            <InsetFormTextAreaRow
              label="Description"
              maxCount={60}
              defaultValue="Foggy San Francisco in 24 animated stickers — Mr. Chilly, Robotaxi and friends."
            />
          </InsetForm>
        </Column>
      ),
    },
    {
      name: "Disabled",
      description: "`disabled` on the group disables every row; the group stays on its surface and every glyph turns disabled.",
      render: () => (
        <Column width="min(24rem, 100%)">
          <InsetForm aria-label="Pack details" disabled footer="Published packs can’t be edited.">
            <InsetFormRow label="Name" defaultValue="Foggy Stickers" />
            <InsetFormSelectRow label="Frame rate" options={FPS} defaultValue="60" />
          </InsetForm>
        </Column>
      ),
    },
    {
      name: "Search over content",
      description: "The search capsule is glass and blurs what is behind it; the groups stay on their opaque surface.",
      stage: "photo",
      render: () => (
        <Column width="min(24rem, 100%)">
          <InsetFormSearch label="Search stickers" shortcut="⌘K" />
        </Column>
      ),
    },
  ],

  platforms: {
    intro: (
      <>
        InsetForm is shared: one implementation everywhere, in the grammar of iOS settings — which reads just as well on
        Android and the web. The controls inside are native, so keyboards, autofill and the select picker are each
        platform’s own.
      </>
    ),
    Demo: SettingsScreen,
  },

  usage: {
    guidelines: [
      "Group rows by topic and give each group a `title`; explain the group once in its `footer` rather than under every row.",
      "Labels are one or two short words — the label column is 96 wide and long labels wrap.",
      "Keep prefixes short: the prefix never shrinks, so on a phone a long one leaves little room for the value.",
      "Put free text last in a group: the multiline row grows with its content (`autoGrow` is on by default).",
      "Show `error` messages after the user leaves a row or submits; they appear under the control column.",
      "Disable the whole group with `disabled` on InsetForm; a row’s own `disabled` (true or false) still wins.",
      "Leave about 1.5rem between groups and 0.875rem between the search capsule and the first group.",
    ],
    dos: [
      {
        kind: "do",
        title: "Short labels, values on the right",
        caption: "The label column scans as a list.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <InsetForm aria-label="Do">
              <InsetFormRow label="Name" defaultValue="Foggy Stickers" />
              <InsetFormSelectRow label="Frame rate" options={FPS} defaultValue="60" />
            </InsetForm>
          </Column>
        ),
      },
      {
        kind: "dont",
        title: "Don’t write sentences as labels",
        caption: "They wrap in the 96 column and squeeze the value.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <InsetForm aria-label="Don't">
              <InsetFormRow label="Name of your sticker pack" defaultValue="Foggy Stickers" />
              <InsetFormSelectRow label="Playback frame rate" options={FPS} defaultValue="60" />
            </InsetForm>
          </Column>
        ),
      },
      {
        kind: "do",
        title: "Explain the group once, in the footer",
        render: () => (
          <Column width="min(20rem, 100%)">
            <InsetForm aria-label="Do footer" footer="Name and author are shown in Telegram.">
              <InsetFormRow label="Name" defaultValue="Foggy Stickers" />
              <InsetFormRow label="Author" defaultValue="Foggy Studio" />
            </InsetForm>
          </Column>
        ),
      },
      {
        kind: "dont",
        title: "Don’t add helper text to every row",
        caption: "Repeated notes double the height and bury the values.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <InsetForm aria-label="Don't helper">
              <InsetFormRow label="Name" defaultValue="Foggy Stickers" helperText="Shown in Telegram" />
              <InsetFormRow label="Author" defaultValue="Foggy Studio" helperText="Shown in Telegram" />
            </InsetForm>
          </Column>
        ),
      },
    ],
    writing: [
      "Labels are nouns in sentence case: Name, Link, Frame rate. No colons.",
      "Group titles name the topic in a word or two: Pack, Export, Playback.",
      "Footers are one or two full sentences about consequences: “The link can’t be changed later.”",
      "Placeholders show the expected format (“short_name”), never instructions.",
      "Error messages say how to fix the value: “foggy_sf is already taken”.",
    ],
  },

  accessibility: {
    intro: (
      <>
        The rows sit in a <code>role="group"</code> named by the title and described by the footer. Every row renders a
        native control with a real <code>&lt;label for&gt;</code>; errors, helper text, the counter and a text prefix are
        linked with <code>aria-describedby</code>.
      </>
    ),
    roles: [
      { element: "Group", role: "group", notes: "`aria-labelledby` the title (or your `aria-label`), `aria-describedby` the footer, `aria-disabled` when disabled." },
      { element: "InsetFormRow", role: "textbox (native <input>)", notes: "Named by its label; `aria-invalid` while `error` is set." },
      { element: "InsetFormSelectRow", role: "combobox (native <select>)", notes: "The placeholder is a hidden, disabled empty option." },
      { element: "InsetFormTextAreaRow", role: "textbox, multi-line (native <textarea>)", notes: "`aria-invalid` while invalid or past `maxCount`." },
      { element: "InsetFormSearch", role: "searchbox", notes: "SearchField at size `sm`: `label` is its accessible name." },
      { element: "Alert icon, chevrons", role: "aria-hidden=\"true\"", notes: "Decorative; the error message carries the meaning." },
    ],
    keyboard: [
      { keys: ["Tab"], action: "Moves through the rows in order. Disabled rows are skipped." },
      { keys: ["Alt", "↓"], action: "Select row: opens the platform picker." },
      { keys: ["↑", "↓"], action: "Select row: steps through the options." },
      { keys: ["Enter"], action: "Multiline row: new line. Text row: submits the surrounding form." },
      { keys: ["Esc"], action: "Search capsule: clears the text and keeps focus in it." },
    ],
    focus: [
      "The focused row lifts from surface 1 to surface 2 and its label turns accent (a select value turns accent too). There is no outline ring around the row.",
      "Pressing anywhere on a row focuses its control; on a select row it also opens the picker where `showPicker()` is available.",
      "Disabled rows use the native `disabled`, so they leave the tab order and are announced as unavailable.",
    ],
    reducedMotion: ["The row background, label and chevron colour transitions (120 ms) are switched off; focus changes instantly."],
    screenReader: [
      "Entering the group announces its title, then the footer as its description — put consequences there.",
      "Pass `aria-label` on InsetForm when the group has no visible title; it names the group, not the wrapper.",
      "Errors are not live regions. After a failed submit, move focus to the first invalid row.",
    ],
  },

  api: [
    {
      component: "InsetForm",
      description: "The group: optional title, the rows, optional footer.",
      props: [
        { name: "title", type: "ReactNode", description: "Group header above the rows; names the group (`aria-labelledby`)." },
        { name: "footer", type: "ReactNode", description: "Note under the rows; describes the group (`aria-describedby`)." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables every row inside (a row’s own `disabled` wins)." },
        { name: "aria-label", type: "string", description: "Names the `role=\"group\"` — use it when there is no `title`." },
        { name: "children", type: "ReactNode", description: "InsetFormRow, InsetFormSelectRow, InsetFormTextAreaRow." },
        { name: "ref", type: "Ref<HTMLDivElement>", description: "The outer wrapper." },
      ],
      extends: "Other native <div> attributes (className, style, data-*) go to the outer wrapper.",
    },
    {
      component: "InsetFormRow",
      description: "Text row (Row / Text and Row / Prefix).",
      props: [
        ...rowCommon,
        { name: "value", type: "string", description: "Controlled text." },
        { name: "defaultValue", type: "string", description: "Initial text when uncontrolled." },
        { name: "onValueChange", type: "(value: string) => void", description: "New text, alongside the native `onChange`." },
        { name: "prefix", type: "ReactNode", description: "Fixed text or icon before the value." },
        { name: "placeholder", type: "string", description: "Example text." },
        { name: "type", type: "string", default: '"text"', description: "Native input type." },
        { name: "ref", type: "Ref<HTMLInputElement>", description: "The native <input>." },
      ],
      extends: "`className` / `style` go to the row; other native <input> attributes go to the input. No counter — use the multiline row for limited text.",
    },
    {
      component: "InsetFormSelectRow",
      description: "Native <select>, value right-aligned, ChevronsUpDown at the end.",
      props: [
        ...rowCommon,
        { name: "options", type: "SelectOption[]", required: true, description: "`{ value, label, disabled? }` — plain-text native options." },
        { name: "value", type: "string", description: "Controlled value." },
        { name: "defaultValue", type: "string", default: "first option", description: "Initial value; `\"\"` (empty) when there is a `placeholder`." },
        { name: "onValueChange", type: "(value: string) => void", description: "New value." },
        { name: "placeholder", type: "string", description: "Muted text while nothing is chosen (“Choose…”)." },
        { name: "ref", type: "Ref<HTMLSelectElement>", description: "The native <select>." },
      ],
      extends: "`className` / `style` go to the row; other native <select> attributes go to the select.",
    },
    {
      component: "InsetFormTextAreaRow",
      description: "Label (and counter) on top, full-width text below.",
      props: [
        ...rowCommon,
        { name: "value", type: "string", description: "Controlled text." },
        { name: "defaultValue", type: "string", description: "Initial text when uncontrolled." },
        { name: "onValueChange", type: "(value: string) => void", description: "New text." },
        { name: "maxCount", type: "number", description: "Soft limit: `n/max` counter next to the label, red and invalid past it." },
        { name: "autoGrow", type: "boolean", default: "true", description: "Grow with the content instead of scrolling." },
        { name: "rows", type: "number", default: "1", description: "Visible lines at rest." },
        { name: "ref", type: "Ref<HTMLTextAreaElement>", description: "The native <textarea>." },
      ],
      extends: "`className` / `style` go to the row; other native <textarea> attributes go to the textarea.",
    },
    {
      component: "InsetFormSearch",
      description: "The glass search capsule above a group: SearchField at `size=\"sm\"` — 44 tall, danger rim but no alert icon when invalid.",
      props: [
        { name: "…SearchFieldProps", type: 'Omit<SearchFieldProps, "size">', description: "label, value / defaultValue, onValueChange, onClear, shortcut, helperText, error, clearLabel, disabled — see Text fields." },
      ],
    },
  ],

  storybook: {
    title: "Components/InsetForm",
    stories: [
      { name: "Rest", export: "Rest" },
      { name: "Error", export: "ErrorState" },
      { name: "Disabled", export: "Disabled" },
      { name: "With title (controlled)", export: "WithTitleControlled" },
    ],
  },
  related: ["text-field", "list", "switch"],
};

export default insetForm;
