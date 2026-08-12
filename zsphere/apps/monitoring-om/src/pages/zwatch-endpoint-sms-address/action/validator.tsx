import type { EndPointEmailAddress as IEndPointEmailAddress } from "@zstack/zsphere-types/graphql";

// 单选
export const verifySingleSelect = (
  selectedList: IEndPointEmailAddress[],
): boolean => {
  return selectedList.length === 1;
};

// 删除
export const verifyDelete = (
  selectedList: IEndPointEmailAddress[],
): boolean => {
  return selectedList?.length > 0;
};
