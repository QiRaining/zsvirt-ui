import { produce } from "immer";
import { useEffect, useMemo } from "react";

import type { ITabMemo } from "../interface/tab-memo";
import { usePageStateStore } from "../store/page-state-store";

// 特殊情况
// 假设资源A有甲乙丙三个Tab
// 假设资源B有甲乙丙丁四个Tab
// 当资源B停留在丁Tab时，通过资源树切换A/B资源，此时就会造成用户切到资源A时看不到任何Tab
// 遇到这种情况时取A的第一项渲染
const ifKeyInTabList = (key: string, tabList: any[]) =>
  tabList.findIndex((tab) => tab === key || tab?.value === key) > -1;

export const usePersistTabState = (
  contentId: string | number,
  tabList: any[],
  routerTabTarget?: string,
) => {
  const [tabMemo, setTabMemo] = usePageStateStore((state) => [
    state.tabMemo,
    state.setTabMemo,
  ]);
  const pathname =
    typeof window !== "undefined" ? window?.location.pathname : "Unknown";
  const onChange = (key: string) => {
    setTabMemo(
      produce(tabMemo, (draft: ITabMemo) => {
        draft[pathname] = draft[pathname] ?? {};
        draft[pathname][contentId] = key;
      }),
    );
  };

  useEffect(() => {
    if (routerTabTarget) {
      onChange(routerTabTarget);
    }
  }, [routerTabTarget]);

  const activeKey = useMemo(() => {
    const defaultKey =
      typeof tabList[0] === "string" ? tabList[0] : (tabList[0]?.value ?? "");
    const memoizedKey = tabMemo[pathname]?.[contentId];
    if (memoizedKey && ifKeyInTabList(memoizedKey, tabList)) {
      return memoizedKey;
    }
    return defaultKey;
  }, [pathname, contentId, tabList, tabMemo]);

  useEffect(() => {
    const keys = tabList.map((tab) =>
      typeof tab === "string" ? tab : (tab?.value ?? ""),
    );
    if (!keys.some((key) => key === activeKey)) {
      onChange(keys[0]);
    }
  }, [activeKey, tabList]);
  return {
    onChange,
    activeKey,
  };
};
