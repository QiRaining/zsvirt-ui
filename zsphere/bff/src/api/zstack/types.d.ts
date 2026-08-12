export interface AccessControlListEntryInventory {
  uuid?: string;
  aclUuid?: string;
  type?: string;
  name?: string;
  domain?: string;
  url?: string;
  ipEntries?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AccessControlListInventory {
  uuid?: string;
  name?: string;
  ipVersion?: number;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
  entries?: any[];
}

export interface AccessControlRuleInventory {
  uuid?: string;
  name?: string;
  description?: string;
  rule?: string;
  strategy?: ControlStrategy;
  createDate?: string;
  lastOpDate?: string;
}

export interface AccessKeyInventory {
  uuid?: string;
  description?: string;
  accountUuid?: string;
  userUuid?: string;
  AccessKeyID?: string;
  AccessKeySecret?: string;
  state?: AccessKeyState;
  createDate?: string;
  lastOpDate?: string;
}

export interface AccessKeyState {}

export interface PciDeviceInventory {
  uuid?: string;
  name?: string;
  description?: string;
  hostUuid?: string;
  parentUuid?: string;
  vmInstanceUuid?: string;
  pciSpecUuid?: string;
  type?: PciDeviceType;
  state?: PciDeviceState;
  status?: PciDeviceStatus;
  virtStatus?: PciDeviceVirtStatus;
  passThroughState?: any;
  chooser?: PciDeviceChooser;
  vendorId?: string;
  vendor?: string;
  deviceId?: string;
  device?: string;
  subvendorId?: string;
  subdeviceId?: string;
  pciDeviceAddress?: string;
  iommuGroup?: string;
  metaData?: any;
  createDate?: string;
  lastOpDate?: string;
  matchedPciDeviceOfferingRef?: any[];
  mdevSpecRefs?: any[];
}

export interface AccessPathInfo {
  name?: string;
  accessPathId?: number;
  accessPathIqn?: string;
  targetCount?: number;
  gatewayIps?: any[];
}

export interface AccountGroupInventory {
  uuid?: string;
  name?: string;
  description?: string;
  parentUuid?: string;
  rootGroupUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AccountGroupResourceView {
  groupUuid?: string;
  groupName?: string;
  resources?: any[];
}

export interface AccountGroupRoleView {
  groupUuid?: string;
  groupName?: string;
  roles?: any[];
}

export interface AccountGroupSharingView {
  uuid?: string;
}

export interface AccountGroupView {
  groupUuid?: string;
  groupName?: string;
  inventory?: AccountGroupInventory;
  accounts?: any[];
  groups?: any[];
}

export interface AccountInventory {
  uuid?: string;
  name?: string;
  description?: string;
  type?: string;
  source?: string;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AccountPriceTableRefInventory {
  accountUuid?: string;
  tableUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AccountResourceRefInventory {
  accountUuid?: string;
  resourceUuid?: string;
  resourceType?: string;
  accountPermissionFrom?: string;
  resourcePermissionFrom?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AccountSharingView {
  uuid?: string;
}

export interface AccountThirdPartyAccountSourceRefInventory {
  id?: number;
  credentials?: string;
  accountSourceUuid?: string;
  accountUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ActionParam {
  actionUuid?: string;
  actionType?: string;
}

export interface ActionStruct {
  resourceName?: string;
  actionName?: string;
  round?: number;
  inDegree?: any;
  actions?: any;
  error?: string;
}

export interface ActiveAlarmInventory {
  templateUuid?: string;
  alarmUuid?: string;
  namespace?: string;
  createDate?: string;
  uuid?: string;
}

export interface ActiveAlarmStatus {
  namespace?: string;
  status?: string;
}

export interface ActiveAlarmTemplateInventory {
  uuid?: string;
  alarmName?: string;
  comparisonOperator?: ComparisonOperator;
  period?: number;
  repeatInterval?: number;
  repeatCount?: number;
  namespace?: string;
  metricName?: string;
  threshold?: number;
  emergencyLevel?: EmergencyLevel;
  labels?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AddingNewVmRuleInventory extends AutoScalingRuleInventory {
  adjustmentType?: string;
  adjustmentValue?: number;
}

export interface AdditionalLicenseInfo {
  type?: AdditionalLicenseType;
  primaryLicenseInfo?: string;
  appId?: string;
  path?: string;
  info?: string;
  keyId?: string;
}

export interface AddressPoolInventory extends IpRangeInventory {

}

export interface AffinityGroupInventory {
  uuid?: string;
  name?: string;
  description?: string;
  policy?: string;
  version?: string;
  type?: string;
  appliance?: string;
  zoneUuid?: string;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
  usages?: any[];
}

export interface AffinityGroupUsageInventory {
  uuid?: string;
  affinityGroupUuid?: string;
  resourceUuid?: string;
  resourceType?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AiSiNoSecretResourcePoolInventory extends SecretResourcePoolInventory {
  managementIp?: string;
  port?: number;
  route?: string;
  clientID?: string;
  clientSecrete?: string;
  appId?: string;
  keyNumSM2?: string;
  keyNumSM4?: string;
}

export interface AlarmActionInventory {
  alarmUuid?: string;
  actionType?: string;
  actionUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AlarmData {
  alarmUuid?: string;
  namespace?: string;
  metricName?: string;
  accountUuid?: string;
  resourceUuid?: string;
  resourceType?: string;
  alarmStatus?: string;
  alarmName?: string;
  threshold?: number;
  period?: number;
  labels?: string;
  metricValue?: number;
  comparisonOperator?: string;
  readStatus?: string;
  dataUuid?: string;
  context?: string;
  emergencyLevel?: string;
  time?: number;
}

export interface AlarmDataAckInventory extends AlertDataAckInventory {
  alarmUuid?: string;
}

export interface AlarmDataV1 extends AlarmData {}

export interface AlarmDataV2 extends AlarmData {}

export interface AlarmInventory {
  uuid?: string;
  name?: string;
  description?: string;
  comparisonOperator?: ComparisonOperator;
  period?: number;
  namespace?: string;
  metricName?: string;
  threshold?: number;
  repeatInterval?: number;
  repeatCount?: number;
  status?: AlarmStatus;
  state?: AlarmState;
  enableRecovery?: boolean;
  createDate?: string;
  lastOpDate?: string;
  labels?: any[];
  actions?: any[];
  emergencyLevel?: string;
}

export interface AlarmLabelInventory {
  uuid?: string;
  key?: string;
  operator?: string;
  value?: string;
}

export interface AlarmRecordsInventory {
  id?: number;
  createTime?: number;
  accountUuid?: string;
  alarmName?: string;
  alarmStatus?: string;
  alarmUuid?: string;
  comparisonOperator?: string;
  context?: string;
  dataUuid?: string;
  emergencyLevel?: string;
  labels?: string;
  metricName?: string;
  metricValue?: number;
  namespace?: string;
  period?: number;
  readStatus?: boolean;
  operatorAccountUuid?: string;
  resourceUuid?: string;
  threshold?: number;
}

export interface AlertDataAckInventory {
  alertDataUuid?: string;
  alertType?: string;
  ackPeriod?: number;
  resourceUuid?: string;
  ackDate?: string;
  resumeAlert?: boolean;
  operatorAccountUuid?: string;
}

export interface AlertInventory {
  uuid?: string;
  triggerUuid?: string;
  targetResourceUuid?: string;
  content?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AliyunDiskInventory {
  uuid?: string;
  diskId?: string;
  name?: string;
  description?: string;
  identityZoneUuid?: string;
  ecsInstanceUuid?: string;
  diskCategory?: string;
  diskType?: string;
  diskChargeType?: string;
  status?: string;
  sizeWithGB?: number;
  deviceInfo?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AliyunEbsBackupStorageInventory extends BackupStorageInventory {
  ossBucketUuid?: string;
}

export interface AliyunEbsPrimaryStorageInventory extends PrimaryStorageInventory {
  panguAppName?: string;
  panguPartitionName?: string;
  identityZoneUuid?: string;
  defaultIoType?: string;
}

export interface AliyunErrorCode extends ErrorCode {}

export interface NasFileSystemInventory {
  uuid?: string;
  protocol?: NasProtocolType;
  type?: string;
  name?: string;
  description?: string;
  fileSystemId?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AliyunNasAccessGroupInventory {
  uuid?: string;
  name?: string;
  description?: string;
  dataCenterUuid?: string;
  rules?: any[];
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AliyunNasAccessGroupProperty {
  ruleCount?: number;
  name?: string;
  description?: string;
  networkType?: string;
}

export interface AliyunNasFileSystemInventory extends NasFileSystemInventory {
  dataCenterUuid?: string;
  storageType?: string;
}

export interface AliyunNasMountTargetInventory extends NasMountTargetInventory {
  accessGroupUuid?: string;
  status?: string;
}

export interface AliyunNasMountTargetProperty {
  status?: string;
  accessGroupName?: string;
  mountDomain?: string;
}

export interface AliyunOssException extends ErrorCode {}

export interface LocateStatus {}

export interface AliyunPanguPartitionInventory {
  accountUuid?: string;
  uuid?: string;
  identityZoneUuid?: string;
  name?: string;
  description?: string;
  appName?: string;
  partitionName?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AliyunProxyVSwitchInventory {
  uuid?: string;
  aliyunProxyVpcUuid?: string;
  vpcL3NetworkUuid?: string;
  status?: string;
  isDefault?: boolean;
}

export interface AliyunProxyVpcInventory {
  uuid?: string;
  vpcName?: string;
  cidrBlock?: string;
  vRouterUuid?: string;
  status?: string;
  aliyunProxyVSwitches?: any[];
  description?: string;
  createDate?: string;
  lastOpDate?: string;
  isDefault?: boolean;
}

export interface AliyunRouterInterfaceInventory {
  uuid?: string;
  dataCenterUuid?: string;
  routerInterfaceId?: string;
  virtualRouterUuid?: string;
  accessPointUuid?: string;
  role?: string;
  vRouterType?: string;
  spec?: string;
  name?: string;
  description?: string;
  status?: string;
  oppositeInterfaceUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AliyunSmsSNSTextTemplateInventory extends SNSTextTemplateInventory {
  alarmTemplateCode?: string;
  sign?: string;
  eventTemplateCode?: string;
  eventTemplate?: string;
}

export interface AliyunSnapshotInventory {
  uuid?: string;
  snapshotId?: string;
  name?: string;
  description?: string;
  dataCenterUuid?: string;
  diskUuid?: string;
  status?: string;
  aliyunSnapshotUsage?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ApiException extends RuntimeException {}

export interface DiskOfferingInventory {
  uuid?: string;
  name?: string;
  description?: string;
  diskSize?: number;
  sortKey?: number;
  state?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
  allocatorStrategy?: string;
}

export interface ApplianceVmInventory extends VmInstanceInventory {
  applianceVmType?: string;
  managementNetworkUuid?: string;
  defaultRouteL3NetworkUuid?: string;
  status?: string;
  agentPort?: number;
  haStatus?: string;
}

export interface AuditData {
  id?: number;
  resourceUuid?: string;
  resourceType?: string;
  clientIp?: string;
  clientBrowser?: string;
  apiName?: string;
  error?: string;
  operatorAccountUuid?: string;
  duration?: number;
  requestUuid?: string;
  responseUuid?: string;
  sessionUuid?: string;
  requestDump?: string;
  responseDump?: string;
  operator?: string;
  time?: number;
}

export interface AuditDataV2 extends AuditData {
  success?: string;
  resourceName?: string;
}

export interface AuditType {}

export interface AuditDataV1 extends AuditData {}

export interface AuditsInventory {
  id?: number;
  createTime?: number;
  apiName?: string;
  clientBrowser?: string;
  clientIp?: string;
  duration?: number;
  error?: string;
  operator?: string;
  requestDump?: string;
  resourceUuid?: string;
  requestUuid?: string;
  operatorAccountUuid?: string;
  responseDump?: string;
  success?: boolean;
  signedText?: string;
  resourceType?: string;
  resourceName?: string;
}

export interface AutoScalingGroupActivityInventory {
  uuid?: string;
  name?: string;
  scalingGroupUuid?: string;
  activityAction?: string;
  instanceUuids?: string;
  scalingGroupRuleUuid?: string;
  cause?: string;
  description?: string;
  status?: string;
  activityActionResultMessage?: string;
  endDate?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AutoScalingGroupInstanceInventory {
  uuid?: string;
  instanceUuid?: string;
  scalingGroupUuid?: string;
  templateUuid?: string;
  scalingGroupActivityUuid?: string;
  status?: string;
  healthStatus?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
  protectionStrategy?: string;
}

export interface AutoScalingGroupInventory {
  name?: string;
  uuid?: string;
  scalingResourceType?: string;
  state?: string;
  defaultCooldown?: number;
  description?: string;
  minResourceSize?: number;
  maxResourceSize?: number;
  removalPolicy?: string;
  createDate?: string;
  lastOpDate?: string;
  attachedTemplates?: any[];
  systemTags?: any[];
}

export interface AutoScalingRuleAlarmTriggerInventory extends AutoScalingRuleTriggerInventory {
  alarmUuid?: string;
}

export interface AutoScalingRuleInventory {
  type?: string;
  description?: string;
  cooldown?: number;
  state?: AutoScalingRuleState;
  status?: AutoScalingRuleStatus;
  systemTags?: any[];
  createDate?: string;
  lastOpDate?: string;
  name?: string;
  uuid?: string;
  scalingGroupUuid?: string;
  ruleTriggers?: any[];
}

export interface AutoScalingRuleSchedulerJobTriggerInventory extends AutoScalingRuleTriggerInventory {
  schedulerJobUuid?: string;
}

export interface AutoScalingRuleState {}

export interface OvfNetworkInfo {
  name?: string;
}

export interface AutoScalingRuleTriggerInventory {
  name?: string;
  uuid?: string;
  type?: string;
  ruleUuid?: string;
  description?: string;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface AutoScalingTemplateInventory {
  uuid?: string;
  name?: string;
  description?: string;
  type?: string;
  state?: string;
  systemTags?: any[];
  createDate?: string;
  lastOpDate?: string;
}

export interface AutoScalingVmTemplateInventory extends AutoScalingTemplateInventory {
  vmInstanceName?: string;
  vmInstanceType?: string;
  vmInstanceDescription?: string;
  vmInstanceOfferingUuid?: string;
  imageUuid?: string;
  l3NetworkUuids?: any[];
  rootDiskOfferingUuid?: string;
  dataDiskOfferingUuids?: any[];
  vmInstanceZoneUuid?: string;
  vmInstanceClusterUuid?: string;
  hostUuid?: string;
  primaryStorageUuidForRootVolume?: string;
  defaultL3NetworkUuid?: string;
  strategy?: string;
}

export interface BackupStorageInventory {
  uuid?: string;
  name?: string;
  url?: string;
  description?: string;
  totalCapacity?: number;
  availableCapacity?: number;
  type?: string;
  state?: string;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
  attachedZoneUuids?: any[];
}

export interface BareMetal2BillingInventory extends BillingInventory {
  bareMetal2ChassisOfferingUUid?: string;
}

export interface BareMetal2BondingInventory {
  chassisUuid?: string;
  name?: string;
  slaves?: string;
  opts?: string;
  mode?: number;
  createDate?: string;
  lastOpDate?: string;
  accountUuid?: string;
  uuid?: string;
}

export interface BareMetal2BondingNicRefInventory {
  id?: number;
  nicUuid?: string;
  instanceUuid?: string;
  bondingUuid?: string;
  provisionNicUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  vmNic?: VmNicInventory;
  provisionNic?: BareMetal2InstanceProvisionNicInventory;
  bareMetal2Bonding?: BareMetal2BondingInventory;
}

export interface BareMetal2ChassisDiskInventory {
  uuid?: string;
  chassisUuid?: string;
  diskSize?: number;
  type?: string;
  wwn?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface BareMetal2ChassisInventory {
  uuid?: string;
  name?: string;
  description?: string;
  zoneUuid?: string;
  clusterUuid?: string;
  chassisOfferingUuid?: string;
  type?: string;
  state?: string;
  status?: string;
  powerStatus?: string;
  provisionType?: string;
  createDate?: string;
  lastOpDate?: string;
  chassisNics?: any[];
  chassisDisks?: any[];
  chassisOffering?: BareMetal2ChassisOfferingInventory;
}

export interface BareMetal2ChassisNicInventory {
  uuid?: string;
  chassisUuid?: string;
  mac?: string;
  nicName?: string;
  speed?: string;
  isProvisionNic?: boolean;
  createDate?: string;
  lastOpDate?: string;
}

export interface BareMetal2ChassisOfferingInventory {
  uuid?: string;
  name?: string;
  description?: string;
  architecture?: string;
  cpuModelName?: string;
  cpuNum?: number;
  memorySize?: number;
  bootMode?: string;
  state?: string;
  provisionType?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface BareMetal2GatewayInventory extends KVMHostInventory {
  attachedClusterUuids?: any[];
  provisionNic?: BareMetal2GatewayProvisionNicInventory;
}

export interface BareMetal2GatewayProvisionNicInventory {
  uuid?: string;
  networkUuid?: string;
  interfaceName?: string;
  ip?: string;
  netmask?: string;
  gateway?: string;
  metadata?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface BareMetal2InstanceInventory extends VmInstanceInventory {
  chassisUuid?: string;
  lastChassisUuid?: string;
  gatewayUuid?: string;
  lastGatewayUuid?: string;
  chassisOfferingUuid?: string;
  gatewayAllocatorStrategy?: string;
  status?: string;
  provisionType?: string;
  agentVersion?: string;
  isLatestAgent?: boolean;
  provisionNic?: BareMetal2InstanceProvisionNicInventory;
}

export interface BareMetal2InstanceProvisionNicInventory {
  uuid?: string;
  networkUuid?: string;
  mac?: string;
  ip?: string;
  netmask?: string;
  gateway?: string;
  metadata?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface BareMetal2IpmiChassisInventory extends BareMetal2ChassisInventory {
  ipmiAddress?: string;
  ipmiPort?: number;
  ipmiUsername?: string;
}

export interface BareMetal2ProvisionNetworkInventory {
  uuid?: string;
  zoneUuid?: string;
  name?: string;
  description?: string;
  dhcpInterface?: string;
  dhcpRangeStartIp?: string;
  dhcpRangeEndIp?: string;
  dhcpRangeNetmask?: string;
  dhcpRangeGateway?: string;
  dhcpRangeNetworkCidr?: string;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
  attachedClusterUuids?: any[];
}

export interface BareMetal2ProvisionNetworkIpCapacity {
  networkUuid?: string;
  totalCapacity?: number;
  availableCapacity?: number;
  gatewayUsedIpNumber?: number;
  instanceUsedIpNumber?: number;
}

export interface BareMetal2Spending extends SpendingDetails {
  bareMetal2Inventory?: any[];
}

export interface BareMetal2SpendingDetails {
  startTime?: number;
  endTime?: number;
  spending?: number;
  bareMetal2OfferingUUid?: string;
}

export interface BaremetalBondingInventory {
  uuid?: string;
  chassisUuid?: string;
  name?: string;
  mode?: number;
  slaves?: string;
  opts?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface BaremetalChassisInventory {
  uuid?: string;
  name?: string;
  description?: string;
  zoneUuid?: string;
  clusterUuid?: string;
  pxeServerUuid?: string;
  ipmiAddress?: string;
  ipmiPort?: number;
  ipmiUsername?: string;
  state?: string;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
  hardwareInfos?: any[];
}

export interface BaremetalHardwareInfoInventory {
  uuid?: string;
  chassisUuid?: string;
  type?: string;
  content?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface BaremetalInstanceInventory {
  uuid?: string;
  name?: string;
  description?: string;
  zoneUuid?: string;
  clusterUuid?: string;
  pxeServerUuid?: string;
  chassisUuid?: string;
  imageUuid?: string;
  templateUuid?: string;
  platform?: string;
  managementIp?: string;
  username?: string;
  port?: number;
  state?: string;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
  bmNics?: any[];
}

export interface BaremetalNicInventory {
  uuid?: string;
  baremetalInstanceUuid?: string;
  l3NetworkUuid?: string;
  baremetalBondingUuid?: string;
  mac?: string;
  ip?: string;
  netmask?: string;
  gateway?: string;
  metadata?: string;
  pxe?: boolean;
  createDate?: string;
  lastOpDate?: string;
}

export interface BaremetalPxeServerInventory {
  uuid?: string;
  zoneUuid?: string;
  name?: string;
  description?: string;
  hostname?: string;
  sshUsername?: string;
  sshPassword?: string;
  sshPort?: number;
  storagePath?: string;
  dhcpInterface?: string;
  dhcpInterfaceAddress?: string;
  dhcpRangeBegin?: string;
  dhcpRangeEnd?: string;
  dhcpRangeNetmask?: string;
  state?: string;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
  totalCapacity?: number;
  availableCapacity?: number;
  attachedClusterUuids?: any[];
}

export interface BaremetalVlanNicInventory extends BaremetalNicInventory {
  vlan?: number;
}

export interface BaseVirtualDeviceTO {
  resourceUuid?: string;
  deviceAddress?: any;
}

export interface BatchDeleteVolumeSnapshotStruct {
  snapshotUuid?: string;
  success?: boolean;
  error?: any;
}

export interface BillingInventory {
  id?: number;
  billingType?: string;
  accountUuid?: string;
  resourceUuid?: string;
  resourceName?: string;
  spending?: number;
  startTime?: number;
  endTime?: number;
  hypervisorType?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface BlockDevices {
  unusedBlockDevices?: any[];
  usedBlockDevices?: any[];
}

export interface BlockPrimaryStorageInventory extends PrimaryStorageInventory {
  vendorName?: string;
  metadata?: string;
}

export interface BlockVolumeInventory extends VolumeInventory {
  iscsiPath?: string;
  vendor?: string;
}

export interface CCSCertificateAccountRefInventory {
  accountUuid?: string;
  certificateUuid?: string;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface CCSCertificateInventory {
  uuid?: string;
  algorithm?: string;
  format?: string;
  issuerDN?: string;
  subjectDN?: string;
  serNumber?: string;
  effectiveTime?: string;
  expirationTime?: string;
  createDate?: string;
  lastOpDate?: string;
  accountCertificateRefs?: any[];
}

export interface CasClientInventory extends ThirdPartyAccountSourceInventory {
  loginMNUrl?: string;
  redirectUrl?: string;
  casServerLoginUrl?: string;
  casServerUrlPrefix?: string;
  serverName?: string;
  state?: string;
  usernameProperty?: string;
}

export interface CbtTaskInventory {
  uuid?: string;
  name?: string;
  description?: string;
  status?: any;
  createDate?: string;
  lastOpDate?: string;
  resourceRefs?: any[];
}

export interface CbtTaskResourceRefInventory {
  id?: number;
  taskUuid?: string;
  resourceUuid?: string;
  resourceType?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface CbtTaskStatus {}

export interface MdevDeviceState {}

export interface CdRomTO extends IsoTO {
  isEmpty?: boolean;
  bootOrder?: number;
}

export interface CdpPolicyInventory {
  uuid?: string;
  name?: string;
  state?: CdpPolicyState;
  description?: string;
  retentionTimePerDay?: number;
  hourlyRpSinceDay?: number;
  dailyRpSinceDay?: number;
  expireTimeInDay?: number;
  fullBackupIntervalInDay?: number;
  recoveryPointPerSecond?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface CdpTaskInventory {
  uuid?: string;
  name?: string;
  description?: string;
  policyUuid?: string;
  backupStorageUuid?: string;
  status?: CdpTaskStatus;
  state?: CdpTaskState;
  taskType?: CdpTaskType;
  backupBandwidth?: number;
  maxCapacity?: number;
  usedCapacity?: number;
  maxLatency?: number;
  lastLatency?: number;
  createDate?: string;
  lastOpDate?: string;
  resourceRefs?: any[];
}

export interface CdpTaskResourceRefInventory {
  taskUuid?: string;
  resourceUuid?: string;
  resourceType?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface CdpTaskStatus {}

export interface UKeyInventory {
  managementNodeUuid?: string;
  status?: UKeyStatus;
  keyId?: string;
}

export interface CdpTaskType {}

export interface StackTemplateInventory {
  uuid?: string;
  name?: string;
  description?: string;
  type?: string;
  version?: string;
  state?: boolean;
  content?: string;
  md5sum?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface CephBackupStorageInventory extends BackupStorageInventory {
  mons?: any[];
  fsid?: string;
  poolName?: string;
  poolAvailableCapacity?: number;
  poolUsedCapacity?: number;
  poolReplicatedSize?: number;
  poolDiskUtilization?: number;
  poolSecurityPolicy?: string;
}

export interface CephBackupStorageMonInventory {
  hostname?: string;
  monPort?: number;
  createDate?: string;
  lastOpDate?: string;
  backupStorageUuid?: string;
  monAddr?: string;
  sshPort?: number;
  status?: string;
  sshUsername?: string;
  sshPassword?: string;
  monUuid?: string;
}

export interface CephOsdGroupInventory {
  primaryStorageUuid?: string;
  osds?: string;
  availableCapacity?: number;
  availablePhysicalCapacity?: number;
  totalPhysicalCapacity?: number;
  createDate?: string;
  lastOpDate?: string;
  uuid?: string;
}

export interface CephPluginConnectionView {
  ip?: string;
  pluginType?: string;
  pluginProperties?: any;
  managementNodeUuid?: string;
  hostUuid?: string;
}

export interface CephPrimaryStorageInventory extends PrimaryStorageInventory {
  mons?: any[];
  pools?: any[];
  fsid?: string;
}

export interface CephPrimaryStorageMonInventory {
  hostname?: string;
  monPort?: number;
  createDate?: string;
  lastOpDate?: string;
  primaryStorageUuid?: string;
  monAddr?: string;
  sshUsername?: string;
  sshPassword?: string;
  sshPort?: number;
  status?: string;
  monUuid?: string;
}

export interface CephPrimaryStoragePoolInventory {
  uuid?: string;
  primaryStorageUuid?: string;
  poolName?: string;
  aliasName?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
  type?: string;
  availableCapacity?: number;
  usedCapacity?: number;
  totalCapacity?: number;
  securityPolicy?: string;
  replicatedSize?: number;
  diskUtilization?: number;
}

export interface CertificateInventory {
  name?: string;
  uuid?: string;
  certificate?: string;
  description?: string;
  listeners?: any[];
  createDate?: string;
  lastOpDate?: string;
}

export interface ChainInfo {
  runningTask?: any[];
  pendingTask?: any[];
}

export interface ChronyServerInfo {
  hostname?: string;
  status?: HostConnectedStatus;
}

export interface ChronyServerInfoPair {
  internal?: any;
  external?: any;
}

export interface CleanStage {
  total?: number;
  success?: number;
  skip?: number;
  fail?: number;
}

export interface CloneVmInstanceInventory {
  error?: any;
  inventory?: VmInstanceInventory;
}

export interface CloneVmInstanceResults {
  numberOfClonedVm?: number;
  inventories?: any[];
}

export interface CloudFormationStackEventInventory {
  id?: number;
  description?: string;
  action?: string;
  content?: string;
  resourceName?: string;
  actionStatus?: string;
  stackUuid?: string;
  duration?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ClusterDRSInventory {
  clusterUuid?: string;
  state?: string;
  balancedState?: string;
  lastAdviceGroupUuid?: string;
  automationLevel?: string;
  thresholds?: any[];
  thresholdDuration?: number;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
  uuid?: string;
  name?: string;
}

export interface ClusterInventory {
  name?: string;
  uuid?: string;
  description?: string;
  state?: string;
  hypervisorType?: string;
  createDate?: string;
  lastOpDate?: string;
  zoneUuid?: string;
  type?: string;
  architecture?: string;
}

export interface ComparisonOperator {}

export interface MetricTemplateInventory {
  uuid?: string;
  receiverUuid?: string;
  template?: string;
  namespace?: string;
  metricName?: string;
  labelsJsonStr?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface Completion {}

export interface VpcHaGroupNetworkServiceRefInventory {
  id?: number;
  vpcHaRouterUuid?: string;
  networkServiceName?: string;
  networkServiceUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ConnectionAccessPointInventory {
  uuid?: string;
  accessPointId?: string;
  type?: string;
  name?: string;
  dataCenterUuid?: string;
  description?: string;
  status?: string;
  hostOperator?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ConnectionRelationShipInventory {
  uuid?: string;
  relationShips?: string;
  name?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ConnectionRelationShipProperty {
  uuid?: string;
  resourceType?: string;
  accountUuid?: string;
  connectionType?: HybridConnectionType;
  direction?: string;
  relationShips?: string;
  name?: string;
  description?: string;
  createDate?: string;
}

export interface ConsoleInventory {
  scheme?: string;
  targetScheme?: string;
  hostname?: string;
  port?: number;
  token?: string;
  version?: string;
  expiredDate?: string;
}

export interface ConsoleProxyAgentInventory {
  uuid?: string;
  description?: string;
  managementIp?: string;
  consoleProxyOverriddenIp?: string;
  consoleProxyPort?: number;
  type?: string;
  status?: string;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface Constants {}

export interface VpcFirewallRuleInventory {
  uuid?: string;
  ruleSetUuid?: string;
  action?: string;
  protocol?: string;
  destPort?: string;
  sourcePort?: string;
  sourceIp?: string;
  destIp?: string;
  ruleNumber?: number;
  allowStates?: string;
  tcpFlag?: string;
  icmpTypeName?: string;
  isApplied?: boolean;
  expired?: boolean;
  state?: string;
  isDefault?: boolean;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ControlStrategy {}

export interface GlobalConfigInventory {
  id?: number;
  name?: string;
  category?: string;
  description?: string;
  defaultValue?: string;
  value?: string;
}

export interface CpuMemoryCapacityData {
  resourceUuid?: string;
  totalCpu?: number;
  availableCpu?: number;
  totalMemory?: number;
  availableMemory?: number;
  managedCpuNum?: number;
}

export interface CreateDataVolumeTemplateFromVolumeSnapshotFailure {
  backupStorageUuid?: string;
  error?: any;
}

export interface CreateRootVolumeTemplateFromVolumeSnapshotFailure {
  backupStorageUuid?: string;
  error?: any;
}

export interface CreateVmInstanceFromTemplatedVmInstanceResults extends CloneVmInstanceResults {}

export interface AsyncRestState {}

export interface DRSAdviceInventory {
  uuid?: string;
  drsUuid?: string;
  adviceGroupUuid?: string;
  vmUuid?: string;
  vmSourceHostUuid?: string;
  vmTargetHostUuid?: string;
  reason?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface DRSVmMigrationActivityInventory {
  drsUuid?: string;
  uuid?: string;
  vmUuid?: string;
  vmSourceHostUuid?: string;
  vmTargetHostUuid?: string;
  status?: string;
  result?: string;
  reason?: string;
  adviceUuid?: string;
  cause?: string;
  endDate?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface DataCenterProperty {
  regionId?: string;
  regionName?: string;
}

export interface DataVolumeBillingInventory extends BillingInventory {
  volumeSize?: number;
}

export interface DataVolumeSpending extends SpendingDetails {
  sizeInventory?: any[];
}

export interface DataVolumeSpendingInventory {
  startTime?: number;
  endTime?: number;
  spending?: number;
  volumeSize?: number;
}

export interface DatabaseBackupInventory {
  uuid?: string;
  name?: string;
  description?: string;
  state?: string;
  status?: string;
  size?: number;
  metadata?: string;
  createDate?: string;
  lastOpDate?: string;
  backupStorageRefs?: any[];
}

export interface DatabaseBackupStorageRefInventory {
  databaseBackupUuid?: string;
  backupStorageUuid?: string;
  installPath?: string;
  exportUrl?: string;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface DatabaseBackupStruct {
  name?: string;
  version?: string;
  installPath?: string;
  type?: DatabaseType;
  size?: number;
  md5?: string;
  createdTime?: string;
}

export interface DeviceAddress {
  type?: string;
  bus?: string;
  domain?: string;
  slot?: string;
  function?: string;
  controller?: string;
  target?: string;
  unit?: string;
}

export interface DeviceTO {
  disk?: string;
  status?: string;
  state?: string;
  target?: string;
  targetType?: string;
}

export interface DirectoryInventory {
  uuid?: string;
  name?: string;
  groupName?: string;
  parentUuid?: string;
  rootDirectoryUuid?: string;
  zoneUuid?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface DiskOfferingInventory {
  uuid?: string;
  name?: string;
  description?: string;
  diskSize?: number;
  sortKey?: number;
  state?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
  allocatorStrategy?: string;
}

export interface ESXHostInventory extends HostInventory {
  vCenterUuid?: string;
  morval?: string;
  esxiVersion?: string;
}

export interface EcsImageInventory {
  uuid?: string;
  localImageUuid?: string;
  ecsImageId?: string;
  name?: string;
  ecsImageSize?: number;
  description?: string;
  dataCenterUuid?: string;
  platform?: string;
  type?: string;
  ossMd5Sum?: string;
  format?: string;
  osName?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface EcsInstanceInventory {
  uuid?: string;
  localVmInstanceUuid?: string;
  ecsInstanceId?: string;
  name?: string;
  ecsStatus?: string;
  cpuCores?: number;
  memorySize?: number;
  ecsInstanceType?: string;
  ecsBandWidth?: number;
  ecsRootVolumeId?: string;
  ecsRootVolumeCategory?: string;
  ecsRootVolumeSize?: number;
  privateIpAddress?: string;
  publicIpAddress?: string;
  ecsVSwitchUuid?: string;
  ecsImageUuid?: string;
  ecsSecurityGroupUuid?: string;
  identityZoneUuid?: string;
  chargeType?: string;
  expireDate?: string;
  createDate?: string;
  lastOpDate?: string;
  description?: string;
}

export interface EcsInstanceType {
  typeId?: string;
  cpu?: number;
  memory?: number;
  typeFamily?: string;
  generation?: string;
}

export interface EcsSecurityGroupInventory {
  uuid?: string;
  ecsVpcUuid?: string;
  securityGroupId?: string;
  name?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface EcsVSwitchInventory {
  uuid?: string;
  vSwitchId?: string;
  status?: string;
  cidrBlock?: string;
  availableIpAddressCount?: number;
  description?: string;
  name?: string;
  ecsVpcUuid?: string;
  identityZoneUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface EcsVpcInventory {
  uuid?: string;
  ecsVpcId?: string;
  dataCenterUuid?: string;
  status?: string;
  deleted?: string;
  name?: string;
  cidrBlock?: string;
  vRouterId?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface EipInventory {
  uuid?: string;
  name?: string;
  description?: string;
  vmNicUuid?: string;
  vipUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  state?: string;
  vipIp?: string;
  guestIp?: string;
}

export interface ElaborationCategory {
  category?: string;
  num?: number;
}

export interface ElaborationContent {
  category?: string;
  code?: string;
  regex?: string;
  message_cn?: string;
  message_en?: string;
  source?: string;
  method?: string;
  distance?: number;
}

export interface EmailMediaInventory extends MediaInventory {
  smtpServer?: string;
  smtpPort?: number;
  username?: string;
}

export interface EmailTriggerActionInventory extends MonitorTriggerActionInventory {
  email?: string;
  mediaUuid?: string;
}

export interface EmergencyLevel {}

export interface Datapoint {
  value?: number;
  time?: number;
  labels?: any;
}

export interface ErrorCode {
  code?: string;
  description?: string;
  details?: string;
  elaboration?: string;
  cause?: any;
  causes?: any[];
  opaque?: any;
}

export interface EthernetVfPciDeviceInventory extends PciDeviceInventory {
  hostDevUuid?: string;
  interfaceName?: string;
  vmUuid?: string;
  l3NetworkUuid?: string;
  vfStatus?: any;
}

export interface EthernetVfStatus {}

export interface BaremetalVlanNicInventory extends BaremetalNicInventory {
  vlan?: number;
}

export interface EventData {
  namespace?: string;
  name?: string;
  labels?: any;
  emergencyLevel?: EmergencyLevel;
  resourceId?: string;
  resourceName?: string;
  error?: string;
  time?: number;
  dataUuid?: string;
  accountUuid?: string;
  subscriptionUuid?: string;
  readStatus?: string;
}

export interface EventDataAckInventory extends AlertDataAckInventory {
  eventSubscriptionUuid?: string;
}

export interface EventLogInventory {
  id?: number;
  content?: string;
  resourceUuid?: string;
  resourceType?: string;
  category?: string;
  trackingId?: string;
  type?: string;
  time?: number;
  createDate?: string;
}

export interface EventRecordsInventory {
  id?: number;
  createTime?: number;
  namespace?: string;
  name?: string;
  emergencyLevel?: string;
  resourceId?: string;
  error?: string;
  dataUuid?: string;
  accountUuid?: string;
  subscriptionUuid?: string;
  readStatus?: boolean;
  operatorAccountUuid?: string;
  labels?: string;
}

export interface EventRuleTemplateInventory {
  name?: string;
  monitorTemplateUuid?: string;
  namespace?: string;
  eventName?: string;
  emergencyLevel?: EmergencyLevel;
  labels?: string;
  createDate?: string;
  lastOpDate?: string;
  uuid?: string;
}

export interface EventStruct {
  namespace?: string;
  name?: string;
  description?: string;
  labelNames?: any[];
}

export interface EventSubscriptionActionInventory {
  subscriptionUuid?: string;
  actionType?: string;
  actionUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface EventSubscriptionInventory {
  uuid?: string;
  name?: string;
  namespace?: string;
  eventName?: string;
  state?: EventSubscriptionState;
  actions?: any[];
  labels?: any[];
  lastOpDate?: string;
  createDate?: string;
  emergencyLevel?: string;
}

export interface EventSubscriptionLabelInventory {
  uuid?: string;
  key?: string;
  operator?: Operator;
  value?: string;
}

export interface ExponBlockVolumeInventory extends BlockVolumeInventory {
  exponStatus?: string;
}

export interface ExternalBackupInventory {
  uuid?: string;
  name?: string;
  description?: string;
  state?: ExternalBackupState;
  installPath?: string;
  totalSize?: number;
  version?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ExternalBackupStorageInventory extends BackupStorageInventory {
  identity?: string;
}

export interface ExternalPrimaryStorageInventory extends PrimaryStorageInventory {
  identity?: string;
  config?: any;
  addonInfo?: any;
  outputProtocols?: any[];
  defaultProtocol?: string;
}

export interface ExternalServiceCapabilities {
  reloadConfig?: boolean;
}

export interface ExternalServiceCapabilitiesBuilder extends ExternalServiceCapabilities {}

export interface HostNUMANode {
  distance?: any[];
  cpus?: any[];
  free?: number;
  size?: number;
  nodeID?: string;
  VMsUuid?: any[];
}

export interface ExternalServiceInventory {
  name?: string;
  status?: string;
  capabilities?: any;
}

export interface FaultToleranceVmGroupInventory extends VmInstanceInventory {
  primaryVmInstanceUuid?: string;
  secondaryVmInstanceUuid?: string;
  status?: string;
}

export interface FcHbaDeviceInventory extends HbaDeviceInventory {
  portName?: string;
  portState?: string;
  speed?: string;
  supportedSpeeds?: string;
  symbolicName?: string;
  supportedClasses?: string;
  nodeName?: string;
}

export interface FiberChannelLunInventory extends ScsiLunInventory {
  fiberChannelStorageUuid?: string;
}

export interface FiberChannelStorageInventory {
  uuid?: string;
  name?: string;
  wwnn?: string;
  state?: string;
  fiberChannelLuns?: any[];
  createDate?: string;
  lastOpDate?: string;
}

export interface FlkSecSecretResourcePoolInventory extends SecretResourcePoolInventory {
  encryptResult?: string;
  activatedToken?: string;
  protectToken?: string;
  hmacToken?: string;
  ukeyType?: string;
}

export interface FlkSecSecurityMachineInventory extends SecurityMachineInventory {
  port?: number;
}

export interface FlowCollectorInventory {
  uuid?: string;
  name?: string;
  description?: string;
  flowMeterUuid?: string;
  server?: string;
  port?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface FlowMeterInventory {
  collectors?: any[];
  networkRefs?: any[];
  uuid?: string;
  name?: string;
  description?: string;
  sample?: number;
  expireInterval?: number;
  version?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface FreeIpInventory {
  ipRangeUuid?: string;
  ip?: string;
  netmask?: string;
  gateway?: string;
}

export interface GarbageCollectorInventory {
  uuid?: string;
  name?: string;
  runnerClass?: string;
  context?: string;
  status?: string;
  managementNodeUuid?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface GlobalConfigInventory {
  id?: number;
  name?: string;
  category?: string;
  description?: string;
  defaultValue?: string;
  value?: string;
}

export interface GlobalConfigOptions {
  validValue?: any[];
  numberGreaterThan?: number;
  numberLessThan?: number;
  numberGreaterThanOrEqual?: number;
  numberLessThanOrEqual?: number;
}

export interface GlobalConfigTemplateInventory {
  uuid?: string;
  name?: string;
  type?: string;
  description?: string;
}

export interface GpuDeviceInventory extends PciDeviceInventory {
  serialNumber?: string;
  memory?: number;
  power?: number;
  isDriverLoaded?: boolean;
}

export interface GuestToolsInventory {
  uuid?: string;
  name?: string;
  description?: string;
  managementNodeUuid?: string;
  architecture?: string;
  hypervisorType?: string;
  version?: string;
  agentType?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface GuestToolsStateInventory {
  vmInstanceUuid?: string;
  qgaState?: string;
  zwatchState?: string;
  version?: string;
  platform?: string;
  osType?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface GuestVmScriptExecutedRecordDetailInventory {
  recordUuid?: string;
  vmInstanceUuid?: string;
  vmName?: string;
  status?: string;
  exitCode?: number;
  stdout?: string;
  errCause?: string;
  stderr?: string;
  startTime?: string;
  endTime?: string;
}

export interface GuestVmScriptExecutedRecordInventory {
  uuid?: string;
  scriptUuid?: string;
  recordName?: string;
  scriptTimeout?: number;
  status?: string;
  executor?: string;
  executionCount?: number;
  version?: number;
  encodingType?: string;
  scriptContent?: string;
  renderParams?: string;
  startTime?: string;
  endTime?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface GuestVmScriptInventory {
  uuid?: string;
  name?: string;
  description?: string;
  encodingType?: string;
  scriptContent?: string;
  renderParams?: string;
  platform?: string;
  scriptType?: string;
  scriptTimeout?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface HaStrategyConditionInventory {
  uuid?: string;
  name?: string;
  fencerName?: string;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface HaiTaiSecretResourcePoolInventory extends SecretResourcePoolInventory {
  managementIp?: string;
  port?: number;
  realm?: string;
}

export interface HardwareL2VxlanNetworkPoolInventory extends L2VxlanNetworkPoolInventory {
  sdnControllerUuid?: string;
}

export interface HbaDeviceInventory {
  uuid?: string;
  name?: string;
  hostUuid?: string;
  hbaType?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface Histogram {
  time?: number;
  count?: number;
  tags?: any[];
}

export interface HostDiskCapacity {
  hostUuid?: string;
  totalCapacity?: number;
  availableCapacity?: number;
  totalPhysicalCapacity?: number;
  availablePhysicalCapacity?: number;
}

export interface HostInventory {
  zoneUuid?: string;
  name?: string;
  uuid?: string;
  clusterUuid?: string;
  description?: string;
  managementIp?: string;
  hypervisorType?: string;
  state?: string;
  status?: string;
  totalCpuCapacity?: number;
  availableCpuCapacity?: number;
  cpuSockets?: number;
  totalMemoryCapacity?: number;
  availableMemoryCapacity?: number;
  cpuNum?: number;
  ipmiAddress?: string;
  ipmiUsername?: string;
  ipmiPort?: number;
  ipmiPowerStatus?: string;
  cpuStatus?: any;
  memoryStatus?: any;
  diskStatus?: any;
  nicStatus?: any;
  gpuStatus?: any;
  powerSupplyStatus?: any;
  fanStatus?: any;
  raidStatus?: any;
  temperatureStatus?: any;
  architecture?: string;
  nqn?: string;
  hostname?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface HostIpmiInventory {
  uuid?: string;
  ipmiAddress?: string;
  ipmiUsername?: string;
  ipmiPort?: number;
  ipmiPowerStatus?: string;
}

export interface HostKernelInterfaceInventory {
  uuid?: string;
  name?: string;
  description?: string;
  hostUuid?: string;
  l2NetworkUuid?: string;
  l3NetworkUuid?: string;
  usedIps?: any[];
  trafficTypes?: any[];
  createDate?: string;
  lastOpDate?: string;
}

export interface HostKernelInterfaceUsedIpInventory extends UsedIpInventory {
  hostKernelInterfaceUuid?: string;
}

export interface HostLoad {
  hostUuid?: string;
  usedCPUPercent?: number;
  usedMemoryPercent?: number;
}

export interface HostNetworkBondingInventory {
  uuid?: string;
  hostUuid?: string;
  bondingName?: string;
  bondingType?: string;
  speed?: number;
  mode?: string;
  xmitHashPolicy?: string;
  miiStatus?: string;
  mac?: string;
  ipAddresses?: any[];
  gateway?: string;
  callBackIp?: string;
  miimon?: number;
  type?: string;
  allSlavesActive?: boolean;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
  slaves?: any[];
}

export interface HostNetworkBondingServiceRefInventory {
  bondingUuid?: string;
  vlanId?: number;
  serviceType?: HostNetworkInterfaceServiceType;
  createDate?: string;
  lastOpDate?: string;
}

export interface HostNetworkInterfaceInventory {
  uuid?: string;
  hostUuid?: string;
  bondingUuid?: string;
  interfaceModel?: string;
  vendorId?: string;
  deviceId?: string;
  deviceName?: string;
  vendorName?: string;
  subvendorId?: string;
  subdeviceId?: string;
  subvendorName?: string;
  interfaceName?: string;
  interfaceType?: string;
  speed?: number;
  slaveActive?: boolean;
  carrierActive?: boolean;
  ipAddresses?: any[];
  gateway?: string;
  mac?: string;
  callBackIp?: string;
  pciDeviceAddress?: string;
  offloadStatus?: string;
  virtStatus?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface HostNetworkInterfaceLldpInventory {
  uuid?: string;
  interfaceUuid?: string;
  mode?: string;
  createDate?: string;
  lastOpDate?: string;
  neighborDevice?: HostNetworkInterfaceLldpRefInventory;
}

export interface HostNetworkInterfaceLldpRefInventory {
  lldpUuid?: string;
  chassisId?: string;
  timeToLive?: number;
  managementAddress?: string;
  systemName?: string;
  systemDescription?: string;
  systemCapabilities?: string;
  portId?: string;
  portDescription?: string;
  vlanId?: number;
  aggregationPortId?: number;
  mtu?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface HostNetworkInterfaceServiceRefInventory {
  interfaceUuid?: string;
  vlanId?: number;
  serviceType?: HostNetworkInterfaceServiceType;
  createDate?: string;
  lastOpDate?: string;
}

export interface HostOsCategoryInventory {
  uuid?: string;
  architecture?: string;
  osReleaseVersion?: string;
  metadataList?: any[];
  createDate?: string;
  lastOpDate?: string;
}

export interface HostPhysicalCpuInventory {
  uuid?: string;
  hostUuid?: string;
  serialNumber?: string;
  socketDesignation?: string;
  version?: string;
  currentSpeed?: string;
  coreCount?: number;
  threadCount?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface HostPhysicalMemoryInventory {
  uuid?: string;
  hostUuid?: string;
  manufacturer?: string;
  size?: string;
  speed?: string;
  clockSpeed?: string;
  locator?: string;
  serialNumber?: string;
  rank?: string;
  voltage?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface HostSchedulingRuleGroupInventory {
  uuid?: string;
  name?: string;
  description?: string;
  zoneUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface HwMonitorStatus {}

export interface VmSchedulingRuleExecuteState {}

export interface HybridAccountInventory {
  name?: string;
  uuid?: string;
  accountUuid?: string;
  userUuid?: string;
  type?: HybridType;
  akey?: string;
  hybridAccountId?: string;
  hybridUserId?: string;
  hybridUserName?: string;
  current?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface HybridEipAddressInventory {
  uuid?: string;
  eipId?: string;
  bandWidth?: string;
  dataCenterUuid?: string;
  allocateResourceUuid?: string;
  allocateResourceType?: string;
  status?: HybridEipStatus;
  eipAddress?: string;
  eipType?: HybridType;
  name?: string;
  chargeType?: string;
  description?: string;
  allocateTime?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface IPsecConnectionInventory {
  uuid?: string;
  name?: string;
  description?: string;
  peerAddress?: string;
  authMode?: string;
  authKey?: string;
  vipUuid?: string;
  ikeAuthAlgorithm?: string;
  ikeEncryptionAlgorithm?: string;
  ikeDhGroup?: number;
  policyAuthAlgorithm?: string;
  policyEncryptionAlgorithm?: string;
  pfs?: string;
  policyMode?: string;
  transformProtocol?: string;
  ikeVersion?: string;
  idType?: string;
  localId?: string;
  remoteId?: string;
  state?: string;
  status?: string;
  ikeLifeTime?: number;
  lifeTime?: number;
  createDate?: string;
  lastOpDate?: string;
  peerCidrs?: any[];
  l3NetworkRefs?: any[];
}

export interface IPsecL3NetworkRefInventory {
  uuid?: string;
  connectionUuid?: string;
  l3NetworkUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface IPsecPeerCidrInventory {
  uuid?: string;
  cidr?: string;
  connectionUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface IdentityZoneInventory {
  uuid?: string;
  closed?: string;
  dataCenterUuid?: string;
  zoneId?: string;
  type?: HybridType;
  zoneName?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface IdentityZoneProperty {
  zoneId?: string;
  localName?: string;
  availableInstanceTypes?: any[];
  availableResourceCreation?: any[];
  availableDiskCategories?: any[];
}

export interface ImageBackupStorageRefInventory {
  imageUuid?: string;
  backupStorageUuid?: string;
  installPath?: string;
  status?: string;
  exportMd5Sum?: string;
  exportUrl?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ImageCacheInventory {
  id?: number;
  primaryStorageUuid?: string;
  imageUuid?: string;
  installUrl?: string;
  mediaType?: string;
  size?: number;
  md5sum?: string;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ImageInventory {
  uuid?: string;
  name?: string;
  description?: string;
  state?: string;
  status?: string;
  size?: number;
  actualSize?: number;
  md5Sum?: string;
  url?: string;
  mediaType?: string;
  guestOsType?: string;
  type?: string;
  platform?: string;
  architecture?: string;
  format?: string;
  system?: boolean;
  virtio?: boolean;
  createDate?: string;
  lastOpDate?: string;
  backupStorageRefs?: any[];
  systemTags?: any[];
}

export interface ImagePackageInventory {
  uuid?: string;
  name?: string;
  description?: string;
  vmUuid?: string;
  backupStorageUuid?: string;
  state?: ImagePackageState;
  exportUrl?: string;
  md5Sum?: string;
  format?: string;
  size?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface ImageReplicationGroupBackupStorageRefInventory {
  replicationGroupUuid?: string;
  backupStorageUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ImageReplicationGroupInventory {
  uuid?: string;
  name?: string;
  description?: string;
  state?: ReplicationGroupState;
  createDate?: string;
  lastOpDate?: string;
  backupStorageRefs?: any[];
}

export interface ImageStoreBackupStorageInventory extends BackupStorageInventory {
  hostname?: string;
  username?: string;
  sshPort?: number;
}

export interface ImageStoreImageStruct {
  id?: string;
  parent?: string;
  blobsum?: string;
  created?: string;
  author?: string;
  arch?: string;
  desc?: string;
  size?: number;
  virtualsize?: number;
  name?: string;
}

export interface ImportStage {
  total?: number;
  success?: number;
  fail?: number;
}

export interface InfluxEventData extends EventData {}

export interface InfluxEventDataV2 extends InfluxEventData {}

export interface InfluxEventDataV1 extends InfluxEventData {}

export interface MonitorGroupTemplateRefVO {
  uuid?: string;
  templateUuid?: string;
  groupUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  isApplied?: boolean;
}

export interface InfoSecSecretResourcePoolInventory extends SecretResourcePoolInventory {
  connectionMode?: number;
  activatedToken?: string;
  protectToken?: string;
  hmacToken?: string;
}

export interface InfoSecSecurityMachineInventory extends SecurityMachineInventory {
  port?: number;
}

export interface InstallPathRecycleInventory {
  trashId?: number;
  resourceUuid?: string;
  storageUuid?: string;
  storageType?: string;
  resourceType?: string;
  installPath?: string;
  isFolder?: boolean;
  hostUuid?: string;
  hypervisorType?: string;
  size?: number;
  trashType?: string;
  createDate?: string;
}

export interface InstanceOfferingInventory {
  uuid?: string;
  name?: string;
  description?: string;
  cpuNum?: number;
  cpuSpeed?: number;
  memorySize?: number;
  reservedMemorySize?: number;
  type?: string;
  allocatorStrategy?: string;
  sortKey?: number;
  createDate?: string;
  lastOpDate?: string;
  state?: string;
}

export interface InternalCompletion {}

export interface BackupStorageExternalBackupInfo extends ResourceExternalBackupInfo {
  size?: number;
}

export interface IpCapacityData {
  resourceUuid?: string;
  totalCapacity?: number;
  availableCapacity?: number;
  usedIpAddressNumber?: number;
  ipv4TotalCapacity?: number;
  ipv4AvailableCapacity?: number;
  ipv4UsedIpAddressNumber?: number;
  ipv6TotalCapacity?: number;
  ipv6AvailableCapacity?: number;
  ipv6UsedIpAddressNumber?: number;
}

export interface IpRangeInventory {
  uuid?: string;
  l3NetworkUuid?: string;
  name?: string;
  description?: string;
  startIp?: string;
  endIp?: string;
  netmask?: string;
  gateway?: string;
  networkCidr?: string;
  ipVersion?: number;
  addressMode?: string;
  prefixLen?: number;
  ipRangeType?: IpRangeType;
  createDate?: string;
  lastOpDate?: string;
}

export interface IpStatisticData {
  ip?: string;
  vipUuid?: string;
  vipName?: string;
  vmInstanceUuid?: string;
  vmInstanceName?: string;
  vmInstanceType?: string;
  applianceVmOwnerUuid?: string;
  vmDefaultIp?: any[];
  resourceTypes?: any[];
  state?: string;
  useFor?: string;
  createDate?: string;
  ownerName?: string;
  resourceOwnerUuid?: string;
  usedIpUuid?: string;
}

export interface IscsiLunInventory extends ScsiLunInventory {
  iscsiTargetUuid?: string;
}

export interface IscsiServerClusterRefInventory {
  iscsiServerUuid?: string;
  clusterUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface IscsiServerInventory {
  uuid?: string;
  name?: string;
  ip?: string;
  port?: number;
  chapUserName?: string;
  chapUserPassword?: string;
  state?: string;
  iscsiTargets?: any[];
  iscsiClusterRefs?: any[];
  createDate?: string;
  lastOpDate?: string;
}

export interface IscsiTargetInventory {
  iscsiServerUuid?: string;
  uuid?: string;
  iqn?: string;
  iscsiLuns?: any[];
  createDate?: string;
  lastOpDate?: string;
}

export interface IsoTO extends BaseVirtualDeviceTO {
  path?: string;
  imageUuid?: string;
  primaryStorageUuid?: string;
  protocol?: string;
  deviceId?: number;
}

export interface ItemInventory {
  name?: string;
  readableName?: string;
}

export interface JobDetails {
  longJobUuid?: string;
  longJobState?: string;
  imageUuid?: string;
  imageUploadUrl?: string;
  offset?: number;
}

export interface JsonLabelInventory {
  id?: number;
  labelKey?: string;
  labelValue?: string;
  resourceUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface KVMCephVolumeTO extends VolumeTO {
  monInfo?: any[];
  secretUuid?: string;
}

export interface KVMHostInventory extends HostInventory {
  username?: string;
  sshPort?: number;
  osDistribution?: string;
  osRelease?: string;
  osVersion?: string;
  iscsiInitiatorName?: string;
}

export interface KVMIsoTO extends ImageInventory {
  pathInCache?: string;
  installUrl?: string;
}

export interface KeyProviderInventory {
  uuid?: string;
  name?: string;
  description?: string;
  type?: string;
  connected?: boolean;
  createDate?: string;
  lastOpDate?: string;
}

export interface KmsIdentityInventory {
  uuid?: string;
  kmsUuid?: string;
  identityType?: string;
  clientCertPem?: string;
  csrPem?: string;
  certExpiredDate?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface KmsInventory extends KeyProviderInventory {
  endpoint?: string;
  port?: number;
  kmipVersion?: string;
  username?: string;
  trustState?: string;
  activeIdentityUuid?: string;
  serverCertPem?: string;
  serverCertInfo?: any;
  activeIdentity?: KmsIdentityInventory;
}

export interface KvmCephCdRomTO extends CdRomTO {
  monInfo?: any[];
  secretUuid?: string;
}

export interface KvmCephIsoTO extends IsoTO {
  monInfo?: any[];
  secretUuid?: string;
}

export interface KvmHostHypervisorMetadataInventory {
  uuid?: string;
  categoryUuid?: string;
  managementNodeUuid?: string;
  hypervisor?: string;
  version?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface KvmHypervisorInfoInventory {
  uuid?: string;
  hypervisor?: string;
  version?: string;
  matchState?: HypervisorVersionState;
  createDate?: string;
  lastOpDate?: string;
}

export interface L2NetworkData {
  uuid?: string;
  name?: string;
  zoneUuid?: string;
  description?: string;
  physicalInterface?: string;
  type?: string;
  virtualNetworkId?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface L2NetworkHostRefInventory {
  hostUuid?: string;
  l2NetworkUuid?: string;
  l2ProviderType?: string;
  bridgeName?: string;
  skipDeletion?: boolean;
  createDate?: string;
  lastOpDate?: string;
}

export interface L2NetworkInventory {
  uuid?: string;
  name?: string;
  description?: string;
  zoneUuid?: string;
  physicalInterface?: string;
  type?: string;
  vSwitchType?: string;
  virtualNetworkId?: number;
  createDate?: string;
  lastOpDate?: string;
  attachedClusterUuids?: any[];
  attachedHostRefs?: any[];
}

export interface L2PortGroupNetworkInventory extends L2NetworkInventory {
  vSwitchUuid?: string;
  vlanMode?: any;
  vlanId?: number;
  vlanRanges?: string;
}

export interface L2VirtualSwitchNetworkInventory extends L2NetworkInventory {
  isDistributed?: boolean;
  vSwitchIndex?: number;
  portGroups?: any[];
}

export interface L2VlanNetworkInventory extends L2NetworkInventory {
  vlan?: number;
}

export interface L2VxlanNetworkInventory extends L2NetworkInventory {
  vni?: number;
  poolUuid?: string;
}

export interface L2VxlanNetworkPoolInventory extends L2NetworkInventory {
  attachedVtepRefs?: any[];
  remoteVteps?: any[];
  attachedVxlanNetworkRefs?: any[];
  attachedVniRanges?: any[];
  attachedCidrs?: any;
}

export interface L3NetworkHostRouteInventory {
  id?: number;
  l3NetworkUuid?: string;
  prefix?: string;
  nexthop?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface L3NetworkInventory {
  uuid?: string;
  name?: string;
  description?: string;
  type?: string;
  zoneUuid?: string;
  l2NetworkUuid?: string;
  state?: string;
  dnsDomain?: string;
  system?: boolean;
  category?: string;
  ipVersion?: number;
  enableIPAM?: boolean;
  createDate?: string;
  lastOpDate?: string;
  dns?: any[];
  ipRanges?: any[];
  networkServices?: any[];
  hostRoute?: any[];
  reservedIpRanges?: any[];
}

export interface Label {
  key?: string;
  value?: string;
  op?: Operator;
  compatible?: boolean;
}

export interface LdapEntryAttributeInventory {
  id?: string;
  values?: any[];
  orderMatters?: boolean;
}

export interface LdapEntryInventory {
  dn?: string;
  enable?: boolean;
  attributes?: any[];
}

export interface LdapServerInventory extends ThirdPartyAccountSourceInventory {
  url?: string;
  base?: string;
  username?: string;
  serverType?: string;
  encryption?: string;
  filter?: string;
  usernameProperty?: string;
}

export interface LicenseAddOnInventory extends LicenseInventory {
  name?: string;
  modules?: any[];
}

export interface LicenseAuthorizedCapacityInventory {
  id?: number;
  nodeUuid?: string;
  resourceUuid?: string;
  resourceInfo?: string;
  quotaType?: string;
  quota?: number;
  licenseType?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface LicenseAuthorizedNodeInventory {
  uuid?: string;
  appId?: string;
  ip?: string;
  lastSyncDate?: string;
  status?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface LicenseHistoryInventory {
  id?: number;
  uuid?: string;
  quota?: number;
  quotaType?: string;
  expiredDate?: string;
  issuedDate?: string;
  uploadDate?: string;
  licenseType?: string;
  prodInfo?: string;
  userName?: string;
  hash?: string;
  source?: string;
  managementNodeUuid?: string;
  mergedTo?: number;
  createDate?: string;
  expired?: boolean;
  cpuNum?: number;
  hostNum?: number;
  vmNum?: number;
  capacity?: number;
}

export interface LicenseInventory {
  uuid?: string;
  user?: string;
  prodInfo?: string;
  cpuNum?: number;
  hostNum?: number;
  vmNum?: number;
  capacity?: number;
  licenseType?: string;
  licenseAttribute?: string;
  expiredDate?: string;
  issuedDate?: string;
  uploadDate?: string;
  managementNodeUuid?: string;
  expired?: boolean;
  source?: string;
  platformId?: string;
  licenseRequest?: string;
  availableHostNum?: number;
  availableCpuNum?: number;
  availableVmNum?: number;
  usage?: any;
}

export interface LicenseUsageView {
  quotaType?: string;
  quota?: number;
  used?: number;
  available?: number;
}

export interface LoadBalancerInventory {
  name?: string;
  uuid?: string;
  description?: string;
  serverGroupUuid?: string;
  state?: string;
  type?: string;
  vipUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  listeners?: any[];
}

export interface LoadBalancerListenerACLRefInventory {
  id?: number;
  listenerUuid?: string;
  serverGroupUuid?: string;
  aclUuid?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface LoadBalancerListenerCertificateRefInventory {
  id?: number;
  listenerUuid?: string;
  certificateUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface LoadBalancerListenerInventory {
  uuid?: string;
  name?: string;
  description?: string;
  loadBalancerUuid?: string;
  instancePort?: number;
  loadBalancerPort?: number;
  securityPolicyType?: string;
  protocol?: string;
  serverGroupUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  vmNicRefs?: any[];
  aclRefs?: any[];
  certificateRefs?: any[];
  serverGroupRefs?: any[];
}

export interface LoadBalancerListenerServerGroupRefInventory {
  id?: number;
  listenerUuid?: string;
  serverGroupUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface LoadBalancerListenerVmNicRefInventory {
  id?: number;
  listenerUuid?: string;
  vmNicUuid?: string;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface LoadBalancerServerGroupInventory {
  uuid?: string;
  name?: string;
  description?: string;
  loadBalancerUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  listenerServerGroupRefs?: any[];
  serverIps?: any[];
  vmNicRefs?: any[];
}

export interface LoadBalancerServerGroupServerIpInventory {
  id?: number;
  serverGroupUuid?: string;
  ipAddress?: string;
  weight?: number;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface LoadBalancerServerGroupVmNicRefInventory {
  id?: number;
  serverGroupUuid?: string;
  vmNicUuid?: string;
  weight?: number;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface LocalStorageResourceRefInventory {
  resourceUuid?: string;
  primaryStorageUuid?: string;
  hostUuid?: string;
  size?: number;
  resourceType?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface LogServerInventory {
  uuid?: string;
  name?: string;
  description?: string;
  category?: any;
  type?: any;
  level?: any;
  state?: any;
  configuration?: string;
  accountUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface LoginAuthenticationProcedureDesc {
  order?: number;
  name?: string;
  properties?: any;
}

export interface LongJobInventory {
  uuid?: string;
  name?: string;
  description?: string;
  apiId?: string;
  jobName?: string;
  jobData?: string;
  jobResult?: string;
  state?: LongJobState;
  targetResourceUuid?: string;
  managementNodeUuid?: string;
  parentUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  executeTime?: number;
}

export interface LunInventory {
  name?: string;
  uuid?: string;
  wwid?: string;
  vendor?: string;
  model?: string;
  wwn?: string;
  serial?: string;
  type?: string;
  hctl?: string;
  path?: string;
  state?: string;
  size?: number;
  multipathDeviceUuid?: string;
  source?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ManagementNodeInventory {
  uuid?: string;
  hostName?: string;
  joinDate?: string;
  heartBeat?: string;
}

export interface MdevDeviceChooser {}

export interface AliyunNasFileSystemProperty {
  fileSystemId?: string;
  protocol?: string;
  storageType?: string;
  description?: string;
  createDate?: string;
}

export interface MdevDeviceInventory {
  uuid?: string;
  name?: string;
  description?: string;
  parentUuid?: string;
  mttyUuid?: string;
  hostUuid?: string;
  vmInstanceUuid?: string;
  mdevSpecUuid?: string;
  type?: MdevDeviceType;
  state?: MdevDeviceState;
  status?: MdevDeviceStatus;
  chooser?: MdevDeviceChooser;
  createDate?: string;
  lastOpDate?: string;
  vendor?: string;
}

export interface MdevDeviceSpecInventory {
  uuid?: string;
  name?: string;
  description?: string;
  specification?: string;
  type?: MdevDeviceType;
  state?: MdevDeviceSpecState;
  createDate?: string;
  lastOpDate?: string;
}

export interface MdevDeviceSpecState {}

export interface PubIpVipBandwidthSpending extends SpendingDetails {
  vipIp?: string;
  bandwidthInInventory?: any[];
  bandwidthOutInventory?: any[];
}

export interface MdevDeviceStatus {}

export interface EcsSecurityGroupRuleInventory {
  uuid?: string;
  ecsSecurityGroupUuid?: string;
  protocol?: string;
  portRange?: string;
  cidrIp?: string;
  priority?: string;
  direction?: string;
  nicType?: string;
  policy?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface MdevDeviceType {}

export interface VCenterInventory {
  uuid?: string;
  name?: string;
  description?: string;
  domainName?: string;
  port?: number;
  userName?: string;
  zoneUuid?: string;
  version?: string;
  https?: boolean;
  state?: string;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface MediaInventory {
  uuid?: string;
  name?: string;
  description?: string;
  type?: string;
  state?: string;
  lastOpDate?: string;
  createDate?: string;
}

export interface MetricDataHttpReceiverInventory {
  uuid?: string;
  name?: string;
  url?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
  state?: ReceiverState;
}

export interface MetricDatum extends Datapoint {
  metricName?: string;
}

export interface MetricRuleTemplateInventory {
  name?: string;
  monitorTemplateUuid?: string;
  comparisonOperator?: ComparisonOperator;
  period?: number;
  repeatInterval?: number;
  repeatCount?: number;
  namespace?: string;
  metricName?: string;
  threshold?: number;
  emergencyLevel?: EmergencyLevel;
  labels?: string;
  enableRecovery?: boolean;
  createDate?: string;
  lastOpDate?: string;
  uuid?: string;
}

export interface MetricStruct {
  namespace?: string;
  name?: string;
  description?: string;
  labelNames?: any[];
  driver?: string;
}

export interface MetricTemplateInventory {
  uuid?: string;
  receiverUuid?: string;
  template?: string;
  namespace?: string;
  metricName?: string;
  labelsJsonStr?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface MiniCandidateHostStruct {
  hostName?: string;
  ipv4Address?: string;
  ipv6Address?: string;
  ipv4Interface?: string;
  ipv4CidrPrefix?: string;
  ipv4InterfaceBond?: string;
  ipv4Gateway?: string;
  managementVip?: string;
  ipmiIpv4Addr?: string;
  ipmiIpv4Gateway?: string;
  ipmiVlan?: string;
  ipv6Interface?: string;
  manufacturer?: string;
  product?: string;
  sn?: string;
}

export interface MiniHostInfo {
  sn?: string;
  dnsAddresses?: any[];
  ipmi?: any;
  mgmt?: any;
}

export interface MiniNetworkConfigStruct {
  gw?: string;
  ip?: string;
  vlan?: string;
  bond?: string;
}

export interface MiniStorageHostRefInventory {
  primaryStorageUuid?: string;
  hostUuid?: string;
  totalCapacity?: number;
  availableCapacity?: number;
  totalPhysicalCapacity?: number;
  availablePhysicalCapacity?: number;
  status?: PrimaryStorageHostStatus;
  createDate?: string;
  lastOpDate?: string;
}

export interface MiniStorageInventory extends PrimaryStorageInventory {
  miniStorageType?: MiniStorageType;
  diskIdentifier?: string;
}

export interface MiniStorageResourceReplicationInventory {
  uuid?: string;
  resourceUuid?: string;
  hostUuid?: string;
  primaryStorageUuid?: string;
  state?: ReplicationState;
  type?: string;
  role?: ReplicationRole;
  networkStatus?: ReplicationNetworkStatus;
  diskStatus?: ReplicationDiskStatus;
  size?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface MiniStorageType {}

export interface PortForwardingRuleInventory {
  uuid?: string;
  name?: string;
  description?: string;
  vipIp?: string;
  guestIp?: string;
  vipUuid?: string;
  vipPortStart?: number;
  vipPortEnd?: number;
  privatePortStart?: number;
  privatePortEnd?: number;
  vmNicUuid?: string;
  protocolType?: string;
  state?: string;
  allowedCidr?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface MirrorNetworkUsedIpInventory {
  usedIpInventory?: UsedIpInventory;
  l3NetworkUuid?: string;
  hostUuid?: string;
  description?: string;
  clusterUuid?: string;
  uuid?: string;
}

export interface MonInfo {
  hostname?: string;
  port?: number;
}

export interface MonitorGroupAlarmInventory {
  groupUuid?: string;
  alarmUuid?: string;
  metricRuleTemplateUuid?: string;
  createDate?: string;
  uuid?: string;
}

export interface MonitorGroupEventSubscriptionInventory {
  groupUuid?: string;
  eventSubscriptionUuid?: string;
  eventRuleTemplateUuid?: string;
  createDate?: string;
  uuid?: string;
}

export interface MonitorGroupInstanceInventory {
  groupUuid?: string;
  instanceResourceType?: string;
  instanceUuid?: string;
  status?: AlarmStatus;
  createDate?: string;
  lastOpDate?: string;
  uuid?: string;
}

export interface MonitorGroupInventory {
  name?: string;
  state?: MonitorGroupState;
  actions?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
  uuid?: string;
  monitorGroupTemplateRefs?: any[];
}

export interface MonitorGroupTemplateRefInventory {
  uuid?: string;
  templateUuid?: string;
  groupUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  isApplied?: boolean;
}

export interface MonitorTemplateInventory {
  uuid?: string;
  name?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
  monitorGroupTemplateRefs?: any[];
}

export interface MonitorTriggerActionInventory {
  uuid?: string;
  name?: string;
  description?: string;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
  type?: string;
  triggerUuids?: any[];
}

export interface MonitorTriggerInventory {
  name?: string;
  uuid?: string;
  expression?: string;
  recoveryExpression?: string;
  description?: string;
  status?: string;
  state?: string;
  duration?: number;
  targetResourceUuid?: string;
  lastStatusChangeTime?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface MttyDeviceInventory {
  uuid?: string;
  name?: string;
  description?: string;
  hostUuid?: string;
  type?: MttyDeviceType;
  state?: MttyDeviceState;
  virtStatus?: MttyDeviceVirtStatus;
  createDate?: string;
  lastOpDate?: string;
}

export interface MulticastRouteInventory {
  sourceAddress?: string;
  groupAddress?: string;
  ingressInterfaces?: string;
  egressInterfaces?: string;
}

export interface MulticastRouterInventory {
  uuid?: string;
  description?: string;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
  rpGroups?: any[];
  vpcVrs?: any[];
}

export interface MulticastRouterRendezvousPointInventory {
  uuid?: string;
  multicastRouterUuid?: string;
  rpAddress?: string;
  groupAddress?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface MulticastRouterVpcVRouterRefInventory {
  uuid?: string;
  vpcRouterUuid?: string;
}

export interface MultipathTopologyStruct {
  lunUuid?: string;
  devices?: any[];
}

export interface NasFileSystemInventory {
  uuid?: string;
  protocol?: NasProtocolType;
  type?: string;
  name?: string;
  description?: string;
  fileSystemId?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface NasMountTargetInventory {
  uuid?: string;
  name?: string;
  description?: string;
  mountDomain?: string;
  nasFileSystemUuid?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface Neighbor {
  id?: string;
  priority?: string;
  state?: string;
  deadTime?: string;
  neighborAddress?: string;
  device?: string;
}

export interface NetworkReachablePair {
  sourceHostname?: string;
  targetHostname?: string;
  status?: HostConnectedStatus;
}

export interface NetworkRouterAreaRefInventory {
  uuid?: string;
  vRouterUuid?: string;
  applianceVmType?: string;
  routerAreaUuid?: string;
  l3NetworkUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface NetworkRouterFlowMeterRefInventory {
  uuid?: string;
  vRouterUuid?: string;
  flowMeterUuid?: string;
  l3NetworkUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface NetworkServiceL3NetworkRefInventory {
  l3NetworkUuid?: string;
  networkServiceProviderUuid?: string;
  networkServiceType?: string;
}

export interface NetworkServiceProviderInventory {
  uuid?: string;
  name?: string;
  description?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
  networkServiceTypes?: any;
  attachedL2NetworkUuids?: any;
}

export interface NicTO extends BaseVirtualDeviceTO {
  mac?: string;
  ips?: any[];
  bridgeName?: string;
  physicalInterface?: string;
  uuid?: string;
  nicInternalName?: string;
  deviceId?: number;
  metaData?: string;
  useVirtio?: boolean;
  bootOrder?: number;
  mtu?: number;
  driverType?: string;
  vHostAddOn?: any;
  pci?: any;
  type?: string;
  state?: string;
  vlanId?: string;
  pciDeviceAddress?: string;
  ipForTf?: string;
  l2NetworkUuid?: string;
  srcPath?: string;
  cleanTraffic?: boolean;
}

export interface NkpInventory extends KeyProviderInventory {
  kdf?: string;
  saltPolicy?: string;
  backedUp?: boolean;
  currentVersion?: number;
}

export interface NodeRolesItemView {
  uuid?: string;
  resourceType?: string;
  role?: string;
}

export interface NodeRolesView {
  uuid?: string;
  resourceType?: string;
  roles?: any[];
}

export interface NonAPIParam {}

export interface PciDevicePassThroughState {}

export interface NormalIpRangeInventory extends IpRangeInventory {

}

export interface NvmeLunHostRefInventory {
  nvmeLunUuid?: string;
  hostUuid?: string;
  path?: string;
  hctl?: string;
  locate?: string;
  transport?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface NvmeLunInventory extends LunInventory {
  nvmeTargetUuid?: string;
  nvmeLunHostRefs?: any[];
}

export interface NvmeServerClusterRefInventory {
  nvmeServerUuid?: string;
  clusterUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface NvmeServerInventory {
  uuid?: string;
  name?: string;
  ip?: string;
  port?: number;
  state?: string;
  transport?: string;
  nvmeTargets?: any[];
  nvmeClusterRefs?: any[];
  createDate?: string;
  lastOpDate?: string;
}

export interface NvmeTargetInventory {
  uuid?: string;
  name?: string;
  nqn?: string;
  nvmeServerUuid?: string;
  state?: string;
  nvmeLuns?: any[];
  createDate?: string;
  lastOpDate?: string;
}

export interface OAuth2ClientInventory extends ThirdPartyAccountSourceInventory {
  clientId?: string;
  clientSecret?: string;
  grantType?: string;
  loginMNUrl?: string;
  redirectUrl?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userinfoUrl?: string;
  logoutUrl?: string;
  usernameProperty?: string;
}

export interface OAuth2TokenInventory extends SSOTokenInventory {
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
}

export interface OssBucketInventory {
  uuid?: string;
  bucketName?: string;
  dataCenterUuid?: string;
  current?: string;
  regionName?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface OssBucketProperty {
  bucketName?: string;
  regionId?: string;
}

export interface OvfCdDriverInfo {
  autoAllocation?: boolean;
  driverType?: string;
  subType?: string;
  name?: string;
}

export interface OvfCpuInfo {
  instanceId?: string;
  quantity?: number;
  coresPerSocket?: number;
}

export interface OvfDiskInfo {
  index?: number;
  diskId?: string;
  fileRef?: string;
  fileName?: string;
  format?: string;
  populatedSize?: number;
  capacity?: number;
}

export interface OvfEthernetAdapterInfo {
  networkName?: string;
  nicModel?: string;
  nicName?: string;
  autoAllocation?: boolean;
}

export interface OvfInfo {
  disks?: any[];
  networks?: any[];
  cpu?: any;
  memory?: any;
  vmName?: string;
  os?: any;
  systemInfo?: any;
  nics?: any[];
  cdDrivers?: any[];
  volumes?: any[];
}

export interface OvfMemoryInfo {
  instanceId?: string;
  quantity?: number;
}

export interface OvfOSInfo {
  id?: number;
  version?: string;
  osType?: string;
  description?: string;
}

export interface OvfSystemInfo {
  virtualSystemType?: string;
  firmwareType?: string;
}

export interface OvfVolumeInfo {
  name?: string;
  diskId?: string;
  driverType?: string;
}

export interface Pagination {
  start?: number;
  limit?: number;
  total?: number;
}

export interface Param {}

export interface FaultToleranceVmGroupInventory extends VmInstanceInventory {
  primaryVmInstanceUuid?: string;
  secondaryVmInstanceUuid?: string;
  status?: string;
}

export interface PciDeviceBillingInventory extends BillingInventory {
  vmName?: string;
}

export interface PciDeviceChooser {}

export interface BackupStorageInventory {
  uuid?: string;
  name?: string;
  url?: string;
  description?: string;
  totalCapacity?: number;
  availableCapacity?: number;
  type?: string;
  state?: string;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
  attachedZoneUuids?: any[];
}

export interface PciDeviceInventory {
  uuid?: string;
  name?: string;
  description?: string;
  hostUuid?: string;
  parentUuid?: string;
  vmInstanceUuid?: string;
  pciSpecUuid?: string;
  type?: PciDeviceType;
  state?: PciDeviceState;
  status?: PciDeviceStatus;
  virtStatus?: PciDeviceVirtStatus;
  passThroughState?: any;
  chooser?: PciDeviceChooser;
  vendorId?: string;
  vendor?: string;
  deviceId?: string;
  device?: string;
  subvendorId?: string;
  subdeviceId?: string;
  pciDeviceAddress?: string;
  iommuGroup?: string;
  metaData?: any;
  createDate?: string;
  lastOpDate?: string;
  matchedPciDeviceOfferingRef?: any[];
  mdevSpecRefs?: any[];
}

export interface PciDeviceMdevSpecRefInventory {
  pciDeviceUuid?: string;
  mdevSpecUuid?: string;
  effective?: boolean;
  createDate?: string;
  lastOpDate?: string;
}

export interface PciDeviceMetaData {
  metaData?: string;
  metaDataEntries?: any[];
}

export interface PciDeviceMetaDataEntry {
  key?: string;
  op?: PciDeviceMetaDataOperator;
  value?: string;
}

export interface PciDeviceMetaDataOperator {}

export interface VirtualRouterOfferingInventory extends InstanceOfferingInventory {
  managementNetworkUuid?: string;
  publicNetworkUuid?: string;
  zoneUuid?: string;
  isDefault?: boolean;
  imageUuid?: string;
}

export interface PciDeviceOfferingInstanceOfferingRefInventory {
  id?: number;
  instanceOfferingUuid?: string;
  pciDeviceOfferingUuid?: string;
  metadata?: any;
  pciDeviceCount?: number;
}

export interface PciDeviceOfferingInventory {
  uuid?: string;
  name?: string;
  description?: string;
  type?: PciDeviceOfferingType;
  vendorId?: string;
  deviceId?: string;
  subvendorId?: string;
  subdeviceId?: string;
  ramSize?: string;
  createDate?: string;
  lastOpDate?: string;
  attachedInstanceOfferings?: any[];
  matchedPciDevices?: any[];
}

export interface PciDeviceOfferingType {}

export interface DataCenterInventory {
  uuid?: string;
  deleted?: string;
  regionName?: string;
  dcType?: HybridType;
  regionId?: string;
  description?: string;
  endpoint?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface PciDevicePciDeviceOfferingRefInventory {
  pciDeviceUuid?: string;
  pciDeviceOfferingUuid?: string;
}

export interface PciDeviceSpecInventory {
  uuid?: string;
  name?: string;
  description?: string;
  vendorId?: string;
  vendor?: string;
  deviceId?: string;
  device?: string;
  subvendorId?: string;
  subdeviceId?: string;
  ramSize?: string;
  maxPartNum?: number;
  type?: PciDeviceType;
  state?: PciDeviceSpecState;
  isVirtual?: boolean;
  romVersion?: string;
  romMd5sum?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface PciDeviceSpending extends SpendingDetails {
  sizeInventory?: any[];
}

export interface PciDeviceSpendingInventory {
  startTime?: number;
  endTime?: number;
  spending?: number;
  vmName?: string;
}

export interface PendingTaskInfo extends TaskInfo {}

export interface DRSVmMigrationActivityInventory {
  drsUuid?: string;
  uuid?: string;
  vmUuid?: string;
  vmSourceHostUuid?: string;
  vmTargetHostUuid?: string;
  status?: string;
  result?: string;
  reason?: string;
  adviceUuid?: string;
  cause?: string;
  endDate?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface PhysicalDriveSmartSelfTestHistoryInventory {
  id?: number;
  raidPhysicalDriveUuid?: string;
  runningState?: RunningState;
  testResult?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface PolicyRouteRuleInventory {
  uuid?: string;
  ruleNumber?: number;
  ruleSetUuid?: string;
  tableUuid?: string;
  destIp?: string;
  sourceIp?: string;
  destPort?: string;
  sourcePort?: string;
  protocol?: PolicyRouteRuleProtocol;
  state?: PolicyRouteRuleState;
  createDate?: string;
  lastOpDate?: string;
}

export interface PolicyRouteRuleProtocol {}

export interface ResourceStackInventory {
  uuid?: string;
  name?: string;
  description?: string;
  version?: string;
  type?: string;
  templateContent?: string;
  paramContent?: string;
  status?: string;
  reason?: string;
  outputs?: string;
  enableRollback?: boolean;
  createDate?: string;
  lastOpDate?: string;
}

export interface PolicyRouteRuleSetInventory {
  uuid?: string;
  name?: string;
  description?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
  rules?: any[];
  l3Refs?: any[];
}

export interface PolicyRouteRuleSetL3RefInventory {
  id?: number;
  l3NetworkUuid?: string;
  ruleSetUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface PolicyRouteRuleSetVRouterRefInventory {
  id?: number;
  vRouterUuid?: string;
  ruleSetUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface PolicyRouteTableInventory {
  uuid?: string;
  tableNumber?: number;
  description?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
  routes?: any[];
}

export interface PolicyRouteTableRouteEntryInventory {
  uuid?: string;
  tableUuid?: string;
  destinationCidr?: string;
  nextHopIp?: string;
  distance?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface PolicyRouteTableVRouterRefInventory {
  id?: number;
  tableUuid?: string;
  vRouterUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface PortForwardingRuleInventory {
  uuid?: string;
  name?: string;
  description?: string;
  vipIp?: string;
  guestIp?: string;
  vipUuid?: string;
  vipPortStart?: number;
  vipPortEnd?: number;
  privatePortStart?: number;
  privatePortEnd?: number;
  vmNicUuid?: string;
  protocolType?: string;
  state?: string;
  allowedCidr?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface PortGroupInventory extends L3NetworkInventory {
  vSwitchUuid?: string;
  vlanMode?: any;
  vlanId?: number;
  vlanRanges?: string;
}

export interface PortGroupVlanMode {}

export interface LicenseAddOnInventory extends LicenseInventory {
  name?: string;
  modules?: any[];
}

export interface PortMirrorInventory {
  uuid?: string;
  name?: string;
  description?: string;
  state?: PortMirrorState;
  mirrorNetworkUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  sessions?: any[];
}

export interface PortMirrorSessionInventory {
  uuid?: string;
  name?: string;
  description?: string;
  status?: SessionStatus;
  internalId?: number;
  srcEndPoint?: string;
  type?: SessionType;
  dstEndPoint?: string;
  portMirrorUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface PortMirrorState {}

export interface SmartDataStruct {
  id?: number;
  attributeName?: string;
  flag?: string;
  value?: number;
  worst?: number;
  thresh?: number;
  type?: string;
  updated?: string;
  whenFailed?: string;
  rawValue?: number;
  state?: string;
}

export interface PreconfigurationTemplateInventory {
  uuid?: string;
  name?: string;
  description?: string;
  distribution?: string;
  type?: string;
  content?: string;
  md5sum?: string;
  isPredefined?: boolean;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
  customParams?: any;
}

export interface PreviewResourceStruct {
  actions?: any[];
  conditions?: any;
}

export interface Price {
  resourceName?: string;
  resourceUnit?: string;
  timeUnit?: string;
  price?: number;
  dateInLong?: number;
  systemTags?: any[];
}

export interface PriceBareMetal2ChassisOfferingRefInventory {
  priceUuid?: string;
  bareMetal2ChassisOfferingUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface PriceInventory {
  uuid?: string;
  resourceName?: string;
  resourceUnit?: string;
  timeUnit?: string;
  price?: number;
  dateInLong?: number;
  endDateInLong?: number;
  createDate?: string;
  lastOpDate?: string;
  tableUuid?: string;
  pciDeviceOfferings?: any[];
}

export interface PricePciDeviceOfferingRefInventory {
  priceUuid?: string;
  pciDeviceOfferingUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface PriceTableInventory {
  uuid?: string;
  name?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface PrimaryStorageHostStatus {}

export interface VmNicSecurityPolicyInventory {
  vmNicUuid?: string;
  ingressPolicy?: string;
  egressPolicy?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface PrimaryStorageInventory {
  uuid?: string;
  zoneUuid?: string;
  name?: string;
  url?: string;
  description?: string;
  totalCapacity?: number;
  availableCapacity?: number;
  totalPhysicalCapacity?: number;
  availablePhysicalCapacity?: number;
  systemUsedCapacity?: number;
  type?: string;
  state?: string;
  status?: string;
  mountPath?: string;
  createDate?: string;
  lastOpDate?: string;
  attachedClusterUuids?: any[];
}

export interface ProgressProperty {
  progress?: string;
  stage?: string;
}

export interface PubIpVipBandwidthInBillingInventory extends BillingInventory {
  vipIp?: string;
  bandwidthSize?: number;
}

export interface PubIpVipBandwidthOutBillingInventory extends BillingInventory {
  vipIp?: string;
  bandwidthSize?: number;
}

export interface PubIpVmNicBandwidthInBillingInventory extends BillingInventory {
  vmNicIp?: string;
  bandwidthSize?: number;
}

export interface PubIpVmNicBandwidthOutBillingInventory extends BillingInventory {
  vmNicIp?: string;
  bandwidthSize?: number;
}

export interface PubIpVmNicBandwidthSpending extends SpendingDetails {
  vmNicIp?: string;
  bandwidthInInventory?: any[];
  bandwidthOutInventory?: any[];
}

export interface QuotaInventory {
  uuid?: string;
  name?: string;
  identityUuid?: string;
  identityType?: string;
  value?: number;
  lastOpDate?: string;
  createDate?: string;
}

export interface QuotaUsage {
  name?: string;
  total?: number;
  used?: number;
}

export interface RaidControllerInventory {
  name?: string;
  uuid?: string;
  description?: string;
  productName?: string;
  sasAddress?: string;
  hostUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  adapterNumber?: number;
  raidPhysicalDrives?: any[];
}

export interface RaidPhysicalDriveInventory {
  uuid?: string;
  name?: string;
  raidLevel?: string;
  raidControllerUuid?: string;
  description?: string;
  enclosureDeviceId?: number;
  slotNumber?: number;
  deviceId?: number;
  diskGroup?: number;
  wwn?: string;
  serialNumber?: string;
  deviceModel?: string;
  size?: number;
  driveState?: string;
  locateStatus?: LocateStatus;
  driveType?: string;
  mediaType?: string;
  rotationRate?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface ReceiverState {}

export interface MetricDataHttpReceiverInventory {
  uuid?: string;
  name?: string;
  url?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
  state?: ReceiverState;
}

export interface RedirectUrlTemplate {
  urlTemplate?: string;
  name?: string;
  description?: string;
}

export interface RemoteVtepInventory {
  uuid?: string;
  vtepIp?: string;
  port?: number;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
  poolUuid?: string;
}

export interface RemovalInstanceRuleInventory extends AutoScalingRuleInventory {
  removalPolicy?: string;
  adjustmentType?: string;
  adjustmentValue?: number;
}

export interface ReplicationDiskStatus {}

export interface LoadBalancerListenerCertificateRefInventory {
  id?: number;
  listenerUuid?: string;
  certificateUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ReplicationGroupState {}

export interface ResourceConfigInventory {
  uuid?: string;
  resourceUuid?: string;
  resourceType?: string;
  name?: string;
  description?: string;
  category?: string;
  value?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ReplicationNetworkStatus {}

export interface BlockDevice {
  name?: string;
  type?: string;
  size?: number;
  used?: number;
  available?: number;
  physicalSector?: number;
  logicalSector?: number;
  mountPoint?: string;
  children?: any[];
  partitionTable?: string;
  fsType?: string;
  serialNumber?: string;
  model?: string;
  mediaType?: string;
  usedRatio?: number;
  smartPassed?: boolean;
  smartMessage?: string;
}

export interface ReplicationState {}

export interface LoadBalancerListerAcl {
  aclUuid?: string;
  listenerUuid?: string;
  serverGroupUuids?: any[];
}

export interface ReservedIpRangeInventory {
  uuid?: string;
  l3NetworkUuid?: string;
  name?: string;
  description?: string;
  startIp?: string;
  endIp?: string;
  ipVersion?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface ResourceAttributeConstraintInventory {
  id?: number;
  keyUuid?: string;
  type?: string;
  parameter?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ResourceAttributeKeyInventory {
  uuid?: string;
  name?: string;
  description?: string;
  resourceTypes?: any[];
  createDate?: string;
  lastOpDate?: string;
  constraints?: any[];
}

export interface ResourceAttributeValueInventory {
  keyUuid?: string;
  key?: ResourceAttributeKeyInventory;
  value?: string;
  resourceUuid?: string;
  resourceType?: string;
  createDate?: string;
}

export interface ResourceBindableConfigStruct {
  name?: string;
  category?: string;
  description?: string;
  bindResourceTypes?: any[];
}

export interface ResourceConfigInventory {
  uuid?: string;
  resourceUuid?: string;
  resourceType?: string;
  name?: string;
  description?: string;
  category?: string;
  value?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ResourceConfigStruct {
  value?: string;
  effectiveConfigs?: any[];
  name?: string;
}

export interface ResourceEnsembleInventory {
  masterUuid?: string;
  masterResourceName?: string;
  masterResourceType?: string;
  members?: any[];
}

export interface ResourceExternalBackupInfo {
  uuid?: string;
  name?: string;
  state?: ResourceBackupState;
  installPath?: string;
  createDate?: string;
}

export interface ResourceInventory {
  uuid?: string;
  resourceName?: string;
  resourceType?: string;
}

export interface ResourceSpending {
  resourceType?: string;
  resourceUuid?: string;
  resourceName?: string;
  spending?: number;
  startTime?: number;
  endTime?: number;
}

export interface ResourceStackInventory {
  uuid?: string;
  name?: string;
  description?: string;
  version?: string;
  type?: string;
  templateContent?: string;
  paramContent?: string;
  status?: string;
  reason?: string;
  outputs?: string;
  enableRollback?: boolean;
  createDate?: string;
  lastOpDate?: string;
}

export interface ResourceStruct {
  resourceName?: string;
  resourceType?: string;
  deletePolicy?: string;
  description?: string;
  inDegree?: any;
  action?: string;
  properties?: any;
  results?: any;
  type?: ResourceType;
  created?: boolean;
  mockFailed?: boolean;
}

export interface RestInfo {}

export interface UsbDeviceInventory {
  uuid?: string;
  name?: string;
  description?: string;
  hostUuid?: string;
  vmInstanceUuid?: string;
  state?: UsbDeviceState;
  busNum?: string;
  devNum?: string;
  idVendor?: string;
  idProduct?: string;
  iManufacturer?: string;
  iProduct?: string;
  iSerial?: string;
  usbVersion?: string;
  attachType?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface RoleAccountRefInventory {
  roleUuid?: string;
  accountUuid?: string;
  accountPermissionFrom?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface RoleInventory {
  uuid?: string;
  name?: string;
  description?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
  policies?: any[];
}

export interface RootVolumeBillingInventory extends BillingInventory {
  vmInstanceUuid?: string;
  volumeSize?: number;
}

export interface RootVolumeSpending extends SpendingDetails {
  sizeInventory?: any[];
}

export interface RootVolumeSpendingInventory {
  startTime?: number;
  endTime?: number;
  spending?: number;
  volumeSize?: number;
}

export interface RouterAreaInventory {
  uuid?: string;
  areaId?: string;
  type?: string;
  authentication?: string;
  password?: string;
  keyId?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface RunningTaskInfo extends TaskInfo {}

export interface Threshold {
  thresholdName?: string;
  thresholdValue?: string;
  operator?: string;
}

export interface SNSApplicationEndpointInventory {
  name?: string;
  uuid?: string;
  description?: string;
  type?: string;
  state?: string;
  platformUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  connectionStatus?: string;
  platform?: SNSApplicationPlatformInventory;
}

export interface SNSApplicationPlatformInventory {
  uuid?: string;
  name?: string;
  description?: string;
  state?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface SNSDingTalkAtPersonInventory {
  uuid?: string;
  phoneNumber?: string;
  endpointUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  remark?: string;
}

export interface SNSDingTalkEndpointInventory extends SNSApplicationEndpointInventory {
  url?: string;
  atAll?: boolean;
  secret?: string;
  atPersonPhoneNumbers?: any[];
  atPersonList?: any[];
}

export interface SNSEmailAddressInventory {
  uuid?: string;
  emailAddress?: string;
  endpointUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface SNSEmailEndpointInventory extends SNSApplicationEndpointInventory {
  email?: string;
  emailAddresses?: any[];
}

export interface SNSEmailPlatformInventory extends SNSApplicationPlatformInventory {
  smtpServer?: string;
  smtpPort?: number;
  username?: string;
}

export interface SNSEndpointThirdpartyAlertHistoryInventory {
  alertUuid?: string;
  endpointUuid?: string;
  subscriptionUuid?: string;
  createDate?: string;
}

export interface SNSFeiShuAtPersonInventory {
  uuid?: string;
  userId?: string;
  endpointUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  remark?: string;
}

export interface SNSFeiShuEndpointInventory extends SNSApplicationEndpointInventory {
  url?: string;
  atAll?: boolean;
  atPersonUserIds?: any[];
  atPersonList?: any[];
  secret?: string;
}

export interface SNSHttpEndpointInventory extends SNSApplicationEndpointInventory {
  url?: string;
  username?: string;
}

export interface SNSMicrosoftTeamsEndpointInventory extends SNSApplicationEndpointInventory {
  url?: string;
}

export interface SNSSmsEndpointInventory extends SNSApplicationEndpointInventory {
  receivers?: any[];
}

export interface SNSSmsReceiverInventory {
  uuid?: string;
  phoneNumber?: string;
  endpointUuid?: string;
  type?: SmsReceiverType;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface SNSSnmpPlatformInventory extends SNSApplicationPlatformInventory {
  snmpAddress?: string;
  snmpPort?: number;
}

export interface SNSSubscriberInventory {
  topicUuid?: string;
  endpointUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface SNSTextTemplateInventory {
  uuid?: string;
  name?: string;
  description?: string;
  applicationPlatformType?: string;
  subject?: string;
  recoverySubject?: string;
  template?: string;
  recoveryTemplate?: string;
  defaultTemplate?: boolean;
  createDate?: string;
  lastOpDate?: string;
  type?: string;
}

export interface SNSTopicInventory {
  uuid?: string;
  name?: string;
  description?: string;
  state?: string;
  locale?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface SNSWeComAtPersonInventory {
  uuid?: string;
  userId?: string;
  endpointUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  remark?: string;
}

export interface SNSWeComEndpointInventory extends SNSApplicationEndpointInventory {
  url?: string;
  atAll?: boolean;
  atPersonUserIds?: any[];
  atPersonList?: any[];
}

export interface SSORedirectTemplateInventory {
  uuid?: string;
  name?: string;
  description?: string;
  clientUuid?: string;
  redirectTemplate?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface SSOTokenInventory {
  uuid?: string;
  clientUuid?: string;
  userUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface SchedulerJobGroupInventory {
  uuid?: string;
  name?: string;
  description?: string;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
  jobType?: string;
  jobData?: string;
  zoneUuid?: string;
  triggersUuid?: any[];
  jobsUuid?: any[];
}

export interface SchedulerJobGroupJobRefInventory {
  schedulerJobGroupUuid?: string;
  schedulerJobUuid?: string;
  priority?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface SchedulerJobGroupSchedulerTriggerRefInventory {
  schedulerJobGroupUuid?: string;
  schedulerTriggerUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface SchedulerJobHistoryInventory {
  id?: number;
  triggerUuid?: string;
  schedulerJobUuid?: string;
  schedulerJobGroupUuid?: string;
  jobType?: string;
  startTime?: string;
  executeTime?: number;
  targetResourceUuid?: string;
  requestDump?: string;
  resultDump?: string;
  success?: boolean;
  fireInstanceId?: string;
}

export interface SchedulerJobInventory {
  uuid?: string;
  targetResourceUuid?: string;
  name?: string;
  description?: string;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
  jobData?: string;
  jobClassName?: string;
  triggersUuid?: any[];
  schedulerJobGroupUuids?: any[];
}

export interface SchedulerJobSchedulerTriggerInventory {
  uuid?: string;
  schedulerJobUuid?: string;
  schedulerTriggerUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface SchedulerTriggerInventory {
  uuid?: string;
  name?: string;
  description?: string;
  cron?: string;
  schedulerType?: string;
  schedulerInterval?: number;
  repeatCount?: number;
  startTime?: string;
  stopTime?: string;
  createDate?: string;
  lastOpDate?: string;
  jobsUuid?: any[];
  jobGroupsUuid?: any[];
}

export interface ScsiLunClusterStatusInventory {
  attachedHosts?: any[];
  unattachedHosts?: any[];
  isAllHostsAttached?: boolean;
}

export interface ScsiLunHostRefInventory {
  scsiLunUuid?: string;
  hostUuid?: string;
  path?: string;
  hctl?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ScsiLunInventory extends LunInventory {
  scsiLunHostRefs?: any[];
  scsiLunVmInstanceRefs?: any[];
}

export interface ScsiLunVmInstanceRefInventory {
  scsiLunUuid?: string;
  vmInstanceUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  deviceId?: number;
  attachMultipath?: boolean;
}

export interface SdnControllerInventory {
  uuid?: string;
  vendorType?: string;
  name?: string;
  description?: string;
  ip?: string;
  username?: string;
  password?: string;
  createDate?: string;
  lastOpDate?: string;
  vniRanges?: any[];
  vxlanPools?: any[];
}

export interface SdnVniRange {
  startVni?: number;
  endVni?: number;
}

export interface SecretResourcePoolInventory {
  uuid?: string;
  zoneUuid?: string;
  name?: string;
  type?: string;
  description?: string;
  state?: string;
  status?: string;
  model?: string;
  heartbeatInterval?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface SecurityGroupIngressRuleTO extends SecurityGroupRuleInventory {
  friendCidrs?: any[];
}

export interface SecurityGroupInventory {
  uuid?: string;
  name?: string;
  description?: string;
  state?: string;
  ipVersion?: number;
  createDate?: string;
  lastOpDate?: string;
  rules?: any[];
  attachedL3NetworkUuids?: any;
}

export interface SecurityGroupRuleInventory {
  uuid?: string;
  securityGroupUuid?: string;
  type?: string;
  ipVersion?: number;
  protocol?: string;
  state?: string;
  priority?: number;
  description?: string;
  srcIpRange?: string;
  dstIpRange?: string;
  srcPortRange?: string;
  dstPortRange?: string;
  action?: string;
  remoteSecurityGroupUuid?: string;
  allowedCidr?: string;
  startPort?: number;
  endPort?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface SecurityMachineInventory {
  uuid?: string;
  zoneUuid?: string;
  name?: string;
  secretResourcePoolUuid?: string;
  description?: string;
  managementIp?: string;
  type?: string;
  model?: string;
  state?: string;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface Sensor {
  name?: string;
  value?: string;
  status?: string;
  type?: string;
  classification?: string;
}

export interface ServiceTypeStatisticData {
  interfaceUuid?: string;
  interfaceName?: string;
  vlanId?: number;
  serviceTypes?: any[];
  hostUuid?: string;
  hostName?: string;
  hostIp?: string;
  clusterUuid?: string;
  clusterName?: string;
  zoneUuid?: string;
  createDate?: string;
}

export interface SessionInventory {
  uuid?: string;
  accountUuid?: string;
  userUuid?: string;
  userType?: string;
  expiredDate?: string;
  createDate?: string;
}

export interface SftpBackupStorageInventory extends BackupStorageInventory {
  hostname?: string;
  username?: string;
  sshPort?: number;
}

export interface ShareableVolumeVmInstanceRefInventory {
  uuid?: string;
  volumeUuid?: string;
  vmInstanceUuid?: string;
  deviceId?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface SharedBlockCandidateStruct {
  wwid?: string;
  vendor?: string;
  model?: string;
  wwn?: string;
  serial?: string;
  hctl?: string;
  type?: string;
  path?: string;
  size?: number;
  source?: string;
  transport?: string;
  targetIdentifier?: string;
}

export interface SharedBlockGroupPrimaryStorageHostRefInventory {
  primaryStorageUuid?: string;
  hostUuid?: string;
  hostId?: number;
  status?: PrimaryStorageHostStatus;
  createDate?: string;
  lastOpDate?: string;
}

export interface SharedBlockGroupPrimaryStorageInventory extends PrimaryStorageInventory {
  sharedBlocks?: any[];
  sharedBlockGroupType?: SharedBlockGroupType;
}

export interface SharedBlockGroupType {}

export interface ExternalBackupInventory {
  uuid?: string;
  name?: string;
  description?: string;
  state?: ExternalBackupState;
  installPath?: string;
  totalSize?: number;
  version?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface SharedBlockInventory {
  uuid?: string;
  sharedBlockGroupUuid?: string;
  type?: SharedBlockType;
  diskUuid?: string;
  name?: string;
  description?: string;
  state?: SharedBlockState;
  status?: SharedBlockStatus;
  createDate?: string;
  lastOpDate?: string;
  totalCapacity?: number;
  availableCapacity?: number;
  vendor?: string;
}

export interface SharedBlockState {}

export interface NormalIpRangeInventory extends IpRangeInventory {}

export interface SimulatorHostInventory extends HostInventory {
  memoryCapacity?: number;
  cpuCapacity?: number;
}

export interface SkippedResources {
  vmInstances?: any;
}

export interface SlbGroupInventory {
  uuid?: string;
  name?: string;
  backendType?: string;
  deployType?: string;
  slbOfferingUuid?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
  slbVms?: any[];
  lbs?: any[];
  networks?: any[];
}

export interface SlbGroupL3NetworkRefInventory {
  slbGroupUuid?: string;
  l3NetworkUuid?: string;
  l3NetworkCategory?: string;
  l3NetworkType?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface SlbLoadBalancerInventory extends LoadBalancerInventory {
  slbGroupUuid?: string;
}

export interface SlbOfferingInventory extends InstanceOfferingInventory {
  managementNetworkUuid?: string;
  zoneUuid?: string;
  imageUuid?: string;
}

export interface SlbVmInstanceInventory extends VirtualRouterVmInventory {
  slbGroupUuid?: string;
}

export interface SmsReceiverType {}

export interface SNSSmsEndpointInventory extends SNSApplicationEndpointInventory {
  receivers?: any[];
}

export interface SnapShotSpendingInventory {
  startTime?: number;
  endTime?: number;
  spending?: number;
  snapshotSize?: number;
}

export interface SnapshotLeafInventory {
  inventory?: VolumeSnapshotInventory;
  parentUuid?: string;
  children?: any[];
}

export interface SnapshotSpending extends SpendingDetails {
  sizeInventory?: any[];
}

export interface SnmpAgentInventory {
  uuid?: string;
  version?: string;
  readCommunity?: string;
  userName?: string;
  authAlgorithm?: string;
  authPassword?: string;
  privacyAlgorithm?: string;
  privacyPassword?: string;
  port?: number;
  status?: string;
  securityLevel?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface SoftwarePackageInventory {
  uuid?: string;
  name?: string;
  hostUuid?: string;
  managementNodeUuid?: string;
  installPath?: string;
  unzipInstallPath?: string;
  type?: string;
  md5sum?: string;
  status?: string;
  size?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface Spending {
  spendingType?: string;
  spending?: number;
  hypervisorTypeSpending?: any;
  dateStart?: number;
  dateEnd?: number;
  details?: any[];
}

export interface SpendingDetails {
  resourceUuid?: string;
  resourceName?: string;
  spending?: number;
  hypervisorType?: string;
  type?: string;
}

export interface SshKeyPairInventory {
  uuid?: string;
  name?: string;
  description?: string;
  publicKey?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface SshPrivateKeyPairInventory {
  uuid?: string;
  name?: string;
  description?: string;
  publicKey?: string;
  createDate?: string;
  lastOpDate?: string;
  privateKey?: string;
}

export interface StackParameters {
  paramName?: string;
  type?: string;
  defaultValue?: string;
  description?: string;
  noEcho?: boolean;
  label?: string;
  constraintDescription?: string;
  resourceType?: string;
}

export interface StackTemplateInventory {
  uuid?: string;
  name?: string;
  description?: string;
  type?: string;
  version?: string;
  state?: boolean;
  content?: string;
  md5sum?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface SupportedResourceStruct {
  name?: string;
  type?: string;
  actionName?: string;
  resources?: any[];
}

export interface SystemTagInventory extends TagInventory {
  inherent?: boolean;
}

export interface Tag {
  name?: string;
  value?: string;
}

export interface TagInventory {
  uuid?: string;
  resourceUuid?: string;
  resourceType?: string;
  tag?: string;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface TagPatternInventory {
  uuid?: string;
  name?: string;
  value?: string;
  description?: string;
  color?: string;
  type?: TagPatternType;
  createDate?: string;
  lastOpDate?: string;
}

export interface TagPatternType {}

export interface FlowCounter {
  device?: string;
  totalEntries?: string;
  totalPkts?: string;
  totalBytes?: string;
}

export interface TaskInfo {
  name?: string;
  className?: string;
  index?: number;
  pendingTime?: number;
  executionTime?: number;
  context?: string;
  apiId?: string;
  apiName?: string;
  contextList?: any[];
}

export interface TaskProgressInventory {
  apiId?: string;
  content?: string;
  opaque?: any;
  createTime?: number;
  lastOpTime?: number;
  currentStep?: number;
  totalStep?: number;
  taskUuid?: string;
  taskName?: string;
  parentUuid?: string;
  type?: string;
  time?: number;
  arguments?: string;
}

export interface TemplateConfigInventory {
  templateUuid?: string;
  category?: string;
  name?: string;
  defaultValue?: string;
  value?: string;
}

export interface TemplatedVmInstanceInventory {
  uuid?: string;
  name?: string;
  zoneUuid?: string;
  accountUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ThirdPartyAccountSourceInventory {
  uuid?: string;
  name?: string;
  description?: string;
  type?: string;
  createAccountStrategy?: string;
  updateAccountStrategies?: any[];
  deleteAccountStrategy?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ThirdpartyOriginalAlertInventory {
  uuid?: string;
  thirdpartyPlatformUuid?: string;
  product?: string;
  service?: string;
  metric?: string;
  alertLevel?: string;
  alertTime?: string;
  dimensions?: string;
  message?: string;
  dataSource?: string;
  sourceText?: string;
  readStatus?: string;
  createDate?: string;
}

export interface ThirdpartyPlatformInventory {
  uuid?: string;
  name?: string;
  type?: string;
  url?: string;
  template?: string;
  state?: string;
  description?: string;
  lastSyncDate?: string;
  lastOpDate?: string;
  createDate?: string;
}

export interface TpmInventory {
  uuid?: string;
  name?: string;
  vmInstanceUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface TwoFactorAuthenticationSecretInventory {
  uuid?: string;
  secret?: string;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
  accountUuid?: string;
}

export interface UKeyInventory {
  managementNodeUuid?: string;
  status?: UKeyStatus;
  keyId?: string;
}

export interface UpdateLicenseView {
  license?: string;
  error?: any;
  handleBy?: string;
}

export interface UplinkGroupInventory extends L2NetworkHostRefInventory {
  interfaceName?: string;
  type?: any;
  bondingUuid?: string;
  interfaceUuid?: string;
}

export interface UplinkGroupType {}

export interface VpcVirtualRouterInventory {
  uuid?: string;
  vrId?: string;
  vpcUuid?: string;
  name?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface UsageReport {
  usedPhysicalCapacitiesForecast?: any[];
  usedPhysicalCapacitiesHistory?: any[];
  totalPhysicalCapacitiesHistory?: any[];
  startTime?: number;
  interval?: number;
}

export interface UsbDeviceInventory {
  uuid?: string;
  name?: string;
  description?: string;
  hostUuid?: string;
  vmInstanceUuid?: string;
  state?: UsbDeviceState;
  busNum?: string;
  devNum?: string;
  idVendor?: string;
  idProduct?: string;
  iManufacturer?: string;
  iProduct?: string;
  iSerial?: string;
  usbVersion?: string;
  attachType?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface UsbDeviceState {}

export interface AliyunNasAccessRuleInventory {
  uuid?: string;
  accessGroupUuid?: string;
  sourceCidr?: string;
  rule?: string;
  priority?: number;
  userAccess?: string;
  ruleId?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface UsedIpInventory {
  uuid?: string;
  ipRangeUuid?: string;
  l3NetworkUuid?: string;
  ipVersion?: number;
  ip?: string;
  netmask?: string;
  gateway?: string;
  usedFor?: string;
  ipInLong?: number;
  vmNicUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface UserTagInventory extends TagInventory {
  tagPatternUuid?: string;
  tagPattern?: TagPatternInventory;
}

export interface VCenterBackupStorageInventory extends BackupStorageInventory {
  vCenterUuid?: string;
  datastore?: string;
}

export interface VCenterClusterInventory extends ClusterInventory {
  vCenterUuid?: string;
  morval?: string;
  dataCenterUuid?: string;
}

export interface VCenterDatacenterInventory {
  uuid?: string;
  vCenterUuid?: string;
  name?: string;
  morval?: string;
}

export interface VCenterInventory {
  uuid?: string;
  name?: string;
  description?: string;
  domainName?: string;
  port?: number;
  userName?: string;
  zoneUuid?: string;
  version?: string;
  https?: boolean;
  state?: string;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VCenterPrimaryStorageInventory extends PrimaryStorageInventory {
  vCenterUuid?: string;
  datastore?: string;
}

export interface VCenterResourcePoolInventory {
  uuid?: string;
  vCenterClusterUuid?: string;
  name?: string;
  morVal?: string;
  parentUuid?: string;
  CPULimit?: number;
  CPUOverheadLimit?: number;
  CPUReservation?: number;
  CPUShares?: number;
  CPULevel?: string;
  memoryLimit?: number;
  memoryOverheadLimit?: number;
  memoryReservation?: number;
  memoryShares?: number;
  memoryLevel?: string;
  createDate?: string;
  lastOpDate?: string;
  subResources?: any[];
}

export interface VCenterResourcePoolUsageInventory {
  uuid?: string;
  vCenterResourcePoolUuid?: string;
  resourceUuid?: string;
  resourceType?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VHostAddOn {
  queueNum?: number;
  rxBufferSize?: string;
  txBufferSize?: string;
}

export interface VRouterRouteEntryAO {
  destination?: string;
  target?: string;
  type?: VRouterRouteEntryType;
  status?: string;
  distance?: number;
  uuid?: string;
  description?: string;
}

export interface VRouterRouteEntryInventory {
  uuid?: string;
  description?: string;
  type?: VRouterRouteEntryType;
  routeTableUuid?: string;
  destination?: string;
  target?: string;
  distance?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface VRouterRouteTableInventory {
  uuid?: string;
  name?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
  attachedRouterRefs?: any[];
  routeEntries?: any[];
}

export interface VdiPortInfo {
  vncPort?: number;
  spicePort?: number;
  spiceTlsPort?: number;
}

export interface VipBandwidthSpendingDetails {
  startTime?: number;
  endTime?: number;
  spending?: number;
  bandwidthSize?: number;
}

export interface VipInventory {
  uuid?: string;
  name?: string;
  description?: string;
  l3NetworkUuid?: string;
  ip?: string;
  state?: string;
  gateway?: string;
  netmask?: string;
  prefixLen?: number;
  serviceProvider?: string;
  peerL3NetworkUuids?: any[];
  servicesRefs?: any[];
  useFor?: string;
  system?: boolean;
  createDate?: string;
  lastOpDate?: string;
}

export interface VipNetworkServicesRefInventory {
  uuid?: string;
  serviceType?: string;
  vipUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VipPortRangeInventory {
  uuid?: string;
  protocol?: string;
  usedPorts?: any[];
}

export interface VipQosInventory {
  uuid?: string;
  vipUuid?: string;
  port?: number;
  inboundBandwidth?: number;
  outboundBandwidth?: number;
  type?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VirtualBorderRouterInventory {
  uuid?: string;
  vbrId?: string;
  vlanInterfaceId?: string;
  status?: string;
  dataCenterUuid?: string;
  vlanId?: string;
  physicalConnectionStatus?: string;
  circuitCode?: string;
  localGatewayIp?: string;
  peerGatewayIp?: string;
  peeringSubnetMask?: string;
  physicalConnectionId?: string;
  accessPointUuid?: string;
  name?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VirtualRouterOfferingInventory extends InstanceOfferingInventory {
  managementNetworkUuid?: string;
  publicNetworkUuid?: string;
  zoneUuid?: string;
  isDefault?: boolean;
  imageUuid?: string;
}

export interface VirtualRouterSoftwareVersionInventory {
  uuid?: string;
  softwareName?: string;
  currentVersion?: string;
  latestVersion?: string;
}

export interface VirtualRouterVRouterRouteTableRefInventory {
  virtualRouterVmUuid?: string;
  routeTableUuid?: string;
}

export interface VirtualRouterVmInventory extends ApplianceVmInventory {
  publicNetworkUuid?: string;
  virtualRouterVips?: any[];
}

export interface VirtualizerInfo {
  hypervisor?: string;
  currentVersion?: string;
  expectVersion?: string;
  matchState?: HypervisorVersionState;
}

export interface VirtualizerInfoInventory {
  uuid?: string;
  resourceType?: string;
  infoList?: any[];
  error?: any[];
}

export interface VmCPUBillingInventory extends BillingInventory {
  cpuNum?: number;
}

export interface VmCPUSpendingDetails extends VmSpendingDetails {
  cpuNum?: number;
}

export interface VmCapabilities {
  supportLiveMigration?: boolean;
  supportVolumeMigration?: boolean;
  supportReimage?: boolean;
  supportMemorySnapshot?: boolean;
}

export interface VmCdRomInventory {
  uuid?: string;
  vmInstanceUuid?: string;
  deviceId?: number;
  occupant?: string;
  isoUuid?: string;
  isoInstallPath?: string;
  name?: string;
  description?: string;
  protocol?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VmCustomSpecificationInventory {
  uuid?: string;
  vmInstanceUuid?: string;
  name?: string;
  description?: string;
  platform?: string;
  hostname?: string;
  generateSID?: boolean;
  domainMode?: any;
  domainName?: string;
  domainUsername?: string;
  organization?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VmDnsInventory {
  vmInstanceUuid?: string;
  vmNicUuid?: string;
  dns?: string;
  ipVersion?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface VmExternalBackupInfo extends ResourceExternalBackupInfo {
  liveBackup?: boolean;
  volumes?: any[];
  totalSize?: number;
}

export interface VmHostFileInventory {
  uuid?: string;
  vmInstanceUuid?: string;
  hostUuid?: string;
  type?: string;
  path?: string;
  lastSyncReason?: string;
  changeDate?: string;
  lastSyncDate?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VmInstanceInventory {
  uuid?: string;
  name?: string;
  description?: string;
  zoneUuid?: string;
  clusterUuid?: string;
  imageUuid?: string;
  hostUuid?: string;
  lastHostUuid?: string;
  instanceOfferingUuid?: string;
  rootVolumeUuid?: string;
  platform?: string;
  architecture?: string;
  defaultL3NetworkUuid?: string;
  type?: string;
  hypervisorType?: string;
  memorySize?: number;
  reservedMemorySize?: number;
  cpuNum?: number;
  cpuSpeed?: number;
  allocatorStrategy?: string;
  createDate?: string;
  lastOpDate?: string;
  state?: string;
  vmNics?: any[];
  allVolumes?: any[];
  vmCdRoms?: any[];
  guestOsType?: string;
}

export interface VmInstanceMdevDeviceSpecRefInventory {
  vmInstanceUuid?: string;
  mdevSpecUuid?: string;
  mdevDeviceNumber?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface VmInstancePciDeviceSpecRefInventory {
  vmInstanceUuid?: string;
  pciSpecUuid?: string;
  pciDeviceNumber?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface VmInstanceResourceMetadataArchiveInventory {
  id?: number;
  resourceUuid?: string;
  vmInstanceUuid?: string;
  deviceAddress?: string;
  addressGroupUuid?: string;
  metadata?: string;
  metadataClass?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VmInstanceResourceMetadataGroupInventory {
  uuid?: string;
  resourceUuid?: string;
  vmInstanceUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  addressList?: any[];
}

export interface VmMemoryBillingInventory extends BillingInventory {
  memorySize?: number;
}

export interface VmMemorySpendingDetails extends VmSpendingDetails {
  memorySize?: number;
}

export interface VmNicBandwidthSpendingDetails {
  startTime?: number;
  endTime?: number;
  spending?: number;
  bandwidthSize?: number;
}

export interface VmNicConflictEntry {
  ip?: string;
  mac?: string;
  vmNicName?: string;
  vmInstanceName?: string;
  vmInstanceUuid?: string;
}

export interface VmNicInventory {
  uuid?: string;
  vmInstanceUuid?: string;
  l3NetworkUuid?: string;
  ip?: string;
  mac?: string;
  hypervisorType?: string;
  netmask?: string;
  gateway?: string;
  metaData?: string;
  driverType?: string;
  usedIps?: any[];
  internalName?: string;
  deviceId?: number;
  type?: string;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VmNicSecurityGroupRefInventory {
  priority?: number;
  vmNicUuid?: string;
  securityGroupUuid?: string;
  vmInstanceUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VmNicSecurityPolicyInventory {
  vmNicUuid?: string;
  ingressPolicy?: string;
  egressPolicy?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VmPriorityConfigInventory {
  uuid?: string;
  accountUuid?: string;
  level?: VmPriorityLevel;
  cpuShares?: number;
  oomScoreAdj?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface VmSchedHistoryInventory {
  id?: number;
  vmInstanceUuid?: string;
  accountUuid?: string;
  schedType?: string;
  schedReason?: string;
  failReason?: string;
  success?: boolean;
  lastHostUuid?: string;
  destHostUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  zoneUuid?: string;
}

export interface VmSchedulingRuleGroupInventory {
  uuid?: string;
  name?: string;
  description?: string;
  appliance?: string;
  zoneUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VmSchedulingRuleInventory extends AffinityGroupInventory {
  rule?: string;
  mode?: string;
}

export interface VmSpending extends SpendingDetails {
  cpuInventory?: any[];
  memoryInventory?: any[];
  rootVolumeInventory?: any[];
}

export interface VmSpendingDetails {
  startTime?: number;
  endTime?: number;
  spending?: number;
}

export interface VmVdpaNicInventory extends VmNicInventory {
  pciDeviceUuid?: string;
  lastPciDeviceUuid?: string;
  srcPath?: string;
}

export interface VmVfNicInventory extends VmNicInventory {
  pciDeviceUuid?: string;
  haState?: string;
}

export interface VniRangeInventory {
  uuid?: string;
  name?: string;
  description?: string;
  startVni?: number;
  endVni?: number;
  createDate?: string;
  lastOpDate?: string;
  l2NetworkUuid?: string;
}

export interface VolumeBackupInventory {
  uuid?: string;
  volumeUuid?: string;
  name?: string;
  description?: string;
  type?: string;
  state?: string;
  status?: string;
  size?: number;
  metadata?: string;
  groupUuid?: string;
  mode?: BackupMode;
  vmInstanceUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  backupStorageRefs?: any[];
}

export interface VolumeBackupStorageRefInventory {
  volumeBackupUuid?: string;
  backupStorageUuid?: string;
  installPath?: string;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VolumeCbtBackupInfo {
  volume?: any;
  bitmapBase64?: string;
  target?: string;
  scratchNodeName?: string;
  metadata?: string;
  nbdPort?: number;
  nbdServer?: string;
  mode?: string;
  bitmapName?: string;
}

export interface VolumeExternalBackupInfo extends ResourceExternalBackupInfo {
  vmInstanceUuid?: string;
  type?: string;
  size?: number;
}

export interface VolumeFormatReplyStruct {
  format?: string;
  masterHypervisorType?: string;
  supportingHypervisorTypes?: any[];
}

export interface VolumeInventory {
  uuid?: string;
  name?: string;
  description?: string;
  primaryStorageUuid?: string;
  vmInstanceUuid?: string;
  diskOfferingUuid?: string;
  rootImageUuid?: string;
  installPath?: string;
  type?: string;
  format?: string;
  size?: number;
  actualSize?: number;
  deviceId?: number;
  state?: string;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
  isShareable?: boolean;
  volumeQos?: string;
  lastDetachDate?: string;
  lastVmInstanceUuid?: string;
  lastAttachDate?: string;
  protocol?: string;
}

export interface VolumeSnapshotBackupStorageRefInventory {
  volumeSnapshotUuid?: string;
  backupStorageUuid?: string;
  installPath?: string;
}

export interface VolumeSnapshotGroupAvailability {
  uuid?: string;
  available?: boolean;
  reason?: string;
}

export interface VolumeSnapshotGroupInventory {
  uuid?: string;
  snapshotCount?: number;
  name?: string;
  description?: string;
  vmInstanceUuid?: string;
  createDate?: string;
  lastOpDate?: string;
  volumeSnapshotRefs?: any[];
}

export interface VolumeSnapshotGroupRefInventory {
  volumeSnapshotUuid?: string;
  volumeSnapshotGroupUuid?: string;
  deviceId?: number;
  snapshotDeleted?: boolean;
  volumeUuid?: string;
  volumeName?: string;
  volumeType?: string;
  volumeSnapshotInstallPath?: string;
  volumeSnapshotName?: string;
  createDate?: string;
  lastOpDate?: string;
  volumeLastAttachDate?: string;
}

export interface VolumeSnapshotInventory {
  uuid?: string;
  name?: string;
  description?: string;
  type?: string;
  volumeUuid?: string;
  treeUuid?: string;
  parentUuid?: string;
  primaryStorageUuid?: string;
  primaryStorageInstallPath?: string;
  volumeType?: string;
  format?: string;
  latest?: boolean;
  size?: number;
  distance?: number;
  state?: string;
  status?: string;
  createDate?: string;
  lastOpDate?: string;
  backupStorageRefs?: any[];
  groupUuid?: string;
}

export interface VolumeSnapshotReferenceTreeInventory extends ResourceInventory {
  primaryStorageUuid?: string;
  hostUuid?: string;
  rootImageUuid?: string;
  rootVolumeUuid?: string;
  rootVolumeSnapshotUuid?: string;
  rootVolumeSnapshotTreeUuid?: string;
  rootInstallUrl?: string;
}

export interface VolumeSnapshotTreeInventory {
  uuid?: string;
  volumeUuid?: string;
  current?: boolean;
  status?: string;
  tree?: SnapshotLeafInventory;
  createDate?: string;
  lastOpDate?: string;
}

export interface VolumeTO extends BaseVirtualDeviceTO {
  installPath?: string;
  deviceId?: number;
  deviceType?: string;
  volumeUuid?: string;
  useVirtio?: boolean;
  useVirtioSCSI?: boolean;
  useSCSI?: boolean;
  shareable?: boolean;
  cacheMode?: string;
  aioNative?: boolean;
  wwn?: string;
  bootOrder?: number;
  physicalBlockSize?: number;
  type?: string;
  format?: string;
  primaryStorageType?: string;
  multiQueues?: string;
  ioThreadId?: number;
  ioThreadPin?: string;
  controllerIndex?: number;
}

export interface VpcFirewallInventory {
  uuid?: string;
  name?: string;
  refs?: any[];
  createDate?: string;
  lastOpDate?: string;
  description?: string;
}

export interface VpcFirewallIpSetTemplateInventory {
  name?: string;
  sourceValue?: string;
  destValue?: string;
  type?: IpSetType;
  createDate?: string;
  lastOpDate?: string;
  accountUuid?: string;
  uuid?: string;
}

export interface VpcFirewallRuleInventory {
  uuid?: string;
  ruleSetUuid?: string;
  action?: string;
  protocol?: string;
  destPort?: string;
  sourcePort?: string;
  sourceIp?: string;
  destIp?: string;
  ruleNumber?: number;
  allowStates?: string;
  tcpFlag?: string;
  icmpTypeName?: string;
  isApplied?: boolean;
  expired?: boolean;
  state?: string;
  isDefault?: boolean;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VpcFirewallRuleSetInventory {
  uuid?: string;
  name?: string;
  actionType?: ActionType;
  description?: string;
  isDefault?: boolean;
  isApplied?: boolean;
  createDate?: string;
  lastOpDate?: string;
  rules?: any[];
}

export interface VpcFirewallRuleSetL3RefInventory {
  id?: number;
  ruleSetUuid?: string;
  l3NetworkUuid?: string;
  vpcFirewallUuid?: string;
  packetsForwardType?: PacketsForwardType;
  createDate?: string;
  lastOpDate?: string;
}

export interface VpcFirewallRuleTemplateInventory {
  action?: ActionType;
  protocol?: ProtocolType;
  name?: string;
  destPort?: string;
  sourcePort?: string;
  sourceIp?: string;
  destIp?: string;
  allowStates?: string;
  tcpFlag?: string;
  icmpTypeName?: string;
  ruleNumber?: number;
  enableLog?: boolean;
  state?: FirewallRuleState;
  isDefault?: boolean;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
  accountUuid?: string;
  uuid?: string;
}

export interface VpcFirewallVRouterRefInventory {
  id?: number;
  vpcFirewallUuid?: string;
  vRouterUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VpcHaGroupApplianceVmRefInventory {
  uuid?: string;
  vpcHaRouterUuid?: string;
}

export interface VpcHaGroupInventory {
  uuid?: string;
  name?: string;
  description?: string;
  monitors?: any[];
  vrRefs?: any[];
  services?: any[];
  usedIps?: any[];
  createDate?: string;
  lastOpDate?: string;
}

export interface VpcHaGroupMonitorIpInventory {
  id?: number;
  vpcHaRouterUuid?: string;
  monitorIp?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VpcHaGroupNetworkServiceRefInventory {
  id?: number;
  vpcHaRouterUuid?: string;
  networkServiceName?: string;
  networkServiceUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VpcHaGroupVipRefInventory {
  id?: number;
  vpcHaRouterUuid?: string;
  vipUuid?: string;
  l3NetworkUuid?: string;
  ip?: string;
  netmask?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VpcRouterDnsInventory {
  id?: number;
  vpcRouterUuid?: string;
  dns?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VpcRouterVmInventory extends VirtualRouterVmInventory {
  dns?: any[];
  haRef?: any[];
}

export interface VpcSnatStateInventory {
  uuid?: string;
  vpcUuid?: string;
  l3NetworkUuid?: string;
  state?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VpcUserVpnGatewayInventory {
  uuid?: string;
  accountName?: string;
  dataCenterUuid?: string;
  type?: HybridType;
  gatewayId?: string;
  ip?: string;
  name?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VpcVirtualRouteEntryInventory {
  uuid?: string;
  type?: string;
  vRouterType?: string;
  status?: string;
  destinationCidrBlock?: string;
  nextHopId?: string;
  virtualRouterUuid?: string;
  nextHopType?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VpcVpnConnectionInventory {
  uuid?: string;
  accountName?: string;
  type?: HybridType;
  name?: string;
  status?: string;
  description?: string;
  connectionId?: string;
  userGatewayUuid?: string;
  vpnGatewayUuid?: string;
  localSubnet?: string;
  remoteSubnet?: string;
  ikeConfigUuid?: string;
  ipsecConfigUuid?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VpcVpnGatewayInventory {
  uuid?: string;
  accountName?: string;
  type?: HybridType;
  gatewayId?: string;
  vSwitchUuid?: string;
  publicIp?: string;
  spec?: string;
  name?: string;
  description?: string;
  status?: string;
  businessStatus?: string;
  createDate?: string;
  endDate?: string;
  lastOpDate?: string;
}

export interface VpcVpnIkeConfigStruct {
  Psk?: string;
  IkeVersion?: string;
  IkeMode?: string;
  IkeEncAlg?: string;
  IkeAuthAlg?: string;
  IkePfs?: string;
  IkeLifetime?: number;
  LocalId?: string;
  RemoteId?: string;
}

export interface VpcVpnIpSecConfigInventory {
  uuid?: string;
  accountName?: string;
  name?: string;
  encodeAlgorithm?: string;
  authAlgorithm?: string;
  pfs?: string;
  lifetime?: number;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface VpcVpnIpSecConfigStruct {
  IpsecEncAlg?: string;
  IpsecAuthAlg?: string;
  IpsecPfs?: string;
  IpsecLifetime?: number;
}

export interface VtepInventory {
  uuid?: string;
  hostUuid?: string;
  vtepIp?: string;
  port?: number;
  type?: string;
  physicalInterface?: string;
  createDate?: string;
  lastOpDate?: string;
  poolUuid?: string;
}

export interface WebhookInventory {
  uuid?: string;
  name?: string;
  description?: string;
  url?: string;
  type?: string;
  opaque?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface XDragonHostInventory extends KVMHostInventory {
  totalPhysicalMemory?: number;
}

export interface XmlHookInventory {
  uuid?: string;
  name?: string;
  description?: string;
  type?: XmlHookType;
  hookScript?: string;
  libvirtVersion?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface XskyBlockVolumeInventory extends BlockVolumeInventory {
  accessPathId?: number;
  accessPathIqn?: string;
  xskyStatus?: string;
  xskyBlockVolumeId?: number;
  burstTotalBw?: number;
  burstTotalIops?: number;
  maxTotalBw?: number;
  maxTotalIops?: number;
}

export interface ZBoxBackupInventory extends ExternalBackupInventory {
  zBoxUuid?: string;
}

export interface ZBoxBackupStorageBackupInfo extends BackupStorageExternalBackupInfo {}

export interface SnapShotSpendingInventory {
  startTime?: number;
  endTime?: number;
  spending?: number;
  snapshotSize?: number;
}

export interface ZBoxInventory {
  uuid?: string;
  name?: string;
  state?: ZBoxState;
  status?: ZBoxStatus;
  locationRefs?: any[];
  mountPath?: string;
  totalCapacity?: number;
  availableCapacity?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface ZBoxLocationRefInventory {
  id?: number;
  zboxUuid?: string;
  resourceUuid?: string;
  resourceType?: string;
}

export interface ZBoxVmBackupInfo extends VmExternalBackupInfo {}

export interface AccessControlRuleInventory {
  uuid?: string;
  name?: string;
  description?: string;
  rule?: string;
  strategy?: ControlStrategy;
  createDate?: string;
  lastOpDate?: string;
}

export interface ZBoxVolumeBackupInfo extends VolumeExternalBackupInfo {}

export interface InfoSecSecretResourcePoolInventory extends SecretResourcePoolInventory {
  connectionMode?: number;
  activatedToken?: string;
  protectToken?: string;
  hmacToken?: string;
}

export interface ZQLQueryReturn {
  inventories?: any[];
  inventoryCounts?: any;
  total?: number;
  returnWith?: any;
  name?: string;
}

export interface ZSClient {}

export interface VpcVpnIkeConfigInventory {
  uuid?: string;
  accountName?: string;
  name?: string;
  psk?: string;
  version?: string;
  mode?: string;
  encodeAlgorithm?: string;
  authAlgorithm?: string;
  pfs?: string;
  lifetime?: number;
  localIp?: string;
  remoteIp?: string;
  description?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ZSConfig {}

export interface PacketsForwardType {}

export interface ZStoneClusterView {
  uuid?: string;
  first?: boolean;
  managementNetworkCidr?: string;
  publicNetworkCidr?: string;
  clusterNetworkCidr?: string;
  chronyIp?: string;
  type?: string;
  hosts?: any;
  pools?: any;
}

export interface ZStoneHostSummaryView {
  count?: number;
  adminIps?: any[];
}

export interface ZStoneInventory {
  uuid?: string;
  name?: string;
  username?: string;
  managementIp?: string;
  authorizationServer?: string;
  logInPort?: number;
  apiPort?: number;
  logInUrl?: string;
  createDate?: string;
  lastOpDate?: string;
}

export interface ZStoneLicenseInventory {
  issuedTime?: string;
  expiredTime?: string;
  expired?: boolean;
  licenseType?: string;
  prodInfo?: string;
  productVersion?: string;
  licenseAttr?: string;
  cpuNum?: number;
  usedCpuNum?: number;
  hostNum?: number;
  usedHostNum?: number;
  capacity?: number;
  usedCapacity?: number;
}

export interface ZStoneLicenseView {
  platform?: ZStoneLicenseInventory;
  addOns?: any[];
}

export interface ZStonePoolSummaryView {
  count?: number;
  totalCapacity?: number;
  inventories?: any[];
}

export interface ZceXClusterView {
  managementNetworkCidr?: string;
  gatewayNetworkCidr?: string;
  publicNetworkCidr?: string;
  clusterNetworkCidr?: string;
  hosts?: any;
  pools?: any;
}

export interface ZceXHostSummaryView {
  count?: number;
  adminIps?: any[];
}

export interface ZceXInventory {
  uuid?: string;
  name?: string;
  managementIp?: string;
  apiPort?: number;
  createDate?: string;
  lastOpDate?: string;
}

export interface ZceXLicenseView {
  platform?: any;
}

export interface ZceXPlatformLicenseView {
  issuedTime?: string;
  expiredTime?: string;
  fsId?: string;
  relatedClusterId?: string;
  expired?: boolean;
}

export interface ZceXPoolSummaryView {
  count?: number;
  totalCapacity?: number;
  inventories?: any[];
}

export interface ZceXSystemView {
  adminUserName?: string;
  adminUserId?: string;
  version?: string;
}

export interface ZceXThirdPartyPlatformAlertRefInventory {
  zceXUuid?: string;
  thirdPartyPlatformUuid?: string;
  createDate?: string;
}

export interface ZoneInventory {
  uuid?: string;
  name?: string;
  description?: string;
  state?: string;
  type?: string;
  isDefault?: boolean;
  createDate?: string;
  lastOpDate?: string;
}