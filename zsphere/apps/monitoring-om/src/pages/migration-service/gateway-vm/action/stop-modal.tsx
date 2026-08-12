import { gql } from "@apollo/client";
import { DialogP2 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { VmInstanceState } from "@zstack/zsphere-types";
import type { Item, IActionWrapperProps } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

const stopVmInstance = gql`
  mutation stopVmInstance($input: StopVmInstanceInput!) {
    stopVmInstance(input: $input) {
      actionId
    }
  }
`;

const StopModal: React.FC<IActionWrapperProps<Item>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onConfirm = () => {
    const payload = selectedList.map((item) => ({
      uuid: item.uuid,
      stopHA: true,
    }));

    doAction({
      mutation: stopVmInstance,
      payload,
      name: intl.formatMessage({
        id: "gateway.vm.action.disable",
        defaultMessage: "Disable Migration Service",
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
  };

  return (
    <DialogP2
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "gateway.vm.action.disable.confirm",
        defaultMessage: "Disable Migration Service?",
      })}
      bannerMessage={intl.formatMessage({
        id: "gateway.vm.action.disable.alert",
        defaultMessage:
          "After disabling, all migration service-related features will become unavailable. Proceed with caution.",
      })}
      resourceNames={selectedList.map((item) => item.name)}
      resourceType={intl.formatMessage({
        id: "gateway.vm.resource.name",
        defaultMessage: "Migration Service",
      })}
      onConfirm={onConfirm}
    />
  );
};

export default StopModal;
