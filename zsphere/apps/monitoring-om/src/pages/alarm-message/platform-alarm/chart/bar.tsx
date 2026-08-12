import { gql, useLazyQuery } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { useAlarmStore as useStore } from "@zstack/zsphere-platform-store";
import { getThemeColor, getNeutralColor } from "@zstack/zsphere-utils";
import { useUpdateEffect, useSize } from "ahooks";
import {
  Chart,
  Interval,
  Legend,
  Axis,
  Tooltip,
  Interaction,
  registerShape,
} from "bizcharts";
import dayjs from "dayjs";
import { maxBy } from "lodash-es";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

const alarmHistogramList = gql`
  query alarmHistogramList(
    $intervalHours: Int!
    $startTime: Float!
    $endTime: Float!
    $tableName: String
  ) {
    getAlarmHistogram(
      intervalHours: $intervalHours
      startTime: $startTime
      endTime: $endTime
      tableName: $tableName
    ) {
      list {
        count
        time
        emergencyLevel
      }
    }
  }
`;

type alertHistogram = {
  count: number;
  time: string;
  name: string;
  emergencyLevel: "Normal" | "Important" | "Emergent";
  isEmergentStack?: boolean;
  width?: number;
};

const ALARM_BAR_SHAPE = "alarm-message-custom";

registerShape("interval", ALARM_BAR_SHAPE, {
  draw(cfg: any, container) {
    const { points } = cfg;
    let path = [];
    path.push(["M", points[0].x, points[0].y]);
    path.push(["L", points[1].x, points[1].y]);
    path.push(["L", points[2].x, points[2].y]);
    path.push(["L", points[3].x, points[3].y]);
    path.push("Z");
    path = (this as any).parsePath(path); // 将 0 - 1 转化为画布坐标
    const originalHeight = path[0][2] - path[1][2];
    const gapHeight = 1;
    let height = originalHeight;
    if (originalHeight > 0 && originalHeight < gapHeight + 2) {
      height = gapHeight + 2;
    }

    const redHeight = cfg.data?.isEmergentStack ? gapHeight + 2 : 0;

    let _y = path[1][2];
    // 蓝色柱太小会向下延伸
    if (_y > 113 && _y < 116) {
      _y = 113;
    }

    const group = container.addGroup();
    group.addShape("rect", {
      attrs: {
        x: path[1][1],
        y: _y + gapHeight - 1 - redHeight,
        width: 12,
        height: originalHeight ? height - gapHeight + redHeight : 0,
        fill: cfg.color,
        stroke: originalHeight ? cfg.color : null,
      },
    });
    if (originalHeight > 0) {
      group.addShape("rect", {
        attrs: {
          x: path[1][1],
          y: _y - 1 - redHeight,
          width: 12,
          height: gapHeight,
          fill: "#fff",
          stroke: "#fff",
        },
      });
    }

    return group;
  },
});

const Bar = ({ startTime, endTime, intervalHours, width }: any) => {
  const intl = useIntl();
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef);
  const mode = "light";
  const query = useMemo(
    () => ({
      intervalHours,
      startTime,
      endTime,
    }),
    [startTime, endTime, intervalHours],
  );

  const [data, setData] = useState<alertHistogram[]>([]);

  const [getAlarmHistogramList, { data: histogramData }] = useLazyQuery(
    alarmHistogramList,
    {
      variables: query,
      fetchPolicy: "no-cache",
    },
  );
  useEffect(() => {
    if (endTime) {
      getAlarmHistogramList();
    }
  }, [endTime, getAlarmHistogramList]);

  const formatTimeString = useMemo(() => {
    const hourMap = {
      1: "HH:mm",
      8: "MM-DD HH:mm",
      24: "MM-DD",
    };
    return hourMap[intervalHours as 1];
  }, [intervalHours]);

  const translateI18n = useCallback(
    (emergencyLevel: string) => {
      // const name = emergencyLevel?.toLocaleLowerCase() ?? 'Normal'
      const nameMap = {
        Normal: intl.formatMessage({
          id: "emergencyLevel.normal",
          defaultMessage: "Info",
        }),
        Important: intl.formatMessage({
          id: "emergencyLevel.important",
          defaultMessage: "Major",
        }),
        Emergent: intl.formatMessage({
          id: "emergencyLevel.emergent",
          defaultMessage: "Emergent",
        }),
      };
      return nameMap[emergencyLevel as "Normal"];
    },
    [intl],
  );

  const transferArr = useCallback(
    (list: any[]) =>
      list.map((it) => ({
        count: it?.count,
        time: dayjs(it?.time).format(formatTimeString),
        name: translateI18n(it.emergencyLevel),
        emergencyLevel: it.emergencyLevel,
      })),
    [formatTimeString, translateI18n],
  );

  useUpdateEffect(() => {
    if (histogramData) {
      const { list = [] } = histogramData?.getAlarmHistogram ?? {};
      const _list = transferArr(list);

      setData(_list);
      setChartData(_list);
    }
  }, [histogramData, transferArr]);

  const colorList = new Map(
    [
      ["Normal", getThemeColor("blue", mode, 400)],
      ["Important", getThemeColor("yellow", mode, 400)],
      ["Emergent", getThemeColor("red", mode, 400)],
    ].map(([emergencyLevel, color]) => [translateI18n(emergencyLevel), color]),
  );
  const setColor = (name: string) => colorList.get(name) as string;
  const colorConfig = ["name", setColor] as [string, typeof setColor];

  const [chartData, setChartData] = useState(data);
  const { filterList: showTypeList, setFilterList: setShowTypeList } =
    useStore();

  const onClickLegend = (
    emergencyLevel: "Normal" | "Important" | "Emergent",
  ) => {
    let arr = [emergencyLevel];
    if (showTypeList?.includes(emergencyLevel) && showTypeList?.length === 1) {
      // 取消高亮
      arr = ["Normal", "Emergent", "Important"];
      setShowTypeList?.(arr);
      setChartData(data);
    } else {
      //高亮
      setShowTypeList?.(arr);
      setChartData(
        data.filter((item) => arr.map(translateI18n).includes(item.name)),
      );
    }
  };

  const countEmergencyLevel = useCallback(
    (emergencyLevel: "Normal" | "Important" | "Emergent") =>
      data.reduce((acc: any, cur) => {
        if (cur.name === translateI18n(emergencyLevel)) {
          acc += cur.count;
        }
        return acc;
      }, 0),
    [data, translateI18n],
  );

  const chartDataWithStackMeta = useMemo(
    () =>
      chartData.map((item) => ({
        ...item,
        isEmergentStack:
          item.emergencyLevel === "Emergent" &&
          chartData.filter((it) => it.time === item.time && it.count).length >
            1,
      })),
    [chartData],
  );

  const style = React.useMemo(() => (width ? { width } : {}), [width]);

  return (
    <div className={styles.bar} style={style} ref={containerRef}>
      <div className={styles.title}>
        <span className={styles["chart-title"]}>
          {intl.formatMessage({
            id: "alarmStatistics.in.recently.one.week",
            defaultMessage: "Alarm Statistics in Recent 1 Week",
          })}
        </span>

        <div className={styles["chart-title-wrap"]}>
          {["Emergent", "Important", "Normal"].map((emergencyLevel) => {
            const emergencyLevel2color = {
              Emergent: "danger",
              Important: "alert",
              Normal: "info",
            };

            return (
              <div
                key={emergencyLevel}
                className={
                  !showTypeList?.includes(emergencyLevel)
                    ? styles["opacity-6"]
                    : ""
                }
                style={{ cursor: "pointer" }}
                onClick={() => onClickLegend(emergencyLevel as "Emergent")}
              >
                <Icon
                  color={
                    emergencyLevel2color[
                      emergencyLevel as "Emergent"
                    ] as "danger"
                  }
                  type="alert-triangle-fill"
                  className={styles["chart-title-icon"]}
                />
                <span>
                  {translateI18n(emergencyLevel)}{" "}
                  {countEmergencyLevel(emergencyLevel as "Emergent") ?? 0}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <Chart
        height={118}
        data={chartDataWithStackMeta}
        autoFit
        scale={{
          count: {
            type: "linear",
            nice: true,
            tickMethod: () => {
              const tickCount = 3;
              const maxOne = maxBy(chartData, "count");
              let maxValue =
                chartData
                  .filter((it) => it.time === maxOne?.time)
                  .reduce((acc, cur) => {
                    acc += cur.count;
                    return acc;
                  }, 0) || tickCount;
              if (maxValue < tickCount) {
                maxValue = tickCount;
              } else {
                maxValue = Math.ceil(maxValue * 1.1);
              }
              const minValue = 0;
              const interval = (maxValue - minValue) / tickCount;
              const ticks: number[] = [];
              for (let tick = minValue; tick <= maxValue; tick += interval) {
                ticks.push(Math.ceil(tick));
              }
              return ticks;
            },
          },
        }}
      >
        <Legend visible={false} />
        <Interval
          adjust={[
            {
              type: "stack",
            },
          ]}
          shape={ALARM_BAR_SHAPE}
          color={colorConfig}
          position="time*count"
        />
        <Axis
          name="count"
          visible
          grid={{
            line: {
              type: "line",
              style: {
                stroke: getNeutralColor(mode, 300),
                lineDash: [3, 3],
                lineWidth: 1,
              },
            },
          }}
          label={{
            style: {
              // fill: getThemeColor('neutral', mode, 700),
              fontSize: 12,
              fontWeight: 400,
            },
          }}
        />
        <Axis
          name="time"
          visible
          grid={null}
          tickLine={null}
          label={{
            style: {
              // fill: getThemeColor('neutral', mode, 700),
              fontSize: 12,
              fontWeight: 400,
            },
            autoHide: false,
            formatter(text, _item, index) {
              if (containerSize.width && containerSize.width < 545) {
                text = text.split(" ")[0];
              }
              return index % 3 ? "" : text;
            },
          }}
        />
        <Tooltip shared />
        <Interaction type="active-region" />
      </Chart>
    </div>
  );
};

export default Bar;
