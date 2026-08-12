import { BusinessMonitor } from "@zstack/zsphere-components";
import type {
  IBusinessMonitorValueType as IValueType,
  IBusinessMonitorProps,
} from "@zstack/zsphere-components";
import type { FC } from "react";
import React, { useState } from "react";
import { useIntl } from "react-intl";

const { MonitorChart, MonitorTitle } = BusinessMonitor;

interface IProps extends IBusinessMonitorProps {
  monitorKey: string;
  isEmpty: boolean;
}

const DiskChart: FC<IProps> = ({ monitorKey, isEmpty, ...props }) => {
  const intl = useIntl();
  let title: string = "";
  let initMetricNames: string[] = [];
  let metricNameList: [string, string][] = [];
  let valueType: IValueType = "bytesSpeed";

  switch (monitorKey) {
    case "DiskReadBytesPerSecond":
      title = intl.formatMessage({
        id: "disk.speed",
        defaultMessage: "Disk Speed",
      });
      initMetricNames = ["DiskReadBytesPerSecond", "DiskWriteBytesPerSecond"];
      metricNameList = [
        [
          "DiskReadBytesPerSecond",
          intl.formatMessage({ id: "read", defaultMessage: "Read" }),
        ],
        [
          "DiskWriteBytesPerSecond",
          intl.formatMessage({ id: "write", defaultMessage: "Write" }),
        ],
      ];
      valueType = "bytesSpeed";
      break;
    case "DiskReadRequestPerSecond":
      title = intl.formatMessage({
        id: "disk.iops",
        defaultMessage: "Disk IOPS",
      });
      initMetricNames = [
        "DiskReadRequestPerSecond",
        "DiskWriteRequestPerSecond",
      ];
      metricNameList = [
        [
          "DiskReadRequestPerSecond",
          intl.formatMessage({ id: "read", defaultMessage: "Read" }),
        ],
        [
          "DiskWriteRequestPerSecond",
          intl.formatMessage({ id: "write", defaultMessage: "Write" }),
        ],
      ];
      valueType = "ops";
      break;
  }

  const [metricNames, setMetricNames] = useState(initMetricNames);
  const metricNameMap = new Map(metricNameList);

  return (
    <MonitorChart
      title={
        <MonitorTitle
          title={title}
          value={metricNames}
          onChange={setMetricNames}
          metricNameMap={metricNameMap}
          multiple
          dropdownWidth="xs"
        />
      }
      valueType={valueType}
      metricNameMap={metricNameMap}
      metricNames={metricNames}
      isEmpty={isEmpty || metricNames.length === 0}
      {...props}
    />
  );
};

export default DiskChart;
