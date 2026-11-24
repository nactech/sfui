import type React from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { ChevronDown } from "lucide-react";
import { Button, Menu, MenuGroup, MenuItem } from "@nactech/sfui";
import { FOUNDATIONS } from "@site/content/navigation";
import { componentsByGroup } from "@site/content/registry";
import styles from "./layout.module.scss";

type Area = "foundations" | "components";

interface NavGroup {
  label?: string;
  links: { path: string; title: string; stub?: boolean }[];
}

function groupsFor(area: Area): NavGroup[] {
  if (area === "foundations") {
    return [{ links: [{ path: "/foundations", title: "Overview" }, ...FOUNDATIONS.map((f) => ({ path: f.path, title: f.title }))] }];
  }
  return [
    { links: [{ path: "/components", title: "All components" }] },
    ...componentsByGroup().map(({ group, docs }) => ({
      label: group,
      links: docs.map((d) => ({ path: `/components/${d.slug}`, title: d.name, stub: d.docStatus === "stub" })),
    })),
  ];
}

const isCurrent = (pathname: string, path: string) =>
  path === "/components" || path === "/foundations" ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);

/** Phones and tablets: the side navigation collapses into a Menu. */
function SectionPicker({ area, groups }: { area: Area; groups: NavGroup[] }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = groups.flatMap((g) => g.links).find((l) => isCurrent(pathname, l.path));
  const items = (links: NavGroup["links"]) =>
    links.map((l) => (
      <MenuItem key={l.path} onSelect={() => navigate(l.path)} aria-current={isCurrent(pathname, l.path) ? "page" : undefined}>
        {l.title}
      </MenuItem>
    ));
  return (
    <div className={styles.picker}>
      <Menu
        align="start"
        trigger={
          <Button variant="secondary" size="m" trailingIcon={<ChevronDown />}>
            {area === "foundations" ? "Foundations" : "Components"}
            {current ? ` · ${current.title}` : ""}
          </Button>
        }
      >
        {groups.map((g, i) =>
          g.label ? (
            <MenuGroup key={g.label} label={g.label}>
              {items(g.links)}
            </MenuGroup>
          ) : (
            <span key={i} style={{ display: "contents" }}>
              {items(g.links)}
            </span>
          ),
        )}
      </Menu>
    </div>
  );
}

/** Foundations and Components: sticky side navigation + content. */
export function DocsLayout({ area, children }: { area: Area; children: React.ReactNode }) {
  const groups = groupsFor(area);
  const { pathname } = useLocation();
  return (
    <div className={styles.docs}>
      <aside className={styles.sideNav} aria-label={area === "foundations" ? "Foundations" : "Components"}>
        <nav>
          {groups.map((g, i) => (
            <div key={g.label ?? i} className={styles.sideGroup}>
              {g.label && <h2 className={styles.sideLabel}>{g.label}</h2>}
              {g.links.map((l) => (
                <NavLink
                  key={l.path}
                  to={l.path}
                  end
                  className={isCurrent(pathname, l.path) ? `${styles.sideLink} ${styles.sideLinkActive}` : styles.sideLink}
                  aria-current={isCurrent(pathname, l.path) ? "page" : undefined}
                >
                  {l.title}
                  {l.stub && <span className={styles.sideStub}>stub</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <div className={styles.docsContent}>
        <SectionPicker area={area} groups={groups} />
        {children}
      </div>
    </div>
  );
}
