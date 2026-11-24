import type React from "react";
import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button, Scrubber, formatPlaybackTime, type ScrubberProps } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";
import { Column } from "../shared";

const CLIP = 2.4;
const TRACK = 184;
const seconds = (t: number) => `${t.toFixed(1)} s`;

/** Fake media clock: advances while playing, follows seeks. Also used by the home page hero. */
export function usePlayback(duration: number, initial: number, autoplay: boolean) {
  const [time, setTime] = useState(initial);
  const [playing, setPlaying] = useState(autoplay);
  const [scrubbing, setScrubbing] = useState(false);
  useEffect(() => {
    if (!playing || scrubbing) return;
    let last = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const dt = (now - last) / 1000;
      last = now;
      setTime((t) => (t + dt >= duration ? 0 : t + dt));
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [playing, scrubbing, duration]);
  return {
    playing,
    setPlaying,
    scrubberProps: {
      currentTime: time,
      playing,
      onSeek: setTime,
      onSeekStart: () => setScrubbing(true),
      onSeekEnd: () => setScrubbing(false),
    },
  };
}

const barStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  width: "100%",
  boxSizing: "border-box",
  height: "3.75rem",
  padding: "0 1rem 0 0.625rem",
  borderRadius: "1.875rem",
  border: "1px solid var(--sf-glass-rim)",
  background: "var(--sf-glass-fill)",
  boxShadow: "inset 0 1px 0 var(--sf-glass-highlight-soft)",
  backdropFilter: "blur(var(--sf-glass-blur))",
  WebkitBackdropFilter: "blur(var(--sf-glass-blur))",
};

const timeStyle: React.CSSProperties = {
  flexShrink: 0,
  font: "400 0.75rem var(--sf-font-mono)",
  fontVariantNumeric: "tabular-nums",
  color: "var(--sf-fg-muted)",
};

interface PlayerBarProps {
  duration: number;
  initial: number;
  format: (t: number) => string;
  buffered?: number;
  disabled?: boolean;
  autoplay?: boolean;
  keyboardStep?: number;
  label?: string;
}

/** The player bar is composition: a play button, the Scrubber and the length. Not part of the component. */
function PlayerBar({ duration, initial, format, buffered, disabled, autoplay = true, keyboardStep, label }: PlayerBarProps) {
  const { playing, setPlaying, scrubberProps } = usePlayback(duration, initial, autoplay && !disabled);
  return (
    <div style={barStyle}>
      <Button iconOnly aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)} disabled={disabled}>
        {playing ? <Pause /> : <Play />}
      </Button>
      <Scrubber
        {...scrubberProps}
        duration={duration}
        buffered={buffered}
        formatTime={format}
        keyboardStep={keyboardStep}
        label={label}
        disabled={disabled}
        style={{ flex: "1 1 0", minWidth: 0 }}
      />
      <span style={timeStyle}>{format(duration)}</span>
    </div>
  );
}

/** A scrubber that follows seeks but never plays (gallery states). */
function StillScrubber({ initial, ...props }: Omit<ScrubberProps, "currentTime" | "onSeek"> & { initial: number }) {
  const [time, setTime] = useState(initial);
  return <Scrubber {...props} currentTime={time} onSeek={setTime} />;
}

/** A still scrubber with the time beside it, so the format is visible at rest (do / don't). */
function TimedScrubber({ initial, duration, format, label }: { initial: number; duration: number; format: (t: number) => string; label: string }) {
  const [time, setTime] = useState(initial);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%" }}>
      <Scrubber currentTime={time} onSeek={setTime} duration={duration} formatTime={format} keyboardStep={0.2} label={label} style={{ flex: "1 1 0", minWidth: 0 }} />
      <span style={timeStyle}>
        {format(time)} / {format(duration)}
      </span>
    </div>
  );
}

function Demo({ values }: DemoProps) {
  const clip = values.media === "clip";
  return (
    <div style={{ width: "min(28rem, 100%)" }}>
      <PlayerBar
        key={`${values.media}-${values.disabled}`}
        duration={clip ? CLIP : TRACK}
        initial={clip ? 1.2 : 72}
        format={clip ? seconds : formatPlaybackTime}
        keyboardStep={clip ? 0.2 : 5}
        buffered={values.buffered ? (clip ? 1.8 : 150) : undefined}
        disabled={Boolean(values.disabled)}
        label={clip ? "Seek Mr. Chilly" : "Seek track"}
      />
    </div>
  );
}

function Preview() {
  return (
    <div style={{ width: "22rem" }}>
      <PlayerBar duration={CLIP} initial={1.2} format={seconds} buffered={1.8} autoplay={false} />
    </div>
  );
}

function PlatformDemo() {
  return (
    <div style={{ width: "min(24rem, 100%)" }}>
      <PlayerBar duration={CLIP} initial={0.8} format={seconds} buffered={1.8} keyboardStep={0.2} label="Seek Mr. Chilly" />
    </div>
  );
}

const W = "min(24rem, 100%)";

const scrubber: ComponentDoc = {
  slug: "scrubber",
  name: "Scrubber",
  group: "Inputs",
  summary: "Seek through media: a wave while playing, a lens with the time while scrubbing.",
  docStatus: "complete",
  status: "stable",
  exports: ["Scrubber", "formatPlaybackTime"],
  platformSplit: "shared",
  stage: "photo",
  Demo,
  Preview,
  controls: [
    { type: "enum", name: "media", label: "Media", options: ["clip", "track"], default: "clip" },
    { type: "boolean", name: "buffered", label: "Buffered range", default: true },
    { type: "boolean", name: "disabled", label: "Disabled", default: false },
  ],
  code: (v) => {
    const clip = v.media === "clip";
    const attrs = [
      "duration={media.duration}",
      "currentTime={time}",
      v.buffered && "buffered={bufferedEnd}",
      "playing={playing}",
      "onSeek={(t) => (media.currentTime = t)}",
      "onSeekStart={() => media.pause()}",
      "onSeekEnd={() => playing && media.play()}",
      clip && "formatTime={(t) => `${t.toFixed(1)} s`}",
      clip && "keyboardStep={0.2}",
      `label="${clip ? "Seek Mr. Chilly" : "Seek track"}"`,
      v.disabled && "disabled",
    ].filter(Boolean);
    return `import { Scrubber } from "@nactech/sfui";\n\n<Scrubber\n  ${attrs.join("\n  ")}\n/>`;
  },

  overview: {
    intro: (
      <>
        The scrubber shows where playback is and lets people seek. It stays quiet while media plays — the played part
        waves gently and the playhead is a slim capsule — and only while you drag does a glass lens grow out of the
        playhead, magnify the track and show the time. It is fully controlled: your media element drives{" "}
        <code>currentTime</code> and the scrubber reports seeks back. The player bar around it is your composition.
      </>
    ),
    whenToUse: [
      "Seeking in video, audio and animation previews: a sticker clip, a track, a screen recording.",
      "Showing playback progress and the buffered range of streamed media.",
      "Inside a glass player bar over the media, next to play / pause and the length.",
    ],
    whenNotToUse: [
      "Setting a value (volume, speed, frame rate) — use Slider.",
      "Progress of a task (export, upload) that people cannot seek — use a progress indicator.",
      "Picking a frame or a range for trimming — that needs a timeline with thumbnails and handles.",
    ],
  },

  variants: [
    {
      name: "Playing",
      description: "The played part waves toward the playhead; the capsule sits on the track. Drag it to see the lens.",
      render: () => (
        <Column width={W}>
          <StillScrubber initial={112} duration={TRACK} buffered={150} playing label="Seek track" />
        </Column>
      ),
    },
    {
      name: "Paused",
      description: "A flat accent line — the wave cross-fades out when playback stops.",
      render: () => (
        <Column width={W}>
          <StillScrubber initial={112} duration={TRACK} buffered={150} label="Seek track" />
        </Column>
      ),
    },
    {
      name: "Buffered",
      description: "`buffered` draws the loaded range ahead of the playhead in a lighter tone.",
      render: () => (
        <Column width={W}>
          <StillScrubber initial={40} duration={TRACK} buffered={120} label="Seek track" />
        </Column>
      ),
    },
    {
      name: "Short clip",
      description: "`formatTime` for sub-minute media: the lens shows “1.6 s” instead of “0:01”.",
      render: () => (
        <Column width={W}>
          <StillScrubber initial={1.6} duration={CLIP} buffered={2} formatTime={seconds} keyboardStep={0.2} label="Seek Mr. Chilly" />
        </Column>
      ),
    },
    {
      name: "In a player bar",
      description: "Composition over content: glass bar, play button, Scrubber, length.",
      stage: "photo",
      render: () => (
        <Column width={W}>
          <PlayerBar duration={CLIP} initial={1.2} format={seconds} buffered={1.8} keyboardStep={0.2} label="Seek Mr. Chilly" />
        </Column>
      ),
    },
    {
      name: "Disabled",
      description: "Opaque disabled tokens; no wave, no seeking.",
      render: () => (
        <Column width={W}>
          <Scrubber currentTime={112} duration={TRACK} buffered={150} playing disabled label="Seek track" />
        </Column>
      ),
    },
  ],

  platforms: {
    intro: (
      <>
        Scrubber is shared: one implementation on iOS, Android and the web. The lens is the same Liquid-Glass lens as the
        iOS slider, and the gesture is the same everywhere — press anywhere on the track to jump, drag to scrub.
      </>
    ),
    Demo: PlatformDemo,
  },

  usage: {
    guidelines: [
      "Drive `currentTime` from the media element (`timeupdate` or a frame loop) and set `media.currentTime` in `onSeek`.",
      "While scrubbing the scrubber shows its own time and ignores `currentTime`, so the playhead never fights the finger. Pause in `onSeekStart` and resume in `onSeekEnd` if playback should follow.",
      "Pass `playing` so the wave tells people the media is running; it flattens while scrubbing and when paused.",
      "Match `formatTime` and `keyboardStep` to the length: seconds with a decimal and 0.1–0.5 s steps for clips, `m:ss` and 5 s for tracks.",
      "Name it after what it seeks (“Seek Mr. Chilly”) when there is more than one player on screen.",
      "Leave at least 10rem for the track; the lens needs room to show the time.",
    ],
    dos: [
      {
        kind: "do",
        title: "Format time for the media length",
        caption: "A 2.4 s sticker reads in tenths of a second.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <TimedScrubber initial={1.6} duration={CLIP} format={seconds} label="Seek Mr. Chilly" />
          </Column>
        ),
      },
      {
        kind: "dont",
        title: "Don’t use minutes for a short clip",
        caption: "“0:01 / 0:02” — the lens says the same for most of the clip.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <TimedScrubber initial={1.6} duration={CLIP} format={formatPlaybackTime} label="Seek Mr. Chilly" />
          </Column>
        ),
      },
      {
        kind: "do",
        title: "Compose it into a player bar",
        caption: "Play / pause, the scrubber and the length together.",
        stage: "photo",
        render: () => (
          <Column width="min(20rem, 100%)">
            <PlayerBar duration={CLIP} initial={0.6} format={seconds} keyboardStep={0.2} autoplay={false} label="Seek Mr. Chilly" />
          </Column>
        ),
      },
      {
        kind: "dont",
        title: "Don’t use it as a value slider",
        caption: "“Volume” in a seek bar announces “0:40 of 1:40”. Use Slider.",
        render: () => (
          <Column width="min(20rem, 100%)">
            <StillScrubber initial={40} duration={100} label="Volume" />
          </Column>
        ),
      },
    ],
    writing: [
      "`label` names what is seeked: “Seek”, or “Seek Mr. Chilly” when several players share a screen.",
      "Time text is compact and unit-consistent: `1:52`, `1:02:05`, `1.6 s`. It is also the spoken value, so keep it readable.",
      "Show the total length next to the bar in the same format as the lens.",
    ],
  },

  accessibility: {
    intro: (
      <>
        The scrubber is one focusable element with <code>role="slider"</code>. Its value is the playback position in
        seconds, and <code>aria-valuetext</code> reads the time the way it is shown — “1.6 s of 2.4 s”.
      </>
    ),
    roles: [
      { element: "Root", role: "slider", notes: "`tabindex=\"0\"`, `aria-orientation=\"horizontal\"`, `aria-label` from `label` (“Seek”)." },
      { element: "Value", role: "aria-valuemin / aria-valuemax / aria-valuenow", notes: "0 to the duration, rounded to whole seconds." },
      { element: "Value text", role: "aria-valuetext", notes: "`${formatTime(time)} of ${formatTime(duration)}`." },
      { element: "Disabled", role: "aria-disabled=\"true\"", notes: "Removed from the tab order." },
      { element: "Wave, track, capsule, lens", role: "aria-hidden", notes: "Decorative; the time is on the root." },
    ],
    keyboard: [
      { keys: ["←", "↓"], action: "Back by `keyboardStep` (5 s by default)." },
      { keys: ["→", "↑"], action: "Forward by `keyboardStep`." },
      { keys: ["Page Down", "Page Up"], action: "Back / forward by a tenth of the duration (at least `keyboardStep`)." },
      { keys: ["Home", "End"], action: "Start / end." },
    ],
    focus: [
      "Keyboard focus draws a 2px ring on the capsule playhead (`:focus-visible` only).",
      "Pressing the track focuses the scrubber, so arrow keys work right after a click or tap.",
      "Keyboard seeks call `onSeek` only; `onSeekStart` / `onSeekEnd` belong to pointer scrubbing.",
    ],
    reducedMotion: [
      "The wave stops flowing — it holds still while playing.",
      "The lens appears without its spring, and the wave / line cross-fade is instant.",
    ],
    screenReader: [
      "`aria-valuenow` is whole seconds; for short clips the formatted `aria-valuetext` carries the precision.",
      "Playback progress is not announced live — screen readers read the time when the scrubber is focused, not every frame.",
    ],
  },

  api: [
    {
      component: "Scrubber",
      description: "Controlled by your media element.",
      props: [
        { name: "duration", type: "number", required: true, description: "Total length in seconds. Non-finite or ≤ 0 is treated as 0." },
        { name: "currentTime", type: "number", required: true, description: "Playback position in seconds. Ignored while the user scrubs." },
        { name: "buffered", type: "number", description: "Buffered up to (seconds), drawn ahead of the playhead." },
        { name: "playing", type: "boolean", default: "false", description: "The played part waves (not while scrubbing or disabled)." },
        { name: "onSeek", type: "(time: number) => void", description: "Every move while scrubbing, and keyboard seeks." },
        { name: "onSeekStart", type: "(time: number) => void", description: "Pointer scrubbing started (time under the pointer)." },
        { name: "onSeekEnd", type: "(time: number) => void", description: "Pointer scrubbing ended (final time)." },
        { name: "formatTime", type: "(seconds: number) => string", default: "formatPlaybackTime", description: "Lens text and `aria-valuetext`." },
        { name: "label", type: "string", default: '"Seek"', description: "Accessible name." },
        { name: "keyboardStep", type: "number", default: "5", description: "Arrow-key seek in seconds." },
        { name: "disabled", type: "boolean", default: "false", description: "Opaque disabled look; no seeking, no wave, out of the tab order." },
        { name: "ref", type: "Ref<HTMLDivElement>", description: "The `role=\"slider\"` root." },
      ],
      extends: "Also accepts native <div> attributes (className, style, aria-*, pointer and key handlers), applied to the root.",
    },
    {
      component: "formatPlaybackTime",
      description: "The default time format, exported for the length label next to the bar.",
      props: [
        { name: "(seconds: number) => string", type: "function", description: "`m:ss`, or `h:mm:ss` from an hour. Floors to whole seconds; negative or non-finite input gives `0:00`." },
      ],
    },
  ],

  storybook: {
    title: "Components/Scrubber",
    stories: [
      { name: "Default", export: "Default" },
      { name: "Matrix", export: "Matrix" },
      { name: "Seconds format", export: "SecondsFormat" },
      { name: "Player bar", export: "PlayerBar" },
    ],
  },
  related: ["slider", "button"],
};

export default scrubber;
