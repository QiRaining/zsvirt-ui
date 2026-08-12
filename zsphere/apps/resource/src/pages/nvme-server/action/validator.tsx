import type { NvmeTarget as INvmeTarget } from "@zstack/zsphere-types/graphql";

// 单选
export const verifySingleSelect = (selectedList: INvmeTarget[]): boolean => {
  return selectedList.length === 1;
};

// 删除
export const verifyDelete = (selectedList: INvmeTarget[]): boolean => {
  return selectedList?.length > 0;
};
