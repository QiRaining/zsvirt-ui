import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const RoleHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      title={intl.formatMessage({
        id: "virtualization.role.header.title",
        defaultMessage: "Role",
      })}
      className="main-list-header"
    />
  );
};

export default RoleHeader;
