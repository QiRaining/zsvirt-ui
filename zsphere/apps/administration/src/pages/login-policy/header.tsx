import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const ConsoleProxyHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      title={intl.formatMessage({
        id: "virtualization.login.policy.header.title",
        defaultMessage: "Security Settings",
      })}
      className="main-list-header"
    />
  );
};

export default ConsoleProxyHeader;
