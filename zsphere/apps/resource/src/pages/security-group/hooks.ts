import {
  SecurityGroupRuleProtocolType,
  SecurityGroupRuleState,
} from "@zstack/zsphere-types";
import type {
  AddRuleParam as IAddRuleParam,
  SecurityGroup as ISecurityGroup,
} from "@zstack/zsphere-types/graphql";
import { isEmpty as _isEmpty, compact as _compact } from "lodash-es";

interface IRule extends Omit<IAddRuleParam, "status"> {
  remoteSecurityGroups: ISecurityGroup[];
  authorized?: number;
  state?: boolean;
}

export const transformRules = (rules: IRule[]): IAddRuleParam[] => {
  if (!rules) {
    return [];
  }
  /**
   * 由于历史原因,这个要处理srcPortRange、dstPortRange、priority等字段
   *
   * 后端有定义srcPortRange，dstPortRange，但实际只使用dstPortRange
   * priority 设计稿创建安全组页面规则本可以指定优先级(后端原因，无法实现)，rules里的priority只在安全组详情页规则修改优先级时需要
   * remoteSecurityGroupUuids 创建安全组页面把rules里的remoteSecurityGroupUuids放到外层使用 ，rules 里remoteSecurityGroupUuids无用，remoteSecurityGroupUuid修改使用
   * 避免存在并发问题，这里对remoteSecurityGroupUuids拆分, 给规则传入remoteSecurityGroupUuid
   */
  const _rules: IAddRuleParam[] = [];

  rules.forEach(
    ({
      remoteSecurityGroups,
      srcPortRange,
      dstPortRange,
      authorized,
      priority,
      state,
      ...otherFields
    }) => {
      const remoteSecurityGroupUuids = _compact(
        remoteSecurityGroups?.map((sg) => sg.uuid),
      );

      if (otherFields.protocol === SecurityGroupRuleProtocolType.ICMP) {
        otherFields.dstPortRange = -1;
      }

      const rule = {
        ...otherFields,
        dstPortRange: srcPortRange ?? dstPortRange,
        state: state
          ? SecurityGroupRuleState.Enabled
          : SecurityGroupRuleState.Disabled,
      };

      if (_isEmpty(remoteSecurityGroupUuids)) {
        _rules.push(rule);
        return;
      }

      remoteSecurityGroupUuids.forEach((remoteSecurityGroupUuid) => {
        _rules.push({
          ...rule,
          remoteSecurityGroupUuid,
        });
      });
    },
  );

  return _rules;
};
