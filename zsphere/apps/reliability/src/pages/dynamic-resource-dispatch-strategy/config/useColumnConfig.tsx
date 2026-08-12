import { ResourceName } from "@zstack/zsphere-components";
import { State } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/dynamic-resource-ispatch-strategy";
import type { IOption } from "@zstack/zsphere-engine/src/dynamic-resource-ispatch-strategy/useColumnConfig";
import { Op } from "@zstack/zsphere-types";
import type { DRS as IDRS } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import {
  cpuAndMemoryUsedPercentStr,
  cpuUsedPercentStr,
  memoryUsedPercentStr,
  monitorItemList,
  operatorMap,
} from "../constant";
import { reverseFormateTimer, useUnit } from "../utils";

export default () => {
  const intl = useIntl();

  const { unitMap } = useUnit();
  const getDispatchModeContent = (automationLevel: string) => {
    const dispatchModeMap: any = {
      Manual: () =>
        intl.formatMessage({
          id: "manual",
          defaultMessage: "Manual",
        }),
      Automatic: () =>
        intl.formatMessage({
          id: "automatic",
          defaultMessage: "Automatic",
        }),
    };
    return dispatchModeMap[automationLevel]?.();
  };

  const getStateEle = (enabled: string) => {
    const stateMap: any = {
      Enabled: () => (
        <State
          type="success"
          name={intl.formatMessage({ id: "open", defaultMessage: "Enabled" })}
          icon="play-circle-fill"
        />
      ),
      Disabled: () => (
        <State
          type="error"
          name={intl.formatMessage({ id: "close", defaultMessage: "Disabled" })}
          icon="stop-circle-fill"
        />
      ),
    };
    return stateMap[enabled]?.();
  };

  const balancedStateEle = (isSupported: boolean, balancedState: any) => {
    if (!isSupported) {
      return (
        <State
          type="disabled"
          name={intl.formatMessage({
            id: "unknown",
            defaultMessage: "Unknown",
          })}
          prefix="dot"
        />
      );
    }
    const balanceStateMap: any = {
      Unknown: (
        <State
          type="disabled"
          name={intl.formatMessage({
            id: "unknown",
            defaultMessage: "Unknown",
          })}
          prefix="dot"
        />
      ),
      Balanced: (
        <State
          type="success"
          name={intl.formatMessage({
            id: "balance",
            defaultMessage: "Balance",
          })}
          prefix="dot"
        />
      ),
      Unbalanced: (
        <State
          type="error"
          name={intl.formatMessage({
            id: "unbalance",
            defaultMessage: "Imbalanced",
          })}
          prefix="dot"
        />
      ),
    };
    return balanceStateMap[balancedState];
  };

  const getCurrentMoitorItem = (thresholds: any) => {
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

  const translateMonitorItemName = (thresholds: any) => {
    const find = monitorItemList.find(
      (it) => it.value === getCurrentMoitorItem(thresholds),
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

  const getCpuOrMemoryPercent = (
    monitorItem: string,
    thresholds: any,
  ): string => {
    const find = thresholds?.find(
      (it: { thresholdName?: string }) => it.thresholdName === monitorItem,
    );
    if (find && find.operator) {
      return `${operatorMap?.[find?.operator]} ${find.thresholdValue}%`;
    }
    return "-";
  };

  const getTriggerConditions = (thresholds: any): string => {
    const find = monitorItemList.find(
      (it) => it.value === getCurrentMoitorItem(thresholds),
    );

    switch (find?.name) {
      case "drs.rateOfCpu":
        return `${intl.formatMessage({
          id: "cpuTriggerCondition",
          defaultMessage: "CPU Trigger Condition",
        })}${getCpuOrMemoryPercent(cpuUsedPercentStr, thresholds)}`;

      case "drs.rateOfMemory":
        return `${intl.formatMessage({
          id: "memoryTriggerCondition",
          defaultMessage: "Memory Trigger Condition",
        })}${getCpuOrMemoryPercent(memoryUsedPercentStr, thresholds)}`;

      case "drs.rateOfCpuAndMemory":
        return `${intl.formatMessage({
          id: "cpuTriggerCondition",
          defaultMessage: "CPU Trigger Condition",
        })}${getCpuOrMemoryPercent(cpuUsedPercentStr, thresholds)}
        ${intl.formatMessage({
          id: "memoryTriggerCondition",
          defaultMessage: "Memory Trigger Condition",
        })}${getCpuOrMemoryPercent(memoryUsedPercentStr, thresholds)}`;

      default:
        return "-";
    }
  };

  const options: IOption<IDRS> = [
    {
      key: "cluster.name",
      linkResource: {
        microAppName: "virtualization-resource",
        path: "cluster",
      },
      render: (current) => (
        <ResourceName
          value={current?.cluster?.name}
          isRouterManaged
          link={{
            to: `/cluster`,
            microAppName: "virtualization-resource",
            uuid: current?.clusterUuid,
          }}
        />
      ),
    },
    {
      key: "state",
      render: (current) => getStateEle(current.state),
      filters: [
        {
          text: (
            <State
              type="success"
              name={intl.formatMessage({ id: "open", defaultMessage: "Enabled" })}
            />
          ),
          value: "Enabled",
        },
        {
          text: (
            <State
              type="error"
              name={intl.formatMessage({ id: "close", defaultMessage: "Disabled" })}
            />
          ),
          value: "Disabled",
        },
      ],
    },
    {
      key: "dispatchMode",
      render: (current) => getDispatchModeContent(current.automationLevel),
      filterCondition: (values: string[]) => {
        return {
          key: "automationLevel",
          op: Op.in,
          values,
        };
      },
      filters: [
        {
          text: intl.formatMessage({ id: "automatic", defaultMessage: "Automatic" }),
          value: "Automatic",
        },
        {
          text: intl.formatMessage({ id: "manual", defaultMessage: "Manual" }),
          value: "Manual",
        },
      ],
    },
    {
      key: "balanceState",
      render: (current) =>
        balancedStateEle(current.isSupported, current.balancedState),
      filterCondition: (values: string[]) => {
        return {
          key: "balancedState",
          op: Op.in,
          values,
        };
      },
      filters: [
        {
          text: (
            <State
              type="success"
              name={intl.formatMessage({
                id: "balance",
                defaultMessage: "Balance",
              })}
              prefix="dot"
            />
          ),
          value: "Balanced",
        },
        {
          text: (
            <State
              type="error"
              name={intl.formatMessage({
                id: "unbalance",
                defaultMessage: "Imbalanced",
              })}
              prefix="dot"
            />
          ),
          value: "Unbalanced",
        },
        {
          text: (
            <State
              type="disabled"
              name={intl.formatMessage({
                id: "unknown",
                defaultMessage: "Unknown",
              })}
              prefix="dot"
            />
          ),
          value: "Unknown",
        },
      ],
    },
    {
      key: "monitorItem",
      render: (current) => translateMonitorItemName(current.thresholds),
    },
    {
      key: "triggerConditions",
      render: (current) => getTriggerConditions(current.thresholds),
    },
    {
      key: "durationTime",
      render: (current) =>
        `${
          reverseFormateTimer(current.thresholdDuration as number, unitMap)?.num
        }${
          reverseFormateTimer(current.thresholdDuration as number, unitMap)
            ?.unit
        }`,
    },
    {
      key: "drs.migrateVm.concurrent",
      render: (current) =>
        `${
          current?.resourceConfigValue?.drsDrsMigrateVmConcurrent
        } ${intl.formatMessage({
          id: "virtualization.cluster.create.field.automationLevel.drs.migrateVm.concurrent.unit",
          defaultMessage: " ",
        })}`,
    },
    {
      key: "drs.schedulingInterval",
      render: (current) =>
        `${
          reverseFormateTimer(
            (current?.resourceConfigValue?.drsDrsSchedulingInterval ??
              0) as number,
            unitMap,
          )?.num
        }${
          reverseFormateTimer(
            (current?.resourceConfigValue?.drsDrsSchedulingInterval ??
              0) as number,
            unitMap,
          )?.unit
        }`,
    },
  ];

  return useColumnConfig(options);
};
