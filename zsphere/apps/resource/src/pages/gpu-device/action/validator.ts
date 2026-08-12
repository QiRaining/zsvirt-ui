import { PciDeviceVirtStatus, VmInstanceState } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  PciDevice as IPciDevice,
} from "@zstack/zsphere-types/graphql";

const vmNotInCdpTask = (vm: IVM) =>
  vm?.state !== VmInstanceState?.VolumeRecovering;

// 单选
export const verifySingleSelect = (selectedList: IPciDevice[]): boolean => {
  return selectedList.length === 1;
};

// 启动
export const verifyEnabled = async (current: IPciDevice) => {
  return current.state !== "Enabled";
};

// 停止
export const verifyDisabled = async (current: IPciDevice) => {
  return current.state !== "Disabled";
};

// 全局共享
export const verifyShareToPublic = async (current: IPciDevice) => {
  return !current.toPublic;
};

// 全局召回
export const verifyRevokeFromPublic = async (current: IPciDevice) => {
  return !!current.toPublic;
};

// 切割
export const verifyGenerateSriov = async (current: IPciDevice) => {
  if (current?.status === "Attached") {
    return false;
  }
  return (
    (current.virtStatus === PciDeviceVirtStatus.SRIOV_VIRTUALIZABLE ||
      current.virtStatus === PciDeviceVirtStatus.VFIO_MDEV_VIRTUALIZABLE) &&
    !current?.vmInstanceUuid
  );
};

// 还原
export const verifyUngenerateSriov = async (current: IPciDevice) => {
  return (
    (current.virtStatus === PciDeviceVirtStatus.SRIOV_VIRTUALIZED ||
      current.virtStatus === PciDeviceVirtStatus.VFIO_MDEV_VIRTUALIZED) &&
    !current?.vmInstanceUuid
  );
};

// 加载云主机
export const verifyAttachToVmInstance = (
  selectedList: IPciDevice[],
  source: any = {},
): boolean => {
  const vm: IVM = source;
  if (vm?.gpuDeviceSpec?.length) {
    return false;
  }
  return (
    ["stopped", "Stopped", "Running", "running"].indexOf(vm.state || "") >= 0 &&
    vmNotInCdpTask(source)
  );
};

// 卸载云主机
export const verifyDetachFromVmInstace = (
  current: IPciDevice,
  source: any = {},
): boolean => {
  const vm: IVM = source;
  return (
    ["stopped", "Stopped", "Running", "running"].indexOf(vm.state || "") >= 0 &&
    vmNotInCdpTask(source)
  );
};
