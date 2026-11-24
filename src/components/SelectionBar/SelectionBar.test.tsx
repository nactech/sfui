import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SelectionBar, { useSelectionShortcuts } from "./index";
import Button from "../Button";

describe("SelectionBar", () => {
  test("region with tri-state select-all, live count, actions and Clear", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const onDelete = vi.fn();
    render(
      <SelectionBar
        count={2}
        total={24}
        onClear={onClear}
        keyboardShortcuts={false}
        actions={
          <Button size="s" variant="danger" onClick={onDelete}>
            Delete
          </Button>
        }
      />,
    );
    expect(screen.getByRole("region", { name: "Selection" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Select all" })).toBePartiallyChecked();
    expect(screen.getByText("2 selected")).toHaveAttribute("aria-live", "polite");

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  test("checkbox state follows count/total (none / some / all) and allSelected override", () => {
    const { rerender } = render(<SelectionBar count={0} total={24} />);
    const box = screen.getByRole("checkbox");
    expect(box).not.toBeChecked();
    expect(box).not.toBePartiallyChecked();
    rerender(<SelectionBar count={5} total={24} />);
    expect(box).toBePartiallyChecked();
    rerender(<SelectionBar count={24} total={24} />);
    expect(box).toBeChecked();
    rerender(<SelectionBar count={5} allSelected />);
    expect(box).toBeChecked();
  });

  test("activating mixed selects all; activating checked deselects", async () => {
    const user = userEvent.setup();
    const onSelectAllChange = vi.fn();
    const { rerender } = render(<SelectionBar count={2} total={4} onSelectAllChange={onSelectAllChange} />);
    await user.click(screen.getByRole("checkbox"));
    expect(onSelectAllChange).toHaveBeenLastCalledWith(true);
    rerender(<SelectionBar count={4} total={4} onSelectAllChange={onSelectAllChange} />);
    await user.click(screen.getByRole("checkbox"));
    expect(onSelectAllChange).toHaveBeenLastCalledWith(false);
  });

  test("⌘/Ctrl+A selects all and Esc clears; ignored inside text inputs", async () => {
    const user = userEvent.setup();
    const onSelectAllChange = vi.fn();
    const onClear = vi.fn();
    render(
      <>
        <input aria-label="Search" />
        <SelectionBar count={2} total={4} onSelectAllChange={onSelectAllChange} onClear={onClear} />
      </>,
    );

    await user.keyboard("{Control>}a{/Control}");
    expect(onSelectAllChange).toHaveBeenLastCalledWith(true);
    await user.keyboard("{Meta>}a{/Meta}");
    expect(onSelectAllChange).toHaveBeenCalledTimes(2);
    await user.keyboard("{Escape}");
    expect(onClear).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("textbox", { name: "Search" }));
    await user.keyboard("{Control>}a{/Control}{Escape}");
    expect(onSelectAllChange).toHaveBeenCalledTimes(2);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  test("keyboard hint shown by default and wired to aria-keyshortcuts; hidden when shortcuts are off", () => {
    const { rerender } = render(<SelectionBar count={1} total={4} onSelectAllChange={() => {}} onClear={() => {}} />);
    expect(screen.getByText(/A all · Esc clear/)).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-keyshortcuts", "Meta+A Control+A");
    expect(screen.getByRole("button", { name: "Clear" })).toHaveAttribute("aria-keyshortcuts", "Escape");
    rerender(<SelectionBar count={1} total={4} keyboardShortcuts={false} />);
    expect(screen.queryByText(/A all · Esc clear/)).toBeNull();
  });

  test("step 7 banner: offers the wider scope once the page is fully selected", async () => {
    const user = userEvent.setup();
    const onSelectEverything = vi.fn();
    const { rerender } = render(
      <SelectionBar
        count={2}
        total={24}
        itemNoun="stickers"
        scopeTotal={120}
        scopeLabel="Library"
        onSelectEverything={onSelectEverything}
        keyboardShortcuts={false}
      />,
    );
    expect(screen.queryByRole("status")).toBeNull();

    rerender(
      <SelectionBar
        count={24}
        total={24}
        itemNoun="stickers"
        scopeTotal={120}
        scopeLabel="Library"
        onSelectEverything={onSelectEverything}
        keyboardShortcuts={false}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("All 24 stickers on this page are selected.");
    await user.click(screen.getByRole("button", { name: "Select all 120 in Library" }));
    expect(onSelectEverything).toHaveBeenCalledTimes(1);
  });

  test("everythingSelected confirms the scope and offers Clear selection", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <SelectionBar
        count={120}
        total={24}
        everythingSelected
        itemNoun="stickers"
        scopeTotal={120}
        scopeLabel="Library"
        onClear={onClear}
        keyboardShortcuts={false}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("All 120 stickers in Library are selected.");
    expect(screen.getByRole("checkbox")).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

describe("useSelectionShortcuts", () => {
  const Harness = ({ enabled = true }: { enabled?: boolean }) => {
    const [log, setLog] = useState<string[]>([]);
    useSelectionShortcuts({
      enabled,
      onSelectAll: () => setLog((l) => [...l, "all"]),
      onClear: () => setLog((l) => [...l, "clear"]),
    });
    return (
      <>
        <div contentEditable suppressContentEditableWarning aria-label="Editor" role="textbox" />
        <input type="checkbox" aria-label="Row" />
        <output>{log.join(",")}</output>
      </>
    );
  };

  test("works with focus on a row checkbox but not in contenteditable", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("checkbox", { name: "Row" }));
    await user.keyboard("{Control>}a{/Control}{Escape}");
    expect(screen.getByRole("status")).toHaveTextContent("all,clear");

    await user.click(screen.getByRole("textbox", { name: "Editor" }));
    await user.keyboard("{Control>}a{/Control}{Escape}");
    expect(screen.getByRole("status")).toHaveTextContent("all,clear");
  });

  test("disabled → no listeners", async () => {
    const user = userEvent.setup();
    render(<Harness enabled={false} />);
    await user.keyboard("{Control>}a{/Control}");
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  test("Esc already handled elsewhere (defaultPrevented) is ignored", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const Consumer = () => {
      useSelectionShortcuts({ onClear });
      return (
        <button type="button" onKeyDown={(e) => e.key === "Escape" && e.preventDefault()}>
          Menu
        </button>
      );
    };
    render(<Consumer />);
    screen.getByRole("button").focus();
    await user.keyboard("{Escape}");
    expect(onClear).not.toHaveBeenCalled();
  });
});
