import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import InsetForm, { InsetFormRow, InsetFormSearch, InsetFormSelectRow, InsetFormTextAreaRow } from "./index";

const fps = [
  { value: "30", label: "30 fps" },
  { value: "60", label: "60 fps" },
];

const rowOf = (el: HTMLElement) => el.closest("[data-kind]") as HTMLElement;

describe("InsetForm", () => {
  test("renders a labelled, described group of rows", () => {
    render(
      <InsetForm title="Pack" footer="Name and link are shown in Telegram.">
        <InsetFormRow label="Name" placeholder="Name your pack" />
        <InsetFormRow label="Link" prefix="t.me/addstickers/" placeholder="short_name" />
        <InsetFormSelectRow label="Frame rate" options={fps} placeholder="Choose…" />
        <InsetFormTextAreaRow label="Description" placeholder="What's in the pack?" maxCount={120} />
      </InsetForm>,
    );
    const group = screen.getByRole("group", { name: "Pack" });
    expect(group).toHaveAccessibleDescription("Name and link are shown in Telegram.");
    expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Link" })).toHaveAccessibleDescription("t.me/addstickers/");
    expect(screen.getByRole("combobox", { name: "Frame rate" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Description" }).tagName).toBe("TEXTAREA");
    expect(screen.getByText("0/120")).toBeInTheDocument();
  });

  test("Tab walks the rows in order", async () => {
    const user = userEvent.setup();
    render(
      <InsetForm aria-label="Pack">
        <InsetFormRow label="Name" />
        <InsetFormSelectRow label="Frame rate" options={fps} />
        <InsetFormTextAreaRow label="Description" />
      </InsetForm>,
    );
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("combobox", { name: "Frame rate" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Description" })).toHaveFocus();
  });

  test("clicking the row label focuses its control", async () => {
    const user = userEvent.setup();
    render(
      <InsetForm aria-label="Pack">
        <InsetFormRow label="Name" />
      </InsetForm>,
    );
    await user.click(screen.getByText("Name"));
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveFocus();
  });

  test("controlled and uncontrolled rows", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const Controlled = () => {
      const [name, setName] = useState("Foggy");
      return (
        <InsetForm aria-label="Pack">
          <InsetFormRow label="Name" value={name} onValueChange={setName} />
          <InsetFormSelectRow label="Frame rate" options={fps} defaultValue="30" onValueChange={onSelect} />
        </InsetForm>
      );
    };
    render(<Controlled />);
    const name = screen.getByRole("textbox", { name: "Name" });
    await user.type(name, " Stickers");
    expect(name).toHaveValue("Foggy Stickers");

    const select = screen.getByRole("combobox", { name: "Frame rate" });
    expect(select).toHaveValue("30");
    await user.selectOptions(select, "60");
    expect(select).toHaveValue("60");
    expect(onSelect).toHaveBeenCalledWith("60");
  });

  test("error rows expose aria-invalid and the message", () => {
    render(
      <InsetForm aria-label="Pack">
        <InsetFormRow label="Name" error="Name is required" />
        <InsetFormSelectRow label="Frame rate" options={fps} placeholder="Choose…" error="Pick a frame rate" />
        <InsetFormTextAreaRow label="Description" defaultValue="Too long text" maxCount={5} error="Too long" />
      </InsetForm>,
    );
    const name = screen.getByRole("textbox", { name: "Name" });
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Name is required");
    expect(rowOf(name)).toHaveAttribute("data-invalid");

    const select = screen.getByRole("combobox", { name: "Frame rate" });
    expect(select).toHaveAccessibleDescription("Pick a frame rate");

    const description = screen.getByRole("textbox", { name: "Description" });
    expect(description).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("13/5")).toHaveAttribute("data-over");
  });

  test("group disabled disables every row; a row can opt out", () => {
    render(
      <InsetForm aria-label="Pack" disabled>
        <InsetFormRow label="Name" defaultValue="Foggy Stickers" />
        <InsetFormSelectRow label="Frame rate" options={fps} />
        <InsetFormTextAreaRow label="Description" />
        <InsetFormRow label="Notes" disabled={false} />
      </InsetForm>,
    );
    expect(screen.getByRole("textbox", { name: "Name" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Frame rate" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Description" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Notes" })).toBeEnabled();
    expect(rowOf(screen.getByRole("textbox", { name: "Name" }))).toHaveAttribute("data-disabled");
  });

  test("forwards refs and native props", () => {
    const inputRef = React.createRef<HTMLInputElement>();
    const groupRef = React.createRef<HTMLDivElement>();
    render(
      <InsetForm ref={groupRef} aria-label="Pack" className="custom">
        <InsetFormRow ref={inputRef} label="Name" name="name" required />
      </InsetForm>,
    );
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(inputRef.current).toBe(input);
    expect(input).toBeRequired();
    expect(groupRef.current).toHaveClass("custom");
  });
});

describe("InsetFormSearch", () => {
  test("is the compact search capsule with clear", async () => {
    const user = userEvent.setup();
    render(<InsetFormSearch label="Search stickers" shortcut="⌘K" />);
    const input = screen.getByRole("searchbox", { name: "Search stickers" });
    expect(input.closest("[data-kind]")).toHaveAttribute("data-size", "sm");
    await user.type(input, "chil");
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(input).toHaveValue("");
  });
});
