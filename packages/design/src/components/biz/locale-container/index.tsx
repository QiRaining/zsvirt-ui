"use client";
import type { FC } from "react";
import { IntlProvider } from "react-intl";

import enUS from "../../../i18n/locales/en-US.json";
import zhCN from "../../../i18n/locales/zh-CN.json";
import type { LocaleContainerProps, Locale } from "./type";

// todo: 等文件大了做动态加载，现在没空
const messages = {
  "zh-CN": zhCN,
  "en-US": enUS,
};
const useLocaleMessage = (locale: Locale) => {
  return messages[locale];
};

export const LocaleContainer: FC<LocaleContainerProps> = ({
  children,
  currentLocale,
  messages,
}) => {
  const localeMessages = useLocaleMessage(currentLocale);
  return (
    <IntlProvider
      messages={{ ...localeMessages, ...messages }}
      locale={currentLocale || "zh-CN"}
      defaultLocale="zh-CN"
    >
      {children}
    </IntlProvider>
  );
};
