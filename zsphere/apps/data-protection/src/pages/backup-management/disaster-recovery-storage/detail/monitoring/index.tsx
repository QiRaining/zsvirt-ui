import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { useIsCurrentTab } from "@zstack/zsphere-components";
import type { IBusinessMonitorTimeRefs } from "@zstack/zsphere-components";
import {
  ResponsiveDndCardsLayout,
  BusinessMonitor,
  useMonitorItems,
} from "@zstack/zsphere-components";
import { GetMetricDataQueryType, ProfileType } from "@zstack/zsphere-types";
import { useMount } from "ahooks";
import {
  isEmpty as _isEmpty,
  filter as _filter,
  map as _map,
  reduce as _reduce,
  includes as _includes,
} from "lodash-es";
import type { FC } from "react";
import { useRef, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import DiskCard from "zsv_resource/host/detail/monitoring/disk-card";
import MemoryCard from "zsv_resource/host/detail/monitoring/memory-card";
import NetworkCard from "zsv_resource/host/detail/monitoring/network-card";
import CapacityCard from "zsv_resource/primary-storage/detail/monitoring/capacity-card";

import CPUCard from "./cpu-card";

import style from "./style.module.less";

const { MonitorItems, MonitorTime, MonitorProvider } = BusinessMonitor;

interface IProps {
  uuid: string;
  isCeph?: boolean;
}

const Monitoring: FC<IProps> = ({ uuid, isCeph }) => {
  const intl = useIntl();

  const resourceType = "virtualization-resource-backupStorage";
  const defaultMonitorItems = isCeph
    ? ["UsedCapacityInPercent"]
    : [
        "UsedCapacityInPercent",
        "NetworkOutBytes",
        "NetworkOutPackets",
        "NetworkOutErrors",
        "CPUUsedUtilization",
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

  const monitorItemOptions = useMemo(
    () =>
      isCeph
        ? [
            {
              label: intl.formatMessage({
                id: "capacity.monitor",
                defaultMessage: "Capacity Monitoring",
              }),
              value: "capacity",
              options: [
                {
                  label: intl.formatMessage({
                    id: "UsedCapacityInPercent",
                    defaultMessage: "Capacity Percent Used",
                  }),
                  value: "UsedCapacityInPercent",
                },
              ],
            },
          ]
        : [
            {
              label: intl.formatMessage({
                id: "capacity.monitor",
                defaultMessage: "Capacity Monitoring",
              }),
              value: "capacity",
              options: [
                {
                  label: intl.formatMessage({
                    id: "UsedCapacityInPercent",
                    defaultMessage: "Capacity Percent Used",
                  }),
                  value: "UsedCapacityInPercent",
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
              ],
            },
          ],
    [intl, isCeph],
  );

  const dataSet = useMemo(() => {
    const monitorProps = {
      uuid,
      namespace: "ZStack/BackupStorage",
      resourceType: GetMetricDataQueryType.BackupStorage,
      resourceKey: "BackupStorageUuid",
    };
    return _reduce(
      monitorItemOptions,
      (prev, cur, index) => {
        const curKey = cur.value;
        const curOptions = _filter(cur.options, (option) =>
          _includes(monitorItems, option.value),
        );
        const monitorKeys = _map(curOptions, "value");
        if (!_isEmpty(monitorKeys)) {
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
                case "capacity":
                  return <CapacityCard {...resourceProps} />;
                case "cpu":
                  return <CPUCard {...resourceProps} />;
                case "memory":
                  return <MemoryCard {...resourceProps} />;
                case "disk":
                  return <DiskCard {...resourceProps} />;
                case "network":
                  return <NetworkCard {...resourceProps} />;
                default:
                  return <></>;
              }
            },
          } as unknown;
        }
        return prev;
      },
      {},
    );
  }, [monitorItemOptions, monitorItems, uuid]);

  return (
    <div>
      <div className={`flex justify-between ${style["action-bar"]}`}>
        <div>
          <MonitorTime ref={timeRef} />
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
