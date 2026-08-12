import { useQuery } from "@apollo/client";
import { useTime } from "@zstack/hooks";
import { vgpuDeviceList } from "@zstack/virtualization-resource/src/gql/vgpu-device.gql";
import { Constant, ResourceName } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { Illustration } from "@zstack/zsphere-illustration";
import { Op, LeftNavType } from "@zstack/zsphere-types";
import type {
  VGpuDevice as IVGpuDevice,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export const useVGpuList: any = (vm: IVM) => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const { data, refetch } = useQuery(vgpuDeviceList, {
    variables: {
      conditions: [
        { key: "vmInstanceUuid", op: Op.eq, value: vm.uuid },
        {
          key: "type",
          op: Op.in,
          values: ["GPU_Video_Controller", "GPU_3D_Controller"],
        },
      ],
    },
  });

  const list = useMemo(() => {
    if (!data?.vgpuDeviceList?.list?.length) {
      return [];
    }

    return data?.vgpuDeviceList?.list.map(
      (vgpu: IVGpuDevice, index: number) => {
        return {
          label: (
            <>
              <Illustration type="gpu" size={16} />
              {intl.formatMessage({ id: "GPU", defaultMessage: "GPU" })}{" "}
              {index + 1}
            </>
          ),
          value: <ResourceName value={vgpu.name} />,
          children: [
            {
              label: intl.formatMessage({
                id: "gpu.name",
                defaultMessage: "GPU Name",
              }),
              value: <ResourceName value={vgpu.name} />,
            },
            {
              label: intl.formatMessage({
                id: "attach.type",
                defaultMessage: "Attach Mode",
              }),
              value: "vGPU",
            },
            {
              label: intl.formatMessage({
                id: "gpu-device.pciDeviceSpec",
                defaultMessage: "Specification",
              }),
              value: <ResourceName value={vgpu?.specInfo?.name} />,
            },
            {
              label: intl.formatMessage({ id: "host", defaultMessage: "Host" }),
              value: (
                <ResourceName
                  value={vgpu.host?.name}
                  link={{
                    uuid: vgpu.host?.uuid,
                    to: "/host",
                    leftnav: LeftNavType.ClusterHost,
                    microAppName: "virtualization-resource",
                  }}
                />
              ),
            },
            {
              label: intl.formatMessage({
                id: "pgpu",
                defaultMessage: "pGPU",
              }),
              value: <ResourceName value={vgpu.parent?.name} />,
            },
            {
              label: intl.formatMessage({
                id: "enable.state",
                defaultMessage: "State",
              }),
              value: <Constant value={vgpu.state as unknown as ConstantEnum} />,
            },
            {
              label: intl.formatMessage({
                id: "gpu-device.readyStatus",
                defaultMessage: "Status",
              }),
              value: (
                <Constant value={vgpu.status as unknown as ConstantEnum} />
              ),
            },
            {
              label: intl.formatMessage({
                id: "create.date",
                defaultMessage: "Creation Time",
              }),
              value: getServerTime(vgpu.createDate ?? -1).format(
                "YYYY-MM-DD HH:mm:ss",
              ),
            },
          ],
        };
      },
    );
  }, [data, getServerTime]);

  return [list, refetch];
};
