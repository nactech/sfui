import type React from "react";
import { BatteryFull, Lock, Signal, Wifi } from "lucide-react";
import { ConfigProvider, type Platform } from "@nactech/sfui";
import { photo as defaultPhoto } from "@site/lib/photos";
import styles from "./DeviceFrame.module.scss";

export const PLATFORM_LABEL: Record<Platform, string> = { ios: "iOS", android: "Android", web: "Web" };

export interface DeviceFrameProps {
  platform: Platform;
  children?: React.ReactNode;
  /** Screen background: the canvas, or a photo (glass over content). */
  backdrop?: "canvas" | "photo";
  photo?: string;
  /** Screen height in rem (status bar excluded). Default 26. */
  height?: number;
  /** Centre the content vertically (default) or pin it to the bottom / top. */
  align?: "center" | "start" | "end";
  /** Show the platform label above the frame. Default `true`. */
  caption?: boolean;
  className?: string;
}

/**
 * A device-width frame that forces one platform implementation with `ConfigProvider platform`.
 * Phones are 390 design px wide (the width of the iOS frames); the web frame is a browser window.
 */
export function DeviceFrame({
  platform,
  children,
  backdrop = "canvas",
  photo,
  height = 26,
  align = "center",
  caption = true,
  className,
}: DeviceFrameProps) {
  return (
    <figure className={[styles.figure, className].filter(Boolean).join(" ")} data-platform={platform}>
      {caption && <figcaption className={styles.caption}>{PLATFORM_LABEL[platform]}</figcaption>}
      <div className={styles.device} data-platform={platform}>
        {platform === "web" ? (
          <div className={styles.browserBar} aria-hidden="true">
            <span className={styles.dots}>
              <i />
              <i />
              <i />
            </span>
            <span className={styles.url}>
              <Lock />
              your-app
            </span>
          </div>
        ) : (
          <div className={styles.statusBar} aria-hidden="true">
            <span className={styles.time}>9:41</span>
            <span className={platform === "ios" ? styles.island : styles.punch} />
            <span className={styles.status}>
              <Signal />
              <Wifi />
              <BatteryFull />
            </span>
          </div>
        )}
        <div
          className={styles.screen}
          data-backdrop={backdrop}
          data-align={align}
          style={{
            minHeight: `${height}rem`,
            ...(backdrop === "photo" ? { backgroundImage: photo ?? defaultPhoto } : null),
          }}
        >
          <ConfigProvider platform={platform}>{children}</ConfigProvider>
        </div>
        {platform !== "web" && <span className={styles.homeIndicator} aria-hidden="true" />}
      </div>
    </figure>
  );
}
