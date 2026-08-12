import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const CollectLogHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      title={intl.formatMessage({
        id: "log.collect",
        defaultMessage: "Log Collection",
      })}
      className="main-list-header"
    />
  );
};

export default CollectLogHeader;
