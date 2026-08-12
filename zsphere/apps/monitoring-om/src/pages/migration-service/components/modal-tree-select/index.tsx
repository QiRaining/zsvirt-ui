import { useOverlay } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Spin, Alert, Text } from "@zstack/zsphere-components";
import { useControllableValue } from "ahooks";
import { Button, Modal } from "antd";
import classNames from "classnames";
import React, { useImperativeHandle } from "react";
import { useIntl } from "react-intl";

import { CreateProvider } from "./context";
import { useSelectedList } from "./hooks";

import "./style.module.less";
import RunPathTree from "./tree";
import type { ISelectTableProps, ISelectTableRef, Item } from "./type";

export const TableSelectProvider = CreateProvider;
export { useTableSelect } from "./context";
export type { ISelectTableProps, ISelectTableRef } from "./type";

// todo theme
const baseCls = "zstack-virtualization-modal-tree-select";

function ModalTreeSelect<T extends Item>(
  props: ISelectTableProps<T>,
  ref: any,
) {
  const {
    title,
    modalTitle,
    modalZIndex,
    modalWidth = 800,
    id,
    showSelect = true,
    selectType = "radio",
    destroyOnClose = true,
    renderFooter,
    alertMessage,
    alertClosable = false,
    alertType = "info",
    className,
    style,
    onChange,
    disabledItem = false,
    onOk: _onOk,
    value,
    treeData = [],
    transformKey = "name",
    loading,
  } = props;

  const intl = useIntl();

  const [visible, setVisible] = useControllableValue(props, {
    defaultValue: false,
    valuePropName: "visible",
    trigger: "setVisible",
  });

  // 自动叠在当前 overlay 栈最上面：本身嵌在 DialogForm（@zstack/design Dialog，
  // 默认 z-index ≈ 1100）里被打开，写死 1010 就会被父弹窗盖住，看不见。
  const { zIndex: autoZIndex } = useOverlay({
    type: "dialog",
    open: visible,
    customZIndex: modalZIndex,
  });
  const finalZIndex = modalZIndex ?? autoZIndex;

  const {
    selectedList,
    setSelectedList,
    setSelectedListByOk,
    setSelectedListByCancel,
  } = useSelectedList({ ...props, selectType, visible });

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
    if (!disabledItem && !loading) {
      setVisible(true);
    }
  };

  const onOk = () => {
    setVisible(false);
    const newSelectedList = setSelectedListByOk();
    onChange?.(newSelectedList);
    _onOk?.(newSelectedList);
    return newSelectedList;
  };

  const footerEle = (
    <div
      className={`${baseCls}-footer-actions`}
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "8px",
        width: "100%",
      }}
    >
      <Button type="text" onClick={onCancel}>
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>
      <Button onClick={onOk} type="primary" disabled={!selectedList.length}>
        {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
      </Button>
    </div>
  );

  const footer = renderFooter
    ? renderFooter({ node: footerEle, onOk, onCancel, selectedList })
    : footerEle;

  const removeSelect = (e: any) => {
    e.stopPropagation();
    setSelectedList([]);
    onChange?.([]);
  };

  return (
    <div className={classNames(baseCls, className)} style={style} id={id}>
      {showSelect && selectType === "radio" && (
        <div
          onClick={onSelectModalShow}
          className={classNames(`${baseCls}-select-input`, {
            [`${baseCls}-select-disabled-input`]: disabledItem || loading,
          })}
          style={{ width: 320 }}
        >
          {loading ? (
            <Spin className={classNames(`${baseCls}-select-input-spin`)} />
          ) : (
            <>
              <div className={classNames(`${baseCls}-select-input-value`)}>
                <div
                  className={classNames(`${baseCls}-select-input-value-title`)}
                >
                  <Text value={value?.[0]?.[transformKey] ?? ""} ellipsis />
                </div>
                {value?.[0]?.[transformKey] && !disabledItem && (
                  <Icon
                    onClick={removeSelect}
                    type="close-circle-fill"
                    color="neutral"
                    colorNumber={400}
                    className={`${baseCls}-select-input-value-close-icon`}
                  />
                )}
              </div>
              <Button
                style={{
                  width: 40,
                  height: 30,
                  padding: "4px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon type="select" color="neutral" colorNumber={700} />
              </Button>
            </>
          )}
        </div>
      )}

      <Modal
        title={modalTitle ?? title}
        width={modalWidth}
        closeIcon={<Icon type="close" />}
        getContainer="body"
        open={visible}
        destroyOnClose={destroyOnClose}
        className={`${baseCls}-modal`}
        zIndex={finalZIndex}
        centered
        onCancel={onCancel}
        footer={footer}
      >
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
            treeHeight={320}
            treeData={treeData}
            onSelectNode={setSelectedList}
            selectedKeys={[selectedList?.[0]?.uuid]}
          />
        </div>
      </Modal>
    </div>
  );
}

export default React.forwardRef<ISelectTableRef<any>, ISelectTableProps<any>>(
  ModalTreeSelect,
);
