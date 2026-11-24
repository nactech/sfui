import { renderHook } from "@testing-library/react";
import React from "react";
import { detectPlatform, usePlatform, PlatformContext } from "./platform";

const nav = (userAgent: string, maxTouchPoints = 0) => ({ userAgent, maxTouchPoints });

describe("detectPlatform", () => {
  test("iPhone and iPad Safari / WKWebView are ios", () => {
    expect(detectPlatform(nav("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15"))).toBe("ios");
    expect(detectPlatform(nav("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)"))).toBe("ios");
  });
  test("iPadOS desktop-class UA with touch is ios, a Mac without touch is web", () => {
    const mac = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15";
    expect(detectPlatform(nav(mac, 5))).toBe("ios");
    expect(detectPlatform(nav(mac, 0))).toBe("web");
  });
  test("Android is android, desktop Chrome is web, no navigator is web", () => {
    expect(detectPlatform(nav("Mozilla/5.0 (Linux; Android 15; Pixel 9)"))).toBe("android");
    expect(detectPlatform(nav("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140"))).toBe("web");
    expect(detectPlatform(undefined)).toBe("web");
  });
});

describe("usePlatform", () => {
  test("prop override wins over context, context wins over detection", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PlatformContext.Provider value="ios">{children}</PlatformContext.Provider>
    );
    expect(renderHook(() => usePlatform(), { wrapper }).result.current).toBe("ios");
    expect(renderHook(() => usePlatform("web"), { wrapper }).result.current).toBe("web");
    expect(renderHook(() => usePlatform("auto"), { wrapper }).result.current).toBe("ios");
  });
});
