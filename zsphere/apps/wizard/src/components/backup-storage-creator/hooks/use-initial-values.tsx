import { BackupStorageType } from "@zstack/zsphere-types";

export const useInitialValues = (storageInfo: any) => {
  return {
    bsAddMode: storageInfo?.monList?.length > 0 ? "auto" : "manual",
    zoneUuid: "",
    name: "BS-1",
    description: "",
    type: BackupStorageType.ImageStoreBackupStorage,
    hostname: "",
    url: "/vms_is",
    importImages: false,
    sshPort: 22,
    username: "root",
    password: "",
    poolName: storageInfo?.poolName || undefined,
    mons: [],
    monUrls: [],
    dataNetwork: "",
    syncImageNetwork: "",
    systemTags: [],
    reservedCapacity: { number: 1, unit: "GB" },
    blobUploadConcurrency: "1",
    blobDownloadConcurrency: "1",
    monitorSshPort: "22",
    monitorUsername: "root",
    addWay: "FreeDisk",
  };
};
