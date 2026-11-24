<img src="https://github.com/nactech/sfui/assets/78644136/33cf9e3a-a905-49b6-8f32-38d78d942323" height=170 />

# SF UI for React
<p align="center">
<img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white" alt="TypeScript"/>
<img src="https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB" alt="React"/>
</p>

React components of **Black Glass**, the design system for Mark Fomin's projects: a true-black canvas, elevation by surface steps and 1px rims, glass only for chrome that floats over content, and a periwinkle tonal accent. Version 0.1 targets the web, with native-feeling iOS implementations where iOS grammar differs.

## Install

```bash
npm install @nactech/sfui
```

React 18.2+ or 19 is a peer dependency. Icons come from `lucide-react`, which is installed with the kit.

```tsx
import "@nactech/sfui/styles.css";
import { Button, TabBar } from "@nactech/sfui";

export const App = () => (
  <div className="sf-root">
    <Button variant="primary">Export</Button>
  </div>
);
```

Load the Geist and Geist Mono fonts yourself, for example with `@fontsource-variable/geist` and `@fontsource-variable/geist-mono`. Without them the kit falls back to the system UI font. All sizes are in `rem`, so keep the root font size at the browser default (16px).

## Components

| Group | Components |
|---|---|
| Actions & selection | `Button`, `Switch`, `Checkbox`, `Radio`, `RadioGroup`, `Segmented` |
| Inputs | `TextField`, `SearchField`, `SelectField`, `TextArea`, `InsetForm` (+ rows), `Slider`, `Scrubber` |
| Lists | `List`, `ListItem` |
| Navigation | `TabBar`, `Header`, `PageHeader`, `SelectionBar`, `SelectionToolbar` (iOS) |
| Overlays | `Menu` (+ items, in-place submenus) |
| Layout | `Container`, `Stack`, `ConfigProvider` |

Design tokens are CSS custom properties prefixed with `--sf-` (for example `var(--sf-accent-default)`).

## Platforms

`Slider`, `TabBar`, `Header` and `Menu` have an iOS implementation next to the Android + Web one, and `SelectionToolbar` is the iOS selection toolbar. `ConfigProvider` picks the implementation from the user agent (iPhone and iPad → `ios`, Android → `android`, everything else → `web`); you can force it for the whole app or for one component:

```tsx
<ConfigProvider platform="ios">{/* "auto" (default) | "ios" | "android" | "web" */}
  <TabBar items={tabs} />
  <Menu platform="web" trigger={<Button>More</Button>}>{/* … */}</Menu>
</ConfigProvider>
```

The iOS implementation uses the system font (`-apple-system`, i.e. SF Pro on Apple devices). Other components look the same on every platform.

## Development

```bash
npm run storybook   # component workbench on http://localhost:6006
npm test            # Vitest + Testing Library
npm run typecheck
npm run lint
npm run build       # Rollup: ESM + CJS + types into dist/
```

The source of truth for every component is the finalized frames in `final.pen`; stories mirror those frames.

## License
SF UI is source-available, not open source. It is licensed under the [SF UI License](LICENSE.md):

- you may use it, including commercially, in mini-apps published on [sf.fm](https://sf.fm), as long as they follow the sf.fm rules;
- any other use requires written permission from NAC Tech LLC;
- contributions are welcome; by submitting one you assign its rights to NAC Tech LLC (see section 8 of the license).

Versions up to and including 0.0.11 (and all versions of `@nacteam/sdfui`) were published under [CC BY-NC-SA 4.0](http://creativecommons.org/licenses/by-nc-sa/4.0/) and remain under it.
