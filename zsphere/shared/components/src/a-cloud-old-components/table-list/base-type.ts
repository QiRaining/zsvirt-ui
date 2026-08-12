import type { IconTypes } from "@zstack/icon";
import {
  Condition,
  IHelper,
  IListProps,
  IListView,
  IQuery,
  Item,
} from "@zstack/zsphere-types";
import { CheckboxProps, TablePaginationConfig } from "antd";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { ColumnType, TableProps } from "antd/es/table";
import {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from "antd/lib/table/interface";
import { DocumentNode } from "graphql";
import React from "react";

import type {
  IActionProps,
  IActionViewPosition,
  IPosition,
} from "../action/type";
import { ITooltipProps } from "../field/type";
import { ISearchCondition } from "../search";
import { ISearchProps } from "../search/type";
import { IBaseExportToExcelProps } from "./components/export-to-excel/type";
import { ICandidate } from "./components/search-advanced/type";

export const actionKey = "__action__" as const;

export type IKey<T extends Item> = string | number | typeof actionKey;

export type IColumnEmptyType = "notSupport" | "notConfig";

export type IColumnMap = {
  [prop in string]: string[];
};

export interface ICustomTableOnChange {
  pagination?: TablePaginationConfig;
  filters?: Record<string, FilterValue | null>;
  sorter?: SorterResult<any> | SorterResult<any>[];
  extra?: TableCurrentDataSource<any>;
  limit?: number;
  start?: number;
  trigger: "Pagination" | "Table";
}

export interface IProps<T extends Item = Item> extends TableProps<T> {
  onClear?: () => void;
  query?: IQuery;
  setQuery?: (query: IQuery) => void;
  selectedList?: T[];
  setSelectedList?: (selList: T[] | undefined) => object;
  getSelectedContainer?: () => HTMLElement | null | undefined;
  delayLoad?: boolean;
  pageChangeRef?: any;
}

export interface IColumnType<T extends Item> extends Omit<
  ColumnType<T>,
  "dataIndex" | "key"
> {
  dataIndex?: string | number;
  key: string;
  gqlKey?: string | string[];
  width?: 400 | 280 | 200 | 140 | 100 | number | string;
  sortKey?: string;
  searchKey?: string;
  /** @deprecated 已废弃. 请使用 `auth` field. */
  authKey?: string;
  align?: "left" | "center" | "right";
  auth?: {
    type?: "block" | "view" | "action";
    authKey: string;
    resource: string;
  };
  onCell?: any;
  exportToCSVRender?: (value: any, record: any, index: number) => string;
  filterCondition?: (values: string[]) => Condition | undefined;
  onFiltersChange?: (value: any, filters: any) => void;
  empty?:
    | IColumnEmptyType
    | {
        type: IColumnEmptyType;
        render?: React.ReactNode | (() => React.ReactNode);
      };
  filterEnumType?: string;
  i18nKey?: string;
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

export interface IRenderRowTooltipParam<T> {
  current: T;
  selectedList: T[];
  rowKey: keyof T;
}

export type IBaseTableListProps<
  T extends Item,
  U extends Item = Item,
  O extends Item = ISearchCondition | ICandidate,
> = {
  view: IListView;
  customView?: IListView;
  queryConfig?: O[];
  actionConfig?: {
    list: Required<IActionProps<T, U>>["menuList"];
    viewMap: Required<IActionProps<T, U>>["viewMap"];
    getItemName?: (item: T) => React.ReactNode;
  };
  columnConfig: {
    list: Array<IColumnType<T>>;
    viewMap: IColumnMap;
  };
  beforeQuery?: (params?: IQuery) => IQuery | void;
  columnKeys?: Array<IKey<T>>;
  defaultQuery?: IQuery;
  value?: Array<T>;
  onChange?: (value: Array<T>) => void;
  type?: string;
  selectType?: "checkbox" | "radio";
  rowKey?: keyof T;
  source?: IActionProps<T, U>["source"];
  expandable?: TableProps<T>["expandable"];
  rowSelection?:
    | (Omit<
        Exclude<TableProps<T>["rowSelection"], undefined>,
        | "type"
        | "selectedRowKeys"
        | "onChange"
        | "renderCell"
        | "getCheckboxProps"
      > & {
        getCheckboxProps?:
          | ((
              record: T,
              selectedList?: T[],
              rowKey?: keyof T,
            ) => Partial<Omit<CheckboxProps, "checked" | "defaultChecked">>)
          | undefined;
      })
    | false;
  tableProps?: Omit<
    TableProps<T>,
    | "rowKeys"
    | "expandable"
    | "query"
    | "setQuery"
    | "columns"
    | "rowSelection"
    | "pagination"
    | "locale"
  > & { /* todo新的属性 */ onChange?: (args: ICustomTableOnChange) => void };
  resource?: string;
  skip?: boolean;
  onFetchChange?: (params: { list: Array<T>; total: number }) => void;
  renderAction?: IListProps<T, U>["renderAction"];
  pagination?: boolean;
  toolbar?:
    | false
    | Array<
        "refresh" | "operation" | "search" | "setting" | "export" | "toggle"
      >;
  toggleOptions?: Array<IToggleOption<T>>;
  selectedToggleKey?: string;
  emptyText?: string | React.ReactNode;
  onToggleSelect?: (key: string) => void;
  renderMiddleToolbar?: () => React.ReactNode;
  onHelp?: (data: { canCreate: boolean; resource?: string }) => void;
  hideHelper?: boolean;
  onClear?: () => void;
  helper?: IHelper;
  onRefetchBtnClick?: (data: { refetch: Function }) => void;
  toolbarHandleTooltip?: ITooltipProps;
  clickRowToggleSelected?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showSizeChanger?: boolean;
  limitLoop?: number;
  renderCustomExportModal?: (params: any) => React.ReactNode;
  customFileName?: string;
  disabledKeyList?: CheckboxValueType[];
  actionVerifyPolicy?: "once" | "always";
  cloumnEmpty?:
    | IColumnEmptyType
    | {
        type: IColumnEmptyType;
        render?: React.ReactNode | (() => React.ReactNode);
      };
  extraColumns?: IColumnType<T>[];
  showExtraColumnKey?: boolean;
  searchColumnKeys?: Array<IKey<T>>;
  searchColumnIndex?: number;
  setColumnKeys?: (params: {
    keys: Array<IKey<T>>;
    viewMapCloumns: Array<IKey<T>>;
    customColumns: Array<IKey<T>>;
    columnKeys?: Array<IKey<T>>;
  }) => Array<IKey<T>>;
  onlySingleSearch?: boolean;
  showClear?: boolean;
  graphqlConfig?: {
    columns: {
      [key in string]: string[];
    };
    actions?: {
      [key in string]: string[];
    };
  };
  extraDataList?: Array<T>;
  fixHeaderOnTop?: boolean;
  renderRowTooltip?: (param: IRenderRowTooltipParam<T>) => React.ReactNode;
  preserveSelectedOnQueryChange?: boolean;
};

export interface ResourceAttributeKey {
  uuid: string;
  name: string;
  constraints?: Array<{ id: number; parameter: string }>;
}

export interface ResourceAttributeSearchParam {
  keyList?: Array<ResourceAttributeKey>;
}

export type IBaseToolbarProps<T extends Item, U extends Item = Item> = Pick<
  ISearchProps,
  "setQuery"
> &
  Pick<Required<IActionProps<T, U>>, "refetch" | "selectedList"> &
  Pick<
    IBaseTableListProps<T, U>,
    | "queryConfig"
    | "columnConfig"
    | "toolbar"
    | "customView"
    | "toggleOptions"
    | "onToggleSelect"
    | "selectedToggleKey"
    | "renderMiddleToolbar"
    | "columnKeys"
    | "resource"
    | "toolbarHandleTooltip"
    | "renderCustomExportModal"
    | "customFileName"
    | "onlySingleSearch"
  > &
  Pick<IActionViewPosition<T>, "view"> &
  Pick<IBaseExportToExcelProps<T, U>, "limitLoop"> &
  Pick<ICustomColumnProps<T>, "disabledKeyList"> & {
    children: (args: IChildrenArgs<T>) => React.ReactNode;
    viewMap?: Required<IActionProps<T, U>>["viewMap"];
    menuList?: Required<IActionProps<T, U>>["menuList"];
    setCustomRefresh?: React.Dispatch<React.SetStateAction<number>>;
    customRefresh: number;
    iQuery: IQuery;
    query?: IQuery;
    onRefetchBtnClick?: () => void;
    extraColumns?: IColumnType<T>[];
    showExtraColumnKey?: boolean;
    filterColumns: IColumnType<T>[];
    isCollapsed?: boolean;
    resourceAttributeColumnList?: IColumnType<T>[];
    resourceAttributeSearch?: ResourceAttributeSearchParam;
    customColumnLoading?: boolean;
  };

export interface ICustomColumnProps<T extends Item, U extends Item = Item>
  extends
    Omit<IProps, "rowKey" | "columns" | "pagination">,
    Pick<
      IBaseTableListProps<T, U>,
      | "columnConfig"
      | "view"
      | "columnKeys"
      | "rowKey"
      | "resource"
      | "customView"
    > {
  viewMap?: Required<IActionProps<T, U>>["viewMap"];
  menuList?: Required<IActionProps<T, U>>["menuList"];
  setCustomRefresh?: React.Dispatch<React.SetStateAction<number>>;
  disabledKeyList?: CheckboxValueType[];

  // gql
  queryCustomColumnGql?: DocumentNode;
  updateCustomColumnsGql?: DocumentNode;
  resourceAttributeColumnList?: IColumnType<T>[];
  gqlValueMapper?: (data: any, query: DocumentNode) => any;
}

export interface ITableProps<T extends Item, U extends Item = Item>
  extends
    Omit<IProps<T>, "rowKey" | "columns" | "pagination" | "children">,
    Pick<
      IBaseTableListProps<T, U>,
      | "view"
      | "resource"
      | "rowKey"
      | "onClear"
      | "clickRowToggleSelected"
      | "cloumnEmpty"
      | "showClear"
      | "fixHeaderOnTop"
      | "source"
    > {
  children: (args: IChildrenArgs<T>) => React.ReactNode;
  viewMap?: Required<IActionProps<T, U>>["viewMap"];
  menuList?: Required<IActionProps<T, U>>["menuList"];
  getItemName?: (item: T) => React.ReactNode;
  filterColumns: Array<IColumnType<T>>;
  customActionColumn?: IColumnType<T>;
  customRefresh?: number;
  maxSelectedCount?: number;
  miniHeigthRow?: boolean;
  sort?: {
    sortBy?: string;
    sortDirection?: "desc" | "asc";
  };
  renderAction?: (
    params: { node: React.ReactNode; current: T } & Pick<
      IActionProps<T>,
      "position" | "selectedList"
    >,
  ) => React.ReactNode;
  renderRowTooltip?: (param: IRenderRowTooltipParam<T>) => React.ReactNode;
}

export interface IToggleOption<T extends Item> {
  key: string;
  icon?: IconTypes;
  label: React.ReactNode;
  render?: (data: {
    dataSource: TableProps<T>["dataSource"];
    value?: Array<T>;
    onChange?: (value: Array<T>) => void;
    refetch?: any;
  }) => React.ReactNode;
}

export interface IQueryListResult<T extends Item> {
  list: Array<T>;
  total: number;
}

export type IChildrenArgs<T extends Item> = {
  selectedList: Array<T>;
  position: IPosition;
};

export interface IRowTooltip {
  top?: number;
  title?: React.ReactNode;
  open?: boolean;
  key?: React.Key;
}
