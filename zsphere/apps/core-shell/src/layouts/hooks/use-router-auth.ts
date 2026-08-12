import {
  Link as ZSVLink,
  useGetActiveMenuItem,
} from "@zstack/zsphere-components";
import { useAuth } from "@zstack/zsphere-components";
import { getMenuTree } from "@zstack/zsphere-config";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { IMenu } from "@zstack/zsphere-types";
import { useMemo } from "react";
import { useLocation } from "react-router";

import { isPublicPath } from "../../utils/isPublicPath";
import { useConfigAuth } from "../../utils/use-config-auth";

/**
 * 冒泡检查：当前资源无权限时，检查同一应用区域内是否有其他菜单项有权限。
 * 如果有，放行让 SubAppLayout 自动重定向到第一个有权限的菜单项。
 *
 * 逻辑：根据 pathname 找到所属的顶级菜单（如 virtualization.administration），
 * 然后遍历该顶级菜单下所有叶子节点，只要有一个叶子有权限就放行。
 */
function hasAnyAuthInApp(
  pathname: string,
  hasAuth: (params: any) => boolean,
): boolean {
  const menuTree = getMenuTree();

  // 根据 pathname 找到所属顶级菜单
  const appBase = `/${pathname.split("/")[1]}`; // e.g. "/virtualization-administration"
  const topMenu = menuTree.find(
    (menu) => menu.path && pathname.startsWith(menu.path),
  );

  if (!topMenu) {
    return false;
  }

  // 收集所有叶子 key
  const collectLeafKeys = (
    items: Array<IMenu>,
    keys: string[],
    visited = new Set<string>(),
  ) => {
    for (const item of items) {
      if (visited.has(item.key)) {
        continue;
      }
      visited.add(item.key);

      if (item.tabs?.length) {
        collectLeafKeys(item.tabs as IMenu[], keys, visited);
      } else if (item.children?.length) {
        collectLeafKeys(item.children, keys, visited);
      } else {
        keys.push(item.key);
      }
    }
  };

  const leafKeys: string[] = [];
  if (topMenu.children?.length) {
    collectLeafKeys(topMenu.children, leafKeys);
  }
  if (topMenu.tabs?.length) {
    collectLeafKeys(topMenu.tabs as IMenu[], leafKeys);
  }

  return leafKeys.some(
    (key) =>
      hasAuth({ resource: key, type: "view", authKey: "list" }) ||
      hasAuth({ resource: key, type: "view", authKey: "detail" }),
  );
}

export function useRouterAuth() {
  // 分开订阅每个状态字段，避免订阅整个 currentUser 对象
  const currentUser = usePlatformStore((state) => state.currentUser);
  const accountUuid = currentUser?.accountUuid;
  const currentIdentity = currentUser?.currentIdentity;

  const { hasAuth, noSet } = useAuth();
  const { hasConfig, configLoading } = useConfigAuth();
  const location = useLocation();
  const { activeItems } = useGetActiveMenuItem();
  const { pathname } = location;

  // 使用 primitive 依赖项，避免对象引用导致的重渲染
  const hasRouterAuth = useMemo(() => {
    if (noSet || configLoading) {
      return true;
    }

    if (isPublicPath()) {
      return true;
    }

    const { findAuthByPath, parse } = ZSVLink;

    // 没出现在配置项中且不是特殊的路由返回 true
    if (activeItems.length === 0 && !findAuthByPath(pathname)) {
      return true;
    }

    if (!hasConfig(pathname)) {
      console.log("Why 401?", `${pathname} has not config auth.`);
      return false;
    }

    let authConfig = parse(pathname);

    // 报警器页面创建路径特殊
    const needSecondBackPath = [
      "/cloud-monitoring/zwatch-alarm/resource",
      "/cloud-monitoring/zwatch-alarm/event",
      "/cloud-monitoring/zwatch-alarm/third-party",
    ];
    if (needSecondBackPath.indexOf(pathname) > -1) {
      const resource = pathname
        .split("/")
        .splice(2, 2)
        .join("-")
        .replace(/-/g, ".");
      authConfig = {
        resource,
        type: "view",
        authKey: "list",
      };
    }

    // 没找到对应的 auth 返回 true
    if (!authConfig) {
      return true;
    }

    if (authConfig && !hasAuth(authConfig)) {
      // 冒泡：当前资源无权限时，检查同一应用区域是否有其他有权限的菜单
      const bubbleUp = hasAnyAuthInApp(pathname, hasAuth);
      if (bubbleUp) {
        return true;
      }
      console.log("Why 401?", authConfig, "has not config auth.");
      return false;
    }

    if (authConfig && !hasConfig(pathname)) {
      console.log("Why 401?", pathname, "has no config.");
      return false;
    }

    return true;
  }, [
    noSet,
    pathname,
    activeItems,
    hasAuth,
    hasConfig,
    accountUuid,
    currentIdentity,
  ]);

  return { hasRouterAuth, configLoading };
}
