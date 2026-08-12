import { Condition, Item, Op } from "@zstack/zsphere-types";
import { useControllableValue, usePersistFn } from "ahooks";
import { ConfigProvider, Spin } from "antd";
import cls from "classnames";
import { uniqueId } from "lodash-es";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getBaseCls } from "../../_utils/common";
import Action from "../action";
import { IActionProps } from "../action/type";
import {
  AuthInfoContext,
  noValidResource,
  useAuth,
  useAuthInfoContext,
} from "../auth";
import { ConfigContext, SearchVersion } from "../config";
import Pagination from "../pagination";
import type { ICustomTableOnChange, IToggleOption } from "./base-type";
import { useSearch } from "./components/search-advanced";
import { SearchContext } from "./components/search-advanced/context";
import {
  useColumns,
  useDeepState,
  useDefaultQuery,
  useFetch,
  usePreFetch,
  useRowSelect,
  useTabsToggleClearSelectedList,
} from "./hooks";
import { StoreProvider } from "./store";

import "./style.less";
import { TableDetail } from "./table-detail";
import Table from "./table-zsv";
import Toolbar from "./toolbar";
import type { ITableListProps } from "./type";

export type { IColumnType } from "./base-type";
export { useDefaultQuery, useFetch, usePreFetch } from "./hooks";
export type { IUseFetchParams } from "./hooks";
export { TableDetailLink } from "./table-detail";
export type { ITableListController, ITableListProps } from "./type";

const baseCls = getBaseCls("table-list");

function TableList<T extends Item>(props: ITableListProps<T>) {
  const {
    skip = false,
    view,
    customView,
    style,
    className,
    columnKeys,
    queryConfig,
    columnConfig,
    actionConfig,
    expandable,
    rowSelection: rs,
    pagination = true,
    renderToolbar,
    renderAction,
    tableProps,
    renderRowTooltip,
    source,
    rowKey = "uuid",
    selectType = "checkbox",
    defaultQuery: dq,
    gql,
    type,
    toolbar,
    fetchPolicy,
    onFetchChange,
    toggleOptions,
    renderMiddleToolbar,
    renderRightToolbar,
    renderRowDetail,
    withResourceAttribute,
    resourceAttributeConfig,
    onClear,
    toolbarHandleTooltip,
    resource,
    onRefetchBtnClick,
    clickRowToggleSelected = true,
    showSizeChanger = true,
    beforeQuery,
    limitLoop,
    customFileName,
    renderCustomExportModal,
    disabledKeyList,
    actionVerifyPolicy = "once",
    cloumnEmpty,
    extraColumns = [],
    showExtraColumnKey = false,
    searchColumnKeys = [],
    searchColumnIndex = -1,
    maxSelectedCount = -1,
    setColumnKeys,
    allGqlKeysWhenExport = false,
    apolloQueryOptions,
    resultMapper,
    paginationProps,
    searchProps,
    onlySingleSearch = false,
    searchVersion: _serachVersion,
    showClear,
    graphqlConfig,
    setRightToolBarCollapsed = false,
    extraDataList,
    fixHeaderOnTop = true,
    footer,
    actionMenuListMapper,
    disabledLoading = false,
    preserveSelectedOnQueryChange = false,
    controller,
  } = props;

  const instanceId = useRef(uniqueId("table-instance-")).current;

  const { hasAuth } = useAuth();

  const attributeEnabled =
    withResourceAttribute &&
    resourceAttributeConfig &&
    (!resourceAttributeConfig?.auth || hasAuth(resourceAttributeConfig.auth));

  const { tableList: tableListConfig } = React.useContext(ConfigContext);
  const searchVersion = React.useMemo(() => {
    if (_serachVersion === undefined) {
      return tableListConfig?.searchVersion ?? SearchVersion.V2;
    }
    return _serachVersion;
  }, [_serachVersion, tableListConfig?.searchVersion]);

  const { dispatch, conditions, searchId } = useSearch(
    resource || noValidResource,
    view,
  );

  const defaultQuery = useDeepState(dq, { deep: !view?.startsWith("select") });

  const [selectedList, _setSelectedList] = useControllableValue<Array<T>>(
    props,
    {
      defaultValue: [],
    },
  );

  const setSelectedList = usePersistFn(_setSelectedList);

  const rowSelection = useRowSelect({
    rowKey,
    selectedList,
    setSelectedList,
    selectType,
    rowSelection: rs,
    view,
    actionConfig,
    resource: resource || noValidResource,
    maxSelectedCount,
  });

  const [customRefresh, setCustomRefresh] = useState<number>(Math.random);

  const {
    filterColumns,
    customActionColumn,
    resourceAttributeColumnList,
    resourceAttributeColumnLoading,
    resourceAttributeKeyList,
  } = useColumns(
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
    },
    conditions,
    searchVersion,
  );

  const {
    defaultQuery: defaultQueryMemo,
    tableQueryChange,
    setSearchQuery,
    searchQuery,
  } = useDefaultQuery(
    {
      defaultQuery,
      customRefresh,
      filterColumns,
      instanceId,
    },
    dispatch,
    searchVersion,
    view,
    controller,
  );

  const {
    list: dataSource,
    total,
    loading: dataLoading,
    refetch,
    query,
    setQuery,
    refetchWithClearSelectedList,
  } = useFetch({
    skip,
    defaultQuery: defaultQueryMemo,
    gql,
    view,
    type,
    fetchPolicy,
    onFetchChange,
    setSelectedList,
    beforeQuery,
    apolloQueryOptions:
      apolloQueryOptions ?? tableListConfig?.apolloQueryOptions,
    resultMapper: resultMapper ?? tableListConfig?.resultMapper,
    graphqlConfig,
    actionConfig,
    resource,
    filterColumns,
    extraDataList,
    disabledLoading,
    attributeEnabled,
    instanceId,
  });
  const loading = dataLoading || resourceAttributeColumnLoading;

  usePreFetch({
    defaultQuery: defaultQuery,
    gql,
    type,
    skip,
    filterColumns,
    graphqlConfig,
  });

  //
  useLayoutEffect(() => {
    if (preserveSelectedOnQueryChange) return;
    setSelectedList([]);
  }, [preserveSelectedOnQueryChange, defaultQueryMemo, setSelectedList]);

  useTabsToggleClearSelectedList({ view, selectedList, setSelectedList });

  const getActionProps = useCallback<any>(
    ({ position: p, selectedList: s }: any) => ({
      view,
      position: p,
      selectedList: s,
      source,
      refetch,
      setSelectedList,
    }),
    [refetch, setSelectedList, source, view],
  );

  const getActionComponent = useCallback(
    ({
      position: p,
      selectedList: s,
    }: {
      position: string;
      selectedList: T[];
    }) => {
      if (!actionConfig?.list?.length) {
        return undefined;
      }

      const actionProps = getActionProps({ position: p, selectedList: s });

      const { list: menuList, viewMap, getItemName } = actionConfig;

      if (!actionProps) {
        return undefined;
      }

      return (
        <Action
          {...actionProps}
          menuList={
            actionMenuListMapper
              ? actionMenuListMapper({
                  ...actionProps,
                  menuList,
                  viewMap,
                })
              : menuList
          }
          viewMap={viewMap}
          verifyPolicy={actionVerifyPolicy}
          getPopupContainer={() =>
            document.getElementById(idRef.current) || document.body
          }
          getItemName={getItemName}
        />
      );
    },
    [actionConfig, actionVerifyPolicy, getActionProps],
  );

  const [renderKey, setRenderKey] = useControllableValue<string>(props, {
    defaultValue: "__table__",
    valuePropName: "selectedToggleKey",
    trigger: "onToggleSelect",
  });

  const renderActionMemo = useMemo(() => {
    if (!renderAction) {
      return;
    }

    return ({
      node,
      current,
      ...rest
    }: {
      node: React.ReactNode;
      current: T;
    } & Pick<IActionProps<T>, "position" | "selectedList">) =>
      renderAction({ node, current, ...getActionProps(rest) });
  }, [renderAction, getActionProps]);

  const pageChangeRef = useRef(false);

  // 用于覆盖 组件 table 和 Pagination onChange
  const _onChange = React.useMemo(
    () => tableProps?.onChange ?? tableListConfig?.tableProps?.onChange,
    [tableProps, tableListConfig],
  );
  const customOnChange = React.useCallback(
    (...args: any[]) => {
      if (!_onChange) {
        return null;
      }
      const trigger =
        args?.[0]?.trigger === "Pagination" ? "Pagination" : "Table";

      let onChangeProps: ICustomTableOnChange;

      if (trigger === "Pagination") {
        // Pagination onChange
        onChangeProps = { ...args[0] };
      } else {
        // table onChange
        onChangeProps = {
          pagination: args[0],
          filters: args[1],
          sorter: args[2],
          extra: args[3],
          trigger,
        };
      }

      _onChange(onChangeProps);
    },
    [_onChange],
  );

  const tableOnChange = React.useMemo(() => {
    if (_onChange) {
      return customOnChange;
    }

    return tableQueryChange;
  }, [customOnChange, tableQueryChange, _onChange]);

  const paginationOnChange = React.useMemo(() => {
    if (_onChange) {
      return customOnChange;
    }

    return null;
  }, [customOnChange, _onChange]);

  const sort = useMemo(
    () => ({
      sortBy: defaultQueryMemo?.sortBy,
      sortDirection: defaultQueryMemo?.sortDirection,
    }),
    [defaultQueryMemo],
  );

  const tableOption = useMemo<Partial<IToggleOption<T>>>(
    () => ({
      key: "__table__",
      render() {
        return (
          <>
            <Table
              {...tableProps}
              view={view}
              resource={resource}
              query={query}
              rowKey={rowKey}
              loading={loading}
              viewMap={actionConfig?.viewMap}
              menuList={actionConfig?.list}
              source={source}
              getItemName={actionConfig?.getItemName}
              setQuery={setQuery}
              onChange={tableOnChange as any}
              expandable={expandable}
              dataSource={dataSource}
              renderAction={renderActionMemo}
              renderRowTooltip={renderRowTooltip}
              selectedList={selectedList as any}
              rowSelection={rowSelection}
              setSelectedList={setSelectedList as any}
              customActionColumn={customActionColumn}
              onClear={onClear}
              filterColumns={filterColumns}
              customRefresh={customRefresh}
              getPopupContainer={() =>
                document.getElementById(idRef.current) || document.body
              }
              miniHeigthRow
              clickRowToggleSelected={clickRowToggleSelected}
              delayLoad={[100, 50].includes(query.limit!)}
              pageChangeRef={pageChangeRef}
              cloumnEmpty={cloumnEmpty}
              sort={sort}
              showClear={showClear}
              maxSelectedCount={maxSelectedCount}
              fixHeaderOnTop={fixHeaderOnTop}
            >
              {getActionComponent}
            </Table>
            {pagination && total ? (
              <Pagination
                onChange={paginationOnChange as any}
                total={total}
                query={query}
                pageChangeRef={pageChangeRef}
                setQuery={setQuery}
                selectedCount={selectedList?.length}
                showSizeChanger={showSizeChanger}
                {...paginationProps}
              />
            ) : null}
          </>
        );
      },
    }),
    [
      paginationOnChange,
      tableOnChange,
      paginationProps,
      actionConfig,
      dataSource,
      expandable,
      getActionComponent,
      loading,
      pagination,
      query,
      rowKey,
      rowSelection,
      selectedList,
      setQuery,
      setSelectedList,
      tableProps,
      total,
      view,
      resource,
      onClear,
      customRefresh,
      filterColumns,
      customActionColumn,
      renderActionMemo,
      clickRowToggleSelected,
      showSizeChanger,
      cloumnEmpty,
      sort,
    ],
  );

  const toggleOptionsMemo = useMemo(() => {
    if (!toggleOptions?.length) {
      return [tableOption] as Required<ITableListProps<T>>["toggleOptions"];
    }

    return toggleOptions.reduce<Required<ITableListProps<T>>["toggleOptions"]>(
      (prev, item) => {
        if (item.key !== "__table__") {
          return [...prev, item];
        }

        return [...prev, { ...tableOption, ...item }];
      },
      [],
    );
  }, [tableOption, toggleOptions]);

  const renderEle = useMemo(
    () =>
      toggleOptionsMemo
        .find(({ key }) => key === renderKey)
        ?.render?.({
          dataSource,
          value: selectedList,
          onChange: setSelectedList,
          refetch,
        }),

    [
      toggleOptionsMemo,
      dataSource,
      selectedList,
      setSelectedList,
      refetch,
      renderKey,
    ],
  );

  const onRefetchBtnClickWrapper = useCallback(
    () => onRefetchBtnClick?.({ refetch }),
    [onRefetchBtnClick, refetch],
  );

  const toolbarProps = {
    view,
    customView,
    toolbar,
    refetch: refetchWithClearSelectedList,
    setQuery: setSearchQuery,
    queryConfig,
    selectedList: selectedList!,
    toggleOptions: toggleOptionsMemo,
    selectedToggleKey: renderKey,
    renderMiddleToolbar,
    renderRightToolbar,
    onToggleSelect: (key: string) => setRenderKey(key),
    children: getActionComponent,
    columnConfig,
    customColumnLoading: resourceAttributeColumnLoading,
    resourceAttributeColumnList,
    resourceAttributeSearch: attributeEnabled
      ? {
          keyList: resourceAttributeKeyList,
        }
      : undefined,
    columnKeys,
    resource,
    viewMap: actionConfig?.viewMap,
    menuList: actionConfig?.list,
    setCustomRefresh,
    customRefresh,
    dataSource,
    iQuery: query,
    query,
    gql,
    toolbarHandleTooltip,
    onRefetchBtnClick: onRefetchBtnClick ? onRefetchBtnClickWrapper : undefined,
    limitLoop,
    extraColumns,
    showExtraColumnKey,
    customFileName,
    renderCustomExportModal,
    disabledKeyList,
    searchProps,
    filterColumns,
    allGqlKeysWhenExport,
    onlySingleSearch,
    searchVersion,
    isCollapsed: setRightToolBarCollapsed,
  };

  const { value } = useAuthInfoContext(resource || noValidResource);

  const idRef = useRef<string>("");
  if (!idRef.current) {
    idRef.current = uniqueId(`zstack-table-list-${value?.key}-`)?.replace(
      ".",
      "-",
    );
  }

  useEffect(() => {
    if (conditions) {
      const newConditionMap = new Map<string, Condition>();
      conditions.forEach((item) => {
        const _key = item.name.searchKey || item.name.key;
        let _op: Op = Op.like;
        let _value: string | number | boolean | undefined;
        let _values: (string | number | boolean)[] | undefined;
        switch (item.name.type) {
          case "input":
            _op = Op.like;
            _value = item.values[0].key.trim().replace(/'/g, `''`);
            break;
          case "singleSelect":
            _op = Op.eq;
            _value = item.values[0].key;
            // special resolution for the ZSV-1440, a little stupid, but it works and the risk is low.
            _values = [item.values[0].key];
            break;
          case "multipleSelect":
          case "tag":
            _op = Op.in;
            _values = item.values.map((v) => {
              if (v.key === "none") {
                return "__null__";
              }
              return v.key;
            });
            break;
          case "attribute":
            _op = Op.in;
            _value = item.name.key;
            _values = item.values.map((v) => v.key);
            break;
          default:
            break;
        }
        const newCondition = {
          key: _key,
          value: _value,
          values: _values,
          op: _op,
        };
        const existCondition = newConditionMap.get(_key);
        if (existCondition?.values && _values) {
          newCondition.values = existCondition.values.concat(_values);
        }
        if (item.name.type === "attribute") {
          newCondition.key = "__attribute__";
        }
        if (item.conditionTransform) {
          const condition = item.conditionTransform(
            newCondition.values as string[],
          ); // conditiontransform可能返回undefined
          if (condition) newConditionMap.set(_key, condition);
        } else newConditionMap.set(_key, newCondition);
      });
      const newConditions = Array.from(newConditionMap.values());
      const newQuery = {
        ...searchQuery,
        conditions: newConditions,
        start: 0,
      };
      setSearchQuery(newQuery);
    }
  }, [JSON.stringify(conditions)]);

  const Footer = React.useMemo(() => {
    if (footer) {
      const RenderFooter = footer;
      return (
        <RenderFooter
          dataSource={dataSource}
          selectedList={selectedList}
          setSelectedList={setSelectedList}
          refetch={refetch}
          loading={loading}
          total={total}
        />
      );
    }
  }, [
    footer,
    dataSource,
    selectedList,
    setSelectedList,
    refetch,
    loading,
    total,
  ]);

  const shouldRenderDetail = !!renderRowDetail && !view?.startsWith("select");

  return (
    <StoreProvider initialValue={{ renderDetail: shouldRenderDetail }}>
      <ConfigProvider getPopupContainer={() => document.body}>
        <AuthInfoContext.Provider value={value}>
          <SearchContext.Provider value={{ dispatch, conditions, searchId }}>
            <div
              className={cls(baseCls, className)}
              style={style}
              id={idRef.current}
            >
              <div data-testid="loading" style={{ display: "none" }}>
                {loading ? "true" : "false"}
              </div>
              {renderToolbar ? (
                renderToolbar(toolbarProps)
              ) : (
                <Toolbar {...toolbarProps} />
              )}
              <Spin spinning={loading}>
                {renderEle}
                {Footer}
              </Spin>
            </div>
          </SearchContext.Provider>
        </AuthInfoContext.Provider>
      </ConfigProvider>
      {shouldRenderDetail && (
        <TableDetail
          rowKey={rowKey as unknown as string}
          dataSource={dataSource}
          renderRowDetail={renderRowDetail}
        />
      )}
    </StoreProvider>
  );
}

export default TableList;
