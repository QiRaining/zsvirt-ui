import type {
  IBusinessMonitorProps,
  IBusinessMonitorValueType,
} from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import { useMemo } from "react";
import { useIntl } from "react-intl";

const { MonitorChart, MonitorTitle } = BusinessMonitor;

interface IProps extends IBusinessMonitorProps {
  monitorKey: string;
}

const DiskCapacityChart: FC<IProps> = ({ monitorKey, ...props }) => {
  const intl = useIntl();
  let valueType: IBusinessMonitorValueType = "bytes";

  switch (monitorKey) {
    case "DiskAllUsedCapacityInPercent":
    case "DiskZStackUsedCapacityInPercent":
      valueType = "percentage";
      break;

    case "DiskAllUsedCapacityInBytes":
    case "DiskZStackUsedCapacityInBytes":
      valueType = "bytes";
      break;
  }

  const metricNameMap = new Map([
    [
      "DiskAllUsedCapacityInPercent",
      intl.formatMessage({
        id: "DiskAllUsedCapacityInPercent",
        defaultMessage: "Total Disk Usage Ratio",
      }),
    ],
    [
      "DiskAllUsedCapacityInBytes",
      intl.formatMessage({
        id: "DiskAllUsedCapacityInBytes",
        defaultMessage: "Total Disk Usage",
      }),
    ],
    [
      "DiskZStackUsedCapacityInPercent",
      intl.formatMessage({
        id: "DiskZStackUsedCapacityInPercent",
        defaultMessage: "Disk Usage Ratio of Platform System Files",
      }),
    ],
    [
      "DiskZStackUsedCapacityInBytes",
      intl.formatMessage({
        id: "DiskZStackUsedCapacityInBytes",
        defaultMessage: "Disk Usage of Platform System Files",
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
      valueType={valueType}
      metricNameMap={metricNameMap}
      metricNames={metricNames}
      {...props}
    />
  );
};

export default DiskCapacityChart;
