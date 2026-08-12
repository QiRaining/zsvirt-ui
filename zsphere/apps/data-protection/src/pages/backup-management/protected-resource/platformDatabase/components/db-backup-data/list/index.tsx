import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { FreeHardDiskInfo } from "@zstack/zsphere-types/graphql";
import React from "react";

import { getDatabaseBackupFromImageStore } from "../../../../../../../gql/protected-resource.gql";
import { useColumnConfig, useQueryConfig } from "../config";

const DbBackupDatalist: React.FC<IListProps<any, FreeHardDiskInfo>> = (
  props,
) => {
  const queryConfig = useQueryConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      rowKey="uuid"
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      toolbar={["refresh", "search"]}
      gql={getDatabaseBackupFromImageStore}
      resource="database.backup.from.image.store"
      type="DatabaseBackupFromImageStore"
      {...props}
    />
  );
};

export default DbBackupDatalist;
