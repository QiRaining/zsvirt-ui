import { BusinessMonitor } from "@zstack/zsphere-components";
import { GetMetricDataQueryType } from "@zstack/zsphere-types";
import { useState, useMemo } from "react";
import { useIntl } from "react-intl";

const { MonitorChart, MonitorTitle } = BusinessMonitor;

export interface IBlockDeviceChartProps {
  uuid: string;
  monitorKey?: string;
  labels?: string[];
  labelFormatter?: (label: string) => string;
}

export default function BlockDeviceChart({
  uuid,
  monitorKey,
  labels,
  labelFormatter,
}: IBlockDeviceChartProps) {
  const intl = useIntl();

  const {
    title = "",
    initMetricNames,
    metricNameMap,
    valueType,
  } = useMemo(() => {
    switch (monitorKey) {
      case "LunSpeed":
        return {
          title: intl.formatMessage({
            id: "block.device.speed",
            defaultMessage: "LUN Speed",
          }),
          initMetricNames: ["DiskReadBytesWwid", "DiskWriteBytesWwid"],
          metricNameMap: new Map([
            [
              "DiskReadBytesWwid",
              intl.formatMessage({ id: "read", defaultMessage: "Read" }),
            ],
            [
              "DiskWriteBytesWwid",
              intl.formatMessage({ id: "write", defaultMessage: "Write" }),
            ],
          ]),
          valueType: "bytesSpeed" as const,
        };
      case "LunIops":
        return {
          title: intl.formatMessage({
            id: "block.device.iops",
            defaultMessage: "LUN IOPS",
          }),
          initMetricNames: ["DiskReadOpsWwid", "DiskWriteOpsWwid"],
          metricNameMap: new Map([
            [
              "DiskReadOpsWwid",
              intl.formatMessage({ id: "read", defaultMessage: "Read" }),
            ],
            [
              "DiskWriteOpsWwid",
              intl.formatMessage({ id: "write", defaultMessage: "Write" }),
            ],
          ]),
          valueType: "ops" as const,
        };
      case "LunLatency":
        return {
          title: intl.formatMessage({
            id: "block.device.latency",
            defaultMessage: "LUN Latency",
          }),
          initMetricNames: ["DiskLatencyWwid"],
          metricNameMap: new Map([
            [
              "DiskLatencyWwid",
              intl.formatMessage({
                id: "block.device.latency",
                defaultMessage: "LUN Latency",
              }),
            ],
          ]),
          valueType: "latency" as const,
        };
      default:
        throw new Error("unknown monitor key");
    }
  }, [intl, monitorKey]);

  const [metricNames, setMetricNames] = useState(initMetricNames);

  return (
    <MonitorChart
      uuid={uuid}
      namespace="ZStack/Host"
      resourceType={GetMetricDataQueryType.GetHostMultiPathMetric}
      resourceKey="HostUuid"
      labelName="Wwid"
      labels={labels}
      labelFormatter={labelFormatter}
      valueType={valueType}
      metricNames={metricNames}
      metricNameMap={metricNameMap}
      isEmpty={!labels?.length || !metricNames?.length}
      title={
        <MonitorTitle
          title={title}
          {...(monitorKey !== "LunLatency" && {
            value: metricNames,
            onChange: setMetricNames,
            metricNameMap,
            multiple: true,
            dropdownWidth: "xs",
          })}
        />
      }
    />
  );
}
