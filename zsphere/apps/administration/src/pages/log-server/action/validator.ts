import type { LogServer as ILogServer } from "@zstack/zsphere-types/graphql";

// 选择多个
export const verifyMulti = (selectedList: ILogServer[]) => {
  return selectedList.length >= 1;
};
export const verifySingle = (selectedList: ILogServer[]) => {
  return selectedList.length === 1;
};
