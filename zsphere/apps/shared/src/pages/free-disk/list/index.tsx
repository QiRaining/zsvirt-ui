import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { FreeHardDiskInfo } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useColumnConfig, useQueryConfig } from "../config";

const GET_FREE_HARD_DISK_INFO_LIST = gql`
  query getFreeHardDiskInfoList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    getFreeHardDiskInfoList(
      conditions: $conditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        name
        type
        logicalSector
        physicalSector
        partitionTable
        size
        withPartition
        multipathDeviceName
      }
    }
  }
`;

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
      gql={GET_FREE_HARD_DISK_INFO_LIST}
      resource="free.hard.disk"
      type="FreeHardDisk"
      {...props}
    />
  );
};

export default BackupStoragelist;
