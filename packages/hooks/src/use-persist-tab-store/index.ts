import { produce } from "immer";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import type { ITabMemo } from "./interface/tab-memo";
import { usePageStateStore } from "./store/page-state-store";

// 特殊情况
// 假设资源A有甲乙丙三个Tab
// 假设资源B有甲乙丙丁四个Tab
// 当资源B停留在丁Tab时，通过资源树切换A/B资源，此时就会造成用户切到资源A时看不到任何Tab
// 遇到这种情况时取A的第一项渲染
const ifKeyInTabList = (key: string, tabList: any[]) =>
  tabList.findIndex((tab) => tab === key || tab?.value === key) > -1;

// 获取 tabList 的 keys，用于稳定的依赖比较
const getTabKeys = (tabList: any[]): string[] =>
  tabList.map((tab) => (typeof tab === "string" ? tab : (tab?.value ?? "")));

export const usePersistTabState = (
  contentId: string | number,
  tabList: any[],
  routerTabTarget?: string,
) => {
  // 使用 useShallow 防止每次返回新数组引用导致无限 re-render
  const [tabMemo, setTabMemo] = usePageStateStore(
    useShallow((state) => [state.tabMemo, state.setTabMemo]),
  );
  const pathname =
    typeof window !== "undefined" ? window?.location.pathname : "Unknown";

  // 使用 ref 来跟踪是否已经处理过当前的 activeKey 校正，防止无限循环
  const hasCheckedActiveKeyRef = useRef(false);
  const prevPathnameRef = useRef(pathname);
  const prevContentIdRef = useRef(contentId);

  // 当 pathname 或 contentId 变化时，重置检查标志
  useEffect(() => {
    if (
      prevPathnameRef.current !== pathname ||
      prevContentIdRef.current !== contentId
    ) {
      hasCheckedActiveKeyRef.current = false;
      prevPathnameRef.current = pathname;
      prevContentIdRef.current = contentId;
    }
  }, [pathname, contentId]);

  // 稳定化 onChange，避免每次渲染创建新函数
  const onChange = useCallback(
    (key: string) => {
      setTabMemo((prev: ITabMemo) =>
        produce(prev, (draft: ITabMemo) => {
          draft[pathname] = draft[pathname] ?? {};
          draft[pathname][contentId] = key;
        }),
      );
    },
    [pathname, contentId, setTabMemo],
  );

  useEffect(() => {
    if (routerTabTarget) {
      onChange(routerTabTarget);
    }
  }, [routerTabTarget, onChange]);

  // 稳定化 tabList 的 keys，避免因为数组引用变化导致的不必要更新
  const tabKeys = useMemo(() => getTabKeys(tabList), [tabList]);
  const tabKeysString = tabKeys.join(",");

  const activeKey = useMemo(() => {
    const defaultKey = tabKeys[0] ?? "";
    const memoizedKey = tabMemo[pathname]?.[contentId];
    if (memoizedKey && ifKeyInTabList(memoizedKey, tabList)) {
      return memoizedKey;
    }
    return defaultKey;
  }, [pathname, contentId, tabKeys, tabList, tabMemo]);

  // 修复无限循环：只在 tabKeys 变化时检查一次 activeKey 是否有效
  // 使用 tabKeysString 作为依赖，避免数组引用变化导致的问题
  useEffect(() => {
    if (hasCheckedActiveKeyRef.current) {
      return;
    }

    if (tabKeys.length > 0 && !tabKeys.includes(activeKey)) {
      hasCheckedActiveKeyRef.current = true;
      onChange(tabKeys[0]);
    } else {
      hasCheckedActiveKeyRef.current = true;
    }
  }, [tabKeysString]);

  return {
    onChange,
    activeKey,
  };
};
