import type { SharedBlock as ISharedBlock } from "@zstack/zsphere-types/graphql";

// verifyMulti
export const verifyMulti = async (selectedList: ISharedBlock[]) => {
  return selectedList.length > 0;
};
