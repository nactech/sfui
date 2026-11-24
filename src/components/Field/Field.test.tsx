import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TextField, { SearchField, SelectField, TextArea } from "./index";

const fieldRoot = (el: HTMLElement) => el.closest("[data-kind]") as HTMLElement;

describe("TextField", () => {
  test("associates the floating label with the input", () => {
    render(<TextField label="Pack name" placeholder="Name your pack" />);
    const input = screen.getByRole("textbox", { name: "Pack name" });
    expect(input).toHaveAttribute("placeholder", "Name your pack");
    // A placeholder keeps the label in the small top position (F/B1 Rest).
    expect(fieldRoot(input)).toHaveAttribute("data-floating");
  });

  test("label rests in the field until focused or filled", async () => {
    const user = userEvent.setup();
    render(<TextField label="Pack name" />);
    const input = screen.getByRole("textbox", { name: "Pack name" });
    const root = fieldRoot(input);
    expect(root).not.toHaveAttribute("data-floating");

    await user.click(screen.getByText("Pack name"));
    expect(input).toHaveFocus();
    expect(root).toHaveAttribute("data-floating");

    await user.tab();
    expect(root).not.toHaveAttribute("data-floating");

    await user.type(input, "Foggy");
    await user.tab();
    expect(root).toHaveAttribute("data-floating");
    expect(root).toHaveAttribute("data-filled");
  });

  test("uncontrolled: keeps its own value and reports changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(<TextField label="Pack name" defaultValue="Foggy" onValueChange={onValueChange} onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Pack name" });
    await user.type(input, "!");
    expect(input).toHaveValue("Foggy!");
    expect(onValueChange).toHaveBeenLastCalledWith("Foggy!");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("controlled: follows the value prop", async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [value, setValue] = useState("foggy");
      return <TextField label="Short link" value={value} onValueChange={(v) => setValue(v.toLowerCase())} />;
    };
    render(<Controlled />);
    const input = screen.getByRole("textbox", { name: "Short link" });
    await user.type(input, "_SF");
    expect(input).toHaveValue("foggy_sf");
  });

  test("helper text describes the input; error replaces it and sets aria-invalid", () => {
    const { rerender } = render(<TextField label="Pack name" helperText="Shown as the pack title in Telegram" />);
    const input = screen.getByRole("textbox", { name: "Pack name" });
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).toHaveAccessibleDescription("Shown as the pack title in Telegram");

    rerender(<TextField label="Pack name" helperText="Shown as the pack title in Telegram" error="Name is required" />);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Name is required");
    expect(screen.queryByText("Shown as the pack title in Telegram")).not.toBeInTheDocument();

    rerender(<TextField label="Pack name" helperText="Shown as the pack title in Telegram" error />);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Shown as the pack title in Telegram");
  });

  test("prefix is shown and read as part of the description", () => {
    render(<TextField label="Short link" prefix="t.me/addstickers/" defaultValue="foggy_sf" helperText="Letters" />);
    const input = screen.getByRole("textbox", { name: "Short link" });
    expect(screen.getByText("t.me/addstickers/")).toBeInTheDocument();
    expect(input).toHaveAccessibleDescription("t.me/addstickers/ Letters");
    expect(fieldRoot(input)).toHaveAttribute("data-floating");
  });

  test("soft counter turns the field invalid past maxCount", async () => {
    const user = userEvent.setup();
    render(<TextField label="Name" defaultValue="abc" maxCount={4} />);
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(screen.getByText("3/4")).toBeInTheDocument();
    await user.type(input, "de");
    expect(screen.getByText("5/4")).toHaveAttribute("data-over");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  test("disabled blocks input and marks the field", async () => {
    const user = userEvent.setup();
    render(<TextField label="Pack name" defaultValue="Foggy Stickers" disabled />);
    const input = screen.getByRole("textbox", { name: "Pack name" });
    expect(input).toBeDisabled();
    expect(fieldRoot(input)).toHaveAttribute("data-disabled");
    await user.type(input, "x");
    expect(input).toHaveValue("Foggy Stickers");
  });

  test("forwards ref, required and native props to the input; className to the wrapper", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<TextField ref={ref} label="Email" type="email" name="email" required className="custom" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(ref.current).toBe(input);
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("name", "email");
    expect(fieldRoot(input)).toHaveClass("custom");
  });
});

describe("SearchField", () => {
  test("is a searchbox named by its label, with a key hint while empty", () => {
    render(<SearchField label="Search stickers" shortcut="⌘K" />);
    const input = screen.getByRole("searchbox", { name: "Search stickers" });
    expect(input).toHaveAttribute("placeholder", "Search stickers");
    expect(screen.getByText("⌘K")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  test("clear button empties an uncontrolled field and keeps focus", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const onValueChange = vi.fn();
    render(<SearchField label="Search stickers" shortcut="⌘K" onClear={onClear} onValueChange={onValueChange} />);
    const input = screen.getByRole("searchbox");
    await user.type(input, "chil");
    expect(screen.queryByText("⌘K")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  test("Escape clears a controlled field", async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [q, setQ] = useState("chilly");
      return <SearchField label="Search" value={q} onValueChange={setQ} />;
    };
    render(<Controlled />);
    const input = screen.getByRole("searchbox");
    await user.click(input);
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("");
  });

  test("error message describes the field", () => {
    render(<SearchField label="Search" defaultValue="chily" error="No matches for “chily”" />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("No matches for “chily”");
  });

  test("disabled hides clear and key hint", () => {
    render(<SearchField label="Search" defaultValue="chilly" shortcut="⌘K" disabled />);
    expect(screen.getByRole("searchbox")).toBeDisabled();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("⌘K")).not.toBeInTheDocument();
  });
});

const fps = [
  { value: "30", label: "30 fps" },
  { value: "60", label: "60 fps" },
];

describe("SelectField", () => {
  test("native select named by the label, placeholder while empty", () => {
    render(<SelectField label="Frame rate" options={fps} placeholder="Choose…" />);
    const select = screen.getByRole("combobox", { name: "Frame rate" });
    expect(select).toHaveValue("");
    expect(select).toHaveAttribute("data-empty");
    const placeholder = (select as HTMLSelectElement).options[0];
    expect(placeholder).toHaveTextContent("Choose…");
    expect(placeholder).toBeDisabled();
  });

  test("uncontrolled selection reports the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SelectField label="Frame rate" options={fps} placeholder="Choose…" onValueChange={onValueChange} />);
    const select = screen.getByRole("combobox", { name: "Frame rate" });
    await user.selectOptions(select, "60");
    expect(select).toHaveValue("60");
    expect(select).not.toHaveAttribute("data-empty");
    expect(onValueChange).toHaveBeenCalledWith("60");
  });

  test("controlled value wins", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SelectField label="Frame rate" options={fps} value="30" onValueChange={onValueChange} />);
    const select = screen.getByRole("combobox", { name: "Frame rate" });
    await user.selectOptions(select, "60");
    expect(onValueChange).toHaveBeenCalledWith("60");
    expect(select).toHaveValue("30");
  });

  test("keyboard reaches the select; error and disabled are exposed", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SelectField label="Frame rate" options={fps} error="Pick a frame rate" />);
    const select = screen.getByRole("combobox", { name: "Frame rate" });
    await user.tab();
    expect(select).toHaveFocus();
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAccessibleDescription("Pick a frame rate");

    rerender(<SelectField label="Frame rate" options={fps} disabled />);
    expect(select).toBeDisabled();
  });
});

describe("TextArea", () => {
  test("multiline field with label, helper and counter", async () => {
    const user = userEvent.setup();
    render(<TextArea label="Description" helperText="Shown on the pack page" maxCount={10} placeholder="What's in the pack?" />);
    const textarea = screen.getByRole("textbox", { name: "Description" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("rows", "3");
    expect(screen.getByText("0/10")).toBeInTheDocument();

    await user.type(textarea, "Foggy San Francisco");
    expect(screen.getByText("19/10")).toHaveAttribute("data-over");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("Shown on the pack page 19/10");
  });

  test("controlled value and disabled", () => {
    render(<TextArea label="Description" value="Foggy" onValueChange={() => {}} disabled />);
    const textarea = screen.getByRole("textbox", { name: "Description" });
    expect(textarea).toHaveValue("Foggy");
    expect(textarea).toBeDisabled();
  });
});
