import { gql, useQuery } from "@apollo/client";
import { InfoPopover } from "@zstack/design";
import NetworkCard from "@zstack/virtualization-resource/src/pages/host/detail/monitoring/network-card";
import type {
  IBusinessMonitorTimeRefs,
  IDraggableCardProps,
  ILayoutItem,
  ISelectOption,
} from "@zstack/zsphere-components";
import {
  BusinessMonitor,
  ResponsiveDndCardsLayout,
  useIsCurrentTab,
  useMonitorItems,
} from "@zstack/zsphere-components";
import { GetMetricDataQueryType, ProfileType } from "@zstack/zsphere-types";
import { useMount } from "ahooks";
import { reduce, filter, includes, map, isEmpty } from "lodash-es";
import React, { useMemo, useRef, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import CPUCard from "./cpu-card";
import DiskPerformanceCard from "./disk-performance-card";
import DiskUsageCard from "./disk-usage-card";
import MemoryCard from "./memory-card";

import style from "./style.module.less";

const queryGuestToolsState = gql`
  query queryGuestToolsState($vmInstanceUuid: String!) {
    queryGuestToolsState(vmInstanceUuid: $vmInstanceUuid) {
      zwatchState
    }
  }
`;

const { MonitorItems, MonitorTime, MonitorProvider } = BusinessMonitor;
interface IProps {
  uuid: string;
}

const Monitoring: React.FC<IProps> = ({ uuid }) => {
  const intl = useIntl();

  const { data, refetch } = useQuery(queryGuestToolsState, {
    variables: { vmInstanceUuid: uuid },
    fetchPolicy: "no-cache",
  });

  const zwatchState = data?.queryGuestToolsState?.zwatchState;

  const resourceType = "virtualization-resource-vm";
  const defaultMonitorItems = [
    "CPUUsedUtilization",
    "NetworkOutBytes",
    "NetworkOutPackets",
    "NetworkOutErrors",
    "MemoryUsedBytes",
    "DiskReadBytes",
    "DiskReadOps",
  ];
  const {
    getMonitorItems,
    loadingMonitorItems,
    monitorItems,
    refetchMonitorItems,
  } = useMonitorItems(resourceType, defaultMonitorItems);

  const timeRef = useRef<IBusinessMonitorTimeRefs>(null);
  const equal = useIsCurrentTab("main-tab", "monitoring");

  useEffect(() => {
    if (equal) {
      timeRef.current?.refresh();
      timeRef.current?.startInterval();
    } else {
      timeRef.current?.stopInterval();
    }
  }, [equal]);

  useMount(() => {
    getMonitorItems();
  });

  const monitorItemOptions: ISelectOption<string>[] = useMemo(
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
            value: "OperatingSystemCPUIdleUtilization",
          },
          {
            label: intl.formatMessage({
              id: "CPUSystemUtilization",
              defaultMessage: "CPU Occupancy Rate (System Process)",
            }),
            value: "OperatingSystemCPUSystemUtilization",
          },
          {
            label: intl.formatMessage({
              id: "CPUUserUtilization",
              defaultMessage: "CPU Occupancy Rate (User Process)",
            }),
            value: "OperatingSystemCPUUserUtilization",
          },
          {
            label: intl.formatMessage({
              id: "CPUWaitUtilization",
              defaultMessage: "CPU Occupancy Rate Average (Waiting)",
            }),
            value: "OperatingSystemCPUWaitUtilization",
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
          {
            label: intl.formatMessage({
              id: "MemoryAvailableBytes",
              defaultMessage: "Available Memory Capacity",
            }),
            value: "OperatingSystemMemoryAvailableBytes",
          },
          {
            label: intl.formatMessage({
              id: "MemoryFreeBytes",
              defaultMessage: "Free Memory Capacity",
            }),
            value: "MemoryFreeBytes",
          },
          {
            label: intl.formatMessage({
              id: "MemoryTotalBytes",
              defaultMessage: "Total Memory Capacity",
            }),
            value: "OperatingSystemMemoryTotalBytes",
          },
          {
            label: intl.formatMessage({
              id: "MemoryFreePercent",
              defaultMessage: "Memory Idle Rate",
            }),
            value: "OperatingSystemMemoryFreePercent",
          },
          {
            label: intl.formatMessage({
              id: "MemoryUsedPercent",
              defaultMessage: "Memory Utilization",
            }),
            value: "OperatingSystemMemoryUsedPercent",
          },
        ],
      },
      {
        label: intl.formatMessage({
          id: "disk.performance",
          defaultMessage: "Disk Performance",
        }),
        value: "disk.performance",
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
        ],
      },
      {
        label: intl.formatMessage({
          id: "disk.usage.amount",
          defaultMessage: "Disk usage",
        }),
        value: "disk.usage",
        options: [
          {
            label: intl.formatMessage({
              id: "DiskUsedCapacityInPercent",
              defaultMessage: "Disk Utilization",
            }),
            value: "DiskUsedCapacityInPercent",
          },
          {
            label: intl.formatMessage({
              id: "DiskFreeCapacityInPercent",
              defaultMessage: "Disk Idle Rate",
            }),
            value: "DiskFreeCapacityInPercent",
          },
          {
            label: intl.formatMessage({
              id: "DiskUsedCapacityInBytes",
              defaultMessage: "Disk Used Capacity",
            }),
            value: "DiskUsedCapacityInBytes",
          },
          {
            label: intl.formatMessage({
              id: "DiskFreeCapacityInBytes",
              defaultMessage: "Disk Idle Capacity",
            }),
            value: "DiskFreeCapacityInBytes",
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
      namespace: "ZStack/VM",
      resourceType: GetMetricDataQueryType.VmInstance,
      resourceKey: "VMUuid",
    };
    return reduce(
      monitorItemOptions,
      (prev, cur, index) => {
        const curKey = cur.value;
        const curOptions = filter(cur.options, (option) =>
          includes(monitorItems, option.value),
        );
        const monitorKeys = map(curOptions, "value") as string[];
        if (!isEmpty(monitorKeys)) {
          prev[curKey] = {
            resourceKey: curKey,
            x: 0,
            y: index,
            node: (cardProps: IDraggableCardProps) => {
              const resourceProps = {
                zwatchState,
                monitorKeys,
                monitorProps,
                cardProps,
              };
              switch (curKey) {
                case "cpu":
                  return <CPUCard {...resourceProps} />;
                case "memory":
                  return <MemoryCard {...resourceProps} />;
                case "disk.performance":
                  return <DiskPerformanceCard {...resourceProps} />;
                case "disk.usage":
                  return <DiskUsageCard {...resourceProps} />;
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
      {} as Record<string, ILayoutItem>,
    );
  }, [monitorItemOptions, monitorItems, uuid, zwatchState]);

  return (
    <div>
      <div
        className={`${style["action-bar"]} flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <MonitorTime ref={timeRef} onInterval={refetch} />
          <InfoPopover
            content={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "vm.monitor.info",
                  defaultMessage: `### Monitoring

1. Basic Monitoring: Uses Libvirt to obtain monitoring data of VMs from the host.
2. Advanced Monitoring: The agent in the VMTools helps obtain monitoring data from the VM. You need to install the agent on a VM before you can use the advanced monitoring feature.

It is recommended to install VMTools on VMs to obtain more accurate monitoring data.`,
                })}
              </ReactMarkdown>
            }
          />
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

export default Monitoring;
