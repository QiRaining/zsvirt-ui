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

const NetworkChart: FC<IProps> = ({ monitorKey, isEmpty, ...props }) => {
  const intl = useIntl();
  let title: string = "";
  let initMetricNames: string[] = [];
  let metricNameList: [string, string][] = [];
  let valueType: IValueType = "bytesSpeed";

  switch (monitorKey) {
    case "OperatingSystemNetworkOutBytes":
      title = intl.formatMessage({
        id: "network.bytes.speed",
        defaultMessage: "NIC Data Transfer Rate",
      });
      initMetricNames = [
        "OperatingSystemNetworkOutBytes",
        "OperatingSystemNetworkInBytes",
      ];
      metricNameList = [
        [
          "OperatingSystemNetworkOutBytes",
          intl.formatMessage({ id: "dataOut", defaultMessage: "Out" }),
        ],
        [
          "OperatingSystemNetworkInBytes",
          intl.formatMessage({ id: "dataIn", defaultMessage: "In" }),
        ],
      ];
      valueType = "bytesSpeed";
      break;
    case "OperatingSystemNetworkOutPackets":
      title = intl.formatMessage({
        id: "network.packets.speed",
        defaultMessage: "NIC Packet Rate",
      });
      initMetricNames = [
        "OperatingSystemNetworkOutPackets",
        "OperatingSystemNetworkInPackets",
      ];
      metricNameList = [
        [
          "OperatingSystemNetworkOutPackets",
          intl.formatMessage({ id: "dataOut", defaultMessage: "Out" }),
        ],
        [
          "OperatingSystemNetworkInPackets",
          intl.formatMessage({ id: "dataIn", defaultMessage: "In" }),
        ],
      ];
      valueType = "pps";
      break;
    case "OperatingSystemNetworkOutErrors":
      title = intl.formatMessage({
        id: "network.error.speed",
        defaultMessage: "NIC Packet Discard Rate",
      });
      initMetricNames = [
        "OperatingSystemNetworkOutErrors",
        "OperatingSystemNetworkInErrors",
      ];
      metricNameList = [
        [
          "OperatingSystemNetworkOutErrors",
          intl.formatMessage({ id: "out", defaultMessage: "Exit" }),
        ],
        [
          "OperatingSystemNetworkInErrors",
          intl.formatMessage({ id: "in", defaultMessage: "Entry" }),
        ],
      ];
      valueType = "pps";
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

export default NetworkChart;
