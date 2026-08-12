import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const ZwatchAlarmHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      className="main-list-header-tabs"
      title={intl.formatMessage({
        id: "zwatchalarm",
        defaultMessage: "Alarm",
      })}
      docReaderPath="ZStack_User_Guide_0069_1.html"
    />
  );
};

export default ZwatchAlarmHeader;
