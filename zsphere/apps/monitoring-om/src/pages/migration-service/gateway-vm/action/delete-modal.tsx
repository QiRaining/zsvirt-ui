import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { VmInstanceState } from "@zstack/zsphere-types";
import type { Item, IActionWrapperProps } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

const DELETE_MIGRATION_GATEWAY_VM = gql`
  mutation deleteMigrationGatewayVm($input: DeleteMigrationGatewayVmInput!) {
    deleteMigrationGatewayVm(input: $input) {
      actionId
    }
  }
`;

const DeleteModal: React.FC<IActionWrapperProps<Item>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onConfirm = () => {
    const payload = selectedList.map((item) => ({
      uuid: item.uuid,
    }));

    doAction({
      mutation: DELETE_MIGRATION_GATEWAY_VM,
      payload,
      name: intl.formatMessage({
        id: "gateway.vm.action.delete",
        defaultMessage: "Delete Migration Service",
      }),
      total: selectedList.length,
      type: "VmInstance",
      middleState: {
        type: "VmInstance",
        field: "state",
        data: { state: VmInstanceState.Destroying },
        uuids: selectedList.map((item) => item.uuid),
      },
      onFinish: () => {
        setSelectedList?.([]);
        refetch?.();
      },
    });
  };

  return (
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "gateway.vm.action.delete.confirm",
        defaultMessage: "Delete Migration Service?",
      })}
      bannerMessage={intl.formatMessage({
        id: "gateway.vm.action.delete.alert",
        defaultMessage:
          "After deletion, the system will permanently remove all migration service files and configurations, and immediately release the CPU, memory, and IP address resources. Proceed with caution.",
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

export default DeleteModal;
