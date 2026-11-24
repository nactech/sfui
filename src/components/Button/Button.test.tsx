import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Download, Play } from "lucide-react";

import Button from "./Button";

describe("Button", () => {
  test("renders a native button with its label, defaulting to primary / m / type=button", () => {
    render(<Button>Export</Button>);
    const button = screen.getByRole("button", { name: "Export" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-variant", "primary");
    expect(button).toHaveAttribute("data-size", "m");
    expect(button).toHaveClass("primary", "sizeM");
  });

  test.each(["primary", "tonal", "secondary", "ghost", "danger"] as const)("applies the %s variant", (variant) => {
    render(<Button variant={variant}>Export</Button>);
    expect(screen.getByRole("button")).toHaveClass(variant);
  });

  test.each([
    ["s", "sizeS"],
    ["m", "sizeM"],
    ["l", "sizeL"],
  ] as const)("applies size %s", (size, cls) => {
    render(<Button size={size}>Export</Button>);
    expect(screen.getByRole("button")).toHaveClass(cls);
  });

  test("renders leading and trailing icons hidden from assistive tech", () => {
    render(
      <Button leadingIcon={<Download data-testid="lead" />} trailingIcon={<Play data-testid="trail" />}>
        Export
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Export" });
    const lead = screen.getByTestId("lead");
    const trail = screen.getByTestId("trail");
    expect(lead.closest("[aria-hidden='true']")).not.toBeNull();
    expect(trail.closest("[aria-hidden='true']")).not.toBeNull();
    // Order: icon, label, icon.
    expect(button.firstElementChild).toContainElement(lead);
    expect(button.lastElementChild).toContainElement(trail);
  });

  test("iconOnly renders a circular button named by aria-label", () => {
    render(<Button iconOnly aria-label="Play" leadingIcon={<Play data-testid="icon" />} />);
    const button = screen.getByRole("button", { name: "Play" });
    expect(button).toHaveClass("iconOnly");
    expect(button).toContainElement(screen.getByTestId("icon"));
  });

  test("iconOnly also accepts the icon as children", () => {
    render(
      <Button iconOnly aria-label="Play">
        <Play data-testid="icon" />
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Play" })).toContainElement(screen.getByTestId("icon"));
  });

  test("fullWidth, className and style are merged on the root", () => {
    render(
      <Button fullWidth className="extra" style={{ marginTop: "1rem" }}>
        Export
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("button", "fullWidth", "extra");
    expect(button.style.marginTop).toBe("1rem");
  });

  test("fires onClick on pointer and keyboard activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Export</Button>);
    const button = screen.getByRole("button");
    await user.tab();
    expect(button).toHaveFocus();
    await user.click(button);
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  test("disabled buttons are not focusable or clickable", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Export
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    await user.click(button);
    await user.tab();
    expect(onClick).not.toHaveBeenCalled();
    expect(button).not.toHaveFocus();
  });

  test("forwards ref and native props", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <form>
        <Button ref={ref} type="submit" name="action" value="export">
          Export
        </Button>
      </form>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveAttribute("type", "submit");
    expect(ref.current).toHaveAttribute("name", "action");
  });
});
