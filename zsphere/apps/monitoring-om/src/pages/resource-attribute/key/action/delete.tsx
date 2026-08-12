import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { ResourceAttributeKey } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const deleteResourceAttributeKey = gql`
  mutation deleteResourceAttributeKey(
    $input: DeleteResourceAttributeKeyInput!
  ) {
    deleteResourceAttributeKey(input: $input) {
      actionId
    }
  }
`;

export default function Delete({
  selectedList,
  visible,
  setVisible,
}: IActionWrapperProps<ResourceAttributeKey>) {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: deleteResourceAttributeKey,
      payload,
      name: intl.formatMessage({
        id: "delete.resource.attribute.key",
        defaultMessage: "Delete Custom Attribute",
      }),
      type: "ResourceAttributeKey",
      total: payload.length,
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "delete.resource.attribute.modal.title",
        defaultMessage: "Delete Custom Attribute?",
      })}
      onConfirm={onOk}
      visible={visible}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      setVisible={setVisible}
    />
  );
}
