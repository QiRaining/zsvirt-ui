import { gql } from "@apollo/client";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { SecurityGroupRule as ISecurityGroupRule } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const deleteSecurityGroupRule = gql`
  mutation ($input: DeleteSecurityGroupRuleInput!) {
    deleteSecurityGroupRule(input: $input) {
      actionId
    }
  }
`;

interface IProps extends Omit<
  IActionWrapperProps<ISecurityGroupRule>,
  "view" | "position"
> {}

const DeleteSecurityGroupRuleAction: React.FC<IProps> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    doAction({
      mutation: deleteSecurityGroupRule,
      payload: selectedList.map(({ uuid }) => ({
        ruleUuids: [uuid],
      })),
      name: intl.formatMessage({
        id: "delete.rule",
        defaultMessage: "Delete Rule",
      }),
      total: selectedList.length,
      type: "securityGroupRuleList",
      onFinish: () => {
        setSelectedList?.([]);
        setVisible?.(false);
      },
    });
  };

  return (
    <DialogWeak
      visible={visible}
      setVisible={setVisible}
      title={String(
        intl.formatMessage(
          {
            id: "rule.modal.title.delete.rule",
            defaultMessage: `Delete the {count} rules?`,
          },
          {
            count: selectedList.length,
          },
        ),
      )}
      type="warning"
      onConfirm={onOk}
    />
  );
};

export default DeleteSecurityGroupRuleAction;
