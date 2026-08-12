import { describe, expect, it } from "vitest";

import {
  applyZSvirtDefaultBranding,
  getCacheBustedAssetUrl,
  getFaviconLinkAttributes,
  ZSVIRT_DEFAULT_BRANDING,
} from "./zsvirt-brand";

describe("ZSvirt default branding", () => {
  it("replaces the built-in theme branding", () => {
    expect(
      applyZSvirtDefaultBranding({
        oem: false,
        browserTitle: "ZStack ZSphere",
        loginTitle: "ZStack ZSphere Virtualization Platform",
        bannerTitle: "ZStack ZSphere Virtualization Platform",
      }),
    ).toMatchObject(ZSVIRT_DEFAULT_BRANDING);
  });

  it("preserves OEM branding", () => {
    const oemTheme = {
      oem: true,
      browserTitle: "OEM Cloud",
      loginLogo: "/oem/login.svg",
      bannerLogo: "/oem/banner.svg",
    };

    expect(applyZSvirtDefaultBranding(oemTheme)).toBe(oemTheme);
  });

  it("keeps an inlined SVG favicon intact", () => {
    const favicon = "data:image/svg+xml;base64,PHN2Zy8+";

    expect(getFaviconLinkAttributes(favicon, 123)).toEqual({
      href: favicon,
      type: "image/svg+xml",
    });
  });

  it("does not append a cache buster to inline brand assets", () => {
    const logo = "data:image/svg+xml;base64,PHN2Zy8+";

    expect(getCacheBustedAssetUrl(logo, 123)).toBe(logo);
    expect(getCacheBustedAssetUrl("/logo.svg", 123)).toBe(
      "/logo.svg?current=123",
    );
  });
});
