import alova from "@zstack/alova-instance";
import type { ThemeConfig } from "@zstack/zsphere-platform-store";
import type { Color } from "@zstack/zsphere-utils";
import { changeTheme, setTailwindVariable } from "@zstack/zsphere-utils";

import {
  getZsvEffectiveLocale,
  ZSV_DEFAULT_LOCALE,
  ZSV_ENGLISH_LOCALE,
} from "./locale-mode";
import {
  applyZSvirtDefaultBranding,
  getFaviconLinkAttributes,
} from "./zsvirt-brand";

const DEFAULT_THEME_LOCALES = new Set([ZSV_DEFAULT_LOCALE, ZSV_ENGLISH_LOCALE]);

const getFallbackThemeConfig = (locale: string): ThemeConfig => {
  const effectiveLocale =
    locale === ZSV_ENGLISH_LOCALE ? ZSV_ENGLISH_LOCALE : ZSV_DEFAULT_LOCALE;

  return {
    themeMode: "light",
    themeColor: "blue",
    browserTitle: "ZStack",
    favicon: `/public/theme/default/${effectiveLocale}/favicon.ico`,
    loginTitle:
      effectiveLocale === ZSV_ENGLISH_LOCALE
        ? "Welcome to ZStack Cloud"
        : "欢迎使用 ZStack 云平台",
    loginLogo: `/public/theme/default/${effectiveLocale}/logo.svg`,
    bannerLogo: `/public/theme/default/${effectiveLocale}/logo-bar.svg`,
    bannerTitle:
      effectiveLocale === ZSV_ENGLISH_LOCALE ? "ZStack Cloud" : "ZStack 云平台",
    bannerFontSize: "14px",
    overviewTitle:
      effectiveLocale === ZSV_ENGLISH_LOCALE
        ? "Real-Time Monitor"
        : "ZStack实时监控",
    overviewMode: "classicalBlue",
    overviewMonitorType: "externalMonitor",
  };
};

export const normalizeDefaultThemeLocale = (locale?: string) => {
  const effectiveLocale = getZsvEffectiveLocale(locale || ZSV_DEFAULT_LOCALE);
  return DEFAULT_THEME_LOCALES.has(effectiveLocale)
    ? effectiveLocale
    : ZSV_DEFAULT_LOCALE;
};

const getColor = async (mode: string, theme: string) => {
  return await alova
    .Get<Record<string, string>>(`/color/${mode}/${theme}.json`)
    .send();
};

export const loadDefaultThemeConfig = async (locale?: string) => {
  const effectiveLocale = normalizeDefaultThemeLocale(locale);
  const fallbackConfig = getFallbackThemeConfig(effectiveLocale);
  const dataUrls = [
    `/public/theme/default/${effectiveLocale}/data.json`,
    `/theme/default/${effectiveLocale}/data.json`,
  ];

  for (const dataUrl of dataUrls) {
    try {
      const config = await alova.Get<ThemeConfig>(dataUrl).send();
      return applyZSvirtDefaultBranding({
        ...fallbackConfig,
        ...config,
        themeMode: config.themeMode || fallbackConfig.themeMode,
        themeColor: config.themeColor || fallbackConfig.themeColor,
      });
    } catch {
      // Try the next static asset location.
    }
  }

  return applyZSvirtDefaultBranding(fallbackConfig);
};

export const applyThemeConfig = async (themeConfig: ThemeConfig) => {
  const mode = (themeConfig.themeMode || "light") as Color.IMode;
  const theme = (themeConfig.themeColor || "blue") as Color.ITheme;

  changeTheme({ mode, theme });

  document.title = themeConfig.browserTitle || "";

  if (themeConfig.favicon) {
    const faviconAttributes = getFaviconLinkAttributes(themeConfig.favicon);
    const link = document.createElement("link");
    link.rel = "shortcut icon";
    link.type = faviconAttributes.type;
    link.href = faviconAttributes.href;
    document.head.appendChild(link);
  }

  try {
    const [themeColors, neutralColors, semanticColors] = await Promise.all([
      getColor(mode, theme),
      getColor(mode, "neutral"),
      getColor(mode, "semantic"),
    ]);

    [themeColors, neutralColors, semanticColors].forEach((item) => {
      Object.entries(item).forEach(([name, value]) => {
        const cssVariable = name.replace("@", "--");
        document.body.style.setProperty(cssVariable, value);
        setTailwindVariable(cssVariable, value);
      });
    });
  } catch (error) {
    console.warn("Failed to apply default theme color variables:", error);
  }

  if (mode === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }

  localStorage.setItem("themeConfig", JSON.stringify(themeConfig));
};

export const applyDefaultTheme = async (locale?: string) => {
  const themeConfig = await loadDefaultThemeConfig(locale);
  await applyThemeConfig(themeConfig);
  return themeConfig;
};
