import {
  BackupDataIsLocalSynced,
  VmInstanceState,
} from "@zstack/zsphere-types";
import type {
  BackupData as IBackupData,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import { includes } from "lodash-es";

export const verifySingleSelect = (selectedList: IBackupData[]): boolean => {
  return selectedList.length === 1;
};

export const verifyCanSyncToRemote = (selectedList: IBackupData[]): boolean => {
  return selectedList.some((b) => !!b?.canSyncToRemote);
};

export const verifyCanSyncToLocal = (selectedList: IBackupData[]): boolean => {
  return selectedList.some(
    (b) => b?.isLocalSynced === BackupDataIsLocalSynced.No,
  );
};

//灾备服务配额限制
export const verifyDisasterRecoveryLicense = async () => {
  return true;
};

// 云主机挂载灾备任务
export const verifyAttachBackupJob = async (_current: any) => {
  if (_current.primaryStorage?.defaultProtocol === "Vhost") {
    return false;
  }
  return !_current?.backupTaskType;
};

// 云主机创建备份
export const verifyBackup = async (_current: any, source: any) => {
  /**
   * 云主机状态为：['Running', 'Paused', 'Stopped', 'Crashed]
   */

  const current = (source?.current || _current) as IVM;
  const validVmStates = ["Running", "Paused", "Stopped", "Crashed"];
  const attachedVmState = current?.state;

  return includes(validVmStates, attachedVmState);
};

// 备份数据恢复
export const verifyDestroyedVM = async (_current: any) => {
  const vmInstance = _current?.vmInstance as IVM;

  if (!vmInstance) {
    return false;
  }
  return vmInstance.state !== "Destroyed";
};

export const verifyCreateBackupJob = (current: IVM) => {
  if (current.primaryStorage?.defaultProtocol === "Vhost") {
    return false;
  }
  return (
    current.state === VmInstanceState.Running ||
    current.state === VmInstanceState.Paused
  );
};
