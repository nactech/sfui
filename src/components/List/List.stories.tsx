import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CarTaxiFront, CircleAlert, Ellipsis, House, Pin, Repeat, Snowflake, Trash2 } from "lucide-react";
import List, { ListAction, ListItem, ListStatus, ListThumbnail } from "./index";
import type { ListProps, ListVariant } from "./index";
import Button from "../Button";
import Switch from "../Switch";

const frame = { width: "32.5rem" };

const swipeActions = [
  { label: "Pin", icon: <Pin />, onSelect: () => {} },
  { label: "Delete", icon: <Trash2 />, tone: "danger" as const, onSelect: () => {} },
];

/** The five master rows (Media, Status, Control, Action, Two-line) as drawn in every L/x frame. */
const Rows = ({ disabled = false, swipe = false }: { disabled?: boolean; swipe?: boolean }) => (
  <>
    <ListItem
      value="chilly"
      leading={
        <ListThumbnail tone="accent">
          <Snowflake />
        </ListThumbnail>
      }
      title="Mr. Chilly"
      subtitle="2.4 s · 60 fps · 512²"
      trailing="41 KB"
      chevron
      onClick={() => {}}
      disabled={disabled}
      swipeActions={swipe ? swipeActions : undefined}
    />
    <ListItem
      value="taxi"
      leading={
        <ListThumbnail tone="warning">
          <CarTaxiFront />
        </ListThumbnail>
      }
      title="Robotaxi"
      subtitle="3.0 s · 60 fps"
      trailing={<ListStatus icon={<CircleAlert />}>71 KB</ListStatus>}
      chevron
      onClick={() => {}}
      disabled={disabled}
      swipeActions={swipe ? swipeActions : undefined}
    />
    <ListItem
      leading={
        <ListThumbnail tone="positive">
          <Repeat />
        </ListThumbnail>
      }
      title="Loop playback"
      subtitle="Applies to all stickers"
      trailing={<Switch aria-label="Loop playback" defaultChecked disabled={disabled} />}
      disabled={disabled}
    />
    <ListItem
      leading={<ListThumbnail avatar>MF</ListThumbnail>}
      title="Mark Fomin"
      subtitle="Owner · you"
      trailing={
        <Button variant="secondary" size="s" disabled={disabled}>
          Share
        </Button>
      }
      disabled={disabled}
    />
    <ListItem
      value="ladies"
      leading={
        <ListThumbnail tone="danger">
          <House />
        </ListThumbnail>
      }
      title="Painted Ladies"
      meta="Three houses, one fog layer and a cable car. Draft — needs a lighter fog pass."
      trailing={
        <Button variant="ghost" size="s" iconOnly aria-label="More" disabled={disabled}>
          <Ellipsis />
        </Button>
      }
      onClick={() => {}}
      disabled={disabled}
      swipeActions={swipe ? swipeActions : undefined}
    />
  </>
);

const Recent = ({
  variant,
  disabled,
  swipe,
  ...props
}: { variant: ListVariant; disabled?: boolean; swipe?: boolean } & Omit<ListProps, "variant" | "title">) => (
  <List variant={variant} title="Recent" action={<ListAction href="#all">See All</ListAction>} style={frame} {...props}>
    <Rows disabled={disabled} swipe={swipe} />
  </List>
);

const Styles = (props: { disabled?: boolean; swipe?: boolean } & Omit<ListProps, "variant" | "title">) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "flex-start" }}>
    <Recent variant="segmented" {...props} />
    <Recent variant="flat" {...props} />
    <Recent variant="inset" {...props} />
  </div>
);

const meta = {
  title: "Components/List",
  component: List,
  tags: ["autodocs"],
  args: { variant: "inset", title: "Recent" },
  argTypes: {
    variant: { control: "inline-radio", options: ["segmented", "flat", "inset"] },
    selectable: { control: "boolean" },
  },
  render: (args) => (
    <List {...args} action={<ListAction href="#all">See All</ListAction>} style={frame}>
      <Rows swipe />
    </List>
  ),
} satisfies Meta<typeof List>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Playground: switch the style, toggle edit mode. Rows with a chevron are interactive (hover / press them). */
export const Default: Story = {};

/** L/A1 · L/B1 · L/C1 Rest — Segmented, Flat on canvas, Inset group side by side. Press a row for L/x2. */
export const Rest: Story = { render: () => <Styles /> };

/** L/x3 Selected — edit mode: selection circles on rows with a value, chevrons hidden, list/selected tint. */
export const Selected: Story = { render: () => <Styles selectable defaultSelectedValues={["chilly", "ladies"]} /> };

/** L/x4 Disabled — opaque disabled tokens, trailing controls disabled too. */
export const Disabled: Story = { render: () => <Styles disabled /> };

/**
 * L/x5 Swipe — drag a row left (touch or mouse) to reveal Pin / Delete. Keyboard: Tab past a row's action to reach
 * its capsules (the row opens), Escape closes. Media, Status and Two-line rows have actions.
 */
export const Swipe: Story = { render: () => <Styles swipe /> };

/** Edit mode toggled from the header action, as an app would. */
export const EditMode: Story = {
  render: function EditModeStory() {
    const [editing, setEditing] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <List
        variant="segmented"
        title={editing ? `${selected.length} selected` : "Recent"}
        action={<ListAction onClick={() => setEditing((e) => !e)}>{editing ? "Done" : "Select"}</ListAction>}
        selectable={editing}
        selectedValues={selected}
        onSelectedValuesChange={setSelected}
        style={frame}
      >
        <Rows swipe />
      </List>
    );
  },
};
