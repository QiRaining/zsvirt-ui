import type {
  IBusinessMonitorProps,
  IBusinessMonitorValueType,
} from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import { useState } from "react";
import { useIntl } from "react-intl";

const { MonitorChart, MonitorTitle } = BusinessMonitor;

interface IProps extends IBusinessMonitorProps {
  monitorKey: string;
}

const DiskChart: FC<IProps> = ({ monitorKey, isEmpty, ...props }) => {
  const intl = useIntl();
  let title: string = "";
  let initMetricNames: string[] = [];
  let metricNameList: [string, string][] = [];
  let valueType: IBusinessMonitorValueType = "bytesSpeed";

  switch (monitorKey) {
    case "DiskReadBytes":
      title = intl.formatMessage({
        id: "disk.speed",
        defaultMessage: "Disk Speed",
      });
      initMetricNames = ["DiskReadBytes", "DiskWriteBytes"];
      metricNameList = [
        [
          "DiskReadBytes",
          intl.formatMessage({ id: "read", defaultMessage: "Read" }),
        ],
        [
          "DiskWriteBytes",
          intl.formatMessage({ id: "write", defaultMessage: "Write" }),
        ],
      ];
      valueType = "bytesSpeed";
      break;
    case "DiskReadOps":
      title = intl.formatMessage({
        id: "disk.iops",
        defaultMessage: "Disk IOPS",
      });
      initMetricNames = ["DiskReadOps", "DiskWriteOps"];
      metricNameList = [
        [
          "DiskReadOps",
          intl.formatMessage({ id: "read", defaultMessage: "Read" }),
        ],
        [
          "DiskWriteOps",
          intl.formatMessage({ id: "write", defaultMessage: "Write" }),
        ],
      ];
      valueType = "ops";
      break;
    case "DiskLatency":
      title = intl.formatMessage({
        id: "hard.disk.latency",
        defaultMessage: "Disk Latency",
      });
      initMetricNames = ["DiskLatency"];
      metricNameList = [
        [
          "DiskLatency",
          intl.formatMessage({
            id: "hard.disk.latency",
            defaultMessage: "Disk Latency",
          }),
        ],
      ];
      valueType = "latency";
      break;
  }

  const [metricNames, setMetricNames] = useState(initMetricNames);
  const metricNameMap = new Map(metricNameList);

  return (
    <MonitorChart
      title={
        monitorKey === "DiskLatency" ? (
          <MonitorTitle title={title} />
        ) : (
          <MonitorTitle
            title={title}
            value={metricNames}
            onChange={setMetricNames}
            metricNameMap={metricNameMap}
            multiple
            dropdownWidth="xs"
          />
        )
      }
      valueType={valueType}
      metricNameMap={metricNameMap}
      metricNames={metricNames}
      isEmpty={isEmpty || metricNames.length === 0}
      {...props}
      tooltipExtra={() => {
        if (props.resourceType === "VmInstance") {
          return intl.formatMessage({
            id: "tooltip.basic.monitor",
            defaultMessage: "Basic Monitoring",
          });
        }
        return "";
      }}
    />
  );
};

export default DiskChart;
