import type { SNSDingTalkAtPerson } from "@zstack/zsphere-types/graphql";

// 单选
export const verifySingleSelect = (
  selectedList: SNSDingTalkAtPerson[],
): boolean => {
  return selectedList.length === 1;
};

// 多选
export const verifyMultiSelect = (
  selectedList: SNSDingTalkAtPerson[],
): boolean => {
  return selectedList.length >= 1;
};
