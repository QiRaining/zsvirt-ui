import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

export default (props: any) => {
  const intl = useIntl();

  return (
    <Header.List
      title={intl.formatMessage({
        id: "virtualization.snmp.management.header.title",
        defaultMessage: "SNMP Management",
      })}
      className="main-list-header"
      {...props}
    />
  );
};
