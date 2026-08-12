import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { ResourceAttributeConstraint } from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";

const updateResourceAttributeKey = gql`
  mutation updateResourceAttributeKey(
    $input: UpdateResourceAttributeKeyInput!
  ) {
    updateResourceAttributeKey(input: $input) {
      actionId
    }
  }
`;

export default function Delete({
  selectedList,
  visible,
  setVisible,
  source,
}: IActionWrapperProps<ResourceAttributeConstraint>) {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    doAction({
      mutation: updateResourceAttributeKey,
      payload: {
        uuid: source?.uuid ?? "",
        deleteConstraintIds: selectedList.map((item) => item.id),
      },
      name: intl.formatMessage({
        id: "delete.resource.attribute.value",
        defaultMessage: "Delete Attribute Value",
      }),
      type: "ResourceAttributeKey",
      total: 1,
      onFinish: () => {
        bus.emit("action:refetch:ResourceAttributeConstraint");
        source?.onDelete?.();
      },
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "delete.resource.attribute.value.modal.title",
        defaultMessage: "Delete Attribute Value?",
      })}
      onConfirm={onOk}
      visible={visible}
      resourceNames={selectedList.map((item) => item.name ?? item.id ?? "")}
      setVisible={setVisible}
    />
  );
}
