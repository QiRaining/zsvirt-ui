import { Alert, Button, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Spin } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useControllableValue } from "ahooks";
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
export { ISelectTableProps, ISelectTableRef } from "./type";

// todo theme
const baseCls = "zstack-virtualization-modal-tree-select";

const STYLE_SELECT_INPUT = { width: 320 } as const;
const STYLE_SELECT_BUTTON = {
  width: 40,
  height: 30,
  padding: "4px 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

function ModalTreeSelect<T extends Item>(
  props: ISelectTableProps<T>,
  ref: any,
) {
  const {
    title,
    modalTitle,
    modalWidth = 600,
    id,
    showSelect = true,
    selectType = "radio",
    destroyOnClose: _destroyOnClose = true,
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

  const onFooterOk = () => {
    // 判断’运行位置‘修改前后，集群信息是否一致
    // 如果不一致，弹框；
    // 一致直接走后续逻辑；
    const newSelectedList = selectedList;
    setVisible(false);
    onChange?.(newSelectedList);
    _onOk?.(newSelectedList);
  };

  const footerEle = (
    <div className={`${baseCls}-footer-actions`}>
      <Button variant="link" onClick={onCancel}>
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>
      <Button
        onClick={onFooterOk}
        variant="primary"
        disabled={!selectedList.length}
      >
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
          role="none"
          className={classNames(`${baseCls}-select-input`, {
            [`${baseCls}-select-disabled-input`]: disabledItem || loading,
          })}
          style={STYLE_SELECT_INPUT}
        >
          {loading ? (
            <Spin className={classNames(`${baseCls}-select-input-spin`)} />
          ) : (
            <>
              <div className={classNames(`${baseCls}-select-input-value`)}>
                <div
                  className={classNames(`${baseCls}-select-input-value-title`)}
                >
                  <Text
                    value={
                      value?.[0]?.[transformKey] ??
                      intl.formatMessage({
                        id: "auto.dispatch",
                        defaultMessage: "Auto Allocated",
                      })
                    }
                    ellipsis
                  />
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
                variant="ghost"
                style={STYLE_SELECT_BUTTON}
                icon={<Icon type="select" color="neutral" colorNumber={700} />}
              />
            </>
          )}
        </div>
      )}

      <DialogBase
        title={modalTitle ?? title}
        visible={visible}
        setVisible={(v) => {
          if (!v) {
            onCancel();
          }
        }}
        widthClassName={`w-${modalWidth / 4}`}
        footer={footer}
      >
        {alertMessage && (
          <Alert
            closable={alertClosable}
            variant={alertType}
            className={`${baseCls}-alert`}
          >
            {alertMessage}
          </Alert>
        )}
        <div className={`${baseCls}-virtualization-modal-body`}>
          <RunPathTree
            treeHeight={320}
            treeData={treeData}
            onSelectNode={setSelectedList}
            selectedKeys={[selectedList?.[0]?.uuid]}
          />
        </div>
      </DialogBase>
    </div>
  );
}

export default React.forwardRef<ISelectTableRef<any>, ISelectTableProps<any>>(
  ModalTreeSelect,
);
