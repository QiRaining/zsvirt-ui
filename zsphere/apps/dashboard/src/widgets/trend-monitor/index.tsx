import { gql, useLazyQuery } from "@apollo/client";
import { Text, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Link } from "@zstack/zsphere-components";
import { useInterval, useUnmount, useUpdateEffect } from "ahooks";
import dayjs from "dayjs";
import { find as _find, groupBy } from "lodash-es";
import React, { useMemo, useState, useCallback, useRef } from "react";
import { useIntl } from "react-intl";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

import AutoSkeleton from "../../components/auto-skeleton";
import Empty from "../../components/empty";
import { useDashboardStore } from "../../store/use-dashboard-store";
import { formatUnit, getColor } from "../../utils";
import useWidgetConfig from "../widgets-config";
import { ChartContainer, ChartTooltip } from "./chart";
import type { IMetricConfig } from "./metric-config";
import useMetricConfig from "./metric-config";

import style from "./style.module.less";

const queryWidgetMonitorTrend = gql`
  query queryWidgetMonitorTrend(
    $namespace: String!
    $metricNameList: [String!]!
    $offset: Int!
    $calculateType: String!
    $zoneUuid: String
  ) {
    queryWidgetMonitorTrend(
      namespace: $namespace
      metricNameList: $metricNameList
      offset: $offset
      calculateType: $calculateType
      zoneUuid: $zoneUuid
    ) {
      list {
        time
        value
        type
      }
      currentValue
    }
  }
`;

interface IProps {
  [key: string]: unknown;
  resource: string;
  metricName: string;
}

interface IMetricData {
  time: number;
  type: string;
  value: number;
}

const TrendMonitorWidget: React.FC<IProps> = React.memo(
  ({ trendResource: resource, trendMetricName: metricName, isEditable }) => {
    const normalizeData = useCallback(
      (data: IMetricData[]) =>
        data.map((item) => ({
          ...item,
          time: item.time < 1e12 ? item.time * 1000 : item.time,
        })),
      [],
    );

    const intl = useIntl();
    const { metricConfig } = useMetricConfig();
    const zoneUuid = useDashboardStore((state) => state.zoneUuid);
    const { refreshInterval } = useWidgetConfig();
    const [list, setList] = useState<IMetricData[]>([]);
    const [currentValueList, setCurrentValueList] = useState<number[]>([]);
    const [initialed, setInitialed] = useState(false);
    const [interval, setInterval] = useState<number | null>(refreshInterval);
    const currentResource = useMemo(
      () =>
        _find(metricConfig, { value: resource }) as IMetricConfig | undefined,
      [metricConfig, resource],
    );
    const currentItem = useMemo(
      () =>
        _find(currentResource?.children, { value: metricName }) as
          | IMetricConfig["children"][0]
          | undefined,
      [currentResource?.children, metricName],
    );
    const xTicks = useMemo(() => {
      if (list.length === 0) {
        return [];
      }
      const allTimes = [...new Set(list.map((item) => item.time))].sort(
        (a, b) => a - b,
      );
      return allTimes.slice(11);
    }, [list]);
    const metricNameList = useMemo(
      () => String(metricName).split(","),
      [metricName],
    );
    const isMultiple = metricNameList.length > 1;

    // 预计算 groupBy 结果，避免在渲染时重复计算
    const groupedList = useMemo(
      () => Object.values(groupBy(list, "type")),
      [list],
    );

    const [getMetricData, { loading }] = useLazyQuery(queryWidgetMonitorTrend, {
      onCompleted(data) {
        const { list: remoteList = [], currentValue = [] } =
          data?.queryWidgetMonitorTrend ?? {};
        setList(normalizeData(remoteList));
        setCurrentValueList(currentValue);
        setInitialed(true);
      },
      fetchPolicy: "no-cache",
    });

    // 使用 ref 存储函数引用，避免依赖不稳定
    const getMetricDataRef = useRef(getMetricData);
    getMetricDataRef.current = getMetricData;

    const runRequest = useCallback(() => {
      if (!currentResource || !currentItem) {
        setInitialed(true);
        return;
      }
      getMetricDataRef.current({
        variables: {
          namespace: currentResource.namespace,
          metricNameList,
          offset: 300,
          calculateType: currentItem.calculateType || "average",
          zoneUuid,
        },
      });
    }, [currentResource, currentItem, metricNameList, zoneUuid]);

    useInterval(runRequest, interval, {
      immediate: true,
    });

    useUnmount(() => {
      setInterval(null);
    });

    useUpdateEffect(() => {
      runRequest();
    }, [zoneUuid]);

    const getRenderLinkProps = useCallback(() => {
      switch (currentResource?.value) {
        case "backupStorage":
          return {
            to: "/backup-storage",
            microAppName: "hardware",
          };
        case "primaryStorage":
          return {
            to: "/primary-storage",
            microAppName: "hardware",
          };
        case "host":
          return {
            to: "/host",
            microAppName: "hardware",
          };
        default:
          return {
            to: "/dashboard",
          };
      }
    }, [currentResource?.value]);

    const chartConfig = useMemo(
      () => ({
        desktop: {
          label: "type",
          color: "rgba(152, 215, 254, 0.2)",
        },
        mobile: {
          label: "type",
          color: "rgba(255, 225, 153, 0.2)",
        },
      }),
      [],
    );

    const linkProps = useMemo(() => getRenderLinkProps(), [getRenderLinkProps]);
    const { to, microAppName } = linkProps;

    if (!currentResource || !currentItem) {
      return null;
    }

    return (
      <div className={style.container}>
        <AutoSkeleton
          name={`trend-monitor-${resource}-${metricName}`}
          loading={loading && !initialed}
        >
          <div className={style.title}>
            <Text>{currentItem?.name}</Text>
            {!isEditable && (
              <Tooltip
                title={intl.formatMessage({
                  id: "read.more",
                  defaultMessage: "More",
                })}
              >
                <div className={style.jumpToContainer}>
                  <Link to={to} microAppName={microAppName} isRouterManaged>
                    <Icon type="arrow-right" />
                  </Link>
                </div>
              </Tooltip>
            )}
          </div>
          {list.length > 0 && (
            <div className={style.legendContainer}>
              {currentValueList.map((currentValue, i) => (
                <span className={style.legendItem} key={i}>
                  <div
                    className={style.legendDot}
                    style={{ background: getColor(i) }}
                  />
                  <span className={style.legendName}>
                    {isMultiple
                      ? currentItem?.scale?.type?.formatter?.(
                          metricNameList[i],
                        ) || ""
                      : currentItem?.scale?.type?.formatter?.() || ""}
                  </span>
                  <span className={style.legendValue}>
                    {
                      formatUnit(
                        currentItem?.unit,
                        currentValue,
                        currentValue,
                      )[1]
                    }
                  </span>
                </span>
              ))}
            </div>
          )}
          {list.length > 0 ? (
            <ChartContainer
              className={style.chartContainer}
              config={chartConfig}
            >
              <AreaChart accessibilityLayer data={list}>
                <YAxis
                  label={currentItem?.scale?.value?.label}
                  hide={true}
                  domain={currentItem?.scale?.domain}
                />
                <XAxis
                  dataKey="time"
                  interval={15}
                  name={currentItem?.scale?.time?.label}
                  allowDuplicatedCategory={false}
                  stroke="#C8CACD"
                  tick={{ fill: "#707275" }}
                  tickMargin={8}
                  minTickGap={24}
                  ticks={xTicks}
                  tickFormatter={(timestamp) => {
                    return dayjs(timestamp)
                      .format("yyyy-MM-DD HH:mm:ss")
                      .slice(11, 16);
                  }}
                  textAnchor="end"
                />
                <defs>
                  <linearGradient id="colorType0" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={getColor(0)}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={getColor(0)}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorType1" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={getColor(1)}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={getColor(1)}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) {
                      return null;
                    }
                    return (
                      <div className="min-w-[180px] rounded border border-gray-200 bg-white p-2 shadow">
                        {/* 标题/时间戳 */}
                        <div className="mb-1 border-b border-gray-100 pb-1 text-sm text-gray-500">
                          {dayjs(payload[0]?.payload?.time).format(
                            "yyyy-MM-DD HH:mm:ss",
                          )}
                        </div>

                        {/* 数据项列表 */}
                        <div className="pt-1">
                          {payload.map((entry, index) => {
                            const formattedValue =
                              currentItem?.scale?.value?.formatter?.(
                                entry.value,
                              );
                            return (
                              <div
                                key={`item-${index}`}
                                className="flex items-center gap-2 py-0.5"
                              >
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm font-medium">
                                  {entry.name}:
                                </span>
                                <span className="ml-auto text-sm">
                                  {formattedValue}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }}
                />
                {groupedList.map((item, index) => {
                  return (
                    <Area
                      key={`area-${index}`}
                      data={item}
                      type="linear"
                      name={currentItem?.scale?.type?.formatter?.(
                        item[0]?.type,
                      )}
                      dataKey="value"
                      stroke={getColor(index)}
                      fillOpacity={1}
                      fill={`url(#colorType${index})`}
                    />
                  );
                })}
                {/* 区域图 */}
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex w-full flex-1 items-center justify-center">
              <Empty />
            </div>
          )}
        </AutoSkeleton>
      </div>
    );
  },
);

export default TrendMonitorWidget;
