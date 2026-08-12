import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const { MonitorChart, MonitorTitle } = BusinessMonitor;

export interface IProps extends IBusinessMonitorProps {
  monitorKey: string;
}

const IPChart: React.FC<IProps> = ({ monitorKey, ...props }) => {
  const intl = useIntl();
  const metricNameMap = new Map([
    [
      "UsedCapacityInPercent",
      intl.formatMessage({
        id: "UsedCapacityInPercent",
        defaultMessage: "Capacity Percent Used",
      }),
    ],
  ]);

  const title = metricNameMap.get(monitorKey)!;
  const metricNames = [monitorKey];

  return (
    <MonitorChart
      title={<MonitorTitle title={title} />}
      valueType="percentage"
      metricNameMap={metricNameMap}
      metricNamesWithoutLabel={metricNames}
      {...props}
    />
  );
};

export default IPChart;
