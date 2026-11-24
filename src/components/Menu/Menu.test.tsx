import React, { useState } from "react";
import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar, Copy, FolderInput, HardDrive, Link, Pencil, Send, Share, Trash2 } from "lucide-react";

import Menu, {
  MenuCheckboxItem,
  MenuItem,
  MenuPanel,
  MenuQuickAction,
  MenuQuickActions,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  computeMenuPosition,
} from ".";
import type { MenuProps } from ".";

interface Spies {
  onRename?: () => void;
  onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onTelegram?: () => void;
  onSort?: (value: string) => void;
  duplicateDisabled?: boolean;
}

function Content({ onRename, onDelete, onTelegram, onSort, duplicateDisabled }: Spies) {
  return (
    <>
      <MenuQuickActions aria-label="Quick actions">
        <MenuQuickAction icon={<Pencil />} onSelect={onRename}>
          Rename
        </MenuQuickAction>
        <MenuQuickAction icon={<Copy />} disabled={duplicateDisabled}>
          Duplicate
        </MenuQuickAction>
        <MenuQuickAction icon={<FolderInput />}>Move to…</MenuQuickAction>
      </MenuQuickActions>
      <MenuSeparator />
      <MenuSub label="Share" icon={<Share />}>
        <MenuItem icon={<Send />} onSelect={onTelegram}>
          Telegram
        </MenuItem>
        <MenuItem icon={<Link />}>Copy link</MenuItem>
      </MenuSub>
      <MenuSeparator />
      <MenuRadioGroup label="Sort by" defaultValue="name" onValueChange={onSort}>
        <MenuRadioItem value="name" icon={<Calendar />}>
          Name
        </MenuRadioItem>
        <MenuRadioItem value="date" icon={<Calendar />}>
          Date added
        </MenuRadioItem>
        <MenuRadioItem value="size" icon={<HardDrive />} disabled>
          Size
        </MenuRadioItem>
      </MenuRadioGroup>
      <MenuSeparator />
      <MenuItem icon={<Trash2 />} destructive onSelect={onDelete}>
        Delete
      </MenuItem>
    </>
  );
}

function renderMenu(spies: Spies = {}, props: Partial<MenuProps> = {}) {
  const user = userEvent.setup();
  render(
    <div>
      <Menu trigger={<button type="button">More</button>} {...props}>
        <Content {...spies} />
      </Menu>
      <button type="button">Outside</button>
    </div>,
  );
  return { user, trigger: screen.getByRole("button", { name: "More" }) };
}

describe("Menu", () => {
  test("wires the trigger and opens a portaled menu on click", async () => {
    const { user, trigger } = renderMenu();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(trigger);
    const menu = screen.getByRole("menu", { name: "More" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", menu.id);
    expect(menu.parentElement).toBe(document.body);
    // Pointer open focuses the panel, not an item.
    expect(menu).toHaveFocus();
  });

  test("exposes menu roles: items, radio group, separators", async () => {
    const { user, trigger } = renderMenu();
    await user.click(trigger);
    const menu = screen.getByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "Rename" })).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: "Share" })).toHaveAttribute("aria-haspopup", "menu");
    const group = within(menu).getByRole("group", { name: "Sort by" });
    expect(within(group).getByRole("menuitemradio", { name: "Name" })).toHaveAttribute("aria-checked", "true");
    expect(within(group).getByRole("menuitemradio", { name: "Date added" })).toHaveAttribute("aria-checked", "false");
    expect(within(menu).getAllByRole("separator")).toHaveLength(3);
  });

  test("ArrowDown on the trigger opens and focuses the first item; arrows rove, quick row is one stop", async () => {
    const { user, trigger } = renderMenu();
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Share" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    // Returns to the quick-row column it left from.
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus();
    await user.keyboard("{ArrowUp}{ArrowUp}");
    // Size is disabled and skipped.
    expect(screen.getByRole("menuitemradio", { name: "Date added" })).toHaveFocus();
  });

  test("Enter on the trigger opens with the first item focused", async () => {
    const { user, trigger } = renderMenu();
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus();
  });

  test("typeahead jumps to the matching label", async () => {
    const { user, trigger } = renderMenu();
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("d");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("d");
    expect(screen.getByRole("menuitemradio", { name: "Date added" })).toHaveFocus();
  });

  test("selecting an item calls onSelect, closes and returns focus to the trigger", async () => {
    const onDelete = vi.fn();
    const { user, trigger } = renderMenu({ onDelete });
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test("onSelect can keep the menu open with preventDefault", async () => {
    const { user, trigger } = renderMenu({ onDelete: (event) => event.preventDefault() });
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  test("radio items select a single value and keep the menu open", async () => {
    const onSort = vi.fn();
    const { user, trigger } = renderMenu({ onSort });
    await user.click(trigger);
    await user.click(screen.getByRole("menuitemradio", { name: "Date added" }));
    expect(onSort).toHaveBeenCalledWith("date");
    expect(screen.getByRole("menuitemradio", { name: "Date added" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "Name" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  test("disabled items are aria-disabled and do nothing", async () => {
    const onSort = vi.fn();
    const { user, trigger } = renderMenu({ onSort, duplicateDisabled: true });
    await user.click(trigger);
    const duplicate = screen.getByRole("menuitem", { name: "Duplicate" });
    expect(duplicate).toHaveAttribute("aria-disabled", "true");
    await user.click(duplicate);
    await user.click(screen.getByRole("menuitemradio", { name: "Size" }));
    expect(onSort).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  test("submenu opens in place with a Back row; ← / Esc go back, Esc on root closes", async () => {
    const { user, trigger } = renderMenu();
    trigger.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Share" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    const menu = screen.getByRole("menu", { name: "Share" });
    expect(within(menu).getByRole("menuitem", { name: "Share, back" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Telegram" })).toHaveFocus();
    // Root content is replaced (hidden), not cascaded beside it.
    expect(screen.queryByRole("menuitem", { name: "Rename" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("menu")).toHaveLength(1);

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("menuitem", { name: "Share" })).toHaveFocus();
    expect(screen.queryByRole("menuitem", { name: "Telegram" })).not.toBeInTheDocument();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("menuitem", { name: "Telegram" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("menu", { name: "More" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Share" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test("pointer: Share opens the submenu, the Back row returns, a sub item selects and closes", async () => {
    const onTelegram = vi.fn();
    const { user, trigger } = renderMenu({ onTelegram });
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Share" }));
    await user.click(screen.getByRole("menuitem", { name: "Share, back" }));
    expect(screen.getByRole("menuitem", { name: "Rename" })).toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Share" }));
    await user.click(screen.getByRole("menuitem", { name: "Telegram" }));
    expect(onTelegram).toHaveBeenCalled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  test("closes on outside pointer down and on Tab", async () => {
    const { user, trigger } = renderMenu();
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(trigger);
    await user.keyboard("{Tab}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test("controlled: open follows the prop and onOpenChange reports requests", async () => {
    const onOpenChange = vi.fn();
    const { user } = renderMenu({}, { open: true, onOpenChange });
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  test("controlled wrapper closes and reopens", async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Menu open={open} onOpenChange={setOpen} trigger={<button type="button">More</button>}>
            <MenuItem>Rename</MenuItem>
          </Menu>
          <span data-testid="state">{String(open)}</span>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByTestId("state")).toHaveTextContent("true");
    await user.click(screen.getByRole("menuitem", { name: "Rename" }));
    expect(screen.getByTestId("state")).toHaveTextContent("false");
  });

  test("checkbox item toggles uncontrolled and reports changes", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(
      <MenuPanel aria-label="View">
        <MenuCheckboxItem onCheckedChange={onCheckedChange}>Show hidden</MenuCheckboxItem>
      </MenuPanel>,
    );
    const item = screen.getByRole("menuitemcheckbox", { name: "Show hidden" });
    expect(item).toHaveAttribute("aria-checked", "false");
    await user.click(item);
    expect(item).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  test("MenuPanel renders inline without a trigger", () => {
    render(
      <MenuPanel aria-label="Actions">
        <MenuItem>Rename</MenuItem>
      </MenuPanel>,
    );
    expect(screen.getByRole("menu", { name: "Actions" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveAttribute("tabindex", "-1");
  });

  test("trigger keeps its own ref and handlers", async () => {
    const ref = React.createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Menu
        trigger={
          <button type="button" ref={ref} onClick={onClick}>
            More
          </button>
        }
      >
        <MenuItem>Rename</MenuItem>
      </Menu>,
    );
    expect(ref.current).toBe(screen.getByRole("button", { name: "More" }));
    await act(async () => {
      await user.click(ref.current!);
    });
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
});

describe("computeMenuPosition", () => {
  const base = {
    panelWidth: 260,
    panelHeight: 400,
    viewportWidth: 1000,
    viewportHeight: 800,
  };

  test("opens below, end-aligned to the anchor with a 6px gap", () => {
    const pos = computeMenuPosition({ ...base, align: "end", anchor: { top: 16, bottom: 60, left: 460, right: 504 } });
    expect(pos).toMatchObject({ placement: "bottom", top: 66, left: 244 });
    expect(pos.bottom).toBeUndefined();
  });

  test("flips above when there is more room above", () => {
    const pos = computeMenuPosition({ ...base, align: "start", anchor: { top: 700, bottom: 744, left: 100, right: 144 } });
    expect(pos).toMatchObject({ placement: "top", left: 100, bottom: 800 - 700 + 6 });
  });

  test("shifts inside the viewport and follows rtl", () => {
    expect(computeMenuPosition({ ...base, align: "start", anchor: { top: 0, bottom: 44, left: 900, right: 944 } }).left).toBe(
      1000 - 8 - 260,
    );
    expect(
      computeMenuPosition({ ...base, align: "end", direction: "rtl", anchor: { top: 0, bottom: 44, left: 2, right: 46 } }).left,
    ).toBe(8);
  });
});
