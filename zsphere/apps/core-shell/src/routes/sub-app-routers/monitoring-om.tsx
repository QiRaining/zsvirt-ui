import * as React from "react";
import { Navigate, Route } from "react-router";

import MonitoringOmWrapper from "../components/monitoring-om-wrapper.tsx";
import { SuspenseWrapper } from "../components/suspense-wrapper.tsx";

const AlarmMessageIndex = React.lazy(
  () => import("zsv_monitoring_om/src/pages/alarm-message"),
);
const PlatformAlarmMessageIndex = React.lazy(
  () => import("zsv_monitoring_om/src/pages/alarm-message/cloud-platform"),
);
const AlarmMessageDetail = React.lazy(
  () =>
    import("zsv_monitoring_om/src/pages/alarm-message/cloud-platform/detail"),
);
const ZwatchAlarmIndex = React.lazy(
  () => import("zsv_monitoring_om/src/pages/zwatch-alarm"),
);
const ZwatchAlarmResourceList = React.lazy(
  () => import("zsv_monitoring_om/src/pages/zwatch-alarm/resource/list"),
);
const ZwatchAlarmResourceDetail = React.lazy(
  () => import("zsv_monitoring_om/src/pages/zwatch-alarm/resource/detail"),
);
const ZwatchAlarmEventList = React.lazy(
  () => import("zsv_monitoring_om/src/pages/zwatch-alarm/event/list"),
);
const ZwatchAlarmEventDetail = React.lazy(
  () => import("zsv_monitoring_om/src/pages/zwatch-alarm/event/detail"),
);
const ZwatchSnsTextTemplateIndex = React.lazy(
  () => import("zsv_monitoring_om/src/pages/zwatch-sns-text-template"),
);
const ZwatchSnsTextTemplateDetail = React.lazy(
  () => import("zsv_monitoring_om/src/pages/zwatch-sns-text-template/detail"),
);
const ZwatchEndpointIndex = React.lazy(
  () => import("zsv_monitoring_om/src/pages/zwatch-endpoint"),
);
const ZwatchEndpointDetail = React.lazy(
  () => import("zsv_monitoring_om/src/pages/zwatch-endpoint/detail"),
);
const ZwatchEndpointAddressIndex = React.lazy(
  () => import("zsv_monitoring_om/src/pages/zwatch-endpoint-address"),
);
const ZwatchEndpointSmsAddressIndex = React.lazy(
  () => import("zsv_monitoring_om/src/pages/zwatch-endpoint-sms-address"),
);
const OperationLogIndex = React.lazy(
  () => import("zsv_monitoring_om/src/pages/operation-log"),
);
const OperationLogList = React.lazy(
  () => import("zsv_monitoring_om/src/pages/operation-log/list"),
);
const OperationLogSchedHistory = React.lazy(
  () => import("zsv_monitoring_om/src/pages/operation-log/sched-history"),
);
const OperationLogMigrationActivity = React.lazy(
  () => import("zsv_monitoring_om/src/pages/operation-log/migration-activity"),
);
const OperationLogDetail = React.lazy(
  () => import("zsv_monitoring_om/src/pages/operation-log/operation-detail"),
);
const AuditingIndex = React.lazy(
  () => import("zsv_monitoring_om/src/pages/auditing"),
);
const LogCollectIndex = React.lazy(
  () => import("zsv_monitoring_om/src/pages/log-collect"),
);
const TagManagementIndex = React.lazy(
  () => import("zsv_monitoring_om/src/pages/tag-management"),
);
const TagManagementDetail = React.lazy(
  () => import("zsv_monitoring_om/src/pages/tag-management/detail"),
);
const ResourceAttributeIndex = React.lazy(
  () => import("zsv_monitoring_om/src/pages/resource-attribute"),
);
const ResourceAttributeDetail = React.lazy(
  () => import("zsv_monitoring_om/src/pages/resource-attribute/detail"),
);

const MigrationServiceIndex = React.lazy(
  () => import("zsv_monitoring_om/src/pages/migration-service"),
);

const NotFoundPage = React.lazy(
  () => import("zsv_monitoring_om/src/pages/404"),
);

type LazyComponent = React.LazyExoticComponent<React.ComponentType<unknown>>;

const withSuspense = (Component: LazyComponent) => (
  <SuspenseWrapper>
    <Component />
  </SuspenseWrapper>
);

export const monitoringOmRoutes = (
  <Route path="virtualization-monitoring-om" element={<MonitoringOmWrapper />}>
    <Route index element={<Navigate to="alarm-message" replace />} />

    <Route path="alarm-message">
      <Route index element={withSuspense(AlarmMessageIndex)} />
      <Route
        path="platform-alarm-message"
        element={withSuspense(PlatformAlarmMessageIndex)}
      />
      <Route
        path="cloud-platform/detail"
        element={withSuspense(AlarmMessageDetail)}
      />
    </Route>

    <Route path="zwatch-alarm">
      <Route index element={withSuspense(ZwatchAlarmIndex)} />
      <Route path="resource">
        <Route index element={withSuspense(ZwatchAlarmResourceList)} />
        <Route
          path="detail"
          element={withSuspense(ZwatchAlarmResourceDetail)}
        />
      </Route>
      <Route path="event">
        <Route index element={withSuspense(ZwatchAlarmEventList)} />
        <Route path="detail" element={withSuspense(ZwatchAlarmEventDetail)} />
      </Route>
    </Route>

    <Route path="zwatch-sns-text-template">
      <Route index element={withSuspense(ZwatchSnsTextTemplateIndex)} />
      <Route
        path="detail"
        element={withSuspense(ZwatchSnsTextTemplateDetail)}
      />
    </Route>

    <Route path="zwatch-endpoint">
      <Route index element={withSuspense(ZwatchEndpointIndex)} />
      <Route path="detail" element={withSuspense(ZwatchEndpointDetail)} />
    </Route>

    <Route
      path="zwatch-endpoint-address"
      element={withSuspense(ZwatchEndpointAddressIndex)}
    />
    <Route
      path="zwatch-endpoint-sms-address"
      element={withSuspense(ZwatchEndpointSmsAddressIndex)}
    />

    <Route path="operation-log">
      <Route index element={withSuspense(OperationLogIndex)} />
      <Route path="operation-tasks" element={withSuspense(OperationLogList)} />
      <Route path="ha-tasks" element={withSuspense(OperationLogSchedHistory)} />
      <Route
        path="scheduling-task"
        element={withSuspense(OperationLogMigrationActivity)}
      />
      <Route
        path="operation-detail"
        element={withSuspense(OperationLogDetail)}
      />
    </Route>

    <Route path="auditing" element={withSuspense(AuditingIndex)} />

    <Route path="log-collect" element={withSuspense(LogCollectIndex)} />

    <Route path="tag-management">
      <Route index element={withSuspense(TagManagementIndex)} />
      <Route path="detail" element={withSuspense(TagManagementDetail)} />
    </Route>

    <Route path="resource-attribute">
      <Route index element={withSuspense(ResourceAttributeIndex)} />
      <Route path="detail" element={withSuspense(ResourceAttributeDetail)} />
    </Route>

    <Route path="migration-service">
      <Route index element={withSuspense(MigrationServiceIndex)} />
    </Route>

    <Route path="*" element={withSuspense(NotFoundPage)} />
  </Route>
);

export default monitoringOmRoutes;
