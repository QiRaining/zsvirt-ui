import { gql, useMutation, useQuery } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { Item } from "@zstack/zsphere-types";
import { genUuid } from "@zstack/zsphere-utils";
import { useUnmount } from "ahooks";
import { Tooltip } from "antd";
import cls from "classnames";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../_utils/common";
import Action from "../action";
import { AuthHander } from "../auth";
import Table from "../table";
import Text from "../text";
import {
  actionKey,
  IChildrenArgs,
  IColumnType,
  IRowTooltip,
  ITableProps,
} from "./base-type";
import { formatAuthParams, useActionAuth } from "./hooks";
import { useStore } from "./store";
import { hasNestedClickable } from "./utils";

export { formatAuthParams } from "./hooks";

const UpdatePersonalizationConfig = gql`
  mutation updatePersonalizationConfig(
    $input: UpdatePersonalizationConfigInput!
  ) {
    updatePersonalizationConfig(input: $input) {
      actionId
    }
  }
`;

const QueryPersonalizationConfig = gql`
  query queryPersonalizationConfig(
    $profileType: ProfileType!
    $resourceType: String!
  ) {
    queryPersonalizationConfig(
      profileType: $profileType
      resourceType: $resourceType
    ) {
      userId
      profileType
      resourceType
      value
    }
  }
`;

const baseCls = getBaseCls("table-list");

const ActionWrapper: React.FC<{
  children: (args: IChildrenArgs<any>) => React.ReactNode;
  current: any;
}> = ({ children, current }) => {
  const selectedList = useMemo(() => [current], [current]);

  return (
    <span
      onContextMenu={(e) => {
        e.stopPropagation();
      }}
    >
      {children({ position: "row", selectedList })}
    </span>
  );
};

/**
 * 右键唤出菜单需要考虑性能问题
 * 校验结果需要缓存
 */

function ZSVTable<T extends Item>(props: ITableProps<T>) {
  const {
    view,
    resource,
    query,
    rowKey = "uuid",
    loading,
    setQuery,
    children,
    dataSource,
    expandable,
    renderAction,
    rowSelection,
    filterColumns,
    viewMap: actionViewMap,
    menuList,
    customActionColumn,
    customRefresh,
    selectedList,
    setSelectedList,
    onRow,
    renderRowTooltip,
    clickRowToggleSelected = false,
    cloumnEmpty,
    sort,
    maxSelectedCount = -1,
    fixHeaderOnTop,
    ...rest
  } = props;

  const { hasAuth } = useActionAuth();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zsvActionMenuVisible, setZSVActionMenuVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const columnWidthConfigRef = useRef<{ [key: string]: number }>();

  const { loading: configLoading, data: columnWidthConfig } = useQuery(
    QueryPersonalizationConfig,
    {
      variables: {
        profileType: "TableColumnWidth",
        resourceType: `${resource}.${view}`,
      },
      fetchPolicy: "no-cache",
      skip: view.startsWith("select"),
    },
  );

  const [updateColumnWidthConfig] = useMutation(UpdatePersonalizationConfig);

  useUnmount(() => {
    if (columnWidthConfigRef.current && !view.startsWith("select")) {
      updateColumnWidthConfig({
        variables: {
          input: {
            payload: {
              profileType: "TableColumnWidth",
              resourceType: `${resource}.${view}`,
              value: JSON.stringify(columnWidthConfigRef.current),
            },
            action: {
              actionId: genUuid(),
              name: (intl as any).formatMessage({
                id: "save.table.column.width",
                defaultMessage: "Save Column Widths",
              }),
              total: 1,
            },
          },
        },
      });
    }
  });

  const selectedRow = useStore((state) => state.currentRow);
  const detailVisible = useStore((state) => state.detailVisible);
  const selectedRowKey = detailVisible
    ? selectedRow?.[rowKey ?? "uuid"]
    : undefined;
  const [tooltip, setTooltip] = useState<IRowTooltip>();

  useEffect(() => {
    const handler = () => setZSVActionMenuVisible(false);
    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("click", handler);
    };
  });

  const intl = useIntl();

  /**
   * 不显示操作列:
   * 1. 选择列表或者所有操作
   * 2. 没有权限
   * 3. ZSV列表
   * */
  const canAttachActionColumn = useMemo(() => {
    if (view.startsWith("select")) {
      return false;
    }

    const { activeKeys = [], extraKeys = [] } =
      actionViewMap?.[`${view}/row`] ?? {};

    return hasAuth({
      keys: [...activeKeys, ...extraKeys],
      menuList: menuList ?? [],
    });
  }, [actionViewMap, view, hasAuth, menuList]);

  const operation = useMemo<IColumnType<T> | undefined>(() => {
    if (!canAttachActionColumn) {
      return;
    }

    const innerActionColumn: IColumnType<T> = {
      title: (intl as any).formatMessage({
        id: "action",
        defaultMessage: "Actions",
      }),
      key: actionKey,
      // 操作设置为 66,加上 padding 从而带到设计的80
      width: 66 as number,
      align: "center",
      ...({
        render: (_: unknown, current: T) => {
          const node = (
            <ActionWrapper current={current}>{children}</ActionWrapper>
          );

          return renderAction
            ? renderAction({
                node,
                current,
                position: "row",
                selectedList: [current],
              } as any)
            : node;
        },
      } as any),
    };

    return {
      ...innerActionColumn,
      ...customActionColumn,
      // 点击操作列时，取消默认事件，从而修复点击操作列按钮时造成的该列选中的问题
      ...({
        onCell(record: any, index: any) {
          const attrs = (customActionColumn as any)?.onCell?.(record, index);
          return {
            ...attrs,
            onClick(e: any) {
              e.stopPropagation();
              attrs?.onClick?.(e);
            },
          };
        },
      } as any),
    };
  }, [canAttachActionColumn, intl, customActionColumn, children, renderAction]);

  const getColumnEmpty = useCallback(
    ({
      empty = "notConfig",
      children: child,
    }: {
      empty?: IColumnType<any>["empty"];
      children: React.ReactNode;
    }) => {
      // 如果 children 为空就返回对应的空状态，否则就返回原 children

      if (child || child === 0) {
        return child;
      }

      if (typeof empty === "string") {
        return (
          <div className={`${baseCls}-column-empty`}>
            {empty === "notSupport"
              ? "-"
              : (intl as any).formatMessage({
                  id: "none",
                  defaultMessage: "None",
                })}
          </div>
        );
      }

      if (!("render" in empty)) {
        return (
          <div className={`${baseCls}-column-empty`}>
            {empty.type === "notSupport"
              ? "-"
              : (intl as any).formatMessage({
                  id: "none",
                  defaultMessage: "None",
                })}
          </div>
        );
      }

      return typeof empty.render === "function" ? empty.render() : empty.render;
    },
    [intl],
  );

  // 1. 给第一列和最后一列添加 fixed
  // 2. 处理空状态
  // 3. 给 title 添加走查模式下的 AuthHander
  const formatColumns = useMemo(() => {
    const newFilterColumns = operation
      ? [...filterColumns, operation]
      : filterColumns;

    const lastIndex = newFilterColumns.length - 1;

    const widthConfigMap = JSON.parse(
      columnWidthConfig?.queryPersonalizationConfig?.value || "{}",
    );

    return (
      newFilterColumns.map(({ width = 140, filters, empty, ...re }, index) => {
        const authParams = formatAuthParams(re);

        const title =
          typeof re.title === "string" ? (
            <Text
              value={re.title}
              style={
                (re as any).align
                  ? { justifyContent: (re as any).align }
                  : undefined
              }
            />
          ) : (
            re.title
          );

        const column: IColumnType<T> = {
          ...re,
          width: widthConfigMap[re.key] ?? width,
          filters,
          filterIcon: filters ? <Icon type="funnel-fill" /> : false,
          title: authParams ? (
            <AuthHander {...(authParams as any)}>{title}</AuthHander>
          ) : (
            title
          ),
          ...({
            render(...args: any[]) {
              let columnEmptyChildren: React.ReactNode = "";

              if (args?.[0]?.extraData && !args?.[0]?.[column.key]) return "-";

              if ((re as any).render) {
                columnEmptyChildren = (re as any)?.render?.(...args);
              } else if (re.dataIndex) {
                //  antd column 不显示对象
                columnEmptyChildren =
                  typeof args[0] === "object" ? "" : args[0];
              }

              return getColumnEmpty({
                empty:
                  empty ??
                  cloumnEmpty ??
                  (column.key === actionKey ? "notSupport" : "notConfig"),
                children: columnEmptyChildren,
              });
            },
          } as any),
        };

        if (
          sort?.sortDirection &&
          (sort.sortBy === column.sortKey || sort.sortBy === column.key)
        )
          column.defaultSortOrder =
            sort.sortDirection === "asc" ? "ascend" : "descend";

        if (index === lastIndex && column.key === actionKey) {
          return { ...column, fixed: "right" } as IColumnType<T>;
        }

        return column;
      }) ?? []
    );
  }, [filterColumns, operation, cloumnEmpty, sort, columnWidthConfig]);

  const actionElemet = createPortal(
    <div
      key={`${position.x}${position.y}`}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        position: "absolute",
      }}
      ref={containerRef}
      id="sbwtest"
    >
      <Action
        {...props}
        menuList={menuList as any[]}
        getPopupContainer={() => document.body}
        selectedList={selectedList ?? []}
        // source={rowSelectedList?.[0]}
        visible={zsvActionMenuVisible}
        view={view}
        byRowRightClick
        position={(selectedList || [])?.length > 1 ? "toolbar" : "row"}
      />
    </div>,
    document.body,
  );

  return (
    <>
      <Table
        key={customRefresh}
        className={`${baseCls}-zsv`}
        showSorterTooltip={false}
        {...rest}
        query={query}
        rowKey={rowKey as string}
        loading={loading || configLoading}
        setQuery={setQuery}
        expandable={expandable}
        dataSource={dataSource}
        columns={formatColumns}
        rowSelection={rowSelection}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
        fixHeaderOnTop={fixHeaderOnTop}
        onColumnWidthChange={(value) => {
          columnWidthConfigRef.current = value;
        }}
        onRow={(currentRow, index) => {
          const attrs = onRow?.(currentRow, index);
          const currentRowKey = currentRow[rowKey ?? "uuid"];
          return {
            ...attrs,
            className: cls(attrs?.className, {
              [`${baseCls}-row-selected`]:
                !!selectedRowKey && selectedRowKey === currentRowKey,
            }),
            // zsv逻辑,
            onContextMenu: (ev: any) => {
              ev.preventDefault(); // 阻止默认的右键菜单弹出
              const modalMask = document.querySelector(".ant-modal-mask");

              // ModalSelect || modalMask || cloud 直接return

              if (["select"].includes(view) || !rowSelection || modalMask) {
                return;
              }

              const selectedListMap = selectedList?.reduce((obj, item) => {
                if (!obj[item[rowKey]]) {
                  obj[item[rowKey]] = obj;
                }
                return obj;
              }, {} as any);

              if (!selectedListMap[currentRow[rowKey]]) {
                setSelectedList?.([currentRow, ...(selectedList || [])]);
              }

              setPosition({ x: ev.clientX, y: ev.clientY });
              setZSVActionMenuVisible(true);
            },
            // 点击该行时，判断是否需要切换选中
            onClick(e) {
              if (clickRowToggleSelected && rowSelection) {
                if (rowSelection?.getCheckboxProps?.(currentRow)?.disabled) {
                  return;
                }
                if (hasNestedClickable(e)) {
                  // 如果点击行内类似按钮的东西，不触发选中
                  return;
                }
                const findIndex = selectedList?.findIndex(
                  (item) => item[rowKey as any] === currentRow[rowKey as any],
                );

                if (rowSelection.type === "checkbox") {
                  const list =
                    findIndex === -1
                      ? [...(selectedList ?? []), currentRow]
                      : selectedList?.filter((_, i) => i !== findIndex);

                  if (maxSelectedCount === -1) {
                    setSelectedList?.(list);
                  } else {
                    const result = list?.reverse().splice(0, maxSelectedCount);
                    setSelectedList?.(result);
                  }
                } else {
                  const list = findIndex === -1 ? [currentRow] : [];

                  setSelectedList?.(list);
                }
              }

              attrs?.onClick?.(e);
            },
            onMouseEnter: (event) => {
              if (renderRowTooltip && event.target instanceof Element) {
                const title = renderRowTooltip({
                  current: currentRow,
                  selectedList: selectedList ?? [],
                  rowKey,
                });
                const rowElem = event.target.closest("tr");
                const container = event.target.closest(".ant-table-content");
                if (title && rowElem && container) {
                  setTooltip({
                    top: rowElem.offsetTop - container.scrollTop,
                    open: true,
                    title,
                    key: currentRow[rowKey],
                  });
                }
              }
            },
            onMouseLeave: () => {
              if (renderRowTooltip && tooltip?.open) {
                setTooltip({ ...tooltip, open: false });
              }
            },
          };
        }}
      />
      {menuList?.length ? actionElemet : null}
      {renderRowTooltip ? (
        <Tooltip
          key={tooltip?.key}
          title={tooltip?.title ?? ""}
          open={tooltip?.open}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: tooltip?.top ?? 0,
            }}
          />
        </Tooltip>
      ) : null}
    </>
  );
}

export default ZSVTable;
