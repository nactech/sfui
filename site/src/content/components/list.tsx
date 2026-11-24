import { CircleAlert, Ellipsis, Pin, Repeat, Trash2 } from "lucide-react";
import { Button, List, ListAction, ListItem, ListStatus, ListThumbnail, Switch, type ListVariant } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { stickers } from "../shared";

const swipeActions = [
  { label: "Pin", icon: <Pin />, onSelect: () => {} },
  { label: "Delete", icon: <Trash2 />, tone: "danger" as const, onSelect: () => {} },
];

function Demo({ values }: DemoProps) {
  return (
    <List
      variant={values.variant as ListVariant}
      title="Recent"
      action={<ListAction>See All</ListAction>}
      selectable={Boolean(values.selectable)}
      defaultSelectedValues={["chilly"]}
      style={{ width: "min(30rem, 100%)" }}
    >
      {stickers.map((s, i) => (
        <ListItem
          key={s.value}
          value={s.value}
          leading={<ListThumbnail tone={s.tone}>{s.icon}</ListThumbnail>}
          title={s.title}
          subtitle={s.subtitle}
          trailing={i === 1 ? <ListStatus icon={<CircleAlert />}>{s.size}</ListStatus> : s.size}
          chevron
          onClick={() => {}}
          swipeActions={swipeActions}
        />
      ))}
      <ListItem
        leading={
          <ListThumbnail tone="positive">
            <Repeat />
          </ListThumbnail>
        }
        title="Loop playback"
        subtitle="Applies to all stickers"
        trailing={<Switch aria-label="Loop playback" defaultChecked />}
      />
      <ListItem
        leading={<ListThumbnail avatar>MF</ListThumbnail>}
        title="Mark Fomin"
        subtitle="Owner · you"
        trailing={
          <Button variant="ghost" size="s" iconOnly aria-label="More">
            <Ellipsis />
          </Button>
        }
      />
    </List>
  );
}

// TODO(docs): Usage, Accessibility and a variants gallery (segmented / flat / inset, swipe, edit mode).
const list: ComponentDoc = {
  slug: "list",
  name: "List",
  group: "Lists",
  summary: "Rows of media, status, controls and actions in three styles — segmented, flat and inset — with swipe and edit mode.",
  docStatus: "stub",
  status: "stable",
  exports: ["List", "ListItem", "ListThumbnail", "ListStatus", "ListAction"],
  platformSplit: "shared",
  Demo,
  controls: [
    { type: "enum", name: "variant", label: "Variant", options: ["inset", "segmented", "flat"], default: "inset" },
    { type: "boolean", name: "selectable", label: "Edit mode", default: false },
  ],
  overview: { intro: "A section with an optional title and action, and rows that can be links, buttons, swipeable or selectable in edit mode." },
  api: [
    {
      component: "List",
      props: [
        { name: "variant", type: "\"segmented\" | \"flat\" | \"inset\"", default: "\"inset\"", description: "Cells with gaps (feeds), rows on the canvas (media), or one grouped surface (settings)." },
        { name: "title", type: "ReactNode", description: "Section title (22/700); labels the section." },
        { name: "headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "2", description: "Heading level of the title." },
        { name: "action", type: "ReactNode", description: "Trailing header action, usually a ListAction (See All)." },
        { name: "selectable", type: "boolean", default: "false", description: "Edit mode: rows with a value get a selection circle; chevrons hide; swipe is off." },
        { name: "selectedValues / defaultSelectedValues", type: "string[]", description: "Selection, controlled or initial." },
        { name: "onSelectedValuesChange", type: "(values: string[]) => void", description: "Every toggle." },
        { name: "listLabel", type: "string", description: "Accessible name when there is no title." },
      ],
    },
    {
      component: "ListItem",
      props: [
        { name: "title", type: "ReactNode", required: true, description: "Row title." },
        { name: "value", type: "string", description: "Identifies the row for edit-mode selection." },
        { name: "leading", type: "ReactNode", description: "ListThumbnail (icon, avatar or image) or any node." },
        { name: "subtitle", type: "ReactNode", description: "One meta line (truncates)." },
        { name: "meta", type: "ReactNode", description: "Two-line secondary text." },
        { name: "trailing", type: "ReactNode", description: "A string renders as the mono value (41 KB); or ListStatus, Switch, a small Button." },
        { name: "chevron", type: "boolean", default: "false", description: "Trailing chevron (hidden in edit mode)." },
        { name: "href / onClick", type: "string / (event) => void", description: "Make the whole row a link or a button." },
        { name: "swipeActions", type: "ListSwipeAction[]", description: "Capsule actions revealed by swiping left; real buttons in the tab order." },
        { name: "disabled", type: "boolean", default: "false", description: "Opaque disabled row." },
      ],
    },
    {
      component: "ListThumbnail / ListStatus / ListAction",
      props: [
        { name: "ListThumbnail.tone", type: "\"accent\" | \"positive\" | \"warning\" | \"danger\" | \"neutral\"", default: "\"accent\"", description: "Tonal fill and icon colour." },
        { name: "ListThumbnail.avatar", type: "boolean", description: "Circle with mono initials." },
        { name: "ListThumbnail.src / alt", type: "string", description: "Image thumbnail." },
        { name: "ListStatus.tone", type: "ListTone", default: "\"danger\"", description: "Status pill tone." },
        { name: "ListStatus.icon / dot", type: "ReactNode / boolean", description: "Leading icon or dot." },
        { name: "ListAction.href", type: "string", description: "A link when set, otherwise a button." },
      ],
    },
  ],
  storybook: { title: "Components/List" },
  related: ["selection-bar", "selection-toolbar", "header"],
};

export default list;
