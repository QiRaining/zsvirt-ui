import { create } from "zustand";

interface AppStore {
  /**
   * 应用名称
   */
  appName: string;
  /**
   * 设置应用名称
   */
  setAppName: (name: string) => void;
  /**
   * 用户信息
   */
  user: {
    id: string;
    name: string;
  } | null;
  /**
   * 设置用户信息
   */
  setUser: (user: { id: string; name: string } | null) => void;
  /**
   * 重置状态
   */
  reset: () => void;
}

/**
 * 应用状态管理 Store
 * 展示如何使用 Zustand 进行状态管理
 */
export const useAppStore = create<AppStore>((set) => ({
  appName: "zsv-app-template",
  setAppName: (name) => set({ appName: name }),
  user: null,
  setUser: (user) => set({ user }),
  reset: () =>
    set({
      appName: "zsv-app-template",
      user: null,
    }),
}));
