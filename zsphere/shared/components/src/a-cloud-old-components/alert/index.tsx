import { Icon } from "@zstack/icon";
import { Color } from "@zstack/zsphere-utils";
import { Alert as AntAlert, Row as AntRow } from "antd";
import cls from "classnames";
import React, { useMemo } from "react";

import { getBaseCls } from "../../_utils/common";
import type { IAlertProps } from "./type";

import "./style.less";

const baseCls = getBaseCls("alert");

// todo theme
// let mode = 'light'

const Alert: React.FC<IAlertProps> = ({
  className,
  display = "standard",
  type = "error",
  message,
  closable,
  guideAction,
  extraAction,
  ...props
}) => {
  const colorProps = useMemo(() => {
    let color: Color.ISemantic | "neutral" = "neutral";
    let colorNumber: Color.INeutralNumber = 500;
    if (display === "overall") {
      color = "neutral";
      colorNumber = type === "warning" ? 700 : 0;
    } else {
      colorNumber = 500;
      switch (type) {
        case "error":
          color = "danger";
          break;
        case "info":
          color = "info";
          break;
        case "success":
          color = "positive";
          break;
        case "warning":
          color = "alert";
          break;
        default:
          color = "danger";
      }
    }
    return {
      color,
      colorNumber,
    };
  }, [display, type]);

  const customIcon = useMemo(() => {
    switch (type) {
      case "error":
        return <Icon {...colorProps} type="alert-triangle-fill" />;
      case "info":
        return <Icon {...colorProps} type="info-fill" />;
      case "success":
        return <Icon {...colorProps} type="checkmark-circle-fill" />;
      case "warning":
        return <Icon {...colorProps} type="alert-triangle-fill" />;
    }
  }, [colorProps, type]);

  const messageEl = useMemo(() => {
    const { text, onClick } = guideAction || {};
    if (text || extraAction) {
      return (
        <AntRow align="middle" justify="center">
          <div className={`${baseCls}-message-wrapper`}>
            {message}
            {text && (
              <div onClick={onClick} className={`${baseCls}-message`}>
                {text}
              </div>
            )}
          </div>
          {extraAction}
        </AntRow>
      );
    }
    return <>{message}</>;
  }, [guideAction, message]);

  return (
    <AntAlert
      className={cls(
        baseCls,
        `${display}-${type}`,
        className,
        closable && `${baseCls}-closable`,
      )}
      type={type}
      message={messageEl}
      showIcon
      icon={customIcon}
      closable={closable}
      closeText={closable && <Icon {...colorProps} type="close" />}
      {...props}
    />
  );
};

export default Alert;

export type { IAlertProps };
