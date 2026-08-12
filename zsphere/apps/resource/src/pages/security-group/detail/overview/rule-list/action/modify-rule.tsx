import { gql } from "@apollo/client";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { SecurityGroupRuleType } from "@zstack/zsphere-types";
import type {
  SecurityGroupRule as ISecurityGroupRule,
  SecurityGroup as ISecurityGroup,
} from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import SecurityGroupRulesModal from "../../../../action/security-group-rules-modal";
import { transformRules } from "../../../../hooks";

const changeSecurityGroupRule = gql`
  mutation changeSecurityGroupRule($input: ChangeSecurityGroupRuleInput!) {
    changeSecurityGroupRule(input: $input) {
      actionId
    }
  }
`;

export interface IProps {}

const Action: React.FC<
  IActionWrapperProps<ISecurityGroupRule, ISecurityGroup> & IProps
> = ({ visible, setVisible, selectedList, setSelectedList, source }) => {
  const intl = useIntl();
  const doAction = useAction();

  const current = React.useMemo(() => selectedList?.[0] ?? {}, [selectedList]);

  const { title, maxPriority } = React.useMemo(() => {
    const rules = source?.rules?.filter((it) => it.priority !== 0) ?? [];
    if (current.type === SecurityGroupRuleType.Ingress) {
      return {
        title: intl.formatMessage({
          id: "securityGroupRule.action.revise.ingress.rule.title",
          defaultMessage: "Modify Ingress Rule",
        }),
        maxPriority:
          rules.filter((it) => it.type === SecurityGroupRuleType.Ingress)
            .length ?? 0,
      };
    }

    return {
      title: intl.formatMessage({
        id: "securityGroupRule.action.revise.egress.rule.title",
        defaultMessage: "Modify Egress Rule",
      }),
      maxPriority:
        rules.filter((it) => it.type === SecurityGroupRuleType.Egress).length ??
        0,
    };
  }, [source, intl, current]);

  const onOk = async (data: any) => {
    const rules = transformRules([data]);

    const rule = _.omit(rules[0], ["remoteSecurityGroupUuids"]);

    doAction({
      mutation: changeSecurityGroupRule,
      payload: {
        ...rule,
        uuid: current.uuid,
        priority: data.priority,
        remoteSecurityGroupUuid: rules[0].remoteSecurityGroupUuid ?? "",
      },
      name: title,
      total: selectedList.length,
      type: "securityGroupRuleList",
      onFinish: () => {
        setSelectedList?.([]);
        setVisible?.(false);
      },
    });
  };

  return (
    <SecurityGroupRulesModal
      position="row"
      view="main"
      visible={visible}
      setVisible={setVisible}
      selectedList={selectedList}
      type={selectedList?.[0].type ?? SecurityGroupRuleType.Ingress}
      setRule={onOk}
      maxPriority={maxPriority}
      disableEditIpVersion
      remoteSecurityGroupSelectType="radio"
      source={source}
    />
  );
};

export default Action;
