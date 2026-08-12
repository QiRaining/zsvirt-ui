import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type {
  BackupData as IBackupData,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import React from "react";

import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

const backupDataList = gql`
  query backupDataList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $type: BackupResourceType
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    backupDataList(
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        uuid
        name
        size
        backupDataSize
        isIncludeDataVolume
        backupType
        metadataName
        remoteBackupStorage {
          name
          uuid
        }
        localBackupStorage {
          name
          uuid
        }
        canSyncToRemote
        isRemoteSynced
        isLocalSynced
        createDate
        owner {
          uuid
          name
          type
        }
        vmInstanceUuid
        vmInstance {
          name
          uuid
          state
          rootVolumeUuid
          zoneUuid
          backupTaskType
          platform
          guestOsType
          tpmList {
            uuid
            vmInstanceUuid
          }
        }
        volumeUuid
        dataVolumeUuids
        attachedVmName
        type
        backupStorageRefs {
          backupStorageUuid
          status
          createDate
        }
        groupUuid
        dataVolumeBackup {
          uuid
          backupDataSize
        }
        isLocalLatest
        isRemoteLatest
      }
      total
    }
  }
`;

interface IProps {
  source?: IVM;
  onClickName?: (value: IBackupData) => void;
}

const BackupDatalist: React.FC<IListProps<IBackupData> & IProps> = (props) => {
  const queryConfig = useQueryConfig({
    view: props.view,
    defaultQuery: props.defaultQuery,
  });
  const columnConfig = useColumnConfig(props?.source, props?.onClickName);
  const actionConfig = useActionConfig();

  const toolbar: ITableListProps<IBackupData>["toolbar"] = [
    "refresh",
    "operation",
    "search",
  ];

  if (["sub.local", "sub.remote"].includes(props?.view)) {
    toolbar.splice(1, 1);
  }

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      toolbar={toolbar}
      gql={backupDataList}
      rowKey="uuid"
      resource="zsv.backup.data"
      type="BackupData"
      {...props}
    />
  );
};

export default BackupDatalist;
