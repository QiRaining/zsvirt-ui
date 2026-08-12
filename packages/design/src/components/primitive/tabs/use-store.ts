import { produce } from "immer";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// state
export type State = {
  tabStore: {
    [pathname: string]: {
      [contentId: string]: string | undefined;
    };
  };
};

// action
export type Action = {
  setTabStore: (pathname: string, contentId?: string, value?: string) => void;
};
export const useTabStore = create<State & Action>()(
  devtools(
    persist(
      (set) => ({
        tabStore: {},
        setTabStore: (pathname, contentId, value) =>
          set((state) => {
            // 如果没传contentId说明该页面初次访问
            if (!contentId) {
              return {
                tabStore: produce(state.tabStore, (draft) => {
                  draft[pathname] = {};
                }),
              };
            }
            return {
              tabStore: produce(state.tabStore, (draft) => {
                draft[pathname][contentId] = value;
              }),
            };
          }),
      }),
      {
        name: "zstack_design_store",
      },
    ),
  ),
);
