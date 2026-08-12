import { getFreeHardDiskInfoList } from "@zstack/virtualization-resource/src/gql/backup-storage.gql";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { FreeHardDiskInfo } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useColumnConfig, useQueryConfig } from "../config";

const BackupStoragelist: React.FC<IListProps<any, FreeHardDiskInfo>> = (
  props,
) => {
  const queryConfig = useQueryConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      rowKey="name"
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      toolbar={["refresh", "search"]}
      gql={getFreeHardDiskInfoList}
      resource="free.hard.disk"
      type="FreeHardDisk"
      {...props}
    />
  );
};

export default BackupStoragelist;
