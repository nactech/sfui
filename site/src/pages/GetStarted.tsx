import { useState } from "react";
import { Download, Info } from "lucide-react";
import { Button, ConfigProvider, Segmented, TabBar, type Platform } from "@nactech/sfui";
import { CodeBlock } from "@site/components/CodeBlock";
import { PLATFORM_LABEL } from "@site/components/DeviceFrame";
import { Callout, PageIntro, Prose, Section } from "@site/components/Page";
import { Stage } from "@site/components/Stage";
import { tabItems } from "@site/content/shared";
import { LINKS, asset } from "@site/lib/links";
import { useTitle } from "@site/lib/useTitle";
import styles from "./pages.module.scss";

const STEPS = [
  { id: "install", title: "Install" },
  { id: "styles", title: "Styles and root" },
  { id: "fonts", title: "Fonts" },
  { id: "provider", title: "ConfigProvider" },
  { id: "rem", title: "Sizes in rem" },
  { id: "first-screen", title: "Your first screen" },
  { id: "agents", title: "For agents and tools" },
];

function FirstScreen() {
  const [platform, setPlatform] = useState<Platform>("ios");
  return (
    <div className={styles.firstScreen}>
      <Segmented
        size="s"
        aria-label="Platform"
        style={{ width: "min(18rem, 100%)" }}
        value={platform}
        onValueChange={(v) => setPlatform(v as Platform)}
        options={(["ios", "android", "web"] as Platform[]).map((p) => ({ value: p, label: PLATFORM_LABEL[p] }))}
      />
      <Stage backdrop="photo" minHeight={14}>
        <ConfigProvider platform={platform}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", width: "min(24rem, 100%)" }}>
            <Button size="l" leadingIcon={<Download />}>
              Export
            </Button>
            <div style={{ width: "100%" }}>
              <TabBar items={tabItems} defaultValue="library" placement="bottom" layout="compact" pinned={false} aria-label="Sections" />
            </div>
          </div>
        </ConfigProvider>
      </Stage>
    </div>
  );
}

export function GetStarted() {
  useTitle("Get started");
  return (
    <div className={styles.guide}>
      <aside className={styles.toc} aria-label="On this page">
        <p className={styles.tocLabel}>On this page</p>
        {STEPS.map((s, i) => (
          <a key={s.id} href={`#${s.id}`}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {s.title}
          </a>
        ))}
      </aside>
      <div className={styles.guideBody}>
        <PageIntro
          eyebrow="Get started"
          title="From npm install to a native-feeling screen."
          lead="SF UI ships React components, the Black Glass tokens as CSS custom properties, and platform implementations picked at runtime. Setup takes a few minutes."
        />

        <Section id="install" title="1 · Install">
          <Prose>
            <p>
              React 18.2+ or 19 is a peer dependency. Icons come from <code>lucide-react</code>, which is installed with the
              kit — use it for your own icons too.
            </p>
          </Prose>
          <CodeBlock title="Terminal" code="npm install @nactech/sfui" />
        </Section>

        <Section id="styles" title="2 · Styles and the root class">
          <Prose>
            <p>
              Import the stylesheet once, at the entry of your app. It contains every component style and the{" "}
              <code>--sf-*</code> tokens on <code>:root</code>. Then put <code>.sf-root</code> on the element that hosts the
              UI — it sets the true-black canvas, the text colour, the Geist family and font smoothing.
            </p>
          </Prose>
          <CodeBlock
            title="main.tsx"
            code={`import "@nactech/sfui/styles.css";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <div className="sf-root">
    <App />
  </div>,
);`}
          />
          <Callout icon={<Info />} title="Dark only, on purpose">
            Black Glass is an AMOLED design system: true black (<code>#000</code>) with surface steps above it. There is no
            light theme yet; <code>appearance="light"</code> is reserved for one.
          </Callout>
        </Section>

        <Section id="fonts" title="3 · Fonts">
          <Prose>
            <p>
              The kit uses <strong>Geist</strong> for text and <strong>Geist Mono</strong> for numbers, timings and sizes. It
              doesn’t bundle them — load them yourself, for example from Fontsource. Without them the system UI font takes
              over. The iOS implementations use the system font (SF Pro on Apple devices) on purpose.
            </p>
          </Prose>
          <CodeBlock
            title="Terminal · main.tsx"
            code={`npm install @fontsource-variable/geist @fontsource-variable/geist-mono

import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";`}
          />
        </Section>

        <Section id="provider" title="4 · ConfigProvider">
          <Prose>
            <p>
              <code>ConfigProvider</code> decides which implementation the platform-specific components render (TabBar,
              Header, Menu, Slider and SelectionToolbar). With <code>platform="auto"</code> — the default — iPhone and iPad
              get <code>ios</code>, Android gets <code>android</code>, everything else <code>web</code>. Force one for the
              whole tree, or per component with its own <code>platform</code> prop.
            </p>
          </Prose>
          <CodeBlock
            title="App.tsx"
            code={`import { ConfigProvider, Menu, TabBar, Button } from "@nactech/sfui";

export const App = () => (
  <ConfigProvider platform="auto" /* "ios" | "android" | "web" */ appearance="dark">
    <TabBar items={tabs} aria-label="Sections" />
    {/* One component can opt out: */}
    <Menu platform="web" trigger={<Button>More</Button>}>{/* … */}</Menu>
  </ConfigProvider>
);`}
          />
          <div className={styles.propsList}>
            <div>
              <code>platform</code>
              <span>
                <code>"auto" | "ios" | "android" | "web"</code> — default <code>"auto"</code> (user agent).
              </span>
            </div>
            <div>
              <code>appearance</code>
              <span>
                <code>"dark" | "light"</code> — dark only for now; read it with <code>useAppearance()</code>.
              </span>
            </div>
          </div>
          <Prose>
            <p>
              Read the resolved platform in your own components with <code>usePlatform()</code> or <code>useIsIOS()</code> —
              for example to pick <code>ChevronLeft</code> over <code>ArrowLeft</code>.
            </p>
          </Prose>
        </Section>

        <Section id="rem" title="5 · Sizes are in rem">
          <Prose>
            <p>
              Every size, spacing, radius and font size in the kit is in <code>rem</code> (1rem = 16 design px). Keep the
              root font size at the browser default so components match the design; users who raise their browser font size
              get a proportionally larger UI, which is the point. Hairline rims stay 1px.
            </p>
          </Prose>
        </Section>

        <Section id="first-screen" title="6 · Your first screen" lead="The same two components, rendered through each platform.">
          <FirstScreen />
          <CodeBlock
            title="Screen.tsx"
            code={`import { Button, TabBar } from "@nactech/sfui";
import { Download, Library, Play, Settings2, Upload } from "lucide-react";

const tabs = [
  { value: "library", label: "Library", icon: <Library /> },
  { value: "player", label: "Player", icon: <Play /> },
  { value: "export", label: "Export", icon: <Upload /> },
  { value: "settings", label: "Settings", icon: <Settings2 /> },
];

export const Screen = () => (
  <>
    <Button size="l" leadingIcon={<Download />}>Export</Button>
    <TabBar items={tabs} defaultValue="library" aria-label="Sections" />
  </>
);`}
          />
        </Section>

        <Section id="agents" title="7 · For agents and tools">
          <Prose>
            <p>
              The site publishes <a href={asset("components.json")} data-native="">components.json</a>: every component with
              its summary, import line, props (name, type, default, platform), platform split and Storybook link. Point
              your coding agent at it instead of scraping pages. Storybook lives at{" "}
              <a href={LINKS.storybook}>/sfui/storybook/</a>.
            </p>
          </Prose>
        </Section>
      </div>
    </div>
  );
}
