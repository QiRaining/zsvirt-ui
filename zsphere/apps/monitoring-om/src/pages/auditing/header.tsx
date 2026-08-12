import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const AudtingHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      className="main-list-header"
      title={intl.formatMessage({ id: "event", defaultMessage: "Event" })}
    />
  );
};

export default AudtingHeader;
