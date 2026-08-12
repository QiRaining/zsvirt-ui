import { useMemo, useCallback } from "react";

import { useAuth } from "../auth";
import { IActionProps, IMenuItem } from "./type";

export function useMenu<T>({
  position,
  menuList: menu,
  computedActiveKeys,
  resource,
  byRowRightClick,
}: Pick<
  IActionProps<T>,
  "menuList" | "resource" | "position" | "byRowRightClick"
> & {
  computedActiveKeys: string[];
}) {
  const { hasAuth } = useAuth();

  const has = useCallback(
    (item: IMenuItem<T>) =>
      hasAuth(item.auth ?? { type: "action", authKey: item.key, resource }),
    [hasAuth, resource],
  );

  const someAuth = useCallback(
    (items: Array<IMenuItem<T>>): boolean =>
      items.some((item) => {
        if (item.children?.length) {
          return someAuth(item.children);
        }

        return has(item);
      }),
    [has],
  );

  const getMenuList = useCallback(
    (
      menuList: Array<IMenuItem<T>>,
      activeKeys: string[],
    ): Array<IMenuItem<T>> => {
      function get(actions: Array<IMenuItem<T>>): Array<IMenuItem<T>> {
        const items = actions.reduce<Array<IMenuItem<T>>>((prev, curr) => {
          if ("children" in curr) {
            const children = get(curr.children ?? []);

            if (children.length) {
              if (!someAuth(children)) {
                return prev;
              }

              return [
                ...prev,
                children.length === 1
                  ? children[0]
                  : {
                      ...curr,
                      children,
                    },
              ];
            }

            return prev;
          }

          if (curr.divider && !curr.name) {
            return [...prev, curr];
          }

          if (!curr.name) {
            return prev;
          }

          const { divider, ...newItem } = curr;

          return [
            ...prev,
            ...(activeKeys.includes(newItem.key) &&
            has(newItem) &&
            // table 右键菜单加入 “独立外置” 操作后，需要过滤掉 “新建 XXX” 等非批量的情况
            (!(byRowRightClick && position === "toolbar") ||
              (newItem.autoInjectPreValidator ?? true))
              ? [newItem]
              : []),
            ...(divider
              ? [{ key: `__${newItem.key}_divider`, divider: true }]
              : []),
          ];
        }, []);

        return items.reduce<Array<IMenuItem<T>>>((prev, curr, index) => {
          if (!curr.divider) {
            return [...prev, curr];
          }

          // 之前没有新的项或者是最后一项，则不再添加新的 divider
          if (!prev.length || index === items.length - 1) {
            return prev;
          }

          const before = prev[prev.length - 1];

          // 前一个是 divider，则不再添加新的 divider
          if (before.divider && !before.name) {
            return prev;
          }

          const after = items?.[index + 1];
          if (after.divider && !after.name) {
            return prev;
          }

          return [...prev, curr];
        }, []);
      }

      return get(menuList);
    },
    [has, someAuth],
  );

  const newMenuList = useMemo(
    () => getMenuList(menu, computedActiveKeys),
    [computedActiveKeys, getMenuList, menu],
  );

  return {
    menu: newMenuList,
    someAuth,
  };
}
