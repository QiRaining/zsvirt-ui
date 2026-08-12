import type { IMenu } from "@zstack/zsphere-types";
import { cloneDeep, isEmpty } from "lodash-es";

export const cacheTree: {
  "zh-CN": IMenu[];
  "en-US": IMenu[];
  keyMap: { [key: string]: number };
  menuList: IMenu[];
  lastIntl?: any; // 记录上次的 intl 对象，用于判断是否需要重新处理
} = {
  "zh-CN": [],
  "en-US": [],
  keyMap: {},
  menuList: [],
  lastIntl: undefined,
};

// 预加载菜单数据，避免重复 import
import MENU_DATA_RAW from "./menu/list.json";
const MENU_DATA = MENU_DATA_RAW as IMenu[];

// 优化后的 i18n 处理函数
function processI18n(node: IMenu, intl: any): void {
  if (node.i18nKey && intl) {
    node.name = intl.formatMessage({
      id: node.i18nKey,
      defaultMessage: node.name,
    });
  }
}

// 优化后的 resourceType 处理函数
function processResourceType(node: IMenu): void {
  if (node.resourceType && typeof node.resourceType === "string") {
    node.resourceType = node.resourceType.split(",");
  }
}

// 优化后的节点预处理函数
function preprocessNode(item: IMenu, intl: any): IMenu {
  const node = cloneDeep(item);
  processI18n(node, intl);
  processResourceType(node);
  return node;
}

export function getMenuTree(rootKey: string = "root", intl?: any): IMenu[] {
  const locale = (intl?.locale as "zh-CN" | "en-US") || "zh-CN";

  // 检查缓存是否有效（包括 intl 对象是否变化）
  if (!isEmpty(cacheTree[locale]) && cacheTree.lastIntl === intl) {
    return cacheTree[locale];
  }

  // 构建 keyMap，时间复杂度 O(n)
  const keyMap = MENU_DATA.reduce(
    (_keyMap, item, index) => {
      _keyMap[item.key] = index;
      return _keyMap;
    },
    {} as { [key: string]: number },
  );

  // 创建节点的 Map，用于快速查找
  const nodeMap: { [key: string]: IMenu } = {};

  // 初始化根节点
  const _tree: IMenu = {
    key: rootKey,
    parentKey: "",
    prevKey: "",
    nextKey: "",
    name: rootKey,
  };

  nodeMap[rootKey] = _tree;

  // 预处理所有节点，只进行一次深拷贝
  MENU_DATA.forEach((item) => {
    const node = preprocessNode(item, intl);
    nodeMap[node.key] = node;
  });

  // 修复：使用更直接的树构建逻辑
  // 1. 找到所有顶级菜单项（parentKey 为空）
  const topLevelMenus = MENU_DATA.filter((item) => item.parentKey === "");

  // 2. 为每个顶级菜单构建完整的子树
  // 使用 nodeMap 中已翻译的节点，而非原始 MENU_DATA
  const buildMenuTree = (menuItems: IMenu[]): IMenu[] => {
    const result: IMenu[] = [];

    menuItems.forEach((menuItem) => {
      const menuNode = { ...(nodeMap[menuItem.key] || menuItem) };

      // 递归查找所有子菜单，防止循环引用
      const findChildren = (
        parentKey: string,
        visited = new Set<string>(),
      ): IMenu[] => {
        // 防止循环引用
        if (visited.has(parentKey)) {
          console.warn(
            `Circular reference detected in menu tree for key: ${parentKey}`,
          );
          return [];
        }
        visited.add(parentKey);

        try {
          return MENU_DATA.filter((item) => item.parentKey === parentKey).map(
            (child) => {
              const childNode = { ...(nodeMap[child.key] || child) };
              const grandChildren = findChildren(child.key, visited);
              if (grandChildren.length > 0) {
                childNode.children = grandChildren;
              }
              return childNode;
            },
          );
        } finally {
          visited.delete(parentKey);
        }
      };

      const children = findChildren(menuItem.key);
      if (children.length > 0) {
        menuNode.children = children;
      }

      result.push(menuNode);
    });

    return result;
  };

  // 构建完整的菜单树
  const menuTree = buildMenuTree(topLevelMenus);
  _tree.children = menuTree;

  // 更新缓存
  cacheTree[locale] = _tree.children || [];
  cacheTree.keyMap = keyMap;
  cacheTree.menuList = MENU_DATA;
  cacheTree.lastIntl = intl;

  return _tree.children || [];
}

// 优化后的子树查找函数，使用 Map 提升查找性能
export const getSubMenu = (
  menuTree: IMenu[],
  parentKey: string,
): IMenu | undefined => {
  // 如果 menuTree 为空，直接返回
  if (!menuTree || menuTree.length === 0) {
    return undefined;
  }

  // 使用 Map 缓存已查找的节点，避免重复遍历
  const nodeMap = new Map<string, IMenu>();

  const traverse = (subTree: IMenu[]): IMenu | undefined => {
    for (const menu of subTree) {
      // 检查缓存
      if (nodeMap.has(menu.key)) {
        continue;
      }

      nodeMap.set(menu.key, menu);

      if (menu.key === parentKey) {
        return menu;
      }

      if (menu.children && menu.children.length > 0) {
        const result = traverse(menu.children);
        if (result) {
          return result;
        }
      }
    }
    return undefined;
  };

  return traverse(menuTree);
};

// 优化后的菜单列表获取函数
export const getMenuList = () => {
  return MENU_DATA;
};
