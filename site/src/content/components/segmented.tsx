import type React from "react";
import { useState } from "react";
import { Clapperboard, Film, LayoutGrid, Library, Pencil, Play, Settings2, Share, Smile, Trash2, Upload, VenetianMask } from "lucide-react";
import { Button, Segmented, type SegmentedOption, type SegmentedSize } from "@nactech/sfui";
import { photo } from "@site/lib/photos";
import type { ComponentDoc, DemoProps } from "../types";
import { Column, Row } from "../shared";

const VIEWS = [
  { value: "all", label: "All", icon: <LayoutGrid />, iconName: "LayoutGrid", count: 168, noun: "items" },
  { value: "emoji", label: "Emoji", icon: <Smile />, iconName: "Smile", count: 112, noun: "emoji" },
  { value: "gifs", label: "GIFs", icon: <Film />, iconName: "Film", count: 31, noun: "GIFs" },
  { value: "masks", label: "Masks", icon: <VenetianMask />, iconName: "VenetianMask", count: 9, noun: "masks" },
  { value: "video", label: "Video", icon: <Clapperboard />, iconName: "Clapperboard", count: 16, noun: "videos" },
];

const views = (n = 3, icons = false): SegmentedOption[] =>
  VIEWS.slice(0, n).map(({ value, label, icon }) => ({ value, label, icon: icons ? icon : undefined }));

/** A photo strip for "over content" examples inside a canvas stage (mirrors the Storybook strip). */
function OverPhoto({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "min(26rem, 100%)",
        padding: "2rem 0.75rem",
        borderRadius: "var(--sf-radius-xl)",
        backgroundImage: photo,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {children}
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <span aria-live="polite" style={{ color: "var(--sf-fg-muted)", font: "500 0.75rem/1.4 var(--sf-font-mono)", letterSpacing: "0.04em" }}>
      {children}
    </span>
  );
}

function Demo({ values }: DemoProps) {
  const [view, setView] = useState("all");
  const count = Number(values.segments);
  const options = views(count, Boolean(values.icons));
  // Keep a valid selection when the number of segments shrinks.
  const current = options.some((o) => o.value === view) ? view : options[0].value;
  const control = (
    <Segmented
      aria-label="Show"
      style={{ width: "100%" }}
      size={values.size as SegmentedSize}
      value={current}
      onValueChange={setView}
      disabled={Boolean(values.disabled)}
      overContent={Boolean(values.overContent)}
      options={options}
    />
  );
  const shown = VIEWS.find((v) => v.value === current)!;
  return (
    <Column gap={1} width="min(26rem, 100%)">
      {values.overContent ? <OverPhoto>{control}</OverPhoto> : control}
      <div style={{ textAlign: "center" }}>
        <Caption>
          showing {shown.count} {shown.noun}
        </Caption>
      </div>
    </Column>
  );
}

function Preview() {
  return <Segmented aria-label="Layout" size="s" style={{ width: "100%" }} defaultValue="all" options={views(2)} />;
}

const segmented: ComponentDoc = {
  slug: "segmented",
  name: "Segmented",
  group: "Actions & selection",
  summary: "Connected segments that switch between two to five views of the same content.",
  docStatus: "complete",
  status: "stable",
  exports: ["Segmented"],
  platformSplit: "shared",
  Demo,
  Preview,
  controls: [
    { type: "enum", name: "size", label: "Size", options: ["s", "m", "l"], default: "m" },
    { type: "number", name: "segments", label: "Segments", min: 2, max: 5, default: 3 },
    { type: "boolean", name: "icons", label: "Icons", default: false },
    { type: "boolean", name: "overContent", label: "Over content", default: false },
    { type: "boolean", name: "disabled", label: "Disabled", default: false },
  ],
  code: (v) => {
    const shown = VIEWS.slice(0, Number(v.segments));
    const opts = shown.map((o) => `  { value: "${o.value}", label: "${o.label}"${v.icons ? `, icon: <${o.iconName} />` : ""} },`).join("\n");
    const iconImport = v.icons ? `\nimport { ${shown.map((o) => o.iconName).join(", ")} } from "lucide-react";` : "";
    const attrs = [
      'aria-label="Show"',
      "options={options}",
      "value={view}",
      "onValueChange={setView}",
      v.size !== "m" && `size="${v.size}"`,
      v.overContent && "overContent",
      v.disabled && "disabled",
    ].filter(Boolean);
    return `import { useState } from "react";
import { Segmented } from "@nactech/sfui";${iconImport}

const options = [
${opts}
];
const [view, setView] = useState("all");

<Segmented
  ${attrs.join("\n  ")}
/>`;
  },

  overview: {
    intro: (
      <>
        Segmented switches between two to five views of the same content — everything in a pack, or just its emoji or GIFs. The
        segments are connected, with round outer ends; the selected one morphs into a full accent pill and its icon gives
        way to a check, and an unselected segment morphs into a pill while you press it. Over photos and video,{" "}
        <code>overContent</code> turns every segment to glass.
      </>
    ),
    whenToUse: [
      "Two to five views or filters of the content right below it: All · Emoji · GIFs.",
      "A display mode that changes the current screen immediately: Grid · List.",
      "A compact single choice in a toolbar or over a player, with `overContent`.",
    ],
    whenNotToUse: [
      "Moving between top-level destinations — use TabBar.",
      "Picking a value in a form that is saved later — use Radio.",
      "Actions such as Rename or Share — use Button.",
      "More than five options, or labels longer than a word or two — use Radio or a SelectField.",
    ],
  },

  variants: [
    {
      name: "Sizes",
      description: "S · 2 rem for dense toolbars, M · 2.5 rem by default, L · 3 rem on touch-first screens.",
      render: () => (
        <Column gap={0.75} width="min(22rem, 100%)">
          <Segmented aria-label="Small" size="s" defaultValue="all" options={views(3)} />
          <Segmented aria-label="Medium" size="m" defaultValue="all" options={views(3)} />
          <Segmented aria-label="Large" size="l" defaultValue="all" options={views(3)} />
        </Column>
      ),
    },
    {
      name: "With icons",
      description: "A Lucide icon before each label. The selected segment swaps its icon for the check.",
      render: () => <Segmented aria-label="Show" defaultValue="emoji" options={views(3, true)} style={{ width: "min(22rem, 100%)" }} />,
    },
    {
      name: "Two segments",
      description: "The smallest set — a binary view switch. Each segment takes half the width.",
      render: () => (
        <Segmented
          aria-label="Layout"
          defaultValue="grid"
          style={{ width: "min(16rem, 100%)" }}
          options={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
          ]}
        />
      ),
    },
    {
      name: "Unavailable option",
      description: "`disabled` on one option: opaque, skipped by the arrow keys.",
      render: () => (
        <Segmented
          aria-label="Show"
          defaultValue="all"
          style={{ width: "min(22rem, 100%)" }}
          options={views(3, true).map((o) => (o.value === "gifs" ? { ...o, disabled: true } : o))}
        />
      ),
    },
    {
      name: "Over content",
      description: "`overContent`: glass segments over the photo; the selected one takes the accent glass.",
      stage: "photo",
      render: () => <Segmented aria-label="Show" overContent defaultValue="all" options={views(3)} style={{ width: "min(22rem, 100%)" }} />,
    },
    {
      name: "Disabled",
      description: "Opaque on any backdrop — the selected segment keeps a neutral surface so it stays findable.",
      stage: "photo",
      render: () => <Segmented aria-label="Show" overContent disabled defaultValue="all" options={views(3)} style={{ width: "min(22rem, 100%)" }} />,
    },
  ],

  platforms: {
    intro: (
      <>
        Segmented is shared: one implementation on iOS, Android and the web. It does not switch to the system segmented
        control on iOS — the same connected, morphing segments everywhere.
      </>
    ),
  },

  usage: {
    guidelines: [
      "Segmented, Radio or TabBar? Segmented changes the view of the content right next to it, instantly. Radio picks a value in a form or settings page. TabBar moves between the app’s top-level destinations.",
      "Place it directly above (or over) the content it controls, full width of that content on phones.",
      "Two to five segments with one-word labels. Segments share the width equally, so long labels truncate.",
      "Always have one segment selected — it’s a view, and the user is always looking at one.",
      "Icons are optional; use them on every segment or none, the same Lucide icon as elsewhere in the app.",
      "Over photos and video set `overContent`; on the canvas keep the solid segments.",
      "Name it with `aria-label` (“Show”, “Layout”) — the name is not visible.",
    ],
    dos: [
      {
        kind: "do",
        title: "Switch views of the same content",
        caption: "One pack, filtered in place.",
        render: () => <Segmented aria-label="Show" defaultValue="all" options={views(3)} style={{ width: "min(20rem, 100%)" }} />,
      },
      {
        kind: "dont",
        title: "Don’t use it as app navigation",
        caption: "Library, Player and Settings are destinations — that’s a TabBar.",
        render: () => (
          <Segmented
            aria-label="Sections"
            defaultValue="library"
            style={{ width: "min(22rem, 100%)" }}
            options={[
              { value: "library", label: "Library", icon: <Library /> },
              { value: "player", label: "Player", icon: <Play /> },
              { value: "export", label: "Export", icon: <Upload /> },
              { value: "settings", label: "Settings", icon: <Settings2 /> },
            ]}
          />
        ),
      },
      {
        kind: "do",
        title: "One word per segment",
        caption: "Short labels fit even at phone width.",
        render: () => (
          <Segmented
            aria-label="Sort"
            size="s"
            defaultValue="name"
            style={{ width: "min(18rem, 100%)" }}
            options={[
              { value: "name", label: "Name" },
              { value: "date", label: "Date" },
              { value: "size", label: "Size" },
            ]}
          />
        ),
      },
      {
        kind: "dont",
        title: "Don’t write sentences",
        caption: "Equal-width segments cut long labels off.",
        render: () => (
          <Segmented
            aria-label="Sort"
            defaultValue="newest"
            style={{ width: "min(18rem, 100%)" }}
            options={[
              { value: "newest", label: "Newest stickers first" },
              { value: "largest", label: "Largest files first" },
              { value: "name", label: "Alphabetical by name" },
            ]}
          />
        ),
      },
      {
        kind: "do",
        title: "Buttons for actions",
        caption: "Actions run; they don’t stay selected.",
        render: () => (
          <Row>
            <Button variant="secondary" leadingIcon={<Pencil />}>
              Rename
            </Button>
            <Button variant="secondary" leadingIcon={<Share />}>
              Share
            </Button>
            <Button variant="danger" iconOnly aria-label="Delete">
              <Trash2 />
            </Button>
          </Row>
        ),
      },
      {
        kind: "dont",
        title: "Don’t turn segments into a toolbar",
        caption: "A “selected” Share segment makes no sense.",
        render: () => (
          <Segmented
            aria-label="Actions"
            defaultValue="rename"
            style={{ width: "min(22rem, 100%)" }}
            options={[
              { value: "rename", label: "Rename", icon: <Pencil /> },
              { value: "share", label: "Share", icon: <Share /> },
              { value: "delete", label: "Delete", icon: <Trash2 /> },
            ]}
          />
        ),
      },
    ],
    writing: [
      "One word per segment, a noun or an adjective, sentence case: All, Emoji, GIFs · Name, Date, Size.",
      "Parallel labels — all nouns or all adjectives, never a mix.",
      "No counts in the labels (“Emoji (112)”) — the content below shows how much there is.",
      "Keep labels identical on every platform.",
    ],
  },

  accessibility: {
    intro: (
      <>
        Segmented is a <code>role="radiogroup"</code> of <code>&lt;button role="radio"&gt;</code> segments with{" "}
        <code>aria-checked</code>. It keeps a roving tab stop and selection follows focus: the arrow keys move to the
        next segment and select it, like native radios.
      </>
    ),
    roles: [
      { element: "Root", role: "radiogroup", notes: "Name it with aria-label / aria-labelledby. aria-disabled when `disabled`." },
      { element: "Segment", role: "radio (<button>)", notes: "aria-checked; tabindex 0 on the selected (or first enabled) segment, -1 on the rest. Native `disabled` for unavailable ones." },
      { element: "Icon / check", role: "aria-hidden=\"true\"", notes: "Decorative; the label names the segment." },
    ],
    keyboard: [
      { keys: ["Tab"], action: "Enters the group on the selected segment, then leaves it." },
      { keys: ["→", "↓"], action: "Next enabled segment — moves focus and selects it. Wraps." },
      { keys: ["←", "↑"], action: "Previous enabled segment — moves focus and selects it. Wraps." },
      { keys: ["Home", "End"], action: "First / last enabled segment." },
      { keys: ["Space", "Enter"], action: "Selects the focused segment." },
    ],
    focus: [
      "Keyboard focus draws one 2px focus ring around the whole group (`:focus-visible` on any segment), not on a single segment.",
      "Disabled segments are skipped by the arrow keys and removed from the tab order.",
      "`onValueChange` fires only when the value actually changes — pressing the selected segment again reports nothing.",
    ],
    reducedMotion: [
      "With “reduce motion” on, the corner morph, the colour change and the icon-to-check slot switch instantly.",
    ],
    screenReader: [
      "Announced as “Emoji, radio button, checked, 2 of 3” inside the named group.",
      "The visible label is each segment’s only accessible name, so every segment needs text — there is no icon-only mode.",
    ],
  },

  api: [
    {
      component: "Segmented",
      props: [
        { name: "options", type: "SegmentedOption[]", required: true, description: "The segments, in order (see SegmentedOption)." },
        { name: "value", type: "string", description: "Controlled selected value." },
        { name: "defaultValue", type: "string", description: "Initial value when uncontrolled." },
        { name: "onValueChange", type: "(value: string) => void", description: "Fires with the newly selected value (pointer, Space / Enter, arrow keys)." },
        { name: "size", type: "\"s\" | \"m\" | \"l\"", default: "\"m\"", description: "Height 2 / 2.5 / 3 rem; padding, font and icon size follow." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables every segment; sets aria-disabled on the group." },
        { name: "overContent", type: "boolean", default: "false", description: "Glass segments for use over photos and video." },
        { name: "ref", type: "Ref<HTMLDivElement>", description: "The radiogroup element." },
      ],
      extends: "Also accepts native <div> attributes (aria-label, aria-labelledby, className, style, onKeyDown…), applied to the root.",
    },
    {
      component: "SegmentedOption",
      description: "One segment.",
      props: [
        { name: "value", type: "string", required: true, description: "Identifies the segment; also its React key." },
        { name: "label", type: "ReactNode", required: true, description: "Visible label; truncates with an ellipsis when space runs out." },
        { name: "icon", type: "ReactNode", description: "Leading Lucide icon (sized by the control). Replaced by the check while selected." },
        { name: "disabled", type: "boolean", description: "Unavailable segment; skipped by the arrow keys." },
      ],
    },
  ],

  storybook: {
    title: "Components/Segmented",
    stories: [
      { name: "Playground", export: "Playground" },
      { name: "Sizes", export: "Sizes" },
      { name: "With icons", export: "WithIcons" },
      { name: "Over content", export: "OverContent" },
    ],
  },
  related: ["tabbar", "radio", "switch"],
};

export default segmented;
