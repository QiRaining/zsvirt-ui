import type { IntlShape } from "react-intl";

import type {
  DisasterRecoveryServiceActionKey,
  DisasterRecoveryServiceBlocker,
  DisasterRecoveryServiceHealthItem,
  DisasterRecoveryServiceHealthStatus,
  DisasterRecoveryServiceStatus,
  DisasterRecoveryServiceTaskCode,
} from "../types";

export function getServiceStatusLabel(
  status: DisasterRecoveryServiceStatus,
  intl: IntlShape,
): string {
  switch (status) {
    case "not-installed":
      return intl.formatMessage({
        id: "disasterRecoveryService.status.notInstalled",
        defaultMessage: "Not Installed",
      });
    case "package-missing":
      return intl.formatMessage({
        id: "disasterRecoveryService.status.packageMissing",
        defaultMessage: "Package Missing",
      });
    case "uploading":
      return intl.formatMessage({
        id: "disasterRecoveryService.status.uploading",
        defaultMessage: "Uploading",
      });
    case "package-uploaded":
      return intl.formatMessage({
        id: "disasterRecoveryService.status.packageUploaded",
        defaultMessage: "Package Ready",
      });
    case "installing":
      return intl.formatMessage({
        id: "disasterRecoveryService.status.installing",
        defaultMessage: "Deploying",
      });
    case "initialization-required":
      return intl.formatMessage({
        id: "disasterRecoveryService.status.initializationRequired",
        defaultMessage: "Initialization Required",
      });
    case "initializing":
      return intl.formatMessage({
        id: "disasterRecoveryService.status.initializing",
        defaultMessage: "Initializing",
      });
    case "running":
      return intl.formatMessage({
        id: "disasterRecoveryService.status.running",
        defaultMessage: "Running",
      });
    case "abnormal":
      return intl.formatMessage({
        id: "disasterRecoveryService.status.abnormal",
        defaultMessage: "Abnormal",
      });
    case "upgrade-in-progress":
      return intl.formatMessage({
        id: "disasterRecoveryService.status.upgradeInProgress",
        defaultMessage: "Upgrading",
      });
    case "clearing":
      return intl.formatMessage({
        id: "disasterRecoveryService.status.clearing",
        defaultMessage: "Clearing",
      });
    case "clear-blocked":
      return intl.formatMessage({
        id: "disasterRecoveryService.status.clearBlocked",
        defaultMessage: "Clear Blocked",
      });
  }
}

export function getServiceStatusClassName(
  status: DisasterRecoveryServiceStatus,
): string {
  switch (status) {
    case "running":
    case "package-uploaded":
    case "initialization-required":
      return "bg-positive-50 text-positive-600";
    case "uploading":
    case "installing":
    case "initializing":
    case "upgrade-in-progress":
    case "clearing":
      return "bg-info-50 text-info-600";
    case "abnormal":
    case "clear-blocked":
      return "bg-danger-50 text-danger-600";
    case "not-installed":
    case "package-missing":
      return "bg-alert-50 text-alert-600";
  }
}

export function getPrimaryActionLabel(
  action: DisasterRecoveryServiceActionKey,
  intl: IntlShape,
): string {
  switch (action) {
    case "prepare-upload":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.prepareUpload",
        defaultMessage: "Prepare Upload",
      });
    case "upload-package":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.uploadPackage",
        defaultMessage: "Upload Package",
      });
    case "install-service":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.installService",
        defaultMessage: "Deploy DR Service",
      });
    case "initialize-site":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.initializeSite",
        defaultMessage: "Initialize Local Site",
      });
    case "open-zlr":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.openZlr",
        defaultMessage: "Open ZLR",
      });
    case "view-task":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.viewTask",
        defaultMessage: "View Task",
      });
    case "view-blockers":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.viewBlockers",
        defaultMessage: "View Blockers",
      });
    case "retry":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.retry",
        defaultMessage: "Retry",
      });
    case "none":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.none",
        defaultMessage: "No Action",
      });
  }
}

export function getHealthStatusLabel(
  status: DisasterRecoveryServiceHealthStatus,
  intl: IntlShape,
): string {
  switch (status) {
    case "passed":
      return intl.formatMessage({
        id: "disasterRecoveryService.health.status.passed",
        defaultMessage: "Passed",
      });
    case "warning":
      return intl.formatMessage({
        id: "disasterRecoveryService.health.status.warning",
        defaultMessage: "Warning",
      });
    case "critical":
      return intl.formatMessage({
        id: "disasterRecoveryService.health.status.critical",
        defaultMessage: "Blocking",
      });
  }
}

export function getHealthStatusClassName(
  status: DisasterRecoveryServiceHealthStatus,
): string {
  switch (status) {
    case "passed":
      return "bg-positive-50 text-positive-600";
    case "warning":
      return "bg-alert-50 text-alert-600";
    case "critical":
      return "bg-danger-50 text-danger-600";
  }
}

export function getHealthItemLabel(
  item: DisasterRecoveryServiceHealthItem,
  intl: IntlShape,
): string {
  switch (item.code) {
    case "service":
      return intl.formatMessage({
        id: "disasterRecoveryService.health.service",
        defaultMessage: "Service Status",
      });
    case "database":
      return intl.formatMessage({
        id: "disasterRecoveryService.health.database",
        defaultMessage: "Database Status",
      });
    case "platform":
      return intl.formatMessage({
        id: "disasterRecoveryService.health.platform",
        defaultMessage: "Base Platform Connection",
      });
    case "version":
      return intl.formatMessage({
        id: "disasterRecoveryService.health.version",
        defaultMessage: "Version Compatibility",
      });
    case "certificate":
      return intl.formatMessage({
        id: "disasterRecoveryService.health.certificate",
        defaultMessage: "Security Certificate",
      });
    case "sso":
      return intl.formatMessage({
        id: "disasterRecoveryService.health.sso",
        defaultMessage: "SSO / Token",
      });
    case "time":
      return intl.formatMessage({
        id: "disasterRecoveryService.health.time",
        defaultMessage: "Time Sync",
      });
    case "license":
      return intl.formatMessage({
        id: "disasterRecoveryService.health.license",
        defaultMessage: "License",
      });
    case "network":
      return intl.formatMessage({
        id: "disasterRecoveryService.health.network",
        defaultMessage: "Network Connectivity",
      });
    case "placeholder-datastore":
      return intl.formatMessage({
        id: "disasterRecoveryService.health.placeholderDatastore",
        defaultMessage: "Placeholder Datastore",
      });
    case "replication-agent":
      return intl.formatMessage({
        id: "disasterRecoveryService.health.replicationAgent",
        defaultMessage: "Replication Agent",
      });
  }
}

export function getTaskLogMessage(
  code: DisasterRecoveryServiceTaskCode,
  intl: IntlShape,
): string {
  switch (code) {
    case "context-detected":
      return intl.formatMessage({
        id: "disasterRecoveryService.task.contextDetected",
        defaultMessage:
          "Detected ZSphere service entry context and local site information.",
      });
    case "package-required":
      return intl.formatMessage({
        id: "disasterRecoveryService.task.packageRequired",
        defaultMessage:
          "Upload the ZLR Appliance package before continuing deployment.",
      });
    case "package-upload-started":
      return intl.formatMessage({
        id: "disasterRecoveryService.task.packageUploadStarted",
        defaultMessage: "Uploading the ZLR Appliance package.",
      });
    case "package-uploaded":
      return intl.formatMessage({
        id: "disasterRecoveryService.task.packageUploaded",
        defaultMessage: "The package has been uploaded and verified.",
      });
    case "install-started":
      return intl.formatMessage({
        id: "disasterRecoveryService.task.installStarted",
        defaultMessage: "Deploying the ZLR Appliance system VM.",
      });
    case "install-finished":
      return intl.formatMessage({
        id: "disasterRecoveryService.task.installFinished",
        defaultMessage:
          "The ZLR Appliance is running and waiting for local site initialization.",
      });
    case "initialization-started":
      return intl.formatMessage({
        id: "disasterRecoveryService.task.initializationStarted",
        defaultMessage:
          "Entering local site initialization and registration self-checks.",
      });
    case "initialization-finished":
      return intl.formatMessage({
        id: "disasterRecoveryService.task.initializationFinished",
        defaultMessage:
          "The local site is bound and the ZLR service entry is available.",
      });
    case "clear-blocked":
      return intl.formatMessage({
        id: "disasterRecoveryService.task.clearBlocked",
        defaultMessage:
          "Running tasks or DR objects were detected, so service registration clearing is blocked.",
      });
    case "clear-started":
      return intl.formatMessage({
        id: "disasterRecoveryService.task.clearStarted",
        defaultMessage: "Clearing the platform-side ZLR service registration.",
      });
    case "clear-finished":
      return intl.formatMessage({
        id: "disasterRecoveryService.task.clearFinished",
        defaultMessage:
          "ZLR service registration has been cleared. Replicated data and audit archives are retained.",
      });
    case "retry-started":
      return intl.formatMessage({
        id: "disasterRecoveryService.task.retryStarted",
        defaultMessage: "Service entry detection was triggered again.",
      });
  }
}

export function getBlockerLabel(
  blocker: DisasterRecoveryServiceBlocker,
  intl: IntlShape,
): string {
  switch (blocker.code) {
    case "running-task":
      return intl.formatMessage(
        {
          id: "disasterRecoveryService.blocker.runningTask",
          defaultMessage: "{count} running tasks",
        },
        { count: blocker.count },
      );
    case "protection-group":
      return intl.formatMessage(
        {
          id: "disasterRecoveryService.blocker.protectionGroup",
          defaultMessage: "{count} protection groups",
        },
        { count: blocker.count },
      );
    case "recovery-plan":
      return intl.formatMessage(
        {
          id: "disasterRecoveryService.blocker.recoveryPlan",
          defaultMessage: "{count} recovery plans",
        },
        { count: blocker.count },
      );
  }
}
