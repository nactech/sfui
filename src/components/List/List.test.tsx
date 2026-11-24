import React, { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pin, Snowflake, Trash2 } from "lucide-react";

import List, { ListAction, ListItem, ListStatus, ListThumbnail } from "./index";
import Switch from "../Switch";

const swipe = (el: Element, from: number, to: number, pointerType = "touch") => {
  fireEvent.pointerDown(el, { pointerId: 1, clientX: from, clientY: 20, pointerType, button: 0 });
  const steps = 4;
  for (let i = 1; i <= steps; i++) {
    fireEvent.pointerMove(el, { pointerId: 1, clientX: from + ((to - from) * i) / steps, clientY: 20, pointerType });
  }
  fireEvent.pointerUp(el, { pointerId: 1, clientX: to, clientY: 20, pointerType });
};

const rowOf = (name: string) => screen.getByText(name).closest("li") as HTMLLIElement;
const contentOf = (name: string) => rowOf(name).querySelector(".content") as HTMLElement;

describe("List", () => {
  test("renders a named section with a heading, header action and a list of rows", () => {
    render(
      <List variant="segmented" title="Recent" action={<ListAction href="/all">See All</ListAction>}>
        <ListItem title="Mr. Chilly" subtitle="2.4 s · 60 fps" trailing="41 KB" chevron />
        <ListItem title="Robotaxi" trailing={<ListStatus>71 KB</ListStatus>} />
      </List>,
    );
    const section = screen.getByRole("region", { name: "Recent" });
    expect(section).toHaveAttribute("data-variant", "segmented");
    expect(within(section).getByRole("heading", { level: 2, name: "Recent" })).toBeInTheDocument();
    expect(within(section).getByRole("link", { name: "See All" })).toHaveAttribute("href", "/all");
    const list = within(section).getByRole("list", { name: "Recent" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("41 KB")).toHaveClass("value");
  });

  test("defaults to the inset style", () => {
    render(
      <List listLabel="Settings">
        <ListItem title="Loop playback" />
      </List>,
    );
    expect(screen.getByRole("list", { name: "Settings" }).closest("section")).toHaveAttribute("data-variant", "inset");
  });

  test("onClick makes the whole row a button named by the title and described by the meta", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <List>
        <ListItem title="Mr. Chilly" subtitle="2.4 s · 60 fps" onClick={onClick} chevron />
      </List>,
    );
    const button = screen.getByRole("button", { name: "Mr. Chilly" });
    expect(button).toHaveAccessibleDescription("2.4 s · 60 fps");
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);

    button.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  test("href makes the row a link", () => {
    render(
      <List>
        <ListItem title="Painted Ladies" href="/stickers/painted-ladies" />
      </List>,
    );
    expect(screen.getByRole("link", { name: "Painted Ladies" })).toHaveAttribute("href", "/stickers/painted-ladies");
  });

  test("trailing controls stay independent from the row action", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <List>
        <ListItem
          title="Loop playback"
          onClick={onClick}
          trailing={<Switch aria-label="Loop playback" onCheckedChange={onCheckedChange} />}
        />
      </List>,
    );
    await user.click(screen.getByRole("switch", { name: "Loop playback" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("disabled rows: disabled action, no swipe actions", () => {
    render(
      <List>
        <ListItem
          title="Mr. Chilly"
          onClick={() => {}}
          disabled
          swipeActions={[{ label: "Delete", icon: <Trash2 />, tone: "danger", onSelect: () => {} }]}
        />
      </List>,
    );
    expect(screen.getByRole("button", { name: "Mr. Chilly" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(rowOf("Mr. Chilly")).toHaveAttribute("data-disabled");
  });

  test("thumbnail is decorative unless it has alt text; status pill renders its icon", () => {
    render(
      <List>
        <ListItem
          title="Mr. Chilly"
          leading={
            <ListThumbnail tone="accent" data-testid="thumb">
              <Snowflake />
            </ListThumbnail>
          }
          trailing={<ListStatus icon={<Snowflake data-testid="status-icon" />}>71 KB</ListStatus>}
        />
        <ListItem title="Photo" leading={<ListThumbnail src="data:image/gif;base64,R0lGOD" alt="Fog over the bay" />} />
      </List>,
    );
    expect(screen.getByTestId("thumb")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("img", { name: "Fog over the bay" })).toBeInTheDocument();
    expect(screen.getByTestId("status-icon")).toBeInTheDocument();
  });
});

describe("List edit mode", () => {
  const Rows = () => (
    <>
      <ListItem value="chilly" title="Mr. Chilly" subtitle="2.4 s" chevron onClick={() => {}} />
      <ListItem value="taxi" title="Robotaxi" chevron />
      <ListItem title="Loop playback" trailing={<Switch aria-label="Loop" />} />
      <ListItem value="ladies" title="Painted Ladies" disabled />
    </>
  );

  test("rows with a value get a selection checkbox named by the title; chevrons hide", () => {
    const { container } = render(
      <List selectable>
        <Rows />
      </List>,
    );
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    expect(screen.getByRole("checkbox", { name: "Mr. Chilly" })).toHaveAccessibleDescription("2.4 s");
    expect(screen.getByRole("checkbox", { name: "Painted Ladies" })).toBeDisabled();
    expect(container.querySelector(".chevron")).toBeNull();
    // The row's own action is suspended while selecting.
    expect(screen.queryByRole("button", { name: "Mr. Chilly" })).not.toBeInTheDocument();
  });

  test("uncontrolled: clicking the row or pressing Space toggles, reporting the selection", async () => {
    const user = userEvent.setup();
    const onSelectedValuesChange = vi.fn();
    render(
      <List selectable defaultSelectedValues={["taxi"]} onSelectedValuesChange={onSelectedValuesChange}>
        <Rows />
      </List>,
    );
    expect(rowOf("Robotaxi")).toHaveAttribute("data-state", "selected");

    await user.click(screen.getByText("Mr. Chilly"));
    expect(screen.getByRole("checkbox", { name: "Mr. Chilly" })).toBeChecked();
    expect(rowOf("Mr. Chilly")).toHaveAttribute("data-state", "selected");
    expect(onSelectedValuesChange).toHaveBeenLastCalledWith(["taxi", "chilly"]);

    screen.getByRole("checkbox", { name: "Robotaxi" }).focus();
    await user.keyboard(" ");
    expect(screen.getByRole("checkbox", { name: "Robotaxi" })).not.toBeChecked();
    expect(onSelectedValuesChange).toHaveBeenLastCalledWith(["chilly"]);
  });

  test("controlled: follows selectedValues", async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [values, setValues] = useState<string[]>([]);
      return (
        <>
          <output data-testid="out">{values.join(",")}</output>
          <List selectable selectedValues={values} onSelectedValuesChange={setValues}>
            <Rows />
          </List>
        </>
      );
    };
    render(<Harness />);
    await user.click(screen.getByRole("checkbox", { name: "Robotaxi" }));
    await user.click(screen.getByRole("checkbox", { name: "Mr. Chilly" }));
    expect(screen.getByTestId("out")).toHaveTextContent("taxi,chilly");

    const onChange = vi.fn();
    render(
      <List selectable selectedValues={["chilly"]} onSelectedValuesChange={onChange} listLabel="Fixed">
        <ListItem value="chilly" title="Fixed chilly" />
      </List>,
    );
    const fixed = screen.getByRole("checkbox", { name: "Fixed chilly" });
    await user.click(fixed);
    expect(onChange).toHaveBeenCalledWith([]);
    expect(fixed).toBeChecked(); // parent did not update
  });

  test("disabled rows do not toggle", async () => {
    const user = userEvent.setup();
    const onSelectedValuesChange = vi.fn();
    render(
      <List selectable onSelectedValuesChange={onSelectedValuesChange}>
        <Rows />
      </List>,
    );
    await user.click(screen.getByText("Painted Ladies"));
    expect(onSelectedValuesChange).not.toHaveBeenCalled();
  });
});

describe("List swipe actions", () => {
  const Swipeable = ({ onPin = () => {}, onDelete = () => {}, onClick = () => {} }) => (
    <List variant="segmented" title="Recent">
      <ListItem
        title="Mr. Chilly"
        onClick={onClick}
        swipeActions={[
          { label: "Pin", icon: <Pin />, onSelect: onPin },
          { label: "Delete", icon: <Trash2 />, tone: "danger", onSelect: onDelete },
        ]}
      />
      <ListItem
        title="Robotaxi"
        swipeActions={[{ label: "Archive", icon: <Pin />, onSelect: () => {} }]}
      />
    </List>
  );

  test("actions are real buttons grouped under the row title", () => {
    render(<Swipeable />);
    const group = screen.getByRole("group", { name: "Mr. Chilly" });
    expect(within(group).getByRole("button", { name: "Pin" })).toHaveAttribute("data-tone", "default");
    expect(within(group).getByRole("button", { name: "Delete" })).toHaveAttribute("data-tone", "danger");
    expect(rowOf("Mr. Chilly")).toHaveAttribute("data-swipe", "closed");
  });

  test("swiping left past half the reveal snaps open; a short swipe snaps back", async () => {
    render(<Swipeable />);
    const row = rowOf("Mr. Chilly");
    // A slow short swipe: the pause before release cancels any flick, so only the distance decides.
    // (Without it, synthetic events that happen to land ≥4ms apart read as a fast flick and open the row.)
    const el = contentOf("Mr. Chilly");
    fireEvent.pointerDown(el, { pointerId: 1, clientX: 300, clientY: 20, pointerType: "touch", button: 0 });
    for (const x of [292, 285, 278, 270]) {
      fireEvent.pointerMove(el, { pointerId: 1, clientX: x, clientY: 20, pointerType: "touch" });
    }
    await new Promise((resolve) => setTimeout(resolve, 120));
    fireEvent.pointerUp(el, { pointerId: 1, clientX: 270, clientY: 20, pointerType: "touch" });
    expect(row).toHaveAttribute("data-swipe", "closed");
    expect(row.style.getPropertyValue("--_offset")).toBe("0rem");

    swipe(contentOf("Mr. Chilly"), 300, 180);
    expect(row).toHaveAttribute("data-swipe", "open");
    expect(row.style.getPropertyValue("--_offset")).toBe("8rem"); // 128 design px

    // Swiping right closes it again.
    swipe(contentOf("Mr. Chilly"), 180, 300);
    expect(row).toHaveAttribute("data-swipe", "closed");
  });

  test("works with a mouse drag too, and the drag never activates the row", () => {
    const onClick = vi.fn();
    render(<Swipeable onClick={onClick} />);
    const content = contentOf("Mr. Chilly");
    swipe(content, 300, 150, "mouse");
    fireEvent.click(screen.getByRole("button", { name: "Mr. Chilly" }), { detail: 1 });
    expect(onClick).not.toHaveBeenCalled();
    expect(rowOf("Mr. Chilly")).toHaveAttribute("data-swipe", "open");

    // A tap on the open row closes it instead of activating it.
    fireEvent.pointerDown(content, { pointerId: 2, clientX: 100, clientY: 20, pointerType: "mouse", button: 0 });
    fireEvent.pointerUp(content, { pointerId: 2, clientX: 100, clientY: 20, pointerType: "mouse" });
    fireEvent.click(screen.getByRole("button", { name: "Mr. Chilly" }), { detail: 1 });
    expect(onClick).not.toHaveBeenCalled();
    expect(rowOf("Mr. Chilly")).toHaveAttribute("data-swipe", "closed");
  });

  test("vertical drags are left to scrolling", () => {
    render(<Swipeable />);
    const content = contentOf("Mr. Chilly");
    fireEvent.pointerDown(content, { pointerId: 1, clientX: 300, clientY: 20, pointerType: "touch" });
    fireEvent.pointerMove(content, { pointerId: 1, clientX: 290, clientY: 80, pointerType: "touch" });
    fireEvent.pointerMove(content, { pointerId: 1, clientX: 150, clientY: 90, pointerType: "touch" });
    fireEvent.pointerUp(content, { pointerId: 1, clientX: 150, clientY: 90, pointerType: "touch" });
    expect(rowOf("Mr. Chilly")).toHaveAttribute("data-swipe", "closed");
  });

  test("only one row is open at a time; tapping outside closes it", () => {
    render(<Swipeable />);
    swipe(contentOf("Mr. Chilly"), 300, 150);
    expect(rowOf("Mr. Chilly")).toHaveAttribute("data-swipe", "open");
    swipe(contentOf("Robotaxi"), 300, 150);
    expect(rowOf("Robotaxi")).toHaveAttribute("data-swipe", "open");
    expect(rowOf("Mr. Chilly")).toHaveAttribute("data-swipe", "closed");

    fireEvent.pointerDown(document.body);
    expect(rowOf("Robotaxi")).toHaveAttribute("data-swipe", "closed");
  });

  test("keyboard: tabbing into the actions reveals them; activating runs the action; Escape closes", async () => {
    const user = userEvent.setup();
    const onPin = vi.fn();
    const onDelete = vi.fn();
    render(<Swipeable onPin={onPin} onDelete={onDelete} />);
    const row = rowOf("Mr. Chilly");

    await user.tab();
    expect(screen.getByRole("button", { name: "Mr. Chilly" })).toHaveFocus();
    expect(row).toHaveAttribute("data-swipe", "closed");

    await user.tab();
    expect(screen.getByRole("button", { name: "Pin" })).toHaveFocus();
    expect(row).toHaveAttribute("data-swipe", "open");

    await user.keyboard("{Escape}");
    expect(row).toHaveAttribute("data-swipe", "closed");
    expect(screen.getByRole("button", { name: "Mr. Chilly" })).toHaveFocus();

    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "Delete" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(row).toHaveAttribute("data-swipe", "closed");
    expect(screen.getByRole("button", { name: "Mr. Chilly" })).toHaveFocus();

    // Leaving the row closes it.
    await user.tab();
    expect(row).toHaveAttribute("data-swipe", "open");
    await user.tab();
    await user.tab();
    expect(row).toHaveAttribute("data-swipe", "closed");
  });

  test("edit mode disables swiping", () => {
    render(
      <List selectable>
        <ListItem value="a" title="Mr. Chilly" swipeActions={[{ label: "Pin", icon: <Pin />, onSelect: () => {} }]} />
      </List>,
    );
    expect(screen.queryByRole("button", { name: "Pin" })).not.toBeInTheDocument();
    swipe(contentOf("Mr. Chilly"), 300, 100);
    expect(rowOf("Mr. Chilly")).not.toHaveAttribute("data-swipe");
  });
});
