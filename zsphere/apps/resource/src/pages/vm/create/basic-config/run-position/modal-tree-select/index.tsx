import { Button, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Spin, Alert } from "@zstack/zsphere-components";
import { DialogBase, DialogWeak } from "@zstack/zsphere-design-biz";
import { useControllableValue } from "ahooks";
import classNames from "classnames";
import React, { useImperativeHandle, useState } from "react";
import { useIntl } from "react-intl";

import { CreateProvider } from "./context";
import { useSelectedList } from "./hooks";

import "./style.module.less";
import RunPathTree from "./tree";
import type { ISelectTableProps, ISelectTableRef, Item } from "./type";

// Static style constants
const STYLE_WIDTH_400 = { width: 400 } as const;
const STYLE_BUTTON_SELECT = {
  width: 40,
  height: 30,
  padding: "4px 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

export const TableSelectProvider = CreateProvider;
export { useTableSelect } from "./context";
export type { ISelectTableProps, ISelectTableRef } from "./type";

// todo theme
const baseCls = "zstack-virtualization-modal-tree-select";

function ModalTreeSelect<T extends Item>(
  props: ISelectTableProps<T> & { width?: number },
  ref: any,
) {
  const {
    title,
    modalTitle,
    modalWidth = 800,
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
    width = 400,
  } = props;

  const intl = useIntl();

  const [visible, setVisible] = useControllableValue(props, {
    defaultValue: false,
    valuePropName: "visible",
    trigger: "setVisible",
  });

  const [infoModalVisible, setInfoModalVisible] = useState<boolean>(false);

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
  const onConfirmOk = () => {
    setInfoModalVisible(false);
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
    const originClusterUuid =
      value?.[0]?.__typename === "Cluster"
        ? value?.[0]?.uuid
        : value?.[0]?.cluster?.uuid;
    const newClusterUuid =
      newSelectedList?.[0]?.__typename === "Cluster"
        ? newSelectedList?.[0]?.uuid
        : newSelectedList?.[0]?.cluster?.uuid;

    const sameClusterFlag = originClusterUuid === newClusterUuid;

    if (sameClusterFlag) {
      setVisible(false);
      onChange?.(newSelectedList);
      _onOk?.(newSelectedList);
    } else {
      setInfoModalVisible(true);
    }
  };

  const footerEle = (
    <>
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
    </>
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
          style={STYLE_WIDTH_400}
        >
          {loading ? (
            <Spin className={classNames(`${baseCls}-select-input-spin`)} />
          ) : (
            <>
              <div className={classNames(`${baseCls}-select-input-value`)}>
                <div
                  className={classNames(`${baseCls}-select-input-value-title`)}
                >
                  <Text>
                    {value?.[0]?.[transformKey] ??
                      intl.formatMessage({
                        id: "auto.dispatch",
                        defaultMessage: "Auto Allocated",
                      })}
                  </Text>
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
                style={STYLE_BUTTON_SELECT}
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
      </DialogBase>
      <DialogWeak
        title={String(
          intl.formatMessage({
            id: "confirm.change.runpath",
            defaultMessage: "Change Location?",
          }),
        )}
        type="warning"
        visible={infoModalVisible}
        setVisible={setInfoModalVisible}
        onConfirm={() => onConfirmOk()}
        footer={
          <>
            <Button variant="link" onClick={() => setInfoModalVisible(false)}>
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button
              key="submit"
              variant="primary"
              onClick={() => onConfirmOk()}
            >
              {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
            </Button>
          </>
        }
        description={
          <div>
            {intl.formatMessage({
              id: "confirm.change.runpath.content",
              defaultMessage:
                "After changing the VM's location, you need to reconfigure the disk and NIC info. Proceed with caution.",
            })}
          </div>
        }
      />
    </div>
  );
}

export default React.forwardRef<ISelectTableRef<any>, ISelectTableProps<any>>(
  ModalTreeSelect,
);
