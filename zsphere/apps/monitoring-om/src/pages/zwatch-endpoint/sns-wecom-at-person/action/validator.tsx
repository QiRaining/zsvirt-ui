import type { SNSWeComAtPerson } from "@zstack/zsphere-types/graphql";

// 单选
export const verifySingleSelect = (
  selectedList: SNSWeComAtPerson[],
): boolean => {
  return selectedList.length === 1;
};

// 多选
export const verifyMultiSelect = (
  selectedList: SNSWeComAtPerson[],
): boolean => {
  return selectedList.length >= 1;
};
