import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Rabbit, Turtle } from "lucide-react";

import Slider from "./Slider";
import iosClasses from "./Slider.ios.module.scss";
import ConfigProvider from "../ConfigProvider";

const rect = (el: Element, width = 200, height = 44) =>
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: width,
    bottom: height,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect);

describe("Slider", () => {
  test("exposes a named slider with range and value text", () => {
    render(<Slider label="Frame rate" defaultValue={60} max={120} formatValue={(v) => `${v} fps`} />);
    const slider = screen.getByRole("slider", { name: "Frame rate" });
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "120");
    expect(slider).toHaveAttribute("aria-valuenow", "60");
    expect(slider).toHaveAttribute("aria-valuetext", "60 fps");
    expect(slider).toHaveAttribute("tabindex", "0");
    expect(slider).toHaveTextContent("60 fps");
    expect(slider).toHaveTextContent("120");
  });

  test("getValueText wins over formatValue for aria-valuetext", () => {
    render(<Slider label="Volume" defaultValue={3} formatValue={(v) => <b>{v}</b>} getValueText={(v) => `${v} percent`} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "3 percent");
  });

  test("keyboard: arrows, PageUp/PageDown, Home/End (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    render(
      <Slider label="Level" defaultValue={50} step={5} onValueChange={onValueChange} onValueCommit={onValueCommit} />,
    );
    const slider = screen.getByRole("slider");
    await user.tab();
    expect(slider).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(slider).toHaveAttribute("aria-valuenow", "55");
    await user.keyboard("{ArrowDown}");
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    await user.keyboard("{PageUp}");
    expect(slider).toHaveAttribute("aria-valuenow", "60");
    await user.keyboard("{PageDown}{PageDown}");
    expect(slider).toHaveAttribute("aria-valuenow", "40");
    await user.keyboard("{End}");
    expect(slider).toHaveAttribute("aria-valuenow", "100");
    await user.keyboard("{ArrowRight}"); // clamped: no change, no callback
    await user.keyboard("{Home}");
    expect(slider).toHaveAttribute("aria-valuenow", "0");

    expect(onValueChange.mock.calls.map(([v]) => v)).toEqual([55, 50, 60, 50, 40, 100, 0]);
    expect(onValueCommit).toHaveBeenCalledTimes(7);
  });

  test("controlled: value only changes when the parent updates it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Slider label="Level" value={10} onValueChange={onValueChange} />);
    const slider = screen.getByRole("slider");
    slider.focus();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith(11);
    expect(slider).toHaveAttribute("aria-valuenow", "10");
    rerender(<Slider label="Level" value={11} onValueChange={onValueChange} />);
    expect(slider).toHaveAttribute("aria-valuenow", "11");
  });

  test("pointer: click jumps, drag follows, release commits", () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    render(<Slider label="Level" onValueChange={onValueChange} onValueCommit={onValueCommit} />);
    const slider = screen.getByRole("slider");
    rect(slider);

    fireEvent.pointerDown(slider, { clientX: 150, pointerId: 1, button: 0 });
    expect(slider).toHaveAttribute("aria-valuenow", "75");
    expect(slider).toHaveAttribute("data-dragging");
    expect(slider).toHaveFocus();

    fireEvent.pointerMove(slider, { clientX: 50, pointerId: 1 });
    expect(slider).toHaveAttribute("aria-valuenow", "25");
    expect(onValueCommit).not.toHaveBeenCalled();

    fireEvent.pointerUp(slider, { clientX: 50, pointerId: 1 });
    expect(slider).not.toHaveAttribute("data-dragging");
    expect(onValueCommit).toHaveBeenCalledWith(25);
    expect(onValueChange.mock.calls.map(([v]) => v)).toEqual([75, 25]);

    // Moving after release does nothing.
    fireEvent.pointerMove(slider, { clientX: 180, pointerId: 1 });
    expect(slider).toHaveAttribute("aria-valuenow", "25");
  });

  test("pointer: grabbing the fill edge does not jump", () => {
    render(<Slider label="Level" defaultValue={50} />);
    const slider = screen.getByRole("slider");
    rect(slider); // edge at x = 100, grab zone = half the height
    fireEvent.pointerDown(slider, { clientX: 110, pointerId: 1, button: 0 });
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    fireEvent.pointerMove(slider, { clientX: 130, pointerId: 1 });
    expect(slider).toHaveAttribute("aria-valuenow", "60");
  });

  test("disabled: not focusable, ignores keyboard and pointer", () => {
    const onValueChange = vi.fn();
    render(<Slider label="Level" defaultValue={20} disabled onValueChange={onValueChange} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-disabled", "true");
    expect(slider).not.toHaveAttribute("tabindex");
    rect(slider);
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.pointerDown(slider, { clientX: 150, pointerId: 1, button: 0 });
    expect(slider).toHaveAttribute("aria-valuenow", "20");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("showValue={false} and maxLabel={null} hide the texts", () => {
    render(<Slider label="Level" defaultValue={40} showValue={false} maxLabel={null} />);
    expect(screen.getByRole("slider")).toHaveTextContent("");
  });

  test("low value moves the value text outside the fill", () => {
    const width = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(40);
    const client = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
    const { rerender } = render(<Slider label="Level" value={5} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("data-label-outside");
    rerender(<Slider label="Level" value={60} />);
    expect(slider).not.toHaveAttribute("data-label-outside");
    width.mockRestore();
    client.mockRestore();
  });

  describe("stepped", () => {
    const steps = [12, 24, 30, 60];

    test("draws connected segments and marks the current one", () => {
      render(<Slider label="Frame rate" steps={steps} defaultValue={30} />);
      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemin", "12");
      expect(slider).toHaveAttribute("aria-valuemax", "60");
      expect(slider).toHaveAttribute("aria-valuenow", "30");
      const segments = slider.children;
      expect(segments).toHaveLength(4);
      expect(Array.from(segments).map((s) => s.hasAttribute("data-active"))).toEqual([true, true, true, false]);
      expect(segments[2]).toHaveAttribute("data-current");
    });

    test("keyboard moves between steps", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Slider label="Frame rate" steps={steps} defaultValue={24} onValueChange={onValueChange} />);
      screen.getByRole("slider").focus();
      await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{Home}{ArrowLeft}{End}");
      expect(onValueChange.mock.calls.map(([v]) => v)).toEqual([30, 60, 12, 60]);
    });

    test("pointer picks the segment under the pointer", () => {
      const onValueCommit = vi.fn();
      render(<Slider label="Frame rate" steps={steps} defaultValue={12} onValueCommit={onValueCommit} />);
      const slider = screen.getByRole("slider");
      rect(slider, 400);
      fireEvent.pointerDown(slider, { clientX: 250, pointerId: 1, button: 0 });
      expect(slider).toHaveAttribute("aria-valuenow", "30");
      fireEvent.pointerMove(slider, { clientX: 390, pointerId: 1 });
      fireEvent.pointerUp(slider, { pointerId: 1 });
      expect(slider).toHaveAttribute("aria-valuenow", "60");
      expect(onValueCommit).toHaveBeenCalledWith(60);
    });

    test("snaps an off-step value to the nearest step", () => {
      render(<Slider label="Frame rate" steps={steps} value={50} />);
      expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "60");
    });
  });

  test("forwards ref and native props, merges className", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Slider ref={ref} label="Level" id="lvl" className="extra" data-testid="s" />);
    expect(ref.current).toBe(screen.getByTestId("s"));
    expect(ref.current).toHaveAttribute("id", "lvl");
    expect(ref.current?.className).toContain("extra");
  });

  test("renders the Android + Web anatomy by default and marks the platform", () => {
    render(<Slider label="Level" defaultValue={40} leadingIcon={<Turtle data-testid="turtle" />} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("data-platform", "web");
    expect(slider.className).toContain("slider");
    expect(slider).toHaveTextContent("100"); // max label
    expect(screen.queryByTestId("turtle")).toBeNull(); // iOS-only prop ignored
  });

  describe("iOS", () => {
    // jsdom has no layout: give every element a 456-wide box and the lens wrap a 56 width (inset 28),
    // so the lens centre travels 28 → 428 (usable 400).
    const layout = () => {
      const r = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 456,
        bottom: 40,
        width: 456,
        height: 40,
        toJSON: () => ({}),
      } as DOMRect);
      const w = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(56);
      return () => {
        r.mockRestore();
        w.mockRestore();
      };
    };

    test("platform=\"ios\" renders the track + lens anatomy with the value in the lens", () => {
      render(
        <Slider
          platform="ios"
          label="Frame rate"
          defaultValue={60}
          max={120}
          size="s"
          icon={<span data-testid="web-icon" />}
          getValueText={(v) => `${v} fps`}
        />,
      );
      const slider = screen.getByRole("slider", { name: "Frame rate" });
      expect(slider).toHaveAttribute("data-platform", "ios");
      expect(slider.className).toContain(iosClasses.root);
      expect(slider).not.toHaveAttribute("data-size");
      expect(slider).toHaveAttribute("aria-valuenow", "60");
      expect(slider).toHaveAttribute("aria-valuetext", "60 fps");
      expect(slider).toHaveAttribute("tabindex", "0");
      expect(slider.querySelector(`.${iosClasses.lens}`)).toHaveTextContent(/^60$/);
      expect(slider).not.toHaveTextContent("120"); // no max label on iOS
      expect(screen.queryByTestId("web-icon")).toBeNull(); // Android + Web-only prop ignored
      expect(slider.style.getPropertyValue("--_pct")).toBe("0.5");
    });

    test("ConfigProvider platform=\"ios\" selects the iOS implementation; the prop still wins", () => {
      render(
        <ConfigProvider platform="ios">
          <Slider label="From provider" defaultValue={10} />
          <Slider label="Forced web" defaultValue={10} platform="web" />
        </ConfigProvider>,
      );
      expect(screen.getByRole("slider", { name: "From provider" })).toHaveAttribute("data-platform", "ios");
      expect(screen.getByRole("slider", { name: "Forced web" })).toHaveAttribute("data-platform", "web");
    });

    test("keyboard works the same (iPad keyboard)", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onValueCommit = vi.fn();
      render(
        <Slider platform="ios" label="Level" defaultValue={50} step={5} onValueChange={onValueChange} onValueCommit={onValueCommit} />,
      );
      const slider = screen.getByRole("slider");
      await user.tab();
      expect(slider).toHaveFocus();
      await user.keyboard("{ArrowRight}{ArrowLeft}{ArrowLeft}{PageUp}{End}{Home}");
      expect(onValueChange.mock.calls.map(([v]) => v)).toEqual([55, 50, 45, 55, 100, 0]);
      expect(onValueCommit).toHaveBeenCalledTimes(6);
      expect(slider).toHaveAttribute("aria-valuenow", "0");
    });

    test("pointer: tap on the track jumps, the lens grows while dragging, release commits", () => {
      const restore = layout();
      const onValueChange = vi.fn();
      const onValueCommit = vi.fn();
      render(<Slider platform="ios" label="Level" onValueChange={onValueChange} onValueCommit={onValueCommit} />);
      const slider = screen.getByRole("slider");

      fireEvent.pointerDown(slider, { clientX: 328, pointerId: 1, button: 0 }); // (328 - 28) / 400 = 75%
      expect(slider).toHaveAttribute("aria-valuenow", "75");
      expect(slider).toHaveAttribute("data-dragging");
      expect(slider).toHaveFocus();

      fireEvent.pointerMove(slider, { clientX: 128, pointerId: 1 });
      expect(slider).toHaveAttribute("aria-valuenow", "25");
      fireEvent.pointerMove(slider, { clientX: -50, pointerId: 1 }); // clamped to min
      expect(slider).toHaveAttribute("aria-valuenow", "0");
      expect(onValueCommit).not.toHaveBeenCalled();

      fireEvent.pointerUp(slider, { pointerId: 1 });
      expect(slider).not.toHaveAttribute("data-dragging");
      expect(onValueCommit).toHaveBeenCalledWith(0);
      expect(onValueChange.mock.calls.map(([v]) => v)).toEqual([75, 25, 0]);
      restore();
    });

    test("pointer: grabbing the lens does not jump", () => {
      const restore = layout();
      render(<Slider platform="ios" label="Level" defaultValue={50} />);
      const slider = screen.getByRole("slider");
      // Lens centre at 28 + 400 * 0.5 = 228; press 20 to its right.
      fireEvent.pointerDown(slider, { clientX: 248, pointerId: 1, button: 0 });
      expect(slider).toHaveAttribute("aria-valuenow", "50");
      fireEvent.pointerMove(slider, { clientX: 288, pointerId: 1 });
      expect(slider).toHaveAttribute("aria-valuenow", "60");
      restore();
    });

    test("leading / trailing icons render as decoration and ignore taps", () => {
      const restore = layout();
      const onValueChange = vi.fn();
      render(
        <Slider
          platform="ios"
          label="Frame rate"
          defaultValue={60}
          onValueChange={onValueChange}
          leadingIcon={<Turtle data-testid="min" />}
          trailingIcon={<Rabbit data-testid="max" />}
        />,
      );
      const min = screen.getByTestId("min");
      expect(min.parentElement).toHaveAttribute("aria-hidden", "true");
      expect(screen.getByTestId("max")).toBeInTheDocument();
      fireEvent.pointerDown(min, { clientX: 0, pointerId: 1, button: 0 });
      expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "60");
      expect(screen.getByRole("slider")).not.toHaveAttribute("data-dragging");
      expect(onValueChange).not.toHaveBeenCalled();
      restore();
    });

    test("stepped: ticks and labels, snaps to the nearest tick", () => {
      const restore = layout();
      const onValueCommit = vi.fn();
      render(
        <Slider
          platform="ios"
          label="Frame rate"
          steps={[12, 24, 30, 60]}
          defaultValue={30}
          onValueCommit={onValueCommit}
          formatStep={(s) => `${s}`}
        />,
      );
      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("data-stepped");
      const ticks = Array.from(slider.querySelectorAll(`.${iosClasses.tick}`));
      expect(ticks.map((t) => t.hasAttribute("data-active"))).toEqual([true, true, true, false]);
      const labels = Array.from(slider.querySelectorAll(`.${iosClasses.tickLabel}`));
      expect(labels.map((l) => l.textContent)).toEqual(["12", "24", "30", "60"]);
      expect(labels[2]).toHaveAttribute("data-current");
      expect(slider.style.getPropertyValue("--_pct")).toBe(String(2 / 3));

      // Ticks at 28, 161.3, 294.7, 428 — 150 is nearest to 24.
      fireEvent.pointerDown(slider, { clientX: 150, pointerId: 1, button: 0 });
      expect(slider).toHaveAttribute("aria-valuenow", "24");
      fireEvent.pointerMove(slider, { clientX: 400, pointerId: 1 });
      fireEvent.pointerUp(slider, { pointerId: 1 });
      expect(slider).toHaveAttribute("aria-valuenow", "60");
      expect(onValueCommit).toHaveBeenCalledWith(60);
      restore();
    });

    test("stepped keyboard moves tick by tick", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Slider platform="ios" label="Frame rate" steps={[12, 24, 30, 60]} defaultValue={24} onValueChange={onValueChange} />);
      screen.getByRole("slider").focus();
      await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{Home}");
      expect(onValueChange.mock.calls.map(([v]) => v)).toEqual([30, 60, 12]);
    });

    test("disabled: not focusable, ignores keyboard and pointer", () => {
      const restore = layout();
      const onValueChange = vi.fn();
      render(<Slider platform="ios" label="Level" defaultValue={60} disabled onValueChange={onValueChange} />);
      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-disabled", "true");
      expect(slider).not.toHaveAttribute("tabindex");
      fireEvent.keyDown(slider, { key: "ArrowRight" });
      fireEvent.pointerDown(slider, { clientX: 100, pointerId: 1, button: 0 });
      expect(slider).toHaveAttribute("aria-valuenow", "60");
      expect(slider).not.toHaveAttribute("data-dragging");
      expect(onValueChange).not.toHaveBeenCalled();
      restore();
    });

    test("glass variant, showValue={false}, ref and native props", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Slider platform="ios" ref={ref} label="Level" variant="glass" showValue={false} className="extra" id="lvl" data-testid="s" />,
      );
      const slider = screen.getByTestId("s");
      expect(ref.current).toBe(slider);
      expect(slider).toHaveAttribute("id", "lvl");
      expect(slider).toHaveAttribute("data-variant", "glass");
      expect(slider.className).toContain("extra");
      expect(slider.querySelector(`.${iosClasses.lens}`)).toHaveTextContent("");
    });
  });
});
