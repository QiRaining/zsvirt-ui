import { useQuery } from "@apollo/client";
import { hostCpuGHz } from "@zstack/virtualization-resource/src/gql/host.gql";
import { List } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useIntl } from "react-intl";

import { useCdRomList } from "./use-cdrom-list";
import { useCpuMemoryList } from "./use-cpu-mem-list";
import { useGpuList } from "./use-gpu-list";
import { useVmNicList } from "./use-nic-list";
import { useOtherDeviceList } from "./use-other-device-list";
import { usePcieList } from "./use-pcie-list";
import { useTpmList } from "./use-tpm-list";
import { useUsbList } from "./use-usb-list";
import { useVGpuList } from "./use-vgpu-list";
import { useVolumeList } from "./use-volume-list";

interface IProps {
  detail: IVM;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  resourceConfig: any;
  resourceConfigLoading?: boolean;
  setEditConfigVisible: (visible: boolean) => void;
}

const VmHardware: React.FC<IProps> = ({
  setEditConfigVisible,
  detail,
  onCollapseChange,
  collapsed = false,
  resourceConfig,
  resourceConfigLoading,
}) => {
  const intl = useIntl();

  const { data: hostCpuGHzData } = useQuery(hostCpuGHz, {
    variables: {
      uuid: detail?.host?.uuid || detail?.lastHost?.uuid,
    },
  });

  const cpuMemoryList = useCpuMemoryList(
    detail,
    resourceConfig,
    hostCpuGHzData,
    resourceConfigLoading,
  );
  const [nicList, refetchNic] = useVmNicList(detail, resourceConfig);
  const [volumeList, refetchVolume] = useVolumeList(detail);
  const [gpuList, refetchGpu] = useGpuList(detail);
  const [vgpuList, refetchVgpu] = useVGpuList(detail);
  const [usbList, refetchUsb] = useUsbList(detail);
  const [pcieList, refetchPcie] = usePcieList(detail);
  const [cdRomList, refetchCdrom] = useCdRomList(detail);
  const otherDeviceList = useOtherDeviceList(detail, resourceConfig);
  const tpmList = useTpmList(detail);

  const list = useMemo(() => {
    return [
      ...cpuMemoryList,
      ...volumeList,
      ...nicList,
      ...cdRomList,
      ...gpuList,
      ...vgpuList,
      ...usbList,
      ...pcieList,
      ...tpmList,
      ...otherDeviceList,
    ];
  }, [
    cpuMemoryList,
    volumeList,
    nicList,
    gpuList,
    vgpuList,
    usbList,
    cdRomList,
    pcieList,
    tpmList,
    otherDeviceList,
  ]);

  const refetchNicTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refetchNicWithDelay = useCallback(() => {
    if (refetchNicTimerRef.current) {
      clearTimeout(refetchNicTimerRef.current);
    }
    refetchNicTimerRef.current = setTimeout(() => {
      refetchNic();
      refetchNicTimerRef.current = null;
    }, 1000);
  }, [refetchNic]);

  useEffect(() => {
    refetchNicWithDelay();
    return () => {
      if (refetchNicTimerRef.current) {
        clearTimeout(refetchNicTimerRef.current);
      }
    };
  }, [refetchNicWithDelay]);

  useActionSubscribe({
    resourceTypeList: ["VmInstance"],
    onFinish: () => {
      refetchVolume();
      refetchGpu();
      refetchVgpu();
      refetchUsb();
      refetchPcie();
      refetchCdrom();
      refetchNicWithDelay();
    },
  });

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "virtualization.vm.hardware",
        defaultMessage: "VM Hardware",
      })}
      collapsed={collapsed}
      onCollapseChange={onCollapseChange}
      titleActions={[
        {
          icon: "edit",
          tooltip: intl.formatMessage({
            id: "edit.config",
            defaultMessage: "Modify Configuration",
          }),
          authKey: "virtualization.edit.config",
          resource: "vm",
          onClick: () => setEditConfigVisible(true),
        },
      ]}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default VmHardware;
