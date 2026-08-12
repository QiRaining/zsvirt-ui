import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { getLocaleFromStorage } from "@zstack/zsphere-utils";
import { useEffect } from "react";

import { applyDefaultTheme } from "../utils/default-theme";
import {
  getZsvEffectiveLocale,
  ZSV_DEFAULT_LOCALE,
  ZSV_ENGLISH_LOCALE,
  ZSV_ENGLISH_ONLY,
} from "../utils/locale-mode";

const allLocaleInfo: { [key: string]: any } = {
  "zh-CN": {
    // messages里面存的就是i18n的json文件，用的时候动态fetch去拿
    messages: {},
    locale: "zh-CN",
  },
  "en-US": {
    // messages里面存的就是i18n的json文件，用的时候动态fetch去拿
    messages: {},
    locale: "en-US",
  },
};

export const localeInfo: { [key: string]: any } = ZSV_ENGLISH_ONLY
  ? {
      [ZSV_ENGLISH_LOCALE]: allLocaleInfo[ZSV_ENGLISH_LOCALE],
    }
  : allLocaleInfo;

function getBrowserLang() {
  if (ZSV_ENGLISH_ONLY) {
    return ZSV_ENGLISH_LOCALE;
  }

  // 优先使用用户已保存的语言设置
  const savedLocale = getLocaleFromStorage();
  if (savedLocale && Object.keys(localeInfo).includes(savedLocale)) {
    return savedLocale;
  }

  const isNavigatorLanguageValid =
    typeof navigator !== "undefined" && typeof navigator.language === "string";

  if (!isNavigatorLanguageValid) {
    return "";
  }

  const lang = navigator.language.split("-").join("-");

  return Object.keys(localeInfo).includes(lang) ? lang : ZSV_ENGLISH_LOCALE;
}

/**
 * 加载并应用内置默认主题。
 */
export function useApplyDefaultTheme() {
  const setThemeConfig = usePlatformStore((state) => state.setThemeConfig);

  useEffect(() => {
    let ignore = false;
    const locale = getZsvEffectiveLocale(
      getBrowserLang() || ZSV_DEFAULT_LOCALE,
    );

    applyDefaultTheme(locale).then((themeConfig) => {
      if (!ignore) {
        setThemeConfig(themeConfig);
      }
    });

    return () => {
      ignore = true;
    };
  }, [setThemeConfig]);
}
