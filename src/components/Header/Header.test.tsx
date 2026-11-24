import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Share2, Trash2 } from "lucide-react";

import Header, { HeaderAction, PageHeader } from "./index";
import { MenuItem } from "../Menu";
import ConfigProvider from "../ConfigProvider";

type IOCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

describe("Header", () => {
  test("expanded: back button, large heading, subtitle, actions capsule", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    const onShare = vi.fn();
    render(
      <Header
        title="Foggy Stickers"
        subtitle="24 stickers · updated today"
        onBack={onBack}
        actions={<HeaderAction aria-label="Share" icon={<Share2 />} onClick={onShare} />}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Foggy Stickers" })).toBeInTheDocument();
    expect(screen.getByText("24 stickers · updated today")).toBeInTheDocument();
    // The docked copy of the title is decorative while the large title exists.
    expect(screen.getAllByRole("heading")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Share" }));
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  test("backHref renders a link named by backLabel", () => {
    render(<Header title="Foggy Stickers" backHref="/library" backLabel="Back to Library" />);
    expect(screen.getByRole("link", { name: "Back to Library" })).toHaveAttribute("href", "/library");
  });

  test("collapsed: only the bar, the docked title is the heading", () => {
    const { container } = render(<Header title="Foggy Stickers" collapsed onBack={() => {}} />);
    const root = container.querySelector("header")!;
    expect(root).toHaveAttribute("data-collapsed");
    const heading = screen.getByRole("heading", { level: 1, name: "Foggy Stickers" });
    expect(heading.closest("[data-docked]")).not.toBeNull();
  });

  test("titleAs changes the heading level", () => {
    render(<Header title="Settings" titleAs="h2" />);
    expect(screen.getByRole("heading", { level: 2, name: "Settings" })).toBeInTheDocument();
  });

  test("overflowMenu opens a Menu from the ⋮ trigger", async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    render(
      <Header
        title="Foggy Stickers"
        overflowMenu={<MenuItem onSelect={onRename}>Rename</MenuItem>}
      />,
    );
    const trigger = screen.getByRole("button", { name: "More options" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Rename" }));
    expect(onRename).toHaveBeenCalledTimes(1);
  });

  test("collapsed=auto docks when the large title scrolls under the bar", () => {
    let callback: IOCallback = () => {};
    const observe = vi.fn();
    const original = window.IntersectionObserver;
    window.IntersectionObserver = class {
      constructor(cb: IOCallback) {
        callback = cb;
      }
      observe = observe;
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;

    const onCollapsedChange = vi.fn();
    const { container } = render(
      <Header title="Foggy Stickers" collapsed="auto" sticky onBack={() => {}} onCollapsedChange={onCollapsedChange} />,
    );
    const root = container.querySelector("header")!;
    expect(observe).toHaveBeenCalledWith(screen.getByRole("heading", { level: 1 }));
    expect(root).not.toHaveAttribute("data-collapsed");
    expect(root).toHaveAttribute("data-sticky");

    const rootBounds = { top: 0 } as DOMRectReadOnly;
    act(() => callback([{ isIntersecting: false, boundingClientRect: { top: -40 } as DOMRectReadOnly, rootBounds }]));
    expect(root).toHaveAttribute("data-collapsed");
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);

    act(() => callback([{ isIntersecting: true, boundingClientRect: { top: 10 } as DOMRectReadOnly, rootBounds }]));
    expect(root).not.toHaveAttribute("data-collapsed");
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);

    window.IntersectionObserver = original;
  });

  describe("selection mode (row 4)", () => {
    const renderSelection = (props: Partial<React.ComponentProps<typeof Header>> = {}) =>
      render(
        <Header
          title="Foggy Stickers"
          onBack={() => {}}
          selectionCount={3}
          selectionActions={
            <>
              <HeaderAction aria-label="Share" icon={<Share2 />} />
              <HeaderAction aria-label="Delete" icon={<Trash2 />} />
            </>
          }
          selectionOverflowMenu={<MenuItem>Move to…</MenuItem>}
          {...props}
        />,
      );

    test("× + count + actions replace back + title", async () => {
      const user = userEvent.setup();
      const onCancelSelection = vi.fn();
      const { container } = renderSelection({ onCancelSelection });
      expect(container.querySelector("header")).toHaveAttribute("data-mode", "selection");
      expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
      expect(screen.getByText("3 selected")).toHaveAttribute("aria-live", "polite");
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Cancel selection" }));
      expect(onCancelSelection).toHaveBeenCalledTimes(1);
    });

    test("⋮ first item is Select all, then Deselect all once everything is selected", async () => {
      const user = userEvent.setup();
      const onSelectAll = vi.fn();
      const onDeselectAll = vi.fn();
      const { rerender } = renderSelection({ onSelectAll, onDeselectAll });

      await user.click(screen.getByRole("button", { name: "More options" }));
      let items = within(screen.getByRole("menu")).getAllByRole("menuitem");
      expect(items[0]).toHaveAccessibleName("Select all");
      expect(items[1]).toHaveAccessibleName("Move to…");
      await user.click(items[0]!);
      expect(onSelectAll).toHaveBeenCalledTimes(1);

      rerender(
        <Header
          title="Foggy Stickers"
          selectionCount={24}
          allSelected
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
        />,
      );
      await user.click(screen.getByRole("button", { name: "More options" }));
      items = within(screen.getByRole("menu")).getAllByRole("menuitem");
      expect(items[0]).toHaveAccessibleName("Deselect all");
      await user.click(items[0]!);
      expect(onDeselectAll).toHaveBeenCalledTimes(1);
    });
  });

  test("HeaderAction disabled is not clickable", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<HeaderAction aria-label="Share" icon={<Share2 />} disabled onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: "Share" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Header · iOS (H/A1, H/A3)", () => {
  test("ConfigProvider platform=ios: glass back circle, actions capsule, large title, no docked pill", () => {
    const { container } = render(
      <ConfigProvider platform="ios">
        <Header
          title="Foggy Stickers"
          subtitle="24 stickers · updated today"
          onBack={() => {}}
          actions={<HeaderAction aria-label="Share" icon={<Share2 />} />}
          overflowMenu={<MenuItem>Rename</MenuItem>}
        />
      </ConfigProvider>,
    );
    const root = container.querySelector("header")!;
    expect(root).toHaveAttribute("data-platform", "ios");
    expect(screen.getByRole("heading", { level: 1, name: "Foggy Stickers" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    // ChevronLeft is the iOS back glyph.
    const back = screen.getByRole("button", { name: "Back" });
    expect(back.querySelector("svg")).toHaveClass("lucide-chevron-left");
    // Expanded with collapsed={false}: no title pill at all.
    expect(container.querySelector("[data-docked]")).toBeNull();
    // ••• is horizontal on iOS.
    expect(screen.getByRole("button", { name: "More options" }).querySelector("svg")).toHaveClass("lucide-ellipsis");
  });

  test("platform prop wins over ConfigProvider; web keeps ArrowLeft", () => {
    const { container } = render(
      <ConfigProvider platform="ios">
        <Header title="Foggy Stickers" onBack={() => {}} platform="web" />
      </ConfigProvider>,
    );
    expect(container.querySelector("header")).toHaveAttribute("data-platform", "web");
    expect(screen.getByRole("button", { name: "Back" }).querySelector("svg")).toHaveClass("lucide-arrow-left");
  });

  test("collapsed: the centred title pill is the heading", () => {
    const { container } = render(<Header title="Foggy Stickers" collapsed onBack={() => {}} platform="ios" />);
    expect(container.querySelector("header")).toHaveAttribute("data-collapsed");
    const heading = screen.getByRole("heading", { level: 1, name: "Foggy Stickers" });
    expect(heading.closest("[data-docked]")).not.toBeNull();
  });

  test("collapsed=auto: the pill mounts hidden and docks when the large title scrolls away", () => {
    let callback: IOCallback = () => {};
    const original = window.IntersectionObserver;
    window.IntersectionObserver = class {
      constructor(cb: IOCallback) {
        callback = cb;
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;

    const onCollapsedChange = vi.fn();
    const { container } = render(
      <Header title="Foggy Stickers" collapsed="auto" onBack={() => {}} onCollapsedChange={onCollapsedChange} platform="ios" />,
    );
    // The pill's copy of the title is decorative while the large title exists.
    const pill = screen.getByText("Foggy Stickers", { selector: "span" }).closest("[aria-hidden='true']")!;
    expect(pill).not.toBeNull();
    expect(pill).not.toHaveAttribute("data-docked");

    act(() =>
      callback([
        { isIntersecting: false, boundingClientRect: { top: -40 } as DOMRectReadOnly, rootBounds: { top: 0 } as DOMRectReadOnly },
      ]),
    );
    expect(pill).toHaveAttribute("data-docked");
    expect(container.querySelector("header")).toHaveAttribute("data-collapsed");
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
    window.IntersectionObserver = original;
  });

  test("Browse: onStartSelection renders a Select text button (ignored on web)", async () => {
    const user = userEvent.setup();
    const onStartSelection = vi.fn();
    const { rerender } = render(
      <Header title="Foggy Stickers" collapsed onBack={() => {}} onStartSelection={onStartSelection} platform="ios" />,
    );
    await user.click(screen.getByRole("button", { name: "Select" }));
    expect(onStartSelection).toHaveBeenCalledTimes(1);

    rerender(<Header title="Foggy Stickers" collapsed onBack={() => {}} onStartSelection={onStartSelection} platform="web" />);
    expect(screen.queryByRole("button", { name: "Select" })).toBeNull();
  });

  test("selection: Cancel + count + Select All ↔ Deselect All text buttons; actions stay out of the header", async () => {
    const user = userEvent.setup();
    const onCancelSelection = vi.fn();
    const onSelectAll = vi.fn();
    const onDeselectAll = vi.fn();
    const props = {
      title: "Foggy Stickers",
      collapsed: true,
      onCancelSelection,
      onSelectAll,
      onDeselectAll,
      selectionActions: <HeaderAction aria-label="Delete" icon={<Trash2 />} />,
      selectionOverflowMenu: <MenuItem>Move to…</MenuItem>,
      platform: "ios" as const,
    };
    const { container, rerender } = render(<Header {...props} selectionCount={0} />);
    expect(container.querySelector("header")).toHaveAttribute("data-mode", "selection");
    expect(screen.getByText("Select Items")).toHaveAttribute("aria-live", "polite");
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
    expect(screen.queryByRole("button", { name: "More options" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Select All" }));
    expect(onSelectAll).toHaveBeenCalledTimes(1);

    rerender(<Header {...props} selectionCount={2} />);
    expect(screen.getByText("2 Selected")).toBeInTheDocument();

    rerender(<Header {...props} selectionCount={24} allSelected />);
    await user.click(screen.getByRole("button", { name: "Deselect All" }));
    expect(onDeselectAll).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancelSelection).toHaveBeenCalledTimes(1);
  });

  test("selection labels stay customisable on iOS", () => {
    render(
      <Header
        title="Foggy Stickers"
        selectionCount={3}
        selectionLabel={(n) => `${n} von 24`}
        cancelSelectionLabel="Abbrechen"
        onSelectAll={() => {}}
        selectAllLabel="Alle"
        platform="ios"
      />,
    );
    expect(screen.getByText("3 von 24")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abbrechen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alle" })).toBeInTheDocument();
  });

  test("overflow ••• still opens the Menu on iOS", async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    render(<Header title="Foggy Stickers" overflowMenu={<MenuItem onSelect={onRename}>Rename</MenuItem>} platform="ios" />);
    const trigger = screen.getByRole("button", { name: "More options" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    // Keyboard path (iPad keyboards); pointer behaviour of the iOS menu is covered by Menu's own tests.
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onRename).toHaveBeenCalledTimes(1);
  });
});

describe("PageHeader", () => {
  test("breadcrumbs nav, current page, heading, description and actions", () => {
    render(
      <PageHeader
        breadcrumbs={[{ label: "Library", href: "/library" }, { label: "Foggy Stickers" }]}
        title="Foggy Stickers"
        description="24 stickers · updated today"
        actions={<button type="button">Export</button>}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getByRole("link", { name: "Library" })).toHaveAttribute("href", "/library");
    expect(within(nav).getByText("Foggy Stickers")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { level: 1, name: "Foggy Stickers" })).toBeInTheDocument();
    expect(screen.getByText("24 stickers · updated today")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
  });

  test("crumb onClick supports client-side routing", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    render(<PageHeader breadcrumbs={[{ label: "Library", href: "/library", onClick }, { label: "Here" }]} title="Here" />);
    await user.click(screen.getByRole("link", { name: "Library" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("no breadcrumbs → no nav", () => {
    render(<PageHeader title="Library" />);
    expect(screen.queryByRole("navigation")).toBeNull();
  });
});
