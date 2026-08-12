import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const ConsoleProxyHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      title={intl.formatMessage({
        id: "virtualization.console.proxy.header.title",
        defaultMessage: "Console Proxy",
      })}
      className="main-list-header"
    />
  );
};

export default ConsoleProxyHeader;
