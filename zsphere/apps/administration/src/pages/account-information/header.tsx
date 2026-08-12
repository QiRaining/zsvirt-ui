import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const AccountHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      className="main-list-header-tabs"
      title={intl.formatMessage({
        id: "virtualization.user.management",
        defaultMessage: "User Management",
      })}
    />
  );
};

export default AccountHeader;
