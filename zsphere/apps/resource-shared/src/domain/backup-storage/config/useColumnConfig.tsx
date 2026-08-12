import { InfoPopover, Text } from "@zstack/design";
import {
  ResourceName,
  Constant,
  ResourceUsageProgress,
} from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/backup-storage";
import type { IOption } from "@zstack/zsphere-engine/src/backup-storage/useColumnConfig";
import { LeftNavType } from "@zstack/zsphere-types";
import {
  BackupStorageType,
  BackupStorageState as IBackupStorageState,
  BackupStorageStatus as IBackupStorageStatus,
} from "@zstack/zsphere-types";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

interface IProps {
  view?: string;
}

export default ({ view }: IProps) => {
  const intl = useIntl();

  const options: IOption<IBackupStorage> = useMemo(
    () => [
      {
        key: "name",
        linkResource: {
          microAppName: "virtualization-resource",
          path: "backup-storage",
        },
        render: (current: IBackupStorage) => (
          <ResourceName
            value={current?.name}
            link={{
              to: `/backup-storage`,
              microAppName: "virtualization-resource",
              uuid: current?.uuid,
              leftnav: LeftNavType.TemplateVm,
              navView: "resource",
            }}
          />
        ),
      },
      {
        key: "type",
        filters: [
          {
            text: intl.formatMessage({
              id: "virtualization.BackupStorage.ImageStore",
              defaultMessage: "Standalone Image Storage",
            }),
            value: BackupStorageType.ImageStoreBackupStorage,
          },
          {
            text: intl.formatMessage({
              id: "virtualization.BackupStorage.Ceph",
              defaultMessage: "Distributed Image Storage",
            }),
            value: BackupStorageType.Ceph,
          },
        ],
        filterEnumType: ConstantType.BackupStorageType,
        render: ({ type }) => (
          <Text>
            <Constant
              className={style.backupStorageType}
              enumType={ConstantType.BackupStorageType}
              value={type}
            />
          </Text>
        ),
        ...(view === "select" ? { filters: undefined } : null),
      },
      {
        key: "usedCapacity",
        minWidth: 120,
        title: (
          <div className="flex items-center gap-1">
            <span>
              {intl.formatMessage({
                id: "primaryStorage.usage",
                defaultMessage: "Storage Utilization",
              })}
            </span>
            <InfoPopover
              content={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "primaryStorage.usage.tooltip",
                    defaultMessage: `### Storage Utilization

Displays the storage capacity and usage in the image storage.

1. Storage Utilization = Used ÷ Total
2. Available = Total − Used − Reserved Capacity`,
                  })}
                </ReactMarkdown>
              }
            />
          </div>
        ),
        render: (row: IBackupStorage) => {
          const {
            totalCapacity = 0,
            availableCapacity = 0,
            reservedCapacity = 0,
            type,
            poolAvailableCapacity = 0,
            poolUsedCapacity = 0,
          } = row;

          // backupstorage类型只分两种，imageStore 和 cephStore，ceph需要取池的容量:
          const total =
            type === BackupStorageType.Ceph
              ? poolUsedCapacity + poolAvailableCapacity
              : totalCapacity;
          const available =
            type === BackupStorageType.Ceph
              ? poolAvailableCapacity
              : availableCapacity;

          return (
            <ResourceUsageProgress
              total={total}
              available={available}
              reserved={reservedCapacity}
              metric="imageStoreCapacityUtilization"
            />
          );
        },
      },
      {
        key: "url",
        title: intl.formatMessage({
          id: "mountPath",
          defaultMessage: "Mount Path",
        }),
      },
      {
        key: "state",
        filterOptions: IBackupStorageState,
      },
      {
        key: "status",
        filterOptions: IBackupStorageStatus,
      },
    ],
    [view, intl],
  );

  return useColumnConfig(options);
};
