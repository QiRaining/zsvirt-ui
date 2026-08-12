import { UsbDeviceState, VmInstanceState } from "@zstack/zsphere-types";
import type {
  UsbDevice as IUsbDevice,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";

export const vmNotInCdpTask = (selectedList: IUsbDevice[], vm: IVM) =>
  vm?.state !== VmInstanceState?.VolumeRecovering;
// 单选
export const verifySingleSelect = (selectedList: IUsbDevice[]) => {
  return selectedList.length === 1;
};
// 未选择时
export const verifyNoneSelect = (selectedList: IUsbDevice[]) => {
  return selectedList.length === 0;
};
// 启用
export const verifyStart = (selectedList: IUsbDevice[]) => {
  return selectedList.some((item) => item.state === UsbDeviceState.Disabled);
};

// 停用
export const verifyStop = (selectedList: IUsbDevice[]) => {
  return selectedList.some((item) => item.state === UsbDeviceState.Enabled);
};

// 加载云主机 - 集群子列表
export const verifyAttachInCluster = (selectedList: IUsbDevice[]) => {
  return selectedList.some((item) => !item.vmInstanceUuid);
};

// 卸载云主机 - 集群子列表
export const verifyDetachInCluster = (selectedList: IUsbDevice[]) => {
  return selectedList.some((item) => !!item.vmInstanceUuid);
};

const actionValidatorGroup = {
  detach: {
    preValidators: [verifySingleSelect],
  },
};

export { actionValidatorGroup };
