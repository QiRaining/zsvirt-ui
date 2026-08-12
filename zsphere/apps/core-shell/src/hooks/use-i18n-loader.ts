import alova from "@zstack/alova-instance";
import { useEffect, useState } from "react";

import {
  getZsvEffectiveLocale,
  ZSV_DEFAULT_LOCALE,
  ZSV_ENGLISH_LOCALE,
  ZSV_ENGLISH_ONLY,
} from "../utils/locale-mode";

type LocaleMessages = Record<string, string>;

const localeCache = new Map<string, LocaleMessages>();

// 静态资源路径配置 - 使用 alova 获取
const STATIC_LOCALE_MAPPING = ZSV_ENGLISH_ONLY
  ? {
      [ZSV_ENGLISH_LOCALE]: () =>
        alova.Get<LocaleMessages>("/i18n/zstack/zsv/locale/en-US.json").send(),
    }
  : {
      [ZSV_DEFAULT_LOCALE]: () =>
        alova.Get<LocaleMessages>("/i18n/zstack/zsv/locale/zh-CN.json").send(),
      [ZSV_ENGLISH_LOCALE]: () =>
        alova.Get<LocaleMessages>("/i18n/zstack/zsv/locale/en-US.json").send(),
    };

/**
 * 国际化消息加载器 Hook
 * @param currentLocale 当前语言环境
 * @returns 返回消息对象和加载状态
 */
export const useI18nLoader = (currentLocale: string) => {
  const [messages, setMessages] = useState<LocaleMessages>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      const effectiveLocale = getZsvEffectiveLocale(currentLocale);
      // 检查缓存
      if (localeCache.has(effectiveLocale)) {
        setMessages(localeCache.get(effectiveLocale)!);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // 首先尝试从静态资源目录获取（使用 alova）
        const staticLoader =
          STATIC_LOCALE_MAPPING[
            effectiveLocale as keyof typeof STATIC_LOCALE_MAPPING
          ] ||
          STATIC_LOCALE_MAPPING[
            (ZSV_ENGLISH_ONLY
              ? ZSV_ENGLISH_LOCALE
              : ZSV_DEFAULT_LOCALE) as keyof typeof STATIC_LOCALE_MAPPING
          ];

        try {
          const cloudLocale = await staticLoader();
          localeCache.set(effectiveLocale, cloudLocale);
          setMessages(cloudLocale);
          return;
        } catch (staticError) {
          console.warn(
            `Failed to load static locale from /i18n/ for ${effectiveLocale}, trying fallback:`,
            staticError,
          );

          localeCache.set(effectiveLocale, {});
          setMessages({});
        }
      } catch (error) {
        console.warn(
          `Failed to load cloud messages for locale ${effectiveLocale}:`,
          error,
        );
        setMessages({});
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [currentLocale]);

  return { messages, loading };
};
