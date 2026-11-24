import type React from "react";
import { buildClassName } from "@nactech/sfui";
import { photo as defaultPhoto } from "@site/lib/photos";
import styles from "./ui.module.scss";

export interface StageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `canvas` — the true-black surface/0 canvas. `photo` — a photo-like gradient, for glass over content. */
  backdrop?: "canvas" | "photo";
  /** Custom CSS background for `photo` (see lib/photos). */
  photo?: string;
  /** Minimum height in rem. */
  minHeight?: number;
  /** Let content start at the top instead of centring it. */
  align?: "center" | "start";
  /** Remove the inner padding. */
  flush?: boolean;
}

/** The backdrop every live example sits on. */
export function Stage({
  backdrop = "canvas",
  photo,
  minHeight,
  align = "center",
  flush,
  className,
  style,
  children,
  ...rest
}: StageProps) {
  return (
    <div
      className={buildClassName(styles.stage, className)}
      data-backdrop={backdrop}
      data-align={align}
      data-flush={flush ? "" : undefined}
      style={{
        ...(backdrop === "photo" ? { backgroundImage: photo ?? defaultPhoto } : null),
        ...(minHeight ? { minHeight: `${minHeight}rem` } : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
