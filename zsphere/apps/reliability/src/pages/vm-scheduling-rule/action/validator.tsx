import type { VmSchedulingRule } from "@zstack/zsphere-types/graphql";

// 单选
export const verifySingleSelect = (
  selectedList: VmSchedulingRule[],
): boolean => {
  return selectedList.length === 1;
};

// 启动
export const verifyStart = (current: VmSchedulingRule) => {
  return ["Disabled"].includes(current?.state ?? "");
};

// 停止
export const verifyStop = (current: VmSchedulingRule) => {
  return ["Enabled"].includes(current?.state ?? "");
};

export const verifyDelete = (current: VmSchedulingRule) => {
  return !!current.uuid;
};
