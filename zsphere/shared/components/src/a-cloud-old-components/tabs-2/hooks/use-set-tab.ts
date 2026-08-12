import { usePageStateStore as useNewPageStateStore } from "@zstack/hooks";
import { produce } from "immer";
import { useLocation } from "react-router";
import { useShallow } from "zustand/react/shallow";

import { ITabMemo } from "../interface/tab-memo";
import { usePageStateStore } from "../store/page-state-store";

type SetTabMemoFn = (
  tabMemo: ITabMemo | ((prev: ITabMemo) => ITabMemo),
) => void;

export const useSetTab = () => {
  const [, setTabMemo] = usePageStateStore(
    useShallow((state) => [state.tabMemo, state.setTabMemo]),
  );
  const setNewTabMemo = useNewPageStateStore(
    (state) => state.setTabMemo,
  ) as SetTabMemoFn;

  const location = useLocation();
  const { pathname: _pathname } = location;
  const setTab = (contentId: string, newKey: string, newPath?: string) => {
    const pathname = newPath || _pathname;
    const updater = (prevTabMemo: ITabMemo) =>
      produce(prevTabMemo, (draft: ITabMemo) => {
        draft[pathname] = draft[pathname] ?? {};
        draft[pathname][contentId] = newKey;
      });
    // 双写：同时更新旧 store（Tabs2 使用）和新 store（@zstack/design Tabs 使用）
    setTabMemo(updater);
    setNewTabMemo(updater);
  };

  // 用来解决页面Tab嵌套的跳转， 其实有这个方法上面那个就可以不用了，
  // 但我看有些地方已经在用了，就加个新的吧。
  const setTabMultiple = (
    targets: { contentId: string; newKey: string; newPath?: string }[],
  ) => {
    const updater = (prevTabMemo: ITabMemo) =>
      produce(prevTabMemo, (draft: ITabMemo) => {
        targets.forEach(({ contentId, newKey, newPath }) => {
          const pathname = newPath || _pathname;
          draft[pathname] = draft[pathname] ?? {};
          draft[pathname][contentId] = newKey;
        });
      });
    // 双写
    setTabMemo(updater);
    setNewTabMemo(updater);
  };

  return { setTab, setTabMultiple };
};
