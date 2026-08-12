import {
  ResourceName,
  ResourceUsageProgress,
} from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/zsv-backup-storage";
import {
  BackupStorageState,
  BackupStorageStatus,
  Op,
} from "@zstack/zsphere-types";
import type { ZSVBackupStorage as IZSVBackupStorage } from "@zstack/zsphere-types/graphql";
import { useContext } from "react";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";

import { ZoneContext } from "../context";

export const getBackupStorageType = (
  backupStorageType: string,
  intl: IntlShape,
) => {
  switch (backupStorageType) {
    case "remotebackup":
      return intl.formatMessage({
        id: "backupStorage.type.remoteBackup",
        defaultMessage: "Remote Backup Storage",
      });
    case "allowbackup":
    case "onlybackup":
      return intl.formatMessage({
        id: "backupStorage.type.localBackup",
        defaultMessage: "Local Backup Storage",
      });

    default:
      return "-";
  }
};

export default () => {
  const intl = useIntl();
  const { selectedZone } = useContext(ZoneContext);

  return useColumnConfig<IZSVBackupStorage>([
    {
      key: "name",
      render: (current) => {
        return (
          <ResourceName
            value={current?.name}
            link={{
              to: "/backup-management/disaster-recovery-storage",
              microAppName: "virtualization-data-protection",
              uuid: current?.uuid,
              zoneUuid: selectedZone?.uuid || "",
            }}
          />
        );
      },
    },
    { key: "state", filterOptions: BackupStorageState },
    { key: "status", filterOptions: BackupStorageStatus },
    {
      key: "image.server.capacity",
      render: (current) => {
        const available = current?.availableCapacity || 0;
        return (
          <ResourceUsageProgress
            total={current?.totalCapacity || 0}
            available={available < 0 ? 0 : available}
          />
        );
      },
    },
    {
      key: "type",
      filters: [
        {
          text: intl.formatMessage({
            id: "backupStorage.type.localBackup",
            defaultMessage: "Local Backup Storage",
          }),
          value: "allowbackup",
        },
        {
          text: intl.formatMessage({
            id: "backupStorage.type.remoteBackup",
            defaultMessage: "Remote Backup Storage",
          }),
          value: "remotebackup",
        },
      ],
      filterCondition: (values: string[] = []) => {
        const _values = values.includes("allowbackup")
          ? [...values, "onlybackup"]
          : values;
        return {
          key: "__systemTag__",
          op: Op.in,
          values: _values,
        };
      },
      formatter: (current) =>
        getBackupStorageType(current?.backupStorageType, intl),
    },
  ]);
};
