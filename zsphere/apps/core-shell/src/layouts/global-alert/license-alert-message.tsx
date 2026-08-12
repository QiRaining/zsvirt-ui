import { Button } from "@zstack/design";
import React from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

export interface IProps {
  children?: React.ReactNode;
  type?: "info" | "error" | "warning";
  colorNumber?: number;
  updateButton?:
    | false
    | {
        onClick?: React.MouseEventHandler<HTMLAnchorElement>;
      };
}

const AlertMessage: React.FC<IProps> = ({ type, children, updateButton }) => {
  const intl = useIntl();

  return (
    <span style={{ display: "flex", alignItems: "center" }}>
      <span>{children}</span>
      {updateButton && (
        <Button
          className={
            type === "error"
              ? styles.alertBtnOnError
              : type === "warning"
                ? styles.alertBtnOnWarning
                : styles.alertBtnOnInfo
          }
          variant="secondary"
          onClick={updateButton.onClick}
          size="sm"
        >
          {intl.formatMessage({
            id: "go.update",
            defaultMessage: "Manage Your Licenses",
          })}
        </Button>
      )}
    </span>
  );
};

export default AlertMessage;
