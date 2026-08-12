import { Col, Row } from "antd";
import _ from "lodash-es";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { customRenderEmpty } from "../empty";
import { IChartMonitorProps } from "./type";
import {
  formatTime,
  getStrokeColor,
  getThemeColorList,
  getTimeAxisFormatter,
  getValueFormatter,
  getValueTicks,
} from "./util";

import style from "./style.module.less";

const ChartMonitor: React.FC<IChartMonitorProps> = ({
  dataSource = [],
  startTime,
  endTime,
  title,
  extra,
  width,
  height = 130,
  autoFit = true,
  isEmpty = false,
  nameFormatter,
  labelFormatter,
  padding,
  valueType,
  valueFormatter: customValueFormatter,
  valueTickCount = 4,
  tooltipExtra,
  timeMask = "YYYY-MM-DD HH:mm:ss",
  timeTickCount = 6,
  syncId,
}) => {
  // 折线图的线条颜色
  const themeColorList = useMemo(() => {
    const typeList = _.uniqBy(dataSource, "type").map((item: any) => item.type);
    const typeCount = typeList.length;
    return getThemeColorList(typeCount);
  }, [dataSource]);

  // 坐标轴和参考线的线条颜色
  const strokeColor = getStrokeColor();

  // x轴（时间）的格式化方法
  const timeAxisFormatter = useMemo(
    () => getTimeAxisFormatter(startTime, endTime),
    [startTime, endTime],
  );

  // y轴以及tooltip中值的格式化方法
  const valueFormatter = customValueFormatter || getValueFormatter(valueType);

  // 按type分组数据，准备用于recharts
  const chartData = useMemo(() => {
    if (!dataSource || dataSource.length === 0) {
      return [];
    }
    // 先标准化时间格式为数值
    const normalizedData = dataSource.map((item) => ({
      ...item,
      time: typeof item.time === "number" ? item.time : Number(item.time),
    }));

    // 按时间分组，合并相同时间的不同type
    const groupedByTime = _.groupBy(normalizedData, "time");
    const sorted = Object.entries(groupedByTime).sort(
      ([timeA], [timeB]) => Number(timeA) - Number(timeB),
    );
    return sorted.map(([time, items]: any) => {
      const dataPoint: Record<string, number> = { time: Number(time) };
      items.forEach((item: any) => {
        dataPoint[item.type] = item.value;
      });
      return dataPoint;
    });
  }, [dataSource]);

  // 获取所有的type
  const types = useMemo(() => {
    if (!dataSource || dataSource.length === 0) {
      return [];
    }
    return _.uniqBy(dataSource, "type").map((item: any) => item.type) as any[];
  }, [dataSource]);

  // 计算Y轴的ticks
  const yAxisTicks = useMemo(() => {
    if (!dataSource || dataSource.length === 0) {
      return [0, 1, 2, 3, 4];
    }
    const values = dataSource.map((item) => item.value);
    const max = _.max(values);
    return getValueTicks({
      max,
      count: valueTickCount,
      type: valueType,
    });
  }, [dataSource, valueTickCount, valueType]);

  // Freeze tooltip when mouse hovers over it (enables scrolling)
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const frozenPayloadRef = useRef<any>(null);

  const handleTooltipMouseEnter = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTooltipHovered(true);
  }, []);

  const handleTooltipMouseLeave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTooltipHovered(false);
    frozenPayloadRef.current = null;
  }, []);

  const handleTooltipMouseMove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div className={style["chart-monitor"]}>
      {(title || extra) && (
        <Row justify="space-between" className={style["chart-monitor-head"]}>
          <Col>{title}</Col>
          <Col>{extra}</Col>
        </Row>
      )}
      <div>
        {isEmpty || dataSource.length === 0 ? (
          customRenderEmpty({
            type: "Table",
            style: {
              height,
            },
          })
        ) : (
          <ResponsiveContainer
            height={height || 130}
            width={autoFit ? "100%" : width}
          >
            <LineChart
              data={chartData}
              margin={{
                top: padding?.[0] ?? 20,
                right: padding?.[1] ?? 20,
                bottom: padding?.[2],
                left: padding?.[3],
              }}
              syncId={syncId}
            >
              <CartesianGrid
                strokeDasharray="2 2"
                stroke={strokeColor}
                vertical={false}
              />
              <XAxis
                dataKey="time"
                type="number"
                domain={[Number(startTime), Number(endTime)]}
                tickFormatter={(value) => timeAxisFormatter(value)}
                tickCount={timeTickCount}
                stroke={strokeColor}
                tick={{ fill: "#707275", fontSize: 12, dy: 6 }}
                axisLine={{ strokeWidth: 1 }}
                tickLine={{ stroke: strokeColor }}
              />
              <YAxis
                ticks={yAxisTicks}
                tickFormatter={(value) => valueFormatter(String(value))}
                domain={[
                  0,
                  yAxisTicks.length > 0
                    ? yAxisTicks[yAxisTicks.length - 1]
                    : "auto",
                ]}
                tickCount={valueTickCount}
                stroke={strokeColor}
                tick={{ fill: "#707275", fontSize: 12 }}
                width={80}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={
                  isTooltipHovered
                    ? false
                    : {
                        stroke: strokeColor,
                        strokeWidth: 1,
                      }
                }
                isAnimationActive={false}
                content={({ active, payload, coordinate }) => {
                  if (!active || !payload || !payload.length) {
                    if (isTooltipHovered && frozenPayloadRef.current) {
                      // Use frozen data while hovering tooltip
                    } else {
                      return null;
                    }
                  }

                  // Freeze payload when tooltip is hovered
                  const displayPayload =
                    isTooltipHovered && frozenPayloadRef.current
                      ? frozenPayloadRef.current
                      : payload;

                  if (!isTooltipHovered && payload && payload.length) {
                    frozenPayloadRef.current = payload;
                  }

                  if (!displayPayload || !displayPayload.length) return null;

                  const timeValue = displayPayload[0]?.payload?.time;
                  const titleTime = formatTime(timeValue, timeMask);

                  // 获取 tooltipExtra
                  let titleExtra = "";
                  if (tooltipExtra) {
                    const datum = chartData.find((d) => d.time === timeValue);
                    if (datum) {
                      const metricName = types[0];
                      titleExtra = tooltipExtra(metricName);
                    }
                  }

                  const fullTitle = titleExtra
                    ? `${titleTime} ${titleExtra}`
                    : titleTime;

                  return (
                    <div
                      className={style.tooltip}
                      onMouseEnter={handleTooltipMouseEnter}
                      onMouseLeave={handleTooltipMouseLeave}
                      onMouseMove={handleTooltipMouseMove}
                    >
                      <div className={style.tooltipTitle}>{fullTitle}</div>
                      <div>
                        {displayPayload.map(
                          (entry: Record<string, any>, index: number) => {
                            const itemType = String(entry.name);
                            const typeList = _.split(itemType, "-", 2);
                            const hasLabel = typeList.length === 2;
                            const metricName = hasLabel
                              ? typeList[1]
                              : itemType;

                            let itemName = nameFormatter
                              ? nameFormatter(metricName)
                              : itemType;
                            if (hasLabel) {
                              const label = labelFormatter
                                ? labelFormatter(typeList[0])
                                : typeList[0];
                              itemName = [label, itemName].join("-");
                            }

                            const itemValue = valueFormatter
                              ? valueFormatter(String(entry.value))
                              : entry.value;

                            return (
                              <div
                                key={`item-${index}`}
                                className={style.tooltipListItem}
                              >
                                <div
                                  className={style.tooltipMarker}
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className={style.tooltipName}>
                                  {itemName}:
                                </span>
                                <span className={style.tooltipValue}>
                                  {itemValue}
                                </span>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  );
                }}
              />
              {types.map((type, index) => (
                <Line
                  key={type}
                  type="monotone"
                  dataKey={type}
                  stroke={themeColorList[index]}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={0}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default React.memo(ChartMonitor);
