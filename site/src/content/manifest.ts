/**
 * `components.json` — a machine-readable index of the component pages for agents and tools.
 * Built by `site/plugins/sfui-site.ts` (served in dev at /sfui/components.json, written into the build).
 */
import { COMPONENTS } from "./registry";
import { storybookUrl } from "@site/lib/links";

const SITE_URL = "https://nactech.github.io/sfui/";

export function buildComponentsManifest() {
  return {
    name: "@nactech/sfui",
    description: "SF UI — React components of Black Glass, the design system for Mark Fomin's projects.",
    site: SITE_URL,
    styles: 'import "@nactech/sfui/styles.css";',
    platforms: ["ios", "android", "web"],
    components: COMPONENTS.map((doc) => ({
      name: doc.name,
      slug: doc.slug,
      url: `${SITE_URL}components/${doc.slug}`,
      summary: doc.summary,
      group: doc.group,
      status: doc.status,
      docStatus: doc.docStatus,
      import: `import { ${doc.exports.join(", ")} } from "@nactech/sfui";`,
      exports: doc.exports,
      platforms: {
        split: doc.platformSplit,
        implementations:
          doc.platformSplit === "shared" ? { ios: "shared", android: "shared", web: "shared" } : { ios: "ios", android: "android-web", web: "android-web" },
      },
      storybook: doc.storybook ? `${SITE_URL.replace(/\/$/, "")}${storybookUrl(doc.storybook.title).replace(/^\/sfui/, "")}` : null,
      props: doc.api.map((table) => ({
        component: table.component,
        extends: table.extends ?? null,
        props: table.props.map((p) => ({
          name: p.name,
          type: p.type,
          default: p.default ?? null,
          required: p.required ?? false,
          description: p.description,
          platform: p.platform ?? "all",
        })),
      })),
    })),
  };
}
