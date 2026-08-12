import { getMenuTree } from "@zstack/zsphere-config";
import { IMenu } from "@zstack/zsphere-types";
import { useUpdate } from "ahooks";
import { useEffect } from "react";

export const noValidResource = "__noValidResource__";

export interface IAuthParams {
  authKey: string;
  resource?: string;
  type: string;
}

type IAuthList = Array<[string, any]>;
type IAuthMap = Map<string, any>;

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

export const getMenuByKeys = (
  id: string,
  menuList: Array<IMenu> = getMenuTree(),
  visited = new Set<string>(),
): IMenu | undefined => {
  for (let i = 0; i < menuList.length; i += 1) {
    const menu = menuList[i];

    // 防止循环引用
    if (visited.has(menu.key)) {
      console.warn(
        `Circular reference detected in getMenuByKeys for key: ${menu.key}`,
      );
      continue;
    }
    visited.add(menu.key);

    if (menu.key === id) {
      return menu;
    }

    if (menu.children?.length) {
      const findItem = getMenuByKeys(id, menu.children, visited);

      if (findItem) {
        return findItem;
      }
    }
  }
};

class AuthMap {
  map: IAuthMap = new Map();

  updateCb: Array<Function> = [];

  // 标记是否已经设置权限信息
  noSet = true;

  subscribe(cb: Function) {
    const index = this.updateCb.findIndex((item) => item === cb);

    if (index !== -1) {
      return () => {};
    }

    this.updateCb.push(cb);

    return () => {
      const findIndex = this.updateCb.findIndex((item) => item === cb);

      if (findIndex === -1) {
        return;
      }

      this.updateCb.splice(findIndex, 1);
    };
  }

  setList = (list: IAuthList = [], noSet = false) => {
    console.log(list, "--->>>>>setList");
    this.noSet = noSet;

    this.map = new Map(list ?? []);
    // disable the console for better performance
    // if (!noSet) {
    // console.log('map', this.map, noSet)
    // }

    this.updateCb.forEach((cb) => cb?.());
  };
}

const generatorAuthMap = () => {
  const authMap = new AuthMap();

  return () => authMap;
};

const getAuthMap = generatorAuthMap();

export function useAuthMap() {
  const update = useUpdate();
  const authMap = getAuthMap();

  useEffect(() => authMap.subscribe(update), [authMap, update]);

  return [authMap, authMap.setList] as const;
}
