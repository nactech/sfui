import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button, Scrubber } from "@nactech/sfui";
import type { ComponentDoc, DemoProps } from "../types";

const DURATION = 2.4;
const seconds = (t: number) => `${t.toFixed(1)} s`;

/** Fake media clock: advances while playing, follows seeks. */
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

function Demo({ values }: DemoProps) {
  const { playing, setPlaying, scrubberProps } = usePlayback(DURATION, 1.2, true);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        width: "min(28rem, 100%)",
        height: "3.75rem",
        padding: "0 1rem 0 0.625rem",
        borderRadius: "1.875rem",
        border: "1px solid var(--sf-glass-rim)",
        background: "var(--sf-glass-fill)",
        backdropFilter: "blur(var(--sf-glass-blur))",
        WebkitBackdropFilter: "blur(var(--sf-glass-blur))",
      }}
    >
      <Button iconOnly aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)} disabled={Boolean(values.disabled)}>
        {playing ? <Pause /> : <Play />}
      </Button>
      <Scrubber
        {...scrubberProps}
        duration={DURATION}
        buffered={1.8}
        formatTime={seconds}
        disabled={Boolean(values.disabled)}
        style={{ flex: "1 1 0", minWidth: 0 }}
      />
      <span style={{ font: "400 0.75rem var(--sf-font-mono)", color: "var(--sf-fg-muted)" }}>{DURATION.toFixed(1)}</span>
    </div>
  );
}

// TODO(docs): Usage, Accessibility and a variants gallery.
const scrubber: ComponentDoc = {
  slug: "scrubber",
  name: "Scrubber",
  group: "Inputs",
  summary: "Seek through media: a wave while playing, a lens with the time while scrubbing.",
  docStatus: "stub",
  status: "stable",
  exports: ["Scrubber", "formatPlaybackTime"],
  platformSplit: "shared",
  stage: "photo",
  Demo,
  controls: [{ type: "boolean", name: "disabled", label: "Disabled", default: false }],
  overview: { intro: "A seek bar driven by your media element. The played part waves while playing (not while scrubbing, not with reduced motion). The player bar around it is composition, not part of the component." },
  api: [
    {
      component: "Scrubber",
      props: [
        { name: "duration", type: "number", required: true, description: "Total length in seconds." },
        { name: "currentTime", type: "number", required: true, description: "Playback position in seconds." },
        { name: "buffered", type: "number", description: "Buffered up to (seconds), drawn ahead of the playhead." },
        { name: "playing", type: "boolean", default: "false", description: "The played part waves." },
        { name: "onSeek", type: "(time: number) => void", description: "While scrubbing and on keyboard seeks." },
        { name: "onSeekStart / onSeekEnd", type: "(time: number) => void", description: "Pointer scrubbing started / ended." },
        { name: "formatTime", type: "(seconds: number) => string", default: "m:ss", description: "Lens text and aria-valuetext." },
        { name: "label", type: "string", default: "\"Seek\"", description: "Accessible name." },
        { name: "keyboardStep", type: "number", default: "5", description: "Arrow-key seek in seconds." },
        { name: "disabled", type: "boolean", default: "false", description: "Opaque disabled look." },
      ],
    },
  ],
  storybook: { title: "Components/Scrubber" },
  related: ["slider"],
};

export default scrubber;
