import { Alert } from "@zstack/design";
import { Icon } from "@zstack/icon";
import cls from "classnames";
import React from "react";

import {
  filterDismissedAlerts,
  readDismissedAlertIds,
  writeDismissedAlertIds,
} from "./dismissed-alerts";

import style from "./style.module.less";

export type AlertType = "error" | "info" | "warning";

const typeToVariant = {
  error: "danger",
  info: "info",
  warning: "warning",
} as const;

export type Message = {
  id: string;
  message: React.ReactNode;
  type: AlertType;
  /** 是否支持关闭 */
  closable?: boolean;
};

export type PropsType = {
  messages: Message[];
};

const AlertSwitchable = ({ messages }: PropsType) => {
  const [dismissedAlertIds, setDismissedAlertIds] = React.useState(
    readDismissedAlertIds,
  );
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);
  const messageList = React.useMemo(
    () => filterDismissedAlerts(messages, dismissedAlertIds),
    [dismissedAlertIds, messages],
  );

  React.useEffect(() => {
    // 如果当前索引超出范围，重置为 0
    setCurrentMessageIndex((prevIndex) =>
      prevIndex >= messageList.length ? 0 : prevIndex,
    );
  }, [messageList.length]);

  const messageObj = messageList[currentMessageIndex];
  const total = messageList.length;

  const handleNextMessage = React.useCallback(() => {
    setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % total);
  }, [total]);

  const handlePrevMessage = React.useCallback(() => {
    setCurrentMessageIndex((prevIndex) => (prevIndex - 1 + total) % total);
  }, [total]);

  const handleClose = React.useCallback(() => {
    if (!messageObj) {
      return;
    }

    setDismissedAlertIds((previousIds) => {
      const nextIds = new Set(previousIds);
      nextIds.add(messageObj.id);
      writeDismissedAlertIds(nextIds);
      return nextIds;
    });

    setCurrentMessageIndex((previousIndex) => {
      if (messageList.length <= 1) {
        return 0;
      }
      return Math.min(previousIndex, messageList.length - 2);
    });
  }, [messageList.length, messageObj]);

  const getAlertThemeCls = React.useCallback((type: AlertType) => {
    switch (type) {
      case "error":
        return style.globalAlertError;
      case "info":
        return style.globalAlertInfo;
      case "warning":
        return style.globalAlertWarning;
      default:
        return "";
    }
  }, []);

  if (total === 0 || !messageObj) {
    return null;
  }

  return (
    <Alert
      variant={typeToVariant[messageObj.type]}
      className={cls(getAlertThemeCls(messageObj.type))}
    >
      {messageObj.message}
      {(messageObj.closable || total > 1) && (
        <div className={style.rightActions}>
          {messageObj.closable && (
            <Icon
              className={style.closeBtn}
              type="close"
              onClick={handleClose}
            />
          )}
          {total > 1 && (
            <div className={`flex items-center ${cls(style.alertSwitch)}`}>
              <Icon
                type="arrow-ios-left"
                className={cls(style.prevBtn)}
                onClick={handlePrevMessage}
              />
              <span>
                {currentMessageIndex + 1} / {messageList.length}
              </span>
              <Icon
                type="arrow-ios-right"
                className={cls(style.nextBtn)}
                onClick={handleNextMessage}
              />
            </div>
          )}
        </div>
      )}
    </Alert>
  );
};

export default AlertSwitchable;
