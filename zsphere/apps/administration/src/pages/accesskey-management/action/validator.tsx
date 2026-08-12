import type { AccessKey as IAccessKey } from "@zstack/zsphere-types/graphql";

// 停止
export const verifyStop = (current: IAccessKey) => {
  return ["Enabled"].indexOf(current.state || "") >= 0;
};

export const verifyStart = (current: IAccessKey) => {
  return ["Disabled"].indexOf(current.state || "") >= 0;
};
