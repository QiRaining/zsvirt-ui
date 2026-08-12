import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const { MonitorChart, MonitorTitle } = BusinessMonitor;

interface IProps extends IBusinessMonitorProps {
  monitorKey: string;
  zwatchState?: string;
}

const DiskUsageChart: FC<IProps> = ({
  zwatchState,
  monitorKey,
  isEmpty,
  ...props
}) => {
  const intl = useIntl();

  const metricNameMap = new Map([
    [
      "DiskUsedCapacityInPercent",
      intl.formatMessage({
        id: "DiskUsedCapacityInPercent",
        defaultMessage: "Disk Utilization",
      }),
    ],
    [
      "DiskFreeCapacityInPercent",
      intl.formatMessage({
        id: "DiskFreeCapacityInPercent",
        defaultMessage: "Disk Idle Rate",
      }),
    ],
    [
      "DiskUsedCapacityInBytes",
      intl.formatMessage({
        id: "DiskUsedCapacityInBytes",
        defaultMessage: "Disk Used Capacity",
      }),
    ],
    [
      "DiskFreeCapacityInBytes",
      intl.formatMessage({
        id: "DiskFreeCapacityInBytes",
        defaultMessage: "Disk Idle Capacity",
      }),
    ],
  ]);
  const title = useMemo(
    () => metricNameMap.get(monitorKey) || "",
    [metricNameMap, monitorKey],
  );
  const valueType = useMemo(
    () => (monitorKey.includes("Bytes") ? "bytes" : "percentage"),
    [monitorKey],
  );
  const metricNames = useMemo(() => [monitorKey], [monitorKey]);

  return (
    <MonitorChart
      title={<MonitorTitle title={title} />}
      valueType={valueType}
      metricNameMap={metricNameMap}
      metricNames={metricNames}
      tooltipExtra={() => {
        return intl.formatMessage({
          id: "tooltip.advanced.monitor",
          defaultMessage: "Advanced Monitoring",
        });
      }}
      isEmpty={isEmpty || zwatchState !== "Running"}
      {...props}
    />
  );
};

export default DiskUsageChart;
