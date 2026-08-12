import type { IconTypes } from "@zstack/icon";

export type IDeployState = "init" | "running" | "success" | "fail";

export type IStepType =
  | "Zone"
  | "Cluster"
  | "HostVO"
  | "BackupStorage"
  | "PrimaryStorageVO"
  | "InstanceOffering"
  | "DiskOffering"
  | "Image"
  | "L2Network"
  | "L3Network";

export type IStepState = "waiting" | "running" | "finish";

export interface IDeployStep {
  type: IStepType;
  state: IStepState;
  total: number;
  success: number;
  fail: number;
  inventory?: any;
  startTime?: string;
  endTime?: string;
  actionId?: string;
  duration?: number;
}

export type IDeploySteps = IDeployStep[];

export interface IDeployTableData {
  type: IStepType;
  name: string;
  icon: IconTypes;
  state: IStepState;
  total: number;
  success?: number;
  fail?: number;
}
