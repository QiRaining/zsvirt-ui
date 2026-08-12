# Zustand Pub

基于[zustand-pub](https://github.com/AwesomeDevin/zustand-pub)的实现，用于主子应用通信。原作者发的版本不对，直接源码我们自己维护。

## 使用

主应用

```ts
import { create } from "zustand";
import { CurrentUser } from "@zstack/main/src/app";
import { persist } from "zustand/middleware";
import PubStore from "./pub";

type Zone = any;
type ThemeConfig = Record<string, unknown>;

type Locale =
  | "en-US"
  | "zh-CN"
  | "zh-TW"
  | "de-DE"
  | "fr-FR"
  | "id-ID"
  | "ja-JP"
  | "ko-KR"
  | "ru-RU"
  | "th-TH";

interface IState {
  currentZone: Zone | null | {};
  currentUser: Partial<CurrentUser>;
  currentLocale: Locale;
  currentEnv: string;
  zopsSupportable: boolean;
  iam2View: "project" | "platform";
  currentStorage: string;
  recentVisitHistoryMap: { [key: string]: any };
  themeConfig?: ThemeConfig;
  authMap?: Map<string, string>;
}

interface IAction {
  setCurrentZone: (currentZone: Zone | {}) => void;
  setCurrentUser: (
    userOrUpdater:
      | Partial<CurrentUser>
      | ((prev: Partial<CurrentUser>) => Partial<CurrentUser>),
  ) => void;
  setCurrentLocale: (currentLocale: Locale) => void;
  setCurrentEnv: (currentEnv: string) => void;
  setZopsSupportable: (zopsSupportable: boolean) => void;
  setIam2View: (iam2View: "project" | "platform") => void;
  setCurrentStorage: (currentStorage: string) => void;
  setRecentVisitHistoryMap: (recentVisitHistoryMap: {
    [key: string]: any;
  }) => void;
  setThemeConfig: (themeConfig: ThemeConfig) => void;
  setAuthMap: (authMap?: Map<string, string>) => void;
}

const pubStore = new PubStore("zstack_cloud_global_store");
const store = pubStore.defineStore<IState & IAction>(
  "zstack_cloud_global_store",
  // @ts-ignore
  persist(
    (set) => ({
      currentZone: { uuid: "" },
      setCurrentZone: (currentZone: Zone | {}) => {
        set({ currentZone });
      },
      currentUser: {},
      setCurrentUser: (userOrUpdater) =>
        set((state) => {
          if (typeof userOrUpdater === "function") {
            return { currentUser: userOrUpdater(state.currentUser) };
          }
          return { currentUser: userOrUpdater };
        }),
      currentLocale: "zh-CN",
      setCurrentLocale: (currentLocale) => {
        set({ currentLocale });
      },
      currentEnv: "",
      setCurrentEnv: (currentEnv) => {
        set({ currentEnv });
      },
      zopsSupportable: true,
      setZopsSupportable: (zopsSupportable) => {
        set({ zopsSupportable });
      },
      iam2View: "platform",
      setIam2View: (iam2View) => {
        set({ iam2View });
      },
      currentStorage: "",
      setCurrentStorage: (currentStorage) => {
        set({ currentStorage });
      },
      recentVisitHistoryMap: {},
      setRecentVisitHistoryMap: (recentVisitHistoryMap: {
        [key: string]: any;
      }) => set({ recentVisitHistoryMap }),
      themeConfig: undefined,
      setThemeConfig: (themeConfig: ThemeConfig) => set({ themeConfig }),
      authMap: undefined,
      setAuthMap: (authMap: Map<string, string>) => set({ authMap }),
    }),
    { name: "zstack_cloud_global_store" },
  ),
);

export const usePlatformStore = create(store);
```

子应用

```ts
import { create } from "zustand";
import { PubStore } from "@zstack/utils";

type Zone = any;
type ThemeConfig = Record<string, unknown>;

type Locale = "en-US" | "zh-CN";

interface IState {
  currentZone: Zone | null | NonNullable<unknown>;
  currentUser: Partial<any>;
  currentLocale: any;
  currentEnv: string;
  zopsSupportable: boolean;
  iam2View: "project" | "platform";
  currentStorage: string;
  recentVisitHistoryMap: { [key: string]: any };
  themeConfig?: ThemeConfig;
}

interface IAction {
  setCurrentZone: (currentZone: Zone | NonNullable<unknown>) => void;
  setCurrentUser: (
    userOrUpdater: Partial<any> | ((prev: Partial<any>) => Partial<any>),
  ) => void;
  setCurrentLocale: (currentLocale: Locale) => void;
  setCurrentEnv: (currentEnv: string) => void;
  setZopsSupportable: (zopsSupportable: boolean) => void;
  setIam2View: (iam2View: "project" | "platform") => void;
  setCurrentStorage: (currentStorage: string) => void;
  setRecentVisitHistoryMap: (recentVisitHistoryMap: {
    [key: string]: any;
  }) => void;
  setThemeConfig: (themeConfig: ThemeConfig) => void;
}

const pubStore = new PubStore("zstack_cloud_global_store");
const store = pubStore.getStore<IState & IAction>("zstack_cloud_global_store");

const localStore = create<IState & IAction>((set) => ({
  currentZone: { uuid: "" },
  setCurrentZone: (currentZone: Zone | NonNullable<unknown>) =>
    set({ currentZone }),
  currentUser: { name: "lisi" },
  setCurrentUser: (userOrUpdater) =>
    set((state) => {
      if (typeof userOrUpdater === "function") {
        return { currentUser: userOrUpdater(state.currentUser) };
      }
      return { currentUser: userOrUpdater };
    }),
  currentLocale: "zh-CN",
  setCurrentLocale: (currentLocale) => {
    set({ currentLocale });
  },
  currentEnv: "",
  setCurrentEnv: (currentEnv) => {
    set({ currentEnv });
  },
  zopsSupportable: true,
  setZopsSupportable: (zopsSupportable) => {
    set({ zopsSupportable });
  },
  iam2View: "platform",
  setIam2View: (iam2View) => {
    set({ iam2View });
  },
  currentStorage: "",
  setCurrentStorage: (currentStorage) => {
    set({ currentStorage });
  },
  recentVisitHistoryMap: {},
  setRecentVisitHistoryMap: (recentVisitHistoryMap: { [key: string]: any }) =>
    set({ recentVisitHistoryMap }),
  themeConfig: undefined,
  setThemeConfig: (themeConfig: ThemeConfig) => set({ themeConfig }),
}));

export const usePlatformStore = (
  store && window.__POWERED_BY_QIANKUN__ ? create(store) : localStore
) as typeof localStore;
```
