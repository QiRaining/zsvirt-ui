import { gql, useQuery } from "@apollo/client";
import { BusinessMonitor } from "@zstack/zsphere-components";
import { GetMetricDataQueryType, Op } from "@zstack/zsphere-types";
import type { SharedBlock } from "@zstack/zsphere-types/graphql";
import { useState, useMemo } from "react";
import { useIntl } from "react-intl";

const { MonitorCard, MonitorChart, MonitorTitle, MonitorSelect } =
  BusinessMonitor;

const hostList = gql`
  query hostList($conditions: [Condition!]) {
    hostList(conditions: $conditions) {
      list {
        uuid
        name
      }
    }
  }
`;

export interface IProps {
  current: SharedBlock;
}

export default function Performance({ current, ...props }: IProps) {
  const intl = useIntl();
  const [labels, setLabels] = useState<string[]>([]);

  const { data } = useQuery(hostList, {
    variables: {
      conditions: [
        {
          key: "__SharedBlockUuid__",
          op: Op.eq,
          value: current?.uuid ?? "",
        },
      ],
    },
    onCompleted: (result) => {
      const value = result?.hostList?.list?.[0]?.uuid;
      if (value) {
        setLabels([value]);
      }
    },
  });

  const [options, optionMap] = useMemo(() => {
    const list: Array<{ label: string; value: string }> =
      data?.hostList?.list?.map((item: any) => ({
        label: item.name,
        value: item.uuid,
      })) ?? [];
    const map = new Map(list.map((item) => [item.value, item.label]));
    return [list, map];
  }, [data]);

  return (
    <MonitorCard
      title={intl.formatMessage({
        id: "shared.block.perf.monitor",
        defaultMessage: "LUN Performance Monitoring",
      })}
      extra={
        <MonitorSelect value={labels} onChange={setLabels} options={options} />
      }
      monitorKeys={["speed", "iops", "latency"]}
      singleColumn
      {...props}
    >
      <BlockDeviceChart
        current={current}
        labels={labels}
        labelFormatter={(value) => optionMap.get(value) ?? value}
      />
    </MonitorCard>
  );
}

interface IBlockDeviceChartProps {
  current: SharedBlock;
  monitorKey?: string;
  labels?: string[];
  labelFormatter?: (label: string) => string;
}

function BlockDeviceChart({
  current,
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
      case "speed":
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
      case "iops":
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
      case "latency":
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
      uuid={current?.diskUuid ?? ""}
      namespace="ZStack/Host"
      resourceType={GetMetricDataQueryType.GetHostMultiPathMetric}
      resourceKey="Wwid"
      labelName="HostUuid"
      labels={labels}
      labelFormatter={labelFormatter}
      valueType={valueType}
      metricNames={metricNames}
      metricNameMap={metricNameMap}
      isEmpty={!labels?.length || !metricNames?.length}
      resourceConditions={[{ key: "uuid", op: Op.in, values: labels }]}
      title={
        <MonitorTitle
          title={title}
          {...(monitorKey !== "latency" && {
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
