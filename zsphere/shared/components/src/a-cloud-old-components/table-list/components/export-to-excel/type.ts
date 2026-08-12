import { QueryLazyOptions } from "@apollo/client";
import { IQuery, Item } from "@zstack/zsphere-types";

import type { IColumnType } from "../../base-type";
import type { ITableListProps } from "../../type";

export type IBaseHookProps<T extends Item, U extends Item = Item> = {
  query: IQuery;
  extraColumns?: IColumnType<T>[];
  _filterColumns: IColumnType<T>[];
};

export type exportProps = {
  fetchAction: (params?: IQuery | any) => void;
  transformQuery: (params?: IQuery) => IQuery | void;
};

export type IExportToExcelProps<T extends Item, U extends Item = Item> = Pick<
  ITableListProps<T, U>,
  "gql"
> &
  Pick<
    IBaseExportToExcelProps<T, U>,
    | "view"
    | "columnConfig"
    | "resource"
    | "columnKeys"
    | "renderCustomExportModal"
    | "customFileName"
    | "extraColumns"
    | "allGqlKeysWhenExport"
    | "limitLoop"
    | "customList"
    | "customColumns"
    | "customRefresh"
    | "customLimit"
    | "filterColumns"
    | "showExtraColumnKey"
  > & {
    query: IQuery;
  };

export type IExportToExcel2Props<T extends Item, U extends Item = Item> = Pick<
  IBaseExportToExcelProps<T, U>,
  | "view"
  | "columnConfig"
  | "resource"
  | "columnKeys"
  | "renderCustomExportModal"
  | "customFileName"
  | "filterColumns"
  | "showExtraColumnKey"
  | "extraColumns"
  | "limitLoop"
  | "customList"
  | "customColumns"
  | "customRefresh"
  | "customLimit"
> & {
  query: IQuery;
  fetchAction: (params?: IQuery | any) => void;
  transformQuery?: (params?: IQuery) => IQuery | void;
};

export type IBaseExportToExcelProps<
  T extends Item,
  U extends Item = Item,
> = Pick<
  ITableListProps<T, U>,
  | "view"
  | "columnConfig"
  | "resource"
  | "columnKeys"
  | "renderCustomExportModal"
  | "customFileName"
  | "allGqlKeysWhenExport"
> & {
  getData: (options?: QueryLazyOptions<IQuery> | undefined) => void;
  newQuery: IQuery;
  newColumns: IColumnType<T>[];
  limitType: "current" | "all";
  setLimitType: (visible: "current" | "all") => void;
  list: Array<T>;
  setList: (list: Array<T>) => void;
  total: number;
  setTotal: (total: number) => void;
  setExtraQuery: (query: IQuery) => void;
  setCustomColumns: (colmns: IColumnType<T>[]) => void;
  customLimit?: number;
  customRefresh?: number;
  customColumns?: IColumnType<T>[];
  customList?: Array<T>;
  limitLoop?: number;
  extraColumns?: IColumnType<T>[];
  showExtraColumnKey?: boolean;
  filterColumns: IColumnType<T>[];
};

export type CustomExportProps<T extends Item, U extends Item = Item> = Pick<
  ITableListProps<T, U>,
  "columnConfig"
> & {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title: string;
  callback: (params: {
    variables: IQuery & Item;
    customColumns?: IColumnType<T>[];
  }) => void;
  filterColumns: IColumnType<T>[];
};
