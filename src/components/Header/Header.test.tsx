import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Share2, Trash2 } from "lucide-react";

import Header, { HeaderAction, PageHeader } from "./index";
import { MenuItem } from "../Menu";

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
