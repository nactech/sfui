import React from "react";
import { ChevronRight } from "lucide-react";
import classes from "./PageHeader.module.scss";
import { buildClassName } from "/@/core/util";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface PageHeaderCrumb {
  label: React.ReactNode;
  /** Link target. Crumbs without `href` (and the last crumb) render as plain text. */
  href?: string;
  /** Click handler for client-side routing (call `event.preventDefault()` to stop the navigation). */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * final.pen → H/A2 row 5 "Web wide — in-page header" (frame p6Vvp), master `Header/Web/Page`:
 * breadcrumbs, 28px title, description, real `Button`s on the right aligned to the bottom.
 */
export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  ref?: React.Ref<HTMLElement>;
  /** Trail above the title; the last crumb is the current page (`aria-current="page"`). */
  breadcrumbs?: PageHeaderCrumb[];
  /** Accessible name of the breadcrumb `<nav>`. Default `"Breadcrumb"`. */
  breadcrumbsLabel?: string;
  title: React.ReactNode;
  /** Heading level. Default `"h1"`. */
  titleAs?: HeadingTag;
  /** Muted line under the title. */
  description?: React.ReactNode;
  /**
   * Right-hand buttons, size `"s"` as drawn: `Button variant="ghost" iconOnly` (•••, usually a `Menu` trigger),
   * `Button variant="secondary"` (Share), `Button variant="primary"` (Export).
   */
  actions?: React.ReactNode;
}

const PageHeader = ({
  breadcrumbs,
  breadcrumbsLabel = "Breadcrumb",
  title,
  titleAs: TitleTag = "h1",
  description,
  actions,
  className,
  children,
  ...rest
}: PageHeaderProps) => (
  <header className={buildClassName(classes.root, className)} {...rest}>
    <div className={classes.main}>
      {breadcrumbs != null && breadcrumbs.length > 0 && (
        <nav aria-label={breadcrumbsLabel} className={classes.breadcrumbs}>
          <ol className={classes.trail}>
            {breadcrumbs.map((crumb, index) => {
              const current = index === breadcrumbs.length - 1;
              return (
                <li key={index} className={classes.crumb}>
                  {index > 0 && (
                    <span className={classes.separator} aria-hidden="true">
                      <ChevronRight />
                    </span>
                  )}
                  {crumb.href !== undefined && !current ? (
                    <a className={classes.crumbLink} href={crumb.href} onClick={crumb.onClick}>
                      {crumb.label}
                    </a>
                  ) : (
                    <span
                      className={buildClassName(classes.crumbText, current && classes.crumbCurrent)}
                      aria-current={current ? "page" : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      <TitleTag className={classes.title}>{title}</TitleTag>
      {description != null && <p className={classes.description}>{description}</p>}
    </div>
    {actions != null && <div className={classes.actions}>{actions}</div>}
    {children}
  </header>
);

export default PageHeader;
