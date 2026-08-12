import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/security-group-rule";
import type { IOption } from "@zstack/zsphere-engine/src/security-group-rule/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import type { SecurityGroupRuleType } from "@zstack/zsphere-types";
import { SecurityGroupRuleState } from "@zstack/zsphere-types";
import type {
  SecurityGroupRule as ISecurityGroupRule,
  SecurityGroup as ISecurityGroup,
} from "@zstack/zsphere-types/graphql";
import { compact as _compact } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import { verifyDefaultSGAndIdentity } from "../../../../action/validator";
import { MaxRulesLimit } from "../../../../utils";
import AddAction from "../action/add";
import AdjustPriorityAction from "../action/adjust-priority";
import DeleteAction from "../action/delete";
import ModifyRule from "../action/modify-rule";
import {
  verifyDisable,
  verifyEnable,
  verifyIsDefaultRule,
} from "../action/validator";

const changeSecurityGroupRuleState = gql`
  mutation changeSecurityGroupRuleState(
    $input: ChangeSecurityGroupRuleStateInput!
  ) {
    changeSecurityGroupRuleState(input: $input) {
      actionId
    }
  }
`;

export default (
  securityGroup: ISecurityGroup[],
  ruleType: SecurityGroupRuleType,
) => {
  const intl = useIntl();
  const doAction = useAction();

  const rulesLength = React.useMemo(
    () =>
      _compact(securityGroup[0]?.rules).filter(
        (it) => it.type === ruleType && it.priority !== 0,
      ).length,
    [ruleType, securityGroup],
  );

  const options = React.useMemo<IOption<ISecurityGroupRule, ISecurityGroup>>(
    () => [
      {
        key: "addRule",
        autoInjectPreValidator: false,
        disabled:
          !verifyDefaultSGAndIdentity(securityGroup) ||
          rulesLength >= MaxRulesLimit,
        ActionWrapper: (props: any) => (
          <AddAction {...props} securityGroupRuleType={ruleType} />
        ),
      },
      {
        key: "deleteRule",
        disabled: !verifyDefaultSGAndIdentity(securityGroup),
        preValidators: [verifyIsDefaultRule],
        ActionWrapper: DeleteAction,
      },
      {
        key: "enable",
        icon: "play-circle-fill",
        iconStyle: {
          color: "#5ACA49",
        },
        preValidators: [verifyEnable],
        onClick: ({ selectedList, setSelectedList, refetch, source }) => {
          const payload = selectedList
            .filter((it) => it.state === SecurityGroupRuleState.Disabled)
            .map((it) => ({
              securityGroupUuid: source?.uuid,
              ruleUuids: [it.uuid],
              state: SecurityGroupRuleState.Enabled,
            }));

          doAction({
            mutation: changeSecurityGroupRuleState,
            payload,
            name: intl.formatMessage({
              id: "enable.securityGroupRule",
              defaultMessage: "Enable Rule",
            }),
            total: payload.length,
            onFinish: () => {
              refetch?.();
              setSelectedList?.([]);
            },
          });
        },
      },
      {
        key: "disable",
        icon: "stop-circle-fill",
        iconStyle: {
          color: "#F4454C",
        },
        preValidators: [verifyDisable],
        onClick: ({ selectedList, setSelectedList, refetch, source }) => {
          const payload = selectedList
            .filter((it) => it.state === SecurityGroupRuleState.Enabled)
            .map((it) => ({
              securityGroupUuid: source?.uuid,
              ruleUuids: [it.uuid],
              state: SecurityGroupRuleState.Disabled,
            }));

          doAction({
            mutation: changeSecurityGroupRuleState,
            payload,
            name: intl.formatMessage({
              id: "disable.securityGroupRule",
              defaultMessage: "Disable Rule",
            }),
            total: payload.length,
            onFinish: () => {
              refetch?.();
              setSelectedList?.([]);
            },
          });
        },
      },
      {
        key: "modify.rule",
        preValidators: [verifyIsDefaultRule],
        ActionWrapper: ModifyRule,
      },
      {
        key: "adjust.priority",
        autoInjectPreValidator: false,
        ActionWrapper: (props: any) => (
          <AdjustPriorityAction {...props} securityGroupRuleType={ruleType} />
        ),
      },
    ],
    [doAction, intl, ruleType, securityGroup, rulesLength],
  );

  return useActionConfig<ISecurityGroupRule>(options);
};
