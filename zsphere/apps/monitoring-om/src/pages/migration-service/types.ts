export type StepType = "upload" | "install";

export type TaskStatus =
  | "upload-ready"
  | "uploading"
  | "upload-failed"
  | "install-ready"
  | "installing"
  | "install-failed"
  | "completed";

export interface MigrationPackageData {
  uuid?: string;
  name?: string;
  status?: string;
  type?: string;
  installPath?: string;
  version?: string;
  gatewayImageUuid?: string;
  linuxBootImageUuid?: string;
  windowsBootImageUuid?: string;
  platformCount?: number;
  gatewayCount?: number;
  taskCount?: number;
  startTime?: string;
  upgradeTasks?: Array<{
    uuid: string;
    version: string;
    status: "running" | "success" | "failed";
  }>;
  hasRunningTask?: boolean;
}

export interface MigrationServiceInfo {
  uuid: string;
  status: "Running" | "Stopped" | "Unknown" | string;
  version: string;
  platformCount: number;
  gatewayCount: number;
  taskCount: number;
  startTime: string;
  vddkUploaded?: boolean;
  firstGatewayVm?: FirstGatewayVmInfo;
}

export interface FirstGatewayVmInfo {
  uuid?: string;
  name?: string;
  state?: string;
  cpuNum?: number;
  memorySize?: number;
  storageSize?: number;
  defaultIp?: string;
  createDate?: string;
  type?: string;
  hypervisorType?: string;
  platform?: string;
  hostUuid?: string;
}

export interface UpgradeTask {
  uuid: string;
  version: string;
  status: "running" | "success" | "failed";
}

export type ConfirmModalType = "ReuploadConfirmation" | null;
