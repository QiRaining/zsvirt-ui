import type { PreconfigurationTemplate as IPreconfigurationTemplate } from "@zstack/zsphere-types/graphql";

// verifySingle
const verifySingle = async (selectedList: IPreconfigurationTemplate[]) => {
  return selectedList.length === 1;
};

// verifyMulti
const verifyMulti = async (selectedList: IPreconfigurationTemplate[]) => {
  return selectedList.length >= 1;
};

// 启动
const enabled = async (current: IPreconfigurationTemplate) => {
  return current.state !== "Enabled" && current.isPredefined !== true;
};

// 停止
const disabled = async (current: IPreconfigurationTemplate) => {
  return current.state !== "Disabled" && current.isPredefined !== true;
};
// 停止
const verifyIsPredefined = async (current: IPreconfigurationTemplate) => {
  return current.isPredefined !== true;
};

export { verifySingle, verifyMulti, disabled, enabled, verifyIsPredefined };
