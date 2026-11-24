import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Copy, FolderInput, Share, Trash2 } from "lucide-react";

import SelectionToolbar from "./index";
import type { SelectionToolbarAction } from "./index";
import ConfigProvider from "../ConfigProvider";
import { MenuItem } from "../Menu";

const makeActions = () => {
  const handlers = { share: vi.fn(), move: vi.fn(), duplicate: vi.fn(), delete: vi.fn() };
  const actions: SelectionToolbarAction[] = [
    { label: "Share", icon: <Share />, onSelect: handlers.share },
    { label: "Move", icon: <FolderInput />, onSelect: handlers.move },
    { label: "Duplicate", icon: <Copy />, onSelect: handlers.duplicate },
    { label: "Delete", icon: <Trash2 />, onSelect: handlers.delete, destructive: true },
  ];
  return { actions, handlers };
};

describe("SelectionToolbar", () => {
  test("toolbar landmark with labelled actions that fire onSelect", async () => {
    const user = userEvent.setup();
    const { actions, handlers } = makeActions();
    render(<SelectionToolbar actions={actions} count={2} platform="ios" />);

    const toolbar = screen.getByRole("toolbar", { name: "Selection actions" });
    expect(toolbar).toHaveAttribute("data-platform", "ios");
    expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");

    await user.click(screen.getByRole("button", { name: "Share" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(handlers.share).toHaveBeenCalledTimes(1);
    expect(handlers.delete).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute("data-tone", "danger");
  });

  test("count 0 disables every action and •••", async () => {
    const user = userEvent.setup();
    const { actions, handlers } = makeActions();
    const { rerender } = render(
      <SelectionToolbar actions={actions} count={0} moreMenu={<MenuItem>Export</MenuItem>} platform="ios" />,
    );
    expect(screen.getByRole("toolbar")).toHaveAttribute("aria-disabled", "true");
    for (const name of ["Share", "Move", "Duplicate", "Delete", "More actions"]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
    await user.click(screen.getByRole("button", { name: "Share" }));
    expect(handlers.share).not.toHaveBeenCalled();

    rerender(<SelectionToolbar actions={actions} count={1} moreMenu={<MenuItem>Export</MenuItem>} platform="ios" />);
    expect(screen.getByRole("toolbar")).not.toHaveAttribute("aria-disabled");
    expect(screen.getByRole("button", { name: "Share" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "More actions" })).toBeEnabled();
  });

  test("per-action disabled and the disabled prop", () => {
    const { actions } = makeActions();
    const { rerender } = render(
      <SelectionToolbar actions={actions.map((a) => (a.label === "Move" ? { ...a, disabled: true } : a))} count={3} />,
    );
    expect(screen.getByRole("button", { name: "Move" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Share" })).toBeEnabled();

    rerender(<SelectionToolbar actions={actions} count={3} disabled />);
    expect(screen.getByRole("button", { name: "Share" })).toBeDisabled();
  });

  test("••• opens a Menu of further actions", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    const { actions } = makeActions();
    render(
      <SelectionToolbar
        actions={actions}
        count={2}
        moreMenu={<MenuItem onSelect={onExport}>Export</MenuItem>}
        moreLabel="More"
        platform="ios"
      />,
    );
    const more = screen.getByRole("button", { name: "More" });
    expect(more).toHaveAttribute("aria-haspopup", "menu");
    // Keyboard path; pointer behaviour of the (iOS) menu is covered by Menu's own tests.
    more.focus();
    await user.keyboard("{Enter}");
    expect(more).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Export" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  test("roving tabindex: one Tab stop, arrows / Home / End skip disabled controls", async () => {
    const user = userEvent.setup();
    const { actions, handlers } = makeActions();
    render(
      <SelectionToolbar
        actions={actions.map((a) => (a.label === "Move" ? { ...a, disabled: true } : a))}
        count={2}
        moreMenu={<MenuItem>Export</MenuItem>}
      />,
    );
    const share = screen.getByRole("button", { name: "Share" });
    const duplicate = screen.getByRole("button", { name: "Duplicate" });
    const more = screen.getByRole("button", { name: "More actions" });

    await user.tab();
    expect(share).toHaveFocus();
    expect(duplicate).toHaveAttribute("tabindex", "-1");

    await user.keyboard("{ArrowRight}");
    expect(duplicate).toHaveFocus();
    expect(duplicate).toHaveAttribute("tabindex", "0");
    expect(share).toHaveAttribute("tabindex", "-1");

    await user.keyboard("{End}");
    expect(more).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(share).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(more).toHaveFocus();
    await user.keyboard("{Home}");
    expect(share).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(handlers.share).toHaveBeenCalledTimes(1);

    // Tab leaves the toolbar instead of walking every action.
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  test("platform comes from ConfigProvider; non-iOS keeps the same API", () => {
    const { actions } = makeActions();
    const { rerender } = render(
      <ConfigProvider platform="ios">
        <SelectionToolbar actions={actions} count={1} />
      </ConfigProvider>,
    );
    expect(screen.getByRole("toolbar")).toHaveAttribute("data-platform", "ios");

    rerender(
      <ConfigProvider platform="android">
        <SelectionToolbar actions={actions} count={1} pinned={false} />
      </ConfigProvider>,
    );
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveAttribute("data-platform", "android");
    expect(toolbar).toHaveAttribute("data-pinned", "false");
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });
});
