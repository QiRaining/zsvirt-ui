import {
  cpuAndMemoryUsedPercentStr,
  cpuUsedPercentStr,
  memoryUsedPercentStr,
  monitorItemList,
  operatorMap,
} from "@zstack/virtualization-resource/src/pages/cluster/detail/drs/drs-panel-config-info/constant";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { reverseFormateTimer, useUnit } from "./utils";

export interface IProps {
  detail: ICluster;
  refetch: Function;
  drs: any;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const TriggerConditionsInfo: React.FC<IProps> = ({
  detail: _detail,
  drs,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();
  const { unitMap } = useUnit();
  const { detail: drsDetail } = drs;

  const { thresholdDuration = 1, thresholds = [] } = drsDetail ?? {};

  const getCurrentMoitorItem = () => {
    const isContains = (monitorItem: string) =>
      thresholds?.some(
        (it: { thresholdName?: string }) => it.thresholdName === monitorItem,
      );
    const isContainsCpu = isContains(cpuUsedPercentStr);
    const isContainsMemory = isContains(memoryUsedPercentStr);
    const isContainsBoth = isContainsCpu && isContainsMemory;
    if (isContainsBoth) {
      return cpuAndMemoryUsedPercentStr;
    }
    if (isContainsCpu) {
      return cpuUsedPercentStr;
    }
    if (isContainsMemory) {
      return memoryUsedPercentStr;
    }
    return cpuUsedPercentStr;
  };

  const translateMonitorItemName = () => {
    const find = monitorItemList.find(
      (it) => it.value === getCurrentMoitorItem(),
    );
    const monitorItemMap: any = {
      "drs.rateOfCpu": () =>
        intl.formatMessage({
          id: "cpuUtilization",
          defaultMessage: "CPU Utilization",
        }),
      "drs.rateOfMemory": () =>
        intl.formatMessage({
          id: "memoryUtilization",
          defaultMessage: " Memory Utilization",
        }),
      "drs.rateOfCpuAndMemory": () =>
        intl.formatMessage({
          id: "cpuOrMemoryUtilization",
          defaultMessage: "CPU/Memory Utilization",
        }),
    };
    return monitorItemMap[find!.name]?.();
  };

  const getCpuOrMemoryPercent = (monitorItem: string): string => {
    const find = thresholds?.find(
      (it: { thresholdName?: string }) => it.thresholdName === monitorItem,
    );
    if (find && find.operator) {
      return `${operatorMap?.[find?.operator]} ${find.thresholdValue}%`;
    }
    return "-";
  };

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "monitorItem",
          defaultMessage: "Monitoring Item",
        }),
        value: translateMonitorItemName(),
      },
      {
        label: intl.formatMessage({
          id: "cpuTriggerCondition",
          defaultMessage: "CPU Trigger Condition",
        }),
        value: getCpuOrMemoryPercent(cpuUsedPercentStr),
      },
      {
        label: intl.formatMessage({
          id: "memoryTriggerCondition",
          defaultMessage: "Memory Trigger Condition",
        }),
        value: getCpuOrMemoryPercent(memoryUsedPercentStr),
      },

      {
        label: intl.formatMessage({
          id: "durationTime",
          defaultMessage: "Duration",
        }),
        value: `${
          reverseFormateTimer(thresholdDuration as number, unitMap)?.num
        }${reverseFormateTimer(thresholdDuration as number, unitMap)?.unit}`,
      },
    ],
    [intl, translateMonitorItemName, thresholdDuration, unitMap],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "triggerConditions",
        defaultMessage: "Trigger Condition",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default TriggerConditionsInfo;
