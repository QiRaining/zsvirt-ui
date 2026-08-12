import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const LogHeaderHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      title={intl.formatMessage({
        id: "virtualization.log.server",
        defaultMessage: "Log Server",
      })}
      className="main-list-header"
    />
  );
};

export default LogHeaderHeader;
