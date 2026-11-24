import React from "react";
import classes from "./Slider.ios.module.scss";
import { buildClassName } from "/@/core/util";

/**
 * iOS anatomy of `Slider` (R/E2 "Slider / iOS", masters `Slider/iOS/Continuous`, `Slider/iOS/Stepped`,
 * `Slider/iOS/With Icons`): a thin native track, a glass lens that carries the value, optional tick marks
 * and min / max icons. Presentational only — state, pointer and keyboard live in `Slider`.
 */
export interface SliderIOSViewProps {
  /** Root props built by `Slider` (role, aria, handlers, ref, data attributes). */
  rootProps: React.ComponentProps<"div">;
  className?: string;
  style?: React.CSSProperties;
  /** Lens position along the track, 0–1. Stepped: index / (steps - 1). */
  pct: number;
  trackRef: React.Ref<HTMLDivElement>;
  lensWrapRef: React.Ref<HTMLDivElement>;
  steps: readonly number[] | null;
  index: number;
  formatStep?: (step: number) => React.ReactNode;
  showValue: boolean;
  formatted: React.ReactNode;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const SliderIOSView = ({
  rootProps,
  className,
  style,
  pct,
  trackRef,
  lensWrapRef,
  steps,
  index,
  formatStep,
  showValue,
  formatted,
  leadingIcon,
  trailingIcon,
}: SliderIOSViewProps) => (
  <div
    {...rootProps}
    className={buildClassName(classes.root, className)}
    data-stepped={steps ? "" : undefined}
    style={{ ...style, ["--_pct" as string]: pct }}
  >
    {leadingIcon && (
      <span className={classes.icon} data-slider-icon="leading" aria-hidden>
        {leadingIcon}
      </span>
    )}
    <div className={classes.body}>
      <div ref={trackRef} className={classes.track}>
        <span className={classes.rail} aria-hidden />
        <span className={classes.active} aria-hidden />
        <div ref={lensWrapRef} className={classes.lensWrap} aria-hidden>
          <span className={classes.under} />
          <span className={classes.lens}>{showValue && <span className={classes.lensValue}>{formatted}</span>}</span>
        </div>
      </div>
      {steps && (
        <>
          <div className={classes.ticks} aria-hidden>
            {steps.map((s, i) => (
              <span key={s} className={classes.tick} data-active={i <= index || undefined} />
            ))}
          </div>
          <div className={classes.tickLabels} aria-hidden>
            {steps.map((s, i) => (
              <span key={s} className={classes.tickLabel} data-current={i === index || undefined}>
                {formatStep ? formatStep(s) : s}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
    {trailingIcon && (
      <span className={classes.icon} data-slider-icon="trailing" aria-hidden>
        {trailingIcon}
      </span>
    )}
  </div>
);

export default SliderIOSView;
