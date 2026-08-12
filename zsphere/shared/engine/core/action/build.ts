import { keys } from "lodash-es";

import { Item } from "./type";

export const genMenuTree = (rows: Item[]) => {
  let currentParent: { row: Item; children?: Item[] } = { row: rows[0] };
  return rows.reduce<(typeof currentParent)[]>((list, row) => {
    if (row.childName) {
      (currentParent.children || (currentParent.children = [])).push(row);
    }
    if (row.name) {
      currentParent = { row };
      list.push(currentParent);
    }
    return list;
  }, []);
};

const buildIKey = (rows: Item[]) => {
  const keys = rows.map((row) => `'${row.key}'`);
  return keys.join(" | ");
};

const buildActions = (rows: Item[], sheetName: string) => {
  const menuTree = genMenuTree(rows);
  const defaultResource = sheetName.replace(/-/g, ".");
  return menuTree.map(({ row, children }, outIndex) => {
    return {
      key: row.key,
      resource: row.resource || defaultResource,
      authKey: row.key,
      i18nKey: row.i18nKey ?? row.key,
      name: row.name,
      icon: row.icon,
      dividerKey: row.divider && `${row.key}-divider`,
      hasChildren: children?.length,
      children: children?.map((child, innerIndex) => {
        const translationId = child.i18nKey ?? child.key;

        return {
          childKey: child.key,
          childResource: child.resource || defaultResource,
          childAuthKey: child.key,
          childI18nKey: translationId,
          childName: child.childName,
          childIcon: child.icon,
          childDividerKey: child.divider && `${child.key}-divider`,
        };
      }),
    };
  });
};

const buildViewMap = (rows: Item[]) => {
  const views = keys(rows[0].custom);
  const viewMap = rows.reduce<{
    [key in string]: { extraKeys?: string[]; activeKeys?: string[] };
  }>((map, row) => {
    views.forEach((view: string) => {
      if (row.custom[view].value === 1) {
        (
          (map[view] || (map[view] = {})).activeKeys ||
          (map[view].activeKeys = [])
        ).push(row.key);
      }
      if (row.custom[view].value === -1) {
        (
          (map[view] || (map[view] = {})).extraKeys ||
          (map[view].extraKeys = [])
        ).push(row.key);
      }
    });
    return map;
  }, {});
  return views.map((view: string) => {
    return {
      view,
      extraKeys: viewMap[view]?.extraKeys?.map((key) => `'${key}'`).join(", "),
      activeKeys: viewMap[view]?.activeKeys
        ?.map((key) => `'${key}'`)
        .join(", "),
    };
  });
};

export const buildOption = (sheetName: string, rows: Item[]) => {
  const option = {
    sheetName,
    IKey: buildIKey(rows),
    actions: buildActions(rows, sheetName),
    viewMap: buildViewMap(rows),
  };
  return option;
};
