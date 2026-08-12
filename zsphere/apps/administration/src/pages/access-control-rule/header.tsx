import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const IPHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      title={intl.formatMessage({
        id: "virtualization.accessControlRule.header.title",
        defaultMessage: "IP Allowlist/Blocklist",
      })}
      className="main-list-header"
    />
  );
};

export default IPHeader;
