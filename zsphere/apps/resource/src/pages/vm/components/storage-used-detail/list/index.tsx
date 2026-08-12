import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import React from "react";

import useColumnConfig from "../config/useColumnConfig";

const queryCapacityManagementListVMDiskInfo = gql`
  query queryCapacityManagementListVMDiskInfo(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    queryCapacityManagementListVMDiskInfo(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        key
        diskDeviceLetter
        mountPoint
        fSType
        free
        used
        total
        percent
      }
    }
  }
`;

export default function HotAdd(props: Partial<ITableListProps<any>>) {
  const columnConfig = useColumnConfig();

  return (
    <TableList
      {...props}
      view="virtualization.main"
      gql={queryCapacityManagementListVMDiskInfo}
      columnConfig={columnConfig}
      type="StorageUsedDetail"
      resource="StorageUsedDetail"
      toolbar={["refresh"]}
      rowSelection={false}
    />
  );
}
