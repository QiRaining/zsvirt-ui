import { useQuery } from "@apollo/client";
import { cdromList } from "@zstack/virtualization-resource/src/gql/cdrom.gql";
import { volumeListForEditVM } from "@zstack/virtualization-resource/src/gql/disk.gql";
import { gpuDeviceList } from "@zstack/virtualization-resource/src/gql/gpu-device.gql";
import { scsiLunListForZSVInstanceOverView as _scsiLunList } from "@zstack/virtualization-resource/src/gql/scsi-lun.gql";
import { usbsDeviceList } from "@zstack/virtualization-resource/src/gql/usb.gql";
import { vgpuDeviceList } from "@zstack/virtualization-resource/src/gql/vgpu-device.gql";
import { queryVmDns } from "@zstack/virtualization-resource/src/gql/vm-dns.gql";
import { queryVmNicList } from "@zstack/virtualization-resource/src/gql/vm-nic.gql";
import { vmInstance } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { Op, VolumeQueryType } from "@zstack/zsphere-types";
import type {
  CdRomsQueryResp,
  VmInstance as IVM,
  PciDeviceList,
  UsbDeviceQueryResp,
  VGpuDeviceList,
  VmNicListResp,
  VolumeList,
} from "@zstack/zsphere-types/graphql";
import { sortVmNics } from "@zstack/zsphere-utils";
import _ from "lodash-es";
import { useMemo } from "react";

const useQueryReleatedResource = (
  source: any,
  vmTemplateUuidFromForm: string,
  defaultL3NetworkUuid?: string,
) => {
  const vmUuid =
    source?.__typename === "VmTemplate" ? source.uuid : vmTemplateUuidFromForm;

  //还需要查询VM，来填入cpu和mem
  const { data: vmData, loading: vmLoading } = useQuery<{ vmInstance: IVM }>(
    vmInstance,
    {
      variables: { uuid: vmUuid },
    },
  );

  const { data: volumeData, loading: volumeLoading } = useQuery<{
    volumeList: VolumeList;
  }>(volumeListForEditVM, {
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

  const { data: dnsData, loading: dnsLoading } = useQuery(queryVmDns, {
    variables: {
      conditions: [{ key: "vmInstanceUuid", op: Op.eq, value: vmUuid }],
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

  const { data: pcieData, loading: pcieLoading } = useQuery<{
    pciDeviceList: PciDeviceList;
  }>(gpuDeviceList, {
    variables: {
      type: "pci",
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
      dnsLoading ||
      gpuLoading ||
      vgpuLoading ||
      pcieLoading ||
      usbLoading ||
      vmLoading
    ) {
      return {
        vmList: [],
        volumeList: [],
        nicList: [],
        dnsList: [],
        gpuList: [],
        usbList: [],
        pcieList: [],
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

    if (vmUuid === "") {
      return;
    }

    return {
      vmList: [vmData?.vmInstance],
      volumeList: _.sortBy(formatedDiskData, [
        (volume) => new Date(volume.lastAttachDate!).valueOf(),
        "deviceId",
      ]),
      nicList: sortVmNics(nicData?.vmNicList?.list ?? [], defaultL3NetworkUuid),
      dnsList: dnsData?.queryVmDns?.list ?? [],
      gpuList: (gpuData?.pciDeviceList?.list ?? []).concat(
        vgpuData?.vgpuDeviceList?.list ?? ([] as any[]),
      ),
      pcieList: pcieData?.pciDeviceList?.list ?? [],
      usbList: usbData?.usbsDeviceList?.list ?? [],
      cdromList: _.sortBy(cdromData?.cdromList?.list ?? [], "deviceId"),
    };
  }, [
    vmLoading,
    volumeLoading,
    cdromLoading,
    nicLoading,
    dnsLoading,
    gpuLoading,
    vgpuLoading,
    usbLoading,
    vmData,
    volumeData,
    nicData,
    gpuData,
    vgpuData,
    pcieData,
    usbData,
    cdromData,
  ]);

  return result;
};

export { useQueryReleatedResource };
