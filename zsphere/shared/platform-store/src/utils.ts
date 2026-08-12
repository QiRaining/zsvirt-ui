import { isFunction } from "lodash-es";
import type { StoreApi } from "zustand";

import type { IPlatformStoreState } from "./type";

type SetterValue<T extends keyof IPlatformStoreState> =
  | IPlatformStoreState[T]
  | ((prev: IPlatformStoreState[T]) => IPlatformStoreState[T]);

function isSetterUpdater<T extends keyof IPlatformStoreState>(
  value: SetterValue<T>,
): value is (prev: IPlatformStoreState[T]) => IPlatformStoreState[T] {
  return isFunction(value);
}

export function createSetter<T extends keyof IPlatformStoreState>(
  set: StoreApi<IPlatformStoreState>["setState"],
  name: T,
) {
  return (value: SetterValue<T>) => {
    if (!isSetterUpdater(value)) {
      set({ [name]: value });
    } else {
      set((store) => {
        const prevValue = store[name];
        const newValue = value(prevValue);
        return { [name]: newValue };
      });
    }
  };
}

const persistedKeyMap: Record<string, keyof IPlatformStoreState> = {
  locale: "locale",
  currentZone: "currentZone",
  currentUser: "currentUser",
  recentVisitHistoryMap: "recentVisitHistoryMap",
  searchHistory: "searchHistory",
  managementNode: "managementNode",
  loginType: "loginType",
  systemView: "systemView",
  customColumnConfig: "customColumnConfig",
  customizedLicenseNameInfo: "customizedLicenseNameInfo",
  currentEnv: "currentEnv",
  currentStorage: "currentStorage",
  zopsSupportable: "zopsSupportable",
  currentZMigrate: "currentZMigrate",
  usertype: "userType",
  agentVoucher: "agentVoucher",
  isBootstrap: "isBootstrap",
  openPlatformStatus: "openPlatformStatus",
};

export const flatStorage = {
  getItem: () => {
    const state: Partial<IPlatformStoreState> = {};
    Object.entries(persistedKeyMap).forEach(([persistedKey, storeKey]) => {
      const item = localStorage.getItem(persistedKey);
      if (item) {
        try {
          state[storeKey] = JSON.parse(item);
        } catch {
          // ignore
        }
      }
    });
    return { state };
  },
  setItem: (_: string, { state }: { state: Partial<IPlatformStoreState> }) => {
    Object.entries(persistedKeyMap).forEach(([persistedKey, storeKey]) => {
      try {
        const item = state[storeKey];
        if (item !== undefined) {
          localStorage.setItem(persistedKey, JSON.stringify(item));
        }
      } catch {
        // ignore
      }
    });
  },
  removeItem: () => {
    Object.keys(persistedKeyMap).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};
