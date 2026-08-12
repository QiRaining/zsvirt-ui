import type { FiberChannelStorage as IFiberChannelStorage } from "@zstack/zsphere-types/graphql";

// 单选
export const verifySingleSelect = (
  selectedList: IFiberChannelStorage[],
): boolean => {
  return selectedList.length === 1;
};

// 删除
export const verifyDelete = (selectedList: IFiberChannelStorage[]): boolean => {
  return selectedList?.length > 0;
};
