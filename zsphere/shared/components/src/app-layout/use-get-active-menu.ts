import { cacheTree } from "@zstack/zsphere-config";
import type { IMenu } from "@zstack/zsphere-types";
import { useMemo } from "react";
import { useLocation, useSearchParams } from "react-router";

import "./style.less";

/**
 * 根据 location 获取当前 menu 激活项
 *
 * 修复说明：
 * 原函数存在bug：当访问 /virtualization-administration/account-information 时，
 * 只返回了 "系统管理" 一项，而没有返回完整的菜单层级：
 * - 系统管理 (virtualization.administration)
 * - 身份与访问管理 (virtualization.identity.and.accessManagement)
 * - 用户管理 (virtualization.user.management)
 *
 * 修复方法：
 * 1. 分离 iframeUrl 和 path 的匹配逻辑
 * 2. 确保通过 parentKey 正确构建完整的菜单层级
 * 3. 添加对 keyMap 和 menuList 的依赖，确保数据更新时重新计算
 * 4. 当有多个相同路径的菜单项时，优先选择层级更深的子菜单项
 */
export function useGetActiveMenuItem() {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const { keyMap, menuList } = cacheTree;

  return useMemo(() => {
    const list: IMenu[] = [];
    const filterList: IMenu[] = [];
    let current: IMenu | undefined;

    // 首先尝试通过 iframeUrl 匹配
    menuList.forEach((item) => {
      const { url } = item;
      const iframeUrl = searchParams.get("iframeUrl");
      if (iframeUrl && decodeURIComponent(iframeUrl) === url) {
        current = item;
      }
    });

    // 如果没有 iframeUrl 匹配，则通过 path 匹配
    if (!current) {
      menuList.forEach((item) => {
        const { path } = item;
        if (path && pathname.startsWith(path)) {
          filterList.push(item);
        }
      });

      if (filterList.length > 0) {
        // 当有多个相同路径的菜单项时，优先选择层级更深的子菜单项
        // 通过计算 parentKey 的层级深度来判断
        const getMenuDepth = (menu: IMenu): number => {
          let depth = 0;
          let currentKey = menu.parentKey;
          while (currentKey && currentKey !== "") {
            depth++;
            const parentMenu = menuList[keyMap[currentKey]];
            if (parentMenu) {
              currentKey = parentMenu.parentKey;
            } else {
              break;
            }
          }
          return depth;
        };

        // 优先选择层级最深的菜单项
        current = filterList.reduce((prev, next) => {
          const prevDepth = getMenuDepth(prev);
          const nextDepth = getMenuDepth(next);
          if (nextDepth > prevDepth) {
            return next;
          } else if (nextDepth === prevDepth) {
            // 如果层级相同，选择路径最长的
            return next.path!.length > prev.path!.length ? next : prev;
          }
          return prev;
        }, filterList[0]);
      }
    }

    // 构建完整的菜单层级，防止循环引用
    const visitedKeys = new Set<string>();
    while (current) {
      // 防止循环引用
      if (visitedKeys.has(current.key)) {
        console.warn(
          `Circular reference detected in menu hierarchy for key: ${current.key}`,
        );
        break;
      }
      visitedKeys.add(current.key);

      list.unshift(current);
      if (current.parentKey && current.parentKey !== "") {
        current = menuList[keyMap[current.parentKey]];
      } else {
        current = undefined;
      }
    }

    return {
      activeKeys: list.map((item) => item.key),
      activeItems: list,
    };
  }, [searchParams, pathname, keyMap, menuList]);
}
