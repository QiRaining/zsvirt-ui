import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const LogHeaderHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      title={intl.formatMessage({
        id: "virtualization.email.server",
        defaultMessage: "Email Server",
      })}
      className="main-list-header-tabs"
    />
  );
};

export default LogHeaderHeader;
