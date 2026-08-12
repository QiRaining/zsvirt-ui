import type { HostGroup } from "@zstack/zsphere-types/graphql";

// 单选
export const verifySingleSelect = (selectedList: HostGroup[]): boolean => {
  return selectedList.length === 1;
};

export const verifyRemoveHost = (current: HostGroup) => {
  return !!current?.hostCount;
};

export const verifyDelete = (current: HostGroup) => {
  return !!current.uuid;
};
