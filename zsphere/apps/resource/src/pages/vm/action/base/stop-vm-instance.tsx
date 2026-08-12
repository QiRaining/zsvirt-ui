import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { VmInstanceState } from "@zstack/zsphere-types";
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const stopVmInstance = gql`
  mutation stopVmInstance($input: StopVmInstanceInput!) {
    stopVmInstance(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<VmInstance>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid, stopHA: true };
    });

    doAction({
      mutation: stopVmInstance,
      payload,
      name: intl.formatMessage({ id: "stop.vm", defaultMessage: "Shut Down VM" }),
      total: selectedList.length,
      type: "VmInstance",
      middleState: {
        type: "VmInstance",
        field: "state",
        data: { state: VmInstanceState.Stopping },
        uuids: selectedList.map((item) => item.uuid),
      },
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (_result: IActionResult) => {
        setSelectedList?.([]);
        if (window.location.pathname === "/novnc") {
          refetch?.();
        }
      },
    });
    setVisible(false);
    setSelectedList?.([]);
  };

  return (
    <DialogP3
      setVisible={setVisible}
      visible={visible}
      title={intl.formatMessage({
        id: "vm.modal.title.confirm.stop.vm",
        defaultMessage: "Shut Down Virtual Machine?",
      })}
      resourceType={intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={() => {
        onOk();
      }}
    />
  );
};

export default Action;
