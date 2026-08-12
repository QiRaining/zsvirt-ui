import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { AccessControlRule as IAccessControlRule } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const deleteAccessControlRule = gql`
  mutation deleteAccessControlRule($input: DeleteAccessControlRuleInput!) {
    deleteAccessControlRule(input: $input) {
      actionId
    }
  }
`;
export interface IProps {
  title?: string;
  name?: string;
  resourcesName?: string;
}

const Action: React.FC<IActionWrapperProps<IAccessControlRule> & IProps> = ({
  title: _title,
  name: _name,
  selectedList,
  setSelectedList,
  refetch,
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const title =
    _title ??
    intl.formatMessage({
      id: "virtualization.accessControlRule.action.delete.title",
      defaultMessage: "Delete IP Allowlist/Blocklist?",
    });

  const name =
    _name ??
    intl.formatMessage({
      id: "virtualization.accessControlRule.action.delete.name",
      defaultMessage: "Delete IP Allowlist/Blocklist",
    });

  const resourcesName = intl.formatMessage({
    id: "ipblacklist",
    defaultMessage: "IP Blocklist",
  });

  const onOk = () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: deleteAccessControlRule,
      payload,
      name,
      type: "AccessControlRule",
      total: selectedList.length,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      title={title}
      onConfirm={onOk}
      visible={visible}
      setVisible={setVisible}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      resourceType={resourcesName}
    />
  );
};

export default Action;
