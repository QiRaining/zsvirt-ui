import type {
  IBusinessMonitorTimeRefs,
  IDraggableCardProps,
  IResponsiveDndCardsLayout,
} from "@zstack/zsphere-components";
import {
  BusinessMonitor,
  ResponsiveDndCardsLayout,
  useIsCurrentTab,
  useMonitorItems,
} from "@zstack/zsphere-components";
import { GetMetricDataQueryType, ProfileType } from "@zstack/zsphere-types";
import { useMount, useUpdateEffect } from "ahooks";
import { filter, includes, isEmpty, map, reduce } from "lodash-es";
import type { FC } from "react";
import React, { useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";

import CPUCard from "./cpu-card";
import DiskCapacityCard from "./disk-capacity-card";
import DiskCard from "./disk-card";
import BlockDeviceCard from "./lun-card";
import MemoryCard from "./memory-card";
import NetworkCard from "./network-card";

import style from "./style.module.less";

const { MonitorItems, MonitorTime, MonitorProvider } = BusinessMonitor;

interface IProps {
  uuid: string;
}

const Monitoring: FC<IProps> = ({ uuid }) => {
  const intl = useIntl();
  const [timeDisabled, setTimeDisabled] = useState<boolean>(false);

  const resourceType = "virtualization-resource-host";
  const defaultMonitorItems = [
    "CPUUsedUtilization",
    "MemoryUsedBytes",
    "DiskReadBytes",
    "DiskReadOps",
    "DiskLatency",
    "DiskAllUsedCapacityInPercent",
    "NetworkOutBytes",
    "NetworkOutPackets",
    "NetworkOutErrors",
  ];
  const {
    getMonitorItems,
    loadingMonitorItems,
    monitorItems,
    refetchMonitorItems,
  } = useMonitorItems(resourceType, defaultMonitorItems);

  const timeRef = useRef<IBusinessMonitorTimeRefs>(null);
  const equal = useIsCurrentTab("main-tab", "monitoring");

  useUpdateEffect(() => {
    if (equal) {
      timeRef.current?.refresh();
      timeRef.current?.startInterval();
    } else {
      timeRef.current?.stopInterval();
    }
    setTimeDisabled(!equal);
  }, [equal]);

  useMount(() => {
    getMonitorItems();
  });

  const monitorItemOptions: any[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "cpu.monitor",
          defaultMessage: "CPU Monitoring",
        }),
        value: "cpu",
        options: [
          {
            label: intl.formatMessage({
              id: "CPUUsedUtilization",
              defaultMessage: "CPU Utilization",
            }),
            value: "CPUUsedUtilization",
          },
          {
            label: intl.formatMessage({
              id: "CPUIdleUtilization",
              defaultMessage: "CPU Idle Rate",
            }),
            value: "CPUIdleUtilization",
          },
          {
            label: intl.formatMessage({
              id: "CPUSystemUtilization",
              defaultMessage: "CPU Occupancy Rate (System Process)",
            }),
            value: "CPUSystemUtilization",
          },
          {
            label: intl.formatMessage({
              id: "CPUUserUtilization",
              defaultMessage: "CPU Occupancy Rate (User Process)",
            }),
            value: "CPUUserUtilization",
          },
          {
            label: intl.formatMessage({
              id: "CPUWaitUtilization",
              defaultMessage: "CPU Occupancy Rate Average (Waiting)",
            }),
            value: "CPUWaitUtilization",
          },
        ],
      },
      {
        label: intl.formatMessage({
          id: "memory.monitor",
          defaultMessage: "Memory Monitoring",
        }),
        value: "memory",
        options: [
          {
            label: intl.formatMessage({
              id: "MemoryUsedBytes",
              defaultMessage: "Memory Usage",
            }),
            value: "MemoryUsedBytes",
          },
        ],
      },
      {
        label: intl.formatMessage({
          id: "disk.monitor",
          defaultMessage: "Disk Monitoring",
        }),
        value: "disk",
        options: [
          {
            label: intl.formatMessage({
              id: "disk.speed",
              defaultMessage: "Disk Speed",
            }),
            value: "DiskReadBytes",
          },
          {
            label: intl.formatMessage({
              id: "disk.iops",
              defaultMessage: "Disk IOPS",
            }),
            value: "DiskReadOps",
          },
          {
            label: intl.formatMessage({
              id: "hard.disk.latency",
              defaultMessage: "Disk Latency",
            }),
            value: "DiskLatency",
          },
        ],
      },
      {
        label: intl.formatMessage({
          id: "diskCapacity.monitor",
          defaultMessage: "Disk Capacity Monitoring",
        }),
        value: "diskCapacity",
        options: [
          {
            label: intl.formatMessage({
              id: "DiskAllUsedCapacityInPercent",
              defaultMessage: "Total Disk Usage Ratio",
            }),
            value: "DiskAllUsedCapacityInPercent",
          },
          {
            label: intl.formatMessage({
              id: "DiskAllUsedCapacityInBytes",
              defaultMessage: "Total Disk Usage",
            }),
            value: "DiskAllUsedCapacityInBytes",
          },
          {
            label: intl.formatMessage({
              id: "DiskZStackUsedCapacityInPercent",
              defaultMessage: "Disk Usage Ratio of Platform System Files",
            }),
            value: "DiskZStackUsedCapacityInPercent",
          },
          {
            label: intl.formatMessage({
              id: "DiskZStackUsedCapacityInBytes",
              defaultMessage: "Disk Usage of Platform System Files",
            }),
            value: "DiskZStackUsedCapacityInBytes",
          },
        ],
      },
      {
        label: intl.formatMessage({
          id: "block.device.monitor",
          defaultMessage: "LUN Monitoring",
        }),
        value: "lun",
        options: [
          {
            label: intl.formatMessage({
              id: "block.device.speed",
              defaultMessage: "LUN Speed",
            }),
            value: "LunSpeed",
          },
          {
            label: intl.formatMessage({
              id: "block.device.iops",
              defaultMessage: "LUN IOPS",
            }),
            value: "LunIops",
          },
          {
            label: intl.formatMessage({
              id: "block.device.latency",
              defaultMessage: "LUN Latency",
            }),
            value: "LunLatency",
          },
        ],
      },
      {
        label: intl.formatMessage({
          id: "network.monitor",
          defaultMessage: "NIC Monitoring",
        }),
        value: "network",
        options: [
          {
            label: intl.formatMessage({
              id: "network.bytes.speed",
              defaultMessage: "NIC Data Transfer Rate",
            }),
            value: "NetworkOutBytes",
          },
          {
            label: intl.formatMessage({
              id: "network.packets.speed",
              defaultMessage: "NIC Packet Rate",
            }),
            value: "NetworkOutPackets",
          },
          {
            label: intl.formatMessage({
              id: "network.error.speed",
              defaultMessage: "NIC Packet Discard Rate",
            }),
            value: "NetworkOutErrors",
          },
        ],
      },
    ],
    [intl],
  );

  const dataSet = useMemo(() => {
    const monitorProps = {
      uuid,
      namespace: "ZStack/Host",
      resourceType: GetMetricDataQueryType.Host,
      resourceKey: "HostUuid",
    };
    return reduce(
      monitorItemOptions,
      (prev, cur, index) => {
        const curKey = cur.value;
        const curOptions = filter(cur.options, (option) =>
          includes(monitorItems, option.value),
        );
        const monitorKeys = map(curOptions, "value");
        if (!isEmpty(monitorKeys)) {
          prev[curKey] = {
            resourceKey: curKey,
            x: 0,
            y: index,
            node: (cardProps: IDraggableCardProps) => {
              const resourceProps = {
                monitorKeys,
                monitorProps,
                cardProps,
              };
              switch (curKey) {
                case "cpu":
                  return <CPUCard {...resourceProps} />;
                case "memory":
                  return <MemoryCard {...resourceProps} />;
                case "disk":
                  return <DiskCard {...resourceProps} />;
                case "diskCapacity":
                  return <DiskCapacityCard {...resourceProps} />;
                case "lun":
                  return <BlockDeviceCard {...cardProps} uuid={uuid} />;
                case "network":
                  return <NetworkCard {...resourceProps} />;
                default:
                  return <></>;
              }
            },
          };
        }
        return prev;
      },
      {} as IResponsiveDndCardsLayout["dataSet"],
    );
  }, [monitorItemOptions, monitorItems, uuid]);

  return (
    <div>
      <div className={`flex justify-between ${style["action-bar"]}`}>
        <div>
          <MonitorTime ref={timeRef} disabled={timeDisabled} />
        </div>
        <div>
          <MonitorItems
            options={monitorItemOptions}
            resourceType={resourceType}
            initialValue={monitorItems}
            defaultValue={defaultMonitorItems}
            onSave={refetchMonitorItems}
          />
        </div>
      </div>
      <MonitorProvider>
        <ResponsiveDndCardsLayout
          profileType={ProfileType.MonitoringLayoutConfig}
          resourceType={resourceType}
          cols={1}
          dataSet={dataSet}
          loading={loadingMonitorItems}
        />
      </MonitorProvider>
    </div>
  );
};

export default React.memo(Monitoring);
