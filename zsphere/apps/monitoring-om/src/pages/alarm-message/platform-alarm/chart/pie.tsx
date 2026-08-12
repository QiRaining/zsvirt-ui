import { useLazyQuery, gql } from "@apollo/client";
import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useMetricNameConfig } from "@zstack/zsphere-components";
import { useAlarmStore as useStore } from "@zstack/zsphere-platform-store";
import { Op } from "@zstack/zsphere-types";
import { getThemeColor } from "@zstack/zsphere-utils";
import { useUpdateEffect } from "ahooks";
import { Chart, Axis, Tooltip, Interval, Coordinate, Legend } from "bizcharts";
import classnames from "classnames";
import { flatten } from "lodash-es";
import { useState, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

const getCountByNamespace = gql`
  query getCountByNamespace(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    getCountByNamespace(
      conditions: $conditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        count
        namespace
      }
    }
  }
`;

const mode = "light";

const colorListLess7 = (
  ["blue", "yellow", "green", "violet", "teal", "yellow-green"] as const
).map((color) => getThemeColor(color, mode, 400));

const colorListOver7 = flatten(
  (
    [
      "blue",
      "yellow",
      "green",
      "violet",
      "teal",
      "purple",
      "red",
      "yellow-green",
    ] as const
  ).map((color) => [
    getThemeColor(color, mode, 400),
    getThemeColor(color, mode, 200),
  ]),
);

const PieChart = ({ startTime, endTime }: any) => {
  const intl = useIntl();
  const { translateNamespaceToName } = useMetricNameConfig();

  const query = useMemo(
    () => ({
      conditions: [
        {
          key: "createTime",
          op: Op.gte,
          value: String(startTime),
        },
        {
          key: "createTime",
          op: Op.lte,
          value: String(endTime),
        },
      ],
    }),
    [startTime, endTime],
  );

  const [countByNamespace, { data: countData }] = useLazyQuery(
    getCountByNamespace,
    {
      variables: query,
      fetchPolicy: "no-cache",
    },
  );

  useEffect(() => {
    if (endTime) {
      countByNamespace();
    }
  }, [countByNamespace, endTime]);

  useUpdateEffect(() => {
    if (countData) {
      const list = countData?.getCountByNamespace?.list?.map((it: any) => ({
        type: it?.namespace,
        value: it?.count,
      }));
      setData(list ?? []);
    }
  }, [countData]);

  const [data, setData] = useState<any[]>([]);
  const { resourceType: modelResourceType, setResourceType } = useStore();
  const showTypeList = useMemo(() => {
    return modelResourceType === "all"
      ? data.map((item) => item.type)
      : [modelResourceType];
  }, [data, modelResourceType]);
  const chartData = useMemo(() => {
    return modelResourceType === "all"
      ? data
      : data.filter((item) => item.type === modelResourceType);
  }, [data, modelResourceType]);

  const onClickLegend = (resourceType: string) => {
    if (modelResourceType === resourceType) {
      setResourceType("all");
    } else {
      setResourceType(resourceType);
    }
  };

  const colorList = useMemo(
    () => (data?.length > 6 ? colorListOver7 : colorListLess7),
    [data],
  );
  const setColor = (name: string) => {
    const index = data.findIndex((item) => item.type === name);
    return colorList[index % colorList.length];
  };
  const colorConfig = ["type", setColor] as [string, typeof setColor];

  return (
    <div
      className={classnames(styles.pie, { [styles.emptyChart]: !data?.length })}
    >
      <Text className={styles["chart-title"]}>
        {intl.formatMessage({
          id: "alarmDistribution.in.recently.one.week",
          defaultMessage: "Alarm Distribution in Recent 1 Week",
        })}
      </Text>
      <div className={styles.chartWrap}>
        <div className={styles.annotation}>
          <div className={styles.totalCountTitle}>
            {intl.formatMessage({
              id: "alarm.message.total.count",
              defaultMessage: "Total",
            })}
          </div>
          <div className={styles.totalCountNumber}>
            {chartData.reduce((acc, cur) => {
              acc += cur.value;
              return acc;
            }, 0)}
          </div>
        </div>
        <Chart data={chartData} height={25} autoFit>
          <Coordinate type="rect" transpose />
          <Axis visible={false} />
          <Tooltip showTitle={false}>
            {(title, items: any) => {
              const color = items[0]?.color;
              const value = items[0]?.value;
              return (
                <div className={styles.tooltip}>
                  <div>
                    <span
                      className={styles.dot}
                      style={{ backgroundColor: color }}
                    />
                    {title}:
                  </div>
                  {value}
                </div>
              );
            }}
          </Tooltip>
          <Legend visible={false} />
          <Interval
            adjust="stack"
            position="value"
            color={colorConfig}
            tooltip={{
              fields: ["type", "value"],
              callback: (type, value) => ({
                name: translateNamespaceToName(type),
                value,
              }),
            }}
            style={{
              lineWidth: 1,
              stroke: "#fff",
            }}
          />
        </Chart>

        <div className={styles["legend-wrap"]}>
          {!data?.length && (
            <div className={styles.emptyLegend}>
              <Icon size={12} type="inbox-fill" />
              <span className={styles.emptyLabel}>
                {intl.formatMessage({
                  id: "no.data",
                  defaultMessage: "No Data",
                })}
              </span>
            </div>
          )}
          {data?.map(({ type: key, value }, index) => (
            <div
              className={classnames(styles["legend-item"], {
                [styles["opacity-6"]]: !showTypeList.includes(key),
              })}
              onClick={() => onClickLegend(key)}
              key={key}
            >
              <div className={styles.itemWrap}>
                <div
                  className={styles["legend-icon"]}
                  style={{
                    backgroundColor: colorList[index % colorList.length],
                  }}
                />
                <div className={styles["legend-key"]}>
                  <Text>{translateNamespaceToName(key)}</Text>
                </div>
              </div>
              <div>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChart;
