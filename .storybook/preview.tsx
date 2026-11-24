import type { Preview } from "@storybook/react-vite";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./global.scss";
import "./preview.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      options: {
        black: { name: "surface/0 (AMOLED)", value: "#000000" },
        surface1: { name: "surface/1", value: "#0E0E10" },
        photo: { name: "Over content", value: "#3a3f55" },
      },
    },
    controls: { expanded: true },
    a11y: { test: "todo" },
  },
  initialGlobals: {
    backgrounds: { value: "black" },
  },
  decorators: [
    (Story) => (
      <div className="sf-root" style={{ background: "transparent", padding: "1rem" }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
