import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";

import {
  DEFAULT_LEFT_NAV_KEY,
  DEFAULT_NAV_VIEW,
  LeftNavType,
  NavView,
} from "../constant";

/**
 * 监听 URL 中的 leftnav 和 navView 参数变化
 * 使用 React Router 的 useLocation 作为主要方式，同时手动监听浏览器 URL 变化
 * 以处理 single-spa 的 navigateToUrl 不触发 React Router 更新的情况
 * @returns 包含 leftNav 和 navView 的对象
 *   - leftNav: 默认为 LeftNavType.ClusterHost
 *   - navView: 默认为 NavView.Resource
 */
export const useUrlParamsWatcher = (): {
  leftNav: LeftNavType;
  navView: NavView;
  /** 直接来自浏览器 URL 的 search string，不受 React startTransition 延迟影响 */
  searchString: string;
  /** 直接来自浏览器 URL 的 pathname，不受 React startTransition 延迟影响 */
  pathname: string;
} => {
  const location = useLocation();
  const [searchString, setSearchString] = useState(() => location.search);
  const [pathname, setPathname] = useState(() => location.pathname);

  // 用 ref 保持最新值，让 monkey-patch 闭包始终能读到最新状态，
  // 避免 checkUrlChange 捕获过时的 searchString/pathname
  const searchStringRef = useRef(searchString);
  const pathnameRef = useRef(pathname);
  searchStringRef.current = searchString;
  pathnameRef.current = pathname;

  // 使用 React Router 的 location 变化时更新
  useEffect(() => {
    setSearchString(location.search);
    setPathname(location.pathname);
  }, [location.search, location.pathname]);

  // 额外监听浏览器 URL 变化（处理 single-spa 的 navigateToUrl 不触发 React Router 更新的情况）
  // 注意：monkey-patch 只注册一次（空依赖），避免每次 URL 变化都 cleanup/setup 导致：
  // 1. 与 single-spa 等其他 history patch 冲突（cleanup 恢复的"原始"可能是别人的 patch）
  // 2. 快速连续导航时多个 setTimeout 回调交错触发冗余 setState
  useEffect(() => {
    const checkUrlChange = () => {
      const currentSearch = window.location.search;
      const currentPathname = window.location.pathname;
      if (currentSearch !== searchStringRef.current) {
        setSearchString(currentSearch);
      }
      if (currentPathname !== pathnameRef.current) {
        setPathname(currentPathname);
      }
    };

    // 拦截 history.pushState 和 history.replaceState（single-spa 使用这些方法）
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      setTimeout(checkUrlChange, 0);
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      setTimeout(checkUrlChange, 0);
    };

    // 监听 popstate 事件（浏览器前进/后退）
    window.addEventListener("popstate", checkUrlChange);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", checkUrlChange);
    };
  }, []);

  return useMemo(() => {
    const params = new URLSearchParams(searchString);
    const leftNav =
      (params.get(DEFAULT_LEFT_NAV_KEY) as LeftNavType) ??
      LeftNavType.ClusterHost;
    const navViewParam = params.get(DEFAULT_NAV_VIEW);
    // 处理 navView 参数可能带 $ 后缀的情况
    const navViewValue = navViewParam?.endsWith("$")
      ? navViewParam.slice(0, -1)
      : navViewParam;
    const navView = Object.values(NavView).includes(navViewValue as NavView)
      ? (navViewValue as NavView)
      : NavView.Resource;
    return { leftNav, navView, searchString, pathname };
  }, [searchString, pathname]);
};
