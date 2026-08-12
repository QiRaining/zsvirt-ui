import { Op } from "@zstack/zsphere-types";
import { MetricParam } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useContext } from "react";

import Monitor from "./chart-monitor";
import { BusinessMonitorContext } from "./context";
import { useMonitorData, useMonitorNameFormatter } from "./hooks";
import { monitorStore } from "./store";
import { IBusinessMonitorProps } from "./type";

const BusinessMonitorChart: React.FC<IBusinessMonitorProps> = ({
  uuid,
  namespace,
  resourceType,
  resourceKey,
  resourceConditions,
  metricNameMap,
  metricNames,
  metricNamesWithoutLabel,
  labels,
  labelName,
  isEmpty,
  ...otherProps
}) => {
  const { syncId } = useContext(BusinessMonitorContext);
  const { getMonitorData, monitorData } = useMonitorData();
  const { startTime, endTime } = monitorStore();

  const nameFormatter = useMonitorNameFormatter(metricNameMap);

  useEffect(() => {
    if (!isEmpty && startTime && endTime) {
      const period = Math.round(Math.abs(endTime - startTime) / 300000);
      const metricParams: MetricParam[] = [];
      if (metricNamesWithoutLabel && metricNamesWithoutLabel.length > 0) {
        metricNamesWithoutLabel.forEach((metricName) => {
          const param: MetricParam = {
            metricName,
            namespace,
            startTime,
            endTime,
            period,
            conditions: [],
          };
          if (resourceKey) {
            param.conditions?.push({ key: resourceKey, value: uuid });
          }
          metricParams.push(param);
        });
      }
      if (metricNames && metricNames.length > 0) {
        metricNames.forEach((metricName) => {
          const param: MetricParam = {
            metricName,
            namespace,
            startTime,
            endTime,
            period,
            conditions: [],
          };
          if (resourceKey) {
            param.conditions?.push({ key: resourceKey, value: uuid });
          }
          if (labelName && labels && labels.length > 0) {
            param.conditions?.push({
              key: labelName,
              op: Op.in,
              values: labels,
            });
          }
          metricParams.push(param);
        });
      }
      if (metricParams.length > 0) {
        getMonitorData({
          variables: {
            type: resourceType,
            conditions: resourceConditions || [
              {
                key: "uuid",
                value: uuid,
              },
            ],
            metricParams,
          },
        });
      }
    }
  }, [
    metricNames,
    metricNamesWithoutLabel,
    labels,
    uuid,
    namespace,
    startTime,
    endTime,
    labelName,
    resourceKey,
    resourceType,
    resourceConditions,
    isEmpty,
    getMonitorData,
  ]);

  return (
    <Monitor
      dataSource={monitorData}
      nameFormatter={nameFormatter}
      startTime={startTime}
      endTime={endTime}
      isEmpty={isEmpty}
      syncId={syncId}
      {...otherProps}
    />
  );
};

export default React.memo(BusinessMonitorChart);
