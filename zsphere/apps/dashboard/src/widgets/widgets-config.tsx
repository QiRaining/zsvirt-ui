import { useIntl } from "react-intl";

import thumbnailWidgetAlarmInfoSvg from "../assets/images/thumbnail-widget-alarm-info.webp";
import thumbnailWidgetBillingStatisticsSvg from "../assets/images/thumbnail-widget-billing-statistics.webp";
import thumbnailWidgetInspectionSvg from "../assets/images/thumbnail-widget-inspection.webp";
import thumbnailWidgetRecentVisitSvg from "../assets/images/thumbnail-widget-recent-visit.webp";
import thumbnailWidgetStateMonitorSvg from "../assets/images/thumbnail-widget-state-monitor.webp";
import thumbnailWidgetTopMonitorSvg from "../assets/images/thumbnail-widget-top-monitor.webp";
import thumbnailWidgetUsageStatisticsSvg from "../assets/images/thumbnail-widget-usage-statistics.webp";
import thumbnailWidgetUserInfoSvg from "../assets/images/thumbnail-widget-user-info.webp";
import StateMonitorMetricConfig from "./state-monitor/metric-config";
import TopMonitorMetricConfig from "./top-monitor/metric-config";
import { WidgetsType } from "./type";
import UsageStatisticsMetricConfig from "./usage-statistics/metric-config";

export interface IWidgetConfig {
  label: string;
  description: string;
  value: WidgetsType;
  gridData: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  thumbnail: any;
  metricConfig?: any;
  formKeyConfig: string[];
  auth: {
    authKey: string;
    resource: string;
    type: any;
  };
}

const useWidgetConfig = () => {
  const intl = useIntl();

  const list: IWidgetConfig[] = [
    {
      label: intl.formatMessage({
        id: "platform.health",
        defaultMessage: "Platform Healthiness",
      }),
      description: intl.formatMessage({
        id: "platform.health",
        defaultMessage: "Platform Healthiness",
      }),
      value: WidgetsType.inspection,
      gridData: {
        x: 0,
        y: 0,
        w: 2,
        h: 1,
      },
      thumbnail: thumbnailWidgetInspectionSvg,
      formKeyConfig: ["type"],
      auth: {
        authKey: "inspection",
        resource: "dashboard",
        type: "block",
      },
    },
    {
      label: intl.formatMessage({
        id: "resourceStateStatistics",
        defaultMessage: "Resource State Statistics",
      }),
      description: intl.formatMessage({
        id: "resourceStateStatistics.description",
        defaultMessage: "Displays the statistics of resources of different type and in different state.",
      }),
      value: WidgetsType.stateMonitor,
      gridData: {
        x: 0,
        y: 0,
        w: 2,
        h: 1,
      },
      thumbnail: thumbnailWidgetStateMonitorSvg,
      metricConfig: StateMonitorMetricConfig()?.metricConfig,
      formKeyConfig: ["type", "resource"],
      auth: {
        authKey: "stateMonitor",
        resource: "dashboard",
        type: "block",
      },
    },
    {
      label: intl.formatMessage({
        id: "platformUsageStatistics",
        defaultMessage: "Resource Usage Statistics",
      }),
      description: intl.formatMessage({
        id: "usageStatistics.description",
        defaultMessage: "Displays the usage of compute, storage, and network resources.",
      }),
      value: WidgetsType.usageStatistics,
      gridData: {
        x: 0,
        y: 0,
        w: 1,
        h: 1,
      },
      thumbnail: thumbnailWidgetUsageStatisticsSvg,
      metricConfig: UsageStatisticsMetricConfig()?.metricConfig,
      formKeyConfig: ["type", "statisticsResource", "monitorItem"],
      auth: {
        authKey: "usageStatistics",
        resource: "dashboard",
        type: "block",
      },
    },
    {
      label: intl.formatMessage({
        id: "topResourceRanking",
        defaultMessage: "Resource Top Ranking",
      }),
      description: intl.formatMessage({
        id: "topResourceRanking.description",
        defaultMessage: "Displays resources that are ranked top 3 or top 10 based on the configured monitoring items.",
      }),
      value: WidgetsType.topMonitor,
      gridData: {
        x: 0,
        y: 0,
        w: 2,
        h: 2,
      },
      thumbnail: thumbnailWidgetTopMonitorSvg,
      metricConfig: TopMonitorMetricConfig()?.metricConfig,
      formKeyConfig: ["type", "topResource", "topMetricName", "limit"],
      auth: {
        authKey: "topMonitor",
        resource: "dashboard",
        type: "block",
      },
    },
    {
      label: intl.formatMessage({
        id: "recentVisit",
        defaultMessage: "Recent Visit",
      }),
      description: intl.formatMessage({
        id: "recentVisit.description",
        defaultMessage: "Displays the recent six menus that are visited.",
      }),
      value: WidgetsType.recentVisit,
      gridData: {
        x: 0,
        y: 0,
        w: 2,
        h: 1,
      },
      thumbnail: thumbnailWidgetRecentVisitSvg,
      formKeyConfig: ["type"],
      auth: {
        authKey: "recentVisit",
        resource: "dashboard",
        type: "block",
      },
    },
    {
      label: intl.formatMessage({
        id: "userInfo",
        defaultMessage: "Account or User Information",
      }),
      description: intl.formatMessage({
        id: "userInfo.description",
        defaultMessage: "Displays the information of current login account or user.",
      }),
      value: WidgetsType.userInfo,
      gridData: {
        x: 0,
        y: 0,
        w: 2,
        h: 1,
      },
      thumbnail: thumbnailWidgetUserInfoSvg,
      formKeyConfig: ["type"],
      auth: {
        authKey: "userInfo",
        resource: "dashboard",
        type: "block",
      },
    },
    {
      label: intl.formatMessage({
        id: "unreadAlarmStatisticsInRecent7Days",
        defaultMessage: "Unread Alarm Statistics in Recent Seven Days",
      }),
      description: intl.formatMessage({
        id: "unreadAlarmStatisticsInRecent7Days.description",
        defaultMessage: "Classifies and displays unread alarm messages of recent seven days based on the alarm level.",
      }),
      value: WidgetsType.alarmInfo,
      gridData: {
        x: 0,
        y: 0,
        w: 2,
        h: 2,
      },
      thumbnail: thumbnailWidgetAlarmInfoSvg,
      formKeyConfig: ["type"],
      auth: {
        authKey: "alarmInfo",
        resource: "dashboard",
        type: "block",
      },
    },
    {
      label: intl.formatMessage({
        id: "billingInfo",
        defaultMessage: "Billing Information",
      }),
      description: intl.formatMessage({
        id: "billingInfo.description",
        defaultMessage: "Displays the billing information this month.",
      }),
      value: WidgetsType.billingStatistics,
      gridData: {
        x: 0,
        y: 0,
        w: 2,
        h: 2,
      },
      thumbnail: thumbnailWidgetBillingStatisticsSvg,
      formKeyConfig: ["type"],
      auth: {
        authKey: "billingStatistics",
        resource: "dashboard",
        type: "block",
      },
    },
  ];

  const order = [
    "stateMonitor",
    "usageStatistics",
    "topMonitor",
    "recentVisit",
    "userInfo",
    "alarmInfo",
    "billingStatistics",
    "quotaUsage",
    "inspection",
  ];

  const widgetConfig = order
    .map((key) => list.find((item) => item.auth.authKey === key))
    .filter(Boolean) as IWidgetConfig[];

  return {
    widgetConfig,
    refreshInterval: 30000,
  };
};

export default useWidgetConfig;
