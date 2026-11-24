import { storyId } from "@site/content/types";

/** External destinations. Storybook is deployed next to the site, at /sfui/storybook/. */
export const LINKS = {
  github: "https://github.com/nactech/sfui",
  npm: "https://www.npmjs.com/package/@nactech/sfui",
  storybook: `${import.meta.env.BASE_URL}storybook/`,
  lucide: "https://lucide.dev/icons/",
  geist: "https://vercel.com/font",
} as const;

/** Deep link into Storybook: the docs page of a title, or one story. */
export function storybookUrl(title: string, exportName?: string): string {
  return exportName
    ? `${LINKS.storybook}?path=/story/${storyId(title, exportName)}`
    : `${LINKS.storybook}?path=/docs/${storyId(title)}--docs`;
}

/** Public asset path (respects the `/sfui/` base). */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
