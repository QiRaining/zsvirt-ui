import { Icon } from "@zstack/icon";
import cls from "classnames";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

interface IProps {
  show?: boolean;
  text?: string | React.ReactNode;
  className?: string;
}

const Empty: React.FC<IProps> = ({ show = true, text, className }) => {
  const intl = useIntl();

  return show ? (
    <div className={cls(style.empty, className)}>
      <div className={style.circle}>
        <Icon type="inbox" className={style.circleIcon} />
      </div>
      <p>
        {text ||
          intl.formatMessage({
            id: "noData",
            defaultMessage: "No Data",
          })}
      </p>
    </div>
  ) : (
    <></>
  );
};

export default Empty;
