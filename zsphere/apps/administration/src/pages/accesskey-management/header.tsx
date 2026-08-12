import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const AccesskeyManagementHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      title={intl.formatMessage({
        id: "virtualization.accesskey.management.header.title",
        defaultMessage: "AccessKey Management",
      })}
      className="main-list-header"
    />
  );
};

export default AccesskeyManagementHeader;
