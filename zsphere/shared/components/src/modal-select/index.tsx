import { gql, DocumentNode } from "@apollo/client";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDivider,
  DialogFooter,
  DialogHeader,
  DialogScrollArea,
  DialogTitle,
} from "@zstack/design";
import { Icon } from "@zstack/icon";
import { IQuery } from "@zstack/zsphere-types";
import { useControllableValue } from "ahooks";
import { Button, Divider, List, Table, Tooltip } from "antd";
import { FormItemInputContext } from "antd/es/form/context";
import classNames from "classnames";
import { isEmpty } from "lodash-es";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../_utils/common";
import { Alert, Text } from "../a-cloud-old-components";
import { CreateProvider } from "./context";
import { useAutoSelectQuery, useSelectedList } from "./hooks";
import { buildModalSelectDefaultQuery } from "./query";

import "./style.less";
import type { ISelectTableProps, ISelectTableRef, Item } from "./type";

export const TableSelectProvider = CreateProvider;
export { useTableSelect } from "./context";
export type { ISelectTableProps, ISelectTableRef } from "./type";

const baseCls = getBaseCls("virtualization-modal-select");

//what content is doesn’t matter
const _gql = gql`
  query autoDispathItem {
    dispathItem {
      uuid
      name
    }
  }
`;

function ModalSelect<T extends Item>(props: ISelectTableProps<T>, ref: any) {
  const {
    title,
    modalTitle,
    modalHeader,
    modalZIndex,
    modalWidth = 800,
    children,
    id,
    showSelect = true,
    forceShowSelect = false,
    selectType = "radio",
    destroyOnClose = true,
    modalForceRender,
    label,
    primaryKey = "uuid",
    visibleKey,
    renderFooter,
    alertMessage,
    alertClosable = false,
    alertType = "info",
    className,
    style,
    listClassName,
    wrapClassName,
    tableLayout,
    onChange,
    disabledItem = false,
    onCancel: _onCancel,
    onOk: _onOk,
    beforeOnOk,
    onSelectModalShow: _onSelectModalShow,
    columnConfig,
    hideColumnHeader = false,
    columnDatasourceTransform,
    value,
    disabledBtn,
    autoDispatch = false,
    autoSelect = false,
    autoSelectGql = _gql,
    transformKey = "name",
    tooltip,
    onMouseEnter,
    onMouseLeave,
    renderItemContent,
    maxSelectedCount = -1,
    maxCountOverflowTooltip,
    hideSelectedCountRatio = false,
    onTagClose: _onTagClose,
    disableRemoveSelect,
    customRender,
    resourceName,
  } = props;

  const intl = useIntl() as any;

  const { defaultQuery } = (children?.props || {}) as any;

  const [visible, setVisible] = useControllableValue(props, {
    defaultValue: false,
    valuePropName: "visible",
    trigger: "setVisible",
  });

  const {
    originSelectedList,
    orginOnChange,
    selectedList,
    setSelectedList,
    setSelectedListByOk,
    setSelectedListByCancel,
    numericalRatio,
    isSelectOverflowMax,
    isOverflowMax,
  } = useSelectedList({
    ...props,
    selectType,
    visible,
    maxSelectedCount,
  });

  const defaultQueryWithNotinUuids: IQuery = useMemo(
    () =>
      buildModalSelectDefaultQuery({
        defaultQuery,
      }),
    [defaultQuery],
  );

  const defaultQueryMemo: IQuery | undefined = useMemo(
    () => ({
      ...defaultQueryWithNotinUuids,
      start: 0,
    }),
    [visible, defaultQueryWithNotinUuids],
  );

  const defaultQueryMemoRef = useRef(defaultQueryMemo);

  const lockRef = useRef(false);
  if (!visible) {
    lockRef.current = false;
  }

  // 在弹窗关闭后，缓解 defaultQuery 造成 TableList 过度请求。
  if ((visible && !lockRef.current) || showSelect) {
    defaultQueryMemoRef.current = defaultQueryMemo;
  }

  const labelMemo =
    label ||
    intl.formatMessage({
      id: "add",
      defaultMessage: "Add",
    });

  const selectTableContextValue = useMemo(
    () => ({
      // 设置列表 link 是否支持跳转
      linkJump: false,
    }),
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      selectedList,
      setSelectedList,
    }),
    [selectedList, setSelectedList],
  );

  const onCancel = () => {
    lockRef.current = true;
    if (_onCancel) return _onCancel({ onClose: () => setVisible(false) });
    setVisible(false);
    setSelectedListByCancel();
  };

  const onSelectModalShow = () => {
    if (_onSelectModalShow) return _onSelectModalShow();
    if (!disabledItem) setVisible(true);
  };

  const childrenEle = React.cloneElement(children as any, {
    selectType: selectType || "radio",
    value: selectedList,
    onChange: setSelectedList,
    renderRowTooltip:
      maxCountOverflowTooltip && isSelectOverflowMax
        ? (param: any) => {
            if (
              param.selectedList?.find(
                (item: any) =>
                  item[param.rowKey] === param.current[param.rowKey],
              )
            ) {
              return null;
            }
            return maxCountOverflowTooltip;
          }
        : undefined,
    rowSelection: isSelectOverflowMax
      ? {
          getCheckboxProps: (current: any, selected: any[], rowKey: string) => {
            return {
              disabled:
                !selected ||
                !selected.find((item) => item[rowKey] === current[rowKey]),
            };
          },
        }
      : undefined,
    defaultQuery: defaultQueryMemoRef.current,
    clickRowToggleSelected: true,
    miniHeigthRow: true,
    className: `${baseCls}-table-list`,
    autoAllocation: true,
    preserveSelectedOnQueryChange: true,
  });

  const { autoSelectItem, getAutoSelectItem } = useAutoSelectQuery({
    autoSelectGql,
    autoSelect,
  });

  // 用于跟踪是否已经自动选择过，避免重复设置
  const autoSelectedRef = useRef(false);
  // 用于跟踪是否已经请求过，避免重复请求
  const autoSelectRequestedRef = useRef(false);
  // 用于序列化 defaultQuery，避免引用变化导致的重复请求
  const defaultQueryStringRef = useRef<string>("");
  // 用于跟踪上一次的 autoSelectGql，当它变化时重置请求标记
  const lastAutoSelectGqlRef = useRef<DocumentNode | undefined>(autoSelectGql);

  // 使用 ref 保存 onChange 和 _onOk 的最新引用，避免它们作为依赖导致无限循环
  const onChangeRef = useRef(onChange);
  const onOkRef = useRef(_onOk);
  onChangeRef.current = onChange;
  onOkRef.current = _onOk;

  useEffect(() => {
    if (
      autoSelect &&
      autoSelectItem &&
      autoSelectItem.length > 0 &&
      !autoSelectedRef.current
    ) {
      autoSelectedRef.current = true;
      onChangeRef.current?.(autoSelectItem);
      onOkRef.current?.(autoSelectItem);
    }
  }, [autoSelectItem, autoSelect]);

  // 序列化 defaultQuery 用于比较
  const defaultQueryString = useMemo(() => {
    if (!defaultQuery) return "";
    return JSON.stringify(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    // 当 autoSelectGql 变化时，重置所有标记
    if (lastAutoSelectGqlRef.current !== autoSelectGql) {
      autoSelectedRef.current = false;
      autoSelectRequestedRef.current = false;
      defaultQueryStringRef.current = "";
      lastAutoSelectGqlRef.current = autoSelectGql;
    }

    // 重置选择标记当 autoSelect 变为 false 时，但保留请求标记和查询字符串
    if (!autoSelect) {
      autoSelectedRef.current = false;
      return;
    }

    // 只在满足条件且未请求过或 defaultQuery 真正变化时才请求
    if (
      autoSelectGql !== _gql &&
      defaultQuery &&
      autoSelect &&
      (!autoSelectRequestedRef.current ||
        defaultQueryStringRef.current !== defaultQueryString)
    ) {
      autoSelectRequestedRef.current = true;
      defaultQueryStringRef.current = defaultQueryString;
      getAutoSelectItem({
        variables: {
          ...defaultQuery,
          start: 0,
          limit: 1,
        },
      });
    }
  }, [
    autoSelectGql,
    getAutoSelectItem,
    defaultQuery,
    autoSelect,
    defaultQueryString,
  ]);

  const onOk = async () => {
    if (beforeOnOk) {
      await beforeOnOk(selectedList);
    }
    lockRef.current = true;
    setVisible(false);
    const newSelectedList = setSelectedListByOk();
    onChange?.(newSelectedList);
    _onOk?.(newSelectedList);
    return newSelectedList;
  };

  const removeSelect = (e: any) => {
    e.stopPropagation();
    setSelectedList([]);
    onChange?.([]);
  };

  // 关闭标签
  const onTagClose = useCallback(
    (k: string) => {
      const newValue = _onTagClose
        ? _onTagClose(originSelectedList ?? [], k)
        : (originSelectedList?.filter(
            (item: Item) => item[primaryKey as string] !== k,
          ) ?? []);
      onChange?.(newValue);

      _onOk?.(newValue);
    },
    [originSelectedList, onChange, primaryKey, _onTagClose],
  );

  const ele = (
    <div className={`${baseCls}-footer-actions`}>
      <Button id="drawer-cancel" type="text" onClick={onCancel}>
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>
      <Button
        id="drawer-ok"
        onClick={onOk}
        type="primary"
        disabled={selectType !== "checkbox" && !selectedList.length}
      >
        {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
      </Button>
    </div>
  );

  const footer = renderFooter
    ? renderFooter({ node: ele, onOk, onCancel, selectedList })
    : ele;

  const renderSelectedList = () => {
    if (props?.renderSelectedList) {
      return props.renderSelectedList();
    }

    if (columnConfig) {
      const dataSource = columnDatasourceTransform
        ? columnDatasourceTransform(value)
        : value;
      const realColumnsConfig = hideColumnHeader
        ? columnConfig.concat([
            {
              key: "actions",
              align: "center",
              width: "52px",
              title: intl.formatMessage({
                id: "action",
                defaultMessage: "Actions",
              }),
              render: (_: any, current: any) => {
                return (
                  <Tooltip
                    title={
                      current?.disabled ? (current?.disabledTooltip ?? "") : ""
                    }
                  >
                    <Icon
                      className={classNames(`${baseCls}-action-icon`, {
                        [`${baseCls}-action-icon-disabled`]: current?.disabled,
                      })}
                      onClick={
                        !current?.disabled
                          ? () => onTagClose(current[primaryKey])
                          : undefined
                      } type="trash"
                    />
                  </Tooltip>
                );
              },
            } as any,
          ])
        : columnConfig;

      if (isEmpty(dataSource) && !forceShowSelect) return null;

      return (
        <Table
          className={listClassName}
          tableLayout={tableLayout}
          columns={realColumnsConfig}
          pagination={false}
          dataSource={dataSource}
        />
      );
    }

    return (
      <List
        className={listClassName}
        bordered
        size="small"
        dataSource={value}
        renderItem={(item) => {
          let renderItem: any;
          if (renderItemContent) {
            renderItem = renderItemContent(item);
          } else {
            renderItem = visibleKey ? item[visibleKey] : item.name;
          }

          return (
            <List.Item
              extra={
                <Icon
                  className={`${baseCls}-action-icon`}
                  onClick={() => onTagClose(item[primaryKey])} type="trash"
                />
              }
            >
              {renderItem}
            </List.Item>
          );
        }}
      />
    );
  };

  const getContent = (name: string | undefined, hasValue: boolean) => {
    // 如果实际有选中值，直接返回选中值
    if (hasValue && name) {
      return name;
    }
    // 只有在没有选中值且启用自动分配时才显示"自动分配"
    if ((!hasValue || !name) && autoDispatch) {
      return intl.formatMessage({
        id: "auto.select",
        defaultMessage: "Auto Allocated",
      });
    }
    return name || "";
  };

  const getModalTitle = useMemo(() => {
    return (
      <div className={`${baseCls}-title`}>
        <div className={`${baseCls}-title-base-title`}>
          {modalTitle ?? title}
        </div>
        {resourceName ? (
          <div className={`${baseCls}-title-resource-name`}>
            <Divider type="vertical" />
            <div className={`${baseCls}-title-resource-name-text`}>
              <Text value={resourceName} tooltipPlacement="bottom" />
            </div>
          </div>
        ) : null}
      </div>
    );
  }, [modalTitle, title, resourceName]);

  const content =
    typeof transformKey === "function"
      ? transformKey(value?.[0])
      : value?.[0]?.[transformKey];

  const hasValue = (value?.length ?? 0) > 0 && value?.[0];

  return (
    <div className={classNames(baseCls, className)} style={style} id={id}>
      {showSelect && selectType === "radio" && !customRender && (
        <div
          onClick={onSelectModalShow}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onSelectModalShow();
            }
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          role="button"
          tabIndex={disabledItem ? -1 : 0}
          className={classNames(`${baseCls}-select-input`, {
            [`${baseCls}-select-disabled-input`]: disabledItem,
          })}
        >
          <div className={classNames(`${baseCls}-select-input-value`)}>
            <div className={classNames(`${baseCls}-select-input-value-title`)}>
              <Text
                value={getContent(content, !!hasValue)}
                ellipsis
                className={
                  disabledItem
                    ? classNames("disabled-text-color")
                    : classNames("text-color")
                }
              />
            </div>
            {content && !disabledItem && !disableRemoveSelect && (
              <div className={classNames(`${baseCls}-select-input-close-icon`)}>
                <Icon
                  onClick={removeSelect}
                  className={classNames(
                    `${baseCls}-select-input-close-icon-svg`,
                  )} type="close-circle-fill"
                />
              </div>
            )}
          </div>
          <Button className={classNames(`${baseCls}-select-input-button`)}>
            <Icon
              className={classNames(`${baseCls}-select-input-button-svg`)} type="select"
            />
          </Button>
        </div>
      )}

      {selectType === "checkbox" && !customRender ? (
        <>
          {((value?.length ?? 0) > 0 && showSelect) || forceShowSelect
            ? renderSelectedList()
            : null}
          {showSelect &&
            (tooltip ? (
              <Tooltip
                title={
                  typeof tooltip === "function"
                    ? tooltip({ isOverflowMax })
                    : tooltip
                }
              >
                <Button
                  type="link"
                  className={classNames(`${baseCls}-add`)}
                  onClick={() => onSelectModalShow()}
                  disabled={disabledBtn || isOverflowMax}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                >
                  <Icon type="plus" />
                  {labelMemo}
                  {!hideSelectedCountRatio && numericalRatio}
                </Button>
              </Tooltip>
            ) : (
              <Button
                type="link"
                className={classNames(`${baseCls}-add`)}
                onClick={() => onSelectModalShow()}
                disabled={disabledBtn || isOverflowMax}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                <Icon type="plus" />
                {labelMemo}
                {!hideSelectedCountRatio && numericalRatio}
              </Button>
            ))}
        </>
      ) : null}

      {showSelect && customRender
        ? customRender({
            value,
            onChange,
            onSelectModalShow,
          })
        : null}

      <Dialog open={visible}>
        <DialogContent
          className={classNames(
            `${baseCls}-modal flex flex-col`,
            wrapClassName,
          )}
          style={{ width: modalWidth }}
          zIndex={modalZIndex}
        >
          {/* 阻断外层 Form.Item 的 error status 穿透到 Dialog 内部的 antd 组件 */}
          <FormItemInputContext.Provider value={{}}>
            <DialogHeader className="h-12 justify-between">
              <DialogTitle>{getModalTitle}</DialogTitle>
              <Icon
                className="h-5 w-5 cursor-pointer text-neutral-700"
                onClick={onCancel} type="close"
              />
            </DialogHeader>
            <DialogDivider />
            <DialogScrollArea className="flex-1 overflow-auto">
              <DialogBody className="pb-4">
                <CreateProvider value={selectTableContextValue}>
                  {alertMessage && (
                    <Alert
                      closable={alertClosable}
                      type={alertType}
                      message={alertMessage}
                      display="blockStrong"
                      className={`${baseCls}-alert`}
                    />
                  )}
                  {modalHeader}
                  <div className={`${baseCls}-virtualization-modal-body`}>
                    {childrenEle}
                  </div>
                </CreateProvider>
              </DialogBody>
            </DialogScrollArea>
            <DialogDivider />
            <DialogFooter className="gap-2">{footer}</DialogFooter>
          </FormItemInputContext.Provider>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default React.forwardRef<ISelectTableRef<any>, ISelectTableProps<any>>(
  ModalSelect,
);
