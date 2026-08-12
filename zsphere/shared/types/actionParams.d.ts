export interface AddAccessControlListEntryActionParam {
  aclUuid: string;
  entries: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAccessControlListToLoadBalancerActionParam {
  aclUuids: any[];
  aclType: string;
  listenerUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAccessControlRuleActionParam {
  name: string;
  description?: string;
  rule: string;
  controlStrategy: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddActionToAlarmActionParam {
  alarmUuid: string;
  actionUuid: string;
  actionType: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddActionToEventSubscriptionActionParam {
  subscriptionUuid: string;
  actionUuid: string;
  actionType: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAliyunEbsBackupStorageActionParam {
  ossBucketUuid: string;
  url?: string;
  name: string;
  description?: string;
  type?: string;
  importImages?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAliyunEbsPrimaryStorageActionParam {
  panguPartitionUuid?: string;
  identityZoneUuid?: string;
  defaultIoType?: string;
  tdcConfigContent: string;
  url: string;
  name: string;
  description?: string;
  type?: string;
  zoneUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAliyunKeySecretActionParam {
  name: string;
  key: string;
  secret: string;
  accountUuid?: string;
  description?: string;
  sync?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAliyunNasAccessGroupActionParam {
  dataCenterUuid: string;
  groupName: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAliyunNasFileSystemActionParam {
  fileSystemId: string;
  name: string;
  dataCenterUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAliyunNasMountTargetActionParam {
  nasFSUuid: string;
  name: string;
  mountDomain: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAliyunNasPrimaryStorageActionParam {
  nasUuid: string;
  accessGroupUuid: string;
  vSwitchUuid?: string;
  url: string;
  name: string;
  description?: string;
  type?: string;
  zoneUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAliyunPanguPartitionActionParam {
  name: string;
  description?: string;
  identityZoneUuid: string;
  appName: string;
  partitionName: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAppBuildSystemActionParam {
  url: string;
  name: string;
  description?: string;
  storageType?: string;
  username: string;
  password: string;
  hostname: string;
  sshPort?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAttributesToIAM2OrganizationActionParam {
  uuid: string;
  attributes: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAttributesToIAM2ProjectActionParam {
  uuid: string;
  attributes: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAttributesToIAM2VirtualIDActionParam {
  uuid: string;
  attributes: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddAttributesToIAM2VirtualIDGroupActionParam {
  uuid: string;
  attributes: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddBackupStoragesToReplicationGroupActionParam {
  replicationGroupUuid: string;
  backupStorageUuids: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddBuildAppActionParam {
  url: string;
  type?: string;
  backupStorageUuid?: string;
  hostname?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddCephBackupStorageActionParam {
  monUrls: any[];
  poolName?: string;
  url?: string;
  name: string;
  description?: string;
  type?: string;
  importImages?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddCephPrimaryStorageActionParam {
  monUrls: any[];
  rootVolumePoolName?: string;
  dataVolumePoolName?: string;
  imageCachePoolName?: string;
  url?: string;
  name: string;
  description?: string;
  type?: string;
  zoneUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddCephPrimaryStoragePoolActionParam {
  primaryStorageUuid: string;
  poolName: string;
  aliasName?: string;
  description?: string;
  type: string;
  isCreate?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddCertificateToLoadBalancerListenerActionParam {
  certificateUuid: string;
  listenerUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddConnectionAccessPointFromRemoteActionParam {
  dataCenterUuid: string;
  accessPointId: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddDataCenterFromRemoteActionParam {
  regionId: string;
  type: string;
  syncZones?: boolean;
  endpoint?: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddDisasterImageStoreBackupStorageActionParam {
  attachPoint?: string;
  endPoint?: string;
  hostname: string;
  username: string;
  password: string;
  sshPort?: number;
  url: string;
  name: string;
  description?: string;
  type?: string;
  importImages?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddDnsToL3NetworkActionParam {
  l3NetworkUuid: string;
  dns: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddDnsToVpcRouterActionParam {
  uuid: string;
  dns: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddEmailAddressToSNSEmailEndpointActionParam {
  emailAddress: string;
  endpointUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddHostRouteToL3NetworkActionParam {
  l3NetworkUuid: string;
  prefix: string;
  nexthop: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddHybridKeySecretActionParam {
  name: string;
  key: string;
  secret: string;
  accountUuid?: string;
  description?: string;
  type: string;
  sync?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddIAM2TicketFlowActionParam {
  approverUuid: string;
  approverTitle?: string;
  name: string;
  description?: string;
  collectionUuid: string;
  parentFlowUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddIAM2VirtualIDsToGroupActionParam {
  virtualIDUuids: any[];
  groupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddIAM2VirtualIDsToOrganizationActionParam {
  virtualIDUuids: any[];
  organizationUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddIAM2VirtualIDsToProjectActionParam {
  projectUuid: string;
  virtualIDUuids: any[];
  roleUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddIdentityZoneFromRemoteActionParam {
  dataCenterUuid: string;
  zoneId?: string;
  type?: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddImageActionParam {
  name: string;
  description?: string;
  url: string;
  mediaType?: string;
  guestOsType?: string;
  system?: boolean;
  format?: string;
  platform?: string;
  backupStorageUuids: any[];
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddImageStoreBackupStorageActionParam {
  hostname: string;
  username: string;
  password: string;
  sshPort?: number;
  url: string;
  name: string;
  description?: string;
  type?: string;
  importImages?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddIpRangeActionParam {
  l3NetworkUuid: string;
  name: string;
  description?: string;
  startIp: string;
  endIp: string;
  netmask: string;
  gateway?: string;
  ipRangeType?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddIpRangeByNetworkCidrActionParam {
  name: string;
  description?: string;
  l3NetworkUuid: string;
  networkCidr: string;
  gateway?: string;
  ipRangeType?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddIpv6RangeActionParam {
  l3NetworkUuid: string;
  name: string;
  description?: string;
  startIp: string;
  endIp: string;
  gateway: string;
  prefixLen: number;
  addressMode: string;
  ipRangeType?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddIpv6RangeByNetworkCidrActionParam {
  name: string;
  description?: string;
  l3NetworkUuid: string;
  networkCidr: string;
  addressMode: string;
  ipRangeType?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddIscsiServerActionParam {
  name?: string;
  ip: string;
  port?: number;
  chapUserName?: string;
  chapUserPassword?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddKVMHostActionParam {
  username: string;
  password: string;
  sshPort?: number;
  name: string;
  description?: string;
  managementIp: string;
  clusterUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddKVMHostFromConfigFileActionParam {
  hostInfo: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddLabelToAlarmActionParam {
  alarmUuid: string;
  key: string;
  value: string;
  operator: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddLabelToEventSubscriptionActionParam {
  subscriptionUuid: string;
  key: string;
  value: string;
  operator: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddLdapServerActionParam {
  name: string;
  description?: string;
  url: string;
  base: string;
  username: string;
  password: string;
  encryption: string;
  scope: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddLocalPrimaryStorageActionParam {
  url: string;
  name: string;
  description?: string;
  type?: string;
  zoneUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddLogConfigurationActionParam {
  name: string;
  description?: string;
  type: string;
  configuration: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddMdevDeviceSpecToVmInstanceActionParam {
  mdevSpecUuid: string;
  vmInstanceUuid: string;
  mdevDeviceNumber?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddMiniStorageActionParam {
  diskIdentifier: string;
  url?: string;
  name: string;
  description?: string;
  type?: string;
  zoneUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddMonToCephBackupStorageActionParam {
  uuid: string;
  monUrls: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddMonToCephPrimaryStorageActionParam {
  uuid: string;
  monUrls: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddNfsPrimaryStorageActionParam {
  url: string;
  name: string;
  description?: string;
  type?: string;
  zoneUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddOssBucketFromRemoteActionParam {
  bucketName: string;
  dataCenterUuid: string;
  description?: string;
  ossDomain?: string;
  ossKey?: string;
  ossSecret?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddPciDeviceSpecToVmInstanceActionParam {
  pciSpecUuid: string;
  vmInstanceUuid: string;
  pciDeviceNumber?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddPolicyStatementsToRoleActionParam {
  uuid: string;
  statements: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddPreconfigurationTemplateActionParam {
  name: string;
  description?: string;
  distribution: string;
  type: string;
  content: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddRemoteCidrsToIPsecConnectionActionParam {
  uuid: string;
  peerCidrs: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddRendezvousPointToMulticastRouterActionParam {
  uuid: string;
  rpAddress: string;
  groupAddress: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddResourceStackVmPortMonitorActionParam {
  stackUuid?: string;
  vmInstanceUuid: string;
  port: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddRolesToIAM2VirtualIDActionParam {
  virtualIDUuid: string;
  roleUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddRolesToIAM2VirtualIDGroupActionParam {
  roleUuids: any[];
  groupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddSNSDingTalkAtPersonActionParam {
  phoneNumber: string;
  endpointUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddSNSSmsReceiverActionParam {
  phoneNumber: string;
  endpointUuid: string;
  type: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddSchedulerJobGroupToSchedulerTriggerActionParam {
  schedulerJobGroupUuid: string;
  schedulerTriggerUuid: string;
  triggerNow?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddSchedulerJobToSchedulerTriggerActionParam {
  schedulerJobUuid: string;
  schedulerTriggerUuid: string;
  triggerNow?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddSchedulerJobsToSchedulerJobGroupActionParam {
  schedulerJobGroupUuid: string;
  schedulerJobUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddSdnControllerActionParam {
  vendorType: string;
  name: string;
  description?: string;
  ip: string;
  userName: string;
  password: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddSecurityGroupRuleActionParam {
  securityGroupUuid: string;
  rules: any[];
  remoteSecurityGroupUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddSftpBackupStorageActionParam {
  hostname: string;
  username: string;
  password: string;
  sshPort?: number;
  url: string;
  name: string;
  description?: string;
  type?: string;
  importImages?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddSharedBlockGroupPrimaryStorageActionParam {
  diskUuids: any[];
  url?: string;
  name: string;
  description?: string;
  type?: string;
  zoneUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddSharedBlockToSharedBlockGroupActionParam {
  diskUuid: string;
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddSharedMountPointPrimaryStorageActionParam {
  url: string;
  name: string;
  description?: string;
  type?: string;
  zoneUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddSimulatorBackupStorageActionParam {
  totalCapacity?: number;
  availableCapacity?: number;
  url: string;
  name: string;
  description?: string;
  type?: string;
  importImages?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddSimulatorHostActionParam {
  memoryCapacity: number;
  cpuCapacity: number;
  name: string;
  description?: string;
  managementIp: string;
  clusterUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddSimulatorPrimaryStorageActionParam {
  totalCapacity?: number;
  availableCapacity?: number;
  availablePhysicalCapacity?: number;
  totalPhysicalCapacity?: number;
  url: string;
  name: string;
  description?: string;
  type?: string;
  zoneUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddStackTemplateActionParam {
  name: string;
  description?: string;
  type?: string;
  templateContent?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddThirdpartyPlatformActionParam {
  name: string;
  type: string;
  url: string;
  template: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddTicketTypesToTicketFlowCollectionActionParam {
  ticketFlowCollectionUuid: string;
  ticketTypeUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddUserToGroupActionParam {
  userUuid: string;
  groupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddV2VConversionHostActionParam {
  name: string;
  description?: string;
  type: string;
  hostUuid: string;
  storagePath: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddVCenterActionParam {
  username: string;
  password: string;
  zoneUuid: string;
  name: string;
  https?: boolean;
  port?: number;
  domainName: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddVRouterNetworksToFlowMeterActionParam {
  flowMeterUuid: string;
  vRouterUuid: string;
  l3NetworkUuids: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddVRouterNetworksToOspfAreaActionParam {
  routerAreaUuid: string;
  vRouterUuid: string;
  l3NetworkUuids: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddVRouterRouteEntryActionParam {
  description?: string;
  type?: string;
  routeTableUuid: string;
  destination: string;
  target?: string;
  distance?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddVmNicToLoadBalancerActionParam {
  vmNicUuids: any[];
  listenerUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddVmNicToSecurityGroupActionParam {
  securityGroupUuid: string;
  vmNicUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddVmToAffinityGroupActionParam {
  affinityGroupUuid: string;
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddXDragonHostActionParam {
  username: string;
  password: string;
  cpuNum?: number;
  cpuSockets?: number;
  totalPhysicalMemory?: number;
  sshPort?: number;
  name: string;
  description?: string;
  managementIp: string;
  clusterUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AddZBoxActionParam {
  usbDeviceUuid: string;
  name?: string;
  skipFormat?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ApplyDRSAdviceActionParam {
  adviceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ApplyRuleSetChangesActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ApplyTemplateConfigActionParam {
  templateUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachAliyunDiskToEcsActionParam {
  ecsUuid: string;
  diskUuid: string;
  deleteWithInstance?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachAliyunKeyActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachAppBuildSystemToZoneActionParam {
  zoneUuid: string;
  buildSystemUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachAutoScalingTemplateToGroupActionParam {
  uuid: string;
  groupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachBackupStorageToZoneActionParam {
  zoneUuid: string;
  backupStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachBaremetalPxeServerToClusterActionParam {
  pxeServerUuid: string;
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachDataVolumeToVmActionParam {
  vmInstanceUuid: string;
  volumeUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachEipActionParam {
  eipUuid: string;
  vmNicUuid: string;
  usedIpUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachFirewallRuleSetToL3ActionParam {
  vpcFirewallUuid: string;
  l3Uuid: string;
  forward: string;
  ruleSetUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachGuestToolsIsoToVmActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachHybridEipToEcsActionParam {
  eipUuid: string;
  ecsUuid: string;
  type: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachHybridKeyActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachIAM2ProjectToIAM2OrganizationActionParam {
  projectUuid: string;
  organizationUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachIscsiServerToClusterActionParam {
  uuid: string;
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachIsoToVmInstanceActionParam {
  vmInstanceUuid: string;
  isoUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachL2NetworkToClusterActionParam {
  l2NetworkUuid: string;
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachL3NetworkToVmActionParam {
  vmInstanceUuid: string;
  l3NetworkUuid: string;
  staticIp?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachL3NetworkToVmNicActionParam {
  vmNicUuid: string;
  l3NetworkUuid: string;
  staticIp?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachL3NetworksToIPsecConnectionActionParam {
  uuid: string;
  l3NetworkUuids: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachMdevDeviceToVmActionParam {
  mdevDeviceUuid: string;
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachMonitorTriggerActionToTriggerActionParam {
  triggerUuid: string;
  actionUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachNetworkServiceToL3NetworkActionParam {
  l3NetworkUuid: string;
  networkServices: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachOssBucketToEcsDataCenterActionParam {
  ossBucketUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachPciDeviceToVmActionParam {
  pciDeviceUuid: string;
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachPoliciesToUserActionParam {
  userUuid: string;
  policyUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachPolicyRouteRuleSetToL3ActionParam {
  l3Uuid: string;
  ruleSetUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachPolicyToRoleActionParam {
  roleUuid: string;
  policyUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachPolicyToUserActionParam {
  userUuid: string;
  policyUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachPolicyToUserGroupActionParam {
  policyUuid: string;
  groupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachPortForwardingRuleActionParam {
  ruleUuid: string;
  vmNicUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachPriceTableToAccountActionParam {
  accountUuid: string;
  tableUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachPrimaryStorageToClusterActionParam {
  clusterUuid: string;
  primaryStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachRoleToAccountActionParam {
  roleUuid: string;
  accountUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachScsiLunToVmInstanceActionParam {
  uuid: string;
  vmInstanceUuid: string;
  disableMultiPathAttach?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachSecurityGroupToL3NetworkActionParam {
  securityGroupUuid: string;
  l3NetworkUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachTagToResourcesActionParam {
  tagUuid: string;
  resourceUuids: any[];
  tokens?: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachUsbDeviceToVmActionParam {
  usbDeviceUuid: string;
  vmInstanceUuid: string;
  attachType?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachVRouterRouteTableToVRouterActionParam {
  routeTableUuid: string;
  virtualRouterVmUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface AttachVmNicToVmActionParam {
  vmNicUuid: string;
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface BackupDatabaseToPublicCloudActionParam {
  type: string;
  regionId: string;
  local?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface BackupStorageMigrateImageActionParam {
  imageUuid: string;
  srcBackupStorageUuid: string;
  dstBackupStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface BatchCreateBaremetalChassisActionParam {
  baremetalChassisInfo: string;
  longJobName?: string;
  longJobDescription?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface BatchCreateIAM2VirtualIDFromConfigFileActionParam {
  virtualIDInfos: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface BatchDeleteVolumeSnapshotActionParam {
  uuids: any[];
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface BootstrapMiniHostActionParam {
  local: any;
  peer: any;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CalculateAccountBillingSpendingActionParam {
  accountUuid: string;
  dateStart?: number;
  dateEnd?: number;
  resourceUuid?: string;
  simple?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CalculateAccountSpendingActionParam {
  accountUuid: string;
  hypervisorType?: string;
  dateStart?: number;
  dateEnd?: number;
  simple?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CalculateResourceSpendingActionParam {
  resourceType?: string;
  resourceUuid?: string;
  dateStart?: string;
  dateEnd?: string;
  start?: number;
  limit?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CancelLongJobActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeAccessKeyStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeAccountPriceTableBindingActionParam {
  accountUuid: string;
  tableUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeAffinityGroupStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeAlarmStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeAppBuildSystemStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeAutoScalingGroupStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeBackupStorageStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeBaremetalChassisStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeClusterStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeDiskOfferingStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeEipStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeFirewallRuleStateActionParam {
  uuid: string;
  state: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeHostPasswordActionParam {
  hostUuid: string;
  password: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeHostStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeIAM2OrganizationParentActionParam {
  parentUuid: string;
  childrenUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeIAM2OrganizationStateActionParam {
  uuid: string;
  stateEvent: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeIAM2ProjectStateActionParam {
  uuid: string;
  stateEvent: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeIAM2VirtualIDGroupStateActionParam {
  uuid: string;
  stateEvent: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeIAM2VirtualIDStateActionParam {
  uuid: string;
  stateEvent: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeIAM2VirtualIDTypeActionParam {
  uuid: string;
  type: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeIPSecConnectionStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeImageStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeInstanceOfferingActionParam {
  vmInstanceUuid: string;
  instanceOfferingUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeInstanceOfferingStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeL3NetworkStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeLoadBalancerListenerActionParam {
  uuid: string;
  connectionIdleTimeout?: number;
  maxConnection?: number;
  balancerAlgorithm?: string;
  healthCheckTarget?: string;
  healthyThreshold?: number;
  unhealthyThreshold?: number;
  healthCheckInterval?: number;
  healthCheckProtocol?: string;
  healthCheckMethod?: string;
  healthCheckURI?: string;
  healthCheckHttpCode?: string;
  aclStatus?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeMediaStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeMonitorTriggerActionStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeMonitorTriggerStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeMulticastRouterStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangePortForwardingRuleStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangePortMirrorStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangePreconfigurationTemplateStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangePrimaryStorageStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeResourceOwnerActionParam {
  accountUuid: string;
  resourceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeRoleStateActionParam {
  uuid: string;
  stateEvent: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeSNSApplicationEndpointStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeSNSApplicationPlatformStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeSNSTopicStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeSchedulerStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeSecurityGroupStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeTicketFlowCollectionStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeTicketStatusActionParam {
  uuid: string;
  statusEvent: any;
  comment?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeV2VConversionHostStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeVipStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeVmImageActionParam {
  vmInstanceUuid: string;
  imageUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeVmNicTypeActionParam {
  vmNicUuid: string;
  vmNicType: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeVmPasswordActionParam {
  uuid: string;
  password: string;
  account: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeVolumeStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeVpcHaGroupMonitorIpsActionParam {
  uuid: string;
  monitorIps?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ChangeZoneStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CheckApiPermissionActionParam {
  userUuid?: string;
  apiNames: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CheckBaremetalChassisConfigFileActionParam {
  baremetalChassisInfo: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CheckBuildAppParametersActionParam {
  type?: string;
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CheckElaborationContentActionParam {
  elaborateFile?: string;
  elaborateContent?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CheckIAM2VirtualIDConfigFileActionParam {
  virtualIDInfos: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CheckKVMHostConfigFileActionParam {
  hostInfo: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CheckScsiLunClusterStatusActionParam {
  uuid: string;
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CheckStackTemplateParametersActionParam {
  type?: string;
  templateContent?: string;
  uuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CleanInvalidLdapBindingActionParam {
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CleanInvalidLdapIAM2BindingActionParam {
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CleanUpBaremetalChassisBondingActionParam {
  chassisUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CleanUpImageCacheOnPrimaryStorageActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CleanUpTrashOnBackupStorageActionParam {
  uuid: string;
  trashId?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CleanUpTrashOnPrimaryStorageActionParam {
  uuid: string;
  trashId?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CleanV2VConversionCacheActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CleanupBillingUsageActionParam {
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CloneVmInstanceActionParam {
  vmInstanceUuid: string;
  strategy?: string;
  names: any[];
  primaryStorageUuidForRootVolume?: string;
  primaryStorageUuidForDataVolume?: string;
  full?: boolean;
  rootVolumeSystemTags?: any[];
  dataVolumeSystemTags?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ConvertVmFromForeignHypervisorActionParam {
  url: string;
  name: string;
  description?: string;
  conversionHostUuid?: string;
  sshPrivKey?: string;
  cpuNum: number;
  memorySize: number;
  zoneUuid?: string;
  clusterUuid?: string;
  hostUuid?: string;
  primaryStorageUuid: string;
  l3NetworkUuids: any[];
  defaultL3NetworkUuid?: string;
  platform?: string;
  type?: string;
  strategy?: string;
  convertStrategy?: string;
  pauseVm?: boolean;
  volumeFilters?: any[];
  longJobName?: string;
  longJobDescription?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAccessControlListActionParam {
  name: string;
  description?: string;
  ipVersion?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAccessKeyActionParam {
  accountUuid: string;
  userUuid: string;
  description?: string;
  AccessKeyID?: string;
  AccessKeySecret?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAccountActionParam {
  name: string;
  password: string;
  type?: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAffinityGroupActionParam {
  name: string;
  description?: string;
  policy: string;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAlarmActionParam {
  name: string;
  description?: string;
  comparisonOperator: string;
  period?: number;
  namespace: string;
  metricName: string;
  threshold: any;
  repeatInterval?: number;
  labels?: any[];
  actions?: any[];
  repeatCount?: number;
  type?: string;
  enableRecovery?: boolean;
  emergencyLevel?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAliyunDiskFromRemoteActionParam {
  identityUuid: string;
  name: string;
  sizeWithGB?: number;
  description?: string;
  diskCategory?: string;
  snapshotUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAliyunNasAccessGroupActionParam {
  dataCenterUuid: string;
  name: string;
  description?: string;
  networkType?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAliyunNasAccessGroupRuleActionParam {
  accessGroupUuid: string;
  sourceCidrIp: string;
  rwAccessType?: string;
  priority?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAliyunNasFileSystemActionParam {
  storageType: string;
  dataCenterUuid: string;
  protocol?: string;
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAliyunNasMountTargetActionParam {
  nasAccessGroupUuid: string;
  vSwitchUuid?: string;
  nasFSUuid: string;
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAliyunProxyVSwitchActionParam {
  aliyunProxyVpcUuid: string;
  vpcL3NetworkUuid: string;
  isDefault: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAliyunProxyVpcActionParam {
  name: string;
  description?: string;
  cidrBlock: string;
  vRouterUuid: string;
  isDefault: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAliyunRouterInterfaceRemoteActionParam {
  dataCenterUuid: string;
  accessPointUuid?: string;
  spec?: string;
  vRouterUuid: string;
  routerType: string;
  description?: string;
  name: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAliyunSmsSNSTextTemplateActionParam {
  sign: string;
  alarmTemplateCode: string;
  eventTemplateCode: string;
  eventTemplate?: string;
  name: string;
  description?: string;
  applicationPlatformType: string;
  template: string;
  recoveryTemplate?: string;
  defaultTemplate?: boolean;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAliyunSnapshotRemoteActionParam {
  diskUuid: string;
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAliyunVpcVirtualRouterEntryRemoteActionParam {
  vRouterUuid: string;
  dstCidrBlock: string;
  nextHopUuid: string;
  nextHopType: string;
  vRouterType: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAutoScalingGroupActionParam {
  name: string;
  description?: string;
  scalingResourceType: string;
  minResourceSize: number;
  maxResourceSize: number;
  defaultCooldown: number;
  removalPolicy: string;
  defaultEnable?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAutoScalingGroupAddingNewInstanceRuleActionParam {
  adjustmentType: string;
  adjustmentValue: number;
  name: string;
  description?: string;
  autoScalingGroupUuid: string;
  type?: string;
  cooldown?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAutoScalingGroupRemovalInstanceRuleActionParam {
  adjustmentType: string;
  adjustmentValue: number;
  removalPolicy: string;
  name: string;
  description?: string;
  autoScalingGroupUuid: string;
  type?: string;
  cooldown?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAutoScalingRuleAlarmTriggerActionParam {
  alarmUuid: string;
  triggerType?: string;
  name: string;
  description?: string;
  ruleUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateAutoScalingVmTemplateActionParam {
  vmInstanceName: string;
  vmInstanceDescription?: string;
  vmInstanceOfferingUuid: string;
  imageUuid: string;
  l3NetworkUuids: any[];
  vmInstanceType?: string;
  rootDiskOfferingUuid?: string;
  dataDiskOfferingUuids?: any[];
  vmInstanceZoneUuid?: string;
  vmInstanceClusterUuid?: string;
  hostUuid?: string;
  primaryStorageUuidForRootVolume?: string;
  defaultL3NetworkUuid: string;
  strategy?: string;
  name: string;
  description?: string;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateBaremetalBondingActionParam {
  chassisUuid: string;
  name: string;
  mode: number;
  slaves: string;
  opts?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateBaremetalChassisActionParam {
  name: string;
  description?: string;
  clusterUuid: string;
  ipmiAddress: string;
  ipmiPort?: number;
  ipmiUsername: string;
  ipmiPassword: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateBaremetalInstanceActionParam {
  name: string;
  description?: string;
  chassisUuid: string;
  imageUuid: string;
  templateUuid?: string;
  username?: string;
  password: string;
  nicCfgs?: any;
  bondingCfgs?: any;
  customConfigurations?: any;
  strategy?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateBaremetalPxeServerActionParam {
  zoneUuid: string;
  name: string;
  description?: string;
  hostname: string;
  sshUsername: string;
  sshPassword: string;
  sshPort?: number;
  storagePath: string;
  dhcpInterface: string;
  dhcpRangeBegin?: string;
  dhcpRangeEnd?: string;
  dhcpRangeNetmask?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateBuildAppActionParam {
  buildSystemUuid: string;
  backupStorageUuid: string;
  dataPath: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateCertificateActionParam {
  name: string;
  certificate: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateClusterActionParam {
  zoneUuid: string;
  name: string;
  description?: string;
  hypervisorType: string;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateClusterDRSActionParam {
  name: string;
  description?: string;
  clusterUuid: string;
  automationLevel: string;
  thresholds: any[];
  thresholdDuration: number;
  defaultEnable?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateConnectionBetweenL3NetworkAndAliyunVSwitchActionParam {
  l3networkUuid: string;
  vpcUuid: string;
  vbrUuid: string;
  cpeIp: string;
  name: string;
  description?: string;
  direction: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateDataVolumeActionParam {
  name: string;
  description?: string;
  diskOfferingUuid?: string;
  diskSize?: number;
  primaryStorageUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateDataVolumeFromVolumeSnapshotActionParam {
  name: string;
  description?: string;
  volumeSnapshotUuid: string;
  primaryStorageUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateDataVolumeFromVolumeTemplateActionParam {
  imageUuid: string;
  name: string;
  description?: string;
  primaryStorageUuid: string;
  hostUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateDataVolumeTemplateFromVolumeActionParam {
  name: string;
  description?: string;
  volumeUuid: string;
  backupStorageUuids?: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateDataVolumeTemplateFromVolumeBackupActionParam {
  backupUuid: string;
  backupStorageUuid: string;
  name: string;
  description?: string;
  guestOsType?: string;
  platform?: string;
  system?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateDataVolumeTemplateFromVolumeSnapshotActionParam {
  snapshotUuid: string;
  name: string;
  description?: string;
  backupStorageUuids: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateDatabaseBackupActionParam {
  name: string;
  description?: string;
  backupStorageUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateDiskOfferingActionParam {
  name: string;
  description?: string;
  diskSize: number;
  sortKey?: number;
  allocationStrategy?: string;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateEcsImageFromEcsSnapshotActionParam {
  snapshotUuid: string;
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateEcsImageFromLocalImageActionParam {
  imageUuid: string;
  dataCenterUuid: string;
  backupStorageUuid?: string;
  description?: string;
  name: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateEcsInstanceFromEcsImageActionParam {
  ecsRootVolumeType?: string;
  description?: string;
  ecsRootVolumeGBSize?: number;
  createMode?: string;
  privateIpAddress?: string;
  allocatePublicIp?: string;
  ecsConsolePassword?: string;
  name: string;
  ecsImageUuid: string;
  instanceOfferingUuid?: string;
  instanceType?: string;
  ecsVSwitchUuid: string;
  ecsSecurityGroupUuid: string;
  ecsRootPassword: string;
  ecsBandWidth?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateEcsSecurityGroupRemoteActionParam {
  vpcUuid: string;
  description?: string;
  name: string;
  strategy?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateEcsSecurityGroupRuleRemoteActionParam {
  groupUuid: string;
  direction: string;
  protocol: string;
  portRange: string;
  cidr: string;
  policy?: string;
  nictype?: string;
  priority?: number;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateEcsVSwitchRemoteActionParam {
  vpcUuid: string;
  identityZoneUuid: string;
  cidrBlock: string;
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateEcsVpcRemoteActionParam {
  dataCenterUuid: string;
  cidrBlock: string;
  name: string;
  description?: string;
  vRouterName: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateEipActionParam {
  name: string;
  description?: string;
  vipUuid: string;
  vmNicUuid?: string;
  usedIpUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateEmailMediaActionParam {
  smtpServer: string;
  smtpPort: number;
  username?: string;
  password?: string;
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateEmailMonitorTriggerActionActionParam {
  email: string;
  mediaUuid: string;
  name: string;
  description?: string;
  triggerUuids?: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateFaultToleranceVmInstanceActionParam {
  name: string;
  instanceOfferingUuid?: string;
  cpuNum?: number;
  memorySize?: number;
  imageUuid: string;
  l3NetworkUuids: any[];
  dataDiskOfferingUuids?: any[];
  zoneUuid?: string;
  clusterUuid?: string;
  hostUuid?: string;
  primaryStorageUuidForRootVolume?: string;
  description?: string;
  defaultL3NetworkUuid?: string;
  rootVolumeSystemTags?: any[];
  dataVolumeSystemTags?: any[];
  strategy?: string;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateFirewallIpSetTemplateActionParam {
  name: string;
  sourceValue?: string;
  destValue?: string;
  type: any;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateFirewallRuleActionParam {
  ruleSetUuid: string;
  action: string;
  protocol?: string;
  destPort?: string;
  sourcePort?: string;
  sourceIp?: string;
  destIp?: string;
  allowStates?: string;
  tcpFlag?: string;
  icmpTypeName?: string;
  ruleNumber: number;
  enableLog?: boolean;
  state: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateFirewallRuleSetActionParam {
  name: string;
  actionType?: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateFirewallRuleTemplateActionParam {
  action: string;
  protocol?: string;
  name: string;
  destPort?: string;
  sourcePort?: string;
  sourceIp?: string;
  destIp?: string;
  allowStates?: string;
  tcpFlag?: string;
  icmpTypeName?: string;
  ruleNumber: number;
  enableLog?: boolean;
  state?: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateFlowCollectorActionParam {
  name?: string;
  description?: string;
  flowMeterUuid: string;
  server?: string;
  port?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateFlowMeterActionParam {
  version?: string;
  type: string;
  sample?: number;
  generateInterval?: number;
  name?: string;
  description?: string;
  server?: string;
  port?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateHybridEipActionParam {
  name: string;
  description?: string;
  bandWidthMb: number;
  type: string;
  dataCenterUuid: string;
  chargeType: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateIAM2OrganizationActionParam {
  name: string;
  description?: string;
  type: any;
  parentUuid?: string;
  attributes?: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateIAM2ProjectActionParam {
  name: string;
  description?: string;
  attributes?: any[];
  quota?: any;
  roleUuids?: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateIAM2ProjectFromTemplateActionParam {
  name: string;
  description?: string;
  templateUuid: string;
  roleUuids?: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateIAM2ProjectTemplateActionParam {
  name: string;
  description?: string;
  attributes?: any[];
  quota?: any;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateIAM2ProjectTemplateFromProjectActionParam {
  name: string;
  description?: string;
  projectUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateIAM2TickFlowCollectionActionParam {
  flows?: any[];
  projectUuid: string;
  name: string;
  description: string;
  isDefault?: boolean;
  ticketTypeUuids?: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateIAM2VirtualIDActionParam {
  name: string;
  password: string;
  description?: string;
  attributes?: any[];
  projectUuid?: string;
  organizationUuid?: string;
  withoutDefaultRole?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateIAM2VirtualIDFromLdapUidActionParam {
  ldapUid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateIAM2VirtualIDGroupActionParam {
  projectUuid: string;
  name: string;
  description?: string;
  attributes?: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateIAM2VirtualIDLdapBindingActionParam {
  virtualIDUuid: string;
  ldapUid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateIPsecConnectionActionParam {
  name: string;
  description?: string;
  l3NetworkUuid?: string;
  peerAddress: string;
  authMode?: string;
  authKey: string;
  vipUuid: string;
  peerCidrs?: any[];
  ikeAuthAlgorithm?: string;
  ikeEncryptionAlgorithm?: string;
  ikeDhGroup?: number;
  policyAuthAlgorithm?: string;
  policyEncryptionAlgorithm?: string;
  pfs?: string;
  policyMode?: string;
  transformProtocol?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateImageReplicationGroupActionParam {
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateInstanceOfferingActionParam {
  name: string;
  description?: string;
  cpuNum: number;
  memorySize: number;
  allocatorStrategy?: string;
  sortKey?: number;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateL2HardwareVxlanNetworkActionParam {
  vni?: number;
  poolUuid: string;
  name: string;
  description?: string;
  zoneUuid?: string;
  physicalInterface?: string;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateL2HardwareVxlanNetworkPoolActionParam {
  sdnControllerUuid: string;
  name: string;
  description?: string;
  zoneUuid: string;
  physicalInterface: string;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateL2NoVlanNetworkActionParam {
  name: string;
  description?: string;
  zoneUuid: string;
  physicalInterface: string;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateL2VlanNetworkActionParam {
  vlan: number;
  name: string;
  description?: string;
  zoneUuid: string;
  physicalInterface: string;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateL2VxlanNetworkActionParam {
  vni?: number;
  poolUuid: string;
  name: string;
  description?: string;
  zoneUuid?: string;
  physicalInterface?: string;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateL2VxlanNetworkPoolActionParam {
  name: string;
  description?: string;
  zoneUuid: string;
  physicalInterface?: string;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateL3NetworkActionParam {
  name: string;
  description?: string;
  type?: string;
  l2NetworkUuid: string;
  category?: string;
  ipVersion?: number;
  system?: boolean;
  dnsDomain?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateLdapBindingActionParam {
  ldapUid: string;
  accountUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateLoadBalancerActionParam {
  name: string;
  description?: string;
  vipUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateLoadBalancerListenerActionParam {
  loadBalancerUuid: string;
  name: string;
  description?: string;
  instancePort?: number;
  loadBalancerPort: number;
  protocol?: string;
  certificateUuid?: string;
  healthCheckProtocol?: string;
  healthCheckMethod?: string;
  healthCheckURI?: string;
  healthCheckHttpCode?: string;
  aclStatus?: string;
  aclUuids?: any[];
  aclType?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateMetricDataHttpReceiverActionParam {
  name: string;
  url: string;
  description?: string;
  defaultEnable?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateMetricTemplateActionParam {
  receiverUuid: string;
  template: string;
  namespace: string;
  metricName: string;
  labelsJsonStr?: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateMiniClusterActionParam {
  zoneUuid: string;
  name: string;
  hostManagementIps: any[];
  username?: string;
  password: string;
  sshPort?: number;
  description?: string;
  hypervisorType: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateMonitorTriggerActionParam {
  name: string;
  expression: string;
  duration: number;
  recoveryExpression?: string;
  description?: string;
  targetResourceUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateMulticastRouterActionParam {
  vpcRouterVmUuid: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateOssBackupBucketRemoteActionParam {
  regionId: string;
  ossDomain?: string;
  ossKey?: string;
  ossSecret?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateOssBucketRemoteActionParam {
  dataCenterUuid: string;
  bucketName: string;
  description?: string;
  ossDomain?: string;
  ossKey?: string;
  ossSecret?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreatePciDeviceOfferingActionParam {
  name?: string;
  description?: string;
  vendorId: string;
  deviceId: string;
  subvendorId?: string;
  subdeviceId?: string;
  ramSize?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreatePolicyActionParam {
  name: string;
  description?: string;
  statements: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreatePolicyRouteRuleActionParam {
  ruleSetUuid: string;
  tableUuid: string;
  ruleNumber: number;
  destIp?: string;
  sourceIp?: string;
  destPort?: string;
  sourcePort?: string;
  protocol?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreatePolicyRouteRuleSetActionParam {
  name: string;
  description?: string;
  vRouterUuid: string;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreatePolicyRouteTableActionParam {
  vRouterUuid: string;
  number: number;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreatePolicyRouteTableRouteEntryActionParam {
  tableUuid: string;
  destinationCidr: string;
  nextHopIp: string;
  distance?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreatePortForwardingRuleActionParam {
  vipUuid: string;
  vipPortStart: number;
  vipPortEnd?: number;
  privatePortStart?: number;
  privatePortEnd?: number;
  protocolType: string;
  vmNicUuid?: string;
  allowedCidr?: string;
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreatePortMirrorActionParam {
  mirrorNetworkUuid: string;
  name?: string;
  description?: string;
  stateEvent?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreatePortMirrorSessionActionParam {
  portMirrorUuid: string;
  name: string;
  description?: string;
  type: string;
  srcEndPoint: string;
  dstEndPoint: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreatePriceTableActionParam {
  name: string;
  description?: string;
  prices: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateResourcePriceActionParam {
  resourceName: string;
  resourceUnit?: string;
  timeUnit: string;
  price: any;
  accountUuid?: string;
  dateInLong?: number;
  tableUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateResourceStackActionParam {
  name: string;
  description?: string;
  type?: string;
  rollback?: boolean;
  templateContent?: string;
  templateUuid?: string;
  parameters?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateResourceStackFromAppActionParam {
  appUuid: string;
  name: string;
  description?: string;
  rollback?: boolean;
  parameters?: string;
  withoutAppInfo?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateRoleActionParam {
  name: string;
  description?: string;
  statements?: any[];
  policyUuids?: any[];
  identity?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateRootVolumeTemplateFromRootVolumeActionParam {
  name: string;
  description?: string;
  guestOsType?: string;
  backupStorageUuids?: any[];
  rootVolumeUuid: string;
  platform?: string;
  system?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateRootVolumeTemplateFromVolumeBackupActionParam {
  backupUuid: string;
  backupStorageUuid: string;
  name: string;
  description?: string;
  guestOsType?: string;
  platform?: string;
  system?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateRootVolumeTemplateFromVolumeSnapshotActionParam {
  snapshotUuid: string;
  name: string;
  description?: string;
  guestOsType?: string;
  backupStorageUuids: any[];
  platform?: string;
  system?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateSNSAliyunSmsEndpointActionParam {
  accessKeyUuid: string;
  receivers?: any[];
  name: string;
  description?: string;
  platformUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateSNSDingTalkEndpointActionParam {
  url: string;
  atAll?: boolean;
  atPersonPhoneNumbers?: any[];
  name: string;
  description?: string;
  platformUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateSNSEmailEndpointActionParam {
  email?: string;
  emails?: any[];
  name: string;
  description?: string;
  platformUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateSNSEmailPlatformActionParam {
  smtpServer: string;
  smtpPort: number;
  username?: string;
  password?: string;
  encryptType?: string;
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateSNSHttpEndpointActionParam {
  url: string;
  username?: string;
  password?: string;
  name: string;
  description?: string;
  platformUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateSNSMicrosoftTeamsEndpointActionParam {
  url: string;
  name: string;
  description?: string;
  platformUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateSNSTextTemplateActionParam {
  name: string;
  description?: string;
  applicationPlatformType: string;
  template: string;
  recoveryTemplate?: string;
  defaultTemplate?: boolean;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateSNSTopicActionParam {
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateSchedulerJobActionParam {
  name: string;
  description?: string;
  targetResourceUuid: string;
  type: string;
  parameters?: any;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateSchedulerJobGroupActionParam {
  name: string;
  description?: string;
  type: string;
  parameters?: any;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateSchedulerTriggerActionParam {
  name: string;
  description?: string;
  schedulerInterval?: number;
  repeatCount?: number;
  startTime?: number;
  schedulerType: string;
  cron?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateSecurityGroupActionParam {
  name: string;
  description?: string;
  ipVersion?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateSystemTagActionParam {
  resourceType: string;
  resourceUuid: string;
  tag: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateTagActionParam {
  name: string;
  value: string;
  description?: string;
  color?: string;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateTicketActionParam {
  name: string;
  description?: string;
  requests: any[];
  flowCollectionUuid?: string;
  accountSystemType: string;
  accountSystemContext: any;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateUserActionParam {
  name: string;
  password: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateUserGroupActionParam {
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateUserTagActionParam {
  resourceType: string;
  resourceUuid: string;
  tag: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVRouterOspfAreaActionParam {
  areaId: string;
  areaAuth?: string;
  areaType?: string;
  password?: string;
  keyId?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVRouterRouteTableActionParam {
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVipActionParam {
  name: string;
  description?: string;
  l3NetworkUuid: string;
  allocatorStrategy?: string;
  ipRangeUuid?: string;
  requiredIp?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVirtualRouterOfferingActionParam {
  zoneUuid: string;
  managementNetworkUuid: string;
  imageUuid: string;
  publicNetworkUuid?: string;
  isDefault?: boolean;
  name: string;
  description?: string;
  cpuNum: number;
  memorySize: number;
  allocatorStrategy?: string;
  sortKey?: number;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVmBackupActionParam {
  rootVolumeUuid: string;
  backupStorageUuid: string;
  name: string;
  description?: string;
  mode?: string;
  volumeReadBandwidth?: number;
  volumeWriteBandwidth?: number;
  networkReadBandwidth?: number;
  networkWriteBandwidth?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVmCdRomActionParam {
  name: string;
  vmInstanceUuid: string;
  isoUuid?: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVmFromVmBackupActionParam {
  name: string;
  groupUuid: string;
  backupStorageUuid?: string;
  instanceOfferingUuid: string;
  l3NetworkUuids: any[];
  type?: string;
  zoneUuid?: string;
  clusterUuid?: string;
  hostUuid?: string;
  primaryStorageUuidForRootVolume?: string;
  primaryStorageUuidForDataVolume?: string;
  description?: string;
  rootVolumeSystemTags?: any[];
  dataVolumeSystemTags?: any[];
  defaultL3NetworkUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVmInstanceActionParam {
  name: string;
  instanceOfferingUuid?: string;
  cpuNum?: number;
  memorySize?: number;
  imageUuid: string;
  l3NetworkUuids: any[];
  type?: string;
  rootDiskOfferingUuid?: string;
  rootDiskSize?: number;
  dataDiskOfferingUuids?: any[];
  zoneUuid?: string;
  clusterUuid?: string;
  hostUuid?: string;
  primaryStorageUuidForRootVolume?: string;
  description?: string;
  defaultL3NetworkUuid?: string;
  strategy?: string;
  rootVolumeSystemTags?: any[];
  dataVolumeSystemTags?: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVmInstanceFromVolumeActionParam {
  name: string;
  description?: string;
  instanceOfferingUuid?: string;
  cpuNum?: number;
  memorySize?: number;
  l3NetworkUuids: any[];
  type?: string;
  volumeUuid?: string;
  platform?: string;
  zoneUuid?: string;
  clusterUuid?: string;
  hostUuid?: string;
  primaryStorageUuid?: string;
  defaultL3NetworkUuid?: string;
  strategy?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVmNicActionParam {
  l3NetworkUuid: string;
  ip?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVniRangeActionParam {
  name: string;
  description?: string;
  startVni: number;
  endVni: number;
  l2NetworkUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVolumeBackupActionParam {
  volumeUuid: string;
  backupStorageUuid: string;
  name: string;
  description?: string;
  mode?: string;
  volumeReadBandwidth?: number;
  volumeWriteBandwidth?: number;
  networkReadBandwidth?: number;
  networkWriteBandwidth?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVolumeSnapshotActionParam {
  volumeUuid: string;
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVolumeSnapshotGroupActionParam {
  rootVolumeUuid: string;
  name: string;
  description?: string;
  withMemory?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVolumesSnapshotActionParam {
  volumeUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVpcFirewallActionParam {
  vpcUuid: string;
  description?: string;
  name: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVpcHaGroupActionParam {
  name: string;
  description?: string;
  monitorIps?: any[];
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVpcUserVpnGatewayRemoteActionParam {
  dataCenterUuid: string;
  ip: string;
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVpcVRouterActionParam {
  name: string;
  virtualRouterOfferingUuid: string;
  description?: string;
  zoneUuid?: string;
  clusterUuid?: string;
  hostUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVpcVpnConnectionRemoteActionParam {
  userGatewayUuid: string;
  vpnGatewayUuid: string;
  name: string;
  localCidr: string;
  remoteCidr: string;
  active: boolean;
  ikeConfUuid: string;
  ipsecConfUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVpnIkeConfigActionParam {
  name: string;
  psk: string;
  pfs?: string;
  version?: string;
  mode?: string;
  encAlg?: string;
  authAlg?: string;
  lifetime?: number;
  localIp: string;
  remoteIp: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVpnIpsecConfigActionParam {
  name: string;
  pfs?: string;
  encAlg?: string;
  authAlg?: string;
  lifetime?: number;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateVxlanVtepActionParam {
  hostUuid: string;
  poolUuid: string;
  vtepIp?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateWebhookActionParam {
  name: string;
  description?: string;
  url: string;
  type: string;
  opaque?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateZBoxBackupActionParam {
  zBoxUuid: string;
  hostUuids?: any[];
  backupStorageUuids?: any[];
  dryRun?: boolean;
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface CreateZoneActionParam {
  name: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DebugSignalActionParam {
  signals: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DecodeStackTemplateActionParam {
  type?: string;
  templateContent?: string;
  uuid?: string;
  parameters?: string;
  preparameters?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAccessControlListActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAccessControlRuleActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAccessKeyActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAccountActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAffinityGroupActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAlarmActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAlertActionParam {
  uuids: any[];
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAliyunDiskFromLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAliyunDiskFromRemoteActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAliyunKeySecretActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAliyunNasAccessGroupActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAliyunNasAccessGroupRuleActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAliyunPanguPartitionActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAliyunProxyVSwitchActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAliyunProxyVpcActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAliyunRouteEntryRemoteActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAliyunRouterInterfaceLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAliyunRouterInterfaceRemoteActionParam {
  uuid: string;
  vRouterType: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAliyunSnapshotFromLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAliyunSnapshotFromRemoteActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAllEcsInstancesFromDataCenterActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAppBuildSystemActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAutoScalingGroupActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAutoScalingGroupInstanceActionParam {
  instanceUuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAutoScalingRuleActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAutoScalingRuleTriggerActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteAutoScalingTemplateActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteBackupFileInPublicActionParam {
  type: string;
  regionId: string;
  file: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteBackupStorageActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteBaremetalChassisActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteBaremetalPxeServerActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteBillingActionParam {
  accountUuid?: string;
  startTime?: number;
  endTime?: number;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteBuildAppActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteBuildAppExportHistoryActionParam {
  buildAppUuid?: string;
  exportId?: string;
  buildSystemUuid?: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteCephPrimaryStoragePoolActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteCertificateActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteClusterActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteClusterDRSActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteConnectionAccessPointLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteConnectionBetweenL3NetWorkAndAliyunVSwitchActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteDataCenterInLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteDataVolumeActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteDatabaseBackupActionParam {
  uuid: string;
  backupStorageUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteDiskOfferingActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteEcsImageLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteEcsImageRemoteActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteEcsInstanceActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteEcsInstanceLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteEcsSecurityGroupInLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteEcsSecurityGroupRemoteActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteEcsSecurityGroupRuleRemoteActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteEcsVSwitchInLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteEcsVSwitchRemoteActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteEcsVpcInLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteEcsVpcRemoteActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteEipActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteEmailAddressOfSNSEmailEndpointActionParam {
  emailAddressUuid: string;
  endpointUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteExportedDatabaseBackupFromBackupStorageActionParam {
  backupStorageUuid: string;
  databaseBackupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteExportedImageFromBackupStorageActionParam {
  backupStorageUuid: string;
  imageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteExternalBackupActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteFirewallActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteFirewallIpSetTemplateActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteFirewallRuleActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteFirewallRuleSetActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteFirewallRuleTemplateActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteFlowCollectorActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteFlowMeterActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteGCJobActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteHostActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteHybridEipFromLocalActionParam {
  type: string;
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteHybridEipRemoteActionParam {
  type: string;
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteHybridKeySecretActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteIAM2OrganizationActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteIAM2ProjectActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteIAM2ProjectTemplateActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteIAM2TicketFlowActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteIAM2VirtualIDActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteIAM2VirtualIDGroupActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteIAM2VirtualIDLdapBindingActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteIPsecConnectionActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteIdentityZoneInLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteImageActionParam {
  uuid: string;
  backupStorageUuids?: any[];
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteImageReplicationGroupActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteInstanceOfferingActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteIpRangeActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteIscsiServerActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteL2NetworkActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteL3NetworkActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteLdapBindingActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteLdapServerActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteLicenseActionParam {
  uuid?: string;
  module?: string;
  managementNodeUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteLoadBalancerActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteLoadBalancerListenerActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteLogConfigurationActionParam {
  configId: number;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteLongJobActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteMediaActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteMetricDataActionParam {
  namespace: string;
  metricName: string;
  labels?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteMetricDataHttpReceiverActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteMetricTemplateActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteMonitorTriggerActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteMonitorTriggerActionActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteMulticastRouterActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteNasFileSystemActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteNasMountTargetActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteNicQosActionParam {
  uuid: string;
  direction: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteOssBucketFileRemoteActionParam {
  uuid: string;
  fileName: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteOssBucketNameLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteOssBucketRemoteActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeletePciDeviceActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeletePciDeviceOfferingActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeletePolicyActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeletePolicyRouteRuleActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeletePolicyRouteRuleSetActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeletePolicyRouteTableActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeletePolicyRouteTableRouteEntryActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeletePortForwardingRuleActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeletePortMirrorActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeletePortMirrorSessionActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeletePreconfigurationTemplateActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeletePriceTableActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeletePrimaryStorageActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeletePublishAppActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteResourceConfigActionParam {
  category: string;
  name: string;
  resourceUuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteResourcePriceActionParam {
  uuid: string;
  cutoffPrice?: boolean;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteResourceStackActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteResourceStackVmPortMonitorActionParam {
  stackUuid?: string;
  vmInstanceUuid: string;
  port?: number;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteRoleActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteSNSApplicationEndpointActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteSNSApplicationPlatformActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteSNSTextTemplateActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteSNSTopicActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteSchedulerJobActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteSchedulerJobGroupActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteSchedulerTriggerActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteSecurityGroupActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteSecurityGroupRuleActionParam {
  ruleUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteStackTemplateActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteTagActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteThirdpartyPlatformActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteTicketActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteTicketFlowCollectionActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteUserActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteUserGroupActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteV2VConversionHostActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVCenterActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVRouterOspfAreaActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVRouterRouteEntryActionParam {
  uuid: string;
  routeTableUuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVRouterRouteTableActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVipActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVipQosActionParam {
  uuid: string;
  port?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVirtualBorderRouterLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVirtualRouterLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVmBackupActionParam {
  groupUuid: string;
  backupStorageUuids?: any[];
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVmBootModeActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVmCdRomActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVmConsolePasswordActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVmHostnameActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVmInstanceHaLevelActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVmNicActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVmNicFromSecurityGroupActionParam {
  securityGroupUuid: string;
  vmNicUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVmSshKeyActionParam {
  uuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVmStaticIpActionParam {
  vmInstanceUuid: string;
  l3NetworkUuid: string;
  staticIp?: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVmUserDefinedXmlActionParam {
  vmInstanceUuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVniRangeActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVolumeBackupActionParam {
  uuid: string;
  backupStorageUuids?: any[];
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVolumeQosActionParam {
  uuid: string;
  mode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVolumeSnapshotActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVolumeSnapshotGroupActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVpcHaGroupActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVpcIkeConfigLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVpcIpSecConfigLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVpcUserVpnGatewayLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVpcUserVpnGatewayRemoteActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVpcVpnConnectionLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVpcVpnConnectionRemoteActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteVpcVpnGatewayLocalActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteWebhookActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DeleteZoneActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DestroyBaremetalInstanceActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DestroyVmInstanceActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachAliyunDiskFromEcsActionParam {
  uuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachAliyunKeyActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachAppBuildSystemToZoneActionParam {
  buildSystemUuid: string;
  zoneUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachAutoScalingTemplateFromGroupActionParam {
  templateUuid: string;
  groupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachBackupStorageFromZoneActionParam {
  backupStorageUuid: string;
  zoneUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachBaremetalPxeServerFromClusterActionParam {
  pxeServerUuid: string;
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachDataVolumeFromVmActionParam {
  uuid: string;
  vmUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachEipActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachFirewallRuleSetFromL3ActionParam {
  vpcFirewallUuid: string;
  l3Uuid: string;
  forward: string;
  ruleSetUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachHybridEipFromEcsActionParam {
  eipUuid: string;
  type: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachHybridKeyActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachIAM2ProjectFromIAM2OrganizationActionParam {
  projectUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachIscsiServerFromClusterActionParam {
  uuid: string;
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachIsoFromVmInstanceActionParam {
  vmInstanceUuid: string;
  isoUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachL2NetworkFromClusterActionParam {
  l2NetworkUuid: string;
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachL3NetworkFromVmActionParam {
  vmNicUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachL3NetworksFromIPsecConnectionActionParam {
  uuid: string;
  l3NetworkUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachMdevDeviceFromVmActionParam {
  mdevDeviceUuid: string;
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachMonitorTriggerActionFromTriggerActionParam {
  triggerUuid: string;
  actionUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachNetworkServiceFromL3NetworkActionParam {
  l3NetworkUuid: string;
  networkServices: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachOssBucketFromEcsDataCenterActionParam {
  ossBucketUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachPciDeviceFromVmActionParam {
  pciDeviceUuid: string;
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachPoliciesFromUserActionParam {
  policyUuids: any[];
  userUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachPolicyFromRoleActionParam {
  roleUuid: string;
  policyUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachPolicyFromUserActionParam {
  policyUuid: string;
  userUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachPolicyFromUserGroupActionParam {
  policyUuid: string;
  groupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachPolicyRouteRuleSetFromL3ActionParam {
  l3Uuid: string;
  ruleSetUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachPortForwardingRuleActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachPriceTableFromAccountActionParam {
  accountUuid: string;
  tableUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachPrimaryStorageFromClusterActionParam {
  primaryStorageUuid: string;
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachRoleFromAccountActionParam {
  roleUuid: string;
  accountUuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachScsiLunFromVmInstanceActionParam {
  uuid: string;
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachSecurityGroupFromL3NetworkActionParam {
  securityGroupUuid: string;
  l3NetworkUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachTagFromResourcesActionParam {
  tagUuid: string;
  resourceUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachUsbDeviceFromVmActionParam {
  usbDeviceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DetachVRouterRouteTableFromVRouterActionParam {
  routeTableUuid: string;
  virtualRouterVmUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface DownloadBackupFileFromPublicCloudActionParam {
  regionId: string;
  file: string;
  type: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface EjectZBoxActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ExecuteAutoScalingRuleActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ExecuteDRSSchedulingActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ExportBuildAppActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ExportDatabaseBackupFromBackupStorageActionParam {
  backupStorageUuid: string;
  databaseBackupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ExportImageFromBackupStorageActionParam {
  backupStorageUuid: string;
  imageUuid: string;
  exportFormat?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ExpungeBaremetalInstanceActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ExpungeDataVolumeActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ExpungeIAM2ProjectActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ExpungeImageActionParam {
  uuid?: string;
  imageUuid: string;
  backupStorageUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ExpungeVmInstanceActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface FailoverFaultToleranceVmActionParam {
  faultToleranceVmUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface GCAliyunSnapshotRemoteActionParam {
  dataCenterUuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface GenerateAccountBillingActionParam {
  accountUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface GenerateMdevDevicesActionParam {
  pciDeviceUuid: string;
  mdevSpecUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface GenerateSriovPciDevicesActionParam {
  pciDeviceUuid: string;
  virtPartNum: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface GetAttachableVpcL3NetworkActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface GetConnectionBetweenL3NetworkAndAliyunVSwitchActionParam {
  uuid: string;
  resourceType: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface GetCurrentTimeActionParam {
  systemTags?: any[];
  userTags?: any[];
  requestIp?: any;
}
export interface GetImagesFromImageStoreBackupStorageActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface GetVersionActionParam {
  systemTags?: any[];
  userTags?: any[];
  requestIp?: any;
}
export interface GetVolumeSnapshotSizeActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface IdentifyHostActionParam {
  uuid: string;
  interval?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface InspectBaremetalChassisActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface KvmRunShellActionParam {
  hostUuids: any;
  script: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ListVMsFromKVMHostActionParam {
  libvirtURI: string;
  conversionHostUuid: string;
  sshPrivKey?: string;
  v2vType?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface LocalStorageMigrateVolumeActionParam {
  volumeUuid: string;
  destHostUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface LocateLocalRaidPhysicalDriveActionParam {
  uuid: string;
  locate?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface LogInByAccountActionParam {
  accountName: string;
  password: string;
  accountType?: string;
  captchaUuid?: string;
  verifyCode?: string;
  clientInfo?: any;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: any;
}
export interface LogInByLdapActionParam {
  uid: string;
  password: string;
  verifyCode?: string;
  captchaUuid?: string;
  clientInfo?: any;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: any;
}
export interface LogInByUserActionParam {
  accountUuid?: string;
  accountName?: string;
  userName: string;
  password: string;
  clientInfo?: any;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: any;
}
export interface LogOutActionParam {
  sessionUuid?: string;
  clientInfo?: any;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: any;
}
export interface LoginIAM2ProjectActionParam {
  projectName: string;
  clientInfo?: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface LoginIAM2VirtualIDActionParam {
  name: string;
  password: string;
  captchaUuid?: string;
  verifyCode?: string;
  clientInfo?: any;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: any;
}
export interface LoginIAM2VirtualIDWithLdapActionParam {
  uid: string;
  password: string;
  verifyCode?: string;
  captchaUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: any;
}
export interface MigrateVmActionParam {
  vmInstanceUuid: string;
  hostUuid?: string;
  migrateFromDestination?: boolean;
  allowUnknown?: boolean;
  strategy?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface PauseVmInstanceActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface PowerOffBaremetalChassisActionParam {
  chassisUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface PowerOffHostActionParam {
  adminPassword: string;
  hostUuids: any[];
  waitTaskCompleted?: boolean;
  maxWaitTime?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface PowerOnBaremetalChassisActionParam {
  chassisUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface PowerResetBaremetalChassisActionParam {
  chassisUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface PreviewResourceFromAppActionParam {
  appUuid: string;
  parameters?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface PrimaryStorageMigrateVmActionParam {
  vmInstanceUuid: string;
  dstPrimaryStorageUuid: string;
  withDataVolumes?: boolean;
  withSnapshots?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface PrimaryStorageMigrateVolumeActionParam {
  volumeUuid: string;
  dstPrimaryStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface PublishAppActionParam {
  buildAppUuid: string;
  name: string;
  description?: string;
  parameters?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface PutMetricDataActionParam {
  namespace: string;
  data: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RebootBaremetalInstanceActionParam {
  uuid: string;
  pxeBoot?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RebootEcsInstanceActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RebootVmInstanceActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ReclaimSpaceFromImageStoreActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ReconnectAppBuildSystemActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ReconnectBackupStorageActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ReconnectBaremetalPxeServerActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ReconnectConsoleProxyAgentActionParam {
  agentUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ReconnectHostActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ReconnectImageStoreBackupStorageActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ReconnectPrimaryStorageActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ReconnectSftpBackupStorageActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ReconnectVirtualRouterActionParam {
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RecoverBackupFromImageStoreBackupStorageActionParam {
  uuid: string;
  srcBackupStorageUuid: string;
  dstBackupStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RecoverBaremetalInstanceActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RecoverDataVolumeActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RecoverDatabaseFromBackupActionParam {
  uuid?: string;
  backupStorageUrl?: string;
  backupInstallPath?: string;
  mysqlRootPassword: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RecoverIAM2ProjectActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RecoverImageActionParam {
  imageUuid: string;
  backupStorageUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RecoverVmBackupFromImageStoreBackupStorageActionParam {
  groupUuid: string;
  srcBackupStorageUuid: string;
  dstBackupStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RecoverVmInstanceActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RecoveryImageFromImageStoreBackupStorageActionParam {
  uuid: string;
  srcBackupStorageUuid: string;
  dstBackupStorageUuid: string;
  name: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RecoveryVirtualBorderRouterRemoteActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RefreshFiberChannelStorageActionParam {
  zoneUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RefreshFirewallActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RefreshIscsiServerActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RefreshLoadBalancerActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RefreshLocalRaidActionParam {
  hostUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RefreshSharedblockDeviceCapacityActionParam {
  uuid?: string;
  sharedBlockGroupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ReimageVmInstanceActionParam {
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ReloadElaborationActionParam {
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ReloadLicenseActionParam {
  managementNodeUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveAccessControlListEntryActionParam {
  aclUuid: string;
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveAccessControlListFromLoadBalancerActionParam {
  aclUuids: any[];
  listenerUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveActionFromAlarmActionParam {
  alarmUuid: string;
  actionUuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveActionFromEventSubscriptionActionParam {
  subscriptionUuid: string;
  actionUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveAttributesFromIAM2OrganizationActionParam {
  uuid: string;
  attributeUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveAttributesFromIAM2ProjectActionParam {
  uuid: string;
  attributeUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveAttributesFromIAM2VirtualIDActionParam {
  uuid: string;
  attributeUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveAttributesFromIAM2VirtualIDGroupActionParam {
  uuid: string;
  attributeUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveCertificateFromLoadBalancerListenerActionParam {
  certificateUuid: string;
  listenerUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveDnsFromL3NetworkActionParam {
  l3NetworkUuid: string;
  dns: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveDnsFromVpcRouterActionParam {
  uuid: string;
  dns: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveHostRouteFromL3NetworkActionParam {
  l3NetworkUuid: string;
  prefix: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveIAM2VirtualIDsFromGroupActionParam {
  virtualIDUuids: any[];
  groupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveIAM2VirtualIDsFromOrganizationActionParam {
  virtualIDUuids: any[];
  organizationUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveIAM2VirtualIDsFromProjectActionParam {
  projectUuid: string;
  virtualIDUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveLabelFromAlarmActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveLabelFromEventSubscriptionActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveMdevDeviceSpecFromVmInstanceActionParam {
  mdevSpecUuid: string;
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveMonFromCephBackupStorageActionParam {
  uuid: string;
  monHostnames: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveMonFromCephPrimaryStorageActionParam {
  uuid: string;
  monHostnames: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemovePciDeviceSpecFromVmInstanceActionParam {
  pciSpecUuid: string;
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemovePolicyStatementsFromRoleActionParam {
  uuid: string;
  policyStatementUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveRemoteCidrsFromIPsecConnectionActionParam {
  uuid: string;
  peerCidrs: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveRendezvousPointFromMulticastRouterActionParam {
  uuid: string;
  rpAddress: string;
  groupAddress: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveRolesFromIAM2VirtualIDActionParam {
  roleUuids: any[];
  virtualIDUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveRolesFromIAM2VirtualIDGroupActionParam {
  roleUuids: any[];
  groupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveSNSDingTalkAtPersonActionParam {
  endpointUuid: string;
  phoneNumber: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveSNSSmsReceiverActionParam {
  endpointUuid: string;
  phoneNumber: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveSchedulerJobFromSchedulerTriggerActionParam {
  schedulerJobUuid: string;
  schedulerTriggerUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveSchedulerJobGroupFromSchedulerTriggerActionParam {
  schedulerJobGroupUuid: string;
  schedulerTriggerUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveSchedulerJobsFromSchedulerJobGroupActionParam {
  schedulerJobGroupUuid: string;
  schedulerJobUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveSdnControllerActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveTicketTypesFromTicketFlowCollectionActionParam {
  ticketFlowCollectionUuid: string;
  ticketTypeUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveUserFromGroupActionParam {
  userUuid: string;
  groupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveVRouterNetworksFromFlowMeterActionParam {
  uuids: any[];
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveVRouterNetworksFromOspfAreaActionParam {
  uuids: any[];
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveVmFromAffinityGroupActionParam {
  affinityGroupUuid: string;
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RemoveVmNicFromLoadBalancerActionParam {
  vmNicUuids: any[];
  listenerUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RenewSessionActionParam {
  sessionUuid: string;
  duration?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RequestConsoleAccessActionParam {
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RerunLongJobActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ResetGlobalConfigActionParam {
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ResetTemplateConfigActionParam {
  templateUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ResetTwoFactorAuthenticationSecretActionParam {
  name: string;
  password: string;
  type: string;
  captchaUuid?: string;
  verifyCode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ResizeDataVolumeActionParam {
  uuid: string;
  size: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ResizeRootVolumeActionParam {
  uuid: string;
  size: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RestartResourceStackActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ResumeLongJobActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ResumeVmInstanceActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RevertVmFromSnapshotGroupActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RevertVmFromVmBackupActionParam {
  groupUuid: string;
  backupStorageUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RevertVolumeFromSnapshotActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RevertVolumeFromVolumeBackupActionParam {
  uuid: string;
  backupStorageUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RevokeResourceSharingActionParam {
  resourceUuids: any[];
  toPublic?: boolean;
  accountUuids?: any[];
  all?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RunIAM2ScriptActionParam {
  scriptContent: string;
  scriptExecutor?: string;
  scriptParams?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface RunSchedulerTriggerActionParam {
  uuid: string;
  jobUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SelfTestLocalRaidActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetFlowMeterRouterIdActionParam {
  vRouterUuid: string;
  routerId: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetIAM2ProjectRetirePolicyActionParam {
  uuid: string;
  policy: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetImageBootModeActionParam {
  uuid: string;
  bootMode: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetImageQgaActionParam {
  uuid: string;
  enable: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetImageSecurityLevelActionParam {
  uuid: string;
  securityLevel?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetImageStoreBackupStorageQuotaActionParam {
  uuids?: any[];
  maxCapacity: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetL3NetworkMtuActionParam {
  l3NetworkUuid: string;
  mtu: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetL3NetworkRouterInterfaceIpActionParam {
  l3NetworkUuid: string;
  routerInterfaceIp: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetNicQosActionParam {
  uuid: string;
  outboundBandwidth?: number;
  inboundBandwidth?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetOrganizationSupervisorActionParam {
  uuid: string;
  virtualIDUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVRouterRouterIdActionParam {
  vRouterUuid: string;
  routerId: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVipQosActionParam {
  uuid: string;
  port?: number;
  outboundBandwidth?: number;
  inboundBandwidth?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmBootModeActionParam {
  uuid: string;
  bootMode: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmBootOrderActionParam {
  uuid: string;
  bootOrder?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmCleanTrafficActionParam {
  uuid: string;
  enable: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmConsoleModeActionParam {
  uuid: string;
  mode: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmConsolePasswordActionParam {
  uuid: string;
  consolePassword: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmHostnameActionParam {
  uuid: string;
  hostname: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmInstanceDefaultCdRomActionParam {
  uuid: string;
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmInstanceHaLevelActionParam {
  uuid: string;
  level: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmMonitorNumberActionParam {
  uuid: string;
  monitorNumber: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmQgaActionParam {
  uuid: string;
  enable: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmQxlMemoryActionParam {
  uuid: string;
  ram?: number;
  vram?: number;
  vgamem?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmRDPActionParam {
  uuid: string;
  enable: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmSecurityLevelActionParam {
  uuid: string;
  securityLevel?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmSoundTypeActionParam {
  uuid: string;
  soundType: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmSshKeyActionParam {
  uuid: string;
  SshKey: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmStaticIpActionParam {
  vmInstanceUuid: string;
  l3NetworkUuid: string;
  ip?: string;
  ip6?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmUsbRedirectActionParam {
  uuid: string;
  enable: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVmUserDefinedXmlActionParam {
  vmInstanceUuid: string;
  xmlBase64: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVolumeQosActionParam {
  uuid: string;
  mode?: string;
  volumeBandwidth: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVpcVRouterDistributedRoutingEnabledActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SetVpcVRouterNetworkServiceStateActionParam {
  uuid: string;
  networkService: string;
  state: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ShareResourceActionParam {
  resourceUuids: any[];
  accountUuids?: any[];
  toPublic?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ShrinkVolumeSnapshotActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface StartBaremetalInstanceActionParam {
  uuid: string;
  pxeBoot?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface StartBaremetalPxeServerActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface StartConnectionBetweenAliyunRouterInterfaceActionParam {
  vrouterInterfaceUuid: string;
  vbrInterfaceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface StartEcsInstanceActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface StartVmInstanceActionParam {
  uuid: string;
  clusterUuid?: string;
  hostUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface StopAllResourcesInIAM2ProjectActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface StopBaremetalInstanceActionParam {
  uuid: string;
  type?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface StopBaremetalPxeServerActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface StopEcsInstanceActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface StopVmInstanceActionParam {
  uuid: string;
  type?: string;
  stopHA?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SubmitLongJobActionParam {
  name?: string;
  description?: string;
  jobName: string;
  jobData: string;
  targetResourceUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SubscribeEventActionParam {
  name?: string;
  namespace: string;
  eventName: string;
  actions?: any[];
  labels?: any[];
  emergencyLevel?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SubscribeSNSTopicActionParam {
  topicUuid: string;
  endpointUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncAliyunRouteEntryFromRemoteActionParam {
  vRouterUuid: string;
  vRouterType: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncAliyunRouterInterfaceFromRemoteActionParam {
  dataCenterUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncAliyunSnapshotRemoteActionParam {
  dataCenterUuid: string;
  snapshotId?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncAliyunVirtualRouterFromRemoteActionParam {
  vpcUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncBackupFromImageStoreBackupStorageActionParam {
  uuid: string;
  srcBackupStorageUuid: string;
  dstBackupStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncConnectionAccessPointFromRemoteActionParam {
  dataCenterUuid: string;
  accessPointId?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncDatabaseBackupActionParam {
  imageStoreUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncDatabaseBackupFromImageStoreBackupStorageActionParam {
  uuid: string;
  srcBackupStorageUuid: string;
  dstBackupStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncDiskFromAliyunFromRemoteActionParam {
  identityUuid: string;
  diskId?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncEcsImageFromRemoteActionParam {
  dataCenterUuid: string;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncEcsInstanceFromRemoteActionParam {
  dataCenterUuid: string;
  onlyZstack?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncEcsSecurityGroupFromRemoteActionParam {
  ecsVpcUuid: string;
  securityGroupId?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncEcsSecurityGroupRuleFromRemoteActionParam {
  uuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncEcsVSwitchFromRemoteActionParam {
  dataCenterUuid: string;
  vSwitchId?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncEcsVpcFromRemoteActionParam {
  dataCenterUuid: string;
  ecsVpcId?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncHybridEipFromRemoteActionParam {
  type: string;
  dataCenterUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncImageFromImageStoreBackupStorageActionParam {
  uuid: string;
  srcBackupStorageUuid: string;
  dstBackupStorageUuid: string;
  name: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncImageSizeActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncLdapServerActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncPrimaryStorageCapacityActionParam {
  primaryStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncVCenterActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncVirtualBorderRouterFromRemoteActionParam {
  dataCenterUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncVmBackupActionParam {
  imageStoreUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncVmBackupFromImageStoreBackupStorageActionParam {
  groupUuid: string;
  srcBackupStorageUuid: string;
  dstBackupStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncVolumeBackupActionParam {
  imageStoreUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncVolumeSizeActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncVpcUserVpnGatewayFromRemoteActionParam {
  dataCenterUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncVpcVpnConnectionFromRemoteActionParam {
  dataCenterUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncVpcVpnGatewayFromRemoteActionParam {
  dataCenterUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface SyncZBoxCapacityActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface TerminateVirtualBorderRouterRemoteActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface TriggerGCJobActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UngenerateMdevDevicesActionParam {
  pciDeviceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UngenerateSriovPciDevicesActionParam {
  pciDeviceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UngroupVolumeSnapshotGroupActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UnsubscribeEventActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UnsubscribeSNSTopicActionParam {
  topicUuid: string;
  endpointUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAccessControlRuleActionParam {
  uuid: string;
  name?: string;
  description?: string;
  rule?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAccountActionParam {
  uuid: string;
  password?: string;
  name?: string;
  description?: string;
  oldPassword?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAffinityGroupActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAlarmActionParam {
  uuid: string;
  name?: string;
  description?: string;
  comparisonOperator?: string;
  period?: number;
  threshold?: any;
  repeatInterval?: number;
  repeatCount?: number;
  enableRecovery?: boolean;
  emergencyLevel?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAlarmDataActionParam {
  dataUuid?: string;
  dataStartTime?: number;
  dataEndTime?: number;
  updateMode: string;
  readStatus?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAlarmLabelActionParam {
  uuid: string;
  key: string;
  value: string;
  operator: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAliyunDiskActionParam {
  uuid: string;
  name?: string;
  description?: string;
  deleteWithInstance?: boolean;
  deleteAutoSnapshot?: boolean;
  enableAutoSnapshot?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAliyunEbsBackupStorageActionParam {
  ossBucketUuid?: string;
  url?: string;
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAliyunEbsPrimaryStorageActionParam {
  panguAppName?: string;
  panguPartitionName?: string;
  uuid: string;
  name?: string;
  description?: string;
  url?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAliyunKeySecretActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAliyunMountTargetActionParam {
  accessGroupUuid: string;
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAliyunNasAccessGroupActionParam {
  uuid: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAliyunPanguPartitionActionParam {
  uuid: string;
  name?: string;
  description?: string;
  appName?: string;
  partitionName?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAliyunProxyVSwitchActionParam {
  uuid: string;
  status?: string;
  isDefault?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAliyunProxyVpcActionParam {
  uuid: string;
  name?: string;
  description?: string;
  isDefault?: boolean;
  status?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAliyunRouteInterfaceRemoteActionParam {
  uuid: string;
  op: string;
  vRouterType: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAliyunSmsSNSTextTemplateActionParam {
  alarmTemplateCode?: string;
  sign?: string;
  eventTemplateCode?: string;
  eventTemplate?: string;
  uuid: string;
  name?: string;
  description?: string;
  template?: string;
  recoveryTemplate?: string;
  defaultTemplate?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAliyunSnapshotActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAliyunVirtualRouterActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAppBuildSystemActionParam {
  uuid: string;
  name?: string;
  description?: string;
  username?: string;
  password?: string;
  sshPort?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAutoScalingGroupActionParam {
  uuid: string;
  name?: string;
  description?: string;
  minResourceSize?: number;
  maxResourceSize?: number;
  removalPolicy?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAutoScalingGroupAddingNewInstanceRuleActionParam {
  adjustmentType?: string;
  adjustmentValue?: number;
  uuid: string;
  name?: string;
  description?: string;
  cooldown?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAutoScalingGroupInstanceActionParam {
  groupUuid: string;
  instanceUuid: string;
  protectionStrategy?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAutoScalingGroupRemovalInstanceRuleActionParam {
  adjustmentType?: string;
  adjustmentValue?: number;
  removalPolicy?: string;
  uuid: string;
  name?: string;
  description?: string;
  cooldown?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAutoScalingRuleActionParam {
  uuid: string;
  name?: string;
  description?: string;
  cooldown?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateAutoScalingVmTemplateActionParam {
  uuid: string;
  name?: string;
  description?: string;
  vmInstanceName?: string;
  vmInstanceDescription?: string;
  vmInstanceOfferingUuid?: string;
  imageUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateBackupStorageActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateBaremetalChassisActionParam {
  uuid: string;
  name?: string;
  description?: string;
  ipmiAddress?: string;
  ipmiPort?: number;
  ipmiUsername?: string;
  ipmiPassword?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateBaremetalInstanceActionParam {
  uuid: string;
  name?: string;
  description?: string;
  password?: string;
  platform?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateBaremetalPxeServerActionParam {
  uuid: string;
  name?: string;
  description?: string;
  dhcpRangeBegin?: string;
  dhcpRangeEnd?: string;
  dhcpRangeNetmask?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateBuildAppActionParam {
  uuid: string;
  name?: string;
  description?: string;
  version?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateCephBackupStorageMonActionParam {
  monUuid: string;
  hostname?: string;
  sshUsername?: string;
  sshPassword?: string;
  sshPort?: number;
  monPort?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateCephPrimaryStorageMonActionParam {
  monUuid: string;
  hostname?: string;
  sshUsername?: string;
  sshPassword?: string;
  sshPort?: number;
  monPort?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateCephPrimaryStoragePoolActionParam {
  uuid: string;
  aliasName?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateCertificateActionParam {
  uuid: string;
  name?: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateClusterActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateClusterDRSActionParam {
  uuid: string;
  name?: string;
  description?: string;
  automationLevel?: string;
  thresholds?: any[];
  thresholdDuration?: number;
  state?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateClusterOSActionParam {
  uuid: string;
  excludePackages?: any[];
  updatePackages?: any[];
  releaseVersion?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateConnectionBetweenL3NetWorkAndAliyunVSwitchActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateConsoleProxyAgentActionParam {
  uuid: string;
  consoleProxyOverriddenIp: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateDiskOfferingActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateEcsImageActionParam {
  uuid: string;
  description?: string;
  name?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateEcsInstanceActionParam {
  uuid: string;
  name?: string;
  description?: string;
  password?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateEcsInstanceVncPasswordActionParam {
  uuid: string;
  password: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateEcsSecurityGroupActionParam {
  uuid: string;
  description?: string;
  name?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateEcsVSwitchActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateEcsVpcActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateEipActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateEmailAddressOfSNSEmailEndpointActionParam {
  emailAddressUuid: string;
  endpointUuid: string;
  emailAddress: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateEmailMediaActionParam {
  uuid: string;
  name?: string;
  description?: string;
  smtpServer?: string;
  smtpPort?: number;
  username?: string;
  password?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateEmailMonitorTriggerActionActionParam {
  uuid: string;
  name?: string;
  email?: string;
  mediaUuid?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateEventDataActionParam {
  dataUuid?: string;
  dataStartTime?: number;
  dataEndTime?: number;
  updateMode: string;
  readStatus?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateEventSubscriptionLabelActionParam {
  uuid: string;
  key: string;
  value: string;
  operator: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateFactoryModeStateActionParam {
  factoryModeState: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateFirewallIpSetTemplateActionParam {
  uuid: string;
  name?: string;
  sourceValue?: string;
  destValue?: string;
  type?: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateFirewallRuleActionParam {
  ruleSetUuid: string;
  uuid: string;
  action: string;
  protocol?: string;
  destPort?: string;
  sourcePort?: string;
  sourceIp?: string;
  destIp?: string;
  allowStates?: string;
  tcpFlag?: string;
  icmpTypeName?: string;
  ruleNumber: number;
  enableLog?: boolean;
  state: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateFirewallRuleSetActionParam {
  uuid: string;
  name?: string;
  description?: string;
  actionType?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateFirewallRuleTemplateActionParam {
  uuid: string;
  name: string;
  action: string;
  protocol?: string;
  destPort?: string;
  sourcePort?: string;
  sourceIp?: string;
  destIp?: string;
  allowStates?: string;
  tcpFlag?: string;
  icmpTypeName?: string;
  ruleNumber: number;
  enableLog?: boolean;
  state?: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateFlowCollectorActionParam {
  uuid: string;
  server?: string;
  port?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateFlowMeterActionParam {
  uuid: string;
  version?: string;
  sample?: number;
  name?: string;
  expireInterval?: number;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateGlobalConfigActionParam {
  category: string;
  name: string;
  value?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateHostActionParam {
  uuid: string;
  name?: string;
  description?: string;
  managementIp?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateHostIommuStateActionParam {
  uuid: string;
  state: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateHybridEipActionParam {
  uuid: string;
  name?: string;
  description?: string;
  type: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateHybridKeySecretActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateIAM2OrganizationActionParam {
  uuid: string;
  name?: string;
  description?: string;
  parentUuid?: string;
  type?: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateIAM2OrganizationAttributeActionParam {
  uuid: string;
  value: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateIAM2ProjectActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateIAM2ProjectAttributeActionParam {
  uuid: string;
  value: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateIAM2ProjectTemplateActionParam {
  uuid: string;
  name?: string;
  description?: string;
  attributes?: any[];
  quota?: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateIAM2TicketFlowActionParam {
  uuid: string;
  name?: string;
  description?: string;
  approverUuid?: string;
  approverTitle?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateIAM2TicketFlowCollectionActionParam {
  flows?: any[];
  uuid: string;
  name?: string;
  description?: string;
  isDefault?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateIAM2VirtualIDActionParam {
  uuid: string;
  name?: string;
  description?: string;
  password?: string;
  oldPassword?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateIAM2VirtualIDAttributeActionParam {
  uuid: string;
  value: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateIAM2VirtualIDGroupActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateIAM2VirtualIDGroupAttributeActionParam {
  uuid: string;
  value: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateIPsecConnectionActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateImageActionParam {
  uuid: string;
  name?: string;
  description?: string;
  guestOsType?: string;
  mediaType?: string;
  format?: string;
  system?: boolean;
  platform?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateImageStoreBackupStorageActionParam {
  username?: string;
  password?: string;
  hostname?: string;
  sshPort?: number;
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateInstanceOfferingActionParam {
  uuid: string;
  name?: string;
  description?: string;
  allocatorStrategy?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateIpRangeActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateIscsiServerActionParam {
  uuid: string;
  name?: string;
  chapUserName?: string;
  chapUserPassword?: string;
  state?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateKVMHostActionParam {
  username?: string;
  password?: string;
  sshPort?: number;
  uuid: string;
  name?: string;
  description?: string;
  managementIp?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateL2NetworkActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateL3NetworkActionParam {
  uuid: string;
  name?: string;
  description?: string;
  dnsDomain?: string;
  category?: string;
  system?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateLdapServerActionParam {
  ldapServerUuid: string;
  name?: string;
  description?: string;
  url?: string;
  base?: string;
  username?: string;
  password?: string;
  encryption?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateLicenseActionParam {
  managementNodeUuid: string;
  license: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateLoadBalancerActionParam {
  uuid: string;
  name?: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateLoadBalancerListenerActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateLogConfigurationActionParam {
  configId: number;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateLongJobActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateMdevDeviceActionParam {
  uuid: string;
  name?: string;
  description?: string;
  state?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateMdevDeviceSpecActionParam {
  uuid: string;
  name?: string;
  description?: string;
  state?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateMonitorTriggerActionParam {
  uuid: string;
  name?: string;
  description?: string;
  expression?: string;
  duration?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateNasFileSystemActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateNasMountTargetActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateOssBucketActionParam {
  uuid: string;
  description?: string;
  ossDomain?: string;
  ossKey?: string;
  ossSecret?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdatePciDeviceActionParam {
  uuid: string;
  state?: string;
  name?: string;
  description?: string;
  metaData?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdatePciDeviceSpecActionParam {
  uuid: string;
  name?: string;
  description?: string;
  romContent?: string;
  romVersion?: string;
  abandonSpecRom?: boolean;
  state?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdatePolicyRouteRuleSetActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdatePortForwardingRuleActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdatePortMirrorActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdatePreconfigurationTemplateActionParam {
  uuid: string;
  name?: string;
  description?: string;
  distribution?: string;
  type?: string;
  content?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdatePriceTableActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdatePrimaryStorageActionParam {
  uuid: string;
  name?: string;
  description?: string;
  url?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdatePriorityConfigActionParam {
  uuid: string;
  cpuShares?: number;
  oomScoreAdj?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdatePublishAppActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateQuotaActionParam {
  identityUuid: string;
  name: string;
  value: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateResourceConfigActionParam {
  category: string;
  name: string;
  resourceUuid: string;
  value: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateResourcePriceActionParam {
  uuid: string;
  endDateInLong?: number;
  setEndDateInLongBaseOnCurrentTime?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateResourceStackActionParam {
  uuid: string;
  name?: string;
  description?: string;
  rollback?: boolean;
  templateContent?: string;
  parameters?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateRoleActionParam {
  uuid: string;
  name?: string;
  description?: string;
  statements?: any[];
  policyUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateSNSApplicationEndpointActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateSNSApplicationPlatformActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateSNSTextTemplateActionParam {
  uuid: string;
  name?: string;
  description?: string;
  template?: string;
  recoveryTemplate?: string;
  defaultTemplate?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateSNSTopicActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateSchedulerJobActionParam {
  uuid: string;
  name?: string;
  description?: string;
  parameters?: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateSchedulerJobGroupActionParam {
  uuid: string;
  name?: string;
  description?: string;
  state?: string;
  parameters?: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateSchedulerTriggerActionParam {
  uuid: string;
  name?: string;
  description?: string;
  schedulerInterval?: number;
  repeatCount?: number;
  startTime?: number;
  cron?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateScsiLunActionParam {
  uuid: string;
  name?: string;
  state?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateSdnControllerActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateSecurityGroupActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateSftpBackupStorageActionParam {
  username?: string;
  password?: string;
  hostname?: string;
  sshPort?: number;
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateSharedBlockDiskUuidActionParam {
  uuid: string;
  sharedBlockGroupUuid: string;
  diskUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateStackTemplateActionParam {
  uuid: string;
  name?: string;
  description?: string;
  state?: boolean;
  templateContent?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateSubscribeEventActionParam {
  uuid: string;
  emergencyLevel?: string;
  name?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateSystemTagActionParam {
  uuid: string;
  tag: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateTagActionParam {
  uuid: string;
  name?: string;
  value?: string;
  description?: string;
  color?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateTemplateConfigActionParam {
  templateUuid: string;
  category: string;
  name: string;
  value: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateThirdpartyAlertsActionParam {
  uuid?: string;
  startTimeMillis?: number;
  endTimeMillis?: number;
  updateReadStatus?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateThirdpartyPlatformActionParam {
  uuid: string;
  name?: string;
  description?: string;
  template?: string;
  url?: string;
  stateEvent?: string;
  lastSyncDateMills?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateTicketRequestActionParam {
  uuid: string;
  requests: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateUsbDeviceActionParam {
  uuid: string;
  name?: string;
  description?: string;
  state?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateUserActionParam {
  uuid?: string;
  password?: string;
  name?: string;
  description?: string;
  oldPassword?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateUserGroupActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateV2VConversionHostActionParam {
  uuid: string;
  name?: string;
  description?: string;
  storagePath?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVCenterActionParam {
  uuid: string;
  name?: string;
  description?: string;
  username?: string;
  password?: string;
  domainName?: string;
  port?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVRouterOspfAreaActionParam {
  uuid: string;
  areaAuth?: string;
  areaType?: string;
  password?: string;
  keyId?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVRouterRouteTableActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVipActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVirtualBorderRouterRemoteActionParam {
  uuid: string;
  localGatewayIp?: string;
  peerGatewayIp?: string;
  peeringSubnetMask?: string;
  name?: string;
  description?: string;
  vlanId?: string;
  circuitCode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVirtualRouterActionParam {
  vmInstanceUuid: string;
  defaultRouteL3NetworkUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVirtualRouterOfferingActionParam {
  isDefault?: boolean;
  imageUuid?: string;
  uuid: string;
  name?: string;
  description?: string;
  allocatorStrategy?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVmCdRomActionParam {
  uuid: string;
  description?: string;
  name?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVmInstanceActionParam {
  uuid: string;
  name?: string;
  description?: string;
  state?: string;
  defaultL3NetworkUuid?: string;
  platform?: string;
  cpuNum?: number;
  memorySize?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVmNicDriverActionParam {
  vmInstanceUuid: string;
  vmNicUuid: string;
  driverType: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVmNicMacActionParam {
  vmNicUuid: string;
  mac: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVmPriorityActionParam {
  uuid: string;
  priority: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVniRangeActionParam {
  uuid: string;
  name: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVolumeActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVolumeSnapshotActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVolumeSnapshotGroupActionParam {
  name?: string;
  description?: string;
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVpcFirewallActionParam {
  uuid: string;
  description?: string;
  name?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVpcHaGroupActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVpcUserVpnGatewayActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVpcVpnConnectionRemoteActionParam {
  uuid: string;
  name?: string;
  description?: string;
  localCidr?: string;
  remoteCidr?: string;
  active?: boolean;
  ikeConfUuid?: string;
  ipsecConfUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateVpcVpnGatewayActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateWebhookActionParam {
  uuid: string;
  name?: string;
  description?: string;
  url?: string;
  type?: string;
  opaque?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface UpdateZoneActionParam {
  name?: string;
  description?: string;
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ValidateDiskOfferingUserConfigActionParam {
  config: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ValidateInstanceOfferingUserConfigActionParam {
  config: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ValidatePriceUserConfigActionParam {
  config: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ValidateSNSAliyunSmsEndpointActionParam {
  uuid: string;
  phoneNumbers: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
export interface ValidateSNSEmailPlatformActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}
