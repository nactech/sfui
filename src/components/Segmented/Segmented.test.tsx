import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Smile } from "lucide-react";

import Segmented, { type SegmentedOption } from "./Segmented";

const options: SegmentedOption[] = [
  { value: "stickers", label: "Stickers" },
  { value: "emoji", label: "Emoji", icon: <Smile data-testid="emoji-icon" /> },
  { value: "gifs", label: "GIFs", disabled: true },
  { value: "masks", label: "Masks" },
];

describe("Segmented", () => {
  test("renders a radiogroup of radio segments", () => {
    render(<Segmented aria-label="Content" options={options} defaultValue="stickers" />);
    expect(screen.getByRole("radiogroup", { name: "Content" })).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(4);
    expect(screen.getByRole("radio", { name: "Stickers" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Emoji" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: "GIFs" })).toBeDisabled();
  });

  test("marks connected positions for the shape morph", () => {
    render(<Segmented aria-label="Content" options={options} />);
    const radios = screen.getAllByRole("radio");
    expect(radios.map((radio) => radio.getAttribute("data-position"))).toEqual(["first", "middle", "middle", "last"]);
  });

  test("selected segment swaps its icon for the check", async () => {
    const user = userEvent.setup();
    render(<Segmented aria-label="Content" options={options} defaultValue="stickers" />);
    expect(screen.getByTestId("emoji-icon")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Emoji" }));
    expect(screen.queryByTestId("emoji-icon")).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Emoji" }).querySelector("svg")).not.toBeNull();
  });

  test("uncontrolled: selects on click and reports the value once", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Segmented aria-label="Content" options={options} defaultValue="stickers" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("radio", { name: "Masks" }));
    expect(screen.getByRole("radio", { name: "Masks" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenCalledWith("masks");
    await user.click(screen.getByRole("radio", { name: "Masks" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  test("roving tab stop on the selected segment", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>before</button>
        <Segmented aria-label="Content" options={options} defaultValue="emoji" />
      </>,
    );
    expect(screen.getByRole("radio", { name: "Stickers" })).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("radio", { name: "Emoji" })).toHaveAttribute("tabindex", "0");
    await user.click(screen.getByRole("button", { name: "before" }));
    await user.tab();
    expect(screen.getByRole("radio", { name: "Emoji" })).toHaveFocus();
  });

  test("arrow keys move focus + selection, skip disabled, wrap; Home/End jump", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Segmented aria-label="Content" options={options} defaultValue="emoji" onValueChange={onValueChange} />);
    const emoji = screen.getByRole("radio", { name: "Emoji" });
    const masks = screen.getByRole("radio", { name: "Masks" });
    const stickers = screen.getByRole("radio", { name: "Stickers" });
    emoji.focus();

    await user.keyboard("{ArrowRight}");
    expect(masks).toHaveFocus();
    expect(masks).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("masks");

    await user.keyboard("{ArrowRight}");
    expect(stickers).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(masks).toHaveFocus();

    await user.keyboard("{Home}");
    expect(stickers).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{End}");
    expect(masks).toHaveAttribute("aria-checked", "true");
  });

  test("Space and Enter select the focused segment", async () => {
    const user = userEvent.setup();
    render(<Segmented aria-label="Content" options={options} />);
    const stickers = screen.getByRole("radio", { name: "Stickers" });
    expect(stickers).toHaveAttribute("tabindex", "0");
    await user.tab();
    expect(stickers).toHaveFocus();
    await user.keyboard(" ");
    expect(stickers).toHaveAttribute("aria-checked", "true");
  });

  test("controlled: follows value", async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [value, setValue] = useState("stickers");
      return <Segmented aria-label="Content" options={options} value={value} onValueChange={setValue} />;
    };
    render(<Harness />);
    await user.click(screen.getByRole("radio", { name: "Emoji" }));
    expect(screen.getByRole("radio", { name: "Emoji" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Stickers" })).toHaveAttribute("aria-checked", "false");
  });

  test("disabled group: every segment disabled, nothing reported", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Segmented aria-label="Content" options={options} defaultValue="stickers" disabled onValueChange={onValueChange} />,
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-disabled", "true");
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: "Emoji" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("size, overContent and className hooks", () => {
    render(<Segmented aria-label="Content" options={options} size="l" overContent className="extra" />);
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveClass("root", "sizeL", "extra");
    expect(group).toHaveAttribute("data-over-content");
  });
});
