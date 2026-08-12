import React, { memo, useEffect, useState } from "react";

import AlarmInfo from "./alarm-info";
import QuotaUsageWidget from "./quota-usage";
import StateMonitorWidget from "./state-monitor";
import TopMonitorWidget from "./top-monitor";
import TrendMonitorWidget from "./trend-monitor";
import { WidgetsType } from "./type";
import UsageStatistics from "./usage-statistics";
import UserInfo from "./user-info";

// P1: 即时渲染，轻量统计类 widget
const P1_TYPES = new Set<WidgetsType>([
  WidgetsType.stateMonitor,
  WidgetsType.userInfo,
  WidgetsType.alarmInfo,
  WidgetsType.recentVisit,
  WidgetsType.inspection,
]);

// P2: 延迟 300ms，需要二次计算的容量统计
const P2_DELAY = 300;
const P2_TYPES = new Set<WidgetsType>([
  WidgetsType.usageStatistics,
  WidgetsType.quotaUsage,
  WidgetsType.billingStatistics,
]);

// P3: 延迟 600ms，监控 top 排行（BFF 调用监控系统，最慢）
const P3_DELAY = 600;

function getDelay(type: WidgetsType): number {
  if (P1_TYPES.has(type)) {
    return 0;
  }
  if (P2_TYPES.has(type)) {
    return P2_DELAY;
  }
  return P3_DELAY;
}

function useDeferredMount(type: WidgetsType): boolean {
  const delay = getDelay(type);
  const [ready, setReady] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) {
      return;
    }
    const id = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(id);
  }, [delay]);

  return ready;
}

const genWidget = (type: WidgetsType, props: any): React.ReactElement => {
  switch (type) {
    case WidgetsType.topMonitor:
      return <TopMonitorWidget {...props} />;
    case WidgetsType.userInfo:
      return <UserInfo {...props} />;
    case WidgetsType.alarmInfo:
      return <AlarmInfo {...props} />;
    case WidgetsType.stateMonitor:
      return <StateMonitorWidget {...props} />;
    case WidgetsType.usageStatistics:
      return <UsageStatistics {...props} />;
    case WidgetsType.trendMonitor:
      return <TrendMonitorWidget {...props} />;
    case WidgetsType.quotaUsage:
      return <QuotaUsageWidget {...props} />;
    default:
      return <></>;
  }
};

interface IProps {
  type: WidgetsType;
  [key: string]: any;
}

const Widget: React.FC<IProps> = memo(({ type, ...props }) => {
  const ready = useDeferredMount(type);
  if (!ready) {
    return <div style={{ height: "100%" }} />;
  }
  return genWidget(type, props);
});

export default Widget;
