import { BackupStorageType } from "@zstack/zsphere-types";

const getInitialValues = (source: any) => {
  const { zone, createWay } = source;
  return {
    name: "",
    description: "",
    hostname: "",
    type:
      createWay === BackupStorageType.ImageStoreBackupStorage
        ? BackupStorageType.ImageStoreBackupStorage
        : BackupStorageType.Ceph,
    url: "",
    importImages: false,
    sshPort: 22,
    username: "root",
    password: "",
    poolName: undefined,
    mons: [],
    monUrls: [],
    dataNetwork: "",
    syncImageNetwork: "",
    systemTags: [],
    reservedCapacity: { number: 1, unit: "GB" },
    blobUploadConcurrency: "1",
    blobDownloadConcurrency: "1",
    zoneUuid: zone?.uuid || "",
    addWay: "FreeDisk",
  };
};

export { getInitialValues };
