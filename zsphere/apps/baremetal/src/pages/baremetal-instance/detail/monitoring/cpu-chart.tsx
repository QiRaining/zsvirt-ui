import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import _ from "lodash-es";
import type { FC } from "react";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const { MonitorChart, MonitorTitle } = BusinessMonitor;

interface IProps extends IBusinessMonitorProps {
  monitorKey: string;
}

const CPUChart: FC<IProps> = ({ monitorKey, labels, ...props }) => {
  const intl = useIntl();
  const metricNameMap = new Map([
    [
      "CPUUsedUtilization",
      intl.formatMessage({
        id: "CPUUsedUtilization",
        defaultMessage: "CPU Utilization",
      }),
    ],
    [
      "CPUAverageUsedUtilization",
      intl.formatMessage({
        id: "CPUAverageUsedUtilization",
        defaultMessage: "Average",
      }),
    ],
    [
      "OperatingSystemCPUUsedUtilization",
      intl.formatMessage({
        id: "CPUUsedUtilization",
        defaultMessage: "CPU Utilization",
      }),
    ],
    [
      "OperatingSystemCPUAverageUsedUtilization",
      intl.formatMessage({
        id: "CPUAverageUsedUtilization",
        defaultMessage: "Average",
      }),
    ],
    [
      "OperatingSystemCPUIdleUtilization",
      intl.formatMessage({
        id: "CPUIdleUtilization",
        defaultMessage: "CPU Idle Rate",
      }),
    ],
    [
      "OperatingSystemCPUAverageIdleUtilization",
      intl.formatMessage({
        id: "CPUAverageIdleUtilization",
        defaultMessage: "CPU Idle Rate Average",
      }),
    ],
    [
      "OperatingSystemCPUSystemUtilization",
      intl.formatMessage({
        id: "CPUSystemUtilization",
        defaultMessage: "CPU Occupancy Rate (System Process)",
      }),
    ],
    [
      "OperatingSystemCPUAverageSystemUtilization",
      intl.formatMessage({
        id: "CPUAverageSystemUtilization",
        defaultMessage: "CPU Occupancy Rate Average (System Process)",
      }),
    ],
    [
      "OperatingSystemCPUUserUtilization",
      intl.formatMessage({
        id: "CPUUserUtilization",
        defaultMessage: "CPU Occupancy Rate (User Process)",
      }),
    ],
    [
      "OperatingSystemCPUAverageUserUtilization",
      intl.formatMessage({
        id: "CPUAverageUserUtilization",
        defaultMessage: "CPU Occupancy Rate Average (User Process)",
      }),
    ],
    [
      "OperatingSystemCPUWaitUtilization",
      intl.formatMessage({
        id: "CPUWaitUtilization",
        defaultMessage: "CPU Occupancy Rate Average (Waiting)",
      }),
    ],
    [
      "OperatingSystemCPUAverageWaitUtilization",
      intl.formatMessage({
        id: "CPUAverageWaitUtilization",
        defaultMessage: "CPU Occupancy Rate Average (Waiting)",
      }),
    ],
  ]);

  const title = metricNameMap.get(monitorKey)!;

  const { realLabels, metricNames, metricNamesWithoutLabel } = useMemo(() => {
    const labelObj = _.reduce(
      labels,
      (prev, cur) => {
        if (cur === "Average") {
          prev.hasAverageLabel = true;
        } else {
          prev.hasRealLabel = true;
          prev.realLabels = [...prev.realLabels, cur];
        }
        return prev;
      },
      {
        realLabels: [] as string[],
        hasRealLabel: false,
        hasAverageLabel: false,
      },
    );
    let _metricNames: string[] = [];
    let _metricNamesWithoutLabel: string[] = [];
    if (labelObj.hasRealLabel) {
      if (monitorKey === "CPUUsedUtilization") {
        _metricNames = [
          "CPUUsedUtilization",
          "OperatingSystemCPUUsedUtilization",
        ];
      } else {
        _metricNames = [monitorKey];
      }
    }
    if (labelObj.hasAverageLabel) {
      if (monitorKey === "CPUUsedUtilization") {
        _metricNamesWithoutLabel = [
          "CPUAverageUsedUtilization",
          "OperatingSystemCPUAverageUsedUtilization",
        ];
      } else {
        const averageKey = monitorKey.replace(
          /(OperatingSystemCPU)(.*)/,
          "$1Average$2",
        );
        _metricNamesWithoutLabel = [averageKey];
      }
    }
    return {
      realLabels: labelObj.realLabels,
      metricNames: _metricNames,
      metricNamesWithoutLabel: _metricNamesWithoutLabel,
    };
  }, [labels, monitorKey]);

  return (
    <MonitorChart
      title={<MonitorTitle title={title} />}
      valueType="percentage"
      labels={realLabels}
      metricNameMap={metricNameMap}
      metricNames={metricNames}
      metricNamesWithoutLabel={metricNamesWithoutLabel}
      tooltipExtra={(name) => {
        if (!name.includes("OperatingSystem")) {
          return intl.formatMessage({
            id: "tooltip.basic.monitor",
            defaultMessage: "Basic Monitoring",
          });
        }
        return intl.formatMessage({
          id: "tooltip.advanced.monitor",
          defaultMessage: "Advanced Monitoring",
        });
      }}
      {...props}
    />
  );
};

export default CPUChart;
