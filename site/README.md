# SF UI site

The public documentation and promo site of SF UI (`@nactech/sfui`), the React library of Black Glass.
A separate Vite + React 19 app that imports the library **from source** (`/@/…` and `@nactech/sfui` →
`src/index.ts`), so it always shows the current code.

```bash
npm run site:dev       # http://localhost:5190/sfui/
npm run site:build     # → site/dist (index.html, 404.html, components.json, assets)
npm run site:preview   # serve the build at http://localhost:4190/sfui/
```

Deployed to GitHub Pages under `/sfui/` (Vite `base`, `BrowserRouter basename`). `404.html` is a copy of
`index.html` so deep links work. Storybook is expected at `/sfui/storybook/`.

## Layout

```
site/
  vite.config.ts            base /sfui/, aliases, SCSS load paths (reuses ../vite.config.ts)
  plugins/sfui-site.ts      virtual:sfui-promo, components.json (dev + build), 404.html
  public/promo/             promo artwork slots (see below)
  src/
    main.tsx, styles/global.scss   fonts + tokens (plain stylesheet) + base styles
    app/                    App (routes), Layout, TopNav, MobileNav (TabBar), DocsLayout, SearchDialog, Footer
    components/             site building blocks: Stage, DeviceFrame, CodeBlock, ControlsPanel, PropsTable,
                            DoDontCard, CoverCard, ButtonLink, Page (PageIntro, Section, Prose, Callout, Chip)
    content/
      types.ts              the ComponentDoc content model
      registry.ts           the list of component pages
      components/<slug>.tsx one ComponentDoc per page
      shared.tsx            realistic demo data (tabs, stickers, the file menu)
      navigation.ts         site map (foundations, main nav)
      manifest.ts           builds components.json
    pages/                  Home, GetStarted, ComponentsIndex, ComponentPage, foundations/*
    scenes/HeroScene.tsx    the live phone on the home page
    lib/                    links, promo manifest, photos (CSS-gradient "photos"), tokens parser, helpers
```

## Adding or expanding a component page

1. Create `src/content/components/<slug>.tsx` and `export default` a `ComponentDoc` (see `content/types.ts`).
   Required: `slug`, `name`, `group`, `summary`, `docStatus`, `status`, `exports`, `platformSplit`, `Demo`, `api`.
2. Add it to `COMPONENTS` in `src/content/registry.ts` (order = order inside its group).
3. That's it: the route `/components/<slug>`, the side navigation, the index card, search and `components.json`
   pick it up.

To bring a stub up to the reference quality of `button.tsx`, `tabbar.tsx` and `menu.tsx`, fill in
`overview`, `controls` (+ `code`), `variants`, `platforms` (`Demo`, `notes`), `usage` (`guidelines`, `dos`,
`writing`) and `accessibility`, then set `docStatus: "complete"`. Content strings may use `backticks` for code.

Rules for demos: render real library components only, Lucide icons only (the same icon per action), no external
images (use `lib/photos.ts`), sizes in rem. A `Demo` must not portal open on load or pin itself to the viewport
(`pinned={false}` for TabBar / SelectionToolbar) — it is also used for cover previews and device frames.
Keep the API tables in sync with the TypeScript types by hand.

## Promo artwork slots

Static promo frames are exported from Pen into `public/promo/`; the build scans the folder:

| File | Used for | When absent |
|---|---|---|
| `promo/hero.{webp,png,…}` | "In context" band on the home page | band hidden |
| `promo/covers/<slug>.{webp,png,…}` | cover card of a component (16:10) | live mini-preview |
| `promo/anatomy/<slug>.{webp,png,…}` | Anatomy section on the Overview tab | section hidden |

A `ComponentDoc` can point to a differently named file with `cover` / `anatomy` (paths relative to `public/`).
