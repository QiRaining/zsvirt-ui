import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const ZwatchAlarmHeader: React.FC = () => {
  const intl = useIntl();
  return (
    <Header.List
      className="main-list-header-tabs"
      title={intl.formatMessage({
        id: "alarm.message",
        defaultMessage: "Alarm Message",
      })}
    />
  );
};

export default ZwatchAlarmHeader;
