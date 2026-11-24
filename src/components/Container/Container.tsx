import React from "react";
import classes from "./Container.module.scss";
import { AdaptiveValue } from "/@/core/types/AdaptiveDesign";
import { useAdaptiveValue } from "/@/hooks/media";
import { buildClassName } from "/@/core/util";

/** Black Glass surfaces. Elevation is a surface step plus a 1px rim; `glass` is only for chrome over content. */
export type ContainerVariant = "surface-0" | "surface-1" | "surface-2" | "surface-3" | "glass" | "tonal";
export type ContainerShape = "none" | "sm" | "md" | "lg" | "xl" | "full";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** Outer margin in 4px units (0.25rem). */
  margin?: AdaptiveValue<number>;
  /** Inner padding in 4px units (0.25rem). */
  padding?: AdaptiveValue<number>;
  variant?: ContainerVariant;
  /** 1px rim. `strong` uses rim/strong. */
  outline?: boolean | "strong";
  shapeStyle?: ContainerShape;
}

const variantClass: Record<ContainerVariant, string> = {
  "surface-0": classes.surface0,
  "surface-1": classes.surface1,
  "surface-2": classes.surface2,
  "surface-3": classes.surface3,
  glass: classes.glass,
  tonal: classes.tonal,
};

const shapeClass: Record<ContainerShape, string> = {
  none: classes.shapeNone,
  sm: classes.shapeSm,
  md: classes.shapeMd,
  lg: classes.shapeLg,
  xl: classes.shapeXl,
  full: classes.shapeFull,
};

const Container = ({
  margin = 0,
  padding = 4,
  variant = "surface-1",
  outline = false,
  shapeStyle = "lg",
  style,
  className,
  children,
  ...rest
}: ContainerProps) => {
  const marginValue = useAdaptiveValue(margin, 0);
  const paddingValue = useAdaptiveValue(padding, 4);

  return (
    <div
      style={{ margin: `${marginValue * 0.25}rem`, padding: `${paddingValue * 0.25}rem`, ...style }}
      className={buildClassName(
        classes.container,
        variantClass[variant],
        shapeClass[shapeStyle],
        outline === "strong" ? classes.outlineStrong : outline ? classes.outline : undefined,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Container;
