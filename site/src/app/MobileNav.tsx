import { useLocation } from "react-router";
import { House, Palette, Rocket, Shapes } from "lucide-react";
import { TabBar, type TabBarItem } from "@nactech/sfui";
import styles from "./layout.module.scss";

const base = import.meta.env.BASE_URL;

const ITEMS: TabBarItem[] = [
  { value: "home", label: "Home", icon: <House />, href: base },
  { value: "start", label: "Start", icon: <Rocket />, href: `${base}get-started` },
  { value: "foundations", label: "Foundations", icon: <Palette />, href: `${base}foundations` },
  { value: "components", label: "Components", icon: <Shapes />, href: `${base}components` },
];

function sectionOf(pathname: string) {
  if (pathname.startsWith("/get-started")) return "start";
  if (pathname.startsWith("/foundations")) return "foundations";
  if (pathname.startsWith("/components")) return "components";
  return "home";
}

/**
 * Phones: the library's own TabBar, floating at the bottom (iOS gets the iOS bar). Its links are plain anchors;
 * the Layout routes them through the router. Hidden from 600 px, where the top navigation takes over.
 */
export function MobileNav() {
  const { pathname } = useLocation();
  return (
    <div className={styles.mobileNav}>
      <TabBar items={ITEMS} value={sectionOf(pathname)} placement="bottom" layout="compact" aria-label="Sections" />
    </div>
  );
}
