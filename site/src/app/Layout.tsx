import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { TopNav } from "./TopNav";
import { MobileNav } from "./MobileNav";
import { Footer } from "./Footer";
import { SearchDialog } from "./SearchDialog";
import { SearchContext } from "./search";
import styles from "./layout.module.scss";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

/** New page → top of the page; a hash → that section (after the page has rendered). */
function useScrollOnNavigate() {
  const { pathname, hash, state } = useLocation();
  const keepScroll = !!(state as { keepScroll?: boolean } | null)?.keepScroll;
  useLayoutEffect(() => {
    if (keepScroll) return;
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash, keepScroll]);
}

/**
 * Plain `<a href="/sfui/…">` elements rendered by library components (TabBar links, PageHeader crumbs) would
 * reload the page. Route same-origin clicks inside the SPA through the router instead.
 */
function useInternalLinkClicks() {
  const navigate = useNavigate();
  return useCallback(
    (event: React.MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target || anchor.hasAttribute("download") || anchor.dataset.native !== undefined) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || !url.pathname.startsWith(`${basename}/`) || url.pathname.startsWith(`${basename}/storybook`)) return;
      if (url.pathname === window.location.pathname && url.hash) return; // in-page anchor: let the browser scroll
      event.preventDefault();
      navigate(url.pathname.slice(basename.length) + url.search + url.hash);
    },
    [navigate],
  );
}

export function Layout() {
  useScrollOnNavigate();
  const onClickCapture = useInternalLinkClicks();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKey, setSearchKey] = useState(0);
  const openSearch = useCallback(() => {
    setSearchKey((k) => k + 1);
    setSearchOpen(true);
  }, []);

  // ⌘K / Ctrl+K anywhere, "/" outside text fields.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const editing = !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openSearch();
      } else if (e.key === "/" && !editing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  return (
    <SearchContext.Provider value={openSearch}>
    <div className={`sf-root ${styles.shell}`} onClickCapture={onClickCapture}>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <TopNav onSearch={openSearch} />
      <main id="main" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <SearchDialog key={searchKey} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
    </SearchContext.Provider>
  );
}
