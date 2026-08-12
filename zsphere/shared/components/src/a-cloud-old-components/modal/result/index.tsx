import { Icon } from "@zstack/icon";
import { Modal, ModalFuncProps } from "antd";
import { ModalProps } from "antd/es/modal";
import classNames from "classnames";
import React from "react";

import { getBaseCls } from "../../../_utils/common";
import Base from "../base";
import BaseResult, { IBaseResultProps } from "./base";

import "./style.less";

export interface IResultProps extends ModalProps, IBaseResultProps {
  children?: React.ReactNode;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const baseCls = getBaseCls("modal-result");

const Result: React.FC<IResultProps> = ({
  resultType = "success",
  resultTitle,
  resultTip,
  resultMessage,
  className,
  style,
  children,
  ...props
}) => (
  <Base
    cancelButtonProps={{ hidden: true }}
    {...props}
    className={classNames(baseCls, className)}
  >
    <>
      <BaseResult
        resultType={resultType}
        resultTitle={resultTitle}
        resultTip={resultTip}
        resultMessage={resultMessage}
      />
      {children}
    </>
  </Base>
);

interface IRenderResultProps extends ModalFuncProps, IBaseResultProps {}

const renderBaseCls = getBaseCls("modal-render-result");

export function renderResult({
  resultType,
  resultTitle,
  resultTip,
  resultMessage,
  className,
  style,
  ...props
}: IRenderResultProps) {
  return Modal.success({
    okText: "确定",
    width: 600,
    icon: null,
    closable: true,
    className: classNames(renderBaseCls, className),
    style: {
      top: "30%",
      ...style,
    },
    ...props,
    closeIcon: <Icon type="close" />,
    content: (
      <BaseResult
        resultType={resultType}
        resultTitle={resultTitle}
        resultTip={resultTip}
        resultMessage={resultMessage}
      />
    ),
  });
}

export default Result;
