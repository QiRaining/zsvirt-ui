import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import { reduce as _reduce } from "lodash-es";
import type { FC } from "react";
import { useMemo } from "react";
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
      "CPUIdleUtilization",
      intl.formatMessage({
        id: "CPUIdleUtilization",
        defaultMessage: "CPU Idle Rate",
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
      "CPUSystemUtilization",
      intl.formatMessage({
        id: "CPUSystemUtilization",
        defaultMessage: "CPU Occupancy Rate (System Process)",
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
      "CPUUserUtilization",
      intl.formatMessage({
        id: "CPUUserUtilization",
        defaultMessage: "CPU Occupancy Rate (User Process)",
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
      "CPUWaitUtilization",
      intl.formatMessage({
        id: "CPUWaitUtilization",
        defaultMessage: "CPU Occupancy Rate Average (Waiting)",
      }),
    ],
    [
      "CPUAverageWaitUtilization",
      intl.formatMessage({
        id: "CPUAverageWaitUtilization",
        defaultMessage: "CPU Occupancy Rate Average (Waiting)",
      }),
    ],
  ]);

  const title = metricNameMap.get(monitorKey)!;

  const { realLabels, metricNames, metricNamesWithoutLabel } = useMemo(() => {
    const labelObj = _reduce(
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
      _metricNames = [monitorKey];
    }
    if (labelObj.hasAverageLabel) {
      const averageKey = monitorKey.replace(/(CPU)(.*)/, "$1Average$2");
      _metricNamesWithoutLabel = [averageKey];
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
      {...props}
    />
  );
};

export default CPUChart;
