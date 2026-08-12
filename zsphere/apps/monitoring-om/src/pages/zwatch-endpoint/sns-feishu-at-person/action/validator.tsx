import type { SNSFeiShuAtPerson } from "@zstack/zsphere-types/graphql";

// 单选
export const verifySingleSelect = (
  selectedList: SNSFeiShuAtPerson[],
): boolean => {
  return selectedList.length === 1;
};

// 多选
export const verifyMultiSelect = (
  selectedList: SNSFeiShuAtPerson[],
): boolean => {
  return selectedList.length >= 1;
};
