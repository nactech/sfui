import { Link } from "react-router";
import { Pencil, Copy, Download, Gauge, Rabbit, Share, Turtle } from "lucide-react";
import { Header, HeaderAction, MenuItem, Slider, TabBar, usePlatform, type Platform } from "@nactech/sfui";
import { DocsLayout } from "@site/app/DocsLayout";
import { CodeBlock } from "@site/components/CodeBlock";
import { DeviceFrame, PLATFORM_LABEL } from "@site/components/DeviceFrame";
import { Chip, PageIntro, Prose, Section } from "@site/components/Page";
import { COMPONENTS } from "@site/content/registry";
import { tabItems } from "@site/content/shared";
import { useTitle } from "@site/lib/useTitle";
import styles from "./foundations.module.scss";

function MiniScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
      <Header
        title="Foggy Stickers"
        collapsed
        onBack={() => {}}
        actions={<HeaderAction aria-label="Share" icon={<Share />} />}
        overflowMenu={
          <>
            <MenuItem icon={<Pencil />}>Rename</MenuItem>
            <MenuItem icon={<Copy />}>Duplicate</MenuItem>
            <MenuItem icon={<Download />}>Export</MenuItem>
          </>
        }
      />
      <Slider label="Frame rate" min={0} max={120} defaultValue={60} formatValue={(v) => `${v} fps`} icon={<Gauge />} leadingIcon={<Turtle />} trailingIcon={<Rabbit />} />
      <div style={{ marginTop: "auto" }}>
        <TabBar items={tabItems} defaultValue="library" placement="bottom" layout="compact" pinned={false} aria-label="Sections" />
      </div>
    </div>
  );
}

const SPLIT_LABEL = { shared: "Shared", split: "iOS · Android + Web", ios: "iOS toolbar" } as const;

export function Platforms() {
  useTitle("Platforms");
  const detected: Platform = usePlatform();
  return (
    <DocsLayout area="foundations">
      <PageIntro
        eyebrow="Foundations"
        title="Platforms"
        lead="Where iOS and Android disagree about grammar — the tab bar, the header, menus, sliders — SF UI ships both, and picks one at runtime. Everything else is one shared component."
      />

      <Section id="picking" title="How an implementation is picked">
        <ol className={styles.order}>
          <li>
            <strong>The component’s own prop</strong>
            <span>
              <code>{'<Menu platform="web">'}</code> wins over everything.
            </span>
          </li>
          <li>
            <strong>The nearest ConfigProvider</strong>
            <span>
              <code>{'<ConfigProvider platform="ios">'}</code> for a subtree or the whole app.
            </span>
          </li>
          <li>
            <strong>The user agent</strong>
            <span>iPhone, iPad (including iPadOS’s desktop UA with touch) → ios · Android → android · anything else → web.</span>
          </li>
        </ol>
        <p>
          <Chip tone="accent">This device resolves to: {PLATFORM_LABEL[detected]}</Chip>
        </p>
        <CodeBlock
          title="App.tsx"
          code={`import { ConfigProvider, usePlatform, useIsIOS } from "@nactech/sfui";

<ConfigProvider platform="auto">   {/* "auto" | "ios" | "android" | "web" */}
  <App />
</ConfigProvider>

// In your own components:
const platform = usePlatform();     // "ios" | "android" | "web"
const BackIcon = useIsIOS() ? ChevronLeft : ArrowLeft;`}
        />
      </Section>

      <Section id="side-by-side" title="Same code, three platforms" lead="Header, Slider and TabBar in one screen, forced per frame with ConfigProvider.">
        <div className={styles.platformFrames}>
          {(["ios", "android", "web"] as const).map((p) => (
            <DeviceFrame key={p} platform={p} height={24} align="start">
              <MiniScreen />
            </DeviceFrame>
          ))}
        </div>
      </Section>

      <Section id="which" title="Which components split">
        <div className={styles.splitTable}>
          {COMPONENTS.map((doc) => (
            <Link key={doc.slug} to={`/components/${doc.slug}/platforms`} className={styles.splitRow}>
              <strong>{doc.name}</strong>
              <Chip tone={doc.platformSplit === "shared" ? "neutral" : "accent"}>{SPLIT_LABEL[doc.platformSplit]}</Chip>
            </Link>
          ))}
        </div>
        <Prose>
          <p>
            Android and the web share one implementation (the “Android + Web” frames); the web adds hover, keyboard focus
            rings and wide layouts. iOS implementations use the system font, chevron back, glass lenses and iOS menus.
          </p>
        </Prose>
      </Section>
    </DocsLayout>
  );
}
