import { useAuthMap } from "@zstack/zsphere-components";
import { platformStore } from "@zstack/zsphere-platform-store";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";

import NoVnc from "./components";
import type { NoVncProps } from "./context";
import NoVncContext, { getInitOptions } from "./context";
import { getSessionContext } from "./session-context";
import useCheckAuth from "./use-check-auth";

import style from "./style.module.less";

const getDefaultFavicon = (locale?: string) => {
  const effectiveLocale = locale === "en-US" ? "en-US" : "zh-CN";
  return `/public/theme/default/${effectiveLocale}/favicon.ico`;
};

const App = () => {
  const [favicon, setFavicon] = useState(getDefaultFavicon());
  const context = useContext(NoVncContext);

  const language = context?.store?.options?.language;

  useEffect(() => {
    if (language) {
      window.localStorage.setItem("umi_locale", language);
      platformStore.setState({ locale: language });
    }
  }, [language]);

  useEffect(() => {
    setFavicon(getDefaultFavicon(language));
  }, [language]);

  return (
    <div className={style.novncContainer}>
      <Helmet>
        <link rel="shortcut icon" type="images/x-icon" href={favicon} />
      </Helmet>
      <NoVnc />
    </div>
  );
};

const AppWrap: React.FC = () => {
  const [, setAuthList] = useAuthMap();
  const [store, setStore] = useState<NoVncProps>(() => {
    const { options, rfbOptions, reconnectTimes } = getInitOptions();
    return {
      options,
      rfbOptions,
      reconnectTimes,
    };
  });

  useCheckAuth(store);

  useEffect(() => {
    const referer = store.options?.referer;

    if (!window.opener || !referer) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      const sessionContext = getSessionContext(event, referer);

      if (!sessionContext) {
        return;
      }

      if (sessionContext.sessionId) {
        localStorage.setItem("sessionId", sessionContext.sessionId);
      }
      setAuthList(sessionContext.authList);
    };

    window.addEventListener("message", handleMessage);
    window.opener.postMessage({ type: "novnc-action-loaded" }, referer);

    return () => window.removeEventListener("message", handleMessage);
  }, [setAuthList, store.options?.referer]);

  const contextValue = useMemo(
    () => ({
      store,
      setStore,
    }),
    [store],
  );

  return (
    <NoVncContext.Provider value={contextValue}>
      <App />
    </NoVncContext.Provider>
  );
};

export default AppWrap;
