import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";

export const length = (selectedList: IBackupStorage[]) => !!selectedList.length;

export const verifyAddImage = (current: IBackupStorage) => {
  const { status, state } = current;
  return status === "Connected" && state === "Enabled";
};

export const verifyStop = (selectedList: IBackupStorage[]) => {
  return (
    length(selectedList) &&
    selectedList.some((item) => {
      return item.state === "Enabled";
    })
  );
};

// 启用
export const verifyStart = (selectedList: IBackupStorage[]) => {
  return (
    length(selectedList) &&
    selectedList.some((item) => {
      return item.state === "Disabled";
    })
  );
};

export const verifyReconnect = (current: IBackupStorage) => {
  return !!current.uuid;
};

export const verifyDelete = (current: IBackupStorage) => {
  return !!current.uuid;
};

export const verifyUpdatePassword = (current: IBackupStorage) => {
  return ["ImageStoreBackupStorage", "SftpBackupStorage"].includes(
    current?.type || "",
  );
};

export const verifyClear = (current: IBackupStorage) => {
  return (
    (current.type === "ImageStoreBackupStorage" &&
      current.status !== "Disconnected") ||
    current.type === "Ceph"
  );
};

export const verifyBatchClear = (selectedList: IBackupStorage[]) => {
  return (
    (length(selectedList) &&
      selectedList.every((item) => {
        return (
          item.type === "ImageStoreBackupStorage" &&
          item.status !== "Disconnected"
        );
      })) ||
    (selectedList?.length === 1 && selectedList?.[0]?.type === "Ceph")
  );
};
