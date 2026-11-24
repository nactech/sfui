import { useCallback, useState } from "react";

/**
 * Controlled + uncontrolled state for selection controls (Switch, Checkbox, RadioGroup, Segmented).
 * When `value` is defined the component is controlled; otherwise it keeps its own state seeded by `defaultValue`.
 * `onChange` fires for every user-initiated change in both modes.
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [inner, setInner] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;

  const set = useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  return [current, set];
}
