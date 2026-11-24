import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Slider from "./Slider";

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
});
