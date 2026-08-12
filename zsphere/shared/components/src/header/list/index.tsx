import { bus } from "@zstack/zsphere-utils";
import cls from "classnames";
import React from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../_utils/common";
import Auth from "../../a-cloud-old-components/auth";

import "./style.less";

export interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: React.ReactNode;
  more?: string;
  extra?: React.ReactNode;
  docReaderPath?: string;
  customDescription?: React.ReactNode;
}

const baseCls = getBaseCls("header-list");

const List: React.FC<IProps> = ({
  className,
  title,
  description,
  extra,
  docReaderPath,
  customDescription,
}) => {
  const EventType = "CHANGE_GLOBAL_DOC_READER_PATH";

  const intl = useIntl();

  const openDoc = () => {
    if (docReaderPath) {
      bus.emit(EventType, docReaderPath);
    }
  };

  return (
    <div className={cls(baseCls, className)}>
      <div>
        {title && (
          <div
            className={`${baseCls}-title`}
            title={typeof title === "string" ? title : undefined}
          >
            {title}
          </div>
        )}
        {description && (
          <div className={`${baseCls}-content`}>
            <span
              className={`${baseCls}-description`}
              title={typeof description === "string" ? description : undefined}
            >
              {description}
            </span>
            {docReaderPath && (
              <Auth resource="common" type="block" authKey="help.center">
                <span className={`${baseCls}-more`} onClick={() => openDoc()}>
                  {intl.formatMessage({
                    id: "understandMore",
                    defaultMessage: " Learn more.",
                  })}
                </span>
              </Auth>
            )}
          </div>
        )}
        {customDescription && (
          <div className={`${baseCls}-content`}>{customDescription}</div>
        )}
      </div>
      <div
        className={`${baseCls}-extra`}
        style={extra ? { marginLeft: 24 } : undefined}
      >
        {extra}
      </div>
    </div>
  );
};

export default List;
