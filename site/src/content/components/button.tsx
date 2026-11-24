import { ArrowRight, Download, Ellipsis, Play, Plus, Share, Sparkles, Trash2 } from "lucide-react";
import { Button, type ButtonSize, type ButtonVariant } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column, Row } from "../shared";

const VARIANTS: ButtonVariant[] = ["primary", "tonal", "secondary", "ghost", "danger"];

function Demo({ values }: DemoProps) {
  const variant = values.variant as ButtonVariant;
  const icon = variant === "danger" ? <Trash2 /> : <Download />;
  return (
    <div style={{ width: values.fullWidth ? "min(20rem, 100%)" : undefined, display: "flex", justifyContent: "center" }}>
      <Button
        variant={variant}
        size={values.size as ButtonSize}
        leadingIcon={values.icon && !values.iconOnly ? icon : undefined}
        iconOnly={Boolean(values.iconOnly)}
        aria-label={values.iconOnly ? String(values.label) : undefined}
        disabled={Boolean(values.disabled)}
        fullWidth={Boolean(values.fullWidth)}
      >
        {values.iconOnly ? icon : String(values.label)}
      </Button>
    </div>
  );
}

function Preview() {
  return (
    <Row gap={0.625}>
      <Button leadingIcon={<Download />}>Export</Button>
      <Button variant="tonal">Share</Button>
      <Button variant="secondary" iconOnly aria-label="More">
        <Ellipsis />
      </Button>
    </Row>
  );
}

const button: ComponentDoc = {
  slug: "button",
  name: "Button",
  group: "Actions & selection",
  summary: "Glass pills for actions — five emphasis levels, three sizes, icon-only circles.",
  docStatus: "complete",
  status: "stable",
  exports: ["Button"],
  platformSplit: "shared",
  Demo,
  Preview,
  controls: [
    { type: "enum", name: "variant", options: VARIANTS, default: "primary" },
    { type: "enum", name: "size", options: ["s", "m", "l"], default: "m" },
    { type: "text", name: "label", label: "Label", default: "Export" },
    { type: "boolean", name: "icon", label: "Leading icon", default: true },
    { type: "boolean", name: "iconOnly", label: "Icon only", default: false },
    { type: "boolean", name: "disabled", label: "Disabled", default: false },
    { type: "boolean", name: "fullWidth", label: "Full width", default: false },
  ],
  code: (v) => {
    const icon = v.variant === "danger" ? "Trash2" : "Download";
    const attrs = [
      v.variant !== "primary" && `variant="${v.variant}"`,
      v.size !== "m" && `size="${v.size}"`,
      v.icon && !v.iconOnly && `leadingIcon={<${icon} />}`,
      v.iconOnly && `iconOnly aria-label="${v.label}"`,
      v.disabled && "disabled",
      v.fullWidth && "fullWidth",
    ].filter(Boolean);
    const open = `<Button${attrs.length ? " " + attrs.join(" ") : ""}>`;
    const body = v.iconOnly ? `<${icon} />` : String(v.label);
    return `import { Button } from "@nactech/sfui";\nimport { ${icon} } from "lucide-react";\n\n${open}\n  ${body}\n</Button>`;
  },

  overview: {
    intro: (
      <>
        Buttons start an action: export a pack, share it, delete a sticker. Every variant is a translucent glass pill with
        a 1px rim and a top highlight, so the same set works on the true-black canvas and floating over photos or video —
        there is no separate “on image” button.
      </>
    ),
    whenToUse: [
      "An action that happens in place or opens a flow: Export, Share, Add sticker, Continue.",
      "Primary for the single most important action of a view; tonal and secondary for the supporting ones.",
      "Ghost for low-emphasis actions in dense toolbars and headers; danger for destructive confirmation.",
      "Icon-only circles for well-known actions (play, more, close) — always with an accessible name.",
    ],
    whenNotToUse: [
      "Navigating between top-level destinations — use TabBar.",
      "Switching between views of the same content — use Segmented.",
      "A long list of secondary actions — put them in a Menu behind a ••• button.",
      "Turning a setting on or off — use Switch.",
    ],
  },

  variants: [
    {
      name: "Emphasis",
      description: "Primary (accent glass), tonal, secondary (neutral glass), ghost (no fill until pressed), danger.",
      render: () => (
        <Row>
          {VARIANTS.map((v) => (
            <Button key={v} variant={v}>
              {v[0].toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </Row>
      ),
    },
    {
      name: "Sizes",
      description: "S · 32 for dense pointer UIs, M · 40 by default, L · 48 for touch-first screens and hero actions.",
      render: () => (
        <Row>
          <Button size="s">Small</Button>
          <Button size="m">Medium</Button>
          <Button size="l">Large</Button>
        </Row>
      ),
    },
    {
      name: "With icons",
      description: "A Lucide icon before or after the label, sized by the button (14 / 16 / 18).",
      render: () => (
        <Row>
          <Button leadingIcon={<Download />}>Export</Button>
          <Button variant="tonal" trailingIcon={<ArrowRight />}>
            Continue
          </Button>
          <Button variant="danger" leadingIcon={<Trash2 />}>
            Delete
          </Button>
        </Row>
      ),
    },
    {
      name: "Icon only",
      description: "A circle the size of the button height. Needs `aria-label`.",
      render: () => (
        <Row>
          <Button iconOnly aria-label="Play">
            <Play />
          </Button>
          <Button variant="tonal" iconOnly aria-label="Add">
            <Plus />
          </Button>
          <Button variant="secondary" iconOnly aria-label="Share">
            <Share />
          </Button>
          <Button variant="ghost" iconOnly aria-label="More">
            <Ellipsis />
          </Button>
        </Row>
      ),
    },
    {
      name: "Over content",
      description: "The same set refracts the photo behind it. No extra props.",
      stage: "photo",
      render: () => (
        <Row>
          <Button size="l">Export</Button>
          <Button size="l" variant="secondary">
            Share
          </Button>
          <Button variant="secondary" iconOnly aria-label="More">
            <Ellipsis />
          </Button>
        </Row>
      ),
    },
    {
      name: "Disabled",
      description: "One neutral opaque glass fill and the disabled foreground — never opacity, so it stays legible over media.",
      stage: "photo",
      render: () => (
        <Row>
          <Button size="l" disabled>
            Export
          </Button>
          <Button size="l" variant="secondary" disabled>
            Share
          </Button>
          <Button variant="danger" size="l" disabled leadingIcon={<Trash2 />}>
            Delete
          </Button>
        </Row>
      ),
    },
    {
      name: "Full width",
      description: "Stretches to its container — stacked actions at the bottom of a sheet or form.",
      render: () => (
        <Column width="18rem">
          <Button size="l" fullWidth>
            Continue
          </Button>
          <Button size="l" variant="secondary" fullWidth>
            Not now
          </Button>
        </Column>
      ),
    },
  ],

  platforms: {
    intro: (
      <>
        Button is shared: one implementation on iOS, Android and the web. Hover feedback only appears on devices with a
        real pointer, so touch screens never get a sticky hover state.
      </>
    ),
  },

  usage: {
    guidelines: [
      "Use one primary button per view. Everything else steps down to tonal, secondary or ghost.",
      "Put the primary action last in a horizontal group (Not now · Continue) and first in a vertical stack.",
      "Use danger only for the action that destroys something, ideally in a confirmation — not to make a button stand out.",
      "Choose the size by the input, not by importance: S for dense pointer layouts, M by default, L on touch-first screens.",
      "Icons come from Lucide, the same icon for the same action everywhere (Download for export, Trash2 for delete).",
    ],
    dos: [
      {
        kind: "do",
        title: "One primary action per view",
        caption: "The secondary choice steps down in emphasis.",
        render: () => (
          <Row>
            <Button variant="secondary">Not now</Button>
            <Button>Continue</Button>
          </Row>
        ),
      },
      {
        kind: "dont",
        title: "Don’t compete with two primaries",
        caption: "When everything is emphasised, nothing is.",
        render: () => (
          <Row>
            <Button>Not now</Button>
            <Button>Continue</Button>
          </Row>
        ),
      },
      {
        kind: "do",
        title: "Use danger for destructive actions",
        caption: "Say what will be destroyed.",
        render: () => (
          <Row>
            <Button variant="ghost">Cancel</Button>
            <Button variant="danger" leadingIcon={<Trash2 />}>
              Delete sticker
            </Button>
          </Row>
        ),
      },
      {
        kind: "dont",
        title: "Don’t use danger for attention",
        caption: "Red means “this destroys something”, not “important”.",
        render: () => (
          <Button variant="danger" leadingIcon={<Sparkles />}>
            Try the new export
          </Button>
        ),
      },
      {
        kind: "do",
        title: "Keep disabled buttons opaque",
        caption: "The built-in disabled state stays readable over photos.",
        stage: "photo",
        render: () => (
          <Button size="l" disabled>
            Export
          </Button>
        ),
      },
      {
        kind: "dont",
        title: "Don’t fade buttons with opacity",
        caption: "A translucent button disappears into the image behind it.",
        stage: "photo",
        render: () => (
          <Button size="l" style={{ opacity: 0.35 }} tabIndex={-1} aria-disabled="true">
            Export
          </Button>
        ),
      },
    ],
    writing: [
      "Start with a verb that names the result: Export, Share, Add sticker.",
      "Sentence case, one to three words, no trailing punctuation.",
      "Be specific when it matters: “Export .tgs”, “Delete sticker” — never “OK” or “Click here”.",
      "Keep the label the same everywhere the action appears (button, menu item, toolbar).",
    ],
  },

  accessibility: {
    intro: <>Button renders a native <code>&lt;button type="button"&gt;</code>, so it is focusable and activates from the keyboard for free.</>,
    roles: [
      { element: "<button>", role: "button (native)", notes: "type=\"button\" by default — pass type=\"submit\" inside forms." },
      { element: "Icons", role: "aria-hidden=\"true\"", notes: "Decorative; the label (or aria-label) names the button." },
    ],
    keyboard: [
      { keys: ["Tab"], action: "Moves focus to the button." },
      { keys: ["Enter"], action: "Activates it." },
      { keys: ["Space"], action: "Activates it." },
    ],
    focus: [
      "Keyboard focus draws a 2px focus-ring outline that replaces the rim (`:focus-visible` only — no ring on click).",
      "`disabled` removes the button from the tab order. If it must stay focusable (to explain why it is unavailable), use `aria-disabled=\"true\"` — it is styled identically.",
      "Icon-only buttons need `aria-label`; the visible icon is hidden from assistive tech.",
    ],
    reducedMotion: [
      "Buttons only transition colours (120 ms, standard easing) — nothing moves, so there is nothing to reduce.",
    ],
  },

  api: [
    {
      component: "Button",
      props: [
        { name: "variant", type: '"primary" | "tonal" | "secondary" | "ghost" | "danger"', default: '"primary"', description: "Visual treatment. Every variant is a translucent glass pill." },
        { name: "size", type: '"s" | "m" | "l"', default: '"m"', description: "Height: S · 32, M · 40, L · 48 (design px)." },
        { name: "leadingIcon", type: "ReactNode", description: "Icon before the label (a Lucide element). Sized by the button: 14 / 16 / 18." },
        { name: "trailingIcon", type: "ReactNode", description: "Icon after the label." },
        { name: "iconOnly", type: "boolean", default: "false", description: "Circular icon button (width = height). Renders `leadingIcon ?? children` as the icon. Give it an `aria-label`." },
        { name: "fullWidth", type: "boolean", default: "false", description: "Stretch to the container width." },
        { name: "type", type: '"button" | "submit" | "reset"', default: '"button"', description: "Native button type." },
        { name: "disabled", type: "boolean", default: "false", description: "Opaque disabled look; removes the button from the tab order." },
        { name: "ref", type: "Ref<HTMLButtonElement>", description: "Forwarded to the native `<button>` (React 19 ref prop)." },
        { name: "children", type: "ReactNode", description: "The label (or the icon when `iconOnly`)." },
      ],
      extends: "Also accepts every native <button> attribute (onClick, aria-*, form…).",
    },
  ],

  storybook: {
    title: "Components/Button",
    stories: [
      { name: "Playground", export: "Playground" },
      { name: "Rest matrix", export: "RestMatrix" },
      { name: "Over content", export: "OverContentRow" },
    ],
  },
  related: ["menu", "segmented", "selection-bar"],
};

export default button;
