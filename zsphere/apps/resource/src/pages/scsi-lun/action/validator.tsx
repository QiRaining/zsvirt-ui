import { VmInstanceState } from "@zstack/zsphere-types";
import type {
  ScsiLun as IScsiLun,
  VmInstance,
} from "@zstack/zsphere-types/graphql";

export const vmNotInCdpTask = (selectedList: IScsiLun[], vm: VmInstance) =>
  vm?.state !== VmInstanceState?.VolumeRecovering;

// 单选
export const verifySingleSelect = (selectedList: IScsiLun[]): boolean => {
  return selectedList.length === 1;
};

// 没选
export const verifyNotSelect = (selectedList: IScsiLun[]): boolean => {
  return selectedList?.length <= 0;
};

// 多选
export const verifyMutilSelect = (selectedList: IScsiLun[]): boolean => {
  return selectedList?.length >= 1;
};
