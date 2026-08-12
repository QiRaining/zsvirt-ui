"use client";
import React, { memo } from "react";
import type { ResolvedIntlConfig } from "react-intl";
import { IntlProvider } from "react-intl";

import enUS from "../../../i18n/locales/en-US.json";
import zhCN from "../../../i18n/locales/zh-CN.json";
import type { IConstantMap } from "../config";
import { ConfigProvider } from "../config";
import type { Locale } from "../locale-container/type";
const messages = {
  "zh-CN": zhCN,
  "en-US": enUS,
};
const useLocaleMessage = (locale: Locale) => {
  return messages[locale];
};

interface AppBaseProps {
  children: React.ReactNode;
  intlConfig: {
    messages: ResolvedIntlConfig["messages"];
    locale: string;
  };
  constant?: IConstantMap;
}

interface ConfigWrapperProps {
  children: React.ReactNode;
  constant?: IConstantMap;
}

export const ConfigWrapper = ({ children, constant }: ConfigWrapperProps) => {
  return <ConfigProvider constant={constant}>{children}</ConfigProvider>;
};

export const AppBase = memo(
  ({ children, intlConfig, constant }: AppBaseProps) => {
    const locale = intlConfig.locale;
    const localeMessages = useLocaleMessage(locale as Locale);

    return (
      <IntlProvider
        messages={{ ...localeMessages, ...intlConfig?.messages }}
        locale={locale}
        defaultLocale="zh-CN"
      >
        <ConfigWrapper constant={constant}>{children}</ConfigWrapper>
      </IntlProvider>
    );
  },
);

AppBase.displayName = "AppBase";
