import { IColumnType, Item } from "./utils";

export type IColumnMap = {
  [props in string]: string[];
};

export interface ColumnConfig<T extends Item> {
  list: Array<IColumnType<T>>;
  viewMap: IColumnMap;
}
