import { ImageMediaType, ImageStatus } from "@zstack/zsphere-types";
import type {
  Image as IImage,
  BackupStorageRef as IBackupStorageRef,
  BackupStorage as IBackupStorage,
} from "@zstack/zsphere-types/graphql";
import { map as _map, every as _every } from "lodash-es";

// 删除
export const verifyCreateVm = (current: IImage) => {
  return current?.mediaType !== ImageMediaType.DataVolumeTemplate;
};

export const verifyDelete = (current: IImage) => {
  return ![ImageStatus.Downloading].includes(current?.status);
};

export const verifyExport = (current: IImage): boolean => {
  const backupStorageRef: IBackupStorageRef[] =
    current?.backupStorageRefs as IBackupStorageRef[];
  const imageStatus: ImageStatus = current.status;
  const exportUrl: string = backupStorageRef?.[0]?.exportUrl || "";
  const backupStorage: IBackupStorage =
    current?.backupStorage as IBackupStorage;
  const backupStorageType: string = backupStorage?.type || "";
  return (
    ["Ceph", "ImageStoreBackupStorage"].includes(backupStorageType) &&
    !exportUrl &&
    imageStatus === ImageStatus.Ready
  );
};

export const verifySingleSelect = (selectedList: IImage[]): boolean => {
  return selectedList.length === 1;
};

// 存储迁移 涉及到isAdmin, canMigrate，参考 src/windows/Image/Methods.vue 和 windows/Image/Detail.vue的query函数
export const verifyStorageMigrate = (current: IImage): boolean => {
  return current?.backupStorage?.type === "Ceph";
};

// 同步镜像： 可以多选，但是所选镜像的镜像服务器必须全都为 ImageStoreBackupStorage，否则置灰。
export const verifySyncImage = (selectedList: IImage[]): boolean => {
  if (!selectedList?.length) {
    return false;
  }
  const backupStorageList = _map(selectedList, "backupStorage");
  return _every(backupStorageList, ["type", "ImageStoreBackupStorage"]);
};

// 验证是否为Zmigrate镜像 - 如果是Zmigrate镜像则不允许操作
export const verifyZmigrateImage = (current: IImage): boolean => {
  return !current?.isZmigrateImage;
};
