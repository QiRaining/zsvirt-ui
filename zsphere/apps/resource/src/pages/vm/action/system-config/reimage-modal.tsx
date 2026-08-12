import { reimageVmInstance } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { DialogWeakP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const Action: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const vm = selectedList[0];

  if (vm) {
    return (
      <DialogWeakP1
        visible={visible}
        setVisible={setVisible}
        onConfirm={() => {
          doAction({
            mutation: reimageVmInstance,
            payload: {
              vmInstanceUuid: vm.uuid,
            },
            name: intl.formatMessage({
              id: "reimage.vm",
              defaultMessage: "Reset System",
            }),
            total: selectedList.length,
            onFinish: () => {
              refetch?.();
              setSelectedList?.([]);
            },
          });
        }}
        title={String(
          intl.formatMessage({
            id: "vm.modal.title.confirm.reimage.vm",
            defaultMessage: "Reset System?",
          }),
        )}
        type="warning"
        description={intl.formatMessage({
          id: "vm.modal.reimage.alert.warning",
          defaultMessage:
            "Reset the VM to the initial state of the VM image and overwrite all data in the system disk. Back up the original system disk data in advance to avoid data loss.",
        })}
      />
    );
  }
  return null;
};

export default Action;
