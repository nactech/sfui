import React from "react";
import classes from "./Scrubber.module.scss";
import { buildClassName } from "/@/core/util";

export interface ScrubberProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "children" | "onSeeked"> {
  ref?: React.Ref<HTMLDivElement>;
  /** Total length in seconds. */
  duration: number;
  /** Playback position in seconds (driven by the media element). */
  currentTime: number;
  /** Buffered up to (seconds). Drawn ahead of the playhead. */
  buffered?: number;
  /** The played part waves while playing (not while scrubbing, not with reduced motion). */
  playing?: boolean;
  /** Fires while scrubbing (every move) and on keyboard seeks. */
  onSeek?: (time: number) => void;
  /** Pointer scrubbing started. */
  onSeekStart?: (time: number) => void;
  /** Pointer scrubbing ended (final time). */
  onSeekEnd?: (time: number) => void;
  disabled?: boolean;
  /** Time text in the lens and in `aria-valuetext`. Default `m:ss` (`h:mm:ss` past an hour). */
  formatTime?: (seconds: number) => string;
  /** Accessible name. Default "Seek". */
  label?: string;
  /** Arrow-key seek in seconds. Default 5. */
  keyboardStep?: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const formatPlaybackTime = (seconds: number) => {
  const total = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
};

// One wave period = 36 design px (10 periods across the 364px track in P/A2), amplitude ≈ 2.85.
// Units map 1:1 to design px because the SVG is sized in rem with the same width/16.
const WAVE_PERIOD = 36;
const WAVE_LENGTH = 4096;
const WAVE_PATH = `M0 7q${WAVE_PERIOD / 4} -5.7 ${WAVE_PERIOD / 2} 0${` t${WAVE_PERIOD / 2} 0`.repeat(
  Math.ceil(WAVE_LENGTH / (WAVE_PERIOD / 2)),
)}`;

const Scrubber = ({
  ref,
  duration,
  currentTime,
  buffered,
  playing = false,
  onSeek,
  onSeekStart,
  onSeekEnd,
  disabled = false,
  formatTime = formatPlaybackTime,
  label = "Seek",
  keyboardStep = 5,
  className,
  style,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...rest
}: ScrubberProps) => {
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const [scrubTime, setScrubTime] = React.useState<number | null>(null);
  const scrubbing = scrubTime !== null;
  const time = clamp(scrubbing ? scrubTime : currentTime, 0, safeDuration);

  const playheadRef = React.useRef<HTMLDivElement | null>(null);
  const lastSeek = React.useRef<number | null>(null);

  const timeFromX = (el: HTMLElement, clientX: number) => {
    const rect = el.getBoundingClientRect();
    const head = playheadRef.current?.offsetWidth ?? 0;
    const usable = rect.width - head;
    const p = usable > 0 ? (clientX - rect.left - head / 2) / usable : 0;
    return clamp(p, 0, 1) * safeDuration;
  };

  const seek = (t: number) => {
    if (t === lastSeek.current) return;
    lastSeek.current = t;
    onSeek?.(t);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(e);
    if (e.defaultPrevented || disabled || (e.pointerType === "mouse" && e.button !== 0)) return;
    const el = e.currentTarget;
    e.preventDefault();
    el.focus({ preventScroll: true });
    try {
      el.setPointerCapture?.(e.pointerId);
    } catch {
      // Synthetic / already-released pointer: dragging still works while over the element.
    }
    const t = timeFromX(el, e.clientX);
    lastSeek.current = null;
    setScrubTime(t);
    onSeekStart?.(t);
    seek(t);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    if (!scrubbing || disabled) return;
    const t = timeFromX(e.currentTarget, e.clientX);
    setScrubTime(t);
    seek(t);
  };

  const endScrub = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrubbing) return;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    const t = scrubTime;
    setScrubTime(null);
    onSeekEnd?.(t);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerUp?.(e);
    endScrub(e);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerCancel?.(e);
    endScrub(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || disabled) return;
    const page = Math.max(keyboardStep, safeDuration / 10);
    let next: number | undefined;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = time + keyboardStep;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = time - keyboardStep;
        break;
      case "PageUp":
        next = time + page;
        break;
      case "PageDown":
        next = time - page;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = safeDuration;
        break;
    }
    if (next === undefined) return;
    e.preventDefault();
    next = clamp(next, 0, safeDuration);
    if (next !== time) onSeek?.(next);
  };

  const pct = safeDuration > 0 ? time / safeDuration : 0;
  const bufferedPct = safeDuration > 0 && buffered !== undefined ? clamp(buffered / safeDuration, 0, 1) : 0;
  // Buffered segment, as a fraction of the rest track (playhead → end).
  const bufferedOfRest = pct < 1 ? clamp((bufferedPct - pct) / (1 - pct), 0, 1) : 0;
  const waving = playing && !scrubbing && !disabled;

  return (
    <div
      {...rest}
      ref={ref}
      role="slider"
      tabIndex={disabled ? undefined : 0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(safeDuration)}
      aria-valuenow={Math.round(time)}
      aria-valuetext={`${formatTime(time)} of ${formatTime(safeDuration)}`}
      aria-orientation="horizontal"
      aria-disabled={disabled || undefined}
      data-state={scrubbing ? "scrubbing" : playing ? "playing" : "paused"}
      data-waving={waving || undefined}
      className={buildClassName(classes.scrubber, className)}
      style={{
        ...style,
        ["--_pct" as string]: pct,
        ["--_buffered" as string]: bufferedOfRest,
      }}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div className={classes.played} aria-hidden>
        <span className={classes.line} />
        <svg
          className={classes.wave}
          viewBox={`0 0 ${WAVE_LENGTH} 14`}
          preserveAspectRatio="xMinYMid meet"
          focusable="false"
        >
          <path d={WAVE_PATH} />
        </svg>
      </div>
      <div className={classes.rest} aria-hidden>
        <span className={classes.buffered} />
      </div>
      <div ref={playheadRef} className={classes.playhead} aria-hidden>
        <span className={classes.capsule} />
      </div>
      <div
        className={classes.under}
        data-buffered={bufferedPct > pct || undefined}
        aria-hidden
      />
      <div className={classes.lens} aria-hidden>
        <span className={classes.lensValue}>{formatTime(time)}</span>
      </div>
    </div>
  );
};

export default Scrubber;
