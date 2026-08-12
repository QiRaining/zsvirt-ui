import * as React from "react";
import { Route } from "react-router";

import AppLayoutWrapper from "../components/app-layout-wrapper.tsx";
import { SuspenseWrapper } from "../components/suspense-wrapper.tsx";

const DataProtectionIndex = React.lazy(
  () => import("zsv_data_protection/src/pages/index"),
);
const SnapshotIndex = React.lazy(
  () => import("zsv_data_protection/src/pages/snapshot/index"),
);
const SnapshotList = React.lazy(
  () => import("zsv_data_protection/src/pages/snapshot/list/index"),
);
const SnapshotStrategy = React.lazy(
  () => import("zsv_data_protection/src/pages/snapshot/strategy/index"),
);
const SnapshotDetail = React.lazy(
  () => import("zsv_data_protection/src/pages/snapshot/detail/index"),
);
const SnapshotStrategyDetail = React.lazy(
  () => import("zsv_data_protection/src/pages/snapshot-strategy/detail/index"),
);
const BackupManagementIndex = React.lazy(
  () => import("zsv_data_protection/src/pages/backup-management/index"),
);
const ProtectedResourceIndex = React.lazy(
  () =>
    import("zsv_data_protection/src/pages/backup-management/protected-resource/index"),
);
const BackupPolicyIndex = React.lazy(
  () =>
    import("zsv_data_protection/src/pages/backup-management/backup-policy/index"),
);
const BackupPolicyList = React.lazy(
  () =>
    import("zsv_data_protection/src/pages/backup-management/backup-policy/list/index"),
);
const BackupPolicyDetail = React.lazy(
  () =>
    import("zsv_data_protection/src/pages/backup-management/backup-policy/detail/index"),
);
const DisasterRecoveryStorageIndex = React.lazy(
  () =>
    import("zsv_data_protection/src/pages/backup-management/disaster-recovery-storage/index"),
);
const DisasterRecoveryStorageList = React.lazy(
  () =>
    import("zsv_data_protection/src/pages/backup-management/disaster-recovery-storage/list/index"),
);
const DisasterRecoveryStorageDetail = React.lazy(
  () =>
    import("zsv_data_protection/src/pages/backup-management/disaster-recovery-storage/detail/index"),
);
const DisasterRecoveryService = React.lazy(
  () => import("zsv_data_protection/src/pages/disaster-recovery-service/index"),
);
const SchedulerJobHistoryList = React.lazy(
  () => import("zsv_data_protection/src/pages/scheduler-job-history/list"),
);
const NotFoundPage = React.lazy(
  () => import("zsv_data_protection/src/pages/404"),
);

type LazyComponent = React.LazyExoticComponent<React.ComponentType<unknown>>;

const withSuspense = (Component: LazyComponent) => (
  <SuspenseWrapper>
    <Component />
  </SuspenseWrapper>
);

export const dataProtectionRoutes = (
  <Route path="virtualization-data-protection" element={<AppLayoutWrapper />}>
    <Route index element={withSuspense(DataProtectionIndex)} />

    <Route path="snapshot">
      <Route index element={withSuspense(SnapshotIndex)} />
      <Route path="list" element={withSuspense(SnapshotList)} />
      <Route path="detail" element={withSuspense(SnapshotDetail)} />

      <Route path="strategy" element={withSuspense(SnapshotStrategy)} />
      <Route
        path="strategy/detail"
        element={withSuspense(SnapshotStrategyDetail)}
      />
    </Route>

    <Route path="backup-management">
      <Route index element={withSuspense(BackupManagementIndex)} />
      <Route
        path="protected-resource"
        element={withSuspense(ProtectedResourceIndex)}
      />

      <Route path="backup-policy">
        <Route index element={withSuspense(BackupPolicyIndex)} />
        <Route path="list" element={withSuspense(BackupPolicyList)} />
        <Route path="detail" element={withSuspense(BackupPolicyDetail)} />
      </Route>

      <Route path="disaster-recovery-storage">
        <Route index element={withSuspense(DisasterRecoveryStorageIndex)} />
        <Route
          path="list"
          element={withSuspense(DisasterRecoveryStorageList)}
        />
        <Route
          path="detail"
          element={withSuspense(DisasterRecoveryStorageDetail)}
        />
      </Route>
    </Route>

    <Route
      path="disaster-recovery-service"
      element={withSuspense(DisasterRecoveryService)}
    />

    <Route
      path="scheduler-job-history"
      element={withSuspense(SchedulerJobHistoryList)}
    />

    <Route path="*" element={withSuspense(NotFoundPage)} />
  </Route>
);

export default dataProtectionRoutes;
