import { useLayoutEffect, useState } from "react";
import { Link, NavLink, Navigate, useParams } from "react-router";
import { BookOpen, Code, RotateCcw } from "lucide-react";
import { Button, ConfigProvider, Segmented, usePlatform, type Platform } from "@nactech/sfui";
import { DocsLayout } from "@site/app/DocsLayout";
import { ButtonLink } from "@site/components/ButtonLink";
import { CodeBlock } from "@site/components/CodeBlock";
import { ControlsPanel, defaultValues } from "@site/components/ControlsPanel";
import { CoverCard } from "@site/components/CoverCard";
import { DeviceFrame, PLATFORM_LABEL } from "@site/components/DeviceFrame";
import { DoDontCard } from "@site/components/DoDontCard";
import { Callout, Chip, Prose, Section } from "@site/components/Page";
import { PropsTable } from "@site/components/PropsTable";
import { Stage } from "@site/components/Stage";
import { componentBySlug, COMPONENTS } from "@site/content/registry";
import type { ComponentDoc, ControlValues } from "@site/content/types";
import { LINKS, storybookUrl } from "@site/lib/links";
import { anatomyFor } from "@site/lib/promo";
import { useTitle } from "@site/lib/useTitle";
import { md } from "@site/lib/inline";
import { NotFound } from "./NotFound";
import ui from "@site/components/ui.module.scss";
import styles from "./component.module.scss";

export const TABS = [
  { id: "overview", label: "Overview" },
  { id: "platforms", label: "Platforms" },
  { id: "usage", label: "Usage" },
  { id: "accessibility", label: "Accessibility" },
  { id: "api", label: "API" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const PLATFORMS: Platform[] = ["ios", "android", "web"];
const SPLIT_TEXT = {
  shared: "Shared on all platforms",
  split: "iOS · Android + Web",
  ios: "iOS toolbar · Android + Web fallback",
} as const;

const importLine = (doc: ComponentDoc) => `import { ${doc.exports.join(", ")} } from "@nactech/sfui";`;

export function ComponentPage() {
  const { slug, tab = "overview" } = useParams();
  const doc = componentBySlug(slug);
  useTitle(doc ? `${doc.name}${tab !== "overview" ? ` · ${TABS.find((t) => t.id === tab)?.label ?? ""}` : ""}` : "Not found");
  // Switching tabs keeps the reader where they are, unless the tab row has scrolled out of view.
  useLayoutEffect(() => {
    const tabs = document.getElementById("tabs");
    if (tabs && tabs.getBoundingClientRect().top < 0) tabs.scrollIntoView({ block: "start" });
  }, [tab]);
  if (!doc) return <NotFound />;
  if (!TABS.some((t) => t.id === tab)) return <Navigate to={`/components/${doc.slug}`} replace />;

  return (
    <DocsLayout area="components">
      <article className={styles.page}>
        <ComponentHeader doc={doc} />
        <nav id="tabs" className={styles.tabs} aria-label={`${doc.name} documentation`}>
          {TABS.map((t) => (
            <NavLink
              key={t.id}
              to={t.id === "overview" ? `/components/${doc.slug}` : `/components/${doc.slug}/${t.id}`}
              end
              className={({ isActive }) => (isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab)}
              state={{ keepScroll: true }}
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        {doc.docStatus === "stub" && <StubNote doc={doc} />}
        <div className={styles.tabPanel} key={`${doc.slug}-${tab}`}>
          {tab === "overview" && <OverviewTab doc={doc} />}
          {tab === "platforms" && <PlatformsTab doc={doc} />}
          {tab === "usage" && <UsageTab doc={doc} />}
          {tab === "accessibility" && <AccessibilityTab doc={doc} />}
          {tab === "api" && <ApiTab doc={doc} />}
        </div>
        <Related doc={doc} />
      </article>
    </DocsLayout>
  );
}

function ComponentHeader({ doc }: { doc: ComponentDoc }) {
  const source = doc.source ?? `src/components/${doc.exports[0]}`;
  return (
    <header className={styles.header}>
      <p className={ui.eyebrow}>{doc.group}</p>
      <h1 className={styles.title}>{doc.name}</h1>
      <p className={styles.summary}>{doc.summary}</p>
      <div className={styles.meta}>
        <Chip tone={doc.status === "stable" ? "positive" : "warning"}>{doc.status}</Chip>
        <Chip tone={doc.platformSplit === "shared" ? "neutral" : "accent"}>{SPLIT_TEXT[doc.platformSplit]}</Chip>
        {doc.docStatus === "stub" && <Chip tone="warning">docs: stub</Chip>}
      </div>
      <div className={styles.headerActions}>
        {doc.storybook && (
          <ButtonLink to={storybookUrl(doc.storybook.title)} native variant="secondary" size="s" leadingIcon={<BookOpen />}>
            Storybook
          </ButtonLink>
        )}
        <ButtonLink to={`${LINKS.github}/tree/main/${source}`} variant="ghost" size="s" leadingIcon={<Code />}>
          Source
        </ButtonLink>
      </div>
    </header>
  );
}

function StubNote({ doc }: { doc: ComponentDoc }) {
  return (
    <Callout tone="neutral" title="This page is a stub">
      The live demo and the API table are complete; usage guidance, accessibility notes and the variants gallery are still
      being written. Until then, the <a href={doc.storybook ? storybookUrl(doc.storybook.title) : LINKS.storybook}>Storybook stories</a>{" "}
      show every state of {doc.name}.
    </Callout>
  );
}

/* ───────────────────────── Overview ───────────────────────── */

function LiveDemo({ doc }: { doc: ComponentDoc }) {
  const detected = usePlatform();
  const [platform, setPlatform] = useState<Platform>(detected);
  const [values, setValues] = useState<ControlValues>(() => defaultValues(doc.controls));
  const [resetKey, setResetKey] = useState(0);
  const { Demo } = doc;
  const hasControls = !!doc.controls?.length;
  const split = doc.platformSplit !== "shared";

  return (
    <div className={styles.demo} data-has-controls={hasControls ? "" : undefined}>
      <div className={styles.demoMain}>
        {split && (
          <div className={styles.demoToolbar}>
            <Segmented
              size="s"
              aria-label="Platform"
              style={{ width: "min(18rem, 100%)" }}
              value={platform}
              onValueChange={(v) => setPlatform(v as Platform)}
              options={PLATFORMS.map((p) => ({ value: p, label: PLATFORM_LABEL[p] }))}
            />
          </div>
        )}
        <Stage backdrop={doc.stage ?? "canvas"} minHeight={20} className={styles.demoStage}>
          <ConfigProvider platform={platform}>
            <Demo key={resetKey} values={values} platform={platform} />
          </ConfigProvider>
        </Stage>
      </div>
      {hasControls && (
        <aside className={styles.demoControls}>
          <div className={styles.controlsHead}>
            <span>Props</span>
            <Button
              variant="ghost"
              size="s"
              leadingIcon={<RotateCcw />}
              onClick={() => {
                setValues(defaultValues(doc.controls));
                setResetKey((k) => k + 1);
              }}
            >
              Reset
            </Button>
          </div>
          <ControlsPanel controls={doc.controls!} values={values} onChange={(name, value) => setValues((v) => ({ ...v, [name]: value }))} />
        </aside>
      )}
      <CodeBlock className={styles.demoCode} code={doc.code ? doc.code(values) : importLine(doc)} title={doc.code ? "Example" : "Import"} />
    </div>
  );
}

function OverviewTab({ doc }: { doc: ComponentDoc }) {
  const anatomy = anatomyFor(doc);
  return (
    <>
      {doc.overview && (
        <Section id="overview" title="Overview">
          <Prose>
            <p>{md(doc.overview.intro)}</p>
          </Prose>
          {(doc.overview.whenToUse || doc.overview.whenNotToUse) && (
            <div className={ui.grid2}>
              {doc.overview.whenToUse && (
                <div className={ui.card}>
                  <h3>When to use</h3>
                  <ul className={ui.list}>
                    {doc.overview.whenToUse.map((t) => (
                      <li key={t}>{md(t)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {doc.overview.whenNotToUse && (
                <div className={ui.card}>
                  <h3>When not to use</h3>
                  <ul className={ui.list}>
                    {doc.overview.whenNotToUse.map((t) => (
                      <li key={t}>{md(t)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Section>
      )}

      <Section id="demo" title="Live demo" lead={doc.controls?.length ? "Change the props in the panel — the code follows along." : undefined}>
        <LiveDemo doc={doc} />
      </Section>

      {anatomy && (
        <Section id="anatomy" title="Anatomy">
          <figure className={styles.anatomy}>
            <img src={anatomy} alt={doc.anatomyAlt ?? `${doc.name} anatomy`} loading="lazy" />
          </figure>
        </Section>
      )}

      {doc.variants && doc.variants.length > 0 && (
        <Section id="variants" title="Variants">
          <div className={styles.variants}>
            {doc.variants.map((variant) => (
              <figure key={variant.name} className={styles.variant}>
                <Stage backdrop={variant.stage ?? "canvas"} minHeight={12} className={styles.variantStage}>
                  {variant.render()}
                </Stage>
                <figcaption className={styles.variantCaption}>
                  <strong>{variant.name}</strong>
                  {variant.description && <span>{md(variant.description)}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      {doc.storybook?.stories && (
        <Section id="stories" title="In Storybook">
          <div className={styles.storyLinks}>
            {doc.storybook.stories.map((s) => (
              <ButtonLink key={s.export} to={storybookUrl(doc.storybook!.title, s.export)} native variant="secondary" size="s" leadingIcon={<BookOpen />}>
                {s.name}
              </ButtonLink>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

/* ───────────────────────── Platforms ───────────────────────── */

function PlatformsTab({ doc }: { doc: ComponentDoc }) {
  const split = doc.platformSplit !== "shared";
  const FrameDemo = doc.platforms?.Demo;
  const { Demo } = doc;
  const defaults = defaultValues(doc.controls);
  const render = (platform: Platform) => (FrameDemo ? <FrameDemo platform={platform} /> : <Demo values={defaults} platform={platform} />);

  return (
    <Section
      id="platforms"
      title={split ? "One API, native per platform" : "Shared on every platform"}
      lead={
        doc.platforms?.intro ??
        (split
          ? `${doc.name} has an iOS implementation next to the Android + Web one. ConfigProvider (or the platform prop) picks it.`
          : `${doc.name} has one implementation: it looks and behaves the same on iOS, Android and the web.`)
      }
    >
      {split ? (
        <div className={styles.frames}>
          {PLATFORMS.map((p) => (
            <div key={p} className={styles.frameCol} data-platform={p}>
              <DeviceFrame platform={p} backdrop={doc.stage ?? "canvas"} height={28} align="end">
                {render(p)}
              </DeviceFrame>
              {doc.platforms?.notes?.[p] && (
                <ul className={ui.list}>
                  {doc.platforms.notes[p]!.map((n) => (
                    <li key={n}>{md(n)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <>
          <Stage backdrop={doc.stage ?? "canvas"} minHeight={16}>
            <ConfigProvider platform="web">{render("web")}</ConfigProvider>
          </Stage>
          <Callout tone="neutral" title="No platform split">
            The same component renders everywhere; touch devices simply never get hover states. See{" "}
            <Link to="/foundations/platforms">Platforms</Link> for the components that do split.
          </Callout>
        </>
      )}
    </Section>
  );
}

/* ───────────────────────── Usage ───────────────────────── */

function UsageTab({ doc }: { doc: ComponentDoc }) {
  const usage = doc.usage;
  if (!usage) return <Missing doc={doc} what="Usage guidelines" />;
  return (
    <>
      {usage.guidelines && (
        <Section id="guidelines" title="Guidelines">
          <Prose>
            <ul>
              {usage.guidelines.map((g) => (
                <li key={g}>{md(g)}</li>
              ))}
            </ul>
          </Prose>
        </Section>
      )}
      {usage.dos && (
        <Section id="do-dont" title="Do and don’t">
          <div className={styles.doDonts}>
            {usage.dos.map((item) => (
              <DoDontCard key={item.title} item={item} />
            ))}
          </div>
        </Section>
      )}
      {usage.writing && (
        <Section id="writing" title="Writing">
          <Prose>
            <ul>
              {usage.writing.map((w) => (
                <li key={w}>{md(w)}</li>
              ))}
            </ul>
          </Prose>
        </Section>
      )}
    </>
  );
}

/* ───────────────────────── Accessibility ───────────────────────── */

function AccessibilityTab({ doc }: { doc: ComponentDoc }) {
  const a11y = doc.accessibility;
  if (!a11y) return <Missing doc={doc} what="Accessibility notes" />;
  const list = (items: string[] | undefined) =>
    items && (
      <Prose>
        <ul>
          {items.map((i) => (
            <li key={i}>{md(i)}</li>
          ))}
        </ul>
      </Prose>
    );
  return (
    <>
      {a11y.intro && (
        <Section id="a11y" title="Accessibility">
          <Prose>
            <p>{a11y.intro}</p>
          </Prose>
        </Section>
      )}
      {a11y.roles && (
        <Section id="roles" title="Roles and attributes">
          <div className={ui.tableScroll}>
            <table className={ui.kbdTable}>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Element</th>
                  <th scope="col">Role</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {a11y.roles.map((r) => (
                  <tr key={r.element}>
                    <th scope="row">{r.element}</th>
                    <td>
                      <code>{r.role}</code>
                    </td>
                    <td>{md(r.notes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
      {a11y.keyboard && (
        <Section id="keyboard" title="Keyboard">
          <div className={ui.tableScroll}>
            <table className={ui.kbdTable}>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Keys</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {a11y.keyboard.map((k) => (
                  <tr key={k.keys.join("+") + k.action}>
                    <th scope="row">
                      {k.keys.map((key) => (
                        <kbd key={key}>{key}</kbd>
                      ))}
                    </th>
                    <td>{md(k.action)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
      {a11y.focus && (
        <Section id="focus" title="Focus and interaction">
          {list(a11y.focus)}
        </Section>
      )}
      {a11y.reducedMotion && (
        <Section id="reduced-motion" title="Reduced motion">
          {list(a11y.reducedMotion)}
        </Section>
      )}
      {a11y.screenReader && (
        <Section id="screen-readers" title="Screen readers">
          {list(a11y.screenReader)}
        </Section>
      )}
    </>
  );
}

/* ───────────────────────── API ───────────────────────── */

function ApiTab({ doc }: { doc: ComponentDoc }) {
  return (
    <Section id="api" title="API" lead="Maintained by hand from the TypeScript types in the library source.">
      <CodeBlock code={importLine(doc)} title="Import" />
      <div>
        {doc.api.map((table) => (
          <PropsTable key={table.component} table={table} />
        ))}
      </div>
    </Section>
  );
}

function Missing({ doc, what }: { doc: ComponentDoc; what: string }) {
  return (
    <Section id="missing" title={`${what} are on their way`}>
      <Prose>
        <p>
          Until this section is written, the Storybook stories of {doc.name} cover its states, and the{" "}
          <Link to={`/components/${doc.slug}/api`}>API tab</Link> lists every prop. The general rules in{" "}
          <Link to="/foundations">Foundations</Link> apply.
        </p>
      </Prose>
    </Section>
  );
}

function Related({ doc }: { doc: ComponentDoc }) {
  const related = (doc.related ?? []).map((slug) => COMPONENTS.find((d) => d.slug === slug)).filter((d): d is ComponentDoc => !!d);
  if (!related.length) return null;
  return (
    <Section id="related" title="Related components">
      <div className={ui.coverGrid}>
        {related.map((d) => (
          <CoverCard key={d.slug} doc={d} />
        ))}
      </div>
    </Section>
  );
}

export type { TabId };
