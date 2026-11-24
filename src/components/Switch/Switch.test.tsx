import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Switch from "./Switch";

describe("Switch", () => {
  test("renders a native checkbox with the switch role, named by its label", () => {
    render(<Switch label="Wi-Fi" />);
    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    expect(control).toHaveAttribute("type", "checkbox");
    expect(control).not.toBeChecked();
  });

  test("uncontrolled: toggles on click and Space, reporting each change", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Wi-Fi" defaultChecked onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole("switch");
    expect(control).toBeChecked();

    await user.click(control);
    expect(control).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);

    await user.keyboard(" ");
    expect(control).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  test("clicking the label text toggles it", async () => {
    const user = userEvent.setup();
    render(<Switch label="Wi-Fi" />);
    await user.click(screen.getByText("Wi-Fi"));
    expect(screen.getByRole("switch")).toBeChecked();
  });

  test("controlled: follows the checked prop", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(<Switch aria-label="Wi-Fi" checked={false} onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole("switch");

    await user.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(control).not.toBeChecked(); // parent did not update

    rerender(<Switch aria-label="Wi-Fi" checked onCheckedChange={onCheckedChange} />);
    expect(control).toBeChecked();
  });

  test("controlled with state round-trip", async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [on, setOn] = useState(false);
      return <Switch label={on ? "On" : "Off"} checked={on} onCheckedChange={setOn} />;
    };
    render(<Harness />);
    await user.click(screen.getByRole("switch", { name: "Off" }));
    expect(screen.getByRole("switch", { name: "On" })).toBeChecked();
  });

  test("exposes state, over-content and disabled hooks for styling", () => {
    const { container } = render(<Switch aria-label="Wi-Fi" defaultChecked overContent disabled />);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("data-state", "checked");
    expect(root).toHaveAttribute("data-over-content");
    expect(root).toHaveAttribute("data-disabled");
  });

  test("disabled: not toggled, not focusable", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Wi-Fi" disabled onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole("switch");
    expect(control).toBeDisabled();
    await user.click(control);
    await user.tab();
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(control).not.toHaveFocus();
  });

  test("forwards ref and native props to the input; className to the root", () => {
    const ref = React.createRef<HTMLInputElement>();
    const { container } = render(<Switch ref={ref} name="wifi" aria-label="Wi-Fi" className="extra" />);
    expect(ref.current).toBe(screen.getByRole("switch"));
    expect(ref.current).toHaveAttribute("name", "wifi");
    expect(container.firstElementChild).toHaveClass("root", "extra");
  });
});
