import type { IMenu } from "@zstack/zsphere-types";

export function collectFilteredMenuTreeKeys(
  menu: IMenu[],
  filteredMenuKeys: readonly string[],
): string[] {
  const filteredMenuKeySet = new Set(filteredMenuKeys);
  const filteredTreeKeys: string[] = [];

  const collectSubtreeKey = (node: IMenu) => {
    if (node.menuKey) {
      filteredTreeKeys.push(node.menuKey);
    }

    if (node.children) {
      node.children.forEach((item) => collectSubtreeKey(item));
    }

    if (node.tabs) {
      node.tabs.forEach((tab) => collectSubtreeKey(tab as IMenu));
    }
  };

  const visitNode = (node: IMenu) => {
    if (node.menuKey && filteredMenuKeySet.has(node.menuKey)) {
      collectSubtreeKey(node);
      return;
    }

    if (node.children) {
      node.children.forEach((item) => visitNode(item));
    }

    if (node.tabs) {
      node.tabs.forEach((tab) => visitNode(tab as IMenu));
    }
  };

  menu.forEach((node) => visitNode(node));

  return filteredTreeKeys;
}

export function collectDefaultCheckedKeys(
  menu: IMenu[],
  filteredMenuKeys: readonly string[],
): string[] {
  const filteredMenuKeySet = new Set(
    collectFilteredMenuTreeKeys(menu, filteredMenuKeys),
  );
  const checkedKeys: string[] = [];

  const collectKey = (node: IMenu) => {
    if (node.menuKey && filteredMenuKeySet.has(node.menuKey)) {
      return;
    }

    if (node.menuKey) {
      checkedKeys.push(node.menuKey);
    }

    if (node.children) {
      node.children.forEach((item) => collectKey(item));
    }

    if (node.tabs) {
      node.tabs.forEach((tab) => collectKey(tab as IMenu));
    }
  };

  menu.forEach((node) => collectKey(node));

  return checkedKeys;
}
