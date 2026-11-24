import React, { useCallback, useLayoutEffect, useRef, useState } from "react";

/** `error` is "set" for `true` and for any non-empty node; `false`, `null`, `undefined` and `""` clear it. */
export function hasError(error: React.ReactNode): boolean {
  return error !== undefined && error !== null && error !== false && error !== "";
}

/** The message to show under the field: the error node when it is one, otherwise the helper text. */
export function helperMessage(error: React.ReactNode, helperText: React.ReactNode): React.ReactNode {
  if (hasError(error) && error !== true) return error;
  return helperText;
}

/**
 * Tracks the text of an input that may be controlled (`value`) or uncontrolled (`defaultValue`).
 * Uncontrolled inputs keep their native `defaultValue`; we only mirror the text so the label, the counter
 * and the clear button can react to it.
 */
export function useTextValue(value: string | undefined, defaultValue: string | undefined) {
  const controlled = value !== undefined;
  const [mirror, setMirror] = useState(defaultValue ?? "");
  const current = controlled ? value : mirror;
  const track = useCallback(
    (next: string) => {
      if (!controlled) setMirror(next);
    },
    [controlled],
  );
  return { controlled, current, track };
}

/** Combines an internal ref with the consumer's `ref` prop (React 19: `ref` is a regular prop). */
export function useMergedRef<T>(external: React.Ref<T> | undefined) {
  const inner = useRef<T | null>(null);
  const setRef = useCallback(
    (node: T | null) => {
      inner.current = node;
      if (typeof external === "function") external(node);
      else if (external) (external as React.RefObject<T | null>).current = node;
    },
    [external],
  );
  return [inner, setRef] as const;
}

/** Grows a textarea with its content (height in rem, never below its `rows`). */
export function useAutoGrow(ref: React.RefObject<HTMLTextAreaElement | null>, enabled: boolean, text: string) {
  const resize = useCallback(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    el.style.height = "auto";
    if (el.scrollHeight > 0) el.style.height = `${el.scrollHeight / 16}rem`;
  }, [ref, enabled]);

  useLayoutEffect(() => {
    if (enabled) resize();
    else if (ref.current) ref.current.style.height = "";
  }, [enabled, text, resize, ref]);

  return resize;
}

/** Joins the ids that describe a control, skipping empty ones. */
export function describedBy(...ids: (string | false | null | undefined)[]): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined || undefined;
}
