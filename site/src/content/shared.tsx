/* Realistic demo content shared by the component pages (the same world as the Storybook stories). */
import type React from "react";
import {
  ArrowDownAZ,
  Calendar,
  CarTaxiFront,
  Copy,
  Download,
  Ellipsis,
  FolderInput,
  HardDrive,
  House,
  Library,
  Link,
  Pencil,
  Play,
  Send,
  Settings2,
  Share,
  Snowflake,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Button,
  MenuItem,
  MenuQuickAction,
  MenuQuickActions,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  type ButtonProps,
  type TabBarItem,
} from "@nactech/sfui";

export const tabItems: TabBarItem[] = [
  { value: "library", label: "Library", icon: <Library /> },
  { value: "player", label: "Player", icon: <Play /> },
  { value: "export", label: "Export", icon: <Upload /> },
  { value: "settings", label: "Settings", icon: <Settings2 /> },
];

export const stickers = [
  { value: "chilly", title: "Mr. Chilly", subtitle: "2.4 s · 60 fps · 512²", size: "41 KB", icon: <Snowflake />, tone: "accent" as const },
  { value: "taxi", title: "Robotaxi", subtitle: "3.0 s · 60 fps", size: "71 KB", icon: <CarTaxiFront />, tone: "warning" as const },
  { value: "ladies", title: "Painted Ladies", subtitle: "2.0 s · 60 fps", size: "38 KB", icon: <House />, tone: "danger" as const },
];

interface FileMenuOptions {
  sort?: string;
  onSortChange?: (value: string) => void;
  quickActions?: boolean;
  submenu?: boolean;
  disabledQuick?: boolean;
  /** iOS copy is Title Case. */
  titleCase?: boolean;
}

/** The file menu of the M/A frames: quick row, Share submenu, Sort by single choice, Delete. */
export function FileMenuContent({
  sort,
  onSortChange,
  quickActions = true,
  submenu = true,
  disabledQuick = false,
  titleCase = false,
}: FileMenuOptions) {
  const t = (sentence: string, title: string) => (titleCase ? title : sentence);
  return (
    <>
      {quickActions && (
        <>
          <MenuQuickActions aria-label="Quick actions">
            <MenuQuickAction icon={<Pencil />}>Rename</MenuQuickAction>
            <MenuQuickAction icon={<Copy />} disabled={disabledQuick}>
              Duplicate
            </MenuQuickAction>
            <MenuQuickAction icon={<FolderInput />} disabled={disabledQuick}>
              {t("Move to…", "Move To…")}
            </MenuQuickAction>
          </MenuQuickActions>
          <MenuSeparator />
        </>
      )}
      {submenu ? (
        <MenuSub label="Share" icon={<Share />}>
          <MenuItem icon={<Send />}>Telegram</MenuItem>
          <MenuItem icon={<Link />}>{t("Copy link", "Copy Link")}</MenuItem>
          <MenuItem icon={<Download />}>Export .tgs</MenuItem>
        </MenuSub>
      ) : (
        <MenuItem icon={<Share />}>Share</MenuItem>
      )}
      <MenuSeparator />
      <MenuRadioGroup label={t("Sort by", "Sort By")} value={sort} defaultValue="name" onValueChange={onSortChange}>
        <MenuRadioItem value="name" icon={<ArrowDownAZ />}>
          Name
        </MenuRadioItem>
        <MenuRadioItem value="date" icon={<Calendar />}>
          {t("Date added", "Date Added")}
        </MenuRadioItem>
        <MenuRadioItem value="size" icon={<HardDrive />}>
          Size
        </MenuRadioItem>
      </MenuRadioGroup>
      <MenuSeparator />
      <MenuItem icon={<Trash2 />} destructive>
        Delete
      </MenuItem>
    </>
  );
}

/** Glass ••• anchor used as a Menu trigger in demos: the library Button (it forwards ref and handlers). */
export function MoreTrigger(props: Omit<ButtonProps, "children">) {
  return (
    <Button variant="secondary" iconOnly aria-label="More" {...props}>
      <Ellipsis />
    </Button>
  );
}

/** A vertical stack used inside demos. */
export function Column({ children, gap = 0.75, width }: { children: React.ReactNode; gap?: number; width?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: `${gap}rem`, width: width ?? "100%", maxWidth: "100%", minWidth: 0 }}>
      {children}
    </div>
  );
}

/** A wrapping row used inside demos. */
export function Row({ children, gap = 0.75, justify = "center" }: { children: React.ReactNode; gap?: number; justify?: string }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: justify, gap: `${gap}rem`, minWidth: 0 }}>
      {children}
    </div>
  );
}
