import { Link, NavLink } from "react-router";
import { BookOpen, Braces, Ellipsis, GitBranch, Package, Search } from "lucide-react";
import { Button, Menu, MenuItem, MenuSeparator } from "@nactech/sfui";
import { ButtonLink } from "@site/components/ButtonLink";
import { MAIN_NAV } from "@site/content/navigation";
import { LINKS, asset } from "@site/lib/links";
import { Brand } from "./Brand";
import styles from "./layout.module.scss";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function TopNav({ onSearch }: { onSearch: () => void }) {
  return (
    <header className={styles.topNav}>
      <div className={styles.navInner}>
        <Link to="/" className={styles.brandLink} aria-label="SF UI home">
          <Brand />
        </Link>

        <nav aria-label="Main" className={styles.mainNav}>
          {MAIN_NAV.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink)}>
              {item.title}
            </NavLink>
          ))}
        </nav>

        <div className={styles.navActions}>
          <button type="button" className={styles.searchButton} onClick={onSearch} aria-label="Search the docs" aria-keyshortcuts="Meta+K Control+K /">
            <Search aria-hidden="true" />
            <span className={styles.searchText}>Search</span>
            <kbd className={styles.searchKbd}>{isMac ? "⌘K" : "Ctrl K"}</kbd>
          </button>
          <ButtonLink to={LINKS.storybook} native variant="ghost" size="s" className={styles.desktopOnly}>
            Storybook
          </ButtonLink>
          <ButtonLink to={LINKS.github} variant="secondary" size="s" leadingIcon={<GitBranch />} className={styles.desktopOnly}>
            GitHub
          </ButtonLink>
          <span className={styles.mobileOnly}>
            <Menu trigger={<Button variant="ghost" iconOnly aria-label="Links" size="m"><Ellipsis /></Button>}>
              <MenuItem icon={<BookOpen />} onSelect={() => window.location.assign(LINKS.storybook)}>
                Storybook
              </MenuItem>
              <MenuItem icon={<GitBranch />} onSelect={() => window.open(LINKS.github, "_blank", "noopener")}>
                GitHub
              </MenuItem>
              <MenuItem icon={<Package />} onSelect={() => window.open(LINKS.npm, "_blank", "noopener")}>
                npm
              </MenuItem>
              <MenuSeparator />
              <MenuItem icon={<Braces />} onSelect={() => window.location.assign(asset("components.json"))}>
                components.json
              </MenuItem>
            </Menu>
          </span>
        </div>
      </div>
    </header>
  );
}
