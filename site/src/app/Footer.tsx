import { Link } from "react-router";
import { LINKS, asset } from "@site/lib/links";
import { Brand } from "./Brand";
import styles from "./layout.module.scss";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <Brand />
          <p>
            SF UI is the React implementation of Black Glass, the design system for Mark Fomin’s projects. Source-available
            under the SF UI License.
          </p>
        </div>
        <nav aria-label="Documentation" className={styles.footerCol}>
          <h2>Docs</h2>
          <Link to="/get-started">Get started</Link>
          <Link to="/foundations">Foundations</Link>
          <Link to="/components">Components</Link>
        </nav>
        <nav aria-label="Resources" className={styles.footerCol}>
          <h2>Resources</h2>
          <a href={LINKS.storybook}>Storybook</a>
          <a href={LINKS.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={LINKS.npm} target="_blank" rel="noreferrer">
            npm
          </a>
          <a href={asset("components.json")} data-native="">
            components.json
          </a>
        </nav>
      </div>
      <div className={styles.footerBottom}>
        <span>© NAC Tech LLC</span>
        <span>True black. Glass over content. Native everywhere.</span>
      </div>
    </footer>
  );
}
