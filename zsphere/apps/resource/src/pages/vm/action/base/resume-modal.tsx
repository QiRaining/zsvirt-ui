import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { VmInstanceState } from "@zstack/zsphere-types";
import type {
  VmInstance,
  ResumeVmInstancePayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const resumeVmInstance = gql`
  mutation resumeVmInstance($input: ResumeVmInstanceInput!) {
    resumeVmInstance(input: $input) {
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
  const intl = useIntl();
  const doAction = useAction();
  const onOk = () => {
    const payload: ResumeVmInstancePayload[] = selectedList.map((item) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: resumeVmInstance,
      payload,
      name: intl.formatMessage({
        id: "resume.vm",
        defaultMessage: "Resume Virtual Machine",
      }),
      total: selectedList.length,
      middleState: {
        type: "VmInstance",
        field: "state",
        data: { state: VmInstanceState.Resuming },
        uuids: selectedList.map((item) => item.uuid),
      },
      onProgress: (_result: ITaskResult) => {},
      onFinish: (_result: IActionResult) => {
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
        id: "vm.modal.title.confirm.resume.vm",
        defaultMessage: "Resume Virtual Machine?",
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
