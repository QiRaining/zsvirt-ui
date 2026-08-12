import { AuthProvider } from "@zstack/auth";
import { ConfigProvider as DesignConfigProvider } from "@zstack/design";
import { SuspenseBoundary } from "@zstack/error-boundary";
import { TimeProvider, useServerTime } from "@zstack/hooks";
import {
  ConfigProvider as ZStackConfigProvider,
  customRenderEmpty,
  useRegisterHotKeyListener,
} from "@zstack/zsphere-components";
import { useConstantMap } from "@zstack/zsphere-constant";
import { useUserIdentity } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { bus } from "@zstack/zsphere-utils";
import { ConfigProvider } from "antd";
import enUS from "antd/es/locale/en_US";
import type { Locale } from "antd/lib/locale-provider";
import { lazy, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { Navigate, Outlet } from "react-router";

import { useClearAuthCache } from "../debug/auth";
import { isPublicPath } from "../utils/isPublicPath";
import {
  getZsvEffectiveLocale,
  ZSV_DEFAULT_LOCALE,
  ZSV_ENGLISH_LOCALE,
  ZSV_ENGLISH_ONLY,
} from "../utils/locale-mode.ts";
import ChangePasswordModal from "./header/user/actions/change-password";
import { useOAuth1 } from "./hooks/use-oauth1.ts";
import { useValidateCurrentUser } from "./hooks/use-validate-current-user";
import MainLayout from "./main.tsx";

const TelemetryConsentGate = lazy(
  () => import("zsv_administration/src/features/telemetry/consent-gate"),
);

const TelemetryConsentGateBoundary = ({ blocked }: { blocked: boolean }) => {
  const { isSystemAdmin } = useUserIdentity();

  if (!isSystemAdmin) {
    return null;
  }

  return (
    <SuspenseBoundary
      loadingFallback={null}
      suspenseFallback={null}
      diagnosticsSource="TelemetryConsentGate"
      diagnosticsGlobalKey="__ZSV_LAST_TELEMETRY_GATE_ERROR__"
      onError={(error, _info, diagnostics) => {
        console.error("[telemetry] gate remote failed", {
          remote: "zsv_administration",
          module: "src/features/telemetry/consent-gate",
          error,
          diagnostics,
        });
      }}
    >
      <TelemetryConsentGate blocked={blocked} />
    </SuspenseBoundary>
  );
};

const ANT_LOCALE_MAPPING = ZSV_ENGLISH_ONLY
  ? {
      [ZSV_ENGLISH_LOCALE]: () => Promise.resolve({ default: enUS }),
    }
  : {
      [ZSV_DEFAULT_LOCALE]: () => import("antd/es/locale/zh_CN"),
      [ZSV_ENGLISH_LOCALE]: () => Promise.resolve({ default: enUS }),
    };

// @zstack/design 的 Spin 已内置 Loader 作为默认 indicator，不需要 setDefaultIndicator

const RenderPage = () => {
  if (location.pathname === "/") {
    return <Navigate to="/virtualization-dashboard" replace />;
  }

  if (isPublicPath()) {
    return <Outlet />;
  }

  return <MainLayout />;
};

const BasicLayout = () => {
  const { millionSecondsGap, timezone } = useServerTime();
  // 分开订阅，避免创建新数组导致不必要的重渲染
  const authMap = usePlatformStore((state) => state.authMap);

  //console.log(authList, "BasicLayout");

  //  校验当前用户是否存在
  useValidateCurrentUser();

  useClearAuthCache();

  useRegisterHotKeyListener();

  useEffect(() => {
    bus.addListener("PasswordExpired", (code: string) => {
      setErrorCode(code);
      setVisible(true);
    });
    return () => bus.removeListener("PasswordExpired");
  }, []);

  // 单点登录
  useOAuth1();

  const [visible, setVisible] = useState<boolean>(false);
  const [errorCode, setErrorCode] = useState<string>("");

  const intl = useIntl();
  const constant = useConstantMap(intl);

  const [antLocale, setAntLocale] = useState<Locale>(enUS);
  const isFirstLoad = useRef(true);

  const locale = getZsvEffectiveLocale(intl.locale);

  useEffect(() => {
    const loadLocale = async () => {
      const localeKey = locale as keyof typeof ANT_LOCALE_MAPPING;
      if (ANT_LOCALE_MAPPING[localeKey]) {
        const localeModule = await ANT_LOCALE_MAPPING[localeKey]();
        // 只在实际需要切换语言时才更新，避免不必要的重渲染
        if (isFirstLoad.current || localeModule.default !== antLocale) {
          setAntLocale(localeModule.default);
          isFirstLoad.current = false;
        }
      } else {
        // Fallback to a default locale if the current one is not mapped
        const defaultLocaleModule =
          await ANT_LOCALE_MAPPING[ZSV_ENGLISH_LOCALE]();
        if (isFirstLoad.current || defaultLocaleModule.default !== antLocale) {
          setAntLocale(defaultLocaleModule.default);
          isFirstLoad.current = false;
        }
      }
    };
    loadLocale();
  }, [antLocale, locale]);

  return (
    <ConfigProvider
      locale={antLocale}
      renderEmpty={(componentName?: string) =>
        customRenderEmpty({ type: componentName })
      }
      autoInsertSpaceInButton={false}
    >
      <ZStackConfigProvider constant={constant}>
        <AuthProvider map={authMap || new Map()}>
          <DesignConfigProvider constant={constant}>
            <TimeProvider
              serverTime={{
                millionSecondsGap,
                timezone,
              }}
            >
              <RenderPage />
              <ChangePasswordModal
                visible={visible}
                setVisible={setVisible}
                errorCode={errorCode}
              />
              <TelemetryConsentGateBoundary blocked={visible} />
            </TimeProvider>
          </DesignConfigProvider>
        </AuthProvider>
      </ZStackConfigProvider>
    </ConfigProvider>
  );
};

export default BasicLayout;
