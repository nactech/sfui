import React, { useCallback, useId, useMemo, useState } from "react";
import classes from "./List.module.scss";
import { ListContext, type ListContextValue, type ListVariant } from "./ListContext";
import { buildClassName } from "/@/core/util";
import { useControllableState } from "/@/hooks/useControllableState";

/**
 * final.pen → design group `list/`, masters `List/{Segmented|Flat on canvas|Inset group}/{Media|Status|Control|Action|Two-line}`,
 * frames L/A1–A5, L/B1–B5, L/C1–C5 (Rest, Pressed, Selected, Disabled, Swipe).
 */
export interface ListProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  ref?: React.Ref<HTMLElement>;
  /**
   * `segmented` — every row is its own surface/1 cell with 2px gaps, the group clips outer corners to 22 (mail feeds).
   * `flat` — rows sit on the canvas with full-width hairlines and mono meta (content/media).
   * `inset` — rows inside one surface/1 group, hairlines inset after the media (settings). Default.
   */
  variant?: ListVariant;
  /** Large section title ("Recent", 22/700). Labels the section. */
  title?: React.ReactNode;
  /** Heading level of `title`. Default 2. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Trailing header action, usually a `ListAction` ("See All", 17 accent). */
  action?: React.ReactNode;
  /** Edit mode: rows with a `value` get a leading selection circle, chevrons hide, swipe is disabled. */
  selectable?: boolean;
  /** Controlled selection (values of the selected rows). */
  selectedValues?: string[];
  /** Initial selection when uncontrolled. */
  defaultSelectedValues?: string[];
  /** Fires with the next selection on every toggle (click/Space). */
  onSelectedValuesChange?: (values: string[]) => void;
  /** Accessible name for the list when there is no `title`. */
  listLabel?: string;
  children?: React.ReactNode;
}

const EMPTY: string[] = [];

const variantClass: Record<ListVariant, string> = {
  segmented: classes.segmented,
  flat: classes.flat,
  inset: classes.inset,
};

const List = ({
  variant = "inset",
  title,
  headingLevel = 2,
  action,
  selectable = false,
  selectedValues,
  defaultSelectedValues = EMPTY,
  onSelectedValuesChange,
  listLabel,
  className,
  children,
  ...rest
}: ListProps) => {
  const headingId = useId();
  const [selected, setSelected] = useControllableState(selectedValues, defaultSelectedValues, onSelectedValuesChange);
  const [openSwipe, setOpenSwipe] = useState<string | null>(null);

  const isSelected = useCallback((value: string) => selected.includes(value), [selected]);
  const toggle = useCallback(
    (value: string) => setSelected(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]),
    [selected, setSelected],
  );

  const context = useMemo<ListContextValue>(
    () => ({ variant, selectable, isSelected, toggle, openSwipe: selectable ? null : openSwipe, setOpenSwipe }),
    [variant, selectable, isSelected, toggle, openSwipe],
  );

  const Heading = `h${headingLevel}` as const;
  const hasHeader = title != null || action != null;

  return (
    <section
      aria-labelledby={title != null ? headingId : undefined}
      data-variant={variant}
      data-selectable={selectable ? "" : undefined}
      className={buildClassName(classes.list, variantClass[variant], className)}
      {...rest}
    >
      {hasHeader && (
        <div className={classes.header}>
          {title != null && (
            <Heading id={headingId} className={classes.heading}>
              {title}
            </Heading>
          )}
          {action != null && <div className={classes.headerAction}>{action}</div>}
        </div>
      )}
      <ListContext.Provider value={context}>
        <ul
          role="list"
          className={classes.group}
          aria-labelledby={title != null && listLabel == null ? headingId : undefined}
          aria-label={listLabel}
        >
          {children}
        </ul>
      </ListContext.Provider>
    </section>
  );
};

export default List;
