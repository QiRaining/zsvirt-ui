export type DisasterRecoveryServiceStatus =
  | "not-installed"
  | "package-missing"
  | "uploading"
  | "package-uploaded"
  | "installing"
  | "initialization-required"
  | "initializing"
  | "running"
  | "abnormal"
  | "upgrade-in-progress"
  | "clearing"
  | "clear-blocked";

export type DisasterRecoveryServiceActionKey =
  | "prepare-upload"
  | "upload-package"
  | "install-service"
  | "initialize-site"
  | "open-zlr"
  | "view-task"
  | "view-blockers"
  | "retry"
  | "none";

export type SetupStepType = "upload" | "install" | "initialize";

export type UploadPackageMethod = "url" | "local";

export interface DisasterRecoveryServicePrimaryAction {
  key: DisasterRecoveryServiceActionKey;
  disabled: boolean;
}

export type DisasterRecoveryServiceHealthStatus =
  | "passed"
  | "warning"
  | "critical";

export type DisasterRecoveryServiceTaskCode =
  | "context-detected"
  | "package-required"
  | "package-upload-started"
  | "package-uploaded"
  | "install-started"
  | "install-finished"
  | "initialization-started"
  | "initialization-finished"
  | "clear-blocked"
  | "clear-started"
  | "clear-finished"
  | "retry-started";

export interface DisasterRecoveryPlatformContext {
  platformType: "ZSphere" | "ZStack Cloud";
  managementNodeAddress: string;
  managementNodeUuid: string;
  siteId: string;
  suggestedSiteName: string;
  certificateFingerprint: string;
  bootstrapTokenState: "VALID" | "EXPIRED" | "USED" | "MISSING";
  entrySource: string;
}

export interface DisasterRecoveryServiceTarget {
  clusterName: string;
  hostName: string;
  storageName: string;
  managementNetwork: string;
  spec: "Light" | "Standard";
}

export interface DisasterRecoveryServiceHealthItem {
  code:
    | "service"
    | "database"
    | "platform"
    | "version"
    | "certificate"
    | "sso"
    | "time"
    | "license"
    | "network"
    | "placeholder-datastore"
    | "replication-agent";
  status: DisasterRecoveryServiceHealthStatus;
}

export interface DisasterRecoveryServiceBlocker {
  code: "running-task" | "protection-group" | "recovery-plan";
  count: number;
}

export interface DisasterRecoveryServiceTaskLog {
  id: string;
  code: DisasterRecoveryServiceTaskCode;
  status: "success" | "warning" | "progress";
  createdAt: string;
}

export interface DisasterRecoveryServiceState {
  status: DisasterRecoveryServiceStatus;
  version: string;
  managementAddress: string;
  licenseSummary: string;
  packageName?: string;
  packageVersion?: string;
  packageChecksum?: string;
  packageUrl?: string;
  localFileName?: string;
  storagePath?: string;
  uploadMethod?: UploadPackageMethod;
  target: DisasterRecoveryServiceTarget;
  platformContext: DisasterRecoveryPlatformContext;
  selfChecks: DisasterRecoveryServiceHealthItem[];
  blockers: DisasterRecoveryServiceBlocker[];
  taskLogs: DisasterRecoveryServiceTaskLog[];
}

export interface UploadPackageFormValues {
  uploadMethod: UploadPackageMethod;
  storagePath: string;
  packageUrl?: string;
  localFileName?: string;
}

export interface DeployServiceFormValues {
  clusterName: string;
  hostName: string;
  storageName: string;
  managementNetwork: string;
  spec: DisasterRecoveryServiceTarget["spec"];
  managementAddress: string;
}

export interface InitializeSiteFormValues {
  siteName: string;
  siteId: string;
  managementNodeAddress: string;
  certificateFingerprint: string;
  bootstrapToken: string;
}

export type DisasterRecoveryServiceOperationPayload =
  | UploadPackageFormValues
  | DeployServiceFormValues
  | InitializeSiteFormValues;
