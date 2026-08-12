import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const { MonitorChart, MonitorTitle } = BusinessMonitor;

interface IProps extends IBusinessMonitorProps {
  monitorKey: string;
}

const CPUChart: FC<IProps> = ({ monitorKey, ...props }) => {
  const intl = useIntl();
  const metricNameMap = new Map([
    [
      "CPUAllUsedUtilization",
      intl.formatMessage({
        id: "CPUAllUsedUtilization",
        defaultMessage: "CPU Utilization Sum",
      }),
    ],
  ]);

  const title = useMemo(
    () => metricNameMap.get(monitorKey) || "",
    [metricNameMap, monitorKey],
  );
  const metricNames = useMemo(() => [monitorKey], [monitorKey]);

  return (
    <MonitorChart
      title={<MonitorTitle title={title} />}
      valueType="percentage"
      metricNameMap={metricNameMap}
      metricNames={metricNames}
      {...props}
    />
  );
};

export default CPUChart;
