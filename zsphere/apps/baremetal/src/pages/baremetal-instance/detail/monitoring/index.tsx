import { InfoPopover } from "@zstack/design";
import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { useIsCurrentTab, Alert } from "@zstack/zsphere-components";
import type { IBusinessMonitorTimeRefs } from "@zstack/zsphere-components";
import {
  ResponsiveDndCardsLayout,
  BusinessMonitor,
  useMonitorItems,
} from "@zstack/zsphere-components";
import { GetMetricDataQueryType, ProfileType } from "@zstack/zsphere-types";
import { useMount } from "ahooks";
import _ from "lodash-es";
import React, { useRef, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import CPUCard from "./cpu-card";
import DiskPerformanceCard from "./disk-performance-card";
import DiskUsageCard from "./disk-usage-card";
import MemoryCard from "./memory-card";
import NetworkCard from "./network-card";

import style from "./style.module.less";

const { MonitorItems, MonitorTime, MonitorProvider } = BusinessMonitor;

const alertMarginStyle: React.CSSProperties = { marginBottom: 12 };

interface IProps {
  uuid: string;
}

const Monitoring: React.FC<IProps> = ({ uuid }) => {
  const intl = useIntl();

  const resourceType = "virtualization-resource-bm-instance";
  const defaultMonitorItems = [
    "OperatingSystemCPUUsedUtilization",
    "OperatingSystemNetworkOutBytes",
    "OperatingSystemNetworkOutPackets",
    "OperatingSystemNetworkOutErrors",
    "MemoryUsedBytes",
    "DiskReadBytesPerSecond",
    "DiskWriteBytesPerSecond",
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

  const monitorItemOptions = useMemo(
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
            value: "OperatingSystemCPUUsedUtilization",
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
            value: "OperatingSystemMemoryUsedBytes",
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
            value: "OperatingSystemMemoryFreeBytes",
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
            value: "DiskReadBytesPerSecond",
          },
          {
            label: intl.formatMessage({
              id: "disk.iops",
              defaultMessage: "Disk IOPS",
            }),
            value: "DiskReadRequestPerSecond",
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
            value: "OperatingSystemNetworkOutBytes",
          },
          {
            label: intl.formatMessage({
              id: "network.packets.speed",
              defaultMessage: "NIC Packet Rate",
            }),
            value: "OperatingSystemNetworkOutPackets",
          },
          {
            label: intl.formatMessage({
              id: "network.error.speed",
              defaultMessage: "NIC Packet Discard Rate",
            }),
            value: "OperatingSystemNetworkOutErrors",
          },
        ],
      },
    ],
    [intl],
  );

  const dataSet = useMemo(() => {
    const monitorProps = {
      uuid,
      namespace: "ZStack/BaremetalVM",
      resourceType: GetMetricDataQueryType.BaremetalInstance,
      resourceKey: "BaremetalVMUuid",
    };
    return _.reduce(
      monitorItemOptions,
      (prev, cur, index) => {
        const curKey = cur.value;
        const curOptions = _.filter(cur.options, (option) =>
          _.includes(monitorItems, option.value),
        );
        const monitorKeys = _.map(curOptions, "value");
        if (!_.isEmpty(monitorKeys)) {
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
      {},
    );
  }, [monitorItemOptions, monitorItems, uuid]);

  return (
    <div>
      <Alert
        style={alertMarginStyle}
        type="warning"
        display="blockStrong"
        closable
        message={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "baremetalVmInstance.monitor.page.alert.info",
              defaultMessage: `1. To view monitoring data of bare metal instances, install agents.
2. For Linux operating systems, log in to the instances' consoles and run the intallation command: curl -s ftp://x.x.x.x/zwatch-install.sh -O && chmod +x zwatch-install.sh && ./zwatch-install.sh x.x.x.x. Here, x.x.x.x means IP addresses of DHCP listening NICs provided by deployment servers.
3. To install or upgrade agents, ensure that you have installed the corresponding Linux command line tools, such as tar, wget, and curl.`,
            })}
          </ReactMarkdown>
        }
      />
      <div className={`flex justify-between ${style["action-bar"]}`}>
        <div>
          <div className="flex items-center gap-2">
            <MonitorTime ref={timeRef} />
            <InfoPopover
              content={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "baremetalVmInstance.monitor.info",
                    defaultMessage: `### Monitoring

1. Monitoring data is collected by agent from the bare metal instance.
2. The agent is the proxy installed on the bare metal instance and pushes the monitoring data on schedule through the internal network to the deployment server.
3. To view the monitoring data of a bare metal instance, make sure the agent is installed.`,
                  })}
                </ReactMarkdown>
              }
            />
          </div>
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
