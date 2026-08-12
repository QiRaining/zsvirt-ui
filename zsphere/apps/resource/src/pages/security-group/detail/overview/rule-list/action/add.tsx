import { gql } from "@apollo/client";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { SecurityGroupRuleType } from "@zstack/zsphere-types";
import type {
  SecurityGroupRule as ISecurityGroupRule,
  SecurityGroup as ISecurityGroup,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import SecurityGroupRulesModal from "../../../../action/security-group-rules-modal";
import { transformRules } from "../../../../hooks";

const addSecurityGroupRule = gql`
  mutation addSecurityGroupRule($input: AddSecurityGroupRuleInput!) {
    addSecurityGroupRule(input: $input) {
      actionId
    }
  }
`;
const EMPTY_LIST: never[] = [];

export interface IProps {
  securityGroupRuleType: SecurityGroupRuleType;
}

const Action: React.FC<
  IActionWrapperProps<ISecurityGroupRule, ISecurityGroup> & IProps
> = ({
  view,
  visible,
  setVisible,
  setSelectedList,
  source,
  refetch,
  securityGroupRuleType,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const { title, maxPriority } = React.useMemo(() => {
    const rules = source?.rules?.filter((it) => it.priority !== 0) ?? [];

    if (securityGroupRuleType === SecurityGroupRuleType.Ingress) {
      return {
        title: intl.formatMessage({
          id: "securityGroupRule.action.add.ingress.rule.title",
          defaultMessage: "Add Ingress Rule",
        }),
        maxPriority:
          rules.filter((it) => it.type === SecurityGroupRuleType.Ingress)
            .length ?? 0,
      };
    }

    return {
      title: intl.formatMessage({
        id: "securityGroupRule.action.add.egress.rule.title",
        defaultMessage: "Add Egress Rule",
      }),
      maxPriority:
        rules.filter((it) => it.type === SecurityGroupRuleType.Egress).length ??
        0,
    };
  }, [source, intl, securityGroupRuleType]);

  const onOk = async (data: any) => {
    const rules = transformRules([data]);

    rules.forEach((item) => {
      if (!item.dstIpRange) {
        delete item.dstIpRange;
      }
      if (!item.srcIpRange) {
        delete item.srcIpRange;
      }
    });

    doAction({
      mutation: addSecurityGroupRule,
      payload: {
        securityGroupUuid: source?.uuid,
        rules,
        priority: data.priority,
      },
      name: title,
      total: 1,
      type: "securityGroupRuleList",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
        setVisible?.(false);
      },
    });
  };

  return (
    <SecurityGroupRulesModal
      position="toolbar"
      view={view}
      visible={visible}
      setVisible={setVisible}
      selectedList={EMPTY_LIST}
      type={securityGroupRuleType}
      setRule={onOk}
      maxPriority={maxPriority}
    />
  );
};

export default Action;
