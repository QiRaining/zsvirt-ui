import { useQuery } from "@apollo/client";
import { cdromList } from "@zstack/virtualization-resource/src/gql/cdrom.gql";
import { gpuDeviceList } from "@zstack/virtualization-resource/src/gql/gpu-device.gql";
import { scsiLunListForZSVInstanceOverView as _scsiLunList } from "@zstack/virtualization-resource/src/gql/scsi-lun.gql";
import { usbsDeviceList } from "@zstack/virtualization-resource/src/gql/usb.gql";
import { vgpuDeviceList } from "@zstack/virtualization-resource/src/gql/vgpu-device.gql";
import { queryVmNicList } from "@zstack/virtualization-resource/src/gql/vm-nic.gql";
import { volumeList } from "@zstack/virtualization-resource/src/gql/volume.gql";
import { Op, VolumeQueryType } from "@zstack/zsphere-types";
import type {
  VolumeList,
  VmNicListResp,
  PciDeviceList,
  VGpuDeviceList,
  UsbDeviceQueryResp,
  CdRomsQueryResp,
} from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import { useMemo } from "react";

const useQueryReleatedResource = (vmUuid: string) => {
  const { data: volumeData, loading: volumeLoading } = useQuery<{
    volumeList: VolumeList;
  }>(volumeList, {
    variables: {
      type: VolumeQueryType.GET_VOLUME_BY_VMINSTANCE_UUID,
      extraConditions: [{ key: "vmInstanceUuid", op: Op.eq, value: vmUuid }],
      vmInstanceUuid: vmUuid,
      limit: 100,
    },
  });

  const { data: lunData, loading: lunDataLaoding } = useQuery(_scsiLunList, {
    variables: {
      conditions: [
        {
          key: "scsiLunVmInstanceRef.vmInstanceUuid",
          op: Op.eq,
          value: vmUuid,
        },
      ],
      limit: 100,
    },
  });

  const { data: nicData, loading: nicLoading } = useQuery<{
    vmNicList: VmNicListResp;
  }>(queryVmNicList, {
    variables: {
      conditions: [{ key: "vmInstance.uuid", op: Op.eq, value: vmUuid }],
    },
    fetchPolicy: "no-cache",
  });

  const { data: gpuData, loading: gpuLoading } = useQuery<{
    pciDeviceList: PciDeviceList;
  }>(gpuDeviceList, {
    variables: {
      type: "gpu",
      conditions: [{ key: "vmInstanceUuid", op: Op.eq, value: vmUuid }],
    },
  });

  const { data: vgpuData, loading: vgpuLoading } = useQuery<{
    vgpuDeviceList: VGpuDeviceList;
  }>(vgpuDeviceList, {
    variables: {
      conditions: [
        { key: "vmInstanceUuid", op: Op.eq, value: vmUuid },
        {
          key: "type",
          op: Op.in,
          values: ["GPU_Video_Controller", "GPU_3D_Controller"],
        },
      ],
    },
  });

  const { data: usbData, loading: usbLoading } = useQuery<{
    usbsDeviceList: UsbDeviceQueryResp;
  }>(usbsDeviceList, {
    variables: {
      conditions: [{ key: "vmInstanceUuid", op: Op.eq, value: vmUuid }],
    },
  });

  const { data: cdromData, loading: cdromLoading } = useQuery<{
    cdromList: CdRomsQueryResp;
  }>(cdromList, {
    variables: {
      conditions: [{ key: "vmInstanceUuid", op: Op.eq, value: vmUuid }],
    },
  });

  const result = useMemo(() => {
    if (
      volumeLoading ||
      lunDataLaoding ||
      cdromLoading ||
      nicLoading ||
      gpuLoading ||
      vgpuLoading ||
      usbLoading
    ) {
      return {
        volumeList: [],
        nicList: [],
        gpuList: [],
        usbList: [],
        cdromList: [],
      };
    }

    const lunDataList = lunData?.scsiLunList?.list ?? [];
    const volumeList = volumeData?.volumeList?.list ?? [];
    const formatedVolumeData = volumeList.map((t: any) => {
      return {
        ...t,
        diskType: "volume",
      };
    });

    const formatedLunData = lunDataList.map((t: any) => {
      return {
        ...t,
        lastAttachDate: t.scsiLunVmInstanceRefs.filter(
          (t: any) => t.vmInstanceUuid === vmUuid,
        )?.lastOpDate,
        deviceId: t.scsiLunVmInstanceRefs.filter(
          (t: any) => t.vmInstanceUuid === vmUuid,
        )?.deviceId,
        diskType: "rdm",
      };
    });

    const formatedDiskData = formatedVolumeData.concat(formatedLunData);

    return {
      volumeList: _.sortBy(formatedDiskData, [
        (volume) => new Date(volume.lastAttachDate!).valueOf(),
        "deviceId",
      ]),
      nicList: _.sortBy(nicData?.vmNicList?.list ?? [], "deviceId"),
      gpuList: (gpuData?.pciDeviceList?.list ?? []).concat(
        vgpuData?.vgpuDeviceList?.list ?? ([] as any[]),
      ),
      usbList: usbData?.usbsDeviceList?.list ?? [],
      cdromList: _.sortBy(cdromData?.cdromList?.list ?? [], "deviceId"),
    };
  }, [
    volumeLoading,
    cdromLoading,
    nicLoading,
    gpuLoading,
    vgpuLoading,
    usbLoading,
    volumeData,
    nicData,
    gpuData,
    vgpuData,
    usbData,
    cdromData,
  ]);

  return result;
};

export { useQueryReleatedResource };
