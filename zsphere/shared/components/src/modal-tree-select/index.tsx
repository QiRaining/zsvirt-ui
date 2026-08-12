import classNames from "classnames";
import { isBoolean } from "lodash-es";
import React, { useMemo } from "react";

import { getBaseCls } from "../_utils/common";
import Alert from "../a-cloud-old-components/alert";
import { CreateProvider } from "./context";

import "./style.less";
import RunPathTree from "./tree";
import type {
  ISelectTableProps,
  ISelectTableRef,
  Item,
  TreeItem,
} from "./type";

export const TableSelectProvider = CreateProvider;
export { useTableSelect } from "./context";
export type { ISelectTableProps, ISelectTableRef } from "./type";

// todo theme
const baseCls = getBaseCls("virtualization-modal-tree-select");

function ModalTreeSelect<T extends Item>(
  props: ISelectTableProps<T>,
  ref: any,
) {
  const {
    selectType = "radio",
    alertMessage,
    alertClosable = false,
    alertType = "info",
    className,
    style,
    onChange,
    onCheck,
    onOk: _onOk,
    value,
    treeData = [],
    checkItemDisabled,
  } = props;

  const selectTableContextValue = useMemo(
    () => ({
      // 设置列表 link 是否支持跳转
      linkJump: false,
    }),
    [],
  );

  const _onChange = (val: any[], e: any) => {
    if (onCheck) onChange?.(onCheck?.(val, e, value));
    else onChange?.(val);
  };

  const _treeData = useMemo(() => {
    if (!checkItemDisabled) return treeData;
    const transform: (val: TreeItem) => TreeItem = (item: TreeItem) => {
      const result = checkItemDisabled(item, value!);
      return {
        ...item,
        title: item.title,
        tooltip: isBoolean(result) ? undefined : result?.tooltip,
        disabled: isBoolean(result) ? result : result.disabled,
        children: item?.children?.map((child: TreeItem) => transform(child)),
      };
    };
    return treeData.map((item) => transform(item));
  }, [treeData, value, checkItemDisabled]);

  return (
    <div className={classNames(baseCls, className)} style={style}>
      <CreateProvider value={selectTableContextValue}>
        {alertMessage && (
          <Alert
            closable={alertClosable}
            type={alertType}
            message={alertMessage}
            display="strong"
            className={`${baseCls}-alert`}
          />
        )}
        <div className={`${baseCls}-virtualization-modal-body`}>
          <RunPathTree
            selectType={selectType}
            treeHeight={320}
            treeData={checkItemDisabled ? _treeData : treeData}
            onSelectNode={_onChange}
            selectedKeys={value?.map((it) => it.uuid) ?? []}
          />
        </div>
      </CreateProvider>
    </div>
  );
}

export default React.forwardRef<ISelectTableRef<any>, ISelectTableProps<any>>(
  ModalTreeSelect,
);
