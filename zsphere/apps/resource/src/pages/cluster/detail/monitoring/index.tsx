import { RadioGroup } from "@zstack/design";
import type {
  IDraggableCardProps,
  ISelectOption,
} from "@zstack/zsphere-components";
import { useIsCurrentTab } from "@zstack/zsphere-components";
import type { IBusinessMonitorTimeRefs } from "@zstack/zsphere-components";
import {
  ResponsiveDndCardsLayout,
  BusinessMonitor,
  useMonitorItems,
} from "@zstack/zsphere-components";
import type { IResponsiveDndCardsLayout } from "@zstack/zsphere-components/dist/responsive-dnd-cards-layout";
import { GetMetricDataQueryType, ProfileType } from "@zstack/zsphere-types";
import { useMount } from "ahooks";
import _ from "lodash-es";
import React, { useState, useRef, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import CPUCard from "./cpu-card";
import DiskCard from "./disk-card";
import MemoryCard from "./memory-card";
import NetworkCard from "./network-card";

import style from "./style.module.less";

const { MonitorItems, MonitorTime, MonitorProvider } = BusinessMonitor;
interface IProps {
  uuid: string;
}

type IResourceType = "host" | "vm";

const Monitoring: React.FC<IProps> = ({ uuid }) => {
  const intl = useIntl();
  const [type, setType] = useState<IResourceType>("host");

  const resourceType = "virtualization-resource-cluster";
  const defaultMonitorItems = [
    "CPUAllUsedUtilization",
    "MemoryUsedInPercent",
    "DiskAllReadOps",
    "NetworkAllOutBytes",
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
              id: "CPUAllUsedUtilization",
              defaultMessage: "CPU Utilization Sum",
            }),
            value: "CPUAllUsedUtilization",
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
              id: "MemoryUsedInPercent",
              defaultMessage: "Memory Usage Percentage",
            }),
            value: "MemoryUsedInPercent",
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
              id: "all.disk.iops",
              defaultMessage: "Disk IOPS Sum",
            }),
            value: "DiskAllReadOps",
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
              id: "all.network.data.speed",
              defaultMessage: "NIC Data Transfer Rate Sum",
            }),
            value: "NetworkAllOutBytes",
          },
        ],
      },
    ],
    [intl],
  );

  const dataSet = useMemo(() => {
    const isHost = type === "host";
    const monitorProps = {
      uuid,
      namespace: isHost ? "ZStack/Host" : "ZStack/VM",
      resourceType: isHost
        ? GetMetricDataQueryType.GetHostMetricDataByCluster
        : GetMetricDataQueryType.GetVmMetricDataByCluster,
      resourceConditions: [
        {
          key: "clusterUuid",
          value: uuid,
        },
      ],
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
                case "disk":
                  return <DiskCard {...resourceProps} />;
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
  }, [monitorItemOptions, monitorItems, uuid, type]);

  return (
    <div>
      <div className={style["tab-bar"]}>
        <RadioGroup
          variant="outline"
          value={type}
          onValueChange={(val) => setType(val as IResourceType)}
          options={[
            {
              value: "host",
              label: intl.formatMessage({ id: "host", defaultMessage: "Host" }),
            },
            {
              value: "vm",
              label: intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
            },
          ]}
        />
      </div>
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
