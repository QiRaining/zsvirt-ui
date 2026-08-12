import { DocumentNode, NetworkStatus, QueryResult, gql } from "@apollo/client";
import { useLazyQuery, useQuery } from "@apollo/client";
import { Condition, IListView, IQuery, Item, Op } from "@zstack/zsphere-types";
import { bus } from "@zstack/zsphere-utils";
import { usePersistFn, useSessionStorageState, useUpdateEffect } from "ahooks";
import { TableRowSelection } from "antd/es/table/interface";
import { SorterResult } from "antd/lib/table/interface";
import {
  FieldNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  visit,
} from "graphql";
import {
  find,
  flatten,
  get,
  includes,
  isEqual,
  isFunction,
  merge,
  union,
  uniq,
} from "lodash-es";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOMServer from "react-dom/server";

import { IActionProps, IMenuItem } from "../action/type";
import { findAuthByKey } from "../action/utils";
import { useAuth } from "../auth";
import { IProps } from "../auth/type";
import { SearchVersion, ConfigContext } from "../config";
import { useTabs } from "../tabs/hooks";
import {
  IColumnMap,
  IColumnType,
  IKey,
  IQueryListResult,
  ITableProps,
  actionKey,
} from "./base-type";
import {
  IAction,
  ICondition,
  IOption,
} from "./components/search-advanced/type";
import { ITableListController, ITableListProps } from "./type";

export type IUsePreFetchParams<T extends Item> = Pick<
  ITableListProps<T>,
  "defaultQuery" | "gql" | "onHelp" | "type" | "skip" | "graphqlConfig"
> & {
  filterColumns?: IColumnType<T>[];
};

function getTextFromReactElement(element: ReactElement) {
  try {
    const renderString = ReactDOMServer.renderToString(element);
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(renderString, "text/html");
    const text = doc.body.textContent;
    return text;
  } catch (error) {
    console.log(error);
    return "";
  }
}

function removeFragmentSpreadFromDocument(
  config: { name?: string }[],
  doc: DocumentNode,
): DocumentNode | null {
  function enter(
    node: FragmentSpreadNode | FragmentDefinitionNode,
  ): null | void {
    if (config.some((def) => def.name === node.name.value)) {
      return null;
    }
  }

  return visit(doc, {
    FragmentSpread: { enter },
    FragmentDefinition: { enter },
  });
}
// 设置只需要的graphql Fields
const transformGraphqlQuery = (
  gql: DocumentNode,
  allGraphqlFieldKeys?: string[],
  // 默认从list 获取 Fields
  parentFieldName = "list",
) => {
  if (!allGraphqlFieldKeys?.length) return gql;

  const fragmentSpreadsInUse: Record<
    string,
    {
      name: string;
      deleteFieldCount: number;
      allDelete: boolean;
    }
  > = Object.create(null);

  let modifiedDoc = visit(gql, {
    Field: {
      enter(
        node: FieldNode,
        _key: string,
        parent: any,
        path: any,
        ancestors: any,
      ) {
        const currentFieldName = node?.name?.value;

        const currentParent =
          ancestors?.length - 2 >= 0
            ? ancestors?.[ancestors?.length - 2]
            : null;

        const isListFields =
          (currentParent as FieldNode)?.name?.value === parentFieldName;
        if (isListFields && !allGraphqlFieldKeys.includes(currentFieldName)) {
          // 删除 graphql field

          return null;
        }

        const fragmentName = (currentParent as FragmentDefinitionNode)?.name
          ?.value;
        // fragment
        if (
          fragmentName &&
          fragmentSpreadsInUse[fragmentName] &&
          !allGraphqlFieldKeys.includes(currentFieldName)
        ) {
          // 删除 graphql field
          fragmentSpreadsInUse[fragmentName].deleteFieldCount += 1;
          fragmentSpreadsInUse[fragmentName].allDelete =
            (currentParent as FragmentDefinitionNode)?.selectionSet?.selections
              ?.length === fragmentSpreadsInUse[fragmentName].deleteFieldCount;

          return null;
        }
      },
    },

    FragmentSpread: {
      enter(node: FragmentSpreadNode) {
        fragmentSpreadsInUse[node.name.value] = {
          name: node.name.value,
          deleteFieldCount: 0,
          allDelete: false,
        };
      },
    },
  });

  const fragmentSpreadsToRemove = Object.keys(fragmentSpreadsInUse)
    .map((key) => {
      if (fragmentSpreadsInUse[key].allDelete) {
        return { name: fragmentSpreadsInUse[key].name };
      }

      return null;
    })
    .filter(Boolean) as { name: string }[];

  // 删除不使用的 Fragment
  if (fragmentSpreadsToRemove.length) {
    modifiedDoc = removeFragmentSpreadFromDocument(
      fragmentSpreadsToRemove,
      modifiedDoc,
    );
  }

  return modifiedDoc;
};

const getAllGraphqlFieldKeys: <T extends Item>(
  params: Partial<
    Pick<
      ITableListProps<T>,
      "actionConfig" | "graphqlConfig" | "resource" | "view"
    >
  > & {
    filterColumns?: IColumnType<T>[];
    hasAuth: ReturnType<typeof useAuth>["hasAuth"];
  },
) => string[] = ({
  actionConfig,
  graphqlConfig,
  view,
  resource,
  filterColumns,
  hasAuth,
}) => {
  if (!graphqlConfig) {
    return [] as string[];
  }
  const menuList = actionConfig?.list ?? [];

  const flatActionConfigKeys = (
    list: Pick<IMenuItem<any, any>, "key" | "auth" | "children">[],
  ) => {
    const allConfig = list?.reduce((_allConfig, item) => {
      let result: string[] = [];
      if (item?.children) {
        result = flatActionConfigKeys(item?.children);
      } else {
        const authKey = (item?.auth as any)?.authKey ?? "";

        const auth = hasAuth(
          findAuthByKey(authKey!, menuList!) ??
            ({ type: "action", authKey, resource } as any),
        );
        if (auth) {
          result = [item?.key];
        }
      }

      return [..._allConfig, ...result];
    }, [] as string[]);

    return allConfig ?? [];
  };
  // 获取所有的 Action 能使用的Keys
  const allActionKeys = union(flatActionConfigKeys(actionConfig?.list as any));

  const toolbar = actionConfig?.viewMap?.[`${view}/toolbar`];
  const row = actionConfig?.viewMap?.[`${view}/row`];
  // 获取所有的 View 的Action 能使用的Keys
  const allActionsViewKeys = flatten([
    toolbar?.extraKeys,
    toolbar?.activeKeys,
    row?.extraKeys,
    row?.activeKeys,
  ]).filter(
    (key): key is string =>
      !!key && typeof key === "string" && allActionKeys.includes(key),
  );

  // 获取所有的 Column 能使用的Keys
  const allColumnKeys = filterColumns?.map((col) => col?.key);
  // 配置的column和action 对应的keys
  const { columns = {}, actions = {} } = graphqlConfig ?? {};

  // 所有graphql 需要的keys
  let allGraphqlFieldKeys: string[] = [];

  allGraphqlFieldKeys = Object.keys(columns).reduce((_allKeys, key) => {
    if (allColumnKeys?.includes(key) && columns?.[key]) {
      return [..._allKeys, ...columns?.[key]];
    }
    return _allKeys;
  }, [] as string[]);

  allGraphqlFieldKeys = Object.keys(actions).reduce((_allKeys, key) => {
    if (allActionsViewKeys.includes(key) && actions?.[key]) {
      return [..._allKeys, ...actions?.[key]];
    }
    return _allKeys;
  }, allGraphqlFieldKeys);

  return allGraphqlFieldKeys;
};

const resourceAttributeField = (
  gql`
    fragment ResourceAttributeField on ResourceWithAttributes {
      resourceAttributeValues {
        keyUuid
        value
      }
    }
  ` as any
).definitions[0].selectionSet.selections[0];

/**
 * 优化Tablelist graphql Fields ，只query 需要的Fields 从list Field下优化
 * 需要配合 graphqlConfig 配置使用
 *
 *
 * graphqlConfig: {columns , actions}
 *
 * columns : { 配置对应列的key 和 这个列需要使用到的graphql Fields }
 * actions : { 配置对应action的key 和 这个列需要使用到的graphql Fields }
 *
 * 例如:
 *
 * {
 *    columns: { uuid: ['uuid'] , name: ['uuid', 'name'],... },
 *    actions: {edit: ['uuid', 'name', 'description'] , 'l2.network.create': ['uuid', 'name'] ,...}
 * }
 *
 */
export const useRefactorGraphqlFields: <T extends Item>(
  params: Partial<
    Pick<
      ITableListProps<T>,
      "actionConfig" | "graphqlConfig" | "resource" | "view" | "gql"
    >
  > & {
    filterColumns?: IColumnType<T>[];
    attributeEnabled?: boolean;
  },
) => DocumentNode = ({
  actionConfig,
  graphqlConfig,
  view,
  resource,
  filterColumns,
  gql,
  attributeEnabled,
}) => {
  const { hasAuth } = useAuth();

  // 所有graphql 需要的keys
  const allGraphqlFieldKeys: string[] = getAllGraphqlFieldKeys({
    actionConfig,
    graphqlConfig,
    view,
    resource,
    filterColumns,
    hasAuth,
  });

  const strKeys = allGraphqlFieldKeys?.sort()?.join(",");

  const _gql = React.useMemo(() => {
    const _allGraphqlFieldKeys = strKeys?.split(",");
    if (!graphqlConfig || !strKeys) return gql;
    return transformGraphqlQuery(gql!, _allGraphqlFieldKeys);
  }, [gql, strKeys, graphqlConfig]);

  return useMemo(() => {
    if (!attributeEnabled) {
      return _gql;
    }
    return visit(_gql, {
      Field: {
        leave(node: FieldNode) {
          if (
            node.name.value !== "list" ||
            !node.selectionSet?.selections?.length
          ) {
            return undefined;
          }
          return {
            ...node,
            selectionSet: {
              ...node.selectionSet,
              selections: [
                ...node.selectionSet.selections,
                resourceAttributeField,
              ],
            },
          };
        },
      },
    });
  }, [_gql, attributeEnabled]);
};

function subscribeRefetch({
  type,
  refetch,
}: {
  type: string;
  refetch: Function;
}) {
  const eventType = `action:refetch:${type}`;

  const _refetch = () => refetch();

  bus.addListener(eventType, _refetch);

  return () => {
    bus.removeListener(eventType, _refetch);
  };
}

export function usePreFetch<T extends Item>({
  defaultQuery,
  gql,
  onHelp,
  type,
  skip,
  filterColumns,
  graphqlConfig,
}: IUsePreFetchParams<T>) {
  const variables = useMemo(
    () => ({
      ...defaultQuery,
      start: 0,
      limit: 1,
    }),
    [defaultQuery],
  );

  const modifiedDoc = React.useMemo(() => {
    const oneColumnKey = filterColumns?.[0]?.key;
    if (!graphqlConfig || !oneColumnKey) return gql;
    return transformGraphqlQuery(gql, [oneColumnKey]);
  }, [gql, filterColumns?.[0]?.key, graphqlConfig]);

  const [fetch, result] = useLazyQuery<{
    [prop: string]: IQueryListResult<T>;
  }>(modifiedDoc, {
    variables,
    fetchPolicy: "no-cache",
  });
  const { data } = result as any;

  const { total } = useMemo(
    () => Object.values(data ?? {})?.[0] || { list: [] },
    [data],
  ) as any;

  // 搭配 doAction 做到操作完成时，重新请求数据
  useEffect(() => {
    if (!type || !onHelp) {
      return;
    }

    return subscribeRefetch({ type, refetch: fetch });
  }, [type, fetch, onHelp]);

  useEffect(() => {
    if (!skip && onHelp) {
      fetch();
    }
  }, [onHelp, variables, fetch, skip]);

  useEffect(() => {
    if (!onHelp || total === undefined) {
      return;
    }

    onHelp({ canCreate: !skip && !total });
  }, [onHelp, total, skip]);
}
export interface IUseFetchParams<T extends Item> extends Pick<
  ITableListProps<T>,
  | "defaultQuery"
  | "gql"
  | "type"
  | "onFetchChange"
  | "fetchPolicy"
  | "skip"
  | "beforeQuery"
  | "apolloQueryOptions"
  | "resultMapper"
  | "graphqlConfig"
  | "actionConfig"
  | "resource"
  | "extraDataList"
  | "disabledLoading"
> {
  setSelectedList?: (v: Array<T>) => void;
  view?: ITableListProps<T>["view"];
  filterColumns?: IColumnType<T>[];
  attributeEnabled?: boolean;
  instanceId?: string;
}

// 处理 apollo 调用 refetch 时 loading 不变化问题
function useWrappedRefetchAndLoading({
  loading,
  networkStatus,
  refetch,
}: Pick<QueryResult, "loading" | "refetch" | "networkStatus">) {
  const wrapperRefetch: typeof refetch = useCallback(
    (...args) => refetch(...args),
    [refetch],
  );

  return {
    loading: loading || networkStatus === NetworkStatus.refetch,
    refetch: wrapperRefetch,
  };
}

export function useFetch<T extends Item>({
  skip = false,
  defaultQuery,
  gql,
  type,
  view,
  fetchPolicy,
  onFetchChange,
  setSelectedList,
  beforeQuery,
  resultMapper,
  apolloQueryOptions,
  graphqlConfig,
  actionConfig,
  resource,
  filterColumns,
  extraDataList,
  disabledLoading,
  attributeEnabled,
  instanceId,
}: IUseFetchParams<T>) {
  const LIMIT = 20;

  const _gql = useRefactorGraphqlFields({
    gql,
    actionConfig,
    graphqlConfig,
    resource,
    view,
    filterColumns,
    attributeEnabled,
  });
  const isSelect = view?.startsWith("select");
  const [pageInfo, setPageInfo] = useSessionStorageState<any>(
    `table-instance-state-${instanceId}`,
  );

  const fetchPolicyMemo = useMemo(() => {
    if (fetchPolicy) {
      return fetchPolicy;
    }

    if (isSelect) {
      return "no-cache";
    }

    return "network-only";
  }, [fetchPolicy, isSelect]);

  const settedValue: { start?: number; limit?: number } = useMemo(
    () =>
      isSelect
        ? {}
        : {
            limit: pageInfo?.limit ?? undefined,
            start: pageInfo?.start ?? undefined,
          },
    [isSelect, pageInfo],
  );

  const { limit: _limit = LIMIT, start: _start = 0 } = settedValue;

  const getInitQuery = useCallback(
    (params: object = {}) =>
      merge({}, { start: 0, limit: LIMIT }, params, defaultQuery, settedValue),
    [defaultQuery, settedValue],
  );

  const [query, setQuery] = useState<IQuery>(
    getInitQuery({ limit: _limit, start: _start }),
  );

  useEffect(() => {
    if (!isSelect) {
      setPageInfo({
        start: query.start,
        limit: query.limit,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
      });
    }
  }, [
    query.start,
    query.limit,
    query.sortBy,
    query.sortDirection,
    isSelect,
    setPageInfo,
  ]);

  const variables = useMemo(
    () => beforeQuery?.(query) || query,
    [beforeQuery, query],
  );
  const { data, ...rest } = useQuery<{
    [prop: string]: IQueryListResult<T>;
  }>(_gql, {
    skip,
    variables,
    fetchPolicy: fetchPolicyMemo,
    // todo 等优化了 validator 和 query 的性能再尝试全部走缓存的更新策略
    // nextFetchPolicy: fetchPolicyMemo === 'network-only' ? 'cache-first' : fetchPolicyMemo
    // 选择列表参数没有变化时，也需要重新请求
    ...(isSelect ? { nextFetchPolicy: fetchPolicyMemo } : null),
    // apollo client query options
    ...apolloQueryOptions,
    notifyOnNetworkStatusChange: true,
  });

  const { loading, refetch } = useWrappedRefetchAndLoading(rest);

  const { list, total } = useMemo(() => {
    let result: IQueryListResult<T>;
    if (resultMapper) {
      result = resultMapper(data);
    } else {
      result = Object.values(data ?? {})?.[0];
    }
    result = result || { list: [], total: 0 };
    if (extraDataList)
      result.list = extraDataList
        .map((it) => ({ ...it, extraData: true }) as any)
        .concat(result.list);
    return result;
  }, [data, resultMapper]);

  // 点击刷新按钮时清空选中并重新拉取数据
  const refetchWithClearSelectedList = usePersistFn(
    (...args: Parameters<typeof refetch>) => {
      setSelectedList?.([]);
      const _query = beforeQuery?.(...args);
      if (_query) {
        refetch(_query);
      } else {
        refetch(...args);
      }
    },
  );

  // useQuery nextFetchPolicy 造成 variables 变化时自动请求，因此这里暂时不需要
  useUpdateEffect(() => {
    if (!isSelect || skip) {
      return;
    }

    const _query = beforeQuery?.(query);
    if (_query) {
      refetch(_query);
    } else {
      refetch();
    }
  }, [JSON.stringify(query), skip]);

  useUpdateEffect(() => {
    setQuery(({ limit, start }) => getInitQuery({ limit, start }));
  }, [getInitQuery]);

  // 搭配 doAction 做到操作完成时，重新请求数据
  useEffect(() => {
    if (!type) {
      return;
    }

    return subscribeRefetch({ type, refetch: refetchWithClearSelectedList });
  }, [type, refetchWithClearSelectedList]);

  const fetchChangeHandle = usePersistFn((params) => onFetchChange?.(params));

  useEffect(() => {
    fetchChangeHandle({ list, total });
  }, [list, fetchChangeHandle, total]);

  // 处理当前请求页数超出总页数（总页数大于1）时，重新请求最后一页
  useUpdateEffect(() => {
    if (!query.start || !query.limit || list.length || !total) {
      return;
    }

    setQuery((q) => {
      const newStart = Math.max(
        (Math.ceil(total / q.limit!) - 1) * q.limit!,
        0,
      );
      if (q.start !== newStart) return { ...q, start: newStart };
      return q;
    });
  }, [list, query, refetch, total]);

  return {
    list,
    total,
    query,
    loading: disabledLoading ? false : loading,
    refetch,
    setQuery,
    getInitQuery,
    refetchWithClearSelectedList,
  };
}

function mergeConditions(...rest: Array<Array<Condition>>): Array<Condition> {
  return rest.reduce((prev, curr) => [...prev, ...curr], []);
}

export type IUseDefaultQuery<T extends Item> = Pick<
  ITableListProps<T>,
  "defaultQuery"
> &
  Pick<ITableProps<T>, "customRefresh" | "filterColumns"> & {
    instanceId: string;
  };

export function useDefaultQuery<T extends Item>(
  { defaultQuery, filterColumns, instanceId }: IUseDefaultQuery<T>,
  dispatchConditions?: React.Dispatch<IAction>,
  searchVersion: SearchVersion = SearchVersion.V2,
  view?: IListView,
  controller?: React.Ref<ITableListController>,
) {
  const { constant } = React.useContext(ConfigContext);
  const isSelect = view?.startsWith("select");
  const [pageInfo] = useSessionStorageState<any>(
    `table-instance-state-${instanceId}`,
  );

  // 获取通过 key 进行映射的 map. 便于后面通过 key 获取对应信息
  const keyToMap = useMemo(() => {
    const keyToSortKey = filterColumns?.reduce<
      Array<[string, IColumnType<any>]>
    >(
      (prev, { key, sortKey, searchKey, ...restProps }) => [
        ...prev,
        [
          key,
          {
            key,
            sortKey: sortKey || key,
            searchKey: searchKey || key,
            ...restProps,
          },
        ],
      ],
      [],
    );

    return new Map(keyToSortKey);
  }, [filterColumns]);

  // 获取排序信息 （只支持单列排序）
  const getSearchQueryBySort = useCallback(
    (sorter: SorterResult<any>) => {
      // 排序变化时回到第一页
      const common = { start: 0 };

      if (sorter.order) {
        return {
          ...common,
          sortBy: keyToMap.get(sorter.columnKey as string)!.sortKey,
          sortDirection: sorter.order.startsWith("desc")
            ? ("desc" as const)
            : ("asc" as const),
        };
      }

      return common;
    },
    [keyToMap],
  );

  // 自定义列变化时重置排序，重新获取默认排序列
  const getSearchQueryByCustomRefresh = usePersistFn(() => {
    const findItem = filterColumns?.find((item) => item.defaultSortOrder);
    return getSearchQueryBySort(
      findItem
        ? { order: findItem.defaultSortOrder, columnKey: findItem.key }
        : {},
    );
  });

  // toolbar 中的 search 组件的查询信息
  const [searchQuery, setSearchQuery] = useState<IQuery>(
    getSearchQueryByCustomRefresh,
  );

  const defaultSortColumn = React.useMemo(
    () => filterColumns?.find((column) => !!column?.defaultSortOrder),
    [filterColumns],
  );
  // table 组件中的查询信息
  const {
    sortBy: _sortBy = undefined,
    sortDirection: _sortDirection = undefined,
  } = React.useMemo(() => {
    if (defaultSortColumn) {
      return {
        sortBy: defaultSortColumn.key,
        // for map antd to query property
        sortDirection:
          defaultSortColumn.defaultSortOrder === "descend" ? "desc" : "asc",
      };
    }
    if (isSelect) {
      return {};
    }

    // 这里需要处理，如果windows.history.state中的sorter的key不在对应list的column中，返回{}

    const columnKeys = filterColumns?.map((column) => column.key) ?? [];
    if (pageInfo?.sortBy && includes(columnKeys, pageInfo.sortBy)) {
      return {
        sortBy: pageInfo.sortBy,
        sortDirection: pageInfo.sortDirection,
      };
    }

    return {};
  }, [defaultSortColumn, isSelect, filterColumns, pageInfo]);

  const [tableQuery, setTableQuery] = useState<IQuery>({
    sortBy: _sortBy,
    sortDirection: _sortDirection,
  });

  // 自定义过滤
  const _filterInfo = useMemo(
    () =>
      filterColumns?.reduce(
        (prev, { key, defaultFilteredValue, filteredValue }) =>
          defaultFilteredValue || filteredValue
            ? {
                ...prev,
                [key]: filteredValue ?? defaultFilteredValue,
              }
            : prev,
        {},
      ),
    [filterColumns],
  );
  const filterInfo = useDeepState(_filterInfo, { deep: true });

  useEffect(() => {
    handleFiterChange(filterInfo);
  }, [filterInfo]);

  const defaultQueryMemo = useMemo(() => {
    const conditions = mergeConditions(
      defaultQuery?.conditions ?? [],
      searchQuery?.conditions ?? [],
    );
    const { sortBy, sortDirection } = tableQuery;

    if (searchVersion === SearchVersion.V1) {
      const _searchQuery = {
        start: searchQuery.start,
        limit: searchQuery.limit,
        conditions: searchQuery.conditions,
      };

      return {
        ...defaultQuery,
        ..._searchQuery,
        conditions,
        sortBy,
        sortDirection,
      };
    }

    return {
      ...defaultQuery,
      ...searchQuery,
      conditions,
      sortBy,
      sortDirection,
    };
  }, [
    defaultQuery,
    tableQuery.sortBy,
    tableQuery.sortDirection,
    searchQuery,
    searchVersion,
  ]);

  const handleFiterChange = useCallback(
    (filters: Record<string, string[]>) => {
      const filterConditions: ICondition[] = [];

      Object.entries(filters).forEach(([filterKey, filterValues]) => {
        const originFilterOption = keyToMap.get(filterKey);
        if (filterValues?.length && originFilterOption) {
          const {
            key,
            title,
            i18nKey,
            searchKey,
            onFiltersChange,
            filters: originFilters = [],
            filterCondition: conditionTransform,
            filterMultiple = true,
            filterEnumType,
          } = originFilterOption;

          const getI18nKey = (value: string) => {
            if (filterEnumType) {
              return constant?.constantGroupMap?.get(
                `${filterEnumType}-${value}`,
              )?.i18nKey;
            }
            return constant?.constantMap?.get(value)?.i18nKey;
          };

          const conditionValues: IOption[] = filterValues.map((filterValue) => {
            const originItem = find(originFilters, { value: filterValue });
            return {
              key: filterValue,
              // 这里把之前蠢蠢的方式加了回来，作为兜底,后面要改
              label:
                typeof originItem?.text === "string"
                  ? originItem?.text
                  : getTextFromReactElement(originItem?.text as ReactElement) ||
                    filterValue,
              extra: {
                i18nKey: get(originItem, "i18nKey") || getI18nKey(filterValue),
              },
            };
          });

          filterConditions.push({
            name: {
              key: searchKey || key,
              label: title as React.ReactNode,
              type: filterMultiple ? "multipleSelect" : "singleSelect",
              extra: {
                i18nKey,
              },
            },
            values: conditionValues,
            conditionTransform,
            // special resolution for the ZSV-1440, a little stupid, but it works and the risk is low.
            value: conditionValues,
          });

          onFiltersChange?.(filterKey, originFilters);
        }
      });
      if (dispatchConditions) {
        const action: IAction = {
          type: "setFilter",
          payload: {
            conditions: filterConditions,
          },
        };
        dispatchConditions(action);
      }
    },
    [keyToMap],
  );

  useImperativeHandle(
    controller,
    () => ({
      filter: (filterValue) => handleFiterChange(filterValue),
    }),
    [handleFiterChange],
  );

  // 处理 Table 组件查询变化
  const tableQueryChange = usePersistFn<Required<ITableProps<any>>["onChange"]>(
    (__, filters, sorter, extra) => {
      switch (extra.action) {
        case "sort":
          if (Array.isArray(sorter)) {
            return;
          }
          // sorter为function时，使用用户自定义sorter 方法排序
          if (!isFunction(sorter.column?.sorter)) {
            setTableQuery(({ sortBy, sortDirection, ...q }) => ({
              ...q,
              ...getSearchQueryBySort(sorter),
            }));
          }

          break;
        case "filter":
          // 处理表头筛选
          handleFiterChange(filters as any);
          break;
      }
    },
  );

  return {
    searchQuery,
    setSearchQuery,
    tableQueryChange,
    defaultQuery: defaultQueryMemo,
  };
}

export function formatAuthParams(
  item: IColumnType<any>,
  resource?: string,
): IProps | undefined {
  if (!item.authKey && !item.auth) {
    return;
  }

  return {
    resource,
    authKey: item.authKey!,
    type: "block" as any,
    ...item.auth,
  };
}

const queryResourceAttributeKeyList = gql`
  query queryResourceAttributeKeyList($conditions: [Condition!]) {
    queryResourceAttributeKeyList(conditions: $conditions) {
      list {
        uuid
        name
        constraints {
          id
          parameter
        }
      }
    }
  }
`;

interface IUseResourceAttributeColumnConfigProps<T extends Item> {
  resourceType: string;
  attributeEnabled?: boolean;
  resourceAttributeConfig?: ITableListProps<T>["resourceAttributeConfig"];
}

function useResourceAttributeColumnConfig<T extends Item>({
  attributeEnabled,
  resourceType,
  resourceAttributeConfig,
}: IUseResourceAttributeColumnConfigProps<T>) {
  const { data, loading, refetch } = useQuery(queryResourceAttributeKeyList, {
    skip: !attributeEnabled,
    variables: {
      conditions: [
        {
          key: "resourceType",
          op: Op.in,
          values: ["ResourceAttributeKeyVO", resourceType],
        },
      ],
    },
  });
  useEffect(() => {
    const unSubValue = subscribeRefetch({
      type: "ResourceAttributeValue",
      refetch,
    });
    const unSubKey = subscribeRefetch({
      type: "ResourceAttributeKey",
      refetch,
    });
    return () => {
      unSubValue();
      unSubKey();
    };
  }, [refetch]);
  const list = data?.queryResourceAttributeKeyList?.list;
  const config = useMemo(
    () =>
      list && resourceAttributeConfig && attributeEnabled
        ? list.map((item: any) => ({
            key: item.uuid,
            title: item.name,
            ...resourceAttributeConfig,
            exportToCSVRender: resourceAttributeConfig?.exportToCSVRender,
            render: (current: T) =>
              resourceAttributeConfig.render(current, item),
          }))
        : [],
    [list, resourceAttributeConfig, attributeEnabled],
  );
  return [config, loading, list];
}

export type IUseFilterColumns<T extends Item> = {
  attributeEnabled?: boolean;
} & Pick<
  ITableListProps<T>,
  | "resource"
  | "view"
  | "customView"
  | "columnConfig"
  | "columnKeys"
  | "searchColumnKeys"
  | "searchColumnIndex"
  | "setColumnKeys"
  | "type"
  | "resourceAttributeConfig"
> &
  Pick<ITableProps<T>, "customRefresh">;

export function useColumns<T extends Item>(
  {
    type,
    attributeEnabled,
    resourceAttributeConfig,
    resource,
    view,
    customView,
    customRefresh,
    columnKeys,
    columnConfig,
    searchColumnKeys,
    searchColumnIndex,
    setColumnKeys,
  }: IUseFilterColumns<T>,
  searchConditions?: ICondition[],
  searchVersion: SearchVersion = SearchVersion.V2,
) {
  const resourceType = type?.endsWith("VO") ? type : `${type}VO`;
  const [
    resourceAttributeColumnList,
    resourceAttributeColumnLoading,
    resourceAttributeKeyList,
  ] = useResourceAttributeColumnConfig({
    resourceType,
    attributeEnabled,
    resourceAttributeConfig,
  });

  const { list: staticColumnList, viewMap } = columnConfig;

  const list = useMemo(
    () => staticColumnList.concat(resourceAttributeColumnList),
    [staticColumnList, resourceAttributeColumnList],
  );

  const customColumnPath = `${resource}.${customView ?? view}`;

  const { hasAuth } = useAuth();

  // 模拟远程自定义数据
  const customColumnConfig: IColumnMap = useMemo(
    () => JSON.parse(localStorage.getItem("customColumnConfig") || "{}"),
    [customRefresh],
  );

  // 获取经过自定义列，权限过滤后的列信息
  const filterColumns = useMemo(() => {
    let keys: IKey<T>[] = viewMap[view] ?? [];

    let customKeys: string[] | undefined;
    if (typeof customColumnConfig === "string") {
      try {
        customKeys = JSON.parse(customColumnConfig)[customColumnPath];
      } catch {}
    } else {
      customKeys = customColumnConfig[customColumnPath];
    }

    if (customKeys) {
      keys = customKeys;
    } else if (columnKeys?.length) {
      keys = columnKeys;
    }
    // 需要展示特定列
    if (searchColumnKeys?.length) {
      keys = keys.slice(0);
      if (searchColumnIndex === -1) {
        keys = [...keys, ...searchColumnKeys];
      } else {
        keys.splice(searchColumnIndex!, 0, ...searchColumnKeys);
      }
      keys = uniq(keys);
    }

    keys =
      setColumnKeys?.({
        keys,
        viewMapCloumns: viewMap[view],
        customColumns: customColumnConfig[customColumnPath],
        columnKeys,
      }) ?? keys;

    let columns = keys.reduce<Array<IColumnType<T>>>((prev, curr) => {
      const findColumnItem = list.find((item) => item.key === curr);
      if (!findColumnItem) {
        return prev;
      }

      // 根据列信息和 resource 获取对应的列权限
      const authParams = formatAuthParams(findColumnItem, resource);

      // 如果没有则说明，该列不受权限控制
      if (!authParams) {
        return [...prev, findColumnItem];
      }

      return hasAuth(authParams) ? [...prev, findColumnItem] : prev;
    }, []);

    // 使筛选项受控
    if (searchVersion === SearchVersion.V2 && searchConditions) {
      columns = columns.map((column) => {
        if (column.filters) {
          const filterCondition = searchConditions.find((item) => {
            if (item.type === "fromFilter") {
              const key = column.searchKey || column.key;
              return item.name.key === key;
            }
            return false;
          });
          if (filterCondition) {
            return {
              ...column,
              filteredValue: filterCondition.values.map((v) => v.key),
            };
          }
          return {
            ...column,
            filteredValue: null,
          };
        }
        return column;
      });
    }

    return columns;
  }, [
    viewMap,
    view,
    customColumnConfig,
    customColumnPath,
    columnKeys,
    JSON.stringify(searchColumnKeys),
    setColumnKeys,
    searchColumnIndex,
    list,
    resource,
    hasAuth,
    searchVersion,
    JSON.stringify(searchConditions),
  ]);

  const customActionColumn = useMemo(
    () => list.find((item) => item.key === actionKey),
    [list],
  );

  return {
    filterColumns,
    customActionColumn,
    resourceAttributeColumnList,
    resourceAttributeColumnLoading,
    resourceAttributeKeyList,
  };
}

// 获取用户是否有对应的操作权限
export function useActionAuth() {
  const { hasAuth: has } = useAuth();

  const hasAuth = useCallback(
    ({
      keys,
      menuList,
      resource,
    }: {
      keys: string[];
      menuList: Required<IActionProps<any, any>>["menuList"];
      resource?: string;
    }) =>
      keys.some((key) =>
        has(
          findAuthByKey(key, menuList) ?? {
            type: "action",
            authKey: key,
            resource,
          },
        ),
      ),
    [has],
  );

  return {
    hasAuth,
  };
}

type IUseRowSelect<T extends Item> = Pick<
  ITableListProps<T>,
  | "selectType"
  | "rowSelection"
  | "rowKey"
  | "view"
  | "actionConfig"
  | "resource"
> & {
  selectedList?: Array<T>;
  setSelectedList: (v: Array<T>) => void;
  maxSelectedCount?: number;
};

export function useRowSelect<T extends Item>({
  rowKey = "uuid",
  selectedList,
  setSelectedList,
  selectType = "checkbox",
  rowSelection: rs,
  actionConfig,
  view,
  resource,
  maxSelectedCount = -1,
}: IUseRowSelect<T>) {
  const { hasAuth } = useActionAuth();

  const rowSelection: TableRowSelection<T> | undefined = useMemo(() => {
    // 为 false，返回 undefined 隐藏选择列
    if (rs === false) {
      return undefined;
    }

    if (!view.startsWith("select") && actionConfig) {
      const { activeKeys = [], extraKeys = [] } =
        actionConfig.viewMap?.[`${view}/toolbar`] ?? {};

      // 非选择列表，且 toolbar 中的没有操作，用户都没有权限时，隐藏操作列
      if (
        !hasAuth({
          keys: [...activeKeys, ...extraKeys],
          menuList: actionConfig.list,
          resource,
        })
      ) {
        return;
      }
    }

    const getCheckboxProps = rs?.getCheckboxProps;

    return {
      ...rs,
      getCheckboxProps: getCheckboxProps
        ? (record) => getCheckboxProps(record, selectedList, rowKey)
        : undefined,
      columnWidth: 40,
      fixed: true,
      type: selectType,
      selectedRowKeys: selectedList?.map(({ [rowKey]: v }) => v) ?? [],
      onChange: (_, items: Array<T>) => {
        if (maxSelectedCount !== -1) {
          const result = items.reverse().splice(0, maxSelectedCount);
          setSelectedList(result);
        } else {
          setSelectedList(items);
        }
      },
      preserveSelectedRowKeys: true,
      renderCell: (checked, record, index, originNode) =>
        React.cloneElement(originNode as React.ReactElement, {
          "data-testid": `select-${record[rowKey]}`,
        }),
    };
  }, [
    rs,
    view,
    actionConfig,
    selectType,
    selectedList,
    hasAuth,
    resource,
    rowKey,
    setSelectedList,
    maxSelectedCount,
  ]);

  return rowSelection;
}

export function useDeepState<T>(
  state: T,
  { deep = true }: { deep?: boolean } = {},
): T {
  const stateRef = useRef<T>(state);

  // deep 为 true 时深度比较。deep 为 false 时，isChange 始终标记为 true。从而保证的 state 是最新的。
  const isChange = useMemo(
    () => !deep || !isEqual(stateRef.current, state),
    [state, deep],
  );

  if (isChange) {
    stateRef.current = state;
  }

  return stateRef.current;
}

// 用于 tabs 切换tab 时清空选中
export function useTabsToggleClearSelectedList<T extends Item>({
  view,
  setSelectedList,
  selectedList,
}: Pick<IUseRowSelect<T>, "selectedList" | "setSelectedList" | "view">) {
  const { equal } = useTabs();
  const ref = useRef(selectedList);
  ref.current = selectedList;

  useEffect(() => {
    if (view?.startsWith("select") || !equal || !ref.current?.length) {
      return;
    }

    setSelectedList([]);
  }, [equal, setSelectedList, view]);
}
