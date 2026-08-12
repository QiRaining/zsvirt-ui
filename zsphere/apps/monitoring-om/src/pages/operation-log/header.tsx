import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const OperationLogHeader: React.FC = () => {
  const intl = useIntl();
  return (
    <Header.List
      className="main-list-header-tabs"
      title={intl.formatMessage({ id: "task", defaultMessage: "Task" })}
    />
  );
};

export default OperationLogHeader;
