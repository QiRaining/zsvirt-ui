import { Text } from "@zstack/design";
import { Tag, Link, ResourceName } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/zsv-backup-data";
import { BackupResourceFullBackupType } from "@zstack/zsphere-types";
import type {
  BackupData as IBackupData,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import { formatBytesToSize } from "@zstack/zsphere-utils";
import { sum } from "lodash-es";
import { useContext } from "react";
import { useIntl } from "react-intl";

import ProtectedResourceContext from "../context";

import style from "./style.module.less";

export default (_source?: IVM, onClickName?: (value: IBackupData) => void) => {
  const intl = useIntl();

  const { store } = useContext(ProtectedResourceContext);

  const getBackupType = {
    [BackupResourceFullBackupType.Full]: intl.formatMessage({
      id: "full.backup",
      defaultMessage: "Full Backup",
    }),
    [BackupResourceFullBackupType.Incremental]: intl.formatMessage({
      id: "incremental.backup",
      defaultMessage: "Incremental Backup",
    }),
  };

  return useColumnConfig<IBackupData>([
    {
      key: "name",
      render: (value: IBackupData) => {
        const node = onClickName ? (
          <Text>
            <a className={style.name} onClick={() => onClickName(value)}>
              {value?.name}
            </a>
          </Text>
        ) : (
          <ResourceName value={value?.name} />
        );
        const backupStorageType =
          (_source as any)?.backupStorageType || store?.backupStorageType;
        if (
          (backupStorageType === "remote" && value.isRemoteLatest) ||
          (backupStorageType !== "remote" && value.isLocalLatest)
        ) {
          return (
            <div className={style.nameWrapper}>
              {node}
              <Tag round level="weak" className={style.tag}>
                {intl.formatMessage({ id: "latest", defaultMessage: "Latest" })}
              </Tag>
            </div>
          );
        }
        return node;
      },
    },
    {
      key: "backupDataSize",
      sortKey: "size",
      formatter: (value: IBackupData) =>
        formatBytesToSize(
          (value?.backupDataSize ?? 0) +
            sum(
              value?.dataVolumeBackup?.map(
                (item) => item.backupDataSize ?? 0,
              ) ?? [],
            ),
        ),
    },
    {
      key: "backupType",
      filters: [
        {
          text: intl.formatMessage({
            id: "full.backup",
            defaultMessage: "Full Backup",
          }),
          value: BackupResourceFullBackupType.Full,
        },
        {
          text: intl.formatMessage({
            id: "incremental.backup",
            defaultMessage: "Incremental Backup",
          }),
          value: BackupResourceFullBackupType.Incremental,
        },
      ],
      render: (value: IBackupData) => {
        return <Text>{getBackupType[value.backupType!]}</Text>;
      },
    },
    {
      key: "backupStorage",
      title: intl.formatMessage({
        id: "zsv.backup.storage",
        defaultMessage: "Backup Storage",
      }),
      render: (value: IBackupData) => {
        const { localBackupStorage, remoteBackupStorage } = value;
        const { backupStorageType } = _source || store || {};
        const backupStorage =
          backupStorageType === "local"
            ? localBackupStorage
            : remoteBackupStorage;

        return (
          <ResourceName
            value={backupStorage?.name || ""}
            link={{
              to: "/backup-management/disaster-recovery-storage",
              uuid: backupStorage?.uuid || "",
              microAppName: "virtualization-data-protection",
              keepState: false,
            }}
          />
        );
      },
    },
    {
      key: "owner",
      render: (value: IBackupData) => {
        return (
          <Link.Owner uuid={value.owner?.uuid ?? 0} type={value.owner?.type}>
            {value.owner?.name}
          </Link.Owner>
        );
      },
    },
    {
      key: "backup.name",
      searchKey: "name",
      formatter: (value) => value?.name,
    },
    {
      key: "disk.name",
      formatter: (value) => value?.metadataName,
    },
    {
      key: "diskType",
      formatter: (value) =>
        value?.type &&
        (value.type === "Root"
          ? intl.formatMessage({
              id: "root.hard.disk",
              defaultMessage: "System Disk",
            })
          : intl.formatMessage({
              id: "data.hard.disk",
              defaultMessage: "Data Disk",
            })),
    },
    {
      key: "capacity",
      sortKey: "size",
      formatter: (value) => formatBytesToSize(value?.backupDataSize),
    },
    {
      key: "backup.complete.time",
      sortKey: "createDate",
      formatter: (value) => {
        const bsType =
          (_source as any)?.backupStorageType || store?.backupStorageType;
        const bs =
          bsType === "remote"
            ? value?.remoteBackupStorage
            : value?.localBackupStorage;
        const bsRef = value?.backupStorageRefs?.find(
          (item) => item.backupStorageUuid === bs?.uuid,
        );
        return bsRef?.createDate || value?.createDate;
      },
    },
  ]);
};
