import { PrimaryStorageType } from "@zstack/zsphere-types";

export const useInitialValues = (storageInfo: any) => {
  return {
    psAddMode: storageInfo?.monList?.length > 0 ? "auto" : "manual",
    name: "PS-1",
    description: "",
    zoneUuid: "",
    type: PrimaryStorageType.LocalStorage,
    forceWipe: false,
    poolName: storageInfo?.poolName || undefined,
    url: "/vms_ds",
    diskUuidList: [],
    mons: [],
    monUrls: [],
    systemTags: [],
    monitorSshPort: "22",
    monitorUsername: "root",
  };
};
