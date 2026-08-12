import { BackupStorageType } from "@zstack/zsphere-types";

export const renderType = (type: BackupStorageType, intl: any) => {
  switch (type) {
    case BackupStorageType.ImageStoreBackupStorage:
      return intl.formatMessage({
        id: "backupStorage.type.imageStore",
        defaultMessage: "Standalone Image Storage",
      });
    case BackupStorageType.Ceph:
      return intl.formatMessage({
        id: "backupStorage.type.ceph",
        defaultMessage: "Distributed Image Storage",
      });
    default:
      return type;
  }
};
