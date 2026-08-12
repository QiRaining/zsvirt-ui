import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { VmInstanceState } from "@zstack/zsphere-types";
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const forceStopVmInstance = gql`
  mutation forceStopVmInstance($input: ForceStopVmInstanceInput!) {
    forceStopVmInstance(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<VmInstance>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const allVolumeCount = useMemo(() => {
    return selectedList.reduce((pre, next) => {
      return pre + (next.allVolumes || []).length;
    }, 0);
  }, [selectedList]);

  const onOk = () => {
    doAction({
      mutation: forceStopVmInstance,
      payload: selectedList.map((item) => {
        return { uuid: item.uuid };
      }),
      name: intl.formatMessage({
        id: "forceStop.vm",
        defaultMessage: "Force Stop Virtual Machine",
      }),
      total: selectedList.length,
      type: "VmInstance",
      middleState: {
        type: "VmInstance",
        field: "state",
        data: { state: VmInstanceState.Stopping },
        uuids: selectedList.map((item) => item.uuid),
      },
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
    setVisible(false);
    setSelectedList?.([]);
  };

  return (
    <DialogP1
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "forceStop.vm.alert.message.alert",
            defaultMessage: `1. This operation forcibly changes the VM state to Stopped. Please exercise caution.
2. Force stopping a virtual machine might cause VM errors and crash. We recommend that you restore the host where the virtual machine is located first.`,
          })}
        </ReactMarkdown>
      }
      setVisible={setVisible}
      visible={visible}
      title={intl.formatMessage({
        id: "vm.modal.title.confirm.forceStop.vm",
        defaultMessage: "Force Stop Virtual Machine?",
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
