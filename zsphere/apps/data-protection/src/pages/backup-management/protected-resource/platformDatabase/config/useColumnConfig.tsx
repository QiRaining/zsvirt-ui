import { Button, Text } from "@zstack/design";
import { ResourceName } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/local-backup-data-db";
import {
  BackupDataIsRemoteSynced,
  BackupDataIsLocalSynced,
} from "@zstack/zsphere-types";
import type { BackupDatabase as IBackupDatabase } from "@zstack/zsphere-types/graphql";
import { formatBytesToSize } from "@zstack/zsphere-utils";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";

export default (source: any) => {
  const intl = useIntl();
  const location = useLocation();

  const synced = intl.formatMessage({
    id: "Synced",
    defaultMessage: "Synced",
  });

  const unSynced = intl.formatMessage({
    id: "unSynced",
    defaultMessage: "Not synced",
  });

  const goToabstract = () => {
    // 待修改
    // history.push({
    //   pathname: location.pathname,
    //   search: location.search,
    // });
  };

  const isDetail = location.pathname.endsWith("detail");

  return useColumnConfig<IBackupDatabase>([
    {
      key: "name",
    },
    {
      key: "managementNode.ip",
    },
    {
      key: "size",
      formatter: (value: IBackupDatabase) => formatBytesToSize(value?.size),
    },
    {
      key: "backstorage",
      render: (value: IBackupDatabase) => {
        const { localBackupStorage, remoteBackupStorage } = value;
        const { activeTab } = source;
        const backupStorage =
          activeTab === "LocalBackup"
            ? localBackupStorage
            : remoteBackupStorage;
        return isDetail ? (
          <Button onClick={() => goToabstract()} variant="link">
            {backupStorage?.name}
          </Button>
        ) : (
          <ResourceName
            value={backupStorage?.name}
            link={{
              microAppName: "virtualization-data-protection",
              to: "/backup-management/disaster-recovery-storage",
              uuid: backupStorage?.uuid,
            }}
          />
        );
      },
    },
    {
      key: "isRemoteSynced",
      filters: [
        {
          text: synced,
          value: "Yes",
        },
        {
          text: unSynced,
          value: "No",
        },
      ],
      render: (value: IBackupDatabase) => {
        return (
          <Text>
            {value?.isRemoteSynced === BackupDataIsRemoteSynced.Yes
              ? synced
              : unSynced}
          </Text>
        );
      },
    },
    {
      key: "isLocalSynced",
      filters: [
        {
          text: synced,
          value: "Yes",
        },
        {
          text: unSynced,
          value: "No",
        },
      ],
      render: (value: IBackupDatabase) => {
        return (
          <Text>
            {value?.isLocalSynced === BackupDataIsLocalSynced.Yes
              ? synced
              : unSynced}
          </Text>
        );
      },
    },
    {
      key: "backup.url",
      render: (_value: IBackupDatabase) => "/zsv_bs",
    },
  ]);
};
