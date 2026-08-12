import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

export default function DetailHeader() {
  const intl = useIntl();

  return (
    <Header.List
      title={intl.formatMessage({
        id: "virtualization.resource.attribute",
        defaultMessage: "Custom Attribute",
      })}
      className="main-list-header"
    />
  );
}
