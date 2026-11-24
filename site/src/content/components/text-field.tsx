import { SearchField, SelectField, TextArea, TextField, type SelectOption } from "@nactech/sfui";
import type { ComponentDoc, DemoProps, PropDoc } from "../types";
import { Column } from "../shared";

const FPS: SelectOption[] = [
  { value: "24", label: "24 fps" },
  { value: "30", label: "30 fps" },
  { value: "60", label: "60 fps" },
];

const DESCRIPTION = "Foggy San Francisco in 24 stickers — Mr. Chilly, Robotaxi, Painted Ladies and more.";

const KINDS = ["text", "prefix", "search", "select", "multiline"] as const;
type Kind = (typeof KINDS)[number];

/** One field kind with the demo's shared props. `key` remounts it so the default value follows the kind. */
function KindField({ kind, values }: { kind: Kind; values: DemoProps["values"] }) {
  const error = Boolean(values.error);
  const disabled = Boolean(values.disabled);
  const helper = Boolean(values.helper);
  const counter = Boolean(values.counter);
  switch (kind) {
    case "text":
      return (
        <TextField
          label="Pack name"
          placeholder="Name your pack"
          defaultValue="Foggy Stickers"
          helperText={helper ? "Shown as the pack title in Telegram" : undefined}
          maxCount={counter ? 32 : undefined}
          error={error ? "Name is required" : undefined}
          disabled={disabled}
        />
      );
    case "prefix":
      return (
        <TextField
          label="Short link"
          prefix="t.me/addstickers/"
          placeholder="short_name"
          defaultValue="foggy_sf"
          helperText={helper ? "Letters, digits and underscores" : undefined}
          maxCount={counter ? 64 : undefined}
          error={error ? "foggy_sf is already taken" : undefined}
          disabled={disabled}
        />
      );
    case "search":
      return (
        <SearchField
          label="Search stickers"
          shortcut="⌘K"
          defaultValue={error ? "chily" : undefined}
          helperText={helper ? "Search by name or tag" : undefined}
          error={error ? "No matches for “chily”" : undefined}
          disabled={disabled}
        />
      );
    case "select":
      return (
        <SelectField
          label="Frame rate"
          placeholder="Choose…"
          defaultValue="60"
          options={FPS}
          helperText={helper ? "Telegram plays stickers at up to 60 fps" : undefined}
          error={error ? "Pick a frame rate" : undefined}
          disabled={disabled}
        />
      );
    case "multiline":
      return (
        <TextArea
          label="Description"
          placeholder="What’s in the pack?"
          defaultValue={DESCRIPTION}
          autoGrow
          helperText={helper ? "Shown on the pack page" : undefined}
          maxCount={counter ? 120 : undefined}
          error={error ? "Keep it under 120 characters" : undefined}
          disabled={disabled}
        />
      );
  }
}

function Demo({ values }: DemoProps) {
  const kind = values.kind as Kind;
  return (
    <Column width="min(26rem, 100%)">
      <KindField key={kind} kind={kind} values={values} />
    </Column>
  );
}

/** The whole family in one pack form — the Platforms tab and the "In a form" variant. */
function PackForm() {
  return (
    <Column gap={1} width="min(26rem, 100%)">
      <SearchField label="Search stickers" shortcut="⌘K" />
      <TextField label="Pack name" defaultValue="Foggy Stickers" helperText="Shown as the pack title in Telegram" maxCount={32} />
      <TextField label="Short link" prefix="t.me/addstickers/" defaultValue="foggy_sf" />
      <SelectField label="Frame rate" options={FPS} defaultValue="60" />
      <TextArea label="Description" defaultValue={DESCRIPTION} autoGrow maxCount={120} />
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

const common: PropDoc[] = [
  { name: "label", type: "ReactNode", required: true, description: "Floating label inside the field. Rests in the value line while empty, floats to the top (16 → 12) on focus, with a value, a placeholder or a prefix." },
  { name: "helperText", type: "ReactNode", description: "Muted line under the field. Replaced by the error message while `error` is a node." },
  { name: "error", type: "ReactNode", description: "`true` marks the field invalid; a string or node also replaces the helper text. Sets `aria-invalid` and links the message with `aria-describedby`. `false`, `null` and `\"\"` clear it." },
  { name: "disabled", type: "boolean", default: "false", description: "Opaque disabled glass; the native control is disabled and leaves the tab order." },
  { name: "required", type: "boolean", description: "Native `required` on the control." },
];

const code = (v: DemoProps["values"]) => {
  const kind = v.kind as Kind;
  const helper = Boolean(v.helper);
  const counter = Boolean(v.counter);
  const error = Boolean(v.error);
  const lines: string[] = [];
  let tag = "TextField";
  let extraImport = "";
  switch (kind) {
    case "text":
      lines.push('label="Pack name"', 'placeholder="Name your pack"', "value={name}", "onValueChange={setName}");
      if (helper) lines.push('helperText="Shown as the pack title in Telegram"');
      if (counter) lines.push("maxCount={32}");
      if (error) lines.push('error="Name is required"');
      break;
    case "prefix":
      lines.push('label="Short link"', 'prefix="t.me/addstickers/"', 'placeholder="short_name"', "value={link}", "onValueChange={setLink}");
      if (helper) lines.push('helperText="Letters, digits and underscores"');
      if (counter) lines.push("maxCount={64}");
      if (error) lines.push('error="foggy_sf is already taken"');
      break;
    case "search":
      tag = "SearchField";
      lines.push('label="Search stickers"', 'shortcut="⌘K"', "value={query}", "onValueChange={setQuery}");
      if (helper) lines.push('helperText="Search by name or tag"');
      if (error) lines.push("error={`No matches for “${query}”`}");
      break;
    case "select":
      tag = "SelectField";
      extraImport = "\n\nconst fps = [\n  { value: \"24\", label: \"24 fps\" },\n  { value: \"30\", label: \"30 fps\" },\n  { value: \"60\", label: \"60 fps\" },\n];";
      lines.push('label="Frame rate"', "options={fps}", 'placeholder="Choose…"', "value={rate}", "onValueChange={setRate}");
      if (helper) lines.push('helperText="Telegram plays stickers at up to 60 fps"');
      if (error) lines.push('error="Pick a frame rate"');
      break;
    case "multiline":
      tag = "TextArea";
      lines.push('label="Description"', "value={about}", "onValueChange={setAbout}", "autoGrow");
      if (helper) lines.push('helperText="Shown on the pack page"');
      if (counter) lines.push("maxCount={120}");
      if (error) lines.push('error="Keep it under 120 characters"');
      break;
  }
  if (v.disabled) lines.push("disabled");
  return `import { ${tag} } from "@nactech/sfui";${extraImport}\n\n<${tag}\n  ${lines.join("\n  ")}\n/>`;
};

const textField: ComponentDoc = {
  slug: "text-field",
  name: "Text fields",
  group: "Inputs",
  summary: "Glass fields with a floating label: TextField, SearchField, SelectField and TextArea.",
  docStatus: "complete",
  status: "stable",
  exports: ["TextField", "SearchField", "SelectField", "TextArea"],
  platformSplit: "shared",
  source: "src/components/Field",
  Demo,
  Preview,
  controls: [
    { type: "enum", name: "kind", label: "Kind", options: KINDS, default: "text" },
    { type: "boolean", name: "helper", label: "Helper text", default: true },
    { type: "boolean", name: "counter", label: "Counter (text, multiline)", default: true },
    { type: "boolean", name: "error", label: "Error", default: false },
    { type: "boolean", name: "disabled", label: "Disabled", default: false },
  ],
  code,

  overview: {
    intro: (
      <>
        Text fields let people enter and edit text. Four kinds share one anatomy — a glass container with a 1px rim, a
        floating label, a helper / error line and an optional counter — so a form reads as one family: TextField for a
        single line (with an optional fixed prefix), SearchField for a query, SelectField for one value from a short list
        and TextArea for a few sentences. Every kind wraps the native control, so autofill, IME input, spellcheck and the
        platform picker keep working.
      </>
    ),
    whenToUse: [
      "Free text people type: a pack name, a short link, a description.",
      "`prefix` for a fixed part of the value the user should not type: `t.me/addstickers/`.",
      "SearchField to filter a list or start a search — it has no visible label, only an accessible name.",
      "SelectField for one value from a short, fixed list (frame rate, format) inside a form.",
      "TextArea with `autoGrow` for a few sentences; `maxCount` when a service has a limit.",
    ],
    whenNotToUse: [
      "Settings and metadata screens with many short rows — use InsetForm (label left, value right).",
      "Two to four options that should all be visible — use Segmented or Radio.",
      "Picking a number from a range — use Slider.",
      "Actions or choices that are not form values — use Menu.",
    ],
  },

  variants: [
    {
      name: "Text",
      description: "56 tall. The label rests in the value line and floats to the top on focus or once there is a value.",
      render: () => (
        <Column width="min(22rem, 100%)">
          <TextField label="Pack name" />
          <TextField label="Pack name" defaultValue="Foggy Stickers" />
        </Column>
      ),
    },
    {
      name: "Prefix",
      description: "Fixed text (or an icon) before the value. The label is always floated; text prefixes join the description.",
      render: () => (
        <Column width="min(22rem, 100%)">
          <TextField label="Short link" prefix="t.me/addstickers/" placeholder="short_name" />
        </Column>
      ),
    },
    {
      name: "Search",
      description: "48-tall capsule with a search icon. A key cap while empty, a clear button once filled.",
      render: () => (
        <Column width="min(22rem, 100%)">
          <SearchField label="Search stickers" shortcut="⌘K" />
          <SearchField label="Search stickers" defaultValue="chilly" />
        </Column>
      ),
    },
    {
      name: "Select",
      description: "A native `<select>` with a floating label and a chevron. The popup is the platform’s own.",
      render: () => (
        <Column width="min(22rem, 100%)">
          <SelectField label="Frame rate" options={FPS} placeholder="Choose…" />
          <SelectField label="Frame rate" options={FPS} defaultValue="60" />
        </Column>
      ),
    },
    {
      name: "Multiline",
      description: "116 tall by default (3 rows); `autoGrow` grows it with the text instead of scrolling.",
      render: () => (
        <Column width="min(22rem, 100%)">
          <TextArea label="Description" defaultValue={DESCRIPTION} autoGrow maxCount={120} />
        </Column>
      ),
    },
    {
      name: "Error",
      description: "Danger rim, label and message, plus an alert icon on text, prefix and search. Past `maxCount` the counter turns red too.",
      render: () => (
        <Column width="min(22rem, 100%)">
          <TextField label="Short link" prefix="t.me/addstickers/" defaultValue="foggy_sf" error="foggy_sf is already taken" />
          <TextField label="Pack name" defaultValue="Foggy San Francisco Stickers Vol. 2" maxCount={32} />
        </Column>
      ),
    },
    {
      name: "Disabled",
      description: "Opaque disabled glass and the disabled foreground — never opacity, so it stays legible over media.",
      stage: "photo",
      render: () => (
        <Column width="min(22rem, 100%)">
          <TextField label="Pack name" defaultValue="Foggy Stickers" disabled />
          <SearchField label="Search stickers" disabled />
        </Column>
      ),
    },
    {
      name: "Over content",
      description: "The same fields blur the photo behind them. No extra props.",
      stage: "photo",
      render: () => (
        <Column width="min(22rem, 100%)">
          <SearchField label="Search stickers" shortcut="⌘K" />
          <TextField label="Caption" defaultValue="Fog rolling in" />
        </Column>
      ),
    },
  ],

  platforms: {
    intro: (
      <>
        Text fields are shared: one implementation on iOS, Android and the web. The controls are native, so the keyboard,
        autofill, the select picker and text selection are each platform’s own. Hover (the rim brightens a step) only
        appears with a real pointer. For iOS-style settings rows, use InsetForm.
      </>
    ),
    Demo: PackForm,
  },

  usage: {
    guidelines: [
      "Always give a field a `label`. A placeholder is an example of the format, not a replacement for the label — it disappears as soon as people type.",
      "Keep the label to a few words; put the explanation in `helperText`. Labels are one line and truncate with an ellipsis.",
      "Use `error` with a message that says how to fix it, and show it after the user leaves the field or submits — not on the first keystroke.",
      "`maxCount` is a soft limit: people can type past it and the field turns invalid, so they never lose text. Use the native `maxLength` only when the value must never exceed it.",
      "Use `prefix` for fixed parts of a value (a domain, a currency) so people type only what is theirs.",
      "SearchField: bind the shortcut you show in `shortcut` yourself, and pass `aria-keyshortcuts` if it should be announced.",
      "Stack fields in one column with 1rem between them; one field per row reads fastest on phones.",
    ],
    dos: [
      {
        kind: "do",
        title: "Short label, details below",
        caption: "The label names the value; the helper explains it.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <TextField label="Pack name" defaultValue="Foggy Stickers" helperText="Shown as the pack title in Telegram" />
          </Column>
        ),
      },
      {
        kind: "dont",
        title: "Don’t write the instructions into the label",
        caption: "Long labels truncate, and the important part is cut off.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <TextField label="Enter the name of your sticker pack as it will appear in Telegram" defaultValue="Foggy Stickers" />
          </Column>
        ),
      },
      {
        kind: "do",
        title: "Say how to fix the error",
        caption: "Name the problem and the way out.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <TextField label="Short link" prefix="t.me/addstickers/" defaultValue="foggy sf" error="Use letters, digits and underscores" />
          </Column>
        ),
      },
      {
        kind: "dont",
        title: "Don’t blame with a generic error",
        caption: "“Invalid input” leaves people guessing.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <TextField label="Short link" prefix="t.me/addstickers/" defaultValue="foggy sf" error="Invalid input" />
          </Column>
        ),
      },
      {
        kind: "do",
        title: "Offer fixed choices as a select",
        caption: "No typing, no typos.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <SelectField label="Frame rate" options={FPS} defaultValue="60" />
          </Column>
        ),
      },
      {
        kind: "dont",
        title: "Don’t ask to type a value from a list",
        caption: "“Type 24, 30 or 60” is a select pretending to be a text field.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <TextField label="Frame rate" defaultValue="60" helperText="Type 24, 30 or 60" />
          </Column>
        ),
      },
    ],
    writing: [
      "Labels are nouns in sentence case: Pack name, Short link, Frame rate. No colon, no trailing punctuation.",
      "Placeholders show an example of the format (“short_name”, “Name your pack”), never information people need later.",
      "Helper text is one short sentence about where the value appears or what is allowed.",
      "Error messages say what to do: “Use letters, digits and underscores”, “foggy_sf is already taken” — not “Error” or “Invalid”.",
      "Search labels say what is searched: “Search stickers”. The label doubles as the placeholder.",
    ],
  },

  accessibility: {
    intro: (
      <>
        Every kind renders the native control — <code>&lt;input&gt;</code>, <code>&lt;input type="search"&gt;</code>,{" "}
        <code>&lt;select&gt;</code> or <code>&lt;textarea&gt;</code> — with a real <code>&lt;label for&gt;</code>. The
        helper or error line, the counter and a text prefix are joined into <code>aria-describedby</code>, so screen
        readers read the label, the value and then the description.
      </>
    ),
    roles: [
      { element: "TextField", role: "textbox (native <input>)", notes: "Named by the <label>; `aria-invalid` while invalid or past `maxCount`." },
      { element: "SearchField", role: "searchbox (<input type=\"search\">)", notes: "No visible label: `label` becomes `aria-label` (and the placeholder)." },
      { element: "SelectField", role: "combobox (native <select>)", notes: "The placeholder is a hidden, disabled empty option." },
      { element: "TextArea", role: "textbox, multi-line (native <textarea>)", notes: "Named by the <label>." },
      { element: "Helper / error, counter, text prefix", role: "aria-describedby", notes: "Linked by id; your own `aria-describedby` is appended." },
      { element: "Clear button (search)", role: "button", notes: "`aria-label` = `clearLabel` (“Clear search”), `aria-controls` the input." },
      { element: "Icons, key cap", role: "aria-hidden=\"true\"", notes: "Search icon, chevron, alert icon and the shortcut hint are decorative." },
    ],
    keyboard: [
      { keys: ["Tab"], action: "Moves focus to the field (and, in a filled search field, on to the clear button)." },
      { keys: ["Esc"], action: "SearchField: clears the text, calls `onClear` and keeps focus in the input." },
      { keys: ["Enter", "Space"], action: "Clear button: clears the search and returns focus to the input." },
      { keys: ["Alt", "↓"], action: "SelectField: opens the platform picker (also Space / Enter where the platform supports it)." },
      { keys: ["↑", "↓"], action: "SelectField: steps through the options." },
      { keys: ["Enter"], action: "TextArea: new line. TextField: submits the surrounding form (native behaviour)." },
    ],
    focus: [
      "Focus draws a 1.5px accent rim and a soft accent glow, and the label turns accent — the extra 0.5px is an inset shadow, so nothing shifts.",
      "Pressing anywhere on the container focuses the control; on a SelectField it also opens the picker where `showPicker()` is available.",
      "The clear button keeps focus in the input while it is pressed, then focuses the input again after clearing.",
      "`disabled` disables the native control: it leaves the tab order and is announced as unavailable.",
      "Invalid fields keep the danger rim while focused and add a danger glow, so the error stays visible.",
    ],
    reducedMotion: [
      "The label float (220 ms) and the rim, glow and colour transitions (120 ms) are switched off — the label jumps into place.",
    ],
    screenReader: [
      "Errors are not live regions: they are read when the field is focused. After a failed submit, move focus to the first invalid field.",
      "The counter is read as part of the description (“12/32”); past the limit the field is also announced as invalid.",
      "`shortcut` is visual only. Announce a real shortcut with `aria-keyshortcuts=\"Meta+K\"`.",
    ],
  },

  api: [
    {
      component: "TextField",
      description: "Field / Text and Field / Prefix.",
      props: [
        ...common,
        { name: "value", type: "string", description: "Controlled text." },
        { name: "defaultValue", type: "string", description: "Initial text when uncontrolled." },
        { name: "onValueChange", type: "(value: string) => void", description: "New text on every change, alongside the native `onChange`." },
        { name: "prefix", type: "ReactNode", description: "Fixed text or icon before the value (`t.me/addstickers/`). Keeps the label floated." },
        { name: "maxCount", type: "number", description: "Soft limit: an `n/max` counter at the end of the helper line; red and invalid past it. Use `maxLength` for a hard limit." },
        { name: "placeholder", type: "string", description: "Example text; its presence keeps the label floated." },
        { name: "type", type: "string", default: '"text"', description: "Native input type (`email`, `url`, `password`…)." },
        { name: "id", type: "string", default: "auto", description: "Id of the <input>; generated with `useId` when omitted." },
        { name: "ref", type: "Ref<HTMLInputElement>", description: "The native <input>." },
      ],
      extends: "`className` / `style` go to the wrapper; every other native <input> attribute (name, autoComplete, onBlur…) goes to the input.",
    },
    {
      component: "SearchField",
      description: "Field / Search — a glass capsule with no visible label.",
      props: [
        { name: "label", type: "string", default: '"Search"', description: "Accessible name (`aria-label`) and the default placeholder." },
        { name: "value", type: "string", description: "Controlled text." },
        { name: "defaultValue", type: "string", description: "Initial text when uncontrolled." },
        { name: "onValueChange", type: "(value: string) => void", description: "New text, including `\"\"` after clearing." },
        { name: "onClear", type: "() => void", description: "Called after the clear button or Esc empties the field." },
        { name: "shortcut", type: "ReactNode", description: "Key cap shown while empty, e.g. `⌘K`. Visual only — bind it yourself." },
        { name: "helperText", type: "ReactNode", description: "Line under the field." },
        { name: "error", type: "ReactNode", description: "`true` or a message (“No matches for …”). Danger rim; alert icon at size `md`." },
        { name: "size", type: '"md" | "sm"', default: '"md"', description: "48 tall, or 44 with no alert icon (the InsetForm search capsule)." },
        { name: "clearLabel", type: "string", default: '"Clear search"', description: "Accessible name of the clear button." },
        { name: "placeholder", type: "string", default: "label", description: "Placeholder text." },
        { name: "disabled", type: "boolean", default: "false", description: "Opaque disabled glass; hides the clear button and key cap." },
        { name: "ref", type: "Ref<HTMLInputElement>", description: "The native <input type=\"search\">." },
      ],
      extends: "`className` / `style` go to the wrapper; other native <input> attributes (except `type`) go to the input.",
    },
    {
      component: "SelectField",
      description: "Field / Select — a native <select> dressed as a field.",
      props: [
        ...common,
        { name: "options", type: "SelectOption[]", required: true, description: "The choices (see SelectOption)." },
        { name: "value", type: "string", description: "Controlled value." },
        { name: "defaultValue", type: "string", default: "first option", description: "Initial value when uncontrolled; `\"\"` (empty) when there is a `placeholder`." },
        { name: "onValueChange", type: "(value: string) => void", description: "New value." },
        { name: "placeholder", type: "string", description: "Muted text while nothing is chosen (“Choose…”), rendered as a hidden empty option." },
        { name: "ref", type: "Ref<HTMLSelectElement>", description: "The native <select>." },
      ],
      extends: "`className` / `style` go to the wrapper; other native <select> attributes (name, onChange…) go to the select. `multiple` and `size` are not supported.",
    },
    {
      component: "SelectOption",
      description: "One option of SelectField (and InsetFormSelectRow).",
      props: [
        { name: "value", type: "string", required: true, description: "Option value." },
        { name: "label", type: "string", required: true, description: "Plain text — native options cannot render markup." },
        { name: "disabled", type: "boolean", description: "Shown but not selectable." },
      ],
    },
    {
      component: "TextArea",
      description: "Field / Multiline.",
      props: [
        ...common,
        { name: "value", type: "string", description: "Controlled text." },
        { name: "defaultValue", type: "string", description: "Initial text when uncontrolled." },
        { name: "onValueChange", type: "(value: string) => void", description: "New text." },
        { name: "maxCount", type: "number", description: "Soft limit with an `n/max` counter; red and invalid past it." },
        { name: "autoGrow", type: "boolean", default: "false", description: "Grow with the content instead of scrolling (never below `rows`)." },
        { name: "rows", type: "number", default: "3", description: "Visible lines at rest." },
        { name: "placeholder", type: "string", description: "Example text; keeps the label floated." },
        { name: "ref", type: "Ref<HTMLTextAreaElement>", description: "The native <textarea>." },
      ],
      extends: "`className` / `style` go to the wrapper; other native <textarea> attributes go to the textarea.",
    },
  ],

  storybook: {
    title: "Components/Field",
    stories: [
      { name: "Rest", export: "Rest" },
      { name: "Error", export: "ErrorState" },
      { name: "Over content", export: "OverContent" },
      { name: "Controlled", export: "Controlled" },
    ],
  },
  related: ["inset-form", "segmented", "slider"],
};

export default textField;
