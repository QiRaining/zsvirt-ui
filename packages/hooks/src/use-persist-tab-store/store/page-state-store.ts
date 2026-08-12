import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ITabMemo } from "../interface/tab-memo";

interface IPageStateStore {
  tabMemo: ITabMemo;
  setTabMemo: (tabMemo: ITabMemo | ((prev: ITabMemo) => ITabMemo)) => void;
}

export const usePageStateStore = create<IPageStateStore>()(
  persist(
    (set) => ({
      tabMemo: {},
      setTabMemo: (tabMemo: ITabMemo | ((prev: ITabMemo) => ITabMemo)) => {
        if (typeof tabMemo === "function") {
          set((state) => ({ tabMemo: tabMemo(state.tabMemo) }));
        } else {
          set({ tabMemo });
        }
      },
    }),
    {
      name: "page-state-store",
    },
  ),
);
