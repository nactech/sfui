import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pause, Play } from "lucide-react";
import Scrubber, { type ScrubberProps } from "./Scrubber";

const meta = {
  title: "Components/Scrubber",
  component: Scrubber,
  tags: ["autodocs"],
  args: {
    duration: 180,
    currentTime: 112,
    buffered: 150,
    playing: false,
    disabled: false,
    label: "Seek",
    keyboardStep: 5,
  },
  argTypes: {
    formatTime: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "32.5rem", maxWidth: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Scrubber>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Fake media clock: advances `currentTime` while playing, follows seeks. */
const usePlayback = (duration: number, initial: number, autoplay: boolean) => {
  const [time, setTime] = React.useState(initial);
  const [playing, setPlaying] = React.useState(autoplay);
  const [scrubbing, setScrubbing] = React.useState(false);

  React.useEffect(() => {
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

  const scrubberProps: Partial<ScrubberProps> = {
    currentTime: time,
    playing,
    onSeek: setTime,
    onSeekStart: () => setScrubbing(true),
    onSeekEnd: () => setScrubbing(false),
  };
  return { time, playing, setPlaying, scrubberProps };
};

/** Live: playing with the wave; drag to scrub (lens), Tab + ← → seeks 5 s. */
export const Default: Story = {
  render: function Render(args) {
    const { scrubberProps } = usePlayback(args.duration, args.currentTime, true);
    return <Scrubber {...args} {...scrubberProps} />;
  },
};

const Row = ({ caption, note, children }: { caption: string; note?: string; children: React.ReactNode }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.625rem",
      padding: "0.75rem 0 0.25rem",
      borderTop: "1px solid var(--sf-rim-default)",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        font: "400 0.625rem/normal var(--sf-font-mono)",
        letterSpacing: "0.05rem",
        color: "var(--sf-fg-subtle)",
      }}
    >
      <span>{caption}</span>
      {note && <span style={{ color: "var(--sf-fg-muted)", fontSize: "0.6875rem", letterSpacing: 0 }}>{note}</span>}
    </div>
    {children}
  </div>
);

/** Mirrors frame Zjd6e (P/A2 · Liquid). Row 2 (scrubbing) and row 4 (focus) are live. */
export const Matrix: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Row caption="1 · PLAYING" note="wave + capsule playhead">
        <Scrubber {...args} label="Playing" playing />
      </Row>
      <Row caption="2 · SCRUBBING" note="drag: lens appears only while scrubbing">
        <Scrubber {...args} label="Scrubbing" />
      </Row>
      <Row caption="3 · PAUSED" note="flat line, capsule">
        <Scrubber {...args} label="Paused" />
      </Row>
      <Row caption="4 · FOCUS" note="Tab, keyboard ← → 5 s">
        <Scrubber {...args} label="Focus" playing />
      </Row>
      <Row caption="5 · DISABLED">
        <Scrubber {...args} label="Disabled" disabled />
      </Row>
    </div>
  ),
};

export const Paused: Story = {};

export const Disabled: Story = { args: { disabled: true } };

/** Short clip with a seconds format, as on the lens in the frame ("1.6 s"). */
export const SecondsFormat: Story = {
  args: { duration: 2.4, currentTime: 1.6, buffered: 2, formatTime: (t: number) => `${t.toFixed(1)} s` },
  render: function Render(args) {
    const { scrubberProps } = usePlayback(args.duration, args.currentTime, true);
    return <Scrubber {...args} {...scrubberProps} />;
  },
};

const photo: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  height: "7rem",
  padding: "0 1.5rem",
  borderRadius: "1.25rem",
  overflow: "hidden",
  background:
    "radial-gradient(circle at 78% 30%, #f6e7c1 0 10%, transparent 30%), linear-gradient(180deg, #7fa7d6 0%, #c9d6e4 38%, #b48a64 39%, #7d5a44 62%, #3d4a2f 63%, #26301f 100%)",
};

const bar: React.CSSProperties = {
  flex: "1 1 0",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  height: "3.75rem",
  padding: "0 1rem 0 0.625rem",
  borderRadius: "1.875rem",
  border: "1px solid var(--sf-glass-rim)",
  background: "var(--sf-glass-fill)",
  boxShadow: "inset 0 0.0625rem 0 var(--sf-glass-highlight-soft)",
  backdropFilter: "blur(0.75rem)",
  WebkitBackdropFilter: "blur(0.75rem)",
};

const playButton: React.CSSProperties = {
  flexShrink: 0,
  display: "grid",
  placeItems: "center",
  width: "2.5rem",
  height: "2.5rem",
  padding: 0,
  border: 0,
  borderRadius: "1.25rem",
  background: "var(--sf-glass-accent)",
  color: "var(--sf-accent-on)",
  cursor: "pointer",
};

/** Over content — player bar (composition example; the bar itself is not part of Scrubber). */
export const PlayerBar: Story = {
  args: { duration: 2.4, currentTime: 1.2, buffered: 1.8, formatTime: (t: number) => `${t.toFixed(1)} s` },
  render: function Render(args) {
    const { playing, setPlaying, scrubberProps } = usePlayback(args.duration, args.currentTime, true);
    return (
      <div style={photo}>
        <div style={bar}>
          <button
            type="button"
            style={playButton}
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause size="1.125rem" /> : <Play size="1.125rem" />}
          </button>
          <Scrubber {...args} {...scrubberProps} style={{ flex: "1 1 0" }} />
          <span style={{ font: "400 0.75rem var(--sf-font-mono)", color: "var(--sf-fg-muted)" }}>
            {args.duration.toFixed(1)}
          </span>
        </div>
      </div>
    );
  },
};
