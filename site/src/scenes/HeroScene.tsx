import { useState } from "react";
import {
  BatteryFull,
  Car,
  CarTaxiFront,
  CloudFog,
  Copy,
  Download,
  House,
  Pause,
  Pencil,
  Play,
  Rabbit,
  Repeat,
  Share,
  Signal,
  Snowflake,
  Trash2,
  Turtle,
  Wifi,
} from "lucide-react";
import {
  Button,
  ConfigProvider,
  Header,
  HeaderAction,
  List,
  ListAction,
  ListItem,
  ListStatus,
  ListThumbnail,
  MenuItem,
  MenuSeparator,
  Scrubber,
  Segmented,
  Slider,
  Switch,
  TabBar,
  useMediaQuery,
  type Platform,
} from "@nactech/sfui";
import { tabItems } from "@site/content/shared";
import { usePlayback } from "@site/content/components/scrubber";
import { bayFog } from "@site/lib/photos";
import styles from "./HeroScene.module.scss";

const STICKERS = [
  { value: "chilly", title: "Mr. Chilly", subtitle: "2.4 s · 60 fps · 512²", size: "41 KB", icon: <Snowflake />, tone: "accent" as const },
  { value: "taxi", title: "Robotaxi", subtitle: "3.0 s · 60 fps", size: "71 KB", icon: <CarTaxiFront />, tone: "warning" as const, over: true },
  { value: "ladies", title: "Painted Ladies", subtitle: "2.0 s · 60 fps", size: "38 KB", icon: <House />, tone: "danger" as const },
  { value: "waymo", title: "Waymo", subtitle: "2.0 s · 60 fps", size: "29 KB", icon: <Car />, tone: "neutral" as const },
  { value: "karl", title: "Karl the Fog", subtitle: "3.2 s · 60 fps", size: "44 KB", icon: <CloudFog />, tone: "positive" as const },
];

const DURATION = 2.4;

/** The app screen. Everything inside is a real SF UI component; the platform comes from the ConfigProvider. */
function AppScreen({ platform }: { platform: Platform }) {
  const ios = platform === "ios";
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [tab, setTab] = useState("library");
  const [kind, setKind] = useState("stickers");
  const [speed, setSpeed] = useState(1);
  const { playing, setPlaying, scrubberProps } = usePlayback(DURATION, 0.8, true);

  return (
    <div className={styles.screen}>
      <div className={styles.statusBar} data-platform={platform} aria-hidden="true">
        <span className={styles.time}>9:41</span>
        <span className={ios ? styles.island : styles.punch} />
        <span className={styles.statusIcons}>
          <Signal />
          <Wifi />
          <BatteryFull />
        </span>
      </div>

      <div ref={setScroller} className={styles.scroller} tabIndex={-1}>
        <div className={styles.content}>
          <Header
            title="Foggy Stickers"
            subtitle="24 stickers · updated today"
            onBack={() => {}}
            collapsed="auto"
            sticky
            scrollContainer={scroller}
            actions={<HeaderAction aria-label="Share" icon={<Share />} />}
            overflowMenu={
              <>
                <MenuItem icon={<Pencil />}>{ios ? "Rename Pack" : "Rename pack"}</MenuItem>
                <MenuItem icon={<Copy />}>Duplicate</MenuItem>
                <MenuItem icon={<Download />}>Export .tgs</MenuItem>
                <MenuSeparator />
                <MenuItem icon={<Trash2 />} destructive>
                  Delete
                </MenuItem>
              </>
            }
          />

          <div className={styles.player} style={{ backgroundImage: bayFog }}>
            <div className={styles.sticker} aria-hidden="true">
              <Snowflake />
            </div>
            <div className={styles.playerBar}>
              <Button size="m" iconOnly aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
                {playing ? <Pause /> : <Play />}
              </Button>
              <Scrubber {...scrubberProps} duration={DURATION} buffered={2} formatTime={(t) => `${t.toFixed(1)} s`} style={{ flex: "1 1 0", minWidth: 0 }} />
            </div>
          </div>

          <div className={styles.block}>
            <Slider
              label="Playback speed"
              min={0.5}
              max={2}
              step={0.25}
              value={speed}
              onValueChange={setSpeed}
              formatValue={(v) => `${v}×`}
              maxLabel="2×"
              icon={<Rabbit />}
              leadingIcon={<Turtle />}
              trailingIcon={<Rabbit />}
            />
          </div>

          <div className={styles.block}>
            <Segmented
              aria-label="Pack content"
              size="s"
              value={kind}
              onValueChange={setKind}
              options={[
                { value: "stickers", label: "Stickers" },
                { value: "emoji", label: "Emoji" },
                { value: "masks", label: "Masks" },
              ]}
            />
          </div>

          <List variant="inset" title="Recent" action={<ListAction>{ios ? "See All" : "See all"}</ListAction>} headingLevel={3}>
            {STICKERS.map((s) => (
              <ListItem
                key={s.value}
                value={s.value}
                leading={<ListThumbnail tone={s.tone}>{s.icon}</ListThumbnail>}
                title={s.title}
                subtitle={s.subtitle}
                trailing={s.over ? <ListStatus icon={<Snowflake />}>{s.size}</ListStatus> : s.size}
                chevron
                onClick={() => {}}
              />
            ))}
            <ListItem
              leading={
                <ListThumbnail tone="positive">
                  <Repeat />
                </ListThumbnail>
              }
              title="Loop playback"
              subtitle="Applies to all stickers"
              trailing={<Switch aria-label="Loop playback" defaultChecked />}
            />
          </List>
        </div>
      </div>

      <div className={styles.tabBar}>
        <TabBar
          items={tabItems.map((i) => (i.value === "export" ? { ...i, badge: 3, badgeLabel: "3 new exports" } : i))}
          value={tab}
          onValueChange={setTab}
          placement="bottom"
          layout="compact"
          pinned={false}
          aria-label="App sections"
          minimized={ios ? "auto" : false}
          scrollContainer={scroller}
          search={ios ? { label: "Search stickers" } : undefined}
        />
      </div>
      <span className={styles.homeIndicator} aria-hidden="true" />
    </div>
  );
}

/** Home hero: a live phone screen with an iOS / Android / Web switch. */
export function HeroScene({ defaultPlatform }: { defaultPlatform: Platform }) {
  const [platform, setPlatform] = useState<Platform>(defaultPlatform);
  const narrow = useMediaQuery("(max-width: 37.4375rem)");
  return (
    <div className={styles.scene}>
      <div className={styles.switch}>
        <Segmented
          aria-label="Platform implementation"
          size={narrow ? "s" : "m"}
          style={{ width: narrow ? "100%" : "min(20rem, 100%)" }}
          value={platform}
          onValueChange={(v) => setPlatform(v as Platform)}
          options={[
            { value: "ios", label: "iOS" },
            { value: "android", label: "Android" },
            { value: "web", label: "Web" },
          ]}
        />
      </div>
      <div className={styles.phone} data-platform={platform}>
        <ConfigProvider platform={platform}>
          {/* `key`: a fresh screen per platform, like opening the app on another device. */}
          <AppScreen key={platform} platform={platform} />
        </ConfigProvider>
      </div>
      <p className={styles.caption}>
        Same JSX, rendered through <code>{`<ConfigProvider platform="${platform}">`}</code>. Scroll the screen, open •••,
        drag the tab pill.
      </p>
    </div>
  );
}
