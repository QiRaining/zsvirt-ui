import type { LogCollect } from "@zstack/zsphere-types/graphql";

export const verifyDeleteAllLog = (selectedList: LogCollect[]) => {
  return selectedList && selectedList.length > 0;
};
