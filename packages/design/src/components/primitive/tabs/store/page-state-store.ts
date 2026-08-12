import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ITabMemo } from "../interface/tab-memo";

interface IPageStateStore {
  tabMemo: ITabMemo;
  setTabMemo: (tabMemo: ITabMemo) => void;
}

export const usePageStateStore = create<IPageStateStore>()(
  persist(
    (set) => ({
      tabMemo: {},
      setTabMemo: (tabMemo: ITabMemo) => set({ tabMemo }),
    }),
    {
      name: "page-state-store",
    },
  ),
);
