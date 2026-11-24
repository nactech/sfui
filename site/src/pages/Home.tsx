import { Link } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Braces,
  ChevronLeft,
  Download,
  Ellipsis,
  GitBranch,
  Package,
  Pencil,
  Play,
  Search,
  Share,
  Trash2,
} from "lucide-react";
import { Button, usePlatform } from "@nactech/sfui";
import { ButtonLink } from "@site/components/ButtonLink";
import { CodeBlock } from "@site/components/CodeBlock";
import { CoverCard } from "@site/components/CoverCard";
import { COMPONENTS } from "@site/content/registry";
import { LINKS, asset } from "@site/lib/links";
import { paintedLadiesTall } from "@site/lib/photos";
import { heroStill } from "@site/lib/promo";
import { useTitle } from "@site/lib/useTitle";
import { useOpenSearch } from "@site/app/search";
import { HeroScene } from "@site/scenes/HeroScene";
import ui from "@site/components/ui.module.scss";
import styles from "./home.module.scss";

const PRINCIPLES = [
  {
    title: "True black",
    text: "An AMOLED canvas. Elevation is a step up in surface plus a 1px rim — never a drop shadow.",
    to: "/foundations/elevation",
    visual: (
      <div className={styles.vSurfaces} aria-hidden="true">
        {[0, 1, 2, 3].map((n) => (
          <span key={n} style={{ background: `var(--sf-surface-${n})` }}>
            {n}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Glass over content",
    text: "Translucent, blurred chrome only where it floats over photos and video. Everything else stays solid.",
    to: "/foundations/elevation",
    visual: (
      <div className={styles.vGlass} style={{ backgroundImage: paintedLadiesTall }} aria-hidden="true">
        <span className={styles.vGlassChip}>
          <Play />
        </span>
      </div>
    ),
  },
  {
    title: "Tonal accent",
    text: "One periwinkle accent, mostly as a tonal fill. Status colours only where status lives.",
    to: "/foundations/color",
    visual: (
      <div className={styles.vAccent} aria-hidden="true">
        <span style={{ background: "var(--sf-accent-default)", color: "var(--sf-accent-on)" }}>Aa</span>
        <span style={{ background: "var(--sf-accent-tonal)", color: "var(--sf-accent-on-tonal)" }}>Aa</span>
        <span style={{ background: "var(--sf-surface-2)", color: "var(--sf-fg-default)" }}>Aa</span>
      </div>
    ),
  },
  {
    title: "One icon set",
    text: "Lucide only, the same icon for the same action on every platform. The back arrow is the one exception.",
    to: "/foundations/iconography",
    visual: (
      <div className={styles.vIcons} aria-hidden="true">
        <Download />
        <Share />
        <Pencil />
        <Trash2 />
        <Search />
        <Ellipsis />
      </div>
    ),
  },
  {
    title: "Native per platform",
    text: "Tab bar, header, menu and slider follow iOS grammar on iOS and Android + Web grammar elsewhere.",
    to: "/foundations/platforms",
    visual: (
      <div className={styles.vPlatforms} aria-hidden="true">
        <span>
          <ChevronLeft /> iOS
        </span>
        <span>
          <ArrowLeft /> Android
        </span>
        <span>
          <ArrowLeft /> Web
        </span>
      </div>
    ),
  },
];

export function Home() {
  useTitle();
  const detected = usePlatform();
  const openSearch = useOpenSearch();

  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroText}>
          <p className={`${ui.eyebrow} ${styles.rise}`}>Black Glass · SF UI 0.1</p>
          <h1 id="hero-title" className={`${styles.heroTitle} ${styles.rise}`}>
            Dark glass.
            <br />
            <span className={styles.heroAccent}>Native everywhere.</span>
          </h1>
          <p className={`${styles.heroLead} ${styles.rise}`}>
            SF UI is the React library of Black Glass, the design system for Mark Fomin’s projects: a true-black canvas,
            glass only where chrome floats over content, one tonal accent — and components that feel at home on iOS,
            Android and the web.
          </p>
          <div className={`${styles.heroActions} ${styles.rise}`}>
            <ButtonLink to="/get-started" variant="primary" size="l" trailingIcon={<ArrowRight />}>
              Get started
            </ButtonLink>
            <ButtonLink to="/components" variant="secondary" size="l">
              Browse components
            </ButtonLink>
          </div>
          <div className={`${styles.install} ${styles.rise}`}>
            <code>npm install @nactech/sfui</code>
          </div>
          <div className={`${styles.heroLinks} ${styles.rise}`}>
            <a href={LINKS.storybook}>
              <BookOpen aria-hidden="true" /> Storybook
            </a>
            <a href={LINKS.github} target="_blank" rel="noreferrer">
              <GitBranch aria-hidden="true" /> GitHub
            </a>
            <a href={LINKS.npm} target="_blank" rel="noreferrer">
              <Package aria-hidden="true" /> npm
            </a>
          </div>
        </div>
        <div className={styles.heroScene}>
          <HeroScene defaultPlatform={detected} />
        </div>
      </section>

      <section className={styles.band} aria-labelledby="principles-title">
        <div className={styles.bandHead}>
          <p className={ui.eyebrow}>Principles</p>
          <h2 id="principles-title" className={styles.bandTitle}>
            Five rules, applied everywhere.
          </h2>
        </div>
        <div className={styles.principles}>
          {PRINCIPLES.map((p) => (
            <Link key={p.title} to={p.to} className={styles.principle}>
              <div className={styles.principleVisual}>{p.visual}</div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {heroStill && (
        <section className={styles.band} aria-labelledby="still-title">
          <div className={styles.bandHead}>
            <p className={ui.eyebrow}>In context</p>
            <h2 id="still-title" className={styles.bandTitle}>
              Built with Black Glass.
            </h2>
          </div>
          <figure className={styles.still}>
            <img src={heroStill} alt="Screens built with SF UI on iOS, Android and the web" loading="lazy" />
          </figure>
        </section>
      )}

      <section className={styles.band} aria-labelledby="components-title">
        <div className={styles.bandHead}>
          <p className={ui.eyebrow}>Components</p>
          <h2 id="components-title" className={styles.bandTitle}>
            {COMPONENTS.length} components. Three platforms. One import.
          </h2>
          <ButtonLink to="/components" variant="ghost" trailingIcon={<ArrowRight />}>
            All components
          </ButtonLink>
        </div>
        <div className={ui.coverGrid}>
          {COMPONENTS.map((doc) => (
            <CoverCard key={doc.slug} doc={doc} />
          ))}
        </div>
      </section>

      <section className={styles.band} aria-labelledby="start-title">
        <div className={styles.startGrid}>
          <div className={styles.bandHead}>
            <p className={ui.eyebrow}>Get started</p>
            <h2 id="start-title" className={styles.bandTitle}>
              Three lines to the first screen.
            </h2>
            <p className={styles.bandLead}>
              Install the package, load the stylesheet and the Geist fonts, and wrap your app in a <code>.sf-root</code>.
              ConfigProvider picks the native implementation from the user agent — or force one.
            </p>
            <div className={styles.heroActions}>
              <ButtonLink to="/get-started" variant="tonal" trailingIcon={<ArrowRight />}>
                Read the guide
              </ButtonLink>
            </div>
          </div>
          <CodeBlock
            title="App.tsx"
            code={`import "@nactech/sfui/styles.css";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import { Button, ConfigProvider } from "@nactech/sfui";

export const App = () => (
  <ConfigProvider platform="auto">
    <div className="sf-root">
      <Button leadingIcon={<Download />}>Export</Button>
    </div>
  </ConfigProvider>
);`}
          />
        </div>
      </section>

      <section className={styles.band} aria-labelledby="resources-title">
        <div className={styles.bandHead}>
          <p className={ui.eyebrow}>Resources</p>
          <h2 id="resources-title" className={styles.bandTitle}>
            Go deeper.
          </h2>
        </div>
        <div className={ui.grid3}>
          <a className={styles.resource} href={LINKS.storybook}>
            <BookOpen aria-hidden="true" />
            <h3>Storybook</h3>
            <p>Every state of every component, with the platform toolbar and the accessibility checks.</p>
          </a>
          <a className={styles.resource} href={LINKS.github} target="_blank" rel="noreferrer">
            <GitBranch aria-hidden="true" />
            <h3>GitHub</h3>
            <p>Source, issues and releases of @nactech/sfui.</p>
          </a>
          <a className={styles.resource} href={LINKS.npm} target="_blank" rel="noreferrer">
            <Package aria-hidden="true" />
            <h3>npm</h3>
            <p>ESM + CJS builds with types. React 18.2+ or 19.</p>
          </a>
          <a className={styles.resource} href={asset("components.json")} data-native="">
            <Braces aria-hidden="true" />
            <h3>components.json</h3>
            <p>A machine-readable index of every component, its import, props and platforms — for agents and tools.</p>
          </a>
        </div>
      </section>

      <div className={styles.cta}>
        <h2 className={styles.ctaTitle}>Start on the black.</h2>
        <div className={styles.heroActions}>
          <ButtonLink to="/get-started" variant="primary" size="l">
            Get started
          </ButtonLink>
          <Button variant="secondary" size="l" leadingIcon={<Search />} onClick={openSearch}>
            Search the docs
          </Button>
        </div>
      </div>
    </div>
  );
}
