import { Item } from "./type";
export declare const formatRenderKey: (showType?: string) => string;
export declare const buildOption: (
  sheetName: string,
  rows: Item[],
) => {
  sheetName: string;
  formatTime: boolean;
  importConstant: boolean;
  IKey: string;
  columns: {
    [x: string]:
      | string
      | number
      | boolean
      | {
          constantType: string;
        }
      | undefined;
    key: string;
    i18nKey: string | undefined;
    name: string;
    width: number;
    renderType: string;
    sorter: boolean;
    filters: boolean;
    valueExpr: string;
  }[];
  viewMap: {
    view: string;
    keys: string;
  }[];
  isVirtualization: boolean;
};
