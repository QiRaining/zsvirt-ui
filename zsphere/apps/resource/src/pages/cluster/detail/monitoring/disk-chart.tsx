import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import React, { useState } from "react";
import { useIntl } from "react-intl";

const { MonitorChart, MonitorTitle } = BusinessMonitor;

interface IProps extends IBusinessMonitorProps {
  monitorKey: string;
}

const DiskChart: FC<IProps> = ({ monitorKey, ...props }) => {
  const intl = useIntl();
  let title: string = "";
  let initMetricNames: string[] = [];
  let metricNameList: [string, string][] = [];

  switch (monitorKey) {
    case "DiskAllReadOps":
      title = intl.formatMessage({
        id: "all.disk.iops",
        defaultMessage: "Disk IOPS Sum",
      });
      initMetricNames = ["DiskAllReadOps", "DiskAllWriteOps"];
      metricNameList = [
        [
          "DiskAllReadOps",
          intl.formatMessage({ id: "read", defaultMessage: "Read" }),
        ],
        [
          "DiskAllWriteOps",
          intl.formatMessage({ id: "write", defaultMessage: "Write" }),
        ],
      ];
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
      valueType="ops"
      metricNameMap={metricNameMap}
      metricNames={metricNames}
      isEmpty={metricNames.length === 0}
      {...props}
    />
  );
};

export default DiskChart;
