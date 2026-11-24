import React, { useCallback, useId, useLayoutEffect, useMemo, useRef } from "react";
import classes from "./Radio.module.scss";
import { buildClassName } from "/@/core/util";
import { RadioGroupContext } from "./RadioContext";
import { useControllableState } from "/@/hooks/useControllableState";

export type RadioGroupOrientation = "vertical" | "horizontal";

export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "dir"> {
  ref?: React.Ref<HTMLDivElement>;
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Fires with the newly selected value (pointer, arrow keys, label click). */
  onValueChange?: (value: string) => void;
  /** Native `name` shared by every radio (form submission). Auto-generated when omitted. */
  name?: string;
  /** Disables every radio in the group. */
  disabled?: boolean;
  /** Layout only; arrow keys work in both directions either way. Default `"vertical"`. */
  orientation?: RadioGroupOrientation;
  children?: React.ReactNode;
}

const RadioGroup = ({
  ref,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled = false,
  orientation = "vertical",
  className,
  onKeyDown,
  children,
  ...rest
}: RadioGroupProps) => {
  const autoName = useId();
  const [selected, setSelected] = useControllableState<string | undefined>(value, defaultValue);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const select = useCallback(
    (next: string) => {
      if (next === selected) return;
      setSelected(next);
      onValueChange?.(next);
    },
    [selected, setSelected, onValueChange],
  );

  const context = useMemo(
    () => ({ name: name ?? autoName, value: selected, disabled, select }),
    [name, autoName, selected, disabled, select],
  );

  const enabledRadios = () =>
    Array.from(rootRef.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? []).filter(
      (input) => !input.disabled,
    );

  // Roving tab stop: only the checked radio (or the first enabled one) is in the Tab order.
  useLayoutEffect(() => {
    const radios = enabledRadios();
    const active = radios.find((input) => input.checked) ?? radios[0];
    for (const input of radios) input.tabIndex = input === active ? 0 : -1;
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const radios = enabledRadios();
    const index = radios.indexOf(event.target as HTMLInputElement);
    if (index < 0) return;

    let nextIndex: number;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        nextIndex = (index + 1) % radios.length;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        nextIndex = (index - 1 + radios.length) % radios.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = radios.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const next = radios[nextIndex];
    next.focus();
    if (!next.checked) next.click();
  };

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <RadioGroupContext.Provider value={context}>
      <div
        role="radiogroup"
        aria-disabled={disabled || undefined}
        aria-orientation={orientation}
        {...rest}
        ref={setRefs}
        data-orientation={orientation}
        className={buildClassName(classes.group, className)}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

export default RadioGroup;
