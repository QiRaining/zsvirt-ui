import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { VmInstanceState } from "@zstack/zsphere-types";
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const pauseVmInstance = gql`
  mutation pauseVmInstance($input: PauseVmInstanceInput!) {
    pauseVmInstance(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<VmInstance>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
}) => {
  const doAction = useAction();
  const intl = useIntl();
  const onOk = () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: pauseVmInstance,
      payload,
      name: intl.formatMessage({
        id: "vm.pause",
        defaultMessage: "Pause VM",
      }),
      total: selectedList.length,
      middleState: {
        type: "VmInstance",
        field: "state",
        data: { state: VmInstanceState.Pausing },
        uuids: selectedList.map((item) => item.uuid),
      },
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
        if (window.location.pathname === "/novnc") {
          refetch?.();
        }
        setSelectedList?.([]);
      },
    });

    if (setSelectedList) {
      setSelectedList([]);
    }
    setVisible(false);
  };

  return (
    <DialogP3
      setVisible={setVisible}
      visible={visible}
      title={intl.formatMessage({
        id: "vm.modal.title.confirm.suspend.vm",
        defaultMessage: "Pause Virtual Machine?",
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
