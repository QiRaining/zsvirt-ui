import type { FiberChannelLun as IFiberChannelLun } from "@zstack/zsphere-types/graphql";

// 单选
export const verifySingleSelect = (
  selectedList: IFiberChannelLun[],
): boolean => {
  return selectedList.length === 1;
};

// 多选
export const verifyMutilSelect = (
  selectedList: IFiberChannelLun[],
): boolean => {
  return selectedList?.length >= 1;
};

// 卸载云主机
export const verifyDetachVm = (current: IFiberChannelLun): boolean => {
  return (
    !!current?.scsiLunVmInstanceRefs &&
    current?.scsiLunVmInstanceRefs?.length > 0
  );
};
