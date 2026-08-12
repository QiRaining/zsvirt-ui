import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import { useMemo } from "react";
import { useIntl } from "react-intl";

const { MonitorChart, MonitorTitle } = BusinessMonitor;

interface IProps extends IBusinessMonitorProps {
  monitorKey: string;
}

const CPUChart: FC<IProps> = ({
  monitorKey,
  labels: labelsWithAverage,
  ...props
}) => {
  const intl = useIntl();

  const metricNameMap = new Map([
    [
      "CPUAverageUsedUtilization",
      intl.formatMessage({
        id: "CPUAverageUsedUtilization",
        defaultMessage: "Average",
      }),
    ],
    [
      "CPUAverageIdleUtilization",
      intl.formatMessage({
        id: "CPUAverageIdleUtilization",
        defaultMessage: "CPU Idle Rate Average",
      }),
    ],
    [
      "CPUAverageSystemUtilization",
      intl.formatMessage({
        id: "CPUAverageSystemUtilization",
        defaultMessage: "CPU Occupancy Rate Average (System Process)",
      }),
    ],
    [
      "CPUAverageUserUtilization",
      intl.formatMessage({
        id: "CPUAverageUserUtilization",
        defaultMessage: "CPU Occupancy Rate Average (User Process)",
      }),
    ],
    [
      "CPUAverageWaitUtilization",
      intl.formatMessage({
        id: "CPUAverageWaitUtilization",
        defaultMessage: "CPU Occupancy Rate Average (Waiting)",
      }),
    ],
    [
      "CPUUsedUtilization",
      intl.formatMessage({
        id: "CPUUsedUtilization",
        defaultMessage: "CPU Utilization",
      }),
    ],
    [
      "CPUIdleUtilization",
      intl.formatMessage({
        id: "CPUIdleUtilization",
        defaultMessage: "CPU Idle Rate",
      }),
    ],
    [
      "CPUSystemUtilization",
      intl.formatMessage({
        id: "CPUSystemUtilization",
        defaultMessage: "CPU Occupancy Rate (System Process)",
      }),
    ],
    [
      "CPUUserUtilization",
      intl.formatMessage({
        id: "CPUUserUtilization",
        defaultMessage: "CPU Occupancy Rate (User Process)",
      }),
    ],
    [
      "CPUWaitUtilization",
      intl.formatMessage({
        id: "CPUWaitUtilization",
        defaultMessage: "CPU Occupancy Rate Average (Waiting)",
      }),
    ],
  ]);

  const title = useMemo(
    () => metricNameMap.get(monitorKey) || "",
    [metricNameMap, monitorKey],
  );
  const labels = useMemo(
    () => labelsWithAverage?.filter((item) => item !== "Average"),
    [labelsWithAverage],
  );
  const metricNames = useMemo(
    () => (labels?.length ? [monitorKey] : []),
    [labels, monitorKey],
  );
  const metricNamesWithoutLabel = useMemo(
    () =>
      labelsWithAverage?.includes("Average")
        ? [monitorKey.replace(/^CPU/, "CPUAverage")]
        : [],
    [labelsWithAverage, monitorKey],
  );

  return (
    <MonitorChart
      title={<MonitorTitle title={title} />}
      valueType="percentage"
      metricNameMap={metricNameMap}
      metricNames={metricNames}
      metricNamesWithoutLabel={metricNamesWithoutLabel}
      labels={labels}
      {...props}
    />
  );
};

export default CPUChart;
