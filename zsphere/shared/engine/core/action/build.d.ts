import { Item } from "./type";
export declare const genMenuTree: (rows: Item[]) => {
  row: Item;
  children?: Item[];
}[];
export declare const buildOption: (
  sheetName: string,
  rows: Item[],
) => {
  sheetName: string;
  IKey: string;
  actions: {
    key: string;
    resource: string;
    authKey: string;
    i18nKey: string;
    name: string;
    icon: string | undefined;
    dividerKey: string | 0;
    hasChildren: number | undefined;
    children:
      | {
          childKey: string;
          childResource: string;
          childAuthKey: string;
          childI18nKey: string;
          childName: string | undefined;
          childIcon: string | undefined;
          childDividerKey: string | 0;
        }[]
      | undefined;
  }[];
  viewMap: {
    view: string;
    extraKeys: string | undefined;
    activeKeys: string | undefined;
  }[];
};
