import React, { useMemo, memo } from "react";
import { useIntl } from "react-intl";

import type { UseMetricType } from "./metric-config";
import useMetricConfig from "./metric-config";
import MonitorChart from "./monitor-chart";

import style from "./style.module.less";

interface IProps {
  [key: string]: any;
}

// 兼容 4.1.2 之前的版本
const getDefaultLabel = (
  currentConfig?: any,
  monitorItem?: string,
  intl?: any,
) => {
  const { label } = currentConfig;
  const childLabel = currentConfig?.children?.filter(
    (it: any) => it?.value === monitorItem,
  )?.[0]?.label;
  switch (currentConfig?.resourceKey) {
    case "cpu":
    case "memory":
    case "primaryStorage":
      return childLabel
        ? label + childLabel
        : label +
            intl.formatMessage({
              id: "allocationRate",
              defaultMessage: "Allocation Ratio",
            });
    case "backupStorage":
      return childLabel
        ? label + childLabel
        : label +
            intl.formatMessage({ id: "usedRate", defaultMessage: " Utilization" });
    case "ipv6Public":
    case "ipv6Private":
    case "ipv4Public":
    case "ipv4Private":
    case "publicNetwork":
    case "flatNetwork":
    case "vpcNetwork":
      return childLabel
        ? `${label}${intl.formatMessage({
            id: "IPUsedRate",
            defaultMessage: "IP Utilization",
          })}-${childLabel}`
        : label +
            intl.formatMessage({ id: "usedRate", defaultMessage: " Utilization" });
    case "imageSize":
    case "storageSize":
      return label;
    default:
      return label + childLabel;
  }
};
export const getDefaultConfig = (
  resourceKey?: string,
  monitorItem?: string,
) => {
  if (!monitorItem) {
    switch (resourceKey) {
      case "cpu":
      case "memory":
      case "primaryStorage":
        return {
          resourceKey,
          monitorItem: "allocation",
        };
      case "backupStorage":
      case "imageSize":
      case "storageSize":
        return {
          resourceKey,
          monitorItem: "usedRate",
        };
      case "ipv6Public":
        return {
          resourceKey: "publicNetwork",
          monitorItem: "ipv6",
        };
      case "ipv6Private":
        return {
          resourceKey: "flatNetwork",
          monitorItem: "ipv6",
        };
      case "ipv4Public":
        return {
          resourceKey: "publicNetwork",
          monitorItem: "ipv4",
        };
      case "ipv4Private":
        return {
          resourceKey: "flatNetwork",
          monitorItem: "ipv4",
        };
      default:
        return {
          resourceKey,
          monitorItem,
        };
    }
  } else {
    return {
      resourceKey,
      monitorItem,
    };
  }
};

const UsageStatisticsWidget: React.FC<IProps> = memo(
  ({ statisticsResource, monitorItem, isEditable }) => {
    const intl = useIntl();
    const { metricConfig } = useMetricConfig();

    // 使用 useMemo 稳定化配置计算
    const defaultConfig = useMemo(
      () => getDefaultConfig(statisticsResource, monitorItem),
      [statisticsResource, monitorItem],
    );

    const _statisticsResource = defaultConfig?.resourceKey;
    const _monitorItem = defaultConfig?.monitorItem || monitorItem;

    const currentConfig = useMemo(
      () =>
        metricConfig
          .filter(
            (item: UseMetricType) => item.resourceKey === _statisticsResource,
          )
          .map((item: UseMetricType) => ({
            ...item,
            value: _monitorItem,
          })),
      [metricConfig, _monitorItem, _statisticsResource],
    );

    const config = currentConfig?.[0];

    const data = useMemo(() => {
      if (!config) {
        return null;
      }
      return {
        ...config,
        label:
          getDefaultLabel(config, _monitorItem, intl) || config.label || "",
      };
    }, [config, _monitorItem, intl]);

    if (!data) {
      return null;
    }

    return (
      <div className={style.container}>
        <MonitorChart
          currentParams={data}
          monitorItem={_monitorItem}
          isEditable={isEditable}
        />
      </div>
    );
  },
);

export default UsageStatisticsWidget;
