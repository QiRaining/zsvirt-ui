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

const NetworkChart: FC<IProps> = ({ monitorKey, isEmpty, ...props }) => {
  const intl = useIntl();
  let title: string = "";
  let initMetricNames: string[] = [];
  let metricNameList: [string, string][] = [];
  let valueType: IBusinessMonitorValueType = "bytesSpeed";

  switch (monitorKey) {
    case "NetworkOutBytes":
      title = intl.formatMessage({
        id: "network.bytes.speed",
        defaultMessage: "NIC Data Transfer Rate",
      });
      initMetricNames = ["NetworkOutBytes", "NetworkInBytes"];
      metricNameList = [
        [
          "NetworkOutBytes",
          intl.formatMessage({ id: "dataOut", defaultMessage: "Out" }),
        ],
        [
          "NetworkInBytes",
          intl.formatMessage({ id: "dataIn", defaultMessage: "In" }),
        ],
      ];
      valueType = "bytesSpeed";
      break;
    case "NetworkOutPackets":
      title = intl.formatMessage({
        id: "network.packets.speed",
        defaultMessage: "NIC Packet Rate",
      });
      initMetricNames = ["NetworkOutPackets", "NetworkInPackets"];
      metricNameList = [
        [
          "NetworkOutPackets",
          intl.formatMessage({ id: "dataOut", defaultMessage: "Out" }),
        ],
        [
          "NetworkInPackets",
          intl.formatMessage({ id: "dataIn", defaultMessage: "In" }),
        ],
      ];
      valueType = "pps";
      break;
    case "NetworkOutErrors":
      title = intl.formatMessage({
        id: "network.error.speed",
        defaultMessage: "NIC Packet Discard Rate",
      });
      initMetricNames = ["NetworkOutErrors", "NetworkInErrors"];
      metricNameList = [
        [
          "NetworkOutErrors",
          intl.formatMessage({ id: "out", defaultMessage: "Exit" }),
        ],
        [
          "NetworkInErrors",
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

export default NetworkChart;
