import { BusinessMonitor } from "@zstack/zsphere-components";
import type {
  IBusinessMonitorValueType as IValueType,
  IBusinessMonitorProps,
} from "@zstack/zsphere-components";
import type { FC } from "react";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const { MonitorChart, MonitorTitle } = BusinessMonitor;

interface IProps extends IBusinessMonitorProps {
  monitorKey: string;
}

const MemoryChart: FC<IProps> = ({ monitorKey, ...props }) => {
  const intl = useIntl();
  const valueType: IValueType = monitorKey.includes("Bytes")
    ? "bytes"
    : "percentage";

  const metricNameMap = new Map([
    [
      "MemoryUsedBytes",
      intl.formatMessage({
        id: "MemoryUsedBytes",
        defaultMessage: "Memory Usage",
      }),
    ],
    [
      "OperatingSystemMemoryUsedBytes",
      intl.formatMessage({
        id: "MemoryUsedBytes",
        defaultMessage: "Memory Usage",
      }),
    ],
    [
      "OperatingSystemMemoryAvailableBytes",
      intl.formatMessage({
        id: "MemoryAvailableBytes",
        defaultMessage: "Available Memory Capacity",
      }),
    ],
    [
      "MemoryFreeBytes",
      intl.formatMessage({
        id: "MemoryFreeBytes",
        defaultMessage: "Free Memory Capacity",
      }),
    ],
    [
      "OperatingSystemMemoryFreeBytes",
      intl.formatMessage({
        id: "MemoryFreeBytes",
        defaultMessage: "Free Memory Capacity",
      }),
    ],
    [
      "OperatingSystemMemoryTotalBytes",
      intl.formatMessage({
        id: "MemoryTotalBytes",
        defaultMessage: "Total Memory Capacity",
      }),
    ],
    [
      "OperatingSystemMemoryFreePercent",
      intl.formatMessage({
        id: "MemoryFreePercent",
        defaultMessage: "Memory Idle Rate",
      }),
    ],
    [
      "OperatingSystemMemoryUsedPercent",
      intl.formatMessage({
        id: "MemoryUsedPercent",
        defaultMessage: "Memory Utilization",
      }),
    ],
  ]);

  const title = useMemo(
    () => metricNameMap.get(monitorKey) || "",
    [metricNameMap, monitorKey],
  );
  const metricNames = useMemo(() => {
    if (["MemoryUsedBytes", "MemoryFreeBytes"].includes(monitorKey)) {
      return [monitorKey, `OperatingSystem${monitorKey}`];
    }
    return [monitorKey];
  }, [monitorKey]);

  return (
    <MonitorChart
      title={<MonitorTitle title={title} />}
      valueType={valueType}
      metricNameMap={metricNameMap}
      metricNames={metricNames}
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

export default MemoryChart;
