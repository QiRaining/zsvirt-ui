import {
  DocumentNode,
  QueryHookOptions,
  WatchQueryFetchPolicy,
} from "@apollo/client";
import { IQuery, Item } from "@zstack/zsphere-types";
import React from "react";

import { IActionProps } from "../action";
import { IProps as IAuthProps } from "../auth/type";
import { SearchVersion } from "../config";
import { ISearchCondition } from "../search";
import {
  IBaseToolbarProps,
  IBaseTableListProps,
  IQueryListResult,
} from "./base-type";
import type { ICandidate } from "./components/search-advanced";

export interface ITableListPaginationProps {
  // 计算 pagination 的 start 和 limit
  computePagination?: (query: any) => { start: number; limit: number };
}

export interface ITableListSearchProps {
  /* Search change ， 如果设置了会先执行 onChange 然后执行 setQuery */
  onChange?: (query: any, setQuery?: (query: IQuery) => void) => void;
  isDefaultSearch?: boolean;
}

export interface ITableListController {
  filter: (filterValue: Record<string, string[]>) => void;
}

export type ITableListProps<
  T extends Item,
  U extends Item = Item,
  O extends Item = Item,
> = IBaseTableListProps<T, U> & {
  gql: DocumentNode;
  queryConfig?: O[];
  /* todo新的属性 */
  paginationProps?: ITableListPaginationProps;
  /* todo新的属性 */
  searchProps?: ITableListSearchProps;
  searchVersion?: SearchVersion;
  renderToolbar?: (params: IToolbarProps<T, U>) => React.ReactNode;
  renderRightToolbar?: () => React.ReactNode;
  fetchPolicy?: WatchQueryFetchPolicy;
  /* todo新的属性 */
  apolloQueryOptions?: QueryHookOptions;
  /* todo新的属性 */
  customView?: string;
  customRefresh?: number;
  resultMapper?: (result?: {
    [prop: string]: IQueryListResult<T>;
  }) => IQueryListResult<T>;
  allGqlKeysWhenExport?: boolean;
  isSingleSelect?: boolean;
  setTableListTotal?: any;
  setRightToolBarCollapsed?: boolean;
  autoAllocation?: boolean;
  maxSelectedCount?: number;
  footer?: React.FC<{
    dataSource?: Array<T>;
    selectedList?: Array<T>;
    setSelectedList?: (items: Array<T>) => void;
    refetch?: () => void;
    loading?: boolean;
    total?: number;
  }>;
  actionMenuListMapper?: ({
    menuList,
    view,
    position,
    selectedList,
    source,
    refetch,
    setSelectedList,
    viewMap,
  }: Pick<
    IActionProps<T, U>,
    | "menuList"
    | "view"
    | "position"
    | "selectedList"
    | "source"
    | "refetch"
    | "setSelectedList"
    | "viewMap"
  >) => Required<IActionProps<T, U>>["menuList"];
  disabledLoading?: boolean;
  controller?: React.Ref<ITableListController>;
  renderRowDetail?:
    | ((
        record: T,
        visible: boolean,
        onClose: () => void,
        getContainer: () => HTMLElement | null,
      ) => JSX.Element)
    | false;
  withResourceAttribute?: boolean;
  resourceAttributeConfig?: {
    auth?: IAuthProps;
    width: number;
    render: (current: T, currentKey: Item) => React.ReactNode;
    exportToCSVRender?: (current: T, currentKey: Item) => string;
  };
};

export type IToolbarProps<
  T extends Item,
  U extends Item = Item,
  O extends Item = ISearchCondition | ICandidate,
> = Pick<
  ITableListProps<T, U, O>,
  | "queryConfig"
  | "gql"
  | "allGqlKeysWhenExport"
  | "searchProps"
  | "searchVersion"
  | "renderRightToolbar"
> &
  IBaseToolbarProps<T, U>;
