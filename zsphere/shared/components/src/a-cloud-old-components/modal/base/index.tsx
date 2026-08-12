import { Icon } from "@zstack/icon";
import { Divider, Modal } from "antd";
import { ModalProps } from "antd/es/modal";
import cls from "classnames";
import React, { useMemo } from "react";

import { getBaseCls } from "../../../_utils/common";
import Text from "../../text";

import "./style.less";

export interface IProps extends ModalProps {
  children: React.ReactNode;
  resourceName?: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const modalCls = getBaseCls("modal");
const baseCls = getBaseCls("modal-base");

const Base: React.FC<IProps> = ({
  className,
  style,
  title,
  children,
  onOk,
  visible,
  setVisible,
  resourceName,
  ...rest
}) => {
  const modalTitle = useMemo(
    () => (
      <div className="modal-title">
        <div className="action-title">{title}</div>
        {resourceName ? (
          <div className="resource-name">
            <Divider type="vertical" />
            <div className="text">
              <Text value={resourceName} tooltipPlacement="bottom" />
            </div>
          </div>
        ) : null}
      </div>
    ),
    [resourceName, title],
  );
  return (
    <Modal
      className={cls(modalCls, baseCls, className)}
      style={style}
      width={600}
      title={modalTitle}
      open={visible}
      onCancel={() => setVisible(false)}
      onOk={onOk}
      centered
      closeIcon={<Icon type="close" />}
      maskClosable={false}
      zIndex={1002}
      {...rest}
    >
      {children}
    </Modal>
  );
};

export default Base;
