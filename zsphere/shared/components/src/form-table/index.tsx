import { Icon } from "@zstack/icon";
import { Op, IQuery } from "@zstack/zsphere-types";
import { useControllableValue } from "ahooks";
import { Button, Modal, Space, TableColumnType } from "antd";
import { isEqual } from "lodash-es";
import React, {
  useImperativeHandle,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../_utils/common";
import Alert from "../a-cloud-old-components/alert";
import Table from "../a-cloud-old-components/table";
import { CreateProvider } from "./context";
import { useSelectedList } from "./hooks";

import "./style.less";
import type { IFormTableProps, IFormTableRef, Item } from "./type";

export const TableSelectProvider = CreateProvider;
export { useTableSelect } from "./context";
export type { IFormTableProps, IFormTableRef } from "./type";

const baseCls = getBaseCls("virtualization-form-table");

function FormTable<T extends Item>(props: IFormTableProps<T>, ref: any) {
  const intl = useIntl();
  const {
    title,
    children,
    alertMessage,
    alertType = "info",
    columnConfig,
    value: propValue,
    onChange,
    maxSelectedCount = -1,
    emptyActionText = intl.formatMessage({
      id: "add.node",
      defaultMessage: "Add Node",
    }),
    primaryKey = "uuid",
    preSeletedList = [],
  } = props;

  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  const [visible, setVisible] = useControllableValue(props, {
    defaultValue: false,
    valuePropName: "visible",
    trigger: "setVisible",
  });

  const { defaultQuery }: { defaultQuery?: IQuery } = children?.props ?? {};

  const value = useMemo(() => {
    const allItems = [...(propValue || []), ...preSeletedList];
    const uniqueMap = new Map();
    allItems.forEach((item) => {
      if (!uniqueMap.has(item[primaryKey])) {
        uniqueMap.set(item[primaryKey], item);
      }
    });
    return Array.from(uniqueMap.values());
  }, [propValue, preSeletedList, primaryKey]);

  // 使用 ref 来缓存 value 的深度比较结果，避免不必要的重新计算
  const valueRef = useRef(value);
  const stableValue = useMemo(() => {
    if (!isEqual(valueRef.current, value)) {
      valueRef.current = value;
    }
    return valueRef.current;
  }, [value]);

  const defaultQueryWithNotinUuids: IQuery = useMemo(() => {
    let notInValues: string[] = [];
    if (stableValue && stableValue.length > 0) {
      notInValues = stableValue.reduce<string[]>(
        (prev, { [primaryKey]: k }) =>
          k !== undefined && k !== null ? [...prev, k] : prev,
        [],
      );
    }

    return {
      ...defaultQuery,
      conditions: [
        ...(defaultQuery?.conditions ?? []),
        { key: String(primaryKey), op: Op.notIn, values: notInValues },
      ],
    };
  }, [primaryKey, defaultQuery, stableValue]);

  const defaultQueryMemo: IQuery | undefined = useMemo(
    () => ({
      ...defaultQueryWithNotinUuids,
      start: 0,
    }),
    [defaultQueryWithNotinUuids],
  );

  const defaultQueryMemoRef = useRef(defaultQueryMemo);

  // 在弹窗关闭后，缓解 defaultQuery 造成 TableList 过度请求。
  if (visible) {
    defaultQueryMemoRef.current = defaultQueryMemo;
  }

  const finalColumnConfig = useMemo(() => {
    if (!columnConfig) return [];
    return [
      ...columnConfig,
      {
        key: "actions",
        title: intl.formatMessage({
          id: "action",
          defaultMessage: "Actions",
        }),
        width: 50,
        align: "center",
        render: (_: unknown, record: T) => {
          const isPreSelected = preSeletedList.some(
            (item) => item[primaryKey] === record[primaryKey],
          );
          return (
            <Icon
              type="trash"
              className={`${baseCls}-action-icon ${
                isPreSelected ? `${baseCls}-action-icon-disabled` : ""
              }`}
              onClick={() => {
                if (isPreSelected) return;
                const newValue = stableValue.filter(
                  (item) => item[primaryKey] !== record[primaryKey],
                );
                onChange?.(newValue);
              }}
            />
          );
        },
      } as TableColumnType<T>,
    ];
  }, [columnConfig, stableValue, onChange, intl, preSeletedList, primaryKey]);

  const {
    selectedList,
    setSelectedList,
    setSelectedListByOk,
    setSelectedListByCancel,
    isSelectOverflowMax,
  } = useSelectedList({
    value: stableValue,
    onChange,
    selectType: "checkbox",
    visible,
    maxSelectedCount,
  });

  useImperativeHandle(
    ref,
    () => ({
      selectedList,
      setSelectedList,
    }),
    [selectedList, setSelectedList],
  );

  const onCancel = () => {
    setVisible(false);
    setSelectedListByCancel();
  };

  const onSelectModalShow = () => {
    setVisible(true);
  };

  const handleModalTableSelectChange = useCallback(
    (_selectedRowKeys: React.Key[], rows: T[]) => {
      setSelectedList(rows);
    },
    [setSelectedList],
  );

  const childrenEle = React.cloneElement(children, {
    ...children.props,
    selectType: "checkbox",
    value: selectedList,
    onChange: setSelectedList,
    rowKey: "uuid",
    rowSelection: {
      type: "checkbox",
      selectedRowKeys: selectedList.map((row) => row.uuid),
      onChange: handleModalTableSelectChange,
    },
    clickRowToggleSelected: true,
    miniHeigthRow: true,
    defaultQuery: defaultQueryMemoRef.current,
    className: `${baseCls}-table-list`,
    autoAllocation: true,
  });

  const onOk = () => {
    setVisible(false);
    const newSelectedList = setSelectedListByOk();
    onChange?.(newSelectedList);
    return newSelectedList;
  };

  const onRemove = () => {
    if (!selectedRows.length) return;
    const newValue = stableValue.filter(
      (item) =>
        !selectedRows.some((sel) => sel[primaryKey] === item[primaryKey]),
    );
    onChange?.(newValue);
    setSelectedRows([]);
  };

  return (
    <div className={baseCls}>
      <div className={`${baseCls}-button-content`}>
        <Space size={4}>
          <Button onClick={onSelectModalShow} disabled={isSelectOverflowMax}>
            {intl.formatMessage({
              id: "add",
              defaultMessage: "Add",
            })}
          </Button>
          <Button onClick={onRemove} disabled={!selectedRows.length}>
            {intl.formatMessage({
              id: "remove",
              defaultMessage: "Remove",
            })}
          </Button>
        </Space>
      </div>

      <Table
        style={{ marginTop: 8 }}
        rowKey={primaryKey}
        className={`${baseCls}-table`}
        rowSelection={
          // preSeletedList.length === 0
          // ?
          {
            type: "checkbox",
            selectedRowKeys: selectedRows.map(
              (row) => row[primaryKey],
            ) as React.Key[],
            onChange: (_selectedRowKeys: React.Key[], rows: T[]) =>
              setSelectedRows(rows),
            getCheckboxProps: (record: T) => ({
              disabled: preSeletedList.some(
                (item) => item[primaryKey] === record[primaryKey],
              ),
            }),
          }
          // : undefined
        }
        columns={finalColumnConfig}
        pagination={false}
        dataSource={stableValue}
        locale={{
          emptyText: (
            <>
              <div className="empty">
                <div className="circle">
                  <Icon type="inbox" className="circleIcon" />
                </div>
                <div className="emptyRow">
                  {intl.formatMessage(
                    {
                      id: "table.no.data",
                      defaultMessage: "No data, {addNode}",
                    },
                    {
                      addNode: (
                        <span
                          className={`${baseCls}-add-node`}
                          onClick={onSelectModalShow}
                        >
                          {emptyActionText}
                        </span>
                      ),
                    },
                  )}
                </div>
              </div>
            </>
          ),
        }}
      />

      <Modal
        title={title}
        width={800}
        closeIcon={<Icon type="close" />}
        getContainer="body"
        visible={visible}
        destroyOnClose
        className={`${baseCls}-modal`}
        onCancel={onCancel}
        zIndex={1200}
        footer={
          <>
            <Button id="drawer-cancel" type="text" onClick={onCancel}>
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button
              id="drawer-ok"
              onClick={onOk}
              type="primary"
              style={{ marginRight: 8 }}
              disabled={!selectedList.length}
            >
              {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
            </Button>
          </>
        }
        maskClosable={false}
        centered
      >
        {alertMessage && (
          <Alert
            closable={true}
            type={alertType}
            message={alertMessage}
            display="blockStrong"
            className={`${baseCls}-alert`}
          />
        )}
        <div className={`${baseCls}-virtualization-modal-body`}>
          {childrenEle}
        </div>
      </Modal>
    </div>
  );
}

export default React.forwardRef<IFormTableRef<any>, IFormTableProps<any>>(
  FormTable,
);
