import { useLazyQuery } from "@apollo/client";
import { hostBlockDevicesList } from "@zstack/virtualization-resource/src/gql/disk.gql";
import { getHostRelatedSummary } from "@zstack/virtualization-resource/src/gql/host.gql";
import { sensorList } from "@zstack/virtualization-resource/src/gql/sensor.gql";
import Luns, {
  NVMeLunSupport,
  ScsiLunSupport,
} from "@zstack/virtualization-resource/src/pages/host/detail/luns";
import USBUList from "@zstack/virtualization-resource/src/pages/usb/list";
import { DetailNavLayout, useAuth } from "@zstack/zsphere-components";
import type { IDetailNavLayoutPage } from "@zstack/zsphere-components/dist/detail-nav-layout/type";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { IActionSubscribe } from "@zstack/zsphere-types";
import type {
  Host as IHost,
  HostRelatedSummary as IHostRelatedSummary,
} from "@zstack/zsphere-types/graphql";
import { add } from "lodash-es";
import type { FC } from "react";
import { useMemo, useRef, useEffect } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";

import GpuList from "./gpu-list";
import CpuList from "./hardware-config/cpu/list";
import DiskDetail from "./hardware-config/disk/detail";
import DiskList from "./hardware-config/disk/list";
import MemoryList from "./hardware-config/memory/list";
import PowerList from "./hardware-config/power/list";
import StorageAdapterList from "./hardware-config/storage-adapter/list";
import SensorDetail from "./hardware-config/temperature-sensor/detail";
import SensorList from "./hardware-config/temperature-sensor/list";
import PcieDevice from "./pcie-device";
import { PhysicalList } from "./physical-list";

const CONTAINER_STYLE = { position: "relative", height: "100%" } as const;

interface IProps {
  current: IHost;
  refetch: () => void;
}

const HardwareDevices: FC<IProps> = ({ current: _current, refetch }) => {
  const intl = useIntl();
  const location = useLocation();
  const { hasAuth } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const current = useMemo(() => {
    return (location.state as any)?.current ?? _current;
  }, [_current, location]);

  const [getHostHardwareCount, { data: hostHardwareCountData }] = useLazyQuery<{
    getHostRelatedSummary: IHostRelatedSummary;
  }>(getHostRelatedSummary, {
    fetchPolicy: "network-only",
  });

  const [getSensorCount, { data: sensorCountData }] = useLazyQuery(sensorList);
  const [getDiskCount, { data: diskCountData }] =
    useLazyQuery(hostBlockDevicesList);

  useEffect(() => {
    if (current?.uuid) {
      getHostHardwareCount({
        variables: {
          uuid: current.uuid,
        },
      });
    }
    getSensorCount({
      variables: {
        conditions: [
          {
            key: "hostUuid",
            value: current.uuid,
          },
        ],
      },
    });
    getDiskCount({
      variables: {
        conditions: [
          {
            key: "hostUuid",
            value: current.uuid,
          },
        ],
      },
    });
  }, [current?.uuid]);

  const summary = useMemo<IHostRelatedSummary>(() => {
    if (hostHardwareCountData) {
      const { getHostRelatedSummary: _summary } = hostHardwareCountData;
      return _summary;
    }
    return {
      storageAdapter: 0,
      memory: 0,
      cpu: 0,
      power: 0,
      sensor: 0,
      hdd: 0,
      vm: 0,
      scsiLun: 0,
      nvmeLun: 0,
      physicalNic: 0,
      gpu: 0,
      vGpu: 0,
      usb: 0,
      pci: 0,
    };
  }, [hostHardwareCountData]);

  useActionSubscribe({
    resourceTypeList: [
      "NVMeLun",
      "ScsiLun",
      "PhysicalList",
      "PciDevice",
      "VGpuDevice",
      "UsbDevice",
      "PciDevice",
      "HostVO",
    ],
    onFinish: () => {
      getHostHardwareCount({
        variables: {
          uuid: current.uuid,
        },
      });
    },
  } as IActionSubscribe);

  const pageList: IDetailNavLayoutPage[] = [
    {
      key: "host.cpu",
      name: intl.formatMessage({ id: "CPU", defaultMessage: "CPU" }),
      page: (
        <CpuList
          title={intl.formatMessage({ id: "CPU", defaultMessage: "CPU" })}
          view="main"
          defaultQuery={{
            conditions: [
              {
                key: "hostUuid",
                value: current.uuid,
              },
            ],
          }}
        />
      ),
      count: summary.cpu,
    },
    {
      key: "host.memory",
      name: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
      page: (
        <MemoryList
          title={intl.formatMessage({ id: "memory", defaultMessage: "Memory" })}
          view="main"
          defaultQuery={{
            conditions: [
              {
                key: "hostUuid",
                value: current.uuid,
              },
            ],
          }}
        />
      ),
      count: summary.memory,
    },
    {
      key: "host.disk",
      name: intl.formatMessage({
        id: "physical.disk",
        defaultMessage: "Physical Disk",
      }),
      page: (
        <DiskList
          title={intl.formatMessage({
            id: "physical.disk",
            defaultMessage: "Physical Disk",
          })}
          view="main"
          defaultQuery={{
            conditions: [
              {
                key: "hostUuid",
                value: current.uuid,
              },
            ],
          }}
          renderRowDetail={(record, visible, onClose) => (
            <DiskDetail
              current={record}
              hostUuid={current.uuid}
              visible={visible}
              onClose={onClose}
              getContainer={() => containerRef.current!}
            />
          )}
        />
      ),
      count: diskCountData?.hostBlockDevicesList?.total ?? 0,
    },
    {
      key: "host.netcard",
      name: intl.formatMessage({
        id: "host.netcard",
        defaultMessage: "Physical NIC",
      }),
      page: (
        <PhysicalList
          source={current}
          getDetailContainer={() => containerRef.current!}
        />
      ),
      count: summary.physicalNic,
    },
    {
      key: "host.gpu",
      name: intl.formatMessage({
        id: "gpu.device",
        defaultMessage: "GPU Device",
      }),
      page: (
        <GpuList
          current={current}
          gpuCount={summary.gpu}
          vGpuCount={summary.vGpu}
        />
      ),
      count: (summary.gpu ?? 0) + (summary.vGpu ?? 0),
    },
    {
      key: "host.storage.adapter",
      name: intl.formatMessage({
        id: "storage.adapter",
        defaultMessage: "Storage Adapter",
      }),
      page: (
        <StorageAdapterList
          title={intl.formatMessage({
            id: "storage.adapter",
            defaultMessage: "Storage Adapter",
          })}
          view="main"
          defaultQuery={{
            conditions: [
              {
                key: "hostUuid",
                value: current.uuid,
              },
            ],
          }}
          source={current}
          getDetailContainer={() => containerRef.current!}
        />
      ),
      count: summary.storageAdapter,
    },
    {
      key: "host.lun",
      name: intl.formatMessage({
        id: "host.lun",
        defaultMessage: "LUN",
      }),
      page: (
        <Luns
          current={current}
          getDetailContainer={() => containerRef.current!}
        />
      ),
      count: add(
        hasAuth(ScsiLunSupport) ? (summary.scsiLun ?? 0) : 0,
        hasAuth(NVMeLunSupport) ? (summary.nvmeLun ?? 0) : 0,
      ),
    },
    {
      key: "host.usb",
      name: intl.formatMessage({
        id: "host.usb",
        defaultMessage: "USB Device",
      }),
      page: (
        <USBUList
          title={intl.formatMessage({
            id: "host.usb",
            defaultMessage: "USB Device",
          })}
          view="sub.host"
          defaultQuery={{
            conditions: [
              {
                key: "hostUuid",
                value: current.uuid,
              },
            ],
            type: "Host",
          }}
        />
      ),
      count: summary.usb,
    },
    {
      key: "host.sensor",
      name: intl.formatMessage({ id: "sensor", defaultMessage: "Sensor" }),
      page: (
        <SensorList
          title={intl.formatMessage({ id: "sensor", defaultMessage: "Sensor" })}
          view="main"
          defaultQuery={{
            conditions: [
              {
                key: "hostUuid",
                value: current.uuid,
              },
            ],
          }}
          renderRowDetail={(record, visible, onClose) => (
            <SensorDetail
              current={record}
              hostUuid={current.uuid}
              visible={visible}
              onClose={onClose}
              getContainer={() => containerRef.current!}
            />
          )}
        />
      ),
      count: sensorCountData?.sensorList?.total ?? 0,
    },
    {
      key: "host.psu",
      name: intl.formatMessage({ id: "power", defaultMessage: "Power" }),
      page: (
        <PowerList
          title={intl.formatMessage({ id: "power", defaultMessage: "Power" })}
          view="main"
          defaultQuery={{
            hostUuid: current.uuid,
          }}
        />
      ),
      count: summary.power,
    },
    {
      key: "host.pcie",
      name: intl.formatMessage({
        id: "pcie.device",
        defaultMessage: "PCIe Device",
      }),
      page: (
        <PcieDevice
          current={current}
          total={summary.pci ?? 0}
          passthroughCount={summary.pciPassthrough ?? 0}
          refetchHost={refetch}
        />
      ),
      count: summary.pci,
    },
  ];
  const nav = (
    <DetailNavLayout
      pageList={pageList}
      cacheConfig={{
        contentId: "host-hardware-divices",
      }}
    />
  );
  return (
    <div style={CONTAINER_STYLE} ref={containerRef}>
      {nav}
    </div>
  );
};

export default HardwareDevices;
