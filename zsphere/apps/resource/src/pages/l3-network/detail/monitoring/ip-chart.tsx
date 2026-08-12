import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";

const { MonitorChart, MonitorTitle } = BusinessMonitor;

interface IProps extends IBusinessMonitorProps {
  monitorKey: string;
}

const IPChart: FC<IProps> = ({ monitorKey, ...props }) => {
  const intl = useIntl();
  const metricNameMap = new Map([
    [
      "AvailableIPInPercent",
      intl.formatMessage({
        id: "AvailableIPInPercent",
        defaultMessage: "Available IP Percent",
      }),
    ],
    [
      "UsedIPInPercent",
      intl.formatMessage({
        id: "UsedIPInPercent",
        defaultMessage: "Used IP Percentage (IPv4)",
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
      metricNames={metricNames}
      {...props}
    />
  );
};

export default IPChart;
