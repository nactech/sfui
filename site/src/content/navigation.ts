/** Site map shared by the top navigation, the side navigation, the search and the footer. */

export interface NavPage {
  /** Route path, without the /sfui/ base. */
  path: string;
  title: string;
  summary: string;
}

export const FOUNDATIONS: NavPage[] = [
  { path: "/foundations/color", title: "Color", summary: "True black, surface steps, a periwinkle tonal accent and status colours — every --sf- colour token." },
  { path: "/foundations/typography", title: "Typography", summary: "Geist for text, Geist Mono for numbers, SF Pro on iOS. The scale the components use." },
  { path: "/foundations/shape", title: "Shape", summary: "Five radius tokens, from small controls to full capsules." },
  { path: "/foundations/elevation", title: "Elevation & glass", summary: "Surface steps and 1px rims instead of shadows. Glass only for chrome over content." },
  { path: "/foundations/motion", title: "Motion", summary: "Durations, easings and springs — and what happens with reduced motion." },
  { path: "/foundations/iconography", title: "Iconography", summary: "Lucide only. The same icon for the same action on every platform." },
  { path: "/foundations/platforms", title: "Platforms", summary: "Native per platform: how iOS, Android and Web implementations are picked." },
];

export const MAIN_NAV = [
  { path: "/get-started", title: "Get started", match: "/get-started" },
  { path: "/foundations", title: "Foundations", match: "/foundations" },
  { path: "/components", title: "Components", match: "/components" },
] as const;

export const GET_STARTED: NavPage = {
  path: "/get-started",
  title: "Get started",
  summary: "Install the package, load the styles and fonts, wrap the app in ConfigProvider.",
};
