import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/gateway-vm";
import type { IOption } from "@zstack/zsphere-engine/src/gateway-vm/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import { VmInstanceState } from "@zstack/zsphere-types";
import type { Item } from "@zstack/zsphere-types";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import DeleteModal from "../action/delete-modal";
import StopModal from "../action/stop-modal";

// 网关虚拟机的启用/停用/删除底层复用标准 VM API，
// 后端通过 UUID 操作不区分子类型，GatewayVmInstance 继承自 VmInstance
const startVmInstance = gql`
  mutation startVmInstance($input: StartVmInstanceInput!) {
    startVmInstance(input: $input) {
      actionId
    }
  }
`;

interface GatewayVmPowerActionOptions {
  onFinish?: () => void;
}

export const useGatewayVmPowerActionOptions = ({
  onFinish,
}: GatewayVmPowerActionOptions = {}) => {
  const intl = useIntl();
  const doAction = useAction();

  return useMemo<IOption<Item>>(
    () => [
      {
        key: "enabled",
        validators: [
          (current: Item) => current?.state === VmInstanceState.Stopped,
        ],
        tooltip: () => {
          return intl.formatMessage({
            id: "gateway.vm.action.enable.tooltip",
            defaultMessage: "Only migration services in the Disabled state can be enabled.",
          });
        },
        onClick: ({ selectedList, setSelectedList }) => {
          const payload = selectedList.map((item) => ({
            uuid: item.uuid,
          }));
          doAction({
            mutation: startVmInstance,
            payload,
            name: intl.formatMessage({
              id: "gateway.vm.action.enable",
              defaultMessage: "Enable Migration Service",
            }),
            total: selectedList.length,
            type: "VmInstance",
            middleState: {
              type: "VmInstance",
              field: "state",
              data: { state: VmInstanceState.Starting },
              uuids: selectedList.map((item) => item.uuid),
            },
            onFinish: () => {
              setSelectedList?.([]);
              onFinish?.();
            },
          });
        },
      },
      {
        key: "disable",
        validators: [
          (current: Item) => current?.state === VmInstanceState.Running,
        ],
        tooltip: () => {
          return intl.formatMessage({
            id: "gateway.vm.action.disable.tooltip",
            defaultMessage: "Only migration services in the Enabled state can be disabled.",
          });
        },
        ActionWrapper: StopModal,
      },
    ],
    [intl, doAction, onFinish],
  );
};

export default () => {
  const intl = useIntl();
  const powerOptions = useGatewayVmPowerActionOptions();

  const options = useMemo<IOption<Item>>(
    () => [
      ...powerOptions,
      {
        key: "delete",
        validators: [
          (current: Item) => current?.state === VmInstanceState.Stopped,
        ],
        tooltip: () => {
          return intl.formatMessage({
            id: "gateway.vm.action.delete.tooltip",
            defaultMessage: "Only migration services in the Disabled state can be deleted.",
          });
        },
        ActionWrapper: DeleteModal,
      },
    ],
    [intl, powerOptions],
  );

  return useActionConfig(options);
};
