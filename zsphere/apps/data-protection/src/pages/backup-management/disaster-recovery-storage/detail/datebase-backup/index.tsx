import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { ZSVBackupStorage as IZSVBackupStorage } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import DatabaseBackupList from "../../../protected-resource/platformDatabase/list";

interface IProps {
  current: IZSVBackupStorage;
}

const DatebaseBackup: React.FC<IProps> = ({ current }) => {
  const defaultDatabaseQuery: IQuery = useMemo(() => {
    const conditions: any = [
      {
        key: "_VolumeBackupStorageRefReadyStatus_",
        op: Op.eq,
        value: "__UnknownLocalBackupStorageUuid__",
      },
    ];

    if (current?.backupStorageType) {
      conditions.push({
        key: "backupStorage.__systemTag__",
        op: Op.in,
        values: ["remotebackup"].includes(current?.backupStorageType)
          ? ["remotebackup"]
          : ["onlybackup", "allowbackup"],
      });
    }

    if (current?.uuid) {
      conditions.push({
        key: "backupStorageRefs.backupStorageUuid",
        op: Op.in,
        values: [current.uuid],
      });
    }
    return { conditions };
  }, [current]);

  const getDatabaseBackupListView = (backupStorageType: string) => {
    switch (backupStorageType) {
      case "remotebackup":
        return "main.remote";

      case "allowbackup":
      case "onlybackup":
        return "main.local";

      //todo: add other backup storage type
      default:
        return "main";
    }
  };

  return (
    <DatabaseBackupList
      view={getDatabaseBackupListView(current?.backupStorageType)}
      defaultQuery={defaultDatabaseQuery}
      source={{
        activeTab:
          current?.backupStorageType === "remotebackup"
            ? "RemoteBackup"
            : "LocalBackup",
      }}
    />
  );
};

export default DatebaseBackup;
