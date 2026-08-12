import type { CephMon as ICephMon } from "@zstack/zsphere-types/graphql";

// verifySingle
export const verifySingle = async (selectedList: ICephMon[]) => {
  return selectedList.length === 1;
};
