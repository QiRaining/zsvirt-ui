/**
 * 该文件为脚本自动生成文件，请勿随意修改。
 * */
import { useMemo } from "react";

export enum ConstantEnum {
  alarm = "alarm",
  combined = "combined",
  event = "event",
  Enabled = "Enabled",
  Disabled = "Disabled",
  Email = "Email",
  DingTalk = "DingTalk",
  SYSTEM_HTTP = "SYSTEM_HTTP",
  AliyunSms = "AliyunSms",
  MicrosoftTeams = "MicrosoftTeams",
  HTTP = "HTTP",
  SNMP = "SNMP",
  UP = "UP",
  DOWN = "DOWN",
  Emergent = "Emergent",
  Important = "Important",
  Normal = "Normal",
  OK = "OK",
  Alarm = "Alarm",
  InsufficientData = "InsufficientData",
  Customization = "Customization",
  System = "System",
  aliyun = "aliyun",
  privateAliyun = "privateAliyun",
  daho = "daho",
  AliyunNAS = "AliyunNAS",
  AliyunEBS = "AliyunEBS",
  ike_sa_not_established = "ike_sa_not_established",
  ike_sa_established = "ike_sa_established",
  ipsec_sa_not_established = "ipsec_sa_not_established",
  ipsec_sa_established = "ipsec_sa_established",
  Creating = "Creating",
  Migrating = "Migrating",
  Ready = "Ready",
  NotInstantiated = "NotInstantiated",
  Deleted = "Deleted",
  Root = "Root",
  Data = "Data",
  Memory = "Memory",
  BackupJob = "BackupJob",
  OtherTasks = "OtherTasks",
  Linux = "Linux",
  Windows = "Windows",
  WindowsVirtio = "WindowsVirtio",
  Other = "Other",
  Paravirtualization = "Paravirtualization",
  AffinityVm = "AffinityVm",
  AntiAffinityVm = "AntiAffinityVm",
  VmAffinityHost = "VmAffinityHost",
  VmAntiAffinityHost = "VmAntiAffinityHost",
  Invalid = "Invalid",
  Conflict = "Conflict",
  Created = "Created",
  Starting = "Starting",
  Running = "Running",
  Stopping = "Stopping",
  Stopped = "Stopped",
  Rebooting = "Rebooting",
  Destroying = "Destroying",
  Destroyed = "Destroyed",
  Expunging = "Expunging",
  Pausing = "Pausing",
  Paused = "Paused",
  Resuming = "Resuming",
  VolumeMigrating = "VolumeMigrating",
  Error = "Error",
  Unknown = "Unknown",
  NoState = "NoState",
  Uninstall = "Uninstall",
  IsRunning = "IsRunning",
  Unsupport = "Unsupport",
  Crashed = "Crashed",
  VolumeRecovering = "VolumeRecovering",
  Failed = "Failed",
  DataMerging = "DataMerging",
  null = "null",
  Installed = "Installed",
  BackupTask = "BackupTask",
  CdpTask = "CdpTask",
  Matched = "Matched",
  Unmatched = "Unmatched",
  Staled = "Staled",
  RootVolumeTemplate = "RootVolumeTemplate",
  DataVolumeTemplate = "DataVolumeTemplate",
  ISO = "ISO",
  qcow2 = "qcow2",
  iso = "iso",
  raw = "raw",
  vmtx = "vmtx",
  Downloading = "Downloading",
  IPv4 = "IPv4",
  IPv6 = "IPv6",
  public = "public",
  vpc = "vpc",
  flat = "flat",
  HadBind = "HadBind",
  NotBind = "NotBind",
  limit = "limit",
  unlimit = "unlimit",
  Active = "Active",
  Attached = "Attached",
  Connecting = "Connecting",
  Connected = "Connected",
  Disconnected = "Disconnected",
  Synchronizing = "Synchronizing",
  Waiting = "Waiting",
  Suspended = "Suspended",
  Succeeded = "Succeeded",
  Canceling = "Canceling",
  Canceled = "Canceled",
  Fault = "Fault",
  Missing = "Missing",
  Abnormal = "Abnormal",
  TicketPending = "TicketPending",
  TicketCancelled = "TicketCancelled",
  TicketIntermediateApproved = "TicketIntermediateApproved",
  TicketFinalApproved = "TicketFinalApproved",
  TicketRejected = "TicketRejected",
  Single = "Single",
  Group = "Group",
  Available = "Available",
  Unable = "Unable",
  Yes = "Yes",
  No = "No",
  running = "running",
  failed = "failed",
  active = "active",
  enabled = "enabled",
  fiberChannel = "fiberChannel",
  iSCSI = "iSCSI",
  NVMe = "NVMe",
  Exception = "Exception",
  Synced = "Synced",
  Unsynced = "Unsynced",
  Ingress = "Ingress",
  Egress = "Egress",
  TCP = "TCP",
  UDP = "UDP",
  ICMP = "ICMP",
  ALL = "ALL",
  Activated = "Activated",
  Unactivated = "Unactivated",
  Shell = "Shell",
  Python = "Python",
  Perl = "Perl",
  Bat = "Bat",
  Powershell = "Powershell",
  Uploading = "Uploading",
  Completed = "Completed",
  Succeed = "Succeed",
  rootVolumeBackup = "rootVolumeBackup",
  vmBackup = "vmBackup",
  volumeBackup = "volumeBackup",
  BackingUp = "BackingUp",
  StartVmInstanceJob = "StartVmInstanceJob",
  StopVmInstanceJob = "StopVmInstanceJob",
  RebootVmInstanceJob = "RebootVmInstanceJob",
  CreateVolumeSnapshotJob = "CreateVolumeSnapshotJob",
  CreateVmSnapshot = "CreateVmSnapshot",
  VMHA = "VMHA",
  HMT = "HMT",
  UserStatic = "UserStatic",
  UserBlackHole = "UserBlackHole",
  Initial = "Initial",
  Deleting = "Deleting",
  Rollbacking = "Rollbacking",
  Rollbacked = "Rollbacked",
  Start = "Start",
  Finish = "Finish",
  RollbackStart = "RollbackStart",
  RollbackFinish = "RollbackFinish",
  RollbackFailed = "RollbackFailed",
  outDirection = "outDirection",
  inDirection = "inDirection",
  Degraged = "Degraged",
  Rebuild = "Rebuild",
  Valid = "Valid",
  Maintenance = "Maintenance",
  LocalStorage = "LocalStorage",
  VCenter = "VCenter",
  NFS = "NFS",
  Ceph = "Ceph",
  SharedMountPoint = "SharedMountPoint",
  SharedBlock = "SharedBlock",
  MiniStorage = "MiniStorage",
  BlockStorage = "BlockStorage",
  Inactive = "Inactive",
  Bidirection = "Bidirection",
  UNVIRTUALIZABLE = "UNVIRTUALIZABLE",
  SRIOVVIRTUALIZABLE = "SRIOVVIRTUALIZABLE",
  SRIOVVIRTUALIZED = "SRIOVVIRTUALIZED",
  UNKNOWN = "UNKNOWN",
  UnInstall = "UnInstall",
  UnSupport = "UnSupport",
  Success = "Success",
  TicketApprovalsFiledPending = "TicketApprovalsFiledPending",
  TicketApprovalsFiledCancelled = "TicketApprovalsFiledCancelled",
  TicketApprovalsFiledIntermediateApproved = "TicketApprovalsFiledIntermediateApproved",
  TicketApprovalsFiledFinalApproved = "TicketApprovalsFiledFinalApproved",
  TicketApprovalsFiledRejected = "TicketApprovalsFiledRejected",
  TicketApprovalsPending = "TicketApprovalsPending",
  TicketApprovalsCancelled = "TicketApprovalsCancelled",
  TicketApprovalsIntermediateApproved = "TicketApprovalsIntermediateApproved",
  TicketApprovalsFinalApproved = "TicketApprovalsFinalApproved",
  TicketApprovalsRejected = "TicketApprovalsRejected",
  Include = "Include",
  NotInclude = "NotInclude",
  Full = "Full",
  Incremental = "Incremental",
  SLB = "SLB",
  Shared = "Shared",
  roundrobin = "roundrobin",
  leastconn = "leastconn",
  source = "source",
  weightroundrobin = "weightroundrobin",
  healthy = "healthy",
  unhealthy = "unhealthy",
  L2NoVlanNetwork = "L2NoVlanNetwork",
  L2VlanNetwork = "L2VlanNetwork",
  VxlanNetwork = "VxlanNetwork",
  HardwareVxlanNetwork = "HardwareVxlanNetwork",
  VxlanNetworkPool = "VxlanNetworkPool",
  HardwareVxlanNetworkPool = "HardwareVxlanNetworkPool",
  virtualSwitch = "virtualSwitch",
  portGroup = "portGroup",
  true = "true",
  false = "false",
  LeastVmPreferredHostAllocatorStrategy = "LeastVmPreferredHostAllocatorStrategy",
  MinimumCPUUsageHostAllocatorStrategy = "MinimumCPUUsageHostAllocatorStrategy",
  MinimumMemoryUsageHostAllocatorStrategy = "MinimumMemoryUsageHostAllocatorStrategy",
  MaxInstancePerHostHostAllocatorStrategy = "MaxInstancePerHostHostAllocatorStrategy",
  LastHostPreferredAllocatorStrategy = "LastHostPreferredAllocatorStrategy",
  DefaultHostAllocatorStrategy = "DefaultHostAllocatorStrategy",
  CRITICAL = "CRITICAL",
  WARN = "WARN",
  NORMAL = "NORMAL",
  FAILED = "FAILED",
  HEALTHY = "HEALTHY",
  UNHEALTHY = "UNHEALTHY",
  EXIST = "EXIST",
  NOTEXIST = "NOTEXIST",
  CONSISTENT = "CONSISTENT",
  INCONSISTENT = "INCONSISTENT",
  YES = "YES",
  NO = "NO",
  PLUGGED = "PLUGGED",
  UNPLUGGED = "UNPLUGGED",
  Public = "Public",
  None = "None",
  vrouter = "vrouter",
  Retired = "Retired",
  LoginExpired = "LoginExpired",
  Idle = "Idle",
  Deactivating = "Deactivating",
  AcceptingSide = "AcceptingSide",
  InitiatingSide = "InitiatingSide",
  Performance = "Performance",
  Capacity = "Capacity",
  SMB = "SMB",
  PreMaintenance = "PreMaintenance",
  NoElectric = "NoElectric",
  POWER_ON = "POWER_ON",
  POWER_OFF = "POWER_OFF",
  POWER_BOOTING = "POWER_BOOTING",
  POWER_SHUTDOWN = "POWER_SHUTDOWN",
  POWER_UNKNOWN = "POWER_UNKNOWN",
  UN_CONFIGURED = "UN_CONFIGURED",
  Online = "Online",
  Offline = "Offline",
  Linkdown = "Linkdown",
  Loopback = "Loopback",
  Testing = "Testing",
  Initializing = "Initializing",
  GPU_Video_Controller = "GPU_Video_Controller",
  GPU_Audio_Controller = "GPU_Audio_Controller",
  GPU_Processing_Accelerators = "GPU_Processing_Accelerators",
  Ethernet_Controller = "Ethernet_Controller",
  GPU_3D_Controller = "GPU_3D_Controller",
  Moxa_Device = "Moxa_Device",
  Generic = "Generic",
  SRIOV_VIRTUALIZABLE = "SRIOV_VIRTUALIZABLE",
  VFIO_MDEV_VIRTUALIZABLE = "VFIO_MDEV_VIRTUALIZABLE",
  SRIOV_VIRTUALIZED = "SRIOV_VIRTUALIZED",
  VFIO_MDEV_VIRTUALIZED = "VFIO_MDEV_VIRTUALIZED",
  SRIOV_VIRTUAL = "SRIOV_VIRTUAL",
  nominal = "nominal",
  critical = "critical",
  unknown = "unknown",
  DELETED = "DELETED",
  STOPPED = "STOPPED",
  TRANSFERRING = "TRANSFERRING",
  RUNNING = "RUNNING",
  RESETTING = "RESETTING",
  STARTING = "STARTING",
  STOPPING = "STOPPING",
  PENDING = "PENDING",
  SystemDisk = "SystemDisk",
  CacheDisk = "CacheDisk",
  DataDisk = "DataDisk",
  Rebuilding = "Rebuilding",
  ImageCache = "ImageCache",
  BackupStorage = "BackupStorage",
  Protecting = "Protecting",
  Unprotected = "Unprotected",
  RecoveryPoint = "RecoveryPoint",
  ProtectedRecoveryPoint = "ProtectedRecoveryPoint",
  Warning = "Warning",
  CreateFailed = "CreateFailed",
  UpdateFailed = "UpdateFailed",
  DeleteFailed = "DeleteFailed",
  Updating = "Updating",
  DesktopGpu = "DesktopGpu",
  ComputeGpu = "ComputeGpu",
  PubIpVmNicBandwidthOut = "PubIpVmNicBandwidthOut",
  PubIpVmNicBandwidthIn = "PubIpVmNicBandwidthIn",
  PubIpVipBandwidthOut = "PubIpVipBandwidthOut",
  PubIpVipBandwidthIn = "PubIpVipBandwidthIn",
  Converting = "Converting",
  Converted = "Converted",
  Unprovisioned = "Unprovisioned",
  Provisioning = "Provisioning",
  Provisioned = "Provisioned",
  HWInfoUnknown = "HWInfoUnknown",
  PxeBooting = "PxeBooting",
  PxeBootFailed = "PxeBootFailed",
  Allocated = "Allocated",
  PowerOn = "PowerOn",
  PowerOff = "PowerOff",
  WrongBootMode = "WrongBootMode",
  WrongArchitecture = "WrongArchitecture",
  HardwareInfoUnknown = "HardwareInfoUnknown",
  IPxeBooting = "IPxeBooting",
  IPxeBootFailed = "IPxeBootFailed",
  BareMetalNodeAvailable = "BareMetalNodeAvailable",
  BareMetalNodeAllocated = "BareMetalNodeAllocated",
  Remote = "Remote",
  Local = "Local",
  Direct = "Direct",
  ImageStoreBackupStorage = "ImageStoreBackupStorage",
  SftpBackupStorage = "SftpBackupStorage",
  Confirmed = "Confirmed",
  ConfirmPending = "ConfirmPending",
  Deploying = "Deploying",
  ConfigSettingUp = "ConfigSettingUp",
  ServiceBootingUp = "ServiceBootingUp",
  PartialCompleted = "PartialCompleted",
  ANTISOFT = "ANTISOFT",
  ANTIHARD = "ANTIHARD",
  REJECT = "REJECT",
  ACCEPT = "ACCEPT",
}

export enum ConstantType {
  ZwatchSNSTextTemplateAlarmType = "ZwatchSNSTextTemplateAlarmType",
  EndpointState = "EndpointState",
  EndpointType = "EndpointType",
  EndPonitType = "EndPonitType",
  EndpointConnectionStatus = "EndpointConnectionStatus",
  EmergencyLevel = "EmergencyLevel",
  AlarmState = "AlarmState",
  AlarmStatus = "AlarmStatus",
  ZoneState = "ZoneState",
  XmlHookType = "XmlHookType",
  HybridType = "HybridType",
  VpnConnectionStatus = "VpnConnectionStatus",
  VpcFirewallState = "VpcFirewallState",
  VolumeState = "VolumeState",
  VolumeStatus = "VolumeStatus",
  VolumeType = "VolumeType",
  VolumeBackupTaskType = "VolumeBackupTaskType",
  ImagePlatform = "ImagePlatform",
  VmSchedulingRuleType = "VmSchedulingRuleType",
  VmSchedulingExcuteState = "VmSchedulingExcuteState",
  VmInstanceState = "VmInstanceState",
  GuestToolsState = "GuestToolsState",
  VmCdpTaskStatus = "VmCdpTaskStatus",
  VmBackupTaskType = "VmBackupTaskType",
  VmSchedulingState = "VmSchedulingState",
  VmQemuState = "VmQemuState",
  VirtualidState = "VirtualidState",
  VirtualRouterOfferingState = "VirtualRouterOfferingState",
  ImageMediaType = "ImageMediaType",
  ImageFormat = "ImageFormat",
  ImageState = "ImageState",
  ImageStatus = "ImageStatus",
  VipNetworkState = "VipNetworkState",
  VipNetworkIpVersion = "VipNetworkIpVersion",
  L3NetworkType = "L3NetworkType",
  BindServiceType = "BindServiceType",
  LimitState = "LimitState",
  PciDeviceSpecState = "PciDeviceSpecState",
  PciDeviceState = "PciDeviceState",
  PciDeviceStatus = "PciDeviceStatus",
  ClusterState = "ClusterState",
  VCenterState = "VCenterState",
  VCenterStatus = "VCenterStatus",
  LongJobState = "LongJobState",
  V2VConversionHostState = "V2VConversionHostState",
  UKeyStatus = "UKeyStatus",
  TicketShowStatus = "TicketShowStatus",
  SnapshotType = "SnapshotType",
  RevertState = "RevertState",
  MemorySnapshot = "MemorySnapshot",
  PathHealthState = "PathHealthState",
  PathStatus = "PathStatus",
  LunSource = "LunSource",
  state = "state",
  asyncState = "asyncState",
  SecurityGroupRuleType = "SecurityGroupRuleType",
  SecurityGroupRuleState = "SecurityGroupRuleState",
  SecurityGroupRuleProtocolType = "SecurityGroupRuleProtocolType",
  SecurityGroupState = "SecurityGroupState",
  SecretServerStatus = "SecretServerStatus",
  SecretResourcePoolState = "SecretResourcePoolState",
  ScriptType = "ScriptType",
  ScriptExecuteRecordDetailStatus = "ScriptExecuteRecordDetailStatus",
  ScriptExecuteRecordStatus = "ScriptExecuteRecordStatus",
  SchedulerTriggerState = "SchedulerTriggerState",
  SchedulerJobGroupType = "SchedulerJobGroupType",
  SchedulerJobGroupStatus = "SchedulerJobGroupStatus",
  SchedulerJobState = "SchedulerJobState",
  SchedulerJobType = "SchedulerJobType",
  SchedTypes = "SchedTypes",
  VRouterRouteEntryType = "VRouterRouteEntryType",
  RoleState = "RoleState",
  ResourceStackStatus = "ResourceStackStatus",
  StackEventStatus = "StackEventStatus",
  PacketsForwardType = "PacketsForwardType",
  RecoveryTaskState = "RecoveryTaskState",
  RaidLevelState = "RaidLevelState",
  ProcessManagementState = "ProcessManagementState",
  ProcessManagementStatus = "ProcessManagementStatus",
  PrimaryStorageState = "PrimaryStorageState",
  PrimaryStorageStatus = "PrimaryStorageStatus",
  PrimaryStorageType = "PrimaryStorageType",
  PreconfigurationTemplateState = "PreconfigurationTemplateState",
  PortMirrorSessionStatus = "PortMirrorSessionStatus",
  PortMirrorSessionType = "PortMirrorSessionType",
  PortMirrorState = "PortMirrorState",
  PortForwardingProtocolType = "PortForwardingProtocolType",
  PortForwardingState = "PortForwardingState",
  PhysicalNicPciDeviceVirtStatus = "PhysicalNicPciDeviceVirtStatus",
  VmInstancePlugInStateType = "VmInstancePlugInStateType",
  OperationLogState = "OperationLogState",
  TicketApprovalsFiledStatus = "TicketApprovalsFiledStatus",
  TicketApprovalsStatus = "TicketApprovalsStatus",
  MonitorGroupInstanceState = "MonitorGroupInstanceState",
  BackupResourceVmBackupType = "BackupResourceVmBackupType",
  BackupResourceFullBackupType = "BackupResourceFullBackupType",
  BackupDataIsRemoteSynced = "BackupDataIsRemoteSynced",
  BackupDataIsLocalSynced = "BackupDataIsLocalSynced",
  LoadbalancerType = "LoadbalancerType",
  BalancerAlgorithmType = "BalancerAlgorithmType",
  HealtyType = "HealtyType",
  L2NetworkType = "L2NetworkType",
  L2NetworkIsolated = "L2NetworkIsolated",
  IscsiServerState = "IscsiServerState",
  IPsecState = "IPsecState",
  IPSecStatus = "IPSecStatus",
  InstanceOfferingAllocatorStrategy = "InstanceOfferingAllocatorStrategy",
  InstanceOfferingState = "InstanceOfferingState",
  InspectionSubTaskHealthState = "InspectionSubTaskHealthState",
  NicState = "NicState",
  HealthState = "HealthState",
  ECCWarning = "ECCWarning",
  NetMode = "NetMode",
  fullDuplexMode = "fullDuplexMode",
  NetPlugged = "NetPlugged",
  ShareType = "ShareType",
  ImageUseFor = "ImageUseFor",
  ProjectState = "ProjectState",
  AliyunRouterInterfaceStatus = "AliyunRouterInterfaceStatus",
  AliyunRouterConnectionRole = "AliyunRouterConnectionRole",
  HybridNasFileSystemStorageType = "HybridNasFileSystemStorageType",
  HybridNasFileSystemProtocolType = "HybridNasFileSystemProtocolType",
  HostState = "HostState",
  HostStatus = "HostStatus",
  HardwareState = "HardwareState",
  HostQemuState = "HostQemuState",
  HostIPMIPowerStatus = "HostIPMIPowerStatus",
  HostHardwareStatus = "HostHardwareStatus",
  PortState = "PortState",
  PciDeviceType = "PciDeviceType",
  PciDeviceVirtStatus = "PciDeviceVirtStatus",
  GpuWorkStatus = "GpuWorkStatus",
  SNSApplicationPlatformState = "SNSApplicationPlatformState",
  EipState = "EipState",
  EcsStatus = "EcsStatus",
  DiskUsage = "DiskUsage",
  DiskReadyState = "DiskReadyState",
  CephPrimaryStoragePoolType = "CephPrimaryStoragePoolType",
  CdpTaskStatus = "CdpTaskStatus",
  CdpTaskState = "CdpTaskState",
  CdpDataStatus = "CdpDataStatus",
  RecoveryPointType = "RecoveryPointType",
  ExponBlockVolumeStatus = "ExponBlockVolumeStatus",
  XskyBlockVolumeStatus = "XskyBlockVolumeStatus",
  BlockSnapshotState = "BlockSnapshotState",
  BillingsPriceGpuType = "BillingsPriceGpuType",
  BillingsPriceType = "BillingsPriceType",
  BareMetal2InstanceStatus = "BareMetal2InstanceStatus",
  BaremetalInstanceState = "BaremetalInstanceState",
  BaremetalInstanceStatus = "BaremetalInstanceStatus",
  BaremetalChassisStatus = "BaremetalChassisStatus",
  BaremetalChassisPowerStatus = "BaremetalChassisPowerStatus",
  Baremetal2ChassisStatus = "Baremetal2ChassisStatus",
  Baremetal2ChassisPowerStatus = "Baremetal2ChassisPowerStatus",
  Baremetal2ChassisProvisionType = "Baremetal2ChassisProvisionType",
  BackupStorageType = "BackupStorageType",
  BackupStorageState = "BackupStorageState",
  BackupStorageStatus = "BackupStorageStatus",
  AutoScalingGroupState = "AutoScalingGroupState",
  text = "text",
  ModelServiceInstanceGroupStatus = "ModelServiceInstanceGroupStatus",
  AiFineTuningTaskStatus = "AiFineTuningTaskStatus",
  ModelEvaluationTaskStatus = "ModelEvaluationTaskStatus",
  AiModelCenterStatus = "AiModelCenterStatus",
  AffinityGroupPolicy = "AffinityGroupPolicy",
  AffinityGroupState = "AffinityGroupState",
  AccessKeyState = "AccessKeyState",
  AccessControlRuleType = "AccessControlRuleType",
}

export const useConstantMap = (intl: any) => {
  const constantMap = useMemo(() => {
    const _map = new Map<string, any>();
    _map.set("alarm", {
      i18nKey: "resourceAlert",
      name: intl.formatMessage({
        id: "resourceAlert",
        defaultMessage: "Resource Alarm",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("combined", {
      i18nKey: "combinedAlarm",
      name: intl.formatMessage({
        id: "combinedAlarm",
        defaultMessage: "Resource Alarm/Event Alarm",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("event", {
      i18nKey: "eventAlert",
      name: intl.formatMessage({
        id: "eventAlert",
        defaultMessage: "Event Alarm",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("Email", {
      i18nKey: "email",
      name: intl.formatMessage({ id: "email", defaultMessage: "Email" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("DingTalk", {
      i18nKey: "dingTalk",
      name: intl.formatMessage({ id: "dingTalk", defaultMessage: "DingTalk" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SYSTEM_HTTP", {
      i18nKey: "system",
      name: intl.formatMessage({ id: "system", defaultMessage: "System" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("AliyunSms", {
      i18nKey: "sms",
      name: intl.formatMessage({ id: "sms", defaultMessage: "SMS" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("MicrosoftTeams", {
      i18nKey: "microsoftTeams",
      name: intl.formatMessage({
        id: "microsoftTeams",
        defaultMessage: "Microsoft Teams",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HTTP", {
      i18nKey: "HTTP",
      name: intl.formatMessage({ id: "HTTP", defaultMessage: "HTTP" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SNMP", {
      i18nKey: "snmp.trap",
      name: intl.formatMessage({
        id: "snmp.trap",
        defaultMessage: "SNMP Trap Receiver",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("UP", {
      i18nKey: "UP",
      name: intl.formatMessage({ id: "UP", defaultMessage: "UP" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("DOWN", {
      i18nKey: "DOWN",
      name: intl.formatMessage({ id: "DOWN", defaultMessage: "DOWN" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("Emergent", {
      i18nKey: "emergencyLevel.emergent",
      name: intl.formatMessage({
        id: "emergencyLevel.emergent",
        defaultMessage: "Emergent",
      }),
      icon: "alert-triangle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("Important", {
      i18nKey: "emergencyLevel.important",
      name: intl.formatMessage({
        id: "emergencyLevel.important",
        defaultMessage: "Major",
      }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("Normal", {
      i18nKey: "emergencyLevel.normal",
      name: intl.formatMessage({
        id: "emergencyLevel.normal",
        defaultMessage: "Info",
      }),
      icon: "alert-triangle-fill",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("OK", {
      i18nKey: "monitoring",
      name: intl.formatMessage({ id: "monitoring", defaultMessage: "Monitoring" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Alarm", {
      i18nKey: "triggered",
      name: intl.formatMessage({ id: "triggered", defaultMessage: "Triggered" }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("InsufficientData", {
      i18nKey: "insufficientData",
      name: intl.formatMessage({
        id: "insufficientData",
        defaultMessage: "Insufficient",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("Customization", {
      i18nKey: "xmlHookType.customization",
      name: intl.formatMessage({
        id: "xmlHookType.customization",
        defaultMessage: "Custom",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("System", {
      i18nKey: "xmlHookType.system",
      name: intl.formatMessage({
        id: "xmlHookType.system",
        defaultMessage: "System Template",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("aliyun", {
      i18nKey: "aliyun",
      name: intl.formatMessage({ id: "aliyun", defaultMessage: "aliyun" }),
      color: { color: "info", number: 500 },
      contentType: "text",
    });
    _map.set("privateAliyun", {
      i18nKey: "privateAliyun",
      name: intl.formatMessage({
        id: "privateAliyun",
        defaultMessage: "privateAliyun",
      }),
      color: { color: "positive", number: 500 },
      contentType: "text",
    });
    _map.set("daho", {
      i18nKey: "daho",
      name: intl.formatMessage({ id: "daho", defaultMessage: "daho" }),
      color: { color: "danger", number: 500 },
      contentType: "text",
    });
    _map.set("AliyunNAS", {
      i18nKey: "AliyunNAS",
      name: intl.formatMessage({
        id: "AliyunNAS",
        defaultMessage: "AliyunNAS",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("AliyunEBS", {
      i18nKey: "AliyunEBS",
      name: intl.formatMessage({
        id: "AliyunEBS",
        defaultMessage: "AliyunEBS",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ike_sa_not_established", {
      i18nKey: "ike_sa_not_established",
      name: intl.formatMessage({
        id: "ike_sa_not_established",
        defaultMessage: "Phase 1 negotiations failed",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("ike_sa_established", {
      i18nKey: "ike_sa_established",
      name: intl.formatMessage({
        id: "ike_sa_established",
        defaultMessage: "Phase 1 negotiations succeeded",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("ipsec_sa_not_established", {
      i18nKey: "ipsec_sa_not_established",
      name: intl.formatMessage({
        id: "ipsec_sa_not_established",
        defaultMessage: "Phase 2 negotiations failed",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("ipsec_sa_established", {
      i18nKey: "ipsec_sa_established",
      name: intl.formatMessage({
        id: "ipsec_sa_established",
        defaultMessage: "Phase 2 negotiations succeeded",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Creating", {
      i18nKey: "creating",
      name: intl.formatMessage({ id: "creating", defaultMessage: "Creating" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("Migrating", {
      i18nKey: "migrating",
      name: intl.formatMessage({ id: "migrating", defaultMessage: "Migrating" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("Ready", {
      i18nKey: "ready",
      name: intl.formatMessage({ id: "ready", defaultMessage: "Ready" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("NotInstantiated", {
      i18nKey: "notInstantiated",
      name: intl.formatMessage({
        id: "notInstantiated",
        defaultMessage: "Uninstantiated",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("Deleted", {
      i18nKey: "deleted",
      name: intl.formatMessage({ id: "deleted", defaultMessage: "Deleted" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("Root", {
      i18nKey: "root",
      name: intl.formatMessage({ id: "root", defaultMessage: "Disk 1" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Data", {
      i18nKey: "data",
      name: intl.formatMessage({ id: "data", defaultMessage: "Data Disk" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Memory", {
      i18nKey: "memory",
      name: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackupJob", {
      i18nKey: "backupJob",
      name: intl.formatMessage({ id: "backupJob", defaultMessage: "Backup Job" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("OtherTasks", {
      i18nKey: "otherTasks",
      name: intl.formatMessage({
        id: "otherTasks",
        defaultMessage: "Other",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Linux", {
      i18nKey: "Linux",
      name: intl.formatMessage({ id: "Linux", defaultMessage: "Linux" }),
      icon: "linux",
      color: { color: "neutral", number: 600 },
      prefix: "icon",
    });
    _map.set("Windows", {
      i18nKey: "windows",
      name: intl.formatMessage({ id: "windows", defaultMessage: "Windows" }),
      icon: "windows",
      color: { color: "neutral", number: 600 },
      prefix: "icon",
    });
    _map.set("WindowsVirtio", {
      i18nKey: "windowsVirtio",
      name: intl.formatMessage({
        id: "windowsVirtio",
        defaultMessage: "WindowsVirtio",
      }),
      icon: "windows",
      color: { color: "neutral", number: 600 },
      prefix: "icon",
    });
    _map.set("Other", {
      i18nKey: "Other",
      name: intl.formatMessage({ id: "Other", defaultMessage: "Other" }),
      icon: "file",
      color: { color: "neutral", number: 600 },
      prefix: "icon",
    });
    _map.set("Paravirtualization", {
      i18nKey: "paravirtualization",
      name: intl.formatMessage({
        id: "paravirtualization",
        defaultMessage: "Paravirtualization",
      }),
      icon: "paravirtualization",
      color: { color: "neutral", number: 600 },
      prefix: "icon",
    });
    _map.set("AffinityVm", {
      i18nKey: "vmSchedulingRuleType.affinityVm",
      name: intl.formatMessage({
        id: "vmSchedulingRuleType.affinityVm",
        defaultMessage: "VM Affinitive to Each Other",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("AntiAffinityVm", {
      i18nKey: "vmSchedulingRuleType.antiAffinityVm",
      name: intl.formatMessage({
        id: "vmSchedulingRuleType.antiAffinityVm",
        defaultMessage: "VM Exclusive from Each Other",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VmAffinityHost", {
      i18nKey: "vmSchedulingRuleType.vmAffinityHost",
      name: intl.formatMessage({
        id: "vmSchedulingRuleType.vmAffinityHost",
        defaultMessage: "VMs Affinitive to Hosts",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VmAntiAffinityHost", {
      i18nKey: "vmSchedulingRuleType.vmAntiAffinityHost",
      name: intl.formatMessage({
        id: "vmSchedulingRuleType.vmAntiAffinityHost",
        defaultMessage: "VMs Exclusive from Hosts",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Invalid", {
      i18nKey: "vmSchedulingExcuteState.invalid",
      name: intl.formatMessage({
        id: "vmSchedulingExcuteState.invalid",
        defaultMessage: "Inactive",
      }),
      color: { color: "disabled", number: 500 },
      prefix: "dot",
    });
    _map.set("Conflict", {
      i18nKey: "vmSchedulingExcuteState.conflict",
      name: intl.formatMessage({
        id: "vmSchedulingExcuteState.conflict",
        defaultMessage: "Conflicted",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("Created", {
      i18nKey: "created",
      name: intl.formatMessage({ id: "created", defaultMessage: "Created" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("Starting", {
      i18nKey: "starting",
      name: intl.formatMessage({ id: "starting", defaultMessage: "Starting" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("Running", {
      i18nKey: "running",
      name: intl.formatMessage({ id: "running", defaultMessage: "Running" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("Stopping", {
      i18nKey: "stopping",
      name: intl.formatMessage({ id: "stopping", defaultMessage: "Stopping" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("Stopped", {
      i18nKey: "stopped",
      name: intl.formatMessage({ id: "stopped", defaultMessage: "Stopped" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("Rebooting", {
      i18nKey: "rebooting",
      name: intl.formatMessage({ id: "rebooting", defaultMessage: "Rebooting" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("Destroying", {
      i18nKey: "destroying",
      name: intl.formatMessage({ id: "destroying", defaultMessage: "Deleting" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("Destroyed", {
      i18nKey: "destroyed",
      name: intl.formatMessage({ id: "destroyed", defaultMessage: "Deleted" }),
      icon: "trash-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("Expunging", {
      i18nKey: "expunging",
      name: intl.formatMessage({ id: "expunging", defaultMessage: "Expunging" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("Pausing", {
      i18nKey: "pausing",
      name: intl.formatMessage({ id: "pausing", defaultMessage: "Pausing" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("Paused", {
      i18nKey: "paused",
      name: intl.formatMessage({ id: "paused", defaultMessage: "Paused" }),
      icon: "pause-circle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("Resuming", {
      i18nKey: "resuming",
      name: intl.formatMessage({ id: "resuming", defaultMessage: "Resuming" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VolumeMigrating", {
      i18nKey: "volumeMigrating",
      name: intl.formatMessage({
        id: "volumeMigrating",
        defaultMessage: "Disk migrating",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("Error", {
      i18nKey: "error",
      name: intl.formatMessage({ id: "error", defaultMessage: "Error" }),
      icon: "question-mark-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("Unknown", {
      i18nKey: "unknown",
      name: intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" }),
      icon: "question-mark-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("NoState", {
      i18nKey: "noState",
      name: intl.formatMessage({ id: "noState", defaultMessage: "Fail to Obtain" }),
      icon: "question-mark-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("Uninstall", {
      i18nKey: "uninstall",
      name: intl.formatMessage({ id: "uninstall", defaultMessage: "Not installed" }),
      icon: "wrench-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("IsRunning", {
      i18nKey: "vmRunning",
      name: intl.formatMessage({ id: "vmRunning", defaultMessage: "Running" }),
      icon: "wrench-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("Unsupport", {
      i18nKey: "unsupport",
      name: intl.formatMessage({ id: "unsupport", defaultMessage: "Not supported" }),
      icon: "wrench-circle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("Crashed", {
      i18nKey: "crashed",
      name: intl.formatMessage({ id: "crashed", defaultMessage: "Crashed" }),
      icon: "alert-triangle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VolumeRecovering", {
      i18nKey: "cdpVolumeRecovering",
      name: intl.formatMessage({
        id: "cdpVolumeRecovering",
        defaultMessage: "Restoring Data",
      }),
      icon: "hourglass",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("Failed", {
      i18nKey: "interrupt",
      name: intl.formatMessage({ id: "interrupt", defaultMessage: "Interrupted" }),
      icon: "shutter-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("DataMerging", {
      i18nKey: "underProtection",
      name: intl.formatMessage({
        id: "underProtection",
        defaultMessage: "Protected",
      }),
      icon: "shutter-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("null", {
      i18nKey: "unprotected",
      name: intl.formatMessage({ id: "unprotected", defaultMessage: "Unprotected" }),
      icon: "shutter-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("Installed", {
      i18nKey: "installed",
      name: intl.formatMessage({ id: "installed", defaultMessage: "Installed" }),
      icon: "wrench-circle-fill",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("BackupTask", {
      i18nKey: "backupJob",
      name: intl.formatMessage({ id: "backupJob", defaultMessage: "Backup Job" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("CdpTask", {
      i18nKey: "cdpTask",
      name: intl.formatMessage({ id: "cdpTask", defaultMessage: "CDP Task" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Matched", {
      i18nKey: "vmQemuState.matched",
      name: intl.formatMessage({
        id: "vmQemuState.matched",
        defaultMessage: "Normal",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Unmatched", {
      i18nKey: "vmQemuState.unmatched",
      name: intl.formatMessage({
        id: "vmQemuState.unmatched",
        defaultMessage: "Need Update",
      }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("Staled", {
      i18nKey: "deleted",
      name: intl.formatMessage({ id: "deleted", defaultMessage: "Deleted" }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("RootVolumeTemplate", {
      i18nKey: "system.image",
      name: intl.formatMessage({
        id: "system.image",
        defaultMessage: "System Image",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("DataVolumeTemplate", {
      i18nKey: "volume.image",
      name: intl.formatMessage({
        id: "volume.image",
        defaultMessage: "Disk Image",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ISO", {
      i18nKey: "iso",
      name: intl.formatMessage({ id: "iso", defaultMessage: "ISO" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("qcow2", {
      i18nKey: "qcow2",
      name: intl.formatMessage({ id: "qcow2", defaultMessage: "qcow2" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("iso", {
      i18nKey: "ios",
      name: intl.formatMessage({ id: "ios", defaultMessage: "iso" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("raw", {
      i18nKey: "raw",
      name: intl.formatMessage({ id: "raw", defaultMessage: "raw" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("vmtx", {
      i18nKey: "vmtx",
      name: intl.formatMessage({ id: "vmtx", defaultMessage: "vmtx" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Downloading", {
      i18nKey: "downloading",
      name: intl.formatMessage({ id: "downloading", defaultMessage: "Downloading" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("IPv4", {
      i18nKey: "IPv4",
      name: intl.formatMessage({ id: "IPv4", defaultMessage: "IPv4" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("IPv6", {
      i18nKey: "IPv6",
      name: intl.formatMessage({ id: "IPv6", defaultMessage: "IPv6" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("public", {
      i18nKey: "public",
      name: intl.formatMessage({ id: "public", defaultMessage: "Public Network" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("vpc", {
      i18nKey: "vpc",
      name: intl.formatMessage({ id: "vpc", defaultMessage: "VPC" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("flat", {
      i18nKey: "flat",
      name: intl.formatMessage({ id: "flat", defaultMessage: "Flat Network" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HadBind", {
      i18nKey: "had.bind.service",
      name: intl.formatMessage({
        id: "had.bind.service",
        defaultMessage: "Associated",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("NotBind", {
      i18nKey: "not.bind.service",
      name: intl.formatMessage({
        id: "not.bind.service",
        defaultMessage: "Not associated",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("limit", {
      i18nKey: "shared.qos.vip.limit",
      name: intl.formatMessage({
        id: "shared.qos.vip.limit",
        defaultMessage: "Normal",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("unlimit", {
      i18nKey: "shared.qos.vip.unlimit",
      name: intl.formatMessage({
        id: "shared.qos.vip.unlimit",
        defaultMessage: "No Limit",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("Active", {
      i18nKey: "constant.Active",
      name: intl.formatMessage({
        id: "constant.Active",
        defaultMessage: "Unattached",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("Attached", {
      i18nKey: "constant.Attached",
      name: intl.formatMessage({
        id: "constant.Attached",
        defaultMessage: "Attached",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Connecting", {
      i18nKey: "connecting",
      name: intl.formatMessage({ id: "connecting", defaultMessage: "Connecting" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("Connected", {
      i18nKey: "connected",
      name: intl.formatMessage({ id: "connected", defaultMessage: "Connected" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Disconnected", {
      i18nKey: "disconnected",
      name: intl.formatMessage({
        id: "disconnected",
        defaultMessage: "Disconnected",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("Synchronizing", {
      i18nKey: "synchronizing",
      name: intl.formatMessage({
        id: "synchronizing",
        defaultMessage: "Synchronizing",
      }),
      color: { color: "pending", number: 600 },
      prefix: "dot",
    });
    _map.set("Waiting", {
      i18nKey: "waiting",
      name: intl.formatMessage({ id: "waiting", defaultMessage: "Preparing" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("Suspended", {
      i18nKey: "suspended",
      name: intl.formatMessage({ id: "suspended", defaultMessage: "Suspended" }),
      icon: "pause-circle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("Succeeded", {
      i18nKey: "succeeded",
      name: intl.formatMessage({ id: "succeeded", defaultMessage: "Succeeded" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("Canceling", {
      i18nKey: "canceling",
      name: intl.formatMessage({ id: "canceling", defaultMessage: "Canceling" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("Canceled", {
      i18nKey: "canceled",
      name: intl.formatMessage({ id: "canceled", defaultMessage: "Canceled" }),
      icon: "close-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("Fault", {
      i18nKey: "usbKey.fault",
      name: intl.formatMessage({ id: "usbKey.fault", defaultMessage: "Fault" }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("Missing", {
      i18nKey: "usbKey.missing",
      name: intl.formatMessage({
        id: "usbKey.missing",
        defaultMessage: "Missing",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("Abnormal", {
      i18nKey: "usbKey.abnormal",
      name: intl.formatMessage({
        id: "usbKey.abnormal",
        defaultMessage: "Abnormal",
      }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("TicketPending", {
      i18nKey: "ticket.status.pending",
      name: intl.formatMessage({
        id: "ticket.status.pending",
        defaultMessage: "Ongoing",
      }),
      color: { color: "info", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketCancelled", {
      i18nKey: "cancelled",
      name: intl.formatMessage({ id: "cancelled", defaultMessage: "Recalled" }),
      color: { color: "neutral", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketIntermediateApproved", {
      i18nKey: "Intermediate.approved",
      name: intl.formatMessage({
        id: "Intermediate.approved",
        defaultMessage: "Ongoing",
      }),
      color: { color: "info", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketFinalApproved", {
      i18nKey: "final.approved",
      name: intl.formatMessage({
        id: "final.approved",
        defaultMessage: "Approved",
      }),
      color: { color: "positive", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketRejected", {
      i18nKey: "rejected",
      name: intl.formatMessage({ id: "rejected", defaultMessage: "Reject" }),
      color: { color: "danger", number: 500 },
      contentType: "tag",
    });
    _map.set("Single", {
      i18nKey: "singleVolume",
      name: intl.formatMessage({ id: "singleVolume", defaultMessage: "Single Snapshot" }),
      icon: "camera-fill",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("Group", {
      i18nKey: "snapshotGroup",
      name: intl.formatMessage({
        id: "snapshotGroup",
        defaultMessage: "Snapshot Group",
      }),
      icon: "cameras-fill",
      color: { color: "pending", number: 500 },
      prefix: "icon",
    });
    _map.set("Available", {
      i18nKey: "recoverable",
      name: intl.formatMessage({ id: "recoverable", defaultMessage: "Recoverable" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Unable", {
      i18nKey: "unrecoverable",
      name: intl.formatMessage({
        id: "unrecoverable",
        defaultMessage: "Single snapshot restorable",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("Yes", {
      i18nKey: "memorySnapshot.yes",
      name: intl.formatMessage({
        id: "memorySnapshot.yes",
        defaultMessage: "Yes",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("No", {
      i18nKey: "memorySnapshot.no",
      name: intl.formatMessage({
        id: "memorySnapshot.no",
        defaultMessage: "No",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("running", {
      i18nKey: "constant.running",
      name: intl.formatMessage({
        id: "constant.running",
        defaultMessage: "Running",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("failed", {
      i18nKey: "constant.failed",
      name: intl.formatMessage({
        id: "constant.failed",
        defaultMessage: "Failed",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("active", {
      i18nKey: "constant.active",
      name: intl.formatMessage({
        id: "constant.active",
        defaultMessage: "Active",
      }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("enabled", {
      i18nKey: "constant.enabled",
      name: intl.formatMessage({
        id: "constant.enabled",
        defaultMessage: "Enabled",
      }),
      icon: "pause-circle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("fiberChannel", {
      i18nKey: "fc.storage",
      name: intl.formatMessage({ id: "fc.storage", defaultMessage: "FC Storage" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("iSCSI", {
      i18nKey: "iscsi.server.storage",
      name: intl.formatMessage({
        id: "iscsi.server.storage",
        defaultMessage: "iSCSI Storage",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("NVMe", {
      i18nKey: "nvme.storage",
      name: intl.formatMessage({
        id: "nvme.storage",
        defaultMessage: "NVMe Storage",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Exception", {
      i18nKey: "Exception",
      name: intl.formatMessage({ id: "Exception", defaultMessage: "Abnormal" }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("Synced", {
      i18nKey: "Synced",
      name: intl.formatMessage({ id: "Synced", defaultMessage: "Synced" }),
      icon: "loader",
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Unsynced", {
      i18nKey: "Unsynced",
      name: intl.formatMessage({ id: "Unsynced", defaultMessage: "Not synced" }),
      icon: "loader",
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("Ingress", {
      i18nKey: "constant.Ingress",
      name: intl.formatMessage({
        id: "constant.Ingress",
        defaultMessage: "Ingress",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Egress", {
      i18nKey: "constant.Egress",
      name: intl.formatMessage({
        id: "constant.Egress",
        defaultMessage: "Egress",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("TCP", {
      i18nKey: "constant.TCP",
      name: intl.formatMessage({ id: "constant.TCP", defaultMessage: "TCP" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("UDP", {
      i18nKey: "constant.UDP",
      name: intl.formatMessage({ id: "constant.UDP", defaultMessage: "UDP" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ICMP", {
      i18nKey: "constant.ICMP",
      name: intl.formatMessage({ id: "constant.ICMP", defaultMessage: "ICMP" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ALL", {
      i18nKey: "constant.ALL",
      name: intl.formatMessage({ id: "constant.ALL", defaultMessage: "ALL" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Activated", {
      i18nKey: "Activated",
      name: intl.formatMessage({ id: "Activated", defaultMessage: "Activated" }),
      icon: "loader",
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Unactivated", {
      i18nKey: "Unactivated",
      name: intl.formatMessage({ id: "Unactivated", defaultMessage: "Inactivated" }),
      icon: "loader",
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("Shell", {
      i18nKey: "ScriptType.Shell",
      name: intl.formatMessage({
        id: "ScriptType.Shell",
        defaultMessage: "Shell",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Python", {
      i18nKey: "ScriptType.Python",
      name: intl.formatMessage({
        id: "ScriptType.Python",
        defaultMessage: "Python",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Perl", {
      i18nKey: "ScriptType.Perl",
      name: intl.formatMessage({
        id: "ScriptType.Perl",
        defaultMessage: "Perl",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Bat", {
      i18nKey: "ScriptType.Bat",
      name: intl.formatMessage({ id: "ScriptType.Bat", defaultMessage: "Bat" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Powershell", {
      i18nKey: "ScriptType.Powershell",
      name: intl.formatMessage({
        id: "ScriptType.Powershell",
        defaultMessage: "Powershell",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Uploading", {
      i18nKey: "scriptExecuteRecordDetailStatus.uploading",
      name: intl.formatMessage({
        id: "scriptExecuteRecordDetailStatus.uploading",
        defaultMessage: "Uploading",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("Completed", {
      i18nKey: "scriptExecuteRecordDetailStatus.completed",
      name: intl.formatMessage({
        id: "scriptExecuteRecordDetailStatus.completed",
        defaultMessage: "Completed",
      }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("Succeed", {
      i18nKey: "scriptExecuteRecordStatus.succeed",
      name: intl.formatMessage({
        id: "scriptExecuteRecordStatus.succeed",
        defaultMessage: "Succeeded",
      }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("rootVolumeBackup", {
      i18nKey: "vm",
      name: intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("vmBackup", {
      i18nKey: "vm",
      name: intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("volumeBackup", {
      i18nKey: "volume",
      name: intl.formatMessage({ id: "volume", defaultMessage: "Disk" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackingUp", {
      i18nKey: "backupInProgress",
      name: intl.formatMessage({
        id: "backupInProgress",
        defaultMessage: "Backing up",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("StartVmInstanceJob", {
      i18nKey: "start.vm",
      name: intl.formatMessage({
        id: "start.vm",
        defaultMessage: "Power On VM",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("StopVmInstanceJob", {
      i18nKey: "stop.vm",
      name: intl.formatMessage({ id: "stop.vm", defaultMessage: "Shut Down VM" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("RebootVmInstanceJob", {
      i18nKey: "rebootVm",
      name: intl.formatMessage({
        id: "rebootVm",
        defaultMessage: "Reboot VM Instance",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("CreateVolumeSnapshotJob", {
      i18nKey: "create.volumeSnapshot",
      name: intl.formatMessage({
        id: "create.volumeSnapshot",
        defaultMessage: "Create Disk Snapshot",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("CreateVmSnapshot", {
      i18nKey: "create.vmSnapshot",
      name: intl.formatMessage({
        id: "create.vmSnapshot",
        defaultMessage: "Create VM Snapshot",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VMHA", {
      i18nKey: "schedTypes.vmha",
      name: intl.formatMessage({
        id: "schedTypes.vmha",
        defaultMessage: "Recover Virtual Machine",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HMT", {
      i18nKey: "schedTypes.hmt",
      name: intl.formatMessage({
        id: "schedTypes.hmt",
        defaultMessage: "Host Maintenance",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("UserStatic", {
      i18nKey: "static.routing",
      name: intl.formatMessage({
        id: "static.routing",
        defaultMessage: "Static Routing",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("UserBlackHole", {
      i18nKey: "black.hole.routing",
      name: intl.formatMessage({
        id: "black.hole.routing",
        defaultMessage: "Black Hole Routing",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Initial", {
      i18nKey: "constant.Initial",
      name: intl.formatMessage({
        id: "constant.Initial",
        defaultMessage: "Initializing",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("Deleting", {
      i18nKey: "constant.Deleting",
      name: intl.formatMessage({
        id: "constant.Deleting",
        defaultMessage: "Deleting",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("Rollbacking", {
      i18nKey: "constant.Rollbacking",
      name: intl.formatMessage({
        id: "constant.Rollbacking",
        defaultMessage: "Rollbacking",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("Rollbacked", {
      i18nKey: "constant.Rollbacked",
      name: intl.formatMessage({
        id: "constant.Rollbacked",
        defaultMessage: "Rollback succeeded",
      }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("Start", {
      i18nKey: "constant.Start",
      name: intl.formatMessage({
        id: "constant.Start",
        defaultMessage: "Start",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Finish", {
      i18nKey: "constant.Finish",
      name: intl.formatMessage({
        id: "constant.Finish",
        defaultMessage: "Finished",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("RollbackStart", {
      i18nKey: "constant.RollbackStart",
      name: intl.formatMessage({
        id: "constant.RollbackStart",
        defaultMessage: "Starting rollback",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("RollbackFinish", {
      i18nKey: "constant.RollbackFinish",
      name: intl.formatMessage({
        id: "constant.RollbackFinish",
        defaultMessage: "Rollback finished",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("RollbackFailed", {
      i18nKey: "constant.RollbackFailed",
      name: intl.formatMessage({
        id: "constant.RollbackFailed",
        defaultMessage: "Rollback failed",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("outDirection", {
      i18nKey: "outDirection",
      name: intl.formatMessage({
        id: "outDirection",
        defaultMessage: "Egress",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("inDirection", {
      i18nKey: "inDirection",
      name: intl.formatMessage({ id: "inDirection", defaultMessage: "Ingress" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Degraged", {
      i18nKey: "degraded",
      name: intl.formatMessage({ id: "degraded", defaultMessage: "Degrade" }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("Rebuild", {
      i18nKey: "rebuild",
      name: intl.formatMessage({ id: "rebuild", defaultMessage: "Rebuild" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("Valid", {
      i18nKey: "valid",
      name: intl.formatMessage({ id: "valid", defaultMessage: "Valid" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Maintenance", {
      i18nKey: "maintenance",
      name: intl.formatMessage({
        id: "maintenance",
        defaultMessage: "Maintenance Mode",
      }),
      icon: "wrench-circle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("LocalStorage", {
      i18nKey: "PrimaryStorage.LocalStorage",
      name: intl.formatMessage({
        id: "PrimaryStorage.LocalStorage",
        defaultMessage: "LocalStorage",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VCenter", {
      i18nKey: "PrimaryStorage.vCenter",
      name: intl.formatMessage({
        id: "PrimaryStorage.vCenter",
        defaultMessage: "vCenter",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("NFS", {
      i18nKey: "PrimaryStorage.NFS",
      name: intl.formatMessage({
        id: "PrimaryStorage.NFS",
        defaultMessage: "NFS",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Ceph", {
      i18nKey: "PrimaryStorage.Ceph",
      name: intl.formatMessage({
        id: "PrimaryStorage.Ceph",
        defaultMessage: "Ceph",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SharedMountPoint", {
      i18nKey: "PrimaryStorage.SharedMountPoint",
      name: intl.formatMessage({
        id: "PrimaryStorage.SharedMountPoint",
        defaultMessage: "SharedMountPoint",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SharedBlock", {
      i18nKey: "PrimaryStorage.SharedBlock",
      name: intl.formatMessage({
        id: "PrimaryStorage.SharedBlock",
        defaultMessage: "SharedBlock",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("MiniStorage", {
      i18nKey: "PrimaryStorage.MiniStorage",
      name: intl.formatMessage({
        id: "PrimaryStorage.MiniStorage",
        defaultMessage: "Mini Storage",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BlockStorage", {
      i18nKey: "PrimaryStorage.BlockStorage",
      name: intl.formatMessage({
        id: "PrimaryStorage.BlockStorage",
        defaultMessage: "Block",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Inactive", {
      i18nKey: "unavailable",
      name: intl.formatMessage({ id: "unavailable", defaultMessage: "Unavailable" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("Bidirection", {
      i18nKey: "bidirection",
      name: intl.formatMessage({ id: "bidirection", defaultMessage: "Bidirection" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("UNVIRTUALIZABLE", {
      i18nKey: "UNVIRTUALIZABLE",
      name: intl.formatMessage({
        id: "UNVIRTUALIZABLE",
        defaultMessage: "Unvirtualizable",
      }),
      icon: "loader",
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("SRIOVVIRTUALIZABLE", {
      i18nKey: "SRIOV_VIRTUALIZABLE",
      name: intl.formatMessage({
        id: "SRIOV_VIRTUALIZABLE",
        defaultMessage: "Virtualizable",
      }),
      icon: "loader",
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("SRIOVVIRTUALIZED", {
      i18nKey: "SRIOV_VIRTUALIZED",
      name: intl.formatMessage({
        id: "SRIOV_VIRTUALIZED",
        defaultMessage: "Virtualized",
      }),
      icon: "loader",
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("UNKNOWN", {
      i18nKey: "UNKNOWN",
      name: intl.formatMessage({ id: "UNKNOWN", defaultMessage: "Unknown" }),
      icon: "loader",
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("UnInstall", {
      i18nKey: "UnInstall",
      name: intl.formatMessage({ id: "UnInstall", defaultMessage: "Not installed" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("UnSupport", {
      i18nKey: "UnSupport",
      name: intl.formatMessage({ id: "UnSupport", defaultMessage: "Not supported" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Success", {
      i18nKey: "success",
      name: intl.formatMessage({ id: "success", defaultMessage: "Succeeded" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("TicketApprovalsFiledPending", {
      i18nKey: "my.approvals.filed.pending",
      name: intl.formatMessage({
        id: "my.approvals.filed.pending",
        defaultMessage: "Pending Approval",
      }),
      color: { color: "info", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsFiledCancelled", {
      i18nKey: "my.approvals.filed.cancelled",
      name: intl.formatMessage({
        id: "my.approvals.filed.cancelled",
        defaultMessage: "Rejected",
      }),
      color: { color: "neutral", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsFiledIntermediateApproved", {
      i18nKey: "my.approvals.filed.intermediateApproved",
      name: intl.formatMessage({
        id: "my.approvals.filed.intermediateApproved",
        defaultMessage: "Approved",
      }),
      color: { color: "info", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsFiledFinalApproved", {
      i18nKey: "my.approvals.filed.finalApproved",
      name: intl.formatMessage({
        id: "my.approvals.filed.finalApproved",
        defaultMessage: "Approved",
      }),
      color: { color: "positive", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsFiledRejected", {
      i18nKey: "my.approvals.field.rejected",
      name: intl.formatMessage({
        id: "my.approvals.field.rejected",
        defaultMessage: "Rejected",
      }),
      color: { color: "danger", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsPending", {
      i18nKey: "my.approvals.pending",
      name: intl.formatMessage({
        id: "my.approvals.pending",
        defaultMessage: "Pending Approval",
      }),
      color: { color: "info", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsCancelled", {
      i18nKey: "my.approvals.cancelled",
      name: intl.formatMessage({
        id: "my.approvals.cancelled",
        defaultMessage: "Recalled",
      }),
      color: { color: "neutral", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsIntermediateApproved", {
      i18nKey: "my.approvals.intermediateApproved",
      name: intl.formatMessage({
        id: "my.approvals.intermediateApproved",
        defaultMessage: "Approved",
      }),
      color: { color: "positive", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsFinalApproved", {
      i18nKey: "my.approvals.finalApproved",
      name: intl.formatMessage({
        id: "my.approvals.finalApproved",
        defaultMessage: "Approved",
      }),
      color: { color: "positive", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsRejected", {
      i18nKey: "my.approvals.rejected",
      name: intl.formatMessage({
        id: "my.approvals.rejected",
        defaultMessage: "Rejected",
      }),
      color: { color: "danger", number: 500 },
      contentType: "tag",
    });
    _map.set("Include", {
      i18nKey: "Include",
      name: intl.formatMessage({ id: "Include", defaultMessage: "Included" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("NotInclude", {
      i18nKey: "NotInclude",
      name: intl.formatMessage({ id: "NotInclude", defaultMessage: "Not included" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Full", {
      i18nKey: "Full",
      name: intl.formatMessage({ id: "Full", defaultMessage: "Full" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Incremental", {
      i18nKey: "Incremental",
      name: intl.formatMessage({ id: "Incremental", defaultMessage: "Incremental" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SLB", {
      i18nKey: "high.performance.instance.type",
      name: intl.formatMessage({
        id: "high.performance.instance.type",
        defaultMessage: "Dedicated Performance",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Shared", {
      i18nKey: "performance.sharing.type",
      name: intl.formatMessage({
        id: "performance.sharing.type",
        defaultMessage: "Shared Performance",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("roundrobin", {
      i18nKey: "constant.roundrobin",
      name: intl.formatMessage({
        id: "constant.roundrobin",
        defaultMessage: "Round Robin",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("leastconn", {
      i18nKey: "constant.leastconn",
      name: intl.formatMessage({
        id: "constant.leastconn",
        defaultMessage: "Least Connections",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("source", {
      i18nKey: "constant.source",
      name: intl.formatMessage({
        id: "constant.source",
        defaultMessage: "Source Hashing Scheduling",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("weightroundrobin", {
      i18nKey: "constant.weightroundrobin",
      name: intl.formatMessage({
        id: "constant.weightroundrobin",
        defaultMessage: "Weighted Round Robin",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("healthy", {
      i18nKey: "constant.healthy",
      name: intl.formatMessage({
        id: "constant.healthy",
        defaultMessage: "Healthy",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("unhealthy", {
      i18nKey: "constant.unhealthy",
      name: intl.formatMessage({
        id: "constant.unhealthy",
        defaultMessage: "Unhealthy",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("L2NoVlanNetwork", {
      i18nKey: "L2NoVlanNetwork",
      name: intl.formatMessage({
        id: "L2NoVlanNetwork",
        defaultMessage: "L2NoVlanNetwork",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("L2VlanNetwork", {
      i18nKey: "L2VlanNetwork",
      name: intl.formatMessage({
        id: "L2VlanNetwork",
        defaultMessage: "L2VlanNetwork",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VxlanNetwork", {
      i18nKey: "VxlanNetwork",
      name: intl.formatMessage({
        id: "VxlanNetwork",
        defaultMessage: "VxlanNetwork",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HardwareVxlanNetwork", {
      i18nKey: "HardwareVxlanNetwork",
      name: intl.formatMessage({
        id: "HardwareVxlanNetwork",
        defaultMessage: "HardwareVxlanNetwork",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VxlanNetworkPool", {
      i18nKey: "VxlanNetworkPool",
      name: intl.formatMessage({
        id: "VxlanNetworkPool",
        defaultMessage: "VxlanNetworkPool",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HardwareVxlanNetworkPool", {
      i18nKey: "HardwareVxlanNetworkPool",
      name: intl.formatMessage({
        id: "HardwareVxlanNetworkPool",
        defaultMessage: "HardwareVxlanNetworkPool",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("virtualSwitch", {
      i18nKey: "virtualSwitch",
      name: intl.formatMessage({
        id: "virtualSwitch",
        defaultMessage: "virtualSwitch",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("portGroup", {
      i18nKey: "portGroup",
      name: intl.formatMessage({
        id: "portGroup",
        defaultMessage: "portGroup",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("true", {
      i18nKey: "l2NetworkIsolated.open",
      name: intl.formatMessage({
        id: "l2NetworkIsolated.open",
        defaultMessage: "Enable",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("false", {
      i18nKey: "l2NetworkIsolated.close",
      name: intl.formatMessage({
        id: "l2NetworkIsolated.close",
        defaultMessage: "Disable",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("LeastVmPreferredHostAllocatorStrategy", {
      i18nKey: "least.vm.preferred.host.allocator.strategy",
      name: intl.formatMessage({
        id: "least.vm.preferred.host.allocator.strategy",
        defaultMessage: "Minimum Concurrently Running VMs",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("MinimumCPUUsageHostAllocatorStrategy", {
      i18nKey: "minimum.cpu.usage.host.allocator.strategy",
      name: intl.formatMessage({
        id: "minimum.cpu.usage.host.allocator.strategy",
        defaultMessage: "Minimum CPU Usage",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("MinimumMemoryUsageHostAllocatorStrategy", {
      i18nKey: "minimum.memory.usage.host.allocator.strategy",
      name: intl.formatMessage({
        id: "minimum.memory.usage.host.allocator.strategy",
        defaultMessage: "Minimum Memory Utilization",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("MaxInstancePerHostHostAllocatorStrategy", {
      i18nKey: "maxInstance.perhost.host.allocator.strategy",
      name: intl.formatMessage({
        id: "maxInstance.perhost.host.allocator.strategy",
        defaultMessage: "Host with max. running VMs",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("LastHostPreferredAllocatorStrategy", {
      i18nKey: "last.host.preferred.allocator.strategy",
      name: intl.formatMessage({
        id: "last.host.preferred.allocator.strategy",
        defaultMessage: "Last Host",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("DefaultHostAllocatorStrategy", {
      i18nKey: "default.host.allocator.strategy",
      name: intl.formatMessage({
        id: "default.host.allocator.strategy",
        defaultMessage: "Random",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("CRITICAL", {
      i18nKey: "inspection.critical",
      name: intl.formatMessage({
        id: "inspection.critical",
        defaultMessage: "Fault",
      }),
      icon: "alert-triangle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("WARN", {
      i18nKey: "inspection.warn",
      name: intl.formatMessage({
        id: "inspection.warn",
        defaultMessage: "Warning",
      }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("NORMAL", {
      i18nKey: "inspection.normal",
      name: intl.formatMessage({
        id: "inspection.normal",
        defaultMessage: "Normal",
      }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("FAILED", {
      i18nKey: "inspection.failed",
      name: intl.formatMessage({
        id: "inspection.failed",
        defaultMessage: "Failed",
      }),
      icon: "alert-triangle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("HEALTHY", {
      i18nKey: "healthy",
      name: intl.formatMessage({ id: "healthy", defaultMessage: "Healthy" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("UNHEALTHY", {
      i18nKey: "unhealthy",
      name: intl.formatMessage({ id: "unhealthy", defaultMessage: "Unhealthy" }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("EXIST", {
      i18nKey: "ECCWarning.exist",
      name: intl.formatMessage({
        id: "ECCWarning.exist",
        defaultMessage: "Warning",
      }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("NOTEXIST", {
      i18nKey: "ECCWarning.not.exist",
      name: intl.formatMessage({
        id: "ECCWarning.not.exist",
        defaultMessage: "None",
      }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("CONSISTENT", {
      i18nKey: "consistent",
      name: intl.formatMessage({ id: "consistent", defaultMessage: "Consistent" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("INCONSISTENT", {
      i18nKey: "inconsistent",
      name: intl.formatMessage({
        id: "inconsistent",
        defaultMessage: "Inconsistent",
      }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("YES", {
      i18nKey: "yes",
      name: intl.formatMessage({ id: "yes", defaultMessage: "Yes" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("NO", {
      i18nKey: "no",
      name: intl.formatMessage({ id: "no", defaultMessage: "No" }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("PLUGGED", {
      i18nKey: "plugged",
      name: intl.formatMessage({ id: "plugged", defaultMessage: "Yes" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("UNPLUGGED", {
      i18nKey: "unplugged",
      name: intl.formatMessage({ id: "unplugged", defaultMessage: "No" }),
      icon: "alert-triangle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("Public", {
      i18nKey: "share.type.public",
      name: intl.formatMessage({
        id: "share.type.public",
        defaultMessage: "Share globally",
      }),
      icon: "people-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("None", {
      i18nKey: "share.type.none",
      name: intl.formatMessage({
        id: "share.type.none",
        defaultMessage: "Not share",
      }),
      icon: "person-fill",
      color: { color: "neutral", number: 600 },
      prefix: "icon",
    });
    _map.set("vrouter", {
      i18nKey: "vpc.vRouter",
      name: intl.formatMessage({
        id: "vpc.vRouter",
        defaultMessage: "VPC vRouter",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Retired", {
      i18nKey: "retired",
      name: intl.formatMessage({ id: "retired", defaultMessage: "Expired" }),
      icon: "minus-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("LoginExpired", {
      i18nKey: "loginExpired",
      name: intl.formatMessage({
        id: "loginExpired",
        defaultMessage: "Login Restricted",
      }),
      icon: "minus-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("Idle", {
      i18nKey: "aliyunRouterInterfaceStatus.status.Idle",
      name: intl.formatMessage({
        id: "aliyunRouterInterfaceStatus.status.Idle",
        defaultMessage: "Idle",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Deactivating", {
      i18nKey: "aliyunRouterInterfaceStatus.status.Deactivating",
      name: intl.formatMessage({
        id: "aliyunRouterInterfaceStatus.status.Deactivating",
        defaultMessage: "Disabled",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("AcceptingSide", {
      i18nKey: "receivingEnd",
      name: intl.formatMessage({
        id: "receivingEnd",
        defaultMessage: "Endpoint",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("InitiatingSide", {
      i18nKey: "initiatingSide",
      name: intl.formatMessage({
        id: "initiatingSide",
        defaultMessage: "Initiator",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Performance", {
      i18nKey: "Performance",
      name: intl.formatMessage({
        id: "Performance",
        defaultMessage: "Performance",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Capacity", {
      i18nKey: "Capacity",
      name: intl.formatMessage({ id: "Capacity", defaultMessage: "Capacity" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SMB", {
      i18nKey: "SMB",
      name: intl.formatMessage({ id: "SMB", defaultMessage: "SMB" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PreMaintenance", {
      i18nKey: "pre.maintenance.mode",
      name: intl.formatMessage({
        id: "pre.maintenance.mode",
        defaultMessage: "Pre Maintenance Mode",
      }),
      icon: "wrench-circle-fill",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("NoElectric", {
      i18nKey: "no.electric",
      name: intl.formatMessage({ id: "no.electric", defaultMessage: "Not Powered" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("POWER_ON", {
      i18nKey: "power.on",
      name: intl.formatMessage({ id: "power.on", defaultMessage: "Power On" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("POWER_OFF", {
      i18nKey: "power.off",
      name: intl.formatMessage({ id: "power.off", defaultMessage: "Power Off" }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("POWER_BOOTING", {
      i18nKey: "power.booting",
      name: intl.formatMessage({
        id: "power.booting",
        defaultMessage: "Powering on",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("POWER_SHUTDOWN", {
      i18nKey: "power.shutdown",
      name: intl.formatMessage({
        id: "power.shutdown",
        defaultMessage: "Powering off",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("POWER_UNKNOWN", {
      i18nKey: "unknown",
      name: intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" }),
      color: { color: "disabled", number: 500 },
      prefix: "dot",
    });
    _map.set("UN_CONFIGURED", {
      i18nKey: "ipmi.not.managed",
      name: intl.formatMessage({
        id: "ipmi.not.managed",
        defaultMessage: "IPMI Unmanaged",
      }),
      color: { color: "disabled", number: 500 },
      prefix: "dot",
    });
    _map.set("Online", {
      i18nKey: "constant.Online",
      name: intl.formatMessage({
        id: "constant.Online",
        defaultMessage: "Online",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Offline", {
      i18nKey: "constant.Offline",
      name: intl.formatMessage({
        id: "constant.Offline",
        defaultMessage: "Offline",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("Linkdown", {
      i18nKey: "constant.Linkdown",
      name: intl.formatMessage({
        id: "constant.Linkdown",
        defaultMessage: "Linkdown",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("Loopback", {
      i18nKey: "constant.Loopback",
      name: intl.formatMessage({
        id: "constant.Loopback",
        defaultMessage: "Loopback",
      }),
      color: { color: "pending", number: 500 },
      prefix: "dot",
    });
    _map.set("Testing", {
      i18nKey: "constant.Testing",
      name: intl.formatMessage({
        id: "constant.Testing",
        defaultMessage: "Testing",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("Initializing", {
      i18nKey: "constant.Initializing",
      name: intl.formatMessage({
        id: "constant.Initializing",
        defaultMessage: "Initializing",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("GPU_Video_Controller", {
      i18nKey: "constant.GPU_Video_Controller",
      name: intl.formatMessage({
        id: "constant.GPU_Video_Controller",
        defaultMessage: "GPU Graphics Controller",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("GPU_Audio_Controller", {
      i18nKey: "constant.GPU_Audio_Controller",
      name: intl.formatMessage({
        id: "constant.GPU_Audio_Controller",
        defaultMessage: "GPU Sound Card Controller",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("GPU_Processing_Accelerators", {
      i18nKey: "constant.GPU_Processing_Accelerators",
      name: intl.formatMessage({
        id: "constant.GPU_Processing_Accelerators",
        defaultMessage: "GPU Inference Card Controller",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Ethernet_Controller", {
      i18nKey: "constant.Ethernet_Controller",
      name: intl.formatMessage({
        id: "constant.Ethernet_Controller",
        defaultMessage: "NIC",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("GPU_3D_Controller", {
      i18nKey: "constant.GPU_3D_Controller",
      name: intl.formatMessage({
        id: "constant.GPU_3D_Controller",
        defaultMessage: "GPU 3D Controller",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Moxa_Device", {
      i18nKey: "constant.Moxa_Device",
      name: intl.formatMessage({
        id: "constant.Moxa_Device",
        defaultMessage: "Moxa Card",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Generic", {
      i18nKey: "constant.Generic",
      name: intl.formatMessage({
        id: "constant.Generic",
        defaultMessage: "Generic Device",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SRIOV_VIRTUALIZABLE", {
      i18nKey: "constant.SRIOV_VIRTUALIZABLE",
      name: intl.formatMessage({
        id: "constant.SRIOV_VIRTUALIZABLE",
        defaultMessage: "Supports SR-IOV virtualization",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VFIO_MDEV_VIRTUALIZABLE", {
      i18nKey: "constant.VFIO_MDEV_VIRTUALIZABLE",
      name: intl.formatMessage({
        id: "constant.VFIO_MDEV_VIRTUALIZABLE",
        defaultMessage: "Supports VFIO MDEV virtualization",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SRIOV_VIRTUALIZED", {
      i18nKey: "constant.SRIOV_VIRTUALIZED",
      name: intl.formatMessage({
        id: "constant.SRIOV_VIRTUALIZED",
        defaultMessage: "SR-IOV virtualized",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VFIO_MDEV_VIRTUALIZED", {
      i18nKey: "constant.VFIO_MDEV_VIRTUALIZED",
      name: intl.formatMessage({
        id: "constant.VFIO_MDEV_VIRTUALIZED",
        defaultMessage: "VFIO_MDEV virtualized",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SRIOV_VIRTUAL", {
      i18nKey: "constant.SRIOV_VIRTUAL",
      name: intl.formatMessage({
        id: "constant.SRIOV_VIRTUAL",
        defaultMessage: "SR-IOV VF Device",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("nominal", {
      i18nKey: "normal",
      name: intl.formatMessage({ id: "normal", defaultMessage: "Normal" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("critical", {
      i18nKey: "constant.critical",
      name: intl.formatMessage({
        id: "constant.critical",
        defaultMessage: "Fault",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("unknown", {
      i18nKey: "common.unknown",
      name: intl.formatMessage({
        id: "common.unknown",
        defaultMessage: "Unknown",
      }),
      color: { color: "disabled", number: 500 },
      prefix: "dot",
    });
    _map.set("DELETED", {
      i18nKey: "deleted",
      name: intl.formatMessage({ id: "deleted", defaultMessage: "Deleted" }),
      icon: "trash",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("STOPPED", {
      i18nKey: "state.stopped",
      name: intl.formatMessage({
        id: "state.stopped",
        defaultMessage: "Stopped",
      }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("TRANSFERRING", {
      i18nKey: "transferring",
      name: intl.formatMessage({
        id: "transferring",
        defaultMessage: "TRANSFERRING",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("RUNNING", {
      i18nKey: "running",
      name: intl.formatMessage({ id: "running", defaultMessage: "Running" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("RESETTING", {
      i18nKey: "resetting",
      name: intl.formatMessage({ id: "resetting", defaultMessage: "Resetting" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("STARTING", {
      i18nKey: "starting",
      name: intl.formatMessage({ id: "starting", defaultMessage: "Starting" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("STOPPING", {
      i18nKey: "stopping",
      name: intl.formatMessage({ id: "stopping", defaultMessage: "Stopping" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("PENDING", {
      i18nKey: "PENDING",
      name: intl.formatMessage({ id: "PENDING", defaultMessage: "PENDING" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("SystemDisk", {
      i18nKey: "system.disk",
      name: intl.formatMessage({ id: "system.disk", defaultMessage: "System Disk" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("CacheDisk", {
      i18nKey: "cache.disk",
      name: intl.formatMessage({ id: "cache.disk", defaultMessage: "Cache Disk" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("DataDisk", {
      i18nKey: "data.disk",
      name: intl.formatMessage({ id: "data.disk", defaultMessage: "Data Disk" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Rebuilding", {
      i18nKey: "rebuilding",
      name: intl.formatMessage({ id: "rebuilding", defaultMessage: "Rebuilding" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("ImageCache", {
      i18nKey: "cephPrimaryStoragePoolType.imageCache",
      name: intl.formatMessage({
        id: "cephPrimaryStoragePoolType.imageCache",
        defaultMessage: "Image Cache Pool",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackupStorage", {
      i18nKey: "cephPrimaryStoragePoolType.backupStorage",
      name: intl.formatMessage({
        id: "cephPrimaryStoragePoolType.backupStorage",
        defaultMessage: "Image Storage Pool",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Protecting", {
      i18nKey: "underProtection",
      name: intl.formatMessage({
        id: "underProtection",
        defaultMessage: "Protected",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Unprotected", {
      i18nKey: "unprotected",
      name: intl.formatMessage({ id: "unprotected", defaultMessage: "Unprotected" }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("RecoveryPoint", {
      i18nKey: "recoveryPoint",
      name: intl.formatMessage({
        id: "recoveryPoint",
        defaultMessage: "Recovery Point",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("ProtectedRecoveryPoint", {
      i18nKey: "protectedRecoveryPoint",
      name: intl.formatMessage({
        id: "protectedRecoveryPoint",
        defaultMessage: "Protected Recovery Point",
      }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("Warning", {
      i18nKey: "block.volume.status.warning",
      name: intl.formatMessage({
        id: "block.volume.status.warning",
        defaultMessage: "Restoring Errors",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("CreateFailed", {
      i18nKey: "CreateFailed",
      name: intl.formatMessage({
        id: "CreateFailed",
        defaultMessage: "Failed to Create",
      }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("UpdateFailed", {
      i18nKey: "UpdateFailed",
      name: intl.formatMessage({
        id: "UpdateFailed",
        defaultMessage: "Failed to Update",
      }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("DeleteFailed", {
      i18nKey: "DeleteFailed",
      name: intl.formatMessage({
        id: "DeleteFailed",
        defaultMessage: "Failed to Delete",
      }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("Updating", {
      i18nKey: "Updating",
      name: intl.formatMessage({ id: "Updating", defaultMessage: "Updating" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("DesktopGpu", {
      i18nKey: "DesktopGpu",
      name: intl.formatMessage({
        id: "DesktopGpu",
        defaultMessage: "Desktop GPU",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ComputeGpu", {
      i18nKey: "ComputeGpu",
      name: intl.formatMessage({
        id: "ComputeGpu",
        defaultMessage: "Compute GPU",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PubIpVmNicBandwidthOut", {
      i18nKey: "PubIpVmNicBandwidthOut",
      name: intl.formatMessage({
        id: "PubIpVmNicBandwidthOut",
        defaultMessage: "Upstream Bandwidth",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PubIpVmNicBandwidthIn", {
      i18nKey: "PubIpVmNicBandwidthIn",
      name: intl.formatMessage({
        id: "PubIpVmNicBandwidthIn",
        defaultMessage: "Downstream Bandwidth",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PubIpVipBandwidthOut", {
      i18nKey: "PubIpVipBandwidthOut",
      name: intl.formatMessage({
        id: "PubIpVipBandwidthOut",
        defaultMessage: "Upstream Bandwidth",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PubIpVipBandwidthIn", {
      i18nKey: "PubIpVipBandwidthIn",
      name: intl.formatMessage({
        id: "PubIpVipBandwidthIn",
        defaultMessage: "Downstream Bandwidth",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Converting", {
      i18nKey: "converting",
      name: intl.formatMessage({ id: "converting", defaultMessage: "Converting" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("Converted", {
      i18nKey: "disconnected",
      name: intl.formatMessage({
        id: "disconnected",
        defaultMessage: "Disconnected",
      }),
      color: { color: "neutral", number: 600 },
      prefix: "dot",
    });
    _map.set("Unprovisioned", {
      i18nKey: "unprovisioned",
      name: intl.formatMessage({
        id: "unprovisioned",
        defaultMessage: "Unprovisioned",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Provisioning", {
      i18nKey: "provisioning",
      name: intl.formatMessage({
        id: "provisioning",
        defaultMessage: "Provisioning",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Provisioned", {
      i18nKey: "provisioned",
      name: intl.formatMessage({ id: "provisioned", defaultMessage: "Deployed" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HWInfoUnknown", {
      i18nKey: "hardware.info.unknown",
      name: intl.formatMessage({
        id: "hardware.info.unknown",
        defaultMessage: "Unknown hardware info",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("PxeBooting", {
      i18nKey: "pxe.booting",
      name: intl.formatMessage({
        id: "pxe.booting",
        defaultMessage: "PXE booting",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("PxeBootFailed", {
      i18nKey: "pxe.boot.failed",
      name: intl.formatMessage({
        id: "pxe.boot.failed",
        defaultMessage: "PXE boot failed",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("Allocated", {
      i18nKey: "allocated",
      name: intl.formatMessage({ id: "allocated", defaultMessage: "Allocated" }),
      color: { color: "pending", number: 500 },
      prefix: "dot",
    });
    _map.set("PowerOn", {
      i18nKey: "power.on",
      name: intl.formatMessage({ id: "power.on", defaultMessage: "Power On" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("PowerOff", {
      i18nKey: "power.off",
      name: intl.formatMessage({ id: "power.off", defaultMessage: "Power Off" }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("WrongBootMode", {
      i18nKey: "WrongBootMode",
      name: intl.formatMessage({
        id: "WrongBootMode",
        defaultMessage: "Wrong BIOS mode.",
      }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("WrongArchitecture", {
      i18nKey: "WrongArchitecture",
      name: intl.formatMessage({
        id: "WrongArchitecture",
        defaultMessage: "Architecture mismatch",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("HardwareInfoUnknown", {
      i18nKey: "hardwareInfo.unknown",
      name: intl.formatMessage({
        id: "hardwareInfo.unknown",
        defaultMessage: "Unknown hardware info",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("IPxeBooting", {
      i18nKey: "IPxeBooting",
      name: intl.formatMessage({
        id: "IPxeBooting",
        defaultMessage: "PXE booting",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("IPxeBootFailed", {
      i18nKey: "IPxeBootFailed",
      name: intl.formatMessage({
        id: "IPxeBootFailed",
        defaultMessage: "PXE boot failed.",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("BareMetalNodeAvailable", {
      i18nKey: "bareMetalNode.constant.available",
      name: intl.formatMessage({
        id: "bareMetalNode.constant.available",
        defaultMessage: "Assignable",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("BareMetalNodeAllocated", {
      i18nKey: "bareMetalNode.constant.allocated",
      name: intl.formatMessage({
        id: "bareMetalNode.constant.allocated",
        defaultMessage: "Allocated",
      }),
      color: { color: "pending", number: 500 },
      prefix: "dot",
    });
    _map.set("Remote", {
      i18nKey: "baremetal2ChassisProvisionType.remote",
      name: intl.formatMessage({
        id: "baremetal2ChassisProvisionType.remote",
        defaultMessage: "Disk",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Local", {
      i18nKey: "baremetal2ChassisProvisionType.local",
      name: intl.formatMessage({
        id: "baremetal2ChassisProvisionType.local",
        defaultMessage: "Local Disk (Non-Takeover)",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Direct", {
      i18nKey: "baremetal2ChassisProvisionType.direct",
      name: intl.formatMessage({
        id: "baremetal2ChassisProvisionType.direct",
        defaultMessage: "Local Disk (Take-Over)",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ImageStoreBackupStorage", {
      i18nKey: "BackupStorage.ImageStore",
      name: intl.formatMessage({
        id: "BackupStorage.ImageStore",
        defaultMessage: "ImageStore",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SftpBackupStorage", {
      i18nKey: "Sftp",
      name: intl.formatMessage({ id: "Sftp", defaultMessage: "Sftp" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Confirmed", {
      i18nKey: "confirm.status.ok",
      name: intl.formatMessage({
        id: "confirm.status.ok",
        defaultMessage: "Confirmed",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("ConfirmPending", {
      i18nKey: "confirm.status.pending",
      name: intl.formatMessage({
        id: "confirm.status.pending",
        defaultMessage: "Unconfirmed",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("Deploying", {
      i18nKey: "aiStore.modelServiceInstanceGroup.deploying",
      name: intl.formatMessage({
        id: "aiStore.modelServiceInstanceGroup.deploying",
        defaultMessage: "Deploying",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("ConfigSettingUp", {
      i18nKey: "aiStore.modelServiceInstanceGroup.configSettingUp",
      name: intl.formatMessage({
        id: "aiStore.modelServiceInstanceGroup.configSettingUp",
        defaultMessage: "Configuring",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("ServiceBootingUp", {
      i18nKey: "aiStore.modelServiceInstanceGroup.serviceBootingUp",
      name: intl.formatMessage({
        id: "aiStore.modelServiceInstanceGroup.serviceBootingUp",
        defaultMessage: "Starting Service",
      }),
      icon: "loader",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("PartialCompleted", {
      i18nKey: "partialCompleted",
      name: intl.formatMessage({
        id: "partialCompleted",
        defaultMessage: "Partially Completed",
      }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("ANTISOFT", {
      i18nKey: "anti.affinityGroup.soft",
      name: intl.formatMessage({
        id: "anti.affinityGroup.soft",
        defaultMessage: "Anti-Affinity Group (Soft)",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ANTIHARD", {
      i18nKey: "anti.affinityGroup.hard",
      name: intl.formatMessage({
        id: "anti.affinityGroup.hard",
        defaultMessage: "Anti-Affinity Group (Hard)",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("REJECT", {
      i18nKey: "access.control.rule.type.reject",
      name: intl.formatMessage({
        id: "access.control.rule.type.reject",
        defaultMessage: "BlockList",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ACCEPT", {
      i18nKey: "access.control.rule.type.accept",
      name: intl.formatMessage({
        id: "access.control.rule.type.accept",
        defaultMessage: "Allowlist",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    return _map;
  }, [intl]);

  const constantGroupMap = useMemo(() => {
    const _map = new Map<string, any>();
    _map.set("ZwatchSNSTextTemplateAlarmType-alarm", {
      i18nKey: "resourceAlert",
      name: intl.formatMessage({
        id: "resourceAlert",
        defaultMessage: "Resource Alarm",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ZwatchSNSTextTemplateAlarmType-combined", {
      i18nKey: "combinedAlarm",
      name: intl.formatMessage({
        id: "combinedAlarm",
        defaultMessage: "Resource Alarm/Event Alarm",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ZwatchSNSTextTemplateAlarmType-event", {
      i18nKey: "eventAlert",
      name: intl.formatMessage({
        id: "eventAlert",
        defaultMessage: "Event Alarm",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("EndpointState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("EndpointState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("EndpointType-Email", {
      i18nKey: "email",
      name: intl.formatMessage({ id: "email", defaultMessage: "Email" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("EndpointType-DingTalk", {
      i18nKey: "dingTalk",
      name: intl.formatMessage({ id: "dingTalk", defaultMessage: "DingTalk" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("EndpointType-SYSTEM_HTTP", {
      i18nKey: "system",
      name: intl.formatMessage({ id: "system", defaultMessage: "System" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("EndpointType-AliyunSms", {
      i18nKey: "sms",
      name: intl.formatMessage({ id: "sms", defaultMessage: "SMS" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("EndpointType-MicrosoftTeams", {
      i18nKey: "microsoftTeams",
      name: intl.formatMessage({
        id: "microsoftTeams",
        defaultMessage: "Microsoft Teams",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("EndpointType-HTTP", {
      i18nKey: "HTTP",
      name: intl.formatMessage({ id: "HTTP", defaultMessage: "HTTP" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("EndPonitType-SNMP", {
      i18nKey: "snmp.trap",
      name: intl.formatMessage({
        id: "snmp.trap",
        defaultMessage: "SNMP Trap Receiver",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("EndpointConnectionStatus-UP", {
      i18nKey: "UP",
      name: intl.formatMessage({ id: "UP", defaultMessage: "UP" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("EndpointConnectionStatus-DOWN", {
      i18nKey: "DOWN",
      name: intl.formatMessage({ id: "DOWN", defaultMessage: "DOWN" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("EmergencyLevel-Emergent", {
      i18nKey: "emergencyLevel.emergent",
      name: intl.formatMessage({
        id: "emergencyLevel.emergent",
        defaultMessage: "Emergent",
      }),
      icon: "alert-triangle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("EmergencyLevel-Important", {
      i18nKey: "emergencyLevel.important",
      name: intl.formatMessage({
        id: "emergencyLevel.important",
        defaultMessage: "Major",
      }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("EmergencyLevel-Normal", {
      i18nKey: "emergencyLevel.normal",
      name: intl.formatMessage({
        id: "emergencyLevel.normal",
        defaultMessage: "Info",
      }),
      icon: "alert-triangle-fill",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("AlarmState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("AlarmState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("AlarmStatus-OK", {
      i18nKey: "monitoring",
      name: intl.formatMessage({ id: "monitoring", defaultMessage: "Monitoring" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("AlarmStatus-Alarm", {
      i18nKey: "triggered",
      name: intl.formatMessage({ id: "triggered", defaultMessage: "Triggered" }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("AlarmStatus-InsufficientData", {
      i18nKey: "insufficientData",
      name: intl.formatMessage({
        id: "insufficientData",
        defaultMessage: "Insufficient",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("ZoneState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("ZoneState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("XmlHookType-Customization", {
      i18nKey: "xmlHookType.customization",
      name: intl.formatMessage({
        id: "xmlHookType.customization",
        defaultMessage: "Custom",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("XmlHookType-System", {
      i18nKey: "xmlHookType.system",
      name: intl.formatMessage({
        id: "xmlHookType.system",
        defaultMessage: "System Template",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HybridType-aliyun", {
      i18nKey: "aliyun",
      name: intl.formatMessage({ id: "aliyun", defaultMessage: "aliyun" }),
      color: { color: "info", number: 500 },
      contentType: "text",
    });
    _map.set("HybridType-privateAliyun", {
      i18nKey: "privateAliyun",
      name: intl.formatMessage({
        id: "privateAliyun",
        defaultMessage: "privateAliyun",
      }),
      color: { color: "positive", number: 500 },
      contentType: "text",
    });
    _map.set("HybridType-daho", {
      i18nKey: "daho",
      name: intl.formatMessage({ id: "daho", defaultMessage: "daho" }),
      color: { color: "danger", number: 500 },
      contentType: "text",
    });
    _map.set("HybridType-AliyunNAS", {
      i18nKey: "AliyunNAS",
      name: intl.formatMessage({
        id: "AliyunNAS",
        defaultMessage: "AliyunNAS",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HybridType-AliyunSms", {
      i18nKey: "AliyunSms",
      name: intl.formatMessage({
        id: "AliyunSms",
        defaultMessage: "AliyunSms",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HybridType-AliyunEBS", {
      i18nKey: "AliyunEBS",
      name: intl.formatMessage({
        id: "AliyunEBS",
        defaultMessage: "AliyunEBS",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VpnConnectionStatus-ike_sa_not_established", {
      i18nKey: "ike_sa_not_established",
      name: intl.formatMessage({
        id: "ike_sa_not_established",
        defaultMessage: "Phase 1 negotiations failed",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("VpnConnectionStatus-ike_sa_established", {
      i18nKey: "ike_sa_established",
      name: intl.formatMessage({
        id: "ike_sa_established",
        defaultMessage: "Phase 1 negotiations succeeded",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("VpnConnectionStatus-ipsec_sa_not_established", {
      i18nKey: "ipsec_sa_not_established",
      name: intl.formatMessage({
        id: "ipsec_sa_not_established",
        defaultMessage: "Phase 2 negotiations failed",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("VpnConnectionStatus-ipsec_sa_established", {
      i18nKey: "ipsec_sa_established",
      name: intl.formatMessage({
        id: "ipsec_sa_established",
        defaultMessage: "Phase 2 negotiations succeeded",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("VpcFirewallState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("VpcFirewallState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VolumeState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("VolumeState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VolumeStatus-Creating", {
      i18nKey: "creating",
      name: intl.formatMessage({ id: "creating", defaultMessage: "Creating" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("VolumeStatus-Migrating", {
      i18nKey: "migrating",
      name: intl.formatMessage({ id: "migrating", defaultMessage: "Migrating" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VolumeStatus-Ready", {
      i18nKey: "ready",
      name: intl.formatMessage({ id: "ready", defaultMessage: "Ready" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("VolumeStatus-NotInstantiated", {
      i18nKey: "notInstantiated",
      name: intl.formatMessage({
        id: "notInstantiated",
        defaultMessage: "Uninstantiated",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("VolumeStatus-Deleted", {
      i18nKey: "deleted",
      name: intl.formatMessage({ id: "deleted", defaultMessage: "Deleted" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("VolumeType-Root", {
      i18nKey: "root",
      name: intl.formatMessage({ id: "root", defaultMessage: "Disk 1" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VolumeType-Data", {
      i18nKey: "data",
      name: intl.formatMessage({ id: "data", defaultMessage: "Data Disk" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VolumeType-Memory", {
      i18nKey: "memory",
      name: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VolumeBackupTaskType-BackupJob", {
      i18nKey: "backupJob",
      name: intl.formatMessage({ id: "backupJob", defaultMessage: "Backup Job" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VolumeBackupTaskType-OtherTasks", {
      i18nKey: "otherTasks",
      name: intl.formatMessage({
        id: "otherTasks",
        defaultMessage: "Other",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ImagePlatform-Linux", {
      i18nKey: "Linux",
      name: intl.formatMessage({ id: "Linux", defaultMessage: "Linux" }),
      icon: "linux",
      color: { color: "neutral", number: 600 },
      prefix: "icon",
    });
    _map.set("ImagePlatform-Windows", {
      i18nKey: "windows",
      name: intl.formatMessage({ id: "windows", defaultMessage: "Windows" }),
      icon: "windows",
      color: { color: "neutral", number: 600 },
      prefix: "icon",
    });
    _map.set("ImagePlatform-WindowsVirtio", {
      i18nKey: "windowsVirtio",
      name: intl.formatMessage({
        id: "windowsVirtio",
        defaultMessage: "WindowsVirtio",
      }),
      icon: "windows",
      color: { color: "neutral", number: 600 },
      prefix: "icon",
    });
    _map.set("ImagePlatform-Other", {
      i18nKey: "Other",
      name: intl.formatMessage({ id: "Other", defaultMessage: "Other" }),
      icon: "file",
      color: { color: "neutral", number: 600 },
      prefix: "icon",
    });
    _map.set("ImagePlatform-Paravirtualization", {
      i18nKey: "paravirtualization",
      name: intl.formatMessage({
        id: "paravirtualization",
        defaultMessage: "Paravirtualization",
      }),
      icon: "paravirtualization",
      color: { color: "neutral", number: 600 },
      prefix: "icon",
    });
    _map.set("VmSchedulingRuleType-AffinityVm", {
      i18nKey: "vmSchedulingRuleType.affinityVm",
      name: intl.formatMessage({
        id: "vmSchedulingRuleType.affinityVm",
        defaultMessage: "VM Affinitive to Each Other",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VmSchedulingRuleType-AntiAffinityVm", {
      i18nKey: "vmSchedulingRuleType.antiAffinityVm",
      name: intl.formatMessage({
        id: "vmSchedulingRuleType.antiAffinityVm",
        defaultMessage: "VM Exclusive from Each Other",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VmSchedulingRuleType-VmAffinityHost", {
      i18nKey: "vmSchedulingRuleType.vmAffinityHost",
      name: intl.formatMessage({
        id: "vmSchedulingRuleType.vmAffinityHost",
        defaultMessage: "VMs Affinitive to Hosts",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VmSchedulingRuleType-VmAntiAffinityHost", {
      i18nKey: "vmSchedulingRuleType.vmAntiAffinityHost",
      name: intl.formatMessage({
        id: "vmSchedulingRuleType.vmAntiAffinityHost",
        defaultMessage: "VMs Exclusive from Hosts",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VmSchedulingExcuteState-Normal", {
      i18nKey: "vmSchedulingExcuteState.normal",
      name: intl.formatMessage({
        id: "vmSchedulingExcuteState.normal",
        defaultMessage: "Normal",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("VmSchedulingExcuteState-Invalid", {
      i18nKey: "vmSchedulingExcuteState.invalid",
      name: intl.formatMessage({
        id: "vmSchedulingExcuteState.invalid",
        defaultMessage: "Inactive",
      }),
      color: { color: "disabled", number: 500 },
      prefix: "dot",
    });
    _map.set("VmSchedulingExcuteState-Conflict", {
      i18nKey: "vmSchedulingExcuteState.conflict",
      name: intl.formatMessage({
        id: "vmSchedulingExcuteState.conflict",
        defaultMessage: "Conflicted",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("VmInstanceState-Created", {
      i18nKey: "created",
      name: intl.formatMessage({ id: "created", defaultMessage: "Created" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Starting", {
      i18nKey: "starting",
      name: intl.formatMessage({ id: "starting", defaultMessage: "Starting" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Running", {
      i18nKey: "running",
      name: intl.formatMessage({ id: "running", defaultMessage: "Running" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Stopping", {
      i18nKey: "stopping",
      name: intl.formatMessage({ id: "stopping", defaultMessage: "Stopping" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Stopped", {
      i18nKey: "stopped",
      name: intl.formatMessage({ id: "stopped", defaultMessage: "Stopped" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Rebooting", {
      i18nKey: "rebooting",
      name: intl.formatMessage({ id: "rebooting", defaultMessage: "Rebooting" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Destroying", {
      i18nKey: "destroying",
      name: intl.formatMessage({ id: "destroying", defaultMessage: "Deleting" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Destroyed", {
      i18nKey: "destroyed",
      name: intl.formatMessage({ id: "destroyed", defaultMessage: "Deleted" }),
      icon: "trash-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Migrating", {
      i18nKey: "migrating",
      name: intl.formatMessage({ id: "migrating", defaultMessage: "Migrating" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Expunging", {
      i18nKey: "expunging",
      name: intl.formatMessage({ id: "expunging", defaultMessage: "Expunging" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Pausing", {
      i18nKey: "pausing",
      name: intl.formatMessage({ id: "pausing", defaultMessage: "Pausing" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Paused", {
      i18nKey: "paused",
      name: intl.formatMessage({ id: "paused", defaultMessage: "Paused" }),
      icon: "pause-circle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Resuming", {
      i18nKey: "resuming",
      name: intl.formatMessage({ id: "resuming", defaultMessage: "Resuming" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-VolumeMigrating", {
      i18nKey: "volumeMigrating",
      name: intl.formatMessage({
        id: "volumeMigrating",
        defaultMessage: "Disk migrating",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Error", {
      i18nKey: "error",
      name: intl.formatMessage({ id: "error", defaultMessage: "Error" }),
      icon: "question-mark-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Unknown", {
      i18nKey: "unknown",
      name: intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" }),
      icon: "question-mark-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-NoState", {
      i18nKey: "noState",
      name: intl.formatMessage({ id: "noState", defaultMessage: "Fail to Obtain" }),
      icon: "question-mark-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-Crashed", {
      i18nKey: "crashed",
      name: intl.formatMessage({ id: "crashed", defaultMessage: "Crashed" }),
      icon: "alert-triangle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VmInstanceState-VolumeRecovering", {
      i18nKey: "cdpVolumeRecovering",
      name: intl.formatMessage({
        id: "cdpVolumeRecovering",
        defaultMessage: "Restoring Data",
      }),
      icon: "hourglass",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("GuestToolsState-Uninstall", {
      i18nKey: "uninstall",
      name: intl.formatMessage({ id: "uninstall", defaultMessage: "Not installed" }),
      icon: "wrench-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("GuestToolsState-IsRunning", {
      i18nKey: "vmRunning",
      name: intl.formatMessage({ id: "vmRunning", defaultMessage: "Running" }),
      icon: "wrench-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("GuestToolsState-Unsupport", {
      i18nKey: "unsupport",
      name: intl.formatMessage({ id: "unsupport", defaultMessage: "Not supported" }),
      icon: "wrench-circle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("GuestToolsState-Stopped", {
      i18nKey: "stopped",
      name: intl.formatMessage({ id: "stopped", defaultMessage: "Stopped" }),
      icon: "wrench-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("GuestToolsState-Installed", {
      i18nKey: "installed",
      name: intl.formatMessage({ id: "installed", defaultMessage: "Installed" }),
      icon: "wrench-circle-fill",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VmCdpTaskStatus-Starting", {
      i18nKey: "starting",
      name: intl.formatMessage({ id: "starting", defaultMessage: "Starting" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VmCdpTaskStatus-Created", {
      i18nKey: "interrupt",
      name: intl.formatMessage({ id: "interrupt", defaultMessage: "Interrupted" }),
      icon: "shutter-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VmCdpTaskStatus-Running", {
      i18nKey: "underProtection",
      name: intl.formatMessage({
        id: "underProtection",
        defaultMessage: "Protected",
      }),
      icon: "shutter-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("VmCdpTaskStatus-Stopped", {
      i18nKey: "interrupt",
      name: intl.formatMessage({ id: "interrupt", defaultMessage: "Interrupted" }),
      icon: "shutter-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VmCdpTaskStatus-Unknown", {
      i18nKey: "interrupt",
      name: intl.formatMessage({ id: "interrupt", defaultMessage: "Interrupted" }),
      icon: "shutter-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VmCdpTaskStatus-Failed", {
      i18nKey: "interrupt",
      name: intl.formatMessage({ id: "interrupt", defaultMessage: "Interrupted" }),
      icon: "shutter-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VmCdpTaskStatus-DataMerging", {
      i18nKey: "underProtection",
      name: intl.formatMessage({
        id: "underProtection",
        defaultMessage: "Protected",
      }),
      icon: "shutter-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("VmCdpTaskStatus-null", {
      i18nKey: "unprotected",
      name: intl.formatMessage({ id: "unprotected", defaultMessage: "Unprotected" }),
      icon: "shutter-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("VmBackupTaskType-BackupTask", {
      i18nKey: "backupJob",
      name: intl.formatMessage({ id: "backupJob", defaultMessage: "Backup Job" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VmBackupTaskType-CdpTask", {
      i18nKey: "cdpTask",
      name: intl.formatMessage({ id: "cdpTask", defaultMessage: "CDP Task" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VmSchedulingState-Normal", {
      i18nKey: "vmSchedulingState.noraml",
      name: intl.formatMessage({
        id: "vmSchedulingState.noraml",
        defaultMessage: "Normal",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("VmSchedulingState-Invalid", {
      i18nKey: "vmSchedulingState.invalid",
      name: intl.formatMessage({
        id: "vmSchedulingState.invalid",
        defaultMessage: "Inactive",
      }),
      color: { color: "disabled", number: 500 },
      prefix: "dot",
    });
    _map.set("VmSchedulingState-Conflict", {
      i18nKey: "vmSchedulingState.conflict",
      name: intl.formatMessage({
        id: "vmSchedulingState.conflict",
        defaultMessage: "Conflicted",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("VmQemuState-Matched", {
      i18nKey: "vmQemuState.matched",
      name: intl.formatMessage({
        id: "vmQemuState.matched",
        defaultMessage: "Normal",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("VmQemuState-Unmatched", {
      i18nKey: "vmQemuState.unmatched",
      name: intl.formatMessage({
        id: "vmQemuState.unmatched",
        defaultMessage: "Need Update",
      }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("VmQemuState-Unknown", {
      i18nKey: "vmQemuState.unknown",
      name: intl.formatMessage({
        id: "vmQemuState.unknown",
        defaultMessage: "Not Obtained",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("VirtualidState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("VirtualidState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VirtualidState-Staled", {
      i18nKey: "deleted",
      name: intl.formatMessage({ id: "deleted", defaultMessage: "Deleted" }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VirtualRouterOfferingState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VirtualRouterOfferingState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("ImageMediaType-RootVolumeTemplate", {
      i18nKey: "system.image",
      name: intl.formatMessage({
        id: "system.image",
        defaultMessage: "System Image",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ImageMediaType-DataVolumeTemplate", {
      i18nKey: "volume.image",
      name: intl.formatMessage({
        id: "volume.image",
        defaultMessage: "Disk Image",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ImageMediaType-ISO", {
      i18nKey: "iso",
      name: intl.formatMessage({ id: "iso", defaultMessage: "ISO" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ImageFormat-qcow2", {
      i18nKey: "qcow2",
      name: intl.formatMessage({ id: "qcow2", defaultMessage: "qcow2" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ImageFormat-iso", {
      i18nKey: "ios",
      name: intl.formatMessage({ id: "ios", defaultMessage: "iso" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ImageFormat-raw", {
      i18nKey: "raw",
      name: intl.formatMessage({ id: "raw", defaultMessage: "raw" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ImageFormat-vmtx", {
      i18nKey: "vmtx",
      name: intl.formatMessage({ id: "vmtx", defaultMessage: "vmtx" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ImageState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("ImageState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("ImageStatus-Creating", {
      i18nKey: "creating",
      name: intl.formatMessage({ id: "creating", defaultMessage: "Creating" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("ImageStatus-Downloading", {
      i18nKey: "downloading",
      name: intl.formatMessage({ id: "downloading", defaultMessage: "Downloading" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("ImageStatus-Ready", {
      i18nKey: "ready",
      name: intl.formatMessage({ id: "ready", defaultMessage: "Ready" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("ImageStatus-Error", {
      i18nKey: "error",
      name: intl.formatMessage({ id: "error", defaultMessage: "Error" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("ImageStatus-Deleted", {
      i18nKey: "deleted",
      name: intl.formatMessage({ id: "deleted", defaultMessage: "Deleted" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("ImageStatus-Migrating", {
      i18nKey: "migrating",
      name: intl.formatMessage({ id: "migrating", defaultMessage: "Migrating" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("VipNetworkState-Enabled", {
      i18nKey: "constant.Enabled",
      name: intl.formatMessage({
        id: "constant.Enabled",
        defaultMessage: "Enabled",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VipNetworkState-Running", {
      i18nKey: "constant.Running",
      name: intl.formatMessage({
        id: "constant.Running",
        defaultMessage: "Preparing",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VipNetworkState-Disabled", {
      i18nKey: "Disabled",
      name: intl.formatMessage({ id: "Disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VipNetworkIpVersion-IPv4", {
      i18nKey: "IPv4",
      name: intl.formatMessage({ id: "IPv4", defaultMessage: "IPv4" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VipNetworkIpVersion-IPv6", {
      i18nKey: "IPv6",
      name: intl.formatMessage({ id: "IPv6", defaultMessage: "IPv6" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("L3NetworkType-public", {
      i18nKey: "public",
      name: intl.formatMessage({ id: "public", defaultMessage: "Public Network" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("L3NetworkType-vpc", {
      i18nKey: "vpc",
      name: intl.formatMessage({ id: "vpc", defaultMessage: "VPC" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("L3NetworkType-flat", {
      i18nKey: "flat",
      name: intl.formatMessage({ id: "flat", defaultMessage: "Flat Network" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BindServiceType-HadBind", {
      i18nKey: "had.bind.service",
      name: intl.formatMessage({
        id: "had.bind.service",
        defaultMessage: "Associated",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BindServiceType-NotBind", {
      i18nKey: "not.bind.service",
      name: intl.formatMessage({
        id: "not.bind.service",
        defaultMessage: "Not associated",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("LimitState-limit", {
      i18nKey: "shared.qos.vip.limit",
      name: intl.formatMessage({
        id: "shared.qos.vip.limit",
        defaultMessage: "Normal",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("LimitState-unlimit", {
      i18nKey: "shared.qos.vip.unlimit",
      name: intl.formatMessage({
        id: "shared.qos.vip.unlimit",
        defaultMessage: "No Limit",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("PciDeviceSpecState-Enabled", {
      i18nKey: "constant.Enabled",
      name: intl.formatMessage({
        id: "constant.Enabled",
        defaultMessage: "Enabled",
      }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("PciDeviceSpecState-Disabled", {
      i18nKey: "constant.Disabled",
      name: intl.formatMessage({
        id: "constant.Disabled",
        defaultMessage: "Disabled",
      }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("PciDeviceState-Enabled", {
      i18nKey: "constant.Enabled",
      name: intl.formatMessage({
        id: "constant.Enabled",
        defaultMessage: "Enabled",
      }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("PciDeviceState-Disabled", {
      i18nKey: "constant.Disabled",
      name: intl.formatMessage({
        id: "constant.Disabled",
        defaultMessage: "Disabled",
      }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("PciDeviceStatus-Active", {
      i18nKey: "constant.Active",
      name: intl.formatMessage({
        id: "constant.Active",
        defaultMessage: "Unattached",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("PciDeviceStatus-Attached", {
      i18nKey: "constant.Attached",
      name: intl.formatMessage({
        id: "constant.Attached",
        defaultMessage: "Attached",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("PciDeviceStatus-System", {
      i18nKey: "constant.System",
      name: intl.formatMessage({
        id: "constant.System",
        defaultMessage: "System",
      }),
      color: { color: "pending", number: 500 },
      prefix: "dot",
    });
    _map.set("ClusterState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("ClusterState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VCenterState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("VCenterState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("VCenterStatus-Connecting", {
      i18nKey: "connecting",
      name: intl.formatMessage({ id: "connecting", defaultMessage: "Connecting" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("VCenterStatus-Connected", {
      i18nKey: "connected",
      name: intl.formatMessage({ id: "connected", defaultMessage: "Connected" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("VCenterStatus-Disconnected", {
      i18nKey: "disconnected",
      name: intl.formatMessage({
        id: "disconnected",
        defaultMessage: "Disconnected",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("VCenterStatus-Synchronizing", {
      i18nKey: "synchronizing",
      name: intl.formatMessage({
        id: "synchronizing",
        defaultMessage: "Synchronizing",
      }),
      color: { color: "pending", number: 600 },
      prefix: "dot",
    });
    _map.set("LongJobState-Waiting", {
      i18nKey: "waiting",
      name: intl.formatMessage({ id: "waiting", defaultMessage: "Preparing" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("LongJobState-Suspended", {
      i18nKey: "suspended",
      name: intl.formatMessage({ id: "suspended", defaultMessage: "Suspended" }),
      icon: "pause-circle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("LongJobState-Running", {
      i18nKey: "running",
      name: intl.formatMessage({ id: "running", defaultMessage: "Running" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("LongJobState-Succeeded", {
      i18nKey: "succeeded",
      name: intl.formatMessage({ id: "succeeded", defaultMessage: "Succeeded" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("LongJobState-Canceling", {
      i18nKey: "canceling",
      name: intl.formatMessage({ id: "canceling", defaultMessage: "Canceling" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("LongJobState-Canceled", {
      i18nKey: "canceled",
      name: intl.formatMessage({ id: "canceled", defaultMessage: "Canceled" }),
      icon: "close-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("LongJobState-Failed", {
      i18nKey: "failed",
      name: intl.formatMessage({ id: "failed", defaultMessage: "Failed" }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("V2VConversionHostState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("V2VConversionHostState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("UKeyStatus-Ready", {
      i18nKey: "usbKey.ready",
      name: intl.formatMessage({ id: "usbKey.ready", defaultMessage: "Ready" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("UKeyStatus-Fault", {
      i18nKey: "usbKey.fault",
      name: intl.formatMessage({ id: "usbKey.fault", defaultMessage: "Fault" }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("UKeyStatus-Missing", {
      i18nKey: "usbKey.missing",
      name: intl.formatMessage({
        id: "usbKey.missing",
        defaultMessage: "Missing",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("UKeyStatus-Abnormal", {
      i18nKey: "usbKey.abnormal",
      name: intl.formatMessage({
        id: "usbKey.abnormal",
        defaultMessage: "Abnormal",
      }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("TicketShowStatus-TicketPending", {
      i18nKey: "ticket.status.pending",
      name: intl.formatMessage({
        id: "ticket.status.pending",
        defaultMessage: "Ongoing",
      }),
      color: { color: "info", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketShowStatus-TicketCancelled", {
      i18nKey: "cancelled",
      name: intl.formatMessage({ id: "cancelled", defaultMessage: "Recalled" }),
      color: { color: "neutral", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketShowStatus-TicketIntermediateApproved", {
      i18nKey: "Intermediate.approved",
      name: intl.formatMessage({
        id: "Intermediate.approved",
        defaultMessage: "Ongoing",
      }),
      color: { color: "info", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketShowStatus-TicketFinalApproved", {
      i18nKey: "final.approved",
      name: intl.formatMessage({
        id: "final.approved",
        defaultMessage: "Approved",
      }),
      color: { color: "positive", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketShowStatus-TicketRejected", {
      i18nKey: "rejected",
      name: intl.formatMessage({ id: "rejected", defaultMessage: "Reject" }),
      color: { color: "danger", number: 500 },
      contentType: "tag",
    });
    _map.set("SnapshotType-Single", {
      i18nKey: "singleVolume",
      name: intl.formatMessage({ id: "singleVolume", defaultMessage: "Single Snapshot" }),
      icon: "camera-fill",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("SnapshotType-Group", {
      i18nKey: "snapshotGroup",
      name: intl.formatMessage({
        id: "snapshotGroup",
        defaultMessage: "Snapshot Group",
      }),
      icon: "cameras-fill",
      color: { color: "pending", number: 500 },
      prefix: "icon",
    });
    _map.set("RevertState-Available", {
      i18nKey: "recoverable",
      name: intl.formatMessage({ id: "recoverable", defaultMessage: "Recoverable" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("RevertState-Unable", {
      i18nKey: "unrecoverable",
      name: intl.formatMessage({
        id: "unrecoverable",
        defaultMessage: "Single snapshot restorable",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("MemorySnapshot-Yes", {
      i18nKey: "memorySnapshot.yes",
      name: intl.formatMessage({
        id: "memorySnapshot.yes",
        defaultMessage: "Yes",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("MemorySnapshot-No", {
      i18nKey: "memorySnapshot.no",
      name: intl.formatMessage({
        id: "memorySnapshot.no",
        defaultMessage: "No",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PathHealthState-running", {
      i18nKey: "constant.running",
      name: intl.formatMessage({
        id: "constant.running",
        defaultMessage: "Running",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("PathHealthState-failed", {
      i18nKey: "constant.failed",
      name: intl.formatMessage({
        id: "constant.failed",
        defaultMessage: "Failed",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("PathStatus-active", {
      i18nKey: "constant.active",
      name: intl.formatMessage({
        id: "constant.active",
        defaultMessage: "Active",
      }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("PathStatus-enabled", {
      i18nKey: "constant.enabled",
      name: intl.formatMessage({
        id: "constant.enabled",
        defaultMessage: "Enabled",
      }),
      icon: "pause-circle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("LunSource-fiberChannel", {
      i18nKey: "fc.storage",
      name: intl.formatMessage({ id: "fc.storage", defaultMessage: "FC Storage" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("LunSource-iSCSI", {
      i18nKey: "iscsi.server.storage",
      name: intl.formatMessage({
        id: "iscsi.server.storage",
        defaultMessage: "iSCSI Storage",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("LunSource-NVMe", {
      i18nKey: "nvme.storage",
      name: intl.formatMessage({
        id: "nvme.storage",
        defaultMessage: "NVMe Storage",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("state-Enabled", {
      i18nKey: "Enabled",
      name: intl.formatMessage({ id: "Enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("state-Disabled", {
      i18nKey: "Disabled",
      name: intl.formatMessage({ id: "Disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("state-Exception", {
      i18nKey: "Exception",
      name: intl.formatMessage({ id: "Exception", defaultMessage: "Abnormal" }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("asyncState-Synced", {
      i18nKey: "Synced",
      name: intl.formatMessage({ id: "Synced", defaultMessage: "Synced" }),
      icon: "loader",
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("asyncState-Unsynced", {
      i18nKey: "Unsynced",
      name: intl.formatMessage({ id: "Unsynced", defaultMessage: "Not synced" }),
      icon: "loader",
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("SecurityGroupRuleType-Ingress", {
      i18nKey: "constant.Ingress",
      name: intl.formatMessage({
        id: "constant.Ingress",
        defaultMessage: "Ingress",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SecurityGroupRuleType-Egress", {
      i18nKey: "constant.Egress",
      name: intl.formatMessage({
        id: "constant.Egress",
        defaultMessage: "Egress",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SecurityGroupRuleState-Enabled", {
      i18nKey: "constant.Enabled",
      name: intl.formatMessage({
        id: "constant.Enabled",
        defaultMessage: "Enabled",
      }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("SecurityGroupRuleState-Disabled", {
      i18nKey: "constant.Disabled",
      name: intl.formatMessage({
        id: "constant.Disabled",
        defaultMessage: "Disabled",
      }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("SecurityGroupRuleProtocolType-TCP", {
      i18nKey: "constant.TCP",
      name: intl.formatMessage({ id: "constant.TCP", defaultMessage: "TCP" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SecurityGroupRuleProtocolType-UDP", {
      i18nKey: "constant.UDP",
      name: intl.formatMessage({ id: "constant.UDP", defaultMessage: "UDP" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SecurityGroupRuleProtocolType-ICMP", {
      i18nKey: "constant.ICMP",
      name: intl.formatMessage({ id: "constant.ICMP", defaultMessage: "ICMP" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SecurityGroupRuleProtocolType-ALL", {
      i18nKey: "constant.ALL",
      name: intl.formatMessage({ id: "constant.ALL", defaultMessage: "ALL" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SecurityGroupState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("SecurityGroupState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("SecretServerStatus-Connected", {
      i18nKey: "constant.healthy",
      name: intl.formatMessage({
        id: "constant.healthy",
        defaultMessage: "Healthy",
      }),
      icon: "loader",
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("SecretServerStatus-Disconnected", {
      i18nKey: "exception",
      name: intl.formatMessage({ id: "exception", defaultMessage: "Abnormal" }),
      icon: "loader",
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("SecretResourcePoolState-Activated", {
      i18nKey: "Activated",
      name: intl.formatMessage({ id: "Activated", defaultMessage: "Activated" }),
      icon: "loader",
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("SecretResourcePoolState-Unactivated", {
      i18nKey: "Unactivated",
      name: intl.formatMessage({ id: "Unactivated", defaultMessage: "Inactivated" }),
      icon: "loader",
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("ScriptType-Shell", {
      i18nKey: "ScriptType.Shell",
      name: intl.formatMessage({
        id: "ScriptType.Shell",
        defaultMessage: "Shell",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ScriptType-Python", {
      i18nKey: "ScriptType.Python",
      name: intl.formatMessage({
        id: "ScriptType.Python",
        defaultMessage: "Python",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ScriptType-Perl", {
      i18nKey: "ScriptType.Perl",
      name: intl.formatMessage({
        id: "ScriptType.Perl",
        defaultMessage: "Perl",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ScriptType-Bat", {
      i18nKey: "ScriptType.Bat",
      name: intl.formatMessage({ id: "ScriptType.Bat", defaultMessage: "Bat" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ScriptType-Powershell", {
      i18nKey: "ScriptType.Powershell",
      name: intl.formatMessage({
        id: "ScriptType.Powershell",
        defaultMessage: "Powershell",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ScriptExecuteRecordDetailStatus-Uploading", {
      i18nKey: "scriptExecuteRecordDetailStatus.uploading",
      name: intl.formatMessage({
        id: "scriptExecuteRecordDetailStatus.uploading",
        defaultMessage: "Uploading",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("ScriptExecuteRecordDetailStatus-Running", {
      i18nKey: "scriptExecuteRecordDetailStatus.running",
      name: intl.formatMessage({
        id: "scriptExecuteRecordDetailStatus.running",
        defaultMessage: "Executing",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("ScriptExecuteRecordDetailStatus-Completed", {
      i18nKey: "scriptExecuteRecordDetailStatus.completed",
      name: intl.formatMessage({
        id: "scriptExecuteRecordDetailStatus.completed",
        defaultMessage: "Completed",
      }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("ScriptExecuteRecordDetailStatus-Failed", {
      i18nKey: "scriptExecuteRecordDetailStatus.failed",
      name: intl.formatMessage({
        id: "scriptExecuteRecordDetailStatus.failed",
        defaultMessage: "Failed",
      }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("ScriptExecuteRecordStatus-Running", {
      i18nKey: "scriptExecuteRecordStatus.running",
      name: intl.formatMessage({
        id: "scriptExecuteRecordStatus.running",
        defaultMessage: "Executing",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("ScriptExecuteRecordStatus-Succeed", {
      i18nKey: "scriptExecuteRecordStatus.succeed",
      name: intl.formatMessage({
        id: "scriptExecuteRecordStatus.succeed",
        defaultMessage: "Succeeded",
      }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("ScriptExecuteRecordStatus-Exception", {
      i18nKey: "scriptExecuteRecordStatus.exception",
      name: intl.formatMessage({
        id: "scriptExecuteRecordStatus.exception",
        defaultMessage: "Abnormal",
      }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("ScriptExecuteRecordStatus-Failed", {
      i18nKey: "scriptExecuteRecordStatus.failed",
      name: intl.formatMessage({
        id: "scriptExecuteRecordStatus.failed",
        defaultMessage: "Failed",
      }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("SchedulerTriggerState-Running", {
      i18nKey: "running",
      name: intl.formatMessage({ id: "running", defaultMessage: "Running" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SchedulerTriggerState-Completed", {
      i18nKey: "completed",
      name: intl.formatMessage({ id: "completed", defaultMessage: "Completed" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SchedulerJobGroupType-rootVolumeBackup", {
      i18nKey: "vm",
      name: intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SchedulerJobGroupType-vmBackup", {
      i18nKey: "vm",
      name: intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SchedulerJobGroupType-volumeBackup", {
      i18nKey: "volume",
      name: intl.formatMessage({ id: "volume", defaultMessage: "Disk" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SchedulerJobGroupStatus-BackingUp", {
      i18nKey: "backupInProgress",
      name: intl.formatMessage({
        id: "backupInProgress",
        defaultMessage: "Backing up",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("SchedulerJobState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SchedulerJobState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SchedulerJobType-StartVmInstanceJob", {
      i18nKey: "start.vm",
      name: intl.formatMessage({
        id: "start.vm",
        defaultMessage: "Power On VM",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SchedulerJobType-StopVmInstanceJob", {
      i18nKey: "stop.vm",
      name: intl.formatMessage({ id: "stop.vm", defaultMessage: "Shut Down VM" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SchedulerJobType-RebootVmInstanceJob", {
      i18nKey: "rebootVm",
      name: intl.formatMessage({
        id: "rebootVm",
        defaultMessage: "Reboot VM Instance",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SchedulerJobType-CreateVolumeSnapshotJob", {
      i18nKey: "create.volumeSnapshot",
      name: intl.formatMessage({
        id: "create.volumeSnapshot",
        defaultMessage: "Create Disk Snapshot",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SchedulerJobType-CreateVmSnapshot", {
      i18nKey: "create.vmSnapshot",
      name: intl.formatMessage({
        id: "create.vmSnapshot",
        defaultMessage: "Create VM Snapshot",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SchedTypes-VMHA", {
      i18nKey: "schedTypes.vmha",
      name: intl.formatMessage({
        id: "schedTypes.vmha",
        defaultMessage: "Recover Virtual Machine",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("SchedTypes-HMT", {
      i18nKey: "schedTypes.hmt",
      name: intl.formatMessage({
        id: "schedTypes.hmt",
        defaultMessage: "Host Maintenance",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VRouterRouteEntryType-UserStatic", {
      i18nKey: "static.routing",
      name: intl.formatMessage({
        id: "static.routing",
        defaultMessage: "Static Routing",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VRouterRouteEntryType-UserBlackHole", {
      i18nKey: "black.hole.routing",
      name: intl.formatMessage({
        id: "black.hole.routing",
        defaultMessage: "Black Hole Routing",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("RoleState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("RoleState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("ResourceStackStatus-Initial", {
      i18nKey: "constant.Initial",
      name: intl.formatMessage({
        id: "constant.Initial",
        defaultMessage: "Initializing",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("ResourceStackStatus-Created", {
      i18nKey: "constant.Created",
      name: intl.formatMessage({
        id: "constant.Created",
        defaultMessage: "Created",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("ResourceStackStatus-Failed", {
      i18nKey: "constant.Failed",
      name: intl.formatMessage({
        id: "constant.Failed",
        defaultMessage: "Failed",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("ResourceStackStatus-Creating", {
      i18nKey: "constant.Creating",
      name: intl.formatMessage({
        id: "constant.Creating",
        defaultMessage: "Creating",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("ResourceStackStatus-Deleting", {
      i18nKey: "constant.Deleting",
      name: intl.formatMessage({
        id: "constant.Deleting",
        defaultMessage: "Deleting",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("ResourceStackStatus-Deleted", {
      i18nKey: "constant.Deleted",
      name: intl.formatMessage({
        id: "constant.Deleted",
        defaultMessage: "Deleted",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("ResourceStackStatus-Rollbacking", {
      i18nKey: "constant.Rollbacking",
      name: intl.formatMessage({
        id: "constant.Rollbacking",
        defaultMessage: "Rollbacking",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("ResourceStackStatus-Rollbacked", {
      i18nKey: "constant.Rollbacked",
      name: intl.formatMessage({
        id: "constant.Rollbacked",
        defaultMessage: "Rollback succeeded",
      }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("StackEventStatus-Start", {
      i18nKey: "constant.Start",
      name: intl.formatMessage({
        id: "constant.Start",
        defaultMessage: "Start",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("StackEventStatus-Finish", {
      i18nKey: "constant.Finish",
      name: intl.formatMessage({
        id: "constant.Finish",
        defaultMessage: "Finished",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("StackEventStatus-Failed", {
      i18nKey: "constant.Failed",
      name: intl.formatMessage({
        id: "constant.Failed",
        defaultMessage: "Failed",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("StackEventStatus-RollbackStart", {
      i18nKey: "constant.RollbackStart",
      name: intl.formatMessage({
        id: "constant.RollbackStart",
        defaultMessage: "Starting rollback",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("StackEventStatus-RollbackFinish", {
      i18nKey: "constant.RollbackFinish",
      name: intl.formatMessage({
        id: "constant.RollbackFinish",
        defaultMessage: "Rollback finished",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("StackEventStatus-RollbackFailed", {
      i18nKey: "constant.RollbackFailed",
      name: intl.formatMessage({
        id: "constant.RollbackFailed",
        defaultMessage: "Rollback failed",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("PacketsForwardType-outDirection", {
      i18nKey: "outDirection",
      name: intl.formatMessage({
        id: "outDirection",
        defaultMessage: "Egress",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PacketsForwardType-inDirection", {
      i18nKey: "inDirection",
      name: intl.formatMessage({ id: "inDirection", defaultMessage: "Ingress" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("RecoveryTaskState-Waiting", {
      i18nKey: "Waiting",
      name: intl.formatMessage({ id: "Waiting", defaultMessage: "Waiting" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("RecoveryTaskState-Suspended", {
      i18nKey: "Suspended",
      name: intl.formatMessage({ id: "Suspended", defaultMessage: "Suspended" }),
      icon: "pause-circle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("RecoveryTaskState-Running", {
      i18nKey: "Recovering",
      name: intl.formatMessage({ id: "Recovering", defaultMessage: "Recovering" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("RecoveryTaskState-Succeeded", {
      i18nKey: "Succeeded",
      name: intl.formatMessage({ id: "Succeeded", defaultMessage: "Succeeded" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("RecoveryTaskState-Canceling", {
      i18nKey: "Canceling",
      name: intl.formatMessage({ id: "Canceling", defaultMessage: "Canceling" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("RecoveryTaskState-Canceled", {
      i18nKey: "Canceled",
      name: intl.formatMessage({ id: "Canceled", defaultMessage: "Canceled" }),
      icon: "close-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("RecoveryTaskState-Failed", {
      i18nKey: "Failed",
      name: intl.formatMessage({ id: "Failed", defaultMessage: "Failed" }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("RaidLevelState-Normal", {
      i18nKey: "normal",
      name: intl.formatMessage({ id: "normal", defaultMessage: "Normal" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("RaidLevelState-Degraged", {
      i18nKey: "degraded",
      name: intl.formatMessage({ id: "degraded", defaultMessage: "Degrade" }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("RaidLevelState-Rebuild", {
      i18nKey: "rebuild",
      name: intl.formatMessage({ id: "rebuild", defaultMessage: "Rebuild" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("RaidLevelState-Abnormal", {
      i18nKey: "unknown",
      name: intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("RaidLevelState-Unknown", {
      i18nKey: "unknown",
      name: intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("ProcessManagementState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("ProcessManagementState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("ProcessManagementStatus-Valid", {
      i18nKey: "valid",
      name: intl.formatMessage({ id: "valid", defaultMessage: "Valid" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("ProcessManagementStatus-Invalid", {
      i18nKey: "invalid",
      name: intl.formatMessage({ id: "invalid", defaultMessage: "Invalid" }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("PrimaryStorageState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("PrimaryStorageState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("PrimaryStorageState-Maintenance", {
      i18nKey: "maintenance",
      name: intl.formatMessage({
        id: "maintenance",
        defaultMessage: "Maintenance Mode",
      }),
      icon: "wrench-circle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("PrimaryStorageState-Deleting", {
      i18nKey: "deleting",
      name: intl.formatMessage({ id: "deleting", defaultMessage: "Deleting" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("PrimaryStorageStatus-Connecting", {
      i18nKey: "connecting",
      name: intl.formatMessage({ id: "connecting", defaultMessage: "Connecting" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("PrimaryStorageStatus-Connected", {
      i18nKey: "connected",
      name: intl.formatMessage({ id: "connected", defaultMessage: "Connected" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("PrimaryStorageStatus-Disconnected", {
      i18nKey: "disconnected",
      name: intl.formatMessage({
        id: "disconnected",
        defaultMessage: "Disconnected",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("PrimaryStorageType-LocalStorage", {
      i18nKey: "PrimaryStorage.LocalStorage",
      name: intl.formatMessage({
        id: "PrimaryStorage.LocalStorage",
        defaultMessage: "LocalStorage",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PrimaryStorageType-VCenter", {
      i18nKey: "PrimaryStorage.vCenter",
      name: intl.formatMessage({
        id: "PrimaryStorage.vCenter",
        defaultMessage: "vCenter",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PrimaryStorageType-NFS", {
      i18nKey: "PrimaryStorage.NFS",
      name: intl.formatMessage({
        id: "PrimaryStorage.NFS",
        defaultMessage: "NFS",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PrimaryStorageType-Ceph", {
      i18nKey: "PrimaryStorage.Ceph",
      name: intl.formatMessage({
        id: "PrimaryStorage.Ceph",
        defaultMessage: "Ceph",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PrimaryStorageType-SharedMountPoint", {
      i18nKey: "PrimaryStorage.SharedMountPoint",
      name: intl.formatMessage({
        id: "PrimaryStorage.SharedMountPoint",
        defaultMessage: "SharedMountPoint",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PrimaryStorageType-SharedBlock", {
      i18nKey: "PrimaryStorage.SharedBlock",
      name: intl.formatMessage({
        id: "PrimaryStorage.SharedBlock",
        defaultMessage: "SharedBlock",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PrimaryStorageType-MiniStorage", {
      i18nKey: "PrimaryStorage.MiniStorage",
      name: intl.formatMessage({
        id: "PrimaryStorage.MiniStorage",
        defaultMessage: "Mini Storage",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PrimaryStorageType-AliyunEBS", {
      i18nKey: "PrimaryStorage.AliyunEBS",
      name: intl.formatMessage({
        id: "PrimaryStorage.AliyunEBS",
        defaultMessage: "AliyunEBS",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PrimaryStorageType-AliyunNAS", {
      i18nKey: "PrimaryStorage.AliyunNAS",
      name: intl.formatMessage({
        id: "PrimaryStorage.AliyunNAS",
        defaultMessage: "AliyunNAS",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PrimaryStorageType-BlockStorage", {
      i18nKey: "PrimaryStorage.BlockStorage",
      name: intl.formatMessage({
        id: "PrimaryStorage.BlockStorage",
        defaultMessage: "Block",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PreconfigurationTemplateState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("PreconfigurationTemplateState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("PortMirrorSessionStatus-Created", {
      i18nKey: "created",
      name: intl.formatMessage({ id: "created", defaultMessage: "Created" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("PortMirrorSessionStatus-Active", {
      i18nKey: "available",
      name: intl.formatMessage({ id: "available", defaultMessage: "Available " }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("PortMirrorSessionStatus-Inactive", {
      i18nKey: "unavailable",
      name: intl.formatMessage({ id: "unavailable", defaultMessage: "Unavailable" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("PortMirrorSessionType-Ingress", {
      i18nKey: "ingress",
      name: intl.formatMessage({ id: "ingress", defaultMessage: "Ingress" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PortMirrorSessionType-Egress", {
      i18nKey: "egress",
      name: intl.formatMessage({ id: "egress", defaultMessage: "Egress" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PortMirrorSessionType-Bidirection", {
      i18nKey: "bidirection",
      name: intl.formatMessage({ id: "bidirection", defaultMessage: "Bidirection" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PortMirrorState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("PortMirrorState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("PortForwardingProtocolType-TCP", {
      i18nKey: "tcp",
      name: intl.formatMessage({ id: "tcp", defaultMessage: "TCP" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PortForwardingProtocolType-UDP", {
      i18nKey: "udp",
      name: intl.formatMessage({ id: "udp", defaultMessage: "UDP" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PortForwardingState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("PortForwardingState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("PhysicalNicPciDeviceVirtStatus-UNVIRTUALIZABLE", {
      i18nKey: "UNVIRTUALIZABLE",
      name: intl.formatMessage({
        id: "UNVIRTUALIZABLE",
        defaultMessage: "Unvirtualizable",
      }),
      icon: "loader",
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("PhysicalNicPciDeviceVirtStatus-SRIOVVIRTUALIZABLE", {
      i18nKey: "SRIOV_VIRTUALIZABLE",
      name: intl.formatMessage({
        id: "SRIOV_VIRTUALIZABLE",
        defaultMessage: "Virtualizable",
      }),
      icon: "loader",
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("PhysicalNicPciDeviceVirtStatus-SRIOVVIRTUALIZED", {
      i18nKey: "SRIOV_VIRTUALIZED",
      name: intl.formatMessage({
        id: "SRIOV_VIRTUALIZED",
        defaultMessage: "Virtualized",
      }),
      icon: "loader",
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("PhysicalNicPciDeviceVirtStatus-UNKNOWN", {
      i18nKey: "UNKNOWN",
      name: intl.formatMessage({ id: "UNKNOWN", defaultMessage: "Unknown" }),
      icon: "loader",
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("VmInstancePlugInStateType-Stopped", {
      i18nKey: "Stopped",
      name: intl.formatMessage({ id: "Stopped", defaultMessage: "Stopped" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VmInstancePlugInStateType-IsRunning", {
      i18nKey: "IsRunning",
      name: intl.formatMessage({ id: "IsRunning", defaultMessage: "Running" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VmInstancePlugInStateType-UnInstall", {
      i18nKey: "UnInstall",
      name: intl.formatMessage({ id: "UnInstall", defaultMessage: "Not installed" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("VmInstancePlugInStateType-UnSupport", {
      i18nKey: "UnSupport",
      name: intl.formatMessage({ id: "UnSupport", defaultMessage: "Not supported" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("OperationLogState-Success", {
      i18nKey: "success",
      name: intl.formatMessage({ id: "success", defaultMessage: "Succeeded" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("OperationLogState-Failed", {
      i18nKey: "failed",
      name: intl.formatMessage({ id: "failed", defaultMessage: "Failed" }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("OperationLogState-Running", {
      i18nKey: "running",
      name: intl.formatMessage({ id: "running", defaultMessage: "Running" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("OperationLogState-Exception", {
      i18nKey: "exception",
      name: intl.formatMessage({ id: "exception", defaultMessage: "Abnormal" }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("OperationLogState-Canceled", {
      i18nKey: "canceled",
      name: intl.formatMessage({ id: "canceled", defaultMessage: "Canceled" }),
      icon: "close-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("TicketApprovalsFiledStatus-TicketApprovalsFiledPending", {
      i18nKey: "my.approvals.filed.pending",
      name: intl.formatMessage({
        id: "my.approvals.filed.pending",
        defaultMessage: "Pending Approval",
      }),
      color: { color: "info", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsFiledStatus-TicketApprovalsFiledCancelled", {
      i18nKey: "my.approvals.filed.cancelled",
      name: intl.formatMessage({
        id: "my.approvals.filed.cancelled",
        defaultMessage: "Rejected",
      }),
      color: { color: "neutral", number: 500 },
      contentType: "tag",
    });
    _map.set(
      "TicketApprovalsFiledStatus-TicketApprovalsFiledIntermediateApproved",
      {
        i18nKey: "my.approvals.filed.intermediateApproved",
        name: intl.formatMessage({
          id: "my.approvals.filed.intermediateApproved",
          defaultMessage: "Approved",
        }),
        color: { color: "info", number: 500 },
        contentType: "tag",
      },
    );
    _map.set("TicketApprovalsFiledStatus-TicketApprovalsFiledFinalApproved", {
      i18nKey: "my.approvals.filed.finalApproved",
      name: intl.formatMessage({
        id: "my.approvals.filed.finalApproved",
        defaultMessage: "Approved",
      }),
      color: { color: "positive", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsFiledStatus-TicketApprovalsFiledRejected", {
      i18nKey: "my.approvals.field.rejected",
      name: intl.formatMessage({
        id: "my.approvals.field.rejected",
        defaultMessage: "Rejected",
      }),
      color: { color: "danger", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsStatus-TicketApprovalsPending", {
      i18nKey: "my.approvals.pending",
      name: intl.formatMessage({
        id: "my.approvals.pending",
        defaultMessage: "Pending Approval",
      }),
      color: { color: "info", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsStatus-TicketApprovalsCancelled", {
      i18nKey: "my.approvals.cancelled",
      name: intl.formatMessage({
        id: "my.approvals.cancelled",
        defaultMessage: "Recalled",
      }),
      color: { color: "neutral", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsStatus-TicketApprovalsIntermediateApproved", {
      i18nKey: "my.approvals.intermediateApproved",
      name: intl.formatMessage({
        id: "my.approvals.intermediateApproved",
        defaultMessage: "Approved",
      }),
      color: { color: "positive", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsStatus-TicketApprovalsFinalApproved", {
      i18nKey: "my.approvals.finalApproved",
      name: intl.formatMessage({
        id: "my.approvals.finalApproved",
        defaultMessage: "Approved",
      }),
      color: { color: "positive", number: 500 },
      contentType: "tag",
    });
    _map.set("TicketApprovalsStatus-TicketApprovalsRejected", {
      i18nKey: "my.approvals.rejected",
      name: intl.formatMessage({
        id: "my.approvals.rejected",
        defaultMessage: "Rejected",
      }),
      color: { color: "danger", number: 500 },
      contentType: "tag",
    });
    _map.set("MonitorGroupInstanceState-OK", {
      i18nKey: "healthy",
      name: intl.formatMessage({ id: "healthy", defaultMessage: "Healthy" }),
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("MonitorGroupInstanceState-Alarm", {
      i18nKey: "unhealthy",
      name: intl.formatMessage({ id: "unhealthy", defaultMessage: "Unhealthy" }),
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("BackupResourceVmBackupType-Include", {
      i18nKey: "Include",
      name: intl.formatMessage({ id: "Include", defaultMessage: "Included" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackupResourceVmBackupType-NotInclude", {
      i18nKey: "NotInclude",
      name: intl.formatMessage({ id: "NotInclude", defaultMessage: "Not included" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackupResourceFullBackupType-Full", {
      i18nKey: "Full",
      name: intl.formatMessage({ id: "Full", defaultMessage: "Full" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackupResourceFullBackupType-Incremental", {
      i18nKey: "Incremental",
      name: intl.formatMessage({ id: "Incremental", defaultMessage: "Incremental" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackupDataIsRemoteSynced-Yes", {
      i18nKey: "Yes",
      name: intl.formatMessage({ id: "Yes", defaultMessage: "Yes" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackupDataIsRemoteSynced-No", {
      i18nKey: "No",
      name: intl.formatMessage({ id: "No", defaultMessage: "No" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackupDataIsLocalSynced-Yes", {
      i18nKey: "Yes",
      name: intl.formatMessage({ id: "Yes", defaultMessage: "Yes" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackupDataIsLocalSynced-No", {
      i18nKey: "No",
      name: intl.formatMessage({ id: "No", defaultMessage: "No" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("LoadbalancerType-SLB", {
      i18nKey: "high.performance.instance.type",
      name: intl.formatMessage({
        id: "high.performance.instance.type",
        defaultMessage: "Dedicated Performance",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("LoadbalancerType-Shared", {
      i18nKey: "performance.sharing.type",
      name: intl.formatMessage({
        id: "performance.sharing.type",
        defaultMessage: "Shared Performance",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BalancerAlgorithmType-roundrobin", {
      i18nKey: "constant.roundrobin",
      name: intl.formatMessage({
        id: "constant.roundrobin",
        defaultMessage: "Round Robin",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BalancerAlgorithmType-leastconn", {
      i18nKey: "constant.leastconn",
      name: intl.formatMessage({
        id: "constant.leastconn",
        defaultMessage: "Least Connections",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BalancerAlgorithmType-source", {
      i18nKey: "constant.source",
      name: intl.formatMessage({
        id: "constant.source",
        defaultMessage: "Source Hashing Scheduling",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BalancerAlgorithmType-weightroundrobin", {
      i18nKey: "constant.weightroundrobin",
      name: intl.formatMessage({
        id: "constant.weightroundrobin",
        defaultMessage: "Weighted Round Robin",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HealtyType-healthy", {
      i18nKey: "constant.healthy",
      name: intl.formatMessage({
        id: "constant.healthy",
        defaultMessage: "Healthy",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("HealtyType-unhealthy", {
      i18nKey: "constant.unhealthy",
      name: intl.formatMessage({
        id: "constant.unhealthy",
        defaultMessage: "Unhealthy",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("L2NetworkType-L2NoVlanNetwork", {
      i18nKey: "L2NoVlanNetwork",
      name: intl.formatMessage({
        id: "L2NoVlanNetwork",
        defaultMessage: "L2NoVlanNetwork",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("L2NetworkType-L2VlanNetwork", {
      i18nKey: "L2VlanNetwork",
      name: intl.formatMessage({
        id: "L2VlanNetwork",
        defaultMessage: "L2VlanNetwork",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("L2NetworkType-VxlanNetwork", {
      i18nKey: "VxlanNetwork",
      name: intl.formatMessage({
        id: "VxlanNetwork",
        defaultMessage: "VxlanNetwork",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("L2NetworkType-HardwareVxlanNetwork", {
      i18nKey: "HardwareVxlanNetwork",
      name: intl.formatMessage({
        id: "HardwareVxlanNetwork",
        defaultMessage: "HardwareVxlanNetwork",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("L2NetworkType-VxlanNetworkPool", {
      i18nKey: "VxlanNetworkPool",
      name: intl.formatMessage({
        id: "VxlanNetworkPool",
        defaultMessage: "VxlanNetworkPool",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("L2NetworkType-HardwareVxlanNetworkPool", {
      i18nKey: "HardwareVxlanNetworkPool",
      name: intl.formatMessage({
        id: "HardwareVxlanNetworkPool",
        defaultMessage: "HardwareVxlanNetworkPool",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("L2NetworkType-virtualSwitch", {
      i18nKey: "virtualSwitch",
      name: intl.formatMessage({
        id: "virtualSwitch",
        defaultMessage: "virtualSwitch",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("L2NetworkType-portGroup", {
      i18nKey: "portGroup",
      name: intl.formatMessage({
        id: "portGroup",
        defaultMessage: "portGroup",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("L2NetworkIsolated-true", {
      i18nKey: "l2NetworkIsolated.open",
      name: intl.formatMessage({
        id: "l2NetworkIsolated.open",
        defaultMessage: "Enable",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("L2NetworkIsolated-false", {
      i18nKey: "l2NetworkIsolated.close",
      name: intl.formatMessage({
        id: "l2NetworkIsolated.close",
        defaultMessage: "Disable",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("IscsiServerState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("IscsiServerState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("IPsecState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("IPsecState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("IPSecStatus-Creating", {
      i18nKey: "creating",
      name: intl.formatMessage({ id: "creating", defaultMessage: "Creating" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("IPSecStatus-Ready", {
      i18nKey: "ready",
      name: intl.formatMessage({ id: "ready", defaultMessage: "Ready" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set(
      "InstanceOfferingAllocatorStrategy-LeastVmPreferredHostAllocatorStrategy",
      {
        i18nKey: "least.vm.preferred.host.allocator.strategy",
        name: intl.formatMessage({
          id: "least.vm.preferred.host.allocator.strategy",
          defaultMessage: "Minimum Concurrently Running VMs",
        }),
        color: { color: "neutral", number: 600 },
        contentType: "text",
      },
    );
    _map.set(
      "InstanceOfferingAllocatorStrategy-MinimumCPUUsageHostAllocatorStrategy",
      {
        i18nKey: "minimum.cpu.usage.host.allocator.strategy",
        name: intl.formatMessage({
          id: "minimum.cpu.usage.host.allocator.strategy",
          defaultMessage: "Minimum CPU Usage",
        }),
        color: { color: "neutral", number: 600 },
        contentType: "text",
      },
    );
    _map.set(
      "InstanceOfferingAllocatorStrategy-MinimumMemoryUsageHostAllocatorStrategy",
      {
        i18nKey: "minimum.memory.usage.host.allocator.strategy",
        name: intl.formatMessage({
          id: "minimum.memory.usage.host.allocator.strategy",
          defaultMessage: "Minimum Memory Utilization",
        }),
        color: { color: "neutral", number: 600 },
        contentType: "text",
      },
    );
    _map.set(
      "InstanceOfferingAllocatorStrategy-MaxInstancePerHostHostAllocatorStrategy",
      {
        i18nKey: "maxInstance.perhost.host.allocator.strategy",
        name: intl.formatMessage({
          id: "maxInstance.perhost.host.allocator.strategy",
          defaultMessage: "Host with max. running VMs",
        }),
        color: { color: "neutral", number: 600 },
        contentType: "text",
      },
    );
    _map.set(
      "InstanceOfferingAllocatorStrategy-LastHostPreferredAllocatorStrategy",
      {
        i18nKey: "last.host.preferred.allocator.strategy",
        name: intl.formatMessage({
          id: "last.host.preferred.allocator.strategy",
          defaultMessage: "Last Host",
        }),
        color: { color: "neutral", number: 600 },
        contentType: "text",
      },
    );
    _map.set("InstanceOfferingAllocatorStrategy-DefaultHostAllocatorStrategy", {
      i18nKey: "default.host.allocator.strategy",
      name: intl.formatMessage({
        id: "default.host.allocator.strategy",
        defaultMessage: "Random",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("InstanceOfferingState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("InstanceOfferingState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("InspectionSubTaskHealthState-CRITICAL", {
      i18nKey: "inspection.critical",
      name: intl.formatMessage({
        id: "inspection.critical",
        defaultMessage: "Fault",
      }),
      icon: "alert-triangle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("InspectionSubTaskHealthState-WARN", {
      i18nKey: "inspection.warn",
      name: intl.formatMessage({
        id: "inspection.warn",
        defaultMessage: "Warning",
      }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("InspectionSubTaskHealthState-NORMAL", {
      i18nKey: "inspection.normal",
      name: intl.formatMessage({
        id: "inspection.normal",
        defaultMessage: "Normal",
      }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("InspectionSubTaskHealthState-FAILED", {
      i18nKey: "inspection.failed",
      name: intl.formatMessage({
        id: "inspection.failed",
        defaultMessage: "Failed",
      }),
      icon: "alert-triangle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("NicState-UP", {
      i18nKey: "up",
      name: intl.formatMessage({ id: "up", defaultMessage: "UP" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("NicState-DOWN", {
      i18nKey: "down",
      name: intl.formatMessage({ id: "down", defaultMessage: "DOWN" }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("HealthState-HEALTHY", {
      i18nKey: "healthy",
      name: intl.formatMessage({ id: "healthy", defaultMessage: "Healthy" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("HealthState-UNHEALTHY", {
      i18nKey: "unhealthy",
      name: intl.formatMessage({ id: "unhealthy", defaultMessage: "Unhealthy" }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("ECCWarning-EXIST", {
      i18nKey: "ECCWarning.exist",
      name: intl.formatMessage({
        id: "ECCWarning.exist",
        defaultMessage: "Warning",
      }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("ECCWarning-NOTEXIST", {
      i18nKey: "ECCWarning.not.exist",
      name: intl.formatMessage({
        id: "ECCWarning.not.exist",
        defaultMessage: "None",
      }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("NetMode-CONSISTENT", {
      i18nKey: "consistent",
      name: intl.formatMessage({ id: "consistent", defaultMessage: "Consistent" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("NetMode-INCONSISTENT", {
      i18nKey: "inconsistent",
      name: intl.formatMessage({
        id: "inconsistent",
        defaultMessage: "Inconsistent",
      }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("fullDuplexMode-YES", {
      i18nKey: "yes",
      name: intl.formatMessage({ id: "yes", defaultMessage: "Yes" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("fullDuplexMode-NO", {
      i18nKey: "no",
      name: intl.formatMessage({ id: "no", defaultMessage: "No" }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("NetPlugged-PLUGGED", {
      i18nKey: "plugged",
      name: intl.formatMessage({ id: "plugged", defaultMessage: "Yes" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("NetPlugged-UNPLUGGED", {
      i18nKey: "unplugged",
      name: intl.formatMessage({ id: "unplugged", defaultMessage: "No" }),
      icon: "alert-triangle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("ShareType-Public", {
      i18nKey: "share.type.public",
      name: intl.formatMessage({
        id: "share.type.public",
        defaultMessage: "Share globally",
      }),
      icon: "people-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("ShareType-Group", {
      i18nKey: "share.type.group",
      name: intl.formatMessage({
        id: "share.type.group",
        defaultMessage: "Share With Users/User Groups",
      }),
      icon: "people-fill",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("ShareType-None", {
      i18nKey: "share.type.none",
      name: intl.formatMessage({
        id: "share.type.none",
        defaultMessage: "Not share",
      }),
      icon: "person-fill",
      color: { color: "neutral", number: 600 },
      prefix: "icon",
    });
    _map.set("ImageUseFor-SLB", {
      i18nKey: "slb",
      name: intl.formatMessage({
        id: "slb",
        defaultMessage: "Dedicated-Performance LB",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ImageUseFor-vrouter", {
      i18nKey: "vpc.vRouter",
      name: intl.formatMessage({
        id: "vpc.vRouter",
        defaultMessage: "VPC vRouter",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ProjectState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("ProjectState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("ProjectState-Retired", {
      i18nKey: "retired",
      name: intl.formatMessage({ id: "retired", defaultMessage: "Expired" }),
      icon: "minus-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("ProjectState-LoginExpired", {
      i18nKey: "loginExpired",
      name: intl.formatMessage({
        id: "loginExpired",
        defaultMessage: "Login Restricted",
      }),
      icon: "minus-circle-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("ProjectState-Deleted", {
      i18nKey: "deleted",
      name: intl.formatMessage({ id: "deleted", defaultMessage: "Deleted" }),
      icon: "trash-fill",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("AliyunRouterInterfaceStatus-Active", {
      i18nKey: "aliyunRouterInterfaceStatus.status.Active",
      name: intl.formatMessage({
        id: "aliyunRouterInterfaceStatus.status.Active",
        defaultMessage: "Available ",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("AliyunRouterInterfaceStatus-Idle", {
      i18nKey: "aliyunRouterInterfaceStatus.status.Idle",
      name: intl.formatMessage({
        id: "aliyunRouterInterfaceStatus.status.Idle",
        defaultMessage: "Idle",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("AliyunRouterInterfaceStatus-Connecting", {
      i18nKey: "aliyunRouterInterfaceStatus.status.Connecting",
      name: intl.formatMessage({
        id: "aliyunRouterInterfaceStatus.status.Connecting",
        defaultMessage: "Connecting",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("AliyunRouterInterfaceStatus-Inactive", {
      i18nKey: "aliyunRouterInterfaceStatus.status.Inactive",
      name: intl.formatMessage({
        id: "aliyunRouterInterfaceStatus.status.Inactive",
        defaultMessage: "Unavailable",
      }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("AliyunRouterInterfaceStatus-Deactivating", {
      i18nKey: "aliyunRouterInterfaceStatus.status.Deactivating",
      name: intl.formatMessage({
        id: "aliyunRouterInterfaceStatus.status.Deactivating",
        defaultMessage: "Disabled",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("AliyunRouterConnectionRole-AcceptingSide", {
      i18nKey: "receivingEnd",
      name: intl.formatMessage({
        id: "receivingEnd",
        defaultMessage: "Endpoint",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("AliyunRouterConnectionRole-InitiatingSide", {
      i18nKey: "initiatingSide",
      name: intl.formatMessage({
        id: "initiatingSide",
        defaultMessage: "Initiator",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HybridNasFileSystemStorageType-Performance", {
      i18nKey: "Performance",
      name: intl.formatMessage({
        id: "Performance",
        defaultMessage: "Performance",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HybridNasFileSystemStorageType-Capacity", {
      i18nKey: "Capacity",
      name: intl.formatMessage({ id: "Capacity", defaultMessage: "Capacity" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HybridNasFileSystemProtocolType-NFS", {
      i18nKey: "NFS",
      name: intl.formatMessage({ id: "NFS", defaultMessage: "NFS" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HybridNasFileSystemProtocolType-SMB", {
      i18nKey: "SMB",
      name: intl.formatMessage({ id: "SMB", defaultMessage: "SMB" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("HostState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("HostState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("HostState-PreMaintenance", {
      i18nKey: "pre.maintenance.mode",
      name: intl.formatMessage({
        id: "pre.maintenance.mode",
        defaultMessage: "Pre Maintenance Mode",
      }),
      icon: "wrench-circle-fill",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("HostState-Maintenance", {
      i18nKey: "maintaining",
      name: intl.formatMessage({ id: "maintaining", defaultMessage: "In Maintenance" }),
      icon: "wrench-circle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("HostStatus-Connecting", {
      i18nKey: "connecting",
      name: intl.formatMessage({ id: "connecting", defaultMessage: "Connecting" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("HostStatus-Connected", {
      i18nKey: "connected",
      name: intl.formatMessage({ id: "connected", defaultMessage: "Connected" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("HostStatus-Disconnected", {
      i18nKey: "disconnected",
      name: intl.formatMessage({
        id: "disconnected",
        defaultMessage: "Disconnected",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("HardwareState-Normal", {
      i18nKey: "normal",
      name: intl.formatMessage({ id: "normal", defaultMessage: "Normal" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("HardwareState-Abnormal", {
      i18nKey: "abnormal",
      name: intl.formatMessage({ id: "abnormal", defaultMessage: "Abnormal" }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("HardwareState-NoElectric", {
      i18nKey: "no.electric",
      name: intl.formatMessage({ id: "no.electric", defaultMessage: "Not Powered" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("HardwareState-Unknown", {
      i18nKey: "unknown",
      name: intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("HostQemuState-Unmatched", {
      i18nKey: "hostQemuState.unmatched",
      name: intl.formatMessage({
        id: "hostQemuState.unmatched",
        defaultMessage: "Need Update",
      }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("HostIPMIPowerStatus-POWER_ON", {
      i18nKey: "power.on",
      name: intl.formatMessage({ id: "power.on", defaultMessage: "Power On" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("HostIPMIPowerStatus-POWER_OFF", {
      i18nKey: "power.off",
      name: intl.formatMessage({ id: "power.off", defaultMessage: "Power Off" }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("HostIPMIPowerStatus-POWER_BOOTING", {
      i18nKey: "power.booting",
      name: intl.formatMessage({
        id: "power.booting",
        defaultMessage: "Powering on",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("HostIPMIPowerStatus-POWER_SHUTDOWN", {
      i18nKey: "power.shutdown",
      name: intl.formatMessage({
        id: "power.shutdown",
        defaultMessage: "Powering off",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("HostIPMIPowerStatus-POWER_UNKNOWN", {
      i18nKey: "unknown",
      name: intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" }),
      color: { color: "disabled", number: 500 },
      prefix: "dot",
    });
    _map.set("HostIPMIPowerStatus-UN_CONFIGURED", {
      i18nKey: "ipmi.not.managed",
      name: intl.formatMessage({
        id: "ipmi.not.managed",
        defaultMessage: "IPMI Unmanaged",
      }),
      color: { color: "disabled", number: 500 },
      prefix: "dot",
    });
    _map.set("HostHardwareStatus-Normal", {
      i18nKey: "normal",
      name: intl.formatMessage({ id: "normal", defaultMessage: "Normal" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("HostHardwareStatus-Error", {
      i18nKey: "hardwareStatus.error",
      name: intl.formatMessage({
        id: "hardwareStatus.error",
        defaultMessage: "Faults Occur",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("HostHardwareStatus-Unknown", {
      i18nKey: "unknown",
      name: intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" }),
      color: { color: "disabled", number: 500 },
      prefix: "dot",
    });
    _map.set("PortState-Online", {
      i18nKey: "constant.Online",
      name: intl.formatMessage({
        id: "constant.Online",
        defaultMessage: "Online",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("PortState-Offline", {
      i18nKey: "constant.Offline",
      name: intl.formatMessage({
        id: "constant.Offline",
        defaultMessage: "Offline",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("PortState-Linkdown", {
      i18nKey: "constant.Linkdown",
      name: intl.formatMessage({
        id: "constant.Linkdown",
        defaultMessage: "Linkdown",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("PortState-Error", {
      i18nKey: "constant.Error",
      name: intl.formatMessage({
        id: "constant.Error",
        defaultMessage: "Error",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("PortState-Loopback", {
      i18nKey: "constant.Loopback",
      name: intl.formatMessage({
        id: "constant.Loopback",
        defaultMessage: "Loopback",
      }),
      color: { color: "pending", number: 500 },
      prefix: "dot",
    });
    _map.set("PortState-Testing", {
      i18nKey: "constant.Testing",
      name: intl.formatMessage({
        id: "constant.Testing",
        defaultMessage: "Testing",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("PortState-Initializing", {
      i18nKey: "constant.Initializing",
      name: intl.formatMessage({
        id: "constant.Initializing",
        defaultMessage: "Initializing",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("PortState-Unknown", {
      i18nKey: "constant.Unknown",
      name: intl.formatMessage({
        id: "constant.Unknown",
        defaultMessage: "Unknown",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("PciDeviceType-GPU_Video_Controller", {
      i18nKey: "constant.GPU_Video_Controller",
      name: intl.formatMessage({
        id: "constant.GPU_Video_Controller",
        defaultMessage: "GPU Graphics Controller",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PciDeviceType-GPU_Audio_Controller", {
      i18nKey: "constant.GPU_Audio_Controller",
      name: intl.formatMessage({
        id: "constant.GPU_Audio_Controller",
        defaultMessage: "GPU Sound Card Controller",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PciDeviceType-GPU_Processing_Accelerators", {
      i18nKey: "constant.GPU_Processing_Accelerators",
      name: intl.formatMessage({
        id: "constant.GPU_Processing_Accelerators",
        defaultMessage: "GPU Inference Card Controller",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PciDeviceType-Ethernet_Controller", {
      i18nKey: "constant.Ethernet_Controller",
      name: intl.formatMessage({
        id: "constant.Ethernet_Controller",
        defaultMessage: "NIC",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PciDeviceType-GPU_3D_Controller", {
      i18nKey: "constant.GPU_3D_Controller",
      name: intl.formatMessage({
        id: "constant.GPU_3D_Controller",
        defaultMessage: "GPU 3D Controller",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PciDeviceType-Moxa_Device", {
      i18nKey: "constant.Moxa_Device",
      name: intl.formatMessage({
        id: "constant.Moxa_Device",
        defaultMessage: "Moxa Card",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PciDeviceType-Generic", {
      i18nKey: "constant.Generic",
      name: intl.formatMessage({
        id: "constant.Generic",
        defaultMessage: "Generic Device",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PciDeviceVirtStatus-UNVIRTUALIZABLE", {
      i18nKey: "constant.UNVIRTUALIZABLE",
      name: intl.formatMessage({
        id: "constant.UNVIRTUALIZABLE",
        defaultMessage: "Not virtualizable",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PciDeviceVirtStatus-SRIOV_VIRTUALIZABLE", {
      i18nKey: "constant.SRIOV_VIRTUALIZABLE",
      name: intl.formatMessage({
        id: "constant.SRIOV_VIRTUALIZABLE",
        defaultMessage: "Supports SR-IOV virtualization",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PciDeviceVirtStatus-VFIO_MDEV_VIRTUALIZABLE", {
      i18nKey: "constant.VFIO_MDEV_VIRTUALIZABLE",
      name: intl.formatMessage({
        id: "constant.VFIO_MDEV_VIRTUALIZABLE",
        defaultMessage: "Supports VFIO MDEV virtualization",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PciDeviceVirtStatus-SRIOV_VIRTUALIZED", {
      i18nKey: "constant.SRIOV_VIRTUALIZED",
      name: intl.formatMessage({
        id: "constant.SRIOV_VIRTUALIZED",
        defaultMessage: "SR-IOV virtualized",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PciDeviceVirtStatus-VFIO_MDEV_VIRTUALIZED", {
      i18nKey: "constant.VFIO_MDEV_VIRTUALIZED",
      name: intl.formatMessage({
        id: "constant.VFIO_MDEV_VIRTUALIZED",
        defaultMessage: "VFIO_MDEV virtualized",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PciDeviceVirtStatus-SRIOV_VIRTUAL", {
      i18nKey: "constant.SRIOV_VIRTUAL",
      name: intl.formatMessage({
        id: "constant.SRIOV_VIRTUAL",
        defaultMessage: "SR-IOV VF Device",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("PciDeviceVirtStatus-UNKNOWN", {
      i18nKey: "constant.UNKNOWN",
      name: intl.formatMessage({
        id: "constant.UNKNOWN",
        defaultMessage: "Unknown",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("GpuWorkStatus-nominal", {
      i18nKey: "normal",
      name: intl.formatMessage({ id: "normal", defaultMessage: "Normal" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("GpuWorkStatus-critical", {
      i18nKey: "constant.critical",
      name: intl.formatMessage({
        id: "constant.critical",
        defaultMessage: "Fault",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("GpuWorkStatus-unknown", {
      i18nKey: "common.unknown",
      name: intl.formatMessage({
        id: "common.unknown",
        defaultMessage: "Unknown",
      }),
      color: { color: "disabled", number: 500 },
      prefix: "dot",
    });
    _map.set("SNSApplicationPlatformState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("SNSApplicationPlatformState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("EipState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("EipState-Stopped", {
      i18nKey: "stopped",
      name: intl.formatMessage({ id: "stopped", defaultMessage: "Stopped" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("EcsStatus-DELETED", {
      i18nKey: "deleted",
      name: intl.formatMessage({ id: "deleted", defaultMessage: "Deleted" }),
      icon: "trash",
      color: { color: "neutral", number: 500 },
      prefix: "icon",
    });
    _map.set("EcsStatus-STOPPED", {
      i18nKey: "state.stopped",
      name: intl.formatMessage({
        id: "state.stopped",
        defaultMessage: "Stopped",
      }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("EcsStatus-TRANSFERRING", {
      i18nKey: "transferring",
      name: intl.formatMessage({
        id: "transferring",
        defaultMessage: "TRANSFERRING",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("EcsStatus-RUNNING", {
      i18nKey: "running",
      name: intl.formatMessage({ id: "running", defaultMessage: "Running" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("EcsStatus-RESETTING", {
      i18nKey: "resetting",
      name: intl.formatMessage({ id: "resetting", defaultMessage: "Resetting" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("EcsStatus-STARTING", {
      i18nKey: "starting",
      name: intl.formatMessage({ id: "starting", defaultMessage: "Starting" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("EcsStatus-STOPPING", {
      i18nKey: "stopping",
      name: intl.formatMessage({ id: "stopping", defaultMessage: "Stopping" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("EcsStatus-PENDING", {
      i18nKey: "PENDING",
      name: intl.formatMessage({ id: "PENDING", defaultMessage: "PENDING" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("DiskUsage-SystemDisk", {
      i18nKey: "system.disk",
      name: intl.formatMessage({ id: "system.disk", defaultMessage: "System Disk" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("DiskUsage-CacheDisk", {
      i18nKey: "cache.disk",
      name: intl.formatMessage({ id: "cache.disk", defaultMessage: "Cache Disk" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("DiskUsage-DataDisk", {
      i18nKey: "data.disk",
      name: intl.formatMessage({ id: "data.disk", defaultMessage: "Data Disk" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("DiskReadyState-Normal", {
      i18nKey: "normal",
      name: intl.formatMessage({ id: "normal", defaultMessage: "Normal" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("DiskReadyState-Abnormal", {
      i18nKey: "abnormal",
      name: intl.formatMessage({ id: "abnormal", defaultMessage: "Abnormal" }),
      color: { color: "disabled", number: 500 },
      prefix: "dot",
    });
    _map.set("DiskReadyState-Rebuilding", {
      i18nKey: "rebuilding",
      name: intl.formatMessage({ id: "rebuilding", defaultMessage: "Rebuilding" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("DiskReadyState-Unknown", {
      i18nKey: "unknown",
      name: intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("DiskReadyState-Offline", {
      i18nKey: "offline",
      name: intl.formatMessage({ id: "offline", defaultMessage: "Offline" }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("CephPrimaryStoragePoolType-Root", {
      i18nKey: "cephPrimaryStoragePoolType.root",
      name: intl.formatMessage({
        id: "cephPrimaryStoragePoolType.root",
        defaultMessage: "Root Disk Pool",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("CephPrimaryStoragePoolType-Data", {
      i18nKey: "cephPrimaryStoragePoolType.data",
      name: intl.formatMessage({
        id: "cephPrimaryStoragePoolType.data",
        defaultMessage: "Data Disk Pool",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("CephPrimaryStoragePoolType-ImageCache", {
      i18nKey: "cephPrimaryStoragePoolType.imageCache",
      name: intl.formatMessage({
        id: "cephPrimaryStoragePoolType.imageCache",
        defaultMessage: "Image Cache Pool",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("CephPrimaryStoragePoolType-BackupStorage", {
      i18nKey: "cephPrimaryStoragePoolType.backupStorage",
      name: intl.formatMessage({
        id: "cephPrimaryStoragePoolType.backupStorage",
        defaultMessage: "Image Storage Pool",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("CdpTaskStatus-Starting", {
      i18nKey: "cdpTaskStatus.starting",
      name: intl.formatMessage({
        id: "cdpTaskStatus.starting",
        defaultMessage: "Starting",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("CdpTaskStatus-Created", {
      i18nKey: "cdpTaskStatus.created",
      name: intl.formatMessage({
        id: "cdpTaskStatus.created",
        defaultMessage: "Stopped",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("CdpTaskStatus-Running", {
      i18nKey: "cdpTaskStatus.running",
      name: intl.formatMessage({
        id: "cdpTaskStatus.running",
        defaultMessage: "Running",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("CdpTaskStatus-DataMerging", {
      i18nKey: "cdpTaskStatus.dataMerging",
      name: intl.formatMessage({
        id: "cdpTaskStatus.dataMerging",
        defaultMessage: "Data Merging",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("CdpTaskStatus-Stopped", {
      i18nKey: "cdpTaskStatus.stopped",
      name: intl.formatMessage({
        id: "cdpTaskStatus.stopped",
        defaultMessage: "Stopped",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("CdpTaskStatus-Unknown", {
      i18nKey: "cdpTaskStatus.unknown",
      name: intl.formatMessage({
        id: "cdpTaskStatus.unknown",
        defaultMessage: "Unknown",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("CdpTaskStatus-Failed", {
      i18nKey: "cdpTaskStatus.failed",
      name: intl.formatMessage({
        id: "cdpTaskStatus.failed",
        defaultMessage: "Failed",
      }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("CdpTaskState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("CdpTaskState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("CdpDataStatus-Protecting", {
      i18nKey: "underProtection",
      name: intl.formatMessage({
        id: "underProtection",
        defaultMessage: "Protected",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("CdpDataStatus-Unprotected", {
      i18nKey: "unprotected",
      name: intl.formatMessage({ id: "unprotected", defaultMessage: "Unprotected" }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("RecoveryPointType-RecoveryPoint", {
      i18nKey: "recoveryPoint",
      name: intl.formatMessage({
        id: "recoveryPoint",
        defaultMessage: "Recovery Point",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("RecoveryPointType-ProtectedRecoveryPoint", {
      i18nKey: "protectedRecoveryPoint",
      name: intl.formatMessage({
        id: "protectedRecoveryPoint",
        defaultMessage: "Protected Recovery Point",
      }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("ExponBlockVolumeStatus-Normal", {
      i18nKey: "status.Normal",
      name: intl.formatMessage({ id: "status.Normal", defaultMessage: "Normal" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("ExponBlockVolumeStatus-CreateFailed", {
      i18nKey: "CreateFailed",
      name: intl.formatMessage({
        id: "CreateFailed",
        defaultMessage: "Failed to Create",
      }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("ExponBlockVolumeStatus-UpdateFailed", {
      i18nKey: "UpdateFailed",
      name: intl.formatMessage({
        id: "UpdateFailed",
        defaultMessage: "Failed to Update",
      }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("ExponBlockVolumeStatus-DeleteFailed", {
      i18nKey: "DeleteFailed",
      name: intl.formatMessage({
        id: "DeleteFailed",
        defaultMessage: "Failed to Delete",
      }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("ExponBlockVolumeStatus-Creating", {
      i18nKey: "Creating",
      name: intl.formatMessage({ id: "Creating", defaultMessage: "Creating" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("ExponBlockVolumeStatus-Updating", {
      i18nKey: "Updating",
      name: intl.formatMessage({ id: "Updating", defaultMessage: "Updating" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("ExponBlockVolumeStatus-Deleting", {
      i18nKey: "deleting",
      name: intl.formatMessage({ id: "deleting", defaultMessage: "Deleting" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("XskyBlockVolumeStatus-Active", {
      i18nKey: "block.volume.status.active",
      name: intl.formatMessage({
        id: "block.volume.status.active",
        defaultMessage: "Healthy",
      }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("XskyBlockVolumeStatus-Error", {
      i18nKey: "block.volume.status.error",
      name: intl.formatMessage({
        id: "block.volume.status.error",
        defaultMessage: "Error",
      }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("XskyBlockVolumeStatus-Warning", {
      i18nKey: "block.volume.status.warning",
      name: intl.formatMessage({
        id: "block.volume.status.warning",
        defaultMessage: "Restoring Errors",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("BlockSnapshotState-Enabled", {
      i18nKey: "block.snpashot.state.enabled",
      name: intl.formatMessage({
        id: "block.snpashot.state.enabled",
        defaultMessage: "Healthy",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("BlockSnapshotState-Disabled", {
      i18nKey: "block.snpashot.status.disabled",
      name: intl.formatMessage({
        id: "block.snpashot.status.disabled",
        defaultMessage: "Error",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("BillingsPriceGpuType-DesktopGpu", {
      i18nKey: "DesktopGpu",
      name: intl.formatMessage({
        id: "DesktopGpu",
        defaultMessage: "Desktop GPU",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BillingsPriceGpuType-ComputeGpu", {
      i18nKey: "ComputeGpu",
      name: intl.formatMessage({
        id: "ComputeGpu",
        defaultMessage: "Compute GPU",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BillingsPriceType-PubIpVmNicBandwidthOut", {
      i18nKey: "PubIpVmNicBandwidthOut",
      name: intl.formatMessage({
        id: "PubIpVmNicBandwidthOut",
        defaultMessage: "Upstream Bandwidth",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BillingsPriceType-PubIpVmNicBandwidthIn", {
      i18nKey: "PubIpVmNicBandwidthIn",
      name: intl.formatMessage({
        id: "PubIpVmNicBandwidthIn",
        defaultMessage: "Downstream Bandwidth",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BillingsPriceType-PubIpVipBandwidthOut", {
      i18nKey: "PubIpVipBandwidthOut",
      name: intl.formatMessage({
        id: "PubIpVipBandwidthOut",
        defaultMessage: "Upstream Bandwidth",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BillingsPriceType-PubIpVipBandwidthIn", {
      i18nKey: "PubIpVipBandwidthIn",
      name: intl.formatMessage({
        id: "PubIpVipBandwidthIn",
        defaultMessage: "Downstream Bandwidth",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BareMetal2InstanceStatus-Connecting", {
      i18nKey: "connecting",
      name: intl.formatMessage({ id: "connecting", defaultMessage: "Connecting" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("BareMetal2InstanceStatus-Connected", {
      i18nKey: "connected",
      name: intl.formatMessage({ id: "connected", defaultMessage: "Connected" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("BareMetal2InstanceStatus-Disconnected", {
      i18nKey: "disconnected",
      name: intl.formatMessage({
        id: "disconnected",
        defaultMessage: "Disconnected",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("BareMetal2InstanceStatus-Converting", {
      i18nKey: "converting",
      name: intl.formatMessage({ id: "converting", defaultMessage: "Converting" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("BareMetal2InstanceStatus-Converted", {
      i18nKey: "disconnected",
      name: intl.formatMessage({
        id: "disconnected",
        defaultMessage: "Disconnected",
      }),
      color: { color: "neutral", number: 600 },
      prefix: "dot",
    });
    _map.set("BaremetalInstanceState-Created", {
      i18nKey: "created",
      name: intl.formatMessage({ id: "created", defaultMessage: "Created" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("BaremetalInstanceState-Starting", {
      i18nKey: "starting",
      name: intl.formatMessage({ id: "starting", defaultMessage: "Starting" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("BaremetalInstanceState-Running", {
      i18nKey: "running",
      name: intl.formatMessage({ id: "running", defaultMessage: "Running" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("BaremetalInstanceState-Stopped", {
      i18nKey: "stopped",
      name: intl.formatMessage({ id: "stopped", defaultMessage: "Stopped" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BaremetalInstanceState-Rebooting", {
      i18nKey: "rebooting",
      name: intl.formatMessage({ id: "rebooting", defaultMessage: "Rebooting" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BaremetalInstanceState-Destroyed", {
      i18nKey: "destroyed",
      name: intl.formatMessage({ id: "destroyed", defaultMessage: "Deleted" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BaremetalInstanceState-UNKNOWN", {
      i18nKey: "unknown",
      name: intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BaremetalInstanceState-Error", {
      i18nKey: "error",
      name: intl.formatMessage({ id: "error", defaultMessage: "Error" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BaremetalInstanceStatus-Unprovisioned", {
      i18nKey: "unprovisioned",
      name: intl.formatMessage({
        id: "unprovisioned",
        defaultMessage: "Unprovisioned",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BaremetalInstanceStatus-Provisioning", {
      i18nKey: "provisioning",
      name: intl.formatMessage({
        id: "provisioning",
        defaultMessage: "Provisioning",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BaremetalInstanceStatus-Provisioned", {
      i18nKey: "provisioned",
      name: intl.formatMessage({ id: "provisioned", defaultMessage: "Deployed" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BaremetalChassisStatus-HWInfoUnknown", {
      i18nKey: "hardware.info.unknown",
      name: intl.formatMessage({
        id: "hardware.info.unknown",
        defaultMessage: "Unknown hardware info",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("BaremetalChassisStatus-PxeBooting", {
      i18nKey: "pxe.booting",
      name: intl.formatMessage({
        id: "pxe.booting",
        defaultMessage: "PXE booting",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("BaremetalChassisStatus-PxeBootFailed", {
      i18nKey: "pxe.boot.failed",
      name: intl.formatMessage({
        id: "pxe.boot.failed",
        defaultMessage: "PXE boot failed",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("BaremetalChassisStatus-Available", {
      i18nKey: "available",
      name: intl.formatMessage({ id: "available", defaultMessage: "Available " }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("BaremetalChassisStatus-Allocated", {
      i18nKey: "allocated",
      name: intl.formatMessage({ id: "allocated", defaultMessage: "Allocated" }),
      color: { color: "pending", number: 500 },
      prefix: "dot",
    });
    _map.set("BaremetalChassisPowerStatus-Unknown", {
      i18nKey: "unknown",
      name: intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("BaremetalChassisPowerStatus-PowerOn", {
      i18nKey: "power.on",
      name: intl.formatMessage({ id: "power.on", defaultMessage: "Power On" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("BaremetalChassisPowerStatus-PowerOff", {
      i18nKey: "power.off",
      name: intl.formatMessage({ id: "power.off", defaultMessage: "Power Off" }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("BaremetalChassisPowerStatus-Rebooting", {
      i18nKey: "rebooting",
      name: intl.formatMessage({ id: "rebooting", defaultMessage: "Rebooting" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("Baremetal2ChassisStatus-WrongBootMode", {
      i18nKey: "WrongBootMode",
      name: intl.formatMessage({
        id: "WrongBootMode",
        defaultMessage: "Wrong BIOS mode.",
      }),
      color: { color: "alert", number: 500 },
      prefix: "dot",
    });
    _map.set("Baremetal2ChassisStatus-WrongArchitecture", {
      i18nKey: "WrongArchitecture",
      name: intl.formatMessage({
        id: "WrongArchitecture",
        defaultMessage: "Architecture mismatch",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("Baremetal2ChassisStatus-HardwareInfoUnknown", {
      i18nKey: "hardwareInfo.unknown",
      name: intl.formatMessage({
        id: "hardwareInfo.unknown",
        defaultMessage: "Unknown hardware info",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("Baremetal2ChassisStatus-IPxeBooting", {
      i18nKey: "IPxeBooting",
      name: intl.formatMessage({
        id: "IPxeBooting",
        defaultMessage: "PXE booting",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("Baremetal2ChassisStatus-IPxeBootFailed", {
      i18nKey: "IPxeBootFailed",
      name: intl.formatMessage({
        id: "IPxeBootFailed",
        defaultMessage: "PXE boot failed.",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("Baremetal2ChassisStatus-BareMetalNodeAvailable", {
      i18nKey: "bareMetalNode.constant.available",
      name: intl.formatMessage({
        id: "bareMetalNode.constant.available",
        defaultMessage: "Assignable",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Baremetal2ChassisStatus-BareMetalNodeAllocated", {
      i18nKey: "bareMetalNode.constant.allocated",
      name: intl.formatMessage({
        id: "bareMetalNode.constant.allocated",
        defaultMessage: "Allocated",
      }),
      color: { color: "pending", number: 500 },
      prefix: "dot",
    });
    _map.set("Baremetal2ChassisPowerStatus-POWER_ON", {
      i18nKey: "BareMetal2ChassisPowerStatus.POWER_ON",
      name: intl.formatMessage({
        id: "BareMetal2ChassisPowerStatus.POWER_ON",
        defaultMessage: "Power On",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("Baremetal2ChassisPowerStatus-POWER_OFF", {
      i18nKey: "BareMetal2ChassisPowerStatus.POWER_OFF",
      name: intl.formatMessage({
        id: "BareMetal2ChassisPowerStatus.POWER_OFF",
        defaultMessage: "Powered Off",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("Baremetal2ChassisPowerStatus-POWER_UNKNOWN", {
      i18nKey: "BareMetal2ChassisPowerStatus.POWER_UNKNOWN",
      name: intl.formatMessage({
        id: "BareMetal2ChassisPowerStatus.POWER_UNKNOWN",
        defaultMessage: "Unknown",
      }),
      color: { color: "neutral", number: 500 },
      prefix: "dot",
    });
    _map.set("Baremetal2ChassisProvisionType-Remote", {
      i18nKey: "baremetal2ChassisProvisionType.remote",
      name: intl.formatMessage({
        id: "baremetal2ChassisProvisionType.remote",
        defaultMessage: "Disk",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Baremetal2ChassisProvisionType-Local", {
      i18nKey: "baremetal2ChassisProvisionType.local",
      name: intl.formatMessage({
        id: "baremetal2ChassisProvisionType.local",
        defaultMessage: "Local Disk (Non-Takeover)",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("Baremetal2ChassisProvisionType-Direct", {
      i18nKey: "baremetal2ChassisProvisionType.direct",
      name: intl.formatMessage({
        id: "baremetal2ChassisProvisionType.direct",
        defaultMessage: "Local Disk (Take-Over)",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackupStorageType-ImageStoreBackupStorage", {
      i18nKey: "BackupStorage.ImageStore",
      name: intl.formatMessage({
        id: "BackupStorage.ImageStore",
        defaultMessage: "ImageStore",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackupStorageType-Ceph", {
      i18nKey: "BackupStorage.Ceph",
      name: intl.formatMessage({
        id: "BackupStorage.Ceph",
        defaultMessage: "Ceph",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackupStorageType-AliyunEBS", {
      i18nKey: "AliyunEBS",
      name: intl.formatMessage({
        id: "AliyunEBS",
        defaultMessage: "AliyunEBS",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackupStorageType-SftpBackupStorage", {
      i18nKey: "Sftp",
      name: intl.formatMessage({ id: "Sftp", defaultMessage: "Sftp" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("BackupStorageState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("BackupStorageState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("BackupStorageStatus-Connecting", {
      i18nKey: "connecting",
      name: intl.formatMessage({ id: "connecting", defaultMessage: "Connecting" }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("BackupStorageStatus-Connected", {
      i18nKey: "connected",
      name: intl.formatMessage({ id: "connected", defaultMessage: "Connected" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("BackupStorageStatus-Disconnected", {
      i18nKey: "disconnected",
      name: intl.formatMessage({
        id: "disconnected",
        defaultMessage: "Disconnected",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("AutoScalingGroupState-Enabled", {
      i18nKey: "constant.Enabled",
      name: intl.formatMessage({
        id: "constant.Enabled",
        defaultMessage: "Enabled",
      }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("AutoScalingGroupState-Disabled", {
      i18nKey: "constant.Disabled",
      name: intl.formatMessage({
        id: "constant.Disabled",
        defaultMessage: "Disabled",
      }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("AutoScalingGroupState-Deleting", {
      i18nKey: "constant.Deleting",
      name: intl.formatMessage({
        id: "constant.Deleting",
        defaultMessage: "Deleting",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("text-Confirmed", {
      i18nKey: "confirm.status.ok",
      name: intl.formatMessage({
        id: "confirm.status.ok",
        defaultMessage: "Confirmed",
      }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("text-ConfirmPending", {
      i18nKey: "confirm.status.pending",
      name: intl.formatMessage({
        id: "confirm.status.pending",
        defaultMessage: "Unconfirmed",
      }),
      color: { color: "info", number: 500 },
      prefix: "dot",
    });
    _map.set("ModelServiceInstanceGroupStatus-Running", {
      i18nKey: "aiStore.modelServiceInstanceGroup.running",
      name: intl.formatMessage({
        id: "aiStore.modelServiceInstanceGroup.running",
        defaultMessage: "Running",
      }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("ModelServiceInstanceGroupStatus-Unknown", {
      i18nKey: "aiStore.modelServiceInstanceGroup.unknown",
      name: intl.formatMessage({
        id: "aiStore.modelServiceInstanceGroup.unknown",
        defaultMessage: "Unready",
      }),
      icon: "question-mark-circle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("ModelServiceInstanceGroupStatus-Starting", {
      i18nKey: "aiStore.modelServiceInstanceGroup.starting",
      name: intl.formatMessage({
        id: "aiStore.modelServiceInstanceGroup.starting",
        defaultMessage: "Starting",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("ModelServiceInstanceGroupStatus-Deploying", {
      i18nKey: "aiStore.modelServiceInstanceGroup.deploying",
      name: intl.formatMessage({
        id: "aiStore.modelServiceInstanceGroup.deploying",
        defaultMessage: "Deploying",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("ModelServiceInstanceGroupStatus-ConfigSettingUp", {
      i18nKey: "aiStore.modelServiceInstanceGroup.configSettingUp",
      name: intl.formatMessage({
        id: "aiStore.modelServiceInstanceGroup.configSettingUp",
        defaultMessage: "Configuring",
      }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("ModelServiceInstanceGroupStatus-ServiceBootingUp", {
      i18nKey: "aiStore.modelServiceInstanceGroup.serviceBootingUp",
      name: intl.formatMessage({
        id: "aiStore.modelServiceInstanceGroup.serviceBootingUp",
        defaultMessage: "Starting Service",
      }),
      icon: "loader",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("AiFineTuningTaskStatus-Starting", {
      i18nKey: "starting",
      name: intl.formatMessage({ id: "starting", defaultMessage: "Starting" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("AiFineTuningTaskStatus-Running", {
      i18nKey: "running",
      name: intl.formatMessage({ id: "running", defaultMessage: "Running" }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("ModelEvaluationTaskStatus-Creating", {
      i18nKey: "creating",
      name: intl.formatMessage({ id: "creating", defaultMessage: "Creating" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("ModelEvaluationTaskStatus-Created", {
      i18nKey: "created",
      name: intl.formatMessage({ id: "created", defaultMessage: "Created" }),
      icon: "checkmark-circle-fill",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("ModelEvaluationTaskStatus-Idle", {
      i18nKey: "idle",
      name: intl.formatMessage({ id: "idle", defaultMessage: "Idle" }),
      icon: "clock-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("ModelEvaluationTaskStatus-Running", {
      i18nKey: "running",
      name: intl.formatMessage({ id: "running", defaultMessage: "Running" }),
      icon: "loader",
      color: { color: "info", number: 500 },
      prefix: "icon",
    });
    _map.set("ModelEvaluationTaskStatus-Completed", {
      i18nKey: "completed",
      name: intl.formatMessage({ id: "completed", defaultMessage: "Completed" }),
      icon: "checkmark-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("ModelEvaluationTaskStatus-PartialCompleted", {
      i18nKey: "partialCompleted",
      name: intl.formatMessage({
        id: "partialCompleted",
        defaultMessage: "Partially Completed",
      }),
      icon: "alert-triangle-fill",
      color: { color: "alert", number: 500 },
      prefix: "icon",
    });
    _map.set("ModelEvaluationTaskStatus-Failed", {
      i18nKey: "failed",
      name: intl.formatMessage({ id: "failed", defaultMessage: "Failed" }),
      icon: "close-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("AiModelCenterStatus-Connected", {
      i18nKey: "connected",
      name: intl.formatMessage({ id: "connected", defaultMessage: "Connected" }),
      color: { color: "positive", number: 500 },
      prefix: "dot",
    });
    _map.set("AiModelCenterStatus-Disconnected", {
      i18nKey: "disconnected",
      name: intl.formatMessage({
        id: "disconnected",
        defaultMessage: "Disconnected",
      }),
      color: { color: "danger", number: 500 },
      prefix: "dot",
    });
    _map.set("AffinityGroupPolicy-ANTISOFT", {
      i18nKey: "anti.affinityGroup.soft",
      name: intl.formatMessage({
        id: "anti.affinityGroup.soft",
        defaultMessage: "Anti-Affinity Group (Soft)",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("AffinityGroupPolicy-ANTIHARD", {
      i18nKey: "anti.affinityGroup.hard",
      name: intl.formatMessage({
        id: "anti.affinityGroup.hard",
        defaultMessage: "Anti-Affinity Group (Hard)",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("AffinityGroupState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("AffinityGroupState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("AccessKeyState-Disabled", {
      i18nKey: "disabled",
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      icon: "stop-circle-fill",
      color: { color: "danger", number: 500 },
      prefix: "icon",
    });
    _map.set("AccessKeyState-Enabled", {
      i18nKey: "enabled",
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      icon: "play-circle-fill",
      color: { color: "positive", number: 500 },
      prefix: "icon",
    });
    _map.set("AccessControlRuleType-REJECT", {
      i18nKey: "access.control.rule.type.reject",
      name: intl.formatMessage({
        id: "access.control.rule.type.reject",
        defaultMessage: "BlockList",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    _map.set("AccessControlRuleType-ACCEPT", {
      i18nKey: "access.control.rule.type.accept",
      name: intl.formatMessage({
        id: "access.control.rule.type.accept",
        defaultMessage: "Allowlist",
      }),
      color: { color: "neutral", number: 600 },
      contentType: "text",
    });
    return _map;
  }, [intl]);

  return {
    constantMap,
    constantGroupMap,
  };
};
