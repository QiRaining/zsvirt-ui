import { produce } from "immer";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router";
import { useShallow } from "zustand/react/shallow";

import { ITabMemo } from "../interface/tab-memo";
import { usePageStateStore } from "../store/page-state-store";

// 获取 tabList 的 keys，用于稳定的依赖比较
const getTabKeys = (
  tabList: readonly (string | { key?: string })[],
): string[] =>
  tabList.map((tab) => (typeof tab === "string" ? tab : (tab?.key ?? "")));

export const usePersistTabState = (
  contentId: string | number,
  tabList: readonly (string | { key?: string })[],
  routerTabTarget?: string,
) => {
  const [tabMemo, setTabMemo] = usePageStateStore(
    useShallow((state) => [state.tabMemo, state.setTabMemo]),
  );
  const location = useLocation();
  const { pathname } = location;

  // 使用 ref 来跟踪是否已经处理过当前的 activeKey 校正
  const hasCheckedActiveKeyRef = useRef(false);
  const prevPathnameRef = useRef(pathname);
  const prevContentIdRef = useRef(contentId);

  // 当 pathname 或 contentId 变化时，重置检查标志
  // 使用 useEffect 来更新 ref，避免在渲染过程中访问 ref.current
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

  const onChange = useCallback(
    (key: string) => {
      setTabMemo((prevTabMemo) =>
        produce(prevTabMemo, (draft: ITabMemo) => {
          draft[pathname] = draft[pathname] ?? {};
          draft[pathname][contentId] = key;
        }),
      );
      window.needClearTab = false;
    },
    [pathname, contentId, setTabMemo],
  );

  useEffect(() => {
    if (routerTabTarget) {
      onChange(routerTabTarget);
    }
  }, [routerTabTarget, onChange]);

  // 处理 window.needClearTab 的逻辑移到 useEffect 中，避免在渲染过程中更新状态
  useEffect(() => {
    if (window.needClearTab) {
      setTabMemo((prevTabMemo) =>
        produce(prevTabMemo, (draft: ITabMemo) => {
          draft[pathname] = {};
        }),
      );
      window.needClearTab = false;
    }
  }, [pathname, setTabMemo]);

  // 稳定化 tabList 的 keys，避免因为数组引用变化导致的不必要更新
  const tabKeys = useMemo(() => getTabKeys(tabList), [tabList]);
  const tabKeysString = tabKeys.join(",");

  const activeKey = useMemo(() => {
    const defaultKey = tabKeys[0] ?? "";
    // 用来和ZSV的Link配合使用，如果是别的资源跳转过来就显示第1个标签页
    // 这里试了好多不同实现，包括通过Zustand-pub来跨子应用传值配合Context来使用，总是有不同的局限性
    // 跳转这件事情本身就是用户来触发的，监听路由的话会有另外的问题，所有用户触发的事件都不应该通过监听来实现
    // 虽然Window也不是很好，带了些侵入性和黑魔法的色彩，但是目前看来是最好的方案

    // 如果 window.needClearTab 为 true，直接返回默认值，状态更新由 useEffect 处理
    if (window.needClearTab) {
      return defaultKey;
    }

    const memoizedKey = tabMemo[pathname]?.[contentId];
    if (memoizedKey && tabKeys.includes(memoizedKey)) {
      return memoizedKey;
    }
    return defaultKey;
  }, [pathname, contentId, tabKeys, tabMemo]);

  // 修复无限循环：只在 tabKeys 变化时检查一次 activeKey 是否有效
  // 使用 tabKeysString 作为依赖，避免数组引用变化导致的问题
  useEffect(() => {
    // 如果已经检查过，跳过
    if (hasCheckedActiveKeyRef.current) {
      return;
    }

    if (tabKeys.length > 0 && !tabKeys.includes(activeKey)) {
      hasCheckedActiveKeyRef.current = true;
      onChange(tabKeys[0]);
    } else {
      // 标记已检查，即使不需要更新
      hasCheckedActiveKeyRef.current = true;
    }
  }, [tabKeysString]); // 只依赖 tabKeysString，不依赖 activeKey 和 onChange

  return {
    onChange,
    activeKey,
  };
};
