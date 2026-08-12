import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import type { DocumentNode } from "graphql";
import React from "react";

import { useColumnConfig, useQueryConfig, useActionConfig } from "../config";

const BACKUP_STORAGE_LIST = gql`
  query backupStorageList(
    $conditions: [Condition!]
    $limit: Int
    $start: Int
    $extraConditions: [Condition!]
    $type: BackupStorageQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    backupStorageList(
      conditions: $conditions
      limit: $limit
      start: $start
      replyWithCount: true
      extraConditions: $extraConditions
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        state
        status
        availableCapacity
        totalCapacity
        createDate
        lastOpDate
        systemTag
        name
        description
        type
        hostname
        url
        sshPort
        username
        poolName
        dataNetwork
        syncImageNetwork
        reservedCapacity
        poolAvailableCapacity
        poolUsedCapacity
        poolReplicatedSize
        zone {
          name
          uuid
        }
        mons {
          hostname
          monPort
          createDate
          lastOpDate
          backupStorageUuid
          monAddr
          sshPort
          status
          sshUsername
          sshPassword
          monUuid
        }
      }
    }
  }
`;

export interface IBackupStoragePlainListProps extends Omit<
  ITableListProps<IBackupStorage>,
  "gql"
> {
  toolbar?: ITableListProps<IBackupStorage>["toolbar"];
  gql?: DocumentNode;
  source?: ITableListProps<IBackupStorage>["source"];
}

const BackupStoragePlainList: React.FC<IBackupStoragePlainListProps> = ({
  columnConfig,
  actionConfig,
  queryConfig,
  ...props
}) => {
  const defaultQueryConfig = useQueryConfig(props.defaultQuery);
  const defaultActionConfig =
    useActionConfig() as unknown as ITableListProps<IBackupStorage>["actionConfig"];
  const defaultColumnConfig = useColumnConfig({ view: props.view });

  return (
    <TableList
      columnConfig={columnConfig || defaultColumnConfig}
      actionConfig={actionConfig || defaultActionConfig}
      queryConfig={queryConfig || defaultQueryConfig}
      gql={props.gql || BACKUP_STORAGE_LIST}
      type="BackupStorage"
      resource="backup.storage"
      {...props}
    />
  );
};

export default BackupStoragePlainList;
