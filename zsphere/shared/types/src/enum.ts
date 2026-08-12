export enum AccessControlRuleQueryType {
  Normal = 'Normal'
}

export enum AccessControlRuleType {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT'
}

export enum AccountQueryType {
  BillingPriceTable = 'BillingPriceTable',
  BillingPriceTableBindCandidate = 'BillingPriceTableBindCandidate',
  GET_ACCOUNT_BY_NOT_SHARED = 'GET_ACCOUNT_BY_NOT_SHARED',
  GET_ACCOUNT_BY_NOT_USERGROUP = 'GET_ACCOUNT_BY_NOT_USERGROUP',
  GET_ACCOUNT_BY_ROLE = 'GET_ACCOUNT_BY_ROLE',
  GET_ACCOUNT_BY_SHARED = 'GET_ACCOUNT_BY_SHARED',
  GET_ACCOUNT_BY_USERGROUP = 'GET_ACCOUNT_BY_USERGROUP',
  Normal = 'Normal'
}

export enum AccountType {
  Normal = 'Normal',
  SystemAdmin = 'SystemAdmin',
  ThirdParty = 'ThirdParty'
}

export enum ActionRespTaskState {
  Error = 'Error',
  Running = 'Running',
  Success = 'Success'
}

export enum ActionTaskState {
  exception = 'exception',
  fail = 'fail',
  running = 'running',
  success = 'success',
  suspended = 'suspended'
}

export enum AffinityGroupPolicyType {
  ANTIHARD = 'ANTIHARD',
  ANTISOFT = 'ANTISOFT'
}

export enum AffinityGroupQueryType {
  GetCandidateAffinityGroupForVmAttaching = 'GetCandidateAffinityGroupForVmAttaching',
  Normal = 'Normal'
}

export enum AffinityGroupState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum AlarmState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum AlarmStatus {
  Alarm = 'Alarm',
  InsufficientData = 'InsufficientData',
  OK = 'OK'
}

export enum AllocatorStrategyType {
  DefaultHostAllocatorStrategy = 'DefaultHostAllocatorStrategy',
  LastHostPreferredAllocatorStrategy = 'LastHostPreferredAllocatorStrategy',
  LeastVmPreferredHostAllocatorStrategy = 'LeastVmPreferredHostAllocatorStrategy',
  MaxInstancePerHostHostAllocatorStrategy = 'MaxInstancePerHostHostAllocatorStrategy',
  MinimumCPUUsageHostAllocatorStrategy = 'MinimumCPUUsageHostAllocatorStrategy',
  MinimumMemoryUsageHostAllocatorStrategy = 'MinimumMemoryUsageHostAllocatorStrategy'
}

export enum ApiInspectorMethod {
  DELETE = 'DELETE',
  GET = 'GET',
  GQL = 'GQL',
  POST = 'POST',
  PUT = 'PUT',
  UNKNOWN = 'UNKNOWN',
  ZQL = 'ZQL'
}

export enum ApiInspectorType {
  Request = 'Request',
  Response = 'Response',
  WaitingWebHook = 'WaitingWebHook'
}

export enum BackupDataIsLocalSynced {
  No = 'No',
  Yes = 'Yes'
}

export enum BackupDataIsRemoteSynced {
  No = 'No',
  Yes = 'Yes'
}

export enum BackupMode {
  auto = 'auto',
  full = 'full',
  incremental = 'incremental'
}

export enum BackupResourceFullBackupType {
  Full = 'Full',
  Incremental = 'Incremental'
}

export enum BackupResourceType {
  Database = 'Database',
  ForVmInstanceDetail = 'ForVmInstanceDetail',
  ForVolumeDetail = 'ForVolumeDetail',
  Group = 'Group',
  VmInstance = 'VmInstance',
  Volume = 'Volume'
}

export enum BackupResourceVmBackupType {
  Include = 'Include',
  NotInclude = 'NotInclude'
}

export enum BackupStoragePerformanceMetricType {
  AvailableCapacityInBytes = 'AvailableCapacityInBytes',
  UsedCapacityInPercent = 'UsedCapacityInPercent'
}

export enum BackupStorageQueryType {
  CreateImageCandidate = 'CreateImageCandidate',
  MigrateImageCandidate = 'MigrateImageCandidate',
  Normal = 'Normal',
  NotAttachedZoneBackupStorageList = 'NotAttachedZoneBackupStorageList'
}

export enum BackupStorageState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum BackupStorageStateEvent {
  disable = 'disable',
  enable = 'enable'
}

export enum BackupStorageStatus {
  Connected = 'Connected',
  Connecting = 'Connecting',
  Disconnected = 'Disconnected'
}

/** 通过API GetBackupStorageTypes 获取 */
export enum BackupStorageType {
  AliyunEBS = 'AliyunEBS',
  Ceph = 'Ceph',
  ImageStoreBackupStorage = 'ImageStoreBackupStorage',
  SftpBackupStorage = 'SftpBackupStorage',
  VCenter = 'VCenter'
}

export enum BaremetalChassisPowerStatusType {
  PowerOff = 'PowerOff',
  PowerOn = 'PowerOn',
  Reboot = 'Reboot',
  Rebooting = 'Rebooting',
  Unknown = 'Unknown'
}

export enum BaremetalChassisState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum BaremetalChassisStatus {
  Allocated = 'Allocated',
  Available = 'Available',
  HWInfoUnknown = 'HWInfoUnknown',
  PxeBootFailed = 'PxeBootFailed',
  PxeBooting = 'PxeBooting'
}

export enum BaremetalInstanceState {
  Created = 'Created',
  Destroyed = 'Destroyed',
  Error = 'Error',
  Rebooting = 'Rebooting',
  Running = 'Running',
  Starting = 'Starting',
  Stopped = 'Stopped',
  UNKNOWN = 'UNKNOWN'
}

export enum BaremetalInstanceStatus {
  Provisioned = 'Provisioned',
  Provisioning = 'Provisioning',
  Unprovisioned = 'Unprovisioned'
}

export enum BaremetalPxeServerQueryType {
  ClusterAttachablePxeServer = 'ClusterAttachablePxeServer',
  Normal = 'Normal'
}

export enum BaremetalPxeServerStatus {
  Connected = 'Connected',
  Connecting = 'Connecting',
  Disconnected = 'Disconnected'
}

export enum BlockSnapshotState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum BlockSnapshotStatus {
  Active = 'Active',
  Error = 'Error',
  Ready = 'Ready',
  Warning = 'Warning'
}

export enum BlockVolumeQueryType {
  BM2Instance = 'BM2Instance',
  ForBM2InstanceSelect = 'ForBM2InstanceSelect',
  NORMAL = 'NORMAL'
}

export enum BlockVolumeStatus {
  Active = 'Active',
  Error = 'Error',
  Warning = 'Warning'
}

export enum CBDPrimaryStoragePoolQueryType {
  Normal = 'Normal',
  PsAttachablePool = 'PsAttachablePool'
}

export enum CdpTaskStatus {
  Created = 'Created',
  DataMerging = 'DataMerging',
  Failed = 'Failed',
  Running = 'Running',
  Starting = 'Starting',
  Stopped = 'Stopped',
  Unknown = 'Unknown'
}

export enum CephMonType {
  BackupStorage = 'BackupStorage',
  PrimaryStorage = 'PrimaryStorage'
}

export enum CephPrimaryStoragePoolType {
  BackupStorage = 'BackupStorage',
  Data = 'Data',
  ImageCache = 'ImageCache',
  Root = 'Root'
}

export enum ClusterQueryType {
  BareMetal2GatewayCanChangedCluster = 'BareMetal2GatewayCanChangedCluster',
  BaremetalPxeserviceAttachableCluster = 'BaremetalPxeserviceAttachableCluster',
  BaremetalPxeserviceDetachableCluster = 'BaremetalPxeserviceDetachableCluster',
  ClusterAttachableL2Network = 'ClusterAttachableL2Network',
  CreateVmCandidate = 'CreateVmCandidate',
  GetClusterByISCSIServer = 'GetClusterByISCSIServer',
  GetClusterByNvmeServer = 'GetClusterByNvmeServer',
  ISCSIServerAttachableCluster = 'ISCSIServerAttachableCluster',
  Normal = 'Normal',
  NvmeServerAttachableCluster = 'NvmeServerAttachableCluster',
  PsAttachableCluster = 'PsAttachableCluster'
}

export enum ClusterState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum ComparisonOperator {
  GreaterThan = 'GreaterThan',
  GreaterThanOrEqualTo = 'GreaterThanOrEqualTo',
  LessThan = 'LessThan',
  LessThanOrEqualTo = 'LessThanOrEqualTo'
}

export enum ConnectionModeEnum {
  DynamicCentralizedAllocation = 'DynamicCentralizedAllocation',
  StaticAverageAllocation = 'StaticAverageAllocation',
  StaticCentralizedAllocation = 'StaticCentralizedAllocation',
  StaticPolling = 'StaticPolling'
}

export enum CpuArchitecture {
  aarch64 = 'aarch64',
  loongarch64 = 'loongarch64',
  mips64el = 'mips64el',
  x86_64 = 'x86_64'
}

export enum CpuMemHotAdd {
  notSupport = 'notSupport',
  supported = 'supported'
}

export enum DataSecurityPolicy {
  Copy = 'Copy',
  ErasureCode = 'ErasureCode'
}

export enum DependentResourceType {
  BackupStorageVO = 'BackupStorageVO',
  ClusterVO = 'ClusterVO',
  GlobalConfig = 'GlobalConfig',
  L3NetworkVO = 'L3NetworkVO',
  PrimaryStorageVO = 'PrimaryStorageVO',
  VmInstanceVO = 'VmInstanceVO'
}

export enum DirectoryQueryType {
  Normal = 'Normal'
}

export enum DiskReadyState {
  Abnormal = 'Abnormal',
  Normal = 'Normal',
  Offline = 'Offline',
  Rebuilding = 'Rebuilding',
  Unknown = 'Unknown'
}

export enum DiskUsage {
  CacheDisk = 'CacheDisk',
  DataDisk = 'DataDisk',
  SystemDisk = 'SystemDisk'
}

export enum DomainMode {
  Domain = 'Domain',
  WorkGroup = 'WorkGroup'
}

export enum ELLDPMode {
  disable = 'disable',
  rx_and_tx = 'rx_and_tx',
  rx_only = 'rx_only',
  tx_only = 'tx_only'
}

export enum EditTemplatedVMActionType {
  Add = 'Add',
  Delete = 'Delete',
  Update = 'Update'
}

export enum EditTemplatedVMResourceType {
  GpuDevice = 'GpuDevice',
  GpuDeviceSpec = 'GpuDeviceSpec',
  Nic = 'Nic',
  PciDevice = 'PciDevice',
  ResourceConfig = 'ResourceConfig',
  UsbDevice = 'UsbDevice',
  VGpuDevice = 'VGpuDevice',
  VM = 'VM',
  Volume = 'Volume'
}

export enum EditVmInstanceActionType {
  Add = 'Add',
  Delete = 'Delete',
  Update = 'Update'
}

export enum EditVmInstanceResouceType {
  GpuDevice = 'GpuDevice',
  GpuDeviceSpec = 'GpuDeviceSpec',
  Nic = 'Nic',
  PciDevice = 'PciDevice',
  ResourceConfig = 'ResourceConfig',
  UsbDevice = 'UsbDevice',
  VGpuDevice = 'VGpuDevice',
  VM = 'VM',
  Volume = 'Volume'
}

export enum EipQueryType {
  GetVmNicAttachableEips = 'GetVmNicAttachableEips',
  Normal = 'Normal',
  SelectEipByCreateVm = 'SelectEipByCreateVm'
}

export enum EipState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum EmergencyLevel {
  Emergent = 'Emergent',
  Important = 'Important',
  Normal = 'Normal'
}

export enum EnableCryptoComplianceProgressItemState {
  protectFailed = 'protectFailed',
  protected = 'protected',
  protecting = 'protecting',
  unProtect = 'unProtect',
  waitProtect = 'waitProtect'
}

export enum EnableCryptoComplianceProgressItemType {
  APIStartDataProtectionMsg = 'APIStartDataProtectionMsg',
  zsActionAPi = 'zsActionAPi',
  zsRolePrivilege = 'zsRolePrivilege'
}

export enum EndPointState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum EndPointType {
  AliyunSms = 'AliyunSms',
  DingTalk = 'DingTalk',
  Email = 'Email',
  FeiShu = 'FeiShu',
  HTTP = 'HTTP',
  MicrosoftTeams = 'MicrosoftTeams',
  SNMP = 'SNMP',
  SYSTEM_HTTP = 'SYSTEM_HTTP',
  WeCom = 'WeCom'
}

export enum ExportMetricsValue {
  average = 'average',
  low = 'low',
  top = 'top'
}

export enum ExportTaskStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING'
}

export enum GetMaxPCpuNumForVmCreateType {
  L2Network = 'L2Network',
  Zone = 'Zone'
}

export enum GetMetricDataQueryType {
  BackupStorage = 'BackupStorage',
  BareMetal2Instance = 'BareMetal2Instance',
  BaremetalInstance = 'BaremetalInstance',
  EIP = 'EIP',
  GetHostMetricDataByCluster = 'GetHostMetricDataByCluster',
  GetHostMultiPathMetric = 'GetHostMultiPathMetric',
  GetVmMetricDataByCluster = 'GetVmMetricDataByCluster',
  Host = 'Host',
  L3Network = 'L3Network',
  LoadBalancer = 'LoadBalancer',
  LoadBalancerListener = 'LoadBalancerListener',
  PrimaryStorage = 'PrimaryStorage',
  VIP = 'VIP',
  VRouter = 'VRouter',
  VmInstance = 'VmInstance'
}

export enum GlobalConfigQueryType {
  Normal = 'Normal'
}

export enum GuestToolsState {
  Installed = 'Installed',
  IsRunning = 'IsRunning',
  Stopped = 'Stopped',
  Uninstall = 'Uninstall',
  Unsupport = 'Unsupport'
}

export enum GuestToolsZWatchState {
  NotInstalled = 'NotInstalled',
  NotRunning = 'NotRunning',
  Running = 'Running'
}

export enum GuestVmScriptExecutedRecordDetailQueryType {
  NORMAL = 'NORMAL'
}

export enum GuestVmScriptExecutedRecordQueryType {
  NORMAL = 'NORMAL'
}

export enum GuestVmScriptQueryType {
  NORMAL = 'NORMAL'
}

export enum HardwareState {
  Abnormal = 'Abnormal',
  NoElectric = 'NoElectric',
  Normal = 'Normal',
  Unknown = 'Unknown'
}

export enum HostGroupQueryType {
  Normal = 'Normal'
}

export enum HostIPMIPowerStatus {
  POWER_BOOTING = 'POWER_BOOTING',
  POWER_OFF = 'POWER_OFF',
  POWER_ON = 'POWER_ON',
  POWER_SHUTDOWN = 'POWER_SHUTDOWN',
  POWER_UNKNOWN = 'POWER_UNKNOWN',
  UN_CONFIGURED = 'UN_CONFIGURED'
}

export enum HostKernelInterfaceQueryType {
  Normal = 'Normal'
}

export enum HostPerformanceMetricType {
  CPUAllUsedUtilization = 'CPUAllUsedUtilization',
  DiskAllReadBytes = 'DiskAllReadBytes',
  DiskAllReadOps = 'DiskAllReadOps',
  DiskAllUsedCapacityInBytes = 'DiskAllUsedCapacityInBytes',
  DiskAllUsedCapacityInPercent = 'DiskAllUsedCapacityInPercent',
  DiskAllWriteBytes = 'DiskAllWriteBytes',
  DiskAllWriteOps = 'DiskAllWriteOps',
  MemoryUsedInPercent = 'MemoryUsedInPercent',
  NetworkAllInBytes = 'NetworkAllInBytes',
  NetworkAllInErrors = 'NetworkAllInErrors',
  NetworkAllInPackets = 'NetworkAllInPackets',
  NetworkAllOutBytes = 'NetworkAllOutBytes',
  NetworkAllOutErrors = 'NetworkAllOutErrors',
  NetworkAllOutPackets = 'NetworkAllOutPackets'
}

export enum HostQueryType {
  CreateV2vConversionHostCandidate = 'CreateV2vConversionHostCandidate',
  CreateVmCandidate = 'CreateVmCandidate',
  GetDisasterRecoveryStorageCandidates = 'GetDisasterRecoveryStorageCandidates',
  GetHostByHostGroup = 'GetHostByHostGroup',
  GetHostCandidatesForAddToHostGroup = 'GetHostCandidatesForAddToHostGroup',
  GetHostCandidatesForVmMigration = 'GetHostCandidatesForVmMigration',
  GetHostNotInVSwitch = 'GetHostNotInVSwitch',
  GetVmMigrationCandidateHosts = 'GetVmMigrationCandidateHosts',
  LocalStorageGetVolumeMigratableHosts = 'LocalStorageGetVolumeMigratableHosts',
  Normal = 'Normal',
  RecoverRootVolumeBackupCandidate = 'RecoverRootVolumeBackupCandidate',
  StartingVmCandidate = 'StartingVmCandidate'
}

export enum HostState {
  Disabled = 'Disabled',
  Enabled = 'Enabled',
  Maintenance = 'Maintenance',
  PreMaintenance = 'PreMaintenance'
}

export enum HostStatus {
  Connected = 'Connected',
  Connecting = 'Connecting',
  Disconnected = 'Disconnected'
}

export enum Identity {
  AccountNormalUser = 'AccountNormalUser',
  Admin = 'Admin',
  IAM1AuditAdmin = 'IAM1AuditAdmin',
  IAM1ResourceViewer = 'IAM1ResourceViewer',
  IAM1SecurityAdmin = 'IAM1SecurityAdmin',
  IAM1SystemAdmin = 'IAM1SystemAdmin',
  IAM2AuditAdmin = 'IAM2AuditAdmin',
  IAM2DashboardManager = 'IAM2DashboardManager',
  IAM2SecurityAdmin = 'IAM2SecurityAdmin',
  IAM2SystemAdmin = 'IAM2SystemAdmin',
  NormalAccount = 'NormalAccount',
  OrganizationOperator = 'OrganizationOperator',
  Other = 'Other',
  PlatformAdmin = 'PlatformAdmin',
  PlatformUser = 'PlatformUser',
  ProjectAdmin = 'ProjectAdmin',
  ProjectNormalUser = 'ProjectNormalUser',
  ProjectOperator = 'ProjectOperator',
  VirtualMachineUser = 'VirtualMachineUser'
}

export enum ImageBootMode {
  Legacy = 'Legacy',
  UEFI = 'UEFI',
  UEFI_WITH_CSM = 'UEFI_WITH_CSM'
}

export enum ImageFormat {
  iso = 'iso',
  qcow2 = 'qcow2',
  raw = 'raw',
  vmtx = 'vmtx'
}

export enum ImageMediaType {
  DataVolumeTemplate = 'DataVolumeTemplate',
  ISO = 'ISO',
  RootVolumeTemplate = 'RootVolumeTemplate'
}

export enum ImagePlatform {
  Linux = 'Linux',
  Other = 'Other',
  Paravirtualization = 'Paravirtualization',
  Windows = 'Windows',
  WindowsVirtio = 'WindowsVirtio'
}

export enum ImageQueryType {
  GET_CANDIDATE_ISO_FOR_ATTACHING_VM = 'GET_CANDIDATE_ISO_FOR_ATTACHING_VM',
  GET_DETACHABLE_ISO_FROM_VM = 'GET_DETACHABLE_ISO_FROM_VM',
  GET_IMAGE_CANDIDATES_FOR_AUTO_SCALING_GROUP = 'GET_IMAGE_CANDIDATES_FOR_AUTO_SCALING_GROUP',
  GET_IMAGE_CANDIDATES_FOR_HYBRID_IMAGE_UPLOAD = 'GET_IMAGE_CANDIDATES_FOR_HYBRID_IMAGE_UPLOAD',
  GET_IMAGE_CANDIDATES_FOR_VM_TO_CHANGE = 'GET_IMAGE_CANDIDATES_FOR_VM_TO_CHANGE',
  GetCandidateImagesForCreatingVm = 'GetCandidateImagesForCreatingVm',
  MINE_RESOURCE = 'MINE_RESOURCE',
  NORMAL = 'NORMAL',
  SHARED_RESOURCE = 'SHARED_RESOURCE',
  ZSV_NOT_SHARED_RESOURCE = 'ZSV_NOT_SHARED_RESOURCE',
  ZSV_SHARED_RESOURCE = 'ZSV_SHARED_RESOURCE'
}

export enum ImageState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum ImageStateEvent {
  disable = 'disable',
  enable = 'enable'
}

export enum ImageStatus {
  Creating = 'Creating',
  Deleted = 'Deleted',
  Downloading = 'Downloading',
  Error = 'Error',
  Migrating = 'Migrating',
  Ready = 'Ready'
}

export enum ImageUseFor {
  SLB = 'SLB',
  vrouter = 'vrouter'
}

export enum InspectionSubTaskHealthState {
  CRITICAL = 'CRITICAL',
  FAILED = 'FAILED',
  NORMAL = 'NORMAL',
  WARN = 'WARN'
}

export enum InspectionSubTaskState {
  EMPTY = 'EMPTY',
  FAILED = 'FAILED',
  INIT = 'INIT',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS'
}

export enum InspectionTaskState {
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
  INIT = 'INIT',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  SUSPENDED = 'SUSPENDED'
}

export enum InterfaceServiceQueryType {
  Normal = 'Normal'
}

export enum IscsiServerQueryType {
  GET_CLUSTER_ATTACHABLE_ISCSI_SERVER = 'GET_CLUSTER_ATTACHABLE_ISCSI_SERVER',
  NORMAL = 'NORMAL'
}

export enum KernelTrafficTypes {
  Management = 'Management',
  Storage = 'Storage'
}

export enum L2NetworkQueryType {
  Admin = 'Admin',
  AttachedVxlanNetwork = 'AttachedVxlanNetwork',
  BaremetalClusterAttachableL2network = 'BaremetalClusterAttachableL2network',
  ClusterAttachableL2network = 'ClusterAttachableL2network',
  CreateL3AllCandidate = 'CreateL3AllCandidate',
  CreateL3DefaultCandidate = 'CreateL3DefaultCandidate',
  L2NetworkInZone = 'L2NetworkInZone',
  Mine = 'Mine',
  Normal = 'Normal',
  Share = 'Share',
  SharedResource = 'SharedResource',
  ZSV_NOT_SHARED_RESOURCE = 'ZSV_NOT_SHARED_RESOURCE',
  ZSV_SHARED_RESOURCE = 'ZSV_SHARED_RESOURCE'
}

export enum L3NetworkPerformanceMetricType {
  AvailableIPCount = 'AvailableIPCount',
  AvailableIPInPercent = 'AvailableIPInPercent',
  UsedIPCount = 'UsedIPCount',
  UsedIPInPercent = 'UsedIPInPercent'
}

export enum L3NetworkQueryType {
  AttachVmNicCandiate = 'AttachVmNicCandiate',
  CREATE_EIP_CANDIDATE = 'CREATE_EIP_CANDIDATE',
  CREATE_OVF = 'CREATE_OVF',
  CREATE_VIP_CANDIDATE = 'CREATE_VIP_CANDIDATE',
  CREATE_VM_CANDIDATE = 'CREATE_VM_CANDIDATE',
  CreateAutoScalingGroupCandidate = 'CreateAutoScalingGroupCandidate',
  CreateIPsecCandidate = 'CreateIPsecCandidate',
  CreateInstance = 'CreateInstance',
  CreateVirtualRouterOfferingL3Network = 'CreateVirtualRouterOfferingL3Network',
  CreateVirtualRouterOfferingManageNetwork = 'CreateVirtualRouterOfferingManageNetwork',
  IpsecConnectionLocalCidrAttachCandidate = 'IpsecConnectionLocalCidrAttachCandidate',
  Mine_Resource_Network = 'Mine_Resource_Network',
  NetFlowAddVpcRouterCandidate = 'NetFlowAddVpcRouterCandidate',
  OspfAddVpcRouterCandidate = 'OspfAddVpcRouterCandidate',
  QueryVpcNetwork = 'QueryVpcNetwork',
  RecoverRootVolumeBackupCandidate = 'RecoverRootVolumeBackupCandidate',
  SetIPAddress = 'SetIPAddress',
  Shared_Resource_Flat_Network = 'Shared_Resource_Flat_Network',
  Shared_Resource_Network = 'Shared_Resource_Network',
  Shared_Resource_Public_Network = 'Shared_Resource_Public_Network',
  Shared_Resource_VPC_Network = 'Shared_Resource_VPC_Network',
  VpcFirewallBindL3Network = 'VpcFirewallBindL3Network',
  ZSTACK = 'ZSTACK',
  ZSV_NOT_Shared_Resource_Flat_Network = 'ZSV_NOT_Shared_Resource_Flat_Network',
  ZSV_Shared_Resource_Flat_Network = 'ZSV_Shared_Resource_Flat_Network'
}

export enum L3NetworkType {
  flat = 'flat',
  flow = 'flow',
  manage = 'manage',
  public = 'public',
  vpc = 'vpc'
}

export enum LdapServerType {
  OpenLdap = 'OpenLdap',
  Unknown = 'Unknown',
  WindowsAD = 'WindowsAD'
}

export enum LicenseAttribute {
  Free = 'Free'
}

export enum LicenseQuotaType {
  CPUCore = 'CPUCore',
  CPUSocket = 'CPUSocket',
  Capacity = 'Capacity',
  Host = 'Host',
  None = 'None',
  VM = 'VM'
}

export enum LicenseSource {
  Ctl = 'Ctl',
  InternalMINI = 'InternalMINI',
  Legacy = 'Legacy',
  UKey = 'UKey',
  UploadFile = 'UploadFile'
}

export enum LocalBackupStorageQueryType {
  Normal = 'Normal',
  QueryForCdpTaskResource = 'QueryForCdpTaskResource'
}

export enum LogCollectState {
  FAILED = 'FAILED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS'
}

export enum LunSource {
  NVMe = 'NVMe',
  fiberChannel = 'fiberChannel',
  iSCSI = 'iSCSI'
}

export enum MdevDeviceSpecQueryType {
  GetMdevDeviceCandidatesForGenerate = 'GetMdevDeviceCandidatesForGenerate',
  Normal = 'Normal'
}

export enum MdsStatus {
  Connected = 'Connected',
  Connecting = 'Connecting',
  Disconnected = 'Disconnected'
}

export enum MonStatus {
  Connected = 'Connected',
  Connecting = 'Connecting',
  Disconnected = 'Disconnected'
}

export enum NVMeLunType {
  Normal = 'Normal',
  TransportNotPcie = 'TransportNotPcie'
}

export enum NicState {
  DOWN = 'DOWN',
  UP = 'UP'
}

export enum NicType {
  Bond = 'Bond',
  Nic = 'Nic'
}

export enum NodeType {
  ComputeNode = 'ComputeNode',
  ManagementNode = 'ManagementNode'
}

export enum NvmeServerQueryType {
  GET_CLUSTER_ATTACHABLE_NVME_SERVER = 'GET_CLUSTER_ATTACHABLE_NVME_SERVER',
  NORMAL = 'NORMAL'
}

export enum Op {
  and = 'and',
  eq = 'eq',
  exactLike = 'exactLike',
  exactNotLike = 'exactNotLike',
  getapi = 'getapi',
  gt = 'gt',
  gte = 'gte',
  has = 'has',
  in = 'in',
  is = 'is',
  like = 'like',
  lt = 'lt',
  lte = 'lte',
  ne = 'ne',
  not = 'not',
  notHas = 'notHas',
  notIn = 'notIn',
  notLike = 'notLike',
  or = 'or',
  query = 'query'
}

export enum OperationApiStatus {
  Canceled = 'Canceled',
  Canceling = 'Canceling',
  Failed = 'Failed',
  Running = 'Running',
  Success = 'Success',
  Suspended = 'Suspended',
  Unknown = 'Unknown'
}

export enum OperationLongjobStatus {
  CANCELED = 'CANCELED',
  CANCELING = 'CANCELING',
  FAILED = 'FAILED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  SUSPENDED = 'SUSPENDED'
}

export enum OperationStatus {
  Canceled = 'Canceled',
  Canceling = 'Canceling',
  Exception = 'Exception',
  Failed = 'Failed',
  Running = 'Running',
  Success = 'Success',
  Suspended = 'Suspended',
  Timeout = 'Timeout',
  Unknown = 'Unknown'
}

export enum OperatorState {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED'
}

export enum OwnerQueryType {
  Account = 'Account',
  AccountCandidate = 'AccountCandidate',
  AccountGroup = 'AccountGroup',
  AccountOwner = 'AccountOwner',
  AllAccount = 'AllAccount',
  AllAccountGroup = 'AllAccountGroup',
  AllProject = 'AllProject',
  Project = 'Project',
  ProjectCandidate = 'ProjectCandidate',
  ProjectOwner = 'ProjectOwner'
}

export enum OwnerSummaryType {
  All = 'All',
  Candidate = 'Candidate',
  ChangeOwner = 'ChangeOwner',
  Normal = 'Normal'
}

export enum PciDeviceGpuType {
  ComputeGpu = 'ComputeGpu',
  DesktopGpu = 'DesktopGpu'
}

export enum PciDeviceMetaDataOperator {
  Equal = 'Equal',
  Unequal = 'Unequal'
}

export enum PciDevicePassThroughState {
  Available = 'Available',
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum PciDeviceSpecState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum PciDeviceState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum PciDeviceStatus {
  Active = 'Active',
  Attached = 'Attached',
  Reserved = 'Reserved',
  System = 'System'
}

export enum PciDeviceType {
  Audio_Controller = 'Audio_Controller',
  Communication_Controller = 'Communication_Controller',
  Custom = 'Custom',
  Ethernet_Controller = 'Ethernet_Controller',
  Fibre_Channel = 'Fibre_Channel',
  GPU_3D_Controller = 'GPU_3D_Controller',
  GPU_Audio_Controller = 'GPU_Audio_Controller',
  GPU_Serial_Controller = 'GPU_Serial_Controller',
  GPU_USB_Controller = 'GPU_USB_Controller',
  GPU_Video_Controller = 'GPU_Video_Controller',
  Generic = 'Generic',
  Host_Bridge = 'Host_Bridge',
  ISA_Bridge = 'ISA_Bridge',
  Memory_Controller = 'Memory_Controller',
  Moxa_Device = 'Moxa_Device',
  Non_Volatile_Memory_Controller = 'Non_Volatile_Memory_Controller',
  PCI_Bridge = 'PCI_Bridge',
  PIC = 'PIC',
  Performance_Counters = 'Performance_Counters',
  RAID_Controller = 'RAID_Controller',
  SATA_Controller = 'SATA_Controller',
  SMBus = 'SMBus',
  Serial_Controller = 'Serial_Controller',
  Signal_Processing_Controller = 'Signal_Processing_Controller',
  System_Peripheral = 'System_Peripheral',
  USB_Controller = 'USB_Controller'
}

export enum PciDeviceVirtStatus {
  SRIOV_VIRTUAL = 'SRIOV_VIRTUAL',
  SRIOV_VIRTUALIZABLE = 'SRIOV_VIRTUALIZABLE',
  SRIOV_VIRTUALIZED = 'SRIOV_VIRTUALIZED',
  UNKNOWN = 'UNKNOWN',
  UNVIRTUALIZABLE = 'UNVIRTUALIZABLE',
  VFIO_MDEV_VIRTUALIZABLE = 'VFIO_MDEV_VIRTUALIZABLE',
  VFIO_MDEV_VIRTUALIZED = 'VFIO_MDEV_VIRTUALIZED'
}

export enum PerformanceThresholdSymbolType {
  GreaterEqual = 'GreaterEqual',
  LessEqual = 'LessEqual'
}

export enum PerformanceType {
  BackupStorage = 'BackupStorage',
  Host = 'Host',
  L3Network = 'L3Network',
  Router = 'Router',
  Vip = 'Vip',
  VmInstance = 'VmInstance'
}

export enum PhysicalNetworkBondQueryType {
  Normal = 'Normal'
}

export enum PhysicalNetworkInterfaceQueryType {
  Normal = 'Normal'
}

export enum PhysicalNetworkType {
  BackupNetwork = 'BackupNetwork',
  ManagementNetwork = 'ManagementNetwork',
  MigrationNetwork = 'MigrationNetwork',
  StorageNetwork = 'StorageNetwork',
  TenantNetwork = 'TenantNetwork'
}

export enum PhysicalNicQueryType {
  Normal = 'Normal',
  getCandidatesPhysicalNicForAddToBondInL2VSwitch = 'getCandidatesPhysicalNicForAddToBondInL2VSwitch',
  getCandidatesPhysicalNicForCreateByInL2VSwitch = 'getCandidatesPhysicalNicForCreateByInL2VSwitch',
  getCandidatesPhysicalNicForCreateByInVM = 'getCandidatesPhysicalNicForCreateByInVM',
  getCandidatesPhysicalNicForMultipleCreateBond = 'getCandidatesPhysicalNicForMultipleCreateBond',
  getCandidatesPhysicalNicForSingleCreateOrModifyBond = 'getCandidatesPhysicalNicForSingleCreateOrModifyBond'
}

export enum PortGroupVlanMode {
  ACCESS = 'ACCESS',
  NONE = 'NONE',
  PVLAN = 'PVLAN',
  TRUNK = 'TRUNK'
}

export enum PortMirrorSessionStatus {
  Active = 'Active',
  Created = 'Created',
  Inactive = 'Inactive'
}

export enum PortMirrorSessionType {
  Bidirection = 'Bidirection',
  Egress = 'Egress',
  Ingress = 'Ingress'
}

export enum PortMirrorState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum PreconfigurationTemplateState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum PreconfigurationTemplateType {
  autoinstall = 'autoinstall',
  autoyast = 'autoyast',
  kickstart = 'kickstart',
  preseed = 'preseed'
}

export enum PrimaryStorageQueryType {
  ClusterAttachablePs = 'ClusterAttachablePs',
  CreateDataVolumeByVolumeImageGetCandidatePrimaryStorage = 'CreateDataVolumeByVolumeImageGetCandidatePrimaryStorage',
  CreateInstanceDiskOptionFromHostInLocalStorageType = 'CreateInstanceDiskOptionFromHostInLocalStorageType',
  CreateVmForDataVolumeCandidate = 'CreateVmForDataVolumeCandidate',
  CreateVmForRootVolumeCandidate = 'CreateVmForRootVolumeCandidate',
  CreatevCenterVolumeImageVmCandidate = 'CreatevCenterVolumeImageVmCandidate',
  CreatevCenterVolumeVmCandidate = 'CreatevCenterVolumeVmCandidate',
  GetPrimaryStorageCandidatesForVolumeMigration = 'GetPrimaryStorageCandidatesForVolumeMigration',
  Normal = 'Normal',
  OvfImport = 'OvfImport',
  RecoverDataVolumeBackupCandidate = 'RecoverDataVolumeBackupCandidate',
  RecoverRootVolumeBackupCandidate = 'RecoverRootVolumeBackupCandidate',
  StorageMigrateVm = 'StorageMigrateVm',
  StorageMigrateVpcRouter = 'StorageMigrateVpcRouter',
  Zstack = 'Zstack',
  vCenterPrimaryStorageList = 'vCenterPrimaryStorageList'
}

export enum PrimaryStorageState {
  Deleting = 'Deleting',
  Disabled = 'Disabled',
  Enabled = 'Enabled',
  Maintenance = 'Maintenance'
}

export enum PrimaryStorageStatus {
  Connected = 'Connected',
  Connecting = 'Connecting',
  Disconnected = 'Disconnected'
}

/** 通过API GetPrimaryStorageTypes 获取 */
export enum PrimaryStorageType {
  Addon = 'Addon',
  AliyunEBS = 'AliyunEBS',
  AliyunNAS = 'AliyunNAS',
  BlockStorage = 'BlockStorage',
  Ceph = 'Ceph',
  LocalStorage = 'LocalStorage',
  MiniStorage = 'MiniStorage',
  NFS = 'NFS',
  SharedBlock = 'SharedBlock',
  SharedMountPoint = 'SharedMountPoint',
  VCenter = 'VCenter'
}

export enum ProdInfo {
  AdvancedXinChuangZSV = 'AdvancedXinChuangZSV',
  AdvancedZSV = 'AdvancedZSV',
  Basic = 'Basic',
  BasicXinChuangZSV = 'BasicXinChuangZSV',
  BasicZSV = 'BasicZSV',
  Enterprise = 'Enterprise',
  EnterpriseXinChuang = 'EnterpriseXinChuang',
  EnterpriseXinChuangCloud = 'EnterpriseXinChuangCloud',
  ProXinChuang = 'ProXinChuang',
  ProXinChuangZSV = 'ProXinChuangZSV',
  ProZSV = 'ProZSV',
  Standard = 'Standard',
  ZStack = 'ZStack',
  ZStackLicense = 'ZStackLicense'
}

export enum ProfileType {
  CustomColumns = 'CustomColumns',
  HomepageLayoutConfig = 'HomepageLayoutConfig',
  MonitoringItemsConfig = 'MonitoringItemsConfig',
  MonitoringLayoutConfig = 'MonitoringLayoutConfig',
  OverviewLayoutConfig = 'OverviewLayoutConfig',
  QuickLinkDisableConfig = 'QuickLinkDisableConfig',
  ResourceUpgradeConfig = 'ResourceUpgradeConfig',
  TableColumnWidth = 'TableColumnWidth',
  WelcomeConfig = 'WelcomeConfig'
}

export enum QuerySummaryUserInfoType {
  IAM1 = 'IAM1',
  IAM2 = 'IAM2'
}

export enum QueryWidgetUserInfoType {
  Account = 'Account',
  Admin = 'Admin',
  OrganizationOperator = 'OrganizationOperator',
  Project = 'Project'
}

export enum RaidLevelState {
  Abnormal = 'Abnormal',
  Degraged = 'Degraged',
  Normal = 'Normal',
  Rebuild = 'Rebuild',
  Unknown = 'Unknown'
}

export enum ReadyState {
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  LostConnect = 'LostConnect',
  Rebuilding = 'Rebuilding'
}

export enum RedundancyPolicy {
  Erasure = 'Erasure',
  Replicated = 'Replicated'
}

export enum ResourceQueryType {
  AccessControlList = 'AccessControlList',
  AccessControlListEntry = 'AccessControlListEntry',
  AccessControlRule = 'AccessControlRule',
  AccessKey = 'AccessKey',
  Account = 'Account',
  ActiveAlarm = 'ActiveAlarm',
  ActiveAlarmTemplate = 'ActiveAlarmTemplate',
  AddingNewInstanceRule = 'AddingNewInstanceRule',
  AddressPool = 'AddressPool',
  AffinityGroup = 'AffinityGroup',
  AffinityGroupUsage = 'AffinityGroupUsage',
  AgentVersion = 'AgentVersion',
  AiSiNoSecretResourcePool = 'AiSiNoSecretResourcePool',
  Alarm = 'Alarm',
  AlarmAction = 'AlarmAction',
  AlarmDataAck = 'AlarmDataAck',
  AlarmLabel = 'AlarmLabel',
  AlarmRecords = 'AlarmRecords',
  Alert = 'Alert',
  AlertDataAck = 'AlertDataAck',
  AliyunDisk = 'AliyunDisk',
  AliyunEbsBackupStorage = 'AliyunEbsBackupStorage',
  AliyunEbsPrimaryStorage = 'AliyunEbsPrimaryStorage',
  AliyunNasAccessGroup = 'AliyunNasAccessGroup',
  AliyunNasAccessRule = 'AliyunNasAccessRule',
  AliyunNasFileSystem = 'AliyunNasFileSystem',
  AliyunNasMountTarget = 'AliyunNasMountTarget',
  AliyunNasPrimaryStorageMountPoint = 'AliyunNasPrimaryStorageMountPoint',
  AliyunPanguPartition = 'AliyunPanguPartition',
  AliyunProxyVSwitch = 'AliyunProxyVSwitch',
  AliyunProxyVpc = 'AliyunProxyVpc',
  AliyunRouterInterface = 'AliyunRouterInterface',
  AliyunSmsSNSTextTemplate = 'AliyunSmsSNSTextTemplate',
  AliyunSnapshot = 'AliyunSnapshot',
  AppBuildSystem = 'AppBuildSystem',
  ApplianceVm = 'ApplianceVm',
  ApplianceVmFirewallRule = 'ApplianceVmFirewallRule',
  ArchiveTicket = 'ArchiveTicket',
  ArchiveTicketStatusHistory = 'ArchiveTicketStatusHistory',
  AsyncRest = 'AsyncRest',
  Audits = 'Audits',
  AutoScalingGroup = 'AutoScalingGroup',
  AutoScalingGroupActivity = 'AutoScalingGroupActivity',
  AutoScalingGroupInstance = 'AutoScalingGroupInstance',
  AutoScalingRule = 'AutoScalingRule',
  AutoScalingRuleAlarmTrigger = 'AutoScalingRuleAlarmTrigger',
  AutoScalingRuleSchedulerJobTrigger = 'AutoScalingRuleSchedulerJobTrigger',
  AutoScalingRuleTrigger = 'AutoScalingRuleTrigger',
  AutoScalingTemplate = 'AutoScalingTemplate',
  AutoScalingVmTemplate = 'AutoScalingVmTemplate',
  BackupStorage = 'BackupStorage',
  BareMetal2Billing = 'BareMetal2Billing',
  BareMetal2Bonding = 'BareMetal2Bonding',
  BareMetal2Chassis = 'BareMetal2Chassis',
  BareMetal2ChassisDisk = 'BareMetal2ChassisDisk',
  BareMetal2ChassisNic = 'BareMetal2ChassisNic',
  BareMetal2ChassisOffering = 'BareMetal2ChassisOffering',
  BareMetal2Gateway = 'BareMetal2Gateway',
  BareMetal2GatewayProvisionNic = 'BareMetal2GatewayProvisionNic',
  BareMetal2Instance = 'BareMetal2Instance',
  BareMetal2InstanceProvisionNic = 'BareMetal2InstanceProvisionNic',
  BareMetal2IpmiChassis = 'BareMetal2IpmiChassis',
  BareMetal2ProvisionNetwork = 'BareMetal2ProvisionNetwork',
  BareMetal2Usage = 'BareMetal2Usage',
  BareMetal2UsageHistory = 'BareMetal2UsageHistory',
  BaremetalBonding = 'BaremetalBonding',
  BaremetalChassis = 'BaremetalChassis',
  BaremetalHardwareInfo = 'BaremetalHardwareInfo',
  BaremetalImageCache = 'BaremetalImageCache',
  BaremetalInstance = 'BaremetalInstance',
  BaremetalInstanceSequenceNumber = 'BaremetalInstanceSequenceNumber',
  BaremetalNic = 'BaremetalNic',
  BaremetalPxeServer = 'BaremetalPxeServer',
  BaremetalVlanNic = 'BaremetalVlanNic',
  Billing = 'Billing',
  BillingResourceLabel = 'BillingResourceLabel',
  BlockPrimaryStorage = 'BlockPrimaryStorage',
  BlockScsiLun = 'BlockScsiLun',
  BlockVolume = 'BlockVolume',
  BuildAppExportHistory = 'BuildAppExportHistory',
  BuildApplication = 'BuildApplication',
  CCSCertificate = 'CCSCertificate',
  Captcha = 'Captcha',
  CasClient = 'CasClient',
  CdpPolicy = 'CdpPolicy',
  CdpTask = 'CdpTask',
  CdpVolumeHistory = 'CdpVolumeHistory',
  CephBackupStorage = 'CephBackupStorage',
  CephBackupStorageMon = 'CephBackupStorageMon',
  CephCapacity = 'CephCapacity',
  CephOsdGroup = 'CephOsdGroup',
  CephPrimaryStorage = 'CephPrimaryStorage',
  CephPrimaryStorageMon = 'CephPrimaryStorageMon',
  CephPrimaryStoragePool = 'CephPrimaryStoragePool',
  Certificate = 'Certificate',
  CloudFormationStackEvent = 'CloudFormationStackEvent',
  Cluster = 'Cluster',
  ClusterDRS = 'ClusterDRS',
  ConnectionAccessPoint = 'ConnectionAccessPoint',
  ConnectionRelationShip = 'ConnectionRelationShip',
  ConsoleProxy = 'ConsoleProxy',
  ConsoleProxyAgent = 'ConsoleProxyAgent',
  CpuFeaturesHistory = 'CpuFeaturesHistory',
  CustomPreconfiguration = 'CustomPreconfiguration',
  DRSAdvice = 'DRSAdvice',
  DRSVmMigrationActivity = 'DRSVmMigrationActivity',
  DataCenter = 'DataCenter',
  DataVolumeBilling = 'DataVolumeBilling',
  DataVolumeUsage = 'DataVolumeUsage',
  DataVolumeUsageExtension = 'DataVolumeUsageExtension',
  DataVolumeUsageHistory = 'DataVolumeUsageHistory',
  DatabaseBackup = 'DatabaseBackup',
  Delete = 'Delete',
  Directory = 'Directory',
  DiskOffering = 'DiskOffering',
  ESXHost = 'ESXHost',
  EcsImage = 'EcsImage',
  EcsImageUsage = 'EcsImageUsage',
  EcsInstance = 'EcsInstance',
  EcsSecurityGroup = 'EcsSecurityGroup',
  EcsSecurityGroupRule = 'EcsSecurityGroupRule',
  EcsVSwitch = 'EcsVSwitch',
  EcsVpc = 'EcsVpc',
  Eip = 'Eip',
  EmailMedia = 'EmailMedia',
  EmailTriggerAction = 'EmailTriggerAction',
  EncryptEntityMetadata = 'EncryptEntityMetadata',
  EncryptionIntegrity = 'EncryptionIntegrity',
  EventDataAck = 'EventDataAck',
  EventLog = 'EventLog',
  EventRecords = 'EventRecords',
  EventRuleTemplate = 'EventRuleTemplate',
  EventSubscription = 'EventSubscription',
  EventSubscriptionAction = 'EventSubscriptionAction',
  EventSubscriptionLabel = 'EventSubscriptionLabel',
  ExternalBackup = 'ExternalBackup',
  ExternalBackupMetadata = 'ExternalBackupMetadata',
  FaultToleranceVmGroup = 'FaultToleranceVmGroup',
  FiberChannelLun = 'FiberChannelLun',
  FiberChannelStorage = 'FiberChannelStorage',
  FileIntegrityVerification = 'FileIntegrityVerification',
  FlkSecSecretResourcePool = 'FlkSecSecretResourcePool',
  FlkSecSecurityMachine = 'FlkSecSecurityMachine',
  FlowCollector = 'FlowCollector',
  FlowMeter = 'FlowMeter',
  FlowRouter = 'FlowRouter',
  FusionstorBackupStorage = 'FusionstorBackupStorage',
  FusionstorBackupStorageMon = 'FusionstorBackupStorageMon',
  FusionstorCapacity = 'FusionstorCapacity',
  FusionstorPrimaryStorage = 'FusionstorPrimaryStorage',
  FusionstorPrimaryStorageMon = 'FusionstorPrimaryStorageMon',
  GarbageCollector = 'GarbageCollector',
  GlobalConfig = 'GlobalConfig',
  GlobalConfigTemplate = 'GlobalConfigTemplate',
  GuestOsCategory = 'GuestOsCategory',
  GuestTools = 'GuestTools',
  GuestToolsState = 'GuestToolsState',
  HaStrategyCondition = 'HaStrategyCondition',
  HaiTaiSecretResourcePool = 'HaiTaiSecretResourcePool',
  HardwareL2VxlanNetworkPool = 'HardwareL2VxlanNetworkPool',
  HistoricalPassword = 'HistoricalPassword',
  Host = 'Host',
  HostAllocatedCpu = 'HostAllocatedCpu',
  HostCapacity = 'HostCapacity',
  HostHaState = 'HostHaState',
  HostIpmi = 'HostIpmi',
  HostNetworkBonding = 'HostNetworkBonding',
  HostNetworkInterface = 'HostNetworkInterface',
  HostNumaNode = 'HostNumaNode',
  HostOsCategory = 'HostOsCategory',
  HostPhysicalMemory = 'HostPhysicalMemory',
  HostPort = 'HostPort',
  HostSchedulingRuleGroup = 'HostSchedulingRuleGroup',
  HostTag = 'HostTag',
  HybridAccount = 'HybridAccount',
  HybridEipAddress = 'HybridEipAddress',
  IAM2Organization = 'IAM2Organization',
  IAM2OrganizationAttribute = 'IAM2OrganizationAttribute',
  IAM2Project = 'IAM2Project',
  IAM2ProjectAttribute = 'IAM2ProjectAttribute',
  IAM2ProjectRole = 'IAM2ProjectRole',
  IAM2ProjectTemplate = 'IAM2ProjectTemplate',
  IAM2TicketFlow = 'IAM2TicketFlow',
  IAM2TicketFlowCollection = 'IAM2TicketFlowCollection',
  IAM2VirtualID = 'IAM2VirtualID',
  IAM2VirtualIDAttribute = 'IAM2VirtualIDAttribute',
  IAM2VirtualIDGroup = 'IAM2VirtualIDGroup',
  IAM2VirtualIDGroupAttribute = 'IAM2VirtualIDGroupAttribute',
  IPsecConnection = 'IPsecConnection',
  IPsecPeerCidr = 'IPsecPeerCidr',
  IdentityZone = 'IdentityZone',
  Image = 'Image',
  ImageCache = 'ImageCache',
  ImageCacheShadow = 'ImageCacheShadow',
  ImageOpsJournal = 'ImageOpsJournal',
  ImagePackage = 'ImagePackage',
  ImageReplicationGroup = 'ImageReplicationGroup',
  ImageReplicationHistory = 'ImageReplicationHistory',
  ImageStoreBackupStorage = 'ImageStoreBackupStorage',
  InfoSecSecretResourcePool = 'InfoSecSecretResourcePool',
  InfoSecSecurityMachine = 'InfoSecSecurityMachine',
  Insert = 'Insert',
  InstallPathRecycle = 'InstallPathRecycle',
  InstanceOffering = 'InstanceOffering',
  IpRange = 'IpRange',
  IscsiFileSystemBackendPrimaryStorage = 'IscsiFileSystemBackendPrimaryStorage',
  IscsiIso = 'IscsiIso',
  IscsiLun = 'IscsiLun',
  IscsiServer = 'IscsiServer',
  IscsiTarget = 'IscsiTarget',
  JobQueue = 'JobQueue',
  JobQueueEntry = 'JobQueueEntry',
  JsonLabel = 'JsonLabel',
  KVMHost = 'KVMHost',
  KeyProvider = 'KeyProvider',
  KeyValue = 'KeyValue',
  KeyValueBinary = 'KeyValueBinary',
  KvmHostHypervisorMetadata = 'KvmHostHypervisorMetadata',
  KvmHypervisorInfo = 'KvmHypervisorInfo',
  L2Network = 'L2Network',
  L2PortGroupNetwork = 'L2PortGroupNetwork',
  L2VirtualSwitchNetwork = 'L2VirtualSwitchNetwork',
  L2VlanNetwork = 'L2VlanNetwork',
  L3Network = 'L3Network',
  L3NetworkDns = 'L3NetworkDns',
  L3NetworkHostRoute = 'L3NetworkHostRoute',
  LdapServer = 'LdapServer',
  LicenseHistory = 'LicenseHistory',
  LoadBalancer = 'LoadBalancer',
  LoadBalancerListener = 'LoadBalancerListener',
  LoadBalancerServerGroup = 'LoadBalancerServerGroup',
  LoadBalancerServerGroupServerIp = 'LoadBalancerServerGroupServerIp',
  Log = 'Log',
  LoginAttempts = 'LoginAttempts',
  LongJob = 'LongJob',
  Lun = 'Lun',
  ManagementNode = 'ManagementNode',
  ManagementNodeContext = 'ManagementNodeContext',
  MdevDevice = 'MdevDevice',
  MdevDeviceSpec = 'MdevDeviceSpec',
  Media = 'Media',
  MetricDataHttpReceiver = 'MetricDataHttpReceiver',
  MetricRuleTemplate = 'MetricRuleTemplate',
  MetricTemplate = 'MetricTemplate',
  MiniStorage = 'MiniStorage',
  MiniStorageResourceReplication = 'MiniStorageResourceReplication',
  MirrorNetworkUsedIp = 'MirrorNetworkUsedIp',
  MonitorGroup = 'MonitorGroup',
  MonitorGroupAlarm = 'MonitorGroupAlarm',
  MonitorGroupEventSubscription = 'MonitorGroupEventSubscription',
  MonitorGroupInstance = 'MonitorGroupInstance',
  MonitorTemplate = 'MonitorTemplate',
  MonitorTrigger = 'MonitorTrigger',
  MonitorTriggerAction = 'MonitorTriggerAction',
  MttyDevice = 'MttyDevice',
  MulticastRouter = 'MulticastRouter',
  MulticastRouterRendezvousPoint = 'MulticastRouterRendezvousPoint',
  NasFileSystem = 'NasFileSystem',
  NasMountTarget = 'NasMountTarget',
  NetworkServiceProvider = 'NetworkServiceProvider',
  NetworkServiceType = 'NetworkServiceType',
  NormalIpRange = 'NormalIpRange',
  Notification = 'Notification',
  NotificationSubscription = 'NotificationSubscription',
  NvmeLun = 'NvmeLun',
  NvmeTarget = 'NvmeTarget',
  OAuth2Client = 'OAuth2Client',
  OAuth2Token = 'OAuth2Token',
  OssBucket = 'OssBucket',
  OssBucketDomain = 'OssBucketDomain',
  OssUploadParts = 'OssUploadParts',
  PciDevice = 'PciDevice',
  PciDeviceBilling = 'PciDeviceBilling',
  PciDeviceOffering = 'PciDeviceOffering',
  PciDeviceSpec = 'PciDeviceSpec',
  PciDeviceUsage = 'PciDeviceUsage',
  PciDeviceUsageHistory = 'PciDeviceUsageHistory',
  PhysicalDriveSmartSelfTestHistory = 'PhysicalDriveSmartSelfTestHistory',
  Policy = 'Policy',
  PolicyRouteRule = 'PolicyRouteRule',
  PolicyRouteRuleSet = 'PolicyRouteRuleSet',
  PolicyRouteTable = 'PolicyRouteTable',
  PolicyRouteTableRouteEntry = 'PolicyRouteTableRouteEntry',
  PortForwardingRule = 'PortForwardingRule',
  PortMirror = 'PortMirror',
  PortMirrorSession = 'PortMirrorSession',
  PortMirrorSessionSequenceNumber = 'PortMirrorSessionSequenceNumber',
  PreconfigurationTemplate = 'PreconfigurationTemplate',
  Price = 'Price',
  PriceTable = 'PriceTable',
  PrimaryStorage = 'PrimaryStorage',
  PrimaryStorageCapacity = 'PrimaryStorageCapacity',
  PubIpVipBandwidthInBilling = 'PubIpVipBandwidthInBilling',
  PubIpVipBandwidthOutBilling = 'PubIpVipBandwidthOutBilling',
  PubIpVipBandwidthUsage = 'PubIpVipBandwidthUsage',
  PubIpVipBandwidthUsageHistory = 'PubIpVipBandwidthUsageHistory',
  PubIpVmNicBandwidthInBilling = 'PubIpVmNicBandwidthInBilling',
  PubIpVmNicBandwidthOutBilling = 'PubIpVmNicBandwidthOutBilling',
  PubIpVmNicBandwidthUsage = 'PubIpVmNicBandwidthUsage',
  PubIpVmNicBandwidthUsageHistory = 'PubIpVmNicBandwidthUsageHistory',
  PublishApp = 'PublishApp',
  QuartzJdbcJob = 'QuartzJdbcJob',
  Quota = 'Quota',
  RaidController = 'RaidController',
  RaidPhysicalDrive = 'RaidPhysicalDrive',
  RegisterLicenseApplication = 'RegisterLicenseApplication',
  RemovalInstanceRule = 'RemovalInstanceRule',
  ReplayMessage = 'ReplayMessage',
  Resource = 'Resource',
  ResourceAttributeKey = 'ResourceAttributeKey',
  ResourceConfig = 'ResourceConfig',
  ResourceStack = 'ResourceStack',
  Role = 'Role',
  RolePolicyStatement = 'RolePolicyStatement',
  RootVolumeBilling = 'RootVolumeBilling',
  RootVolumeUsage = 'RootVolumeUsage',
  RootVolumeUsageExtension = 'RootVolumeUsageExtension',
  RootVolumeUsageHistory = 'RootVolumeUsageHistory',
  RouterArea = 'RouterArea',
  SNSApplicationEndpoint = 'SNSApplicationEndpoint',
  SNSApplicationPlatform = 'SNSApplicationPlatform',
  SNSDingTalkAtPerson = 'SNSDingTalkAtPerson',
  SNSDingTalkEndpoint = 'SNSDingTalkEndpoint',
  SNSEmailAddress = 'SNSEmailAddress',
  SNSEmailEndpoint = 'SNSEmailEndpoint',
  SNSEmailPlatform = 'SNSEmailPlatform',
  SNSEndpointThirdpartyAlertHistory = 'SNSEndpointThirdpartyAlertHistory',
  SNSHttpEndpoint = 'SNSHttpEndpoint',
  SNSMicrosoftTeamsEndpoint = 'SNSMicrosoftTeamsEndpoint',
  SNSSmsEndpoint = 'SNSSmsEndpoint',
  SNSSmsReceiver = 'SNSSmsReceiver',
  SNSSnmpEndpoint = 'SNSSnmpEndpoint',
  SNSSubscriber = 'SNSSubscriber',
  SNSTextTemplate = 'SNSTextTemplate',
  SNSTopic = 'SNSTopic',
  SSOClient = 'SSOClient',
  SSORedirectTemplate = 'SSORedirectTemplate',
  SSOToken = 'SSOToken',
  Scheduler = 'Scheduler',
  SchedulerJob = 'SchedulerJob',
  SchedulerJobGroup = 'SchedulerJobGroup',
  SchedulerJobHistory = 'SchedulerJobHistory',
  SchedulerTrigger = 'SchedulerTrigger',
  ScsiLun = 'ScsiLun',
  SdnController = 'SdnController',
  SecretResourcePool = 'SecretResourcePool',
  SecurityGroup = 'SecurityGroup',
  SecurityGroupFailureHost = 'SecurityGroupFailureHost',
  SecurityGroupRule = 'SecurityGroupRule',
  SecurityGroupSequenceNumber = 'SecurityGroupSequenceNumber',
  SecurityMachine = 'SecurityMachine',
  Session = 'Session',
  SftpBackupStorage = 'SftpBackupStorage',
  SharedBlock = 'SharedBlock',
  SharedBlockCapacity = 'SharedBlockCapacity',
  SharedBlockGroup = 'SharedBlockGroup',
  SharedResource = 'SharedResource',
  SimulatorHost = 'SimulatorHost',
  SlbGroup = 'SlbGroup',
  SlbLoadBalancer = 'SlbLoadBalancer',
  SlbOffering = 'SlbOffering',
  SlbVmInstance = 'SlbVmInstance',
  SnapShotUsage = 'SnapShotUsage',
  SnmpTrap = 'SnmpTrap',
  StackTemplate = 'StackTemplate',
  SystemRole = 'SystemRole',
  SystemTag = 'SystemTag',
  TagPattern = 'TagPattern',
  TaskProgress = 'TaskProgress',
  TemplateConfig = 'TemplateConfig',
  TemplateCustomParam = 'TemplateCustomParam',
  ThirdpartyOriginalAlert = 'ThirdpartyOriginalAlert',
  ThirdpartyPlatform = 'ThirdpartyPlatform',
  Ticket = 'Ticket',
  TicketFlow = 'TicketFlow',
  TicketFlowCollection = 'TicketFlowCollection',
  TicketStatusHistory = 'TicketStatusHistory',
  TicketType = 'TicketType',
  TwoFactorAuthenticationSecret = 'TwoFactorAuthenticationSecret',
  UKeyLicense = 'UKeyLicense',
  Update = 'Update',
  UsbDevice = 'UsbDevice',
  UsedIp = 'UsedIp',
  User = 'User',
  UserGroup = 'UserGroup',
  UserTag = 'UserTag',
  V2VConversionCache = 'V2VConversionCache',
  V2VConversionHost = 'V2VConversionHost',
  VCenter = 'VCenter',
  VCenterBackupStorage = 'VCenterBackupStorage',
  VCenterCluster = 'VCenterCluster',
  VCenterDatacenter = 'VCenterDatacenter',
  VCenterPrimaryStorage = 'VCenterPrimaryStorage',
  VCenterResourcePool = 'VCenterResourcePool',
  VCenterResourcePoolUsage = 'VCenterResourcePoolUsage',
  VRouterRouteEntry = 'VRouterRouteEntry',
  VRouterRouteTable = 'VRouterRouteTable',
  Vip = 'Vip',
  VipQos = 'VipQos',
  VirtualBorderRouter = 'VirtualBorderRouter',
  VirtualRouterBootstrapIso = 'VirtualRouterBootstrapIso',
  VirtualRouterMetadata = 'VirtualRouterMetadata',
  VirtualRouterOffering = 'VirtualRouterOffering',
  VirtualRouterSoftwareVersion = 'VirtualRouterSoftwareVersion',
  VirtualRouterVip = 'VirtualRouterVip',
  VirtualRouterVm = 'VirtualRouterVm',
  VmCPUBilling = 'VmCPUBilling',
  VmCdRom = 'VmCdRom',
  VmCrashHistory = 'VmCrashHistory',
  VmInstance = 'VmInstance',
  VmInstanceDeviceAddress = 'VmInstanceDeviceAddress',
  VmInstanceDeviceAddressArchive = 'VmInstanceDeviceAddressArchive',
  VmInstanceDeviceAddressGroup = 'VmInstanceDeviceAddressGroup',
  VmInstanceNumaNode = 'VmInstanceNumaNode',
  VmInstanceSequenceNumber = 'VmInstanceSequenceNumber',
  VmMemoryBilling = 'VmMemoryBilling',
  VmNic = 'VmNic',
  VmNicSecurityPolicy = 'VmNicSecurityPolicy',
  VmPriorityConfig = 'VmPriorityConfig',
  VmSchedHistory = 'VmSchedHistory',
  VmSchedulingRule = 'VmSchedulingRule',
  VmSchedulingRuleGroup = 'VmSchedulingRuleGroup',
  VmUsage = 'VmUsage',
  VmUsageHistory = 'VmUsageHistory',
  VmVdpaNic = 'VmVdpaNic',
  VmVfNic = 'VmVfNic',
  VniRange = 'VniRange',
  Volume = 'Volume',
  VolumeBackup = 'VolumeBackup',
  VolumeBackupHistory = 'VolumeBackupHistory',
  VolumeSnapshot = 'VolumeSnapshot',
  VolumeSnapshotGroup = 'VolumeSnapshotGroup',
  VolumeSnapshotReference = 'VolumeSnapshotReference',
  VolumeSnapshotReferenceTree = 'VolumeSnapshotReferenceTree',
  VolumeSnapshotTree = 'VolumeSnapshotTree',
  VpcFirewall = 'VpcFirewall',
  VpcFirewallIpSetTemplate = 'VpcFirewallIpSetTemplate',
  VpcFirewallRule = 'VpcFirewallRule',
  VpcFirewallRuleSet = 'VpcFirewallRuleSet',
  VpcFirewallRuleTemplate = 'VpcFirewallRuleTemplate',
  VpcHaGroup = 'VpcHaGroup',
  VpcHaGroupMonitorIp = 'VpcHaGroupMonitorIp',
  VpcRouterDns = 'VpcRouterDns',
  VpcRouterVm = 'VpcRouterVm',
  VpcSnatState = 'VpcSnatState',
  VpcUserVpnGateway = 'VpcUserVpnGateway',
  VpcVirtualRouteEntry = 'VpcVirtualRouteEntry',
  VpcVirtualRouter = 'VpcVirtualRouter',
  VpcVpnConnection = 'VpcVpnConnection',
  VpcVpnGateway = 'VpcVpnGateway',
  VpcVpnIkeConfig = 'VpcVpnIkeConfig',
  VpcVpnIpSecConfig = 'VpcVpnIpSecConfig',
  Vtep = 'Vtep',
  VxlanClusterMapping = 'VxlanClusterMapping',
  VxlanHostMapping = 'VxlanHostMapping',
  VxlanNetwork = 'VxlanNetwork',
  VxlanNetworkPool = 'VxlanNetworkPool',
  Webhook = 'Webhook',
  WorkFlow = 'WorkFlow',
  WorkFlowChain = 'WorkFlowChain',
  XDragonHost = 'XDragonHost',
  ZBox = 'ZBox',
  ZBoxBackup = 'ZBoxBackup',
  Zone = 'Zone',
  person = 'person'
}

export enum ResourceStackStatus {
  Created = 'Created',
  Creating = 'Creating',
  Deleted = 'Deleted',
  Deleting = 'Deleting',
  Failed = 'Failed',
  Initial = 'Initial',
  Rollbacked = 'Rollbacked',
  Rollbacking = 'Rollbacking'
}

export enum ResourceTypeVO {
  BareMetalChassisVO = 'BareMetalChassisVO',
  BareMetalInstanceVO = 'BareMetalInstanceVO',
  ClusterVO = 'ClusterVO',
  HostVO = 'HostVO',
  VmInstanceVO = 'VmInstanceVO',
  ZoneVO = 'ZoneVO'
}

export enum SNSApplicationPlatformState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum SchedTypes {
  HMT = 'HMT',
  VMHA = 'VMHA'
}

export enum SchedulerJobGroupQueryType {
  GetVMAttachableBackupJob = 'GetVMAttachableBackupJob',
  GetVmByZoneAndDatabase = 'GetVmByZoneAndDatabase',
  GetVolumeAttachableBackupJob = 'GetVolumeAttachableBackupJob',
  NORMAL = 'NORMAL'
}

export enum SchedulerJobGroupState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum SchedulerJobGroupType {
  databaseBackup = 'databaseBackup',
  rebootVm = 'rebootVm',
  rootVolumeBackup = 'rootVolumeBackup',
  startVm = 'startVm',
  stopVm = 'stopVm',
  vmBackup = 'vmBackup',
  volumeBackup = 'volumeBackup',
  volumeSnapshot = 'volumeSnapshot'
}

export enum SchedulerJobHistoryGroupByFireInstanceIdQueryType {
  NORMAL = 'NORMAL',
  OVERVIEW = 'OVERVIEW'
}

export enum SchedulerJobHistoryQueryType {
  NORMAL = 'NORMAL'
}

export enum SchedulerJobQueryType {
  DatabaseBackupJob = 'DatabaseBackupJob',
  GetCandidateForScheduler = 'GetCandidateForScheduler',
  Normal = 'Normal'
}

export enum SchedulerJobState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum SchedulerJobStateEvent {
  disable = 'disable',
  enable = 'enable'
}

export enum SchedulerJobType {
  databaseBackup = 'databaseBackup',
  localRaidSelfTest = 'localRaidSelfTest',
  rebootVm = 'rebootVm',
  rootVolumeBackup = 'rootVolumeBackup',
  startVm = 'startVm',
  stopVm = 'stopVm',
  vmBackup = 'vmBackup',
  volumeBackup = 'volumeBackup',
  volumeSnapshot = 'volumeSnapshot',
  volumeSnapshotGroup = 'volumeSnapshotGroup'
}

export enum SchedulerType {
  cron = 'cron',
  simple = 'simple'
}

export enum ScriptEncodingType {
  Base64 = 'Base64',
  PlainText = 'PlainText'
}

export enum ScriptExecuteRecordDetailStatus {
  Completed = 'Completed',
  Failed = 'Failed',
  Running = 'Running',
  Uploading = 'Uploading'
}

export enum ScriptExecuteRecordStatus {
  Exception = 'Exception',
  Failed = 'Failed',
  Running = 'Running',
  Succeed = 'Succeed'
}

export enum ScriptType {
  Bat = 'Bat',
  Perl = 'Perl',
  Powershell = 'Powershell',
  Python = 'Python',
  Shell = 'Shell'
}

export enum ScsiLunQueryType {
  GetScsiLunCandidatesForAttachingVm = 'GetScsiLunCandidatesForAttachingVm',
  GetScsiLunCandidatesForAttachingZSVInstanceByCluster = 'GetScsiLunCandidatesForAttachingZSVInstanceByCluster',
  GetScsiLunCandidatesForAttachingZSVInstanceByHost = 'GetScsiLunCandidatesForAttachingZSVInstanceByHost',
  GetSharedBlockCandidate = 'GetSharedBlockCandidate',
  Normal = 'Normal'
}

export enum SecretResourcePoolModel {
  AiSiNo = 'AiSiNo',
  FlkSec = 'FlkSec',
  HaiTai = 'HaiTai',
  InfoSec = 'InfoSec'
}

export enum SecretResourcePoolQueryType {
  GetSrpCandidateSecyMach = 'GetSrpCandidateSecyMach',
  Normal = 'Normal'
}

export enum SecretResourcePoolState {
  Activated = 'Activated',
  Unactivated = 'Unactivated'
}

export enum SecretResourcePoolStatus {
  Connected = 'Connected',
  Disconnected = 'Disconnected'
}

export enum SecretResourceUKeyType {
  HaiTai = 'HaiTai',
  ZJCABlue = 'ZJCABlue',
  ZJCAWhite = 'ZJCAWhite'
}

export enum SecretServerQueryType {
  Normal = 'Normal'
}

export enum SecurityGroupQueryType {
  ALL = 'ALL',
  Account = 'Account',
  GetIAM2ProjectCandidateDefaultSecurityGroup = 'GetIAM2ProjectCandidateDefaultSecurityGroup',
  GetVmNicCandidateSecurityGroup = 'GetVmNicCandidateSecurityGroup',
  Normal = 'Normal'
}

export enum SecurityGroupRulePolicy {
  ACCEPT = 'ACCEPT',
  DROP = 'DROP'
}

export enum SecurityGroupRuleProtocolType {
  ALL = 'ALL',
  ICMP = 'ICMP',
  TCP = 'TCP',
  UDP = 'UDP'
}

export enum SecurityGroupRuleState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum SecurityGroupRuleType {
  Egress = 'Egress',
  Ingress = 'Ingress'
}

export enum SecurityGroupState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum SecurityGroupStateEvent {
  disable = 'disable',
  enable = 'enable'
}

export enum SecurityMachineKeyType {
  Active = 'Active',
  EncryptPublicKey = 'EncryptPublicKey',
  EncryptSubjectDN = 'EncryptSubjectDN',
  Hmac = 'Hmac',
  Protect = 'Protect'
}

export enum SecurityMachineQueryType {
  Normal = 'Normal'
}

export enum SecurityMachineState {
  Disabled = 'Disabled',
  Enabled = 'Enabled',
  Exception = 'Exception'
}

export enum SecurityMachineStatus {
  Synced = 'Synced',
  Unsynced = 'Unsynced'
}

export enum SecurityMachineType {
  CloudSecurityMachine = 'CloudSecurityMachine',
  CloudSecurityResourceService = 'CloudSecurityResourceService',
  OrdinarySecurityMachine = 'OrdinarySecurityMachine'
}

export enum ShareType {
  Group = 'Group',
  None = 'None',
  Public = 'Public'
}

export enum SharedBlockGroupType {
  LvmVolumeGroupBasic = 'LvmVolumeGroupBasic'
}

export enum SharedBlockState {
  Deleting = 'Deleting',
  Disabled = 'Disabled',
  Enabled = 'Enabled',
  Maintenance = 'Maintenance'
}

export enum SharedBlockStatus {
  Connected = 'Connected',
  Connecting = 'Connecting',
  Disconnected = 'Disconnected'
}

export enum SmsReceiverType {
  AliyunSms = 'AliyunSms'
}

export enum SnapshotFormat {
  qcow2 = 'qcow2',
  raw = 'raw'
}

export enum SnapshotGroupType {
  Hypervisor = 'Hypervisor',
  Storage = 'Storage'
}

export enum SnapshotQueryType {
  BareMetal2 = 'BareMetal2',
  VM = 'VM',
  VOLUME = 'VOLUME'
}

export enum SnapshotType {
  Group = 'Group',
  Single = 'Single'
}

export enum SnmpTrapReceiverQueryType {
  Normal = 'Normal'
}

export enum SortDirectionValidValues {
  asc = 'asc',
  desc = 'desc'
}

export enum SshKeyPairQueryType {
  GetAttachableSshKeyPairForVmInstance = 'GetAttachableSshKeyPairForVmInstance',
  GetDetachableSshKeyPairForVmInstance = 'GetDetachableSshKeyPairForVmInstance',
  NORMAL = 'NORMAL'
}

export enum StackEventStatus {
  Failed = 'Failed',
  Finish = 'Finish',
  RollbackFailed = 'RollbackFailed',
  RollbackFinish = 'RollbackFinish',
  RollbackStart = 'RollbackStart',
  Start = 'Start'
}

export enum StackTemplateQueryType {
  Custom = 'Custom',
  Example = 'Example',
  Normal = 'Normal',
  Self = 'Self',
  Share = 'Share'
}

export enum State {
  Disabled = 'Disabled',
  Enabled = 'Enabled',
  Staled = 'Staled'
}

export enum StateEvent {
  disable = 'disable',
  enable = 'enable'
}

export enum SystemTagActionType {
  Create = 'Create',
  Delete = 'Delete',
  Update = 'Update'
}

export enum TagQueryType {
  GetTagWhenCreateResource = 'GetTagWhenCreateResource',
  NORMAL = 'NORMAL'
}

export enum TaskProgressQueryType {
  NORMAL = 'NORMAL'
}

export enum TelemetryConsentAction {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum ThirdPartyAlertsQueryType {
  AlarmRecord = 'AlarmRecord',
  EndpointRecord = 'EndpointRecord',
  Normal = 'Normal',
  ZCEX = 'ZCEX'
}

export enum TimeServerStatus {
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  Unknown = 'Unknown'
}

export enum TransportType {
  FC = 'FC',
  RDMA = 'RDMA',
  TCP = 'TCP'
}

export enum TrashQueryType {
  BackupStorage = 'BackupStorage',
  PrimaryStorage = 'PrimaryStorage'
}

export enum TrashType {
  MigrateImage = 'MigrateImage',
  MigrateVolume = 'MigrateVolume',
  MigrateVolumeSnapshot = 'MigrateVolumeSnapshot',
  ReimageVolume = 'ReimageVolume',
  RevertVolume = 'RevertVolume',
  VolumeSnapshot = 'VolumeSnapshot'
}

export enum TrustState {
  KMS_TRUSTS_MN_ONLY = 'KMS_TRUSTS_MN_ONLY',
  MN_TRUSTS_KMS_ONLY = 'MN_TRUSTS_KMS_ONLY',
  MUTUAL_TRUSTED = 'MUTUAL_TRUSTED',
  MUTUAL_UNTRUSTED = 'MUTUAL_UNTRUSTED'
}

export enum TwoFactorAuthenticationSecretStatus {
  Logined = 'Logined',
  NewCreated = 'NewCreated'
}

export enum UIExtendedLicenseType {
  AddOn = 'AddOn',
  Basic = 'Basic',
  Community = 'Community',
  Expired = 'Expired',
  Free = 'Free',
  Hybrid = 'Hybrid',
  HybridTrialExt = 'HybridTrialExt',
  OEM = 'OEM',
  Paid = 'Paid',
  Standard = 'Standard',
  Trial = 'Trial',
  TrialExt = 'TrialExt'
}

export enum UKeyStatus {
  Abnormal = 'Abnormal',
  Fault = 'Fault',
  Missing = 'Missing',
  Ready = 'Ready'
}

export enum UpdateHostPowerStatus {
  PowerOff = 'PowerOff',
  PowerOn = 'PowerOn',
  PowerReboot = 'PowerReboot'
}

export enum UplinkGroupQueryType {
  Normal = 'Normal'
}

export enum UplinkGroupType {
  Bonding = 'Bonding',
  PhysicalInterface = 'PhysicalInterface'
}

export enum UsbDeviceQueryType {
  AttachableUsb = 'AttachableUsb',
  Cluster = 'Cluster',
  Host = 'Host',
  Normal = 'Normal',
  ZSVAttachablePassThroughUsb = 'ZSVAttachablePassThroughUsb',
  ZSVAttachableRedirectUsb = 'ZSVAttachableRedirectUsb',
  ZSVPassThroughUsb = 'ZSVPassThroughUsb',
  ZSVRedirectUsb = 'ZSVRedirectUsb'
}

export enum UsbDeviceState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum UserGroupQueryType {
  GET_USERGROUP_BY_ACCOUNT = 'GET_USERGROUP_BY_ACCOUNT',
  GET_USERGROUP_BY_NOT_ACCOUNT = 'GET_USERGROUP_BY_NOT_ACCOUNT',
  GET_USERGROUP_BY_NOT_SHARED = 'GET_USERGROUP_BY_NOT_SHARED',
  GET_USERGROUP_BY_ROLE = 'GET_USERGROUP_BY_ROLE',
  GET_USERGROUP_BY_SHARED = 'GET_USERGROUP_BY_SHARED',
  Normal = 'Normal'
}

export enum VGpuDeviceType {
  MdevDevice = 'MdevDevice',
  PciDevice = 'PciDevice'
}

export enum VGpuType {
  MdevDevice = 'MdevDevice',
  PciDevice = 'PciDevice'
}

export enum VRouterRouteEntryType {
  UserBlackHole = 'UserBlackHole',
  UserStatic = 'UserStatic'
}

export enum VmBackupTaskType {
  BackupTask = 'BackupTask',
  CdpTask = 'CdpTask'
}

export enum VmBootDevice {
  CdRom = 'CdRom',
  HardDisk = 'HardDisk',
  Network = 'Network'
}

export enum VmCreationStrategy {
  CreateStopped = 'CreateStopped',
  CreatedPaused = 'CreatedPaused',
  InstantStart = 'InstantStart',
  JustCreate = 'JustCreate'
}

export enum VmGroupQueryType {
  GetCandidateForCreateAutoScalingGroupVmTemplate = 'GetCandidateForCreateAutoScalingGroupVmTemplate',
  Normal = 'Normal'
}

export enum VmInstancePerformanceMetricType {
  CPUAverageUsedUtilization = 'CPUAverageUsedUtilization',
  DiskAllFreeCapacityInPercent = 'DiskAllFreeCapacityInPercent',
  DiskAllReadBytes = 'DiskAllReadBytes',
  DiskAllReadOps = 'DiskAllReadOps',
  DiskAllUsedCapacityInPercent = 'DiskAllUsedCapacityInPercent',
  DiskAllWriteBytes = 'DiskAllWriteBytes',
  DiskAllWriteOps = 'DiskAllWriteOps',
  DiskFreeCapacityInPercent = 'DiskFreeCapacityInPercent',
  DiskUsedCapacityInPercent = 'DiskUsedCapacityInPercent',
  MemoryUsedInPercent = 'MemoryUsedInPercent',
  NetworkAllInBytes = 'NetworkAllInBytes',
  NetworkAllInErrors = 'NetworkAllInErrors',
  NetworkAllInPackets = 'NetworkAllInPackets',
  NetworkAllOutBytes = 'NetworkAllOutBytes',
  NetworkAllOutErrors = 'NetworkAllOutErrors',
  NetworkAllOutPackets = 'NetworkAllOutPackets',
  OperatingSystemCPUAverageIdleUtilization = 'OperatingSystemCPUAverageIdleUtilization',
  OperatingSystemCPUAverageSystemUtilization = 'OperatingSystemCPUAverageSystemUtilization',
  OperatingSystemCPUAverageUsedUtilization = 'OperatingSystemCPUAverageUsedUtilization',
  OperatingSystemCPUAverageUserUtilization = 'OperatingSystemCPUAverageUserUtilization',
  OperatingSystemCPUAverageWaitUtilization = 'OperatingSystemCPUAverageWaitUtilization',
  OperatingSystemMemoryFreePercent = 'OperatingSystemMemoryFreePercent',
  OperatingSystemMemoryUsedPercent = 'OperatingSystemMemoryUsedPercent',
  VRouterCPUAverageIdleUtilization = 'VRouterCPUAverageIdleUtilization',
  VRouterCPUAverageSystemUtilization = 'VRouterCPUAverageSystemUtilization',
  VRouterCPUAverageUserUtilization = 'VRouterCPUAverageUserUtilization',
  VRouterCPUAverageWaitUtilization = 'VRouterCPUAverageWaitUtilization',
  VRouterCPUUsedUtilization = 'VRouterCPUUsedUtilization',
  VRouterDiskAllFreeCapacityInPercent = 'VRouterDiskAllFreeCapacityInPercent',
  VRouterDiskUsedCapacityInPercent = 'VRouterDiskUsedCapacityInPercent',
  VRouterMemoryFreePercent = 'VRouterMemoryFreePercent',
  VRouterMemoryUsedPercent = 'VRouterMemoryUsedPercent'
}

export enum VmInstanceQemuState {
  Matched = 'Matched',
  Unknown = 'Unknown',
  Unmatched = 'Unmatched'
}

export enum VmInstanceSchedulingState {
  Conflict = 'Conflict',
  Invalid = 'Invalid',
  Normal = 'Normal'
}

export enum VmInstanceState {
  Crashed = 'Crashed',
  Created = 'Created',
  Destroyed = 'Destroyed',
  Destroying = 'Destroying',
  Error = 'Error',
  Expunging = 'Expunging',
  Migrating = 'Migrating',
  NoState = 'NoState',
  Paused = 'Paused',
  Pausing = 'Pausing',
  Rebooting = 'Rebooting',
  Resuming = 'Resuming',
  Running = 'Running',
  Starting = 'Starting',
  Stopped = 'Stopped',
  Stopping = 'Stopping',
  Unknown = 'Unknown',
  VolumeMigrating = 'VolumeMigrating',
  VolumeRecovering = 'VolumeRecovering'
}

export enum VmNicQueryType {
  CandidateVmNicForAttachEip = 'CandidateVmNicForAttachEip',
  CandidateVmNicForSecurityGroup = 'CandidateVmNicForSecurityGroup',
  GetPortForwardingAttachableVmNics = 'GetPortForwardingAttachableVmNics',
  PortMirrorCandidateVmNics = 'PortMirrorCandidateVmNics',
  VmNicInSecurityGroup = 'VmNicInSecurityGroup'
}

export enum VmNicSecurityPolicyEnum {
  ALLOW = 'ALLOW',
  DENY = 'DENY'
}

export enum VmQueryType {
  Account = 'Account',
  GetAffinityGroupAttachableVM = 'GetAffinityGroupAttachableVM',
  GetBackupJobAttachableVM = 'GetBackupJobAttachableVM',
  GetCandidatesForSnapshotStrategy = 'GetCandidatesForSnapshotStrategy',
  GetCandidatesVmForAttachSshKeyPair = 'GetCandidatesVmForAttachSshKeyPair',
  GetCandidatesVmForCreateVmSnapshot = 'GetCandidatesVmForCreateVmSnapshot',
  GetCandidatesVmForCreateVmSnapshotGroup = 'GetCandidatesVmForCreateVmSnapshotGroup',
  GetCandidatesVmForCreateVmSnapshotGroupJob = 'GetCandidatesVmForCreateVmSnapshotGroupJob',
  GetCandidatesVmForCreateVmSnapshotJob = 'GetCandidatesVmForCreateVmSnapshotJob',
  GetCandidatesVmForDetachSshKeyPair = 'GetCandidatesVmForDetachSshKeyPair',
  GetCdpTaskAttachableVM = 'GetCdpTaskAttachableVM',
  GetDataVolumeAttachableVm = 'GetDataVolumeAttachableVm',
  GetInstanceWithSnapshotGroup = 'GetInstanceWithSnapshotGroup',
  GetInstanceWithSnapshotStrategy = 'GetInstanceWithSnapshotStrategy',
  GetKeyProviderRelatedResource = 'GetKeyProviderRelatedResource',
  GetVmBySchedulerJobGroup = 'GetVmBySchedulerJobGroup',
  GetVmByVmGroup = 'GetVmByVmGroup',
  GetVmCandidatesForAddToVmGroup = 'GetVmCandidatesForAddToVmGroup',
  GetVmCandidatesForAttachingScsiLun = 'GetVmCandidatesForAttachingScsiLun',
  GetVmCandidatesForDetachScsiLun = 'GetVmCandidatesForDetachScsiLun',
  GetVmCandidatesForPortMirror = 'GetVmCandidatesForPortMirror',
  GetVmForPortForwardingAttachVmNic = 'GetVmForPortForwardingAttachVmNic',
  GetVmInstanceTemplate = 'GetVmInstanceTemplate',
  GetVmInstanceTemplateRelatedVM = 'GetVmInstanceTemplateRelatedVM',
  Get_VMINSTANCETEMPLATE_BY_NOT_SHARED_RESOURCE = 'Get_VMINSTANCETEMPLATE_BY_NOT_SHARED_RESOURCE',
  Get_VMINSTANCETEMPLATE_BY_SHARED_RESOURCE = 'Get_VMINSTANCETEMPLATE_BY_SHARED_RESOURCE',
  Normal = 'Normal',
  Se = 'Se',
  ZSV_NOT_SHARED_RESOURCE = 'ZSV_NOT_SHARED_RESOURCE',
  ZSV_SHARED_RESOURCE = 'ZSV_SHARED_RESOURCE',
  eipAttachCandidate = 'eipAttachCandidate'
}

export enum VmSchedulingRuleMode {
  HARD = 'HARD',
  SOFT = 'SOFT'
}

export enum VmSchedulingRuleQueryType {
  AssociateHostGroup = 'AssociateHostGroup',
  AssociateVmGroup = 'AssociateVmGroup',
  Normal = 'Normal'
}

export enum VmSchedulingRuleRule {
  AFFINITY = 'AFFINITY',
  ANTIAFFINITY = 'ANTIAFFINITY'
}

export enum VmSchedulingRuleState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum VmSpecPlatform {
  Linux = 'Linux',
  Windows = 'Windows'
}

export enum VmTemplateQueryType {
  NORMAL = 'NORMAL',
  ZSV_SHARED_RESOURCE = 'ZSV_SHARED_RESOURCE'
}

export enum VolumeBackupDataSummaryQueryType {
  VmInstance = 'VmInstance',
  Volume = 'Volume'
}

export enum VolumeBackupTaskType {
  BackupJob = 'BackupJob',
  OtherTasks = 'OtherTasks'
}

export enum VolumeProvisioningStrategy {
  ThickProvisioning = 'ThickProvisioning',
  ThinProvisioning = 'ThinProvisioning'
}

export enum VolumeQosMode {
  all = 'all',
  overwrite = 'overwrite',
  read = 'read',
  total = 'total',
  write = 'write'
}

export enum VolumeQueryType {
  GET_VM_ATTACHABLE_DATA_VOLUME = 'GET_VM_ATTACHABLE_DATA_VOLUME',
  GET_VM_ATTACHABLE_NOT_SNAPSHOT_DATA_VOLUME = 'GET_VM_ATTACHABLE_NOT_SNAPSHOT_DATA_VOLUME',
  GET_VOLUME_BY_ACCOUNT = 'GET_VOLUME_BY_ACCOUNT',
  GET_VOLUME_BY_NOT_SNAPSHOT = 'GET_VOLUME_BY_NOT_SNAPSHOT',
  GET_VOLUME_BY_VMINSTANCE_UUID = 'GET_VOLUME_BY_VMINSTANCE_UUID',
  GetBackupJobAndCdpTaskAttachableVolume = 'GetBackupJobAndCdpTaskAttachableVolume',
  GetCandidatesVolumeForCreateVolumeSnapshot = 'GetCandidatesVolumeForCreateVolumeSnapshot',
  GetCandidatesVolumeForCreateVolumeSnapshotJob = 'GetCandidatesVolumeForCreateVolumeSnapshotJob',
  GetTagAttachableVolume = 'GetTagAttachableVolume',
  GetVolumeBySchedulerJobGroup = 'GetVolumeBySchedulerJobGroup',
  GetVolumeByVMAndHostForEditVM = 'GetVolumeByVMAndHostForEditVM',
  NORMAL = 'NORMAL'
}

export enum VolumeState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export enum VolumeStateEvent {
  disable = 'disable',
  enable = 'enable'
}

export enum VolumeStatus {
  Creating = 'Creating',
  Deleted = 'Deleted',
  Migrating = 'Migrating',
  NotInstantiated = 'NotInstantiated',
  Ready = 'Ready'
}

export enum VolumeType {
  Cache = 'Cache',
  Data = 'Data',
  Memory = 'Memory',
  NvRam = 'NvRam',
  Root = 'Root',
  Template = 'Template',
  TpmState = 'TpmState'
}

export enum WithMemoryByResourceType {
  L2NetworkVO = 'L2NetworkVO',
  L3NetworkVO = 'L3NetworkVO'
}

export enum XmlHookType {
  Customization = 'Customization',
  System = 'System'
}

export enum ZSVBackupStorageQueryType {
  Normal = 'Normal'
}

export enum ZWatchAlarmQueryType {
  Event = 'Event',
  MonitorGroupEvent = 'MonitorGroupEvent',
  MonitorGroupResource = 'MonitorGroupResource',
  Resource = 'Resource',
  Thirdparty = 'Thirdparty',
  ZCEX = 'ZCEX',
  ZwatchEndpoint = 'ZwatchEndpoint'
}

export enum ZoneStateEvent {
  disable = 'disable',
  enable = 'enable'
}

export enum ZsvRoleQueryType {
  Customized = 'Customized',
  GET_ROLE_BY_ACCOUNT = 'GET_ROLE_BY_ACCOUNT',
  GET_ROLE_BY_USERGROUP = 'GET_ROLE_BY_USERGROUP',
  GET_ROLE_FOR_MANAGEMENT = 'GET_ROLE_FOR_MANAGEMENT',
  GET_ROLE_FOR_MANAGEMENT_WITH_ACCOUNT_AND_USERGROUP = 'GET_ROLE_FOR_MANAGEMENT_WITH_ACCOUNT_AND_USERGROUP',
  GET_ROLE_FOR_MANAGEMENT_WITH_PREDEFINED_SYSTEM_ACCOUNT = 'GET_ROLE_FOR_MANAGEMENT_WITH_PREDEFINED_SYSTEM_ACCOUNT',
  Normal = 'Normal',
  Predefined = 'Predefined'
}

export enum l2NetworkType {
  HardwareVxlanNetwork = 'HardwareVxlanNetwork',
  L2NoVlanNetwork = 'L2NoVlanNetwork',
  L2VlanNetwork = 'L2VlanNetwork',
  PortGroup = 'PortGroup',
  VirtualSwitch = 'VirtualSwitch',
  VxlanNetwork = 'VxlanNetwork',
  VxlanNetworkPool = 'VxlanNetworkPool'
}
