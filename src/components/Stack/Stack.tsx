import React from "react";
import classes from "./Stack.module.scss";
import { AdaptiveValue } from "/@/core/types/AdaptiveDesign";
import { useAdaptiveValue } from "/@/hooks/media";
import { buildClassName } from "/@/core/util";

type DirectionType = "row" | "column";
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode,
  spacing?: AdaptiveValue<number>,
  direction?: AdaptiveValue<DirectionType>
  divider?: React.ReactNode
}

const Stack = (props: StackProps) => {
  const {
    direction,
    spacing,
    style: userDefinedStyle,
    className: userDefinedClassName,
    children,
    ...cleanedProps
  } = props;

  const directionValue = useAdaptiveValue<DirectionType, DirectionType>(direction ?? "column", "column");
  const spacingValue = useAdaptiveValue<number, number>(spacing ?? 0, 0);
  // 1 spacing unit = 4px = 0.25rem
  const styles: React.CSSProperties = {
    flexDirection: directionValue,
    gap: `${spacingValue * 0.25}rem`
  };
  return (
    <div
      style={{...styles, ...userDefinedStyle}}
      className={buildClassName(classes.stack, userDefinedClassName)}
      {...cleanedProps}
    >
      {React.Children.map(children, (child, index) => (
        <React.Fragment key={index}>
          {child}
          {
            index !== React.Children.count(children) - 1 &&
            props.divider
          }
        </React.Fragment>
      ))}
    </div>
  );
};

export default Stack;
