import type { Trash as ITrash } from "@zstack/zsphere-types/graphql";

// 清理
export const verifyCleanup = (selectedList: ITrash[]): boolean => {
  return selectedList?.length > 0;
};
