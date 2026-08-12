import { VmInstanceState } from "@zstack/zsphere-types";
import type {
  VGpuDevice as IVGpuDevice,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";

const vmNotInCdpTask = (vm: IVM) =>
  vm?.state !== VmInstanceState?.VolumeRecovering;
// 单选
export const verifySingleSelect = (selectedList: IVGpuDevice[]): boolean => {
  return selectedList.length === 1;
};

// 没有选择
export const verifyNoSelect = (selectedList: IVGpuDevice[]): boolean => {
  return selectedList.length === 0;
};

// 加载云主机
export const verifyAttachToVmInstance = (
  selectedList: IVGpuDevice[],
  source: IVM,
): boolean => {
  const vm: any = source;
  if (vm?.gpuDeviceSpec?.length) {
    return false;
  }
  if (vm?.vgpuDeviceNum > 0) {
    return false;
  }
  return (
    ["stopped", "Stopped"].indexOf(vm.state || "") >= 0 &&
    vmNotInCdpTask(source)
  );
};

// 卸载云主机
export const verifyDetachFromVmInstace = (
  current: IVGpuDevice,
  source: IVM,
): boolean => {
  return (
    ["stopped", "Stopped"].indexOf(source.state || "") >= 0 &&
    vmNotInCdpTask(source)
  );
};

// 启动
export const verifyEnabled = async (current: IVGpuDevice) => {
  return current.state !== "Enabled";
};

// 停止
export const verifyDisabled = async (current: IVGpuDevice) => {
  return current.state !== "Disabled";
};
