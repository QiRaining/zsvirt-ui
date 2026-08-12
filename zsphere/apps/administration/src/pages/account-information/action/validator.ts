import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";

// one
export const one = async (selectedList: IAccount[]) => {
  return selectedList.length === 1;
};

export const many = async (selectedList: IAccount[]) => {
  return selectedList.length >= 1;
};

//第三方不允许修改
export const prohibitEdit = async (current: IAccount) => {
  return current.type !== "ThirdParty";
};
