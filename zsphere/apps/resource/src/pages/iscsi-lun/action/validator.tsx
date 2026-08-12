import type { IscsiLun as IIscsiLun } from "@zstack/zsphere-types/graphql";

// 单选
export const verifySingleSelect = (selectedList: IIscsiLun[]): boolean => {
  return selectedList.length === 1;
};

// 多选
export const verifyMutilSelect = (selectedList: IIscsiLun[]): boolean => {
  return selectedList?.length >= 1;
};

// 卸载云主机
export const verifyDetachVm = (current: IIscsiLun): boolean => {
  return (
    !!current?.scsiLunVmInstanceRefs &&
    current?.scsiLunVmInstanceRefs?.length > 0
  );
};
