import { Header } from "@zstack/zsphere-components";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const TimeServerHeader: FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      className={style.header}
      title={intl.formatMessage({
        id: "time.server",
        defaultMessage: "Time Configuration",
      })}
    />
  );
};

export default TimeServerHeader;
