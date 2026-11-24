import React, { useRef } from "react";
import { Check } from "lucide-react";
import classes from "./Segmented.module.scss";
import { buildClassName } from "/@/core/util";
import { useControllableState } from "/@/hooks/useControllableState";

export interface SegmentedOption {
  value: string;
  label: React.ReactNode;
  /** Optional leading icon (lucide-react). Replaced by the check while the segment is selected. */
  icon?: React.ReactNode;
  disabled?: boolean;
}

/** Height 32 / 40 / 48 — the design (`Segmented/Default`) draws 40 (`m`). */
export type SegmentedSize = "s" | "m" | "l";

/** final.pen → C/D "Expressive × Glass", master `Segmented/Default`: connected segments that morph on press. */
export interface SegmentedProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "dir"> {
  ref?: React.Ref<HTMLDivElement>;
  options: SegmentedOption[];
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Fires with the newly selected value (pointer, Space/Enter, arrow keys). */
  onValueChange?: (value: string) => void;
  /** Default `"m"`. */
  size?: SegmentedSize;
  /** Disables every segment. */
  disabled?: boolean;
  /** Over photos/video the segments switch to glass ("Over content → glass" row). */
  overContent?: boolean;
}

const sizeClass: Record<SegmentedSize, string> = {
  s: classes.sizeS,
  m: classes.sizeM,
  l: classes.sizeL,
};

const Segmented = ({
  ref,
  options,
  value,
  defaultValue,
  onValueChange,
  size = "m",
  disabled = false,
  overContent = false,
  className,
  onKeyDown,
  ...rest
}: SegmentedProps) => {
  const [selected, setSelected] = useControllableState<string | undefined>(value, defaultValue);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const isDisabled = (option: SegmentedOption) => disabled || Boolean(option.disabled);
  const enabledIndexes = options.flatMap((option, index) => (isDisabled(option) ? [] : [index]));
  const selectedIndex = options.findIndex((option) => option.value === selected);
  // Roving tab stop: the selected segment, or the first enabled one.
  const tabStop =
    selectedIndex >= 0 && !isDisabled(options[selectedIndex]) ? selectedIndex : (enabledIndexes[0] ?? -1);

  const select = (next: string) => {
    if (next === selected) return;
    setSelected(next);
    onValueChange?.(next);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || enabledIndexes.length === 0) return;
    const current = buttons.current.indexOf(event.target as HTMLButtonElement);
    if (current < 0) return;
    const position = enabledIndexes.indexOf(current);

    let target: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        target = enabledIndexes[(position + 1) % enabledIndexes.length];
        break;
      case "ArrowLeft":
      case "ArrowUp":
        target = enabledIndexes[(position - 1 + enabledIndexes.length) % enabledIndexes.length];
        break;
      case "Home":
        target = enabledIndexes[0];
        break;
      case "End":
        target = enabledIndexes[enabledIndexes.length - 1];
        break;
      default:
        return;
    }
    event.preventDefault();
    buttons.current[target]?.focus();
    select(options[target].value);
  };

  return (
    <div
      role="radiogroup"
      aria-disabled={disabled || undefined}
      {...rest}
      ref={ref}
      className={buildClassName(classes.root, sizeClass[size], className)}
      data-over-content={overContent ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      onKeyDown={handleKeyDown}
    >
      {options.map((option, index) => {
        const checked = option.value === selected;
        const lead = checked ? <Check /> : option.icon;
        return (
          <button
            key={option.value}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={isDisabled(option)}
            tabIndex={index === tabStop ? 0 : -1}
            className={classes.segment}
            data-state={checked ? "checked" : "unchecked"}
            data-position={
              options.length === 1 ? "only" : index === 0 ? "first" : index === options.length - 1 ? "last" : "middle"
            }
            onClick={() => select(option.value)}
          >
            <span className={classes.lead} data-visible={lead != null ? "" : undefined} aria-hidden="true">
              {lead}
            </span>
            <span className={classes.label}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Segmented;
