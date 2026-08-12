import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const EndPointHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      className="main-list-header"
      title={intl.formatMessage({
        id: "zwatchEndpoint",
        defaultMessage: "Endpoint",
      })}
    />
  );
};

export default EndPointHeader;
