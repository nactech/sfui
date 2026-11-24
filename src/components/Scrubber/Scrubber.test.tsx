import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Scrubber, { formatPlaybackTime } from "./Scrubber";

const rect = (el: Element, width = 200) =>
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: width,
    bottom: 40,
    width,
    height: 40,
    toJSON: () => ({}),
  } as DOMRect);

describe("formatPlaybackTime", () => {
  test("m:ss, h:mm:ss past an hour", () => {
    expect(formatPlaybackTime(0)).toBe("0:00");
    expect(formatPlaybackTime(65.7)).toBe("1:05");
    expect(formatPlaybackTime(3725)).toBe("1:02:05");
    expect(formatPlaybackTime(Number.NaN)).toBe("0:00");
  });
});

describe("Scrubber", () => {
  test("is a named slider with the time as value text", () => {
    render(<Scrubber duration={180} currentTime={65} />);
    const slider = screen.getByRole("slider", { name: "Seek" });
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "180");
    expect(slider).toHaveAttribute("aria-valuenow", "65");
    expect(slider).toHaveAttribute("aria-valuetext", "1:05 of 3:00");
    expect(slider).toHaveAttribute("data-state", "paused");
  });

  test("custom label and formatTime", () => {
    render(<Scrubber label="Sticker" duration={2.4} currentTime={1.6} formatTime={(t) => `${t.toFixed(1)} s`} />);
    expect(screen.getByRole("slider", { name: "Sticker" })).toHaveAttribute("aria-valuetext", "1.6 s of 2.4 s");
  });

  test("waves only while playing", () => {
    const { rerender } = render(<Scrubber duration={60} currentTime={10} playing />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("data-state", "playing");
    expect(slider).toHaveAttribute("data-waving");
    rerender(<Scrubber duration={60} currentTime={10} playing={false} />);
    expect(slider).not.toHaveAttribute("data-waving");
  });

  test("keyboard seeks ±5 s, PageUp/PageDown, Home/End, clamped", async () => {
    const user = userEvent.setup();
    const onSeek = vi.fn();
    const { rerender } = render(<Scrubber duration={100} currentTime={50} onSeek={onSeek} />);
    await user.tab();
    expect(screen.getByRole("slider")).toHaveFocus();
    await user.keyboard("{ArrowRight}{ArrowLeft}{PageUp}{PageDown}{Home}{End}");
    expect(onSeek.mock.calls.map(([t]) => t)).toEqual([55, 45, 60, 40, 0, 100]);

    onSeek.mockClear();
    rerender(<Scrubber duration={100} currentTime={98} onSeek={onSeek} />);
    await user.keyboard("{ArrowRight}");
    expect(onSeek).toHaveBeenCalledWith(100);
    rerender(<Scrubber duration={100} currentTime={100} onSeek={onSeek} />);
    onSeek.mockClear();
    await user.keyboard("{End}");
    expect(onSeek).not.toHaveBeenCalled();
  });

  test("pointer scrubbing shows the lens time and reports start / seek / end", () => {
    const onSeek = vi.fn();
    const onSeekStart = vi.fn();
    const onSeekEnd = vi.fn();
    render(
      <Scrubber
        duration={100}
        currentTime={10}
        playing
        onSeek={onSeek}
        onSeekStart={onSeekStart}
        onSeekEnd={onSeekEnd}
      />,
    );
    const slider = screen.getByRole("slider");
    rect(slider);

    fireEvent.pointerDown(slider, { clientX: 100, pointerId: 1, button: 0 });
    expect(onSeekStart).toHaveBeenCalledWith(50);
    expect(onSeek).toHaveBeenLastCalledWith(50);
    expect(slider).toHaveAttribute("data-state", "scrubbing");
    expect(slider).not.toHaveAttribute("data-waving"); // the wave flattens while scrubbing
    expect(slider).toHaveAttribute("aria-valuenow", "50"); // shows the scrub time, not currentTime
    expect(slider).toHaveTextContent("0:50");
    expect(slider).toHaveFocus();

    fireEvent.pointerMove(slider, { clientX: 150, pointerId: 1 });
    expect(onSeek).toHaveBeenLastCalledWith(75);

    fireEvent.pointerUp(slider, { clientX: 150, pointerId: 1 });
    expect(onSeekEnd).toHaveBeenCalledWith(75);
    expect(slider).toHaveAttribute("data-state", "playing");
    expect(onSeek).toHaveBeenCalledTimes(2);
  });

  test("disabled ignores keyboard and pointer", () => {
    const onSeek = vi.fn();
    const onSeekStart = vi.fn();
    render(<Scrubber duration={100} currentTime={10} disabled onSeek={onSeek} onSeekStart={onSeekStart} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-disabled", "true");
    expect(slider).not.toHaveAttribute("tabindex");
    rect(slider);
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.pointerDown(slider, { clientX: 100, pointerId: 1, button: 0 });
    expect(onSeek).not.toHaveBeenCalled();
    expect(onSeekStart).not.toHaveBeenCalled();
    expect(slider).toHaveAttribute("data-state", "paused");
  });

  test("handles a zero / unknown duration", () => {
    render(<Scrubber duration={Number.NaN} currentTime={5} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "0:00 of 0:00");
  });

  test("forwards ref and native props", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Scrubber ref={ref} duration={10} currentTime={0} id="seek" className="x" />);
    expect(ref.current).toHaveAttribute("id", "seek");
    expect(ref.current?.className).toContain("x");
  });
});
