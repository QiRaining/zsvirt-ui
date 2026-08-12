import type { L2Network } from "@zstack/zsphere-types/graphql";

export const verifySingleSelect = (selectedList: L2Network[]): boolean => {
  return selectedList.length === 1;
};

export const verifyMultiSelect = (selectedList: L2Network[]): boolean => {
  return selectedList.length >= 1;
};

export const verifySubL2NetworkDetachInCluster = (
  selectedList: L2Network[],
): boolean => {
  return selectedList.length === 1;
};

export const verifySubL2NetworkAttachInCluster = (
  selectedList: L2Network[],
): boolean => {
  return selectedList.length === 0;
};

export const verifyCanDetachClusterInClusterSubList = (
  selectedList: L2Network[],
): boolean => {
  return selectedList.some(
    (l2) => l2.type !== "VxlanNetwork" && l2.type !== "HardwareVxlanNetwork",
  );
};

export const verifyCanShare = (current: L2Network) => {
  return ["HardwareVxlanNetwork"].indexOf(current?.type || "") < 0;
};

export const verifyCanDetachCluster = (current: L2Network) => {
  return !!current.attachedClusterUuids?.length;
};

export const verifyDelete = (selectedList: L2Network[]): boolean => {
  return selectedList.length > 0;
};

export const verifyCanDelete = (current: L2Network) => {
  return !current.isDefault || !current.attachedHostRefs?.length;
};
