import { useQuery } from "@apollo/client";
import { gpuDeviceList } from "@zstack/virtualization-resource/src/gql/gpu-device.gql";
import { Constant, ResourceName } from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { Illustration } from "@zstack/zsphere-illustration";
import { Op } from "@zstack/zsphere-types";
import type {
  PciDevice as IPciDevice,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export const usePcieList = (vm: IVM) => {
  const intl = useIntl();

  const { data, refetch } = useQuery(gpuDeviceList, {
    variables: {
      type: "pci",
      conditions: [{ key: "vmInstanceUuid", op: Op.eq, value: vm.uuid }],
    },
  });

  const list = useMemo(() => {
    if (!data?.pciDeviceList?.list?.length) {
      return [];
    }

    return data.pciDeviceList.list.map((pci: IPciDevice, index: number) => {
      const name = pci.name.split("_").slice(1, -1).join("_");

      return {
        label: (
          <>
            <Illustration type="pcie" size={16} />
            {intl.formatMessage({
              id: "pcie.device",
              defaultMessage: "PCIe Device",
            })}{" "}
            {index + 1}
          </>
        ),
        value: <ResourceName value={name} />,
        children: [
          {
            label: intl.formatMessage({
              id: "pcie.address",
              defaultMessage: "PCIe Address",
            }),
            copyable: true,
            value: pci.pciDeviceAddress,
          },
          {
            label: intl.formatMessage({
              id: "device.name",
              defaultMessage: "Device Name",
            }),
            value: name,
          },
          {
            label: intl.formatMessage({
              id: "passthrough.state",
              defaultMessage: "Passthrough Status",
            }),
            value: (
              <Constant
                enumType={ConstantType.PciePassthroughState}
                value={pci.passThroughState as any}
              />
            ),
          },
          {
            label: intl.formatMessage({ id: "type", defaultMessage: "Type" }),
            value: pci.type?.replace("_", " "),
          },
          {
            label: intl.formatMessage({
              id: "manufacturer",
              defaultMessage: "Manufacturer",
            }),
            value: pci.vendor,
          },
        ],
      };
    });
  }, [intl, data]);

  return [list, refetch];
};
