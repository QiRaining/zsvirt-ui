import { SchedulerJobGroupState } from "@zstack/zsphere-types";
import type { SchedulerJobGroup as ISchedulerJobGroup } from "@zstack/zsphere-types/graphql";

// 多选
export const verifyMultiSelect = (
  selectedList: ISchedulerJobGroup[],
): boolean => {
  return selectedList.length > 0;
};

// 单选
export const verifySingleSelect = (
  selectedList: ISchedulerJobGroup[],
): boolean => {
  return selectedList.length === 1;
};

// 启用备份任务
export const verifyEnableSchedulerJobGroup = (
  current: ISchedulerJobGroup,
): boolean => {
  return current.state !== SchedulerJobGroupState.Enabled;
};

// 停用备份任务
export const verifyDisabledSchedulerJobGroup = (
  current: ISchedulerJobGroup,
): boolean => {
  return current.state !== SchedulerJobGroupState.Disabled;
};

export const verifyTriggerNow = (current: ISchedulerJobGroup): boolean => {
  return current.state !== SchedulerJobGroupState.Disabled;
};
