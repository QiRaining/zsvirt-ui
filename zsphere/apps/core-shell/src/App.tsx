import { ApolloProvider } from "@apollo/client";
import { OverlayProvider, Toaster } from "@zstack/design";
import {
  platformStore,
  usePlatformStore,
} from "@zstack/zsphere-platform-store";
import type { ActionTaskResult } from "@zstack/zsphere-types/graphql";
import { setLocaleToStorage } from "@zstack/zsphere-utils";
import React, { useEffect } from "react";
import { scan } from "react-scan";
import { Subject } from "rxjs";

import I18nDebugProvider from "./components/i18n-debug-provider";
import { useApplyDefaultTheme } from "./hooks/use-default-theme.ts";
import { useI18nLoader } from "./hooks/use-i18n-loader.ts";

/* CSS Cascade Layers 声明 - 必须最先加载 */
import "./layers.css";
/* Tailwind CSS - 核心样式系统（包含 @zstack/design token） */
import "./tailwind.css";
/* Less 全局样式 - antd 和旧组件库（已包裹在 @layer 中） */
import "./global.less";
import { Router } from "./routes/router.tsx";
import client from "./utils/apollo.ts";
import {
  getZsvEffectiveLocale,
  isZsvEnglishOnlyMode,
  ZSV_ENGLISH_LOCALE,
} from "./utils/locale-mode.ts";
import "./common.ts";

if (process.env.NODE_ENV === "development") {
  // 默认关闭 react-scan 扫描，只保留工具栏，避免帧率/渲染扫描开关启动即开启
  localStorage.setItem(
    "react-scan-options",
    JSON.stringify({ enabled: false, showToolbar: true }),
  );
  scan({ enabled: false, showToolbar: true });
}

const actionRespSubject = new Subject<{
  data: ActionTaskResult;
  type: "progress" | "finish";
}>();

window.g_action_subscribe = actionRespSubject;

const UnifieWrapper = ({ children }: { children: React.ReactNode }) => {
  useApplyDefaultTheme();

  return children;
};

const App = () => {
  const platformLocale = usePlatformStore((state) => state.locale);
  const currentLocale = getZsvEffectiveLocale(platformLocale);
  const setApolloClient = usePlatformStore((state) => state.setApolloClient);
  const { messages, loading: i18nLoading } = useI18nLoader(currentLocale);

  useEffect(() => {
    setApolloClient(client);
  }, [setApolloClient]);

  useEffect(() => {
    if (!isZsvEnglishOnlyMode() || platformLocale === ZSV_ENGLISH_LOCALE) {
      return;
    }

    setLocaleToStorage(ZSV_ENGLISH_LOCALE);
    platformStore.setState({ locale: ZSV_ENGLISH_LOCALE });
  }, [platformLocale]);

  if (i18nLoading) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <I18nDebugProvider locale={currentLocale} messages={messages}>
        <OverlayProvider>
          <Toaster />
          <UnifieWrapper>
            <Router />
          </UnifieWrapper>
        </OverlayProvider>
      </I18nDebugProvider>
    </ApolloProvider>
  );
};

export default App;
