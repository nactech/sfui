import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Checkbox from "./Checkbox";

describe("Checkbox", () => {
  test("renders a native checkbox named by its label", () => {
    render(<Checkbox label="Select all" />);
    const box = screen.getByRole("checkbox", { name: "Select all" });
    expect(box).toHaveAttribute("type", "checkbox");
    expect(box).not.toBeChecked();
  });

  test("uncontrolled: toggles on click and Space", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Row" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox");

    await user.click(box);
    expect(box).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    await user.keyboard(" ");
    expect(box).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  test("mixed: exposes aria-checked=mixed + indeterminate, and activating it checks", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Checkbox aria-label="All" defaultChecked="mixed" onCheckedChange={onCheckedChange} />,
    );
    const box = screen.getByRole<HTMLInputElement>("checkbox");
    expect(box).toBePartiallyChecked();
    expect(box).toHaveAttribute("aria-checked", "mixed");
    expect(box.indeterminate).toBe(true);
    expect(container.firstElementChild).toHaveAttribute("data-state", "mixed");

    await user.click(box);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(box).toBeChecked();
    expect(box.indeterminate).toBe(false);
    expect(box).not.toHaveAttribute("aria-checked");
    expect(container.firstElementChild).toHaveAttribute("data-state", "checked");
  });

  test("controlled: follows the checked prop, including mixed", () => {
    const { rerender } = render(<Checkbox aria-label="All" checked={false} />);
    const box = screen.getByRole<HTMLInputElement>("checkbox");
    expect(box).not.toBeChecked();
    rerender(<Checkbox aria-label="All" checked="mixed" />);
    expect(box).toBePartiallyChecked();
    rerender(<Checkbox aria-label="All" checked />);
    expect(box).toBeChecked();
    expect(box.indeterminate).toBe(false);
  });

  test("controlled: reports but does not change on its own", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Row" checked onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  test("clicking the label text toggles it", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Keep" />);
    await user.click(screen.getByText("Keep"));
    expect(screen.getByRole("checkbox", { name: "Keep" })).toBeChecked();
  });

  test("disabled: not toggled, not focusable", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(<Checkbox aria-label="Row" disabled onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox");
    expect(box).toBeDisabled();
    expect(container.firstElementChild).toHaveAttribute("data-disabled");
    await user.click(box);
    await user.tab();
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(box).not.toHaveFocus();
  });

  test("forwards object and callback refs", () => {
    const objectRef = React.createRef<HTMLInputElement>();
    let fromCallback: HTMLInputElement | null = null;
    const { unmount } = render(<Checkbox aria-label="A" ref={objectRef} />);
    expect(objectRef.current).toBe(screen.getByRole("checkbox"));
    unmount();
    render(<Checkbox aria-label="B" ref={(node) => void (fromCallback = node)} />);
    expect(fromCallback).toBe(screen.getByRole("checkbox"));
  });
});
