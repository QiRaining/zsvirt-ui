import { SNSApplicationPlatformState } from "@zstack/zsphere-types";
import type { EmailServerSetting as IEmailServer } from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
// 启动
export const verifyEnableEmailServerSetting = (current: IEmailServer) => {
  return current.state === SNSApplicationPlatformState.Disabled;
};

// 停止
export const verifyDisableEmailServerSetting = (current: IEmailServer) => {
  return current.state === SNSApplicationPlatformState.Enabled;
};

// verifyMulti
export const verifyMulti = async (selectedList: IEmailServer[]) => {
  return selectedList.length >= 1;
};
// verifySingle
export const verifySingle = async (selectedList: IEmailServer[]) => {
  return selectedList.length === 1;
};

export const verifyCanSharedToAll = (selectedList: IEmailServer): boolean => {
  return [selectedList].some(
    (item) => !_.get(item, ["toPublic"]) && item.toPublic !== true,
  );
};

export const verifyCanRecallFromAll = (selectedList: IEmailServer): boolean => {
  return [selectedList].some(
    (item) => _.get(item, ["toPublic"]) && item.toPublic !== false,
  );
};
