import type { ApolloClient } from "@apollo/client";
import type { CurrentUser } from "@zstack/zsphere-types";
import type { Zone } from "@zstack/zsphere-types/graphql";
import type { IntlShape } from "react-intl";

export interface IManagementNodeInfo {
  isDoubleManagementNode?: boolean;
}

export type UserSearchHistory = Record<string, Record<string, string[]>>;
export type CustomColumnConfig = Record<string, string[]>;
export type CustomizedLicenseNameInfo = Record<string, string[]>;
export type LoginType = "IAM1" | "IAM2";
export type SystemView = "Admin" | "Normal";
export type IAM2ViewType = "platform" | "project";
export type UserType = "local" | "adldap" | "cas" | "external";
export type Env = "cloud" | "cube" | "virtualization";
export type ThemeMode = "light" | "dark";

export interface ThemeConfig {
  oem?: boolean;
  oemKey?: string;
  themeMode?: ThemeMode | string;
  themeColor?: string;
  browserTitle?: string;
  loginTitle?: string;
  loginLogo?: string;
  bannerLogo?: string;
  bannerTitle?: string;
  bannerFontSize?: string;
  favicon?: string;
  overviewTitle?: string;
  overviewMode?: string;
  overviewMonitorType?: string;
  versonName?: string;
  versonNumber?: string;
  helperAboutUpdate?: string;
  email?: string;
  phone?: string;
  helpDocument?: string;
  copyRight?: string;
}

export interface IPlatformStoreState {
  apolloClient: ApolloClient<any>;
  locale: string;
  antdLocale: any;
  intl: IntlShape;
  loginType: LoginType;
  systemView: SystemView;
  userType: UserType;
  currentZone: Partial<Zone>;
  currentUser: Partial<CurrentUser>;
  recentVisitHistoryMap: Record<string, any>;
  searchHistory: UserSearchHistory;
  managementNode: IManagementNodeInfo;
  docReaderPath: string;
  customColumnConfig: CustomColumnConfig;
  customizedLicenseNameInfo: CustomizedLicenseNameInfo;
  themeConfig: ThemeConfig;
  fileResume: Record<string, any>;
  storagePackageResume: Record<string, any>;
  migrationServicePackageResume: Record<string, any>;
  authMap: Map<string, string>;
  currentEnv: Env;
  currentStorage: Record<string, any>;
  currentZMigrate: Record<string, any>;
  openPlatformStatus: boolean;
  zopsSupportable: boolean;
  agentVoucher: string;
  storageSessionId: string;
  isBootstrap: boolean;
  i18nDebugMode: boolean;
}

export type Setter<T> = (value: T | ((prev: T) => T)) => void;

export interface IPlatformStoreAction {
  setApolloClient: Setter<ApolloClient<unknown>>;
  setLocale: Setter<string>;
  setAntdLocale: Setter<any>;
  setIntl: Setter<IntlShape>;
  setLoginType: Setter<LoginType>;
  setSystemView: Setter<SystemView>;
  setUserType: Setter<UserType>;
  setCurrentZone: Setter<Partial<Zone>>;
  setCurrentUser: Setter<Partial<CurrentUser>>;
  setRecentVisitHistoryMap: Setter<Record<string, any>>;
  setSearchHistory: Setter<UserSearchHistory>;
  setManagementNode: Setter<IManagementNodeInfo>;
  setDocReaderPath: Setter<string>;
  setCustomColumnConfig: Setter<CustomColumnConfig>;
  setCustomizedLicenseNameInfo: Setter<CustomizedLicenseNameInfo>;
  setThemeConfig: Setter<ThemeConfig>;
  setFileResume: Setter<Record<string, any>>;
  setStoragePackageResume: Setter<Record<string, any>>;
  setMigrationServicePackageResume: Setter<Record<string, any>>;
  setCurrentEnv: Setter<Env>;
  setAuthMap: Setter<Map<string, string>> | undefined;
  setCurrentStorage: Setter<Record<string, any>>;
  setCurrentZMigrate: Setter<Record<string, any>>;
  setOpenPlatformStatus: Setter<boolean>;
  setZOpsSupportable: Setter<boolean>;
  setAgentVoucher: Setter<string>;
  setStorageSessionId: Setter<string>;
  setIsBootstrap: Setter<boolean>;
  setI18nDebugMode: Setter<boolean>;
}

export type IPlatformStore = IPlatformStoreState & IPlatformStoreAction;
