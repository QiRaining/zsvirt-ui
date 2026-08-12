import { deleteVmCustomSpecification } from "@zstack/virtualization-resource/src/gql/vm-spec.gql";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmCustomSpecification } from "@zstack/zsphere-types/graphql";
import React, { useCallback } from "react";
import { useIntl } from "react-intl";

export default function Delete({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<VmCustomSpecification>) {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = useCallback(() => {
    doAction({
      mutation: deleteVmCustomSpecification,
      payload: selectedList.map((item) => ({ uuid: item.uuid })),
      name: intl.formatMessage({
        id: "delete.vm.spec",
        defaultMessage: "Delete VM Specification",
      }),
      total: selectedList.length,
      type: "VmCustomSpecification",
    });
  }, [doAction, intl, selectedList]);

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "vm.spec.delete.modal.title",
        defaultMessage: "Delete VM Specification?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
}
