import * as React from "react";
import { Route } from "react-router";

import AppLayoutWrapper from "../components/app-layout-wrapper.tsx";
import { SuspenseWrapper } from "../components/suspense-wrapper.tsx";

// Index 页面
const ReliabilityIndex = React.lazy(() => import("zsv_reliability/index"));

// 管理节点监控
const MnMonitoringIndex = React.lazy(
  () => import("zsv_reliability/mn-monitoring"),
);

// 动态资源调度
const DynamicResourceDispatchStrategyIndex = React.lazy(
  () => import("zsv_reliability/dynamic-resource-dispatch-strategy"),
);
const DynamicResourceDispatchStrategyList = React.lazy(
  () => import("zsv_reliability/dynamic-resource-dispatch-strategy/list"),
);

// 高可用策略
const HaStrategicIndex = React.lazy(
  () => import("zsv_reliability/ha-strategic"),
);

// 虚拟机调度规则
const VmSchedulingRuleIndex = React.lazy(
  () => import("zsv_reliability/vm-scheduling-rule"),
);
const VmSchedulingRuleList = React.lazy(
  () => import("zsv_reliability/vm-scheduling-rule/list"),
);
const VmSchedulingRuleDetail = React.lazy(
  () => import("zsv_reliability/vm-scheduling-rule/detail"),
);
const VmSchedulingRuleHostGroupList = React.lazy(
  () => import("zsv_reliability/vm-scheduling-rule/host-group/list"),
);
const VmSchedulingRuleHostGroupDetail = React.lazy(
  () => import("zsv_reliability/vm-scheduling-rule/host-group/detail"),
);
const VmSchedulingRuleVmGroupList = React.lazy(
  () => import("zsv_reliability/vm-scheduling-rule/vm-group/list"),
);
const VmSchedulingRuleVmGroupDetail = React.lazy(
  () => import("zsv_reliability/vm-scheduling-rule/vm-group/detail"),
);

// 404 页面
const NotFoundPage = React.lazy(() => import("zsv_reliability/404"));

type LazyComponent = React.LazyExoticComponent<React.ComponentType<unknown>>;

const withSuspense = (Component: LazyComponent) => (
  <SuspenseWrapper>
    <Component />
  </SuspenseWrapper>
);

export const reliabilityRoutes = (
  <Route path="virtualization-reliability" element={<AppLayoutWrapper />}>
    <Route index element={withSuspense(ReliabilityIndex)} />

    {/* 管理节点监控 */}
    <Route path="mn-monitoring" element={withSuspense(MnMonitoringIndex)} />

    {/* 动态资源调度 */}
    <Route path="dynamic-resource-dispatch-strategy">
      <Route
        index
        element={withSuspense(DynamicResourceDispatchStrategyIndex)}
      />
      <Route
        path="list"
        element={withSuspense(DynamicResourceDispatchStrategyList)}
      />
    </Route>

    {/* 高可用策略 */}
    <Route path="ha-strategic">
      <Route index element={withSuspense(HaStrategicIndex)} />
    </Route>

    {/* 虚拟机调度规则 */}
    <Route path="vm-scheduling-rule">
      <Route index element={withSuspense(VmSchedulingRuleIndex)} />
      <Route path="list" element={withSuspense(VmSchedulingRuleList)} />
      <Route path="detail" element={withSuspense(VmSchedulingRuleDetail)} />
      <Route path="host-group">
        <Route
          path="list"
          element={withSuspense(VmSchedulingRuleHostGroupList)}
        />
        <Route
          path="detail"
          element={withSuspense(VmSchedulingRuleHostGroupDetail)}
        />
      </Route>
      <Route path="vm-group">
        <Route
          path="list"
          element={withSuspense(VmSchedulingRuleVmGroupList)}
        />
        <Route
          path="detail"
          element={withSuspense(VmSchedulingRuleVmGroupDetail)}
        />
      </Route>
    </Route>

    {/* 404 兜底 */}
    <Route path="*" element={withSuspense(NotFoundPage)} />
  </Route>
);

export default reliabilityRoutes;
