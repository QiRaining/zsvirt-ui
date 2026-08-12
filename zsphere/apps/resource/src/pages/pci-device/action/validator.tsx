import {
  VmInstanceState,
  PciDevicePassThroughState,
  PciDeviceType,
  PciDeviceVirtStatus,
} from "@zstack/zsphere-types";
import type {
  PciDevice as IPciDevice,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";

const vmNotInCdpTask = (selectedList: IPciDevice[], vm: IVM) => {
  return vm?.state !== VmInstanceState?.VolumeRecovering;
};

// verifySelected
const verifySelected = (selectedList: IPciDevice[]) => {
  return selectedList?.length > 0;
};

// verifyNotSelected
const verifyNotSelected = (selectedList: IPciDevice[]) => {
  return selectedList?.length <= 0;
};

// verifySingle
const verifySingle = async (selectedList: IPciDevice[]) => {
  return selectedList.length === 1;
};

// 启动
const verifyEnabled = async (current: IPciDevice) => {
  return current.state !== "Enabled";
};

// 停止
const verifyDisabled = async (current: IPciDevice) => {
  return current.state !== "Disabled";
};

// PCIe设备直通切换
const verifyPassthrough = (current: IPciDevice) => {
  return (
    current.passThroughState !== PciDevicePassThroughState.Disabled &&
    !current.vmInstanceUuid &&
    // VF网卡默认后端已配置直通，不支持直通切换
    (current.type !== PciDeviceType.Ethernet_Controller ||
      current.virtStatus !== PciDeviceVirtStatus.SRIOV_VIRTUAL)
  );
};

export {
  verifyPassthrough,
  verifySingle,
  verifyEnabled,
  verifyDisabled,
  vmNotInCdpTask,
  verifySelected,
  verifyNotSelected,
};
