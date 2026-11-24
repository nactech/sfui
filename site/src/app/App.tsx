import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ConfigProvider } from "@nactech/sfui";
import { Layout } from "./Layout";
import { Home } from "@site/pages/Home";
import { GetStarted } from "@site/pages/GetStarted";
import { ComponentsIndex } from "@site/pages/ComponentsIndex";
import { ComponentPage } from "@site/pages/ComponentPage";
import { FoundationsIndex } from "@site/pages/foundations/FoundationsIndex";
import { FOUNDATION_ROUTES } from "@site/pages/foundations/routes";
import { NotFound } from "@site/pages/NotFound";

/** `/sfui/` in production (GitHub Pages), from Vite's `base`. */
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export function App() {
  return (
    // The site's own chrome follows the visitor's platform; demos force theirs with nested providers.
    <ConfigProvider platform="auto">
      <BrowserRouter basename={basename}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="get-started" element={<GetStarted />} />
            <Route path="foundations" element={<FoundationsIndex />} />
            {FOUNDATION_ROUTES.map(({ slug, Page }) => (
              <Route key={slug} path={`foundations/${slug}`} element={<Page />} />
            ))}
            <Route path="components" element={<ComponentsIndex />} />
            <Route path="components/:slug" element={<ComponentPage />} />
            <Route path="components/:slug/:tab" element={<ComponentPage />} />
            <Route path="docs" element={<Navigate to="/get-started" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
