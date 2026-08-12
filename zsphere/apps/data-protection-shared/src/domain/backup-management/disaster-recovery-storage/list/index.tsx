import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { ZSVBackupStorage } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useColumnConfig, useQueryConfig } from "../config";

export const ZSVBackupStorageList = gql`
  query ZSVBackupStorageList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $type: ZSVBackupStorageQueryType
  ) {
    ZSVBackupStorageList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
      type: $type
      replyWithCount: true
    ) {
      list {
        uuid
        name
        state
        status
        type
        url
        description
        hostname
        username
        sshPort
        totalCapacity
        availableCapacity
        attachedZoneUuids
        attachedZoneRefUuids
        createDate
        lastOpDate
        backupJobCount
        backupStorageType
      }
      total
    }
  }
`;

interface IProps {
  selectedZone?: unknown;
}

const BackupStorageList: React.FC<IListProps<ZSVBackupStorage> & IProps> = (
  props,
) => {
  const queryConfig = useQueryConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      toolbar={["refresh", "operation", "search"]}
      gql={ZSVBackupStorageList}
      rowKey="uuid"
      resource="zsv.backup.storage"
      type="ZSVBackupStorage"
      {...props}
    />
  );
};

export default BackupStorageList;
