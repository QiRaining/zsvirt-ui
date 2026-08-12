import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { BackupDatabase as IBackupDatabase } from "@zstack/zsphere-types/graphql";
import React from "react";

import { backupDatabaseList } from "../../../../../gql/protected-resource.gql";
import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

const DatabaseBackupList: React.FC<IListProps<IBackupDatabase>> = (props) => {
  const queryConfig = useQueryConfig();
  const actionConfig = useActionConfig(props?.view);
  const columnConfig = useColumnConfig(props.source);

  return (
    <TableList
      resource="platformDatabaseBackup"
      toolbar={["refresh", "operation", "search"]}
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={backupDatabaseList}
      fetchPolicy="no-cache"
      type="BackupDatabase"
      {...props}
    />
  );
};

export default DatabaseBackupList;
