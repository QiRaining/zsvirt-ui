import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/pci-device";
import { useAction } from "@zstack/zsphere-hooks";
import { PciDevicePassThroughState } from "@zstack/zsphere-types";
import type {
  PciDevice as IPciDevice,
  HostVO,
} from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import {
  verifyPassthrough,
  verifyEnabled,
  verifyDisabled,
} from "../action/validator";

const updatePciDevice = gql`
  mutation updatePciDevice($input: UpdatePciDeviceInput!) {
    updatePciDevice(input: $input) {
      actionId
    }
  }
`;

export interface IProps {
  setAlert: (alert: { visible: boolean; message: string }) => void;
}

export default ({ setAlert }: IProps) => {
  const intl = useIntl();
  const doAction = useAction();
  const actionConfig = useActionConfig<IPciDevice>([
    // 集群
    {
      key: "cluster.pcidevice.enable",
      validators: [verifyEnabled],
      ActionWrapper: require("../action/start-modal").default,
    },
    {
      key: "cluster.pcidevice.disable",
      validators: [verifyDisabled],
      ActionWrapper: require("../action/stop-modal").default,
    },
    // 物理机
    {
      key: "host.pcidevice.enable",
      validators: [verifyEnabled],
      ActionWrapper: require("../action/start-modal").default,
    },
    {
      key: "host.pcidevice.disable",
      validators: [verifyDisabled],
      ActionWrapper: require("../action/stop-modal").default,
    },
    {
      key: "virtualization.toggle.passthrough",
      validators: [verifyPassthrough],
      notSupportedModal: {
        title: intl.formatMessage({
          id: "pcie.device.cannot.toggle.passthrough",
          defaultMessage: "Cannot Toggle Passthrough",
        }),
        getItemName: (current) => {
          return current.name.split("_").slice(1, -1).join("_");
        },
      },
      onClick: ({ selectedList, source }) => {
        const hostIommu = (source as HostVO)?.hostIommu;
        if (hostIommu?.state !== "Enabled" || hostIommu?.status !== "Active") {
          setAlert({
            visible: true,
            message: intl.formatMessage({
              id: "pci.device.iommu.not.enabled.alert.message",
              defaultMessage:
                "To enable passthrough for PCIe devices, make sure IOMMU is enabled and available. Please check and try again.",
            }),
          });
          return;
        }
        if (selectedList.some((item) => !!item.vmInstanceUuid)) {
          setAlert({
            visible: true,
            message: intl.formatMessage({
              id: "pci.device.vm.attached.alert.message",
              defaultMessage:
                "PCIe device is already attached to a virtual machine. Detach the virtual machine and try again.",
            }),
          });
          return;
        }
        doAction({
          mutation: updatePciDevice,
          payload: selectedList.map((item) => ({
            uuid: item.uuid,
            passThroughState:
              item.passThroughState === PciDevicePassThroughState.Available
                ? PciDevicePassThroughState.Enabled
                : PciDevicePassThroughState.Available,
          })),
          name: intl.formatMessage({
            id: "toggle.passthrough",
            defaultMessage: "Toggle Passthrough",
          }),
          total: selectedList.length,
          type: "PciDevice",
        });
      },
    },
  ]);
  return {
    ...actionConfig,
    getItemName: (item: any) => item.name?.split("_").slice(1, -1).join("_"),
  };
};
