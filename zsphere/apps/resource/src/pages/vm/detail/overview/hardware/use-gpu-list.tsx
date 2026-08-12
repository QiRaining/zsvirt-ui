import { useQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { gpuDeviceList } from "@zstack/virtualization-resource/src/gql/gpu-device.gql";
import { Constant, ResourceName } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { Illustration } from "@zstack/zsphere-illustration";
import { Op, PciDeviceStatus } from "@zstack/zsphere-types";
import type {
  PciDevice as IPciDevice,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export const useGpuList = (vm: IVM) => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const { data, refetch } = useQuery(gpuDeviceList, {
    variables: {
      type: "gpu",
      conditions: [{ key: "vmInstanceUuid", op: Op.eq, value: vm.uuid }],
    },
  });

  const list = useMemo(() => {
    if (!data?.pciDeviceList?.list?.length) {
      return [];
    }

    return data?.pciDeviceList?.list.map((gpu: IPciDevice, index: number) => {
      const status =
        gpu.status === PciDeviceStatus.System
          ? PciDeviceStatus.Active
          : gpu.status;
      return {
        label: (
          <>
            <Illustration type="gpu" size={16} />
            GPU {index + 1}
          </>
        ),
        value: <ResourceName value={gpu.name} />,
        children: [
          {
            label: intl.formatMessage({
              id: "gpu.name",
              defaultMessage: "GPU Name",
            }),
            value: <ResourceName value={gpu.name} />,
          },
          {
            label: intl.formatMessage({
              id: "attach.type",
              defaultMessage: "Attach Mode",
            }),
            value: intl.formatMessage({
              id: "pgpu",
              defaultMessage: "pGPU",
            }),
          },
          {
            label: intl.formatMessage({
              id: "gpuDeviceSpec.manufacturer",
              defaultMessage: "Vendor",
            }),
            value: gpu.vendorId,
          },
          {
            label: intl.formatMessage({
              id: "gpu-device.pciDeviceSpec",
              defaultMessage: "Specification",
            }),
            value: <ResourceName value={gpu.pciDeviceSpec?.name} />,
          },
          {
            label: intl.formatMessage({
              id: "deviceAddress",
              defaultMessage: "Device Address",
            }),
            value: <Text>{gpu.pciDeviceAddress}</Text>,
          },
          {
            label: intl.formatMessage({ id: "host", defaultMessage: "Host" }),
            value: <ResourceName value={gpu.host?.name} />,
          },
          {
            label: intl.formatMessage({
              id: "enable.state",
              defaultMessage: "State",
            }),
            value: <Constant value={gpu.state as unknown as ConstantEnum} />,
          },
          {
            label: intl.formatMessage({
              id: "gpu-device.readyStatus",
              defaultMessage: "Status",
            }),
            value: <Constant value={status as unknown as ConstantEnum} />,
          },
          {
            label: intl.formatMessage({
              id: "create.date",
              defaultMessage: "Creation Time",
            }),
            value: getServerTime(gpu.createDate!).format("YYYY-MM-DD HH:mm:ss"),
          },
        ],
      };
    });
  }, [data, getServerTime]);

  return [list, refetch];
};
