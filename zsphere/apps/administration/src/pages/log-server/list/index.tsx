import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { LogServer as ILogServer } from "@zstack/zsphere-types/graphql";
import React from "react";

import { logServerList } from "../../../gql/log-server.gql";
import { useActionConfig, useColumnConfig } from "../config";

const LogServerList: React.FC<IListProps<ILogServer>> = (props) => {
  const columnConfig = useColumnConfig();
  const actionConfig = useActionConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      gql={logServerList}
      rowKey="uuid"
      resource="log.server"
      type="LogServer"
      {...props}
    />
  );
};

export default LogServerList;
