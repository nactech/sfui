import React, { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Library, Play, Settings2, Upload } from "lucide-react";
import { vi } from "vitest";

import ConfigProvider from "../ConfigProvider";
import TabBar, { type TabBarItem } from ".";

const items: TabBarItem[] = [
  { value: "library", label: "Library", icon: <Library /> },
  { value: "player", label: "Player", icon: <Play /> },
  { value: "export", label: "Export", icon: <Upload />, badge: 3 },
  { value: "settings", label: "Settings", icon: <Settings2 /> },
];

// ── Geometry for pointer tests (jsdom has no layout) ─────────────────────────
// Compact master: bar 340 × 72 at (100, 500); item i indicator 56 × 32 at x = 12.5 + 81·i, y = 10.
const BAR = { left: 100, top: 500, width: 340, height: 72 };
const centre = (i: number) => BAR.left + 12.5 + 81 * i + 28;
const Y = BAR.top + 36;

function mockLayout() {
  return vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const r = (x: number, y: number, w: number, h: number) =>
      ({ x, y, left: x, top: y, width: w, height: h, right: x + w, bottom: y + h, toJSON: () => ({}) }) as DOMRect;
    if (this.classList.contains("bar")) return r(BAR.left, BAR.top, BAR.width, BAR.height);
    if (this.classList.contains("indicator")) {
      const i = Number(this.closest<HTMLElement>("[data-index]")?.dataset.index ?? 0);
      return r(BAR.left + 12.5 + 81 * i, BAR.top + 10, 56, 32);
    }
    return r(0, 0, 0, 0);
  });
}

const pill = (container: HTMLElement) => container.querySelector<HTMLElement>("[data-pill]")!;
const pillCentrePx = (container: HTMLElement) => {
  const s = pill(container).style;
  const px = (v: string) => parseFloat(s.getPropertyValue(v)) * 16;
  return BAR.left + px("--_pill-x") + px("--_pill-w") / 2;
};

const down = (el: Element, x: number, y = Y) =>
  fireEvent.pointerDown(el, { pointerId: 1, isPrimary: true, button: 0, pointerType: "touch", clientX: x, clientY: y });
const move = (x: number, y = Y) => fireEvent.pointerMove(window, { pointerId: 1, clientX: x, clientY: y });
const up = (x: number, y = Y) => fireEvent.pointerUp(window, { pointerId: 1, clientX: x, clientY: y });
const frames = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe("TabBar", () => {
  describe("tabs (no href)", () => {
    test("renders a named tablist with one selected tab", () => {
      render(<TabBar items={items} aria-label="Sections" />);
      const list = screen.getByRole("tablist", { name: "Sections" });
      expect(list).toBeInTheDocument();
      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(4);
      expect(screen.getByRole("tab", { name: "Library" })).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tab", { name: "Player" })).toHaveAttribute("aria-selected", "false");
      // One shared pill, not a background per tab.
      expect(list.querySelectorAll("[data-pill]")).toHaveLength(1);
    });

    test("uncontrolled: clicking a tab selects it and reports the value", async () => {
      const onValueChange = vi.fn();
      render(<TabBar items={items} defaultValue="player" onValueChange={onValueChange} />);
      expect(screen.getByRole("tab", { name: "Player" })).toHaveAttribute("aria-selected", "true");
      await userEvent.click(screen.getByRole("tab", { name: "Settings" }));
      expect(onValueChange).toHaveBeenCalledWith("settings");
      expect(screen.getByRole("tab", { name: "Settings" })).toHaveAttribute("aria-selected", "true");
      // Re-selecting the current tab is not a change.
      await userEvent.click(screen.getByRole("tab", { name: "Settings" }));
      expect(onValueChange).toHaveBeenCalledTimes(1);
    });

    test("controlled: selection follows the value prop", async () => {
      const onValueChange = vi.fn();
      const { rerender } = render(<TabBar items={items} value="library" onValueChange={onValueChange} />);
      await userEvent.click(screen.getByRole("tab", { name: "Player" }));
      expect(onValueChange).toHaveBeenCalledWith("player");
      expect(screen.getByRole("tab", { name: "Library" })).toHaveAttribute("aria-selected", "true");
      rerender(<TabBar items={items} value="player" onValueChange={onValueChange} />);
      expect(screen.getByRole("tab", { name: "Player" })).toHaveAttribute("aria-selected", "true");
    });

    test("keyboard: arrows move focus (roving tabindex), Enter commits, Home/End, disabled is skipped", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const withDisabled = items.map((i) => (i.value === "player" ? { ...i, disabled: true } : i));
      render(<TabBar items={withDisabled} onValueChange={onValueChange} />);

      await user.tab();
      const library = screen.getByRole("tab", { name: "Library" });
      expect(library).toHaveFocus();
      expect(library).toHaveAttribute("tabindex", "0");
      expect(screen.getByRole("tab", { name: /Export/ })).toHaveAttribute("tabindex", "-1");

      await user.keyboard("{ArrowRight}");
      const exportTab = screen.getByRole("tab", { name: /Export/ });
      expect(exportTab).toHaveFocus(); // Player is disabled → skipped
      expect(exportTab).toHaveAttribute("tabindex", "0");
      expect(onValueChange).not.toHaveBeenCalled(); // pill moves on commit only
      expect(library).toHaveAttribute("aria-selected", "true");

      await user.keyboard("{Enter}");
      expect(onValueChange).toHaveBeenCalledWith("export");
      expect(exportTab).toHaveAttribute("aria-selected", "true");

      await user.keyboard("{End}");
      expect(screen.getByRole("tab", { name: "Settings" })).toHaveFocus();
      await user.keyboard("{ArrowRight}"); // wraps
      expect(library).toHaveFocus();
      await user.keyboard("{ArrowLeft}");
      expect(screen.getByRole("tab", { name: "Settings" })).toHaveFocus();
      await user.keyboard("{Home}");
      expect(library).toHaveFocus();
      await user.keyboard(" ");
      expect(onValueChange).toHaveBeenLastCalledWith("library");
    });

    test("disabled tabs cannot be selected", async () => {
      const onValueChange = vi.fn();
      render(<TabBar items={items.map((i) => (i.value === "player" ? { ...i, disabled: true } : i))} onValueChange={onValueChange} />);
      const player = screen.getByRole("tab", { name: "Player" });
      expect(player).toBeDisabled();
      await userEvent.click(player);
      expect(onValueChange).not.toHaveBeenCalled();
    });

    test("defaults to the first enabled tab", () => {
      render(<TabBar items={items.map((i) => (i.value === "library" ? { ...i, disabled: true } : i))} />);
      expect(screen.getByRole("tab", { name: "Player" })).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("links (href)", () => {
    const links = items.map((i) => ({ ...i, href: `/${i.value}` }));

    test("renders a navigation landmark with aria-current on the active link", async () => {
      const onValueChange = vi.fn();
      render(<TabBar items={links} value="export" onValueChange={onValueChange} aria-label="Main" />);
      const nav = screen.getByRole("navigation", { name: "Main" });
      expect(nav.tagName).toBe("NAV");
      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Export/ })).toHaveAttribute("aria-current", "page");
      expect(screen.getByRole("link", { name: "Library" })).not.toHaveAttribute("aria-current");
      expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute("href", "/library");

      // Self-contained: no router — the click is a normal link click and reports the value.
      const library = screen.getByRole("link", { name: "Library" });
      library.addEventListener("click", (e) => e.preventDefault()); // jsdom cannot navigate
      await userEvent.click(library);
      expect(onValueChange).toHaveBeenCalledWith("library");
    });

    test("arrow keys move focus between links too", async () => {
      const user = userEvent.setup();
      render(<TabBar items={links} aria-label="Main" />);
      await user.tab();
      expect(screen.getByRole("link", { name: "Library" })).toHaveFocus();
      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("link", { name: "Player" })).toHaveFocus();
    });

    test("a disabled link has no href and is aria-disabled", () => {
      render(<TabBar items={links.map((i) => (i.value === "player" ? { ...i, disabled: true } : i))} />);
      const player = screen.getByRole("link", { name: "Player" });
      expect(player).not.toHaveAttribute("href");
      expect(player).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("badges", () => {
    test("shows counts (capped at 99+), dots, and announces them", () => {
      const { container } = render(
        <TabBar
          items={[
            { value: "a", label: "Inbox", icon: <Library />, badge: 3 },
            { value: "b", label: "Big", icon: <Play />, badge: 250 },
            { value: "c", label: "Dot", icon: <Upload />, badge: true, badgeLabel: "new" },
            { value: "d", label: "Zero", icon: <Settings2 />, badge: 0 },
          ]}
        />,
      );
      const badges = container.querySelectorAll("[data-badge]");
      expect(badges).toHaveLength(3);
      expect(badges[0]).toHaveTextContent("3");
      expect(badges[1]).toHaveTextContent("99+");
      expect(badges[2]).toHaveAttribute("data-badge", "dot");
      expect(screen.getByRole("tab", { name: "Inbox (3)" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Dot (new)" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Zero" })).toBeInTheDocument();
    });
  });

  describe("placement", () => {
    test("exposes placement / align and renders slots outside the capsule", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <TabBar
          ref={ref}
          items={items}
          placement="top"
          align="start"
          leading={<span>Logo</span>}
          trailing={<span>Account</span>}
          className="custom"
          data-testid="root"
        />,
      );
      const root = screen.getByTestId("root");
      expect(ref.current).toBe(root);
      expect(root).toHaveClass("root", "custom");
      expect(root).toHaveAttribute("data-placement", "top");
      expect(root).toHaveAttribute("data-align", "start");
      const list = screen.getByRole("tablist");
      expect(list).not.toContainElement(screen.getByText("Logo"));
      expect(list).not.toContainElement(screen.getByText("Account"));
    });

    test("defaults to auto placement, pinned", () => {
      render(<TabBar items={items} data-testid="root" />);
      expect(screen.getByTestId("root")).toHaveAttribute("data-placement", "auto");
      expect(screen.getByTestId("root")).not.toHaveAttribute("data-pinned");
    });
  });

  describe("press and drag (pointer events)", () => {
    let layout: ReturnType<typeof mockLayout>;
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance", "setTimeout", "Date"] });
      layout = mockLayout();
    });
    afterEach(() => {
      layout.mockRestore();
      vi.useRealTimers();
    });

    test("press on the selected tab, drag: the pill follows, nothing commits until release", () => {
      const onValueChange = vi.fn();
      const { container } = render(<TabBar items={items} onValueChange={onValueChange} />);
      const library = screen.getByRole("tab", { name: "Library" });
      expect(pillCentrePx(container)).toBeCloseTo(centre(0), 1);

      down(library, centre(0));
      move(centre(0) + 10);
      move(centre(1) + 20);
      frames(300);
      expect(pillCentrePx(container)).toBeCloseTo(centre(1) + 20, 0);
      // Pill grew to 62 × 36 (hold).
      expect(parseFloat(pill(container).style.getPropertyValue("--_pill-h")) * 16).toBeCloseTo(36, 1);
      // The tab under the pill lights up, but the selection (content) stays on Library.
      expect(screen.getByRole("tab", { name: "Player" })).toHaveAttribute("data-highlighted");
      expect(library).toHaveAttribute("aria-selected", "true");

      move(centre(2) - 15);
      frames(300);
      expect(screen.getByRole("tab", { name: /Export/ })).toHaveAttribute("data-highlighted");
      expect(onValueChange).not.toHaveBeenCalled();

      up(centre(2) - 15);
      // A click the browser fires on the originally pressed tab must not override the drag commit.
      fireEvent.click(library);
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith("export");
      expect(screen.getByRole("tab", { name: /Export/ })).toHaveAttribute("aria-selected", "true");

      // Snaps to the nearest centre and returns to rest size.
      frames(600);
      expect(pillCentrePx(container)).toBeCloseTo(centre(2), 1);
      expect(parseFloat(pill(container).style.getPropertyValue("--_pill-h")) * 16).toBeCloseTo(32, 1);
    });

    test("dragging more than 40 px away from the bar cancels and returns to origin", () => {
      const onValueChange = vi.fn();
      const { container } = render(<TabBar items={items} defaultValue="player" onValueChange={onValueChange} />);
      const player = screen.getByRole("tab", { name: "Player" });

      down(player, centre(1));
      move(centre(3));
      frames(200);
      move(centre(3), BAR.top - 30); // 30 px above: still dragging
      frames(100);
      expect(pillCentrePx(container)).toBeCloseTo(centre(3), 0);
      move(centre(3), BAR.top - 41); // > 40 px: cancel
      frames(600);
      expect(pillCentrePx(container)).toBeCloseTo(centre(1), 1);

      up(centre(3), BAR.top - 41);
      fireEvent.click(player);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(player).toHaveAttribute("aria-selected", "true");
    });

    test("release snaps to the nearest enabled tab", () => {
      const onValueChange = vi.fn();
      render(<TabBar items={items.map((i) => (i.value === "export" ? { ...i, disabled: true } : i))} onValueChange={onValueChange} />);
      down(screen.getByRole("tab", { name: "Library" }), centre(0));
      move(centre(2) + 5); // over the disabled Export, a bit towards Settings
      frames(300);
      up(centre(2) + 5);
      expect(onValueChange).toHaveBeenCalledWith("settings");
    });

    test("a tap travels the pill with a stretch and swaps the tint at 50 %", () => {
      const { container } = render(<TabBar items={items} />);
      const exportTab = screen.getByRole("tab", { name: /Export/ });
      down(exportTab, centre(2));
      expect(exportTab).toHaveAttribute("data-pressed"); // state layer
      up(centre(2));
      fireEvent.click(exportTab);
      expect(exportTab).not.toHaveAttribute("data-pressed");
      expect(exportTab).toHaveAttribute("aria-selected", "true");
      // Content switched immediately; the pill is still on its way and Library still looks active.
      expect(screen.getByRole("tab", { name: "Library" })).toHaveAttribute("data-highlighted");

      let widest = 0;
      for (let t = 0; t < 400; t += 16) {
        frames(16);
        widest = Math.max(widest, parseFloat(pill(container).style.getPropertyValue("--_pill-w")) * 16);
      }
      expect(widest).toBeGreaterThan(56);
      expect(widest).toBeLessThanOrEqual(56 * 1.4 + 0.01);
      expect(pillCentrePx(container)).toBeCloseTo(centre(2), 1);
      expect(exportTab).toHaveAttribute("data-highlighted");
    });

    test("controlled parent that rejects a drag commit: the pill goes back", () => {
      const Rejecting = () => {
        const [value] = useState("library");
        return <TabBar items={items} value={value} onValueChange={() => {}} />;
      };
      const { container } = render(<Rejecting />);
      down(screen.getByRole("tab", { name: "Library" }), centre(0));
      move(centre(3));
      frames(300);
      up(centre(3));
      frames(800);
      expect(pillCentrePx(container)).toBeCloseTo(centre(0), 1);
      expect(screen.getByRole("tab", { name: "Library" })).toHaveAttribute("data-highlighted");
    });

    test("reduced motion: no travel — the pill switches instantly", () => {
      const original = window.matchMedia;
      window.matchMedia = ((q: string) => ({ ...original(q), matches: q.includes("reduce") })) as typeof window.matchMedia;
      try {
        const { container } = render(<TabBar items={items} />);
        const settings = screen.getByRole("tab", { name: "Settings" });
        fireEvent.click(settings);
        expect(pillCentrePx(container)).toBeCloseTo(centre(3), 1);
        expect(settings).toHaveAttribute("data-highlighted");

        // Drag: jumps tab to tab under the finger, no following.
        down(settings, centre(3));
        move(centre(1) + 20);
        expect(pillCentrePx(container)).toBeCloseTo(centre(1), 1);
      } finally {
        window.matchMedia = original;
      }
    });
  });

  describe("platform", () => {
    test("web / android render the pill implementation", () => {
      const { rerender } = render(<TabBar items={items} platform="web" data-testid="root" />);
      expect(screen.getByTestId("root")).toHaveAttribute("data-platform", "web");
      rerender(<TabBar items={items} platform="android" data-testid="root" />);
      expect(screen.getByTestId("root")).toHaveAttribute("data-platform", "android");
    });

    test("iOS-only props are ignored on web", () => {
      render(<TabBar items={items} platform="web" minimized search={{ label: "Search" }} data-testid="root" />);
      expect(screen.getByTestId("root")).not.toHaveAttribute("data-minimized");
      expect(screen.queryByRole("button", { name: "Search" })).not.toBeInTheDocument();
      expect(screen.getByRole("tablist")).not.toHaveAttribute("inert");
    });
  });

  describe("iOS", () => {
    test("platform='ios' renders the floating glass bar with one lens, always at the bottom", () => {
      render(
        <TabBar
          items={items}
          platform="ios"
          placement="top"
          layout="wide"
          leading={<span>Logo</span>}
          trailing={<span>Account</span>}
          aria-label="Sections"
          data-testid="root"
        />,
      );
      const root = screen.getByTestId("root");
      expect(root).toHaveAttribute("data-platform", "ios");
      expect(root).toHaveAttribute("data-placement", "bottom");
      expect(root).not.toHaveAttribute("data-layout");
      expect(root.style.getPropertyValue("--_count")).toBe("4");
      // Top-placement slots do not exist on iOS.
      expect(screen.queryByText("Logo")).not.toBeInTheDocument();
      expect(screen.queryByText("Account")).not.toBeInTheDocument();
      const list = screen.getByRole("tablist", { name: "Sections" });
      expect(list.querySelectorAll("[data-pill]")).toHaveLength(1);
      expect(screen.getAllByRole("tab")).toHaveLength(4);
      expect(screen.getByRole("tab", { name: "Library" })).toHaveAttribute("aria-selected", "true");
      // No search circle unless `search` is given.
      expect(screen.queryByRole("button", { name: "Search" })).not.toBeInTheDocument();
    });

    test("ConfigProvider platform='ios' selects the iOS implementation; the prop wins", () => {
      const { rerender } = render(
        <ConfigProvider platform="ios">
          <TabBar items={items} data-testid="root" />
        </ConfigProvider>,
      );
      expect(screen.getByTestId("root")).toHaveAttribute("data-platform", "ios");
      rerender(
        <ConfigProvider platform="ios">
          <TabBar items={items} platform="web" data-testid="root" />
        </ConfigProvider>,
      );
      expect(screen.getByTestId("root")).toHaveAttribute("data-platform", "web");
    });

    test("selection, badges and keyboard behave like web", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(<TabBar items={items} platform="ios" onValueChange={onValueChange} />);
      await user.click(screen.getByRole("tab", { name: "Player" }));
      expect(onValueChange).toHaveBeenLastCalledWith("player");
      expect(screen.getByRole("tab", { name: "Player" })).toHaveAttribute("aria-selected", "true");

      expect(container.querySelector("[data-badge]")).toHaveTextContent("3");
      const exportTab = screen.getByRole("tab", { name: "Export (3)" });

      expect(screen.getByRole("tab", { name: "Player" })).toHaveFocus();
      await user.keyboard("{ArrowRight}");
      expect(exportTab).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(onValueChange).toHaveBeenLastCalledWith("export");
      await user.keyboard("{Home}");
      expect(screen.getByRole("tab", { name: "Library" })).toHaveFocus();
    });

    test("links mode renders a nav with aria-current", () => {
      render(<TabBar items={items.map((i) => ({ ...i, href: `/${i.value}` }))} value="player" platform="ios" aria-label="Main" />);
      expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Player" })).toHaveAttribute("aria-current", "page");
    });

    describe("lens (pointer)", () => {
      // `Tab Bar/iOS`: bar 290 × 62 at (100, 500); tab i 70.5 × 54 at x = 4 + 70.5·i, y = 4.
      const IOS_BAR = { left: 100, top: 500, width: 290, height: 62 };
      const iosCentre = (i: number) => IOS_BAR.left + 4 + 70.5 * i + 35.25;
      const IY = IOS_BAR.top + 31;
      let layout: ReturnType<typeof vi.spyOn>;
      beforeEach(() => {
        vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance", "setTimeout", "Date"] });
        layout = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
          const r = (x: number, y: number, w: number, h: number) =>
            ({ x, y, left: x, top: y, width: w, height: h, right: x + w, bottom: y + h, toJSON: () => ({}) }) as DOMRect;
          if (this.classList.contains("bar")) return r(IOS_BAR.left, IOS_BAR.top, IOS_BAR.width, IOS_BAR.height);
          if (this.classList.contains("indicator")) {
            const i = Number(this.closest<HTMLElement>("[data-index]")?.dataset.index ?? 0);
            return r(IOS_BAR.left + 4 + 70.5 * i, IOS_BAR.top + 4, 70.5, 54);
          }
          return r(0, 0, 0, 0);
        });
      });
      afterEach(() => {
        layout.mockRestore();
        vi.useRealTimers();
      });

      const lensPx = (container: HTMLElement, v: string) => parseFloat(pill(container).style.getPropertyValue(v)) * 16;

      test("hold and drag: the lens lifts to 1.15×, follows the finger and commits on release", () => {
        const onValueChange = vi.fn();
        const { container } = render(<TabBar items={items} platform="ios" onValueChange={onValueChange} />);
        expect(lensPx(container, "--_pill-w")).toBeCloseTo(70.5, 1);
        expect(lensPx(container, "--_pill-h")).toBeCloseTo(54, 1);

        const library = screen.getByRole("tab", { name: "Library" });
        down(library, iosCentre(0), IY);
        frames(150);
        expect(lensPx(container, "--_pill-h")).toBeCloseTo(54 * 1.15, 1);
        expect(pill(container).style.getPropertyValue("--_pill-lift")).toBe("1");

        move(iosCentre(0) + 10, IY);
        move(iosCentre(2), IY);
        frames(300);
        expect(screen.getByRole("tab", { name: /Export/ })).toHaveAttribute("data-highlighted");
        expect(onValueChange).not.toHaveBeenCalled();

        up(iosCentre(2), IY);
        fireEvent.click(library);
        expect(onValueChange).toHaveBeenCalledTimes(1);
        expect(onValueChange).toHaveBeenCalledWith("export");
        frames(800);
        expect(lensPx(container, "--_pill-w")).toBeCloseTo(70.5, 1);
        expect(lensPx(container, "--_pill-x") + 35.25).toBeCloseTo(4 + 70.5 * 2 + 35.25, 1);
        expect(pill(container).style.getPropertyValue("--_pill-lift")).toBe("0");
      });

      test("press on another tab shows the pressed bubble (row 2)", () => {
        render(<TabBar items={items} platform="ios" />);
        const player = screen.getByRole("tab", { name: "Player" });
        down(player, iosCentre(1), IY);
        expect(player).toHaveAttribute("data-pressed");
        up(iosCentre(1), IY);
        expect(player).not.toHaveAttribute("data-pressed");
      });

      test("dragging more than 40 px off the bar cancels", () => {
        const onValueChange = vi.fn();
        render(<TabBar items={items} platform="ios" onValueChange={onValueChange} />);
        down(screen.getByRole("tab", { name: "Library" }), iosCentre(0), IY);
        move(iosCentre(3), IY);
        frames(200);
        move(iosCentre(3), IOS_BAR.top - 41);
        up(iosCentre(3), IOS_BAR.top - 41);
        expect(onValueChange).not.toHaveBeenCalled();
      });
    });

    describe("minimized (row 4)", () => {
      test("minimized: the bar hides behind a circle with the selected icon; tapping it asks to restore", async () => {
        const onMinimizedChange = vi.fn();
        render(<TabBar items={items} platform="ios" defaultValue="player" minimized onMinimizedChange={onMinimizedChange} data-testid="root" />);
        expect(screen.getByTestId("root")).toHaveAttribute("data-minimized");
        expect(screen.getByRole("tablist", { hidden: true })).toHaveAttribute("inert");
        const mini = screen.getByRole("button", { name: "Player" });
        expect(mini).toHaveAttribute("aria-expanded", "false");
        expect(mini).not.toHaveAttribute("inert");
        await userEvent.click(mini);
        expect(onMinimizedChange).toHaveBeenCalledWith(false);
      });

      test("not minimized: the circle is inert and hidden from assistive tech", () => {
        render(<TabBar items={items} platform="ios" />);
        expect(screen.queryByRole("button", { name: "Library" })).not.toBeInTheDocument();
        expect(screen.getByRole("tablist")).not.toHaveAttribute("inert");
      });

      test("auto: minimizes on scroll down, restores on scroll up and at the top", () => {
        const onMinimizedChange = vi.fn();
        render(<TabBar items={items} platform="ios" minimized="auto" onMinimizedChange={onMinimizedChange} data-testid="root" />);
        const root = screen.getByTestId("root");
        const scrollTo = (y: number) =>
          act(() => {
            Object.defineProperty(window, "scrollY", { value: y, configurable: true });
            window.dispatchEvent(new Event("scroll"));
          });
        try {
          scrollTo(4); // under the slop
          expect(root).not.toHaveAttribute("data-minimized");
          scrollTo(120);
          expect(root).toHaveAttribute("data-minimized");
          expect(onMinimizedChange).toHaveBeenLastCalledWith(true);
          scrollTo(200);
          expect(onMinimizedChange).toHaveBeenCalledTimes(1);
          scrollTo(150);
          expect(root).not.toHaveAttribute("data-minimized");
          expect(onMinimizedChange).toHaveBeenLastCalledWith(false);
          scrollTo(400);
          expect(root).toHaveAttribute("data-minimized");
          scrollTo(0);
          expect(root).not.toHaveAttribute("data-minimized");
        } finally {
          Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
        }
      });

      test("auto with a scroll container; tapping the circle restores and focus goes back to the tab", async () => {
        const user = userEvent.setup();
        const scroller = document.createElement("div");
        document.body.appendChild(scroller);
        try {
          render(<TabBar items={items} platform="ios" minimized="auto" scrollContainer={scroller} data-testid="root" />);
          const root = screen.getByTestId("root");
          act(() => {
            scroller.scrollTop = 300;
            scroller.dispatchEvent(new Event("scroll"));
          });
          expect(root).toHaveAttribute("data-minimized");
          const mini = screen.getByRole("button", { name: "Library" });
          mini.focus();
          await user.keyboard("{Enter}");
          expect(root).not.toHaveAttribute("data-minimized");
          expect(screen.getByRole("tab", { name: "Library" })).toHaveFocus();
        } finally {
          scroller.remove();
        }
      });
    });

    describe("search (row 5)", () => {
      test("the search circle expands into a focused field; Esc and close collapse it", async () => {
        const user = userEvent.setup();
        const onActivate = vi.fn();
        const onExpandedChange = vi.fn();
        render(
          <TabBar
            items={items}
            platform="ios"
            search={{ label: "Search stickers", onActivate, onExpandedChange }}
            data-testid="root"
          />,
        );
        const root = screen.getByTestId("root");
        await user.click(screen.getByRole("button", { name: "Search stickers" }));
        expect(onActivate).toHaveBeenCalledTimes(1);
        expect(onExpandedChange).toHaveBeenLastCalledWith(true);
        expect(root).toHaveAttribute("data-search", "expanded");
        expect(screen.getByRole("search")).toBeInTheDocument();
        const input = screen.getByRole("searchbox", { name: "Search stickers" });
        expect(input).toHaveAttribute("placeholder", "Search stickers");
        expect(input).toHaveFocus();
        // The bar is hidden and out of the tab order meanwhile.
        expect(screen.getByRole("tablist", { hidden: true })).toHaveAttribute("inert");

        await user.keyboard("{Escape}");
        expect(onExpandedChange).toHaveBeenLastCalledWith(false);
        expect(root).toHaveAttribute("data-search", "collapsed");
        expect(screen.queryByRole("search")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Search stickers" })).toHaveFocus();

        await user.click(screen.getByRole("button", { name: "Search stickers" }));
        await user.click(screen.getByRole("button", { name: "Close search" }));
        expect(screen.queryByRole("search")).not.toBeInTheDocument();
      });

      test("controlled expanded, inputProps and custom field content", async () => {
        const onChange = vi.fn();
        const { rerender } = render(
          <TabBar items={items} platform="ios" search={{ expanded: true, inputProps: { value: "fog", onChange } }} />,
        );
        const input = screen.getByRole("searchbox", { name: "Search" });
        expect(input).toHaveValue("fog");
        await userEvent.type(input, "s");
        expect(onChange).toHaveBeenCalled();

        rerender(
          <TabBar items={items} platform="ios" search={{ expanded: true, children: <input aria-label="Custom" /> }} />,
        );
        expect(screen.getByRole("textbox", { name: "Custom" })).toBeInTheDocument();

        // Controlled: closing only reports; the parent decides.
        const onExpandedChange = vi.fn();
        rerender(<TabBar items={items} platform="ios" search={{ expanded: true, onExpandedChange }} />);
        await userEvent.click(screen.getByRole("button", { name: "Close search" }));
        expect(onExpandedChange).toHaveBeenCalledWith(false);
        expect(screen.getByRole("search")).toBeInTheDocument();
      });

      test("search takes over a minimized bar", () => {
        render(<TabBar items={items} platform="ios" minimized search={{ defaultExpanded: true }} data-testid="root" />);
        expect(screen.getByTestId("root")).not.toHaveAttribute("data-minimized");
        expect(screen.getByTestId("root")).toHaveAttribute("data-search", "expanded");
        // Rendered expanded from the start: no focus grab.
        expect(screen.getByRole("searchbox")).not.toHaveFocus();
      });
    });
  });
});
