import React, { useState } from "react";
import { render, screen, within, act, fireEvent } from "@testing-library/react";
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
import ConfigProvider from "../ConfigProvider";

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

describe("Menu · iOS", () => {
  function renderIOS(spies: Spies = {}, props: Partial<MenuProps> = {}) {
    return renderMenu(spies, { platform: "ios", ...props });
  }
  const lensOf = (menu: HTMLElement) => menu.querySelector<HTMLElement>("[data-menu-press-lens]");

  test("platform=\"ios\" renders the iOS anatomy: check column keeps the icon, chevron back row, press lens", async () => {
    const { user, trigger } = renderIOS();
    await user.click(trigger);
    const menu = screen.getByRole("menu", { name: "More" });
    expect(menu).toHaveAttribute("data-platform", "ios");
    expect(menu).toHaveAttribute("data-variant", "pulldown");
    expect(lensOf(menu)).toBeInTheDocument();
    expect(lensOf(menu)).not.toHaveAttribute("data-visible");

    // Selected radio: check in the leading column, the calendar icon stays (web replaces it).
    const name = screen.getByRole("menuitemradio", { name: "Name" });
    expect(name.querySelector(".lucide-check")).toBeInTheDocument();
    expect(name.querySelector(".lucide-calendar")).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "Date added" }).querySelector(".lucide-check")).not.toBeInTheDocument();

    // Back row uses ChevronLeft on iOS.
    await user.click(screen.getByRole("menuitem", { name: "Share" }));
    const back = screen.getByRole("menuitem", { name: "Share, back" });
    expect(back.querySelector(".lucide-chevron-left")).toBeInTheDocument();
    expect(back.querySelector(".lucide-arrow-left")).not.toBeInTheDocument();
  });

  test("web keeps the M/A2 anatomy: no press lens, the check replaces the icon, ArrowLeft back", async () => {
    const { user, trigger } = renderMenu({}, { platform: "web" });
    await user.click(trigger);
    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("data-platform", "web");
    expect(menu).not.toHaveAttribute("data-variant");
    expect(lensOf(menu)).toBeNull();
    const name = screen.getByRole("menuitemradio", { name: "Name" });
    expect(name.querySelector(".lucide-check")).toBeInTheDocument();
    expect(name.querySelector(".lucide-calendar")).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Share" }));
    expect(screen.getByRole("menuitem", { name: "Share, back" }).querySelector(".lucide-arrow-left")).toBeInTheDocument();
  });

  test("ConfigProvider platform=\"ios\" selects the iOS implementation (Menu and MenuPanel)", async () => {
    const user = userEvent.setup();
    render(
      <ConfigProvider platform="ios">
        <Menu trigger={<button type="button">More</button>}>
          <MenuItem>Rename</MenuItem>
        </Menu>
        <MenuPanel aria-label="Inline">
          <MenuItem>Copy</MenuItem>
        </MenuPanel>
      </ConfigProvider>,
    );
    expect(screen.getByRole("menu", { name: "Inline" })).toHaveAttribute("data-platform", "ios");
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("menu", { name: "More" })).toHaveAttribute("data-platform", "ios");
  });

  test("keyboard (iPad) still works: roving focus, quick row, submenu in place, Esc", async () => {
    const { user, trigger } = renderIOS();
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{ArrowDown}{ArrowRight}");
    expect(screen.getByRole("menuitem", { name: "Telegram" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("menuitem", { name: "Share" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test("a tap selects exactly once (pointer commit + swallowed native click)", async () => {
    const onDelete = vi.fn();
    const onRename = vi.fn();
    const { user, trigger } = renderIOS({ onDelete, onRename });
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Rename" }));
    expect(onRename).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  test("press, slide and release: the lens follows the finger and release commits the item under it", async () => {
    const onSort = vi.fn();
    const { user, trigger } = renderIOS({ onSort });
    await user.click(trigger);
    const menu = screen.getByRole("menu");
    const lens = lensOf(menu)!;
    const name = screen.getByRole("menuitemradio", { name: "Name" });
    const date = screen.getByRole("menuitemradio", { name: "Date added" });

    await user.pointer({ keys: "[TouchA>]", target: name });
    expect(lens).toHaveAttribute("data-visible");
    expect(lens).toHaveAttribute("data-shape", "row");
    await user.pointer({ pointerName: "TouchA", target: date });
    expect(lens).toHaveAttribute("data-visible");
    await user.pointer({ keys: "[/TouchA]", target: date });

    expect(onSort).toHaveBeenCalledTimes(1);
    expect(onSort).toHaveBeenCalledWith("date");
    expect(date).toHaveAttribute("aria-checked", "true");
    expect(lens).not.toHaveAttribute("data-visible");
  });

  test("the lens takes the medium-row cell shape and skips disabled items", async () => {
    const { user, trigger } = renderIOS({ duplicateDisabled: true });
    await user.click(trigger);
    const lens = lensOf(screen.getByRole("menu"))!;
    await user.pointer({ keys: "[TouchA>]", target: screen.getByRole("menuitem", { name: "Rename" }) });
    expect(lens).toHaveAttribute("data-shape", "cell");
    await user.pointer({ pointerName: "TouchA", target: screen.getByRole("menuitem", { name: "Duplicate" }) });
    expect(lens).not.toHaveAttribute("data-visible");
    await user.pointer({ keys: "[/TouchA]", target: screen.getByRole("menuitem", { name: "Duplicate" }) });
    // Released on a disabled item: nothing is committed, the menu stays.
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  test("releasing on a submenu row opens it in place", async () => {
    const { user, trigger } = renderIOS();
    await user.click(trigger);
    const share = screen.getByRole("menuitem", { name: "Share" });
    await user.pointer({ keys: "[TouchA>]", target: screen.getByRole("menuitem", { name: "Rename" }) });
    await user.pointer({ pointerName: "TouchA", target: share });
    await user.pointer({ keys: "[/TouchA]", target: share });
    expect(screen.getByRole("menu", { name: "Share" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Telegram" })).toBeInTheDocument();
  });

  test("variant=\"context\": opens on context menu / long-press / arrow keys; a tap or Enter is the preview's own action", async () => {
    const onPreview = vi.fn();
    const user = userEvent.setup();
    render(
      <Menu
        platform="ios"
        variant="context"
        trigger={
          <button type="button" onClick={onPreview}>
            Mr. Chilly
          </button>
        }
      >
        <MenuItem>Rename</MenuItem>
      </Menu>,
    );
    const trigger = screen.getByRole("button", { name: "Mr. Chilly" });

    await user.click(trigger);
    expect(onPreview).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.pointer({ keys: "[MouseRight]", target: trigger });
    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("data-variant", "context");
    expect(trigger).toHaveAttribute("data-state", "open");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-state", "closed");

    await user.keyboard("{Enter}");
    expect(onPreview).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus();
    await user.keyboard("{Escape}");

    vi.useFakeTimers();
    try {
      fireEvent.pointerDown(trigger, { pointerId: 7, pointerType: "touch", clientX: 10, clientY: 10 });
      act(() => {
        vi.advanceTimersByTime(520);
      });
      expect(screen.getByRole("menu")).toBeInTheDocument();
      fireEvent.pointerUp(trigger, { pointerId: 7, pointerType: "touch" });
      // The click ending the long-press neither toggles the menu nor runs the preview's own action.
      fireEvent.click(trigger, { detail: 1 });
      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(onPreview).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  test("a long-press that moves is not a long-press", () => {
    vi.useFakeTimers();
    try {
      render(
        <Menu platform="ios" variant="context" trigger={<button type="button">Sticker</button>}>
          <MenuItem>Rename</MenuItem>
        </Menu>,
      );
      const trigger = screen.getByRole("button", { name: "Sticker" });
      fireEvent.pointerDown(trigger, { pointerId: 3, pointerType: "touch", clientX: 10, clientY: 10 });
      fireEvent.pointerMove(trigger, { pointerId: 3, pointerType: "touch", clientX: 10, clientY: 40 });
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  test("variant is ignored on web: a tap opens, no data-variant", async () => {
    const user = userEvent.setup();
    render(
      <Menu platform="web" variant="context" trigger={<button type="button">More</button>}>
        <MenuItem>Rename</MenuItem>
      </Menu>,
    );
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("menu")).not.toHaveAttribute("data-variant");
  });
});

describe("computeMenuPosition · iOS", () => {
  const base = { panelWidth: 260, panelHeight: 400, viewportWidth: 1000, viewportHeight: 800 };

  test("cover: the pull-down covers its trigger (top edges aligned), flips with bottom edges aligned", () => {
    const anchor = { top: 16, bottom: 60, left: 460, right: 504 };
    expect(computeMenuPosition({ ...base, align: "end", cover: true, anchor })).toMatchObject({
      placement: "bottom",
      top: 16,
      left: 244,
      maxHeight: 800 - 16 - 8,
    });
    const low = computeMenuPosition({ ...base, align: "end", cover: true, anchor: { top: 700, bottom: 744, left: 460, right: 504 } });
    expect(low).toMatchObject({ placement: "top", bottom: 800 - 744, maxHeight: 744 - 8 });
  });

  test("center: the context menu centres under its preview with a 12px gap", () => {
    const pos = computeMenuPosition({
      ...base,
      panelWidth: 290,
      align: "center",
      offset: 12,
      anchor: { top: 24, bottom: 174, left: 115, right: 405 },
    });
    expect(pos).toMatchObject({ placement: "bottom", top: 186, left: 115 });
  });
});
