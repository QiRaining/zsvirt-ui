import { Button } from "antd";
import React, { FC } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../_utils/common";

import "./style.less";
import errorImage from "../assets/error.webp";

const baseCls = getBaseCls("404");

interface IProps {
  type: "main" | "app";
}

const NotFound: FC<IProps> = ({ type }: IProps) => {
  const intl = useIntl() as any;

  return (
    <div className={`${baseCls}`}>
      <div className={`${baseCls}-box`}>
        <img src={errorImage} alt="404" />
        <div className={`${baseCls}-box-number`}>404</div>
        <div className={`${baseCls}-box-second-alert`}>
          {intl.formatMessage({
            id: "exception.page.404.alert",
            defaultMessage: "Page not found.",
          })}
        </div>
        {window.history.length > 2 && (
          <div className={`${baseCls}-box-btn`}>
            <Button type="primary" onClick={() => window.history.back()}>
              {intl.formatMessage({
                id: "backup.prevPage",
                defaultMessage: "Go Back",
              })}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;
