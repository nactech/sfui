import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Radio from "./Radio";
import RadioGroup from "./RadioGroup";

const Sizes = (props: React.ComponentProps<typeof RadioGroup>) => (
  <RadioGroup aria-label="Size" {...props}>
    <Radio value="s" label="Small" />
    <Radio value="m" label="Medium" />
    <Radio value="l" label="Large" disabled />
    <Radio value="xl" label="Extra large" />
  </RadioGroup>
);

describe("RadioGroup + Radio", () => {
  test("renders a labelled radiogroup of native radios sharing one name", () => {
    render(<Sizes defaultValue="m" />);
    expect(screen.getByRole("radiogroup", { name: "Size" })).toBeInTheDocument();
    const radios = screen.getAllByRole<HTMLInputElement>("radio");
    expect(radios).toHaveLength(4);
    const names = new Set(radios.map((radio) => radio.name));
    expect(names.size).toBe(1);
    expect(radios[0].name).not.toBe("");
    expect(screen.getByRole("radio", { name: "Medium" })).toBeChecked();
  });

  test("uses the provided name", () => {
    render(<Sizes name="size" />);
    for (const radio of screen.getAllByRole<HTMLInputElement>("radio")) expect(radio.name).toBe("size");
  });

  test("uncontrolled: selects on click and reports the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Sizes defaultValue="s" onValueChange={onValueChange} />);
    await user.click(screen.getByText("Extra large"));
    expect(screen.getByRole("radio", { name: "Extra large" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Small" })).not.toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith("xl");
  });

  test("roving tab stop: only the checked radio is tabbable", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>before</button>
        <Sizes defaultValue="m" />
      </>,
    );
    expect(screen.getByRole("radio", { name: "Small" })).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("radio", { name: "Medium" })).toHaveAttribute("tabindex", "0");
    await user.click(screen.getByRole("button", { name: "before" }));
    await user.tab();
    expect(screen.getByRole("radio", { name: "Medium" })).toHaveFocus();
  });

  test("without a value the first enabled radio is the tab stop", () => {
    render(<Sizes />);
    expect(screen.getByRole("radio", { name: "Small" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "Medium" })).toHaveAttribute("tabindex", "-1");
  });

  test("arrow keys move focus + selection, skip disabled radios and wrap; Home/End jump", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Sizes defaultValue="m" onValueChange={onValueChange} />);
    const medium = screen.getByRole("radio", { name: "Medium" });
    const xl = screen.getByRole("radio", { name: "Extra large" });
    const small = screen.getByRole("radio", { name: "Small" });
    medium.focus();

    await user.keyboard("{ArrowDown}"); // skips disabled "Large"
    expect(xl).toHaveFocus();
    expect(xl).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith("xl");

    await user.keyboard("{ArrowRight}"); // wraps
    expect(small).toHaveFocus();
    expect(small).toBeChecked();

    await user.keyboard("{ArrowUp}"); // wraps back
    expect(xl).toHaveFocus();

    await user.keyboard("{Home}");
    expect(small).toBeChecked();
    await user.keyboard("{End}");
    expect(xl).toBeChecked();
  });

  test("controlled: follows value; reports without changing on its own", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Sizes value="s" onValueChange={onValueChange} />);
    await user.click(screen.getByText("Medium"));
    expect(onValueChange).toHaveBeenCalledWith("m");
    expect(screen.getByRole("radio", { name: "Small" })).toBeChecked();
    rerender(<Sizes value="m" onValueChange={onValueChange} />);
    expect(screen.getByRole("radio", { name: "Medium" })).toBeChecked();
  });

  test("controlled round-trip with state", async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [value, setValue] = useState("s");
      return (
        <>
          <Sizes value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      );
    };
    render(<Harness />);
    await user.click(screen.getByText("Extra large"));
    expect(screen.getByRole("status")).toHaveTextContent("xl");
  });

  test("disabled group disables every radio", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Sizes disabled onValueChange={onValueChange} />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-disabled", "true");
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
    await user.click(screen.getByText("Small"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("a disabled radio cannot be selected", async () => {
    const user = userEvent.setup();
    render(<Sizes defaultValue="s" />);
    await user.click(screen.getByText("Large"));
    expect(screen.getByRole("radio", { name: "Large" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Small" })).toBeChecked();
  });
});
