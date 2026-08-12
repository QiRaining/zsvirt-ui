import { useAuthMap } from "@zstack/zsphere-components";
import { getMenuTree } from "@zstack/zsphere-config";
import { useUserIdentity } from "@zstack/zsphere-hooks";
import { useMemo, useRef, useCallback } from "react";
import { useIntl } from "react-intl";

import { useConfigAuth } from "../../utils/use-config-auth";

// 使用原生深拷贝替代 cloneDeep，减少 bundle size (bundle-barrel-imports 优化)
// 注意：这是深拷贝实现，用于替代 lodash-es 的 cloneDeep
const deepClone = <T>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, deepClone(value)]),
    ) as T;
  }
  return obj;
};

export function useMenuTree() {
  const intl = useIntl();
  const { hasConfig, configLoading } = useConfigAuth();
  const [{ map: authMap, noSet: authNoSet }] = useAuthMap();
  const { isSystemAdmin } = useUserIdentity();

  // 使用 ref 缓存上一次的 authMap 大小，只有当权限数据实际变化时才重新计算
  const prevAuthMapSizeRef = useRef<number>(0);
  const prevAuthNoSetRef = useRef<boolean>(true);

  // 创建稳定的 hasAuth 函数，不依赖于外部的 hasAuth hook
  const stableHasAuth = useCallback(
    (params: { resource?: string; authKey: string; type: string }): boolean => {
      const { resource, authKey, type } = params;
      if (resource === "virtualization.telemetry" && !isSystemAdmin) {
        return false;
      }
      if (!resource || authNoSet) {
        return true;
      }
      return authMap.has(`${resource}||${type}||${authKey}`);
    },
    [authMap, authNoSet, isSystemAdmin],
  );

  /**
   * 格式化菜单并过滤搜索词
   */
  const initMenu = useCallback(
    (menus: any[], hasAuthFn: any, hasConfigFn: any) => {
      const resArr: any[] = [];
      menus?.forEach((menuGroup) => {
        // 除去 system 类型且一级非目录（首页）的各种情况
        if (
          (menuGroup.source === "system" && menuGroup.key === "settings") ||
          (menuGroup.source === "system" &&
            menuGroup.key === "virtualization.dashboard") ||
          (menuGroup.source === "vendor" && menuGroup.showType === "page")
        ) {
          const flattedChildren = flatChildrenFn(
            menuGroup,
            hasAuthFn,
            hasConfigFn,
          );
          if (flattedChildren) {
            resArr.push({
              ...menuGroup,
              children: [
                {
                  ...menuGroup,
                  children: flatChildrenFn(menuGroup, hasAuthFn, hasConfigFn)
                    ?.children,
                },
              ],
            });
          }
        } else if (menuGroup?.children) {
          let firstPath = menuGroup?.path;
          // system 和 vendor 两种情况下一级都是目录类型
          const menuGroupChildren: any[] = [];
          menuGroup?.children.forEach((menuItems: any) => {
            const flattedChildren = flatChildrenFn(
              menuItems,
              hasAuthFn,
              hasConfigFn,
            );
            if (flattedChildren) {
              menuGroupChildren.push(flattedChildren);
            }
            if (flattedChildren?.firstPath && !firstPath) {
              firstPath = flattedChildren.firstPath;
            }
          });
          if (menuGroupChildren.length > 0) {
            resArr.push({
              ...menuGroup,
              path: firstPath,
              children: menuGroupChildren,
            });
          }
        }
      });

      return resArr;
    },
    [],
  );

  /**
   * 扁平化菜单，主要为了解决组合菜单的问题
   */
  const flatChildrenFn = (menus: any, hasAuthFn: any, hasConfigFn: any) => {
    const children: any[] = [];
    let firstPath = menus?.path;
    if (menus?.children) {
      menus?.children?.forEach((menu: any) => {
        if (
          (menu?.source === "system" && menu?.path) ||
          (menu?.source === "vendor" && menu?.url && menu.showType === "page")
        ) {
          if (
            hasAuthFn({ resource: menu.key, authKey: "list", type: "view" }) &&
            hasConfigFn(menu?.path ?? "")
          ) {
            children.push(menu);
            if (menu?.path && !firstPath) {
              firstPath = menu.path;
            }
          } else if (menu?.children) {
            const flattedChildren = flatChildrenFn(
              menu,
              hasAuthFn,
              hasConfigFn,
            );
            if (flattedChildren) {
              children.push(flattedChildren);
              if (flattedChildren.firstPath && !firstPath) {
                firstPath = flattedChildren.firstPath;
              }
            }
          }
        } else if (!menu?.path && menu?.children) {
          menu.children.forEach((item: any) => {
            if (
              hasAuthFn({
                resource: menu.key,
                authKey: "list",
                type: "view",
              }) &&
              hasConfigFn(item?.path ?? "")
            ) {
              children.push(item);
              if (item?.path && !firstPath) {
                firstPath = menu.path;
              }
            }
          });
        }
      });
    } else if (
      hasAuthFn({ resource: menus.key, authKey: "list", type: "view" }) &&
      hasConfigFn(menus?.path ?? "")
    ) {
      // 网络拓扑 这类没有children的特殊菜单
      children.push(menus);
    }

    return children.length
      ? {
          ...menus,
          firstPath,
          children,
        }
      : null;
  };

  // 计算权限数据是否实际发生变化
  const authMapSize = authMap.size;
  const authChanged =
    authMapSize !== prevAuthMapSizeRef.current ||
    authNoSet !== prevAuthNoSetRef.current;

  // 更新 ref
  if (authChanged) {
    prevAuthMapSizeRef.current = authMapSize;
    prevAuthNoSetRef.current = authNoSet;
  }

  // 只有当语言、权限数据实际变化、或配置加载完成时才重新计算菜单
  const menus = useMemo(() => {
    // 如果配置还在加载中，返回空数组避免闪烁
    if (configLoading) {
      return [];
    }
    const virtualizationMenu = getMenuTree("root", intl) || [];

    return deepClone(initMenu(virtualizationMenu, stableHasAuth, hasConfig));
  }, [intl.locale, authMapSize, authNoSet, configLoading]);

  return {
    menus,
    initMenu,
    flatChildren: flatChildrenFn,
  };
}
