import type { Preview } from "@storybook/react-vite";
import ConfigProvider from "../src/components/ConfigProvider";
import type { PlatformSetting } from "../src/core/platform";
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
    platform: "web",
  },
  globalTypes: {
    platform: {
      description: "Platform implementation (Slider, TabBar, Header, Menu)",
      toolbar: {
        title: "Platform",
        icon: "mobile",
        items: [
          { value: "web", title: "Web" },
          { value: "android", title: "Android" },
          { value: "ios", title: "iOS" },
          { value: "auto", title: "Auto (user agent)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <ConfigProvider platform={(context.parameters.platform ?? context.globals.platform ?? "web") as PlatformSetting}>
        <div className="sf-root" style={{ background: "transparent", padding: "1rem" }}>
          <Story />
        </div>
      </ConfigProvider>
    ),
  ],
};

export default preview;
