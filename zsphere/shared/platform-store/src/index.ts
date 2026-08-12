import { create, useStore, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import type { IPlatformStore } from "./type";
import { createSetter, flatStorage } from "./utils";

const defaultThemeConfig = {
  themeMode: "light",
  themeColor: "blue",
  browserTitle: "ZStack",
  favicon: "/public/theme/default/zh-CN/favicon.ico",
  loginTitle: "欢迎使用 ZStack 云平台",
  loginLogo: "/public/theme/default/zh-CN/logo.svg",
  bannerLogo: "/public/theme/default/zh-CN/logo-bar.svg",
  bannerTitle: "ZStack 云平台",
  bannerFontSize: "14px",
  overviewTitle: "ZStack实时监控",
  overviewMode: "classicalBlue",
  overviewMonitorType: "externalMonitor",
};

export const platformStore: StoreApi<IPlatformStore> = create(
  persist(
    (set) => ({
      apolloClient: {} as any,
      setApolloClient: createSetter(set, "apolloClient"),
      locale: navigator.language.startsWith("zh") ? "zh-CN" : "en-US",
      setLocale: createSetter(set, "locale"),
      antdLocale: {},
      setAntdLocale: createSetter(set, "antdLocale"),
      intl: {} as any,
      setIntl: createSetter(set, "intl"),
      loginType: "IAM1",
      setLoginType: createSetter(set, "loginType"),
      systemView: "Admin",
      setSystemView: createSetter(set, "systemView"),
      userType: "local",
      setUserType: createSetter(set, "userType"),
      currentZone: {},
      setCurrentZone: createSetter(set, "currentZone"),
      currentUser: {},
      setCurrentUser: createSetter(set, "currentUser"),
      recentVisitHistoryMap: {},
      setRecentVisitHistoryMap: createSetter(set, "recentVisitHistoryMap"),
      searchHistory: {},
      setSearchHistory: createSetter(set, "searchHistory"),
      managementNode: {},
      setManagementNode: createSetter(set, "managementNode"),
      docReaderPath: "",
      setDocReaderPath: createSetter(set, "docReaderPath"),
      customColumnConfig: {},
      setCustomColumnConfig: createSetter(set, "customColumnConfig"),
      customizedLicenseNameInfo: {},
      setCustomizedLicenseNameInfo: createSetter(
        set,
        "customizedLicenseNameInfo",
      ),
      themeConfig: defaultThemeConfig,
      setThemeConfig: createSetter(set, "themeConfig"),
      authMap: new Map(),
      setAuthMap: createSetter(set, "authMap"),
      fileResume: {},
      setFileResume: createSetter(set, "fileResume"),
      storagePackageResume: {},
      setStoragePackageResume: createSetter(set, "storagePackageResume"),
      migrationServicePackageResume: {},
      setMigrationServicePackageResume: createSetter(
        set,
        "migrationServicePackageResume",
      ),
      currentEnv: "virtualization" as const,
      setCurrentEnv: createSetter(set, "currentEnv"),
      currentStorage: {},
      setCurrentStorage: createSetter(set, "currentStorage"),
      currentZMigrate: {},
      setCurrentZMigrate: createSetter(set, "currentZMigrate"),
      openPlatformStatus: false,
      setOpenPlatformStatus: createSetter(set, "openPlatformStatus"),
      zopsSupportable: false,
      setZOpsSupportable: createSetter(set, "zopsSupportable"),
      agentVoucher: "",
      setAgentVoucher: createSetter(set, "agentVoucher"),
      isBootstrap: false,
      setIsBootstrap: createSetter(set, "isBootstrap"),
      storageSessionId: "",
      setStorageSessionId: createSetter(set, "storageSessionId"),
      i18nDebugMode: false,
      setI18nDebugMode: createSetter(set, "i18nDebugMode"),
    }),
    { name: "zsphere_platform_store", storage: flatStorage },
  ),
);

const identity = (state: IPlatformStore): IPlatformStore => state;

export function usePlatformStore(): IPlatformStore;
export function usePlatformStore<T>(selector: (state: IPlatformStore) => T): T;
export function usePlatformStore<T>(selector?: (state: IPlatformStore) => T) {
  return useStore(
    platformStore,
    useShallow((selector ?? identity) as (state: IPlatformStore) => T),
  );
}

export {
  resourceTreeArrangeKeys,
  resourceTreeOrderDirections,
  resourceTreeSettingsDefaultValues,
  toResourceTreeQueryVariables,
  useVirtualizationResourceStore,
  type ResourceTreeSettingsFormValues,
} from "./virtualization-resource-store";
export { useAlarmStore } from "./alarm-message";
export type { ThemeConfig } from "./type";
