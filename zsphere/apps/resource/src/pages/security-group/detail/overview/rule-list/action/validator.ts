import { SecurityGroupRuleState } from "@zstack/zsphere-types";
import type { SecurityGroupRule as ISecurityGroupRule } from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";

export const verifyEnable = (selectedList: ISecurityGroupRule[]) => {
  return _.some(
    selectedList,
    (it) => it.state === SecurityGroupRuleState.Disabled,
  );
};

export const verifyDisable = (selectedList: ISecurityGroupRule[]) => {
  return _.some(
    selectedList,
    (it) => it.state === SecurityGroupRuleState.Enabled,
  );
};

export const verifyIsDefaultRule = (selectedList: ISecurityGroupRule[]) => {
  // 是默认规则就禁用
  return !_.some(selectedList, (it) => it.priority === 0);
};
