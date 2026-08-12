import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const MNMonitoringHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      title={intl.formatMessage({
        id: "virtualization.mn.monitoring.header.title",
        defaultMessage: "MN Monitoring",
      })}
      className={style.header}
    />
  );
};

export default MNMonitoringHeader;
