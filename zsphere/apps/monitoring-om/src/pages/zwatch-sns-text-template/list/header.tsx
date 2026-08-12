import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const AccountHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      className="main-list-header"
      title={intl.formatMessage({
        id: "messageTemplate",
        defaultMessage: "Message Template",
      })}
    />
  );
};

export default AccountHeader;
