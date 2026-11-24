import React, { useId, useMemo } from "react";
import classes from "./InsetForm.module.scss";
import { InsetFormContext } from "./InsetFormContext";
import { buildClassName } from "/@/core/util";

export interface InsetFormProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  ref?: React.Ref<HTMLDivElement>;
  /** Optional group header above the rows; names the group (`aria-labelledby`). */
  title?: React.ReactNode;
  /** Optional note under the rows; describes the group (`aria-describedby`). */
  footer?: React.ReactNode;
  /** Disables every row inside. */
  disabled?: boolean;
  /** Rows: `InsetFormRow`, `InsetFormSelectRow`, `InsetFormTextAreaRow`. */
  children?: React.ReactNode;
}

/**
 * Inset Form — settings-style group (Apple form grammar): rows on surface/1 separated by hairlines, with an
 * optional header and footer. Native props go to the outer wrapper; the rows sit in a `role="group"`.
 */
const InsetForm = ({
  ref,
  title,
  footer,
  disabled = false,
  className,
  children,
  "aria-label": ariaLabel,
  ...rest
}: InsetFormProps) => {
  const autoId = useId();
  const titleId = `${autoId}-title`;
  const footerId = `${autoId}-footer`;
  const ctx = useMemo(() => ({ disabled }), [disabled]);

  return (
    <div ref={ref} className={buildClassName(classes.form, className)} data-disabled={disabled || undefined} {...rest}>
      {title != null && (
        <div className={classes.title} id={titleId}>
          {title}
        </div>
      )}
      <div
        role="group"
        className={classes.group}
        aria-label={ariaLabel}
        aria-labelledby={title != null && !ariaLabel ? titleId : undefined}
        aria-describedby={footer != null ? footerId : undefined}
        aria-disabled={disabled || undefined}
      >
        <InsetFormContext.Provider value={ctx}>{children}</InsetFormContext.Provider>
      </div>
      {footer != null && (
        <div className={classes.footer} id={footerId}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default InsetForm;
