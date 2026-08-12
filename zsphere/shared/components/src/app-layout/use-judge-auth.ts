import { getMenuTree } from "@zstack/zsphere-config";
import { IMenu } from "@zstack/zsphere-types";

import { useAuth } from "../a-cloud-old-components/auth";

export interface IAuthParams {
  authKey: string;
  resource?: string;
  type: string;
}
export const getCurrentMenu = (id: string): IMenu | undefined => {
  const allMenuList = getMenuTree();
  let currentMenu!: IMenu;

  const traverse = (menuList: IMenu[], visited = new Set<string>()): any => {
    for (let i = 0; i < menuList.length; i += 1) {
      const menu = menuList[i];

      // 防止循环引用
      if (visited.has(menu.key)) {
        console.warn(
          `Circular reference detected in getCurrentMenu for key: ${menu.key}`,
        );
        continue;
      }
      visited.add(menu.key);

      if (menu.key === id) {
        currentMenu = menu;
        break;
      }
      if (menu.children) {
        traverse(menu.children!, visited);
      }
    }
  };
  traverse(allMenuList);
  return currentMenu;
};

export const getCurrentMenuKeys = (currentMenu?: IMenu): string[] => {
  if (!currentMenu) {
    return [];
  }
  const keys: string[] = [];
  const traverse = (menuList: IMenu[], visited = new Set<string>()) => {
    menuList.forEach((menu: IMenu) => {
      // 防止循环引用
      if (visited.has(menu.key)) {
        console.warn(
          `Circular reference detected in getCurrentMenuKeys for key: ${menu.key}`,
        );
        return;
      }
      visited.add(menu.key);

      keys.push(menu.key);
      if (menu.children || menu.tabs) {
        traverse(menu.children || (menu.tabs as IMenu[]), visited);
      }
    });
  };
  traverse([currentMenu]);
  return keys;
};

export function useJudgeMenuAuth() {
  const { hasAuth } = useAuth();

  return {
    hasAuth,
  };
}
