import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import { useMemo } from "react";
import { useIntl } from "react-intl";

const { MonitorChart, MonitorTitle } = BusinessMonitor;

interface IProps extends IBusinessMonitorProps {
  monitorKey: string;
}

const MemoryChart: FC<IProps> = ({ monitorKey, ...props }) => {
  const intl = useIntl();
  const metricNameMap = new Map([
    [
      "MemoryUsedBytes",
      intl.formatMessage({
        id: "MemoryUsedBytes",
        defaultMessage: "Memory Usage",
      }),
    ],
    [
      "MemoryFreeBytes",
      intl.formatMessage({
        id: "MemoryFreeBytes",
        defaultMessage: "Free Memory Capacity",
      }),
    ],
  ]);

  const title = useMemo(
    () => metricNameMap.get(monitorKey) || "",
    [metricNameMap, monitorKey],
  );
  const metricNames = useMemo(() => ["MemoryUsedBytes", "MemoryFreeBytes"], []);

  return (
    <MonitorChart
      title={<MonitorTitle title={title} />}
      valueType="bytes"
      metricNameMap={metricNameMap}
      metricNames={metricNames}
      {...props}
    />
  );
};

export default MemoryChart;
