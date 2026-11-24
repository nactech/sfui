import type { ComponentType } from "react";
import { Color } from "./Color";
import { Typography } from "./Typography";
import { Shape } from "./Shape";
import { Elevation } from "./Elevation";
import { Motion } from "./Motion";
import { Iconography } from "./Iconography";
import { Platforms } from "./Platforms";

/** `/foundations/<slug>` → page. Keep in sync with FOUNDATIONS in content/navigation.ts. */
export const FOUNDATION_ROUTES: { slug: string; Page: ComponentType }[] = [
  { slug: "color", Page: Color },
  { slug: "typography", Page: Typography },
  { slug: "shape", Page: Shape },
  { slug: "elevation", Page: Elevation },
  { slug: "motion", Page: Motion },
  { slug: "iconography", Page: Iconography },
  { slug: "platforms", Page: Platforms },
];
