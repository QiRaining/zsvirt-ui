import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import React, { useState } from "react";
import { useIntl } from "react-intl";

const { MonitorChart, MonitorTitle } = BusinessMonitor;

interface IProps extends IBusinessMonitorProps {
  monitorKey: string;
}

const NetworkChart: FC<IProps> = ({ monitorKey, ...props }) => {
  const intl = useIntl();
  let title: string = "";
  let initMetricNames: string[] = [];
  let metricNameList: [string, string][] = [];
  switch (monitorKey) {
    case "NetworkAllOutBytes":
      title = intl.formatMessage({
        id: "all.network.data.speed",
        defaultMessage: "NIC Data Transfer Rate Sum",
      });
      initMetricNames = ["NetworkAllOutBytes", "NetworkAllInBytes"];
      metricNameList = [
        [
          "NetworkAllOutBytes",
          intl.formatMessage({ id: "dataOut", defaultMessage: "Out" }),
        ],
        [
          "NetworkAllInBytes",
          intl.formatMessage({ id: "dataIn", defaultMessage: "In" }),
        ],
      ];
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
      valueType="bytesSpeed"
      metricNameMap={metricNameMap}
      metricNames={metricNames}
      isEmpty={metricNames.length === 0}
      {...props}
    />
  );
};

export default NetworkChart;
