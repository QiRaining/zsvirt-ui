import { gql } from '@apollo/client';
export type Maybe<T> = T;
export type InputMaybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Any: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  /** A custom parser */
  CondtionValue: { input: any; output: any; }
}

export interface AccessControlRule {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** 数据保护是否通过 */
  isValid?: Maybe<Scalars['Boolean']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  rule: Scalars['String']['output'];
  strategy: AccessControlRuleType;
  uuid: Scalars['String']['output'];
}

export interface AccessControlRuleList {
  error?: Maybe<ActionError>;
  /** 查询结果列表 */
  list?: Maybe<Array<AccessControlRule>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum AccessControlRuleQueryType {
  Normal = 'Normal'
}

export enum AccessControlRuleType {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT'
}

export interface AccessKey {
  AccessKeyID?: Maybe<Scalars['String']['output']>;
  AccessKeySecret?: Maybe<Scalars['String']['output']>;
  accountUuid?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<AccessKeyOwner>;
  state?: Maybe<Scalars['String']['output']>;
  userUuid?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface AccessKeyOwner {
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface AccessPath {
  accessPathId: Scalars['Int']['output'];
  accessPathIqn: Scalars['String']['output'];
  name: Scalars['String']['output'];
  targetCount: Scalars['Int']['output'];
}

export interface AccessPathQueryResp {
  list?: Maybe<Array<AccessPath>>;
  success?: Maybe<Scalars['Boolean']['output']>;
}

export interface AccounThirdPartyAuthResourceref {
  userCount?: Maybe<Scalars['Int']['output']>;
}

export interface AccountGroupOwner {
  createDate: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
  vmNum?: Maybe<Scalars['Int']['output']>;
  volumeNum?: Maybe<Scalars['Int']['output']>;
}

export interface AccountGroupOwnerQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<AccountGroupOwner>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
  type: OwnerQueryType;
}

export interface AccountInfo {
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface AccountOwner {
  createDate: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
  vmNum?: Maybe<Scalars['Int']['output']>;
  volumeNum?: Maybe<Scalars['Int']['output']>;
}

export interface AccountOwnerQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<AccountOwner>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
  type: OwnerQueryType;
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

export interface AccountQuotaInfo {
  usages?: Maybe<Array<AccountQuotaUsage>>;
  volumeNum?: Maybe<Scalars['Int']['output']>;
}

export interface AccountQuotaUsage {
  name: Scalars['String']['output'];
  total: Scalars['Float']['output'];
  used: Scalars['Float']['output'];
}

export interface AccountResourceRefInventory {
  accountUuid?: Maybe<Scalars['String']['output']>;
  ownerAccountUuid?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  resourceUuid?: Maybe<Scalars['String']['output']>;
}

export interface AccountResp {
  /** 查询结果列表 */
  list?: Maybe<Array<AccountVO>>;
  result?: Maybe<AccountQueryType>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface AccountThirdPartyAuth {
  accountUuid?: Maybe<Scalars['String']['output']>;
  authorizationUrl?: Maybe<Scalars['String']['output']>;
  bindResourceref?: Maybe<AccounThirdPartyAuthResourceref>;
  casServerLoginUrl?: Maybe<Scalars['String']['output']>;
  casServerUrlPrefix?: Maybe<Scalars['String']['output']>;
  clientId?: Maybe<Scalars['String']['output']>;
  clientSecret?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  loginMNUrl?: Maybe<Scalars['String']['output']>;
  logoutUrl?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  redirectTemplateRef: RedirectTemplateRef;
  redirectUrl?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  tokenUrl?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  userinfoUrl?: Maybe<Scalars['String']['output']>;
  usernameProperty?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface AccountThirdPartyAuthResponse {
  list: Array<AccountThirdPartyAuth>;
  total?: Maybe<Scalars['Int']['output']>;
}

export enum AccountType {
  Normal = 'Normal',
  SystemAdmin = 'SystemAdmin',
  ThirdParty = 'ThirdParty'
}

export interface AccountVO {
  accountQuotaInfo?: Maybe<AccountQuotaInfo>;
  ccsCertificate?: Maybe<CCSCertificate>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Array<ZsvRole>>;
  roleFromAccountGroup?: Maybe<Array<ZsvRole>>;
  state?: Maybe<Scalars['String']['output']>;
  type?: Maybe<AccountType>;
  uuid: Scalars['String']['output'];
  vmNum?: Maybe<Scalars['Int']['output']>;
  volumeNum?: Maybe<Scalars['Int']['output']>;
}

export interface AckAlarmDataInput {
  action: ActionInput;
  payload: AckAlarmDataPayload;
}

export interface AckAlarmDataPayload {
  ackPeriodSec: Scalars['Float']['input'];
  /** 资源报警uuid */
  alarmUuid?: InputMaybe<Scalars['String']['input']>;
  dataUuid: Scalars['String']['input'];
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  /** 事件报警uuid */
  subscriptionUuid?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
}

export interface AckDataInAlarmHistories {
  ackDate?: Maybe<Scalars['String']['output']>;
  ackPeriod?: Maybe<Scalars['String']['output']>;
  operatorAccountUuid?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<Owner>;
  resumeAlert?: Maybe<Scalars['Boolean']['output']>;
}

export interface ActionError {
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
}

export interface ActionExternalPrimaryStoragePoolPayload {
  config?: InputMaybe<StoragePoolConfigPayload>;
  /** 外部主存储的 uuid */
  uuid: Scalars['String']['input'];
}

export interface ActionInput {
  /** 唯一性ID，前端传入，维护 mutation 和 subscription 关系 */
  actionId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** 子任务数量 */
  total?: Scalars['Int']['input'];
}

export enum ActionRespTaskState {
  Error = 'Error',
  Running = 'Running',
  Success = 'Success'
}

export interface ActionResult {
  actionId: Scalars['String']['output'];
}

export interface ActionSendResp {
  actionId: Scalars['String']['output'];
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
}

export interface ActionTaskResult {
  /** 前端传入的 actionId 原封返还，用于建立关联 */
  actionId: Scalars['String']['output'];
  /** ZStack 返回的 error，序列化后传给前端 */
  error?: Maybe<Scalars['String']['output']>;
  /** 本次操作变更的字段，用于改写前端 cache */
  fields?: Maybe<Scalars['String']['output']>;
  /** 操作的实体id，一般为 uuid，如果没有 uuid，需要绑定一个唯一性 key，并且与前端的缓存策略对应 */
  id?: Maybe<Scalars['String']['output']>;
  /** ZStack 返回的 inventory，序列化后传给前端 */
  inventory?: Maybe<Scalars['String']['output']>;
  /** 前端默认监听字段type，但是type主要用于cache，所以增加一个监听字段。 */
  listenerType?: Maybe<Scalars['String']['output']>;
  /** websocket消息按照 sessionId 分发 */
  sessionId: Scalars['String']['output'];
  /** 当前子任务执行状态 */
  state: ActionTaskState;
  /** inventory 的类型，用于改写前端 cache */
  type?: Maybe<Scalars['String']['output']>;
}

export enum ActionTaskState {
  exception = 'exception',
  fail = 'fail',
  running = 'running',
  success = 'success',
  suspended = 'suspended'
}

export interface ActionsMap {
  actionName?: Maybe<Scalars['String']['output']>;
  actions?: Maybe<Scalars['String']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  inDegree?: Maybe<Array<Scalars['String']['output']>>;
  resourceName?: Maybe<Scalars['String']['output']>;
  round?: Maybe<Scalars['Int']['output']>;
}

export interface ActiveAlarm {
  actions?: Maybe<NotifyObject>;
  alarmName?: Maybe<Scalars['String']['output']>;
  comparisonOperator?: Maybe<Scalars['String']['output']>;
  emergencyLevel?: Maybe<Scalars['String']['output']>;
  metricName?: Maybe<Scalars['String']['output']>;
  namespace?: Maybe<Scalars['String']['output']>;
  operatorAccountName?: Maybe<Scalars['String']['output']>;
  period?: Maybe<Scalars['Int']['output']>;
  repeatCount?: Maybe<Scalars['Int']['output']>;
  repeatInterval?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  threshold?: Maybe<Scalars['Float']['output']>;
  uuid: Scalars['String']['output'];
}

export interface ActiveAlarmStatus {
  ActiveAlarmStatus?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
}

export interface AddAccessControlRuleInput {
  action: ActionInput;
  payload: AddAccessControlRulePayload;
}

export interface AddAccessControlRulePayload {
  controlStrategy: AccessControlRuleType;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  rule: Scalars['String']['input'];
}

export interface AddActionToAlarmInput {
  action: ActionInput;
  payload: Array<AddActionToAlarmPayload>;
}

export interface AddActionToAlarmPayload {
  actionType?: InputMaybe<Scalars['String']['input']>;
  actionUuid: Scalars['String']['input'];
  alarmUuid: Scalars['String']['input'];
}

export interface AddActionToEventSubscriptionInput {
  action: ActionInput;
  payload: Array<AddActionToEventSubscriptionPayload>;
}

export interface AddActionToEventSubscriptionPayload {
  actionType?: InputMaybe<Scalars['String']['input']>;
  actionUuid: Scalars['String']['input'];
  subscriptionUuid: Scalars['String']['input'];
}

export interface AddAlarmToEndPointInput {
  action: ActionInput;
  payload: Array<AddAlarmToEndPointPayload>;
}

export interface AddAlarmToEndPointPayload {
  actionType: Scalars['String']['input'];
  actionUuid: Scalars['String']['input'];
  alarmUuid?: InputMaybe<Scalars['String']['input']>;
  subscriptionUuid?: InputMaybe<Scalars['String']['input']>;
  type: ZWatchAlarmQueryType;
}

export interface AddCbdMdsInput {
  action: ActionInput;
  payload: AddCbdMdsPayload;
}

export interface AddCbdMdsPayload {
  mdsUrl: Scalars['String']['input'];
  /** 主存储UUID */
  uuid: Scalars['String']['input'];
}

export interface AddCephBackupStorageInput {
  action: ActionInput;
  payload: AddCephBackupStoragePayload;
}

export interface AddCephBackupStoragePayload {
  blobDownloadConcurrency?: InputMaybe<Scalars['String']['input']>;
  blobUploadConcurrency?: InputMaybe<Scalars['String']['input']>;
  dataNetwork?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  monUrls: Array<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  poolName?: InputMaybe<Scalars['String']['input']>;
  reservedCapacity?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Scalars['String']['input']>;
  zoneUuid: Scalars['String']['input'];
}

export interface AddCephMonInput {
  action: ActionInput;
  payload: AddCephMonPayload;
}

export interface AddCephMonPayload {
  monUrls: Array<Scalars['String']['input']>;
  type: CephMonType;
  uuid: Scalars['String']['input'];
}

export interface AddCephPrimaryStoragePoolInput {
  action: ActionInput;
  payload: Array<AddCephPrimaryStoragePoolPayload>;
}

export interface AddCephPrimaryStoragePoolPayload {
  aliasName?: InputMaybe<Scalars['String']['input']>;
  isCreate?: InputMaybe<Scalars['Boolean']['input']>;
  poolName: Scalars['String']['input'];
  primaryStorageUuid: Scalars['String']['input'];
  type: CephPrimaryStoragePoolType;
}

export interface AddDnsToL3NetworkInput {
  action: ActionInput;
  payload: Array<AddDnsToL3NetworkPayload>;
}

export interface AddDnsToL3NetworkPayload {
  dns?: InputMaybe<Scalars['String']['input']>;
  l3NetworkUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface AddEmailAddressToEndpointInput {
  action: ActionInput;
  payload: Array<AddEmailAddressToEndpointPayload>;
}

export interface AddEmailAddressToEndpointPayload {
  emailAddress: Scalars['String']['input'];
  endpointUuid: Scalars['String']['input'];
}

export interface AddExternalPrimaryStoragePoolInput {
  action: ActionInput;
  payload: ActionExternalPrimaryStoragePoolPayload;
}

export interface AddGroupInput {
  action: ActionInput;
  payload: Array<AddGroupPayload>;
}

export interface AddGroupPayload {
  name: Scalars['String']['input'];
  parentUuid: Scalars['String']['input'];
  type: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}

export interface AddHostToHostGroupInput {
  action: ActionInput;
  payload: Array<AddHostToHostGroupPayload>;
}

export interface AddHostToHostGroupPayload {
  hostGroupUuid: Scalars['String']['input'];
  hostUuid: Scalars['String']['input'];
}

export interface AddImageInput {
  action: ActionInput;
  payload: AddImagePayload;
}

export interface AddImagePayload {
  architecture?: InputMaybe<CpuArchitecture>;
  backupStorageUuids: Array<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  format: Scalars['String']['input'];
  guestOsType?: InputMaybe<Scalars['String']['input']>;
  hash?: InputMaybe<Scalars['String']['input']>;
  mediaType: ImageMediaType;
  name: Scalars['String']['input'];
  platform?: InputMaybe<ImagePlatform>;
  system?: InputMaybe<Scalars['Boolean']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  url: Scalars['String']['input'];
  virtio?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface AddImageStoreBackupStorageInput {
  action: ActionInput;
  payload: AddImageStoreBackupStoragePayload;
}

export interface AddImageStoreBackupStoragePayload {
  blobDownloadConcurrency?: InputMaybe<Scalars['String']['input']>;
  blobUploadConcurrency?: InputMaybe<Scalars['String']['input']>;
  blockDevicePath?: InputMaybe<Scalars['String']['input']>;
  dataNetwork?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  hostname: Scalars['String']['input'];
  importImages?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  reservedCapacity?: InputMaybe<Scalars['String']['input']>;
  sshPort: Scalars['Int']['input'];
  syncImageNetwork?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
  username: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}

export interface AddIpRangeByCidrInput {
  action: ActionInput;
  payload: Array<AddIpRangeByCidrPayload>;
}

export interface AddIpRangeByCidrPayload {
  addressMode?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  gateway?: InputMaybe<Scalars['String']['input']>;
  ipAllocateStrategy?: InputMaybe<Scalars['String']['input']>;
  ipRangeType?: InputMaybe<Scalars['String']['input']>;
  ipVersion: Scalars['Int']['input'];
  l3NetworkUuid: Scalars['String']['input'];
  name: Scalars['String']['input'];
  networkCidr: Scalars['String']['input'];
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  tagUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  userTags?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface AddIpRangeInput {
  action: ActionInput;
  payload: Array<AddIpRangePayload>;
}

export interface AddIpRangePayload {
  addressMode?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endIp: Scalars['String']['input'];
  gateway?: InputMaybe<Scalars['String']['input']>;
  ipAllocateStrategy?: InputMaybe<Scalars['String']['input']>;
  ipRangeType?: InputMaybe<Scalars['String']['input']>;
  ipVersion: Scalars['Int']['input'];
  l3NetworkUuid: Scalars['String']['input'];
  name: Scalars['String']['input'];
  netmask?: InputMaybe<Scalars['String']['input']>;
  prefixLen?: InputMaybe<Scalars['Int']['input']>;
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  startIp: Scalars['String']['input'];
  /** systemTags */
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  /** tagUuids */
  tagUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  /** userTags */
  userTags?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface AddIscsiServerInput {
  action: ActionInput;
  payload: AddIscsiServerPayload;
}

export interface AddIscsiServerPayload {
  chapUserName?: InputMaybe<Scalars['String']['input']>;
  chapUserPassword?: InputMaybe<Scalars['String']['input']>;
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  ip: Scalars['String']['input'];
  name: Scalars['String']['input'];
  port: Scalars['Float']['input'];
}

export interface AddKVMHostFromConfigFileInput {
  action: ActionInput;
  payload: AddKVMHostFromConfigFilePayload;
}

export interface AddKVMHostFromConfigFilePayload {
  hostInfo: Scalars['String']['input'];
}

export interface AddKVMHostFromScanInput {
  action: ActionInput;
  payload: Array<AddKVMHostFromScanPayload>;
}

export interface AddKVMHostFromScanPayload {
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  expandNodeHostname?: InputMaybe<Scalars['String']['input']>;
  expandNodeIp?: InputMaybe<Scalars['String']['input']>;
  expandNodePassword?: InputMaybe<Scalars['String']['input']>;
  expandNodeUser?: InputMaybe<Scalars['String']['input']>;
  managementIp?: InputMaybe<Scalars['String']['input']>;
  monitorNodeIp?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  poolUuid?: InputMaybe<Scalars['String']['input']>;
  sshPort?: InputMaybe<Scalars['Int']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  tagUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  username: Scalars['String']['input'];
}

export interface AddKVMHostInput {
  action: ActionInput;
  payload: Array<AddKVMHostPayload>;
}

export interface AddKVMHostPayload {
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  managementIp?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  sshPort?: InputMaybe<Scalars['Int']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  tagUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  username: Scalars['String']['input'];
}

export interface AddMigrationServicePackageAction {
  actionId: Scalars['String']['output'];
  jobResult?: Maybe<Scalars['String']['output']>;
  transit?: Maybe<Scalars['String']['output']>;
}

export interface AddMigrationServicePackageInput {
  action: ActionInput;
  payload: AddMigrationServicePackagePayload;
}

export interface AddMigrationServicePackagePayload {
  backupStorageUuid?: InputMaybe<Scalars['String']['input']>;
  hash?: InputMaybe<Scalars['String']['input']>;
  installPath: Scalars['String']['input'];
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
  url: Scalars['String']['input'];
}

export interface AddNicInput {
  action: ActionInput;
  payload: Array<AddNicPayload>;
}

export interface AddNicPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  gateway?: InputMaybe<Scalars['String']['input']>;
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  ipAddress?: InputMaybe<Scalars['String']['input']>;
  mode?: InputMaybe<Scalars['String']['input']>;
  netmask?: InputMaybe<Scalars['String']['input']>;
  slaveUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
  xmitHashPolicy?: InputMaybe<Scalars['String']['input']>;
}

export interface AddNvmeServerInput {
  action: ActionInput;
  payload: AddNvmeServerPayload;
}

export interface AddNvmeServerPayload {
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  ip: Scalars['String']['input'];
  name: Scalars['String']['input'];
  port: Scalars['Float']['input'];
  transport: TransportType;
}

export interface AddPreconfigurationTemplateInput {
  action: ActionInput;
  payload: Array<AddPreconfigurationTemplatePayload>;
}

export interface AddPreconfigurationTemplatePayload {
  content: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  distribution: Scalars['String']['input'];
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
}

export interface AddResourceToBackupJobInput {
  action: ActionInput;
  payload: Array<AddResourceToBackupJobPayload>;
}

export interface AddResourceToBackupJobPayload {
  priorities?: InputMaybe<Array<Priority>>;
  resourceUuids: Array<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface AddResourcesToDirectoryInput {
  action: ActionInput;
  payload: Array<AddResourcesToDirectoryPayload>;
}

export interface AddResourcesToDirectoryPayload {
  directoryUuid: Scalars['String']['input'];
  originDirectoryUuid: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface AddRuleParam {
  action?: InputMaybe<SecurityGroupRulePolicy>;
  allowedCidr?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dstIpRange?: InputMaybe<Scalars['String']['input']>;
  dstPortRange?: InputMaybe<Scalars['String']['input']>;
  endPort?: InputMaybe<Scalars['Int']['input']>;
  ipVersion?: InputMaybe<Scalars['Int']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  protocol?: InputMaybe<SecurityGroupRuleProtocolType>;
  remoteSecurityGroupUuid?: InputMaybe<Scalars['String']['input']>;
  remoteSecurityGroupUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  srcIpRange?: InputMaybe<Scalars['String']['input']>;
  srcPortRange?: InputMaybe<Scalars['String']['input']>;
  startPort?: InputMaybe<Scalars['Int']['input']>;
  state: SecurityGroupRuleState;
  type?: InputMaybe<SecurityGroupRuleType>;
}

export interface AddSNSDingTalkAtPersonInput {
  action: ActionInput;
  payload: Array<AddSNSDingTalkAtPersonPayload>;
}

export interface AddSNSDingTalkAtPersonPayload {
  endpointUuid: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
  remark?: InputMaybe<Scalars['String']['input']>;
}

export interface AddSNSFeiShuAtPersonInput {
  action: ActionInput;
  payload: Array<AddSNSFeiShuAtPersonPayload>;
}

export interface AddSNSFeiShuAtPersonPayload {
  endpointUuid: Scalars['String']['input'];
  remark?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
}

export interface AddSNSWeComAtPersonInput {
  action: ActionInput;
  payload: Array<AddSNSWeComAtPersonPayload>;
}

export interface AddSNSWeComAtPersonPayload {
  endpointUuid: Scalars['String']['input'];
  remark?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
}

export interface AddSSOThirdPartyAuthInput {
  action: ActionInput;
  payload: AddSSOThirdPartyAuthPayload;
}

export interface AddSSOThirdPartyAuthPayload {
  authorizationUrl?: InputMaybe<Scalars['String']['input']>;
  casServerLoginUrl?: InputMaybe<Scalars['String']['input']>;
  casServerUrlPrefix?: InputMaybe<Scalars['String']['input']>;
  clientId?: InputMaybe<Scalars['String']['input']>;
  clientSecret?: InputMaybe<Scalars['String']['input']>;
  clientType: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  grantType: Scalars['String']['input'];
  logoutUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  redirectTemplate?: InputMaybe<Scalars['String']['input']>;
  redirectUrl?: InputMaybe<Scalars['String']['input']>;
  serverName?: InputMaybe<Scalars['String']['input']>;
  tokenUrl?: InputMaybe<Scalars['String']['input']>;
  urlTemplate: Scalars['String']['input'];
  userinfoUrl?: InputMaybe<Scalars['String']['input']>;
  usernameProperty?: InputMaybe<Scalars['String']['input']>;
}

export interface AddSecretServerInput {
  action: ActionInput;
  payload: AddSecretServerPayload;
}

export interface AddSecretServerPayload {
  appId?: InputMaybe<Scalars['String']['input']>;
  clientID?: InputMaybe<Scalars['String']['input']>;
  clientSecrete?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  heartbeatInterval?: Scalars['Int']['input'];
  keyNumSM2?: InputMaybe<Scalars['String']['input']>;
  keyNumSM4?: InputMaybe<Scalars['String']['input']>;
  managementIp: Scalars['String']['input'];
  model: SecretResourcePoolModel;
  name: Scalars['String']['input'];
  port: Scalars['Int']['input'];
  realm?: InputMaybe<Scalars['String']['input']>;
  route?: InputMaybe<Scalars['String']['input']>;
  type?: SecurityMachineType;
  zoneUuid: Scalars['ID']['input'];
}

export interface AddSecurityGroupRuleInput {
  action: ActionInput;
  payload: AddSecurityGroupRulePayload;
}

export interface AddSecurityGroupRulePayload {
  priority?: InputMaybe<Scalars['Int']['input']>;
  remoteSecurityGroupUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  rules: Array<AddRuleParam>;
  securityGroupUuid: Scalars['String']['input'];
}

export interface AddSharedBlockToSharedBlockGroupInput {
  action: ActionInput;
  payload: Array<AddSharedBlockToSharedBlockGroupPayload>;
}

export interface AddSharedBlockToSharedBlockGroupPayload {
  diskUuid: Scalars['String']['input'];
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export interface AddSmsReceiverInput {
  action: ActionInput;
  payload: Array<AddSmsReceiverPayload>;
}

export interface AddSmsReceiverPayload {
  endpointUuid: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
  /** 现阶段只有一个选项,所以非必填 */
  type?: InputMaybe<SmsReceiverType>;
}

export interface AddThirdPartyAuthInput {
  action: ActionInput;
  payload: AddThirdPartyAuthPayload;
}

export interface AddThirdPartyAuthPayload {
  base: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  encryption: Scalars['String']['input'];
  filter?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  serverType: Scalars['String']['input'];
  syncCreatedAccountStrategy?: InputMaybe<Scalars['String']['input']>;
  syncDeletedAccountStrategy?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  tagList?: InputMaybe<Array<Scalars['String']['input']>>;
  url: Scalars['String']['input'];
  username: Scalars['String']['input'];
  usernameProperty: Scalars['String']['input'];
}

export interface AddTpmToVmInput {
  action: ActionInput;
  payload: AddTpmToVmPayload;
}

export interface AddTpmToVmPayload {
  keyProviderUuid?: InputMaybe<Scalars['String']['input']>;
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  vmInstanceUuid: Scalars['String']['input'];
}

export interface AddUsersInput {
  action: ActionInput;
  payload: Array<AddUsersPayload>;
}

export interface AddUsersPayload {
  accountUuids: Array<Scalars['String']['input']>;
  userGroupUuids: Array<Scalars['String']['input']>;
}

export interface AddVddkPackageAction {
  actionId: Scalars['String']['output'];
  jobResult?: Maybe<Scalars['String']['output']>;
  transit?: Maybe<Scalars['String']['output']>;
}

export interface AddVddkPackageInput {
  action: ActionInput;
  payload: AddVddkPackagePayload;
}

export interface AddVddkPackagePayload {
  url: Scalars['String']['input'];
}

export interface AddVmNicToSecurityGroupInput {
  action: ActionInput;
  payload: Array<AddVmNicToSecurityGroupPayload>;
}

export interface AddVmNicToSecurityGroupPayload {
  l3NetworkUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  securityGroupUuid: Scalars['String']['input'];
  vmNicUuids: Array<Scalars['String']['input']>;
}

export interface AddVmToSnapshotStrategyInput {
  action: ActionInput;
  payload: AddVmToSnapshotStrategyPayload;
}

export interface AddVmToSnapshotStrategyPayload {
  rootVolumeUuids: Array<Scalars['String']['input']>;
  schedulerJobGroupUuid: Scalars['String']['input'];
  snapshotGroupMaxNumber: Scalars['Int']['input'];
}

export interface AddVmToVmGroupInput {
  action: ActionInput;
  payload: Array<AddVmToVmGroupPayload>;
}

export interface AddVmToVmGroupPayload {
  vmGroupUuid: Scalars['String']['input'];
  vmUuid: Scalars['String']['input'];
}

export interface AddXDragonHostInput {
  action: ActionInput;
  payload: Array<AddXDragonHostPayload>;
}

export interface AddXDragonHostPayload {
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  cpuNum?: InputMaybe<Scalars['Float']['input']>;
  cpuSockets?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  managementIp?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  sshPort?: InputMaybe<Scalars['Int']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  tagUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  totalPhysicalMemory?: InputMaybe<Scalars['Float']['input']>;
  username: Scalars['String']['input'];
}

export interface AddedExternalPrimaryStoragePool {
  aliasName?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
}

export interface AddonInfo {
  mdsInfos?: Maybe<Array<MdsInfos>>;
  pools?: Maybe<Array<ExternalPrimaryStoragePool>>;
}

export interface AffinityGroup {
  affinityGroupUuid?: Maybe<Scalars['String']['output']>;
  /** 亲和组使用者标识 */
  appliance: Scalars['String']['output'];
  createDate: Scalars['String']['output'];
  /** 资源的详细描述 */
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate: Scalars['String']['output'];
  /** 资源名称 */
  name: Scalars['String']['output'];
  owner?: Maybe<AccountInfo>;
  /** 亲和组策略 */
  policy: AffinityGroupPolicyType;
  state?: Maybe<AffinityGroupState>;
  /** 亲和组类型 */
  type: Scalars['String']['output'];
  usages: Array<Usage>;
  /** 资源的UUID，唯一标示该资源 */
  uuid: Scalars['String']['output'];
  /** 亲和组分配算法的版本 */
  version: Scalars['String']['output'];
}

export interface AffinityGroupList {
  error?: Maybe<ActionError>;
  list: Array<AffinityGroup>;
  total: Scalars['Int']['output'];
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

export interface AlarmActions {
  actionType?: Maybe<Scalars['String']['output']>;
  actionUuid?: Maybe<Scalars['String']['output']>;
  alarmUuid?: Maybe<Scalars['String']['output']>;
  subscriptionUuid?: Maybe<Scalars['String']['output']>;
}

export interface AlarmActionsInput {
  actionType: Scalars['String']['input'];
  actionUuid: Scalars['String']['input'];
  alarmUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface AlarmData {
  accountUuid: Scalars['String']['output'];
  alarmName: Scalars['String']['output'];
  alarmStatus: Scalars['String']['output'];
  alarmUuid: Scalars['String']['output'];
  comparisonOperator: Scalars['String']['output'];
  context: Scalars['String']['output'];
  dataUuid: Scalars['String']['output'];
  emergencyLevel: Scalars['String']['output'];
  labels: Scalars['String']['output'];
  metricName: Scalars['String']['output'];
  metricValue: Scalars['String']['output'];
  namespace: Scalars['String']['output'];
  period: Scalars['String']['output'];
  readStatus: Scalars['String']['output'];
  resourceType: Scalars['String']['output'];
  resourceUuid: Scalars['String']['output'];
  threshold: Scalars['String']['output'];
  time: Scalars['String']['output'];
}

export interface AlarmHistories {
  accountUuid?: Maybe<Scalars['String']['output']>;
  ackData?: Maybe<AckDataInAlarmHistories>;
  alarmName?: Maybe<Scalars['String']['output']>;
  alarmStatus?: Maybe<Scalars['String']['output']>;
  alarmUuid?: Maybe<Scalars['String']['output']>;
  alarmZhName?: Maybe<Scalars['String']['output']>;
  canLink?: Maybe<Scalars['Boolean']['output']>;
  comparisonOperator?: Maybe<Scalars['String']['output']>;
  context?: Maybe<Scalars['String']['output']>;
  createTime?: Maybe<Scalars['String']['output']>;
  dataUuid: Scalars['String']['output'];
  emergencyLevel?: Maybe<EmergencyLevel>;
  error?: Maybe<Scalars['String']['output']>;
  firstTime?: Maybe<Scalars['String']['output']>;
  isGatewayVm?: Maybe<Scalars['Boolean']['output']>;
  labels?: Maybe<Scalars['String']['output']>;
  metricName?: Maybe<Scalars['String']['output']>;
  metricValue?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  namespace?: Maybe<Scalars['String']['output']>;
  operatorAccount?: Maybe<Owner>;
  operatorAccountUuid?: Maybe<Scalars['String']['output']>;
  period?: Maybe<Scalars['String']['output']>;
  readStatus?: Maybe<Scalars['Boolean']['output']>;
  resource?: Maybe<ResourceInAlarmHistories>;
  resourceName?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  resourceUuid?: Maybe<Scalars['String']['output']>;
  subscriptionUuid?: Maybe<Scalars['String']['output']>;
  threshold?: Maybe<Scalars['String']['output']>;
  times?: Maybe<Scalars['Int']['output']>;
  /** 报警器类型 alarm | event */
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface AlarmLabels {
  key?: Maybe<Scalars['String']['output']>;
  operator?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  value?: Maybe<Scalars['String']['output']>;
}

export interface AlarmLabelsInput {
  key: Scalars['String']['input'];
  op: Scalars['String']['input'];
  value: Scalars['String']['input'];
}

export interface AlarmResource {
  resourceName?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  /** 虚拟机等资源是否被删除到回收站 */
  state?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface AlarmResourceInfo {
  emergent: Scalars['Int']['output'];
  important: Scalars['Int']['output'];
  namespace: Scalars['String']['output'];
  resourceInfo?: Maybe<AlarmResource>;
  uuid: Scalars['String']['output'];
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

export interface AlarmSummary {
  emergent?: Maybe<Scalars['Int']['output']>;
  important?: Maybe<Scalars['Int']['output']>;
  normal?: Maybe<Scalars['Int']['output']>;
}

export interface AlertHistogram {
  count?: Maybe<Scalars['Int']['output']>;
  emergencyLevel?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<AlertHistogramTag>>;
  time?: Maybe<Scalars['Float']['output']>;
}

export interface AlertHistogramTag {
  name?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
}

export interface AliyunSmsSNSTextTemplate {
  alarmTemplateCode?: Maybe<Scalars['String']['output']>;
  applicationPlatformType?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  eventTemplate?: Maybe<Scalars['String']['output']>;
  eventTemplateCode?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  sign?: Maybe<Scalars['String']['output']>;
  template?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export enum AllocatorStrategyType {
  DefaultHostAllocatorStrategy = 'DefaultHostAllocatorStrategy',
  LastHostPreferredAllocatorStrategy = 'LastHostPreferredAllocatorStrategy',
  LeastVmPreferredHostAllocatorStrategy = 'LeastVmPreferredHostAllocatorStrategy',
  MaxInstancePerHostHostAllocatorStrategy = 'MaxInstancePerHostHostAllocatorStrategy',
  MinimumCPUUsageHostAllocatorStrategy = 'MinimumCPUUsageHostAllocatorStrategy',
  MinimumMemoryUsageHostAllocatorStrategy = 'MinimumMemoryUsageHostAllocatorStrategy'
}

export interface ApiInspector {
  /** ApiInspector消息 */
  payload?: Maybe<ApiInspectorDetail>;
  /** apiInspector 消息按照 sessionId 分发 */
  sessionId: Scalars['String']['output'];
}

export interface ApiInspectorDetail {
  /** apiId */
  apiId?: Maybe<Scalars['String']['output']>;
  /** body */
  body?: Maybe<Scalars['String']['output']>;
  /** method 类型 */
  method: ApiInspectorMethod;
  /** reqPath */
  reqPath?: Maybe<Scalars['String']['output']>;
  /** response */
  response?: Maybe<Scalars['String']['output']>;
  /** ts sdk name */
  sdkName?: Maybe<Scalars['String']['output']>;
  /** 时间戳 */
  timestamp: Scalars['Float']['output'];
  /** traceId */
  traceId?: Maybe<Scalars['String']['output']>;
  /** Request or Response or WaitingWebHook */
  type: ApiInspectorType;
  /** zql 语句 */
  zql?: Maybe<Scalars['String']['output']>;
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

export interface ApplyDRSAdviceListInput {
  action: ActionInput;
  payload: Array<ApplyDRSAdvicePayload>;
}

export interface ApplyDRSAdvicePayload {
  adviceUuid: Scalars['String']['input'];
}

export interface ApplyMonitorTemplateToMonitorGroupInMonitorTemplateInput {
  action: ActionInput;
  payload: Array<ApplyMonitorTemplateToMonitorGroupInMonitorTemplatePayload>;
}

export interface ApplyMonitorTemplateToMonitorGroupInMonitorTemplatePayload {
  groupUuid: Scalars['String']['input'];
  templateUuid: Scalars['String']['input'];
}

export interface AssignResourceAlarmData {
  Emergent: Scalars['Float']['output'];
  Important: Scalars['Float']['output'];
  Normal: Scalars['Float']['output'];
}

export interface AsyncQuery {
  inventories: Array<Scalars['String']['output']>;
  /** asyncQuery查询结果 queryId 分发 */
  queryId: Scalars['String']['output'];
  /** asyncQuery查询结果 按queryName 分发 */
  queryName: Scalars['String']['output'];
  /** asyncQuery查询结果 按sessionId 分发 */
  sessionId: Scalars['String']['output'];
}

export interface AsyncSecurityMachineTotal {
  unsyncedTotal: Scalars['Int']['output'];
}

export interface AtPersonInput {
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  remark?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
}

export interface AtPersonListItem {
  phoneNumber?: Maybe<Scalars['String']['output']>;
  remark?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface AttachBackupStorageToZoneInput {
  action: ActionInput;
  payload: Array<AttachBackupStorageToZonePayload>;
}

export interface AttachBackupStorageToZonePayload {
  backupStorageUuid: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}

export interface AttachBaremetalPxeServerInput {
  action: ActionInput;
  payload: Array<AttachBaremetalPxeServerPayload>;
}

export interface AttachBaremetalPxeServerPayload {
  clusterUuid: Scalars['String']['input'];
  pxeServerUuid: Scalars['String']['input'];
}

export interface AttachDataVolumeToTemplatedVmPayloadInEdit {
  index: Scalars['Int']['input'];
  isEnableVm?: InputMaybe<Scalars['Boolean']['input']>;
  isRootVolume?: InputMaybe<Scalars['Boolean']['input']>;
  vmInstanceUuid: Scalars['String']['input'];
  volumeUuid: Scalars['String']['input'];
}

export interface AttachDataVolumeToVmInput {
  action: ActionInput;
  payload: Array<AttachDataVolumeToVmPayload>;
}

export interface AttachDataVolumeToVmPayload {
  isEnableVm?: InputMaybe<Scalars['Boolean']['input']>;
  isRootVolume?: InputMaybe<Scalars['Boolean']['input']>;
  vmInstanceUuid: Scalars['String']['input'];
  volumeUuid: Scalars['String']['input'];
}

export interface AttachDataVolumeToVmPayloadInEdit {
  index: Scalars['Int']['input'];
  isEnableVm?: InputMaybe<Scalars['Boolean']['input']>;
  isRootVolume?: InputMaybe<Scalars['Boolean']['input']>;
  vmInstanceUuid: Scalars['String']['input'];
  volumeUuid: Scalars['String']['input'];
}

export interface AttachGuestToolsIsoToVmInput {
  action: ActionInput;
  payload: AttachGuestToolsIsoToVmPayload;
}

export interface AttachGuestToolsIsoToVmPayload {
  uuid: Scalars['String']['input'];
}

export interface AttachIscsiServerToClusterInput {
  action: ActionInput;
  payload: Array<AttachIscsiServerToClusterPayload>;
}

export interface AttachIscsiServerToClusterPayload {
  /** 	集群UUID */
  clusterUuid: Scalars['String']['input'];
  /** iSCSI服务器的的UUID */
  uuid: Scalars['String']['input'];
}

export interface AttachIsoToVmInstanceInput {
  action: ActionInput;
  payload: Array<AttachIsoToVmInstancePayload>;
}

export interface AttachIsoToVmInstancePayload {
  isoUuid: Scalars['String']['input'];
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  vmInstanceUuid: Scalars['String']['input'];
}

export interface AttachL2NetworkToClusterHostParams {
  clusterUuid: Scalars['String']['input'];
  hostParams: Scalars['String']['input'];
}

export interface AttachL2NetworkToHostInput {
  action: ActionInput;
  payload: AttachL2NetworkToHostPayload;
}

export interface AttachL2NetworkToHostPayload {
  bondingName: Scalars['String']['input'];
  bondingUuid?: InputMaybe<Scalars['String']['input']>;
  hostUuid: Scalars['String']['input'];
  l2NetworkUuid: Scalars['String']['input'];
  mode: Scalars['String']['input'];
  slaveUuids: Array<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  xmitHashPolicy?: InputMaybe<Scalars['String']['input']>;
}

export interface AttachL2NetworksToClusterWithBondInput {
  action: ActionInput;
  payload: AttachL2NetworksToClusterWithBondPayload;
}

export interface AttachL2NetworksToClusterWithBondPayload {
  attachL2NetworkToClusterHostParams?: InputMaybe<Array<AttachL2NetworkToClusterHostParams>>;
  clusterUuids: Array<Scalars['String']['input']>;
  createBondPayloads?: InputMaybe<Array<CreateBondPayload>>;
  hostUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  l2NetworkUuid: Scalars['String']['input'];
  updateVirtualSwitchUplinkBondingsActionPayload?: InputMaybe<UpdateVirtualSwitchUplinkBondingsActionPayload>;
}

export interface AttachL3NetworkToVmNicInEditVmPayload {
  /** 自定义网卡MAC地址 */
  customMac?: InputMaybe<Scalars['String']['input']>;
  driverType?: InputMaybe<Scalars['String']['input']>;
  enableSRIOV?: InputMaybe<Scalars['Boolean']['input']>;
  /** 下行带宽 */
  inboundBandwidth?: InputMaybe<Scalars['Float']['input']>;
  /** 三层网的uuid */
  l3NetworkUuid: Scalars['String']['input'];
  /** 网卡队列数 */
  multiQueueNum?: InputMaybe<Scalars['Int']['input']>;
  /** 上行带宽 */
  outboundBandwidth?: InputMaybe<Scalars['Float']['input']>;
  securityGroupUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  /** ip4 */
  staticIpv4?: InputMaybe<Scalars['String']['input']>;
  /** ip6 */
  staticIpv6?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  /** 当前网卡的uuid */
  vmInstanceUuid: Scalars['String']['input'];
  vmNicParams?: InputMaybe<Scalars['String']['input']>;
}

export interface AttachL3NetworkToVmNicInput {
  action: ActionInput;
  payload: Array<AttachL3NetworkToVmNicPayload>;
}

export interface AttachL3NetworkToVmNicPayload {
  chassisUuid?: InputMaybe<Scalars['String']['input']>;
  /** 自定义网卡MAC地址 */
  customMac?: InputMaybe<Scalars['String']['input']>;
  deviceType?: InputMaybe<NicType>;
  driverType?: InputMaybe<Scalars['String']['input']>;
  enableSRIOV?: InputMaybe<Scalars['Boolean']['input']>;
  isBaremetal2Instance?: InputMaybe<Scalars['Boolean']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  /** 三层网的uuid */
  l3NetworkUuid: Scalars['String']['input'];
  mode?: InputMaybe<Scalars['Int']['input']>;
  multiQueueNum?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  securityGroupUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  slaves?: InputMaybe<Scalars['String']['input']>;
  /** ip4 */
  staticIpv4?: InputMaybe<Scalars['String']['input']>;
  /** ip6 */
  staticIpv6?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  /** 当前网卡的uuid */
  vmInstanceUuid: Scalars['String']['input'];
  vmNicParams?: InputMaybe<Scalars['String']['input']>;
}

export interface AttachMdevDeviceToVMInput {
  action: ActionInput;
  payload: AttachMdevDeviceToVMPayload;
}

export interface AttachMdevDeviceToVMPayload {
  mdevDeviceUuid: Scalars['String']['input'];
  vmInstanceUuid: Scalars['String']['input'];
}

export interface AttachNvmeServerToClusterInput {
  action: ActionInput;
  payload: Array<AttachNvmeServerToClusterPayload>;
}

export interface AttachNvmeServerToClusterPayload {
  /** 	集群UUID */
  clusterUuid: Scalars['String']['input'];
  /** Nvme服务器的的UUID */
  uuid: Scalars['String']['input'];
}

export interface AttachOrDetachL2NetworkFromClusterInput {
  clusterUuid: Scalars['String']['input'];
  l2NetworkUuid: Scalars['String']['input'];
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface AttachOrDetachL2NetworksFromClusterActionInput {
  action: ActionInput;
  payload: Array<AttachOrDetachL2NetworkFromClusterInput>;
}

export interface AttachPciDeviceToVMInput {
  action: ActionInput;
  payload: Array<AttachPciDeviceToVMPayload>;
}

export interface AttachPciDeviceToVMPayload {
  pciDeviceUuid: Scalars['String']['input'];
  vmInstanceUuid: Scalars['String']['input'];
}

export interface AttachPrimaryStorageToClusterInput {
  action: ActionInput;
  payload: Array<AttachPrimaryStorageToClusterPayload>;
}

export interface AttachPrimaryStorageToClusterPayload {
  clusterUuid: Scalars['String']['input'];
  /** ; 因为sharedBlock绑定Cluster，需要Cluster绑定所有sharedBlock已绑定的iscsi服务。所以此iscsiServerUuids为：sharedBlock所有已绑定的iscsi，但Cluster还未绑定的iscsi */
  iscsiServerUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  /** 主存储是expon时，需要传递协议 iSCSI 给后端 */
  outputProtocol?: InputMaybe<Scalars['String']['input']>;
  primaryStorageUuid: Scalars['String']['input'];
}

export interface AttachScsiLunToVmInstanceInput {
  action: ActionInput;
  payload: Array<AttachScsiLunToVmInstancePayload>;
}

export interface AttachScsiLunToVmInstancePayload {
  /** 关闭自动加载多路径设备 */
  disableMultiPathAttach?: InputMaybe<Scalars['Boolean']['input']>;
  /** SCSI LUN的UUID，唯一标示该资源 */
  uuid: Scalars['String']['input'];
  /** 云主机UUID */
  vmInstanceUuid: Scalars['String']['input'];
}

export interface AttachScsiLunToVmInstancePayloadInEdit {
  /** 关闭自动加载多路径设备 */
  disableMultiPathAttach?: InputMaybe<Scalars['Boolean']['input']>;
  index: Scalars['Int']['input'];
  /** SCSI LUN的UUID，唯一标示该资源 */
  uuid: Scalars['String']['input'];
  /** 云主机UUID */
  vmInstanceUuid: Scalars['String']['input'];
}

export interface AttachScsiLunToVmInstancePayloadInEditInTemplatedVM {
  /** 关闭自动加载多路径设备 */
  disableMultiPathAttach?: InputMaybe<Scalars['Boolean']['input']>;
  index: Scalars['Int']['input'];
  /** SCSI LUN的UUID，唯一标示该资源 */
  uuid: Scalars['String']['input'];
  /** 云主机UUID */
  vmInstanceUuid: Scalars['String']['input'];
}

export interface AttachTagInput {
  action: ActionInput;
  payload: Array<AttachTagPayload>;
}

export interface AttachTagPayload {
  resourceUuids: Array<Scalars['String']['input']>;
  tagUuid: Scalars['String']['input'];
}

export interface AttachUsbDeviceToVmInput {
  action: ActionInput;
  payload: Array<AttachUsbDeviceToVmPayload>;
}

export interface AttachUsbDeviceToVmPayload {
  attachType?: InputMaybe<Scalars['String']['input']>;
  usbDeviceUuid: Scalars['String']['input'];
  vmInstanceUuid: Scalars['String']['input'];
}

export interface AttachVGpuToVmInstanceInput {
  action: ActionInput;
  payload: Array<AttachVGpuToVmInstancePayload>;
}

export interface AttachVGpuToVmInstancePayload {
  type: VGpuType;
  vGpuDeviceUuid: Scalars['String']['input'];
  vmInstanceUuid: Scalars['String']['input'];
}

export interface AttachVmToVmGroupInput {
  action: ActionInput;
  payload: Array<AttachVmToVmGroupPayload>;
}

export interface AttachVmToVmGroupPayload {
  vmGroupUuid: Scalars['String']['input'];
  vmUuid: Scalars['String']['input'];
}

export interface AttachXmlHookToVmInput {
  action: ActionInput;
  payload: Array<AttachXmlHookToVmPayload>;
}

export interface AttachXmlHookToVmPayload {
  startupStrategy?: InputMaybe<Scalars['String']['input']>;
  vmInstanceUuid: Scalars['String']['input'];
  xmlHookUuid: Scalars['String']['input'];
}

export interface AttachedHostRef {
  hostUuid: Scalars['String']['output'];
}

export interface AttachedRouterRef {
  routeTableUuid: Scalars['String']['output'];
  virtualRouterVmUuid: Scalars['String']['output'];
}

export interface AttachedVniRanges {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  endVni?: Maybe<Scalars['Float']['output']>;
  l2NetworkUuid?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  startVni?: Maybe<Scalars['Float']['output']>;
  uuid: Scalars['String']['output'];
}

export interface AttachedVtepRefs {
  createDate?: Maybe<Scalars['String']['output']>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  poolUuid?: Maybe<Scalars['String']['output']>;
  port?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vtepIp?: Maybe<Scalars['String']['output']>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface AttachedVtepRefsType {
  createDate?: Maybe<Scalars['String']['output']>;
  host: Host;
  hostUuid?: Maybe<Scalars['String']['output']>;
  poolUuid?: Maybe<Scalars['String']['output']>;
  port?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  vtepIp?: Maybe<Scalars['String']['output']>;
}

export interface AttachedVxlanNetworkRefs {
  attachedClusterUuids?: Maybe<Array<Scalars['String']['output']>>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  physicalInterface?: Maybe<Scalars['String']['output']>;
  poolUuid?: Maybe<Array<Scalars['String']['output']>>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vni?: Maybe<Scalars['Float']['output']>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface AttachedVxlanNetworkRefsType {
  createDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  vni?: Maybe<Scalars['String']['output']>;
}

export interface Attribute {
  type: Scalars['String']['output'];
  value: Scalars['String']['output'];
}

export interface Audit {
  alarmZhName?: Maybe<Scalars['String']['output']>;
  apiName?: Maybe<Scalars['String']['output']>;
  clientBrowser?: Maybe<Scalars['String']['output']>;
  clientIp?: Maybe<Scalars['String']['output']>;
  createTime?: Maybe<Scalars['Float']['output']>;
  currentResourceName?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Float']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  isError?: Maybe<Scalars['Boolean']['output']>;
  /** 数据保护是否通过 */
  isValid?: Maybe<Scalars['Boolean']['output']>;
  operator?: Maybe<Scalars['String']['output']>;
  operatorAccountName?: Maybe<Scalars['String']['output']>;
  operatorAccountUuid?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  requestDump?: Maybe<Scalars['String']['output']>;
  requestUuid?: Maybe<Scalars['String']['output']>;
  resourceName?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  /** 资源 UUID */
  resourceUuid?: Maybe<Scalars['String']['output']>;
  responseDump?: Maybe<Scalars['String']['output']>;
  responseUuid?: Maybe<Scalars['String']['output']>;
  time?: Maybe<Scalars['Float']['output']>;
}

export interface AuditResp {
  /** 查询结果列表 */
  list?: Maybe<Array<Audit>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface BackupData {
  /** 真实容量 */
  actualSize?: Maybe<Scalars['Float']['output']>;
  /** 挂载云主机名字 */
  attachedVmName?: Maybe<Scalars['String']['output']>;
  /** 当前备份数据的容量大小，其值等于后端返回的 size，而非 metadata 里的 size */
  backupDataSize?: Maybe<Scalars['Float']['output']>;
  /** 备份服务器关联 */
  backupStorageRefs?: Maybe<Array<BackupStorageRef>>;
  backupType?: Maybe<BackupResourceFullBackupType>;
  /** 能否同步到远端备份服务器，根据本地备份数据信息查询（如果没有本地备份数据，那也没法同步到远端） */
  canSyncToRemote?: Maybe<Scalars['Boolean']['output']>;
  cluster?: Maybe<Cluster>;
  cpuNum?: Maybe<Scalars['Int']['output']>;
  /** 创建时间 */
  createDate?: Maybe<Scalars['String']['output']>;
  dataVolumeAllExisted?: Maybe<Scalars['Boolean']['output']>;
  dataVolumeBackup?: Maybe<Array<BackupData>>;
  dataVolumeList?: Maybe<Array<Volume>>;
  dataVolumeUuids?: Maybe<Array<Scalars['String']['output']>>;
  defaultL3NetworkUuid?: Maybe<Scalars['String']['output']>;
  format?: Maybe<Scalars['String']['output']>;
  groupUuid?: Maybe<Scalars['String']['output']>;
  /** 包含数据云盘 */
  hasDataVolume?: Maybe<Scalars['Boolean']['output']>;
  instanceOffering?: Maybe<InstanceOffering>;
  /** 云主机是否包含数据云盘 */
  isIncludeDataVolume?: Maybe<BackupResourceVmBackupType>;
  isLocalLatest?: Maybe<Scalars['Boolean']['output']>;
  /** 是否同步到本地 */
  isLocalSynced: BackupDataIsLocalSynced;
  isRemoteLatest?: Maybe<Scalars['Boolean']['output']>;
  /** 是否同步到远端 */
  isRemoteSynced: BackupDataIsRemoteSynced;
  isShareable?: Maybe<Scalars['Boolean']['output']>;
  isVirtioSCSI?: Maybe<Scalars['Boolean']['output']>;
  l3NetworkList?: Maybe<Array<L3Network>>;
  /** 最后一次修改时间 */
  lastOpDate?: Maybe<Scalars['String']['output']>;
  /** 本地备份服务器 */
  localBackupStorage?: Maybe<BackupStorage>;
  lostData?: Maybe<Scalars['Boolean']['output']>;
  memorySize?: Maybe<Scalars['Float']['output']>;
  metadata?: Maybe<Scalars['String']['output']>;
  metadataDescription?: Maybe<Scalars['String']['output']>;
  metadataName?: Maybe<Scalars['String']['output']>;
  /** 备份类型 */
  mode?: Maybe<Scalars['String']['output']>;
  /** 资源名称 */
  name: Scalars['String']['output'];
  owner?: Maybe<AccountOwner>;
  platform?: Maybe<Scalars['String']['output']>;
  primaryStorage?: Maybe<PrimaryStorage>;
  /** 远端备份服务器 */
  remoteBackupStorage?: Maybe<BackupStorage>;
  rootAndData?: Maybe<Scalars['Boolean']['output']>;
  /** 包含备份数据的云主机或者云盘大小 */
  size?: Maybe<Scalars['Float']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  /** 备份数据类型: Root | Data */
  type?: Maybe<Scalars['String']['output']>;
  /** 资源的UUID，唯一标示该资源 */
  uuid: Scalars['String']['output'];
  vmDescription?: Maybe<Scalars['String']['output']>;
  vmInstance?: Maybe<VmInstance>;
  /** 云主机备份应该用此UUID */
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
  vmSystemTags?: Maybe<Array<Scalars['String']['output']>>;
  volume?: Maybe<Volume>;
  volumeBackupVmInstance?: Maybe<VmInstance>;
  /** 磁盘带宽 */
  volumeBandWidth?: Maybe<Scalars['String']['output']>;
  volumeUuid?: Maybe<Scalars['String']['output']>;
  wwn?: Maybe<Scalars['String']['output']>;
}

export interface BackupDataFormImageStorage {
  createdTime: Scalars['String']['output'];
  installPath?: Maybe<Scalars['String']['output']>;
  md5?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
}

export interface BackupDataFormImageStorageResp {
  /** 查询结果列表 */
  list?: Maybe<Array<BackupDataFormImageStorage>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum BackupDataIsLocalSynced {
  No = 'No',
  Yes = 'Yes'
}

export enum BackupDataIsRemoteSynced {
  No = 'No',
  Yes = 'Yes'
}

export interface BackupDataResponse {
  /** 查询结果列表 */
  list?: Maybe<Array<BackupData>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface BackupDatabase {
  /** 备份服务器关联 */
  backupStorageRefs?: Maybe<Array<BackupStorageRef>>;
  /** 能否同步到远端备份服务器，根据本地备份数据信息查询（如果没有本地备份数据，那也没法同步到远端） */
  canSyncToRemote?: Maybe<Scalars['Boolean']['output']>;
  /** 创建时间 */
  createDate?: Maybe<Scalars['String']['output']>;
  /** 是否在本地 */
  isLocalSynced: BackupDataIsLocalSynced;
  /** 是否在远端 */
  isRemoteSynced: BackupDataIsRemoteSynced;
  /** 本地备份服务器 */
  localBackupStorage?: Maybe<BackupStorage>;
  md5?: Maybe<Scalars['String']['output']>;
  /** 资源名称 */
  name: Scalars['String']['output'];
  /** 远端备份服务器 */
  remoteBackupStorage?: Maybe<BackupStorage>;
  /** 备份容量 */
  size?: Maybe<Scalars['Float']['output']>;
  uuid: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
}

export interface BackupDatabaseResponse {
  /** 查询结果列表 */
  list?: Maybe<Array<BackupDatabase>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum BackupMode {
  auto = 'auto',
  full = 'full',
  incremental = 'incremental'
}

export interface BackupNkpInput {
  action: ActionInput;
  payload: BackupNkpPayload;
}

export interface BackupNkpPayload {
  password?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface BackupResourceData {
  /** 备份数量, 以size查询的时候该字段为0。 */
  count?: Maybe<Scalars['Float']['output']>;
  /** 资源名称, 备份类型为Root的时候取云主机名称，备份类型为Data的时候直接取name */
  name?: Maybe<Scalars['String']['output']>;
  /** 根云盘备份文件总大小，以count查询的时候该字段为0。 */
  size?: Maybe<Scalars['Float']['output']>;
  /** 以资源为视角的时候，该UUID可能不止一个，所以这里用资源UUid(volumeUuid或者vmInstanceUuid) —— 等待有缘人 */
  uuid: Scalars['String']['output'];
  vmInstance?: Maybe<VmInstance>;
  /** 云主机备份应该用此UUID */
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
  /** 对应上面的UUID/volumeUuid，上面UUIDvolumeUuid定义不合理，真实情况应该是一个数组。 */
  volumeBackupUuids?: Maybe<Array<Scalars['String']['output']>>;
  /** CdpTask 会导致一个VM可能有多个Root Volume, 当以vm为视角的时候只展示第一个volumeUuid */
  volumeUuid?: Maybe<Scalars['String']['output']>;
}

export interface BackupResourceDataResponse {
  /** 查询结果列表 */
  list?: Maybe<Array<BackupResourceData>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
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

export interface BackupStorage {
  attachedZoneUuids?: Maybe<Array<Scalars['String']['output']>>;
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  createDate: Scalars['String']['output'];
  dataNetwork?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fsid?: Maybe<Scalars['String']['output']>;
  hostname?: Maybe<Scalars['String']['output']>;
  lastOpDate: Scalars['String']['output'];
  mons?: Maybe<Array<CephBackupStorageMon>>;
  name: Scalars['String']['output'];
  ossBucketUuid?: Maybe<Scalars['String']['output']>;
  poolAvailableCapacity?: Maybe<Scalars['Float']['output']>;
  poolName?: Maybe<Scalars['String']['output']>;
  poolReplicatedSize?: Maybe<Scalars['Float']['output']>;
  poolUsedCapacity?: Maybe<Scalars['Float']['output']>;
  /** 镜像服务器保留容量。category=backupStorage name=reservedCapacity。默认值是"1G" */
  reservedCapacity?: Maybe<Scalars['Float']['output']>;
  sshPort?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<BackupStorageState>;
  status: Scalars['String']['output'];
  syncImageNetwork?: Maybe<Scalars['String']['output']>;
  systemTag: Array<Scalars['String']['output']>;
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<BackupStorageType>;
  url: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  zone?: Maybe<Zone>;
}

export interface BackupStorageList {
  error?: Maybe<ActionError>;
  list: Array<BackupStorage>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface BackupStorageMetricData {
  label?: Maybe<Scalars['String']['output']>;
  labels: Labels;
  metricName: Scalars['String']['output'];
  time: Scalars['Float']['output'];
  type: Scalars['String']['output'];
  value: Scalars['Float']['output'];
}

export interface BackupStorageMigrateImageInput {
  action: ActionInput;
  payload: BackupStorageMigrateImagePayload;
}

export interface BackupStorageMigrateImagePayload {
  dstBackupStorageUuid: Scalars['String']['input'];
  imageUuid: Scalars['String']['input'];
  srcBackupStorageUuid: Scalars['String']['input'];
}

export interface BackupStoragePerformance {
  AvailableCapacityInBytes?: Maybe<Scalars['String']['output']>;
  UsedCapacityInPercent?: Maybe<Scalars['String']['output']>;
  attachedZoneUuids?: Maybe<Array<Scalars['String']['output']>>;
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  createDate: Scalars['String']['output'];
  dataNetwork?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fsid?: Maybe<Scalars['String']['output']>;
  hostname?: Maybe<Scalars['String']['output']>;
  lastOpDate: Scalars['String']['output'];
  mons?: Maybe<Array<CephBackupStorageMon>>;
  name: Scalars['String']['output'];
  ossBucketUuid?: Maybe<Scalars['String']['output']>;
  poolAvailableCapacity?: Maybe<Scalars['Float']['output']>;
  poolName?: Maybe<Scalars['String']['output']>;
  poolReplicatedSize?: Maybe<Scalars['Float']['output']>;
  poolUsedCapacity?: Maybe<Scalars['Float']['output']>;
  /** 镜像服务器保留容量。category=backupStorage name=reservedCapacity。默认值是"1G" */
  reservedCapacity?: Maybe<Scalars['Float']['output']>;
  sshPort?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<BackupStorageState>;
  status: Scalars['String']['output'];
  syncImageNetwork?: Maybe<Scalars['String']['output']>;
  systemTag: Array<Scalars['String']['output']>;
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<BackupStorageType>;
  url: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  zone?: Maybe<Zone>;
}

export enum BackupStoragePerformanceMetricType {
  AvailableCapacityInBytes = 'AvailableCapacityInBytes',
  UsedCapacityInPercent = 'UsedCapacityInPercent'
}

export interface BackupStoragePerformanceQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<BackupStoragePerformance>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum BackupStorageQueryType {
  CreateImageCandidate = 'CreateImageCandidate',
  MigrateImageCandidate = 'MigrateImageCandidate',
  Normal = 'Normal',
  NotAttachedZoneBackupStorageList = 'NotAttachedZoneBackupStorageList'
}

export interface BackupStorageRef {
  backupStorageUuid: Scalars['String']['output'];
  createDate: Scalars['String']['output'];
  exportMd5Sum?: Maybe<Scalars['String']['output']>;
  exportUrl?: Maybe<Scalars['String']['output']>;
  imageUuid: Scalars['String']['output'];
  installPath?: Maybe<Scalars['String']['output']>;
  lastOpDate: Scalars['String']['output'];
  status: Scalars['String']['output'];
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

export interface BackupStorageSummary {
  connected?: Maybe<Scalars['Int']['output']>;
  connecting?: Maybe<Scalars['Int']['output']>;
  disconnected?: Maybe<Scalars['Int']['output']>;
  other?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
}

/** 通过API GetBackupStorageTypes 获取 */
export enum BackupStorageType {
  AliyunEBS = 'AliyunEBS',
  Ceph = 'Ceph',
  ImageStoreBackupStorage = 'ImageStoreBackupStorage',
  SftpBackupStorage = 'SftpBackupStorage',
  VCenter = 'VCenter'
}

export interface BackupTaskStatus {
  backupTaskStatusData?: Maybe<Array<BackupTaskStatusData>>;
  isTaskRunning: Scalars['Boolean']['output'];
  progress: Scalars['Float']['output'];
}

export interface BackupTaskStatusData {
  longJobUuids?: Maybe<Array<Scalars['String']['output']>>;
  targetResourceUuid: Scalars['String']['output'];
}

export interface Baremetal2ClusterRelatedSummary {
  baremetalNode: Scalars['Int']['output'];
  gateway: Scalars['Int']['output'];
  iscsiServer: Scalars['Int']['output'];
  l2Network: Scalars['Int']['output'];
  primaryStorage: Scalars['Int']['output'];
}

export interface BaremetalChassis {
  /** 裸金属实例 */
  baremetalInstance?: Maybe<BaremetalInstanceForBaremetalChassis>;
  cluster: Cluster;
  clusterUuid?: Maybe<Scalars['String']['output']>;
  createDate: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  hardwareInfos: Array<BaremetalChassisHardwareInfo>;
  ipmiAddress: Scalars['String']['output'];
  ipmiPassword?: Maybe<Scalars['String']['output']>;
  ipmiPort?: Maybe<Scalars['Int']['output']>;
  ipmiUsername: Scalars['String']['output'];
  lastOpDate: Scalars['String']['output'];
  name: Scalars['String']['output'];
  powerStatus: BaremetalChassisPowerStatusType;
  pxeServerUuid?: Maybe<Scalars['String']['output']>;
  state?: Maybe<BaremetalChassisState>;
  status?: Maybe<BaremetalChassisStatus>;
  uuid: Scalars['String']['output'];
  zone: Zone;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface BaremetalChassisDiskInfo {
  name: Scalars['String']['output'];
  size: Scalars['String']['output'];
}

export interface BaremetalChassisDiskInfoQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<BaremetalChassisDiskInfo>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface BaremetalChassisHardwareInfo {
  chassisUuid: Scalars['String']['output'];
  content: Scalars['String']['output'];
  createDate: Scalars['String']['output'];
  lastOpDate: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface BaremetalChassisNicInfo {
  devname: Scalars['String']['output'];
  ip: Scalars['String']['output'];
  mac: Scalars['String']['output'];
  pxe: Scalars['String']['output'];
  speed: Scalars['String']['output'];
}

export interface BaremetalChassisNicInfoQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<BaremetalChassisNicInfo>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum BaremetalChassisPowerStatusType {
  PowerOff = 'PowerOff',
  PowerOn = 'PowerOn',
  Reboot = 'Reboot',
  Rebooting = 'Rebooting',
  Unknown = 'Unknown'
}

export interface BaremetalChassisQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<BaremetalChassis>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
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

export interface BaremetalDisk {
  name?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface BaremetalDiskList {
  /** 查询结果列表 */
  list?: Maybe<Array<BaremetalDisk>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface BaremetalInstance {
  baremetalChassis?: Maybe<BaremetalChassis>;
  baremetalPxeServer?: Maybe<BaremetalPxeServer>;
  bmNics?: Maybe<Array<BaremetalNic>>;
  chassisUuid?: Maybe<Scalars['String']['output']>;
  cluster?: Maybe<Cluster>;
  clusterUuid?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  hardwareInfo?: Maybe<HardwareInfo>;
  image?: Maybe<Image>;
  imageUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  managementIp?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<CommonOwner>;
  platform?: Maybe<ImagePlatform>;
  port?: Maybe<Scalars['Int']['output']>;
  pxeServerUuid?: Maybe<Scalars['String']['output']>;
  resourceAttributeValues?: Maybe<Array<ResourceAttributeValue>>;
  state?: Maybe<BaremetalInstanceState>;
  status?: Maybe<BaremetalInstanceStatus>;
  tag: Array<Tag>;
  templateUuid?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  zone?: Maybe<Zone>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface BaremetalInstanceConfigSummary {
  disk?: Maybe<Scalars['Int']['output']>;
  nic?: Maybe<Scalars['Int']['output']>;
}

export interface BaremetalInstanceForBaremetalChassis {
  name: Scalars['String']['output'];
  state?: Maybe<BaremetalChassisState>;
  uuid: Scalars['String']['output'];
}

export interface BaremetalInstanceList {
  /** 查询结果列表 */
  list?: Maybe<Array<BaremetalInstance>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
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

export interface BaremetalNic {
  baremetalInstanceUuid?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  gateway?: Maybe<Scalars['String']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  l3Network?: Maybe<L3Network>;
  l3NetworkUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  mac?: Maybe<Scalars['String']['output']>;
  netmask?: Maybe<Scalars['String']['output']>;
  pxe?: Maybe<Scalars['Boolean']['output']>;
  uuid: Scalars['String']['output'];
}

export interface BaremetalNicList {
  /** 查询结果列表 */
  list?: Maybe<Array<BaremetalNic>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface BaremetalPxeServer {
  attachedClusterUuids?: Maybe<Array<Scalars['String']['output']>>;
  availableCapacity?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dhcpInterface?: Maybe<Scalars['String']['output']>;
  dhcpRangeBegin?: Maybe<Scalars['String']['output']>;
  dhcpRangeEnd?: Maybe<Scalars['String']['output']>;
  hostname?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  sshPort?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  status?: Maybe<BaremetalPxeServerStatus>;
  storagePath?: Maybe<Scalars['String']['output']>;
  totalCapacity?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface BaremetalPxeServerQueryResp {
  list?: Maybe<Array<BaremetalPxeServer>>;
  total?: Maybe<Scalars['Int']['output']>;
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

export interface BasicEndPoint {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<Owner>;
  platformUuid?: Maybe<Scalars['String']['output']>;
  state?: Maybe<EndPointState>;
  topic?: Maybe<SNSTopic>;
  type?: Maybe<EndPointType>;
  uuid: Scalars['String']['output'];
}

export interface BasicOwner {
  createDate: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
  vmNum?: Maybe<Scalars['Int']['output']>;
  volumeNum?: Maybe<Scalars['Int']['output']>;
}

export interface BatchCreateBaremetalChassisInput {
  action: ActionInput;
  payload: BatchCreateBaremetalChassisPayload;
}

export interface BatchCreateBaremetalChassisPayload {
  baremetalChassisInfo: Scalars['String']['input'];
}

export interface BatchCreateHostKernelInterfaceInput {
  action: ActionInput;
  payload: BatchCreateHostKernelInterfacePayload;
}

export interface BatchCreateHostKernelInterfacePayload {
  l3NetworkUuid: Scalars['String']['input'];
  structs?: Array<BatchCreateHostKernelInterfaceStruct>;
  trafficTypes?: Array<KernelTrafficTypes>;
}

export interface BatchCreateHostKernelInterfaceStruct {
  description?: InputMaybe<Scalars['String']['input']>;
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  ip?: InputMaybe<Scalars['String']['input']>;
  ip6?: InputMaybe<Scalars['String']['input']>;
  ip6Prefix?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  netmask?: InputMaybe<Scalars['String']['input']>;
}

export interface BatchCreateVolumeSnapshotInput {
  action: ActionInput;
  payload: Array<BatchCreateVolumeSnapshotPayload>;
}

export interface BatchCreateVolumeSnapshotPayload {
  /** 描述 */
  description?: InputMaybe<Scalars['String']['input']>;
  /** 快照名 */
  name: Scalars['String']['input'];
  type: SnapshotType;
  /** uuid */
  volumeUuid?: InputMaybe<Scalars['String']['input']>;
  withMemory?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface BatchStorageMigrateVmInstancedepends {
  hasPeripheralAttached: Scalars['Boolean']['output'];
  hasUnavailableUsbDevice: Scalars['Boolean']['output'];
  isAttachedScsiLunDevice: Scalars['Boolean']['output'];
  uuid: Scalars['String']['output'];
}

export interface BatchUpdateResourceConfigInput {
  action: ActionInput;
  payload: Array<BatchUpdateResourceConfigPayload>;
}

export interface BatchUpdateResourceConfigPayload {
  category: Scalars['String']['input'];
  name: Scalars['String']['input'];
  resourceUuid: Scalars['String']['input'];
  value: Scalars['String']['input'];
}

export interface BatchZQLGetMetricDataListArgs {
  args: ZQLGetMetricDataListArgs;
  name: Scalars['String']['input'];
}

export interface BatchZQLGetMetricDataListRes {
  list: Array<MetricData>;
  name: Scalars['String']['output'];
}

export interface BindRolesInput {
  action: ActionInput;
  payload: BindRolesPayload;
}

export interface BindRolesPayload {
  resourceType?: InputMaybe<Scalars['String']['input']>;
  resourceUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  roleUuids: Array<Scalars['String']['input']>;
}

export interface BlockDetailInfoResp {
  ip: Scalars['String']['output'];
  port: Scalars['Int']['output'];
  storagePool: Scalars['String']['output'];
}

export interface BlockMetadataResp {
  accessZones: Scalars['String']['output'];
  storagePools: Scalars['String']['output'];
}

export interface BlockSnapshot {
  actualSize: Scalars['Float']['output'];
  blockVolumeUuid: Scalars['String']['output'];
  createDate?: Maybe<Scalars['String']['output']>;
  current?: Maybe<Scalars['Boolean']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  latest?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  size: Scalars['Float']['output'];
  state?: Maybe<BlockSnapshotState>;
  status?: Maybe<BlockSnapshotStatus>;
  treeUuid: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface BlockSnapshotList {
  error?: Maybe<ActionError>;
  list: Array<BlockSnapshot>;
  total: Scalars['Int']['output'];
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

export interface BlockVolume {
  accessPathUuid: Scalars['String']['output'];
  actualSize?: Maybe<Scalars['BigInt']['output']>;
  bareMetal2Uuid: Scalars['String']['output'];
  blockSnapshotNum: Scalars['Int']['output'];
  burstTotalBw?: Maybe<Scalars['Float']['output']>;
  burstTotalIops?: Maybe<Scalars['Float']['output']>;
  cephPrimaryStoragePoolUuid: Scalars['String']['output'];
  createDate: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  instance: Array<VmInstance>;
  iscsiPath?: Maybe<Scalars['String']['output']>;
  lastOpDate: Scalars['String']['output'];
  /** 云盘从云主机上卸载之后上次所在云主机 */
  lastVmInstance?: Maybe<VmInstance>;
  lastVmInstanceUuid: Scalars['String']['output'];
  maxTotalBw?: Maybe<Scalars['Float']['output']>;
  maxTotalIops?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  primaryStorage?: Maybe<PrimaryStorage>;
  primaryStorageUuid: Scalars['String']['output'];
  size?: Maybe<Scalars['BigInt']['output']>;
  status?: Maybe<VolumeStatus>;
  uuid: Scalars['String']['output'];
  xskyStatus: BlockVolumeStatus;
}

export interface BlockVolumeQueryResp {
  list?: Maybe<Array<BlockVolume>>;
  total?: Maybe<Scalars['Int']['output']>;
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

export interface Bond {
  allSlavesActive?: Maybe<Scalars['Boolean']['output']>;
  availableVlanIds: Scalars['Boolean']['output'];
  bondingName?: Maybe<Scalars['String']['output']>;
  bondingType?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  gateway?: Maybe<Scalars['String']['output']>;
  host?: Maybe<HostNameAndUuid>;
  hostNetworkBondingServiceRef?: Maybe<Array<HostNetworkBondingServiceRef>>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  ipAddresses?: Maybe<Array<Scalars['String']['output']>>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  mac?: Maybe<Scalars['String']['output']>;
  miiStatus?: Maybe<Scalars['String']['output']>;
  miimon?: Maybe<Scalars['String']['output']>;
  mode?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  slaves?: Maybe<Array<PhysicalNic>>;
  speed?: Maybe<Scalars['Float']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  vSwitch?: Maybe<L2NetworkNameAndUuidForBond>;
  xmitHashPolicy?: Maybe<Scalars['String']['output']>;
}

export interface BondForHost {
  allSlavesActive?: Maybe<Scalars['Boolean']['output']>;
  bondingName?: Maybe<Scalars['String']['output']>;
  bondingType?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  gateway?: Maybe<Scalars['String']['output']>;
  host?: Maybe<HostNameAndUuidForBond>;
  hostNetworkBondingServiceRef?: Maybe<Array<HostNetworkBondingServiceRef>>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  ipAddresses?: Maybe<Array<Scalars['String']['output']>>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  mac?: Maybe<Scalars['String']['output']>;
  miiStatus?: Maybe<Scalars['String']['output']>;
  miimon?: Maybe<Scalars['String']['output']>;
  mode?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  slaves?: Maybe<Array<PhysicalNic>>;
  speed?: Maybe<Scalars['Float']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  xmitHashPolicy?: Maybe<Scalars['String']['output']>;
}

export interface BondReleatedResource {
  host?: Maybe<Scalars['Int']['output']>;
  vm?: Maybe<Scalars['Int']['output']>;
}

export interface BondResouceCountResp {
  bond?: Maybe<Scalars['Int']['output']>;
  nic?: Maybe<Scalars['Int']['output']>;
}

export interface BondResp {
  list: Array<Bond>;
  total: Scalars['Int']['output'];
}

export interface BootOrderResp {
  orders: Array<VmBootDevice>;
}

export interface BootstrapDeployedInfo {
  isBootstrap: Scalars['Boolean']['output'];
}

export interface BootstrapInfo {
  active?: Maybe<Scalars['Boolean']['output']>;
  nodes?: Maybe<Array<DeployedNode>>;
}

export interface CBDPrimaryStoragePool {
  /** 可用量 */
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  /** 总容量 */
  capacity?: Maybe<Scalars['Float']['output']>;
  cbdPrimaryStoragePoolCapacity: CBDPrimaryStoragePoolCapacity;
  /** 存储池的创建时间，单位 s */
  createTime?: Maybe<Scalars['Float']['output']>;
  /** 逻辑上的 name */
  logicalPoolName?: Maybe<Scalars['String']['output']>;
  primaryStorageCapacity?: Maybe<PrimaryStorageCapacity>;
  primaryStorageUuid?: Maybe<Scalars['String']['output']>;
  /** 副本数量 */
  replicaNum?: Maybe<Scalars['Float']['output']>;
  /** 使用量 */
  usedSize?: Maybe<Scalars['Float']['output']>;
  /** 在 server 端基于 name 构造出来的，为了保持 ui 端 table/gql cache 中使用 uuid 作为 rowkey */
  uuid: Scalars['String']['output'];
}

export interface CBDPrimaryStoragePoolCapacity {
  /** 镜像缓存 */
  imageCacheSize?: Maybe<Scalars['Float']['output']>;
  /** 保留容量(这个保留容量只用于ceph的pool池) */
  reservedCapacity?: Maybe<Scalars['Float']['output']>;
  /** 模版缓存 */
  vmTemplateVolumeCacheSize?: Maybe<Scalars['Float']['output']>;
  /** 虚拟机硬盘真实容量 */
  volumeActualSize?: Maybe<Scalars['Float']['output']>;
  /** 虚拟机硬盘 */
  volumeSize?: Maybe<Scalars['Float']['output']>;
  /** 快照容量 */
  volumeSnapshotSize?: Maybe<Scalars['Float']['output']>;
}

export interface CBDPrimaryStoragePoolList {
  error?: Maybe<ActionError>;
  list?: Maybe<Array<CBDPrimaryStoragePool>>;
  total: Scalars['Int']['output'];
}

export enum CBDPrimaryStoragePoolQueryType {
  Normal = 'Normal',
  PsAttachablePool = 'PsAttachablePool'
}

export interface CCSCertificate {
  algorithm?: Maybe<Scalars['String']['output']>;
  effectiveTime?: Maybe<Scalars['String']['output']>;
  expirationTime?: Maybe<Scalars['String']['output']>;
  format?: Maybe<Scalars['String']['output']>;
  issuerDN?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  serNumber?: Maybe<Scalars['String']['output']>;
  subjectDN?: Maybe<Scalars['String']['output']>;
  userCertificateRefs?: Maybe<Array<UserCCSCertificateRefs>>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface CPU {
  GHz?: Maybe<Scalars['String']['output']>;
  architecture?: Maybe<Scalars['String']['output']>;
  currentTemperature?: Maybe<Scalars['String']['output']>;
  hostUuid: Scalars['String']['output'];
  id?: Maybe<Scalars['String']['output']>;
  level1Cache?: Maybe<Scalars['String']['output']>;
  level2Cache?: Maybe<Scalars['String']['output']>;
  level3Cache?: Maybe<Scalars['String']['output']>;
  logicKernel?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  physicalCores?: Maybe<Scalars['String']['output']>;
  state?: Maybe<HardwareState>;
}

export interface CPUSocketCoreThread {
  /** 插槽里有几个核 */
  coresPerSocket?: Maybe<Scalars['Int']['output']>;
  /** 插槽数量 */
  sockets?: Maybe<Scalars['Int']['output']>;
  /** 每个核心有几个线程 */
  threadsPerCore?: Maybe<Scalars['Int']['output']>;
}

export interface CalcHashInput {
  action: ActionInput;
  payload: Array<CalcHashPayload>;
}

export interface CalcHashPayload {
  backupStorageUuid: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface CanDirectRestore {
  canDirectRestore?: Maybe<Scalars['Boolean']['output']>;
  vmUuidList?: Maybe<Array<Scalars['String']['output']>>;
}

export interface CancelDefaultSNSTextTemplateInput {
  action: ActionInput;
  payload: Array<CancelDefaultSNSTextTemplatePayload>;
}

export interface CancelDefaultSNSTextTemplatePayload {
  uuid: Scalars['String']['input'];
}

export interface CancelLogCollectInput {
  action: ActionInput;
  payload: CancelLogCollectPayload;
}

export interface CancelLogCollectPayload {
  actionUuid: Scalars['String']['input'];
  taskUuid: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface CancelLongjobInput {
  action: ActionInput;
  payload: Array<CancelLongjobPayload>;
}

export interface CancelLongjobPayload {
  /** 值为true时只调用后端API */
  apiOnly?: InputMaybe<Scalars['Boolean']['input']>;
  uuid: Scalars['String']['input'];
}

export interface CandidateSharedBlock {
  /** 创建时间 */
  createDate?: Maybe<Scalars['String']['output']>;
  /** SCSI设备HCTL */
  hctl?: Maybe<Scalars['String']['output']>;
  /** 最后一次修改时间 */
  lastOpDate?: Maybe<Scalars['String']['output']>;
  /** 磁盘型号 */
  model?: Maybe<Scalars['String']['output']>;
  /** 资源名称 */
  name: Scalars['String']['output'];
  /** 磁盘路径 */
  path?: Maybe<Scalars['String']['output']>;
  /** 磁盘序列号 */
  serial?: Maybe<Scalars['String']['output']>;
  /** 磁盘大小 */
  size?: Maybe<Scalars['String']['output']>;
  /** iscsi fc nvme 可能存在，可能不存在。 */
  source?: Maybe<Scalars['String']['output']>;
  /** 磁盘启用状态 */
  state?: Maybe<Scalars['String']['output']>;
  /** 目标标识符, nvme 是nqn, fc 是wwnn, iscsi 是iqn  */
  targetIdentifier?: Maybe<Scalars['String']['output']>;
  /** iscsi fc tcp 可能存在，可能不存在。 */
  transport?: Maybe<Scalars['String']['output']>;
  /** 设备类型 */
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  /** 磁盘供应商 */
  vendor?: Maybe<Scalars['String']['output']>;
  /** 磁盘全局唯一表示 */
  wwid: Scalars['String']['output'];
  /** 磁盘WWN */
  wwn?: Maybe<Scalars['String']['output']>;
}

export interface CandidateSharedBlockResponse {
  /** 查询结果列表 */
  list?: Maybe<Array<CandidateSharedBlock>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface CapacityManagementActualSize {
  actualSize?: Maybe<Scalars['Float']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
}

export interface CapacityManagementBackupStoreInfo {
  Ceph?: Maybe<CapacityManagementCapacityInfo>;
  ImageStoreBackupStorage?: Maybe<CapacityManagementCapacityInfo>;
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  usedCapacity?: Maybe<Scalars['Float']['output']>;
}

export interface CapacityManagementCapacityInfo {
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  usedCapacity?: Maybe<Scalars['Float']['output']>;
}

export interface CapacityManagementCard {
  /** 获取镜像服务器中的备份相关数据的大小 */
  backupSizeInBackupStoreInfo?: Maybe<CapacityManagementSize>;
  /** 镜像服务器相关信息 */
  backupStoreInfo?: Maybe<CapacityManagementBackupStoreInfo>;
  /** 获取镜像服务器中 Trash 大小，根据 ImageStore/Ceph 类型区分 */
  backupStoreTrashSizeInfo?: Maybe<CapacityManagementSizeInBackupStoreInfo>;
  /** 获取计算节点相关信息，zstack 占用大小、总大小 */
  computeNodeInfo?: Maybe<CapacityManagementComputeNodeInfo>;
  /** 获取云盘相关信息，总数、总大小、总实际大小 */
  dataVolumeInfo?: Maybe<CapacityManagementFullActualSize>;
  /** 镜像缓存大小 */
  imageCacheSizeInfo?: Maybe<CapacityManagementSize>;
  /** 获取镜像相关信息，总数、总大小、总实际大小 */
  imageInfo?: Maybe<CapacityManagementFullActualSize>;
  /** 获取镜像服务器中的镜像大小，按 ImageStore/Ceph 类型区分 */
  imageSizeInBackupStoreInfo?: Maybe<CapacityManagementSizeInBackupStoreInfo>;
  /** 获取管理节点信息，总容量、总已用、管理节点日志、数据库、数据库备份、监控、升级备份大小 */
  managementNodeInfo?: Maybe<CapacityManagementManagementNodeInfo>;
  /** 主存储（Local/Ceph/SharedBlock）的存储信息 (总数、可用容量、可用物理容量、总容量、总物理容量) */
  primaryStorageInfo?: Maybe<CapacityManagementPrimaryStorageInfo>;
  /** 主存储（Local/Ceph/SharedBlock）中的 Trash 大小 */
  primaryStorageTrashInfo?: Maybe<CapacityManagementSize>;
  /** 获取快照相关信息，总数、总大小 */
  snapshotInfo?: Maybe<CapacityManagementFullSize>;
  /** 获取云主机（根盘）相关信息，总数、总大小、总实际大小 */
  vmInstanceInfo?: Maybe<CapacityManagementFullActualSize>;
  /** 根盘/云盘的容量/真实容量统计信息 */
  volumeTotalSizeInfo?: Maybe<CapacityManagementVolumeTotalSizeInfo>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface CapacityManagementCardPrimaryStorage {
  /** 镜像缓存大小 */
  imageCacheSizeInfo?: Maybe<CapacityManagementSize>;
  /** 主存储（Local/Ceph/SharedBlock）的存储信息 (总数、可用容量、可用物理容量、总容量、总物理容量) */
  primaryStorageInfo?: Maybe<CapacityManagementPrimaryStorageInfo>;
  /** 主存储（Local/Ceph/SharedBlock）中的 Trash 大小 */
  primaryStorageTrashInfo?: Maybe<CapacityManagementSize>;
  type?: Maybe<Scalars['String']['output']>;
  /** 根盘/云盘的容量/真实容量统计信息 */
  volumeTotalSizeInfo?: Maybe<CapacityManagementVolumeTotalSizeInfo>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface CapacityManagementComputeNodeInfo {
  otherSize?: Maybe<Scalars['Float']['output']>;
  totalSize?: Maybe<Scalars['Float']['output']>;
  zstackSize?: Maybe<Scalars['Float']['output']>;
}

export interface CapacityManagementDisconnectedResourceCount {
  backupStorage?: Maybe<Scalars['Float']['output']>;
  host?: Maybe<Scalars['Float']['output']>;
  primaryStorage?: Maybe<Scalars['Float']['output']>;
  primaryStorageNotInCluster?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
}

export interface CapacityManagementFullActualSize {
  actualSize?: Maybe<Scalars['Float']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
}

export interface CapacityManagementFullSize {
  size?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
}

export interface CapacityManagementListVMDiskInfo {
  diskDeviceLetter?: Maybe<Scalars['String']['output']>;
  fSType?: Maybe<Scalars['String']['output']>;
  free?: Maybe<Scalars['Float']['output']>;
  key?: Maybe<Scalars['String']['output']>;
  mountPoint?: Maybe<Scalars['String']['output']>;
  percent?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  used?: Maybe<Scalars['Float']['output']>;
}

export interface CapacityManagementListVMDiskInfoList {
  /** 查询结果列表 */
  list?: Maybe<Array<CapacityManagementListVMDiskInfo>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface CapacityManagementManagementNodeInfo {
  available?: Maybe<Scalars['Float']['output']>;
  database?: Maybe<Scalars['Float']['output']>;
  databaseBackup?: Maybe<Scalars['Float']['output']>;
  log?: Maybe<Scalars['Float']['output']>;
  monitor?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  upgradeBackup?: Maybe<Scalars['Float']['output']>;
  used?: Maybe<Scalars['Float']['output']>;
}

export interface CapacityManagementPrimaryStorageInfo {
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  availablePhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  systemUsedCapacity?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  totalPhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  usedCapacity?: Maybe<Scalars['Float']['output']>;
  usedPhysicalCapacity?: Maybe<Scalars['Float']['output']>;
}

export interface CapacityManagementSize {
  size?: Maybe<Scalars['Float']['output']>;
}

export interface CapacityManagementSizeInBackupStoreInfo {
  Ceph?: Maybe<CapacityManagementActualSize>;
  ImageStoreBackupStorage?: Maybe<CapacityManagementActualSize>;
}

export interface CapacityManagementTopListBackupStorage {
  detail?: Maybe<CapacityManagementTopListBackupStorageDetail>;
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface CapacityManagementTopListBackupStorageDetail {
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  backupSize?: Maybe<Scalars['Float']['output']>;
  imageSize?: Maybe<Scalars['Float']['output']>;
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  trashSize?: Maybe<Scalars['Float']['output']>;
  usedCapacity?: Maybe<Scalars['Float']['output']>;
  usedCapacityPercentage?: Maybe<Scalars['Float']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface CapacityManagementTopListHost {
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  detail?: Maybe<CapacityManagementTopListHostDetail>;
  name?: Maybe<Scalars['String']['output']>;
  /** 根分区已用量 */
  rootMountPointUsed?: Maybe<Scalars['Float']['output']>;
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  usedCapacity?: Maybe<Scalars['Float']['output']>;
  usedRate?: Maybe<Scalars['Float']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface CapacityManagementTopListHostDetail {
  freeCapacity?: Maybe<Scalars['Float']['output']>;
  usedCapacity?: Maybe<Scalars['Float']['output']>;
  usedCapacityPercentage?: Maybe<Scalars['Float']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface CapacityManagementTopListHostDiskInfo {
  diskDeviceLetter?: Maybe<Scalars['String']['output']>;
  fSType?: Maybe<Scalars['String']['output']>;
  free?: Maybe<Scalars['Float']['output']>;
  key?: Maybe<Scalars['String']['output']>;
  mountPoint?: Maybe<Scalars['String']['output']>;
  percent?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  used?: Maybe<Scalars['Float']['output']>;
}

export interface CapacityManagementTopListImage {
  actualSize?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
  system?: Maybe<Scalars['Boolean']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface CapacityManagementTopListPrimaryStorage {
  detail?: Maybe<CapacityManagementTopListPrimaryStorageDetail>;
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface CapacityManagementTopListPrimaryStorageDetail {
  availablePhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  dataVolumeSize?: Maybe<Scalars['Float']['output']>;
  imageCacheSize?: Maybe<Scalars['Float']['output']>;
  rootVolumeSize?: Maybe<Scalars['Float']['output']>;
  systemSize?: Maybe<Scalars['Float']['output']>;
  totalPhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  trashSize?: Maybe<Scalars['Float']['output']>;
  usedPhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  usedPhysicalCapacityPercentage?: Maybe<Scalars['Float']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface CapacityManagementTopListSnapshot {
  name?: Maybe<Scalars['String']['output']>;
  resource?: Maybe<CapacityManagementTopListSnapshotResource>;
  size?: Maybe<Scalars['Float']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  volumeType?: Maybe<Scalars['String']['output']>;
  volumeUuid?: Maybe<Scalars['String']['output']>;
}

export interface CapacityManagementTopListSnapshotResource {
  resourceName?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  resourceUuid?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface CapacityManagementTopListVmInstance {
  actualSize?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface CapacityManagementTopListVolume {
  actualSize?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface CapacityManagementVolumeTotalSizeInfo {
  Data?: Maybe<CapacityManagementActualSize>;
  Root?: Maybe<CapacityManagementActualSize>;
}

export interface CbdMds {
  addr?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  externalAddr?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  port?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<MdsStatus>;
  username?: Maybe<Scalars['String']['output']>;
}

export interface CdRom {
  createDate: Scalars['String']['output'];
  defaultflag?: Maybe<Scalars['Boolean']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  deviceId?: Maybe<Scalars['Int']['output']>;
  isoInstallPath?: Maybe<Scalars['String']['output']>;
  isoName?: Maybe<Scalars['String']['output']>;
  isoUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  /**  */
  occupant?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vmInstanceUuid: Scalars['String']['output'];
}

export interface CdRomsQueryResp {
  list?: Maybe<Array<CdRom>>;
  total?: Maybe<Scalars['Int']['output']>;
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

export interface CdromConfigForVmCreate {
  maximumCdRomNum: Scalars['Int']['output'];
  vmDefaultCdRomNum: Scalars['Int']['output'];
}

export interface CephBackupStorageMon {
  backupStorageUuid?: Maybe<Scalars['String']['output']>;
  createDate: Scalars['String']['output'];
  hostname: Scalars['String']['output'];
  lastOpDate: Scalars['String']['output'];
  monAddr?: Maybe<Scalars['String']['output']>;
  monPort?: Maybe<Scalars['Int']['output']>;
  monUuid?: Maybe<Scalars['String']['output']>;
  sshPassword?: Maybe<Scalars['String']['output']>;
  sshPort?: Maybe<Scalars['Int']['output']>;
  sshUsername?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
}

export interface CephMon {
  backupStorageUuid?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  hostname?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  monAddr?: Maybe<Scalars['String']['output']>;
  monPort?: Maybe<Scalars['String']['output']>;
  monUuid: Scalars['String']['output'];
  name: Scalars['String']['output'];
  primaryStorageUuid?: Maybe<Scalars['String']['output']>;
  sshPassword?: Maybe<Scalars['String']['output']>;
  sshPort?: Maybe<Scalars['Int']['output']>;
  sshUsername?: Maybe<Scalars['String']['output']>;
  status?: Maybe<MonStatus>;
  uuid: Scalars['String']['output'];
}

export enum CephMonType {
  BackupStorage = 'BackupStorage',
  PrimaryStorage = 'PrimaryStorage'
}

export interface CephPrimaryStorageMon {
  createDate?: Maybe<Scalars['String']['output']>;
  hostname?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  monAddr?: Maybe<Scalars['String']['output']>;
  monPort?: Maybe<Scalars['String']['output']>;
  monUuid?: Maybe<Scalars['String']['output']>;
  primaryStorageUuid?: Maybe<Scalars['String']['output']>;
  sshPassword?: Maybe<Scalars['String']['output']>;
  sshPort?: Maybe<Scalars['String']['output']>;
  sshUsername?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
}

export interface CephPrimaryStoragePool {
  aliasName?: Maybe<Scalars['String']['output']>;
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  cephPrimaryStoragePoolCapacity: CephPrimaryStoragePoolCapacity;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  diskUtilization?: Maybe<Scalars['Float']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  poolName?: Maybe<Scalars['String']['output']>;
  primaryStorage?: Maybe<PSForCephPrimaryStoragePool>;
  primaryStorageCapacity?: Maybe<PrimaryStorageCapacity>;
  primaryStorageUuid?: Maybe<Scalars['String']['output']>;
  replicatedSize?: Maybe<Scalars['String']['output']>;
  securityPolicy?: Maybe<DataSecurityPolicy>;
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<CephPrimaryStoragePoolType>;
  usedCapacity?: Maybe<Scalars['Float']['output']>;
  uuid: Scalars['String']['output'];
}

export interface CephPrimaryStoragePoolCapacity {
  /** 镜像缓存 */
  imageCacheSize?: Maybe<Scalars['Float']['output']>;
  /** 保留容量(这个保留容量只用于ceph的pool池) */
  reservedCapacity?: Maybe<Scalars['Float']['output']>;
  /** 模版缓存 */
  vmTemplateVolumeCacheSize?: Maybe<Scalars['Float']['output']>;
  /** 虚拟机硬盘真实容量 */
  volumeActualSize?: Maybe<Scalars['Float']['output']>;
  /** 虚拟机硬盘 */
  volumeSize?: Maybe<Scalars['Float']['output']>;
  /** 快照容量 */
  volumeSnapshotSize?: Maybe<Scalars['Float']['output']>;
}

export interface CephPrimaryStoragePoolList {
  error?: Maybe<ActionError>;
  list: Array<CephPrimaryStoragePool>;
  total: Scalars['Int']['output'];
}

export enum CephPrimaryStoragePoolType {
  BackupStorage = 'BackupStorage',
  Data = 'Data',
  ImageCache = 'ImageCache',
  Root = 'Root'
}

export interface CertInfo {
  C?: Maybe<Scalars['String']['output']>;
  L?: Maybe<Scalars['String']['output']>;
  O?: Maybe<Scalars['String']['output']>;
  OU?: Maybe<Scalars['String']['output']>;
  ST?: Maybe<Scalars['String']['output']>;
  bits?: Maybe<Scalars['Int']['output']>;
  duration?: Maybe<Scalars['String']['output']>;
  emailAddress?: Maybe<Scalars['String']['output']>;
  expireTime?: Maybe<Scalars['String']['output']>;
  fingerprint?: Maybe<Scalars['String']['output']>;
  https?: Maybe<Scalars['Boolean']['output']>;
  issueCN?: Maybe<Scalars['String']['output']>;
  issueTime?: Maybe<Scalars['String']['output']>;
  keyAlgorithm?: Maybe<Scalars['String']['output']>;
  serial?: Maybe<Scalars['String']['output']>;
  signatureAlgorithm?: Maybe<Scalars['String']['output']>;
  subC?: Maybe<Scalars['String']['output']>;
  subCN?: Maybe<Scalars['String']['output']>;
  subEmailAddress?: Maybe<Scalars['String']['output']>;
  subL?: Maybe<Scalars['String']['output']>;
  subO?: Maybe<Scalars['String']['output']>;
  subOU?: Maybe<Scalars['String']['output']>;
  subST?: Maybe<Scalars['String']['output']>;
  uploadTime?: Maybe<Scalars['String']['output']>;
  validating?: Maybe<Scalars['Boolean']['output']>;
  version?: Maybe<Scalars['String']['output']>;
}

export interface CertResetInput {
  action: ActionInput;
  payload: Scalars['String']['input'];
}

export interface CertUploadInfoInput {
  action: ActionInput;
  payload: CertUploadInfoPayload;
}

export interface CertUploadInfoPayload {
  chain?: InputMaybe<Scalars['String']['input']>;
  pri: Scalars['String']['input'];
  pub: Scalars['String']['input'];
  redirect: Scalars['Boolean']['input'];
}

export interface ChangeAccessKeyStateInput {
  action: ActionInput;
  payload: Array<ChangeAccessKeyStatePayload>;
}

export interface ChangeAccessKeyStatePayload {
  stateEvent: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface ChangeAccountTypeInput {
  action: ActionInput;
  payload: Array<ChangeAccountTypePayload>;
}

export interface ChangeAccountTypePayload {
  type: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface ChangeBackupStorageStateInput {
  action: ActionInput;
  payload: Array<ChangeBackupStorageStatePayload>;
}

export interface ChangeBackupStorageStatePayload {
  stateEvent: BackupStorageStateEvent;
  uuid: Scalars['String']['input'];
}

export interface ChangeClusterStateInput {
  action: ActionInput;
  payload: Array<ChangeClusterStatePayload>;
}

export interface ChangeClusterStatePayload {
  uuid: Scalars['String']['input'];
}

export interface ChangeEndpointInput {
  action: ActionInput;
  payload: Array<ChangeEndpointStatePayload>;
}

export interface ChangeEndpointStatePayload {
  stateEvent: StateEvent;
  uuid: Scalars['String']['input'];
}

export interface ChangeEventAlarmStateInput {
  action: ActionInput;
  payload: Array<ChangeEventAlarmStatePayload>;
}

export interface ChangeEventAlarmStatePayload {
  state: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface ChangeImageStateInput {
  action: ActionInput;
  payload: Array<ChangeImageStatePayload>;
}

export interface ChangeImageStatePayload {
  stateEvent: ImageStateEvent;
  uuid: Scalars['String']['input'];
}

export interface ChangePreconfigurationTemplateStateInput {
  action: ActionInput;
  payload: Array<ChangePreconfigurationTemplateStatePayload>;
}

export interface ChangePreconfigurationTemplateStatePayload {
  stateEvent: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface ChangeResourceOwnerInput {
  action: ActionInput;
  payload: Array<ChangeResourceOwnerPayload>;
}

export interface ChangeResourceOwnerPayload {
  accountUuid: Scalars['String']['input'];
  resourceUuid: Scalars['String']['input'];
}

export interface ChangeSchedulerJobGroupBasicInfo {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parameters?: InputMaybe<Parameters>;
  state?: InputMaybe<SchedulerJobGroupState>;
  uuid: Scalars['String']['input'];
}

export interface ChangeSchedulerJobGroupBasicInfoInput {
  action: ActionInput;
  payload: Array<ChangeSchedulerJobGroupBasicInfo>;
}

export interface ChangeSchedulerJobStateInput {
  action: ActionInput;
  payload: Array<ChangeSchedulerJobStatePayload>;
}

export interface ChangeSchedulerJobStatePayload {
  stateEvent: SchedulerJobStateEvent;
  uuid: Scalars['String']['input'];
}

export interface ChangeSchedulerStateActionInput {
  action: ActionInput;
  payload: Array<ChangeSchedulerStateActionPayload>;
}

export interface ChangeSchedulerStateActionPayload {
  enable: Scalars['Boolean']['input'];
  isVm: Scalars['Boolean']['input'];
  uuid: Scalars['String']['input'];
}

export interface ChangeSecurityGroupRuleInput {
  action: ActionInput;
  payload: ChangeSecurityGroupRulePayload;
}

export interface ChangeSecurityGroupRulePayload {
  action?: InputMaybe<SecurityGroupRulePolicy>;
  allowedCidr?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dstIpRange?: InputMaybe<Scalars['String']['input']>;
  dstPortRange?: InputMaybe<Scalars['String']['input']>;
  endPort?: InputMaybe<Scalars['Int']['input']>;
  ipVersion?: InputMaybe<Scalars['Int']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  protocol?: InputMaybe<SecurityGroupRuleProtocolType>;
  remoteSecurityGroupUuid?: InputMaybe<Scalars['String']['input']>;
  remoteSecurityGroupUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  srcIpRange?: InputMaybe<Scalars['String']['input']>;
  srcPortRange?: InputMaybe<Scalars['String']['input']>;
  startPort?: InputMaybe<Scalars['Int']['input']>;
  state: SecurityGroupRuleState;
  type?: InputMaybe<SecurityGroupRuleType>;
  uuid: Scalars['String']['input'];
}

export interface ChangeSecurityGroupRuleStateInput {
  action: ActionInput;
  payload: Array<ChangeSecurityGroupRuleStatePayload>;
}

export interface ChangeSecurityGroupRuleStatePayload {
  ruleUuids: Array<Scalars['String']['input']>;
  securityGroupUuid: Scalars['String']['input'];
  state: SecurityGroupRuleState;
}

export interface ChangeSecurityGroupStateInput {
  action: ActionInput;
  payload: Array<ChangeSecurityGroupStatePayload>;
}

export interface ChangeSecurityGroupStatePayload {
  stateEvent: SecurityGroupStateEvent;
  uuid: Scalars['String']['input'];
}

export interface ChangeVmImageInput {
  action: ActionInput;
  payload: Array<ChangeVmImagePayload>;
}

export interface ChangeVmImagePayload {
  imageUuid: Scalars['String']['input'];
  vmInstanceUuid: Scalars['String']['input'];
}

export interface ChangeVmNicNetworkInput {
  action: ActionInput;
  payload: ChangeVmNicNetworkPayload;
}

export interface ChangeVmNicNetworkPayload {
  /** 三层网的uuid */
  destL3NetworkUuid: Scalars['String']['input'];
  /** ip4 */
  staticIpv4?: InputMaybe<Scalars['String']['input']>;
  /** ip6 */
  staticIpv6?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  vmNicParams?: InputMaybe<Scalars['String']['input']>;
  /** 当前网卡的uuid */
  vmNicUuid: Scalars['String']['input'];
}

export interface ChangeVmNicStateInput {
  action: ActionInput;
  payload: Array<ChangeVmNicStatePayload>;
}

export interface ChangeVmNicStatePayload {
  state: Scalars['String']['input'];
  vmNicUuid: Scalars['String']['input'];
}

export interface ChangeVmPasswordInput {
  action: ActionInput;
  payload: ChangeVmPasswordPayload;
}

export interface ChangeVmPasswordPayload {
  account: Scalars['String']['input'];
  password: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface ChangeVmSchedulingRuleStateInput {
  action: ActionInput;
  payload: Array<ChangeVmSchedulingRuleStatePayload>;
}

export interface ChangeVmSchedulingRuleStatePayload {
  state: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface ChangeVolumeStateInput {
  action: ActionInput;
  payload: Array<ChangeVolumeStatePayload>;
}

export interface ChangeVolumeStatePayload {
  stateEvent: VolumeStateEvent;
  uuid: Scalars['String']['input'];
}

export interface ChangeZSVBackupStorageStateInput {
  action: ActionInput;
  payload: Array<ChangeZSVBackupStorageStatePayload>;
}

export interface ChangeZSVBackupStorageStatePayload {
  stateEvent: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface ChangeZoneStateInput {
  action: ActionInput;
  payload: Array<ChangeZoneStatePayload>;
}

export interface ChangeZoneStatePayload {
  stateEvent: ZoneStateEvent;
  uuid: Scalars['String']['input'];
}

export interface CheckHostnameRepeatParam {
  hostname: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}

export interface CheckHostnameRepeatResult {
  repeat: Scalars['Boolean']['output'];
}

export interface CheckIpAvailabilityParam {
  arpCheck?: InputMaybe<Scalars['Boolean']['input']>;
  ip: Scalars['String']['input'];
  ipRangeCheck?: InputMaybe<Scalars['Boolean']['input']>;
  l3NetworkUuid: Scalars['String']['input'];
}

export interface CheckIpAvailabilityResult {
  available: Scalars['Boolean']['output'];
}

export interface CheckMacAvailabilityParam {
  mac: Scalars['String']['input'];
}

export interface CheckMacAvailabilityResult {
  available: Scalars['Boolean']['output'];
}

export interface CheckMemorySnapshotGroupConflictResult {
  vmNicConflict?: Maybe<Array<VmNicConflict>>;
}

export interface CheckScsiLunClusterStatusInput {
  action: ActionInput;
  payload: Array<CheckScsiLunClusterStatusPayload>;
}

export interface CheckScsiLunClusterStatusPayload {
  /** 集群UUID */
  clusterUuid: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface CheckSyncInput {
  dryRun?: InputMaybe<Scalars['Boolean']['input']>;
  tokenName: Scalars['String']['input'];
  type: SecurityMachineKeyType;
  uuid: Scalars['String']['input'];
}

export interface CheckTemplateResp {
  parameters: Array<Parameter>;
}

export interface CheckVNicAvailabilityResult {
  available: Scalars['Boolean']['output'];
  duplicateIps: Array<Scalars['String']['output']>;
  l3Network?: Maybe<Array<L3Network>>;
}

export interface CheckVNicIpAvailabilityParam {
  ip?: InputMaybe<Scalars['String']['input']>;
  ipVersion?: InputMaybe<Scalars['Int']['input']>;
  l3NetworkUuid?: InputMaybe<Scalars['String']['input']>;
  vmNicUuids?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface CleanStoragePackageInput {
  action: ActionInput;
  payload: CleanStoragePackagePayload;
}

export interface CleanStoragePackagePayload {
  cleanStorageMode?: InputMaybe<Scalars['Boolean']['input']>;
  uuid: Scalars['String']['input'];
}

export interface CleanUpTrashListInput {
  action: ActionInput;
  payload: Array<CleanUpTrashPayload>;
}

export interface CleanUpTrashPayload {
  trashId?: InputMaybe<Scalars['Int']['input']>;
  type: TrashQueryType;
  uuid: Scalars['String']['input'];
}

export interface CleanUpgradeSoftwarePackageInput {
  action: ActionInput;
  payload: Array<CleanUpgradeSoftwarePackagePayload>;
}

export interface CleanUpgradeSoftwarePackagePayload {
  /** 删除模式 */
  deleteMode?: InputMaybe<Scalars['String']['input']>;
  /** SoftwarePackage UUID */
  uuid: Scalars['String']['input'];
}

export interface ClientInfo {
  clientBrowser?: InputMaybe<Scalars['String']['input']>;
  clientIp?: InputMaybe<Scalars['String']['input']>;
}

export interface CloneRoleInput {
  action: ActionInput;
  payload: Array<CloneRolePayload>;
}

export interface CloneRolePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  policies?: InputMaybe<Array<ZsvRolePoliciesInput>>;
  uiPrivilege?: InputMaybe<Array<ZsvRoleUIPrivilegeInput>>;
}

export interface CloneVmInstanceInput {
  action: ActionInput;
  payload: Array<CloneVmInstancePayload>;
}

export interface CloneVmInstancePayload {
  count: Scalars['Int']['input'];
  dataVolumeSystemTags?: Array<Scalars['String']['input']>;
  defaultL3NetworkUuid?: InputMaybe<Scalars['String']['input']>;
  full?: InputMaybe<Scalars['Boolean']['input']>;
  hostname?: InputMaybe<Scalars['String']['input']>;
  l3NetworkUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  names?: InputMaybe<Array<Scalars['String']['input']>>;
  primaryStorageUuidForDataVolume?: InputMaybe<Scalars['String']['input']>;
  primaryStorageUuidForRootVolume?: InputMaybe<Scalars['String']['input']>;
  resetTpm?: InputMaybe<Scalars['Boolean']['input']>;
  rootVolumeSystemTags?: Array<Scalars['String']['input']>;
  strategy?: InputMaybe<Scalars['String']['input']>;
  systemTags?: Array<Scalars['String']['input']>;
  vmInstanceUuid: Scalars['String']['input'];
  vmNicConfig?: InputMaybe<Array<ZSVNicConfig>>;
  vmNicParams?: InputMaybe<Scalars['String']['input']>;
}

export interface CloneVmToTemplateInput {
  action: ActionInput;
  payload: Array<CloneVmToTemplatePayload>;
}

export interface CloneVmToTemplatePayload {
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  systemTags?: Array<Scalars['String']['input']>;
  tagUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  vmInstanceUuid: Scalars['String']['input'];
}

export interface CloseHostIommuInput {
  action: ActionInput;
  payload: CloseHostIommuPayload;
}

export interface CloseHostIommuPayload {
  uuid: Scalars['String']['input'];
}

export interface Cluster {
  architecture?: Maybe<CpuArchitecture>;
  /** 弹性裸金属节点（设备）数量 */
  baremetal2ChassisNum?: Maybe<Scalars['Int']['output']>;
  /** 弹性网关节点数量 */
  baremetal2GatewayNum?: Maybe<Scalars['Int']['output']>;
  /** 裸金属设备数量 */
  baremetalChassisNum?: Maybe<Scalars['Int']['output']>;
  /** 裸金属主机数量 */
  baremetalInstanceNum?: Maybe<Scalars['Int']['output']>;
  baremetalPxeServer?: Maybe<BaremetalPxeServer>;
  checkCpuModel?: Maybe<Scalars['String']['output']>;
  checkCpuModelId?: Maybe<Scalars['String']['output']>;
  clusterKVMCpuModel?: Maybe<Scalars['String']['output']>;
  clusterZWatchInfo?: Maybe<ClusterZWatchInfo>;
  cpuMemoryCapacity?: Maybe<CpuMemoryCapacity>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  destroyedVm?: Maybe<Scalars['Int']['output']>;
  displayNetworkCidr?: Maybe<Scalars['String']['output']>;
  /** 扫描周期: 优先从 ResourceConfigVO > GlobalConfigVO 中取, category=drs, name=schedulingInterval, resourceType=ClusterVO */
  drsSchedulingInterval?: Maybe<Scalars['String']['output']>;
  hostList?: Maybe<Array<HostNameAndUuidForCluster>>;
  hostNum?: Maybe<Scalars['Int']['output']>;
  hypervisorType?: Maybe<Scalars['String']['output']>;
  /** 是否已加载部署服务器 */
  isAttachBaremetalPxeServer?: Maybe<Scalars['Boolean']['output']>;
  isAttachL2network?: Maybe<Scalars['Boolean']['output']>;
  isAttachPrimaryStorage?: Maybe<Scalars['Boolean']['output']>;
  /** 如果cluster下的vm 有开启内存回收的，cluster不能开启大页内存 */
  isHugePageMemoryCanOpen: Scalars['Boolean']['output'];
  isMaintenanceOfAllHost?: Maybe<Scalars['Boolean']['output']>;
  isShowDrsTab?: Maybe<Scalars['Boolean']['output']>;
  isSupported?: Maybe<Scalars['Boolean']['output']>;
  l2NetworkCount?: Maybe<Scalars['Int']['output']>;
  l3NetworkCount?: Maybe<Scalars['Int']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  migrateNetworkCidr?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  /** 是否开启了网络加速 */
  networkHp?: Maybe<Scalars['Boolean']['output']>;
  primaryStorageCount?: Maybe<Scalars['Int']['output']>;
  primaryStorageList?: Maybe<Array<PrimaryStorage>>;
  psTypes?: Maybe<Array<Scalars['String']['output']>>;
  realCpuMemoryCapacity: HostCpuMemoryCapacity;
  recommendQemuVersion?: Maybe<Scalars['String']['output']>;
  resourceConfigValue?: Maybe<ClusterResourceConfigValue>;
  runningVm?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<ClusterState>;
  stoppedVm?: Maybe<Scalars['Int']['output']>;
  totalVm?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  virtualizationVmInstanceCount?: Maybe<Scalars['Int']['output']>;
  vmInstanceCount?: Maybe<Scalars['Int']['output']>;
  volumeCount?: Maybe<Scalars['Int']['output']>;
  vtepCidr?: Maybe<Scalars['String']['output']>;
  zone?: Maybe<Zone>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface ClusterAttachablePrimaryStorageTypes {
  types?: Maybe<Array<Scalars['String']['output']>>;
}

export interface ClusterNameAndUuidForDRS {
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface ClusterNameAndUuidForVmMigrationActivity {
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
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

export interface ClusterRelatedSummary {
  gpu: Scalars['Int']['output'];
  host: Scalars['Int']['output'];
  iscsiServer: Scalars['Int']['output'];
  l2Network: Scalars['Int']['output'];
  /** 其他设备数量 */
  pci: Scalars['Int']['output'];
  physicalNic: Scalars['Int']['output'];
  primaryStorage: Scalars['Int']['output'];
  usb: Scalars['Int']['output'];
  vGpu: Scalars['Int']['output'];
  vm: Scalars['Int']['output'];
}

export interface ClusterResourceConfig {
  category: Scalars['String']['input'];
  name: Scalars['String']['input'];
  value: Scalars['String']['input'];
}

export interface ClusterResourceConfigValue {
  drsDrsMigrateVmConcurrent?: Maybe<Scalars['String']['output']>;
  drsDrsSchedulingInterval?: Maybe<Scalars['String']['output']>;
  haVmHaLevel?: Maybe<Scalars['String']['output']>;
  hostCpuOverProvisioningRatio?: Maybe<Scalars['String']['output']>;
  kvmAutoSetVmNicMultiqueue?: Maybe<Scalars['String']['output']>;
  kvmIgnoreMsrs?: Maybe<Scalars['String']['output']>;
  kvmReservedMemory?: Maybe<Scalars['String']['output']>;
  mevocoOverProvisioningMemory?: Maybe<Scalars['String']['output']>;
  premiumClusterEnableZeroCopy?: Maybe<Scalars['String']['output']>;
  premiumClusterHugepageEnable?: Maybe<Scalars['String']['output']>;
  vmEmulateHyperV?: Maybe<Scalars['String']['output']>;
  vmVideoType?: Maybe<Scalars['String']['output']>;
  vmVmHaAcrossClusters?: Maybe<Scalars['String']['output']>;
}

export enum ClusterState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export interface ClusterSummaryQueryResp {
  baremetal2Count: Scalars['Int']['output'];
  baremetalCount: Scalars['Int']['output'];
  clusterCount: Scalars['Int']['output'];
}

export interface ClusterUuidAndNameRef {
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface ClusterZWatchInfo {
  /** CPU使用率 */
  cpuAllUsedUtilization?: Maybe<Scalars['String']['output']>;
  /** 内存可用容量 */
  memoryFreeBytes?: Maybe<Scalars['String']['output']>;
  /** 内存使用率 */
  memoryUsedInPercent?: Maybe<Scalars['String']['output']>;
}

export interface CommonOwner {
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export enum ComparisonOperator {
  GreaterThan = 'GreaterThan',
  GreaterThanOrEqualTo = 'GreaterThanOrEqualTo',
  LessThan = 'LessThan',
  LessThanOrEqualTo = 'LessThanOrEqualTo'
}

export interface Condition {
  /** 查询条件的字段名 */
  key?: InputMaybe<Scalars['String']['input']>;
  /** 查询条件的操作符 */
  op?: InputMaybe<Op>;
  /** 查询条件的值 */
  value?: InputMaybe<Scalars['CondtionValue']['input']>;
  /** 查询条件的多个值 */
  values?: InputMaybe<Array<Scalars['CondtionValue']['input']>>;
}

export interface ConditionCount {
  count: Scalars['Int']['output'];
  key: Scalars['String']['output'];
}

export interface ConditionsMap {
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface ConfigBaremetalPxeServerInput {
  action: ActionInput;
  payload: ConfigBaremetalPxeServerPayload;
}

export interface ConfigBaremetalPxeServerPayload {
  clusterUuid?: InputMaybe<Array<Scalars['String']['input']>>;
  configType: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  dhcpInterface?: InputMaybe<Scalars['String']['input']>;
  dhcpRangeBegin?: InputMaybe<Scalars['String']['input']>;
  dhcpRangeEnd?: InputMaybe<Scalars['String']['input']>;
  hostname?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pxeServerUuid?: InputMaybe<Scalars['String']['input']>;
  sshPassword?: InputMaybe<Scalars['String']['input']>;
  sshPort?: InputMaybe<Scalars['Int']['input']>;
  sshUsername?: InputMaybe<Scalars['String']['input']>;
  storagePath?: InputMaybe<Scalars['String']['input']>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface ConfigBaremetalPxeServerResult {
  actionId: Scalars['String']['output'];
  pxeServerUuid: Scalars['String']['output'];
}

export interface ConfigFile {
  architecture?: Maybe<Scalars['String']['output']>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface ConfigFileList {
  list?: Maybe<Array<ConfigFile>>;
  total: Scalars['Int']['output'];
}

export enum ConnectionModeEnum {
  DynamicCentralizedAllocation = 'DynamicCentralizedAllocation',
  StaticAverageAllocation = 'StaticAverageAllocation',
  StaticCentralizedAllocation = 'StaticCentralizedAllocation',
  StaticPolling = 'StaticPolling'
}

export interface ConsoleProxyAgent {
  consoleProxyOverriddenIp?: Maybe<Scalars['String']['output']>;
  consoleProxyPort?: Maybe<Scalars['Int']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  managementIp?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface ConsoleProxyAgentQueryResp {
  list?: Maybe<Array<ConsoleProxyAgent>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface ConverTemplateToVMInput {
  action: ActionInput;
  payload: Array<ConverTemplateToVMPayload>;
}

export interface ConverTemplateToVMPayload {
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  resetTpm?: InputMaybe<Scalars['Boolean']['input']>;
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  strategy?: InputMaybe<VmCreationStrategy>;
  templateUuid?: InputMaybe<Scalars['String']['input']>;
  vmTemplateUuid: Scalars['String']['input'];
}

export interface CountByNamespaceInventory {
  count?: Maybe<Scalars['Int']['output']>;
  namespace?: Maybe<Scalars['String']['output']>;
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

export interface CpuMemoryCapacity {
  availableCpu?: Maybe<Scalars['Int']['output']>;
  availableMemory?: Maybe<Scalars['Float']['output']>;
  /** 可用总量（超分后的）。超分率X可用总量。 */
  overProvisioningAvailableMemory?: Maybe<Scalars['Float']['output']>;
  /** 总量（超分后的）。超分率X总量。 */
  overProvisioningTotalMemory?: Maybe<Scalars['Float']['output']>;
  physicalCpu?: Maybe<Scalars['Int']['output']>;
  /** 保留内存 */
  reservedMemory?: Maybe<Scalars['String']['output']>;
  totalCpu?: Maybe<Scalars['Int']['output']>;
  totalMemory?: Maybe<Scalars['Float']['output']>;
}

export interface CpuModelList {
  list: Array<Scalars['String']['output']>;
}

export interface CreateAccessKeyInput {
  action: ActionInput;
  payload: CreateAccessKeyPayload;
}

export interface CreateAccessKeyPayload {
  name: Scalars['String']['input'];
}

export interface CreateAccountInput {
  action: ActionInput;
  payload: Array<CreateAccountPayload>;
}

export interface CreateAccountPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  resourceUuids?: InputMaybe<Array<Array<Scalars['String']['input']>>>;
  roleUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  type: AccountType;
  userGroupUuids?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface CreateAlarmInput {
  action: ActionInput;
  payload: CreateAlarmPayload;
}

export interface CreateAlarmPayload {
  actions?: InputMaybe<Array<AlarmActionsInput>>;
  /** 阈值比较符 */
  comparisonOperator: ComparisonOperator;
  description?: InputMaybe<Scalars['String']['input']>;
  /** 报警等级 */
  emergencyLevel?: InputMaybe<Scalars['String']['input']>;
  /** 开启恢复通知 */
  enableRecovery?: InputMaybe<Scalars['Boolean']['input']>;
  /** 标签列表 */
  labels?: InputMaybe<Array<AlarmLabelsInput>>;
  /** 监控项名 */
  metricName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  /** 名字空间 */
  namespace: Scalars['String']['input'];
  /** 阈值持续时间 */
  period?: InputMaybe<Scalars['Int']['input']>;
  /** 报警重复次数 */
  repeatCount?: InputMaybe<Scalars['Int']['input']>;
  /** 报警重复时间 */
  repeatInterval?: InputMaybe<Scalars['Int']['input']>;
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  /** 阈值 */
  threshold: Scalars['Float']['input'];
  /** 报警器类型 */
  type?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateAliyunSmsEndpointAndAccesskeyInput {
  action: ActionInput;
  payload: Array<CreateAliyunSmsEndpointAndAccesskeyPayload>;
}

export interface CreateAliyunSmsEndpointAndAccesskeyPayload {
  accessKey: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  receivers?: InputMaybe<Array<Scalars['String']['input']>>;
  secret: Scalars['String']['input'];
}

export interface CreateAliyunSmsEndpointInput {
  action: ActionInput;
  payload: Array<CreateAliyunSmsEndpointPayload>;
}

export interface CreateAliyunSmsEndpointPayload {
  accessKeyUuid: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  receivers?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface CreateAliyunSmsSNSTextTemplateInput {
  action: ActionInput;
  payload: CreateAliyunSmsSNSTextTemplatePayload;
}

export interface CreateAliyunSmsSNSTextTemplatePayload {
  alarmTemplateCode: Scalars['String']['input'];
  applicationPlatformType: Scalars['String']['input'];
  defaultTemplate?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  eventTemplate?: InputMaybe<Scalars['String']['input']>;
  eventTemplateCode: Scalars['String']['input'];
  name: Scalars['String']['input'];
  recoverySubject?: InputMaybe<Scalars['String']['input']>;
  recoveryTemplate?: InputMaybe<Scalars['String']['input']>;
  sign: Scalars['String']['input'];
  subject?: InputMaybe<Scalars['String']['input']>;
  template: Scalars['String']['input'];
}

export interface CreateBSSystemTagInput {
  action: ActionInput;
  payload: CreateBSSystemTagPayload;
}

export interface CreateBSSystemTagPayload {
  resourceType: Scalars['String']['input'];
  resourceUuid: Scalars['String']['input'];
  tag: Scalars['String']['input'];
}

export interface CreateBackupInput {
  action: ActionInput;
  payload: CreateBackupPayload;
}

export interface CreateBackupPayload {
  /** 本地备份服务器UUID */
  backupStorageUuid: Scalars['String']['input'];
  /** 同时备份已加载的云盘 */
  backupWithDataVolume?: InputMaybe<Scalars['Boolean']['input']>;
  /** 备份云主机 */
  isBackupVm?: InputMaybe<Scalars['Boolean']['input']>;
  /** 全量备份 */
  mode?: InputMaybe<Scalars['String']['input']>;
  /** 资源名称 */
  name: Scalars['String']['input'];
  /** 远端备份服务器UUID */
  remoteBackupStorageUuid?: InputMaybe<Scalars['String']['input']>;
  /** 同步到远端备份服务器 */
  sync?: InputMaybe<Scalars['Boolean']['input']>;
  /** 云盘UUID */
  volumeUuid: Scalars['String']['input'];
  volumeUuidForTargetResourceUuid: Scalars['String']['input'];
}

export interface CreateBaremetalChassisInput {
  action: ActionInput;
  payload: Array<CreateBaremetalChassisPayload>;
}

export interface CreateBaremetalChassisPayload {
  clusterUuid: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  ipmiAddress: Scalars['String']['input'];
  ipmiPassword: Scalars['String']['input'];
  ipmiPort?: InputMaybe<Scalars['Int']['input']>;
  ipmiUsername: Scalars['String']['input'];
  name: Scalars['String']['input'];
  restartAfterAdding: Scalars['Boolean']['input'];
}

export interface CreateBaremetalClusterInput {
  action: ActionInput;
  payload: CreateBaremetalClusterPayload;
}

export interface CreateBaremetalClusterPayload {
  /** 配置类型 */
  configType?: InputMaybe<Scalars['String']['input']>;
  /** 简介 */
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  /** 是否需要创建PXE服务器 */
  needCreatePxeServer?: InputMaybe<Scalars['Boolean']['input']>;
  /** PXE服务器描述 */
  pxeServerDescription?: InputMaybe<Scalars['String']['input']>;
  /** PXE服务器DHCP接口 */
  pxeServerDhcpInterface?: InputMaybe<Scalars['String']['input']>;
  /** PXE服务器DHCP范围起始 */
  pxeServerDhcpRangeBegin?: InputMaybe<Scalars['String']['input']>;
  /** PXE服务器DHCP范围结束 */
  pxeServerDhcpRangeEnd?: InputMaybe<Scalars['String']['input']>;
  /** PXE服务器主机名 */
  pxeServerHostname?: InputMaybe<Scalars['String']['input']>;
  /** PXE服务器名称 */
  pxeServerName?: InputMaybe<Scalars['String']['input']>;
  /** PXE服务器SSH密码 */
  pxeServerSshPassword?: InputMaybe<Scalars['String']['input']>;
  /** PXE服务器SSH端口 */
  pxeServerSshPort?: InputMaybe<Scalars['String']['input']>;
  /** PXE服务器SSH用户名 */
  pxeServerSshUsername?: InputMaybe<Scalars['String']['input']>;
  /** PXE服务器存储路径 */
  pxeServerStoragePath?: InputMaybe<Scalars['String']['input']>;
  /** PXE服务器UUID,直接attach的时候用的 */
  pxeServerUuid?: InputMaybe<Scalars['String']['input']>;
  zoneUuid: Scalars['String']['input'];
}

export interface CreateBaremetalInstanceBondConfig {
  ip?: InputMaybe<Scalars['String']['input']>;
  l3NetworkUuid: Scalars['String']['input'];
  mode: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  slaves: Array<Scalars['String']['input']>;
}

export interface CreateBaremetalInstanceCustomConfig {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
}

export interface CreateBaremetalInstanceInput {
  action: ActionInput;
  payload: Array<CreateBaremetalInstancePayload>;
}

export interface CreateBaremetalInstanceNicConfig {
  ip?: InputMaybe<Scalars['String']['input']>;
  l3NetworkUuid: Scalars['String']['input'];
  mac: Scalars['String']['input'];
}

export interface CreateBaremetalInstancePayload {
  bondingCfgs?: InputMaybe<Array<CreateBaremetalInstanceBondConfig>>;
  chassisUuid: Scalars['String']['input'];
  customConfigurations?: InputMaybe<Array<CreateBaremetalInstanceCustomConfig>>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUuid: Scalars['String']['input'];
  name: Scalars['String']['input'];
  nicCfgs?: InputMaybe<Array<CreateBaremetalInstanceNicConfig>>;
  password: Scalars['String']['input'];
  platform?: InputMaybe<Scalars['String']['input']>;
  resourceUuid: Scalars['String']['input'];
  strategy?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  templateUuid?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateBlockPrimaryStorageInput {
  action: ActionInput;
  payload: CreateBlockPrimaryStoragePayload;
}

export interface CreateBlockPrimaryStoragePayload {
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  encryptGatewayIp?: InputMaybe<Scalars['String']['input']>;
  encryptGatewayPassword?: InputMaybe<Scalars['String']['input']>;
  encryptGatewayPort?: InputMaybe<Scalars['Int']['input']>;
  encryptGatewayUsername?: InputMaybe<Scalars['String']['input']>;
  metadata: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  url: Scalars['String']['input'];
  vendorName: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}

export interface CreateBondInput {
  action: ActionInput;
  payload: Array<CreateBondPayload>;
}

export interface CreateBondPayload {
  bondingName: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  gateway?: InputMaybe<Scalars['String']['input']>;
  hostUuids: Array<Scalars['String']['input']>;
  ipAddress?: InputMaybe<Scalars['String']['input']>;
  mode?: InputMaybe<Scalars['String']['input']>;
  netmask?: InputMaybe<Scalars['String']['input']>;
  slaveNames?: InputMaybe<Array<Scalars['String']['input']>>;
  slaveUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Scalars['String']['input']>;
  xmitHashPolicy?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateCephPrimaryStorageInput {
  action: ActionInput;
  payload: CreateCephPrimaryStoragePayload;
}

export interface CreateCephPrimaryStoragePayload {
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  dataVolumePoolName?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageCachePoolName?: InputMaybe<Scalars['String']['input']>;
  monUrls: Array<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  rootVolumePoolName?: InputMaybe<Scalars['String']['input']>;
  /** 存储网络 | 关闭 Cephx */
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Scalars['String']['input']>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateClusterDRSInput {
  action: ActionInput;
  payload: CreateClusterDRSPayload;
}

export interface CreateClusterDRSPayload {
  automationLevel: Scalars['String']['input'];
  clusterUuid: Scalars['String']['input'];
  defaultEnable?: InputMaybe<Scalars['Boolean']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  resourceConfigList?: InputMaybe<Array<ClusterResourceConfig>>;
  thresholdDuration: Scalars['Int']['input'];
  thresholds: Array<ThresholdsInput>;
}

export interface CreateClusterInput {
  action: ActionInput;
  payload: CreateClusterPayload;
}

export interface CreateClusterInven {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  hypervisorType?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  state?: Maybe<ClusterState>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface CreateClusterPayload {
  /** CPU架构 */
  architecture?: InputMaybe<Scalars['String']['input']>;
  automationLevel?: InputMaybe<Scalars['String']['input']>;
  checkCpuModel?: InputMaybe<Scalars['String']['input']>;
  cpuMode?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  displayNetworkCidr?: InputMaybe<Scalars['String']['input']>;
  drsConfig?: InputMaybe<DrsConfig>;
  globalConfigList?: InputMaybe<Array<UpdateGlobalConfigPayload>>;
  hypervisorType: Scalars['String']['input'];
  /** 创建弹性裸金属集群需要挂载的IscsiServer */
  iscsiServerUuid?: InputMaybe<Scalars['String']['input']>;
  /** 创建弹性裸金属集群需要挂载的二层网络 */
  l2NetworkUuid?: InputMaybe<Scalars['String']['input']>;
  migrateNetworkCidr?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  /** 网络加速 */
  networkHp?: InputMaybe<Scalars['Boolean']['input']>;
  /** 创建弹性裸金属集群需要挂载的主存储 */
  primaryStorageUuid?: InputMaybe<Scalars['String']['input']>;
  /** 创建弹性裸金属集群需要的部署网络 */
  provisionNetworkUuid?: InputMaybe<Scalars['String']['input']>;
  resourceConfigList?: InputMaybe<Array<ClusterResourceConfig>>;
  type?: InputMaybe<Scalars['String']['input']>;
  zoneUuid: Scalars['String']['input'];
}

export interface CreateDataVolumeFromVolumeTemplateInput {
  action: ActionInput;
  payload: CreateDataVolumeFromVolumeTemplatePayload;
}

export interface CreateDataVolumeFromVolumeTemplatePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  imageUuid: Scalars['String']['input'];
  name: Scalars['String']['input'];
  primaryStorageUuid: Scalars['String']['input'];
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  tagUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  vmInstanceUuids?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface CreateDataVolumeInEditVmPayload {
  aio?: InputMaybe<Scalars['String']['input']>;
  cacheMode?: InputMaybe<Scalars['String']['input']>;
  diskSize?: InputMaybe<Scalars['Float']['input']>;
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  imageUuid?: InputMaybe<Scalars['String']['input']>;
  index: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  primaryStorageUuid?: InputMaybe<Scalars['String']['input']>;
  readBandwidth?: InputMaybe<Scalars['Int']['input']>;
  readIOPS?: InputMaybe<Scalars['Int']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  totalBandwidth?: InputMaybe<Scalars['Int']['input']>;
  totalIOPS?: InputMaybe<Scalars['Int']['input']>;
  vmInstanceUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  writeBandwidth?: InputMaybe<Scalars['Int']['input']>;
  writeIOPS?: InputMaybe<Scalars['Int']['input']>;
}

export interface CreateDataVolumeInput {
  action: ActionInput;
  payload: CreateDataVolumePayload;
}

export interface CreateDataVolumePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  diskOfferingUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  diskSize?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  primaryStorageUuid?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  tagUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  total?: InputMaybe<Scalars['Int']['input']>;
  vmInstanceUuids?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface CreateDingTalkEndpointInput {
  action: ActionInput;
  payload: Array<CreateDingTalkEndpointPayload>;
}

export interface CreateDingTalkEndpointPayload {
  atAll?: InputMaybe<Scalars['Boolean']['input']>;
  /** JSON字符串格式: "{176729282: 李四}", key 为手机号，value为备注 */
  atPersonList?: InputMaybe<Scalars['String']['input']>;
  /** 指定用户手机号, 兼容以前的sdk，所以留着 */
  atPersonPhoneNumbers?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  /** 密钥, 填空字符串表示 安全设置为：无 */
  secret: Scalars['String']['input'];
  url: Scalars['String']['input'];
}

export interface CreateEmailEndpointInput {
  action: ActionInput;
  payload: Array<CreateEmailEndpointPayload>;
}

export interface CreateEmailEndpointPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emails?: InputMaybe<Array<Scalars['String']['input']>>;
  locale?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  platformUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateExternalPrimaryStorageInput {
  action: ActionInput;
  payload: CreateExternalPrimaryStoragePayload;
}

export interface CreateExternalPrimaryStoragePayload {
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  /** 配置项，比如："{ pools: [pool1, pool2] }" */
  config: Scalars['String']['input'];
  /** 外部主存储的协议，比如：Vhost */
  defaultOutputProtocol: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  /** 厂商名 */
  identity: Scalars['String']['input'];
  name: Scalars['String']['input'];
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  tagUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  /** 值为 Addon 时统一表示外部存储，配合 defaultOutputProtocol 的值确定具体存储类型 */
  type?: InputMaybe<Scalars['String']['input']>;
  /** cbd类型的ps不从ui传递url，由后端返回 */
  url?: InputMaybe<Scalars['String']['input']>;
  userTags?: InputMaybe<Array<Scalars['String']['input']>>;
  zoneUuid: Scalars['String']['input'];
}

export interface CreateFeiShuEndpointInput {
  action: ActionInput;
  payload: Array<CreateFeiShuEndpointPayload>;
}

export interface CreateFeiShuEndpointPayload {
  /** 是否指定所有人 */
  atAll?: InputMaybe<Scalars['Boolean']['input']>;
  /** JSON字符串格式: "{176729282: 李四}", key 为手机号，value为备注 */
  atPersonList?: InputMaybe<Scalars['String']['input']>;
  /** 指定用户的id, 兼容以前的sdk，所以留着 */
  atPersonUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  /** 密钥, 填空字符串表示 安全设置为：无 */
  secret: Scalars['String']['input'];
  /** 地址 */
  url: Scalars['String']['input'];
}

export interface CreateHostGroupInput {
  action: ActionInput;
  payload: CreateHostGroupPayload;
}

export interface CreateHostGroupPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  hostUuids: Array<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}

export interface CreateHostKernelInterfaceInput {
  action: ActionInput;
  payload: CreateHostKernelInterfacePayload;
}

export interface CreateHostKernelInterfacePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  hostUuid: Scalars['String']['input'];
  l3NetworkUuid: Scalars['String']['input'];
  name: Scalars['String']['input'];
  netmask?: InputMaybe<Scalars['String']['input']>;
  requiredIp?: InputMaybe<Scalars['String']['input']>;
  trafficTypes?: Array<KernelTrafficTypes>;
}

export interface CreateHttpEndpointInput {
  action: ActionInput;
  payload: Array<CreateHttpEndpointPayload>;
}

export interface CreateHttpEndpointPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
  username?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateInstanceFromOvfInput {
  action: ActionInput;
  payload: CreateInstanceFromOvfPayload;
}

export interface CreateInstanceFromOvfPayload {
  backupStorageUuid: Scalars['String']['input'];
  jsonCreateVmParam: CreateInstancePayload;
  xmlBase64: Scalars['String']['input'];
}

export interface CreateInstanceInput {
  action: ActionInput;
  payload: CreateInstancePayload;
}

export interface CreateInstancePayload {
  DiskAOs?: InputMaybe<Array<DiskAO>>;
  advancedConfigGuestToolTimeSync?: InputMaybe<Scalars['Boolean']['input']>;
  affinityGroupUuid?: InputMaybe<Scalars['String']['input']>;
  aio?: InputMaybe<Scalars['Boolean']['input']>;
  allocationType?: InputMaybe<Scalars['String']['input']>;
  antiSpoofing?: InputMaybe<Scalars['Boolean']['input']>;
  architecture?: InputMaybe<Scalars['String']['input']>;
  autoReleaseGpuDevice?: InputMaybe<Scalars['Boolean']['input']>;
  biosTimeSync?: Scalars['Boolean']['input'];
  bootMenuSplashTimeout?: InputMaybe<Scalars['String']['input']>;
  bootMode?: InputMaybe<Scalars['String']['input']>;
  bootOrders?: InputMaybe<Array<Scalars['String']['input']>>;
  busType?: InputMaybe<Scalars['String']['input']>;
  cacheMode?: InputMaybe<Scalars['String']['input']>;
  cdromList?: Array<ZSVCdrom>;
  clockTrack?: InputMaybe<Scalars['String']['input']>;
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  consoleMode?: InputMaybe<Scalars['String']['input']>;
  consolePassword?: InputMaybe<Scalars['String']['input']>;
  count?: Scalars['Int']['input'];
  cpuBindListByVCpu?: Array<ZSVCpuBindListByVCpuItem>;
  cpuBindType?: Scalars['String']['input'];
  cpuHideKVMMark?: InputMaybe<Scalars['String']['input']>;
  cpuMode?: InputMaybe<Scalars['String']['input']>;
  cpuNum?: InputMaybe<Scalars['Int']['input']>;
  cpuQuota?: InputMaybe<Scalars['Float']['input']>;
  cpuResourceLevel?: InputMaybe<Scalars['String']['input']>;
  dataDiskOfferingUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  dataDiskSizes?: InputMaybe<Array<Scalars['Float']['input']>>;
  dataPoolName?: InputMaybe<Scalars['String']['input']>;
  dataPrimaryStorageUuid?: InputMaybe<Scalars['String']['input']>;
  dataVolumeSystemTagsOnIndex?: InputMaybe<Scalars['String']['input']>;
  dataVolumeTemplateUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  defaultL3NetworkUuid: Scalars['String']['input'];
  description?: Scalars['String']['input'];
  devices?: InputMaybe<VmDevicesConfig>;
  diskBandWidth?: InputMaybe<Scalars['Float']['input']>;
  diskIops?: InputMaybe<Scalars['Float']['input']>;
  diskSharable?: InputMaybe<Scalars['Boolean']['input']>;
  emulateHyperV?: InputMaybe<Scalars['String']['input']>;
  emulatorPinning?: InputMaybe<Scalars['String']['input']>;
  faultStrategy?: InputMaybe<Scalars['String']['input']>;
  gpuDeviceUuidList?: Array<Scalars['String']['input']>;
  gpuType?: InputMaybe<Scalars['String']['input']>;
  group?: InputMaybe<Scalars['String']['input']>;
  guestOsType?: InputMaybe<Scalars['String']['input']>;
  ha?: InputMaybe<Scalars['String']['input']>;
  haStickStragedy?: InputMaybe<Scalars['String']['input']>;
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  hostname?: InputMaybe<Scalars['String']['input']>;
  hotPlug?: InputMaybe<Scalars['Boolean']['input']>;
  hotPlugEnabled?: InputMaybe<Scalars['String']['input']>;
  imageUuid?: InputMaybe<Scalars['String']['input']>;
  instanceOfferingUuid?: InputMaybe<Scalars['String']['input']>;
  l3NetworkUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  memoryResourceLevel?: InputMaybe<Scalars['String']['input']>;
  memorySize?: InputMaybe<Scalars['Float']['input']>;
  migrateAutoConverge?: InputMaybe<Scalars['String']['input']>;
  motherboardType?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  networkInboundBandwidth?: InputMaybe<Scalars['Float']['input']>;
  networkOutboundBandwidth?: InputMaybe<Scalars['Float']['input']>;
  pcieDeviceList?: Array<Scalars['String']['input']>;
  platform?: InputMaybe<Scalars['String']['input']>;
  removeHaStickStragedyPayload?: InputMaybe<RemoveHaStickStragedyPayload>;
  rootDiskOfferingUuid?: InputMaybe<Scalars['String']['input']>;
  rootDiskSize?: InputMaybe<Scalars['Float']['input']>;
  rootPassword?: InputMaybe<Scalars['String']['input']>;
  rootPoolName?: InputMaybe<Scalars['String']['input']>;
  rootPrimaryStorageUuid?: InputMaybe<Scalars['String']['input']>;
  rootUsername?: InputMaybe<Scalars['String']['input']>;
  rootVolumeSystemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  se?: Scalars['Boolean']['input'];
  secureBoot?: InputMaybe<Scalars['Boolean']['input']>;
  setHaStickStragedyPayload?: InputMaybe<SetHaStickStragedyPayload>;
  setVmCleanTrafficPayload?: InputMaybe<SetVmCleanTrafficPayload>;
  setVmEmulatorPinPayload?: InputMaybe<SetVmEmulatorPinPayload>;
  sockedNum?: InputMaybe<Scalars['Int']['input']>;
  soundCard?: InputMaybe<Scalars['String']['input']>;
  spiceStreamingMode?: InputMaybe<Scalars['String']['input']>;
  sshkey?: InputMaybe<Scalars['String']['input']>;
  strategy?: InputMaybe<VmCreationStrategy>;
  tagUuids?: Array<Scalars['String']['input']>;
  thinProvisionForDataPrimaryStorage?: InputMaybe<VolumeProvisioningStrategy>;
  thinProvisionForPrimaryStorage?: InputMaybe<VolumeProvisioningStrategy>;
  thinProvisionForRootPrimaryStorage?: InputMaybe<VolumeProvisioningStrategy>;
  totalGPUMemory?: InputMaybe<Scalars['Float']['input']>;
  updateResourceConfigPayload?: InputMaybe<Array<UpdateResourceConfigPayload>>;
  usbRedirect?: InputMaybe<Scalars['Boolean']['input']>;
  userData?: InputMaybe<Scalars['String']['input']>;
  vdiMonitorNumber?: InputMaybe<Scalars['Int']['input']>;
  vgpuDevice?: InputMaybe<VGpuDeviceInVmCreate>;
  virtio?: InputMaybe<Scalars['Boolean']['input']>;
  virtioSCSI?: InputMaybe<Scalars['Boolean']['input']>;
  vmCpuHypervisorFeature?: InputMaybe<Scalars['String']['input']>;
  vmCpuIdVendor?: InputMaybe<Scalars['String']['input']>;
  vmGroupUuid?: InputMaybe<Scalars['String']['input']>;
  vmNicConfig?: InputMaybe<Array<ZSVNicConfig>>;
  vmNicParams?: InputMaybe<Scalars['String']['input']>;
  vmPortOff?: InputMaybe<Scalars['String']['input']>;
  vmUSBConfig?: InputMaybe<Array<ZSVUSBConfig>>;
  vnumaEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateKmsParam {
  endpoint: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  port: Scalars['Int']['input'];
  username?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateKmsProviderInput {
  action: ActionInput;
  payload: CreateKmsProviderPayload;
}

export interface CreateKmsProviderPayload {
  createKmsParam?: InputMaybe<CreateKmsParam>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
}

export interface CreateL2NetworkActionInput {
  action: ActionInput;
  payload: CreateL2NetworkInput;
}

export interface CreateL2NetworkInput {
  attachL2NetworkToClusterHostParams?: InputMaybe<Array<AttachL2NetworkToClusterHostParams>>;
  cidr?: InputMaybe<Scalars['String']['input']>;
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  clusterUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  createBondPayloads?: InputMaybe<Array<CreateBondPayload>>;
  description?: InputMaybe<Scalars['String']['input']>;
  endVni?: InputMaybe<Scalars['Int']['input']>;
  l2NetworkUuid?: InputMaybe<Scalars['String']['input']>;
  l3netowrkParam?: InputMaybe<CreateL3NetworkInputParam>;
  name: Scalars['String']['input'];
  physicalInterface?: InputMaybe<Scalars['String']['input']>;
  poolUuid?: InputMaybe<Scalars['String']['input']>;
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  startVni?: InputMaybe<Scalars['Int']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<l2NetworkType>;
  userTags?: InputMaybe<Array<Scalars['String']['input']>>;
  vSwitchType?: InputMaybe<Scalars['String']['input']>;
  vlan?: InputMaybe<Scalars['Int']['input']>;
  vni?: InputMaybe<Scalars['Int']['input']>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateL3NetworkInput {
  action: ActionInput;
  payload: CreateL3NetworkInputParam;
}

export interface CreateL3NetworkInputParam {
  addressMode?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  /** DHCP服务IP */
  dhcpIp?: InputMaybe<Scalars['String']['input']>;
  /** DHCP服务是否开启 */
  dhcpService?: InputMaybe<Scalars['Boolean']['input']>;
  dns?: InputMaybe<Scalars['String']['input']>;
  dnsDomain?: InputMaybe<Scalars['String']['input']>;
  enableIPAM?: InputMaybe<Scalars['Boolean']['input']>;
  endIp?: InputMaybe<Scalars['String']['input']>;
  gateway?: InputMaybe<Scalars['String']['input']>;
  hideDns?: InputMaybe<Scalars['Boolean']['input']>;
  ipAllocateStrategy?: InputMaybe<Scalars['String']['input']>;
  ipRangeType?: InputMaybe<Scalars['String']['input']>;
  ipVersion?: InputMaybe<Scalars['Int']['input']>;
  l2NetworkUuid: Scalars['String']['input'];
  name: Scalars['String']['input'];
  netmask?: InputMaybe<Scalars['String']['input']>;
  networkCidr?: InputMaybe<Scalars['String']['input']>;
  prefixLen?: InputMaybe<Scalars['Int']['input']>;
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  routerInterfaceIp?: InputMaybe<Scalars['String']['input']>;
  /** 用于区别创建时的类型，判断应该挂载哪些网络服务 */
  showNetworkServiceType?: InputMaybe<Scalars['String']['input']>;
  startIp?: InputMaybe<Scalars['String']['input']>;
  system?: InputMaybe<Scalars['Boolean']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  tagUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Scalars['String']['input']>;
  userTags?: InputMaybe<Array<Scalars['String']['input']>>;
  virtualRouterOfferingUuid?: InputMaybe<Scalars['String']['input']>;
  /** 分布式端口组创建时使用，用于CreateL2PortGroup */
  vlan?: InputMaybe<Scalars['Float']['input']>;
  vlanMode?: InputMaybe<PortGroupVlanMode>;
  vpcVRouterUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateLocalPrimaryStorageInput {
  action: ActionInput;
  payload: CreateLocalPrimaryStorageInputPayload;
}

export interface CreateLocalPrimaryStorageInputPayload {
  blockDevicePaths?: InputMaybe<Array<Scalars['String']['input']>>;
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  hostUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}

export interface CreateLogCollectInput {
  action: ActionInput;
  payload: CreateLogCollectPayload;
}

export interface CreateLogCollectPayload {
  directDownload?: InputMaybe<Scalars['Boolean']['input']>;
  endTime?: InputMaybe<Scalars['Float']['input']>;
  offsetTime?: InputMaybe<OffsetTime>;
  startTime?: InputMaybe<Scalars['Float']['input']>;
  /** mn,mn_db,host,bs,ps 通过ctl获取，operation,audit通过sql查询 */
  type: Array<Scalars['String']['input']>;
}

export interface CreateLogServerInput {
  action: ActionInput;
  payload: CreateLogServerPayload;
}

export interface CreateLogServerPayload {
  category: Scalars['String']['input'];
  configuration: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  level: Scalars['String']['input'];
  name: Scalars['String']['input'];
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  type: Scalars['String']['input'];
}

export interface CreateMonitorGroupInput {
  action: ActionInput;
  payload: CreateMonitorGroupPayload;
}

export interface CreateMonitorGroupPayload {
  actions?: InputMaybe<Array<GroupActionsInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  instanceUuids: Array<Scalars['String']['input']>;
  monitorTemplate?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  zwatchEndpoint?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateNFSPrimaryStorageInput {
  action: ActionInput;
  payload: CreateNFSPrimaryStoragePayload;
}

export interface CreateNFSPrimaryStoragePayload {
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  /** 存储网络 | 挂载参数 */
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreatePSSystemTagInput {
  action: ActionInput;
  payload: CreatePSSystemTagPayload;
}

export interface CreatePSSystemTagPayload {
  resourceType: Scalars['String']['input'];
  resourceUuid: Scalars['String']['input'];
  tag: Scalars['String']['input'];
}

export interface CreateResourceAttributeConstraintPayload {
  parameter: Scalars['String']['input'];
  type: Scalars['String']['input'];
}

export interface CreateResourceAttributeKeyInput {
  action: ActionInput;
  payload: CreateResourceAttributeKeyPayload;
}

export interface CreateResourceAttributeKeyPayload {
  constraints?: InputMaybe<Array<CreateResourceAttributeConstraintPayload>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  resourceTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateResourceAttributeValuePayload {
  keyUuid: Scalars['String']['input'];
  resourceUuids: Array<Scalars['String']['input']>;
  value: Scalars['String']['input'];
}

export interface CreateResourceBackupJobInput {
  action: ActionInput;
  payload: CreateResourceBackupJobPayload;
}

export interface CreateResourceBackupJobPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  fullTriggerList?: InputMaybe<Array<ResourceSchedulerTrigger>>;
  name: Scalars['String']['input'];
  parameters?: InputMaybe<Parameters>;
  priorities?: InputMaybe<Array<Priority>>;
  targetResourceUuids: Array<Scalars['String']['input']>;
  triggerList: Array<ResourceSchedulerTrigger>;
  triggerNow?: InputMaybe<Scalars['Boolean']['input']>;
  type: SchedulerJobType;
}

export interface CreateRoleInput {
  action: ActionInput;
  payload: CreateRolePayload;
}

export interface CreateRolePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  policies?: InputMaybe<Array<ZsvRolePoliciesInput>>;
  uiPrivilege?: InputMaybe<Array<ZsvRoleUIPrivilegeInput>>;
}

export interface CreateSNSEmailPlatformInput {
  action: ActionInput;
  payload: CreateSNSEmailPlatformPayload;
}

export interface CreateSNSEmailPlatformPayload {
  configuration?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  encryptType?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  smtpPort: Scalars['Int']['input'];
  smtpServer: Scalars['String']['input'];
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  username?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateSNSMicrosoftTeamsEndpointInput {
  action: ActionInput;
  payload: Array<CreateSNSMicrosoftTeamsEndpointPayload>;
}

export interface CreateSNSMicrosoftTeamsEndpointPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  url: Scalars['String']['input'];
}

export interface CreateSNSTextTemplateInput {
  action: ActionInput;
  payload: CreateSNSTextTemplatePayload;
}

export interface CreateSNSTextTemplatePayload {
  applicationPlatformType: Scalars['String']['input'];
  defaultTemplate?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  recoverySubject?: InputMaybe<Scalars['String']['input']>;
  recoveryTemplate?: InputMaybe<Scalars['String']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  template: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateScriptInput {
  action: ActionInput;
  payload: Array<CreateScriptPayload>;
}

export interface CreateScriptPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  encodingType?: ScriptEncodingType;
  name: Scalars['String']['input'];
  platform: ImagePlatform;
  renderParams?: InputMaybe<Scalars['String']['input']>;
  scriptContent: Scalars['String']['input'];
  scriptTimeout?: InputMaybe<Scalars['Float']['input']>;
  scriptType: Scalars['String']['input'];
}

export interface CreateSecurityGroupInput {
  action: ActionInput;
  payload: CreateSecurityGroupPayload;
}

export interface CreateSecurityGroupPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  l3NetworkUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  rules?: InputMaybe<Array<AddRuleParam>>;
  vmNicUuids?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface CreateSharedBlockGroupPrimaryStorageInput {
  action: ActionInput;
  payload: CreateSharedBlockGroupPrimaryStoragePayload;
}

export interface CreateSharedBlockGroupPrimaryStoragePayload {
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  diskUuids: Array<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** 资源UUID（保留UUID模式时传入vg name，重置UUID模式时不传） */
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  /** 存储网络 | 厚置备 | 清理块设备 */
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Scalars['String']['input']>;
  zoneUuid: Scalars['String']['input'];
}

export interface CreateSharedMountPointPrimaryStorageInput {
  action: ActionInput;
  payload: CreateSharedMountPointPrimaryStorageInputParam;
}

export interface CreateSharedMountPointPrimaryStorageInputParam {
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  /** 存储网络 | 挂载参数 */
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateSnapshotStrategyInput {
  action: ActionInput;
  payload: CreateSnapshotStrategyPayload;
}

export interface CreateSnapshotStrategyPayload {
  cron: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  rootVolumeUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  snapshotGroupMaxNumber: Scalars['Int']['input'];
  startTime: Scalars['Int']['input'];
}

export interface CreateSnmpAgentInput {
  action: ActionInput;
  payload: CreateSnmpAgentPayload;
}

export interface CreateSnmpAgentPayload {
  authAlgorithm?: InputMaybe<Scalars['String']['input']>;
  authPassword?: InputMaybe<Scalars['String']['input']>;
  port: Scalars['Int']['input'];
  privacyAlgorithm?: InputMaybe<Scalars['String']['input']>;
  privacyPassword?: InputMaybe<Scalars['String']['input']>;
  readCommunity?: InputMaybe<Scalars['String']['input']>;
  trapList?: InputMaybe<Array<TrapParam>>;
  userName?: InputMaybe<Scalars['String']['input']>;
  version: Scalars['String']['input'];
}

export interface CreateSnmpTrapEndpointInput {
  action: ActionInput;
  payload: CreateSnmpTrapEndpointPayload;
}

export interface CreateSnmpTrapEndpointPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  platformUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateSnmpTrapReceiverInput {
  action: ActionInput;
  payload: Array<CreateSnmpTrapReceiverPayload>;
}

export interface CreateSnmpTrapReceiverPayload {
  name: Scalars['String']['input'];
  snmpAddress: Scalars['String']['input'];
  snmpPort: Scalars['Int']['input'];
}

export interface CreateTagInput {
  action: ActionInput;
  payload: CreateTagPayload;
}

export interface CreateTagPayload {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  value: Scalars['String']['input'];
}

export interface CreateUserGroupInput {
  action: ActionInput;
  payload: CreateUserGroupPayload;
}

export interface CreateUserGroupPayload {
  accountUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  resourceUuids?: InputMaybe<Array<Array<Scalars['String']['input']>>>;
  roleUuids?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface CreateVMFromTemplateInput {
  action: ActionInput;
  payload: CreateVMFromTemplatePayload;
}

export interface CreateVMFromTemplatePayload {
  architecture?: InputMaybe<Scalars['String']['input']>;
  bootMode?: InputMaybe<Scalars['String']['input']>;
  cdromList?: Array<ZSVCdrom>;
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  count: Scalars['Int']['input'];
  cpuBindListByVCpu?: Array<ZSVCpuBindListByVCpuItem>;
  cpuBindType?: Scalars['String']['input'];
  cpuHideKVMMark?: InputMaybe<Scalars['String']['input']>;
  cpuMode?: InputMaybe<Scalars['String']['input']>;
  cpuNum?: InputMaybe<Scalars['Int']['input']>;
  cpuQuota?: InputMaybe<Scalars['Float']['input']>;
  cpuResourceLevel?: InputMaybe<Scalars['String']['input']>;
  defaultL3NetworkUuid?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  diskAOs?: InputMaybe<Array<DiskAO>>;
  emulatorPinning?: InputMaybe<Scalars['String']['input']>;
  gpuDeviceUuidList?: Array<Scalars['String']['input']>;
  gpuType?: InputMaybe<Scalars['String']['input']>;
  group?: Scalars['String']['input'];
  guestOsType?: InputMaybe<Scalars['String']['input']>;
  ha?: InputMaybe<Scalars['String']['input']>;
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  hostname?: InputMaybe<Scalars['String']['input']>;
  hotPlug?: InputMaybe<Scalars['Boolean']['input']>;
  l3NetworkUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  memoryResourceLevel?: InputMaybe<Scalars['String']['input']>;
  memorySize?: InputMaybe<Scalars['Float']['input']>;
  motherboardType?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  pcieDeviceList?: Array<Scalars['String']['input']>;
  platform?: InputMaybe<ImagePlatform>;
  resetTpm?: InputMaybe<Scalars['Boolean']['input']>;
  sockedNum?: InputMaybe<Scalars['Int']['input']>;
  soundCard?: InputMaybe<Scalars['String']['input']>;
  strategy?: InputMaybe<VmCreationStrategy>;
  tagUuids?: Array<Scalars['String']['input']>;
  templatedVmInstanceUuid: Scalars['String']['input'];
  totalGPUMemory?: InputMaybe<Scalars['Float']['input']>;
  usbRedirect?: InputMaybe<Scalars['Boolean']['input']>;
  vgpuDevice?: InputMaybe<VGpuDeviceInVmCreate>;
  virtio?: InputMaybe<Scalars['Boolean']['input']>;
  vmCustomSpecification?: InputMaybe<VmCustomSpecificationParam>;
  vmGroupUuid?: InputMaybe<Scalars['String']['input']>;
  vmNicConfig?: InputMaybe<Array<ZSVNicConfig>>;
  vmNicParams?: InputMaybe<Scalars['String']['input']>;
  vmUSBConfig?: InputMaybe<Array<ZSVUSBConfig>>;
  vnumaEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateVMFromZSVSnapshotInput {
  action: ActionInput;
  payload: CreateVMFromZSVSnapshotPayload;
}

export interface CreateVMFromZSVSnapshotPayload {
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  cpuNum?: InputMaybe<Scalars['Int']['input']>;
  dataVolumeSystemTags?: InputMaybe<Scalars['String']['input']>;
  defaultL3NetworkUuid?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  l3NetworkUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  memorySize?: InputMaybe<Scalars['Float']['input']>;
  motherboardType?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  primaryStorageUuidForRootVolume?: InputMaybe<Scalars['String']['input']>;
  /** 内存预留大小 */
  reservedMemorySize?: InputMaybe<Scalars['Float']['input']>;
  resetTpm?: InputMaybe<Scalars['Boolean']['input']>;
  rootVolumeSystemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  securityGroupUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  strategy?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  vmNicParams?: InputMaybe<Scalars['String']['input']>;
  volumeSnapshotGroupUuid: Scalars['String']['input'];
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateVmCdRomInput {
  action: ActionInput;
  payload: Array<CreateVmCdRomPayload>;
}

export interface CreateVmCdRomPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  isoUuid?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  vmInstanceUuid: Scalars['String']['input'];
}

export interface CreateVmCustomSpecificationInput {
  action: ActionInput;
  payload: CreateVmCustomSpecificationPayload;
}

export interface CreateVmCustomSpecificationPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  domainMode?: InputMaybe<DomainMode>;
  domainName?: InputMaybe<Scalars['String']['input']>;
  domainPassword?: InputMaybe<Scalars['String']['input']>;
  domainUsername?: InputMaybe<Scalars['String']['input']>;
  generateSID?: InputMaybe<Scalars['Boolean']['input']>;
  hostname?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  organization?: InputMaybe<Scalars['String']['input']>;
  platform: VmSpecPlatform;
  rootPassword?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateVmGroupInput {
  action: ActionInput;
  payload: CreateVmGroupPayload;
}

export interface CreateVmGroupPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  vmUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  zoneUuid: Scalars['String']['input'];
}

export interface CreateVmSchedulingRuleInput {
  action: ActionInput;
  payload: CreateVmSchedulingRulePayload;
}

export interface CreateVmSchedulingRulePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  hostGroupName?: InputMaybe<Scalars['String']['input']>;
  hostGroupUuid?: InputMaybe<Scalars['String']['input']>;
  hostUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  mode: Scalars['String']['input'];
  name: Scalars['String']['input'];
  rule: Scalars['String']['input'];
  vmGroupName?: InputMaybe<Scalars['String']['input']>;
  vmGroupUuid?: InputMaybe<Scalars['String']['input']>;
  vmUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  zoneUuid: Scalars['String']['input'];
}

export interface CreateVolumeSnapshotInput {
  action: ActionInput;
  payload: CreateVolumeSnapshotPayload;
}

export interface CreateVolumeSnapshotPayload {
  /** 描述 */
  description?: InputMaybe<Scalars['String']['input']>;
  /** 快照名 */
  name: Scalars['String']['input'];
  type: SnapshotType;
  /** uuid */
  volumeUuid?: InputMaybe<Scalars['String']['input']>;
  withMemory?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface CreateVolumeTemplateInput {
  action: ActionInput;
  payload: CreateVolumeTemplateInputParam;
}

export interface CreateVolumeTemplateInputParam {
  backupStorageUuids: Array<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  guestOsType?: InputMaybe<Scalars['String']['input']>;
  isSystem?: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  platform?: InputMaybe<ImagePlatform>;
  vmUuid?: InputMaybe<Scalars['String']['input']>;
  volumeUuid: Scalars['String']['input'];
}

export interface CreateWeComEndpointInput {
  action: ActionInput;
  payload: Array<CreateWeComEndpointPayload>;
}

export interface CreateWeComEndpointPayload {
  /** 是否指定所有人 */
  atAll?: InputMaybe<Scalars['Boolean']['input']>;
  /** JSON字符串格式: "{176729282: 李四}", key 为手机号，value为备注 */
  atPersonList?: InputMaybe<Scalars['String']['input']>;
  /** 指定用户的id, 兼容以前的sdk，所以留着 */
  atPersonUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  /** 地址 */
  url: Scalars['String']['input'];
}

export interface CreateXmlHookInput {
  action: ActionInput;
  payload: CreateXmlHookPayload;
}

export interface CreateXmlHookPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  hookScript: Scalars['String']['input'];
  name: Scalars['String']['input'];
}

export interface CreateZSVBackupStorageInput {
  action: ActionInput;
  payload: CreateZSVBackupStoragePayload;
}

export interface CreateZSVBackupStoragePayload {
  addMethod?: InputMaybe<Scalars['String']['input']>;
  blockDevicePath?: InputMaybe<Scalars['String']['input']>;
  cidr?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  formatDisk?: InputMaybe<Scalars['Boolean']['input']>;
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  hostname?: InputMaybe<Scalars['String']['input']>;
  imageStoreUuid?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  scanBackup?: InputMaybe<Scalars['Boolean']['input']>;
  sshPort?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateZoneInput {
  action: ActionInput;
  payload: CreateZonePayload;
}

export interface CreateZonePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
}

export interface CrontabInspection {
  createTime?: Maybe<Scalars['Float']['output']>;
  /** 定时器 */
  cron?: Maybe<Scalars['String']['output']>;
  /** 当前执行任务 */
  currentSubTask?: Maybe<Scalars['String']['output']>;
  enable?: Maybe<Scalars['Boolean']['output']>;
  /** 结束时间 */
  endTime?: Maybe<Scalars['Float']['output']>;
  /** 异常任务数 */
  error?: Maybe<Scalars['Float']['output']>;
  /** 总分 */
  grade?: Maybe<Scalars['Float']['output']>;
  /** 子任务 */
  itemTree?: Maybe<Array<InspectionItemTree>>;
  nextExecTime?: Maybe<Scalars['Float']['output']>;
  /** 正常任务数 */
  normal?: Maybe<Scalars['Float']['output']>;
  /** 进度 */
  progress?: Maybe<Scalars['Float']['output']>;
  /** 用时 */
  runTime?: Maybe<Scalars['Float']['output']>;
  /** 开始时间 */
  startTime?: Maybe<Scalars['Float']['output']>;
  statUuid?: Maybe<Scalars['String']['output']>;
  /** 状态 */
  state?: Maybe<InspectionTaskState>;
  taskUuid?: Maybe<Scalars['String']['output']>;
  /** 总任务数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface CurrentConfigure {
  currentPath?: Maybe<Scalars['String']['output']>;
  isDefault: Scalars['Boolean']['output'];
}

export interface CurrentTime {
  MillionSeconds: Scalars['Float']['output'];
  Seconds: Scalars['Float']['output'];
}

export interface CustomAction {
  actionId: Scalars['String']['output'];
  jobResult?: Maybe<Scalars['String']['output']>;
  transit?: Maybe<Scalars['String']['output']>;
}

export interface CustomColumnsConfig {
  customColumnConfig?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
}

export interface DRS {
  automationLevel?: Maybe<Scalars['String']['output']>;
  balancedState?: Maybe<Scalars['String']['output']>;
  cluster?: Maybe<Cluster>;
  clusterUuid?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  isSupported?: Maybe<Scalars['Boolean']['output']>;
  lastAdviceGroupUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  resourceConfigValue: ClusterResourceConfigValue;
  state?: Maybe<ClusterState>;
  thresholdDuration?: Maybe<Scalars['Int']['output']>;
  thresholds?: Maybe<Array<Thresholds>>;
  uuid: Scalars['String']['output'];
}

export interface DRSAdvice {
  adviceGropUuid?: Maybe<Scalars['String']['output']>;
  adviceUuid?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  drsUuid?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  lastAdviceGroupUuid?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vm?: Maybe<ClusterNameAndUuidForDRS>;
  vmSourceHost?: Maybe<HostNameAndUuidForDRSAdvice>;
  vmSourceHostUuid?: Maybe<Scalars['String']['output']>;
  vmTargetHost?: Maybe<HostNameAndUuidForDRSAdvice>;
  vmTargetHostUuid?: Maybe<Scalars['String']['output']>;
  vmUuid?: Maybe<Scalars['String']['output']>;
}

export interface DataInNetworkTopology {
  l3Netowrk?: Maybe<L3Network>;
  uuid?: Maybe<Scalars['String']['output']>;
  vm?: Maybe<VmInstance>;
}

export interface DataProtectionRelatedSummary {
  accessControlRuleCount: Scalars['Int']['output'];
  auditsCount: Scalars['Int']['output'];
  imageCount: Scalars['Int']['output'];
  importConfigCount: Scalars['Int']['output'];
  operationLogCount: Scalars['Int']['output'];
  passwordCount: Scalars['Int']['output'];
  rolePolicyStatementCount: Scalars['Int']['output'];
  rolePrivilegesCount: Scalars['Int']['output'];
  sensitiveDataCount: Scalars['Int']['output'];
  snapshotCount: Scalars['Int']['output'];
}

export enum DataSecurityPolicy {
  Copy = 'Copy',
  ErasureCode = 'ErasureCode'
}

export interface DefaultL3Network {
  ipVersion?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  networkType?: Maybe<L3NetworkType>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface DeleteAccessControlRuleInput {
  action: ActionInput;
  payload: Array<DeleteAccessControlRulePayload>;
}

export interface DeleteAccessControlRulePayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteAccessKeyInput {
  action: ActionInput;
  payload: Array<DeleteAccessKeyPayload>;
}

export interface DeleteAccessKeyPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteAccountInput {
  action: ActionInput;
  payload: Array<DeleteAccountPayload>;
}

export interface DeleteAccountPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteAccountThirdPartyAuthInput {
  action: ActionInput;
  payload: Array<DeleteAccountThirdPartyAuthPayload>;
}

export interface DeleteAccountThirdPartyAuthPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteBSSystemTagInput {
  action: ActionInput;
  payload: DeleteBSSystemTagPayload;
}

export interface DeleteBSSystemTagPayload {
  oldTag: Scalars['String']['input'];
  resourceUuid: Scalars['String']['input'];
}

export interface DeleteBackupDataListInput {
  action: ActionInput;
  payload: Array<DeleteBackupDataPayload>;
}

export interface DeleteBackupDataPayload {
  /** 源镜像服务器 UUIDs */
  backupStorageUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  backupType?: InputMaybe<BackupResourceType>;
  bsUuid?: InputMaybe<Scalars['String']['input']>;
  /** 根云盘 UUID */
  groupUuid?: InputMaybe<Scalars['String']['input']>;
  /** 后端默认为 false ，前端需要使用这个参数让默认处理依赖关系。 */
  handleDependency?: InputMaybe<Scalars['Boolean']['input']>;
  remote: Scalars['Boolean']['input'];
  /** 备份数据类型: Root | Data */
  type?: InputMaybe<Scalars['String']['input']>;
  /** 卷备份的UUID，和下面的groupUuid 2选1传过来 */
  uuid?: InputMaybe<Scalars['String']['input']>;
  whole: Scalars['Boolean']['input'];
}

export interface DeleteBackupStorageInput {
  action: ActionInput;
  payload: Array<DeleteBackupStoragePayload>;
}

export interface DeleteBackupStoragePayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteBaremetalChassisInput {
  action: ActionInput;
  payload: Array<DeleteBaremetalChassisPayload>;
}

export interface DeleteBaremetalChassisPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteBaremetalInstanceInput {
  action: ActionInput;
  payload: Array<DeleteBaremetalInstancePayload>;
}

export interface DeleteBaremetalInstancePayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteBaremetalPxeServerInput {
  action: ActionInput;
  payload: Array<DeleteBaremetalPxeServerPayload>;
}

export interface DeleteBaremetalPxeServerPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteBondInput {
  action: ActionInput;
  payload: Array<DeleteBondPayload>;
}

export interface DeleteBondPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteCbdMdsInput {
  action: ActionInput;
  payload: DeleteCbdMdsPayload;
}

export interface DeleteCbdMdsPayload {
  /** 要删除的MDS节点IP地址 */
  mdsAddrs: Array<Scalars['String']['input']>;
  /** 主存储UUID */
  uuid: Scalars['String']['input'];
}

export interface DeleteCdRomInput {
  action: ActionInput;
  payload: Array<DeleteCdRomPayload>;
}

export interface DeleteCdRomPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteCephMonListInput {
  action: ActionInput;
  payload: Array<DeleteCephMonPayload>;
}

export interface DeleteCephMonPayload {
  monHostnames: Array<Scalars['String']['input']>;
  type: CephMonType;
  uuid: Scalars['String']['input'];
}

export interface DeleteCephPrimaryStoragePoolListInput {
  action: ActionInput;
  payload: Array<DeleteCephPrimaryStoragePoolPayload>;
}

export interface DeleteCephPrimaryStoragePoolPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteClusterInput {
  action: ActionInput;
  payload: Array<DeleteClusterStatePayload>;
}

export interface DeleteClusterStatePayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteDataVolumeInput {
  action: ActionInput;
  payload: Array<DeleteDataVolumePayload>;
}

export interface DeleteDataVolumePayload {
  status?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface DeleteDatabaseBackupDataListInput {
  action: ActionInput;
  payload: Array<DeleteDatabaseBackupDataPayload>;
}

export interface DeleteDatabaseBackupDataPayload {
  backupStorageUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  bsUuid?: InputMaybe<Scalars['String']['input']>;
  remote?: InputMaybe<Scalars['Boolean']['input']>;
  uuid: Scalars['String']['input'];
}

export interface DeleteEmailAddressToEndpointInput {
  action: ActionInput;
  payload: Array<DeleteEmailAddressToEndpointPayload>;
}

export interface DeleteEmailAddressToEndpointPayload {
  emailAddress: Scalars['String']['input'];
  emailAddressUuid: Scalars['String']['input'];
  endpointUuid: Scalars['String']['input'];
}

export interface DeleteEndpointInput {
  action: ActionInput;
  payload: Array<DeleteEndpointPayload>;
}

export interface DeleteEndpointPayload {
  topicUuid?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface DeleteExportVmInstanceFromOvfInput {
  action: ActionInput;
  payload: Array<DeleteExportVmInstanceFromOvfPayload>;
}

export interface DeleteExportVmInstanceFromOvfPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteExportedImageInput {
  action: ActionInput;
  payload: Array<DeleteExportedImagePayload>;
}

export interface DeleteExportedImagePayload {
  backupStorageUuid: Scalars['String']['input'];
  imageUuid: Scalars['String']['input'];
}

export interface DeleteExternalPrimaryStoragePoolInput {
  action: ActionInput;
  payload: ActionExternalPrimaryStoragePoolPayload;
}

export interface DeleteGroupInput {
  action: ActionInput;
  payload: Array<DeleteGroupPayload>;
}

export interface DeleteGroupPayload {
  groupName: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface DeleteHostGroupInput {
  action: ActionInput;
  payload: Array<DeleteHostGroupPayload>;
}

export interface DeleteHostGroupPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteHostInput {
  action: ActionInput;
  payload: Array<DeleteHostPayload>;
}

export interface DeleteHostKernelInterfaceInput {
  action: ActionInput;
  payload: Array<DeleteHostKernelInterfacePayload>;
}

export interface DeleteHostKernelInterfacePayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteHostPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteImageInput {
  action: ActionInput;
  payload: Array<DeleteImagePayload>;
}

export interface DeleteImagePayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteIpRangeInput {
  action: ActionInput;
  payload: Array<DeleteIpRangePayload>;
}

export interface DeleteIpRangePayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteIscsiServerInput {
  action: ActionInput;
  payload: Array<DeleteIscsiServerPayload>;
}

export interface DeleteIscsiServerPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteKmsProviderInput {
  action: ActionInput;
  payload: Array<DeleteKmsProviderPayload>;
}

export interface DeleteKmsProviderPayload {
  type: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface DeleteL2NetworkActionInput {
  action: ActionInput;
  payload: Array<DeleteL2NetworkInput>;
}

export interface DeleteL2NetworkInput {
  /** 这里只用分布式交换机和端口组 */
  l2NetworkType?: InputMaybe<l2NetworkType>;
  uuid: Scalars['String']['input'];
}

export interface DeleteL3NetworkInput {
  action: ActionInput;
  payload: Array<DeleteL3NetworkPayload>;
}

export interface DeleteL3NetworkPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteLicenseInput {
  action: ActionInput;
  payload: Array<DeleteLicensePayload>;
}

export interface DeleteLicensePayload {
  managementNodeUuid: Scalars['String']['input'];
  module?: InputMaybe<Scalars['String']['input']>;
}

export interface DeleteLogCollectInput {
  action: ActionInput;
  payload: Array<DeleteLogCollectPayload>;
}

export interface DeleteLogCollectPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteLogServerInput {
  action: ActionInput;
  payload: Array<DeleteLogServerPayload>;
}

export interface DeleteLogServerPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteMigrationGatewayVmInput {
  action: ActionInput;
  payload: Array<DeleteMigrationGatewayVmPayload>;
}

export interface DeleteMigrationGatewayVmPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteNvmeServerInput {
  action: ActionInput;
  payload: Array<DeleteNvmeServerPayload>;
}

export interface DeleteNvmeServerPayload {
  uuid: Scalars['String']['input'];
}

export interface DeletePSSystemTagInput {
  action: ActionInput;
  payload: DeletePSSystemTagPayload;
}

export interface DeletePSSystemTagPayload {
  oldTag: Scalars['String']['input'];
  resourceUuid: Scalars['String']['input'];
}

export interface DeletePreconfigurationTemplateInput {
  action: ActionInput;
  payload: Array<DeletePreconfigurationTemplatePayload>;
}

export interface DeletePreconfigurationTemplatePayload {
  uuid: Scalars['String']['input'];
}

export interface DeletePrimaryStorageListInput {
  action: ActionInput;
  payload: Array<DeletePrimaryStoragePayload>;
}

export interface DeletePrimaryStoragePayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteResourceAttributeKeyInput {
  action: ActionInput;
  payload: Array<DeleteResourceAttributeKeyPayload>;
}

export interface DeleteResourceAttributeKeyPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteResourceAttributeValuePayload {
  keyUuid: Scalars['String']['input'];
  resourceUuids: Array<Scalars['String']['input']>;
}

export interface DeleteResourceBackupJobInput {
  action: ActionInput;
  payload: Array<DeleteResourceBackupJobPayload>;
}

export interface DeleteResourceBackupJobPayload {
  triggersUuid?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export interface DeleteRoleInput {
  action: ActionInput;
  payload: Array<DeleteRolePayload>;
}

export interface DeleteRolePayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteSNSEmailPlatformInput {
  action: ActionInput;
  payload: Array<DeleteSNSEmailPlatformPayload>;
}

export interface DeleteSNSEmailPlatformPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteSNSTextTemplateInput {
  action: ActionInput;
  payload: Array<DeleteSNSTextTemplatePayload>;
}

export interface DeleteSNSTextTemplatePayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteSchedulerJobInput {
  action: ActionInput;
  payload: Array<DeleteSchedulerJobPayload>;
}

export interface DeleteSchedulerJobPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteScriptInput {
  action: ActionInput;
  payload: Array<DeleteScriptPayload>;
}

export interface DeleteScriptPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteSecurityGroupInput {
  action: ActionInput;
  payload: Array<DeleteSecurityGroupPayload>;
}

export interface DeleteSecurityGroupPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteSecurityGroupRuleInput {
  action: ActionInput;
  payload: Array<DeleteSecurityGroupRulePayload>;
}

export interface DeleteSecurityGroupRulePayload {
  ruleUuids: Array<Scalars['String']['input']>;
}

export interface DeleteSnapshotStrategyInput {
  action: ActionInput;
  payload: Array<DeleteSnapshotStrategyPayload>;
}

export interface DeleteSnapshotStrategyPayload {
  triggerUuid?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface DeleteSnmpTrapReceiverInput {
  action: ActionInput;
  payload: Array<DeleteSnmpTrapReceiverPayload>;
}

export interface DeleteSnmpTrapReceiverPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteTagInput {
  action: ActionInput;
  payload: Array<DeleteTagPayload>;
}

export interface DeleteTagPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteThirdPartyAuthInput {
  action: ActionInput;
  payload: Array<DeleteThirdPartyAuthPayload>;
}

export interface DeleteThirdPartyAuthPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteUserGroupInput {
  action: ActionInput;
  payload: Array<DeleteUserGroupPayload>;
}

export interface DeleteUserGroupPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteVmConsolePasswordInput {
  action: ActionInput;
  payload: DeleteVmConsolePasswordPayload;
}

export interface DeleteVmConsolePasswordPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteVmCustomSpecificationInput {
  action: ActionInput;
  payload: Array<DeleteVmCustomSpecificationPayload>;
}

export interface DeleteVmCustomSpecificationPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteVmGroupInput {
  action: ActionInput;
  payload: Array<DeleteVmGroupPayload>;
}

export interface DeleteVmGroupPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteVmInstanceInput {
  action: ActionInput;
  payload: Array<DeleteVmInstancePayload>;
}

export interface DeleteVmInstancePayload {
  deleteVolume: Scalars['Boolean']['input'];
  uuid: Scalars['String']['input'];
}

export interface DeleteVmNicFromSecurityGroupInput {
  action: ActionInput;
  payload: Array<DeleteVmNicFromSecurityGroupPayload>;
}

export interface DeleteVmNicFromSecurityGroupPayload {
  securityGroupUuid: Scalars['String']['input'];
  vmNicUuids: Array<Scalars['String']['input']>;
}

export interface DeleteVmSchedulingRuleInput {
  action: ActionInput;
  payload: Array<DeleteVmSchedulingRulePayload>;
}

export interface DeleteVmSchedulingRulePayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteVmSshKeyInput {
  action: ActionInput;
  payload: DeleteVmSshKeyPayload;
}

export interface DeleteVmSshKeyPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteVmStaticIpInput {
  action: ActionInput;
  payload: DeleteVmStaticIpPayload;
}

export interface DeleteVmStaticIpPayload {
  /** 三层网的uuid */
  l3NetworkUuid: Scalars['String']['input'];
  /** 当前vm的uuid */
  vmInstanceUuid: Scalars['String']['input'];
}

export interface DeleteVmTemplateInput {
  action: ActionInput;
  payload: Array<DeleteVmTemplatePayload>;
}

export interface DeleteVmTemplatePayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteVolumeQosInput {
  action: ActionInput;
  payload: Array<DeleteVolumeQosPayload>;
}

export interface DeleteVolumeQosPayload {
  mode?: VolumeQosMode;
  uuid: Scalars['String']['input'];
}

export interface DeleteVolumeSnapshotInput {
  action: ActionInput;
  payload: DeleteVolumeSnapshotPayload;
}

export interface DeleteVolumeSnapshotPayload {
  type: SnapshotType;
  uuids: Array<Scalars['String']['input']>;
}

export interface DeleteXmlHookInput {
  action: ActionInput;
  payload: Array<DeleteXmlHookPayload>;
}

export interface DeleteXmlHookPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteZSVBackupStorageInput {
  action: ActionInput;
  payload: Array<DeleteZSVBackupStoragePayload>;
}

export interface DeleteZSVBackupStoragePayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteZWatchAlarmInput {
  action: ActionInput;
  payload: Array<DeleteZWatchAlarmPayload>;
}

export interface DeleteZWatchAlarmPayload {
  uuid: Scalars['String']['input'];
}

export interface DeleteZoneInput {
  action: ActionInput;
  payload: Array<DeleteZonePayload>;
}

export interface DeleteZonePayload {
  uuid: Scalars['String']['input'];
}

export enum DependentResourceType {
  BackupStorageVO = 'BackupStorageVO',
  ClusterVO = 'ClusterVO',
  GlobalConfig = 'GlobalConfig',
  L3NetworkVO = 'L3NetworkVO',
  PrimaryStorageVO = 'PrimaryStorageVO',
  VmInstanceVO = 'VmInstanceVO'
}

export interface DeployedNode {
  disk?: Maybe<Array<DeployedNodeDisk>>;
  ip?: Maybe<Scalars['String']['output']>;
  memorySize?: Maybe<Scalars['Float']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  sn: Scalars['String']['output'];
  storageClusterIp?: Maybe<Scalars['String']['output']>;
  storagePublicIp?: Maybe<Scalars['String']['output']>;
}

export interface DeployedNodeDisk {
  name?: Maybe<Scalars['String']['output']>;
  productName?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Int']['output']>;
  sn: Scalars['String']['output'];
  type?: Maybe<Scalars['String']['output']>;
}

export interface DetachBackupStorageFromZoneInput {
  action: ActionInput;
  payload: Array<DetachBackupStorageFromZonePayload>;
}

export interface DetachBackupStorageFromZonePayload {
  backupStorageUuid: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}

export interface DetachBaremetalPxeServerInput {
  action: ActionInput;
  payload: Array<DetachBaremetalPxeServerPayload>;
}

export interface DetachBaremetalPxeServerPayload {
  clusterUuid: Scalars['String']['input'];
  deletePxeServer?: Scalars['Boolean']['input'];
  pxeServerUuid: Scalars['String']['input'];
}

export interface DetachDataVolumeFromVmInput {
  action: ActionInput;
  payload: Array<DetachDataVolumeFromVmPayload>;
}

export interface DetachDataVolumeFromVmPayload {
  uuid: Scalars['String']['input'];
  vmUuid: Scalars['String']['input'];
}

export interface DetachGuestToolsIsoFromVmInput {
  action: ActionInput;
  payload: DetachGuestToolsIsoFromVmPayload;
}

export interface DetachGuestToolsIsoFromVmPayload {
  uuid: Scalars['String']['input'];
}

export interface DetachIscsiServerFromClusterInput {
  action: ActionInput;
  payload: Array<DetachIscsiServerFromClusterPayload>;
}

export interface DetachIscsiServerFromClusterPayload {
  /** 	集群UUID */
  clusterUuid: Scalars['String']['input'];
  /** iSCSI服务器的的UUID */
  uuid: Scalars['String']['input'];
}

export interface DetachIsoFromVmInstanceInput {
  action: ActionInput;
  payload: Array<DetachIsoFromVmInstancePayload>;
}

export interface DetachIsoFromVmInstancePayload {
  isoUuid: Scalars['String']['input'];
  vmInstanceUuid: Scalars['String']['input'];
}

export interface DetachL2NetworkFromHostInput {
  action: ActionInput;
  payload: Array<DetachL2NetworkFromHostPayload>;
}

export interface DetachL2NetworkFromHostPayload {
  hostUuid: Scalars['String']['input'];
  l2NetworkUuid: Scalars['String']['input'];
}

export interface DetachL3NetworkFromTemplatedVmInVmEditPayload {
  vmNicUuid: Scalars['String']['input'];
}

export interface DetachL3NetworkFromVmInVmEditPayload {
  vmNicUuid: Scalars['String']['input'];
}

export interface DetachL3NetworkFromVmInput {
  action: ActionInput;
  payload: Array<DetachL3NetworkFromVmPayload>;
}

export interface DetachL3NetworkFromVmPayload {
  /** l3Network.uuid */
  uuid?: InputMaybe<Scalars['String']['input']>;
  /** vmNic.uuid */
  vmNicUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface DetachMdevDeviceFromVMInput {
  action: ActionInput;
  payload: DetachMdevDeviceFromVMPayload;
}

export interface DetachMdevDeviceFromVMPayload {
  mdevDeviceUuid: Scalars['String']['input'];
  vmInstanceUuid: Scalars['String']['input'];
}

export interface DetachNvmeServerFromClusterInput {
  action: ActionInput;
  payload: Array<DetachNvmeServerFromClusterPayload>;
}

export interface DetachNvmeServerFromClusterPayload {
  /** 	集群UUID */
  clusterUuid: Scalars['String']['input'];
  /** Nvme服务器的的UUID */
  uuid: Scalars['String']['input'];
}

export interface DetachPciDeviceFromVMInput {
  action: ActionInput;
  payload: Array<DetachPciDeviceFromVMPayload>;
}

export interface DetachPciDeviceFromVMPayload {
  pciDeviceUuid: Scalars['String']['input'];
  vmInstanceUuid: Scalars['String']['input'];
}

export interface DetachPrimaryStorageFromClusterInput {
  action: ActionInput;
  payload: Array<DetachPrimaryStorageFromClusterPayload>;
}

export interface DetachPrimaryStorageFromClusterPayload {
  clusterUuid: Scalars['String']['input'];
  primaryStorageUuid: Scalars['String']['input'];
}

export interface DetachScsiLunFromVmInstanceInput {
  action: ActionInput;
  payload: Array<DetachScsiLunFromVmInstancePayload>;
}

export interface DetachScsiLunFromVmInstancePayload {
  /** 资源的UUID，唯一标示该资源 */
  uuid: Scalars['String']['input'];
  /** 云主机UUID */
  vmInstanceUuid: Scalars['String']['input'];
}

export interface DetachTagInput {
  action: ActionInput;
  payload: Array<DetachTagPayload>;
}

export interface DetachTagPayload {
  resourceUuids: Array<Scalars['String']['input']>;
  tagUuid: Scalars['String']['input'];
}

export interface DetachUsbDeviceToVmInput {
  action: ActionInput;
  payload: Array<DetachUsbDeviceToVmPayload>;
}

export interface DetachUsbDeviceToVmPayload {
  usbDeviceUuid: Scalars['String']['input'];
}

export interface DetachVGpuFromVmInstanceInput {
  action: ActionInput;
  payload: Array<DetachVGpuFromVmInstancePayload>;
}

export interface DetachVGpuFromVmInstancePayload {
  type: VGpuType;
  vGpuDeviceUuid: Scalars['String']['input'];
  vmInstanceUuid: Scalars['String']['input'];
}

export interface DetachVmFromVmGroupInput {
  action: ActionInput;
  payload: DetachVmFromVmGroupPayload;
}

export interface DetachVmFromVmGroupPayload {
  vmGroupUuid: Scalars['String']['input'];
  vmUuid: Scalars['String']['input'];
}

export interface DettachXmlHookFromVmInput {
  action: ActionInput;
  payload: Array<DettachXmlHookFromVmPayload>;
}

export interface DettachXmlHookFromVmPayload {
  startupStrategy?: InputMaybe<Scalars['String']['input']>;
  vmInstanceUuid: Scalars['String']['input'];
}

export interface DhcpIp {
  ipv4?: Maybe<Scalars['String']['output']>;
  ipv6?: Maybe<Scalars['String']['output']>;
}

export interface DingTalkEndPoint extends BasicEndPoint {
  atAll: Scalars['Boolean']['output'];
  atPersonList?: Maybe<Array<AtPersonListItem>>;
  /**
   *
   *       指定人员的数量：
   *       现阶段因为后端会直接返回 atPersonList，所以直接取 atPersonList.length 即可
   *       若后面后端遇到性能瓶颈，再让后端不走级联查询 atPersonList，由 node 端去查询数量：见 endpointQueryService.getAtPersonListCount
   *
   */
  atPersonListCount?: Maybe<Scalars['Float']['output']>;
  atPersonPhoneNumbers?: Maybe<Array<Scalars['String']['output']>>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<Owner>;
  platformUuid?: Maybe<Scalars['String']['output']>;
  secret?: Maybe<Scalars['String']['output']>;
  state?: Maybe<EndPointState>;
  topic?: Maybe<SNSTopic>;
  type?: Maybe<EndPointType>;
  url?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface DirectoryClusterItem {
  groupName?: Maybe<Scalars['String']['output']>;
  key: Scalars['String']['output'];
  level: Scalars['Int']['output'];
  parentUuid: Scalars['String']['output'];
  title: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
  vmCount: Scalars['Int']['output'];
}

export enum DirectoryQueryType {
  Normal = 'Normal'
}

export interface DisableEmailServerInput {
  action: ActionInput;
  payload: Array<DisableEmailServerPayload>;
}

export interface DisableEmailServerPayload {
  uuid: Scalars['String']['input'];
}

export interface DisableHostInput {
  action: ActionInput;
  payload: Array<DisableHostPayload>;
}

export interface DisableHostPayload {
  uuid: Scalars['String']['input'];
}

export interface DisablePrimaryStorageInput {
  action: ActionInput;
  payload: Array<DisablePrimaryStoragePayload>;
}

export interface DisablePrimaryStoragePayload {
  uuid: Scalars['String']['input'];
}

export interface DisableZWatchAlarmInput {
  action: ActionInput;
  payload: Array<DisableZWatchAlarmPayload>;
}

export interface DisableZWatchAlarmPayload {
  uuid: Scalars['String']['input'];
}

export interface DisasterRecoveryPlatformContext {
  bootstrapTokenState: Scalars['String']['output'];
  certificateFingerprint: Scalars['String']['output'];
  entrySource: Scalars['String']['output'];
  managementNodeAddress: Scalars['String']['output'];
  managementNodeUuid: Scalars['String']['output'];
  platformType: Scalars['String']['output'];
  siteId: Scalars['String']['output'];
  suggestedSiteName: Scalars['String']['output'];
}

export interface DisasterRecoveryServiceBlocker {
  code: Scalars['String']['output'];
  count: Scalars['Float']['output'];
}

export interface DisasterRecoveryServiceHealthItem {
  code: Scalars['String']['output'];
  status: Scalars['String']['output'];
}

export interface DisasterRecoveryServiceState {
  blockers: Array<DisasterRecoveryServiceBlocker>;
  licenseSummary: Scalars['String']['output'];
  localFileName?: Maybe<Scalars['String']['output']>;
  managementAddress: Scalars['String']['output'];
  packageChecksum?: Maybe<Scalars['String']['output']>;
  packageName?: Maybe<Scalars['String']['output']>;
  packageUrl?: Maybe<Scalars['String']['output']>;
  packageVersion?: Maybe<Scalars['String']['output']>;
  platformContext: DisasterRecoveryPlatformContext;
  selfChecks: Array<DisasterRecoveryServiceHealthItem>;
  status: Scalars['String']['output'];
  storagePath?: Maybe<Scalars['String']['output']>;
  target: DisasterRecoveryServiceTarget;
  taskLogs: Array<DisasterRecoveryServiceTaskLog>;
  uploadMethod?: Maybe<Scalars['String']['output']>;
  version: Scalars['String']['output'];
}

export interface DisasterRecoveryServiceTarget {
  clusterName: Scalars['String']['output'];
  hostName: Scalars['String']['output'];
  managementNetwork: Scalars['String']['output'];
  spec: Scalars['String']['output'];
  storageName: Scalars['String']['output'];
}

export interface DisasterRecoveryServiceTaskLog {
  code: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  status: Scalars['String']['output'];
}

export interface DiscoveredSharedBlock {
  /** 磁盘 WWID */
  diskUuid: Scalars['String']['output'];
  /** 磁盘容量（字节） */
  totalCapacity: Scalars['Float']['output'];
  /** 供应商 */
  vendor: Scalars['String']['output'];
}

export interface Disk {
  diskType?: Maybe<Scalars['String']['output']>;
  diskUsage?: Maybe<DiskUsage>;
  driveType?: Maybe<Scalars['String']['output']>;
  locateStatus?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  readyState?: Maybe<DiskReadyState>;
  rotateSpeed?: Maybe<Scalars['Int']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
  slotNumber: Scalars['String']['output'];
  ssdRemainingLife?: Maybe<Scalars['String']['output']>;
  temperature?: Maybe<Scalars['Int']['output']>;
  uuid: Scalars['String']['output'];
}

export interface DiskAO {
  diskOffering?: InputMaybe<Scalars['String']['input']>;
  diskOfferingUuid?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  primaryStorageUuid?: InputMaybe<Scalars['String']['input']>;
  size?: InputMaybe<Scalars['Float']['input']>;
  sourceType?: InputMaybe<Scalars['String']['input']>;
  sourceUuid?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  templateUuid?: InputMaybe<Scalars['String']['input']>;
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

export interface Dns {
  dns?: Maybe<Scalars['String']['output']>;
  l3NetworkUuid?: Maybe<Scalars['String']['output']>;
}

export interface DnsListResp {
  list: Array<Dns>;
  total: Scalars['Int']['output'];
}

export enum DomainMode {
  Domain = 'Domain',
  WorkGroup = 'WorkGroup'
}

export interface DoubleManagementNodeInfo {
  hostListForGetLicenseInfo?: Maybe<Array<Scalars['String']['output']>>;
  hostNameList: Array<Scalars['String']['output']>;
  isDualManagementNode: Scalars['Boolean']['output'];
  isManagementNodeLegal: Scalars['Boolean']['output'];
  statusList: Array<Scalars['String']['output']>;
}

export interface DrsConfig {
  automationLevel: Scalars['String']['input'];
  defaultEnable?: InputMaybe<Scalars['Boolean']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  resourceConfigList?: InputMaybe<Array<ClusterResourceConfig>>;
  thresholdDuration: Scalars['Int']['input'];
  thresholds: Array<ThresholdsInput>;
}

export interface DualManagementNodeInfo {
  addOns?: Maybe<Array<LicenseAddOn>>;
  licenses?: Maybe<Array<LicenseInfo>>;
}

export enum ELLDPMode {
  disable = 'disable',
  rx_and_tx = 'rx_and_tx',
  rx_only = 'rx_only',
  tx_only = 'tx_only'
}

export interface EditAccountThirdPartyAuthConfigInput {
  action: ActionInput;
  payload: EditAccountThirdPartyAuthConfigPayload;
}

export interface EditAccountThirdPartyAuthConfigPayload {
  updateOAuthClientPayload?: InputMaybe<UpdateAccountThirdPartyAuthPayload>;
}

export interface EditBondInput {
  action: ActionInput;
  payload: Array<EditBondPayload>;
}

export interface EditBondPayload {
  description: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface EditGuestToolConfigInput {
  action: ActionInput;
  payload: Array<EditGuestToolConfigPayload>;
}

export interface EditGuestToolConfigPayload {
  setSystemTagPayload?: InputMaybe<SetSystemTagPayload>;
  setVmBIOSTrackPayload?: InputMaybe<SetVmBIOSTrackPayload>;
  setVmBootModePayload?: InputMaybe<SetVmBootModePayload>;
  setVmBootOrderPayload?: InputMaybe<SetVmBootOrderPayload>;
  setVmClockTrackPayload?: InputMaybe<SetVmClockTrackPayload>;
  updateResourceConfigPayload?: InputMaybe<UpdateResourceConfigPayload>;
}

export interface EditHostConfigInput {
  action: ActionInput;
  payload: EditHostConfigPayload;
}

export interface EditHostConfigPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  ept?: InputMaybe<Scalars['Boolean']['input']>;
  iommu?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface EditL3NetworkConfigInput {
  action: ActionInput;
  payload: Array<EditL3NetworkConfigPayload>;
}

export interface EditL3NetworkConfigPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  dhcpIpv4?: InputMaybe<Scalars['String']['input']>;
  dhcpIpv6?: InputMaybe<Scalars['String']['input']>;
  dhcpService?: InputMaybe<Scalars['Boolean']['input']>;
  ipAllocateStrategy?: InputMaybe<Scalars['String']['input']>;
  l3NetworkUuid?: InputMaybe<Scalars['String']['input']>;
  mtu?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  vlanIdParams?: InputMaybe<VlanIdPayload>;
}

export interface EditNormalConfigInput {
  action: ActionInput;
  payload: Array<EditNormalConfigPayload>;
}

export interface EditNormalConfigPayload {
  attachVmToVmGroupPayload?: InputMaybe<AttachVmToVmGroupPayload>;
  detachVmFromVmGroupPayload?: InputMaybe<DetachVmFromVmGroupPayload>;
  managementTagPayload?: InputMaybe<ManagementTagPayload>;
  setVmHostnamePayload?: InputMaybe<SetVmHostnamePayload>;
}

export interface EditOtherConfigInput {
  action: ActionInput;
  payload: Array<EditOtherConfigPayload>;
}

export interface EditOtherConfigPayload {
  removeHaStickStragedyPayload?: InputMaybe<RemoveHaStickStragedyPayload>;
  setHaStickStragedyPayload?: InputMaybe<SetHaStickStragedyPayload>;
  setVmCleanTrafficPayload?: InputMaybe<SetVmCleanTrafficPayload>;
  setVmEmulatorPinPayload?: InputMaybe<SetVmEmulatorPinPayload>;
  updateResourceConfigPayload?: InputMaybe<Array<UpdateResourceConfigPayload>>;
}

export interface EditRemoteConfigInput {
  action: ActionInput;
  payload: Array<EditRemoteConfigPayload>;
}

export interface EditRemoteConfigPayload {
  changeVmPasswordPayload?: InputMaybe<ChangeVmPasswordPayload>;
  deleteVmConsolePasswordPayload?: InputMaybe<DeleteVmConsolePasswordPayload>;
  setVmConsoleModePayload?: InputMaybe<SetVmConsoleModePayload>;
  setVmConsolePasswordPayload?: InputMaybe<SetVmConsolePasswordPayload>;
  setVmMonitorNumberPayload?: InputMaybe<SetVmMonitorNumberPayload>;
  setVmSshKeyPayload?: InputMaybe<SetVmSshKeyPayload>;
  setVmUsbRedirectPayload?: InputMaybe<SetVmUsbRedirectPayload>;
  updateResourceConfigPayload?: InputMaybe<UpdateResourceConfigPayload>;
}

export enum EditTemplatedVMActionType {
  Add = 'Add',
  Delete = 'Delete',
  Update = 'Update'
}

export interface EditTemplatedVMConfigInput {
  action: ActionInput;
  payload: Array<EditTemplatedVMConfigPayload>;
}

export interface EditTemplatedVMConfigPayload {
  actionType?: InputMaybe<EditTemplatedVMActionType>;
  addResourcesToDirectoryPayload?: InputMaybe<AddResourcesToDirectoryPayload>;
  attachDataVolumeToVmPayload?: InputMaybe<Array<AttachDataVolumeToTemplatedVmPayloadInEdit>>;
  attachIsoToVmInstancePayload?: InputMaybe<Array<AttachIsoToVmInstancePayload>>;
  attachL3NetworkToVmNicInEditVmPayload?: InputMaybe<Array<AttachL3NetworkToVmNicInEditVmPayload>>;
  attachPciDeviceToVMPayloads?: InputMaybe<Array<AttachPciDeviceToVMPayload>>;
  attachScsiLunToVmInstancePayloads?: InputMaybe<Array<AttachScsiLunToVmInstancePayloadInEditInTemplatedVM>>;
  attachUsbDeviceToVmPayload?: InputMaybe<Array<AttachUsbDeviceToVmPayload>>;
  attachVGpuToVmInstancePayloads?: InputMaybe<Array<AttachVGpuToVmInstancePayload>>;
  changeVmImagePayload?: InputMaybe<ChangeVmImagePayload>;
  changeVmNicNetworkPayload?: InputMaybe<Array<ChangeVmNicNetworkPayload>>;
  changeVmNicStatePayload?: InputMaybe<Array<ChangeVmNicStatePayload>>;
  changeVmPasswordPayload?: InputMaybe<ChangeVmPasswordPayload>;
  createDataVolumeInEditVmPayload?: InputMaybe<Array<CreateDataVolumeInEditVmPayload>>;
  createVmCdRomPayload?: InputMaybe<Array<CreateVmCdRomPayload>>;
  deleteCdRomPayload?: InputMaybe<Array<DeleteCdRomPayload>>;
  deleteDataVolumePayload?: InputMaybe<Array<DeleteDataVolumePayload>>;
  deleteVmConsolePasswordPayload?: InputMaybe<DeleteVmConsolePasswordPayload>;
  deleteVmStaticIpPayload?: InputMaybe<Array<DeleteVmStaticIpPayload>>;
  deleteVolumeQosPayload?: InputMaybe<Array<DeleteVolumeQosPayload>>;
  detachDataVolumeFromVmPayload?: InputMaybe<Array<DetachDataVolumeFromVmPayload>>;
  detachIsoFromVmInstancePayload?: InputMaybe<Array<DetachIsoFromVmInstancePayload>>;
  detachL3NetworkFromVmPayload?: InputMaybe<Array<DetachL3NetworkFromTemplatedVmInVmEditPayload>>;
  detachPciDeviceFromVMPayloads?: InputMaybe<Array<DetachPciDeviceFromVMPayload>>;
  detachScsiLunFromVmInstancePayloads?: InputMaybe<Array<DetachScsiLunFromVmInstancePayload>>;
  detachUsbDeviceToVmPayload?: InputMaybe<Array<DetachUsbDeviceToVmPayload>>;
  detachVGpuFromVmInstancePayloads?: InputMaybe<Array<DetachVGpuFromVmInstancePayload>>;
  managementTagPayload?: InputMaybe<ManagementTagPayload>;
  neeeReboot?: InputMaybe<Scalars['Boolean']['input']>;
  removeHaStickStragedyPayload?: InputMaybe<RemoveHaStickStragedyPayload>;
  resizeDataVolumePayload?: InputMaybe<Array<ResizeDataVolumePayload>>;
  resizeRootVolumePayload?: InputMaybe<Array<ResizeRootVolumePayload>>;
  resourceType?: InputMaybe<EditTemplatedVMResourceType>;
  resourceUuid: Scalars['String']['input'];
  setGpuDeviceSpecPayload?: InputMaybe<SetGpuDeviceSpecPayload>;
  setHaStickStragedyPayload?: InputMaybe<SetHaStickStragedyPayload>;
  setNicQosPayload?: InputMaybe<Array<SetNicQosPayload>>;
  setSystemTagPayload?: InputMaybe<Array<SetSystemTagPayload>>;
  setVmBootOrderPayload?: InputMaybe<SetVmBootOrderPayload>;
  setVmClockTrackPayload?: InputMaybe<SetVmClockTrackPayload>;
  setVmConsoleModePayload?: InputMaybe<SetVmConsoleModePayload>;
  setVmConsolePasswordPayload?: InputMaybe<SetVmConsolePasswordPayload>;
  setVmHaLevelPayload?: InputMaybe<SetVmHaLevelPayload>;
  setVmNicSecurityGroupInEditPayload?: InputMaybe<Array<SetVmNicSecurityGroupInEditPayload>>;
  setVmQxlMemoryPayload?: InputMaybe<SetVmQxlMemoryPayload>;
  setVmStaticIpPayload?: InputMaybe<Array<SetVmStaticIpPayload>>;
  setVmUsbRedirectPayload?: InputMaybe<SetVmUsbRedirectPayload>;
  setVolumeQosPayload?: InputMaybe<Array<SetVolumeQosPayload>>;
  startVmInstanceFromHostPayload?: InputMaybe<StartVmInstanceFromHostPayload>;
  updateResourceConfigActionParams?: InputMaybe<Array<ResourceConfigPayload>>;
  updateTemplatedVMPayload?: InputMaybe<UpdateVmTemplatePayload>;
  updateVmNicDriverPayload?: InputMaybe<Array<UpdateVmNicDriverPayload>>;
  updateVmNicMacPayload?: InputMaybe<Array<UpdateVmNicMacPayload>>;
  updateVmPriorityPayload?: InputMaybe<Array<UpdateVmPriorityPayload>>;
  vmNicBindSecurityGroupPayload?: InputMaybe<Array<VmNicBindSecurityGroupPayload>>;
  vmNicUnBindSecurityGroupPayload?: InputMaybe<Array<VmNicUnBindSecurityGroupPayload>>;
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

export interface EditVmInstanceConfigInput {
  action: ActionInput;
  payload: Array<EditVmInstanceConfigPayload>;
}

export interface EditVmInstanceConfigPayload {
  actionType?: InputMaybe<EditVmInstanceActionType>;
  addResourcesToDirectoryPayload?: InputMaybe<AddResourcesToDirectoryPayload>;
  addTpmToVmPayload?: InputMaybe<AddTpmToVmPayload>;
  attachDataVolumeToVmPayload?: InputMaybe<Array<AttachDataVolumeToVmPayloadInEdit>>;
  attachIsoToVmInstancePayload?: InputMaybe<Array<AttachIsoToVmInstancePayload>>;
  attachL3NetworkToVmNicInEditVmPayload?: InputMaybe<Array<AttachL3NetworkToVmNicInEditVmPayload>>;
  attachPciDeviceToVMPayloads?: InputMaybe<Array<AttachPciDeviceToVMPayload>>;
  attachScsiLunToVmInstancePayloads?: InputMaybe<Array<AttachScsiLunToVmInstancePayloadInEdit>>;
  attachUsbDeviceToVmPayload?: InputMaybe<Array<AttachUsbDeviceToVmPayload>>;
  attachVGpuToVmInstancePayloads?: InputMaybe<Array<AttachVGpuToVmInstancePayload>>;
  changeVmImagePayload?: InputMaybe<ChangeVmImagePayload>;
  changeVmNicNetworkPayload?: InputMaybe<Array<ChangeVmNicNetworkPayload>>;
  changeVmNicStatePayload?: InputMaybe<Array<ChangeVmNicStatePayload>>;
  changeVmPasswordPayload?: InputMaybe<ChangeVmPasswordPayload>;
  createDataVolumeInEditVmPayload?: InputMaybe<Array<CreateDataVolumeInEditVmPayload>>;
  createVmCdRomPayload?: InputMaybe<Array<CreateVmCdRomPayload>>;
  deleteCdRomPayload?: InputMaybe<Array<DeleteCdRomPayload>>;
  deleteDataVolumePayload?: InputMaybe<Array<DeleteDataVolumePayload>>;
  deleteVmConsolePasswordPayload?: InputMaybe<DeleteVmConsolePasswordPayload>;
  deleteVmStaticIpPayload?: InputMaybe<Array<DeleteVmStaticIpPayload>>;
  deleteVolumeQosPayload?: InputMaybe<Array<DeleteVolumeQosPayload>>;
  detachDataVolumeFromVmPayload?: InputMaybe<Array<DetachDataVolumeFromVmPayload>>;
  detachGuestToolsIsoFromVmPayload?: InputMaybe<Array<DetachGuestToolsIsoFromVmPayload>>;
  detachIsoFromVmInstancePayload?: InputMaybe<Array<DetachIsoFromVmInstancePayload>>;
  detachL3NetworkFromVmPayload?: InputMaybe<Array<DetachL3NetworkFromVmInVmEditPayload>>;
  detachPciDeviceFromVMPayloads?: InputMaybe<Array<DetachPciDeviceFromVMPayload>>;
  detachScsiLunFromVmInstancePayloads?: InputMaybe<Array<DetachScsiLunFromVmInstancePayload>>;
  detachUsbDeviceToVmPayload?: InputMaybe<Array<DetachUsbDeviceToVmPayload>>;
  detachVGpuFromVmInstancePayloads?: InputMaybe<Array<DetachVGpuFromVmInstancePayload>>;
  neeeReboot?: InputMaybe<Scalars['Boolean']['input']>;
  removeHaStickStragedyPayload?: InputMaybe<RemoveHaStickStragedyPayload>;
  removeTpmFromVmPayload?: InputMaybe<RemoveTpmFromVmPayload>;
  resizeDataVolumePayload?: InputMaybe<Array<ResizeDataVolumePayload>>;
  resizeRootVolumePayload?: InputMaybe<Array<ResizeRootVolumePayload>>;
  resourceType?: InputMaybe<EditVmInstanceResouceType>;
  resourceUuid: Scalars['String']['input'];
  setGpuDeviceSpecPayload?: InputMaybe<SetGpuDeviceSpecPayload>;
  setHaStickStragedyPayload?: InputMaybe<SetHaStickStragedyPayload>;
  setNicQosPayload?: InputMaybe<Array<SetNicQosPayload>>;
  setSystemTagPayload?: InputMaybe<Array<SetSystemTagPayload>>;
  setVmBootOrderPayload?: InputMaybe<SetVmBootOrderPayload>;
  setVmBootVolumePayload?: InputMaybe<SetVmBootVolumePayload>;
  setVmClockTrackPayload?: InputMaybe<SetVmClockTrackPayload>;
  setVmConsoleModePayload?: InputMaybe<SetVmConsoleModePayload>;
  setVmConsolePasswordPayload?: InputMaybe<SetVmConsolePasswordPayload>;
  setVmDnsPayload?: InputMaybe<Array<SetVmDnsPayload>>;
  setVmHaLevelPayload?: InputMaybe<SetVmHaLevelPayload>;
  setVmNicSecurityGroupInEditPayload?: InputMaybe<Array<SetVmNicSecurityGroupInEditPayload>>;
  setVmQxlMemoryPayload?: InputMaybe<SetVmQxlMemoryPayload>;
  setVmStaticIpPayload?: InputMaybe<Array<SetVmStaticIpPayload>>;
  setVmUsbRedirectPayload?: InputMaybe<SetVmUsbRedirectPayload>;
  setVolumeQosPayload?: InputMaybe<Array<SetVolumeQosPayload>>;
  startVmInstanceFromHostPayload?: InputMaybe<StartVmInstanceFromHostPayload>;
  updateCacheModeAndAioParams?: InputMaybe<Array<ResourceConfigPayload>>;
  updateResourceConfigActionParams?: InputMaybe<Array<ResourceConfigPayload>>;
  updateTpmPayload?: InputMaybe<UpdateTpmPayload>;
  updateVmInstancePayload?: InputMaybe<UpdateVmInstancePayload>;
  updateVmNetworkConfigPayload?: InputMaybe<Array<UpdateVmNetworkConfigPayload>>;
  updateVmNicDriverPayload?: InputMaybe<Array<UpdateVmNicDriverPayload>>;
  updateVmNicMacPayload?: InputMaybe<Array<UpdateVmNicMacPayload>>;
  updateVmPriorityPayload?: InputMaybe<Array<UpdateVmPriorityPayload>>;
  vmNicBindSecurityGroupPayload?: InputMaybe<Array<VmNicBindSecurityGroupPayload>>;
  vmNicUnBindSecurityGroupPayload?: InputMaybe<Array<VmNicUnBindSecurityGroupPayload>>;
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

export interface Eip {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  guestIp?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<AccountOwner>;
  state?: Maybe<EipState>;
  uuid: Scalars['String']['output'];
  vipIp?: Maybe<Scalars['String']['output']>;
  vipUuid: Scalars['String']['output'];
  vmInstance?: Maybe<EipRelatedVmInstance>;
  vmNicUuid?: Maybe<Scalars['String']['output']>;
}

export interface EipInVminstance {
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
  vipIp?: Maybe<Scalars['String']['output']>;
}

export interface EipListResp {
  error?: Maybe<ActionError>;
  list: Array<Eip>;
  total: Scalars['Float']['output'];
}

export enum EipQueryType {
  GetVmNicAttachableEips = 'GetVmNicAttachableEips',
  Normal = 'Normal',
  SelectEipByCreateVm = 'SelectEipByCreateVm'
}

export interface EipRelatedVmInstance {
  hypervisorType?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export enum EipState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export interface EmailAccountInfo {
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface EmailAddress {
  createDate: Scalars['String']['output'];
  emailAddress: Scalars['String']['output'];
  endpointUuid: Scalars['String']['output'];
  lastOpDate: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface EmailDetailInfo {
  password?: Maybe<Scalars['String']['output']>;
  smtpPort: Scalars['Int']['output'];
  smtpServer?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
}

export interface EmailEndPoint extends BasicEndPoint {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  emailAddresses: Array<EmailAddress>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<Owner>;
  platform?: Maybe<Platform>;
  platformUuid?: Maybe<Scalars['String']['output']>;
  state?: Maybe<EndPointState>;
  topic?: Maybe<SNSTopic>;
  type?: Maybe<EndPointType>;
  uuid: Scalars['String']['output'];
}

export interface EmailServerSetting {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  emailPlat?: Maybe<EmailDetailInfo>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<EmailAccountInfo>;
  shareType?: Maybe<ShareType>;
  state: SNSApplicationPlatformState;
  toPublic?: Maybe<Scalars['Boolean']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface EmailServerSettingQueryResp {
  error?: Maybe<ActionError>;
  list?: Maybe<Array<EmailServerSetting>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export enum EmergencyLevel {
  Emergent = 'Emergent',
  Important = 'Important',
  Normal = 'Normal'
}

export interface EnableCryptoComplianceProgress {
  encryptMilliseconds: Scalars['Int']['output'];
  progressList: Array<EnableCryptoComplianceProgressItem>;
}

export interface EnableCryptoComplianceProgressItem {
  percent: Scalars['Float']['output'];
  signedCount?: Maybe<Scalars['Int']['output']>;
  state: EnableCryptoComplianceProgressItemState;
  time?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
  type: EnableCryptoComplianceProgressItemType;
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

export interface EnableEmailServerInput {
  action: ActionInput;
  payload: Array<EnableEmailServerPayload>;
}

export interface EnableEmailServerPayload {
  uuid: Scalars['String']['input'];
}

export interface EnableHostInput {
  action: ActionInput;
  payload: Array<EnableHostPayload>;
}

export interface EnableHostPayload {
  uuid: Scalars['String']['input'];
}

export interface EnablePrimaryStorageInput {
  action: ActionInput;
  payload: Array<EnablePrimaryStoragePayload>;
}

export interface EnablePrimaryStoragePayload {
  uuid: Scalars['String']['input'];
}

export interface EnableZWatchAlarmInput {
  action: ActionInput;
  payload: Array<EnableZWatchAlarmPayload>;
}

export interface EnableZWatchAlarmPayload {
  uuid: Scalars['String']['input'];
}

export type EndPoint = DingTalkEndPoint | EmailEndPoint | FeiShuEndPoint | HttpEndPoint | MicrosoftTeamsEndPoint | SmsEndPoint | SnmpTrapEndPoint | WeComEndPoint;

export interface EndPointEmailAddress {
  createDate?: Maybe<Scalars['String']['output']>;
  emailAddress?: Maybe<Scalars['String']['output']>;
  endpointUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface EndPointSmsAddress {
  createDate?: Maybe<Scalars['String']['output']>;
  endpointUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
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

export interface EnvInfo {
  isCube: Scalars['Boolean']['output'];
  storageType?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
}

export interface EventFromResourceStack {
  action?: Maybe<Scalars['String']['output']>;
  actionStatus?: Maybe<StackEventStatus>;
  content?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastOpDate?: Maybe<Scalars['String']['output']>;
  resourceName?: Maybe<Scalars['String']['output']>;
  stackUuid?: Maybe<Scalars['String']['output']>;
}

export interface EventRuleTempalteLabel {
  key: Scalars['String']['output'];
  op?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
}

export interface EventRuleTemplate {
  emergencyLevel?: Maybe<EmergencyLevel>;
  eventName?: Maybe<Scalars['String']['output']>;
  labels?: Maybe<Array<EventRuleTempalteLabel>>;
  monitorTemplateUuid?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  namespace?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface ExecuteDRSSchedulingInput {
  action: ActionInput;
  payload: Array<ExecuteDRSSchedulingPayload>;
}

export interface ExecuteDRSSchedulingPayload {
  uuid: Scalars['String']['input'];
}

export interface ExecuteScriptInput {
  action: ActionInput;
  payload: ExecuteScriptPayload;
}

export interface ExecuteScriptPayload {
  scriptTimeout?: InputMaybe<Scalars['Float']['input']>;
  uuid: Scalars['String']['input'];
  vmInstanceUuids: Array<Scalars['String']['input']>;
}

export interface Expired {
  dayDifference?: Maybe<Scalars['Int']['output']>;
  isExpired?: Maybe<Scalars['Boolean']['output']>;
}

export interface ExportBackupDatabaseUrlListInput {
  action: ActionInput;
  payload: ExportBackupDatabaseUrlPayload;
}

export interface ExportBackupDatabaseUrlPayload {
  backupStorageUuid?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface ExportImageFromBackupStorageResult {
  exportMd5Sum?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
}

export interface ExportImageInput {
  action: ActionInput;
  payload: Array<ExportImagePayload>;
}

export interface ExportImagePayload {
  backupStorageUuid: Scalars['String']['input'];
  imageUuid: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
}

export enum ExportMetricsValue {
  average = 'average',
  low = 'low',
  top = 'top'
}

export interface ExportTask {
  downloadUrl?: Maybe<Scalars['String']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  status?: Maybe<ExportTaskStatus>;
  taskId: Scalars['String']['output'];
}

export interface ExportTaskExportPayload {
  /** ExportTas消息 */
  payload?: Maybe<ExportTask>;
  /** apiInspector 消息按照 sessionId 分发 */
  sessionId: Scalars['String']['output'];
}

export enum ExportTaskStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING'
}

export interface ExportVmInstanceFromOvfInput {
  action: ActionInput;
  payload: Array<ExportVmInstanceFromOvfPayload>;
}

export interface ExportVmInstanceFromOvfPayload {
  backupStorageUuid: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  vmUuid: Scalars['String']['input'];
}

export interface ExpungeBaremetalInstanceInput {
  action: ActionInput;
  payload: Array<ExpungeBaremetalInstancePayload>;
}

export interface ExpungeBaremetalInstancePayload {
  uuid: Scalars['String']['input'];
}

export interface ExpungeDataVolumeInput {
  action: ActionInput;
  payload: Array<ExpungeDataVolumePayload>;
}

export interface ExpungeDataVolumePayload {
  uuid: Scalars['String']['input'];
}

export interface ExpungeImageInput {
  action: ActionInput;
  payload: Array<ExpungeImagePayload>;
}

export interface ExpungeImagePayload {
  backupStorageUuids: Array<Scalars['String']['input']>;
  imageUuid: Scalars['String']['input'];
}

export interface ExpungeVmInstanceInput {
  action: ActionInput;
  payload: Array<ExpungeVmInstancePayload>;
}

export interface ExpungeVmInstancePayload {
  uuid: Scalars['String']['input'];
}

export interface ExternalPrimaryStoragePool {
  aliasName?: Maybe<Scalars['String']['output']>;
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  createDate: Scalars['String']['output'];
  diskUtilization?: Maybe<Scalars['Float']['output']>;
  externalPrimaryStoragePoolCapacity: ExternalPrimaryStoragePoolCapacity;
  id: Scalars['String']['output'];
  /** name 唯一 */
  name: Scalars['String']['output'];
  primaryStorageCapacity?: Maybe<PrimaryStorageCapacity>;
  primaryStorageUuid?: Maybe<Scalars['String']['output']>;
  redundancyPolicy?: Maybe<RedundancyPolicy>;
  replicatedSize?: Maybe<Scalars['String']['output']>;
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  usedCapacity?: Maybe<Scalars['Float']['output']>;
  /** 在 server 端基于 name 构造出来的，为了保持 ui 端 table/gql cache 中使用 uuid 作为 rowkey */
  uuid: Scalars['String']['output'];
}

export interface ExternalPrimaryStoragePoolCapacity {
  /** 镜像缓存 */
  imageCacheSize?: Maybe<Scalars['Float']['output']>;
  /** 保留容量(这个保留容量只用于ceph的pool池) */
  reservedCapacity?: Maybe<Scalars['Float']['output']>;
  /** 模版缓存 */
  vmTemplateVolumeCacheSize?: Maybe<Scalars['Float']['output']>;
  /** 虚拟机硬盘真实容量 */
  volumeActualSize?: Maybe<Scalars['Float']['output']>;
  /** 虚拟机硬盘 */
  volumeSize?: Maybe<Scalars['Float']['output']>;
  /** 快照容量 */
  volumeSnapshotSize?: Maybe<Scalars['Float']['output']>;
}

export interface ExternalPrimaryStoragePoolConfig {
  /** 已经添加到主存储中的池子 */
  pools: Array<AddedExternalPrimaryStoragePool>;
}

export interface ExternalPrimaryStoragePoolList {
  error?: Maybe<ActionError>;
  list: Array<ExternalPrimaryStoragePool>;
  total: Scalars['Int']['output'];
}

export interface Fan {
  hostUuid: Scalars['String']['output'];
  rpm?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  state?: Maybe<HardwareState>;
}

export interface FeiShuEndPoint extends BasicEndPoint {
  atAll: Scalars['Boolean']['output'];
  atPersonList?: Maybe<Array<AtPersonListItem>>;
  /**
   *
   *     指定人员的数量：
   *     现阶段因为后端会直接返回 atPersonList，所以直接取 atPersonList.length 即可
   *     若后面后端遇到性能瓶颈，再让后端不走级联查询 atPersonList，由 node 端去查询数量：见 endpointQueryService.getAtPersonListCount
   *
   */
  atPersonListCount?: Maybe<Scalars['Float']['output']>;
  atPersonUserIds?: Maybe<Array<Scalars['String']['output']>>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<Owner>;
  platformUuid?: Maybe<Scalars['String']['output']>;
  secret?: Maybe<Scalars['String']['output']>;
  state?: Maybe<EndPointState>;
  topic?: Maybe<SNSTopic>;
  type?: Maybe<EndPointType>;
  url?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface FiberChannelLun {
  createDate?: Maybe<Scalars['String']['output']>;
  fiberChannelStorageUuid?: Maybe<Scalars['String']['output']>;
  healthState?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  multipathDeviceUuid?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  path?: Maybe<Scalars['String']['output']>;
  scsiLunHostRefs: Array<ScsiLunHostRefInventory>;
  scsiLunVmInstanceRefs: Array<ScsiLunVmInstanceRefInventory>;
  serial?: Maybe<Scalars['String']['output']>;
  size: Scalars['Float']['output'];
  source?: Maybe<LunSource>;
  state?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vendor?: Maybe<Scalars['String']['output']>;
  wwid?: Maybe<Scalars['String']['output']>;
  wwn?: Maybe<Scalars['String']['output']>;
}


export interface FiberChannelLunhealthStateArgs {
  hostUuid: Scalars['String']['input'];
}

export interface FiberChannelLunList {
  error?: Maybe<ActionError>;
  list: Array<FiberChannelLun>;
  total: Scalars['Int']['output'];
}

export interface FiberChannelStorage {
  createDate?: Maybe<Scalars['String']['output']>;
  fiberChannelLuns: Array<FiberChannelLun>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  lunDeviceUsageInfo?: Maybe<FiberChannelStorageLUNDeviceUsageInfo>;
  name: Scalars['String']['output'];
  state?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  wwnn?: Maybe<Scalars['String']['output']>;
  /** FiberChannelStorage 上 fiberChannelLuns 对应的 scsiLunHostRefs 所在host的zone，没有scsiLunHostRefs则无zone */
  zones?: Maybe<Array<Zone>>;
}

export interface FiberChannelStorageLUNDeviceUsageInfo {
  totalLunNum?: Maybe<Scalars['Float']['output']>;
  unusedLunNum?: Maybe<Scalars['Float']['output']>;
  usedLunNum?: Maybe<Scalars['Float']['output']>;
}

export interface FiberChannelStorageList {
  error?: Maybe<ActionError>;
  list: Array<FiberChannelStorage>;
  total: Scalars['Int']['output'];
}

export interface FirstGatewayVmInfo {
  cpuNum?: Maybe<Scalars['Int']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  defaultIp?: Maybe<Scalars['String']['output']>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  hypervisorType?: Maybe<Scalars['String']['output']>;
  memorySize?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  platform?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  storageSize?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface FlattenVmInstanceInput {
  action: ActionInput;
  payload: Array<FlattenVmInstancePayload>;
}

export interface FlattenVmInstancePayload {
  full?: InputMaybe<Scalars['Boolean']['input']>;
  uuid: Scalars['String']['input'];
}

export interface ForceStopVmInstanceInput {
  action: ActionInput;
  payload: Array<ForceStopVmInstancePayload>;
}

export interface ForceStopVmInstancePayload {
  uuid: Scalars['String']['input'];
}

export interface FreeHardDiskInfo {
  logicalSector: Scalars['String']['output'];
  multipathDeviceName?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  partitionTable?: Maybe<Scalars['String']['output']>;
  physicalSector: Scalars['String']['output'];
  size: Scalars['String']['output'];
  type: Scalars['String']['output'];
  withPartition: Scalars['Boolean']['output'];
}

export interface FreeHardDiskInfoList {
  list: Array<FreeHardDiskInfo>;
  total: Scalars['Int']['output'];
}

export interface FuzzyQueryResponse {
  conditionCount: Array<ConditionCount>;
}

export interface GatewayVmInstance {
  architecture?: Maybe<Scalars['String']['output']>;
  clusterUuid?: Maybe<Scalars['String']['output']>;
  cpuNum?: Maybe<Scalars['Int']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  defaultIp?: Maybe<Scalars['String']['output']>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  hypervisorType?: Maybe<Scalars['String']['output']>;
  /** 是否为第一个创建的迁移网关虚拟机（不支持启用/停用/删除） */
  isFirstGateway?: Maybe<Scalars['Boolean']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  memorySize?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  platform?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  storageSize?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface GenNewPemInput {
  action: ActionInput;
  payload: GenNewPemPayload;
}

export interface GenNewPemPayload {
  C?: InputMaybe<Scalars['String']['input']>;
  CN?: InputMaybe<Scalars['String']['input']>;
  L?: InputMaybe<Scalars['String']['input']>;
  O?: InputMaybe<Scalars['String']['input']>;
  OU?: InputMaybe<Scalars['String']['input']>;
  ST?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['String']['input']>;
  emailAddress?: InputMaybe<Scalars['String']['input']>;
  redirect?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface GenerateMdevDeviceInput {
  action: ActionInput;
  payload: GenerateMdevDevicePayload;
}

export interface GenerateMdevDevicePayload {
  mdevSpecUuid: Scalars['String']['input'];
  pciDeviceUuid: Scalars['String']['input'];
}

export interface GenerateSriovPciDeviceInput {
  action: ActionInput;
  payload: GenerateSriovPciDevicePayload;
}

export interface GenerateSriovPciDevicePayload {
  pciDeviceUuid: Scalars['String']['input'];
  virtPartNum: Scalars['Float']['input'];
}

export interface GetAccountQuotaUsageResp {
  usages?: Maybe<Array<AccountQuotaUsage>>;
}

export interface GetCountByNamespaceResp {
  /** 查询结果列表 */
  list?: Maybe<Array<CountByNamespaceInventory>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface GetCpuMemoryCapacity {
  availableCpu: Scalars['Int']['output'];
  availableMemory: Scalars['Float']['output'];
}

export interface GetCurrentTime {
  currentTime: CurrentTime;
  offset?: Maybe<Scalars['String']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
}

export interface GetDataProtectionRelatedSummaryInput {
  auditsDays: Scalars['Int']['input'];
  operationLogDays: Scalars['Int']['input'];
}

export interface GetFlattenVmInstanceOccupyCapacityInput {
  uuids: Array<Scalars['String']['input']>;
}

export interface GetFlattenVolumeOccupyCapacityInput {
  uuids: Array<Scalars['String']['input']>;
}

export interface GetFreeIpInput {
  ipRangeType?: InputMaybe<Scalars['String']['input']>;
  ipRangeUuid?: InputMaybe<Scalars['String']['input']>;
  ipVersion?: InputMaybe<Scalars['Int']['input']>;
  l3NetworkUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface GetFreeIpOfL3NetworkResult {
  ipv4List?: Maybe<Array<Scalars['String']['output']>>;
  ipv6List?: Maybe<Array<Scalars['String']['output']>>;
}

export interface GetHostWebSshUrlInput {
  action: ActionInput;
  payload: Array<GetHostWebSshUrlPayload>;
}

export interface GetHostWebSshUrlPayload {
  https: Scalars['Boolean']['input'];
  uuid: Scalars['String']['input'];
}

export interface GetKmsServerCertFromKmsResult {
  kmsCertInfo?: Maybe<KmsCertInfo>;
  selfSigned?: Maybe<Scalars['Boolean']['output']>;
  serverCertPem?: Maybe<Scalars['String']['output']>;
}

export interface GetL3NetworkIpStatisticResult {
  error?: Maybe<IError>;
  list?: Maybe<Array<IpStatistics>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface GetLoginCaptchaPayload {
  captchaUuid?: InputMaybe<Scalars['String']['input']>;
  loginType: Scalars['String']['input'];
  resourceName: Scalars['String']['input'];
}

export interface GetLoginCaptchaResp {
  captcha?: Maybe<Scalars['String']['output']>;
  captchaUuid?: Maybe<Scalars['String']['output']>;
}

export interface GetLoginProceduresInput {
  loginType: Scalars['String']['input'];
  username: Scalars['String']['input'];
}

export interface GetLoginProceduresOutput {
  procedures: Array<GetLoginProceduresResp>;
  publicKey?: Maybe<Scalars['String']['output']>;
}

export interface GetLoginProceduresResp {
  name: Scalars['String']['output'];
  properties: LoginProceduresProperties;
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

export interface GetNicMetricDataResp {
  in: NicMetricData;
  out: NicMetricData;
}

export interface GetResourceFromResourceStackResp {
  /** 查询结果列表 */
  list?: Maybe<Array<ResourceFromResourceStack>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface GetTwoFactorAuthenticationSecretPayload {
  captchaUuid?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  type: Scalars['String']['input'];
  verifyCode?: InputMaybe<Scalars['String']['input']>;
}

export interface GetTwoFactorAuthenticationSecretResp {
  createDate?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  secret?: Maybe<Scalars['String']['output']>;
  status?: Maybe<TwoFactorAuthenticationSecretStatus>;
  userType?: Maybe<Scalars['String']['output']>;
  userUuid?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface GetTwoFactorAuthenticationStateResp {
  state?: Maybe<Scalars['String']['output']>;
}

export interface GlobalConfig {
  category: Scalars['String']['output'];
  defaultValue: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  /** 数据保护是否通过 */
  isValid?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  uuid?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
}

export interface GlobalConfigAndRcPool {
  secretResourcePool?: Maybe<SecretResourcePool>;
  state: Scalars['Boolean']['output'];
}

export interface GlobalConfigAndRcPoolInput {
  resourceGloCfg: PickGlobalConfig;
  stateGloCfg: PickGlobalConfig;
}

export interface GlobalConfigAndSecretResourcePool {
  category: Scalars['String']['output'];
  name: Scalars['String']['output'];
  secretResourcePool?: Maybe<SecretResourcePool>;
  value?: Maybe<Scalars['String']['output']>;
}

export interface GlobalConfigAndSecretResourcePoolList {
  /** 查询结果列表 */
  list?: Maybe<Array<GlobalConfigAndSecretResourcePool>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface GlobalConfigCpuMode {
  cpuMode: Scalars['String']['output'];
}

export interface GlobalConfigInput {
  category: Scalars['String']['input'];
  name: Scalars['String']['input'];
}

export interface GlobalConfigList {
  error?: Maybe<ActionError>;
  list: Array<GlobalConfig>;
  total: Scalars['Int']['output'];
}

export enum GlobalConfigQueryType {
  Normal = 'Normal'
}

export interface GlobalConfigTemplate {
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface GpuDeivceSpecOnVmInstance {
  deviceType?: Maybe<VGpuDeviceType>;
  isVirtual: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface GpuDeivceSpecOnVmInstanceInput {
  isVirtual: Scalars['Boolean']['input'];
  type: VGpuDeviceType;
  uuid: Scalars['String']['input'];
}

export interface GroupAction {
  actionType: Scalars['String']['output'];
  actionUuid: Scalars['String']['output'];
  groupUuid?: Maybe<Scalars['String']['output']>;
}

export interface GroupActionsInput {
  actionType: Scalars['String']['input'];
  actionUuid: Scalars['String']['input'];
  groupUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface GuestChildren {
  children?: Maybe<Array<OsChildren>>;
  guestName?: Maybe<Scalars['String']['output']>;
}

export interface GuestOsCpuMemHotAddInfo {
  bits: Scalars['String']['output'];
  cpuMemHotAdd: CpuMemHotAdd;
  guestOsType: Scalars['String']['output'];
  name: Scalars['String']['output'];
}

export interface GuestOsCpuMemHotAddInfoList {
  list: Array<GuestOsCpuMemHotAddInfo>;
  total: Scalars['Int']['output'];
}

export interface GuestOsType {
  children?: Maybe<Array<GuestChildren>>;
  platform: Scalars['String']['output'];
}

export interface GuestOsTypeList {
  error?: Maybe<ActionError>;
  list: Array<GuestOsType>;
}

export interface GuestTool {
  status: Scalars['String']['output'];
  version: Scalars['String']['output'];
}

export interface GuestToolFeatures {
  pvpanic?: Maybe<Scalars['String']['output']>;
  pvpanic_guest_kernel_supported?: Maybe<Scalars['String']['output']>;
  pvpanic_guest_tools_enable?: Maybe<Scalars['String']['output']>;
  pvpanic_host_enable?: Maybe<Scalars['String']['output']>;
}

export interface GuestToolInfo {
  features?: Maybe<GuestToolFeatures>;
  lowVersion?: Maybe<Scalars['Boolean']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
}

export enum GuestToolsState {
  Installed = 'Installed',
  IsRunning = 'IsRunning',
  Stopped = 'Stopped',
  Uninstall = 'Uninstall',
  Unsupport = 'Unsupport'
}

export interface GuestToolsStateInfo {
  osType?: Maybe<Scalars['String']['output']>;
  platform?: Maybe<Scalars['String']['output']>;
  qgaState?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
  zwatchState?: Maybe<GuestToolsZWatchState>;
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

export interface HAStrategic {
  haStrategic: Array<HAStrategicObj>;
}

export interface HAStrategicInput {
  action: ActionInput;
  payload: HAStrategicPayload;
}

export interface HAStrategicInputObj {
  fencerName?: InputMaybe<Scalars['String']['input']>;
  state: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface HAStrategicObj {
  fencerName: Scalars['String']['output'];
  state: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface HAStrategicPayload {
  haStrategic: Array<HAStrategicInputObj>;
  updateGlobalConfigPayload?: InputMaybe<Array<UpdateGlobalConfigPayload>>;
}

export interface HardWareStatus {
  error?: Maybe<Scalars['Int']['output']>;
  noElectric?: Maybe<Scalars['Int']['output']>;
  normal?: Maybe<Scalars['Int']['output']>;
  offline?: Maybe<Scalars['Int']['output']>;
  rebuild?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
  unknown?: Maybe<Scalars['Int']['output']>;
}

export interface HardWareSummary {
  cpu?: Maybe<HardWareStatus>;
  disk?: Maybe<HardWareStatus>;
  fan?: Maybe<HardWareStatus>;
  memory?: Maybe<HardWareStatus>;
  power?: Maybe<HardWareStatus>;
  temperatureSensor?: Maybe<HardWareStatus>;
}

export interface HardwareInfo {
  cpuModel?: Maybe<Scalars['String']['output']>;
  cpuNum?: Maybe<Scalars['Int']['output']>;
  memory?: Maybe<Scalars['Int']['output']>;
}

export enum HardwareState {
  Abnormal = 'Abnormal',
  NoElectric = 'NoElectric',
  Normal = 'Normal',
  Unknown = 'Unknown'
}

export interface Host {
  architecture?: Maybe<CpuArchitecture>;
  availableCpuCapacity?: Maybe<Scalars['Float']['output']>;
  availableMemoryCapacity?: Maybe<Scalars['Float']['output']>;
  bondRelatedVSwitch?: Maybe<Array<BondForHost>>;
  callBackIp?: Maybe<Scalars['String']['output']>;
  clusterUuid?: Maybe<Scalars['String']['output']>;
  /** CPU逻辑核数 */
  cpuNum?: Maybe<Scalars['Float']['output']>;
  cpuSockets?: Maybe<Scalars['Float']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  hostUsage?: Maybe<HostUsage>;
  hostname?: Maybe<Scalars['String']['output']>;
  hypervisorType?: Maybe<Scalars['String']['output']>;
  ipmiAddress?: Maybe<Scalars['String']['output']>;
  ipmiPassword?: Maybe<Scalars['String']['output']>;
  ipmiPort?: Maybe<Scalars['Int']['output']>;
  /** ipmiPowerStatus null的时候表示获取ipmi失败，默认 UN_CONFIGURED 没有纳管 */
  ipmiPowerStatus: HostIPMIPowerStatus;
  ipmiUsername?: Maybe<Scalars['String']['output']>;
  /** 主机IQN */
  iscsiInitiatorName?: Maybe<Scalars['String']['output']>;
  kernelInterfaces?: Maybe<KernelInterfaces>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  managementIp?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  nqn?: Maybe<Scalars['String']['output']>;
  /** 操作系统发行版，如：Ubuntu、CentOS、Debian */
  osDistribution?: Maybe<Scalars['String']['output']>;
  /** 操作系统发布版 */
  osRelease?: Maybe<Scalars['String']['output']>;
  /** 操作系统版本 */
  osVersion?: Maybe<Scalars['String']['output']>;
  resourceAttributeValues?: Maybe<Array<ResourceAttributeValue>>;
  sshPort?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<HostState>;
  status?: Maybe<HostStatus>;
  systemTags?: Maybe<Array<Scalars['String']['output']>>;
  totalCpuCapacity?: Maybe<Scalars['Float']['output']>;
  totalMemoryCapacity?: Maybe<Scalars['Float']['output']>;
  totalPhysicalMemory?: Maybe<Scalars['Float']['output']>;
  username?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface HostBlockDevices {
  available?: Maybe<Scalars['BigInt']['output']>;
  children?: Maybe<Array<HostBlockDevices>>;
  fsType?: Maybe<Scalars['String']['output']>;
  mediaType?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  mountPoint?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  serialNumber?: Maybe<Scalars['String']['output']>;
  size: Scalars['BigInt']['output'];
  smartPassed?: Maybe<Scalars['Boolean']['output']>;
  used?: Maybe<Scalars['BigInt']['output']>;
  usedRatio?: Maybe<Scalars['Int']['output']>;
}

export interface HostBondItem {
  allSlavesActive?: Maybe<Scalars['Boolean']['output']>;
  bondingName?: Maybe<Scalars['String']['output']>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  mode?: Maybe<Scalars['String']['output']>;
  xmitHashPolicy?: Maybe<Scalars['String']['output']>;
}

export interface HostCpuMemoryCapacity {
  /** CPU使用率, 平均值 */
  CPUAllUsedUtilization?: Maybe<Scalars['Float']['output']>;
  /** 可用内存(byte), 总和 */
  MemoryFreeBytes?: Maybe<Scalars['Float']['output']>;
  /** 已用内存(byte), 总和 */
  MemoryUsedBytes?: Maybe<Scalars['Float']['output']>;
  /** 内存使用百分比, 平均值 */
  MemoryUsedInPercent?: Maybe<Scalars['Float']['output']>;
  /** 总可用CPU(超分后) */
  availableCpu?: Maybe<Scalars['Float']['output']>;
  /** 总可用内存（虚拟） */
  availableMemory?: Maybe<Scalars['Float']['output']>;
  /** 总可用内存（物理） */
  availablePhysicalMemory?: Maybe<Scalars['Float']['output']>;
  /** CPU核数 */
  cpuNum?: Maybe<Scalars['Float']['output']>;
  /** CPU插槽数 */
  cpuSockets?: Maybe<Scalars['Float']['output']>;
  /** 物理机UUID */
  hostUuids?: Maybe<Array<Scalars['String']['output']>>;
  /** 可用总量（超分后的）。超分率X可用总量 */
  overProvisioningAvailableMemory?: Maybe<Scalars['Float']['output']>;
  /** 内存超分率，这里默认随机取一个host的内存超分率！！！ */
  overProvisioningMemory?: Maybe<Scalars['Float']['output']>;
  /** 超分总量。超分率X总量 */
  overProvisioningTotalMemory?: Maybe<Scalars['Float']['output']>;
  /** 保留内存（虚拟） */
  reservedMemory?: Maybe<Scalars['Float']['output']>;
  /** 保留内存（物理） */
  reservedPhysicalMemory?: Maybe<Scalars['Float']['output']>;
  /** 更新时间 */
  timestamp?: Maybe<Scalars['Float']['output']>;
  /** 总可用CPU(超分后，availableCpu = cpuNum * 超分率。超分配置如下：name: cpu.overProvisioning.ratio，category: host) */
  totalCpu?: Maybe<Scalars['Float']['output']>;
  /** CPU 总赫兹  */
  totalCpuGHz?: Maybe<Scalars['Float']['output']>;
  /** 总内存（虚拟） */
  totalMemory?: Maybe<Scalars['Float']['output']>;
  /** 总内存（物理） */
  totalPhysicalMemory?: Maybe<Scalars['Float']['output']>;
}

export interface HostGlobalConfig {
  /** 超分后的可用CPU。 */
  availableCpu?: Maybe<Scalars['Float']['output']>;
  /** 可用物理内存，后端已经去除了保留内存。 */
  availableCpuMemoryCapacity?: Maybe<Scalars['Float']['output']>;
  /** 可用物理内存，后端已经去除了保留内存。 */
  availableMemory?: Maybe<Scalars['Float']['output']>;
  /** 总物理CPU。 */
  managedCpuNum?: Maybe<Scalars['Float']['output']>;
  /** 内存超分率 */
  memoryOverProvisioning?: Maybe<Scalars['Float']['output']>;
  /** 可用总量（超分后的）。超分率X可用总量。 */
  overProvisioningAvailableMemory?: Maybe<Scalars['Float']['output']>;
  /** 总量（超分后的）。超分率X总量。 */
  overProvisioningTotalMemory?: Maybe<Scalars['Float']['output']>;
  /** 保留内存，优先取host的保留内存，如果没有设置则取cluster的保留内存，如果还是没有设置则取全局配置。 */
  reservedMemory?: Maybe<Scalars['String']['output']>;
  /** 超分后的总CPU。 */
  totalCpu?: Maybe<Scalars['Float']['output']>;
  /** 总物理内存。 */
  totalMemory?: Maybe<Scalars['Float']['output']>;
}

export interface HostGroup {
  /** 当前物理机调度组关联的云主机调度策略数量 */
  associatedVmSchedulingRuleList?: Maybe<Array<VmSchedulingRule>>;
  cluster?: Maybe<Cluster>;
  clusterUuid?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  /** 资源的详细描述 */
  description?: Maybe<Scalars['String']['output']>;
  /** 当前物理机调度组拥有的物理机数量 */
  hostCount?: Maybe<Scalars['Float']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  /** 资源名称 */
  name: Scalars['String']['output'];
  owner?: Maybe<CommonOwner>;
  /** 资源的UUID，唯一标示该资源 */
  uuid: Scalars['String']['output'];
  /** 当前物理机调度组关联的物理机调度策略数量 */
  vmSchedulingRuleCount?: Maybe<Scalars['Float']['output']>;
  zone?: Maybe<Zone>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface HostGroupList {
  error?: Maybe<ActionError>;
  list: Array<HostGroup>;
  total: Scalars['Int']['output'];
}

export interface HostGroupNameAndUuidForHost {
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export enum HostGroupQueryType {
  Normal = 'Normal'
}

export interface HostHardwareInfo {
  biosReleaseDate?: Maybe<Scalars['String']['output']>;
  biosVendor?: Maybe<Scalars['String']['output']>;
  biosVersion?: Maybe<Scalars['String']['output']>;
  bmcVersion?: Maybe<Scalars['String']['output']>;
  ipmiAddress?: Maybe<Scalars['String']['output']>;
  manufacturer?: Maybe<Scalars['String']['output']>;
  productName?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  systemUuid?: Maybe<Scalars['String']['output']>;
  uptime?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export enum HostIPMIPowerStatus {
  POWER_BOOTING = 'POWER_BOOTING',
  POWER_OFF = 'POWER_OFF',
  POWER_ON = 'POWER_ON',
  POWER_SHUTDOWN = 'POWER_SHUTDOWN',
  POWER_UNKNOWN = 'POWER_UNKNOWN',
  UN_CONFIGURED = 'UN_CONFIGURED'
}

export interface HostInPciDevice {
  cluster?: Maybe<Scalars['String']['output']>;
  clusterUuid?: Maybe<Scalars['String']['output']>;
  managementIp?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface HostIommu {
  state?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
}

export interface HostKernelInterface {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  host?: Maybe<HostVO>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  l2NetworkUuid?: Maybe<Scalars['String']['output']>;
  l3Network?: Maybe<L3Network>;
  l3NetworkUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  trafficTypes?: Maybe<Array<KernelTrafficTypes>>;
  usedIps?: Maybe<Array<UsedIp>>;
  uuid: Scalars['String']['output'];
}

export interface HostKernelInterfaceList {
  error?: Maybe<ActionError>;
  list: Array<HostKernelInterface>;
  total: Scalars['Int']['output'];
}

export enum HostKernelInterfaceQueryType {
  Normal = 'Normal'
}

export interface HostLabels {
  CPUNum?: Maybe<Scalars['String']['output']>;
  DiskDeviceLetter?: Maybe<Scalars['String']['output']>;
  HostUuid: Scalars['String']['output'];
  NetworkDeviceLetter?: Maybe<Scalars['String']['output']>;
}

export interface HostMetricData {
  label?: Maybe<Scalars['String']['output']>;
  labels: HostLabels;
  metricName: Scalars['String']['output'];
  time: Scalars['Float']['output'];
  type: Scalars['String']['output'];
  value: Scalars['Float']['output'];
}

export interface HostNUMANode {
  numaNodeList: Array<NumaNodeItem>;
  pCPUUsedList: Array<PCPUUsedItem>;
}

export interface HostNUMATopology {
  VMsUuid: Array<Scalars['String']['output']>;
  cpus: Array<Scalars['String']['output']>;
  free: Scalars['Float']['output'];
  node: Scalars['Int']['output'];
  size: Scalars['Float']['output'];
}

export interface HostNameAndUuid {
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface HostNameAndUuidForBond {
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface HostNameAndUuidForCluster {
  name: Scalars['String']['output'];
  state?: Maybe<HostState>;
  status?: Maybe<HostStatus>;
  uuid: Scalars['String']['output'];
}

export interface HostNameAndUuidForDRSAdvice {
  managementIp?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface HostNameAndUuidForVmMigrationActivity {
  name?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface HostNetworkBondingServiceRef {
  bondingUuid: Scalars['String']['output'];
  createDate?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  serviceType?: Maybe<PhysicalNetworkType>;
  serviceTypes?: Maybe<Array<PhysicalNetworkType>>;
  vlanId?: Maybe<Scalars['Int']['output']>;
}

export interface HostNetworkInterface {
  carrierActive?: Maybe<Scalars['Boolean']['output']>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  interfaceName?: Maybe<Scalars['String']['output']>;
  offloadStatus?: Maybe<Scalars['String']['output']>;
  readyState?: Maybe<ReadyState>;
  speed?: Maybe<Scalars['Float']['output']>;
  state?: Maybe<NicState>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface HostNetworkInterfaceServiceRef {
  createDate?: Maybe<Scalars['String']['output']>;
  interfaceUuid: Scalars['String']['output'];
  lastOpDate?: Maybe<Scalars['String']['output']>;
  serviceType?: Maybe<PhysicalNetworkType>;
  serviceTypes?: Maybe<Array<PhysicalNetworkType>>;
  vlanId?: Maybe<Scalars['Int']['output']>;
}

export interface HostNicItem {
  carrierActive?: Maybe<Scalars['Boolean']['output']>;
  interfaceName?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface HostNodeInfo {
  nodeType?: Maybe<NodeType>;
  ownsVip?: Maybe<Scalars['Boolean']['output']>;
}

export interface HostPerformance {
  CPUAllUsedUtilization?: Maybe<Scalars['String']['output']>;
  DiskAllReadBytes?: Maybe<Scalars['String']['output']>;
  DiskAllReadOps?: Maybe<Scalars['String']['output']>;
  DiskAllUsedCapacityInBytes?: Maybe<Scalars['String']['output']>;
  DiskAllUsedCapacityInPercent?: Maybe<Scalars['String']['output']>;
  DiskAllWriteBytes?: Maybe<Scalars['String']['output']>;
  DiskAllWriteOps?: Maybe<Scalars['String']['output']>;
  MemoryUsedInPercent?: Maybe<Scalars['String']['output']>;
  NetworkAllInBytes?: Maybe<Scalars['String']['output']>;
  NetworkAllInErrors?: Maybe<Scalars['String']['output']>;
  NetworkAllInPackets?: Maybe<Scalars['String']['output']>;
  NetworkAllOutBytes?: Maybe<Scalars['String']['output']>;
  NetworkAllOutErrors?: Maybe<Scalars['String']['output']>;
  NetworkAllOutPackets?: Maybe<Scalars['String']['output']>;
  architecture?: Maybe<CpuArchitecture>;
  availableCpuCapacity?: Maybe<Scalars['Float']['output']>;
  availableMemoryCapacity?: Maybe<Scalars['Float']['output']>;
  bondRelatedVSwitch?: Maybe<Array<BondForHost>>;
  callBackIp?: Maybe<Scalars['String']['output']>;
  clusterUuid?: Maybe<Scalars['String']['output']>;
  /** CPU逻辑核数 */
  cpuNum?: Maybe<Scalars['Float']['output']>;
  cpuSockets?: Maybe<Scalars['Float']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  hostUsage?: Maybe<HostUsage>;
  hostname?: Maybe<Scalars['String']['output']>;
  hypervisorType?: Maybe<Scalars['String']['output']>;
  ipmiAddress?: Maybe<Scalars['String']['output']>;
  ipmiPassword?: Maybe<Scalars['String']['output']>;
  ipmiPort?: Maybe<Scalars['Int']['output']>;
  /** ipmiPowerStatus null的时候表示获取ipmi失败，默认 UN_CONFIGURED 没有纳管 */
  ipmiPowerStatus: HostIPMIPowerStatus;
  ipmiUsername?: Maybe<Scalars['String']['output']>;
  /** 主机IQN */
  iscsiInitiatorName?: Maybe<Scalars['String']['output']>;
  kernelInterfaces?: Maybe<KernelInterfaces>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  managementIp?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  nqn?: Maybe<Scalars['String']['output']>;
  /** 操作系统发行版，如：Ubuntu、CentOS、Debian */
  osDistribution?: Maybe<Scalars['String']['output']>;
  /** 操作系统发布版 */
  osRelease?: Maybe<Scalars['String']['output']>;
  /** 操作系统版本 */
  osVersion?: Maybe<Scalars['String']['output']>;
  resourceAttributeValues?: Maybe<Array<ResourceAttributeValue>>;
  sshPort?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<HostState>;
  status?: Maybe<HostStatus>;
  systemTags?: Maybe<Array<Scalars['String']['output']>>;
  totalCpuCapacity?: Maybe<Scalars['Float']['output']>;
  totalMemoryCapacity?: Maybe<Scalars['Float']['output']>;
  totalPhysicalMemory?: Maybe<Scalars['Float']['output']>;
  username?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  zoneUuid?: Maybe<Scalars['String']['output']>;
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

export interface HostPerformanceQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<HostPerformance>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface HostPhysicalCpu {
  coreCount?: Maybe<Scalars['Int']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  currentSpeed?: Maybe<Scalars['String']['output']>;
  hostUuid: Scalars['String']['output'];
  lastOpDate?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  socketDesignation?: Maybe<Scalars['String']['output']>;
  threadCount?: Maybe<Scalars['Int']['output']>;
  uuid: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
}

export interface HostPowerControlRelatedSummary {
  cephLocalStorage?: Maybe<Scalars['Int']['output']>;
  loadbalance?: Maybe<Scalars['Int']['output']>;
  vm?: Maybe<Scalars['Int']['output']>;
  volume?: Maybe<Scalars['Int']['output']>;
  vpcRouter?: Maybe<Scalars['Int']['output']>;
}

export interface HostQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<HostVO>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
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

export interface HostRelatedSummary {
  cpu?: Maybe<Scalars['Int']['output']>;
  gpu?: Maybe<Scalars['Int']['output']>;
  memory?: Maybe<Scalars['Int']['output']>;
  nvmeLun?: Maybe<Scalars['Int']['output']>;
  pci?: Maybe<Scalars['Int']['output']>;
  pciPassthrough?: Maybe<Scalars['Int']['output']>;
  physicalNic?: Maybe<Scalars['Int']['output']>;
  power?: Maybe<Scalars['Int']['output']>;
  scsiLun?: Maybe<Scalars['Int']['output']>;
  storageAdapter?: Maybe<Scalars['Int']['output']>;
  usb?: Maybe<Scalars['Int']['output']>;
  vGpu?: Maybe<Scalars['Int']['output']>;
  vm?: Maybe<Scalars['Int']['output']>;
}

export interface HostResourceAllocation {
  vCPUPin: Array<VCPUPinItem>;
}

export interface HostSlotInfo {
  memorySlotsMaximum?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
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

export interface HostSummary {
  connected: Scalars['Int']['output'];
  connecting: Scalars['Int']['output'];
  disabled?: Maybe<Scalars['Int']['output']>;
  disconnected: Scalars['Int']['output'];
  enabled?: Maybe<Scalars['Int']['output']>;
  maintenance?: Maybe<Scalars['Int']['output']>;
  other?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface HostSystemInfo {
  /** CPU主频 */
  cpuGHz?: Maybe<Scalars['String']['output']>;
  cpuModelName?: Maybe<Scalars['String']['output']>;
  /** CPU逻辑核数 */
  cpuProcessorNum?: Maybe<Scalars['Float']['output']>;
  /** CPU核心相关信息，为什么这么拿： */
  cpuSocketCoreThread?: Maybe<CPUSocketCoreThread>;
  ept?: Maybe<Scalars['Boolean']['output']>;
  eptUuid?: Maybe<Scalars['String']['output']>;
  hostCpuModelName?: Maybe<Scalars['String']['output']>;
  /** IPMI地址 */
  ipmiAddress?: Maybe<Scalars['String']['output']>;
  /** 主机型号 */
  systemProductName?: Maybe<Scalars['String']['output']>;
  /** SN号 */
  systemSerialNumber?: Maybe<Scalars['String']['output']>;
}

export interface HostUsage {
  cpuUsed?: Maybe<Scalars['Float']['output']>;
  memoryUsed?: Maybe<Scalars['Float']['output']>;
  storageUsed?: Maybe<Scalars['Float']['output']>;
}

export interface HostVO {
  architecture?: Maybe<CpuArchitecture>;
  availableCpuCapacity?: Maybe<Scalars['Float']['output']>;
  availableMemoryCapacity?: Maybe<Scalars['Float']['output']>;
  bondList: Array<BondForHost>;
  bondRelatedVSwitch?: Maybe<Array<BondForHost>>;
  callBackIp?: Maybe<Scalars['String']['output']>;
  cluster?: Maybe<Cluster>;
  clusterUuid?: Maybe<Scalars['String']['output']>;
  connectedTime?: Maybe<Scalars['String']['output']>;
  /** CPU逻辑核数 */
  cpuNum?: Maybe<Scalars['Float']['output']>;
  cpuSockets?: Maybe<Scalars['Float']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  extraIps?: Maybe<Scalars['String']['output']>;
  globalConifg?: Maybe<HostGlobalConfig>;
  hostGroup?: Maybe<HostGroupNameAndUuidForHost>;
  hostIommu?: Maybe<HostIommu>;
  hostNodeInfo?: Maybe<HostNodeInfo>;
  hostSystemInfo?: Maybe<HostSystemInfo>;
  hostTopology?: Maybe<Scalars['Boolean']['output']>;
  hostUsage?: Maybe<HostUsage>;
  hostZWatchInfo?: Maybe<HostZWatchInfo>;
  hostname?: Maybe<Scalars['String']['output']>;
  hypervisorType?: Maybe<Scalars['String']['output']>;
  ipmiAddress?: Maybe<Scalars['String']['output']>;
  ipmiPassword?: Maybe<Scalars['String']['output']>;
  ipmiPort?: Maybe<Scalars['Int']['output']>;
  /** ipmiPowerStatus null的时候表示获取ipmi失败，默认 UN_CONFIGURED 没有纳管 */
  ipmiPowerStatus: HostIPMIPowerStatus;
  ipmiUsername?: Maybe<Scalars['String']['output']>;
  /** 主机IQN */
  iscsiInitiatorName?: Maybe<Scalars['String']['output']>;
  kernelInterfaces?: Maybe<KernelInterfaces>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  localStorageHostCapacity: LocalStorageHostCapacity;
  localStorageHostDiskCapacity?: Maybe<LocalStorageHostDiskCapacity>;
  managementIp?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  nqn?: Maybe<Scalars['String']['output']>;
  /** 操作系统发行版，如：Ubuntu、CentOS、Debian */
  osDistribution?: Maybe<Scalars['String']['output']>;
  /** 操作系统发布版 */
  osRelease?: Maybe<Scalars['String']['output']>;
  /** 操作系统版本 */
  osVersion?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<AccountOwner>;
  physicalNicList: Array<PhysicalNic>;
  qemuState?: Maybe<Scalars['String']['output']>;
  relatedVmCount?: Maybe<Scalars['Int']['output']>;
  relatedVolumeCount?: Maybe<Scalars['Int']['output']>;
  resourceAttributeValues?: Maybe<Array<ResourceAttributeValue>>;
  sshPort?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<HostState>;
  status?: Maybe<HostStatus>;
  systemTags?: Maybe<Array<Scalars['String']['output']>>;
  tag?: Maybe<Array<Tag>>;
  totalCpuCapacity?: Maybe<Scalars['Float']['output']>;
  totalMemoryCapacity?: Maybe<Scalars['Float']['output']>;
  totalPhysicalMemory?: Maybe<Scalars['Float']['output']>;
  username?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  zone?: Maybe<Zone>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}


export interface HostVOlocalStorageHostDiskCapacityArgs {
  primaryStorageUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface HostWebTerminal {
  url?: Maybe<Scalars['String']['output']>;
}

export interface HostZWatchInfo {
  cpuAllIdleUtilization?: Maybe<Scalars['String']['output']>;
  /** CPU使用率 */
  cpuAllUsedUtilization?: Maybe<Scalars['String']['output']>;
  /** 内存可用容量 */
  memoryFreeBytes?: Maybe<Scalars['String']['output']>;
  memoryFreeInPercent?: Maybe<Scalars['String']['output']>;
  /** 内存使用率 */
  memoryUsedInPercent?: Maybe<Scalars['String']['output']>;
}

export interface Hostname {
  hostname?: Maybe<Scalars['String']['output']>;
}

export interface HttpEndPoint extends BasicEndPoint {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<Owner>;
  platformUuid?: Maybe<Scalars['String']['output']>;
  state?: Maybe<EndPointState>;
  topic?: Maybe<SNSTopic>;
  type?: Maybe<EndPointType>;
  url?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface HybridAccountInventory {
  akey?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  hybridAccountId?: Maybe<Scalars['String']['output']>;
  hybridUserName?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<AccessKeyOwner>;
  uuid: Scalars['String']['output'];
}

export interface IError {
  cause?: Maybe<Scalars['Int']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
}

export interface IResourceConfigs {
  category: Scalars['String']['input'];
  name: Scalars['String']['input'];
  value: Scalars['String']['input'];
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

export interface Image {
  actualSize: Scalars['Float']['output'];
  architecture?: Maybe<CpuArchitecture>;
  /** UserVm, 状态非Destroyed */
  availableUserVm?: Maybe<Scalars['Float']['output']>;
  backupStorage?: Maybe<BackupStorage>;
  backupStorageRefs?: Maybe<Array<BackupStorageRef>>;
  baremetal2Image?: Maybe<Scalars['Boolean']['output']>;
  bootMode?: Maybe<ImageBootMode>;
  createDate: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  exportUrl?: Maybe<Scalars['String']['output']>;
  format?: Maybe<ImageFormat>;
  guestOsType?: Maybe<Scalars['String']['output']>;
  isZmigrateImage?: Maybe<Scalars['Boolean']['output']>;
  lastOpDate: Scalars['String']['output'];
  md5Sum?: Maybe<Scalars['String']['output']>;
  mediaType: ImageMediaType;
  name: Scalars['String']['output'];
  owner?: Maybe<Owner>;
  platform?: Maybe<ImagePlatform>;
  qga?: Maybe<Scalars['Boolean']['output']>;
  shareType?: Maybe<ShareType>;
  size: Scalars['Float']['output'];
  state: ImageState;
  status: ImageStatus;
  system: Scalars['Boolean']['output'];
  toPublic?: Maybe<Scalars['Boolean']['output']>;
  type: Scalars['String']['output'];
  url: Scalars['String']['output'];
  useFor?: Maybe<ImageUseFor>;
  uuid: Scalars['String']['output'];
  virtio?: Maybe<Scalars['Boolean']['output']>;
}

export interface ImageBaseUpdate {
  description?: InputMaybe<Scalars['String']['input']>;
  format?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export enum ImageBootMode {
  Legacy = 'Legacy',
  UEFI = 'UEFI',
  UEFI_WITH_CSM = 'UEFI_WITH_CSM'
}

export interface ImageChangeBackupStorage {
  dstBackupStorageUuid?: InputMaybe<Scalars['String']['input']>;
  srcBackupStorageUuid?: InputMaybe<Scalars['String']['input']>;
}

export enum ImageFormat {
  iso = 'iso',
  qcow2 = 'qcow2',
  raw = 'raw',
  vmtx = 'vmtx'
}

export interface ImageList {
  error?: Maybe<ActionError>;
  list: Array<Image>;
  total: Scalars['Int']['output'];
}

export enum ImageMediaType {
  DataVolumeTemplate = 'DataVolumeTemplate',
  ISO = 'ISO',
  RootVolumeTemplate = 'RootVolumeTemplate'
}

export interface ImageModidyConfigPayload {
  baseUpdate: ImageBaseUpdate;
  changeBackupStorage?: InputMaybe<ImageChangeBackupStorage>;
}

export interface ImageModifyConfigInput {
  action: ActionInput;
  payload: ImageModidyConfigPayload;
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

export interface ImageSummary {
  available?: Maybe<Scalars['Int']['output']>;
  destroyed?: Maybe<Scalars['Int']['output']>;
  exported: Scalars['Int']['output'];
  total?: Maybe<Scalars['Int']['output']>;
}

export enum ImageUseFor {
  SLB = 'SLB',
  vrouter = 'vrouter'
}

export interface InspectBaremetalChassisInput {
  action: ActionInput;
  payload: Array<InspectBaremetalChassisPayload>;
}

export interface InspectBaremetalChassisPayload {
  uuid: Scalars['String']['input'];
}

export interface InspectionItem {
  /** 名称描述 */
  desc?: Maybe<Scalars['String']['output']>;
  /** 是否有严重提示 */
  hasCritical?: Maybe<Scalars['Boolean']['output']>;
  /** 是否有警告提示 */
  hasWarn?: Maybe<Scalars['Boolean']['output']>;
  /** 健康状态 */
  healthState?: Maybe<InspectionSubTaskHealthState>;
  key?: Maybe<Scalars['String']['output']>;
  /** 名称 */
  name?: Maybe<Scalars['String']['output']>;
  /** 原始数据 */
  originOutput?: Maybe<Array<InspectionOriginItem>>;
  /** 状态 */
  state?: Maybe<InspectionSubTaskState>;
  /** 子任务名称 */
  subTaskName?: Maybe<Scalars['String']['output']>;
  /** 标签分类 */
  tag?: Maybe<Scalars['String']['output']>;
}

export interface InspectionItemTree {
  children?: Maybe<Array<InspectionItem>>;
  key?: Maybe<Scalars['String']['output']>;
}

export interface InspectionOriginItem {
  errInfo?: Maybe<Scalars['String']['output']>;
  expr?: Maybe<Scalars['String']['output']>;
  grade?: Maybe<Scalars['Int']['output']>;
  /** 健康状态 */
  healthState?: Maybe<InspectionSubTaskHealthState>;
  ip?: Maybe<Scalars['String']['output']>;
  origin?: Maybe<Scalars['String']['output']>;
  resourceName?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  resourceUuid?: Maybe<Scalars['String']['output']>;
  simpleErr?: Maybe<Scalars['String']['output']>;
}

export interface InspectionResource {
  /** 镜像服务器数量 */
  backupStorage?: Maybe<Scalars['Float']['output']>;
  /** 物理机数量 */
  host?: Maybe<Scalars['Float']['output']>;
  /** 主存储数量 */
  primaryStorage?: Maybe<Scalars['Float']['output']>;
  /** 云主机数量 */
  vmInstance?: Maybe<Scalars['Float']['output']>;
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

export interface InspectionTask {
  /** 当前执行任务 */
  currentSubTask?: Maybe<Scalars['String']['output']>;
  /** 结束时间 */
  endTime?: Maybe<Scalars['Float']['output']>;
  /** 异常任务数 */
  error?: Maybe<Scalars['Float']['output']>;
  /** 总分 */
  grade?: Maybe<Scalars['Float']['output']>;
  /** 子任务 */
  itemTree?: Maybe<Array<InspectionItemTree>>;
  /** 正常任务数 */
  normal?: Maybe<Scalars['Float']['output']>;
  /** 进度 */
  progress?: Maybe<Scalars['Float']['output']>;
  /** 用时 */
  runTime?: Maybe<Scalars['Float']['output']>;
  /** 开始时间 */
  startTime?: Maybe<Scalars['Float']['output']>;
  /** 状态 */
  state?: Maybe<InspectionTaskState>;
  taskUuid?: Maybe<Scalars['String']['output']>;
  /** 总任务数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface InspectionTaskOutputResp {
  list: Array<InspectionOriginItem>;
  total: Scalars['Int']['output'];
}

export enum InspectionTaskState {
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
  INIT = 'INIT',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  SUSPENDED = 'SUSPENDED'
}

export interface InstallMigrationServiceInput {
  action: ActionInput;
  payload: Array<InstallMigrationServicePayload>;
}

export interface InstallMigrationServicePayload {
  /** 配置JSON字符串 */
  config?: InputMaybe<Scalars['String']['input']>;
  /** 重新安装时是否需要清理 */
  needClear?: InputMaybe<Scalars['Boolean']['input']>;
  /** 安装包UUID */
  uuid: Scalars['String']['input'];
}

export interface InstallPathRecycle {
  createDate?: Maybe<Scalars['String']['output']>;
  hypervisorType?: Maybe<Scalars['String']['output']>;
  installPath?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  resourceUuid?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
  storageType?: Maybe<Scalars['String']['output']>;
  storageUuid?: Maybe<Scalars['String']['output']>;
  trashId?: Maybe<Scalars['String']['output']>;
  trashType?: Maybe<Scalars['String']['output']>;
}

export interface InstallPathRecycleResp {
  error?: Maybe<ActionError>;
  list: Array<InstallPathRecycle>;
  total: Scalars['Int']['output'];
}

export interface InstanceOffering {
  allocatorStrategy: AllocatorStrategyType;
  cpuNum: Scalars['Int']['output'];
  cpuSpeed?: Maybe<Scalars['Int']['output']>;
  createDate: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  memorySize: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  /** 内存预留大小 */
  reservedMemorySize?: Maybe<Scalars['Float']['output']>;
  shareType: ShareType;
  sortKey?: Maybe<Scalars['Int']['output']>;
  state: Scalars['String']['output'];
  systemTags: InstanceOfferingSystemTags;
  toPublic?: Maybe<Scalars['Boolean']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface InstanceOfferingActionResp {
  error?: Maybe<ActionError>;
  inventory?: Maybe<InstanceOffering>;
}

export interface InstanceOfferingQueryResp {
  list?: Maybe<Array<InstanceOffering>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface InstanceOfferingSystemTags {
  instanceOfferingUserConfig?: Maybe<Scalars['String']['output']>;
  maxInstancePerHost?: Maybe<Scalars['String']['output']>;
  minimumCPUUsageHostAllocatorStrategyMode?: Maybe<Scalars['String']['output']>;
  minimumMemoryUsageHostAllocatorStrategyMode?: Maybe<Scalars['String']['output']>;
  networkInboundBandwidth?: Maybe<Scalars['String']['output']>;
  networkOutboundBandwidth?: Maybe<Scalars['String']['output']>;
  volumeReadBandwidth?: Maybe<Scalars['String']['output']>;
  volumeReadIops?: Maybe<Scalars['String']['output']>;
  volumeTotalBandwidth?: Maybe<Scalars['String']['output']>;
  volumeTotalIops?: Maybe<Scalars['String']['output']>;
  volumeWriteBandwidth?: Maybe<Scalars['String']['output']>;
  volumeWriteIops?: Maybe<Scalars['String']['output']>;
}

export interface InstanceStatistics {
  instanceTotal?: Maybe<Scalars['Int']['output']>;
  instanceTypeCount?: Maybe<Scalars['Int']['output']>;
  unhealthyInstanceCount?: Maybe<Scalars['Int']['output']>;
}

export interface InterfaceLLDPModePayload {
  interfaceUuids: Array<Scalars['String']['input']>;
  mode: Scalars['String']['input'];
}

export interface InterfaceService {
  clusterName: Scalars['String']['output'];
  hostIp: Scalars['String']['output'];
  hostName: Scalars['String']['output'];
  hostUuid: Scalars['String']['output'];
  interfaceName: Scalars['String']['output'];
  interfaceUuid: Scalars['String']['output'];
  serviceTypes: Array<PhysicalNetworkType>;
  uuid: Scalars['String']['output'];
  vlanId?: Maybe<Scalars['String']['output']>;
}

export interface InterfaceServiceList {
  error?: Maybe<ActionError>;
  list: Array<InterfaceService>;
  total: Scalars['Int']['output'];
}

export enum InterfaceServiceQueryType {
  Normal = 'Normal'
}

export interface InternalTimeServerCandidate {
  /** 时间源地址 */
  hostname: Scalars['String']['output'];
  /** 是否管理节点 */
  isManagementNode?: Maybe<Scalars['Boolean']['output']>;
}

export interface InternalTimeServerCandidateResult {
  /** 时间源集合 */
  servers: Array<InternalTimeServerCandidate>;
}

export interface IpBlackWhiteList {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** 数据保护是否通过 */
  isValid?: Maybe<Scalars['Boolean']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  rule?: Maybe<Scalars['String']['output']>;
  strategy?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface IpBlackWhiteListQueryResp {
  list?: Maybe<Array<IpBlackWhiteList>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface IpCapacity {
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  ipv4AvailableCapacity?: Maybe<Scalars['Float']['output']>;
  ipv4TotalCapacity?: Maybe<Scalars['Float']['output']>;
  ipv4UsedIpAddressNumber?: Maybe<Scalars['Float']['output']>;
  ipv6AvailableCapacity?: Maybe<Scalars['Float']['output']>;
  ipv6TotalCapacity?: Maybe<Scalars['Float']['output']>;
  totalCapacity?: Maybe<Scalars['Float']['output']>;
}

export interface IpRange {
  addressMode?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  endIp?: Maybe<Scalars['String']['output']>;
  gateway?: Maybe<Scalars['String']['output']>;
  /** ip可用量 */
  ipCapacity?: Maybe<IpCapacity>;
  ipRangeType?: Maybe<Scalars['String']['output']>;
  ipVersion?: Maybe<Scalars['Int']['output']>;
  l3NetworkUuid?: Maybe<Scalars['String']['output']>;
  linkResource?: Maybe<LinkResourceOfIpRange>;
  name?: Maybe<Scalars['String']['output']>;
  netmask?: Maybe<Scalars['String']['output']>;
  networkCidr?: Maybe<Scalars['String']['output']>;
  prefixLen?: Maybe<Scalars['String']['output']>;
  shareType: ShareType;
  startIp?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface IpRangeCountResp {
  ipv4Num: Scalars['Int']['output'];
  ipv6Num: Scalars['Int']['output'];
}

export interface IpRangeListResp {
  list: Array<IpRange>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface IpStatistics {
  applianceVmOwnerUuid?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  hostKernelInterface?: Maybe<HostKernelInterface>;
  ip?: Maybe<Scalars['String']['output']>;
  ownerName?: Maybe<Scalars['String']['output']>;
  resourceOwnerUuid?: Maybe<Scalars['String']['output']>;
  resourceTypes?: Maybe<Array<Scalars['String']['output']>>;
  state?: Maybe<Scalars['String']['output']>;
  templatedVmInstance?: Maybe<VmInstance>;
  useFor?: Maybe<Scalars['String']['output']>;
  vipName?: Maybe<Scalars['String']['output']>;
  vipUuid?: Maybe<Scalars['String']['output']>;
  vmDefaultIp?: Maybe<Scalars['String']['output']>;
  vmInstance?: Maybe<VmInstance>;
  vmInstanceName?: Maybe<Scalars['String']['output']>;
  vmInstanceType?: Maybe<Scalars['String']['output']>;
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
}

export interface IscsiLun {
  createDate?: Maybe<Scalars['String']['output']>;
  hctl?: Maybe<Scalars['String']['output']>;
  healthState?: Maybe<Scalars['String']['output']>;
  iscsiTargetUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  multipathDeviceUuid?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  path?: Maybe<Scalars['String']['output']>;
  scsiLunHostRefs: Array<ScsiLunHostRefInventory>;
  scsiLunVmInstanceRefs: Array<ScsiLunVmInstanceRefInventory>;
  serial?: Maybe<Scalars['String']['output']>;
  size: Scalars['Float']['output'];
  source?: Maybe<LunSource>;
  state?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vendor?: Maybe<Scalars['String']['output']>;
  wwid?: Maybe<Scalars['String']['output']>;
  wwn?: Maybe<Scalars['String']['output']>;
}


export interface IscsiLunhealthStateArgs {
  hostUuid: Scalars['String']['input'];
}

export interface IscsiLunList {
  error?: Maybe<ActionError>;
  list: Array<IscsiLun>;
  total: Scalars['Int']['output'];
}

export interface IscsiServer {
  chapUserName?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  iscsiClusterRefs: Array<IscsiServerClusterRefInventory>;
  iscsiTargets: Array<IscsiTargetInventory>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  lunDeviceUsageInfo?: Maybe<IscsiServerLUNDeviceUsageInfo>;
  name: Scalars['String']['output'];
  port?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  /** iscsi server 挂载集群所在的zone，没有挂载集群则无zone */
  zones?: Maybe<Array<Zone>>;
}

export interface IscsiServerClusterRefInventory {
  clusterUuid?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  iscsiServerUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
}

export interface IscsiServerLUNDeviceUsageInfo {
  totalLunNum?: Maybe<Scalars['Float']['output']>;
  unusedLunNum?: Maybe<Scalars['Float']['output']>;
  /** 1，SharedBlock 中 diskUuid 和 lun中 wwid 匹配。2， ScsiLunVmInstanceRef 中关联的有VM */
  usedLunNum?: Maybe<Scalars['Float']['output']>;
}

export interface IscsiServerList {
  error?: Maybe<ActionError>;
  list: Array<IscsiServer>;
  total: Scalars['Int']['output'];
}

export enum IscsiServerQueryType {
  GET_CLUSTER_ATTACHABLE_ISCSI_SERVER = 'GET_CLUSTER_ATTACHABLE_ISCSI_SERVER',
  NORMAL = 'NORMAL'
}

export interface IscsiServerRelateSummary {
  primaryStorageCount?: Maybe<Scalars['Float']['output']>;
  vmInstanceCount: Scalars['Float']['output'];
  volumeCount: Scalars['Float']['output'];
}

export interface IscsiTargetInventory {
  createDate?: Maybe<Scalars['String']['output']>;
  iqn?: Maybe<Scalars['String']['output']>;
  iscsiLuns: Array<IscsiLun>;
  iscsiServerAddress?: Maybe<Scalars['String']['output']>;
  iscsiServerUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface IscsiTargetListResponse {
  /** 查询结果列表 */
  list?: Maybe<Array<IscsiTargetInventory>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface KernelInterfaces {
  /** 存储IP(Cluster) */
  clusterStorageIP?: Maybe<Scalars['String']['output']>;
  /** 外部网络CIDR配置是否匹配 */
  externalNetworkCidrMatched?: Maybe<Scalars['Boolean']['output']>;
  /** 主机是否有多个CIDR下的IP */
  hasMultipleCidrIps?: Maybe<Scalars['Boolean']['output']>;
  hostUuid: Scalars['String']['output'];
  /** 内部网络CIDR配置是否匹配 */
  internalNetworkCidrMatched?: Maybe<Scalars['Boolean']['output']>;
  /** 存储IP(Public) */
  publicStorageIp?: Maybe<Scalars['String']['output']>;
}

export enum KernelTrafficTypes {
  Management = 'Management',
  Storage = 'Storage'
}

export interface KmsCertInfo {
  C?: Maybe<Scalars['String']['output']>;
  L?: Maybe<Scalars['String']['output']>;
  O?: Maybe<Scalars['String']['output']>;
  OU?: Maybe<Scalars['String']['output']>;
  ST?: Maybe<Scalars['String']['output']>;
  bits?: Maybe<Scalars['Int']['output']>;
  duration?: Maybe<Scalars['String']['output']>;
  emailAddress?: Maybe<Scalars['String']['output']>;
  expireTime?: Maybe<Scalars['String']['output']>;
  fingerprint?: Maybe<Scalars['String']['output']>;
  issueCN?: Maybe<Scalars['String']['output']>;
  issueTime?: Maybe<Scalars['String']['output']>;
  keyAlgorithm?: Maybe<Scalars['String']['output']>;
  serial?: Maybe<Scalars['String']['output']>;
  signatureAlgorithm?: Maybe<Scalars['String']['output']>;
  subC?: Maybe<Scalars['String']['output']>;
  subCN?: Maybe<Scalars['String']['output']>;
  subEmailAddress?: Maybe<Scalars['String']['output']>;
  subL?: Maybe<Scalars['String']['output']>;
  subO?: Maybe<Scalars['String']['output']>;
  subOU?: Maybe<Scalars['String']['output']>;
  subST?: Maybe<Scalars['String']['output']>;
  validating?: Maybe<Scalars['Boolean']['output']>;
  version?: Maybe<Scalars['String']['output']>;
}

export interface KmsCsrSubject {
  C?: InputMaybe<Scalars['String']['input']>;
  CN?: InputMaybe<Scalars['String']['input']>;
  L?: InputMaybe<Scalars['String']['input']>;
  O?: InputMaybe<Scalars['String']['input']>;
  OU?: InputMaybe<Scalars['String']['input']>;
  ST?: InputMaybe<Scalars['String']['input']>;
  emailAddress?: InputMaybe<Scalars['String']['input']>;
}

export interface KmsIdentity {
  certExpiredDate?: Maybe<Scalars['String']['output']>;
  clientCertPem?: Maybe<Scalars['String']['output']>;
  clientKeyPem?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  csrPem?: Maybe<Scalars['String']['output']>;
  identityType: Scalars['String']['output'];
  kmsUuid: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface KmsIdentityListResp {
  list: Array<KmsIdentity>;
  total: Scalars['Int']['output'];
}

export interface KmsProvider {
  activeIdentity?: Maybe<KmsIdentity>;
  activeIdentityUuid?: Maybe<Scalars['String']['output']>;
  backedUp?: Maybe<Scalars['Boolean']['output']>;
  connected?: Maybe<Scalars['Boolean']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  endpoint?: Maybe<Scalars['String']['output']>;
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  port?: Maybe<Scalars['Int']['output']>;
  serverCertExpiredDate?: Maybe<Scalars['String']['output']>;
  serverCertPem?: Maybe<Scalars['String']['output']>;
  trustState?: Maybe<TrustState>;
  type: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface KmsProviderListResp {
  list: Array<KmsProvider>;
  total: Scalars['Int']['output'];
}

export interface KmsUploadedIdentity {
  kmsClientCertPem: Scalars['String']['input'];
  kmsClientKeyPem: Scalars['String']['input'];
}

export interface L2Network {
  attachedClusterUuids?: Maybe<Array<Scalars['String']['output']>>;
  attachedHostRefs?: Maybe<Array<AttachedHostRef>>;
  clusters?: Maybe<Array<Cluster>>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  enableSRIOV?: Maybe<Scalars['Boolean']['output']>;
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  isForStorageKernel?: Maybe<Scalars['Boolean']['output']>;
  isUplinkBondingExist?: Maybe<Scalars['Boolean']['output']>;
  l3networkNum?: Maybe<Scalars['Int']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<AccountInfo>;
  physicalInterface?: Maybe<Scalars['String']['output']>;
  poolUuid?: Maybe<Scalars['String']['output']>;
  portGroups?: Maybe<Array<PortGroup>>;
  resourceAttributeValues?: Maybe<Array<ResourceAttributeValue>>;
  shareType: ShareType;
  systemTags?: Maybe<L2NetworkSystemTags>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vSwitchType?: Maybe<Scalars['String']['output']>;
  virtualNetworkId?: Maybe<Scalars['String']['output']>;
  vlan?: Maybe<Scalars['String']['output']>;
  vni?: Maybe<Scalars['String']['output']>;
  vxlanPool?: Maybe<VxlanPool>;
  zone?: Maybe<Zone>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface L2NetworkInventory {
  attachedClusterUuids?: Maybe<Array<Scalars['String']['output']>>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  physicalInterface?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface L2NetworkNameAndUuidForBond {
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface L2NetworkNameAndUuidForPhysicalNic {
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface L2NetworkQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<L2Network>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
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

export interface L2NetworkRef {
  attachedClusterUuids?: Maybe<Array<Scalars['String']['output']>>;
  enableSRIOV?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  physicalInterface?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vSwitchType?: Maybe<Scalars['String']['output']>;
  virtualNetworkId?: Maybe<Scalars['String']['output']>;
}

export interface L2NetworkSystemTags {
  bondingMode?: Maybe<Scalars['String']['output']>;
  xmitHashPolicy?: Maybe<Scalars['String']['output']>;
}

export interface L3Network {
  /** 类别 */
  category?: Maybe<Scalars['String']['output']>;
  /** 创建时间 */
  createDate?: Maybe<Scalars['String']['output']>;
  /** description */
  description?: Maybe<Scalars['String']['output']>;
  /** DHCP服务IP */
  dhcpIp?: Maybe<DhcpIp>;
  /** DNS */
  dns?: Maybe<Array<Scalars['String']['output']>>;
  enableIPAM?: Maybe<Scalars['Boolean']['output']>;
  /** l2Netwrok.enableSRIOV */
  enableSRIOV?: Maybe<Scalars['Boolean']['output']>;
  hasDefaultKernel?: Maybe<Scalars['Boolean']['output']>;
  hypervisorType?: Maybe<Scalars['String']['output']>;
  ipAllocateStrategy?: Maybe<Scalars['String']['output']>;
  /** ip可用量 */
  ipCapacity?: Maybe<IpCapacity>;
  /** IP范围 */
  ipRanges?: Maybe<Array<IpRange>>;
  /** IP版本 */
  ipVersion?: Maybe<Scalars['Int']['output']>;
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  isForStorageKernel?: Maybe<Scalars['Boolean']['output']>;
  /** 对应的二层网络 */
  l2Network?: Maybe<L2NetworkRef>;
  /** 对应的二层网络的uuid */
  l2NetworkUuid?: Maybe<Scalars['String']['output']>;
  /** 最后操作时间 */
  lastOpDate?: Maybe<Scalars['String']['output']>;
  /** 是否为流量网络 */
  mirrorNetwork?: Maybe<Scalars['Boolean']['output']>;
  /** mtu */
  mtu?: Maybe<Scalars['Int']['output']>;
  /** name */
  name: Scalars['String']['output'];
  /** 网络服务类型 */
  networkServices?: Maybe<Array<NetworkServices>>;
  /** 三层网络类型判断,前端五种网络 */
  networkType?: Maybe<L3NetworkType>;
  /** 三层网络类型判断 */
  networkTypeName?: Maybe<Scalars['String']['output']>;
  /** 资源所有者 */
  owner?: Maybe<L3Owner>;
  portGroup?: Maybe<VPortGroup>;
  resourceAttributeValues?: Maybe<Array<ResourceAttributeValue>>;
  /** 私有网络接口ip */
  routerInterfaceIp?: Maybe<Scalars['String']['output']>;
  shareType: ShareType;
  /** 是否为系统网络 */
  system?: Maybe<Scalars['Boolean']['output']>;
  /** 网络类型 */
  type?: Maybe<Scalars['String']['output']>;
  usedIpCount?: Maybe<Scalars['Int']['output']>;
  uuid: Scalars['String']['output'];
  /** 对应的分布式交换机 */
  vSwitch?: Maybe<L2NetworkRef>;
  vSwitchUuid?: Maybe<Scalars['String']['output']>;
  vpcVRouter?: Maybe<L3VpcVRouter>;
  /** zone uuid */
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface L3NetworkCountResp {
  total: Scalars['Int']['output'];
}

export interface L3NetworkListResp {
  error?: Maybe<ActionError>;
  list: Array<L3Network>;
  total: Scalars['Int']['output'];
}

export interface L3NetworkPerformance {
  AvailableIPCount?: Maybe<Scalars['String']['output']>;
  AvailableIPInPercent?: Maybe<Scalars['String']['output']>;
  UsedIPCount?: Maybe<Scalars['String']['output']>;
  UsedIPInPercent?: Maybe<Scalars['String']['output']>;
  /** 类别 */
  category?: Maybe<Scalars['String']['output']>;
  /** 创建时间 */
  createDate?: Maybe<Scalars['String']['output']>;
  /** description */
  description?: Maybe<Scalars['String']['output']>;
  /** DHCP服务IP */
  dhcpIp?: Maybe<DhcpIp>;
  /** DNS */
  dns?: Maybe<Array<Scalars['String']['output']>>;
  enableIPAM?: Maybe<Scalars['Boolean']['output']>;
  /** l2Netwrok.enableSRIOV */
  enableSRIOV?: Maybe<Scalars['Boolean']['output']>;
  hasDefaultKernel?: Maybe<Scalars['Boolean']['output']>;
  hypervisorType?: Maybe<Scalars['String']['output']>;
  ipAllocateStrategy?: Maybe<Scalars['String']['output']>;
  /** ip可用量 */
  ipCapacity?: Maybe<IpCapacity>;
  /** IP范围 */
  ipRanges?: Maybe<Array<IpRange>>;
  /** IP版本 */
  ipVersion?: Maybe<Scalars['Int']['output']>;
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  isForStorageKernel?: Maybe<Scalars['Boolean']['output']>;
  /** 对应的二层网络 */
  l2Network?: Maybe<L2NetworkRef>;
  /** 对应的二层网络的uuid */
  l2NetworkUuid?: Maybe<Scalars['String']['output']>;
  /** 最后操作时间 */
  lastOpDate?: Maybe<Scalars['String']['output']>;
  /** 是否为流量网络 */
  mirrorNetwork?: Maybe<Scalars['Boolean']['output']>;
  /** mtu */
  mtu?: Maybe<Scalars['Int']['output']>;
  /** name */
  name: Scalars['String']['output'];
  /** 网络服务类型 */
  networkServices?: Maybe<Array<NetworkServices>>;
  /** 三层网络类型判断,前端五种网络 */
  networkType?: Maybe<L3NetworkType>;
  /** 三层网络类型判断 */
  networkTypeName?: Maybe<Scalars['String']['output']>;
  /** 资源所有者 */
  owner?: Maybe<L3Owner>;
  portGroup?: Maybe<VPortGroup>;
  resourceAttributeValues?: Maybe<Array<ResourceAttributeValue>>;
  /** 私有网络接口ip */
  routerInterfaceIp?: Maybe<Scalars['String']['output']>;
  shareType: ShareType;
  /** 是否为系统网络 */
  system?: Maybe<Scalars['Boolean']['output']>;
  /** 网络类型 */
  type?: Maybe<Scalars['String']['output']>;
  usedIpCount?: Maybe<Scalars['Int']['output']>;
  uuid: Scalars['String']['output'];
  /** 对应的分布式交换机 */
  vSwitch?: Maybe<L2NetworkRef>;
  vSwitchUuid?: Maybe<Scalars['String']['output']>;
  vpcVRouter?: Maybe<L3VpcVRouter>;
  /** zone uuid */
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export enum L3NetworkPerformanceMetricType {
  AvailableIPCount = 'AvailableIPCount',
  AvailableIPInPercent = 'AvailableIPInPercent',
  UsedIPCount = 'UsedIPCount',
  UsedIPInPercent = 'UsedIPInPercent'
}

export interface L3NetworkPerformanceQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<L3NetworkPerformance>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
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

export interface L3Owner {
  linkedAccountUuid?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface L3VpcVRouter {
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface LLDPMode {
  createDate: Scalars['String']['output'];
  lastOpDate: Scalars['String']['output'];
  mode?: Maybe<ELLDPMode>;
  uuid: Scalars['String']['output'];
}

export interface Label {
  BackupStorageType?: Maybe<Scalars['String']['output']>;
  BackupStorageUuid?: Maybe<Scalars['String']['output']>;
}

export interface Labels {
  BackupStorageUuid: Scalars['String']['output'];
}

export enum LdapServerType {
  OpenLdap = 'OpenLdap',
  Unknown = 'Unknown',
  WindowsAD = 'WindowsAD'
}

export interface LicenseAddOn {
  availableCpuNum?: Maybe<Scalars['Float']['output']>;
  availableHostNum?: Maybe<Scalars['Float']['output']>;
  availableVmNum?: Maybe<Scalars['Float']['output']>;
  cpuNum?: Maybe<Scalars['Float']['output']>;
  expired: Scalars['Boolean']['output'];
  expiredDate?: Maybe<Scalars['String']['output']>;
  hostNum?: Maybe<Scalars['Float']['output']>;
  issuedDate?: Maybe<Scalars['String']['output']>;
  licenseAttribute?: Maybe<LicenseAttribute>;
  licenseType: UIExtendedLicenseType;
  managementNodeUuid?: Maybe<Scalars['String']['output']>;
  modules: Array<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  usage?: Maybe<LicenseUsage>;
  uuid: Scalars['String']['output'];
  vmNum?: Maybe<Scalars['Float']['output']>;
}

export interface LicenseAddOnWithOccupied {
  availableCpuNum?: Maybe<Scalars['Float']['output']>;
  availableHostNum?: Maybe<Scalars['Float']['output']>;
  availableVmNum?: Maybe<Scalars['Float']['output']>;
  cpuNum?: Maybe<Scalars['Float']['output']>;
  expired: Scalars['Boolean']['output'];
  expiredDate?: Maybe<Scalars['String']['output']>;
  hostNum?: Maybe<Scalars['Float']['output']>;
  issuedDate?: Maybe<Scalars['String']['output']>;
  licenseAttribute?: Maybe<LicenseAttribute>;
  licenseType: UIExtendedLicenseType;
  managementNodeUuid?: Maybe<Scalars['String']['output']>;
  modules: Array<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  occupiedCPUs?: Maybe<Scalars['Int']['output']>;
  occupiedHosts?: Maybe<Scalars['Int']['output']>;
  occupiedVMs?: Maybe<Scalars['Int']['output']>;
  usage?: Maybe<LicenseUsage>;
  uuid: Scalars['String']['output'];
  vmNum?: Maybe<Scalars['Float']['output']>;
}

export interface LicenseAddition {
  info?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  primaryLicenseInfo?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  zmigrateKey?: Maybe<Scalars['String']['output']>;
}

export enum LicenseAttribute {
  Free = 'Free'
}

export interface LicenseExtraInfo {
  occupiedCpuNum?: Maybe<Scalars['Int']['output']>;
  occupiedHostNum?: Maybe<Scalars['Int']['output']>;
  occupiedVmNum?: Maybe<Scalars['Int']['output']>;
}

export interface LicenseInfo {
  additions?: Maybe<Array<LicenseAddition>>;
  availableCpuNum?: Maybe<Scalars['Int']['output']>;
  availableHostNum?: Maybe<Scalars['Int']['output']>;
  availableVmNum?: Maybe<Scalars['Int']['output']>;
  cpuNum?: Maybe<Scalars['Float']['output']>;
  cubeVersion?: Maybe<Scalars['String']['output']>;
  expired: Scalars['Boolean']['output'];
  expiredDate?: Maybe<Scalars['String']['output']>;
  hostNum?: Maybe<Scalars['Float']['output']>;
  isCube?: Maybe<Scalars['Boolean']['output']>;
  issuedDate?: Maybe<Scalars['String']['output']>;
  licenseRequest: Scalars['String']['output'];
  licenseType: UIExtendedLicenseType;
  managementNodeUuid?: Maybe<Scalars['String']['output']>;
  platformId?: Maybe<Scalars['String']['output']>;
  prodInfo?: Maybe<ProdInfo>;
  usage?: Maybe<LicenseUsage>;
  user?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
  versionOnUI?: Maybe<Scalars['String']['output']>;
  vmNum?: Maybe<Scalars['Float']['output']>;
}

export interface LicenseInfoExtensionResp {
  additions?: Maybe<Array<LicenseAddition>>;
  dualManagementNodeInfo?: Maybe<DualManagementNodeInfo>;
  hostNameList?: Maybe<Array<Scalars['String']['output']>>;
  isDualManagementNode?: Maybe<Scalars['Boolean']['output']>;
  opensource?: Maybe<Scalars['Boolean']['output']>;
  statusList?: Maybe<Array<Scalars['String']['output']>>;
}

export interface LicenseInfoResp {
  additions?: Maybe<Array<LicenseAddition>>;
  availableCpuNum?: Maybe<Scalars['Int']['output']>;
  availableHostNum?: Maybe<Scalars['Int']['output']>;
  availableVmNum?: Maybe<Scalars['Int']['output']>;
  cpuNum?: Maybe<Scalars['Float']['output']>;
  cubeVersion?: Maybe<Scalars['String']['output']>;
  dualManagementNodeInfo?: Maybe<DualManagementNodeInfo>;
  expired: Scalars['Boolean']['output'];
  expiredDate?: Maybe<Scalars['String']['output']>;
  hostNameList?: Maybe<Array<Scalars['String']['output']>>;
  hostNum?: Maybe<Scalars['Float']['output']>;
  isCube?: Maybe<Scalars['Boolean']['output']>;
  isDualManagementNode?: Maybe<Scalars['Boolean']['output']>;
  issuedDate?: Maybe<Scalars['String']['output']>;
  licenseRequest: Scalars['String']['output'];
  licenseType: UIExtendedLicenseType;
  managementNodeUuid?: Maybe<Scalars['String']['output']>;
  opensource?: Maybe<Scalars['Boolean']['output']>;
  platformId?: Maybe<Scalars['String']['output']>;
  prodInfo?: Maybe<ProdInfo>;
  statusList?: Maybe<Array<Scalars['String']['output']>>;
  usage?: Maybe<LicenseUsage>;
  user?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
  versionOnUI?: Maybe<Scalars['String']['output']>;
  vmNum?: Maybe<Scalars['Float']['output']>;
}

export enum LicenseQuotaType {
  CPUCore = 'CPUCore',
  CPUSocket = 'CPUSocket',
  Capacity = 'Capacity',
  Host = 'Host',
  None = 'None',
  VM = 'VM'
}

export interface LicenseRecords {
  capacity?: Maybe<Scalars['Float']['output']>;
  cpuNum?: Maybe<Scalars['Float']['output']>;
  expired: Scalars['Boolean']['output'];
  expiredDate?: Maybe<Scalars['String']['output']>;
  hostNum?: Maybe<Scalars['Float']['output']>;
  issuedDate?: Maybe<Scalars['String']['output']>;
  licenseType: UIExtendedLicenseType;
  managementNodeUuid?: Maybe<Scalars['String']['output']>;
  modules: Array<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  prodInfo?: Maybe<ProdInfo>;
  quotaType?: Maybe<LicenseQuotaType>;
  source?: Maybe<LicenseSource>;
  uid?: Maybe<Scalars['String']['output']>;
  uploadDate?: Maybe<Scalars['String']['output']>;
  user?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  vmNum?: Maybe<Scalars['Float']['output']>;
}

export interface LicenseRecordsQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<LicenseRecords>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum LicenseSource {
  Ctl = 'Ctl',
  InternalMINI = 'InternalMINI',
  Legacy = 'Legacy',
  UKey = 'UKey',
  UploadFile = 'UploadFile'
}

export interface LicenseUSBKeyStatus {
  keyId?: Maybe<Scalars['String']['output']>;
  managementNodeUuid?: Maybe<Scalars['String']['output']>;
  status?: Maybe<UKeyStatus>;
}

export interface LicenseUsage {
  available?: Maybe<Scalars['BigInt']['output']>;
  quota?: Maybe<Scalars['BigInt']['output']>;
  quotaType?: Maybe<LicenseQuotaType>;
  used?: Maybe<Scalars['BigInt']['output']>;
}

export interface LinkResourceOfIpRange {
  vm?: Maybe<Scalars['Int']['output']>;
  vrouter?: Maybe<Scalars['Int']['output']>;
}

export interface LocalBackupStorage {
  attachedZoneUuids?: Maybe<Array<Scalars['String']['output']>>;
  availableCapacity?: Maybe<Scalars['BigInt']['output']>;
  /** 本地备份服务器关联的备份任务 */
  backupJobCount: Scalars['Float']['output'];
  /** 本地备份服务器关联的CDP 任务 */
  cdpTaskCount: Scalars['Float']['output'];
  cidr?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  hostname?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  sshPort?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<BackupStorageState>;
  status?: Maybe<BackupStorageStatus>;
  totalCapacity?: Maybe<Scalars['BigInt']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface LocalBackupStorageOfBackupJobSummary {
  total?: Maybe<Scalars['Int']['output']>;
}

export interface LocalBackupStorageQueryResp {
  error?: Maybe<ActionError>;
  list?: Maybe<Array<LocalBackupStorage>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export enum LocalBackupStorageQueryType {
  Normal = 'Normal',
  QueryForCdpTaskResource = 'QueryForCdpTaskResource'
}

export interface LocalBackupStorageSystemTags {
  createDate?: Maybe<Scalars['String']['output']>;
  inherent?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  resourceUuid?: Maybe<Scalars['String']['output']>;
  tag?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface LocalBackupStorageSystemTagsQueryResp {
  error?: Maybe<ActionError>;
  list?: Maybe<Array<LocalBackupStorageSystemTags>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface LocalStorageHostCapacity {
  /** 总可用容量（虚拟） */
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  /** 总可用容量（物理） */
  availablePhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  /** 物理机UUID */
  hostUuid?: Maybe<Scalars['String']['output']>;
  /** 镜像缓存 */
  imageCacheSize?: Maybe<Scalars['Float']['output']>;
  /** 存储超分率，这里默认随机取一个Host的超分率！！！，name=overProvisioning.primaryStorage category=mevoco */
  overProvisioningPrimaryStorage?: Maybe<Scalars['Float']['output']>;
  /** 主存储UUID */
  primaryStorageUuid?: Maybe<Scalars['String']['output']>;
  /** 总保留容量，需要通过全局配置category=primaryStorage name=reservedCapacity来计算 */
  reservedCapacity?: Maybe<Scalars['Float']['output']>;
  /** 总保留容量（物理），需要通过全局配置name=threshold.primaryStorage.physicalCapacity category=mevoco来计算 */
  reservedPhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  systemUsedCapacity?: Maybe<Scalars['Float']['output']>;
  /** 更新时间 */
  timestamp?: Maybe<Scalars['Float']['output']>;
  /** 总容量（虚拟） */
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  /** 总容量（物理） */
  totalPhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  /** 模版缓存 */
  vmTemplateVolumeCacheSize?: Maybe<Scalars['Float']['output']>;
  /** 虚拟机硬盘真实容量 */
  volumeActualSize?: Maybe<Scalars['Float']['output']>;
  /** 虚拟机硬盘 */
  volumeSize?: Maybe<Scalars['Float']['output']>;
  /** 快照容量 */
  volumeSnapshotSize?: Maybe<Scalars['Float']['output']>;
}

export interface LocalStorageHostDiskCapacity {
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  availablePhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  totalPhysicalCapacity?: Maybe<Scalars['Float']['output']>;
}

export interface LocalStorageMigrateVolumeInput {
  action: ActionInput;
  payload: LocalStorageMigrateVolumePayload;
}

export interface LocalStorageMigrateVolumePayload {
  backupTaskLongJobUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  destHostUuid: Scalars['String']['input'];
  volumeUuid: Scalars['String']['input'];
}

export interface LocateHostNetworkInterfaceInput {
  action: ActionInput;
  payload: LocateHostNetworkInterfacePayload;
}

export interface LocateHostNetworkInterfacePayload {
  hostUuid: Scalars['String']['input'];
  networkInterfaceName: Scalars['String']['input'];
}

export interface LocateLocalRaidPhysicalDriveInput {
  action: ActionInput;
  payload: LocateLocalRaidPhysicalDrivePayload;
}

export interface LocateLocalRaidPhysicalDrivePayload {
  locate: Scalars['Boolean']['input'];
  uuid: Scalars['String']['input'];
}

export interface LogCollect {
  createDate?: Maybe<Scalars['String']['output']>;
  endTime?: Maybe<Scalars['String']['output']>;
  host?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['String']['output']>;
  state: LogCollectState;
  type?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export enum LogCollectState {
  FAILED = 'FAILED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS'
}

export interface LogInInput {
  captchaUuid?: InputMaybe<Scalars['String']['input']>;
  clientInfo?: InputMaybe<ClientInfo>;
  loginType: Scalars['String']['input'];
  password: Scalars['String']['input'];
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  username: Scalars['String']['input'];
  verifyCode?: InputMaybe<Scalars['String']['input']>;
}

export interface LogOutInput {
  clientInfo?: InputMaybe<ClientInfo>;
  sessionUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface LogOutResp {
  sessionId?: Maybe<Scalars['String']['output']>;
}

export interface LogServer {
  category?: Maybe<Scalars['String']['output']>;
  configuration?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  facility?: Maybe<Scalars['String']['output']>;
  hostname?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  labelKey?: Maybe<Scalars['String']['output']>;
  labelValue?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  level?: Maybe<Scalars['String']['output']>;
  logType?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  port?: Maybe<Scalars['String']['output']>;
  resourceUuid?: Maybe<Scalars['String']['output']>;
  systemTags?: Maybe<Array<Scalars['String']['output']>>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface LogServerQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<LogServer>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface LoginByAccountInput {
  accountName: Scalars['String']['input'];
  captchaUuid?: InputMaybe<Scalars['String']['input']>;
  clientInfo?: InputMaybe<ClientInfo>;
  password: Scalars['String']['input'];
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  verifyCode?: InputMaybe<Scalars['String']['input']>;
}

export interface LoginOAuthInput {
  accountUuid: Scalars['String']['input'];
  loginType: Scalars['String']['input'];
  sessionId: Scalars['String']['input'];
  userUuid: Scalars['String']['input'];
}

export interface LoginOAuthResp {
  accountUuid?: Maybe<Scalars['String']['output']>;
  currentIdentity?: Maybe<Identity>;
  isLogined: Scalars['Boolean']['output'];
  sessionId?: Maybe<Scalars['String']['output']>;
  /** @deprecated Account sessions no longer have a separate userUuid; use accountUuid. */
  userUuid?: Maybe<Scalars['String']['output']>;
}

export interface LoginProceduresProperties {
  authentications?: Maybe<Scalars['String']['output']>;
  credentials?: Maybe<Scalars['String']['output']>;
  ukeyType?: Maybe<Scalars['String']['output']>;
}

export interface LoginResp {
  accountUuid: Scalars['String']['output'];
  ccsCertificate?: Maybe<CCSCertificate>;
  currentIdentity?: Maybe<Identity>;
  sessionId: Scalars['String']['output'];
  /** @deprecated Account sessions no longer have a separate userUuid; use accountUuid. */
  userUuid: Scalars['String']['output'];
}

export interface LunDeviceMultiPathDetail {
  disk?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  /** 值为 active, enabled */
  status?: Maybe<Scalars['String']['output']>;
  target?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface LunDeviceMultiPathList {
  error?: Maybe<ActionError>;
  list: Array<LunDeviceMultiPathDetail>;
  total: Scalars['Int']['output'];
}

export enum LunSource {
  NVMe = 'NVMe',
  fiberChannel = 'fiberChannel',
  iSCSI = 'iSCSI'
}

export interface MaintainPrimaryStorageInput {
  action: ActionInput;
  payload: Array<MaintainPrimaryStoragePayload>;
}

export interface MaintainPrimaryStoragePayload {
  uuid: Scalars['String']['input'];
}

export interface MaintenanceHostInput {
  action: ActionInput;
  payload: Array<MaintenanceHostPayload>;
}

export interface MaintenanceHostPayload {
  uuid: Scalars['String']['input'];
}

export interface ManagementNode {
  dbStatus: Scalars['String']['output'];
  gwReachable: Scalars['Boolean']['output'];
  ip: Scalars['String']['output'];
  mnStatus: Scalars['String']['output'];
  ownsVip: Scalars['Boolean']['output'];
  peerReachable: Scalars['Boolean']['output'];
  slaveIoRunning: Scalars['Boolean']['output'];
  slaveSqlRuning: Scalars['Boolean']['output'];
  timeToSyncDB?: Maybe<Scalars['Float']['output']>;
  vip: Scalars['String']['output'];
  vipReachable: Scalars['Boolean']['output'];
}

export interface ManagementNodeArch {
  architecture?: Maybe<Scalars['String']['output']>;
}

export interface ManagementNodeError {
  causes?: Maybe<Array<Scalars['String']['output']>>;
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
  details?: Maybe<Scalars['String']['output']>;
}

export interface ManagementNodeIp {
  ip: Scalars['String']['output'];
}

export interface ManagementNodeQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<ManagementNode>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface ManagementNodeStatusItem {
  databaseStatus?: Maybe<Scalars['String']['output']>;
  error?: Maybe<ManagementNodeError>;
  gatewayIp?: Maybe<Scalars['String']['output']>;
  gatewayReachable?: Maybe<Scalars['Boolean']['output']>;
  haMonitorStatus?: Maybe<Scalars['String']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  keepalivedStatus?: Maybe<Scalars['String']['output']>;
  managementsNodeStatus?: Maybe<Scalars['String']['output']>;
  ownsVip?: Maybe<Scalars['Boolean']['output']>;
  peerReachable?: Maybe<Scalars['Boolean']['output']>;
  slaveIoRunning?: Maybe<Scalars['Boolean']['output']>;
  slaveSqlRunning?: Maybe<Scalars['Boolean']['output']>;
  uiStatus?: Maybe<Scalars['String']['output']>;
  vipReachable?: Maybe<Scalars['Boolean']['output']>;
}

export interface ManagementNodesStatus {
  nodes: Array<ManagementNodeStatusItem>;
  uiHttpPath?: Maybe<Scalars['String']['output']>;
  vip?: Maybe<Scalars['String']['output']>;
}

export interface ManagementTagInput {
  action: ActionInput;
  payload: Array<ManagementTagPayload>;
}

export interface ManagementTagPayload {
  addTagUuids: Array<Scalars['String']['input']>;
  removeTagUuids: Array<Scalars['String']['input']>;
  resourceUuids: Array<Scalars['String']['input']>;
}

export interface MatchedPciDeviceOfferingRef {
  pciDeviceOfferingUuid: Scalars['String']['output'];
  pciDeviceUuid: Scalars['String']['output'];
}

export interface MaxAmount {
  createAble?: Maybe<Scalars['Boolean']['output']>;
}

export interface MaxCdRomNum {
  category?: Maybe<Scalars['String']['output']>;
  defaultValue: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
}

export interface MdevDeviceSpec {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  specification?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface MdevDeviceSpecQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<MdevDeviceSpec>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum MdevDeviceSpecQueryType {
  GetMdevDeviceCandidatesForGenerate = 'GetMdevDeviceCandidatesForGenerate',
  Normal = 'Normal'
}

export interface MdevSpecRefs {
  createDate: Scalars['String']['output'];
  effective: Scalars['Boolean']['output'];
  lastOpDate: Scalars['String']['output'];
  mdevSpecUuid: Scalars['String']['output'];
  pciDeviceUuid: Scalars['String']['output'];
}

export interface MdsInfos {
  mdsAddr: Scalars['String']['output'];
  mdsStatus: Scalars['String']['output'];
  sshPassword: Scalars['String']['output'];
  sshPort: Scalars['String']['output'];
  sshUsername: Scalars['String']['output'];
}

export interface MdsQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<CbdMds>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum MdsStatus {
  Connected = 'Connected',
  Connecting = 'Connecting',
  Disconnected = 'Disconnected'
}

export interface Memory {
  clockSpeed?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  locator?: Maybe<Scalars['String']['output']>;
  manufacturer?: Maybe<Scalars['String']['output']>;
  rank?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['String']['output']>;
  speed?: Maybe<Scalars['String']['output']>;
  state?: Maybe<HardwareState>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  voltage?: Maybe<Scalars['String']['output']>;
}

export interface MemorySnapshotByVm {
  isMemorySnapshot?: Maybe<Scalars['Boolean']['output']>;
}

export interface MemorySnapshotInfo {
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface MemorySnapshotQueryResponse {
  memorySnapshotList?: Maybe<Array<MemorySnapshotInfo>>;
  withMemorySnapShotResourceList?: Maybe<Array<MemorySnapshotInfo>>;
}

export interface MetriData {
  labels?: Maybe<Label>;
  time?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
}

export interface MetriDataList {
  capacityData: ResourceData;
  percentList: Array<MetriData>;
}

export interface MetricData {
  label?: Maybe<Scalars['String']['output']>;
  metricName: Scalars['String']['output'];
  time: Scalars['Float']['output'];
  type: Scalars['String']['output'];
  value: Scalars['Float']['output'];
}

export interface MetricItemInput {
  conditions?: InputMaybe<Array<Condition>>;
  metricName: Scalars['String']['input'];
}

export interface MetricLabel {
  Baremetal2VMUuid?: Maybe<Scalars['String']['output']>;
  BaremetalVMUuid?: Maybe<Scalars['String']['output']>;
  CPUNum?: Maybe<Scalars['String']['output']>;
  DiskDeviceLetter?: Maybe<Scalars['String']['output']>;
  HostUuid?: Maybe<Scalars['String']['output']>;
  InterfaceName?: Maybe<Scalars['String']['output']>;
  MountPoint?: Maybe<Scalars['String']['output']>;
  NetworkDeviceLetter?: Maybe<Scalars['String']['output']>;
  VMUuid?: Maybe<Scalars['String']['output']>;
}

export interface MetricLabelResp {
  labels: Array<MetricLabel>;
}

export interface MetricLabelValue {
  value: Scalars['String']['output'];
}

export interface MetricParam {
  /** 仅用来组装labels */
  conditions?: InputMaybe<Array<Condition>>;
  endTime: Scalars['Float']['input'];
  functions?: InputMaybe<Array<Scalars['String']['input']>>;
  metricName: Scalars['String']['input'];
  namespace: Scalars['String']['input'];
  period: Scalars['Float']['input'];
  startTime: Scalars['Float']['input'];
}

export interface MetricRuleTemplate {
  /** 操作符 */
  comparisonOperator?: Maybe<ComparisonOperator>;
  emergencyLevel?: Maybe<EmergencyLevel>;
  enableRecovery?: Maybe<Scalars['Boolean']['output']>;
  metricName?: Maybe<Scalars['String']['output']>;
  monitorTemplateUuid?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  namespace?: Maybe<Scalars['String']['output']>;
  /** 持续时间 */
  period?: Maybe<Scalars['Int']['output']>;
  repeatCount?: Maybe<Scalars['Int']['output']>;
  repeatInterval?: Maybe<Scalars['Int']['output']>;
  /** 监控阈值 */
  threshold?: Maybe<Scalars['Int']['output']>;
  uuid: Scalars['String']['output'];
}

export interface MicrosoftTeamsEndPoint extends BasicEndPoint {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<Owner>;
  platformUuid?: Maybe<Scalars['String']['output']>;
  state?: Maybe<EndPointState>;
  topic?: Maybe<SNSTopic>;
  type?: Maybe<EndPointType>;
  url?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface MigrateVmInput {
  action: ActionInput;
  payload: MigrateVmPayload;
}

export interface MigrateVmPayload {
  backupTaskLongJobUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  strategy?: InputMaybe<Scalars['String']['input']>;
  vmInstanceUuid: Scalars['String']['input'];
}

export interface MigrationServiceInfo {
  /** 最先创建的网关虚拟机配置信息 */
  firstGatewayVm?: Maybe<FirstGatewayVmInfo>;
  gatewayCount?: Maybe<Scalars['Int']['output']>;
  /** IP of the zmigrate gateway host VM */
  gatewayHostIp?: Maybe<Scalars['String']['output']>;
  /** zmigrate category global configs */
  globalConfigs?: Maybe<ZMigrateGlobalConfig>;
  hasRunningTask?: Maybe<Scalars['Boolean']['output']>;
  platformCount?: Maybe<Scalars['Int']['output']>;
  startTime?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  taskCount?: Maybe<Scalars['Int']['output']>;
  upgradeTasks?: Maybe<Array<UpgradeTaskInfo>>;
  uuid?: Maybe<Scalars['String']['output']>;
  vddkUploaded?: Maybe<Scalars['Boolean']['output']>;
  version?: Maybe<Scalars['String']['output']>;
}

export interface MigrationServicePackage {
  gatewayImageUuid?: Maybe<Scalars['String']['output']>;
  installPath?: Maybe<Scalars['String']['output']>;
  linuxBootImageUuid?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
  windowsBootImageUuid?: Maybe<Scalars['String']['output']>;
}

export interface ModifyAtPersonPayload {
  /** 即将被添加的@人员 */
  atPersonList?: InputMaybe<Array<AtPersonInput>>;
  endpointUuid: Scalars['String']['input'];
}

export interface ModifyClusterConfigInput {
  action: ActionInput;
  payload: ModifyClusterConfigPayload;
}

export interface ModifyClusterConfigPayload {
  checkCpuModel?: InputMaybe<Scalars['String']['input']>;
  clusterUuid: Scalars['String']['input'];
  cpuMode?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  displayNetworkCidr?: InputMaybe<Scalars['String']['input']>;
  migrateNetworkCidr?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  resourceConfigList?: InputMaybe<Array<ClusterResourceConfig>>;
}

export interface ModifyDingTalkAtPersonInput {
  action: ActionInput;
  payload: ModifyDingTalkAtPersonPayload;
}

export interface ModifyDingTalkAtPersonPayload {
  endpointUuid: Scalars['String']['input'];
  oldPhoneNumbers: Array<Scalars['String']['input']>;
  phoneNumbers: Array<Scalars['String']['input']>;
}

export interface ModifyEmailAddressOfEndpointPayload {
  emailAddress: Array<Scalars['String']['input']>;
  endpointUuid: Scalars['String']['input'];
  oldEmailAddress: Array<DeleteEmailAddressToEndpointPayload>;
}

export interface ModuleAuthorizationDetails {
  activated?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  consumed?: Maybe<Scalars['Int']['output']>;
  count?: Maybe<Scalars['Int']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  expired_date?: Maybe<Scalars['String']['output']>;
  is_active?: Maybe<Scalars['Boolean']['output']>;
  is_valid?: Maybe<Scalars['Boolean']['output']>;
  key?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['Int']['output']>;
  uuid: Scalars['String']['output'];
  vendor?: Maybe<Scalars['String']['output']>;
}

export interface ModuleAuthorizationDetailsQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<ModuleAuthorizationDetails>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum MonStatus {
  Connected = 'Connected',
  Connecting = 'Connecting',
  Disconnected = 'Disconnected'
}

export interface MonitorGroup {
  actions?: Maybe<Array<GroupAction>>;
  createDate: Scalars['String']['output'];
  /** 资源的详细描述 */
  description?: Maybe<Scalars['String']['output']>;
  instanceStatistics?: Maybe<InstanceStatistics>;
  lastOpDate: Scalars['String']['output'];
  monitorGroupTemplateRefs?: Maybe<Array<MonitorGroupTemplateRef>>;
  /** 资源名称 */
  name: Scalars['String']['output'];
  owner?: Maybe<AccountOwner>;
  resourceTypeCount?: Maybe<Scalars['Int']['output']>;
  tag: Array<Tag>;
  totalResourceCount?: Maybe<Scalars['Int']['output']>;
  unhealthResourceCount?: Maybe<Scalars['Int']['output']>;
  /** 资源的UUID，唯一标示该资源 */
  uuid: Scalars['String']['output'];
}

export interface MonitorGroupAddResourceList {
  error?: Maybe<ActionError>;
  list: Array<MonitorGroupResource>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface MonitorGroupInstance {
  accountUuid?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  groupUuid: Scalars['String']['output'];
  instance?: Maybe<MonitorGroupResource>;
  instanceResourceType: Scalars['String']['output'];
  instanceUuid: Scalars['String']['output'];
  lastOpDate?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface MonitorGroupInstanceList {
  error?: Maybe<ActionError>;
  list: Array<MonitorGroupInstance>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface MonitorGroupList {
  error?: Maybe<ActionError>;
  list: Array<MonitorGroup>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface MonitorGroupResource {
  l3Network?: Maybe<L3Network>;
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface MonitorGroupTemplateRef {
  createDate?: Maybe<Scalars['String']['output']>;
  groupUuid?: Maybe<Scalars['String']['output']>;
  isApplied?: Maybe<Scalars['Boolean']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  templateUuid?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface MonitorTemplate {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  monitorGroupNum?: Maybe<Scalars['Int']['output']>;
  monitorGroupTemplateRefs?: Maybe<Array<MonitorGroupTemplateRef>>;
  name?: Maybe<Scalars['String']['output']>;
  ruleTemplateNum?: Maybe<Scalars['Int']['output']>;
  shareType: ShareType;
  tag?: Maybe<Array<Tag>>;
  uuid: Scalars['String']['output'];
}

export interface MonsQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<CephMon>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface Mutation {
  TakeoverPrimaryStorage: ActionResult;
  UpdateZSVBackupStoragePassword: ActionResult;
  ackAlarmData: ActionResult;
  addAccessControlRule: ActionResult;
  addActionToAlarm: ActionResult;
  addActionToEventSubscription: ActionResult;
  addAlarmToEndpoint: ActionResult;
  addCbdMds: ActionResult;
  addCephBackupStorage: ActionResult;
  addCephMon: ActionResult;
  addCephPrimaryStoragePool: ActionResult;
  addDnsToL3Network: ActionResult;
  addEmailAddress: ActionResult;
  addExternalPrimaryStoragePool: ActionResult;
  addGroup: ActionResult;
  addHostToHostGroup: ActionResult;
  addImage: CustomAction;
  addImageStoreBackupStorage: ActionResult;
  addIpRange: ActionResult;
  addIpRangeByCidr: ActionResult;
  addIscsiServer: ActionResult;
  addKVMHostFromConfigFile: ActionResult;
  addKVMHostFromScan: ActionResult;
  addKvmHost: ActionResult;
  addMigrationServicePackage: AddMigrationServicePackageAction;
  addNic: ActionResult;
  addNvmeServer: ActionResult;
  addPreconfigurationTemplate: ActionResult;
  addResourceToBackupJob: ActionResult;
  addResourcesToDirectory: ActionResult;
  addSNSDingTalkAtPerson: ActionResult;
  addSNSFeiShuAtPerson: ActionResult;
  addSNSWeComAtPerson: ActionResult;
  addSSOThirdPartyAuth: ActionResult;
  addSecretServer: ActionResult;
  addSecurityGroupRule: ActionResult;
  addSharedBlockToSharedBlockGroup: ActionResult;
  addSmsReceiver: ActionResult;
  addThirdPartyAuth: ActionResult;
  addTpmToVm: ActionResult;
  addUsers: ActionResult;
  addVddkPackage: AddVddkPackageAction;
  addVmNicToSecurityGroup: ActionResult;
  addVmToSnapshotStrategy: ActionResult;
  addVmToVmGroup: ActionResult;
  addXDragonHost: ActionResult;
  applyDRSAdvice: ActionResult;
  applyMonitorTemplateToMonitorGroupInMonitorTemplate: ActionResult;
  attachBackupStorageToZone: ActionResult;
  attachBaremetalPxeServer: ActionResult;
  attachDataVolumeToVm: ActionResult;
  attachGuestToolsIsoToVm: ActionResult;
  attachIscsiServerToClusters: ActionResult;
  attachIsoToVmInstance: ActionResult;
  attachL2NetworkToCluster: ActionResult;
  attachL2NetworkToClusterWithBond: ActionResult;
  attachL2NetworkToHost: ActionResult;
  attachL3NetworkToVmNic: ActionResult;
  attachMdevDeviceToVm: ActionResult;
  attachNvmeServerToClusters: ActionResult;
  attachPciDeviceToVm: ActionResult;
  attachPrimaryStorageToCluster: ActionResult;
  attachScsiLunToVmInstances: ActionResult;
  attachTag: ActionResult;
  attachUsbDeviceToVm: ActionResult;
  attachVGpuToVmInstance: ActionResult;
  attachVmToVmGroup: ActionResult;
  attachXmlHookToVm: ActionResult;
  backupNkp: ActionResult;
  backupStorageMigrateImage: ActionResult;
  batchCreateBaremetalChassis: ActionResult;
  batchCreateHostKernelInterface: ActionResult;
  batchCreateVolumeSnapshot: ActionResult;
  batchUpdateResourceConfig: ActionResult;
  bindRoles: ActionResult;
  calcHash: ActionResult;
  cancelDefaultSNSTextTemplate: ActionResult;
  cancelLogCollect: ActionResult;
  cancelLongjob: ActionResult;
  changeAccessKeyState: ActionResult;
  changeAccountType: ActionResult;
  changeBackupStorageState: ActionResult;
  changeEventAlarmState: ActionResult;
  changeImageState: ActionResult;
  changePreconfigurationTemplateState: ActionResult;
  changeResourceOwner: ActionResult;
  changeSNSApplicationEndpoint: ActionResult;
  changeSchedulerJobGroupBasicInfo: ActionResult;
  changeSchedulerJobState: ActionResult;
  changeSchedulerState: ActionResult;
  changeSecurityGroupRule: ActionResult;
  changeSecurityGroupRuleState: ActionResult;
  changeSecurityGroupState: ActionResult;
  changeVmImage: ActionResult;
  changeVmNicNetwork: ActionResult;
  changeVmNicState: ActionResult;
  changeVmPassword: ActionResult;
  changeVmSchedulingRuleState: ActionResult;
  changeVolumeState: ActionResult;
  changeZSVBackupStorageState: ActionResult;
  changeZoneState: ActionResult;
  checkBaremetalChassisConfigFile: ActionSendResp;
  checkHostnameRepeat: CheckHostnameRepeatResult;
  checkIpAvailability: CheckIpAvailabilityResult;
  checkIpForBondOrNic: CheckIpAvailabilityResult;
  checkKVMHostConfigFileWithoutDoAction: ActionSendResp;
  checkMacAvailability: CheckMacAvailabilityResult;
  checkScsiLunClusterStatus: ActionResult;
  checkVNicIpAvailability: CheckVNicAvailabilityResult;
  cleanStoragePackage: ActionResult;
  cleanUpTrashList: ActionResult;
  cleanUpgradeSoftwarePackage: ActionResult;
  cloneRole: ActionResult;
  cloneVmInstance: ActionResult;
  cloneVmToTemplate: ActionResult;
  closeHostIommu: ActionResult;
  configBaremetalPxeServer: ConfigBaremetalPxeServerResult;
  coverTemplateToVM: ActionResult;
  coverVmToTemplate: ActionResult;
  createAccessKey: ActionResult;
  createAccount: ActionResult;
  createAlarm: ActionResult;
  createAliyunSmsEndpoint: ActionResult;
  createAliyunSmsEndpointAndAccesskey: ActionResult;
  createAliyunSmsSNSTextTemplate: ActionResult;
  createBSTag: ActionResult;
  createBackupData: ActionResult;
  createBaremetalChassis: ActionResult;
  createBaremetalCluster: ActionResult;
  createBaremetalInstance: ActionResult;
  createBlockPrimaryStorage: ActionResult;
  createBond: ActionResult;
  createCephPrimaryStorage: ActionResult;
  createCluster: ActionResult;
  createClusterDRS: ActionResult;
  createDataVolume: ActionResult;
  createDataVolumeFromVolumeTemplate: ActionResult;
  createDingTalkEndpoint: ActionResult;
  createEmailEndpoint: ActionResult;
  createExternalPrimaryStorage: ActionResult;
  createFeiShuEndpoint: ActionResult;
  createHostGroup: ActionResult;
  createHostKernelInterface: ActionResult;
  createHttpEndpoint: ActionResult;
  createInstance: ActionResult;
  createInstanceFromOvf: OvfInfo;
  createKmsProvider: ActionResult;
  createL2Network: ActionResult;
  createL3Network: ActionResult;
  createLocalStoragePrimaryStorage: ActionResult;
  createLogCollect: ActionResult;
  createLogServer: ActionResult;
  createMonitorGroup: ActionResult;
  createNfsPrimaryStorage: ActionResult;
  createPSTag: ActionResult;
  createResourceAttributeKey: ActionResult;
  createResourceBackupJob: ActionResult;
  createRole: ActionResult;
  createSNSEmailServer: ActionResult;
  createSNSMicrosoftTeamsEndpoint: ActionResult;
  createSNSTextTemplate: ActionResult;
  createSNSTopic: ActionResult;
  createScript: ActionResult;
  createSecurityGroup: ActionResult;
  createSharedBlockGroupPrimaryStorage: ActionResult;
  createSharedMountPointPrimaryStorage: ActionResult;
  createSnapshotStrategy: ActionResult;
  createSnmpAgent: ActionResult;
  createSnmpTrapEndpoint: ActionResult;
  createSnmpTrapReceiver: ActionResult;
  createTag: ActionResult;
  createUserGroup: ActionResult;
  createVMFromTemplate: ActionResult;
  createVMFromZSVSnapshot: ActionResult;
  createVmCdRom: ActionResult;
  createVmCustomSpecification: ActionResult;
  createVmGroup: ActionResult;
  createVmSchedulingRule: ActionResult;
  createVolumeSnapshot: ActionResult;
  createVolumeTemplate: ActionResult;
  createWeComEndpoint: ActionResult;
  createXmlHook: ActionResult;
  createZSVBackupStorage: ActionResult;
  createZone: ActionResult;
  deleteAccessControlRule: ActionResult;
  deleteAccessKey: ActionResult;
  deleteAccountThirdPartyAuth: ActionResult;
  deleteAccounts: ActionResult;
  deleteAlarms: ActionResult;
  deleteBSTag: ActionResult;
  deleteBackupDataList: ActionResult;
  deleteBackupStorage: ActionResult;
  deleteBaremetalChassis: ActionResult;
  deleteBaremetalInstance: ActionResult;
  deleteBaremetalPxeServer: ActionResult;
  deleteBond: ActionResult;
  deleteCbdMds: ActionResult;
  deleteCdRoms: ActionResult;
  deleteCephMonList: ActionResult;
  deleteCephPrimaryStoragePoolList: ActionResult;
  deleteCluster: ActionResult;
  deleteDataVolume: ActionResult;
  /** 删除备份数据库 */
  deleteDatabaseBackupDataList: ActionResult;
  deleteEmailAddressToEndpoint: ActionResult;
  deleteExportedImage: ActionResult;
  deleteExportedOvf: ActionResult;
  deleteExternalPrimaryStoragePool: ActionResult;
  deleteGroup: ActionResult;
  deleteHostGroup: ActionResult;
  deleteHostKernelInterface: ActionResult;
  deleteHosts: ActionResult;
  deleteImage: ActionResult;
  deleteIpRange: ActionResult;
  deleteIscsiServers: ActionResult;
  deleteKmsProvider: ActionResult;
  deleteL2Networks: ActionResult;
  deleteL3Network: ActionResult;
  deleteLicense: ActionResult;
  deleteLogCollect: ActionResult;
  deleteLogServer: ActionResult;
  deleteMigrationGatewayVm: ActionResult;
  deleteNvmeServer: ActionResult;
  deletePSTag: ActionResult;
  deletePreConfigurationTemplate: ActionResult;
  deletePrimaryStorageList: ActionResult;
  deleteResourceAttributeKey: ActionResult;
  deleteResourceBackupJob: ActionResult;
  deleteRole: ActionResult;
  deleteSNSApplicationEndpoint: ActionResult;
  deleteSNSEmailServer: ActionResult;
  deleteSNSTextTemplate: ActionResult;
  deleteSNSTopic: ActionResult;
  deleteSchedulerJob: ActionResult;
  deleteScript: ActionResult;
  deleteSecurityGroup: ActionResult;
  deleteSecurityGroupRule: ActionResult;
  deleteSnapshotStrategy: ActionResult;
  deleteSnmpTrapReceiver: ActionResult;
  deleteTag: ActionResult;
  deleteThirdPartyAuths: ActionResult;
  deleteUserGroup: ActionResult;
  deleteVmConsolePassword: ActionResult;
  deleteVmCustomSpecification: ActionResult;
  deleteVmGroup: ActionResult;
  deleteVmInstance: ActionResult;
  deleteVmNicFromSecurityGroup: ActionResult;
  deleteVmSchedulingRule: ActionResult;
  deleteVmSshKey: ActionResult;
  deleteVmStaticIp: ActionResult;
  deleteVmTemplate: ActionResult;
  deleteVolumeQos: ActionResult;
  deleteVolumeSnapshot: ActionResult;
  deleteXmlHook: ActionResult;
  deleteZSVBackupStorage: ActionResult;
  deleteZone: ActionResult;
  detachBackupStorageFromZone: ActionResult;
  detachBaremetalPxeServer: ActionResult;
  detachDataVolumeFromVm: ActionResult;
  detachGuestToolsIsoFromVm: ActionResult;
  detachIscsiServerFromClusters: ActionResult;
  detachIsoFromVmInstance: ActionResult;
  detachL2NetworkFromCluster: ActionResult;
  detachL2NetworkFromHost: ActionResult;
  detachL3NetworkFromVm: ActionResult;
  detachMdevDeviceFromVm: ActionResult;
  detachNvmeServerFromClusters: ActionResult;
  detachPciDeviceFromVm: ActionResult;
  detachPrimaryStorageFromCluster: ActionResult;
  detachScsiLunFromVmInstance: ActionResult;
  detachTag: ActionResult;
  detachUsbDeviceToVm: ActionResult;
  detachVGpuFromVmInstance: ActionResult;
  detachVmFromVmGroup: ActionResult;
  detachXmlHookFromVm: ActionResult;
  disableAlarms: ActionResult;
  disableCluster: ActionResult;
  disableEmailServerSettings: ActionResult;
  disableHosts: ActionResult;
  disablePrimaryStorageList: ActionResult;
  editAccountThirdPartyAuthConfig: ActionResult;
  editBond: ActionResult;
  editHostConfig: ActionResult;
  editL3NetworkConfig: ActionResult;
  editVmGuestToolConfig: ActionResult;
  editVmInstanceConfig: ActionResult;
  editVmNormalConfig: ActionResult;
  editVmOtherConfig: ActionResult;
  editVmRemoteConfig: ActionResult;
  editVmTemplateConfig: ActionResult;
  enableAlarms: ActionResult;
  enableCluster: ActionResult;
  enableEmailServerSettings: ActionResult;
  enableHAStrategic: ActionResult;
  enableHosts: ActionResult;
  enablePrimaryStorageList: ActionResult;
  executeDRSScheduling: ActionResult;
  executeScript: ActionResult;
  exportDatabaseBackupUrl: ActionResult;
  exportImage: ActionResult;
  exportOvf: ActionResult;
  expungeBaremetalInstance: ActionResult;
  expungeDataVolume: ActionResult;
  expungeImage: ActionResult;
  expungeVmInstance: ActionResult;
  flattenVmInstance: ActionResult;
  forceStopVmInstance: ActionResult;
  genNewCert: ActionResult;
  generateMdevDevice: ActionResult;
  generateSriovPciDevices: ActionResult;
  getHostWebSshUrl: ActionResult;
  getLoginCaptcha: GetLoginCaptchaResp;
  getLoginProcedures: GetLoginProceduresOutput;
  getTwoFactorAuthenticationSecret: GetTwoFactorAuthenticationSecretResp;
  imageModifyConfig: ActionResult;
  inspectBaremetalChassis: ActionResult;
  installMigrationService: ActionResult;
  localStorageMigrateVolume: ActionResult;
  locateHostNetworkInterface: ActionResult;
  locateLocalRaidPhysicalDrive: ActionResult;
  logIn: LoginResp;
  logOut: LogOutResp;
  loginByAccount: LoginResp;
  loginOAuth: LoginOAuthResp;
  maintainPrimaryStorageList: ActionResult;
  maintenanceHosts: ActionResult;
  managementTag: ActionResult;
  migrateVm: ActionResult;
  modifyClusterConfig: ActionResult;
  modifyDingTalkAtPerson: ActionResult;
  openBaremetalInstanceConsole: ActionResult;
  openConsoleAccess: ActionResult;
  openHostIommu: ActionResult;
  pauseVmInstance: ActionResult;
  poweroffVmInstance: ActionResult;
  primaryStorageMigrateVolume: ActionResult;
  reCreateLogCollect: ActionResult;
  rebootBaremetalInstance: ActionResult;
  rebootVmInstance: ActionResult;
  reclaimSpaceFromImageStore: ActionResult;
  reclaimSpaceFromZSVBackupStorage: ActionResult;
  reconnectBackupStorage: ActionResult;
  reconnectBaremetalPxeServer: ActionResult;
  reconnectConsoleProxy: ActionResult;
  reconnectHosts: ActionResult;
  reconnectPrimaryStorageList: ActionResult;
  reconnectZSVBackupStorage: ActionResult;
  recoverBaremetalInstance: ActionResult;
  recoverDataVolume: ActionResult;
  recoverDatabaseBackup: ActionResult;
  recoverImage: ActionResult;
  recoverVmInstance: ActionResult;
  refreshCaptcha: GetLoginCaptchaResp;
  refreshFiberChannelStorages: ActionResult;
  refreshIscsiServers: ActionResult;
  refreshNvmeServer: ActionResult;
  refreshNvmeTargets: ActionResult;
  refreshSharedblockDeviceCapacity: ActionResult;
  registerVmInstance: ActionResult;
  reimageVmInstance: ActionResult;
  rekeyKeyProviderRefs: ActionResult;
  removeActionFromAlarm: ActionResult;
  removeActionFromEventSubscription: ActionResult;
  removeAlarmFromEndpoint: ActionResult;
  removeDnsFromL3Network: ActionResult;
  removeHaStickStragedy: ActionResult;
  removeHostFromHostGroup: ActionResult;
  removeNic: ActionResult;
  removeResourceFromBackupJob: ActionResult;
  removeSNSDingTalkAtPerson: ActionResult;
  removeSNSFeiShuAtPerson: ActionResult;
  removeSNSWeComAtPerson: ActionResult;
  removeSmsReceiver: ActionResult;
  removeTpmFromVm: ActionResult;
  removeUsers: ActionResult;
  removeVmFromVmGroup: ActionResult;
  reset: ActionResult;
  resetGlobalConfig: ActionResult;
  resizeDataVolume: ActionResult;
  resizeRootVolume: ActionResult;
  restoreNkp: ActionResult;
  resumeVmInstance: ActionResult;
  revertVolumeFromSnapshot: ActionResult;
  revokeImageFromPublic: ActionResult;
  revokeInstanceOfferingShareingFromPublic: InstanceOfferingActionResp;
  revokeMonitorTemplateFromMonitorGroup: ActionResult;
  revokeResourceSharing: ActionResult;
  runDisasterRecoveryServiceAction: ActionResult;
  runSchedulerTrigger: ActionResult;
  scanDataZSVBackupStorage: ActionResult;
  scanDatabaseBackups: ActionResult;
  setDefaultKmsProvider: ActionResult;
  setDefaultSNSTextTemplate: ActionResult;
  setHaStickStragedy: ActionResult;
  setHostEptSupport: ActionResult;
  setImageBootMode: ActionResult;
  setIpOnBond: ActionResult;
  setIpOnInterface: ActionResult;
  setL2NetworkSrIov: ActionResult;
  setNicQos: ActionResult;
  setPhysicalNetworkBondPhysicalNetworkType: ActionResult;
  setPhysicalNetworkInterfacePhysicalNetworkType: ActionResult;
  setResourceAttributeValue: ActionResult;
  setSystemTag: ActionResult;
  setVmBIOSTrack: ActionResult;
  setVmBootMode: ActionResult;
  setVmBootOrder: ActionResult;
  setVmBootVolume: ActionResult;
  setVmCleanTraffic: ActionResult;
  setVmClockTrack: ActionResult;
  setVmConsoleMode: ActionResult;
  setVmConsolePassword: ActionResult;
  setVmDns: ActionResult;
  setVmEmulatorPin: ActionResult;
  setVmHaLevel: ActionResult;
  setVmHostname: ActionResult;
  setVmInstanceDefaultCdRom: ActionResult;
  setVmInstanceGpuOffering: ActionResult;
  setVmMonitorNumber: ActionResult;
  setVmNicSecurityGroup: ActionResult;
  setVmSshKey: ActionResult;
  setVmStaticIp: ActionResult;
  setVmUsbRedirect: ActionResult;
  setVolumeQos: ActionResult;
  shareImageToPublic: ActionResult;
  shareInstanceOfferingToPublic: InstanceOfferingActionResp;
  shareResource: ActionResult;
  shareResources: ActionResult;
  snsEmailTestConnection: ActionResult;
  snsSnmpTestConnection: ActionResult;
  startBaremetalInstance: ActionResult;
  startBaremetalPxeServer: ActionResult;
  startSnmpAgent: ActionResult;
  startVmFromHost: ActionResult;
  startVmInstance: ActionResult;
  stopBaremetalInstance: ActionResult;
  stopBaremetalPxeServer: ActionResult;
  stopSnmpAgent: ActionResult;
  stopVmInstance: ActionResult;
  storageMigrateVmInstance: ActionResult;
  subscribeEvent: ActionResult;
  subscribeSNSTopic: ActionResult;
  syncAccountsFromLdapServer: ActionResult;
  syncBackupDataToLocal: ActionResult;
  syncBackupToRemote: ActionResult;
  syncDatabaseBackupToLocal: ActionResult;
  syncDatabaseBackupToRemote: ActionResult;
  syncImageFromImageStoreBackupStorage: ActionResult;
  syncImageSize: ActionResult;
  syncTimeServer: ActionResult;
  syncVolumeSize: ActionResult;
  testConnectExternalPrimaryStorage: ActionResult;
  testConnectSNSEndPoint: TestConnectSNSEndPointOutput;
  testConnection: ActionResult;
  testConnectionThirdParty: ActionResult;
  testDatabaseBackupStorageConnection: ActionResult;
  testLogServer: ActionResult;
  trustKmsProvider: ActionResult;
  turnCert: ActionResult;
  unGenerateMdevDevice: ActionResult;
  unGenerateSriovPciDevice: ActionResult;
  unsubscribeEvent: ActionResult;
  unsyncedSecurityMachineList: Array<SecurityMachine>;
  unubscribeSNSTopic: ActionResult;
  updateAccessControlRule: ActionResult;
  updateAccount: ActionResult;
  updateAccountConfig: ActionResult;
  updateAccountQuota: ActionResult;
  updateAccountThirdPartyAuth: ActionResult;
  updateAlarm: ActionResult;
  updateAlarmDataAsRead: UpdateAlarmDataResp;
  updateAlarmLabel: ActionResult;
  updateAlertDataAck: ActionResult;
  updateAliyunEbsBackupStorage: ActionResult;
  updateAliyunSmsSNSTextTemplate: ActionResult;
  updateAllAlarmHistoriesAsRead: ActionResult;
  updateBSTag: ActionResult;
  updateBaremetalChassis: ActionResult;
  updateBaremetalInstance: ActionResult;
  updateBaremetalPxeServer: ActionResult;
  updateCbdMds: ActionResult;
  updateCephBackupStorage: ActionResult;
  updateCephMon: ActionResult;
  updateCephPrimaryStoragePool: ActionResult;
  updateCephToken: ActionResult;
  updateCluster: ActionResult;
  updateClusterDRS: ActionResult;
  updateClusterDRSState: ActionResult;
  updateConsoleProxy: ActionResult;
  updateCustomColumns: ActionResult;
  updateDingTalkMsg: ActionResult;
  updateEmailAddressToEndpoint: ActionResult;
  updateEndpointAll: ActionResult;
  updateEventDataAsRead: UpdateEventDataResp;
  updateExternalPrimaryStoragePool: ActionResult;
  updateFeiShuMsg: ActionResult;
  updateGlobalConfig: ActionResult;
  updateGroup: ActionResult;
  updateHost: ActionResult;
  updateHostGroup: ActionResult;
  updateHostIPMI: ActionResult;
  updateHostIdentifier: ActionResult;
  updateHostKernelInterface: ActionResult;
  updateHostNetworkInterface: ActionResult;
  updateHostPowerStatus: ActionResult;
  updateImage: ActionResult;
  updateImageStoreBackupStorage: ActionResult;
  updateIscsiServers: ActionResult;
  updateKVMHost: ActionResult;
  updateKmsProvider: ActionResult;
  updateL2Network: ActionResult;
  updateL3Network: ActionResult;
  updateLLDPMode: ActionResult;
  updateLogServer: ActionResult;
  updateMonitorGroup: ActionResult;
  updateNvmeServer: ActionResult;
  updatePSTag: ActionResult;
  updatePciDevice: ActionResult;
  updatePersonalizationConfig: ActionResult;
  updatePreconfigurationTemplate: ActionResult;
  updatePrimaryStorage: ActionResult;
  updatePrimaryStorageCephx: ActionResult;
  updatePrimaryStorageThinProvision: ActionResult;
  updateResourceAttributeKey: ActionResult;
  updateResourceBackupJobStrategy: ActionResult;
  updateResourceConfig: ActionResult;
  updateResourceConfigs: ActionResult;
  updateResourceSharingGroup: ActionResult;
  updateRoleApiConfig: ActionResult;
  updateRoleConfig: ActionResult;
  updateSNSApplicationEndpoint: ActionResult;
  updateSNSDingTalkAtPerson: ActionResult;
  updateSNSEmailServer: ActionResult;
  updateSNSFeiShuAtPerson: ActionResult;
  updateSNSTextTemplate: ActionResult;
  updateSNSWeComAtPerson: ActionResult;
  updateSchedulerJobGroup: ActionResult;
  updateScript: ActionResult;
  updateSecurityGroup: ActionResult;
  updateSecurityGroupRulePriority: ActionResult;
  updateSftpBackupStorage: ActionResult;
  updateSingleAlarmHistoryAsRead: ActionResult;
  updateSmsReceiver: ActionResult;
  updateSnapshotStrategy: ActionResult;
  updateSnmpAgent: ActionResult;
  updateSnmpTrapReceiver: ActionResult;
  updateStorageNetworkCidr: ActionResult;
  updateSubscribeEvent: ActionResult;
  updateTag: ActionResult;
  updateTelemetryConsent: ActionResult;
  updateThirdPartyAuth: ActionResult;
  updateThirdpartyAlertsAsRead: UpdateThirdpartyAlertsResp;
  updateThirdpartyAlertsAsReadWithAction: ActionResult;
  updateThirdpartyPlatform: ActionResult;
  updateTimeServer: ActionResult;
  updateTpm: ActionResult;
  updateUsb: ActionSendResp;
  updateUsbDevice: ActionResult;
  updateUserGroupConfig: ActionResult;
  updateVGPUDevice: ActionResult;
  updateVirtualSwitchUplink: ActionResult;
  updateVirtualSwitchUplinkBondings: ActionResult;
  updateVirtualSwitchUplinkGroup: ActionResult;
  updateVmCustomSpecification: ActionResult;
  updateVmGroup: ActionResult;
  updateVmInstance: ActionResult;
  updateVmNetworkConfig: ActionResult;
  updateVmNicDriver: ActionResult;
  updateVmNicMac: ActionResult;
  updateVmPriority: ActionResult;
  updateVmSchedulingRule: ActionResult;
  updateVmTemplate: ActionResult;
  updateVolume: ActionResult;
  updateVolumeSnapshot: ActionResult;
  updateWeComMsg: ActionResult;
  updateXmlHook: ActionResult;
  updateZSVBackupStorage: ActionResult;
  updateZSVBackupStorageConfig: ActionResult;
  updateZone: ActionResult;
  updateZsKv?: Maybe<ZsKvResult>;
  upgradeMigrationService: UpgradeMigrationServiceAction;
  uploadKmsClientCsr: ActionResult;
  uploadKmsClientIdentity: ActionResult;
  uploadKmsClientSignedCert: ActionResult;
  validateAliyunSmsEndpoint: ActionResult;
  validateSNSEmailServer: ActionResult;
  validateSecurityGroupRule: Array<ValidateSecurityGroupRuleOutput>;
  validateVmSchedulingRule: ValidateVmSchedulingRuleResult;
  vmNicBindSecurityGroup: ActionResult;
  vmNicUnBindSecurityGroup: ActionResult;
  zsvCreateVmFromBackupData: ActionResult;
  zsvRecoverBackupData: ActionResult;
  zsvRevertVolumeFromSnapshot: ActionResult;
  zsvRevokeResourceSharing: ActionResult;
  zsvShareResource: ActionResult;
  zsvShareResourceFromAccount: ActionResult;
}


export interface MutationTakeoverPrimaryStorageArgs {
  input: TakeoverPrimaryStorageInput;
}


export interface MutationUpdateZSVBackupStoragePasswordArgs {
  input: UpdateZSVBackupStoragePasswordInput;
}


export interface MutationackAlarmDataArgs {
  input: AckAlarmDataInput;
}


export interface MutationaddAccessControlRuleArgs {
  input: AddAccessControlRuleInput;
}


export interface MutationaddActionToAlarmArgs {
  input: AddActionToAlarmInput;
}


export interface MutationaddActionToEventSubscriptionArgs {
  input: AddActionToEventSubscriptionInput;
}


export interface MutationaddAlarmToEndpointArgs {
  input: AddAlarmToEndPointInput;
}


export interface MutationaddCbdMdsArgs {
  input: AddCbdMdsInput;
}


export interface MutationaddCephBackupStorageArgs {
  input: AddCephBackupStorageInput;
}


export interface MutationaddCephMonArgs {
  input: AddCephMonInput;
}


export interface MutationaddCephPrimaryStoragePoolArgs {
  input: AddCephPrimaryStoragePoolInput;
}


export interface MutationaddDnsToL3NetworkArgs {
  input: AddDnsToL3NetworkInput;
}


export interface MutationaddEmailAddressArgs {
  input: AddEmailAddressToEndpointInput;
}


export interface MutationaddExternalPrimaryStoragePoolArgs {
  input: AddExternalPrimaryStoragePoolInput;
}


export interface MutationaddGroupArgs {
  input: AddGroupInput;
}


export interface MutationaddHostToHostGroupArgs {
  input: AddHostToHostGroupInput;
}


export interface MutationaddImageArgs {
  input: AddImageInput;
}


export interface MutationaddImageStoreBackupStorageArgs {
  input: AddImageStoreBackupStorageInput;
}


export interface MutationaddIpRangeArgs {
  input: AddIpRangeInput;
}


export interface MutationaddIpRangeByCidrArgs {
  input: AddIpRangeByCidrInput;
}


export interface MutationaddIscsiServerArgs {
  input: AddIscsiServerInput;
}


export interface MutationaddKVMHostFromConfigFileArgs {
  input: AddKVMHostFromConfigFileInput;
}


export interface MutationaddKVMHostFromScanArgs {
  input: AddKVMHostFromScanInput;
}


export interface MutationaddKvmHostArgs {
  input: AddKVMHostInput;
}


export interface MutationaddMigrationServicePackageArgs {
  input: AddMigrationServicePackageInput;
}


export interface MutationaddNicArgs {
  input: AddNicInput;
}


export interface MutationaddNvmeServerArgs {
  input: AddNvmeServerInput;
}


export interface MutationaddPreconfigurationTemplateArgs {
  input: AddPreconfigurationTemplateInput;
}


export interface MutationaddResourceToBackupJobArgs {
  input: AddResourceToBackupJobInput;
}


export interface MutationaddResourcesToDirectoryArgs {
  input: AddResourcesToDirectoryInput;
}


export interface MutationaddSNSDingTalkAtPersonArgs {
  input: AddSNSDingTalkAtPersonInput;
}


export interface MutationaddSNSFeiShuAtPersonArgs {
  input: AddSNSFeiShuAtPersonInput;
}


export interface MutationaddSNSWeComAtPersonArgs {
  input: AddSNSWeComAtPersonInput;
}


export interface MutationaddSSOThirdPartyAuthArgs {
  input: AddSSOThirdPartyAuthInput;
}


export interface MutationaddSecretServerArgs {
  input: AddSecretServerInput;
}


export interface MutationaddSecurityGroupRuleArgs {
  input: AddSecurityGroupRuleInput;
}


export interface MutationaddSharedBlockToSharedBlockGroupArgs {
  input: AddSharedBlockToSharedBlockGroupInput;
}


export interface MutationaddSmsReceiverArgs {
  input: AddSmsReceiverInput;
}


export interface MutationaddThirdPartyAuthArgs {
  input: AddThirdPartyAuthInput;
}


export interface MutationaddTpmToVmArgs {
  input: AddTpmToVmInput;
}


export interface MutationaddUsersArgs {
  input: AddUsersInput;
}


export interface MutationaddVddkPackageArgs {
  input: AddVddkPackageInput;
}


export interface MutationaddVmNicToSecurityGroupArgs {
  input: AddVmNicToSecurityGroupInput;
}


export interface MutationaddVmToSnapshotStrategyArgs {
  input: AddVmToSnapshotStrategyInput;
}


export interface MutationaddVmToVmGroupArgs {
  input: AddVmToVmGroupInput;
}


export interface MutationaddXDragonHostArgs {
  input: AddXDragonHostInput;
}


export interface MutationapplyDRSAdviceArgs {
  input: ApplyDRSAdviceListInput;
}


export interface MutationapplyMonitorTemplateToMonitorGroupInMonitorTemplateArgs {
  input: ApplyMonitorTemplateToMonitorGroupInMonitorTemplateInput;
}


export interface MutationattachBackupStorageToZoneArgs {
  input: AttachBackupStorageToZoneInput;
}


export interface MutationattachBaremetalPxeServerArgs {
  input: AttachBaremetalPxeServerInput;
}


export interface MutationattachDataVolumeToVmArgs {
  input: AttachDataVolumeToVmInput;
}


export interface MutationattachGuestToolsIsoToVmArgs {
  input: AttachGuestToolsIsoToVmInput;
}


export interface MutationattachIscsiServerToClustersArgs {
  input: AttachIscsiServerToClusterInput;
}


export interface MutationattachIsoToVmInstanceArgs {
  input: AttachIsoToVmInstanceInput;
}


export interface MutationattachL2NetworkToClusterArgs {
  input: AttachOrDetachL2NetworksFromClusterActionInput;
}


export interface MutationattachL2NetworkToClusterWithBondArgs {
  input: AttachL2NetworksToClusterWithBondInput;
}


export interface MutationattachL2NetworkToHostArgs {
  input: AttachL2NetworkToHostInput;
}


export interface MutationattachL3NetworkToVmNicArgs {
  input: AttachL3NetworkToVmNicInput;
}


export interface MutationattachMdevDeviceToVmArgs {
  input: AttachMdevDeviceToVMInput;
}


export interface MutationattachNvmeServerToClustersArgs {
  input: AttachNvmeServerToClusterInput;
}


export interface MutationattachPciDeviceToVmArgs {
  input: AttachPciDeviceToVMInput;
}


export interface MutationattachPrimaryStorageToClusterArgs {
  input: AttachPrimaryStorageToClusterInput;
}


export interface MutationattachScsiLunToVmInstancesArgs {
  input: AttachScsiLunToVmInstanceInput;
}


export interface MutationattachTagArgs {
  input: AttachTagInput;
}


export interface MutationattachUsbDeviceToVmArgs {
  input: AttachUsbDeviceToVmInput;
}


export interface MutationattachVGpuToVmInstanceArgs {
  input: AttachVGpuToVmInstanceInput;
}


export interface MutationattachVmToVmGroupArgs {
  input: AttachVmToVmGroupInput;
}


export interface MutationattachXmlHookToVmArgs {
  input: AttachXmlHookToVmInput;
}


export interface MutationbackupNkpArgs {
  input: BackupNkpInput;
}


export interface MutationbackupStorageMigrateImageArgs {
  input: BackupStorageMigrateImageInput;
}


export interface MutationbatchCreateBaremetalChassisArgs {
  input: BatchCreateBaremetalChassisInput;
}


export interface MutationbatchCreateHostKernelInterfaceArgs {
  input: BatchCreateHostKernelInterfaceInput;
}


export interface MutationbatchCreateVolumeSnapshotArgs {
  input: BatchCreateVolumeSnapshotInput;
}


export interface MutationbatchUpdateResourceConfigArgs {
  input: BatchUpdateResourceConfigInput;
}


export interface MutationbindRolesArgs {
  input: BindRolesInput;
}


export interface MutationcalcHashArgs {
  input: CalcHashInput;
}


export interface MutationcancelDefaultSNSTextTemplateArgs {
  input: CancelDefaultSNSTextTemplateInput;
}


export interface MutationcancelLogCollectArgs {
  input: CancelLogCollectInput;
}


export interface MutationcancelLongjobArgs {
  input: CancelLongjobInput;
}


export interface MutationchangeAccessKeyStateArgs {
  input: ChangeAccessKeyStateInput;
}


export interface MutationchangeAccountTypeArgs {
  input: ChangeAccountTypeInput;
}


export interface MutationchangeBackupStorageStateArgs {
  input: ChangeBackupStorageStateInput;
}


export interface MutationchangeEventAlarmStateArgs {
  input: ChangeEventAlarmStateInput;
}


export interface MutationchangeImageStateArgs {
  input: ChangeImageStateInput;
}


export interface MutationchangePreconfigurationTemplateStateArgs {
  input: ChangePreconfigurationTemplateStateInput;
}


export interface MutationchangeResourceOwnerArgs {
  input: ChangeResourceOwnerInput;
}


export interface MutationchangeSNSApplicationEndpointArgs {
  input: ChangeEndpointInput;
}


export interface MutationchangeSchedulerJobGroupBasicInfoArgs {
  input: ChangeSchedulerJobGroupBasicInfoInput;
}


export interface MutationchangeSchedulerJobStateArgs {
  input: ChangeSchedulerJobStateInput;
}


export interface MutationchangeSchedulerStateArgs {
  input: ChangeSchedulerStateActionInput;
}


export interface MutationchangeSecurityGroupRuleArgs {
  input: ChangeSecurityGroupRuleInput;
}


export interface MutationchangeSecurityGroupRuleStateArgs {
  input: ChangeSecurityGroupRuleStateInput;
}


export interface MutationchangeSecurityGroupStateArgs {
  input: ChangeSecurityGroupStateInput;
}


export interface MutationchangeVmImageArgs {
  input: ChangeVmImageInput;
}


export interface MutationchangeVmNicNetworkArgs {
  input: ChangeVmNicNetworkInput;
}


export interface MutationchangeVmNicStateArgs {
  input: ChangeVmNicStateInput;
}


export interface MutationchangeVmPasswordArgs {
  input: ChangeVmPasswordInput;
}


export interface MutationchangeVmSchedulingRuleStateArgs {
  input: ChangeVmSchedulingRuleStateInput;
}


export interface MutationchangeVolumeStateArgs {
  input: ChangeVolumeStateInput;
}


export interface MutationchangeZSVBackupStorageStateArgs {
  input: ChangeZSVBackupStorageStateInput;
}


export interface MutationchangeZoneStateArgs {
  input: ChangeZoneStateInput;
}


export interface MutationcheckBaremetalChassisConfigFileArgs {
  baremetalChassisInfo: Scalars['String']['input'];
}


export interface MutationcheckHostnameRepeatArgs {
  input: CheckHostnameRepeatParam;
}


export interface MutationcheckIpAvailabilityArgs {
  input: CheckIpAvailabilityParam;
}


export interface MutationcheckIpForBondOrNicArgs {
  ip: Scalars['String']['input'];
}


export interface MutationcheckKVMHostConfigFileWithoutDoActionArgs {
  hostInfo: Scalars['String']['input'];
}


export interface MutationcheckMacAvailabilityArgs {
  input: CheckMacAvailabilityParam;
}


export interface MutationcheckScsiLunClusterStatusArgs {
  input: CheckScsiLunClusterStatusInput;
}


export interface MutationcheckVNicIpAvailabilityArgs {
  input: CheckVNicIpAvailabilityParam;
}


export interface MutationcleanStoragePackageArgs {
  input: CleanStoragePackageInput;
}


export interface MutationcleanUpTrashListArgs {
  input: CleanUpTrashListInput;
}


export interface MutationcleanUpgradeSoftwarePackageArgs {
  input: CleanUpgradeSoftwarePackageInput;
}


export interface MutationcloneRoleArgs {
  input: CloneRoleInput;
}


export interface MutationcloneVmInstanceArgs {
  input: CloneVmInstanceInput;
}


export interface MutationcloneVmToTemplateArgs {
  input: CloneVmToTemplateInput;
}


export interface MutationcloseHostIommuArgs {
  input: CloseHostIommuInput;
}


export interface MutationconfigBaremetalPxeServerArgs {
  input: ConfigBaremetalPxeServerInput;
}


export interface MutationcoverTemplateToVMArgs {
  input: ConverTemplateToVMInput;
}


export interface MutationcoverVmToTemplateArgs {
  input: VMConverToTemplateInput;
}


export interface MutationcreateAccessKeyArgs {
  input: CreateAccessKeyInput;
}


export interface MutationcreateAccountArgs {
  input: CreateAccountInput;
}


export interface MutationcreateAlarmArgs {
  input: CreateAlarmInput;
}


export interface MutationcreateAliyunSmsEndpointArgs {
  input: CreateAliyunSmsEndpointInput;
}


export interface MutationcreateAliyunSmsEndpointAndAccesskeyArgs {
  input: CreateAliyunSmsEndpointAndAccesskeyInput;
}


export interface MutationcreateAliyunSmsSNSTextTemplateArgs {
  input: CreateAliyunSmsSNSTextTemplateInput;
}


export interface MutationcreateBSTagArgs {
  input: CreateBSSystemTagInput;
}


export interface MutationcreateBackupDataArgs {
  input: CreateBackupInput;
}


export interface MutationcreateBaremetalChassisArgs {
  input: CreateBaremetalChassisInput;
}


export interface MutationcreateBaremetalClusterArgs {
  input: CreateBaremetalClusterInput;
}


export interface MutationcreateBaremetalInstanceArgs {
  input: CreateBaremetalInstanceInput;
}


export interface MutationcreateBlockPrimaryStorageArgs {
  input: CreateBlockPrimaryStorageInput;
}


export interface MutationcreateBondArgs {
  input: CreateBondInput;
}


export interface MutationcreateCephPrimaryStorageArgs {
  input: CreateCephPrimaryStorageInput;
}


export interface MutationcreateClusterArgs {
  input: CreateClusterInput;
}


export interface MutationcreateClusterDRSArgs {
  input: CreateClusterDRSInput;
}


export interface MutationcreateDataVolumeArgs {
  input: CreateDataVolumeInput;
}


export interface MutationcreateDataVolumeFromVolumeTemplateArgs {
  input: CreateDataVolumeFromVolumeTemplateInput;
}


export interface MutationcreateDingTalkEndpointArgs {
  input: CreateDingTalkEndpointInput;
}


export interface MutationcreateEmailEndpointArgs {
  input: CreateEmailEndpointInput;
}


export interface MutationcreateExternalPrimaryStorageArgs {
  input: CreateExternalPrimaryStorageInput;
}


export interface MutationcreateFeiShuEndpointArgs {
  input: CreateFeiShuEndpointInput;
}


export interface MutationcreateHostGroupArgs {
  input: CreateHostGroupInput;
}


export interface MutationcreateHostKernelInterfaceArgs {
  input: CreateHostKernelInterfaceInput;
}


export interface MutationcreateHttpEndpointArgs {
  input: CreateHttpEndpointInput;
}


export interface MutationcreateInstanceArgs {
  input: CreateInstanceInput;
}


export interface MutationcreateInstanceFromOvfArgs {
  input: CreateInstanceFromOvfInput;
}


export interface MutationcreateKmsProviderArgs {
  input: CreateKmsProviderInput;
}


export interface MutationcreateL2NetworkArgs {
  input: CreateL2NetworkActionInput;
}


export interface MutationcreateL3NetworkArgs {
  input: CreateL3NetworkInput;
}


export interface MutationcreateLocalStoragePrimaryStorageArgs {
  input: CreateLocalPrimaryStorageInput;
}


export interface MutationcreateLogCollectArgs {
  input: CreateLogCollectInput;
}


export interface MutationcreateLogServerArgs {
  input: CreateLogServerInput;
}


export interface MutationcreateMonitorGroupArgs {
  input: CreateMonitorGroupInput;
}


export interface MutationcreateNfsPrimaryStorageArgs {
  input: CreateNFSPrimaryStorageInput;
}


export interface MutationcreatePSTagArgs {
  input: CreatePSSystemTagInput;
}


export interface MutationcreateResourceAttributeKeyArgs {
  input: CreateResourceAttributeKeyInput;
}


export interface MutationcreateResourceBackupJobArgs {
  input: CreateResourceBackupJobInput;
}


export interface MutationcreateRoleArgs {
  input: CreateRoleInput;
}


export interface MutationcreateSNSEmailServerArgs {
  input: CreateSNSEmailPlatformInput;
}


export interface MutationcreateSNSMicrosoftTeamsEndpointArgs {
  input: CreateSNSMicrosoftTeamsEndpointInput;
}


export interface MutationcreateSNSTextTemplateArgs {
  input: CreateSNSTextTemplateInput;
}


export interface MutationcreateScriptArgs {
  input: CreateScriptInput;
}


export interface MutationcreateSecurityGroupArgs {
  input: CreateSecurityGroupInput;
}


export interface MutationcreateSharedBlockGroupPrimaryStorageArgs {
  input: CreateSharedBlockGroupPrimaryStorageInput;
}


export interface MutationcreateSharedMountPointPrimaryStorageArgs {
  input: CreateSharedMountPointPrimaryStorageInput;
}


export interface MutationcreateSnapshotStrategyArgs {
  input: CreateSnapshotStrategyInput;
}


export interface MutationcreateSnmpAgentArgs {
  input: CreateSnmpAgentInput;
}


export interface MutationcreateSnmpTrapEndpointArgs {
  input: CreateSnmpTrapEndpointInput;
}


export interface MutationcreateSnmpTrapReceiverArgs {
  input: CreateSnmpTrapReceiverInput;
}


export interface MutationcreateTagArgs {
  input: CreateTagInput;
}


export interface MutationcreateUserGroupArgs {
  input: CreateUserGroupInput;
}


export interface MutationcreateVMFromTemplateArgs {
  input: CreateVMFromTemplateInput;
}


export interface MutationcreateVMFromZSVSnapshotArgs {
  input: CreateVMFromZSVSnapshotInput;
}


export interface MutationcreateVmCdRomArgs {
  input: CreateVmCdRomInput;
}


export interface MutationcreateVmCustomSpecificationArgs {
  input: CreateVmCustomSpecificationInput;
}


export interface MutationcreateVmGroupArgs {
  input: CreateVmGroupInput;
}


export interface MutationcreateVmSchedulingRuleArgs {
  input: CreateVmSchedulingRuleInput;
}


export interface MutationcreateVolumeSnapshotArgs {
  input: CreateVolumeSnapshotInput;
}


export interface MutationcreateVolumeTemplateArgs {
  input: CreateVolumeTemplateInput;
}


export interface MutationcreateWeComEndpointArgs {
  input: CreateWeComEndpointInput;
}


export interface MutationcreateXmlHookArgs {
  input: CreateXmlHookInput;
}


export interface MutationcreateZSVBackupStorageArgs {
  input: CreateZSVBackupStorageInput;
}


export interface MutationcreateZoneArgs {
  input: CreateZoneInput;
}


export interface MutationdeleteAccessControlRuleArgs {
  input: DeleteAccessControlRuleInput;
}


export interface MutationdeleteAccessKeyArgs {
  input: DeleteAccessKeyInput;
}


export interface MutationdeleteAccountThirdPartyAuthArgs {
  input: DeleteAccountThirdPartyAuthInput;
}


export interface MutationdeleteAccountsArgs {
  input: DeleteAccountInput;
}


export interface MutationdeleteAlarmsArgs {
  input: DeleteZWatchAlarmInput;
}


export interface MutationdeleteBSTagArgs {
  input: DeleteBSSystemTagInput;
}


export interface MutationdeleteBackupDataListArgs {
  input: DeleteBackupDataListInput;
}


export interface MutationdeleteBackupStorageArgs {
  input: DeleteBackupStorageInput;
}


export interface MutationdeleteBaremetalChassisArgs {
  input: DeleteBaremetalChassisInput;
}


export interface MutationdeleteBaremetalInstanceArgs {
  input: DeleteBaremetalInstanceInput;
}


export interface MutationdeleteBaremetalPxeServerArgs {
  input: DeleteBaremetalPxeServerInput;
}


export interface MutationdeleteBondArgs {
  input: DeleteBondInput;
}


export interface MutationdeleteCbdMdsArgs {
  input: DeleteCbdMdsInput;
}


export interface MutationdeleteCdRomsArgs {
  input: DeleteCdRomInput;
}


export interface MutationdeleteCephMonListArgs {
  input: DeleteCephMonListInput;
}


export interface MutationdeleteCephPrimaryStoragePoolListArgs {
  input: DeleteCephPrimaryStoragePoolListInput;
}


export interface MutationdeleteClusterArgs {
  input: DeleteClusterInput;
}


export interface MutationdeleteDataVolumeArgs {
  input: DeleteDataVolumeInput;
}


export interface MutationdeleteDatabaseBackupDataListArgs {
  input: DeleteDatabaseBackupDataListInput;
}


export interface MutationdeleteEmailAddressToEndpointArgs {
  input: DeleteEmailAddressToEndpointInput;
}


export interface MutationdeleteExportedImageArgs {
  input: DeleteExportedImageInput;
}


export interface MutationdeleteExportedOvfArgs {
  input: DeleteExportVmInstanceFromOvfInput;
}


export interface MutationdeleteExternalPrimaryStoragePoolArgs {
  input: DeleteExternalPrimaryStoragePoolInput;
}


export interface MutationdeleteGroupArgs {
  input: DeleteGroupInput;
}


export interface MutationdeleteHostGroupArgs {
  input: DeleteHostGroupInput;
}


export interface MutationdeleteHostKernelInterfaceArgs {
  input: DeleteHostKernelInterfaceInput;
}


export interface MutationdeleteHostsArgs {
  input: DeleteHostInput;
}


export interface MutationdeleteImageArgs {
  input: DeleteImageInput;
}


export interface MutationdeleteIpRangeArgs {
  input: DeleteIpRangeInput;
}


export interface MutationdeleteIscsiServersArgs {
  input: DeleteIscsiServerInput;
}


export interface MutationdeleteKmsProviderArgs {
  input: DeleteKmsProviderInput;
}


export interface MutationdeleteL2NetworksArgs {
  input: DeleteL2NetworkActionInput;
}


export interface MutationdeleteL3NetworkArgs {
  input: DeleteL3NetworkInput;
}


export interface MutationdeleteLicenseArgs {
  input: DeleteLicenseInput;
}


export interface MutationdeleteLogCollectArgs {
  input: DeleteLogCollectInput;
}


export interface MutationdeleteLogServerArgs {
  input: DeleteLogServerInput;
}


export interface MutationdeleteMigrationGatewayVmArgs {
  input: DeleteMigrationGatewayVmInput;
}


export interface MutationdeleteNvmeServerArgs {
  input: DeleteNvmeServerInput;
}


export interface MutationdeletePSTagArgs {
  input: DeletePSSystemTagInput;
}


export interface MutationdeletePreConfigurationTemplateArgs {
  input: DeletePreconfigurationTemplateInput;
}


export interface MutationdeletePrimaryStorageListArgs {
  input: DeletePrimaryStorageListInput;
}


export interface MutationdeleteResourceAttributeKeyArgs {
  input: DeleteResourceAttributeKeyInput;
}


export interface MutationdeleteResourceBackupJobArgs {
  input: DeleteResourceBackupJobInput;
}


export interface MutationdeleteRoleArgs {
  input: DeleteRoleInput;
}


export interface MutationdeleteSNSApplicationEndpointArgs {
  input: DeleteEndpointInput;
}


export interface MutationdeleteSNSEmailServerArgs {
  input: DeleteSNSEmailPlatformInput;
}


export interface MutationdeleteSNSTextTemplateArgs {
  input: DeleteSNSTextTemplateInput;
}


export interface MutationdeleteSchedulerJobArgs {
  input: DeleteSchedulerJobInput;
}


export interface MutationdeleteScriptArgs {
  input: DeleteScriptInput;
}


export interface MutationdeleteSecurityGroupArgs {
  input: DeleteSecurityGroupInput;
}


export interface MutationdeleteSecurityGroupRuleArgs {
  input: DeleteSecurityGroupRuleInput;
}


export interface MutationdeleteSnapshotStrategyArgs {
  input: DeleteSnapshotStrategyInput;
}


export interface MutationdeleteSnmpTrapReceiverArgs {
  input: DeleteSnmpTrapReceiverInput;
}


export interface MutationdeleteTagArgs {
  input: DeleteTagInput;
}


export interface MutationdeleteThirdPartyAuthsArgs {
  input: DeleteThirdPartyAuthInput;
}


export interface MutationdeleteUserGroupArgs {
  input: DeleteUserGroupInput;
}


export interface MutationdeleteVmConsolePasswordArgs {
  input: DeleteVmConsolePasswordInput;
}


export interface MutationdeleteVmCustomSpecificationArgs {
  input: DeleteVmCustomSpecificationInput;
}


export interface MutationdeleteVmGroupArgs {
  input: DeleteVmGroupInput;
}


export interface MutationdeleteVmInstanceArgs {
  input: DeleteVmInstanceInput;
}


export interface MutationdeleteVmNicFromSecurityGroupArgs {
  input: DeleteVmNicFromSecurityGroupInput;
}


export interface MutationdeleteVmSchedulingRuleArgs {
  input: DeleteVmSchedulingRuleInput;
}


export interface MutationdeleteVmSshKeyArgs {
  input: DeleteVmSshKeyInput;
}


export interface MutationdeleteVmStaticIpArgs {
  input: DeleteVmStaticIpInput;
}


export interface MutationdeleteVmTemplateArgs {
  input: DeleteVmTemplateInput;
}


export interface MutationdeleteVolumeQosArgs {
  input: DeleteVolumeQosInput;
}


export interface MutationdeleteVolumeSnapshotArgs {
  input: DeleteVolumeSnapshotInput;
}


export interface MutationdeleteXmlHookArgs {
  input: DeleteXmlHookInput;
}


export interface MutationdeleteZSVBackupStorageArgs {
  input: DeleteZSVBackupStorageInput;
}


export interface MutationdeleteZoneArgs {
  input: DeleteZoneInput;
}


export interface MutationdetachBackupStorageFromZoneArgs {
  input: DetachBackupStorageFromZoneInput;
}


export interface MutationdetachBaremetalPxeServerArgs {
  input: DetachBaremetalPxeServerInput;
}


export interface MutationdetachDataVolumeFromVmArgs {
  input: DetachDataVolumeFromVmInput;
}


export interface MutationdetachGuestToolsIsoFromVmArgs {
  input: DetachGuestToolsIsoFromVmInput;
}


export interface MutationdetachIscsiServerFromClustersArgs {
  input: DetachIscsiServerFromClusterInput;
}


export interface MutationdetachIsoFromVmInstanceArgs {
  input: DetachIsoFromVmInstanceInput;
}


export interface MutationdetachL2NetworkFromClusterArgs {
  input: AttachOrDetachL2NetworksFromClusterActionInput;
}


export interface MutationdetachL2NetworkFromHostArgs {
  input: DetachL2NetworkFromHostInput;
}


export interface MutationdetachL3NetworkFromVmArgs {
  input: DetachL3NetworkFromVmInput;
}


export interface MutationdetachMdevDeviceFromVmArgs {
  input: DetachMdevDeviceFromVMInput;
}


export interface MutationdetachNvmeServerFromClustersArgs {
  input: DetachNvmeServerFromClusterInput;
}


export interface MutationdetachPciDeviceFromVmArgs {
  input: DetachPciDeviceFromVMInput;
}


export interface MutationdetachPrimaryStorageFromClusterArgs {
  input: DetachPrimaryStorageFromClusterInput;
}


export interface MutationdetachScsiLunFromVmInstanceArgs {
  input: DetachScsiLunFromVmInstanceInput;
}


export interface MutationdetachTagArgs {
  input: DetachTagInput;
}


export interface MutationdetachUsbDeviceToVmArgs {
  input: DetachUsbDeviceToVmInput;
}


export interface MutationdetachVGpuFromVmInstanceArgs {
  input: DetachVGpuFromVmInstanceInput;
}


export interface MutationdetachVmFromVmGroupArgs {
  input: DetachVmFromVmGroupInput;
}


export interface MutationdetachXmlHookFromVmArgs {
  input: DettachXmlHookFromVmInput;
}


export interface MutationdisableAlarmsArgs {
  input: DisableZWatchAlarmInput;
}


export interface MutationdisableClusterArgs {
  input: ChangeClusterStateInput;
}


export interface MutationdisableEmailServerSettingsArgs {
  input: DisableEmailServerInput;
}


export interface MutationdisableHostsArgs {
  input: DisableHostInput;
}


export interface MutationdisablePrimaryStorageListArgs {
  input: DisablePrimaryStorageInput;
}


export interface MutationeditAccountThirdPartyAuthConfigArgs {
  input: EditAccountThirdPartyAuthConfigInput;
}


export interface MutationeditBondArgs {
  input: EditBondInput;
}


export interface MutationeditHostConfigArgs {
  input: EditHostConfigInput;
}


export interface MutationeditL3NetworkConfigArgs {
  input: EditL3NetworkConfigInput;
}


export interface MutationeditVmGuestToolConfigArgs {
  input: EditGuestToolConfigInput;
}


export interface MutationeditVmInstanceConfigArgs {
  input: EditVmInstanceConfigInput;
}


export interface MutationeditVmNormalConfigArgs {
  input: EditNormalConfigInput;
}


export interface MutationeditVmOtherConfigArgs {
  input: EditOtherConfigInput;
}


export interface MutationeditVmRemoteConfigArgs {
  input: EditRemoteConfigInput;
}


export interface MutationeditVmTemplateConfigArgs {
  input: EditTemplatedVMConfigInput;
}


export interface MutationenableAlarmsArgs {
  input: EnableZWatchAlarmInput;
}


export interface MutationenableClusterArgs {
  input: ChangeClusterStateInput;
}


export interface MutationenableEmailServerSettingsArgs {
  input: EnableEmailServerInput;
}


export interface MutationenableHAStrategicArgs {
  input: HAStrategicInput;
}


export interface MutationenableHostsArgs {
  input: EnableHostInput;
}


export interface MutationenablePrimaryStorageListArgs {
  input: EnablePrimaryStorageInput;
}


export interface MutationexecuteDRSSchedulingArgs {
  input: ExecuteDRSSchedulingInput;
}


export interface MutationexecuteScriptArgs {
  input: ExecuteScriptInput;
}


export interface MutationexportDatabaseBackupUrlArgs {
  input: ExportBackupDatabaseUrlListInput;
}


export interface MutationexportImageArgs {
  input: ExportImageInput;
}


export interface MutationexportOvfArgs {
  input: ExportVmInstanceFromOvfInput;
}


export interface MutationexpungeBaremetalInstanceArgs {
  input: ExpungeBaremetalInstanceInput;
}


export interface MutationexpungeDataVolumeArgs {
  input: ExpungeDataVolumeInput;
}


export interface MutationexpungeImageArgs {
  input: ExpungeImageInput;
}


export interface MutationexpungeVmInstanceArgs {
  input: ExpungeVmInstanceInput;
}


export interface MutationflattenVmInstanceArgs {
  input: FlattenVmInstanceInput;
}


export interface MutationforceStopVmInstanceArgs {
  input: ForceStopVmInstanceInput;
}


export interface MutationgenNewCertArgs {
  input: GenNewPemInput;
}


export interface MutationgenerateMdevDeviceArgs {
  input: GenerateMdevDeviceInput;
}


export interface MutationgenerateSriovPciDevicesArgs {
  input: GenerateSriovPciDeviceInput;
}


export interface MutationgetHostWebSshUrlArgs {
  input: GetHostWebSshUrlInput;
}


export interface MutationgetLoginCaptchaArgs {
  input: GetLoginCaptchaPayload;
}


export interface MutationgetLoginProceduresArgs {
  input: GetLoginProceduresInput;
}


export interface MutationgetTwoFactorAuthenticationSecretArgs {
  input: GetTwoFactorAuthenticationSecretPayload;
}


export interface MutationimageModifyConfigArgs {
  input: ImageModifyConfigInput;
}


export interface MutationinspectBaremetalChassisArgs {
  input: InspectBaremetalChassisInput;
}


export interface MutationinstallMigrationServiceArgs {
  input: InstallMigrationServiceInput;
}


export interface MutationlocalStorageMigrateVolumeArgs {
  input: LocalStorageMigrateVolumeInput;
}


export interface MutationlocateHostNetworkInterfaceArgs {
  input: LocateHostNetworkInterfaceInput;
}


export interface MutationlocateLocalRaidPhysicalDriveArgs {
  input: LocateLocalRaidPhysicalDriveInput;
}


export interface MutationlogInArgs {
  input: LogInInput;
}


export interface MutationlogOutArgs {
  input: LogOutInput;
}


export interface MutationloginByAccountArgs {
  input: LoginByAccountInput;
}


export interface MutationloginOAuthArgs {
  input: LoginOAuthInput;
}


export interface MutationmaintainPrimaryStorageListArgs {
  input: MaintainPrimaryStorageInput;
}


export interface MutationmaintenanceHostsArgs {
  input: MaintenanceHostInput;
}


export interface MutationmanagementTagArgs {
  input: ManagementTagInput;
}


export interface MutationmigrateVmArgs {
  input: MigrateVmInput;
}


export interface MutationmodifyClusterConfigArgs {
  input: ModifyClusterConfigInput;
}


export interface MutationmodifyDingTalkAtPersonArgs {
  input: ModifyDingTalkAtPersonInput;
}


export interface MutationopenBaremetalInstanceConsoleArgs {
  input: OpenBaremetalInstanceConsoleInput;
}


export interface MutationopenConsoleAccessArgs {
  input: OpenConsoleInput;
}


export interface MutationopenHostIommuArgs {
  input: OpenHostIommuInput;
}


export interface MutationpauseVmInstanceArgs {
  input: PauseVmInstanceInput;
}


export interface MutationpoweroffVmInstanceArgs {
  input: PoweroffVmInstanceInput;
}


export interface MutationprimaryStorageMigrateVolumeArgs {
  input: PrimaryStorageMigrateVolumeInput;
}


export interface MutationreCreateLogCollectArgs {
  input: ReCreateLogCollectInput;
}


export interface MutationrebootBaremetalInstanceArgs {
  input: RebootBaremetalInstanceInput;
}


export interface MutationrebootVmInstanceArgs {
  input: RebootVmInstanceInput;
}


export interface MutationreclaimSpaceFromImageStoreArgs {
  input: ReclaimSpaceFromImageStoreInput;
}


export interface MutationreclaimSpaceFromZSVBackupStorageArgs {
  input: ReclaimSpaceFromZSVBackupStorageInput;
}


export interface MutationreconnectBackupStorageArgs {
  input: ReconnectBackupStorageInput;
}


export interface MutationreconnectBaremetalPxeServerArgs {
  input: ReconnectBaremetalPxeServerInput;
}


export interface MutationreconnectConsoleProxyArgs {
  input: ReconnectConsoleProxyInput;
}


export interface MutationreconnectHostsArgs {
  input: ReconnectHostInput;
}


export interface MutationreconnectPrimaryStorageListArgs {
  input: ReconnectPrimaryStorageInput;
}


export interface MutationreconnectZSVBackupStorageArgs {
  input: ReconnectZSVBackupStorageInput;
}


export interface MutationrecoverBaremetalInstanceArgs {
  input: RecoverBaremetalInstanceInput;
}


export interface MutationrecoverDataVolumeArgs {
  input: RecoverDataVolumeInput;
}


export interface MutationrecoverDatabaseBackupArgs {
  input: RecoverDatabaseBackupActionInput;
}


export interface MutationrecoverImageArgs {
  input: RecoverImageInput;
}


export interface MutationrecoverVmInstanceArgs {
  input: RecoverVmInstanceInput;
}


export interface MutationrefreshCaptchaArgs {
  captchaUuid: Scalars['String']['input'];
}


export interface MutationrefreshFiberChannelStoragesArgs {
  input: RefreshFiberChannelStorageInput;
}


export interface MutationrefreshIscsiServersArgs {
  input: RefreshIscsiServerInput;
}


export interface MutationrefreshNvmeServerArgs {
  input: RefreshNvmeServerInput;
}


export interface MutationrefreshNvmeTargetsArgs {
  input: RefreshNvmeTargetInput;
}


export interface MutationrefreshSharedblockDeviceCapacityArgs {
  input: RefreshSharedblockDeviceCapacityInput;
}


export interface MutationregisterVmInstanceArgs {
  input: RegisterVmInstanceInput;
}


export interface MutationreimageVmInstanceArgs {
  input: ReimageVmInstanceInput;
}


export interface MutationrekeyKeyProviderRefsArgs {
  input: RekeyKeyProviderRefsInput;
}


export interface MutationremoveActionFromAlarmArgs {
  input: RemoveActionFromAlarmInput;
}


export interface MutationremoveActionFromEventSubscriptionArgs {
  input: RemoveActionFromEventSubscriptionInput;
}


export interface MutationremoveAlarmFromEndpointArgs {
  input: RemoveAlarmFromEndPointInput;
}


export interface MutationremoveDnsFromL3NetworkArgs {
  input: RemoveDnsFromL3NetworkInput;
}


export interface MutationremoveHaStickStragedyArgs {
  input: RemoveHaStickStragedyActionInput;
}


export interface MutationremoveHostFromHostGroupArgs {
  input: RemoveHostFromHostGroupInput;
}


export interface MutationremoveNicArgs {
  input: RemoveNicInput;
}


export interface MutationremoveResourceFromBackupJobArgs {
  input: RemoveResourceFromBackupJobInput;
}


export interface MutationremoveSNSDingTalkAtPersonArgs {
  input: RemoveSNSDingTalkAtPersonInput;
}


export interface MutationremoveSNSFeiShuAtPersonArgs {
  input: RemoveSNSFeiShuAtPersonInput;
}


export interface MutationremoveSNSWeComAtPersonArgs {
  input: RemoveSNSWeComAtPersonInput;
}


export interface MutationremoveSmsReceiverArgs {
  input: RemoveSmsReceiverInput;
}


export interface MutationremoveTpmFromVmArgs {
  input: RemoveTpmFromVmInput;
}


export interface MutationremoveUsersArgs {
  input: RemoveUsersInput;
}


export interface MutationremoveVmFromVmGroupArgs {
  input: RemoveVmFromVmGroupInput;
}


export interface MutationresetArgs {
  input: CertResetInput;
}


export interface MutationresetGlobalConfigArgs {
  input: ResetGlobalConfigInput;
}


export interface MutationresizeDataVolumeArgs {
  input: ResizeDataVolumeInput;
}


export interface MutationresizeRootVolumeArgs {
  input: ResizeRootVolumeInput;
}


export interface MutationrestoreNkpArgs {
  input: RestoreNkpInput;
}


export interface MutationresumeVmInstanceArgs {
  input: ResumeVmInstanceInput;
}


export interface MutationrevertVolumeFromSnapshotArgs {
  input: RevertVolumeFromSnapshotInput;
}


export interface MutationrevokeImageFromPublicArgs {
  input: RevokeImageFromPublicInput;
}


export interface MutationrevokeInstanceOfferingShareingFromPublicArgs {
  input: RevokeInstanceOfferingSharingFromPublicInput;
}


export interface MutationrevokeMonitorTemplateFromMonitorGroupArgs {
  input: RevokeMonitorTemplateFromMonitorGroupInput;
}


export interface MutationrevokeResourceSharingArgs {
  input: RevokeResourceSharingInput;
}


export interface MutationrunDisasterRecoveryServiceActionArgs {
  input: RunDisasterRecoveryServiceActionInput;
}


export interface MutationrunSchedulerTriggerArgs {
  input: RunSchedulerTriggerInput;
}


export interface MutationscanDataZSVBackupStorageArgs {
  input: ScanDataZSVBackupStorageInput;
}


export interface MutationscanDatabaseBackupsArgs {
  input: ScanDatabaseBackupActionInput;
}


export interface MutationsetDefaultKmsProviderArgs {
  input: SetDefaultKmsProviderInput;
}


export interface MutationsetDefaultSNSTextTemplateArgs {
  input: SetDefaultSNSTextTemplateInput;
}


export interface MutationsetHaStickStragedyArgs {
  input: SetHaStickStragedyActionInput;
}


export interface MutationsetHostEptSupportArgs {
  input: SetHostEptSupportInput;
}


export interface MutationsetImageBootModeArgs {
  input: SetImageBootModeInput;
}


export interface MutationsetIpOnBondArgs {
  input: SetIpOnBondInput;
}


export interface MutationsetIpOnInterfaceArgs {
  input: SetIpOnInterfaceInput;
}


export interface MutationsetL2NetworkSrIovArgs {
  input: SetL2NetworkSrIovActionInput;
}


export interface MutationsetNicQosArgs {
  input: SetNicQosInput;
}


export interface MutationsetPhysicalNetworkBondPhysicalNetworkTypeArgs {
  input: SetPhysicalNetworkBondPhysicalNetworkTypeInput;
}


export interface MutationsetPhysicalNetworkInterfacePhysicalNetworkTypeArgs {
  input: SetPhysicalNetworkInterfacePhysicalNetworkTypeInput;
}


export interface MutationsetResourceAttributeValueArgs {
  input: SetResourceAttributeValueInput;
}


export interface MutationsetSystemTagArgs {
  input: SetSystemTagInput;
}


export interface MutationsetVmBIOSTrackArgs {
  input: SetVmBIOSTrackInput;
}


export interface MutationsetVmBootModeArgs {
  input: SetVmBootModeInput;
}


export interface MutationsetVmBootOrderArgs {
  input: SetVmBootOrderInput;
}


export interface MutationsetVmBootVolumeArgs {
  input: SetVmBootVolumeInput;
}


export interface MutationsetVmCleanTrafficArgs {
  input: SetVmCleanTrafficInput;
}


export interface MutationsetVmClockTrackArgs {
  input: SetVmClockTrackInput;
}


export interface MutationsetVmConsoleModeArgs {
  input: SetVmConsoleModeInput;
}


export interface MutationsetVmConsolePasswordArgs {
  input: SetVmConsolePasswordInput;
}


export interface MutationsetVmDnsArgs {
  input: SetVmDnsInput;
}


export interface MutationsetVmEmulatorPinArgs {
  input: SetVmEmulatorPinInput;
}


export interface MutationsetVmHaLevelArgs {
  input: SetVmHaLevelInput;
}


export interface MutationsetVmHostnameArgs {
  input: SetVmHostnameInput;
}


export interface MutationsetVmInstanceDefaultCdRomArgs {
  input: SetVmInstanceDefaultCdRomInput;
}


export interface MutationsetVmInstanceGpuOfferingArgs {
  input: SetVmInstanceGpuDeviceSpecInput;
}


export interface MutationsetVmMonitorNumberArgs {
  input: SetVmMonitorNumberInput;
}


export interface MutationsetVmNicSecurityGroupArgs {
  input: SetVmNicSecurityGroupInput;
}


export interface MutationsetVmSshKeyArgs {
  input: SetVmSshKeyInput;
}


export interface MutationsetVmStaticIpArgs {
  input: SetVmStaticIpInput;
}


export interface MutationsetVmUsbRedirectArgs {
  input: SetVmUsbRedirectInput;
}


export interface MutationsetVolumeQosArgs {
  input: SetVolumeQosInput;
}


export interface MutationshareImageToPublicArgs {
  input: ShareImageToPublicInput;
}


export interface MutationshareInstanceOfferingToPublicArgs {
  input: ShareInstanceOfferingToPublicInput;
}


export interface MutationshareResourceArgs {
  input: ShareResourceInput;
}


export interface MutationshareResourcesArgs {
  input: ShareResourcesInput;
}


export interface MutationsnsEmailTestConnectionArgs {
  input: SNSEmailTestConnectionInput;
}


export interface MutationsnsSnmpTestConnectionArgs {
  input: SNSSnmpTestConnectionInput;
}


export interface MutationstartBaremetalInstanceArgs {
  input: StartBaremetalInstanceInput;
}


export interface MutationstartBaremetalPxeServerArgs {
  input: StartBaremetalPxeServerInput;
}


export interface MutationstartSnmpAgentArgs {
  input: StartSnmpAgentInput;
}


export interface MutationstartVmFromHostArgs {
  input: StartVmInstanceFromHostInput;
}


export interface MutationstartVmInstanceArgs {
  input: StartVmInstanceInput;
}


export interface MutationstopBaremetalInstanceArgs {
  input: StopBaremetalInstanceInput;
}


export interface MutationstopBaremetalPxeServerArgs {
  input: StopBaremetalPxeServerInput;
}


export interface MutationstopSnmpAgentArgs {
  input: StopSnmpAgentInput;
}


export interface MutationstopVmInstanceArgs {
  input: StopVmInstanceInput;
}


export interface MutationstorageMigrateVmInstanceArgs {
  input: StorageMigrateVmInstanceInput;
}


export interface MutationsubscribeEventArgs {
  input: SubscribeEventInput;
}


export interface MutationsyncAccountsFromLdapServerArgs {
  input: SyncAccountsFromLdapServerInput;
}


export interface MutationsyncBackupDataToLocalArgs {
  input: SyncBackupDataToLocalInput;
}


export interface MutationsyncBackupToRemoteArgs {
  input: SyncBackupDataToRemoteInput;
}


export interface MutationsyncDatabaseBackupToLocalArgs {
  input: SyncDatabaseBackupToLocalInput;
}


export interface MutationsyncDatabaseBackupToRemoteArgs {
  input: SyncDatabaseBackupToRemoteInput;
}


export interface MutationsyncImageFromImageStoreBackupStorageArgs {
  input: SyncImageFromImageStoreBackupStorageInput;
}


export interface MutationsyncImageSizeArgs {
  input: SyncImageSizeInput;
}


export interface MutationsyncTimeServerArgs {
  input: SyncTimeServerInput;
}


export interface MutationsyncVolumeSizeArgs {
  input: SyncVolumeSizeInput;
}


export interface MutationtestConnectExternalPrimaryStorageArgs {
  input: TestConnectExternalPrimaryStorageInput;
}


export interface MutationtestConnectSNSEndPointArgs {
  input: TestConnectSNSEndPointInput;
}


export interface MutationtestConnectionArgs {
  input: TestConnectionInput;
}


export interface MutationtestConnectionThirdPartyArgs {
  input: TestConnectionThirdPartyAuthInput;
}


export interface MutationtestDatabaseBackupStorageConnectionArgs {
  input: TestDatabaseBackupStorageConnectionInput;
}


export interface MutationtestLogServerArgs {
  input: TestLogServerInput;
}


export interface MutationtrustKmsProviderArgs {
  input: TrustKmsProviderInput;
}


export interface MutationturnCertArgs {
  input: CertUploadInfoInput;
}


export interface MutationunGenerateMdevDeviceArgs {
  input: UnGenerateMdevDeviceInput;
}


export interface MutationunGenerateSriovPciDeviceArgs {
  input: UnGenerateSriovPciDeviceInput;
}


export interface MutationunsubscribeEventArgs {
  input: UnsubscribeEventInput;
}


export interface MutationunsyncedSecurityMachineListArgs {
  input: CheckSyncInput;
}


export interface MutationupdateAccessControlRuleArgs {
  input: UpdateAccessControlRuleInput;
}


export interface MutationupdateAccountArgs {
  input: UpdateAccountInput;
}


export interface MutationupdateAccountConfigArgs {
  input: UpdateAccountConfigInput;
}


export interface MutationupdateAccountQuotaArgs {
  input: UpdateAccountQuotaInput;
}


export interface MutationupdateAccountThirdPartyAuthArgs {
  input: UpdateAccountThirdPartyAuthInput;
}


export interface MutationupdateAlarmArgs {
  input: UpdateAlarmInput;
}


export interface MutationupdateAlarmDataAsReadArgs {
  input: UpdateAlarmDataInput;
}


export interface MutationupdateAlarmLabelArgs {
  input: UpdateAlarmLabelInput;
}


export interface MutationupdateAlertDataAckArgs {
  input: UpdateAlertDataAckInput;
}


export interface MutationupdateAliyunEbsBackupStorageArgs {
  input: UpdateAliyunEbsBackupStorageInput;
}


export interface MutationupdateAliyunSmsSNSTextTemplateArgs {
  input: UpdateAliyunSmsSNSTextTemplateInput;
}


export interface MutationupdateAllAlarmHistoriesAsReadArgs {
  input: UpdateAllAlarmHistoriesAsReadInput;
}


export interface MutationupdateBSTagArgs {
  input: UpdateBSSystemTagInput;
}


export interface MutationupdateBaremetalChassisArgs {
  input: UpdateBaremetalChassisInput;
}


export interface MutationupdateBaremetalInstanceArgs {
  input: UpdateBaremetalInstanceInput;
}


export interface MutationupdateBaremetalPxeServerArgs {
  input: UpdateBaremetalPxeServerInput;
}


export interface MutationupdateCbdMdsArgs {
  input: UpdateCbdMdsInput;
}


export interface MutationupdateCephBackupStorageArgs {
  input: UpdateCephBackupStorageInput;
}


export interface MutationupdateCephMonArgs {
  input: UpdateCephMonInput;
}


export interface MutationupdateCephPrimaryStoragePoolArgs {
  input: UpdateCephPrimaryStoragePoolInput;
}


export interface MutationupdateCephTokenArgs {
  input: UpdateCephTokenInput;
}


export interface MutationupdateClusterArgs {
  input: UpdateClusterInput;
}


export interface MutationupdateClusterDRSArgs {
  input: UpdateClusterDRSInput;
}


export interface MutationupdateClusterDRSStateArgs {
  input: UpdateClusterDRSStateInput;
}


export interface MutationupdateConsoleProxyArgs {
  input: UpdateConsoleProxyInput;
}


export interface MutationupdateCustomColumnsArgs {
  input: UpdateCustomColumnsInput;
}


export interface MutationupdateDingTalkMsgArgs {
  input: UpdateDingTalkMsgInput;
}


export interface MutationupdateEmailAddressToEndpointArgs {
  input: UpdateEmailAddressToEndpointInput;
}


export interface MutationupdateEndpointAllArgs {
  input: UpdateEndpointAllInput;
}


export interface MutationupdateEventDataAsReadArgs {
  input: UpdateEventDataInput;
}


export interface MutationupdateExternalPrimaryStoragePoolArgs {
  input: UpdateExternalPrimaryStoragePoolInput;
}


export interface MutationupdateFeiShuMsgArgs {
  input: UpdateFeiShuMsgInput;
}


export interface MutationupdateGlobalConfigArgs {
  input: UpdateGlobalConfigInput;
}


export interface MutationupdateGroupArgs {
  input: UpdateGroupInput;
}


export interface MutationupdateHostArgs {
  input: UpdateHostInput;
}


export interface MutationupdateHostGroupArgs {
  input: UpdateHostGroupInput;
}


export interface MutationupdateHostIPMIArgs {
  input: UpdateHostIPMIInput;
}


export interface MutationupdateHostIdentifierArgs {
  input: UpdateHostIdentifierInput;
}


export interface MutationupdateHostKernelInterfaceArgs {
  input: UpdateHostKernelInterfaceInput;
}


export interface MutationupdateHostNetworkInterfaceArgs {
  input: UpdateHostNetworkInterfaceInput;
}


export interface MutationupdateHostPowerStatusArgs {
  input: UpdateHostPowerStatusInput;
}


export interface MutationupdateImageArgs {
  input: UpdateImageInput;
}


export interface MutationupdateImageStoreBackupStorageArgs {
  input: UpdateImageStoreBackupStorageInput;
}


export interface MutationupdateIscsiServersArgs {
  input: UpdateIscsiServerInput;
}


export interface MutationupdateKVMHostArgs {
  input: UpdateKVMHostInput;
}


export interface MutationupdateKmsProviderArgs {
  input: UpdateKmsProviderInput;
}


export interface MutationupdateL2NetworkArgs {
  input: UpdateL2NetworkActionInput;
}


export interface MutationupdateL3NetworkArgs {
  input: UpdateL3NetworkInput;
}


export interface MutationupdateLLDPModeArgs {
  input: UpdateHostNetworkInterfaceLLDPModeInput;
}


export interface MutationupdateLogServerArgs {
  input: UpdateLogServerInput;
}


export interface MutationupdateMonitorGroupArgs {
  input: UpdateMonitorGroupInput;
}


export interface MutationupdateNvmeServerArgs {
  input: UpdateNvmeServerInput;
}


export interface MutationupdatePSTagArgs {
  input: UpdatePSSystemTagInput;
}


export interface MutationupdatePciDeviceArgs {
  input: UpdatePciDeviceInput;
}


export interface MutationupdatePersonalizationConfigArgs {
  input: UpdatePersonalizationConfigInput;
}


export interface MutationupdatePreconfigurationTemplateArgs {
  input: UpdatePreconfigurationTemplateInput;
}


export interface MutationupdatePrimaryStorageArgs {
  input: UpdatePrimaryStorageInput;
}


export interface MutationupdatePrimaryStorageCephxArgs {
  input: UpdatePrimaryStorageCephxInput;
}


export interface MutationupdatePrimaryStorageThinProvisionArgs {
  input: UpdatePrimaryStorageThinProvisionInput;
}


export interface MutationupdateResourceAttributeKeyArgs {
  input: UpdateResourceAttributeKeyInput;
}


export interface MutationupdateResourceBackupJobStrategyArgs {
  input: UpdateResourceBackupJobStrategyInput;
}


export interface MutationupdateResourceConfigArgs {
  input: UpdateResourceConfigInput;
}


export interface MutationupdateResourceConfigsArgs {
  input: UpdateResourceConfigsInput;
}


export interface MutationupdateResourceSharingGroupArgs {
  input: UpdateResourceSharingGroupInput;
}


export interface MutationupdateRoleApiConfigArgs {
  input: UpdateRoleApiConfigInput;
}


export interface MutationupdateRoleConfigArgs {
  input: UpdateRoleConfigInput;
}


export interface MutationupdateSNSApplicationEndpointArgs {
  input: UpdateEndpointInput;
}


export interface MutationupdateSNSDingTalkAtPersonArgs {
  input: UpdateSNSDingTalkAtPersonInput;
}


export interface MutationupdateSNSEmailServerArgs {
  input: UpdateSNSEmailPlatformInput;
}


export interface MutationupdateSNSFeiShuAtPersonArgs {
  input: UpdateSNSFeiShuAtPersonInput;
}


export interface MutationupdateSNSTextTemplateArgs {
  input: UpdateSNSTextTemplateInput;
}


export interface MutationupdateSNSWeComAtPersonArgs {
  input: UpdateSNSWeComAtPersonInput;
}


export interface MutationupdateSchedulerJobGroupArgs {
  input: UpdateSchedulerJobGroupInput;
}


export interface MutationupdateScriptArgs {
  input: UpdateScriptInput;
}


export interface MutationupdateSecurityGroupArgs {
  input: UpdateSecurityGroupInput;
}


export interface MutationupdateSecurityGroupRulePriorityArgs {
  input: UpdateSecurityGroupRulePriorityInput;
}


export interface MutationupdateSftpBackupStorageArgs {
  input: UpdateSftpBackupStorageInput;
}


export interface MutationupdateSingleAlarmHistoryAsReadArgs {
  input: UpdateSingleAlarmHistoryAsReadInput;
}


export interface MutationupdateSmsReceiverArgs {
  input: UpdateSmsReceiverInput;
}


export interface MutationupdateSnapshotStrategyArgs {
  input: UpdateSnapshotStrategyInput;
}


export interface MutationupdateSnmpAgentArgs {
  input: UpdateSnmpAgentInput;
}


export interface MutationupdateSnmpTrapReceiverArgs {
  input: UpdateSnmpTrapReceiverInput;
}


export interface MutationupdateStorageNetworkCidrArgs {
  input: UpdateStorageNetworkCidrInput;
}


export interface MutationupdateSubscribeEventArgs {
  input: UpdateSubscribeEventInput;
}


export interface MutationupdateTagArgs {
  input: UpdateTagInput;
}


export interface MutationupdateTelemetryConsentArgs {
  input: UpdateTelemetryConsentInput;
}


export interface MutationupdateThirdPartyAuthArgs {
  input: UpdateThirdPartyAuthInput;
}


export interface MutationupdateThirdpartyAlertsAsReadArgs {
  input: UpdateThirdpartyAlertsInput;
}


export interface MutationupdateThirdpartyAlertsAsReadWithActionArgs {
  input: UpdateThirdpartyAlertsWithActionInput;
}


export interface MutationupdateThirdpartyPlatformArgs {
  input: UpdateThirdpartyPlatformInput;
}


export interface MutationupdateTimeServerArgs {
  input: UpdateTimeServerInput;
}


export interface MutationupdateTpmArgs {
  input: UpdateTpmInput;
}


export interface MutationupdateUsbArgs {
  input: UpdateUsbInput;
}


export interface MutationupdateUsbDeviceArgs {
  input: UpdateUsbDeviceInput;
}


export interface MutationupdateUserGroupConfigArgs {
  input: UpdateUserGroupConfigInput;
}


export interface MutationupdateVGPUDeviceArgs {
  input: UpdateVGPUDeviceInput;
}


export interface MutationupdateVirtualSwitchUplinkArgs {
  input: UpdateVirtualSwitchUplinkInput;
}


export interface MutationupdateVirtualSwitchUplinkBondingsArgs {
  input: UpdateVirtualSwitchUplinkBondingsActionInput;
}


export interface MutationupdateVirtualSwitchUplinkGroupArgs {
  input: UpdateVirtualSwitchUplinkGroupActionInput;
}


export interface MutationupdateVmCustomSpecificationArgs {
  input: UpdateVmCustomSpecificationInput;
}


export interface MutationupdateVmGroupArgs {
  input: UpdateVmGroupInput;
}


export interface MutationupdateVmInstanceArgs {
  input: UpdateVmInstanceInput;
}


export interface MutationupdateVmNetworkConfigArgs {
  input: UpdateVmNetworkConfigInput;
}


export interface MutationupdateVmNicDriverArgs {
  input: UpdateVmNicDriverInput;
}


export interface MutationupdateVmNicMacArgs {
  input: UpdateVmNicMacInput;
}


export interface MutationupdateVmPriorityArgs {
  input: UpdateVmPriorityInput;
}


export interface MutationupdateVmSchedulingRuleArgs {
  input: UpdateVmSchedulingRuleInput;
}


export interface MutationupdateVmTemplateArgs {
  input: UpdateVmTemplateInput;
}


export interface MutationupdateVolumeArgs {
  input: UpdateVolumeActionInput;
}


export interface MutationupdateVolumeSnapshotArgs {
  input: UpdateVolumeSnapshotInput;
}


export interface MutationupdateWeComMsgArgs {
  input: UpdateWeComMsgInput;
}


export interface MutationupdateXmlHookArgs {
  input: UpdateXmlHookInput;
}


export interface MutationupdateZSVBackupStorageArgs {
  input: UpdateZSVBackupStorageInput;
}


export interface MutationupdateZSVBackupStorageConfigArgs {
  input: UpdateZSVBackupStorageConfigInput;
}


export interface MutationupdateZoneArgs {
  input: UpdateZoneInput;
}


export interface MutationupdateZsKvArgs {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
}


export interface MutationupgradeMigrationServiceArgs {
  input: UpgradeMigrationServiceInput;
}


export interface MutationuploadKmsClientCsrArgs {
  input: UploadKmsClientCsrInput;
}


export interface MutationuploadKmsClientIdentityArgs {
  input: UploadKmsClientIdentityInput;
}


export interface MutationuploadKmsClientSignedCertArgs {
  input: UploadKmsClientSignedCertInput;
}


export interface MutationvalidateAliyunSmsEndpointArgs {
  input: ValidateAliyunSmsEndpointInput;
}


export interface MutationvalidateSNSEmailServerArgs {
  input: ValidateSNSEmailPlatformInput;
}


export interface MutationvalidateSecurityGroupRuleArgs {
  input: ValidateSecurityGroupRuleInput;
}


export interface MutationvalidateVmSchedulingRuleArgs {
  input: ValidateVmSchedulingRuleParam;
}


export interface MutationvmNicBindSecurityGroupArgs {
  input: VmNicBindSecurityGroupInput;
}


export interface MutationvmNicUnBindSecurityGroupArgs {
  input: VmNicUnBindSecurityGroupInput;
}


export interface MutationzsvCreateVmFromBackupDataArgs {
  input: ZSVCreateVmFromBackupDataInput;
}


export interface MutationzsvRecoverBackupDataArgs {
  input: ZSVRecoverBackupDataInput;
}


export interface MutationzsvRevertVolumeFromSnapshotArgs {
  input: ZSVRevertVolumeFromSnapshotInput;
}


export interface MutationzsvRevokeResourceSharingArgs {
  input: ZsvRevokeResourceSharingInput;
}


export interface MutationzsvShareResourceArgs {
  input: ZsvShareResourceToGroupInput;
}


export interface MutationzsvShareResourceFromAccountArgs {
  input: ZsvShareResourceFromAccountInput;
}

export interface NUMATopology {
  hostTopology?: Maybe<Array<HostNUMATopology>>;
  vmName?: Maybe<Scalars['String']['output']>;
  vmTopology?: Maybe<Array<VMNUMATopology>>;
  vmUuid?: Maybe<Scalars['String']['output']>;
}

export interface NVMeLun {
  createDate?: Maybe<Scalars['String']['output']>;
  healthState?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  multipathDeviceUuid?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nvmeLunHostRefs: Array<NvmeLunHostRefInventory>;
  nvmeServer?: Maybe<NvmeServer>;
  nvmeTargetUuid?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  serial?: Maybe<Scalars['String']['output']>;
  size: Scalars['Float']['output'];
  source?: Maybe<LunSource>;
  state?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vendor?: Maybe<Scalars['String']['output']>;
  wwid?: Maybe<Scalars['String']['output']>;
  wwn?: Maybe<Scalars['String']['output']>;
}

export interface NVMeLunList {
  error?: Maybe<ActionError>;
  list: Array<NVMeLun>;
  total: Scalars['Int']['output'];
}

export enum NVMeLunType {
  Normal = 'Normal',
  TransportNotPcie = 'TransportNotPcie'
}

export interface NetworkServiceProvider {
  attachedL2NetworkUuids?: Maybe<Array<Scalars['String']['output']>>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  networkServiceTypes?: Maybe<Array<Scalars['String']['output']>>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface NetworkServices {
  l3NetworkUuid?: Maybe<Scalars['String']['output']>;
  networkServiceProvider?: Maybe<NetworkServiceProvider>;
  networkServiceProviderUuid?: Maybe<Scalars['String']['output']>;
  networkServiceType?: Maybe<Scalars['String']['output']>;
}

export interface NetworkTopology {
  category?: Maybe<Scalars['String']['output']>;
  data?: Maybe<DataInNetworkTopology>;
  name?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vmCount?: Maybe<Scalars['Int']['output']>;
}

export interface NetworkTopologyRelation {
  l3NetworkUuid: Scalars['String']['output'];
  vmInstanceUuid: Scalars['String']['output'];
}

export interface NicDevice {
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<NicType>;
}

export interface NicMetricData {
  average: Scalars['Float']['output'];
  max: Scalars['Float']['output'];
  percent95: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
}

export enum NicState {
  DOWN = 'DOWN',
  UP = 'UP'
}

export enum NicType {
  Bond = 'Bond',
  Nic = 'Nic'
}

export interface NoTagResourceResp {
  count?: Maybe<Scalars['Int']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
}

export interface NodeDetail {
  architecture?: Maybe<Scalars['String']['output']>;
  baremetalChassisCount?: Maybe<Scalars['Int']['output']>;
  bondingMode?: Maybe<Scalars['String']['output']>;
  clusterCount?: Maybe<Scalars['Int']['output']>;
  clusterUuid?: Maybe<Scalars['String']['output']>;
  hostBondList?: Maybe<Array<HostBondItem>>;
  hostCount?: Maybe<Scalars['Int']['output']>;
  hostNicList?: Maybe<Array<HostNicItem>>;
  hypervisorType?: Maybe<Scalars['String']['output']>;
  managementIp?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  physicalInterface?: Maybe<Scalars['String']['output']>;
  portGroupCount?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  systemSerialNumber?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  vlanId?: Maybe<Scalars['Int']['output']>;
  vmCount?: Maybe<Scalars['Int']['output']>;
  vmNicList?: Maybe<Array<VmNicItem>>;
  xmitHashPolicy?: Maybe<Scalars['String']['output']>;
}

export interface NodeInfo {
  hostname?: Maybe<Scalars['String']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  isManagementNode?: Maybe<Scalars['Boolean']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  port?: Maybe<Scalars['Int']['output']>;
  sn?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
}

export enum NodeType {
  ComputeNode = 'ComputeNode',
  ManagementNode = 'ManagementNode'
}

export interface NotifyObject {
  actionUuid?: Maybe<Scalars['String']['output']>;
  alarmUuid?: Maybe<Scalars['String']['output']>;
}

export interface NumaNodeItem {
  cpus: Array<Scalars['String']['output']>;
  numaNode: Scalars['String']['output'];
}

export interface NvmeLunHostRefInventory {
  createDate?: Maybe<Scalars['String']['output']>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  nvmeLunUuid?: Maybe<Scalars['String']['output']>;
}

export interface NvmeServer {
  createDate?: Maybe<Scalars['String']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  lunDeviceUsageInfo: NvmeServerLUNDeviceUsageInfo;
  name: Scalars['String']['output'];
  nvmeClusterRefs: Array<NvmeServerClusterRefInventory>;
  nvmeTargets: Array<NvmeTargetInventory>;
  port?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  transport: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
  zones?: Maybe<Array<Zone>>;
}

export interface NvmeServerClusterRefInventory {
  clusterUuid?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  nvmeServerUuid?: Maybe<Scalars['String']['output']>;
}

export interface NvmeServerLUNDeviceUsageInfo {
  totalLunNum?: Maybe<Scalars['Float']['output']>;
  unusedLunNum?: Maybe<Scalars['Float']['output']>;
  usedLunNum?: Maybe<Scalars['Float']['output']>;
}

export interface NvmeServerList {
  error?: Maybe<ActionError>;
  list: Array<NvmeServer>;
  total: Scalars['Int']['output'];
}

export enum NvmeServerQueryType {
  GET_CLUSTER_ATTACHABLE_NVME_SERVER = 'GET_CLUSTER_ATTACHABLE_NVME_SERVER',
  NORMAL = 'NORMAL'
}

export interface NvmeTarget {
  createDate?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  lunDeviceUsageInfo?: Maybe<NvmeTargetLUNDeviceUsageInfo>;
  name: Scalars['String']['output'];
  nqn?: Maybe<Scalars['String']['output']>;
  nvmeLuns: Array<NVMeLun>;
  nvmeServerUuid?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  transport?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  /** NvmeTarget 上 nvmeLuns 对应的 nvmeLunHostRefs 所在host的zone，没有nvmeLunHostRefs则无zone */
  zones?: Maybe<Array<Zone>>;
}

export interface NvmeTargetInventory {
  createDate?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  nqn?: Maybe<Scalars['String']['output']>;
  nvmeLuns: Array<NVMeLun>;
  nvmeServerUuid?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface NvmeTargetLUNDeviceUsageInfo {
  totalLunNum?: Maybe<Scalars['Float']['output']>;
  unusedLunNum?: Maybe<Scalars['Float']['output']>;
  usedLunNum?: Maybe<Scalars['Float']['output']>;
}

export interface NvmeTargetList {
  error?: Maybe<ActionError>;
  list: Array<NvmeTarget>;
  total: Scalars['Int']['output'];
}

export interface OAuthClientSecretResult {
  clientSecret?: Maybe<Scalars['String']['output']>;
}

export interface OffsetTime {
  amount: Scalars['Float']['input'];
  unit: Scalars['String']['input'];
}

export interface OneClickAlarm {
  activeAlarmTemplate?: Maybe<Array<OneClickAlarmTemplate>>;
  namespace?: Maybe<Scalars['String']['output']>;
  oneClickAlarmTemplate?: Maybe<Array<OneClickAlarmTemplate>>;
  status?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface OneClickAlarmResourceCountResp {
  hostTotal?: Maybe<Scalars['Int']['output']>;
  vmTotal?: Maybe<Scalars['Int']['output']>;
  vpcRouterTotal?: Maybe<Scalars['Int']['output']>;
}

export interface OneClickAlarmResp {
  /** 查询结果列表 */
  list?: Maybe<Array<OneClickAlarm>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface OneClickAlarmTemplate {
  actions?: Maybe<Array<NotifyObject>>;
  actionsName?: Maybe<Array<Scalars['String']['output']>>;
  alarmName?: Maybe<Scalars['String']['output']>;
  comparisonOperator?: Maybe<Scalars['String']['output']>;
  emergencyLevel?: Maybe<Scalars['String']['output']>;
  endPoint?: Maybe<Array<TemplateEndPoint>>;
  metricName?: Maybe<Scalars['String']['output']>;
  namespace?: Maybe<Scalars['String']['output']>;
  operatorAccountName?: Maybe<Scalars['String']['output']>;
  period?: Maybe<Scalars['Int']['output']>;
  repeatCount?: Maybe<Scalars['Int']['output']>;
  repeatInterval?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  threshold?: Maybe<Scalars['Float']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
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

export interface OpenBaremetalInstanceConsoleInput {
  action: ActionInput;
  payload: Array<OpenBaremetalInstanceConsolePayload>;
}

export interface OpenBaremetalInstanceConsolePayload {
  uuid: Scalars['String']['input'];
}

export interface OpenConsoleInput {
  action: ActionInput;
  payload: Array<OpenConsolePayload>;
}

export interface OpenConsolePayload {
  getToolsInfo?: InputMaybe<Scalars['Boolean']['input']>;
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  hypervisorType?: InputMaybe<Scalars['String']['input']>;
  /** 社区版本能打开vnc */
  licenseType?: InputMaybe<Scalars['String']['input']>;
  platform?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  vmInstanceUuid: Scalars['String']['input'];
}

export interface OpenHostIommuInput {
  action: ActionInput;
  payload: OpenHostIommuPayload;
}

export interface OpenHostIommuPayload {
  uuid: Scalars['String']['input'];
}

export interface OperationApi {
  apiId: Scalars['String']['output'];
  createDate?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  longjob?: Maybe<OperationLongjob>;
  name?: Maybe<Scalars['String']['output']>;
  req?: Maybe<Scalars['String']['output']>;
  resourceName?: Maybe<Scalars['String']['output']>;
  resp?: Maybe<Scalars['String']['output']>;
  signedText?: Maybe<Scalars['String']['output']>;
  status: OperationApiStatus;
  taskId: Scalars['String']['output'];
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

export interface OperationLog {
  accountName?: Maybe<Scalars['String']['output']>;
  actionId: Scalars['String']['output'];
  createDate?: Maybe<Scalars['String']['output']>;
  isValid?: Maybe<Scalars['Boolean']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  loginIp?: Maybe<Scalars['String']['output']>;
  longjobs?: Maybe<Array<OperationLongjob>>;
  name?: Maybe<Scalars['String']['output']>;
  operationTasks?: Maybe<Array<OperationTask>>;
  progress?: Maybe<Scalars['Float']['output']>;
  resourceNames?: Maybe<Array<Scalars['String']['output']>>;
  resourceUuids?: Maybe<Array<Scalars['String']['output']>>;
  status: OperationStatus;
  userId: Scalars['String']['output'];
  userName?: Maybe<Scalars['String']['output']>;
}

export interface OperationLongjob {
  clientJobUuid: Scalars['String']['output'];
  createDate?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['String']['output']>;
  jobName: Scalars['String']['output'];
  lastOpDate?: Maybe<Scalars['String']['output']>;
  longJobUuid: Scalars['String']['output'];
  progress?: Maybe<Scalars['Float']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  state?: Maybe<OperationLongjobStatus>;
  taskProgressDetails?: Maybe<TaskProgress>;
  userId?: Maybe<Scalars['String']['output']>;
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

export interface OperationTask {
  actionId: Scalars['String']['output'];
  createDate?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  operationApis?: Maybe<Array<OperationApi>>;
  status: OperationStatus;
  taskId: Scalars['String']['output'];
}

export interface OperatorInfo {
  /** 操作类型，也就是操作API, 目前可作为保留字段使用，后续有需求再补充 */
  apiName?: Maybe<Scalars['String']['output']>;
  /** 开始操作时间 */
  createTime?: Maybe<Scalars['String']['output']>;
  /** 操作人 */
  operator?: Maybe<Scalars['String']['output']>;
  /** 操作人UUID */
  operatorAccountUuid?: Maybe<Scalars['String']['output']>;
  /** 操作人状态 */
  operatorState?: Maybe<OperatorState>;
}

export enum OperatorState {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED'
}

export interface OsChildren {
  name?: Maybe<Scalars['String']['output']>;
  osRelease?: Maybe<Scalars['String']['output']>;
  platform: Scalars['String']['output'];
  uuid?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
}

export interface OvfDisk {
  capacity?: Maybe<Scalars['String']['output']>;
  fileName?: Maybe<Scalars['String']['output']>;
  ovfId?: Maybe<Scalars['String']['output']>;
}

export interface OvfExportEntity {
  backupStorage?: Maybe<BackupStorage>;
  backupStorageUuid: Scalars['String']['output'];
  createDate: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  exportUrl: Scalars['String']['output'];
  format?: Maybe<Scalars['String']['output']>;
  lastOpDate: Scalars['String']['output'];
  md5Sum: Scalars['String']['output'];
  name: Scalars['String']['output'];
  size: Scalars['Float']['output'];
  uuid: Scalars['String']['output'];
  vmInstance?: Maybe<VmInstance>;
  vmUuid: Scalars['String']['output'];
}

export interface OvfExportEntityList {
  error?: Maybe<ActionError>;
  list: Array<OvfExportEntity>;
  total: Scalars['Int']['output'];
}

export interface OvfFile {
  cpuNum?: Maybe<Scalars['Int']['output']>;
  disks?: Maybe<Array<OvfDisk>>;
  memorySize?: Maybe<Scalars['Float']['output']>;
  networks?: Maybe<Array<Scalars['String']['output']>>;
  ovf?: Maybe<Scalars['String']['output']>;
}

export interface OvfInfo {
  actionId: Scalars['String']['output'];
  jobResult?: Maybe<Scalars['String']['output']>;
}

export interface Owner {
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface OwnerNameAndUuidAndType {
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export type OwnerQueryResp = AccountGroupOwnerQueryResp | AccountOwnerQueryResp | ProjectOwnerQueryResp;

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

export interface OwnerSummaryQueryResp {
  account: Scalars['Int']['output'];
  project: Scalars['Int']['output'];
}

export enum OwnerSummaryType {
  All = 'All',
  Candidate = 'Candidate',
  ChangeOwner = 'ChangeOwner',
  Normal = 'Normal'
}

export interface Owners {
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface PCPUUsedItem {
  cpuNum: Scalars['String']['output'];
  value: Scalars['Float']['output'];
}

export interface PSForCephPrimaryStoragePool {
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface Parameter {
  constraintDescription?: Maybe<Scalars['String']['output']>;
  defaultValue?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  noEcho?: Maybe<Scalars['Boolean']['output']>;
  paramName: Scalars['String']['output'];
  resourceType?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
}

export interface Parameters {
  backupStorageUuids?: InputMaybe<Scalars['String']['input']>;
  fullBackupRetentionValue?: InputMaybe<Scalars['String']['input']>;
  fullBackupTriggerUuid?: InputMaybe<Scalars['String']['input']>;
  networkReadBandwidth?: InputMaybe<Scalars['String']['input']>;
  networkWriteBandwidth?: InputMaybe<Scalars['String']['input']>;
  remoteBackupStorageUuid?: InputMaybe<Scalars['String']['input']>;
  remoteFullBackupRetentionValue?: InputMaybe<Scalars['String']['input']>;
  remoteRetentionType?: InputMaybe<Scalars['String']['input']>;
  remoteRetentionValue?: InputMaybe<Scalars['String']['input']>;
  retentionType?: InputMaybe<Scalars['String']['input']>;
  retentionValue?: InputMaybe<Scalars['String']['input']>;
  snapshotGroupMaxNumber?: InputMaybe<Scalars['String']['input']>;
  snapshotMaxNumber?: InputMaybe<Scalars['String']['input']>;
  volumeReadBandwidth?: InputMaybe<Scalars['String']['input']>;
  volumeWriteBandwidth?: InputMaybe<Scalars['String']['input']>;
}

export interface ParseNkpRestoreInfo {
  backupTime?: Maybe<Scalars['BigInt']['output']>;
  name?: Maybe<Scalars['String']['output']>;
}

export interface ParseNkpRestoreResult {
  code?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  restoreInfo?: Maybe<ParseNkpRestoreInfo>;
}

export interface PauseVmInstanceInput {
  action: ActionInput;
  payload: Array<PauseVmInstancePayload>;
}

export interface PauseVmInstancePayload {
  uuid: Scalars['String']['input'];
}

export interface PciDevice {
  canDirectRestore?: Maybe<CanDirectRestore>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  deviceId?: Maybe<Scalars['String']['output']>;
  gpuType?: Maybe<PciDeviceGpuType>;
  host?: Maybe<HostInPciDevice>;
  hostNetworkInterface?: Maybe<HostNetworkInterface>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  matchedPciDeviceOfferingRef?: Maybe<Array<MatchedPciDeviceOfferingRef>>;
  mdevSpecRefs?: Maybe<Array<MdevSpecRefs>>;
  metaData?: Maybe<PciDeviceMetaData>;
  name: Scalars['String']['output'];
  parentUuid?: Maybe<Scalars['String']['output']>;
  passThroughState: PciDevicePassThroughState;
  pciDeviceAddress?: Maybe<Scalars['String']['output']>;
  pciDeviceSpec?: Maybe<PciDeviceSpecInPciDevice>;
  pciSpecUuid?: Maybe<Scalars['String']['output']>;
  physicalNicDeviceMaxPartNum?: Maybe<Scalars['Float']['output']>;
  shareType: ShareType;
  state?: Maybe<PciDeviceState>;
  status?: Maybe<PciDeviceStatus>;
  subdeviceId?: Maybe<Scalars['String']['output']>;
  subvendorId?: Maybe<Scalars['String']['output']>;
  templatedVmInstance?: Maybe<VmInstanceBase>;
  toPublic?: Maybe<Scalars['Boolean']['output']>;
  type?: Maybe<PciDeviceType>;
  uuid: Scalars['String']['output'];
  vendor?: Maybe<Scalars['String']['output']>;
  vendorId?: Maybe<Scalars['String']['output']>;
  vfAvailableNum?: Maybe<VfAvailableNum>;
  virtStatus?: Maybe<PciDeviceVirtStatus>;
  vmCount?: Maybe<Scalars['Int']['output']>;
  vmInstance?: Maybe<VmInstanceBase>;
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
}

export enum PciDeviceGpuType {
  ComputeGpu = 'ComputeGpu',
  DesktopGpu = 'DesktopGpu'
}

export interface PciDeviceList {
  /** 查询结果列表 */
  list?: Maybe<Array<PciDevice>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface PciDeviceMetaData {
  metaData: Scalars['String']['output'];
  metaDataEntries: Array<PciDeviceMetaDataEntries>;
}

export interface PciDeviceMetaDataEntries {
  key: Scalars['String']['output'];
  op: PciDeviceMetaDataOperator;
  value: Scalars['String']['output'];
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

export interface PciDeviceSpec {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  deviceId?: Maybe<Scalars['String']['output']>;
  isVirtual?: Maybe<Scalars['Boolean']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  maxPartNum?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  ramSize?: Maybe<Scalars['Boolean']['output']>;
  romContent?: Maybe<Scalars['String']['output']>;
  romMd5sum?: Maybe<Scalars['String']['output']>;
  romVersion?: Maybe<Scalars['String']['output']>;
  shareType: ShareType;
  state?: Maybe<PciDeviceSpecState>;
  subdeviceId?: Maybe<Scalars['String']['output']>;
  subvendorId?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vendorId?: Maybe<Scalars['String']['output']>;
}

export interface PciDeviceSpecInPciDevice {
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface PciDeviceSpecList {
  /** 查询结果列表 */
  list?: Maybe<Array<PciDeviceSpec>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
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

export interface PerformanceExportMetric {
  key: Scalars['String']['input'];
  values: Array<ExportMetricsValue>;
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

export interface PersonalizationConfig {
  /** 配置类型 */
  profileType: ProfileType;
  /** 资源类型 */
  resourceType: Scalars['String']['output'];
  userId?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
}

export interface PhysicalInterface {
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface PhysicalInterfaceQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<PhysicalInterface>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface PhysicalNetworkBond {
  bond: Bond;
  bondingUuid: Scalars['String']['output'];
  serviceTypeList: Array<PhysicalNetworkType>;
  serviceTypes: Array<PhysicalNetworkType>;
  uuid: Scalars['String']['output'];
  vlanId?: Maybe<Scalars['String']['output']>;
}

export interface PhysicalNetworkBondList {
  error?: Maybe<ActionError>;
  list: Array<PhysicalNetworkBond>;
  total: Scalars['Int']['output'];
}

export enum PhysicalNetworkBondQueryType {
  Normal = 'Normal'
}

export interface PhysicalNetworkInterface {
  interfaceUuid: Scalars['String']['output'];
  physicalNic: PhysicalNic;
  serviceTypes: Array<PhysicalNetworkType>;
  uuid: Scalars['String']['output'];
  vlanId?: Maybe<Scalars['String']['output']>;
}

export interface PhysicalNetworkInterfaceList {
  error?: Maybe<ActionError>;
  list: Array<PhysicalNetworkInterface>;
  total: Scalars['Int']['output'];
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

export interface PhysicalNic {
  availableVlanIds: Scalars['Boolean']['output'];
  bond?: Maybe<Bond>;
  bondingUuid?: Maybe<Scalars['String']['output']>;
  carrierActive?: Maybe<Scalars['Boolean']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  gateway?: Maybe<Scalars['String']['output']>;
  host?: Maybe<HostVO>;
  hostNetworkInterfaceServiceRef?: Maybe<Array<HostNetworkInterfaceServiceRef>>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  interfaceFactory?: Maybe<Scalars['String']['output']>;
  interfaceModel?: Maybe<Scalars['String']['output']>;
  interfaceName?: Maybe<Scalars['String']['output']>;
  interfaceType?: Maybe<Scalars['String']['output']>;
  ipAddresses?: Maybe<Array<Scalars['String']['output']>>;
  lLDPMode?: Maybe<LLDPMode>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  mac?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  offloadStatus?: Maybe<Scalars['String']['output']>;
  pciDevice?: Maybe<PciDevice>;
  pciDeviceAddress?: Maybe<Scalars['String']['output']>;
  readyState?: Maybe<ReadyState>;
  slaveActive?: Maybe<Scalars['Boolean']['output']>;
  speed?: Maybe<Scalars['Float']['output']>;
  state?: Maybe<NicState>;
  uuid?: Maybe<Scalars['String']['output']>;
  vSwitch?: Maybe<L2NetworkNameAndUuidForPhysicalNic>;
}

export interface PhysicalNicCountResp {
  down?: Maybe<Scalars['Int']['output']>;
  up?: Maybe<Scalars['Int']['output']>;
}

export interface PhysicalNicLLDPDevice {
  aggregationPortId?: Maybe<Scalars['Float']['output']>;
  chassisId: Scalars['String']['output'];
  createDate: Scalars['String']['output'];
  lastOpDate?: Maybe<Scalars['String']['output']>;
  lldpUuid: Scalars['String']['output'];
  managementAddress?: Maybe<Scalars['String']['output']>;
  mtu?: Maybe<Scalars['Int']['output']>;
  portDescription?: Maybe<Scalars['String']['output']>;
  portId: Scalars['String']['output'];
  systemCapabilities: Scalars['String']['output'];
  systemDescription: Scalars['String']['output'];
  systemName: Scalars['String']['output'];
  timeToLive: Scalars['Float']['output'];
  vlanId?: Maybe<Scalars['Float']['output']>;
}

export interface PhysicalNicList {
  /** 查询结果列表 */
  list?: Maybe<Array<PhysicalNic>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum PhysicalNicQueryType {
  Normal = 'Normal',
  getCandidatesPhysicalNicForAddToBondInL2VSwitch = 'getCandidatesPhysicalNicForAddToBondInL2VSwitch',
  getCandidatesPhysicalNicForCreateByInL2VSwitch = 'getCandidatesPhysicalNicForCreateByInL2VSwitch',
  getCandidatesPhysicalNicForCreateByInVM = 'getCandidatesPhysicalNicForCreateByInVM',
  getCandidatesPhysicalNicForMultipleCreateBond = 'getCandidatesPhysicalNicForMultipleCreateBond',
  getCandidatesPhysicalNicForSingleCreateOrModifyBond = 'getCandidatesPhysicalNicForSingleCreateOrModifyBond'
}

export interface PickGlobalConfig {
  category?: Scalars['String']['input'];
  name: Scalars['String']['input'];
}

export interface Platform {
  createDate?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  snmpAddress?: Maybe<Scalars['String']['output']>;
  snmpPort?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  /** 资源的UUID，唯一标示该资源 */
  uuid: Scalars['String']['output'];
}

export interface PointsDetails {
  activationTime?: Maybe<Scalars['String']['output']>;
  expireTime?: Maybe<Scalars['String']['output']>;
  resourceName?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface PointsDetailsQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<PointsDetails>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface PortGroup {
  virtualNetworkId?: Maybe<Scalars['Int']['output']>;
  vlanId: Scalars['Int']['output'];
}

export enum PortGroupVlanMode {
  ACCESS = 'ACCESS',
  NONE = 'NONE',
  PVLAN = 'PVLAN',
  TRUNK = 'TRUNK'
}

export interface PortMirror {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  flowNetwork: L3Network;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  mirrorNetworkUuid?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  sessions?: Maybe<Array<PortMirrorSession>>;
  state?: Maybe<PortMirrorState>;
  uuid: Scalars['String']['output'];
}

export interface PortMirrorList {
  error?: Maybe<ActionError>;
  list: Array<PortMirror>;
  total: Scalars['Int']['output'];
}

export interface PortMirrorSession {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dstEndPoint?: Maybe<Scalars['String']['output']>;
  dstVmNic?: Maybe<VmNic>;
  internalId?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  portMirrorUuid?: Maybe<Scalars['String']['output']>;
  srcEndPoint?: Maybe<Scalars['String']['output']>;
  srcVmNic?: Maybe<VmNic>;
  status?: Maybe<PortMirrorSessionStatus>;
  type?: Maybe<PortMirrorSessionType>;
  uuid: Scalars['String']['output'];
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

export interface PowerSupply {
  currentPower?: Maybe<Scalars['String']['output']>;
  hostUuid: Scalars['String']['output'];
  id?: Maybe<Scalars['String']['output']>;
  manufacturer?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  ratedPower?: Maybe<Scalars['String']['output']>;
  state?: Maybe<HardwareState>;
}

export interface PoweroffVmInstanceInput {
  action: ActionInput;
  payload: Array<PoweroffVmInstancePayload>;
}

export interface PoweroffVmInstancePayload {
  stopHA?: InputMaybe<Scalars['Boolean']['input']>;
  uuid: Scalars['String']['input'];
}

export interface PraimayStorageLabels {
  PrimaryStorageUuid: Scalars['String']['output'];
}

export interface PreconfigurationTemplate {
  content?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  customParams?: Maybe<Array<Scalars['String']['output']>>;
  description?: Maybe<Scalars['String']['output']>;
  distribution?: Maybe<Scalars['String']['output']>;
  isPredefined?: Maybe<Scalars['Boolean']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  md5sum?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<Owner>;
  state?: Maybe<PreconfigurationTemplateState>;
  type?: Maybe<PreconfigurationTemplateType>;
  uuid: Scalars['String']['output'];
}

export interface PreconfigurationTemplateQueryResp {
  error?: Maybe<ActionError>;
  list?: Maybe<Array<PreconfigurationTemplate>>;
  total?: Maybe<Scalars['Int']['output']>;
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

export interface PreviewResourceStruct {
  actions: Array<ActionsMap>;
  conditions: ConditionsMap;
}

export interface PreviewResult {
  preview?: Maybe<PreviewResourceStruct>;
}

export interface PrimaryStorage {
  /** 附加信息，比如：所有的存储池 */
  addonInfo?: Maybe<AddonInfo>;
  attachedClusterUuids?: Maybe<Array<Scalars['String']['output']>>;
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  availablePhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  baremetal2InstancesCount?: Maybe<Scalars['Int']['output']>;
  cbdMdsCount?: Maybe<Scalars['Int']['output']>;
  /** 配置项，比如：已添加的存储池 */
  config?: Maybe<ExternalPrimaryStoragePoolConfig>;
  createDate?: Maybe<Scalars['String']['output']>;
  defaultProtocol?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fsid?: Maybe<Scalars['String']['output']>;
  identity: Scalars['String']['output'];
  lastOpDate?: Maybe<Scalars['String']['output']>;
  mons: Array<CephPrimaryStorageMon>;
  mountPath?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  outputProtocols?: Maybe<Array<Scalars['String']['output']>>;
  pools?: Maybe<Array<CephPrimaryStoragePool>>;
  primaryStorageCapacity?: Maybe<PrimaryStorageCapacity>;
  /** 主存储保留容量。category=primaryStorage name=reservedCapacity。默认值是"1G" */
  reservedCapacity?: Maybe<Scalars['Float']['output']>;
  reservedPhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  resourceAttributeValues?: Maybe<Array<ResourceAttributeValue>>;
  sharedBlockGroupType?: Maybe<SharedBlockGroupType>;
  sharedBlocks?: Maybe<SharedBlocks>;
  state?: Maybe<PrimaryStorageState>;
  status?: Maybe<PrimaryStorageStatus>;
  storageCapacityForLocalStorage?: Maybe<LocalStorageHostCapacity>;
  systemUsedCapacity?: Maybe<Scalars['Float']['output']>;
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  totalPhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<PrimaryStorageType>;
  url?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vCenterUuid?: Maybe<Scalars['String']['output']>;
  vmInstanceCount?: Maybe<Scalars['Int']['output']>;
  volumeCount?: Maybe<Scalars['Int']['output']>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface PrimaryStorageCapacity {
  /** 总可用容量（虚拟） */
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  /** 总可用容量（物理） */
  availablePhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  /** 镜像缓存 */
  imageCacheSize?: Maybe<Scalars['Float']['output']>;
  /** 存储超分率，这里默认随机取一个PrimaryStorage的超分率！！！，name=overProvisioning.primaryStorage category=mevoco */
  overProvisioningPrimaryStorage?: Maybe<Scalars['Float']['output']>;
  /** 主存储UUID */
  primaryStorageUuids?: Maybe<Array<Scalars['String']['output']>>;
  /** 总保留容量，需要通过全局配置category=primaryStorage name=reservedCapacity来计算 */
  reservedCapacity?: Maybe<Scalars['Float']['output']>;
  /** 总保留容量（物理），需要通过全局配置name=threshold.primaryStorage.physicalCapacity category=mevoco来计算 */
  reservedPhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  /** 系统使用容量 */
  systemUsedCapacity?: Maybe<Scalars['Float']['output']>;
  /** 存储使用率阈值 */
  thresholdPrimaryStoragePhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  /** 更新时间 */
  timestamp?: Maybe<Scalars['Float']['output']>;
  /** 总容量（虚拟） */
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  /** 总容量（物理） */
  totalPhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  /** 模版缓存 */
  vmTemplateVolumeCacheSize?: Maybe<Scalars['Float']['output']>;
  /** 虚拟机硬盘真实容量 */
  volumeActualSize?: Maybe<Scalars['Float']['output']>;
  /** 虚拟机硬盘 */
  volumeSize?: Maybe<Scalars['Float']['output']>;
  /** 快照容量 */
  volumeSnapshotSize?: Maybe<Scalars['Float']['output']>;
}

export interface PrimaryStorageMetricData {
  label?: Maybe<Scalars['String']['output']>;
  labels: PraimayStorageLabels;
  metricName: Scalars['String']['output'];
  time: Scalars['Float']['output'];
  type: Scalars['String']['output'];
  value: Scalars['Float']['output'];
}

export interface PrimaryStorageMigrateVolumeInput {
  action: ActionInput;
  payload: Array<PrimaryStorageMigrateVolumePayload>;
}

export interface PrimaryStorageMigrateVolumePayload {
  backupTaskLongJobUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  dstPrimaryStorageUuid: Scalars['String']['input'];
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  volumeUuid: Scalars['String']['input'];
}

export interface PrimaryStoragePredictionCapacityData {
  currentDayPoint?: Maybe<PrimaryStoragePredictionCapacityItem>;
  physicalCapacitiesAlarmThresholdList: Array<PrimaryStoragePredictionCapacityItem>;
  predictAlarmPoint?: Maybe<PrimaryStoragePredictionCapacityItem>;
  totalPhysicalCapacitiesHistoryList: Array<PrimaryStoragePredictionCapacityItem>;
  usedPhysicalCapacitiesForecastList: Array<PrimaryStoragePredictionCapacityItem>;
  usedPhysicalCapacitiesHistoryList: Array<PrimaryStoragePredictionCapacityItem>;
}

export interface PrimaryStoragePredictionCapacityItem {
  time: Scalars['Float']['output'];
  type: Scalars['String']['output'];
  value: Scalars['Float']['output'];
}

export interface PrimaryStorageQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<PrimaryStorageVO>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
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

export interface PrimaryStorageRelatedBaremetal2ClusterSummary {
  baremetal2InstanceCount: Scalars['Int']['output'];
  volumeCount: Scalars['Int']['output'];
}

export interface PrimaryStorageRelatedClusterSummary {
  vmCount: Scalars['Int']['output'];
  vmOnNetworkCount: Scalars['Int']['output'];
  volumeCount: Scalars['Int']['output'];
  vpcVrouterCount: Scalars['Int']['output'];
}

export interface PrimaryStorageRelatedResourceCounts {
  cluster?: Maybe<Scalars['Int']['output']>;
  hardDisk?: Maybe<Scalars['Int']['output']>;
  host?: Maybe<Scalars['Int']['output']>;
  vm?: Maybe<Scalars['Int']['output']>;
}

export interface PrimaryStorageRelatedSummary {
  baremetal2Cluster: Scalars['Int']['output'];
  baremetal2Instance: Scalars['Int']['output'];
  blockVolume: Scalars['Int']['output'];
  cluster: Scalars['Int']['output'];
  host: Scalars['Int']['output'];
  sharedBlock: Scalars['Int']['output'];
  vmInstance: Scalars['Int']['output'];
  volume: Scalars['Int']['output'];
  vpcRouter: Scalars['Int']['output'];
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

export interface PrimaryStorageSummary {
  connected?: Maybe<Scalars['Int']['output']>;
  connecting?: Maybe<Scalars['Int']['output']>;
  disconnected?: Maybe<Scalars['Int']['output']>;
  other?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface PrimaryStorageSystemTag {
  /** ceph token */
  cephToken?: Maybe<Scalars['String']['output']>;
  cephVendor?: Maybe<Scalars['String']['output']>;
  coldMigrateNetwork?: Maybe<Scalars['String']['output']>;
  dataVolumePoolName?: Maybe<Scalars['String']['output']>;
  gatewayCidr?: Maybe<Scalars['String']['output']>;
  imageCachePoolName?: Maybe<Scalars['String']['output']>;
  /** NFS 挂载参数 */
  nfsMountOptions?: Maybe<Scalars['String']['output']>;
  nocephx?: Maybe<Scalars['Boolean']['output']>;
  rootVolumePoolName?: Maybe<Scalars['String']['output']>;
  thinProvision?: Maybe<Scalars['Boolean']['output']>;
  thinProvisionUuid?: Maybe<Scalars['String']['output']>;
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

export interface PrimaryStorageVO {
  /** 附加信息，比如：所有的存储池 */
  addonInfo?: Maybe<AddonInfo>;
  attachedClusterUuids?: Maybe<Array<Scalars['String']['output']>>;
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  availablePhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  baremetal2InstancesCount?: Maybe<Scalars['Int']['output']>;
  cbdMdsCount?: Maybe<Scalars['Int']['output']>;
  clusters?: Maybe<Array<ClusterUuidAndNameRef>>;
  /** 配置项，比如：已添加的存储池 */
  config?: Maybe<ExternalPrimaryStoragePoolConfig>;
  createDate?: Maybe<Scalars['String']['output']>;
  defaultProtocol?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  expired?: Maybe<Expired>;
  fsid?: Maybe<Scalars['String']['output']>;
  identity: Scalars['String']['output'];
  lastOpDate?: Maybe<Scalars['String']['output']>;
  mons: Array<CephPrimaryStorageMon>;
  mountPath?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  outputProtocols?: Maybe<Array<Scalars['String']['output']>>;
  pools?: Maybe<Array<CephPrimaryStoragePool>>;
  primaryStorageCapacity?: Maybe<PrimaryStorageCapacity>;
  /** 主存储保留容量。category=primaryStorage name=reservedCapacity。默认值是"1G" */
  reservedCapacity?: Maybe<Scalars['Float']['output']>;
  reservedPhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  resourceAttributeValues?: Maybe<Array<ResourceAttributeValue>>;
  sharedBlockGroupType?: Maybe<SharedBlockGroupType>;
  sharedBlocks?: Maybe<SharedBlocks>;
  state?: Maybe<PrimaryStorageState>;
  status?: Maybe<PrimaryStorageStatus>;
  storageCapacityForLocalStorage?: Maybe<LocalStorageHostCapacity>;
  systemTag?: Maybe<PrimaryStorageSystemTag>;
  systemUsedCapacity?: Maybe<Scalars['Float']['output']>;
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  totalPhysicalCapacity?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<PrimaryStorageType>;
  url?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vCenterUuid?: Maybe<Scalars['String']['output']>;
  vmInstanceCount?: Maybe<Scalars['Int']['output']>;
  volumeCount?: Maybe<Scalars['Int']['output']>;
  zone?: Maybe<Zone>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface Priority {
  priority?: InputMaybe<Scalars['Int']['input']>;
  rootVolumeUuid: Scalars['String']['input'];
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

export interface ProjectAttribute {
  name: Scalars['String']['output'];
  type: ProjectType;
  uuid: Scalars['String']['output'];
  value: Scalars['String']['output'];
}

export interface ProjectOwner {
  admin?: Maybe<Scalars['String']['output']>;
  attributes: Array<ProjectAttribute>;
  createDate: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate: Scalars['String']['output'];
  linkedAccountUuid: Scalars['String']['output'];
  name: Scalars['String']['output'];
  state: ProjectType;
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
  vmNum?: Maybe<Scalars['Int']['output']>;
  volumeNum?: Maybe<Scalars['Int']['output']>;
}

export interface ProjectOwnerQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<ProjectOwner>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
  type: OwnerQueryType;
}

export interface ProjectType {
  name: Scalars['String']['output'];
  ordinal: Scalars['Int']['output'];
}

export interface Query {
  CPUList: QueryCPUResp;
  UIEnv: UIEnvInfo;
  ZSVBackupStorageList: ZSVBackupStorageQueryResp;
  ZSVBackupStorageSystemTagsList: ZSVBackupStorageSystemTagsQueryResp;
  accessControlRule: AccessControlRule;
  accessControlRuleList: AccessControlRuleList;
  accessKeyList: QueryAccessKeyResp;
  accountList: AccountResp;
  accountNum: Scalars['Float']['output'];
  accountThirdPartyAuthList: AccountThirdPartyAuthResponse;
  affinityGroupList: AffinityGroupList;
  alarmData: Array<AlarmData>;
  aliyunSmsSNSTextTemplateList: QuerySNSTextTemplateResp;
  assignResourceAlarmData: AssignResourceAlarmData;
  asyncSecurityMachineCount: AsyncSecurityMachineTotal;
  availableKeyProviders: KmsProviderListResp;
  backupDataList: BackupDataResponse;
  backupDatabaseList: BackupDatabaseResponse;
  backupResourceDataList: BackupResourceDataResponse;
  backupStorage: BackupStorage;
  backupStorageList: BackupStorageList;
  backupStorageMetricDataList: Array<BackupStorageMetricData>;
  backupStoragePerformances: BackupStoragePerformanceQueryResp;
  backupStorageSummary: BackupStorageSummary;
  backupStorageTypes: Array<Scalars['String']['output']>;
  backupTaskStatus: BackupTaskStatus;
  bareMetalTreeList: SpecialTreeList;
  baremetalChassisDiskInfoList: BaremetalChassisDiskInfoQueryResp;
  baremetalChassisList: BaremetalChassisQueryResp;
  baremetalChassisNicInfoList: BaremetalChassisNicInfoQueryResp;
  baremetalDiskList: BaremetalDiskList;
  baremetalInstance: BaremetalInstance;
  baremetalInstanceList: BaremetalInstanceList;
  baremetalNicList: BaremetalNicList;
  baremetalPxeServerList: BaremetalPxeServerQueryResp;
  batchGetMetricDataList: Array<BatchZQLGetMetricDataListRes>;
  batchStorageMigrateVmInstancedepends: Array<BatchStorageMigrateVmInstancedepends>;
  blockSnapshotList: BlockSnapshotList;
  blockVolume?: Maybe<BlockVolume>;
  blockVolumeList: BlockVolumeQueryResp;
  bondList: BondResp;
  bondReleatedResource: BondReleatedResource;
  bondResouceCount: BondResouceCountResp;
  bootstrapEnv: EnvInfo;
  bootstrapInfo: BootstrapInfo;
  bootstrapServiceActive: Scalars['Boolean']['output'];
  canScanDatabaseBackup: Scalars['Boolean']['output'];
  candidateSharedBlockList: CandidateSharedBlockResponse;
  /** 获取CBD存储池列表 */
  cbdPrimaryStoragePoolList: CBDPrimaryStoragePoolList;
  ccsCertificate: CCSCertificate;
  cdrom?: Maybe<CdRom>;
  cdromList: CdRomsQueryResp;
  cephPrimaryStoragePoolList: CephPrimaryStoragePoolList;
  checkMemorySnapshotGroupConflict: CheckMemorySnapshotGroupConflictResult;
  checkSync: Array<SecurityMachine>;
  checkTemplateParameters: CheckTemplateResp;
  /** 检查虚拟机 UUID 是否已存在 */
  checkVmInstanceExists: Scalars['Boolean']['output'];
  cluster: Cluster;
  clusterAndHostsTreeListForTemplateConvertToVM: SpecialTreeList;
  clusterHostTreeList: SpecialTreeList;
  clusterList: QueryClusterResp;
  clusterSummary: ClusterSummaryQueryResp;
  /** 扫描主存储上的配置文件列表 */
  configFileList: ConfigFileList;
  consoleProxyAgentList: ConsoleProxyAgentQueryResp;
  countEncryptedResourceKeyRef: Scalars['Int']['output'];
  countHostList: HostQueryResp;
  countKmsProviders: Scalars['Int']['output'];
  countbondList: BondResp;
  crontabInspection: CrontabInspection;
  dataStorageTreeList: SpecialTreeList;
  directoryTreeList: SpecialTreeList;
  disasterRecoveryService: DisasterRecoveryServiceState;
  diskList: QueryDiskResp;
  dnsList: DnsListResp;
  eipList: EipListResp;
  emailServerSetting?: Maybe<EmailServerSetting>;
  emailServerSettingList: EmailServerSettingQueryResp;
  eventRuleTemplateList: QueryEventRuleTemplateResp;
  exportDatabaseBackupFromBackupStorage: Scalars['String']['output'];
  /** 获取外部存储池列表 */
  externalPrimaryStoragePoolList: ExternalPrimaryStoragePoolList;
  fanList: QueryFanResp;
  fiberChannelLunList: FiberChannelLunList;
  fiberChannelStorageList: FiberChannelStorageList;
  fuzzyQuery: FuzzyQueryResponse;
  gatewayVmInstanceList: QueryGatewayVmInstanceResp;
  getAboutLicenseExtensionInfo: LicenseInfoExtensionResp;
  getAboutLicenseInfo: LicenseInfoResp;
  getAccessPath?: Maybe<AccessPathQueryResp>;
  getAccountQuotaUsage: GetAccountQuotaUsageResp;
  getActiveAlarm: OneClickAlarmResp;
  getAlarmHistogram: QueryAlertHistogramResp;
  getAlarmHistories: AlarmHistories;
  getAlarmHistoriesList: QueryAlarmHistoriesResp;
  getAlarmSummary: AlarmSummary;
  getBaremetal2ClusterRelatedSummary: Baremetal2ClusterRelatedSummary;
  getBaremetalInstanceConfigSummary: BaremetalInstanceConfigSummary;
  getBlockDeviceInfo: BlockDetailInfoResp;
  getBlockMetadata: BlockMetadataResp;
  getCandidateClusterForVmSelectList: QueryClusterResp;
  getCdromConfigForVmCreate: CdromConfigForVmCreate;
  getClusterAttachablePrimaryStorageTypes: ClusterAttachablePrimaryStorageTypes;
  getClusterRelatedSummary: ClusterRelatedSummary;
  getConsoleLog: Scalars['String']['output'];
  getCountByNamespace: GetCountByNamespaceResp;
  getCpuMemoryCapacity: GetCpuMemoryCapacity;
  getCurrentTime: GetCurrentTime;
  getCustomCpuMode: CpuModelList;
  getCustomizedLicenseNameInfo: Scalars['String']['output'];
  getDataProtectionRelatedSummary: DataProtectionRelatedSummary;
  getDatabaseBackupFromImageStore: BackupDataFormImageStorageResp;
  getDefaultCertContent: Scalars['String']['output'];
  getDoubleManagementNodeInfo: DoubleManagementNodeInfo;
  getFlattenVmInstanceOccupyCapacity: QueryFlattenVmInstanceOccupyCapacityResp;
  getFlattenVolumeOccupyCapacity: QueryFlattenVolumeOccupyCapacityResp;
  getFreeHardDiskInfoList: FreeHardDiskInfoList;
  getFreeIp: GetFreeIpOfL3NetworkResult;
  getFreeIpOfIpRange: GetFreeIpOfL3NetworkResult;
  getFreeIpOfL3Network: GetFreeIpOfL3NetworkResult;
  getGlobalConfig?: Maybe<GlobalConfig>;
  getGlobalConfigAndRcPool: GlobalConfigAndRcPool;
  getGroupDirTreeByUuid: VMGroupDirectoryList;
  getHostIommu: HostIommu;
  getHostNUMANode: HostNUMANode;
  getHostPowerControlRelatedSummary: HostPowerControlRelatedSummary;
  getHostRelatedSummary: HostRelatedSummary;
  getHostResourceAllocation: HostResourceAllocation;
  getHostWebTerminalUrl: HostWebTerminal;
  getImageSummary: ImageSummary;
  getInterfaceServiceList: InterfaceServiceList;
  getIscsiServerSummary: IscsiServerRelateSummary;
  getKmsServerCertFromKms: GetKmsServerCertFromKmsResult;
  getL3NetworkCount: L3NetworkCountResp;
  getLicenseAddOns: Array<LicenseAddOn>;
  getLicenseInfo: LicenseInfo;
  getLocalBackupStorageOfBackupJobSummary: LocalBackupStorageOfBackupJobSummary;
  getManagementNodeArch: ManagementNodeArch;
  getManagementNodeIp: ManagementNodeIp;
  getManagementNodesStatus: ManagementNodesStatus;
  getMaxPCpuNum: Scalars['Int']['output'];
  getMemorySnapshotByResource: MemorySnapshotQueryResponse;
  getMemorySnapshotByVm: MemorySnapshotByVm;
  getMetricDataList: Array<MetricData>;
  getMigrationServicePackage?: Maybe<MigrationServicePackage>;
  getNUMATopology: NUMATopology;
  getNicMetricData: GetNicMetricDataResp;
  getOAuthClientSecret: OAuthClientSecretResult;
  getOneClickAlarmResourceCount: OneClickAlarmResourceCountResp;
  getPrimaryStorageRelatedBaremetal2ClusterSummary: PrimaryStorageRelatedBaremetal2ClusterSummary;
  getPrimaryStorageRelatedClusterSummary: PrimaryStorageRelatedClusterSummary;
  getPrimaryStorageRelatedResourceCounts: PrimaryStorageRelatedResourceCounts;
  getPrimaryStorageRelatedSummary: PrimaryStorageRelatedSummary;
  getRequestConsoleAccess: RequestConsoleAccess;
  getResourceCpuMode: ResourceCpuMode;
  getResourceFromResourceStackList: GetResourceFromResourceStackResp;
  /** 按集群发现未纳管的共享块 VG */
  getSharedBlockGroupLuns: SharedBlockGroupLunsResponse;
  getSnapshotDeleteNeedSize: SnapshotDeleteNeedSize;
  getSnmpAgentConfig: SnmpAgentActionResp;
  getTagRelatedSummary: TagRelatedSummary;
  getTelemetryConsent: TelemetryConsentInventory;
  getTelemetrySettings: TelemetrySettingInventory;
  checkTelemetryUpdate: TelemetryUpdateInventory;
  getThirdPartyAlarmSummary: ThirdPartyAlarmSummary;
  getTrashOnPrimaryStorage: TrashOnPrimaryStorageResp;
  getTwoFactorAuthenticationState: GetTwoFactorAuthenticationStateResp;
  getUSBKeyStatus: Array<LicenseUSBKeyStatus>;
  getUsageStatisticsData: MetriDataList;
  getUserBySessionId?: Maybe<LoginResp>;
  getVersion: VersionType;
  getVirtualizationZoneRelatedSummary: VirtualizationZoneRelatedSummary;
  getVmAndBareMetal2InstanceSummary: VmAndBareMetal2InstanceSummary;
  getVmAttachableL3Network: Array<L3Network>;
  getVmByL3NetworkUuid: QueryNetworkTopologyResp;
  getVmInstanceSummary: VmInstanceSummary;
  getVmNicAttachedNetworkService: VmNicAttachedNetworkServices;
  getVmNicCount: VmNicListResp;
  getVolumeBackupDataSize: VolumeBackupDataSummary;
  getVolumeSummary: VolumeSummary;
  getZMigrateInfos?: Maybe<MigrationServiceInfo>;
  getZMigrateRuntimeConfig?: Maybe<ZMigrateRuntimeConfig>;
  getZMigrateVddkUploaded: Scalars['Boolean']['output'];
  getZSVBackupStorageOfBackupJobSummary: ZSVBackupStorageOfBackupJobSummary;
  getZSVUsageStatisticsData: MetriDataList;
  getbackupDataRecoverLocalHostUuid?: Maybe<Scalars['String']['output']>;
  globalConfig?: Maybe<GlobalConfig>;
  globalConfigAndSecretResourcePoolList: GlobalConfigAndSecretResourcePoolList;
  globalConfigList: GlobalConfigList;
  guestNameList: Array<OsChildren>;
  guestOsCpuMemHotAddInfoList: GuestOsCpuMemHotAddInfoList;
  guestOsType: Array<OsChildren>;
  guestOsTypeList: GuestOsTypeList;
  guestToolInfo: GuestToolInfo;
  guestToolStatus: GuestTool;
  haStrategic: HAStrategic;
  handleTagList: TagQueryResp;
  haveRemoteBackupStorage: Scalars['Boolean']['output'];
  host: HostVO;
  hostBlockDevicesList: QueryHostBlockDevicesResp;
  hostCpuMemoryCapacity: HostCpuMemoryCapacity;
  hostGroupList: HostGroupList;
  hostHardwareInfo: HostHardwareInfo;
  hostHardwareStatusSummary: HardWareSummary;
  hostKernelInterface: HostKernelInterface;
  hostKernelInterfaceList: HostKernelInterfaceList;
  hostList: HostQueryResp;
  hostMetricData: Array<Array<HostMetricData>>;
  hostPerformances: HostPerformanceQueryResp;
  hostPhysicalCpuList: QueryHostPhysicalCpuResp;
  hostSlotInfo: HostSlotInfo;
  hostSummary: HostSummary;
  hostUsage: HostUsage;
  image: Image;
  imageList: ImageList;
  imageSupportBootModeForBareMetal2Instance?: Maybe<Array<ImageBootMode>>;
  inspectionItemTree: Array<InspectionItemTree>;
  inspectionResource: InspectionResource;
  inspectionTask: InspectionTask;
  inspectionTaskList: Array<InspectionTask>;
  inspectionTaskOutput: InspectionTaskOutputResp;
  installPathRecycleList: InstallPathRecycleResp;
  instanceOffering?: Maybe<InstanceOffering>;
  instanceOfferingList: InstanceOfferingQueryResp;
  internalTimeServerCandidates: InternalTimeServerCandidateResult;
  ipRangeCount: IpRangeCountResp;
  ipRangeList: IpRangeListResp;
  ipStatistics: GetL3NetworkIpStatisticResult;
  ipblackwhiteList: IpBlackWhiteListQueryResp;
  isBootstrap: BootstrapDeployedInfo;
  isDoubleManagementNode: Scalars['Boolean']['output'];
  isLicenseTypeEqualToCluster: Scalars['Boolean']['output'];
  iscsiLunList: IscsiLunList;
  iscsiServerList: IscsiServerList;
  iscsiTargetList: IscsiTargetListResponse;
  kmsIdentityList: KmsIdentityListResp;
  kmsProviderList: KmsProviderListResp;
  l2NetworkList: L2NetworkQueryResp;
  l2NetworkTreeList: SpecialTreeList;
  l3Network: L3Network;
  l3NetworkList: L3NetworkListResp;
  l3NetworkPerformances: L3NetworkPerformanceQueryResp;
  latestInspectionTask?: Maybe<InspectionTask>;
  licenseRecordsList: LicenseRecordsQueryResp;
  localBackupStorageList: LocalBackupStorageQueryResp;
  localBackupStorageSystemTagsList: LocalBackupStorageSystemTagsQueryResp;
  localStorageHostCapacity: LocalStorageHostCapacity;
  logCollectList: QueryLogCollectResp;
  logServerList: LogServerQueryResp;
  lunDeviceMultiPathList: LunDeviceMultiPathList;
  managementNodeList: ManagementNodeQueryResp;
  maxAmount: MaxAmount;
  mdevDeviceSpecList: MdevDeviceSpecQueryResp;
  mdsList: MdsQueryResp;
  memoryList: QueryMemoryResp;
  metricData: Array<MetricData>;
  metricDataList: Array<Array<MetricData>>;
  metricLabelList: MetricLabelResp;
  metricLabelValueList: Array<MetricLabelValue>;
  metricRuleTemplateList: QueryMetricRuleTemplateResp;
  moduleAuthorizationDetailsList: ModuleAuthorizationDetailsQueryResp;
  monitorGroupInstanceList: MonitorGroupInstanceList;
  monitorGroupList: MonitorGroupList;
  monitorTemplateList: QueryMonitorTemplateResp;
  monsList: MonsQueryResp;
  networkTopologyList: QueryNetworkTopologyResp;
  networkTopologyRelation: QueryNetworkTopologyRelationResp;
  networkTopologyVRouterRelation: QueryNetworkTopologyRelationResp;
  networkTreeList: SpecialTreeList;
  noTagResource: NoTagResourceResp;
  nvmeLunList: NVMeLunList;
  nvmeServerList: NvmeServerList;
  nvmeTargetList: NvmeTargetList;
  operationLogList: QueryOperationLogResp;
  operationLongjobList: QueryOperationLongjobResp;
  ovfExportList: OvfExportEntityList;
  ovfFile: OvfFile;
  ownerList: OwnerQueryResp;
  ownerSummary: OwnerSummaryQueryResp;
  parseNkpRestore: ParseNkpRestoreResult;
  pciDevice: Array<PciDevice>;
  pciDeviceList: PciDeviceList;
  pciDeviceSpec: PciDeviceSpec;
  pciDeviceSpecList: PciDeviceSpecList;
  physicalInterfaceList: PhysicalInterfaceQueryResp;
  physicalInterfaceListByClusterList: Array<Scalars['String']['output']>;
  physicalNetworkBondList: PhysicalNetworkBondList;
  physicalNetworkInterfaceList: PhysicalNetworkInterfaceList;
  physicalNicCount: PhysicalNicCountResp;
  physicalNicLLDPDevice?: Maybe<PhysicalNicLLDPDevice>;
  physicalNicList: PhysicalNicList;
  pointsDetailsList: PointsDetailsQueryResp;
  portMirrorList: PortMirrorList;
  powerSupplyList: QueryPowerSupplyResp;
  preconfigurationTemplateList: PreconfigurationTemplateQueryResp;
  previewResourceStack: PreviewResult;
  primaryStorageCapacity: PrimaryStorageCapacity;
  primaryStorageList: PrimaryStorageQueryResp;
  primaryStorageMetricDataList: Array<PrimaryStorageMetricData>;
  primaryStoragePredictionCapacity: PrimaryStoragePredictionCapacityData;
  primaryStorageSummary: PrimaryStorageSummary;
  queryAuditList: AuditResp;
  queryCapacityManagementCard: CapacityManagementCard;
  queryCapacityManagementDisconnectedResourceCount: CapacityManagementDisconnectedResourceCount;
  queryCapacityManagementListVMDiskInfo: CapacityManagementListVMDiskInfoList;
  queryCapacityManagementPrimaryStorageCard: CapacityManagementCardPrimaryStorage;
  queryCapacityManagementTopListBackupStorage: Array<CapacityManagementTopListBackupStorage>;
  queryCapacityManagementTopListHost: Array<CapacityManagementTopListHost>;
  queryCapacityManagementTopListHostDiskInfo: Array<CapacityManagementTopListHostDiskInfo>;
  queryCapacityManagementTopListImage: Array<CapacityManagementTopListImage>;
  queryCapacityManagementTopListPrimaryStorage: Array<CapacityManagementTopListPrimaryStorage>;
  queryCapacityManagementTopListSnapshot: Array<CapacityManagementTopListSnapshot>;
  queryCapacityManagementTopListVmInstance: Array<CapacityManagementTopListVmInstance>;
  queryCapacityManagementTopListVolume: Array<CapacityManagementTopListVolume>;
  queryCertInfo: CertInfo;
  queryClusterDRS: QueryClusterDRSResp;
  queryClusterDRSList: QueryClusterDRSResp;
  queryCurrentCertPathConfigure: CurrentConfigure;
  queryCustomColumnConfig: CustomColumnsConfig;
  queryDRSAdviceList: QueryDRSAdviceResp;
  queryDRSVmMigrationActivityList: QueryVmMigrationActivityResp;
  queryEnableCryptoComplianceProgress: EnableCryptoComplianceProgress;
  queryEndpointEmailAddressList: QueryEndPointEmailAddressResp;
  queryEndpointSmsAddressList: QueryEndPointSmsAddressList;
  queryEventFromResourceStackList: QueryEventFromResourceStackResp;
  queryGlobalConfigCpuMode: GlobalConfigCpuMode;
  queryGuestToolsState: GuestToolsStateInfo;
  queryHostSystemInfo: HostSystemInfo;
  queryPersonalizationConfig: PersonalizationConfig;
  queryResourceAttributeConstraintList: ResourceAttributeConstraintResponse;
  queryResourceAttributeKeyList: ResourceAttributeKeyResponse;
  queryResourceAttributeValueList: ResourceAttributeValueResponse;
  queryResourceInstance: MonitorGroupAddResourceList;
  queryResourceUpgradeConfig: ResourceUpgradeConfig;
  querySNSApplicationEndpointList: QueryEndPointResp;
  querySNSDingTalkAtPersonList: QuerySNSDingTalkAtPersonListResp;
  querySNSFeiShuAtPersonList: QuerySNSFeiShuAtPersonListResp;
  querySNSWeComAtPersonList: QuerySNSWeComAtPersonListResp;
  querySecretResourcePoolList: SecretResourcePoolList;
  querySecurityMachineList: SecurityMachineList;
  querySummaryUserInfo: SummaryUserInfo;
  queryThirdpartyList: QueryHybridKeySecretResult;
  queryVNicIpAvailability: CheckVNicAvailabilityResult;
  queryVmDns: VmDnsQueryResp;
  queryWidgetAlarmInfo: WidgetAlarmInfo;
  queryWidgetMonitorL3NetworkTop: WidgetMonitorL3NetworkTop;
  queryWidgetMonitorTop: WidgetMonitorTop;
  queryWidgetMonitorTrend: WidgetMonitorTrend;
  queryWidgetQuotaUsage: WidgetQuotaUsage;
  queryWidgetResourceStateCount: WidgetResourceStateCount;
  queryWidgetUserInfo: WidgetUserInfo;
  remoteBackupStorageList: RemoteBackupStorageQueryResp;
  remoteBackupStorageSystemTagsList: RemoteBackupStorageSystemTagsQueryResp;
  resourceAndRelationByType: QueryResourceAndRelationResp;
  resourceConfigList: ResourceConfigList;
  resourceCount: ResourceList;
  resourceList: ResourceList;
  resourceRelations: ResourceRelationsResp;
  resourceShareList: Array<ResourceShare>;
  resourceStackList: QueryResourceStackResp;
  scanZSVBackupStorage: ScanZSVBackupStorage;
  scanlocalBackupStorage: ScanLocalBackupStorage;
  schedHistoryLogList: SchedHistoryLogList;
  schedulerAvaliableTriggerList: SchedulerTriggerList;
  schedulerDoneTriggerList: SchedulerTriggerList;
  schedulerJobGroupList: SchedulerJobGroupList;
  schedulerJobHistoryGroupByFireInstanceIdList: SchedulerJobHistoryGroupByFireInstanceIdList;
  schedulerJobHistoryList: SchedulerJobHistoryList;
  schedulerJobList: SchedulerJobList;
  schedulerTriggerList: SchedulerTriggerList;
  screenshot: Screenshot;
  scriptExecuteRecordDetailList: ScriptExecuteRecordDetailList;
  scriptExecuteRecordList: ScriptExecuteRecordList;
  scriptList: ScriptList;
  scsiLunList: ScsiLunList;
  sdnControllerList: SdnControllerList;
  sdsInfo: SdsInfo;
  seDeviceList: SeDeviceQueryResp;
  searchResource: SearchResourceResp;
  secretResourcePool: SecretResourcePool;
  secretResourcePoolList: SecretResourcePoolList;
  secretServer: SecretServer;
  secretServerCount: Scalars['Float']['output'];
  secretServerList: SecretServerList;
  securityGroup: SecurityGroup;
  securityGroupList: SecurityGroupList;
  securityGroupRuleList: SecurityGroupRuleList;
  securityMachine: SecurityMachine;
  securityMachineList: SecurityMachineList;
  sensorList: QuerySensorResp;
  shareTypeList: Array<ShareType>;
  sharedBlockList: SharedBlockResponse;
  sharedResourceList: Array<QuerySharedResourceResult>;
  snapshotStrategyList: SnapshotStrategyList;
  snmpTrapList: SnmpTrapReceiverList;
  snsApplicationEndpoint: EndPoint;
  snsTextTemplateList: QuerySNSTextTemplateResp;
  sshKeyPair?: Maybe<SshKeyPair>;
  sshKeyPairList: SshKeyPairList;
  stackTemplateList: QueryStackTemplateResp;
  storageAdapterCount: StorageAdapterCountResponse;
  storageAdapterList: StorageAdapterResponse;
  storageMigrateVmInstancedepends: StorageMigrateVmInstancedepends;
  systemSchedulingTaskList: SystemSchedulingTaskResp;
  tagList: TagQueryResp;
  tagListByResource: TagQueryResp;
  taskProgress: TaskProgressList;
  templateConfigList: TemplateConfigList;
  templateVMTreeList: SpecialTreeList;
  templatedVmInstance?: Maybe<VmInstance>;
  test: LogServerQueryResp;
  thinProvisionByPrimaryStorage: Scalars['Boolean']['output'];
  thirdPartyAlert: ThirdPartyAlerts;
  thirdPartyAlertsList: QueryThirdPartyAlertsResp;
  thirdPartyAuthList: ThirdPartyAuthResp;
  thirdpartyPlatformList: ThirdpartyPlatformQueryResp;
  timeServerReachable: TimeServerReachableResult;
  timeServers: TimeServerResult;
  tpmList: Array<TpmInventory>;
  trashList: TrashResp;
  uiPrivilege: UIPrivilegeResult;
  uplinkGroupList: UplinkGroupList;
  usbsDeviceList: UsbDeviceQueryResp;
  userGroupList: UserGroupList;
  vRouterRouteEntryList: VRouterRouteEntryListResp;
  vRouterRouteTableList: VRouterRouteTableListResp;
  validatInstanceOfferingUserConfig: ValidatInstanceOfferingUserConfigResp;
  validatePassword: ValidatePassword;
  validateVlanIdUsed: ValidateVlanIdResp;
  vgpuDeviceList: VGpuDeviceList;
  vgpuDeviceSpec: VGpuDeviceSpec;
  vgpuDeviceSpecList: VGpuDeviceSpecList;
  virtualRouterOfferingList: VirtualRouterOfferingQueryResp;
  vmCdRoms: CdRomsQueryResp;
  vmCdRomsConfig: VMCdRomConfig;
  vmDirectoryClusterList: VMClusterDirectoryList;
  vmDirectoryGroupByUuid: VMGroupDirectoryList;
  vmDirectoryGroupList: VMGroupDirectoryList;
  vmExternalDevice: VmExternalDevice;
  vmGroupCount: VMGroupDirectoryList;
  vmGroupList: VmGroupList;
  vmHostname: Hostname;
  vmInstance?: Maybe<VmInstance>;
  vmInstanceList: VmInstanceList;
  vmInstancePerformances: VmInstancePerformanceQueryResp;
  vmMetricDataList: Array<Array<VmInstanceMetricData>>;
  vmNic: Array<VmNic>;
  vmNicIpList: VmNicIpListResp;
  vmNicList: VmNicListResp;
  vmRelatedResource: VmRelatedResource;
  vmSchedulingRuleList: VmSchedulingRuleList;
  vmSchedulingRuleTreeList: SpecialTreeList;
  vmSpecList: VmCustomSpecificationResp;
  vmSubDirGroupList: VMGroupDirectoryList;
  vmTemplate?: Maybe<VmTemplate>;
  vmTemplateByUuid: VmTemplate;
  vmTemplateList: VmTemplateQueryResp;
  vmTemplateTreeList: SpecialTreeList;
  vmUsage: VmUsage;
  vniRangeList: VniRangeResp;
  volume?: Maybe<Volume>;
  volumeList: VolumeList;
  volumeSnapshot: VolumeSnapshot;
  volumeSnapshotGroup: VolumeSnapshotGroup;
  volumeSnapshotGroupList: VolumeSnapshotGroupListResp;
  volumeSnapshotList: VolumeSnapshotListResp;
  vxlanPoolAttachedVtep: VxlanPoolQueryVtepResp;
  vxlanPoolList: VxlanPoolQueryResp;
  vxlanPoolRelatedResource: VxlanPoolRelatedResource;
  webSSHUrl: WebSSH;
  wizardInfo: WizardInfo;
  xmlHookList: XMLHookList;
  zcexPlatformList: ThirdpartyPlatformQueryResp;
  zone?: Maybe<Zone>;
  zoneList: ZoneResponse;
  zoneRelatedSummary: ZoneRelatedSummary;
  zopsSupportable: Scalars['Boolean']['output'];
  zsKv?: Maybe<ZsKvResult>;
  zsvRoleList: ZsvRoleList;
  zsvSharedResourceList: Array<QuerySharedResourceResult>;
  zsvSnapshotGroupList: SnapshotGroupByVolumeList;
  zsvSnapshotList: VolumeSnapshotListResp;
  zsvUiPrivileges: ZsvRoleUIPrivilege;
  zsvVolumeSnapshotTree: VolumeSnapshotTreeListResp;
  zwatchAlarmDetail: ZWatchAlarmVO;
  zwatchAlarmList: ZWatchAlarmVoResp;
}


export interface QueryCPUListArgs {
  hostUuid: Scalars['String']['input'];
}


export interface QueryZSVBackupStorageListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ZSVBackupStorageQueryType>;
}


export interface QueryZSVBackupStorageSystemTagsListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ZSVBackupStorageQueryType>;
}


export interface QueryaccessControlRuleArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryaccessControlRuleListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<AccessControlRuleQueryType>;
}


export interface QueryaccessKeyListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryaccountListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<AccountQueryType>;
}


export interface QueryaccountNumArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<AccountQueryType>;
}


export interface QueryaccountThirdPartyAuthListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryaffinityGroupListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<AffinityGroupQueryType>;
}


export interface QueryalarmDataArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryaliyunSmsSNSTextTemplateListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryassignResourceAlarmDataArgs {
  conditions: Array<Condition>;
  endTime: Scalars['Float']['input'];
  startTime: Scalars['Float']['input'];
}


export interface QuerybackupDataListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<BackupResourceType>;
}


export interface QuerybackupDatabaseListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerybackupResourceDataListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: Scalars['String']['input'];
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<BackupResourceType>;
}


export interface QuerybackupStorageArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerybackupStorageListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<BackupStorageQueryType>;
}


export interface QuerybackupStorageMetricDataListArgs {
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  metricName: Scalars['String']['input'];
  namespace: Scalars['String']['input'];
  offsetAheadOfCurrentTime: Scalars['Float']['input'];
  period: Scalars['Float']['input'];
  uuid: Scalars['String']['input'];
}


export interface QuerybackupStoragePerformancesArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  exportMetrics?: InputMaybe<Array<PerformanceExportMetric>>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  metrics: Array<BackupStoragePerformanceMetricType>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  thresholdMetric?: InputMaybe<BackupStoragePerformanceMetricType>;
  thresholdNum?: InputMaybe<Scalars['String']['input']>;
  thresholdSymbol?: InputMaybe<PerformanceThresholdSymbolType>;
  type?: InputMaybe<PerformanceType>;
}


export interface QuerybackupStorageSummaryArgs {
  conditions?: InputMaybe<Array<Condition>>;
}


export interface QuerybackupTaskStatusArgs {
  dataVolumeUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  isVm?: InputMaybe<Scalars['Boolean']['input']>;
  rootVolumeUuids?: InputMaybe<Array<Scalars['String']['input']>>;
}


export interface QuerybareMetalTreeListArgs {
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerybaremetalChassisDiskInfoListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerybaremetalChassisListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerybaremetalChassisNicInfoListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerybaremetalDiskListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerybaremetalInstanceArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerybaremetalInstanceListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerybaremetalNicListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerybaremetalPxeServerListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<BaremetalPxeServerQueryType>;
}


export interface QuerybatchGetMetricDataListArgs {
  argsList: Array<BatchZQLGetMetricDataListArgs>;
}


export interface QuerybatchStorageMigrateVmInstancedependsArgs {
  uuids: Array<Scalars['String']['input']>;
}


export interface QueryblockSnapshotListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryblockVolumeArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryblockVolumeListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<BlockVolumeQueryType>;
}


export interface QuerybondListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerybondReleatedResourceArgs {
  bondingName: Scalars['String']['input'];
}


export interface QuerybondResouceCountArgs {
  hostUuid: Scalars['String']['input'];
}


export interface QuerycandidateSharedBlockListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerycbdPrimaryStoragePoolListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<CBDPrimaryStoragePoolQueryType>;
}


export interface QueryccsCertificateArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerycdromArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerycdromListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerycephPrimaryStoragePoolListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerycheckMemorySnapshotGroupConflictArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerycheckSyncArgs {
  input: CheckSyncInput;
}


export interface QuerycheckTemplateParametersArgs {
  templateContent?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerycheckVmInstanceExistsArgs {
  vmInstanceUuid: Scalars['String']['input'];
}


export interface QueryclusterArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryclusterAndHostsTreeListForTemplateConvertToVMArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryclusterHostTreeListArgs {
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryclusterListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ClusterQueryType>;
}


export interface QueryclusterSummaryArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ClusterQueryType>;
}


export interface QueryconfigFileListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  primaryStorageUuid?: InputMaybe<Scalars['String']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryconsoleProxyAgentListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerycountEncryptedResourceKeyRefArgs {
  uuids: Array<Scalars['String']['input']>;
}


export interface QuerycountHostListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  primaryStorageUuid?: InputMaybe<Scalars['String']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  topNumber?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<HostQueryType>;
}


export interface QuerycountbondListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerydataStorageTreeListArgs {
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerydirectoryTreeListArgs {
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerydiskListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerydnsListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<L3NetworkQueryType>;
}


export interface QueryeipListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<EipQueryType>;
}


export interface QueryemailServerSettingArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryemailServerSettingListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryeventRuleTemplateListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryexportDatabaseBackupFromBackupStorageArgs {
  backupStorageUuid?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}


export interface QueryexternalPrimaryStoragePoolListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryfanListArgs {
  hostUuid: Scalars['String']['input'];
}


export interface QueryfiberChannelLunListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryfiberChannelStorageListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryfuzzyQueryArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  resourceConditions: Array<Condition>;
  resourceType: Scalars['String']['input'];
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerygatewayVmInstanceListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerygetAccessPathArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetAccountQuotaUsageArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetActiveAlarmArgs {
  accountUuid: Scalars['String']['input'];
}


export interface QuerygetAlarmHistogramArgs {
  endTime: Scalars['Float']['input'];
  groupColumns?: InputMaybe<Array<Scalars['String']['input']>>;
  intervalHours: Scalars['Int']['input'];
  startTime: Scalars['Float']['input'];
  tableName?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerygetAlarmHistoriesArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetAlarmHistoriesListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  endTime?: InputMaybe<Scalars['Float']['input']>;
  endpointUuid?: InputMaybe<Scalars['String']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  startTime?: InputMaybe<Scalars['Float']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerygetBaremetal2ClusterRelatedSummaryArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetBaremetalInstanceConfigSummaryArgs {
  chassisUuid: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}


export interface QuerygetBlockDeviceInfoArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetBlockMetadataArgs {
  metadata: Scalars['String']['input'];
  vendorName: Scalars['String']['input'];
}


export interface QuerygetCandidateClusterForVmSelectListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ClusterQueryType>;
}


export interface QuerygetClusterAttachablePrimaryStorageTypesArgs {
  clusterUuid: Scalars['String']['input'];
}


export interface QuerygetClusterRelatedSummaryArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetConsoleLogArgs {
  first: Scalars['Boolean']['input'];
}


export interface QuerygetCountByNamespaceArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerygetCpuMemoryCapacityArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetDataProtectionRelatedSummaryArgs {
  input: GetDataProtectionRelatedSummaryInput;
}


export interface QuerygetDatabaseBackupFromImageStoreArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerygetFlattenVmInstanceOccupyCapacityArgs {
  input: GetFlattenVmInstanceOccupyCapacityInput;
}


export interface QuerygetFlattenVolumeOccupyCapacityArgs {
  input: GetFlattenVolumeOccupyCapacityInput;
}


export interface QuerygetFreeHardDiskInfoListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerygetFreeIpArgs {
  input: GetFreeIpInput;
}


export interface QuerygetFreeIpOfIpRangeArgs {
  ipRangeUuid: Scalars['String']['input'];
  ipVersion?: InputMaybe<Scalars['Int']['input']>;
}


export interface QuerygetFreeIpOfL3NetworkArgs {
  ipVersion?: InputMaybe<Scalars['Int']['input']>;
  l3NetworkUuid: Scalars['String']['input'];
}


export interface QuerygetGlobalConfigArgs {
  category: Scalars['String']['input'];
  name: Scalars['String']['input'];
}


export interface QuerygetGlobalConfigAndRcPoolArgs {
  input: GlobalConfigAndRcPoolInput;
}


export interface QuerygetGroupDirTreeByUuidArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<DirectoryQueryType>;
}


export interface QuerygetHostIommuArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetHostNUMANodeArgs {
  endTime: Scalars['String']['input'];
  isAverage?: InputMaybe<Scalars['Boolean']['input']>;
  startTime: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
  uuidType?: Scalars['String']['input'];
  withCPUUsedUtilization?: InputMaybe<Scalars['Boolean']['input']>;
}


export interface QuerygetHostPowerControlRelatedSummaryArgs {
  uuids: Array<Scalars['String']['input']>;
}


export interface QuerygetHostRelatedSummaryArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetHostResourceAllocationArgs {
  scene?: Scalars['String']['input'];
  strategy?: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
  uuidType?: Scalars['String']['input'];
  vcpu: Scalars['Int']['input'];
}


export interface QuerygetHostWebTerminalUrlArgs {
  https: Scalars['Boolean']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}


export interface QuerygetImageSummaryArgs {
  conditions: Array<Condition>;
}


export interface QuerygetInterfaceServiceListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<InterfaceServiceQueryType>;
}


export interface QuerygetIscsiServerSummaryArgs {
  clusterUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids: Array<Scalars['String']['input']>;
  wwids?: InputMaybe<Array<Scalars['String']['input']>>;
}


export interface QuerygetKmsServerCertFromKmsArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetL3NetworkCountArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<L3NetworkQueryType>;
}


export interface QuerygetLocalBackupStorageOfBackupJobSummaryArgs {
  backupStorageUuids: Array<Scalars['String']['input']>;
}


export interface QuerygetMaxPCpuNumArgs {
  type: GetMaxPCpuNumForVmCreateType;
  uuidList: Array<Scalars['String']['input']>;
}


export interface QuerygetMemorySnapshotByResourceArgs {
  type: WithMemoryByResourceType;
  uuids: Array<Scalars['String']['input']>;
}


export interface QuerygetMemorySnapshotByVmArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetMetricDataListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  metricParams: Array<MetricParam>;
  type: GetMetricDataQueryType;
}


export interface QuerygetNUMATopologyArgs {
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  sortByVmNode?: InputMaybe<Scalars['Boolean']['input']>;
  vmUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerygetNicMetricDataArgs {
  metricParam: MetricParam;
}


export interface QuerygetOAuthClientSecretArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetOneClickAlarmResourceCountArgs {
  zoneUuid: Scalars['String']['input'];
}


export interface QuerygetPrimaryStorageRelatedBaremetal2ClusterSummaryArgs {
  clusterUuids: Array<Scalars['String']['input']>;
  primaryStorageUuids: Array<Scalars['String']['input']>;
}


export interface QuerygetPrimaryStorageRelatedClusterSummaryArgs {
  clusterUuids: Array<Scalars['String']['input']>;
  primaryStorageUuids: Array<Scalars['String']['input']>;
}


export interface QuerygetPrimaryStorageRelatedResourceCountsArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetPrimaryStorageRelatedSummaryArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetRequestConsoleAccessArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetResourceCpuModeArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetResourceFromResourceStackListArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetSharedBlockGroupLunsArgs {
  clusterUuid: Scalars['String']['input'];
}


export interface QuerygetSnapshotDeleteNeedSizeArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  snapShotUuid?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  volumeUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerygetTagRelatedSummaryArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetThirdPartyAlarmSummaryArgs {
  zceXUuid: Scalars['String']['input'];
}


export interface QuerygetTrashOnPrimaryStorageArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetUsageStatisticsDataArgs {
  accountUuid?: InputMaybe<Scalars['String']['input']>;
  currentIdentity?: InputMaybe<Scalars['String']['input']>;
  hypervisorType?: InputMaybe<Scalars['String']['input']>;
  metricName?: InputMaybe<Scalars['String']['input']>;
  monitorItem?: InputMaybe<Scalars['String']['input']>;
  resourceKey?: InputMaybe<Scalars['String']['input']>;
  tableName: Scalars['String']['input'];
  uuid?: InputMaybe<Scalars['String']['input']>;
  zoneKey?: InputMaybe<Scalars['String']['input']>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerygetUserBySessionIdArgs {
  sessionId: Scalars['String']['input'];
}


export interface QuerygetVirtualizationZoneRelatedSummaryArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetVmAndBareMetal2InstanceSummaryArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerygetVmAttachableL3NetworkArgs {
  vmInstanceUuid: Scalars['String']['input'];
}


export interface QuerygetVmByL3NetworkUuidArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerygetVmInstanceSummaryArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerygetVmNicAttachedNetworkServiceArgs {
  vmNicUuid: Scalars['String']['input'];
}


export interface QuerygetVmNicCountArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<VmNicQueryType>;
}


export interface QuerygetVolumeBackupDataSizeArgs {
  conditions?: InputMaybe<Array<Condition>>;
  resourceUuid: Scalars['String']['input'];
  type: VolumeBackupDataSummaryQueryType;
}


export interface QuerygetVolumeSummaryArgs {
  conditions: Array<Condition>;
}


export interface QuerygetZSVBackupStorageOfBackupJobSummaryArgs {
  backupStorageUuids: Array<Scalars['String']['input']>;
}


export interface QuerygetZSVUsageStatisticsDataArgs {
  accountUuid?: InputMaybe<Scalars['String']['input']>;
  currentIdentity?: InputMaybe<Scalars['String']['input']>;
  hypervisorType?: InputMaybe<Scalars['String']['input']>;
  metricName?: InputMaybe<Scalars['String']['input']>;
  monitorItem?: InputMaybe<Scalars['String']['input']>;
  resourceKey?: InputMaybe<Scalars['String']['input']>;
  tableName: Scalars['String']['input'];
  uuid?: InputMaybe<Scalars['String']['input']>;
  zoneKey?: InputMaybe<Scalars['String']['input']>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerygetbackupDataRecoverLocalHostUuidArgs {
  clusterUuid: Scalars['String']['input'];
  vmInstanceUuid: Scalars['String']['input'];
}


export interface QueryglobalConfigArgs {
  category: Scalars['String']['input'];
  name: Scalars['String']['input'];
}


export interface QueryglobalConfigAndSecretResourcePoolListArgs {
  globalConfigs: Array<GlobalConfigInput>;
}


export interface QueryglobalConfigListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  includeUiConfig?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: GlobalConfigQueryType;
}


export interface QueryguestOsCpuMemHotAddInfoListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryguestOsTypeArgs {
  guestOs: Scalars['String']['input'];
}


export interface QueryguestToolInfoArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryguestToolStatusArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryhaStrategicArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryhandleTagListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryhostArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryhostBlockDevicesListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryhostCpuMemoryCapacityArgs {
  clusterUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  hostUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  zoneUuids?: InputMaybe<Array<Scalars['String']['input']>>;
}


export interface QueryhostGroupListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<HostGroupQueryType>;
}


export interface QueryhostHardwareInfoArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryhostHardwareStatusSummaryArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryhostKernelInterfaceArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryhostKernelInterfaceListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<HostKernelInterfaceQueryType>;
}


export interface QueryhostListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  primaryStorageUuid?: InputMaybe<Scalars['String']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  topNumber?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<HostQueryType>;
}


export interface QueryhostMetricDataArgs {
  endTime: Scalars['Float']['input'];
  metricNames: Array<Scalars['String']['input']>;
  period: Scalars['Float']['input'];
  startTime: Scalars['Float']['input'];
  uuid: Scalars['String']['input'];
}


export interface QueryhostPerformancesArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  exportMetrics?: InputMaybe<Array<PerformanceExportMetric>>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  metrics: Array<HostPerformanceMetricType>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  thresholdMetric?: InputMaybe<HostPerformanceMetricType>;
  thresholdNum?: InputMaybe<Scalars['String']['input']>;
  thresholdSymbol?: InputMaybe<PerformanceThresholdSymbolType>;
  type?: InputMaybe<PerformanceType>;
}


export interface QueryhostPhysicalCpuListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryhostSlotInfoArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryhostSummaryArgs {
  conditions?: InputMaybe<Array<Condition>>;
}


export interface QueryhostUsageArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryimageArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryimageListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ImageQueryType>;
}


export interface QueryinspectionTaskArgs {
  taskUuid: Scalars['String']['input'];
}


export interface QueryinspectionTaskListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryinspectionTaskOutputArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryinstallPathRecycleListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryinstanceOfferingArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryinstanceOfferingListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryipRangeCountArgs {
  l3NetworkUuid: Scalars['String']['input'];
}


export interface QueryipRangeListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryipStatisticsArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryipblackwhiteListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryiscsiLunListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryiscsiServerListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<IscsiServerQueryType>;
}


export interface QueryiscsiTargetListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerykmsIdentityListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerykmsProviderListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface Queryl2NetworkListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  isCount?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<L2NetworkQueryType>;
}


export interface Queryl2NetworkTreeListArgs {
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
}


export interface Queryl3NetworkArgs {
  uuid: Scalars['String']['input'];
}


export interface Queryl3NetworkListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<L3NetworkQueryType>;
}


export interface Queryl3NetworkPerformancesArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  exportMetrics?: InputMaybe<Array<PerformanceExportMetric>>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  metrics: Array<L3NetworkPerformanceMetricType>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  thresholdMetric?: InputMaybe<L3NetworkPerformanceMetricType>;
  thresholdNum?: InputMaybe<Scalars['String']['input']>;
  thresholdSymbol?: InputMaybe<PerformanceThresholdSymbolType>;
  type?: InputMaybe<PerformanceType>;
}


export interface QuerylicenseRecordsListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerylocalBackupStorageListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<LocalBackupStorageQueryType>;
}


export interface QuerylocalBackupStorageSystemTagsListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerylocalStorageHostCapacityArgs {
  hostUuid: Scalars['String']['input'];
  primaryStorageUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerylogCollectListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerylogServerListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerylunDeviceMultiPathListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerymaxAmountArgs {
  vmInstanceUuid: Scalars['String']['input'];
}


export interface QuerymdevDeviceSpecListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<MdevDeviceSpecQueryType>;
}


export interface QuerymdsListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerymemoryListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerymetricDataArgs {
  conditions?: InputMaybe<Array<Condition>>;
  endTime: Scalars['Float']['input'];
  metricName: Scalars['String']['input'];
  namespace: Scalars['String']['input'];
  period: Scalars['Float']['input'];
  startTime: Scalars['Float']['input'];
}


export interface QuerymetricDataListArgs {
  endTime: Scalars['Float']['input'];
  metricList: Array<MetricItemInput>;
  namespace: Scalars['String']['input'];
  period: Scalars['Float']['input'];
  startTime: Scalars['Float']['input'];
}


export interface QuerymetricLabelListArgs {
  filterLabels?: InputMaybe<Scalars['String']['input']>;
  labelNames: Array<Scalars['String']['input']>;
  metricName: Scalars['String']['input'];
  namespace: Scalars['String']['input'];
}


export interface QuerymetricLabelValueListArgs {
  endTime?: InputMaybe<Scalars['Float']['input']>;
  filterLabels?: InputMaybe<Scalars['String']['input']>;
  labelName: Scalars['String']['input'];
  metricName: Scalars['String']['input'];
  namespace: Scalars['String']['input'];
  startTime?: InputMaybe<Scalars['Float']['input']>;
}


export interface QuerymetricRuleTemplateListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerymoduleAuthorizationDetailsListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerymonitorGroupInstanceListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerymonitorGroupListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerymonitorTemplateListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerymonsListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<CephMonType>;
}


export interface QuerynetworkTopologyListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerynetworkTopologyRelationArgs {
  l3NetworkUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  vmUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerynetworkTopologyVRouterRelationArgs {
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerynetworkTreeListArgs {
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerynoTagResourceArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  resourceConditions?: InputMaybe<Array<Condition>>;
  resourceType?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<TagQueryType>;
}


export interface QuerynvmeLunListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<NVMeLunType>;
}


export interface QuerynvmeServerListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<NvmeServerQueryType>;
}


export interface QuerynvmeTargetListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryoperationLogListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryoperationLongjobListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryovfExportListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
}


export interface QueryovfFileArgs {
  ovf: Scalars['String']['input'];
}


export interface QueryownerListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type: OwnerQueryType;
}


export interface QueryownerSummaryArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type: OwnerSummaryType;
}


export interface QueryparseNkpRestoreArgs {
  contentBase64: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerypciDeviceArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerypciDeviceListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerypciDeviceSpecArgs {
  type: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}


export interface QuerypciDeviceSpecListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryphysicalInterfaceListArgs {
  clusterUuid: Scalars['String']['input'];
  networkAccelerationMode: Scalars['String']['input'];
}


export interface QueryphysicalInterfaceListByClusterListArgs {
  clusterUuids: Array<Scalars['String']['input']>;
}


export interface QueryphysicalNetworkBondListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<PhysicalNetworkBondQueryType>;
}


export interface QueryphysicalNetworkInterfaceListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<PhysicalNetworkInterfaceQueryType>;
}


export interface QueryphysicalNicCountArgs {
  hostUuid: Scalars['String']['input'];
}


export interface QueryphysicalNicLLDPDeviceArgs {
  hostId: Scalars['String']['input'];
  interfaceUuid: Scalars['String']['input'];
  lldpUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryphysicalNicListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<PhysicalNicQueryType>;
}


export interface QuerypointsDetailsListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  licenseKey?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryportMirrorListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerypowerSupplyListArgs {
  hostUuid: Scalars['String']['input'];
}


export interface QuerypreconfigurationTemplateListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerypreviewResourceStackArgs {
  parameters?: InputMaybe<Scalars['String']['input']>;
  templateContent?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryprimaryStorageCapacityArgs {
  primaryStorageUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  zoneUuids?: InputMaybe<Array<Scalars['String']['input']>>;
}


export interface QueryprimaryStorageListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<PrimaryStorageQueryType>;
}


export interface QueryprimaryStorageMetricDataListArgs {
  accessKeyId?: InputMaybe<Scalars['String']['input']>;
  accessKeySecret?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['Float']['input']>;
  functions?: InputMaybe<Array<Scalars['String']['input']>>;
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  metricName: Scalars['String']['input'];
  namespace: Scalars['String']['input'];
  offsetAheadOfCurrentTime?: InputMaybe<Scalars['Int']['input']>;
  period?: InputMaybe<Scalars['Int']['input']>;
  requestIp?: InputMaybe<Scalars['String']['input']>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['Float']['input']>;
  systemTags?: InputMaybe<Scalars['String']['input']>;
  userTags?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}


export interface QueryprimaryStoragePredictionCapacityArgs {
  currentTime: Scalars['Float']['input'];
  endTime: Scalars['Float']['input'];
  poolUuid?: InputMaybe<Scalars['String']['input']>;
  primaryStorageUuid: Scalars['String']['input'];
  startTime: Scalars['Float']['input'];
}


export interface QueryprimaryStorageSummaryArgs {
  conditions?: InputMaybe<Array<Condition>>;
}


export interface QueryqueryAuditListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  endTime?: InputMaybe<Scalars['Float']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  startTime?: InputMaybe<Scalars['Float']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryCapacityManagementCardArgs {
  zoneUuid: Scalars['String']['input'];
}


export interface QueryqueryCapacityManagementDisconnectedResourceCountArgs {
  zoneUuid: Scalars['String']['input'];
}


export interface QueryqueryCapacityManagementListVMDiskInfoArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryCapacityManagementPrimaryStorageCardArgs {
  type: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}


export interface QueryqueryCapacityManagementTopListBackupStorageArgs {
  sortBy: Scalars['String']['input'];
  sortDirection: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}


export interface QueryqueryCapacityManagementTopListHostArgs {
  sortBy: Scalars['String']['input'];
  sortDirection: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}


export interface QueryqueryCapacityManagementTopListHostDiskInfoArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryqueryCapacityManagementTopListImageArgs {
  sortBy: Scalars['String']['input'];
  sortDirection: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}


export interface QueryqueryCapacityManagementTopListPrimaryStorageArgs {
  sortBy: Scalars['String']['input'];
  sortDirection: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}


export interface QueryqueryCapacityManagementTopListSnapshotArgs {
  sortBy: Scalars['String']['input'];
  sortDirection: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}


export interface QueryqueryCapacityManagementTopListVmInstanceArgs {
  sortBy: Scalars['String']['input'];
  sortDirection: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}


export interface QueryqueryCapacityManagementTopListVolumeArgs {
  sortBy: Scalars['String']['input'];
  sortDirection: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}


export interface QueryqueryClusterDRSArgs {
  clusterUuid: Scalars['String']['input'];
}


export interface QueryqueryClusterDRSListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ClusterQueryType>;
}


export interface QueryqueryDRSAdviceListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ClusterQueryType>;
}


export interface QueryqueryDRSVmMigrationActivityListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ClusterQueryType>;
}


export interface QueryqueryEnableCryptoComplianceProgressArgs {
  input: QueryEnableCryptoComplianceProgressInput;
}


export interface QueryqueryEndpointEmailAddressListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryEndpointSmsAddressListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryEventFromResourceStackListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryGuestToolsStateArgs {
  vmInstanceUuid: Scalars['String']['input'];
}


export interface QueryqueryHostSystemInfoArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryqueryPersonalizationConfigArgs {
  profileType: ProfileType;
  resourceType: Scalars['String']['input'];
}


export interface QueryqueryResourceAttributeConstraintListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryResourceAttributeKeyListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryResourceAttributeValueListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryResourceInstanceArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryquerySNSApplicationEndpointListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryquerySNSDingTalkAtPersonListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryquerySNSFeiShuAtPersonListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryquerySNSWeComAtPersonListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryquerySecretResourcePoolListArgs {
  zoneUuid: Scalars['String']['input'];
}


export interface QueryquerySecurityMachineListArgs {
  zoneUuid: Scalars['String']['input'];
}


export interface QueryquerySummaryUserInfoArgs {
  type?: InputMaybe<QuerySummaryUserInfoType>;
}


export interface QueryqueryThirdpartyListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryVNicIpAvailabilityArgs {
  input: CheckVNicIpAvailabilityParam;
}


export interface QueryqueryVmDnsArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryWidgetAlarmInfoArgs {
  conditions?: InputMaybe<Array<Condition>>;
}


export interface QueryqueryWidgetMonitorL3NetworkTopArgs {
  hypervisorType?: InputMaybe<Scalars['String']['input']>;
  limit: Scalars['Int']['input'];
  metricName: Scalars['String']['input'];
  namespace: Scalars['String']['input'];
  offsetAheadOfCurrentTime?: InputMaybe<Scalars['Int']['input']>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryWidgetMonitorTopArgs {
  hypervisorType?: InputMaybe<Scalars['String']['input']>;
  limit: Scalars['Int']['input'];
  metricName: Scalars['String']['input'];
  namespace: Scalars['String']['input'];
  offsetAheadOfCurrentTime?: InputMaybe<Scalars['Int']['input']>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryWidgetMonitorTrendArgs {
  calculateType: Scalars['String']['input'];
  hypervisorType?: InputMaybe<Scalars['String']['input']>;
  metricConditions?: InputMaybe<Array<Condition>>;
  metricNameList: Array<Scalars['String']['input']>;
  namespace: Scalars['String']['input'];
  offset: Scalars['Int']['input'];
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryWidgetQuotaUsageArgs {
  uuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryWidgetResourceStateCountArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  hypervisorType?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryqueryWidgetUserInfoArgs {
  accountUuid?: InputMaybe<Scalars['String']['input']>;
  projectUuid?: InputMaybe<Scalars['String']['input']>;
  queryType?: InputMaybe<QueryWidgetUserInfoType>;
  virtualID?: InputMaybe<Scalars['String']['input']>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryremoteBackupStorageListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryremoteBackupStorageSystemTagsListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryresourceAndRelationByTypeArgs {
  needInfo?: InputMaybe<Scalars['Boolean']['input']>;
  type: Scalars['String']['input'];
  uuids: Array<Scalars['String']['input']>;
}


export interface QueryresourceConfigListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryresourceCountArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type: ResourceQueryType;
}


export interface QueryresourceListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type: ResourceQueryType;
}


export interface QueryresourceRelationsArgs {
  l2NetworkUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryresourceShareListArgs {
  uuids: Array<Scalars['String']['input']>;
}


export interface QueryresourceStackListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryscanZSVBackupStorageArgs {
  backupStorageUuid: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}


export interface QueryscanlocalBackupStorageArgs {
  backupStorageUuid: Scalars['String']['input'];
  zoneUuid: Scalars['String']['input'];
}


export interface QueryschedHistoryLogListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryschedulerAvaliableTriggerListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryschedulerDoneTriggerListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryschedulerJobGroupListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<SchedulerJobGroupQueryType>;
}


export interface QueryschedulerJobHistoryGroupByFireInstanceIdListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<SchedulerJobHistoryGroupByFireInstanceIdQueryType>;
}


export interface QueryschedulerJobHistoryListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<SchedulerJobHistoryQueryType>;
}


export interface QueryschedulerJobListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<SchedulerJobQueryType>;
}


export interface QueryschedulerTriggerListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryscreenshotArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryscriptExecuteRecordDetailListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<GuestVmScriptExecutedRecordDetailQueryType>;
}


export interface QueryscriptExecuteRecordListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<GuestVmScriptExecutedRecordQueryType>;
}


export interface QueryscriptListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<GuestVmScriptQueryType>;
}


export interface QueryscsiLunListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ScsiLunQueryType>;
}


export interface QuerysdnControllerListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerysdsInfoArgs {
  monitorNodeIp: Scalars['String']['input'];
}


export interface QueryseDeviceListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerysearchResourceArgs {
  keyword?: InputMaybe<Scalars['String']['input']>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerysecretResourcePoolArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerysecretResourcePoolListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<SecretResourcePoolQueryType>;
}


export interface QuerysecretServerArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerysecretServerListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<SecretServerQueryType>;
}


export interface QuerysecurityGroupArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerysecurityGroupListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<SecurityGroupQueryType>;
}


export interface QuerysecurityGroupRuleListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerysecurityMachineArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerysecurityMachineListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<SecurityMachineQueryType>;
}


export interface QuerysensorListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryshareTypeListArgs {
  uuids: Array<Scalars['String']['input']>;
}


export interface QuerysharedBlockListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerysharedResourceListArgs {
  input: QuerySharedResourceInput;
}


export interface QuerysnapshotStrategyListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerysnmpTrapListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<SnmpTrapReceiverQueryType>;
}


export interface QuerysnsApplicationEndpointArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerysnsTextTemplateListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerysshKeyPairArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerysshKeyPairListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<SshKeyPairQueryType>;
}


export interface QuerystackTemplateListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<StackTemplateQueryType>;
}


export interface QuerystorageAdapterCountArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerystorageAdapterListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerystorageMigrateVmInstancedependsArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerysystemSchedulingTaskListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerytagListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  resourceConditions?: InputMaybe<Array<Condition>>;
  resourceType?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<TagQueryType>;
}


export interface QuerytagListByResourceArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  resourceConditions?: InputMaybe<Array<Condition>>;
  resourceType?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<TagQueryType>;
}


export interface QuerytaskProgressArgs {
  all?: InputMaybe<Scalars['Boolean']['input']>;
  apiId: Scalars['String']['input'];
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<TaskProgressQueryType>;
  userTags?: InputMaybe<Array<Scalars['String']['input']>>;
}


export interface QuerytemplateConfigListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerytemplateVMTreeListArgs {
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerytemplatedVmInstanceArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerythinProvisionByPrimaryStorageArgs {
  primaryStorageUuid: Scalars['String']['input'];
}


export interface QuerythirdPartyAlertArgs {
  uuid: Scalars['String']['input'];
}


export interface QuerythirdPartyAlertsListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ThirdPartyAlertsQueryType>;
}


export interface QuerythirdPartyAuthListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerythirdpartyPlatformListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerytimeServerReachableArgs {
  external: Array<Scalars['String']['input']>;
  internal?: InputMaybe<Array<Scalars['String']['input']>>;
}


export interface QuerytpmListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  vmInstanceUuid?: InputMaybe<Scalars['String']['input']>;
}


export interface QuerytrashListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<TrashQueryType>;
}


export interface QueryuplinkGroupListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<UplinkGroupQueryType>;
}


export interface QueryusbsDeviceListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<UsbDeviceQueryType>;
}


export interface QueryuserGroupListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<UserGroupQueryType>;
}


export interface QueryvRouterRouteEntryListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryvRouterRouteTableListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryvalidatInstanceOfferingUserConfigArgs {
  config: Scalars['String']['input'];
}


export interface QueryvalidatePasswordArgs {
  loginName: Scalars['String']['input'];
  loginType: Scalars['String']['input'];
  password: Scalars['String']['input'];
}


export interface QueryvalidateVlanIdUsedArgs {
  vSwitchUuid: Scalars['String']['input'];
  vlanId: Scalars['String']['input'];
}


export interface QueryvgpuDeviceListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryvgpuDeviceSpecArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryvgpuDeviceSpecListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryvirtualRouterOfferingListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryvmCdRomsArgs {
  vmInstanceUuid: Scalars['String']['input'];
}


export interface QueryvmDirectoryClusterListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<DirectoryQueryType>;
}


export interface QueryvmDirectoryGroupByUuidArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<DirectoryQueryType>;
}


export interface QueryvmDirectoryGroupListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<DirectoryQueryType>;
}


export interface QueryvmExternalDeviceArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryvmGroupCountArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<DirectoryQueryType>;
}


export interface QueryvmGroupListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<VmGroupQueryType>;
}


export interface QueryvmHostnameArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryvmInstanceArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryvmInstanceListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<VmQueryType>;
}


export interface QueryvmInstancePerformancesArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  exportMetrics?: InputMaybe<Array<VmInstanceExportMetric>>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  metrics: Array<VmInstancePerformanceMetricType>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  thresholdMetric?: InputMaybe<VmInstancePerformanceMetricType>;
  thresholdNum?: InputMaybe<Scalars['String']['input']>;
  thresholdSymbol?: InputMaybe<PerformanceThresholdSymbolType>;
  type?: InputMaybe<PerformanceType>;
}


export interface QueryvmMetricDataListArgs {
  endTime: Scalars['Float']['input'];
  metricNames: Array<Scalars['String']['input']>;
  namespace?: InputMaybe<Scalars['String']['input']>;
  period: Scalars['Float']['input'];
  startTime: Scalars['Float']['input'];
  uuid: Scalars['String']['input'];
}


export interface QueryvmNicArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryvmNicIpListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryvmNicListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<VmNicQueryType>;
}


export interface QueryvmRelatedResourceArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryvmSchedulingRuleListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<VmSchedulingRuleQueryType>;
}


export interface QueryvmSchedulingRuleTreeListArgs {
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryvmSpecListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryvmSubDirGroupListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<DirectoryQueryType>;
}


export interface QueryvmTemplateArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryvmTemplateByUuidArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryvmTemplateListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<VmTemplateQueryType>;
}


export interface QueryvmTemplateTreeListArgs {
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryvmUsageArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryvniRangeListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryvolumeArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryvolumeListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<VolumeQueryType>;
}


export interface QueryvolumeSnapshotArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryvolumeSnapshotGroupArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryvolumeSnapshotGroupListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryvolumeSnapshotListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryvxlanPoolAttachedVtepArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryvxlanPoolListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryvxlanPoolRelatedResourceArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryxmlHookListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryzcexPlatformListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryzoneArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryzoneListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryzoneRelatedSummaryArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryzsKvArgs {
  key: Scalars['String']['input'];
}


export interface QueryzsvRoleListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ZsvRoleQueryType>;
}


export interface QueryzsvSharedResourceListArgs {
  input: QuerySharedResourceInput;
}


export interface QueryzsvSnapshotGroupListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<SnapshotQueryType>;
}


export interface QueryzsvSnapshotListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryzsvVolumeSnapshotTreeArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryzwatchAlarmDetailArgs {
  uuid: Scalars['String']['input'];
}


export interface QueryzwatchAlarmListArgs {
  conditions?: InputMaybe<Array<Condition>>;
  count?: InputMaybe<Scalars['Boolean']['input']>;
  extraConditions?: InputMaybe<Array<Condition>>;
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  replyWithCount?: InputMaybe<Scalars['Boolean']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirectionValidValues>;
  start?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ZWatchAlarmQueryType>;
}

export interface QueryAccessKeyResp {
  list?: Maybe<Array<AccessKey>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface QueryAlarmHistoriesResp {
  /** 查询结果列表 */
  list?: Maybe<Array<AlarmHistories>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
  unreadCount?: Maybe<Scalars['Int']['output']>;
}

export interface QueryAlertHistogramResp {
  list?: Maybe<Array<AlertHistogram>>;
}

export interface QueryCPUResp {
  /** 查询结果列表 */
  list?: Maybe<Array<CPU>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryClusterDRSResp {
  /** 查询结果列表 */
  list?: Maybe<Array<DRS>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryClusterResp {
  /** 查询结果列表 */
  list?: Maybe<Array<Cluster>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryDRSAdviceResp {
  /** 查询结果列表 */
  list?: Maybe<Array<DRSAdvice>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryDiskResp {
  /** 查询结果列表 */
  list?: Maybe<Array<Disk>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryEnableCryptoComplianceProgressInput {
  actionId: Scalars['String']['input'];
  apiId: Scalars['String']['input'];
}

export interface QueryEndPointEmailAddressResp {
  list?: Maybe<Array<EndPointEmailAddress>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface QueryEndPointResp {
  list?: Maybe<Array<EndPoint>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface QueryEndPointSmsAddressList {
  list?: Maybe<Array<EndPointSmsAddress>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface QueryEventFromResourceStackResp {
  /** 查询结果列表 */
  list?: Maybe<Array<EventFromResourceStack>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryEventRuleTemplateResp {
  /** 查询结果列表 */
  list?: Maybe<Array<EventRuleTemplate>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryFanResp {
  /** 查询结果列表 */
  list?: Maybe<Array<Fan>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryFlattenVmInstanceOccupyCapacityResp {
  error?: Maybe<Scalars['String']['output']>;
  list: Array<VmOccupyCapacity>;
  success: Scalars['Boolean']['output'];
}

export interface QueryFlattenVolumeOccupyCapacityResp {
  error?: Maybe<Scalars['String']['output']>;
  list: Array<VolumeOccupyCapacity>;
  success: Scalars['Boolean']['output'];
}

export interface QueryGatewayVmInstanceResp {
  /** 查询结果列表 */
  list?: Maybe<Array<GatewayVmInstance>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryHostBlockDevicesResp {
  /** 查询结果列表 */
  list?: Maybe<Array<HostBlockDevices>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryHostPhysicalCpuResp {
  /** 查询结果列表 */
  list?: Maybe<Array<HostPhysicalCpu>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryHybridKeySecretResult {
  list?: Maybe<Array<HybridAccountInventory>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface QueryLogCollectResp {
  /** 查询结果列表 */
  list?: Maybe<Array<LogCollect>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryMemoryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<Memory>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryMetricRuleTemplateResp {
  /** 查询结果列表 */
  list?: Maybe<Array<MetricRuleTemplate>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryMonitorTemplateResp {
  /** 查询结果列表 */
  list?: Maybe<Array<MonitorTemplate>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryNetworkTopologyRelationResp {
  list: Array<NetworkTopologyRelation>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface QueryNetworkTopologyResp {
  list: Array<NetworkTopology>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface QueryOperationLogResp {
  /** 查询结果列表 */
  list?: Maybe<Array<OperationLog>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryOperationLongjobResp {
  /** 查询结果列表 */
  list?: Maybe<Array<OperationLongjob>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryPowerSupplyResp {
  /** 查询结果列表 */
  list?: Maybe<Array<PowerSupply>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QueryResourceAndRelationResp {
  relationList: Array<NetworkTopologyRelation>;
  resourceList: Array<NetworkTopology>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface QueryResourceStackResp {
  /** 查询结果列表 */
  list?: Maybe<Array<ResourceStack>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QuerySNSDingTalkAtPersonListResp {
  /** 查询结果列表 */
  list?: Maybe<Array<SNSDingTalkAtPerson>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QuerySNSFeiShuAtPersonListResp {
  /** 查询结果列表 */
  list?: Maybe<Array<SNSFeiShuAtPerson>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QuerySNSTextTemplateResp {
  /** 查询结果列表 */
  list?: Maybe<Array<SNSTextTemplate>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QuerySNSWeComAtPersonListResp {
  /** 查询结果列表 */
  list?: Maybe<Array<SNSWeComAtPerson>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QuerySensorResp {
  /** 查询结果列表 */
  list?: Maybe<Array<Sensor>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface QuerySharedResourceInput {
  accountUuid?: InputMaybe<Scalars['String']['input']>;
  groupUuid?: InputMaybe<Scalars['String']['input']>;
  resourceTypeList: Array<Scalars['String']['input']>;
  sharedType?: InputMaybe<Scalars['String']['input']>;
}

export interface QuerySharedResourceResult {
  type: Scalars['String']['output'];
  value: Scalars['Float']['output'];
}

export interface QueryStackTemplateResp {
  /** 查询结果列表 */
  list?: Maybe<Array<StackTemplate>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum QuerySummaryUserInfoType {
  IAM1 = 'IAM1',
  IAM2 = 'IAM2'
}

export interface QueryThirdPartyAlertsResp {
  /** 查询结果列表 */
  list?: Maybe<Array<ThirdPartyAlerts>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
  unreadCount?: Maybe<Scalars['Int']['output']>;
}

export interface QueryVmMigrationActivityResp {
  /** 查询结果列表 */
  list?: Maybe<Array<VmMigrationActivity>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum QueryWidgetUserInfoType {
  Account = 'Account',
  Admin = 'Admin',
  OrganizationOperator = 'OrganizationOperator',
  Project = 'Project'
}

export interface QxlMemory {
  ram?: Maybe<Scalars['Int']['output']>;
  vgamem?: Maybe<Scalars['Int']['output']>;
  vram?: Maybe<Scalars['Int']['output']>;
}

export interface Raid {
  model?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  raidLevel?: Maybe<Array<Scalars['String']['output']>>;
  raidLevelState?: Maybe<Array<RaidLevelState>>;
  relatedDisk?: Maybe<Array<Array<Scalars['String']['output']>>>;
  uuid: Scalars['String']['output'];
}

export enum RaidLevelState {
  Abnormal = 'Abnormal',
  Degraged = 'Degraged',
  Normal = 'Normal',
  Rebuild = 'Rebuild',
  Unknown = 'Unknown'
}

export interface ReCreateLogCollectInput {
  action: ActionInput;
  payload: ReCreateLogCollectPayload;
}

export interface ReCreateLogCollectPayload {
  uuid: Scalars['String']['input'];
}

export enum ReadyState {
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  LostConnect = 'LostConnect',
  Rebuilding = 'Rebuilding'
}

export interface RebootBaremetalInstanceInput {
  action: ActionInput;
  payload: Array<RebootBaremetalInstancePayload>;
}

export interface RebootBaremetalInstancePayload {
  pxeBoot: Scalars['Boolean']['input'];
  uuid: Scalars['String']['input'];
}

export interface RebootVmInstanceInput {
  action: ActionInput;
  payload: Array<RebootVmInstancePayload>;
}

export interface RebootVmInstancePayload {
  backupTaskLongJobUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  cancelBackupTask?: InputMaybe<Scalars['Boolean']['input']>;
  uuid: Scalars['String']['input'];
}

export interface Receiver {
  createDate: Scalars['String']['output'];
  endpointUuid: Scalars['String']['output'];
  lastOpDate: Scalars['String']['output'];
  phoneNumber: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface ReclaimSpaceFromImageStoreInput {
  action: ActionInput;
  payload: Array<ReclaimSpaceFromImageStorePayload>;
}

export interface ReclaimSpaceFromImageStorePayload {
  uuid: Scalars['String']['input'];
}

export interface ReclaimSpaceFromZSVBackupStorageInput {
  action: ActionInput;
  payload: Array<ReclaimSpaceFromZSVBackupStoragePayload>;
}

export interface ReclaimSpaceFromZSVBackupStoragePayload {
  uuid: Scalars['String']['input'];
}

export interface ReconnectBackupStorageInput {
  action: ActionInput;
  payload: Array<ReconnectBackupStoragePayload>;
}

export interface ReconnectBackupStoragePayload {
  uuid: Scalars['String']['input'];
}

export interface ReconnectBaremetalPxeServerInput {
  action: ActionInput;
  payload: Array<ReconnectBaremetalPxeServerPayload>;
}

export interface ReconnectBaremetalPxeServerPayload {
  /** 这里传入的实际上是clusterUuid */
  uuid: Scalars['String']['input'];
}

export interface ReconnectConsoleProxyInput {
  action: ActionInput;
  payload: ReconnectConsoleProxyPayload;
}

export interface ReconnectConsoleProxyPayload {
  agentUuids?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface ReconnectHostInput {
  action: ActionInput;
  payload: Array<ReconnectHostPayload>;
}

export interface ReconnectHostPayload {
  uuid: Scalars['String']['input'];
}

export interface ReconnectPrimaryStorageInput {
  action: ActionInput;
  payload: Array<ReconnectPrimaryStoragePayload>;
}

export interface ReconnectPrimaryStoragePayload {
  uuid: Scalars['String']['input'];
}

export interface ReconnectZSVBackupStorageInput {
  action: ActionInput;
  payload: Array<ReconnectZSVBackupStoragePayload>;
}

export interface ReconnectZSVBackupStoragePayload {
  uuid: Scalars['String']['input'];
}

export interface RecoverBaremetalInstanceInput {
  action: ActionInput;
  payload: Array<RecoverBaremetalInstancePayload>;
}

export interface RecoverBaremetalInstancePayload {
  uuid: Scalars['String']['input'];
}

export interface RecoverDataVolumeInput {
  action: ActionInput;
  payload: Array<RecoverDataVolumePayload>;
}

export interface RecoverDataVolumePayload {
  uuid: Scalars['String']['input'];
}

export interface RecoverDatabaseBackupActionInput {
  action: ActionInput;
  payload: RecoverDatabaseBackupInput;
}

export interface RecoverDatabaseBackupInput {
  backupInstallPath?: InputMaybe<Scalars['String']['input']>;
  backupStorageUrl?: InputMaybe<Scalars['String']['input']>;
  mysqlRootPassword: Scalars['String']['input'];
  uuid?: InputMaybe<Scalars['String']['input']>;
}

export interface RecoverImageInput {
  action: ActionInput;
  payload: Array<RecoverImagePayload>;
}

export interface RecoverImagePayload {
  backupStorageUuids: Array<Scalars['String']['input']>;
  imageUuid: Scalars['String']['input'];
}

export interface RecoverVmInstanceInput {
  action: ActionInput;
  payload: Array<RecoverVmInstancePayload>;
}

export interface RecoverVmInstancePayload {
  startVm: Scalars['Boolean']['input'];
  uuid: Scalars['String']['input'];
}

export interface RedirectTemplateRef {
  redirectTemplate?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export enum RedundancyPolicy {
  Erasure = 'Erasure',
  Replicated = 'Replicated'
}

export interface RefreshFiberChannelStorageInput {
  action: ActionInput;
  payload: Array<RefreshFiberChannelStoragePayload>;
}

export interface RefreshFiberChannelStoragePayload {
  /** 块设备UUID列表。1，null - 刷物理机上所有记录在MN 的 FiberChannelScsiLun 容量；2，[] - 不刷容量；3，[x, y, z] - 刷 scsiLunUuid 为 x, y, z 的容量。 */
  scsiLunUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  /** 区域UUID */
  zoneUuid: Scalars['String']['input'];
}

export interface RefreshIscsiServerInput {
  action: ActionInput;
  payload: Array<RefreshIscsiServerPayload>;
}

export interface RefreshIscsiServerPayload {
  /** iSCSI服务器的的UUID */
  uuid: Scalars['String']['input'];
}

export interface RefreshNvmeServerInput {
  action: ActionInput;
  payload: Array<RefreshNvmeServerPayload>;
}

export interface RefreshNvmeServerPayload {
  /** Nvme服务器的的UUID */
  uuid: Scalars['String']['input'];
}

export interface RefreshNvmeTargetInput {
  action: ActionInput;
  payload: Array<RefreshNvmeTargetPayload>;
}

export interface RefreshNvmeTargetPayload {
  /** 块设备UUID列表。1，null - 刷物理机上所有记录在MN 的 FiberChannelScsiLun 容量；2，[] - 不刷容量；3，[x, y, z] - 刷 scsiLunUuid 为 x, y, z 的容量。 */
  nvmeLunUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  /** 区域UUID */
  zoneUuid: Scalars['String']['input'];
}

export interface RefreshSharedblockDeviceCapacityInput {
  action: ActionInput;
  payload: Array<RefreshSharedblockDeviceCapacityPayload>;
}

export interface RefreshSharedblockDeviceCapacityPayload {
  sharedBlockGroupUuid: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface RegisterVmInstanceInput {
  action: ActionInput;
  payload: RegisterVmInstancePayload;
}

export interface RegisterVmInstancePayload {
  /** 集群 UUID */
  clusterUuid: Scalars['String']['input'];
  /** 是否强制忽略版本不匹配 */
  forceVersionMismatch: Scalars['Boolean']['input'];
  /** 分组 */
  group?: InputMaybe<Scalars['String']['input']>;
  /** 主机 UUID */
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  /** 元数据路径 */
  metadataPath: Scalars['String']['input'];
  /** 虚拟机名称 */
  name: Scalars['String']['input'];
  /** 主存储 UUID */
  primaryStorageUuid: Scalars['String']['input'];
  /** 区域 UUID */
  zoneUuid: Scalars['String']['input'];
}

export interface ReimageVmInstanceInput {
  action: ActionInput;
  payload: ReimageVmInstancePayload;
}

export interface ReimageVmInstancePayload {
  vmInstanceUuid: Scalars['String']['input'];
}

export interface RekeyKeyProviderRefsInput {
  action: ActionInput;
  payload: RekeyKeyProviderRefsPayload;
}

export interface RekeyKeyProviderRefsPayload {
  providerUuid?: InputMaybe<Scalars['String']['input']>;
  refIds?: InputMaybe<Array<Scalars['String']['input']>>;
  rekeyAll?: InputMaybe<Scalars['Boolean']['input']>;
  resourceType?: InputMaybe<Scalars['String']['input']>;
  resourceUuids?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface RelatedResource {
  alarm?: Maybe<Scalars['Int']['output']>;
  backupData?: Maybe<Scalars['Int']['output']>;
  schedulerJob?: Maybe<Scalars['Int']['output']>;
  snapshot?: Maybe<Scalars['Int']['output']>;
  vmNic?: Maybe<Scalars['Int']['output']>;
  volume?: Maybe<Scalars['Int']['output']>;
}

export interface RemoteBackupStorage {
  attachedZoneUuids?: Maybe<Array<Scalars['String']['output']>>;
  availableCapacity?: Maybe<Scalars['BigInt']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  hostname?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  sshPort?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<BackupStorageState>;
  status?: Maybe<BackupStorageStatus>;
  tag?: Maybe<Scalars['String']['output']>;
  totalCapacity?: Maybe<Scalars['BigInt']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface RemoteBackupStorageQueryResp {
  error?: Maybe<ActionError>;
  list?: Maybe<Array<RemoteBackupStorage>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface RemoteBackupStorageSystemTagsQueryResp {
  error?: Maybe<ActionError>;
  list?: Maybe<Array<SystemTag>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface RemoteSecurityGroup {
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface RemoveActionFromAlarmInput {
  action: ActionInput;
  payload: Array<RemoveActionFromAlarmPayload>;
}

export interface RemoveActionFromAlarmPayload {
  actionUuid: Scalars['String']['input'];
  alarmUuid: Scalars['String']['input'];
}

export interface RemoveActionFromEventSubscriptionInput {
  action: ActionInput;
  payload: Array<RemoveActionFromEventSubscriptionPayload>;
}

export interface RemoveActionFromEventSubscriptionPayload {
  actionUuid: Scalars['String']['input'];
  subscriptionUuid: Scalars['String']['input'];
}

export interface RemoveAlarmFromEndPointInput {
  action: ActionInput;
  payload: Array<RemoveAlarmFromEndPointPayload>;
}

export interface RemoveAlarmFromEndPointPayload {
  actionUuid: Scalars['String']['input'];
  alarmUuid?: InputMaybe<Scalars['String']['input']>;
  subscriptionUuid?: InputMaybe<Scalars['String']['input']>;
  type: ZWatchAlarmQueryType;
}

export interface RemoveDnsFromL3NetworkInput {
  action: ActionInput;
  payload: Array<RemoveDnsFromL3NetworkPayload>;
}

export interface RemoveDnsFromL3NetworkPayload {
  dns?: InputMaybe<Scalars['String']['input']>;
  l3NetworkUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface RemoveHaStickStragedyActionInput {
  action: ActionInput;
  payload: Array<RemoveHaStickStragedyPayload>;
}

export interface RemoveHaStickStragedyPayload {
  clusterUuid: Scalars['String']['input'];
  vmInstanceUuid: Scalars['String']['input'];
}

export interface RemoveHostFromHostGroupInput {
  action: ActionInput;
  payload: Array<RemoveHostFromHostGroupPayload>;
}

export interface RemoveHostFromHostGroupPayload {
  hostGroupUuid: Scalars['String']['input'];
  hostUuid: Scalars['String']['input'];
}

export interface RemoveNicInput {
  action: ActionInput;
  payload: Array<RemoveNicPayload>;
}

export interface RemoveNicPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  gateway?: InputMaybe<Scalars['String']['input']>;
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  ipAddress?: InputMaybe<Scalars['String']['input']>;
  mode?: InputMaybe<Scalars['String']['input']>;
  netmask?: InputMaybe<Scalars['String']['input']>;
  slaveUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
  xmitHashPolicy?: InputMaybe<Scalars['String']['input']>;
}

export interface RemoveResourceFromBackupJobInput {
  action: ActionInput;
  payload: Array<RemoveResourceFromBackupJobPayload>;
}

export interface RemoveResourceFromBackupJobPayload {
  resourceUuids: Array<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface RemoveSNSDingTalkAtPersonInput {
  action: ActionInput;
  payload: Array<RemoveSNSDingTalkAtPersonPayload>;
}

export interface RemoveSNSDingTalkAtPersonPayload {
  endpointUuid: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
}

export interface RemoveSNSFeiShuAtPersonInput {
  action: ActionInput;
  payload: Array<RemoveSNSFeiShuAtPersonPayload>;
}

export interface RemoveSNSFeiShuAtPersonPayload {
  endpointUuid: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}

export interface RemoveSNSWeComAtPersonInput {
  action: ActionInput;
  payload: Array<RemoveSNSWeComAtPersonPayload>;
}

export interface RemoveSNSWeComAtPersonPayload {
  endpointUuid: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}

export interface RemoveSmsReceiverInput {
  action: ActionInput;
  payload: Array<RemoveSmsReceiverPayload>;
}

export interface RemoveSmsReceiverPayload {
  endpointUuid: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
}

export interface RemoveTpmFromVmInput {
  action: ActionInput;
  payload: RemoveTpmFromVmPayload;
}

export interface RemoveTpmFromVmPayload {
  tpmUuid?: InputMaybe<Scalars['String']['input']>;
  vmInstanceUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface RemoveUsersInput {
  action: ActionInput;
  payload: Array<RemoveUsersPayload>;
}

export interface RemoveUsersPayload {
  accountUuids: Array<Scalars['String']['input']>;
  userGroupUuids: Array<Scalars['String']['input']>;
}

export interface RemoveVmFromVmGroupInput {
  action: ActionInput;
  payload: Array<RemoveVmFromVmGroupPayload>;
}

export interface RemoveVmFromVmGroupPayload {
  vmGroupUuid: Scalars['String']['input'];
  vmUuid: Scalars['String']['input'];
}

export interface RequestConsoleAccess {
  hostname: Scalars['String']['output'];
  port: Scalars['String']['output'];
  token: Scalars['String']['output'];
}

export interface ResetGlobalConfigInput {
  action: ActionInput;
  payload: Array<ResetGlobalConfigPayload>;
}

export interface ResetGlobalConfigPayload {
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface ResizeDataVolumeInput {
  action: ActionInput;
  payload: Array<ResizeDataVolumePayload>;
}

export interface ResizeDataVolumePayload {
  size: Scalars['Float']['input'];
  uuid: Scalars['String']['input'];
}

export interface ResizeRootVolumeInput {
  action: ActionInput;
  payload: Array<ResizeRootVolumePayload>;
}

export interface ResizeRootVolumePayload {
  size: Scalars['Float']['input'];
  uuid: Scalars['String']['input'];
}

export interface Resource {
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface ResourceAttributeConstraint {
  createDate: Scalars['String']['output'];
  id: Scalars['BigInt']['output'];
  keyUuid: Scalars['String']['output'];
  parameter: Scalars['String']['output'];
  resourceCount?: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
}

export interface ResourceAttributeConstraintResponse {
  /** 查询结果列表 */
  list?: Maybe<Array<ResourceAttributeConstraint>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface ResourceAttributeKey {
  constraints?: Maybe<Array<ResourceAttributeConstraint>>;
  createDate: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  resourceTypes?: Maybe<Array<Scalars['String']['output']>>;
  uuid: Scalars['String']['output'];
}

export interface ResourceAttributeKeyResponse {
  /** 查询结果列表 */
  list?: Maybe<Array<ResourceAttributeKey>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface ResourceAttributeValue {
  createDate: Scalars['String']['output'];
  key: ResourceAttributeKey;
  keyUuid: Scalars['String']['output'];
  resourceName?: Maybe<Scalars['String']['output']>;
  resourceType: Scalars['String']['output'];
  resourceUuid: Scalars['String']['output'];
  value: Scalars['String']['output'];
}

export interface ResourceAttributeValueResponse {
  /** 查询结果列表 */
  list?: Maybe<Array<ResourceAttributeValue>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface ResourceConfigInPage {
  category: Scalars['String']['output'];
  defaultValue: Scalars['String']['output'];
  /** 默认参考全局配置, 用于标记该配置所依赖资源的资源类型。 */
  dependentResourceType?: Maybe<DependentResourceType>;
  description?: Maybe<Scalars['String']['output']>;
  globalConfigValue: Scalars['String']['output'];
  id?: Maybe<Scalars['String']['output']>;
  /** 数据保护是否通过 */
  isValid?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  /** 资源类型 */
  resourceType?: Maybe<Scalars['String']['output']>;
  resourceUuid: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
  value: Scalars['String']['output'];
}

export interface ResourceConfigList {
  list?: Maybe<Array<ResourceConfigInPage>>;
}

export interface ResourceConfigPayload {
  category: Scalars['String']['input'];
  name: Scalars['String']['input'];
  resourceUuid: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
}

export interface ResourceCpuMode {
  cpuMode: Scalars['String']['output'];
}

export interface ResourceData {
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  totalCapacity?: Maybe<Scalars['Float']['output']>;
  usedCapacity?: Maybe<Scalars['Float']['output']>;
  usedPercent?: Maybe<Scalars['Float']['output']>;
}

export interface ResourceFromResourceStack {
  createDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  resourceType: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface ResourceInAlarmHistories {
  tagType?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Tag>>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface ResourceInfo {
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface ResourceList {
  error?: Maybe<ActionError>;
  list: Array<Resource>;
  total: Scalars['Int']['output'];
}

export interface ResourceNode {
  detail?: Maybe<NodeDetail>;
  id: Scalars['String']['output'];
  relations?: Maybe<ResourceRelation>;
  resourceType: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
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

export interface ResourceRelation {
  cluster?: Maybe<Array<Scalars['String']['output']>>;
  host?: Maybe<Array<Scalars['String']['output']>>;
  l2?: Maybe<Array<Scalars['String']['output']>>;
  l3?: Maybe<Array<Scalars['String']['output']>>;
  vm?: Maybe<Array<Scalars['String']['output']>>;
}

export interface ResourceRelationsResp {
  clusterCount?: Maybe<Scalars['Int']['output']>;
  hostCount?: Maybe<Scalars['Int']['output']>;
  l2Count?: Maybe<Scalars['Int']['output']>;
  l3Count?: Maybe<Scalars['Int']['output']>;
  nodes: Array<ResourceNode>;
  vmCount?: Maybe<Scalars['Int']['output']>;
}

export interface ResourceSchedulerTrigger {
  cron?: InputMaybe<Scalars['String']['input']>;
  repeatCount?: InputMaybe<Scalars['Float']['input']>;
  schedulerInterval?: InputMaybe<Scalars['Float']['input']>;
  schedulerType: SchedulerType;
  startTime?: InputMaybe<Scalars['Float']['input']>;
}

export interface ResourceShare {
  resourceUuid: Scalars['String']['output'];
  shareType: Scalars['String']['output'];
}

export interface ResourceStack {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  enableRollback?: Maybe<Scalars['Boolean']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<Owner>;
  paramContent?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  status?: Maybe<ResourceStackStatus>;
  templateContent?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
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

export interface ResourceUpgradeConfig {
  upgradeConfig?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
}

export interface ResponseActionInfo {
  actionId: Scalars['String']['output'];
  error: Scalars['Int']['output'];
  state: ActionRespTaskState;
  success: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
}

export interface RestoreNkpInput {
  action: ActionInput;
  payload: RestoreNkpPayload;
}

export interface RestoreNkpPayload {
  contentBase64: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
}

export interface ResumeVmInstanceInput {
  action: ActionInput;
  payload: Array<ResumeVmInstancePayload>;
}

export interface ResumeVmInstancePayload {
  uuid: Scalars['String']['input'];
}

export interface RevertVolumeFromSnapshotInput {
  action: ActionInput;
  payload: RevertVolumeFromSnapshotPayload;
}

export interface RevertVolumeFromSnapshotPayload {
  isStartVm?: InputMaybe<Scalars['Boolean']['input']>;
  type: SnapshotType;
  uuid: Scalars['String']['input'];
  vmUuid?: InputMaybe<Scalars['String']['input']>;
  withMemory?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface RevokeImageFromPublicInput {
  action: ActionInput;
  payload: Array<RevokeImageFromPublicPayload>;
}

export interface RevokeImageFromPublicPayload {
  resourceUuids: Array<Scalars['String']['input']>;
}

export interface RevokeInstanceOfferingSharingFromPublicInput {
  resourceUuids: Array<Scalars['String']['input']>;
}

export interface RevokeMonitorTemplateFromMonitorGroupInput {
  action: ActionInput;
  payload: Array<RevokeMonitorTemplateFromMonitorGroupPayload>;
}

export interface RevokeMonitorTemplateFromMonitorGroupPayload {
  groupUuid: Scalars['String']['input'];
  templateUuid: Scalars['String']['input'];
}

export interface RevokeResourceSharingInput {
  action: ActionInput;
  payload: RevokeResourceSharingPayload;
}

export interface RevokeResourceSharingPayload {
  accountUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  all?: InputMaybe<Scalars['Boolean']['input']>;
  resourceUuids: Array<Scalars['String']['input']>;
  toPublic?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface RunDisasterRecoveryServiceActionInput {
  action: ActionInput;
  payload: RunDisasterRecoveryServiceActionPayload;
}

export interface RunDisasterRecoveryServiceActionPayload {
  bootstrapToken?: InputMaybe<Scalars['String']['input']>;
  certificateFingerprint?: InputMaybe<Scalars['String']['input']>;
  checksum?: InputMaybe<Scalars['String']['input']>;
  clusterName?: InputMaybe<Scalars['String']['input']>;
  hostName?: InputMaybe<Scalars['String']['input']>;
  localFileName?: InputMaybe<Scalars['String']['input']>;
  managementAddress?: InputMaybe<Scalars['String']['input']>;
  managementNetwork?: InputMaybe<Scalars['String']['input']>;
  managementNodeAddress?: InputMaybe<Scalars['String']['input']>;
  operation: Scalars['String']['input'];
  packageName?: InputMaybe<Scalars['String']['input']>;
  packageUrl?: InputMaybe<Scalars['String']['input']>;
  packageVersion?: InputMaybe<Scalars['String']['input']>;
  siteId?: InputMaybe<Scalars['String']['input']>;
  siteName?: InputMaybe<Scalars['String']['input']>;
  spec?: InputMaybe<Scalars['String']['input']>;
  storageName?: InputMaybe<Scalars['String']['input']>;
  storagePath?: InputMaybe<Scalars['String']['input']>;
  uploadMethod?: InputMaybe<Scalars['String']['input']>;
}

export interface RunSchedulerTriggerInput {
  action: ActionInput;
  payload: Array<RunSchedulerTriggerPayload>;
}

export interface RunSchedulerTriggerPayload {
  jobUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export enum SNSApplicationPlatformState {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export interface SNSDingTalkAtPerson {
  createDate?: Maybe<Scalars['String']['output']>;
  endpointUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  phoneNumber: Scalars['String']['output'];
  remark?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface SNSEmailTestConnectionInput {
  action: ActionInput;
  payload: Array<SNSEmailTestConnectionPayload>;
}

export interface SNSEmailTestConnectionPayload {
  emails: Array<Scalars['String']['input']>;
  platformUuid: Scalars['String']['input'];
}

export interface SNSFeiShuAtPerson {
  createDate?: Maybe<Scalars['String']['output']>;
  endpointUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  remark?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface SNSSnmpTestConnectionInput {
  action: ActionInput;
  payload: Array<SNSSnmpTestConnectionPayload>;
}

export interface SNSSnmpTestConnectionPayload {
  endpointUuid?: InputMaybe<Scalars['String']['input']>;
  platformUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface SNSTextTemplate {
  alarmTemplateCode?: Maybe<Scalars['String']['output']>;
  applicationPlatformType?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  defaultTemplate?: Maybe<Scalars['Boolean']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  eventTemplate?: Maybe<Scalars['String']['output']>;
  eventTemplateCode?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  recoverySubject?: Maybe<Scalars['String']['output']>;
  recoveryTemplate?: Maybe<Scalars['String']['output']>;
  sign?: Maybe<Scalars['String']['output']>;
  subject?: Maybe<Scalars['String']['output']>;
  template?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface SNSTopic {
  createDate?: Maybe<Scalars['String']['output']>;
  locale?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface SNSWeComAtPerson {
  createDate?: Maybe<Scalars['String']['output']>;
  endpointUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  remark?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface ScanDataZSVBackupStorageInput {
  action: ActionInput;
  payload: Array<ScanDataZSVBackupStoragePayload>;
}

export interface ScanDataZSVBackupStoragePayload {
  backupStorageType?: InputMaybe<Scalars['String']['input']>;
  currentZoneUuid: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface ScanDatabaseBackupActionInput {
  action: ActionInput;
  payload: Array<ScanDatabaseBackupInput>;
}

export interface ScanDatabaseBackupInput {
  uuid?: InputMaybe<Scalars['String']['input']>;
}

export interface ScanLocalBackupStorage {
  dataBaseTotal?: Maybe<Scalars['Int']['output']>;
  vmTotal?: Maybe<Scalars['Int']['output']>;
  volumeTotal?: Maybe<Scalars['Int']['output']>;
}

export interface ScanZSVBackupStorage {
  dataBaseTotal?: Maybe<Scalars['Int']['output']>;
  vmTotal?: Maybe<Scalars['Int']['output']>;
  volumeTotal?: Maybe<Scalars['Int']['output']>;
}

export interface SchedHistoryLog {
  accountUuid?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  destHost?: Maybe<Host>;
  destHostUuid?: Maybe<Scalars['String']['output']>;
  failReason?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  lastHostUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<CommonOwner>;
  preHost?: Maybe<Host>;
  schedReason?: Maybe<Scalars['String']['output']>;
  schedType?: Maybe<SchedTypes>;
  slbUuid?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
  vmInstance?: Maybe<VmInstance>;
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
}

export interface SchedHistoryLogList {
  error?: Maybe<ActionError>;
  list: Array<SchedHistoryLog>;
  total: Scalars['Int']['output'];
}

export enum SchedTypes {
  HMT = 'HMT',
  VMHA = 'VMHA'
}

export interface SchedulerJob {
  /** 创建日期 */
  createDate: Scalars['String']['output'];
  /** 资源的详细描述 */
  description?: Maybe<Scalars['String']['output']>;
  jobClassName: Scalars['String']['output'];
  jobData: Scalars['String']['output'];
  lastOpDate: Scalars['String']['output'];
  localBackupStorage?: Maybe<Array<BackupStorage>>;
  /** 资源名称 */
  name: Scalars['String']['output'];
  owner?: Maybe<AccountInfo>;
  remoteBackupStorage?: Maybe<BackupStorage>;
  schedulerJobGroup?: Maybe<Array<SchedulerJobGroup>>;
  schedulerJobGroupJobRefs?: Maybe<Array<SchedulerJobGroupJobRef>>;
  schedulerJobGroupUuids?: Maybe<Array<Scalars['String']['output']>>;
  /** 定时器 */
  schedulerTrigger?: Maybe<SchedulerTrigger>;
  /** 启用状态 */
  state: SchedulerJobState;
  targetResourceUuid: Scalars['String']['output'];
  triggersUuid: Array<Scalars['String']['output']>;
  /** 资源的UUID，唯一标示该资源 */
  uuid: Scalars['String']['output'];
  vmInstance?: Maybe<VmInstanceBase>;
  volume?: Maybe<Volume>;
}

export interface SchedulerJobGroup {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  jobData?: Maybe<Scalars['String']['output']>;
  jobType?: Maybe<SchedulerJobGroupType>;
  jobs?: Maybe<Array<SchedulerJob>>;
  jobsUuid?: Maybe<Array<Scalars['String']['output']>>;
  lastJobResult?: Maybe<SchedulerJobHistoryGroupByFireInstanceId>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  localBackupStorage?: Maybe<Array<BackupStorage>>;
  name: Scalars['String']['output'];
  owner?: Maybe<SchedulerJobGroupOwner>;
  remoteBackupStorage?: Maybe<BackupStorage>;
  schedulerTriggers?: Maybe<Array<SchedulerTrigger>>;
  state?: Maybe<SchedulerJobGroupState>;
  status?: Maybe<Scalars['String']['output']>;
  triggersUuid?: Maybe<Array<Scalars['String']['output']>>;
  uuid: Scalars['String']['output'];
  zone?: Maybe<Zone>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface SchedulerJobGroupJobRef {
  priority?: Maybe<Scalars['Int']['output']>;
  schedulerJobGroupUuid: Scalars['String']['output'];
  schedulerJobUuid: Scalars['String']['output'];
}

export interface SchedulerJobGroupList {
  error?: Maybe<ActionError>;
  list: Array<SchedulerJobGroup>;
  total: Scalars['Int']['output'];
}

export interface SchedulerJobGroupOwner {
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
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

export interface SchedulerJobHistory {
  backupCapacity?: Maybe<Scalars['String']['output']>;
  endTime?: Maybe<Scalars['String']['output']>;
  executeTime?: Maybe<Scalars['Int']['output']>;
  fireInstanceId?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  jobType?: Maybe<Scalars['String']['output']>;
  requestDump?: Maybe<Scalars['String']['output']>;
  resourceInfo?: Maybe<ResourceInfo>;
  resultDump?: Maybe<Scalars['String']['output']>;
  schedulerJobUuid?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
  targetResourceUuid?: Maybe<Scalars['String']['output']>;
  triggerUuid?: Maybe<Scalars['String']['output']>;
  vmInstance?: Maybe<VmInstanceNameAndUuid>;
  volume?: Maybe<Volume>;
}

export interface SchedulerJobHistoryGroupByFireInstanceId {
  backupCapacity?: Maybe<Scalars['String']['output']>;
  backupCapacityForSchedulerJobHistoryGroup?: Maybe<Scalars['String']['output']>;
  endTime?: Maybe<Scalars['String']['output']>;
  executeTime?: Maybe<Scalars['Int']['output']>;
  failCount?: Maybe<Scalars['Int']['output']>;
  fireInstanceId?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  jobType?: Maybe<Scalars['String']['output']>;
  mode?: Maybe<BackupMode>;
  requestDump?: Maybe<Scalars['String']['output']>;
  resourceCount?: Maybe<Scalars['Int']['output']>;
  resourceInfo?: Maybe<ResourceInfo>;
  resultDump?: Maybe<Scalars['String']['output']>;
  runningCount?: Maybe<Scalars['Int']['output']>;
  schedulerJobGroupUuid?: Maybe<Scalars['String']['output']>;
  schedulerJobUuid?: Maybe<Scalars['String']['output']>;
  schedulerName?: Maybe<Scalars['String']['output']>;
  /** 开始执行时间 */
  startExecutionTime?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
  successCount?: Maybe<Scalars['Int']['output']>;
  targetResourceUuid?: Maybe<Scalars['String']['output']>;
  triggerUuid?: Maybe<Scalars['String']['output']>;
  vmInstance?: Maybe<VmInstanceNameAndUuid>;
  volume?: Maybe<Volume>;
}

export interface SchedulerJobHistoryGroupByFireInstanceIdList {
  error?: Maybe<ActionError>;
  list: Array<SchedulerJobHistoryGroupByFireInstanceId>;
  total: Scalars['Int']['output'];
}

export enum SchedulerJobHistoryGroupByFireInstanceIdQueryType {
  NORMAL = 'NORMAL',
  OVERVIEW = 'OVERVIEW'
}

export interface SchedulerJobHistoryList {
  error?: Maybe<ActionError>;
  list: Array<SchedulerJobHistory>;
  total: Scalars['Int']['output'];
}

export enum SchedulerJobHistoryQueryType {
  NORMAL = 'NORMAL'
}

export interface SchedulerJobList {
  error?: Maybe<ActionError>;
  list: Array<SchedulerJob>;
  total: Scalars['Int']['output'];
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

export interface SchedulerTrigger {
  createDate?: Maybe<Scalars['String']['output']>;
  cron?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  jobsUuid?: Maybe<Array<Scalars['String']['output']>>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<OwnerNameAndUuidAndType>;
  repeatCount?: Maybe<Scalars['Int']['output']>;
  schedulerInterval?: Maybe<Scalars['Int']['output']>;
  /** 定时器类型 */
  schedulerType?: Maybe<SchedulerType>;
  startTime?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  stopTime?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface SchedulerTriggerList {
  error?: Maybe<ActionError>;
  list: Array<SchedulerTrigger>;
  total: Scalars['Int']['output'];
}

export enum SchedulerType {
  cron = 'cron',
  simple = 'simple'
}

export interface Screenshot {
  imageData?: Maybe<Scalars['String']['output']>;
}

export interface Script {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  encodingType?: Maybe<ScriptEncodingType>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  platform?: Maybe<ImagePlatform>;
  renderParams?: Maybe<Scalars['String']['output']>;
  scriptContent?: Maybe<Scalars['String']['output']>;
  scriptTimeout?: Maybe<Scalars['Float']['output']>;
  scriptType?: Maybe<ScriptType>;
  uuid: Scalars['String']['output'];
}

export enum ScriptEncodingType {
  Base64 = 'Base64',
  PlainText = 'PlainText'
}

export interface ScriptExecuteRecord {
  encodingType?: Maybe<ScriptEncodingType>;
  endTime?: Maybe<Scalars['String']['output']>;
  executionCount?: Maybe<Scalars['Float']['output']>;
  executor?: Maybe<Scalars['String']['output']>;
  recordName?: Maybe<Scalars['String']['output']>;
  relatedScript?: Maybe<Script>;
  renderParams?: Maybe<Scalars['String']['output']>;
  scriptContent?: Maybe<Scalars['String']['output']>;
  scriptUuid?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['String']['output']>;
  status?: Maybe<ScriptExecuteRecordStatus>;
  uuid: Scalars['String']['output'];
}

export interface ScriptExecuteRecordDetail {
  endTime?: Maybe<Scalars['String']['output']>;
  errCause?: Maybe<Scalars['String']['output']>;
  exitCode?: Maybe<Scalars['Float']['output']>;
  recordUuid: Scalars['String']['output'];
  startTime?: Maybe<Scalars['String']['output']>;
  status?: Maybe<ScriptExecuteRecordDetailStatus>;
  stderr?: Maybe<Scalars['String']['output']>;
  stdout?: Maybe<Scalars['String']['output']>;
  vmInstance?: Maybe<VmInstanceBase>;
  vmInstanceUuid: Scalars['String']['output'];
  vmName?: Maybe<Scalars['String']['output']>;
}

export interface ScriptExecuteRecordDetailList {
  list: Array<ScriptExecuteRecordDetail>;
  total: Scalars['Float']['output'];
}

export enum ScriptExecuteRecordDetailStatus {
  Completed = 'Completed',
  Failed = 'Failed',
  Running = 'Running',
  Uploading = 'Uploading'
}

export interface ScriptExecuteRecordList {
  list: Array<ScriptExecuteRecord>;
  total: Scalars['Float']['output'];
}

export enum ScriptExecuteRecordStatus {
  Exception = 'Exception',
  Failed = 'Failed',
  Running = 'Running',
  Succeed = 'Succeed'
}

export interface ScriptList {
  list: Array<Script>;
  total: Scalars['Float']['output'];
}

export enum ScriptType {
  Bat = 'Bat',
  Perl = 'Perl',
  Powershell = 'Powershell',
  Python = 'Python',
  Shell = 'Shell'
}

export interface ScsiLun {
  createDate?: Maybe<Scalars['String']['output']>;
  healthState?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  multipathDeviceUuid?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  path?: Maybe<Scalars['String']['output']>;
  scsiLunHostRefs: Array<ScsiLunHostRefInventory>;
  scsiLunVmInstanceRefs: Array<ScsiLunVmInstanceRefInventory>;
  serial?: Maybe<Scalars['String']['output']>;
  size: Scalars['Float']['output'];
  source?: Maybe<LunSource>;
  state?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vendor?: Maybe<Scalars['String']['output']>;
  wwid?: Maybe<Scalars['String']['output']>;
  wwn?: Maybe<Scalars['String']['output']>;
}


export interface ScsiLunhealthStateArgs {
  hostUuid: Scalars['String']['input'];
}

export interface ScsiLunHostRefInventory {
  createDate?: Maybe<Scalars['String']['output']>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  scsiLunUuid?: Maybe<Scalars['String']['output']>;
}

export interface ScsiLunList {
  error?: Maybe<ActionError>;
  list: Array<ScsiLun>;
  total: Scalars['Int']['output'];
}

export enum ScsiLunQueryType {
  GetScsiLunCandidatesForAttachingVm = 'GetScsiLunCandidatesForAttachingVm',
  GetScsiLunCandidatesForAttachingZSVInstanceByCluster = 'GetScsiLunCandidatesForAttachingZSVInstanceByCluster',
  GetScsiLunCandidatesForAttachingZSVInstanceByHost = 'GetScsiLunCandidatesForAttachingZSVInstanceByHost',
  GetSharedBlockCandidate = 'GetSharedBlockCandidate',
  Normal = 'Normal'
}

export interface ScsiLunVmInstanceRefInventory {
  attachMultipath: Scalars['Boolean']['output'];
  createDate?: Maybe<Scalars['String']['output']>;
  deviceId?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  scsiLunUuid?: Maybe<Scalars['String']['output']>;
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
}

export interface SdnController {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vdsUuid?: Maybe<Scalars['String']['output']>;
  vendorType?: Maybe<Scalars['String']['output']>;
  vniRanges?: Maybe<Array<VniRanges>>;
  vxlanPools?: Maybe<Array<VxlanPools>>;
}

export interface SdnControllerList {
  error?: Maybe<ActionError>;
  list: Array<SdnController>;
  total: Scalars['Int']['output'];
}

export interface SdsInfo {
  isExpandPoolSupported?: Maybe<Scalars['Boolean']['output']>;
  sdsVersion?: Maybe<Scalars['String']['output']>;
}

export interface SeDevice {
  createDate?: Maybe<Scalars['String']['output']>;
  host?: Maybe<Host>;
  hostUuid: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vmInstance?: Maybe<VmInstance>;
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
}

export interface SeDeviceQueryResp {
  list?: Maybe<Array<SeDevice>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface SearchResource {
  resourceName?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  resourceZhName?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface SearchResourceResp {
  list?: Maybe<Array<SearchResource>>;
  total?: Maybe<Scalars['Float']['output']>;
}

export interface SecretResourcePool {
  activatedToken?: Maybe<Scalars['String']['output']>;
  connectionMode?: Maybe<ConnectionModeEnum>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  heartbeatInterval?: Maybe<Scalars['String']['output']>;
  hmacToken?: Maybe<Scalars['String']['output']>;
  isEnableCryptoCmpl: Scalars['Boolean']['output'];
  lastOpDate?: Maybe<Scalars['String']['output']>;
  model: SecretResourcePoolModel;
  name: Scalars['String']['output'];
  protectToken?: Maybe<Scalars['String']['output']>;
  securityMachine?: Maybe<Array<SecurityMachineForSecretResourcePool>>;
  state: SecretResourcePoolState;
  status?: Maybe<SecretResourcePoolStatus>;
  type: SecurityMachineType;
  ukeyType?: Maybe<SecretResourceUKeyType>;
  uuid: Scalars['String']['output'];
}

export interface SecretResourcePoolList {
  error?: Maybe<ActionError>;
  list: Array<SecretResourcePool>;
  total: Scalars['Int']['output'];
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

export interface SecretServer {
  appId?: Maybe<Scalars['String']['output']>;
  clientID?: Maybe<Scalars['String']['output']>;
  clientSecrete?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  isEnableCryptoCmpl: Scalars['Boolean']['output'];
  keyNumSM2?: Maybe<Scalars['String']['output']>;
  keyNumSM4?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  managementIp: Scalars['String']['output'];
  model: SecretResourcePoolModel;
  name: Scalars['String']['output'];
  port: Scalars['String']['output'];
  realm?: Maybe<Scalars['String']['output']>;
  route?: Maybe<Scalars['String']['output']>;
  status: SecretResourcePoolStatus;
  uuid: Scalars['String']['output'];
}

export interface SecretServerList {
  error?: Maybe<ActionError>;
  /** 查询结果列表 */
  list?: Maybe<Array<SecretServer>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum SecretServerQueryType {
  Normal = 'Normal'
}

export interface SecurityGroup {
  attachedL3NetworkUuids?: Maybe<Array<Scalars['String']['output']>>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  ipVersion?: Maybe<Scalars['Int']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<CommonOwner>;
  priority?: Maybe<Scalars['Int']['output']>;
  projectUuid?: Maybe<Scalars['String']['output']>;
  rules?: Maybe<Array<SecurityGroupRule>>;
  state?: Maybe<SecurityGroupState>;
  uuid: Scalars['String']['output'];
  vmNicCount: Scalars['Int']['output'];
}

export interface SecurityGroupInVminstance {
  name: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface SecurityGroupList {
  list?: Maybe<Array<SecurityGroup>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export enum SecurityGroupQueryType {
  ALL = 'ALL',
  Account = 'Account',
  GetIAM2ProjectCandidateDefaultSecurityGroup = 'GetIAM2ProjectCandidateDefaultSecurityGroup',
  GetVmNicCandidateSecurityGroup = 'GetVmNicCandidateSecurityGroup',
  Normal = 'Normal'
}

export interface SecurityGroupRefs {
  attachedL3NetworkUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  priority: Scalars['Int']['input'];
  securityGroupUuid: Scalars['String']['input'];
}

export interface SecurityGroupRule {
  action?: Maybe<SecurityGroupRulePolicy>;
  allowedCidr?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dstIpRange?: Maybe<Scalars['String']['output']>;
  dstPortRange?: Maybe<Scalars['String']['output']>;
  endPort?: Maybe<Scalars['Int']['output']>;
  ipVersion?: Maybe<Scalars['Int']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  priority?: Maybe<Scalars['Int']['output']>;
  protocol?: Maybe<SecurityGroupRuleProtocolType>;
  remoteSecurityGroup?: Maybe<RemoteSecurityGroup>;
  remoteSecurityGroupUuid?: Maybe<Scalars['String']['output']>;
  securityGroupUuid?: Maybe<Scalars['String']['output']>;
  srcIpRange?: Maybe<Scalars['String']['output']>;
  srcPortRange?: Maybe<Scalars['String']['output']>;
  startPort?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<SecurityGroupRuleState>;
  type?: Maybe<SecurityGroupRuleType>;
  uuid: Scalars['String']['output'];
}

export interface SecurityGroupRuleList {
  list?: Maybe<Array<SecurityGroupRule>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface SecurityGroupRuleParam {
  action?: InputMaybe<SecurityGroupRulePolicy>;
  allowedCidr?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dstIpRange?: InputMaybe<Scalars['String']['input']>;
  dstPortRange?: InputMaybe<Scalars['String']['input']>;
  endPort?: InputMaybe<Scalars['Int']['input']>;
  ipVersion?: InputMaybe<Scalars['Int']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  protocol: SecurityGroupRuleProtocolType;
  remoteSecurityGroupUuid?: InputMaybe<Scalars['String']['input']>;
  remoteSecurityGroupUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  securityGroupUuid: Scalars['String']['input'];
  srcIpRange?: InputMaybe<Scalars['String']['input']>;
  srcPortRange?: InputMaybe<Scalars['String']['input']>;
  startPort?: InputMaybe<Scalars['Int']['input']>;
  type: SecurityGroupRuleType;
}

export enum SecurityGroupRulePolicy {
  ACCEPT = 'ACCEPT',
  DROP = 'DROP'
}

export interface SecurityGroupRulePriority {
  priority: Scalars['Int']['input'];
  ruleUuid: Scalars['String']['input'];
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

export interface SecurityMachine {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  managementIp: Scalars['String']['output'];
  name: Scalars['String']['output'];
  port: Scalars['Int']['output'];
  secretResourcePool: SecretResourcePool;
  secretResourcePoolUuid?: Maybe<Scalars['String']['output']>;
  state: SecurityMachineState;
  status: SecurityMachineStatus;
  type: SecurityMachineType;
  uuid: Scalars['String']['output'];
}

export interface SecurityMachineForSecretResourcePool {
  name: Scalars['String']['output'];
  state: Scalars['String']['output'];
  status: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export enum SecurityMachineKeyType {
  Active = 'Active',
  EncryptPublicKey = 'EncryptPublicKey',
  EncryptSubjectDN = 'EncryptSubjectDN',
  Hmac = 'Hmac',
  Protect = 'Protect'
}

export interface SecurityMachineList {
  error?: Maybe<ActionError>;
  list: Array<SecurityMachine>;
  total: Scalars['Int']['output'];
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

export interface Sensor {
  classification?: Maybe<Scalars['String']['output']>;
  lastUpdateTime: Scalars['BigInt']['output'];
  name: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
}

export interface SetDefaultKmsProviderInput {
  action: ActionInput;
  payload: SetDefaultKmsProviderPayload;
}

export interface SetDefaultKmsProviderPayload {
  uuid: Scalars['String']['input'];
}

export interface SetDefaultSNSTextTemplateInput {
  action: ActionInput;
  payload: Array<SetDefaultSNSTextTemplatePayload>;
}

export interface SetDefaultSNSTextTemplatePayload {
  uuid: Scalars['String']['input'];
}

export interface SetGpuDeviceSpecPayload {
  autoReleaseSpec: Scalars['Boolean']['input'];
  newValue?: InputMaybe<GpuDeivceSpecOnVmInstanceInput>;
  oldValue?: InputMaybe<GpuDeivceSpecOnVmInstanceInput>;
  type: Scalars['String']['input'];
  vmUuid: Scalars['String']['input'];
}

export interface SetHaStickStragedyActionInput {
  action: ActionInput;
  payload: Array<SetHaStickStragedyPayload>;
}

export interface SetHaStickStragedyPayload {
  uuid: Scalars['String']['input'];
}

export interface SetHostEptSupportInput {
  action: ActionInput;
  payload: SetHostEptSupportPayload;
}

export interface SetHostEptSupportPayload {
  eptUuid?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface SetImageBootModeInput {
  action: ActionInput;
  payload: Array<SetImageBootModePayload>;
}

export interface SetImageBootModePayload {
  bootMode: ImageBootMode;
  uuid: Scalars['String']['input'];
}

export interface SetIpOnBondInput {
  action: ActionInput;
  payload: Array<SetIpOnBondPayload>;
}

export interface SetIpOnBondPayload {
  bondingUuid: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  gateway?: InputMaybe<Scalars['String']['input']>;
  ipAddress?: InputMaybe<Scalars['String']['input']>;
  netmask?: InputMaybe<Scalars['String']['input']>;
}

export interface SetIpOnInterfaceInput {
  action: ActionInput;
  payload: Array<SetIpOnInterfacePayload>;
}

export interface SetIpOnInterfacePayload {
  interfaceUuid: Scalars['String']['input'];
  ipAddress?: InputMaybe<Scalars['String']['input']>;
  netmask?: InputMaybe<Scalars['String']['input']>;
}

export interface SetL2NetworkSrIovActionInput {
  action: ActionInput;
  payload: SetL2NetworkSrIovInput;
}

export interface SetL2NetworkSrIovInput {
  enable: Scalars['Boolean']['input'];
  uuid: Scalars['String']['input'];
}

export interface SetNicQosInput {
  action: ActionInput;
  payload: SetNicQosPayload;
}

export interface SetNicQosPayload {
  /** 下行带宽 */
  inboundBandwidth?: InputMaybe<Scalars['Float']['input']>;
  /** 上行带宽 */
  outboundBandwidth?: InputMaybe<Scalars['Float']['input']>;
  /** 网卡的uuid */
  uuid: Scalars['String']['input'];
}

export interface SetPhysicalNetworkBondPhysicalNetworkTypeInput {
  action: ActionInput;
  payload: Array<SetPhysicalNetworkBondPhysicalNetworkTypePayload>;
}

export interface SetPhysicalNetworkBondPhysicalNetworkTypePayload {
  bondingUuids: Array<Scalars['String']['input']>;
  serviceTypes: Array<PhysicalNetworkType>;
  vlanIds?: InputMaybe<Array<Scalars['Int']['input']>>;
}

export interface SetPhysicalNetworkInterfacePhysicalNetworkTypeInput {
  action: ActionInput;
  payload: Array<SetPhysicalNetworkInterfacePhysicalNetworkTypePayload>;
}

export interface SetPhysicalNetworkInterfacePhysicalNetworkTypePayload {
  interfaceUuids: Array<Scalars['String']['input']>;
  serviceTypes: Array<PhysicalNetworkType>;
  vlanIds?: InputMaybe<Array<Scalars['Int']['input']>>;
}

export interface SetResourceAttributeValueInput {
  action: ActionInput;
  payload: SetResourceAttributeValuePayload;
}

export interface SetResourceAttributeValuePayload {
  createResourceAttributeKeyPayload?: InputMaybe<Array<CreateResourceAttributeKeyPayload>>;
  createResourceAttributeValuePayload?: InputMaybe<Array<CreateResourceAttributeValuePayload>>;
  deleteResourceAttributeValuePayload?: InputMaybe<Array<DeleteResourceAttributeValuePayload>>;
  updateResourceAttributeKeyPayload?: InputMaybe<Array<UpdateResourceAttributeKeyPayload>>;
}

export interface SetSystemTagInput {
  action: ActionInput;
  payload: Array<SetSystemTagPayload>;
}

export interface SetSystemTagPayload {
  actionType?: InputMaybe<SystemTagActionType>;
  originTag?: InputMaybe<Scalars['String']['input']>;
  resourceType?: InputMaybe<Scalars['String']['input']>;
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
}

export interface SetVmBIOSTrackInput {
  action: ActionInput;
  payload: Array<SetVmBIOSTrackPayload>;
}

export interface SetVmBIOSTrackPayload {
  clockTrack: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface SetVmBootModeInput {
  action: ActionInput;
  payload: Array<SetVmBootModePayload>;
}

export interface SetVmBootModePayload {
  bootMode: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface SetVmBootOrderInput {
  action: ActionInput;
  payload: Array<SetVmBootOrderPayload>;
}

export interface SetVmBootOrderPayload {
  bootOrder: Array<Scalars['String']['input']>;
  systemTags: Array<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface SetVmBootVolumeInput {
  action: ActionInput;
  payload: Array<SetVmBootVolumePayload>;
}

export interface SetVmBootVolumePayload {
  vmInstanceUuid: Scalars['String']['input'];
  volumeUuid: Scalars['String']['input'];
}

export interface SetVmCleanTrafficInput {
  action: ActionInput;
  payload: Array<SetVmCleanTrafficPayload>;
}

export interface SetVmCleanTrafficPayload {
  enable: Scalars['Boolean']['input'];
  uuid: Scalars['String']['input'];
}

export interface SetVmClockTrackInput {
  action: ActionInput;
  payload: Array<SetVmClockTrackPayload>;
}

export interface SetVmClockTrackPayload {
  clockTrack: Scalars['String']['input'];
  intervalInSeconds?: InputMaybe<Scalars['Int']['input']>;
  syncAfterVMResume?: InputMaybe<Scalars['Boolean']['input']>;
  uuid: Scalars['String']['input'];
}

export interface SetVmConsoleModeInput {
  action: ActionInput;
  payload: Array<SetVmConsoleModePayload>;
}

export interface SetVmConsoleModePayload {
  mode: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface SetVmConsolePasswordInput {
  action: ActionInput;
  payload: SetVmConsolePasswordPayload;
}

export interface SetVmConsolePasswordPayload {
  consolePassword: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface SetVmDnsInput {
  action: ActionInput;
  payload: SetVmDnsPayload;
}

export interface SetVmDnsPayload {
  dnsList: Array<Scalars['String']['input']>;
  ipVersion?: InputMaybe<Scalars['Int']['input']>;
  l3NetworkUuid?: InputMaybe<Scalars['String']['input']>;
  vmInstanceUuid: Scalars['String']['input'];
  vmNicUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface SetVmEmulatorPinInput {
  action: ActionInput;
  payload: Array<SetVmEmulatorPinPayload>;
}

export interface SetVmEmulatorPinPayload {
  emulatorPinning: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface SetVmHaLevelInput {
  action: ActionInput;
  payload: Array<SetVmHaLevelPayload>;
}

export interface SetVmHaLevelPayload {
  level: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface SetVmHostnameInput {
  action: ActionInput;
  payload: Array<SetVmHostnamePayload>;
}

export interface SetVmHostnamePayload {
  hostname?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface SetVmInstanceDefaultCdRomInput {
  action: ActionInput;
  payload: SetVmInstanceDefaultCdRomPayload;
}

export interface SetVmInstanceDefaultCdRomPayload {
  uuid: Scalars['String']['input'];
  vmInstanceUuid: Scalars['String']['input'];
}

export interface SetVmInstanceGpuDeviceSpecInput {
  action: ActionInput;
  payload: Array<SetGpuDeviceSpecPayload>;
}

export interface SetVmMonitorNumberInput {
  action: ActionInput;
  payload: Array<SetVmMonitorNumberPayload>;
}

export interface SetVmMonitorNumberPayload {
  monitorNumber: Scalars['Int']['input'];
  uuid: Scalars['String']['input'];
}

export interface SetVmNicSecurityGroupInEditPayload {
  egressPolicy?: InputMaybe<VmNicSecurityPolicyEnum>;
  ingressPolicy?: InputMaybe<VmNicSecurityPolicyEnum>;
  l3NetworkUuid: Scalars['String']['input'];
  securityGroupRefs: Array<SecurityGroupRefs>;
  vmNicUuid: Scalars['String']['input'];
}

export interface SetVmNicSecurityGroupInput {
  action: ActionInput;
  payload: SetVmNicSecurityGroupPayload;
}

export interface SetVmNicSecurityGroupPayload {
  egressPolicy?: InputMaybe<VmNicSecurityPolicyEnum>;
  ingressPolicy?: InputMaybe<VmNicSecurityPolicyEnum>;
  l3NetworkUuid: Scalars['String']['input'];
  securityGroupRefs: Array<SecurityGroupRefs>;
  vmNicUuid: Scalars['String']['input'];
}

export interface SetVmQxlMemoryPayload {
  uuid: Scalars['String']['input'];
  vram: Scalars['Int']['input'];
}

export interface SetVmSshKeyInput {
  action: ActionInput;
  payload: SetVmSshKeyPayload;
}

export interface SetVmSshKeyPayload {
  SshKey: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface SetVmStaticIpInput {
  action: ActionInput;
  payload: SetVmStaticIpPayload;
}

export interface SetVmStaticIpPayload {
  gateway?: InputMaybe<Scalars['String']['input']>;
  ip?: InputMaybe<Scalars['String']['input']>;
  ip6?: InputMaybe<Scalars['String']['input']>;
  ipv6Gateway?: InputMaybe<Scalars['String']['input']>;
  ipv6Prefix?: InputMaybe<Scalars['String']['input']>;
  l3NetworkUuid: Scalars['String']['input'];
  netmask?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  vmInstanceUuid: Scalars['String']['input'];
  vmNicUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface SetVmUsbRedirectInput {
  action: ActionInput;
  payload: Array<SetVmUsbRedirectPayload>;
}

export interface SetVmUsbRedirectPayload {
  enable: Scalars['Boolean']['input'];
  uuid: Scalars['String']['input'];
}

export interface SetVolumeQosInput {
  action: ActionInput;
  payload: Array<SetVolumeQosPayload>;
}

export interface SetVolumeQosPayload {
  readBandwidth?: InputMaybe<Scalars['Float']['input']>;
  readIOPS?: InputMaybe<Scalars['Float']['input']>;
  totalBandwidth?: InputMaybe<Scalars['Float']['input']>;
  totalIOPS?: InputMaybe<Scalars['Float']['input']>;
  uuid: Scalars['String']['input'];
  writeBandwidth?: InputMaybe<Scalars['Float']['input']>;
  writeIOPS?: InputMaybe<Scalars['Float']['input']>;
}

export interface ShareImageToPublicInput {
  action: ActionInput;
  payload: Array<ShareImageToPublicPayload>;
}

export interface ShareImageToPublicPayload {
  resourceUuids: Array<Scalars['String']['input']>;
}

export interface ShareInstanceOfferingToPublicInput {
  resourceUuids: Array<Scalars['String']['input']>;
}

export interface ShareResourceInput {
  action: ActionInput;
  payload: ShareResourcePayload;
}

export interface ShareResourcePayload {
  accountUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  permission?: InputMaybe<Scalars['String']['input']>;
  resourceUuids: Array<Scalars['String']['input']>;
  toPublic?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface ShareResourcesInput {
  action: ActionInput;
  payload: ShareResourcesPayload;
}

export interface ShareResourcesPayload {
  configuration: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  type: Scalars['String']['input'];
}

export enum ShareType {
  Group = 'Group',
  None = 'None',
  Public = 'Public'
}

export interface SharedBlock {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  diskUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  primaryStorageCapacity: PrimaryStorageCapacity;
  sharedBlockCapacity?: Maybe<SharedBlockCapacity>;
  sharedBlockGroupUuid?: Maybe<Scalars['String']['output']>;
  /** lun 来源，根据diskUuid 获取 */
  source?: Maybe<LunSource>;
  state?: Maybe<SharedBlockState>;
  status?: Maybe<SharedBlockStatus>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface SharedBlockCapacity {
  /** 可用容量 */
  availableCapacity?: Maybe<Scalars['Float']['output']>;
  /** 总容量 */
  totalCapacity?: Maybe<Scalars['Float']['output']>;
}

export interface SharedBlockGroupLunInfo {
  /** 发现的共享块磁盘列表 */
  sharedBlocks: Array<DiscoveredSharedBlock>;
  /** VG 状态：Connected 表示完整，Disconnected 表示不完整 */
  status: Scalars['String']['output'];
  /** VG UUID */
  vgUuid: Scalars['String']['output'];
}

export interface SharedBlockGroupLunsResponse {
  /** Map<vgUuid, SharedBlockGroupLunInfo> 以数组形式返回 */
  lunInfos: Array<SharedBlockGroupLunInfo>;
}

export enum SharedBlockGroupType {
  LvmVolumeGroupBasic = 'LvmVolumeGroupBasic'
}

export interface SharedBlockResponse {
  /** 查询结果列表 */
  list?: Maybe<Array<SharedBlock>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
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

export interface SharedBlocks {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  diskUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  sharedBlockGroupUuid?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface SlbOffering {
  allocatorStrategy: AllocatorStrategyType;
  cpuNum: Scalars['Float']['output'];
  cpuSpeed?: Maybe<Scalars['Float']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Image>;
  imageUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  managementNetwork?: Maybe<L3Network>;
  managementNetworkUuid?: Maybe<Scalars['String']['output']>;
  memorySize: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  shareType?: Maybe<ShareType>;
  sortKey?: Maybe<Scalars['Float']['output']>;
  state: Scalars['String']['output'];
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface SmsAK {
  akey?: Maybe<Scalars['String']['output']>;
}

export interface SmsEndPoint extends BasicEndPoint {
  accessKey: SmsAK;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<Owner>;
  platformUuid?: Maybe<Scalars['String']['output']>;
  receivers: Array<Receiver>;
  state?: Maybe<EndPointState>;
  topic?: Maybe<SNSTopic>;
  type?: Maybe<EndPointType>;
  uuid: Scalars['String']['output'];
}

export enum SmsReceiverType {
  AliyunSms = 'AliyunSms'
}

export interface SnapshotDeleteNeedSize {
  deleteNeedSize?: Maybe<Scalars['BigInt']['output']>;
}

export enum SnapshotFormat {
  qcow2 = 'qcow2',
  raw = 'raw'
}

export interface SnapshotGroupByVolume {
  count?: Maybe<Scalars['Int']['output']>;
  size?: Maybe<Scalars['Int']['output']>;
  vm?: Maybe<VmInstance>;
  volume?: Maybe<Volume>;
  volumeUuid?: Maybe<Scalars['String']['output']>;
}

export interface SnapshotGroupByVolumeList {
  list: Array<SnapshotGroupByVolume>;
  total: Scalars['Int']['output'];
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

export interface SnapshotStrategy {
  createDate: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  jobData: Scalars['String']['output'];
  jobs?: Maybe<Array<SnapshotStrategyJob>>;
  jobsUuid?: Maybe<Array<Scalars['String']['output']>>;
  lastOpDate: Scalars['String']['output'];
  name: Scalars['String']['output'];
  owner: AccountInfo;
  state: SchedulerJobState;
  triggers: Array<SnapshotStrategyTrigger>;
  triggersUuid: Array<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface SnapshotStrategyJob {
  createDate: Scalars['String']['output'];
  jobData: Scalars['String']['output'];
  lastOpDate: Scalars['String']['output'];
  name: Scalars['String']['output'];
  schedulerJobGroupUuids: Array<Scalars['String']['output']>;
  targetResourceUuid: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface SnapshotStrategyList {
  error?: Maybe<ActionError>;
  list: Array<SnapshotStrategy>;
  total: Scalars['Int']['output'];
}

export interface SnapshotStrategyTrigger {
  createDate: Scalars['String']['output'];
  cron: Scalars['String']['output'];
  lastOpDate: Scalars['String']['output'];
  name: Scalars['String']['output'];
  startTime: Scalars['String']['output'];
  stopTime?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export enum SnapshotType {
  Group = 'Group',
  Single = 'Single'
}

export interface SnmpAgent {
  authAlgorithm?: Maybe<Scalars['String']['output']>;
  authPassword?: Maybe<Scalars['String']['output']>;
  port?: Maybe<Scalars['Int']['output']>;
  privacyAlgorithm?: Maybe<Scalars['String']['output']>;
  privacyPassword?: Maybe<Scalars['String']['output']>;
  readCommunity?: Maybe<Scalars['String']['output']>;
  securityLevel?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  userName?: Maybe<Scalars['String']['output']>;
  /** 资源的UUID，唯一标示该资源 */
  uuid: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
}

export interface SnmpAgentActionResp {
  error?: Maybe<ActionError>;
  result?: Maybe<SnmpAgent>;
}

export interface SnmpTrapEndPoint extends BasicEndPoint {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<Owner>;
  platform?: Maybe<Platform>;
  platformUuid?: Maybe<Scalars['String']['output']>;
  state?: Maybe<EndPointState>;
  topic?: Maybe<SNSTopic>;
  type?: Maybe<EndPointType>;
  uuid: Scalars['String']['output'];
}

export interface SnmpTrapReceiver {
  createDate?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  snmpAddress?: Maybe<Scalars['String']['output']>;
  snmpPort?: Maybe<Scalars['Int']['output']>;
  /** 资源的UUID，唯一标示该资源 */
  uuid: Scalars['String']['output'];
}

export interface SnmpTrapReceiverList {
  error?: Maybe<ActionError>;
  list: Array<SnmpTrapReceiver>;
  total: Scalars['Int']['output'];
}

export enum SnmpTrapReceiverQueryType {
  Normal = 'Normal'
}

export enum SortDirectionValidValues {
  asc = 'asc',
  desc = 'desc'
}

export interface SpecialTree {
  children?: Maybe<Array<SpecialTree>>;
  extraAttrib?: Maybe<Array<Attribute>>;
  iconType?: Maybe<Scalars['String']['output']>;
  isLeaf?: Maybe<Scalars['Boolean']['output']>;
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  resourceType?: Maybe<Scalars['String']['output']>;
  resourceTypeVO?: Maybe<ResourceTypeVO>;
  state?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface SpecialTreeList {
  error?: Maybe<ActionError>;
  list: Array<SpecialTree>;
}

export interface SshKeyPair {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<SshKeyPairOwner>;
  publicKey?: Maybe<Scalars['String']['output']>;
  tag: Array<Tag>;
  uuid: Scalars['String']['output'];
  /** 挂载的云主机数量 */
  vmNum?: Maybe<Scalars['Float']['output']>;
}

export interface SshKeyPairList {
  error?: Maybe<ActionError>;
  list: Array<SshKeyPair>;
  total: Scalars['Int']['output'];
}

export interface SshKeyPairOwner {
  linkedAccountUuid?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
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

export interface StackTemplate {
  content?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  isSystemTemplate?: Maybe<Scalars['Boolean']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  md5sum?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<Owner>;
  shareType?: Maybe<ShareType>;
  state?: Maybe<Scalars['Boolean']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
}

export enum StackTemplateQueryType {
  Custom = 'Custom',
  Example = 'Example',
  Normal = 'Normal',
  Self = 'Self',
  Share = 'Share'
}

export interface StartBaremetalInstanceInput {
  action: ActionInput;
  payload: Array<StartBaremetalInstancePayload>;
}

export interface StartBaremetalInstancePayload {
  pxeBoot: Scalars['Boolean']['input'];
  uuid: Scalars['String']['input'];
}

export interface StartBaremetalPxeServerInput {
  action: ActionInput;
  payload: Array<StartBaremetalPxeServerPayload>;
}

export interface StartBaremetalPxeServerPayload {
  uuid: Scalars['String']['input'];
}

export interface StartSnmpAgentInput {
  action: ActionInput;
  payload: StartSnmpAgentPayload;
}

export interface StartSnmpAgentPayload {
  uuid: Scalars['String']['input'];
}

export interface StartVmInstanceFromHostInput {
  action: ActionInput;
  payload: StartVmInstanceFromHostPayload;
}

export interface StartVmInstanceFromHostPayload {
  hostUuid: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface StartVmInstanceInput {
  action: ActionInput;
  payload: Array<StartVmInstancePayload>;
}

export interface StartVmInstancePayload {
  uuid: Scalars['String']['input'];
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

export interface StaticIpInVm {
  ip: Scalars['String']['output'];
  l3NetworkUuid: Scalars['String']['output'];
}

export interface StopBaremetalInstanceInput {
  action: ActionInput;
  payload: Array<StopBaremetalInstancePayload>;
}

export interface StopBaremetalInstancePayload {
  uuid: Scalars['String']['input'];
}

export interface StopBaremetalPxeServerInput {
  action: ActionInput;
  payload: Array<StopBaremetalPxeServerPayload>;
}

export interface StopBaremetalPxeServerPayload {
  uuid: Scalars['String']['input'];
}

export interface StopSnmpAgentInput {
  action: ActionInput;
  payload: StopSnmpAgentPayload;
}

export interface StopSnmpAgentPayload {
  uuid?: InputMaybe<Scalars['String']['input']>;
}

export interface StopVmInstanceInput {
  action: ActionInput;
  payload: Array<StopVmInstancePayload>;
}

export interface StopVmInstancePayload {
  stopHA?: InputMaybe<Scalars['Boolean']['input']>;
  uuid: Scalars['String']['input'];
}

export interface StorageAdapter {
  device?: Maybe<Scalars['Int']['output']>;
  hostUuid: Scalars['String']['output'];
  identifier?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  speed?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  target?: Maybe<Scalars['Int']['output']>;
  transport?: Maybe<Array<Scalars['String']['output']>>;
  type: Scalars['String']['output'];
}

export interface StorageAdapterCountResponse {
  total: Scalars['Int']['output'];
}

export interface StorageAdapterResponse {
  /** 查询结果列表 */
  list?: Maybe<Array<StorageAdapter>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface StorageInfo {
  mdsList?: Maybe<Array<NodeInfo>>;
  monList?: Maybe<Array<NodeInfo>>;
  poolName?: Maybe<Scalars['String']['output']>;
  storageType?: Maybe<Scalars['String']['output']>;
}

export interface StorageMigratePayload {
  backupTaskLongJobUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  bandwidth?: InputMaybe<Scalars['Float']['input']>;
  dstHostUuid?: InputMaybe<Scalars['String']['input']>;
  dstPrimaryStorageUuid?: InputMaybe<Scalars['String']['input']>;
  strategy?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  vmInstanceUuid: Scalars['String']['input'];
  volumeMigrationAOs?: InputMaybe<Array<VolumeMigrationAOInput>>;
  withDataVolumes?: InputMaybe<Scalars['Boolean']['input']>;
  withSnapshots?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface StorageMigrateVmInstanceInput {
  action: ActionInput;
  payload: StorageMigratePayload;
}

export interface StorageMigrateVmInstancedepends {
  hasPeripheralAttached: Scalars['Boolean']['output'];
  hasUnavailableUsbDevice: Scalars['Boolean']['output'];
  isAttachedScsiLunDevice: Scalars['Boolean']['output'];
  uuid: Scalars['String']['output'];
}

export interface StoragePoolConfigPayload {
  /** 已经添加到主存储中的池子 */
  pools: Array<StoragePoolPayload>;
}

export interface StoragePoolPayload {
  aliasName?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
}

export interface SubscribeEventInput {
  action: ActionInput;
  payload: SubscribeEventPayload;
}

export interface SubscribeEventPayload {
  actions?: InputMaybe<Array<AlarmActionsInput>>;
  /** 报警等级 */
  emergencyLevel?: InputMaybe<Scalars['String']['input']>;
  /** 开启恢复通知 */
  enableRecovery?: InputMaybe<Scalars['Boolean']['input']>;
  eventName?: InputMaybe<Scalars['String']['input']>;
  /** 标签列表 */
  labels?: InputMaybe<Array<AlarmLabelsInput>>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** 名字空间 */
  namespace: Scalars['String']['input'];
  resourceUuid?: InputMaybe<Scalars['String']['input']>;
  zhName?: InputMaybe<Scalars['String']['input']>;
}

export interface Subscription {
  exportTaskUpdated: ExportTaskExportPayload;
  listenActionResp: ActionTaskResult;
  listenApiInspector: ApiInspector;
  listenAsyncQuery: AsyncQuery;
  listenTicket: ZWatchEvent;
  listenZWatch: ZWatchEvent;
  listenZWatchConvergence: ZWatchEvent;
}


export interface SubscriptionexportTaskUpdatedArgs {
  sessionId: Scalars['String']['input'];
}


export interface SubscriptionlistenActionRespArgs {
  sessionId: Scalars['String']['input'];
}


export interface SubscriptionlistenApiInspectorArgs {
  sessionId: Scalars['String']['input'];
}


export interface SubscriptionlistenAsyncQueryArgs {
  queryId: Scalars['String']['input'];
  queryName: Scalars['String']['input'];
  sessionId: Scalars['String']['input'];
}


export interface SubscriptionlistenTicketArgs {
  sessionId: Scalars['String']['input'];
}


export interface SubscriptionlistenZWatchArgs {
  sessionId: Scalars['String']['input'];
}


export interface SubscriptionlistenZWatchConvergenceArgs {
  sessionId: Scalars['String']['input'];
}

export interface SummaryUserInfo {
  accountNum?: Maybe<Scalars['Int']['output']>;
  normalUserNum?: Maybe<Scalars['Int']['output']>;
  platformAdminNum?: Maybe<Scalars['Int']['output']>;
  userNum?: Maybe<Scalars['Int']['output']>;
}

export interface SyncAccountsFromLdapServerInput {
  action: ActionInput;
  payload: SyncAccountsFromLdapServerPayload;
}

export interface SyncAccountsFromLdapServerPayload {
  uuid: Scalars['String']['input'];
}

export interface SyncBackupDataToLocalInput {
  action: ActionInput;
  payload: Array<SyncBackupDataToLocalPayload>;
}

export interface SyncBackupDataToLocalPayload {
  backupType?: InputMaybe<BackupResourceType>;
  /** 根云盘 UUID */
  groupUuid?: InputMaybe<Scalars['String']['input']>;
  /** 源镜像服务器 UUID */
  srcBackupStorageUuid: Scalars['String']['input'];
  /** 备份数据类型: Root | Data */
  type?: InputMaybe<Scalars['String']['input']>;
  /** 卷备份的UUID，和下面的groupUuid 2选1传过来 */
  uuid?: InputMaybe<Scalars['String']['input']>;
}

export interface SyncBackupDataToRemoteInput {
  action: ActionInput;
  payload: Array<SyncBackupFromImageStoreBackupStoragePayload>;
}

export interface SyncBackupFromImageStoreBackupStoragePayload {
  /** 根云盘 UUID */
  groupUuid?: InputMaybe<Scalars['String']['input']>;
  /** 源镜像服务器 UUID */
  srcBackupStorageUuid: Scalars['String']['input'];
  /** 备份数据类型: Root | Data */
  type?: InputMaybe<Scalars['String']['input']>;
  /** 卷备份的UUID，和下面的groupUuid 2选1传过来 */
  uuid?: InputMaybe<Scalars['String']['input']>;
}

export interface SyncDatabaseBackupToLocalInput {
  action: ActionInput;
  payload: Array<SyncDatabaseBackupToLocalPayload>;
}

export interface SyncDatabaseBackupToLocalPayload {
  /** 目标镜像服务器 UUID */
  dstBackupStorageUuid?: InputMaybe<Scalars['String']['input']>;
  /** 源镜像服务器 UUID */
  srcBackupStorageUuid?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface SyncDatabaseBackupToRemoteInput {
  action: ActionInput;
  payload: Array<SyncDatabaseBackupToRemotePayload>;
}

export interface SyncDatabaseBackupToRemotePayload {
  /** 源镜像服务器 UUID */
  srcBackupStorageUuid: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface SyncImageFromImageStoreBackupStorageInput {
  action: ActionInput;
  payload: Array<SyncImageFromImageStoreBackupStoragePayload>;
}

export interface SyncImageFromImageStoreBackupStoragePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  dstBackupStorageUuid: Scalars['String']['input'];
  name: Scalars['String']['input'];
  srcBackupStorageUuid: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface SyncImageSizeInput {
  action: ActionInput;
  payload: SyncImageSizePayload;
}

export interface SyncImageSizePayload {
  uuid: Scalars['String']['input'];
}

export interface SyncTimeServerInput {
  action: ActionInput;
  payload: Scalars['Any']['input'];
}

export interface SyncVolumeSizeInput {
  action: ActionInput;
  payload: Array<SyncVolumeSizePayload>;
}

export interface SyncVolumeSizePayload {
  uuid: Scalars['String']['input'];
}

export interface SystemSchedulingTask {
  apiId?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  executeTime?: Maybe<Scalars['Float']['output']>;
  jobData?: Maybe<Scalars['String']['output']>;
  jobName?: Maybe<Scalars['String']['output']>;
  jobResult?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  managementNodeUuid?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  progress?: Maybe<Scalars['Float']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  targetResourceUuid?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  vmInstance?: Maybe<VmInstance>;
  volume?: Maybe<Volume>;
}

export interface SystemSchedulingTaskResp {
  /** 查询结果列表 */
  list?: Maybe<Array<SystemSchedulingTask>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface SystemTag {
  createDate?: Maybe<Scalars['String']['output']>;
  inherent?: Maybe<Scalars['Boolean']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  resourceUuid?: Maybe<Scalars['String']['output']>;
  tag?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export enum SystemTagActionType {
  Create = 'Create',
  Delete = 'Delete',
  Update = 'Update'
}

export interface Tag {
  color?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  ordinal?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<TagOwner>;
  ownerUuid?: Maybe<Scalars['String']['output']>;
  resourceCount?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  value?: Maybe<Scalars['String']['output']>;
}

export interface TagOwner {
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface TagPattern {
  color?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
}

export interface TagQueryResp {
  list?: Maybe<Array<Tag>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export enum TagQueryType {
  GetTagWhenCreateResource = 'GetTagWhenCreateResource',
  NORMAL = 'NORMAL'
}

export interface TagRelatedSummary {
  baremetal2Instance?: Maybe<Scalars['Int']['output']>;
  baremetalInstance?: Maybe<Scalars['Int']['output']>;
  host?: Maybe<Scalars['Int']['output']>;
  monitorGroup?: Maybe<Scalars['Int']['output']>;
  monitorTemplate?: Maybe<Scalars['Int']['output']>;
  vm?: Maybe<Scalars['Int']['output']>;
  volume?: Maybe<Scalars['Int']['output']>;
}

export interface TakeoverPrimaryStorageInput {
  action: ActionInput;
  payload: TakeoverPrimaryStoragePayload;
}

export interface TakeoverPrimaryStoragePayload {
  dryRun?: InputMaybe<Scalars['Boolean']['input']>;
  primaryStorageUuid: Scalars['String']['input'];
}

export interface TaskError {
  code?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
}

export interface TaskOpaque {
  remain?: Maybe<Scalars['String']['output']>;
  remaining_migration_time?: Maybe<Scalars['String']['output']>;
  speed?: Maybe<Scalars['String']['output']>;
  total?: Maybe<Scalars['String']['output']>;
}

export interface TaskProgress {
  arguments?: Maybe<Scalars['String']['output']>;
  content?: Maybe<Scalars['String']['output']>;
  opaque?: Maybe<TaskOpaque>;
  parentUuid?: Maybe<Scalars['String']['output']>;
  taskName?: Maybe<Scalars['String']['output']>;
  taskUuid?: Maybe<Scalars['String']['output']>;
  time?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<Scalars['String']['output']>;
}

export interface TaskProgressList {
  list: Array<TaskProgress>;
  total?: Maybe<Scalars['Float']['output']>;
}

export enum TaskProgressQueryType {
  NORMAL = 'NORMAL'
}

export interface TaskResource {
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface TaskResult {
  resources?: Maybe<Array<TaskResource>>;
  taskName?: Maybe<Scalars['String']['output']>;
}

export enum TelemetryConsentAction {
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

export interface TelemetryConsentInventory {
  consentGrantedAt: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface TelemetrySettingInventory {
  descriptionKey: Scalars['String']['output'];
  privacyPolicyUrl: Scalars['String']['output'];
}

export interface TelemetryUpdateInventory {
  currentVersion?: Maybe<Scalars['String']['output']>;
  releaseNotesEn?: Maybe<Scalars['String']['output']>;
  releaseNotesZh?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
}

export interface TemplateConfig {
  category: Scalars['String']['output'];
  defaultValue: Scalars['String']['output'];
  globalConfig?: Maybe<GlobalConfig>;
  globalConfigTemplate?: Maybe<GlobalConfigTemplate>;
  name: Scalars['String']['output'];
  templateUuid: Scalars['String']['output'];
  uuid?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
}

export interface TemplateConfigList {
  error?: Maybe<ActionError>;
  list: Array<TemplateConfig>;
  total: Scalars['Int']['output'];
}

export interface TemplateEndPoint extends BasicEndPoint {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<Owner>;
  platformUuid?: Maybe<Scalars['String']['output']>;
  state?: Maybe<EndPointState>;
  topic?: Maybe<SNSTopic>;
  type?: Maybe<EndPointType>;
  uuid: Scalars['String']['output'];
}

export interface TemplateVmInstanceForVmNic {
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface TenantNetwork {
  bond_mode?: Maybe<Scalars['String']['output']>;
  end_ip?: Maybe<Scalars['String']['output']>;
  gateway?: Maybe<Scalars['String']['output']>;
  netmask?: Maybe<Scalars['String']['output']>;
  start_ip?: Maybe<Scalars['String']['output']>;
  vlan_id?: Maybe<Scalars['String']['output']>;
  xmit_hash_policy?: Maybe<Scalars['String']['output']>;
}

export interface TestConnectExternalPrimaryStorageInput {
  action: ActionInput;
  payload: TestConnectExternalPrimaryStoragePayload;
}

export interface TestConnectExternalPrimaryStoragePayload {
  /** 配置 */
  config?: InputMaybe<Scalars['String']['input']>;
  /** 存储标识（厂商名） */
  identity?: InputMaybe<Scalars['String']['input']>;
  /** 将配置信息拼接成一个 url, 比如：http://operator:password@203.0.113.5:80 */
  url: Scalars['String']['input'];
}

export interface TestConnectSNSEndPointInput {
  /** 是否指定所有人 */
  atAll?: InputMaybe<Scalars['Boolean']['input']>;
  /** 指定用户的id */
  atPersonUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  /** 具体的 endpoint 类型 */
  endpointType: EndPointType;
  /** 当前通知对象的 uuid */
  endpointUuid?: InputMaybe<Scalars['String']['input']>;
  /** 密钥, 填空字符串表示 安全设置为：无 */
  secret?: InputMaybe<Scalars['String']['input']>;
  /** 发送的测试消息 */
  testMsg?: Scalars['String']['input'];
  /** 地址 */
  url?: InputMaybe<Scalars['String']['input']>;
}

export interface TestConnectSNSEndPointOutput {
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
}

export interface TestConnectionInput {
  action: ActionInput;
  payload: TestConnectionPayload;
}

export interface TestConnectionPayload {
  hostName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  sshPort: Scalars['Int']['input'];
  username: Scalars['String']['input'];
}

export interface TestConnectionThirdPartyAuthInput {
  action: ActionInput;
  payload: TestConnectionThirdPartyAuthPayload;
}

export interface TestConnectionThirdPartyAuthPayload {
  base?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  encryption?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  ldapFilter?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  serverType?: InputMaybe<Scalars['String']['input']>;
  syncCreatedAccountStrategy?: InputMaybe<Scalars['String']['input']>;
  syncDeletedAccountStrategy?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  tagList?: InputMaybe<Array<Scalars['String']['input']>>;
  url?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  usernameProperty?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
}

export interface TestDatabaseBackupStorageConnectionInput {
  action: ActionInput;
  payload: TestDatabaseBackupStorageConnectionPayload;
}

export interface TestDatabaseBackupStorageConnectionPayload {
  url: Scalars['String']['input'];
}

export interface TestLogServerInput {
  action: ActionInput;
  payload: Array<TestLogServerPayload>;
}

export interface TestLogServerPayload {
  category: Scalars['String']['input'];
  configuration: Scalars['String']['input'];
  level: Scalars['String']['input'];
  name: Scalars['String']['input'];
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  type: Scalars['String']['input'];
}

export interface ThirdPartyAlarmSummary {
  emergent?: Maybe<Scalars['Int']['output']>;
  important?: Maybe<Scalars['Int']['output']>;
  normal?: Maybe<Scalars['Int']['output']>;
}

export interface ThirdPartyAlerts {
  alertLevel: EmergencyLevel;
  alertTime?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  dataSource?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  metric?: Maybe<Scalars['String']['output']>;
  product?: Maybe<Scalars['String']['output']>;
  readStatus?: Maybe<Scalars['String']['output']>;
  service?: Maybe<Scalars['String']['output']>;
  sourceText?: Maybe<Scalars['String']['output']>;
  thirdpartyPlatform?: Maybe<ThirdpartyPlatform>;
  thirdpartyPlatformUuid?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export enum ThirdPartyAlertsQueryType {
  AlarmRecord = 'AlarmRecord',
  EndpointRecord = 'EndpointRecord',
  Normal = 'Normal',
  ZCEX = 'ZCEX'
}

export interface ThirdPartyAuthOrgSyncConfig {
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  strategy?: Maybe<Scalars['String']['output']>;
}

export interface ThirdPartyAuthResourceConfig {
  autoSync?: Maybe<Scalars['String']['output']>;
  autoSyncUuid?: Maybe<Scalars['String']['output']>;
  syncInterval?: Maybe<Scalars['String']['output']>;
  syncIntervalUuid?: Maybe<Scalars['String']['output']>;
}

export interface ThirdPartyAuthResourceref {
  orgCount?: Maybe<Scalars['Int']['output']>;
  userCount?: Maybe<Scalars['Int']['output']>;
}

export interface ThirdPartyAuthResp {
  list: Array<ThirdPartyAuthVO>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface ThirdPartyAuthSystemTag {
  ldapAllowListFilter?: Maybe<Scalars['String']['output']>;
  ldapAllowListFilterUuid?: Maybe<Scalars['String']['output']>;
  ldapCleanBindingFilter?: Maybe<Scalars['String']['output']>;
  ldapCleanBindingFilterUuid?: Maybe<Scalars['String']['output']>;
  ldapServerType?: Maybe<Scalars['String']['output']>;
  ldapServerTypeUuid?: Maybe<Scalars['String']['output']>;
  ldapUrlsUuid?: Maybe<Scalars['String']['output']>;
  ldapUseAsLoginName?: Maybe<Scalars['String']['output']>;
  ldapUseAsLoginNameUuid?: Maybe<Scalars['String']['output']>;
  organizationSyncConfiguration?: Maybe<ThirdPartyAuthOrgSyncConfig>;
  organizationSyncConfigurationUuid?: Maybe<Scalars['String']['output']>;
  standbyServerIP?: Maybe<Scalars['String']['output']>;
  standbyServerPort?: Maybe<Scalars['String']['output']>;
  userDefinedSyncConifgProps?: Maybe<Array<ThirdPartyAuthUserDefinedSyncConifg>>;
  virtualIDSyncConfiguration?: Maybe<ThirdPartyAuthVirtualIDSyncConfig>;
  virtualIDSyncConfigurationUuid?: Maybe<Scalars['String']['output']>;
}

export interface ThirdPartyAuthUserDefinedSyncConifg {
  key?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
}

export interface ThirdPartyAuthVO {
  base?: Maybe<Scalars['String']['output']>;
  bindResourceref?: Maybe<ThirdPartyAuthResourceref>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  encryption?: Maybe<Scalars['String']['output']>;
  filter?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  relatedSystemTag?: Maybe<ThirdPartyAuthSystemTag>;
  resourceConfig?: Maybe<ThirdPartyAuthResourceConfig>;
  serverType?: Maybe<LdapServerType>;
  systemTags?: Maybe<Array<Scalars['String']['output']>>;
  url?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
  usernameProperty?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface ThirdPartyAuthVirtualIDSyncConfig {
  description?: Maybe<Scalars['String']['output']>;
  fullname?: Maybe<Scalars['String']['output']>;
  identifier?: Maybe<Scalars['String']['output']>;
  mail?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
}

export interface ThirdpartyPlatform {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  lastSyncDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<Owners>;
  state?: Maybe<Scalars['String']['output']>;
  template?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface ThirdpartyPlatformQueryResp {
  list?: Maybe<Array<ThirdpartyPlatform>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface Thresholds {
  operator?: Maybe<Scalars['String']['output']>;
  thresholdName?: Maybe<Scalars['String']['output']>;
  thresholdValue?: Maybe<Scalars['String']['output']>;
}

export interface ThresholdsInput {
  operator?: InputMaybe<Scalars['String']['input']>;
  thresholdName?: InputMaybe<Scalars['String']['input']>;
  thresholdValue?: InputMaybe<Scalars['String']['input']>;
}

export interface TimeServerNode {
  /** 时间源地址 */
  hostname: Scalars['String']['output'];
  id: Scalars['String']['output'];
  /** 连接状态 */
  status?: Maybe<TimeServerStatus>;
}

export interface TimeServerReachable {
  /** 时间源地址 */
  hostname: Scalars['String']['output'];
  /** 是否可达 */
  reachable: Scalars['Boolean']['output'];
}

export interface TimeServerReachableResult {
  /** 时间源集合 */
  servers: Array<TimeServerReachable>;
}

export interface TimeServerRelation {
  /** 外部时间源id */
  source: Scalars['String']['output'];
  /** 内部时间源id */
  target: Scalars['String']['output'];
}

export interface TimeServerResult {
  /** 时间源关系 */
  relations?: Maybe<Array<TimeServerRelation>>;
  /** 时间源集合 */
  servers: TimeServers;
}

export enum TimeServerStatus {
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  Unknown = 'Unknown'
}

export interface TimeServers {
  /** 外部时间源 */
  external?: Maybe<Array<TimeServerNode>>;
  /** 内部时间源 */
  internal?: Maybe<Array<TimeServerNode>>;
}

export interface TpmDeviceConfig {
  enable?: InputMaybe<Scalars['Boolean']['input']>;
  keyProviderUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface TpmInventory {
  createDate?: Maybe<Scalars['String']['output']>;
  hostRefs?: Maybe<Array<Scalars['String']['output']>>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
}

export enum TransportType {
  FC = 'FC',
  RDMA = 'RDMA',
  TCP = 'TCP'
}

export interface TrapParam {
  name: Scalars['String']['input'];
  snmpAddress: Scalars['String']['input'];
  snmpPort: Scalars['Int']['input'];
}

export interface Trash {
  createDate?: Maybe<Scalars['String']['output']>;
  installPath?: Maybe<Scalars['String']['output']>;
  resourceUuid?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
  /** BackupStorageVO | PrimaryStorageVO */
  storageType?: Maybe<Scalars['String']['output']>;
  trashId: Scalars['Int']['output'];
  trashType?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['Int']['output'];
}

export interface TrashOnPrimaryStorage {
  resourceType: Scalars['String']['output'];
  resourceUuid: Scalars['String']['output'];
  trashType?: Maybe<TrashType>;
}

export interface TrashOnPrimaryStorageResp {
  list: Array<TrashOnPrimaryStorage>;
}

export enum TrashQueryType {
  BackupStorage = 'BackupStorage',
  PrimaryStorage = 'PrimaryStorage'
}

export interface TrashResp {
  /** 查询结果列表 */
  list?: Maybe<Array<Trash>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum TrashType {
  MigrateImage = 'MigrateImage',
  MigrateVolume = 'MigrateVolume',
  MigrateVolumeSnapshot = 'MigrateVolumeSnapshot',
  ReimageVolume = 'ReimageVolume',
  RevertVolume = 'RevertVolume',
  VolumeSnapshot = 'VolumeSnapshot'
}

export interface TrustKmsProviderInput {
  action: ActionInput;
  payload: TrustKmsProviderPayload;
}

export interface TrustKmsProviderPayload {
  serverCertPem: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
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

export interface UIEnvInfo {
  isOpenPlatform: Scalars['Boolean']['output'];
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

export interface UIPrivilegeResult {
  uiPrivileges: Array<Array<Scalars['String']['output']>>;
}

export enum UKeyStatus {
  Abnormal = 'Abnormal',
  Fault = 'Fault',
  Missing = 'Missing',
  Ready = 'Ready'
}

export interface UnGenerateMdevDeviceInput {
  action: ActionInput;
  payload: UnGenerateMdevDevicePayload;
}

export interface UnGenerateMdevDevicePayload {
  pciDeviceUuid: Scalars['String']['input'];
}

export interface UnGenerateSriovPciDeviceInput {
  action: ActionInput;
  payload: UnGenerateSriovPciDevicePayload;
}

export interface UnGenerateSriovPciDevicePayload {
  pciDeviceUuid: Scalars['String']['input'];
}

export interface UnsubscribeEventInput {
  action: ActionInput;
  payload: Array<UnsubscribeEventPayload>;
}

export interface UnsubscribeEventPayload {
  uuid: Scalars['String']['input'];
}

export interface UpdateAccessControlRuleInput {
  action: ActionInput;
  payload: UpdateAccessControlRulePayload;
}

export interface UpdateAccessControlRulePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  rule?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateAccountConfigInput {
  action: ActionInput;
  payload: Array<UpdateAccountConfigPayload>;
}

export interface UpdateAccountConfigPayload {
  addResourceUuids?: InputMaybe<Array<Array<Scalars['String']['input']>>>;
  addRoleUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  addUserGroupUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  removeResourceUuids?: InputMaybe<Array<Array<Scalars['String']['input']>>>;
  removeRoleUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  removeUserGroupUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export interface UpdateAccountInput {
  action: ActionInput;
  payload: Array<UpdateAccountPayload>;
}

export interface UpdateAccountPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  oldPassword?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<State>;
  uuid: Scalars['String']['input'];
}

export interface UpdateAccountQuotaInput {
  action: ActionInput;
  payload: Array<UpdateAccountQuotaPayload>;
}

export interface UpdateAccountQuotaPayload {
  identityUuid: Scalars['String']['input'];
  name: Scalars['String']['input'];
  value: Scalars['Float']['input'];
}

export interface UpdateAccountThirdPartyAuthInput {
  action: ActionInput;
  payload: UpdateAccountThirdPartyAuthPayload;
}

export interface UpdateAccountThirdPartyAuthPayload {
  authorizationUrl?: InputMaybe<Scalars['String']['input']>;
  clientId?: InputMaybe<Scalars['String']['input']>;
  clientSecret?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  logoutUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  tokenUrl?: InputMaybe<Scalars['String']['input']>;
  userinfoUrl?: InputMaybe<Scalars['String']['input']>;
  usernameProperty?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateAlarmDataInput {
  payload: Array<UpdateAlarmDataPayload>;
}

export interface UpdateAlarmDataPayload {
  dataUuid: Scalars['String']['input'];
  readStatus?: InputMaybe<Scalars['String']['input']>;
  updateMode?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateAlarmDataResp {
  success?: Maybe<Scalars['Boolean']['output']>;
}

export interface UpdateAlarmInput {
  action: ActionInput;
  payload: Array<UpdateAlarmPayload>;
}

export interface UpdateAlarmLabelInput {
  action: ActionInput;
  payload: Array<UpdateAlarmLabelPayload>;
}

export interface UpdateAlarmLabelPayload {
  key: Scalars['String']['input'];
  operator: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
  value: Scalars['String']['input'];
}

export interface UpdateAlarmPayload {
  actions?: InputMaybe<Array<ZwatchAlarmActionsInput>>;
  /** 阈值比较符 */
  comparisonOperator?: InputMaybe<ComparisonOperator>;
  description?: InputMaybe<Scalars['String']['input']>;
  /** 报警等级 */
  emergencyLevel?: InputMaybe<Scalars['String']['input']>;
  /** 开启恢复通知 */
  enableRecovery?: InputMaybe<Scalars['Boolean']['input']>;
  labels?: InputMaybe<Array<UpdateAlarmLabelPayload>>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** 持续时间 */
  period?: InputMaybe<Scalars['Float']['input']>;
  removeActionFromAlarmPayload?: InputMaybe<Array<RemoveActionFromAlarmPayload>>;
  /** 报警重复次数 */
  repeatCount?: InputMaybe<Scalars['Float']['input']>;
  /** 冷却时间 */
  repeatInterval?: InputMaybe<Scalars['Float']['input']>;
  /** 阈值 */
  threshold?: InputMaybe<Scalars['Float']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateAlertDataAckInput {
  action: ActionInput;
  payload: Array<UpdateAlertDataAckPayload>;
}

export interface UpdateAlertDataAckPayload {
  dataUuid: Scalars['String']['input'];
  resumeAlert?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface UpdateAliyunEbsBackupStorageInput {
  action: ActionInput;
  payload: UpdateAliyunEbsBackupStoragePayload;
}

export interface UpdateAliyunEbsBackupStoragePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export interface UpdateAliyunSmsSNSTextTemplateInput {
  action: ActionInput;
  payload: UpdateAliyunSmsSNSTextTemplatePayload;
}

export interface UpdateAliyunSmsSNSTextTemplatePayload {
  alarmTemplateCode?: InputMaybe<Scalars['String']['input']>;
  defaultTemplate?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  eventTemplate?: InputMaybe<Scalars['String']['input']>;
  eventTemplateCode?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  recoverySubject?: InputMaybe<Scalars['String']['input']>;
  recoveryTemplate?: InputMaybe<Scalars['String']['input']>;
  sign?: InputMaybe<Scalars['String']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  template?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateAllAlarmHistoriesAsReadInput {
  action: ActionInput;
  payload?: InputMaybe<UpdateAllAlarmHistoriesAsReadPayload>;
}

export interface UpdateAllAlarmHistoriesAsReadPayload {
  readStatus?: InputMaybe<Scalars['String']['input']>;
  updateMode?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateBSSystemTagInput {
  action: ActionInput;
  payload: UpdateBSSystemTagPayload;
}

export interface UpdateBSSystemTagPayload {
  oldTag: Scalars['String']['input'];
  resourceUuid: Scalars['String']['input'];
  tag: Scalars['String']['input'];
}

export interface UpdateBaremetalChassisInput {
  action: ActionInput;
  payload: Array<UpdateBaremetalChassisPayload>;
}

export interface UpdateBaremetalChassisPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  ipmiAddress?: InputMaybe<Scalars['String']['input']>;
  ipmiPassword?: InputMaybe<Scalars['String']['input']>;
  ipmiPort?: InputMaybe<Scalars['Int']['input']>;
  ipmiUsername?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  powerStatus?: InputMaybe<BaremetalChassisPowerStatusType>;
  stateEvent?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateBaremetalInstanceInput {
  action: ActionInput;
  payload: Array<UpdateBaremetalInstancePayload>;
}

export interface UpdateBaremetalInstancePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateBaremetalPxeServerInput {
  action: ActionInput;
  payload: Array<UpdateBaremetalPxeServerPayload>;
}

export interface UpdateBaremetalPxeServerPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface UpdateCbdMdsInput {
  action: ActionInput;
  payload: Array<UpdateCbdMdsPayload>;
}

export interface UpdateCbdMdsPayload {
  /** 要修改的MDS节点IP地址 */
  addr: Scalars['String']['input'];
  /** 密码 */
  password?: InputMaybe<Scalars['String']['input']>;
  /** SSH端口 */
  port?: InputMaybe<Scalars['Int']['input']>;
  /** 用户名 */
  username?: InputMaybe<Scalars['String']['input']>;
  /** 主存储UUID */
  uuid: Scalars['String']['input'];
}

export interface UpdateCephBackupStorageInput {
  action: ActionInput;
  payload: UpdateCephBackupStoragePayload;
}

export interface UpdateCephBackupStorageMon {
  hostname?: InputMaybe<Scalars['String']['input']>;
  monUuid?: InputMaybe<Scalars['String']['input']>;
  sshPassword?: InputMaybe<Scalars['String']['input']>;
  sshPort?: InputMaybe<Scalars['Int']['input']>;
  sshUsername?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateCephBackupStoragePayload {
  blobDownloadConcurrency?: InputMaybe<Scalars['String']['input']>;
  blobUploadConcurrency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  mons?: InputMaybe<Array<UpdateCephBackupStorageMon>>;
  name?: InputMaybe<Scalars['String']['input']>;
  preMons?: InputMaybe<Array<UpdateCephBackupStorageMon>>;
  preSystemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  reservedCapacity?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export interface UpdateCephMonInput {
  action: ActionInput;
  payload: UpdateCephMonPayload;
}

export interface UpdateCephMonPayload {
  monPort?: InputMaybe<Scalars['Int']['input']>;
  monUuid: Scalars['String']['input'];
  sshPassword?: InputMaybe<Scalars['String']['input']>;
  sshPort?: InputMaybe<Scalars['Int']['input']>;
  sshUsername?: InputMaybe<Scalars['String']['input']>;
  type: CephMonType;
}

export interface UpdateCephPrimaryStoragePoolInput {
  action: ActionInput;
  payload: UpdateCephPrimaryStoragePoolPayload;
}

export interface UpdateCephPrimaryStoragePoolPayload {
  aliasName?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateCephTokenInput {
  action: ActionInput;
  payload: UpdateCephTokenPayload;
}

export interface UpdateCephTokenPayload {
  token: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface UpdateClusterDRSInput {
  action: ActionInput;
  payload: UpdateClusterDRSPayload;
}

export interface UpdateClusterDRSPayload {
  automationLevel: Scalars['String']['input'];
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  defaultEnable?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  resourceConfigList?: InputMaybe<Array<ClusterResourceConfig>>;
  thresholdDuration: Scalars['Int']['input'];
  thresholds: Array<ThresholdsInput>;
  uuid: Scalars['String']['input'];
}

export interface UpdateClusterDRSStateInput {
  action: ActionInput;
  payload: UpdateClusterDRSStatePayload;
}

export interface UpdateClusterDRSStatePayload {
  state: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface UpdateClusterInput {
  action: ActionInput;
  payload: UpdateClusterPayload;
}

export interface UpdateClusterPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface UpdateConsoleProxyInput {
  action: ActionInput;
  payload: Array<UpdateConsoleProxyPayload>;
}

export interface UpdateConsoleProxyPayload {
  consoleProxyOverriddenIp: Scalars['String']['input'];
  consoleProxyPort: Scalars['Int']['input'];
  uuid: Scalars['String']['input'];
}

export interface UpdateCustomColumnsInput {
  action: ActionInput;
  payload: UpdateCustomColumnsPayload;
}

export interface UpdateCustomColumnsPayload {
  columnKeys: Array<Scalars['String']['input']>;
  path: Scalars['String']['input'];
}

export interface UpdateDingTalkMsgInput {
  action: ActionInput;
  payload: UpdateDingTalkMsgPayload;
}

export interface UpdateDingTalkMsgPayload {
  /**
   * 提示群成员：@所有人 / @指定人 / 无
   *                   true => @所有人，
   *                   false => @指定人或者无，
   *                   当 atPersonList 为空时，则为无，否则为@指定人
   */
  atAll?: InputMaybe<Scalars['Boolean']['input']>;
  /** 即将被添加的@人员 */
  atPersonList?: InputMaybe<Array<AtPersonInput>>;
  /** 修改后的密钥 */
  secret?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  /** 当前通知对象的 uuid */
  uuid: Scalars['String']['input'];
}

export interface UpdateEmailAddressToEndpointInput {
  action: ActionInput;
  payload: Array<UpdateEmailAddressToEndpointPayload>;
}

export interface UpdateEmailAddressToEndpointPayload {
  emailAddress: Scalars['String']['input'];
  emailAddressUuid: Scalars['String']['input'];
  endpointUuid: Scalars['String']['input'];
}

export interface UpdateEndpointAllInput {
  action: ActionInput;
  payload: UpdateEndpointAllPayload;
}

export interface UpdateEndpointAllPayload {
  modifyDingTalkAtPersonPayload?: InputMaybe<ModifyAtPersonPayload>;
  modifyEmailAddressOfEndpointPayload?: InputMaybe<ModifyEmailAddressOfEndpointPayload>;
  modifyFeishuAtPersonPayload?: InputMaybe<ModifyAtPersonPayload>;
  modifySmsAtPersonPayload?: InputMaybe<ModifyAtPersonPayload>;
  modifyWecomAtPersonPayload?: InputMaybe<ModifyAtPersonPayload>;
  updateEndpointPayload?: InputMaybe<UpdateEndpointPayload>;
}

export interface UpdateEndpointInput {
  action: ActionInput;
  payload: UpdateEndpointPayload;
}

export interface UpdateEndpointPayload {
  /**
   * 提示群成员：@所有人 / @指定人 / 无
   *                   true => @所有人，
   *                   false => @指定人或者无，
   *                   当 atPersonList 为空时，则为无，否则为@指定人
   */
  atAll?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  platformUuid?: InputMaybe<Scalars['String']['input']>;
  secret?: InputMaybe<Scalars['String']['input']>;
  topicUuid?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateEventDataInput {
  payload: Array<UpdateEventDataPayload>;
}

export interface UpdateEventDataPayload {
  dataUuid: Scalars['String']['input'];
  readStatus?: InputMaybe<Scalars['String']['input']>;
  updateMode?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateEventDataResp {
  success?: Maybe<Scalars['Boolean']['output']>;
}

export interface UpdateExternalPrimaryStoragePoolInput {
  action: ActionInput;
  payload: ActionExternalPrimaryStoragePoolPayload;
}

export interface UpdateFeiShuMsgInput {
  action: ActionInput;
  payload: UpdateFeiShuMsgPayload;
}

export interface UpdateFeiShuMsgPayload {
  /**
   * 提示群成员：@所有人 / @指定人 / 无
   *                   true => @所有人，
   *                   false => @指定人或者无，
   *                   当 atPersonList 为空时，则为无，否则为@指定人
   */
  atAll?: InputMaybe<Scalars['Boolean']['input']>;
  /** 即将被添加的@人员 */
  atPersonList?: InputMaybe<Array<AtPersonInput>>;
  /** 修改后的密钥 */
  secret?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  /** 当前通知对象的 uuid */
  uuid: Scalars['String']['input'];
}

export interface UpdateGlobalConfigInput {
  action: ActionInput;
  payload: Array<UpdateGlobalConfigPayload>;
}

export interface UpdateGlobalConfigPayload {
  category?: Scalars['String']['input'];
  name: Scalars['String']['input'];
  value: Scalars['String']['input'];
}

export interface UpdateGroupInput {
  action: ActionInput;
  payload: Array<UpdateGroupPayload>;
}

export interface UpdateGroupPayload {
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateHostGroupInput {
  action: ActionInput;
  payload: UpdateHostGroupPayload;
}

export interface UpdateHostGroupPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateHostIPMIInput {
  action: ActionInput;
  payload: Array<UpdateHostIPMIPayload>;
}

export interface UpdateHostIPMIPayload {
  ipmiAddress?: InputMaybe<Scalars['String']['input']>;
  ipmiPassword?: InputMaybe<Scalars['String']['input']>;
  ipmiPort?: InputMaybe<Scalars['Int']['input']>;
  ipmiUsername?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateHostIdentifierInput {
  action: ActionInput;
  payload: UpdateHostIdentifierPayload;
}

export interface UpdateHostIdentifierPayload {
  identifier: Scalars['String']['input'];
  type: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface UpdateHostInput {
  action: ActionInput;
  payload: UpdateHostPayload;
}

export interface UpdateHostKernelInterfaceInput {
  action: ActionInput;
  payload: UpdateHostKernelInterfacePayload;
}

export interface UpdateHostKernelInterfacePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  netmask?: InputMaybe<Scalars['String']['input']>;
  requiredIp?: InputMaybe<Scalars['String']['input']>;
  trafficTypes?: InputMaybe<Array<KernelTrafficTypes>>;
  uuid: Scalars['String']['input'];
}

export interface UpdateHostNetworkInterfaceInput {
  action: ActionInput;
  payload: Array<UpdateHostNetworkInterfacePayload>;
}

export interface UpdateHostNetworkInterfaceLLDPModeInput {
  action: ActionInput;
  payload: InterfaceLLDPModePayload;
}

export interface UpdateHostNetworkInterfacePayload {
  description: Scalars['String']['input'];
  interfaceUuid: Scalars['String']['input'];
}

export interface UpdateHostPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export enum UpdateHostPowerStatus {
  PowerOff = 'PowerOff',
  PowerOn = 'PowerOn',
  PowerReboot = 'PowerReboot'
}

export interface UpdateHostPowerStatusInput {
  action: ActionInput;
  payload: Array<UpdateHostPowerStatusPayload>;
}

export interface UpdateHostPowerStatusPayload {
  enteringMaintenanceMode?: InputMaybe<Scalars['Boolean']['input']>;
  isManagementNode?: InputMaybe<Scalars['Boolean']['input']>;
  state?: InputMaybe<HostState>;
  stopHost?: InputMaybe<Scalars['Boolean']['input']>;
  updateHostPowerStatus: UpdateHostPowerStatus;
  uuid: Scalars['String']['input'];
}

export interface UpdateImageInput {
  action: ActionInput;
  payload: Array<UpdateImagePayload>;
}

export interface UpdateImagePayload {
  architecture?: InputMaybe<CpuArchitecture>;
  bootMode?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  format?: InputMaybe<Scalars['String']['input']>;
  guestOsType?: InputMaybe<Scalars['String']['input']>;
  mediaType?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  platform?: InputMaybe<ImagePlatform>;
  uuid: Scalars['String']['input'];
  virtio?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface UpdateImageStoreBackupStorageInput {
  action: ActionInput;
  payload: UpdateImageStoreBackupStoragePayload;
}

export interface UpdateImageStoreBackupStoragePayload {
  blobDownloadConcurrency?: InputMaybe<Scalars['String']['input']>;
  blobUploadConcurrency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  hostname?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  preSystemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  reservedCapacity?: InputMaybe<Scalars['String']['input']>;
  sshPort?: InputMaybe<Scalars['Int']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  username?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateIscsiServerInput {
  action: ActionInput;
  payload: Array<UpdateIscsiServerPayload>;
}

export interface UpdateIscsiServerPayload {
  /** CHAP用户名 */
  chapUserName?: InputMaybe<Scalars['String']['input']>;
  /** CHAP密码 */
  chapUserPassword?: InputMaybe<Scalars['String']['input']>;
  /** 启用状态 */
  name?: InputMaybe<Scalars['String']['input']>;
  /** 资源名称 */
  state?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateKVMHostInput {
  action: ActionInput;
  payload: UpdateKVMHostPayload;
}

export interface UpdateKVMHostPayload {
  managementIp?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  sshPort?: InputMaybe<Scalars['Int']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateKmsParam {
  description?: InputMaybe<Scalars['String']['input']>;
  endpoint?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  port?: InputMaybe<Scalars['Int']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateKmsProviderInput {
  action: ActionInput;
  payload: UpdateKmsProviderPayload;
}

export interface UpdateKmsProviderPayload {
  updateKmsParam?: InputMaybe<UpdateKmsParam>;
  updateNkpParam?: InputMaybe<UpdateNkpParam>;
  uuid: Scalars['String']['input'];
}

export interface UpdateL2NetworkActionInput {
  action: ActionInput;
  payload: UpdateL2NetworkInput;
}

export interface UpdateL2NetworkInput {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export interface UpdateL3NetworkInput {
  action: ActionInput;
  payload: UpdateL3NetworkPayload;
}

export interface UpdateL3NetworkPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateLogServerInput {
  action: ActionInput;
  payload: UpdateLogServerPayload;
}

export interface UpdateLogServerPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface UpdateMonitorGroupInput {
  action: ActionInput;
  payload: UpdateMonitorGroupPayload;
}

export interface UpdateMonitorGroupPayload {
  actions?: InputMaybe<Array<GroupActionsInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateNkpParam {
  description?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateNvmeServerInput {
  action: ActionInput;
  payload: Array<UpdateNvmeServerPayload>;
}

export interface UpdateNvmeServerPayload {
  /** 启用状态 */
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdatePSSystemTagInput {
  action: ActionInput;
  payload: UpdatePSSystemTagPayload;
}

export interface UpdatePSSystemTagPayload {
  oldTag: Scalars['String']['input'];
  resourceUuid: Scalars['String']['input'];
  tag: Scalars['String']['input'];
}

export interface UpdatePciDeviceInput {
  action: ActionInput;
  payload: Array<UpdatePciDevicePayload>;
}

export interface UpdatePciDevicePayload {
  passThroughState?: InputMaybe<PciDevicePassThroughState>;
  state?: InputMaybe<PciDeviceState>;
  uuid: Scalars['String']['input'];
}

export interface UpdatePersonalizationConfigInput {
  action: ActionInput;
  payload: UpdatePersonalizationConfigPayload;
}

export interface UpdatePersonalizationConfigPayload {
  /** 配置类型 */
  profileType: ProfileType;
  /** 资源类型 */
  resourceType: Scalars['String']['input'];
  value: Scalars['String']['input'];
}

export interface UpdatePreconfigurationTemplateInput {
  action: ActionInput;
  payload: Array<UpdatePreconfigurationTemplatePayload>;
}

export interface UpdatePreconfigurationTemplatePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdatePrimaryStorageCephxInput {
  action: ActionInput;
  payload: UpdatePrimaryStorageCephxPayload;
}

export interface UpdatePrimaryStorageCephxPayload {
  cephx: Scalars['Boolean']['input'];
  cephxReconnect?: InputMaybe<Scalars['Boolean']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdatePrimaryStorageInput {
  action: ActionInput;
  payload: UpdatePrimaryStoragePayload;
}

export interface UpdatePrimaryStoragePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export interface UpdatePrimaryStorageThinProvisionInput {
  action: ActionInput;
  payload: UpdatePrimaryStorageThinProvisionPayload;
}

export interface UpdatePrimaryStorageThinProvisionPayload {
  provisionUuid?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
  value: Scalars['String']['input'];
}

export interface UpdateResourceAttributeKeyInput {
  action: ActionInput;
  payload: UpdateResourceAttributeKeyPayload;
}

export interface UpdateResourceAttributeKeyPayload {
  createConstraints?: InputMaybe<Array<CreateResourceAttributeConstraintPayload>>;
  deleteConstraintIds?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  resourceTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export interface UpdateResourceBackupJobStrategyInput {
  action: ActionInput;
  payload: Array<UpdateResourceBackupJobStrategyPayload>;
}

export interface UpdateResourceBackupJobStrategyPayload {
  fullTrigger?: InputMaybe<UpdateSchedulerTrigger>;
  incrementalTriggers?: Array<UpdateSchedulerTrigger>;
  parameters?: InputMaybe<Parameters>;
  uuid: Scalars['String']['input'];
}

export interface UpdateResourceConfigInput {
  action: ActionInput;
  payload: Array<UpdateResourceConfigPayload>;
}

export interface UpdateResourceConfigPayload {
  category: Scalars['String']['input'];
  name: Scalars['String']['input'];
  resourceUuid: Scalars['String']['input'];
  uuid?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['String']['input'];
}

export interface UpdateResourceConfigsInput {
  action: ActionInput;
  payload: Array<UpdateResourceConfigsPayload>;
}

export interface UpdateResourceConfigsPayload {
  resourceConfigs: Array<IResourceConfigs>;
  resourceUuid: Scalars['String']['input'];
}

export interface UpdateResourceSharingGroupInput {
  action: ActionInput;
  payload: UpdateResourceSharingGroupPayload;
}

export interface UpdateResourceSharingGroupPayload {
  accountUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  permission?: InputMaybe<Scalars['String']['input']>;
  resourceUuids: Array<Scalars['String']['input']>;
}

export interface UpdateRoleApiConfigInput {
  action: ActionInput;
  payload: UpdateRoleApiConfigPayload;
}

export interface UpdateRoleApiConfigPayload {
  createPolicies?: InputMaybe<Array<Scalars['String']['input']>>;
  deletePolicies?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export interface UpdateRoleConfigInput {
  action: ActionInput;
  payload: UpdateRoleConfigPayload;
}

export interface UpdateRoleConfigPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uiPrivilege?: InputMaybe<Array<ZsvRoleUIPrivilegeInput>>;
  uuid: Scalars['String']['input'];
}

export interface UpdateSNSDingTalkAtPersonInput {
  action: ActionInput;
  payload: Array<UpdateSNSDingTalkAtPersonPayload>;
}

export interface UpdateSNSDingTalkAtPersonPayload {
  endpointUuid: Scalars['String']['input'];
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  remark?: InputMaybe<Scalars['String']['input']>;
  /** 当前修改人员的 uuid */
  uuid: Scalars['String']['input'];
}

export interface UpdateSNSEmailPlatformInput {
  action: ActionInput;
  payload: Array<UpdateSNSEmailPlatformPayload>;
}

export interface UpdateSNSEmailPlatformPayload {
  accessKeyId?: InputMaybe<Scalars['String']['input']>;
  accessKeySecret?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  requestIp?: InputMaybe<Scalars['String']['input']>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  userTags?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export interface UpdateSNSFeiShuAtPersonInput {
  action: ActionInput;
  payload: Array<UpdateSNSFeiShuAtPersonPayload>;
}

export interface UpdateSNSFeiShuAtPersonPayload {
  endpointUuid: Scalars['String']['input'];
  remark?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
  /** 当前修改人员的 uuid */
  uuid: Scalars['String']['input'];
}

export interface UpdateSNSTextTemplateInput {
  action: ActionInput;
  payload: UpdateSNSTextTemplatePayload;
}

export interface UpdateSNSTextTemplatePayload {
  defaultTemplate?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  recoverySubject?: InputMaybe<Scalars['String']['input']>;
  recoveryTemplate?: InputMaybe<Scalars['String']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  template?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateSNSWeComAtPersonInput {
  action: ActionInput;
  payload: Array<UpdateSNSWeComAtPersonPayload>;
}

export interface UpdateSNSWeComAtPersonPayload {
  endpointUuid: Scalars['String']['input'];
  remark?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
  /** 当前修改人员的 uuid */
  uuid: Scalars['String']['input'];
}

export interface UpdateSchedulerJobGroupInput {
  action: ActionInput;
  payload: Array<UpdateSchedulerJobGroupPayload>;
}

export interface UpdateSchedulerJobGroupPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parameters?: InputMaybe<Parameters>;
  priorities?: InputMaybe<Array<Priority>>;
  targetResourceUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export interface UpdateSchedulerTrigger {
  cron?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  repeatCount?: InputMaybe<Scalars['Float']['input']>;
  schedulerInterval?: InputMaybe<Scalars['Float']['input']>;
  schedulerType: SchedulerType;
  startTime?: InputMaybe<Scalars['Float']['input']>;
}

export interface UpdateScriptInput {
  action: ActionInput;
  payload: Array<UpdateScriptPayload>;
}

export interface UpdateScriptPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  /** 需要和scriptContent一起传参 */
  encodingType?: InputMaybe<ScriptEncodingType>;
  name?: InputMaybe<Scalars['String']['input']>;
  renderParams?: InputMaybe<Scalars['String']['input']>;
  scriptContent?: InputMaybe<Scalars['String']['input']>;
  scriptTimeout?: InputMaybe<Scalars['Float']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateSecurityGroupInput {
  action: ActionInput;
  payload: Array<UpdateSecurityGroupPayload>;
}

export interface UpdateSecurityGroupPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateSecurityGroupRulePriorityInput {
  action: ActionInput;
  payload: Array<UpdateSecurityGroupRulePriorityPayload>;
}

export interface UpdateSecurityGroupRulePriorityPayload {
  rules?: InputMaybe<Array<SecurityGroupRulePriority>>;
  securityGroupUuid: Scalars['String']['input'];
  type: SecurityGroupRuleType;
}

export interface UpdateSftpBackupStorageInput {
  action: ActionInput;
  payload: UpdateSftpBackupStoragePayload;
}

export interface UpdateSftpBackupStoragePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  hostname?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  sshPort?: InputMaybe<Scalars['Int']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  username?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateSingleAlarmHistoryAsReadInput {
  action: ActionInput;
  payload: Array<UpdateSingleAlarmHistoryAsReadPayload>;
}

export interface UpdateSingleAlarmHistoryAsReadPayload {
  dataUuid: Scalars['String']['input'];
  type: Scalars['String']['input'];
}

export interface UpdateSmsReceiverInput {
  action: ActionInput;
  payload: Array<UpdateSmsReceiverPayload>;
}

export interface UpdateSmsReceiverPayload {
  endpointUuid: Scalars['String']['input'];
  oldPhoneNumber: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
}

export interface UpdateSnapshotStrategyInput {
  action: ActionInput;
  payload: Array<UpdateSnapshotStrategyPayload>;
}

export interface UpdateSnapshotStrategyPayload {
  cron?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  removeJobUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  rootVolumeUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  schedulerJobGroupUuid: Scalars['String']['input'];
  shouldUpdateSnapshotGroupMaxNumber?: InputMaybe<Scalars['Boolean']['input']>;
  snapshotGroupMaxNumber?: InputMaybe<Scalars['Int']['input']>;
  startTime?: InputMaybe<Scalars['Int']['input']>;
  state?: InputMaybe<SchedulerJobState>;
  triggerUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateSnmpAgentInput {
  action: ActionInput;
  payload: UpdateSnmpAgentPayload;
}

export interface UpdateSnmpAgentPayload {
  authAlgorithm?: InputMaybe<Scalars['String']['input']>;
  authPassword?: InputMaybe<Scalars['String']['input']>;
  port: Scalars['Int']['input'];
  privacyAlgorithm?: InputMaybe<Scalars['String']['input']>;
  privacyPassword?: InputMaybe<Scalars['String']['input']>;
  readCommunity?: InputMaybe<Scalars['String']['input']>;
  userName?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
  version: Scalars['String']['input'];
}

export interface UpdateSnmpTrapReceiverInput {
  action: ActionInput;
  payload: UpdateSnmpTrapReceiverPayload;
}

export interface UpdateSnmpTrapReceiverPayload {
  name: Scalars['String']['input'];
  snmpAddress: Scalars['String']['input'];
  snmpPort: Scalars['Int']['input'];
  uuid: Scalars['String']['input'];
}

export interface UpdateStorageNetworkCidrInput {
  action: ActionInput;
  payload: UpdateStorageNetworkCidrPayload;
}

export interface UpdateStorageNetworkCidrPayload {
  cidr: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface UpdateSubscribeEventInput {
  action: ActionInput;
  payload: Array<UpdateSubscribeEventPayload>;
}

export interface UpdateSubscribeEventPayload {
  /** 报警等级 */
  emergencyLevel?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateTagInput {
  action: ActionInput;
  payload: UpdateTagPayload;
}

export interface UpdateTagPayload {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateTelemetryConsentInput {
  action: ActionInput;
  payload: UpdateTelemetryConsentPayload;
}

export interface UpdateTelemetryConsentPayload {
  action: TelemetryConsentAction;
  agreedToTerms?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface UpdateThirdPartyAuthInput {
  action: ActionInput;
  payload: UpdateThirdPartyAuthPayload;
}

export interface UpdateThirdPartyAuthPayload {
  authorizationUrl?: InputMaybe<Scalars['String']['input']>;
  base?: InputMaybe<Scalars['String']['input']>;
  casServerLoginUrl?: InputMaybe<Scalars['String']['input']>;
  casServerUrlPrefix?: InputMaybe<Scalars['String']['input']>;
  clientId?: InputMaybe<Scalars['String']['input']>;
  clientSecret?: InputMaybe<Scalars['String']['input']>;
  clientType?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  encryption?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  ldapServerUuid?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  syncCreatedAccountStrategy?: InputMaybe<Scalars['String']['input']>;
  syncDeletedAccountStrategy?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  tagList?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenUrl?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  usernameProperty?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateThirdpartyAlertsInput {
  payload: Array<UpdateThirdpartyAlertsPayload>;
}

export interface UpdateThirdpartyAlertsPayload {
  updateReadStatus?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateThirdpartyAlertsResp {
  success?: Maybe<Scalars['Boolean']['output']>;
}

export interface UpdateThirdpartyAlertsWithActionInput {
  action: ActionInput;
  payload: Array<UpdateThirdpartyAlertsWithActionPayload>;
}

export interface UpdateThirdpartyAlertsWithActionPayload {
  updateReadStatus?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateThirdpartyPlatformInput {
  action: ActionInput;
  payload: Array<UpdateThirdpartyPlatformPayload>;
}

export interface UpdateThirdpartyPlatformPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  stateEvent?: InputMaybe<Scalars['String']['input']>;
  template?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateTimeServerInput {
  action: ActionInput;
  payload: UpdateTimeServerPayload;
}

export interface UpdateTimeServerPayload {
  /** 外部时间源列表 */
  external?: InputMaybe<Array<Scalars['String']['input']>>;
  /** 内部时间源列表 */
  internal?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface UpdateTpmInput {
  action: ActionInput;
  payload: UpdateTpmPayload;
}

export interface UpdateTpmPayload {
  keyProviderUuid?: InputMaybe<Scalars['String']['input']>;
  tpmUuid?: InputMaybe<Scalars['String']['input']>;
  vmInstanceUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateUsbDeviceInput {
  action: ActionInput;
  payload: Array<UpdateUsbDevicePayload>;
}

export interface UpdateUsbDevicePayload {
  name?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<UsbDeviceState>;
  uuid: Scalars['String']['input'];
}

export interface UpdateUsbInput {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<UsbDeviceState>;
  uuids: Array<Scalars['String']['input']>;
}

export interface UpdateUserGroupConfigInput {
  action: ActionInput;
  payload: UpdateUserGroupConfigPayload;
}

export interface UpdateUserGroupConfigPayload {
  addAccountUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  addResourceUuids?: InputMaybe<Array<Array<Scalars['String']['input']>>>;
  addRoleUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  removeAccountUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  removeResourceUuids?: InputMaybe<Array<Array<Scalars['String']['input']>>>;
  removeRoleUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export interface UpdateVGPUDeviceInput {
  action: ActionInput;
  payload: Array<UpdateVGPUDevicePayload>;
}

export interface UpdateVGPUDevicePayload {
  isMdevDevice?: InputMaybe<Scalars['Boolean']['input']>;
  state: PciDeviceState;
  uuid: Scalars['String']['input'];
}

export interface UpdateVirtualSwitchUplinkBondingsActionInput {
  action: ActionInput;
  payload: UpdateVirtualSwitchUplinkBondingsActionPayload;
}

export interface UpdateVirtualSwitchUplinkBondingsActionPayload {
  bondingName?: InputMaybe<Scalars['String']['input']>;
  mode?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
  xmitHashPolicy?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateVirtualSwitchUplinkGroupActionInput {
  action: ActionInput;
  payload: UpdateVirtualSwitchUplinkGroupActionPayload;
}

export interface UpdateVirtualSwitchUplinkGroupActionPayload {
  hostUuid: Scalars['String']['input'];
  slaveNames?: InputMaybe<Array<Scalars['String']['input']>>;
  slaveUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  updateVirtualSwitchUplinkBondingsActionPayload?: InputMaybe<UpdateVirtualSwitchUplinkBondingsActionPayload>;
  uuid: Scalars['String']['input'];
}

export interface UpdateVirtualSwitchUplinkInput {
  action: ActionInput;
  payload: UpdateVirtualSwitchUplinkPayload;
}

export interface UpdateVirtualSwitchUplinkPayload {
  attachL2NetworkToHostPayload?: InputMaybe<AttachL2NetworkToHostPayload>;
  updateVirtualSwitchUplinkBondingsActionPayload?: InputMaybe<UpdateVirtualSwitchUplinkBondingsActionPayload>;
}

export interface UpdateVmCustomSpecificationInput {
  action: ActionInput;
  payload: UpdateVmCustomSpecificationPayload;
}

export interface UpdateVmCustomSpecificationPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  domainMode?: InputMaybe<DomainMode>;
  domainName?: InputMaybe<Scalars['String']['input']>;
  domainPassword?: InputMaybe<Scalars['String']['input']>;
  domainUsername?: InputMaybe<Scalars['String']['input']>;
  generateSID?: InputMaybe<Scalars['Boolean']['input']>;
  hostname?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Scalars['String']['input']>;
  rootPassword?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateVmGroupInput {
  action: ActionInput;
  payload: UpdateVmGroupPayload;
}

export interface UpdateVmGroupPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateVmInstanceInput {
  action: ActionInput;
  payload: UpdateVmInstancePayload;
}

export interface UpdateVmInstancePayload {
  bootMode?: InputMaybe<Scalars['String']['input']>;
  cpuNum?: InputMaybe<Scalars['Int']['input']>;
  defaultL3NetworkUuid?: InputMaybe<Scalars['String']['input']>;
  defaultVmNicUuid?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  guestOsType?: InputMaybe<Scalars['String']['input']>;
  memorySize?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  platform?: InputMaybe<Scalars['String']['input']>;
  /** 内存预留: 如果没有设置就是undefined */
  reservedMemorySize?: InputMaybe<Scalars['Float']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
  vmNicUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateVmNetworkConfigInput {
  action: ActionInput;
  payload: Array<UpdateVmNetworkConfigPayload>;
}

export interface UpdateVmNetworkConfigPayload {
  l3NetworkUuid?: InputMaybe<Scalars['String']['input']>;
  vmInstanceUuid?: InputMaybe<Scalars['String']['input']>;
  vmNicUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateVmNicDriverInput {
  action: ActionInput;
  payload: UpdateVmNicDriverPayload;
}

export interface UpdateVmNicDriverPayload {
  driverType: Scalars['String']['input'];
  vmInstanceUuid: Scalars['String']['input'];
  vmNicUuid: Scalars['String']['input'];
}

export interface UpdateVmNicMacInput {
  action: ActionInput;
  payload: UpdateVmNicMacPayload;
}

export interface UpdateVmNicMacPayload {
  /** mac地址 */
  mac: Scalars['String']['input'];
  /** 网卡Uuid */
  vmNicUuid: Scalars['String']['input'];
}

export interface UpdateVmPriorityInput {
  action: ActionInput;
  payload: Array<UpdateVmPriorityPayload>;
}

export interface UpdateVmPriorityPayload {
  priority: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface UpdateVmSchedulingRuleInput {
  action: ActionInput;
  payload: UpdateVmSchedulingRulePayload;
}

export interface UpdateVmSchedulingRulePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  mode?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateVmTemplateInput {
  action: ActionInput;
  payload: UpdateVmTemplatePayload;
}

export interface UpdateVmTemplatePayload {
  cpuNum?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  memorySize?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateVolumeActionInput {
  action: ActionInput;
  payload: UpdateVolumeInput;
}

export interface UpdateVolumeInput {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export interface UpdateVolumeSnapshotInput {
  action: ActionInput;
  payload: UpdateVolumeSnapshotPayload;
}

export interface UpdateVolumeSnapshotPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  type: SnapshotType;
  uuid: Scalars['String']['input'];
}

export interface UpdateWeComMsgInput {
  action: ActionInput;
  payload: UpdateWeComMsgPayload;
}

export interface UpdateWeComMsgPayload {
  /**
   * 提示群成员：@所有人 / @指定人 / 无
   *                   true => @所有人，
   *                   false => @指定人或者无，
   *                   当 atPersonList 为空时，则为无，否则为@指定人
   */
  atAll?: InputMaybe<Scalars['Boolean']['input']>;
  /** 即将被添加的@人员 */
  atPersonList?: InputMaybe<Array<AtPersonInput>>;
  url?: InputMaybe<Scalars['String']['input']>;
  /** 当前通知对象的 uuid */
  uuid: Scalars['String']['input'];
}

export interface UpdateXmlHookInput {
  action: ActionInput;
  payload: UpdateXmlHookPayload;
}

export interface UpdateXmlHookPayload {
  description?: InputMaybe<Scalars['String']['input']>;
  hookScript?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  startupStrategy?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateZSVBackupStorageConfigInput {
  action: ActionInput;
  payload: Array<UpdateZSVBackupStorageConfigPayload>;
}

export interface UpdateZSVBackupStorageConfigPayload {
  attachedZoneUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  cidr?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  detachedZoneUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  hostname?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sshPort?: InputMaybe<Scalars['Int']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateZSVBackupStorageInput {
  action: ActionInput;
  payload: Array<UpdateZSVBackupStoragePayload>;
}

export interface UpdateZSVBackupStoragePasswordInput {
  action: ActionInput;
  payload: Array<UpdateZSVBackupStoragePasswordPayload>;
}

export interface UpdateZSVBackupStoragePasswordPayload {
  password?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateZSVBackupStoragePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpdateZoneInput {
  action: ActionInput;
  payload: UpdateZonePayload;
}

export interface UpdateZonePayload {
  description?: InputMaybe<Scalars['String']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface UpgradeMigrationServiceAction {
  actionId: Scalars['String']['output'];
  jobResult?: Maybe<Scalars['String']['output']>;
  transit?: Maybe<Scalars['String']['output']>;
}

export interface UpgradeMigrationServiceInput {
  action: ActionInput;
  payload: UpgradeMigrationServicePayload;
}

export interface UpgradeMigrationServicePayload {
  /** 备份存储UUID */
  backupStorageUuid?: InputMaybe<Scalars['String']['input']>;
  /** 文件哈希（本地上传时使用） */
  hash?: InputMaybe<Scalars['String']['input']>;
  /** 安装路径 */
  installPath?: InputMaybe<Scalars['String']['input']>;
  /** 安装包名称 */
  name?: InputMaybe<Scalars['String']['input']>;
  /** 安装包类型 */
  type?: InputMaybe<Scalars['String']['input']>;
  /** 升级类型: Normal | Reexecute */
  upgradeType?: InputMaybe<Scalars['String']['input']>;
  /** 安装包URL */
  url?: InputMaybe<Scalars['String']['input']>;
  /** SoftwarePackage UUID */
  uuid: Scalars['String']['input'];
}

export interface UpgradeTaskInfo {
  status?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
}

export interface UplinkGroup {
  bond?: Maybe<Bond>;
  bondingUuid?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  host?: Maybe<HostVO>;
  hostUuid: Scalars['String']['output'];
  interfaceName: Scalars['String']['output'];
  interfaceUuid?: Maybe<Scalars['String']['output']>;
  l2NetworkUuid: Scalars['String']['output'];
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  physicalNic?: Maybe<PhysicalNic>;
  type: UplinkGroupType;
  uuid: Scalars['String']['output'];
}

export interface UplinkGroupList {
  /** 查询结果列表 */
  list?: Maybe<Array<UplinkGroup>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum UplinkGroupQueryType {
  Normal = 'Normal'
}

export enum UplinkGroupType {
  Bonding = 'Bonding',
  PhysicalInterface = 'PhysicalInterface'
}

export interface UploadKmsClientCsrInput {
  action: ActionInput;
  payload: UploadKmsClientCsrPayload;
}

export interface UploadKmsClientCsrPayload {
  kmsCsrSubject?: InputMaybe<KmsCsrSubject>;
  uuid: Scalars['String']['input'];
}

export interface UploadKmsClientIdentityInput {
  action: ActionInput;
  payload: UploadKmsClientIdentityPayload;
}

export interface UploadKmsClientIdentityPayload {
  uploadedIdentity?: InputMaybe<KmsUploadedIdentity>;
  uuid: Scalars['String']['input'];
}

export interface UploadKmsClientSignedCertInput {
  action: ActionInput;
  payload: UploadKmsClientSignedCertPayload;
}

export interface UploadKmsClientSignedCertPayload {
  signedClientCertPem: Scalars['String']['input'];
  uuid: Scalars['String']['input'];
}

export interface Usage {
  affinityGroupUuid: Scalars['String']['output'];
  createDate: Scalars['String']['output'];
  lastOpDate: Scalars['String']['output'];
  resourceType: Scalars['String']['output'];
  resourceUuid: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
}

export interface UsbDevice {
  attachType?: Maybe<Scalars['String']['output']>;
  busNum?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  devNum?: Maybe<Scalars['String']['output']>;
  host?: Maybe<Host>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  iManufacturer?: Maybe<Scalars['String']['output']>;
  iProduct?: Maybe<Scalars['String']['output']>;
  iSerial?: Maybe<Scalars['String']['output']>;
  idProduct?: Maybe<Scalars['String']['output']>;
  idVendor?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  state?: Maybe<Scalars['String']['output']>;
  templatedVmInstance?: Maybe<VmInstance>;
  usbVersion?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vmInstance?: Maybe<VmInstance>;
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
}

export interface UsbDeviceQueryResp {
  list?: Maybe<Array<UsbDevice>>;
  total?: Maybe<Scalars['Int']['output']>;
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

export interface UsedIp {
  createDate?: Maybe<Scalars['String']['output']>;
  gateway?: Maybe<Scalars['String']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  ipInLong?: Maybe<Scalars['Int']['output']>;
  /** IP段UUID */
  ipRangeUuid?: Maybe<Scalars['String']['output']>;
  ipVersion?: Maybe<Scalars['Int']['output']>;
  l3Network?: Maybe<L3Network>;
  l3NetworkUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  netmask?: Maybe<Scalars['String']['output']>;
  usedFor?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vmNicUuid?: Maybe<Scalars['String']['output']>;
}

export interface UserCCSCertificateRefs {
  certificateUuid?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  userUuid?: Maybe<Scalars['String']['output']>;
}

export interface UserGroup {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  groupUserCount?: Maybe<Scalars['Int']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  role?: Maybe<Array<ZsvRole>>;
  uuid: Scalars['String']['output'];
}

export interface UserGroupList {
  /** 查询结果列表 */
  list?: Maybe<Array<UserGroup>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum UserGroupQueryType {
  GET_USERGROUP_BY_ACCOUNT = 'GET_USERGROUP_BY_ACCOUNT',
  GET_USERGROUP_BY_NOT_ACCOUNT = 'GET_USERGROUP_BY_NOT_ACCOUNT',
  GET_USERGROUP_BY_NOT_SHARED = 'GET_USERGROUP_BY_NOT_SHARED',
  GET_USERGROUP_BY_ROLE = 'GET_USERGROUP_BY_ROLE',
  GET_USERGROUP_BY_SHARED = 'GET_USERGROUP_BY_SHARED',
  Normal = 'Normal'
}

export interface UserTag {
  createDate?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  resourceUuid?: Maybe<Scalars['String']['output']>;
  tag?: Maybe<Scalars['String']['output']>;
  tagPattern?: Maybe<TagPattern>;
  tagPatternUuid?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface VCPUPinItem {
  pCPU: Scalars['String']['output'];
  vCPU: Scalars['String']['output'];
}

export interface VGpuDevice {
  address?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  host?: Maybe<Host>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  parent?: Maybe<PciDevice>;
  parentUuid?: Maybe<Scalars['String']['output']>;
  shareType: ShareType;
  specInfo?: Maybe<VGpuDeviceSpec>;
  specUuid?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  templatedVmInstance?: Maybe<VmInstance>;
  type?: Maybe<VGpuType>;
  uuid: Scalars['String']['output'];
  vmInstance?: Maybe<VmInstance>;
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
}

export interface VGpuDeviceInVmCreate {
  type?: InputMaybe<VGpuType>;
  uuid: Scalars['String']['input'];
}

export interface VGpuDeviceList {
  /** 查询结果列表 */
  list?: Maybe<Array<VGpuDevice>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface VGpuDeviceSpec {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  deviceId?: Maybe<Scalars['String']['output']>;
  deviceType: VGpuDeviceType;
  fbMemory?: Maybe<Scalars['String']['output']>;
  frameRateLimit?: Maybe<Scalars['String']['output']>;
  gridLicense?: Maybe<Scalars['String']['output']>;
  isVirtual?: Maybe<Scalars['Boolean']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  manufacturer?: Maybe<Scalars['String']['output']>;
  maxInstance?: Maybe<Scalars['String']['output']>;
  maxPartNum?: Maybe<Scalars['Int']['output']>;
  maximumResolution?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  ramSize?: Maybe<Scalars['Boolean']['output']>;
  romContent?: Maybe<Scalars['String']['output']>;
  romMd5sum?: Maybe<Scalars['String']['output']>;
  romVersion?: Maybe<Scalars['String']['output']>;
  shareType: ShareType;
  state?: Maybe<PciDeviceSpecState>;
  subSystemId?: Maybe<Scalars['String']['output']>;
  subdeviceId?: Maybe<Scalars['String']['output']>;
  subvendorId?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vendorId?: Maybe<Scalars['String']['output']>;
}

export interface VGpuDeviceSpecList {
  /** 查询结果列表 */
  list?: Maybe<Array<VGpuDeviceSpec>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export enum VGpuDeviceType {
  MdevDevice = 'MdevDevice',
  PciDevice = 'PciDevice'
}

export enum VGpuType {
  MdevDevice = 'MdevDevice',
  PciDevice = 'PciDevice'
}

export interface VMCdRomConfig {
  category?: Maybe<Scalars['String']['output']>;
  defaultValue?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
}

export interface VMClusterDirectory {
  children: Array<DirectoryClusterItem>;
  groupChildren: Scalars['Int']['output'];
  key: Scalars['String']['output'];
  level: Scalars['Int']['output'];
  parentUuid: Scalars['String']['output'];
  title: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
  vmCount: Scalars['Int']['output'];
}

export interface VMClusterDirectoryList {
  children: Array<VMClusterDirectory>;
  error?: Maybe<ActionError>;
  expandedKeys: Array<Scalars['String']['output']>;
  key: Scalars['String']['output'];
  level: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
  vmCount: Scalars['Int']['output'];
}

export interface VMConverToTemplateInput {
  action: ActionInput;
  payload: Array<VMConverToTemplatePayload>;
}

export interface VMConverToTemplatePayload {
  uuid: Scalars['String']['input'];
}

export interface VMGroupDirectory {
  count?: Maybe<Scalars['Int']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  groupName: Scalars['String']['output'];
  key: Scalars['String']['output'];
  lastOpDate?: Maybe<Scalars['String']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  parentUuid?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
  vmCount?: Maybe<Scalars['Int']['output']>;
  zoneUuid: Scalars['String']['output'];
}

export interface VMGroupDirectoryList {
  error?: Maybe<ActionError>;
  list: Array<VMGroupDirectory>;
  total: Scalars['Int']['output'];
}

export interface VMNUMATopology {
  CPUsID: Array<Scalars['String']['output']>;
  memSize: Scalars['Float']['output'];
  nodeID: Scalars['Int']['output'];
  phyNodeID: Scalars['Int']['output'];
}

export interface VPortGroup {
  uuid: Scalars['String']['output'];
  vlanId: Scalars['String']['output'];
}

export interface VRouterRouteEntry {
  createDate: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  destination: Scalars['String']['output'];
  /** 路由优先级 */
  distance: Scalars['Int']['output'];
  lastOpDate: Scalars['String']['output'];
  routeTableUuid: Scalars['String']['output'];
  /** 下一跳 */
  target?: Maybe<Scalars['String']['output']>;
  type: VRouterRouteEntryType;
  uuid: Scalars['String']['output'];
}

export interface VRouterRouteEntryListResp {
  error?: Maybe<ActionError>;
  list: Array<VRouterRouteEntry>;
  total: Scalars['Int']['output'];
}

export enum VRouterRouteEntryType {
  UserBlackHole = 'UserBlackHole',
  UserStatic = 'UserStatic'
}

export interface VRouterRouteTable {
  attachedRouterRefs?: Maybe<Array<AttachedRouterRef>>;
  attachedRouterUuids?: Maybe<Array<Scalars['String']['output']>>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  routeEntries?: Maybe<Array<VRouterRouteEntry>>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface VRouterRouteTableListResp {
  error?: Maybe<ActionError>;
  list: Array<VRouterRouteTable>;
  total: Scalars['Int']['output'];
}

export interface ValidatInstanceOfferingUserConfigResp {
  /** 错误内容 */
  error?: Maybe<Scalars['String']['output']>;
  valid: Scalars['Boolean']['output'];
}

export interface ValidateAliyunSmsEndpointInput {
  action: ActionInput;
  payload: ValidateAliyunSmsEndpointPayload;
}

export interface ValidateAliyunSmsEndpointPayload {
  phoneNumbers: Array<Scalars['String']['input']>;
  uuid: Scalars['String']['input'];
}

export interface ValidatePassword {
  deleteAble?: Maybe<Scalars['Boolean']['output']>;
}

export interface ValidateSNSEmailPlatformInput {
  action: ActionInput;
  payload: Array<ValidateSNSEmailPlatformPayload>;
}

export interface ValidateSNSEmailPlatformPayload {
  accessKeyId?: InputMaybe<Scalars['String']['input']>;
  accessKeySecret?: InputMaybe<Scalars['String']['input']>;
  requestIp?: InputMaybe<Scalars['String']['input']>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  userTags?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
}

export interface ValidateSecurityGroupRuleInput {
  payload: ValidateSecurityGroupRulePayload;
}

export interface ValidateSecurityGroupRuleOutput {
  available: Scalars['Boolean']['output'];
  code?: Maybe<Scalars['String']['output']>;
}

export interface ValidateSecurityGroupRulePayload {
  rules: Array<SecurityGroupRuleParam>;
}

export interface ValidateVlanIdResp {
  result: Scalars['Boolean']['output'];
}

export interface ValidateVmSchedulingRuleParam {
  hostGroupUuid?: InputMaybe<Scalars['String']['input']>;
  mode: Scalars['String']['input'];
  rule: Scalars['String']['input'];
  vmGroupUuid: Scalars['String']['input'];
}

export interface ValidateVmSchedulingRuleResult {
  success?: Maybe<Scalars['Boolean']['output']>;
}

export interface VersionType {
  version?: Maybe<Scalars['String']['output']>;
}

export interface VfAvailableNum {
  vfAvailableNum?: Maybe<Scalars['Int']['output']>;
  vfTotalNum?: Maybe<Scalars['Int']['output']>;
}

export interface VirtualRouterOffering {
  /** 分配策略 */
  allocatorStrategy?: Maybe<Scalars['String']['output']>;
  cpuNum: Scalars['Int']['output'];
  cpuSpeed?: Maybe<Scalars['Int']['output']>;
  createDate: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  /** 镜像 */
  image?: Maybe<Image>;
  /** 镜像UUID */
  imageUuid?: Maybe<Scalars['String']['output']>;
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  lastOpDate: Scalars['String']['output'];
  /** 管理L3网络 */
  managementNetwork?: Maybe<L3Network>;
  /** 管理L3网络UUID */
  managementNetworkUuid?: Maybe<Scalars['String']['output']>;
  memorySize: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  /** 公有L3网络 */
  publicNetwork?: Maybe<L3Network>;
  /** 公有L3网络UUID */
  publicNetworkUuid: Scalars['String']['output'];
  shareType: ShareType;
  /** 排序主键 */
  sortKey?: Maybe<Scalars['Int']['output']>;
  state: Scalars['String']['output'];
  /** 是否全局共享 */
  toPublic: Scalars['Boolean']['output'];
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  /** 区域UUID */
  zoneUuid: Scalars['String']['output'];
}

export interface VirtualRouterOfferingQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<VirtualRouterOffering>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface VirtualizationZoneRelatedSummary {
  virClusterCount?: Maybe<Scalars['Int']['output']>;
  virHostCount?: Maybe<Scalars['Int']['output']>;
  virImageStoreCount?: Maybe<Scalars['Int']['output']>;
  virInstanceCount?: Maybe<Scalars['Int']['output']>;
  virL2NetworkCount?: Maybe<Scalars['Int']['output']>;
  virL3NetworkCount?: Maybe<Scalars['Int']['output']>;
  virPrimaryStorageCount?: Maybe<Scalars['Int']['output']>;
}

export interface VlanIdPayload {
  uuid: Scalars['String']['input'];
  virtualNetworkId: Scalars['Int']['input'];
}

export interface VmAndBareMetal2InstanceSummary {
  bareMetal2InstanceTotal?: Maybe<Scalars['Int']['output']>;
  vmTotal?: Maybe<Scalars['Int']['output']>;
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

export interface VmCapabilities {
  LiveMigration?: Maybe<Scalars['Boolean']['output']>;
  MemorySnapshot?: Maybe<Scalars['Boolean']['output']>;
  Reimage?: Maybe<Scalars['Boolean']['output']>;
  VolumeMigration?: Maybe<Scalars['Boolean']['output']>;
}

export interface VmCpuMode {
  /** 默认参考全局配置 */
  dependentResourceType?: Maybe<DependentResourceType>;
  value?: Maybe<Scalars['String']['output']>;
}

export interface VmCpuPinning {
  pCPU: Scalars['String']['output'];
  vCPU: Scalars['String']['output'];
}

export enum VmCreationStrategy {
  CreateStopped = 'CreateStopped',
  CreatedPaused = 'CreatedPaused',
  InstantStart = 'InstantStart',
  JustCreate = 'JustCreate'
}

export interface VmCustomSpecification {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  domainMode?: Maybe<DomainMode>;
  domainName?: Maybe<Scalars['String']['output']>;
  domainUsername?: Maybe<Scalars['String']['output']>;
  generateSID?: Maybe<Scalars['Boolean']['output']>;
  hostname?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  organization?: Maybe<Scalars['String']['output']>;
  platform: VmSpecPlatform;
  uuid: Scalars['String']['output'];
}

export interface VmCustomSpecificationParam {
  domainMode?: InputMaybe<DomainMode>;
  domainName?: InputMaybe<Scalars['String']['input']>;
  domainPassword?: InputMaybe<Scalars['String']['input']>;
  domainUsername?: InputMaybe<Scalars['String']['input']>;
  generateSID?: InputMaybe<Scalars['Boolean']['input']>;
  hostname?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Scalars['String']['input']>;
  platform?: InputMaybe<VmSpecPlatform>;
  rootPassword?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
}

export interface VmCustomSpecificationResp {
  /** 查询结果列表 */
  list?: Maybe<Array<VmCustomSpecification>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface VmDevicesConfig {
  tpm?: InputMaybe<TpmDeviceConfig>;
}

export interface VmDns {
  dns: Scalars['String']['output'];
  ipVersion: Scalars['Int']['output'];
  vmInstanceUuid: Scalars['String']['output'];
  vmNicUuid?: Maybe<Scalars['String']['output']>;
}

export interface VmDnsQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<VmDns>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface VmExportInfo {
  backupStorageUuid: Scalars['String']['output'];
  createDate: Scalars['String']['output'];
  description: Scalars['String']['output'];
  exportUrl: Scalars['String']['output'];
  lastOpDate: Scalars['String']['output'];
  md5Sum: Scalars['String']['output'];
  name: Scalars['String']['output'];
  size: Scalars['Int']['output'];
  uuid: Scalars['String']['output'];
  vmUuid: Scalars['String']['output'];
}

export interface VmExternalDevice {
  gpu: Scalars['Int']['output'];
  lun: Scalars['Int']['output'];
  pci: Scalars['Int']['output'];
  usb: Scalars['Int']['output'];
  vgpu: Scalars['Int']['output'];
}

export interface VmGroup {
  /** 当前云主机调度组关联的云主机调度策略数量 */
  associatedVmSchedulingRuleList?: Maybe<Array<VmSchedulingRule>>;
  createDate?: Maybe<Scalars['String']['output']>;
  /** 资源的详细描述 */
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  /** 资源名称 */
  name: Scalars['String']['output'];
  owner?: Maybe<CommonOwner>;
  /** 资源的UUID，唯一标示该资源 */
  uuid: Scalars['String']['output'];
  /** 当前云主机调度组拥有的云主机数量 */
  vmCount?: Maybe<Scalars['Float']['output']>;
  /** 当前云主机调度组关联的云主机调度策略数量 */
  vmSchedulingRuleCount?: Maybe<Scalars['Float']['output']>;
  zone?: Maybe<Zone>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface VmGroupBase {
  /** 当前云主机调度组关联的云主机调度策略数量 */
  associatedVmSchedulingRuleList?: Maybe<Array<VmSchedulingRule>>;
  createDate?: Maybe<Scalars['String']['output']>;
  /** 资源的详细描述 */
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  /** 资源名称 */
  name: Scalars['String']['output'];
  owner?: Maybe<CommonOwner>;
  /** 资源的UUID，唯一标示该资源 */
  uuid: Scalars['String']['output'];
  /** 当前云主机调度组拥有的云主机数量 */
  vmCount?: Maybe<Scalars['Float']['output']>;
  /** 当前云主机调度组关联的云主机调度策略数量 */
  vmSchedulingRuleCount?: Maybe<Scalars['Float']['output']>;
  zone?: Maybe<Zone>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface VmGroupList {
  error?: Maybe<ActionError>;
  list: Array<VmGroup>;
  total: Scalars['Int']['output'];
}

export enum VmGroupQueryType {
  GetCandidateForCreateAutoScalingGroupVmTemplate = 'GetCandidateForCreateAutoScalingGroupVmTemplate',
  Normal = 'Normal'
}

export interface VmHaVO {
  haLevel?: Maybe<Scalars['String']['output']>;
  haLevelUpdateTime?: Maybe<Scalars['String']['output']>;
  inhibitionReason?: Maybe<Scalars['String']['output']>;
  inhibitionTime?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface VmInstance {
  affinityGroup?: Maybe<AffinityGroup>;
  affinityGroupUuid?: Maybe<Scalars['String']['output']>;
  allVolumes: Array<Volume>;
  architecture?: Maybe<CpuArchitecture>;
  attachedShareableVolumeUuidList: Array<Scalars['String']['output']>;
  backupJob?: Maybe<SchedulerJob>;
  backupStatus?: Maybe<Scalars['String']['output']>;
  backupTaskStatus?: Maybe<State>;
  backupTaskType?: Maybe<VmBackupTaskType>;
  bootOrder?: Maybe<BootOrderResp>;
  capabilities?: Maybe<VmCapabilities>;
  cdpTaskStatus?: Maybe<CdpTaskStatus>;
  cluster?: Maybe<Cluster>;
  clusterUuid?: Maybe<Scalars['String']['output']>;
  consoleAddress?: Maybe<Array<Scalars['String']['output']>>;
  cpuModeInfo?: Maybe<VmCpuMode>;
  cpuNum?: Maybe<Scalars['Int']['output']>;
  crashStrategy?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  defaultL3Network?: Maybe<DefaultL3Network>;
  defaultL3NetworkUuid?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  eip: Array<EipInVminstance>;
  emulatorPin?: Maybe<Scalars['String']['output']>;
  exportInfo?: Maybe<VmExportInfo>;
  gpuDeviceSpec?: Maybe<Array<GpuDeivceSpecOnVmInstance>>;
  group?: Maybe<VMGroupDirectory>;
  guestOsType?: Maybe<Scalars['String']['output']>;
  guestToolsState?: Maybe<GuestToolsStateInfo>;
  /** 云主机云盘上任何一个有备份任务，则为true */
  hasBackupJob?: Maybe<Scalars['Boolean']['output']>;
  hasTopology?: Maybe<Scalars['Boolean']['output']>;
  haveScsiLun?: Maybe<Scalars['Boolean']['output']>;
  healthStatus?: Maybe<Scalars['String']['output']>;
  host?: Maybe<Host>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  hypervisorType?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Image>;
  imageUuid?: Maybe<Scalars['String']['output']>;
  instanceOffering?: Maybe<InstanceOffering>;
  instanceOfferingUuid?: Maybe<Scalars['String']['output']>;
  isMemoryReservationOpened?: Maybe<Scalars['Boolean']['output']>;
  isTemplate?: Maybe<Scalars['Boolean']['output']>;
  lastBackupJobResult?: Maybe<SchedulerJobHistory>;
  lastHost?: Maybe<Host>;
  lastHostUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  localBackupCapacity?: Maybe<Scalars['BigInt']['output']>;
  localBackupCount?: Maybe<Scalars['Int']['output']>;
  maxCdRomNum?: Maybe<MaxCdRomNum>;
  memorySize?: Maybe<Scalars['Float']['output']>;
  metric?: Maybe<MetricData>;
  name: Scalars['String']['output'];
  /** 目前只查询了删除的操作信息，后续有需求再扩展 */
  operatorInfo?: Maybe<OperatorInfo>;
  owner?: Maybe<VmOwner>;
  platform?: Maybe<ImagePlatform>;
  primaryStorage?: Maybe<PrimaryStorage>;
  qemuState?: Maybe<VmInstanceQemuState>;
  relatedResource?: Maybe<RelatedResource>;
  /** 内存预留大小 */
  reservedMemorySize?: Maybe<Scalars['Float']['output']>;
  resourceAttributeValues?: Maybe<Array<ResourceAttributeValue>>;
  rootVolumeUuid?: Maybe<Scalars['String']['output']>;
  schedulingState?: Maybe<VmInstanceSchedulingState>;
  securityGroup?: Maybe<Array<SecurityGroupInVminstance>>;
  shareType: ShareType;
  snapshotSchedulerJob?: Maybe<Array<SchedulerJob>>;
  /** 云主机上挂载的sshKeyPair数量，本来取数组长度即可，但是获取的字段更多消耗更多。 */
  sshKeyPairNum: Scalars['Float']['output'];
  /** 云主机上挂载的sshKeyPair */
  sshKeyPairs: Array<SshKeyPair>;
  state?: Maybe<VmInstanceState>;
  systemTag?: Maybe<VmInstanceSystemTag>;
  tag: Array<Tag>;
  toolsInfo?: Maybe<GuestToolInfo>;
  toolsState?: Maybe<GuestToolsState>;
  tpmList: Array<TpmInventory>;
  type?: Maybe<Scalars['String']['output']>;
  uptime?: Maybe<Scalars['String']['output']>;
  userGroup?: Maybe<Array<UserGroup>>;
  uuid: Scalars['String']['output'];
  vmCdRoms: Array<CdRom>;
  vmGroup?: Maybe<VmGroup>;
  vmHa?: Maybe<VmHaVO>;
  vmNics: Array<VmNic>;
  vmUsage?: Maybe<VmUsage>;
  vnuma?: Maybe<Scalars['Boolean']['output']>;
  volumeAttributeUserConfig?: Maybe<Scalars['String']['output']>;
  zmigrateType?: Maybe<Scalars['String']['output']>;
  zone?: Maybe<Zone>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface VmInstanceBase {
  allVolumes?: Maybe<Array<VolumeBase>>;
  allocatorStrategy?: Maybe<Scalars['String']['output']>;
  architecture?: Maybe<Scalars['String']['output']>;
  clusterUuid?: Maybe<Scalars['String']['output']>;
  cpuNum?: Maybe<Scalars['Float']['output']>;
  cpuSpeed?: Maybe<Scalars['Float']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  defaultL3NetworkUuid?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  guestOsType?: Maybe<Scalars['String']['output']>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  hypervisorType?: Maybe<Scalars['String']['output']>;
  imageUuid?: Maybe<Scalars['String']['output']>;
  instanceOfferingUuid?: Maybe<Scalars['String']['output']>;
  lastHostUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  memorySize?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  platform?: Maybe<Scalars['String']['output']>;
  reservedMemorySize?: Maybe<Scalars['Float']['output']>;
  rootVolumeUuid?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface VmInstanceExportMetric {
  key: VmInstancePerformanceMetricType;
  values: Array<ExportMetricsValue>;
}

export interface VmInstanceList {
  error?: Maybe<ActionError>;
  list: Array<VmInstance>;
  total: Scalars['Int']['output'];
}

export interface VmInstanceMetricData {
  label?: Maybe<Scalars['String']['output']>;
  labels?: Maybe<VmLabels>;
  metricName: Scalars['String']['output'];
  time: Scalars['Float']['output'];
  type: Scalars['String']['output'];
  value: Scalars['Float']['output'];
}

export interface VmInstanceNameAndUuid {
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface VmInstancePerformance {
  CPUAverageUsedUtilization?: Maybe<Scalars['String']['output']>;
  DiskAllFreeCapacityInPercent?: Maybe<Scalars['String']['output']>;
  DiskAllReadBytes?: Maybe<Scalars['String']['output']>;
  DiskAllReadOps?: Maybe<Scalars['String']['output']>;
  DiskAllUsedCapacityInPercent?: Maybe<Scalars['String']['output']>;
  DiskAllWriteBytes?: Maybe<Scalars['String']['output']>;
  DiskAllWriteOps?: Maybe<Scalars['String']['output']>;
  DiskFreeCapacityInPercent?: Maybe<Scalars['String']['output']>;
  DiskUsedCapacityInPercent?: Maybe<Scalars['String']['output']>;
  MemoryUsedInPercent?: Maybe<Scalars['String']['output']>;
  NetworkAllInBytes?: Maybe<Scalars['String']['output']>;
  NetworkAllInErrors?: Maybe<Scalars['String']['output']>;
  NetworkAllInPackets?: Maybe<Scalars['String']['output']>;
  NetworkAllOutBytes?: Maybe<Scalars['String']['output']>;
  NetworkAllOutErrors?: Maybe<Scalars['String']['output']>;
  NetworkAllOutPackets?: Maybe<Scalars['String']['output']>;
  OperatingSystemCPUAverageIdleUtilization?: Maybe<Scalars['String']['output']>;
  OperatingSystemCPUAverageSystemUtilization?: Maybe<Scalars['String']['output']>;
  OperatingSystemCPUAverageUsedUtilization?: Maybe<Scalars['String']['output']>;
  OperatingSystemCPUAverageUserUtilization?: Maybe<Scalars['String']['output']>;
  OperatingSystemCPUAverageWaitUtilization?: Maybe<Scalars['String']['output']>;
  OperatingSystemMemoryFreePercent?: Maybe<Scalars['String']['output']>;
  OperatingSystemMemoryUsedPercent?: Maybe<Scalars['String']['output']>;
  affinityGroup?: Maybe<AffinityGroup>;
  affinityGroupUuid?: Maybe<Scalars['String']['output']>;
  allVolumes: Array<Volume>;
  architecture?: Maybe<CpuArchitecture>;
  attachedShareableVolumeUuidList: Array<Scalars['String']['output']>;
  backupJob?: Maybe<SchedulerJob>;
  backupStatus?: Maybe<Scalars['String']['output']>;
  backupTaskStatus?: Maybe<State>;
  backupTaskType?: Maybe<VmBackupTaskType>;
  bootOrder?: Maybe<BootOrderResp>;
  capabilities?: Maybe<VmCapabilities>;
  cdpTaskStatus?: Maybe<CdpTaskStatus>;
  cluster?: Maybe<Cluster>;
  clusterUuid?: Maybe<Scalars['String']['output']>;
  consoleAddress?: Maybe<Array<Scalars['String']['output']>>;
  cpuModeInfo?: Maybe<VmCpuMode>;
  cpuNum?: Maybe<Scalars['Int']['output']>;
  crashStrategy?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  defaultL3Network?: Maybe<DefaultL3Network>;
  defaultL3NetworkUuid?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  eip: Array<EipInVminstance>;
  emulatorPin?: Maybe<Scalars['String']['output']>;
  exportInfo?: Maybe<VmExportInfo>;
  gpuDeviceSpec?: Maybe<Array<GpuDeivceSpecOnVmInstance>>;
  group?: Maybe<VMGroupDirectory>;
  guestOsType?: Maybe<Scalars['String']['output']>;
  guestToolsState?: Maybe<GuestToolsStateInfo>;
  /** 云主机云盘上任何一个有备份任务，则为true */
  hasBackupJob?: Maybe<Scalars['Boolean']['output']>;
  hasTopology?: Maybe<Scalars['Boolean']['output']>;
  haveScsiLun?: Maybe<Scalars['Boolean']['output']>;
  healthStatus?: Maybe<Scalars['String']['output']>;
  host?: Maybe<Host>;
  hostUuid?: Maybe<Scalars['String']['output']>;
  hypervisorType?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Image>;
  imageUuid?: Maybe<Scalars['String']['output']>;
  instanceOffering?: Maybe<InstanceOffering>;
  instanceOfferingUuid?: Maybe<Scalars['String']['output']>;
  isMemoryReservationOpened?: Maybe<Scalars['Boolean']['output']>;
  isTemplate?: Maybe<Scalars['Boolean']['output']>;
  lastBackupJobResult?: Maybe<SchedulerJobHistory>;
  lastHost?: Maybe<Host>;
  lastHostUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  localBackupCapacity?: Maybe<Scalars['BigInt']['output']>;
  localBackupCount?: Maybe<Scalars['Int']['output']>;
  maxCdRomNum?: Maybe<MaxCdRomNum>;
  memorySize?: Maybe<Scalars['Float']['output']>;
  metric?: Maybe<MetricData>;
  name: Scalars['String']['output'];
  /** 目前只查询了删除的操作信息，后续有需求再扩展 */
  operatorInfo?: Maybe<OperatorInfo>;
  owner?: Maybe<VmOwner>;
  platform?: Maybe<ImagePlatform>;
  primaryStorage?: Maybe<PrimaryStorage>;
  qemuState?: Maybe<VmInstanceQemuState>;
  relatedResource?: Maybe<RelatedResource>;
  /** 内存预留大小 */
  reservedMemorySize?: Maybe<Scalars['Float']['output']>;
  resourceAttributeValues?: Maybe<Array<ResourceAttributeValue>>;
  rootVolumeUuid?: Maybe<Scalars['String']['output']>;
  schedulingState?: Maybe<VmInstanceSchedulingState>;
  securityGroup?: Maybe<Array<SecurityGroupInVminstance>>;
  shareType: ShareType;
  snapshotSchedulerJob?: Maybe<Array<SchedulerJob>>;
  /** 云主机上挂载的sshKeyPair数量，本来取数组长度即可，但是获取的字段更多消耗更多。 */
  sshKeyPairNum: Scalars['Float']['output'];
  /** 云主机上挂载的sshKeyPair */
  sshKeyPairs: Array<SshKeyPair>;
  state?: Maybe<VmInstanceState>;
  systemTag?: Maybe<VmInstanceSystemTag>;
  tag: Array<Tag>;
  toolsInfo?: Maybe<GuestToolInfo>;
  toolsState?: Maybe<GuestToolsState>;
  tpmList: Array<TpmInventory>;
  type?: Maybe<Scalars['String']['output']>;
  uptime?: Maybe<Scalars['String']['output']>;
  userGroup?: Maybe<Array<UserGroup>>;
  uuid: Scalars['String']['output'];
  vmCdRoms: Array<CdRom>;
  vmGroup?: Maybe<VmGroup>;
  vmHa?: Maybe<VmHaVO>;
  vmNics: Array<VmNic>;
  vmUsage?: Maybe<VmUsage>;
  vnuma?: Maybe<Scalars['Boolean']['output']>;
  volumeAttributeUserConfig?: Maybe<Scalars['String']['output']>;
  zmigrateType?: Maybe<Scalars['String']['output']>;
  zone?: Maybe<Zone>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
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

export interface VmInstancePerformanceQueryResp {
  /** 查询结果列表 */
  list?: Maybe<Array<VmInstancePerformance>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
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

export interface VmInstanceSummary {
  available?: Maybe<Scalars['Int']['output']>;
  destroyed?: Maybe<Scalars['Int']['output']>;
  other?: Maybe<Scalars['Int']['output']>;
  running?: Maybe<Scalars['Int']['output']>;
  stopped?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
  unknown?: Maybe<Scalars['Int']['output']>;
}

export interface VmInstanceSystemTag {
  GuestTools?: Maybe<Scalars['String']['output']>;
  RDPEnable?: Maybe<Scalars['Boolean']['output']>;
  VDIMonitorNumber?: Maybe<Scalars['String']['output']>;
  antiSpoofing?: Maybe<Scalars['Boolean']['output']>;
  autoReleaseSpecReleatedPhysicalPciDevice?: Maybe<Scalars['Boolean']['output']>;
  autoReleaseSpecReleatedVirtualPciDevice?: Maybe<Scalars['Boolean']['output']>;
  bootMode?: Maybe<Scalars['String']['output']>;
  bootOrder: Array<Scalars['String']['output']>;
  bootOrderOnce?: Maybe<Scalars['Boolean']['output']>;
  clockTrack?: Maybe<Scalars['String']['output']>;
  consolePassword?: Maybe<Scalars['String']['output']>;
  cpuCores?: Maybe<Scalars['String']['output']>;
  cpuSockets?: Maybe<Scalars['String']['output']>;
  ha?: Maybe<Scalars['String']['output']>;
  haStickStragedy?: Maybe<Scalars['Boolean']['output']>;
  hostname?: Maybe<Scalars['String']['output']>;
  isoList: Array<VmIso>;
  qemuga?: Maybe<Scalars['String']['output']>;
  qxlMemory?: Maybe<QxlMemory>;
  sshkey?: Maybe<Scalars['String']['output']>;
  staticIp?: Maybe<Array<StaticIpInVm>>;
  timeTrack?: Maybe<Scalars['String']['output']>;
  usbRedirect?: Maybe<Scalars['Boolean']['output']>;
  userdata?: Maybe<Scalars['String']['output']>;
  vmConsoleMode?: Maybe<Scalars['String']['output']>;
  vmCpuPinningList?: Maybe<Array<VmCpuPinning>>;
  vmDriver?: Maybe<Scalars['Boolean']['output']>;
  vmMachineType?: Maybe<Scalars['String']['output']>;
  vmPriority?: Maybe<Scalars['String']['output']>;
}

export interface VmIso {
  index?: Maybe<Scalars['Int']['output']>;
  uuid: Scalars['String']['output'];
}

export interface VmLabels {
  CPUNum?: Maybe<Scalars['String']['output']>;
  DiskDeviceLetter?: Maybe<Scalars['String']['output']>;
  NetworkDeviceLetter?: Maybe<Scalars['String']['output']>;
  VMUuid?: Maybe<Scalars['String']['output']>;
}

export interface VmMigrationActivity {
  adviceGropUuid?: Maybe<Scalars['String']['output']>;
  adviceUuid?: Maybe<Scalars['String']['output']>;
  cause?: Maybe<Scalars['String']['output']>;
  clusterName?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  drsUuid?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  sourceHost?: Maybe<HostNameAndUuidForVmMigrationActivity>;
  status?: Maybe<Scalars['String']['output']>;
  targetHost?: Maybe<HostNameAndUuidForVmMigrationActivity>;
  uuid: Scalars['String']['output'];
  vm?: Maybe<ClusterNameAndUuidForVmMigrationActivity>;
  vmSourceHostUuid?: Maybe<Scalars['String']['output']>;
  vmTargetHostUuid?: Maybe<Scalars['String']['output']>;
  vmUuid?: Maybe<Scalars['String']['output']>;
}

export interface VmNic {
  createDate?: Maybe<Scalars['String']['output']>;
  deviceId?: Maybe<Scalars['Int']['output']>;
  driverType?: Maybe<Scalars['String']['output']>;
  eip?: Maybe<Array<Eip>>;
  gateway?: Maybe<Scalars['String']['output']>;
  internalName?: Maybe<Scalars['String']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  ipVersion?: Maybe<Scalars['Int']['output']>;
  isBindPortMirrorSession?: Maybe<Scalars['Boolean']['output']>;
  isPxe?: Maybe<Scalars['Boolean']['output']>;
  l3Network?: Maybe<L3Network>;
  l3NetworkUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  mac?: Maybe<Scalars['String']['output']>;
  metaData?: Maybe<Scalars['String']['output']>;
  netmask?: Maybe<Scalars['String']['output']>;
  networkUuid?: Maybe<Scalars['String']['output']>;
  nicBandWidth?: Maybe<VmNicBandWidth>;
  nicDevice?: Maybe<NicDevice>;
  physicalNic: PhysicalNic;
  resourceConfig?: Maybe<VmNicResourceConfig>;
  securityGroup?: Maybe<Array<SecurityGroup>>;
  securityPolicy?: Maybe<VmNicSecurityPolicy>;
  snat?: Maybe<Scalars['Boolean']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  templatedVmInstance?: Maybe<TemplateVmInstanceForVmNic>;
  type?: Maybe<Scalars['String']['output']>;
  usedIps?: Maybe<Array<UsedIp>>;
  uuid: Scalars['String']['output'];
  vmInstance?: Maybe<VmInstanceBase>;
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
}

export interface VmNicAttachedNetworkServices {
  networkServices?: Maybe<Array<Scalars['String']['output']>>;
}

export interface VmNicBandWidth {
  inboundBandwidth?: Maybe<Scalars['Float']['output']>;
  outboundBandwidth?: Maybe<Scalars['Float']['output']>;
}

export interface VmNicBindSecurityGroupInput {
  action: ActionInput;
  payload: VmNicBindSecurityGroupPayload;
}

export interface VmNicBindSecurityGroupPayload {
  securityGroupUuids: Array<Scalars['String']['input']>;
  vmNicUuid: Scalars['String']['input'];
}

export interface VmNicConflict {
  ip?: Maybe<Scalars['String']['output']>;
  mac?: Maybe<Scalars['String']['output']>;
  vmInstanceName?: Maybe<Scalars['String']['output']>;
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
  vmNicName?: Maybe<Scalars['String']['output']>;
}

export interface VmNicIp {
  ip?: Maybe<Scalars['String']['output']>;
  isStatic?: Maybe<Scalars['Boolean']['output']>;
  mac?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  /** vmNicIpUuid */
  vmNicIpUuid: Scalars['String']['output'];
  /** vmNicUuid */
  vmNicUuid: Scalars['String']['output'];
}

export interface VmNicIpListResp {
  error?: Maybe<ActionError>;
  list: Array<VmNicIp>;
  total: Scalars['Int']['output'];
}

export interface VmNicItem {
  internalName?: Maybe<Scalars['String']['output']>;
  ip?: Maybe<Scalars['String']['output']>;
  l3NetworkUuid?: Maybe<Scalars['String']['output']>;
  mac?: Maybe<Scalars['String']['output']>;
  usedIps?: Maybe<Array<UsedIp>>;
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
}

export interface VmNicListResp {
  error?: Maybe<ActionError>;
  list: Array<VmNic>;
  total: Scalars['Int']['output'];
}

export enum VmNicQueryType {
  CandidateVmNicForAttachEip = 'CandidateVmNicForAttachEip',
  CandidateVmNicForSecurityGroup = 'CandidateVmNicForSecurityGroup',
  GetPortForwardingAttachableVmNics = 'GetPortForwardingAttachableVmNics',
  PortMirrorCandidateVmNics = 'PortMirrorCandidateVmNics',
  VmNicInSecurityGroup = 'VmNicInSecurityGroup'
}

export interface VmNicResourceConfig {
  nicMultiQueueNum?: Maybe<Scalars['Int']['output']>;
}

export interface VmNicSecurityPolicy {
  egressPolicy?: Maybe<VmNicSecurityPolicyEnum>;
  ingressPolicy?: Maybe<VmNicSecurityPolicyEnum>;
}

export enum VmNicSecurityPolicyEnum {
  ALLOW = 'ALLOW',
  DENY = 'DENY'
}

export interface VmNicUnBindSecurityGroupInput {
  action: ActionInput;
  payload: VmNicUnBindSecurityGroupPayload;
}

export interface VmNicUnBindSecurityGroupPayload {
  securityGroupUuids: Array<Scalars['String']['input']>;
  vmNicUuid: Scalars['String']['input'];
}

export interface VmOccupyCapacity {
  actualSize?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface VmOwner {
  linkedAccountUuid?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
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

export interface VmRelatedResource {
  cdrom: Scalars['Int']['output'];
  gpu: Scalars['Int']['output'];
  lastVolume: Scalars['Int']['output'];
  lun: Scalars['Int']['output'];
  nic: Scalars['Int']['output'];
  pci: Scalars['Int']['output'];
  se: Scalars['Int']['output'];
  usb: Scalars['Int']['output'];
  vgpu: Scalars['Int']['output'];
  volume: Scalars['Int']['output'];
}

export interface VmSchedulingRule {
  createDate?: Maybe<Scalars['String']['output']>;
  /** 资源的详细描述 */
  description?: Maybe<Scalars['String']['output']>;
  excuteState?: Maybe<Scalars['String']['output']>;
  hostGroup?: Maybe<HostGroup>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  mode?: Maybe<VmSchedulingRuleMode>;
  /** 资源名称 */
  name: Scalars['String']['output'];
  rule?: Maybe<VmSchedulingRuleRule>;
  state?: Maybe<VmSchedulingRuleState>;
  /** 资源的UUID，唯一标示该资源 */
  uuid: Scalars['String']['output'];
  vmGroup?: Maybe<VmGroupBase>;
  zone?: Maybe<Zone>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface VmSchedulingRuleList {
  error?: Maybe<ActionError>;
  list: Array<VmSchedulingRule>;
  total: Scalars['Int']['output'];
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

export interface VmTemplate {
  actualSize?: Maybe<Scalars['BigInt']['output']>;
  cluster: Cluster;
  createDate: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  group?: Maybe<VMGroupDirectory>;
  host: HostVO;
  lastOpDate: Scalars['String']['output'];
  name: Scalars['String']['output'];
  shareType: ShareType;
  /** 云主机系统标签 */
  systemTag: VmInstanceSystemTag;
  uuid: Scalars['String']['output'];
  vm?: Maybe<VmInstance>;
  vmInstanceUuid: Scalars['String']['output'];
}

export interface VmTemplateQueryResp {
  list?: Maybe<Array<VmTemplate>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export enum VmTemplateQueryType {
  NORMAL = 'NORMAL',
  ZSV_SHARED_RESOURCE = 'ZSV_SHARED_RESOURCE'
}

export interface VmUsage {
  cpuUsed?: Maybe<Scalars['Float']['output']>;
  memoryUsed?: Maybe<Scalars['Float']['output']>;
  storageUsed?: Maybe<Scalars['Float']['output']>;
}

export interface VniRange {
  createDate?: Maybe<Scalars['String']['output']>;
  endVni?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  startVni?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface VniRangeResp {
  list?: Maybe<Array<VniRange>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface VniRanges {
  endVni?: Maybe<Scalars['Float']['output']>;
  startVni?: Maybe<Scalars['Float']['output']>;
}

export interface Volume {
  actualSize?: Maybe<Scalars['Float']['output']>;
  backupStatus?: Maybe<Scalars['String']['output']>;
  backupTaskStatus?: Maybe<State>;
  backupTaskType?: Maybe<VolumeBackupTaskType>;
  bandwidth?: Maybe<VolumeBandwidth>;
  capabilities: VolumeCapabilities;
  cdpTaskStatus?: Maybe<CdpTaskStatus>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  deviceId?: Maybe<Scalars['Int']['output']>;
  diskOfferingUuid?: Maybe<Scalars['String']['output']>;
  format?: Maybe<Scalars['String']['output']>;
  installPath?: Maybe<Scalars['String']['output']>;
  isHaveMemorySnapshot?: Maybe<Scalars['Boolean']['output']>;
  isHaveSnapshot?: Maybe<Scalars['Boolean']['output']>;
  isShareable?: Maybe<Scalars['Boolean']['output']>;
  lastAttachDate?: Maybe<Scalars['String']['output']>;
  /** 上次被卸载时间 */
  lastDetachDate?: Maybe<Scalars['String']['output']>;
  /** 云盘从云主机上卸载的原因 */
  lastDetachReason?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  /** 云盘从云主机上卸载之后上次所在云主机 */
  lastVmInstance?: Maybe<VmInstanceBase>;
  /** 云盘从云主机上卸载之后会生成lastVmInstanceUuid */
  lastVmInstanceUuid?: Maybe<Scalars['String']['output']>;
  /** 云盘从云主机上卸载之后上次所在云主机,包含虚拟机/虚拟机模板/虚拟机模板缓存 */
  lastVmOrTemplate?: Maybe<VmInstanceBase>;
  mineTags: Array<Tag>;
  name: Scalars['String']['output'];
  othersTags: Array<Tag>;
  owner?: Maybe<VolumeOwner>;
  primaryStorage?: Maybe<PrimaryStorageVO>;
  primaryStorageUuid?: Maybe<Scalars['String']['output']>;
  relatedResource?: Maybe<VolumeRelatedResource>;
  resourceConfig?: Maybe<VolumeResourceConfig>;
  rootImage?: Maybe<Image>;
  rootImageUuid?: Maybe<Scalars['String']['output']>;
  size: Scalars['Float']['output'];
  state: VolumeState;
  status: VolumeStatus;
  systemTag?: Maybe<VolumeSystemTag>;
  tag: Array<Tag>;
  templatedVmInstance?: Maybe<Array<VmInstanceBase>>;
  templatedVmInstanceCache?: Maybe<Array<VmInstanceBase>>;
  type: VolumeType;
  uuid: Scalars['String']['output'];
  vmInstance?: Maybe<Array<VmInstanceBase>>;
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
  volumeIoThreadPin?: Maybe<VolumeIoThreadPin>;
  volumeQos?: Maybe<Scalars['String']['output']>;
}


export interface VolumelastAttachDateArgs {
  vmInstanceUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface VolumeBackupDataSummary {
  /** 全量 */
  full?: Maybe<Scalars['Float']['output']>;
  /** 增量 */
  incremental?: Maybe<Scalars['Float']['output']>;
  /** 增量依赖 */
  incrementalDependency?: Maybe<Scalars['Float']['output']>;
  /** 资源UUID，只能是volumeUuid或vmInstanceUuid */
  resourceUuid: Scalars['String']['output'];
}

export enum VolumeBackupDataSummaryQueryType {
  VmInstance = 'VmInstance',
  Volume = 'Volume'
}

export enum VolumeBackupTaskType {
  BackupJob = 'BackupJob',
  OtherTasks = 'OtherTasks'
}

export interface VolumeBandwidth {
  iopsRead: Scalars['Float']['output'];
  iopsTotal: Scalars['Float']['output'];
  iopsWrite: Scalars['Float']['output'];
  volumeBandwidth: Scalars['Float']['output'];
  volumeBandwidthRead: Scalars['Float']['output'];
  volumeBandwidthReadUpthreshold: Scalars['Float']['output'];
  volumeBandwidthUpthreshold: Scalars['Float']['output'];
  volumeBandwidthWrite: Scalars['Float']['output'];
  volumeBandwidthWriteUpthreshold: Scalars['Float']['output'];
  volumeUuid?: Maybe<Scalars['String']['output']>;
}

export interface VolumeBase {
  actualSize?: Maybe<Scalars['Float']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  deviceId?: Maybe<Scalars['Float']['output']>;
  diskOfferingUuid?: Maybe<Scalars['String']['output']>;
  format?: Maybe<Scalars['String']['output']>;
  installPath?: Maybe<Scalars['String']['output']>;
  isShareable?: Maybe<Scalars['Boolean']['output']>;
  lastAttachDate?: Maybe<Scalars['String']['output']>;
  lastDetachDate?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  lastVmInstanceUuid?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  primaryStorageUuid?: Maybe<Scalars['String']['output']>;
  protocol?: Maybe<Scalars['String']['output']>;
  rootImageUuid?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
  volumeQos?: Maybe<Scalars['String']['output']>;
}

export interface VolumeCapabilities {
  MigrationInCurrentPrimaryStorage: Scalars['Boolean']['output'];
  MigrationToOtherPrimaryStorage: Scalars['Boolean']['output'];
}

export interface VolumeIoThreadPin {
  /** 后端返回是个String，设置的时候使用的是Number */
  ioThreadId?: Maybe<Scalars['String']['output']>;
  pin?: Maybe<Scalars['String']['output']>;
}

export interface VolumeList {
  error?: Maybe<ActionError>;
  list: Array<Volume>;
  total: Scalars['Int']['output'];
}

export interface VolumeMigrationAOInput {
  dstPrimaryStorageUuid: Scalars['String']['input'];
  volumeUuid: Scalars['String']['input'];
  withSnapshots?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface VolumeOccupyCapacity {
  actualSize?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface VolumeOwner {
  linkedAccountUuid?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uuid: Scalars['String']['output'];
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

export interface VolumeRelatedResource {
  backupData: Scalars['Int']['output'];
}

export interface VolumeResourceConfig {
  aionative?: Maybe<Scalars['String']['output']>;
  vmcacheMode?: Maybe<Scalars['String']['output']>;
}

export interface VolumeSnapshot {
  actualSize?: Maybe<Scalars['Float']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  current?: Maybe<Scalars['Boolean']['output']>;
  /** description */
  description?: Maybe<Scalars['String']['output']>;
  /** format */
  format?: Maybe<SnapshotFormat>;
  group?: Maybe<VolumeSnapshotGroup>;
  /** 快照组Uuid */
  groupUuid?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  latest?: Maybe<Scalars['Boolean']['output']>;
  /** name */
  name?: Maybe<Scalars['String']['output']>;
  /** parentUuid */
  parentUuid?: Maybe<Scalars['String']['output']>;
  /** 主存储 */
  primaryStorage?: Maybe<PrimaryStorage>;
  /** primaryStorageInstallPath */
  primaryStorageInstallPath?: Maybe<Scalars['String']['output']>;
  /** 主存储Uuid */
  primaryStorageUuid?: Maybe<Scalars['String']['output']>;
  /** size */
  size?: Maybe<Scalars['Float']['output']>;
  snapshotType?: Maybe<SnapshotType>;
  /** state */
  state?: Maybe<Scalars['String']['output']>;
  /** status */
  status?: Maybe<Scalars['String']['output']>;
  /** treeUuid */
  treeUuid?: Maybe<Scalars['String']['output']>;
  /** type */
  type?: Maybe<SnapshotGroupType>;
  uuid: Scalars['String']['output'];
  volume?: Maybe<Volume>;
  /** 云盘类型 */
  volumeType?: Maybe<Scalars['String']['output']>;
  /** volumeUuid */
  volumeUuid?: Maybe<Scalars['String']['output']>;
}

export interface VolumeSnapshotGroup {
  /** 创建时间 */
  createDate?: Maybe<Scalars['String']['output']>;
  /** 简介 */
  description?: Maybe<Scalars['String']['output']>;
  /** 最后操作时间 */
  lastOpDate?: Maybe<Scalars['String']['output']>;
  /** 名字 */
  name?: Maybe<Scalars['String']['output']>;
  /** 主存储 */
  primaryStorage?: Maybe<PrimaryStorage>;
  /** 快照数量 */
  snapshotCount?: Maybe<Scalars['String']['output']>;
  snapshotType?: Maybe<SnapshotType>;
  /** 总容量 */
  totalSize?: Maybe<Scalars['Float']['output']>;
  /** uuid */
  uuid: Scalars['String']['output'];
  /** 云主机 */
  vmInstance?: Maybe<VmInstance>;
  /** 云主机uuid */
  vmInstanceUuid?: Maybe<Scalars['String']['output']>;
  volumeSnapshotRefs?: Maybe<Array<VolumeSnapshotGroupRef>>;
}

export interface VolumeSnapshotGroupListResp {
  /** 查询结果列表 */
  list?: Maybe<Array<VolumeSnapshotGroup>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface VolumeSnapshotGroupRef {
  volumeLastAttachDate?: Maybe<Scalars['String']['output']>;
  volumeName?: Maybe<Scalars['String']['output']>;
  volumeSnapshotGroupUuid?: Maybe<Scalars['String']['output']>;
  volumeSnapshotUuid?: Maybe<Scalars['String']['output']>;
  volumeType?: Maybe<Scalars['String']['output']>;
  volumeUuid?: Maybe<Scalars['String']['output']>;
}

export interface VolumeSnapshotListResp {
  /** 查询结果列表 */
  list?: Maybe<Array<VolumeSnapshot>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface VolumeSnapshotTree {
  /** isCurrent */
  current?: Maybe<Scalars['Boolean']['output']>;
  /** 主存储 */
  primaryStorage?: Maybe<PrimaryStorage>;
  /** 主存储Uuid */
  primaryStorageUuid?: Maybe<Scalars['String']['output']>;
  /** tree */
  tree?: Maybe<Scalars['String']['output']>;
  /** uuid */
  uuid?: Maybe<Scalars['String']['output']>;
  /** volume */
  volume?: Maybe<Volume>;
  /** volumeUuid */
  volumeUuid?: Maybe<Scalars['String']['output']>;
}

export interface VolumeSnapshotTreeListResp {
  error?: Maybe<ActionError>;
  list: Array<VolumeSnapshotTree>;
  total: Scalars['Int']['output'];
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

export interface VolumeSummary {
  available?: Maybe<Scalars['Int']['output']>;
  destroyed?: Maybe<Scalars['Int']['output']>;
  disabled: Scalars['Int']['output'];
  enabled: Scalars['Int']['output'];
  notInstantiated?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface VolumeSystemTag {
  VirtioSCSI: Scalars['Boolean']['output'];
  VolumeProvisioningStrategy?: Maybe<VolumeProvisioningStrategy>;
  WWN?: Maybe<Scalars['String']['output']>;
  /** 总线类型 */
  capability?: Maybe<Scalars['String']['output']>;
  /** 存储池 */
  cephStoragePool?: Maybe<Scalars['String']['output']>;
  notSupportActualSize?: Maybe<Scalars['Boolean']['output']>;
  volumeAttributeUserConfig?: Maybe<Scalars['String']['output']>;
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

export interface VxlanPool {
  attachedCidr?: Maybe<Array<Scalars['String']['output']>>;
  attachedClusterUuids?: Maybe<Array<Scalars['String']['output']>>;
  attachedVtep?: Maybe<Array<AttachedVtepRefsType>>;
  attachedVxlanNetworkRefs?: Maybe<Array<AttachedVxlanNetworkRefsType>>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  physicalInterface?: Maybe<Scalars['String']['output']>;
  shareType: ShareType;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vlan?: Maybe<Scalars['Int']['output']>;
  vniRange: Array<VniRange>;
  vtepNum?: Maybe<Scalars['Int']['output']>;
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface VxlanPoolQueryResp {
  list?: Maybe<Array<VxlanPool>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface VxlanPoolQueryVtepResp {
  list?: Maybe<Array<AttachedVtepRefsType>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface VxlanPoolRelatedResource {
  cluster: Scalars['Int']['output'];
  vxlan: Scalars['Int']['output'];
}

export interface VxlanPools {
  attachedVniRanges?: Maybe<Array<AttachedVniRanges>>;
  attachedVtepRefs?: Maybe<Array<AttachedVtepRefs>>;
  attachedVxlanNetworkRefs?: Maybe<Array<AttachedVxlanNetworkRefs>>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  physicalInterface?: Maybe<Scalars['String']['output']>;
  sdnControllerUuid?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  zoneUuid?: Maybe<Scalars['String']['output']>;
}

export interface WeComEndPoint extends BasicEndPoint {
  atAll: Scalars['Boolean']['output'];
  atPersonList?: Maybe<Array<AtPersonListItem>>;
  /**
   *
   *       指定人员的数量：
   *       现阶段因为后端会直接返回 atPersonList，所以直接取 atPersonList.length 即可
   *       若后面后端遇到性能瓶颈，再让后端不走级联查询 atPersonList，由 node 端去查询数量：见 endpointQueryService.getAtPersonListCount
   *
   */
  atPersonListCount?: Maybe<Scalars['Float']['output']>;
  atPersonUserIds?: Maybe<Array<Scalars['String']['output']>>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<Owner>;
  platformUuid?: Maybe<Scalars['String']['output']>;
  state?: Maybe<EndPointState>;
  topic?: Maybe<SNSTopic>;
  type?: Maybe<EndPointType>;
  url?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface WebSSH {
  socketTimeout?: Maybe<Scalars['Float']['output']>;
}

export interface WidgetAlarmInfo {
  emergentCount?: Maybe<Scalars['Int']['output']>;
  importantCount?: Maybe<Scalars['Int']['output']>;
  latest10List?: Maybe<Array<AlarmHistories>>;
  normalCount?: Maybe<Scalars['Int']['output']>;
  top5ResourceList?: Maybe<Array<AlarmResourceInfo>>;
}

export interface WidgetMonitorL3NetworkTop {
  list?: Maybe<Array<WidgetMonitorTopL3Network>>;
  valueMax?: Maybe<Scalars['Float']['output']>;
}

export interface WidgetMonitorTop {
  list?: Maybe<Array<WidgetMonitorTopItem>>;
  valueMax?: Maybe<Scalars['Float']['output']>;
}

export interface WidgetMonitorTopItem {
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
}

export interface WidgetMonitorTopL3Network {
  l3Network?: Maybe<L3Network>;
  name?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
}

export interface WidgetMonitorTrend {
  currentValue?: Maybe<Array<Scalars['Float']['output']>>;
  list?: Maybe<Array<WidgetMonitorTrendItem>>;
}

export interface WidgetMonitorTrendItem {
  time?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
}

export interface WidgetQuotaUsage {
  computing?: Maybe<Array<WidgetQuotaUsageItem>>;
  network?: Maybe<Array<WidgetQuotaUsageItem>>;
  other?: Maybe<Array<WidgetQuotaUsageItem>>;
  storage?: Maybe<Array<WidgetQuotaUsageItem>>;
}

export interface WidgetQuotaUsageItem {
  name?: Maybe<Scalars['String']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  used?: Maybe<Scalars['Float']['output']>;
}

export interface WidgetResourceStateCount {
  attached?: Maybe<Scalars['Int']['output']>;
  connected?: Maybe<Scalars['Int']['output']>;
  disabled?: Maybe<Scalars['Int']['output']>;
  disconnected?: Maybe<Scalars['Int']['output']>;
  enabled?: Maybe<Scalars['Int']['output']>;
  idle?: Maybe<Scalars['Int']['output']>;
  notAttached?: Maybe<Scalars['Int']['output']>;
  notInstantiated?: Maybe<Scalars['Int']['output']>;
  other?: Maybe<Scalars['Int']['output']>;
  ready?: Maybe<Scalars['Int']['output']>;
  running?: Maybe<Scalars['Int']['output']>;
  stopped?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface WidgetUserInfo {
  accountNum?: Maybe<Scalars['Int']['output']>;
  identity?: Maybe<Scalars['String']['output']>;
  platformTime?: Maybe<Scalars['Float']['output']>;
  projectAdminName?: Maybe<Scalars['String']['output']>;
  projectName?: Maybe<Scalars['String']['output']>;
  projectNum?: Maybe<Scalars['Int']['output']>;
  userInProjectNum?: Maybe<Scalars['Int']['output']>;
  virtualIDCount?: Maybe<Scalars['Int']['output']>;
}

export enum WithMemoryByResourceType {
  L2NetworkVO = 'L2NetworkVO',
  L3NetworkVO = 'L3NetworkVO'
}

export interface WizardInfo {
  hostList: Array<NodeInfo>;
  storageClusterNetwork?: Maybe<Scalars['String']['output']>;
  storageInfo?: Maybe<StorageInfo>;
  storagePublicNetwork?: Maybe<Scalars['String']['output']>;
  tenantNetwork?: Maybe<TenantNetwork>;
}

export interface XMLHookList {
  list?: Maybe<Array<XmlHook>>;
  total: Scalars['Float']['output'];
}

export interface XmlHook {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  hookScript?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<XmlHookType>;
  uuid: Scalars['String']['output'];
  vmUuids?: Maybe<Array<Scalars['String']['output']>>;
}

export enum XmlHookType {
  Customization = 'Customization',
  System = 'System'
}

export interface ZMigrateGlobalConfig {
  /** base64-encoded password of ssh user on gateway */
  gatewaySshPassword?: Maybe<Scalars['String']['output']>;
  /** uuid of platform account */
  platformAccountUuid?: Maybe<Scalars['String']['output']>;
  /** uuid of platform region */
  platformRegionUuid?: Maybe<Scalars['String']['output']>;
}

export interface ZMigrateRuntimeConfig {
  /** IP of the zmigrate gateway host VM */
  gatewayHostIp?: Maybe<Scalars['String']['output']>;
  globalConfigs?: Maybe<ZMigrateGlobalConfig>;
  /** ZSV Java MN Server address (e.g. http://host:8080), read from ZS_MN_SERVER env var */
  zsMnServer?: Maybe<Scalars['String']['output']>;
}

export interface ZQLGetMetricDataListArgs {
  /** 用来存放资源的UUID，和资源的conditions(不是MetricData的condition)。 */
  conditions?: InputMaybe<Array<Condition>>;
  /** 多个监控项可以一起查询。 */
  metricParams: Array<MetricParam>;
  type: GetMetricDataQueryType;
}

export interface ZSVBackupStorage {
  attachedZoneRefUuids?: Maybe<Array<Scalars['String']['output']>>;
  attachedZoneUuids?: Maybe<Array<Scalars['String']['output']>>;
  availableCapacity?: Maybe<Scalars['BigInt']['output']>;
  /** 备份存储关联的备份任务 */
  backupJobCount: Scalars['Float']['output'];
  /** 备份存储类型 */
  backupStorageType: Scalars['String']['output'];
  cidr?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  hostname?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  sshPort?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<BackupStorageState>;
  status?: Maybe<BackupStorageStatus>;
  totalCapacity?: Maybe<Scalars['BigInt']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface ZSVBackupStorageOfBackupJobSummary {
  total?: Maybe<Scalars['Int']['output']>;
}

export interface ZSVBackupStorageQueryResp {
  error?: Maybe<ActionError>;
  list?: Maybe<Array<ZSVBackupStorage>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export enum ZSVBackupStorageQueryType {
  Normal = 'Normal'
}

export interface ZSVBackupStorageSystemTags {
  createDate?: Maybe<Scalars['String']['output']>;
  inherent?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  resourceUuid?: Maybe<Scalars['String']['output']>;
  tag?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
}

export interface ZSVBackupStorageSystemTagsQueryResp {
  error?: Maybe<ActionError>;
  list?: Maybe<Array<ZSVBackupStorageSystemTags>>;
  total?: Maybe<Scalars['Int']['output']>;
}

export interface ZSVCdrom {
  cdRom: Scalars['String']['input'];
  isoUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface ZSVCpuBindListByVCpuItem {
  pCPUList?: Array<Scalars['String']['input']>;
  vCPU: Scalars['String']['input'];
}

export interface ZSVCreateVmFromBackupDataInput {
  action: ActionInput;
  payload: ZSVCreateVmFromBackupDataPayload;
}

export interface ZSVCreateVmFromBackupDataPayload {
  clusterUuid?: InputMaybe<Scalars['String']['input']>;
  cpuNum?: InputMaybe<Scalars['Int']['input']>;
  dataVolumeSystemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  defaultL3NetworkUuid?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  diskAOs?: InputMaybe<Array<DiskAO>>;
  hostUuid?: InputMaybe<Scalars['String']['input']>;
  l3NetworkUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  memorySize?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  primaryStorageUuidForRootVolume?: InputMaybe<Scalars['String']['input']>;
  /** 内存预留大小 */
  reservedMemorySize?: InputMaybe<Scalars['Float']['input']>;
  resetTpm?: InputMaybe<Scalars['Boolean']['input']>;
  rootVolumeSystemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  strategy?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  vmNicParams?: InputMaybe<Scalars['String']['input']>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface ZSVNicConfig {
  customMac?: InputMaybe<Scalars['String']['input']>;
  dns6List?: InputMaybe<Array<Scalars['String']['input']>>;
  dnsList?: InputMaybe<Array<Scalars['String']['input']>>;
  driverType?: Scalars['String']['input'];
  eipList?: Array<Scalars['String']['input']>;
  enableSRIOV?: Scalars['Boolean']['input'];
  inboundBandwidth?: Scalars['String']['input'];
  ipv4Gateway?: InputMaybe<Scalars['String']['input']>;
  ipv4Netmask?: InputMaybe<Scalars['String']['input']>;
  ipv6Gateway?: InputMaybe<Scalars['String']['input']>;
  ipv6Prefix?: InputMaybe<Scalars['Int']['input']>;
  l3NetworkUuid?: InputMaybe<Scalars['String']['input']>;
  nicMultiQueueNum?: Scalars['String']['input'];
  outboundBandwidth?: Scalars['String']['input'];
  securityGroupList?: Array<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  staticIp?: InputMaybe<Scalars['String']['input']>;
  staticIpv6?: InputMaybe<Scalars['String']['input']>;
  systemTags?: InputMaybe<Array<Scalars['String']['input']>>;
  vfParentUuid?: Scalars['String']['input'];
}

export interface ZSVRecoverBackupDataInput {
  action: ActionInput;
  payload: ZSVRecoverBackupDataPayload;
}

export interface ZSVRecoverBackupDataPayload {
  isStartVm?: InputMaybe<Scalars['Boolean']['input']>;
  isStopVm?: InputMaybe<Scalars['Boolean']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  vmUuid?: InputMaybe<Scalars['String']['input']>;
  zoneUuid?: InputMaybe<Scalars['String']['input']>;
}

export interface ZSVRevertVolumeFromSnapshotInput {
  action: ActionInput;
  payload: Array<ZSVRevertVolumeFromSnapshotPayload>;
}

export interface ZSVRevertVolumeFromSnapshotPayload {
  isStartVm?: InputMaybe<Scalars['Boolean']['input']>;
  isStopVm?: InputMaybe<Scalars['Boolean']['input']>;
  type: SnapshotType;
  uuids: Array<Scalars['String']['input']>;
  vmUuid?: InputMaybe<Scalars['String']['input']>;
  withMemory?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface ZSVUSBConfig {
  attachType?: InputMaybe<Scalars['String']['input']>;
  usbDeviceUuid: Scalars['String']['input'];
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

export interface ZWatchAlarmVO {
  actions?: Maybe<Array<AlarmActions>>;
  comparisonOperator?: Maybe<Scalars['String']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  emergencyLevel?: Maybe<EmergencyLevel>;
  enableRecovery?: Maybe<Scalars['Boolean']['output']>;
  eventName?: Maybe<Scalars['String']['output']>;
  /** 报警器关联的虚拟机 ，过滤模板虚拟机/模板缓存/已删除状态的虚拟机后的数量 */
  filteredAlarmResourceCount?: Maybe<Scalars['Int']['output']>;
  labels?: Maybe<Array<AlarmLabels>>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  metricName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  namespace?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<BasicOwner>;
  period?: Maybe<Scalars['Float']['output']>;
  platform?: Maybe<ThirdpartyPlatform>;
  repeatCount?: Maybe<Scalars['Float']['output']>;
  repeatInterval?: Maybe<Scalars['Float']['output']>;
  state?: Maybe<AlarmState>;
  status?: Maybe<AlarmStatus>;
  thirdpartyPlatformName?: Maybe<Scalars['String']['output']>;
  threshold?: Maybe<Scalars['Float']['output']>;
  topicNum?: Maybe<Scalars['Int']['output']>;
  userTag?: Maybe<UserTag>;
  uuid: Scalars['String']['output'];
  zhName?: Maybe<Scalars['String']['output']>;
}

export interface ZWatchAlarmVoResp {
  /** 查询结果列表 */
  list?: Maybe<Array<ZWatchAlarmVO>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface ZWatchEvent {
  /** ZWatch消息 */
  payload?: Maybe<Scalars['String']['output']>;
  /** websocket消息按照 sessionId 分发 */
  sessionId: Scalars['String']['output'];
}

export interface Zone {
  backupStorageCount?: Maybe<Scalars['Int']['output']>;
  clusterCount?: Maybe<Scalars['Int']['output']>;
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  hostCount?: Maybe<Scalars['Int']['output']>;
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  l2NetworkCount?: Maybe<Scalars['Int']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  primaryStorageCount?: Maybe<Scalars['Int']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
  vmInstanceCount?: Maybe<Scalars['Int']['output']>;
  volumeCount?: Maybe<Scalars['Int']['output']>;
}

export interface ZoneRelatedSummary {
  backupStorageTotal: Scalars['Int']['output'];
  baremetal2ClusterTotal: Scalars['Int']['output'];
  baremetalClusterTotal: Scalars['Int']['output'];
  clusterTotal: Scalars['Int']['output'];
  l2NetworkTotal: Scalars['Int']['output'];
  primaryStorageTotal: Scalars['Int']['output'];
}

export interface ZoneResponse {
  list: Array<Zone>;
  total?: Maybe<Scalars['Int']['output']>;
}

export enum ZoneStateEvent {
  disable = 'disable',
  enable = 'enable'
}

export interface ZsKvResult {
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
}

export interface ZsvRevokeResourceSharingInput {
  action: ActionInput;
  payload: ZsvRevokeResourceSharingPayload;
}

export interface ZsvRevokeResourceSharingPayload {
  accountUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  all?: InputMaybe<Scalars['Boolean']['input']>;
  resourceUuids: Array<Scalars['String']['input']>;
  toPublic?: InputMaybe<Scalars['Boolean']['input']>;
  userGroupUuids?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface ZsvRole {
  createDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  lastOpDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  policies?: Maybe<Array<Scalars['String']['output']>>;
  type?: Maybe<ZsvRoleQueryType>;
  uiPrivilege?: Maybe<Scalars['String']['output']>;
  userCount?: Maybe<Scalars['Int']['output']>;
  userGroupCount?: Maybe<Scalars['Int']['output']>;
  uuid: Scalars['String']['output'];
}

export interface ZsvRoleList {
  /** 查询结果列表 */
  list?: Maybe<Array<ZsvRole>>;
  /** 查询结果总数 */
  total?: Maybe<Scalars['Float']['output']>;
}

export interface ZsvRolePoliciesInput {
  actions: Array<Scalars['String']['input']>;
  effect: Scalars['String']['input'];
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

export interface ZsvRoleUIPrivilege {
  customRoles?: Maybe<Array<ZsvRole>>;
  customUIPrivilege?: Maybe<Scalars['String']['output']>;
  systemRoles?: Maybe<Array<ZsvRole>>;
}

export interface ZsvRoleUIPrivilegeInput {
  actionKey: Scalars['String']['input'];
  actions: Array<Scalars['String']['input']>;
  effect: Scalars['String']['input'];
  resourceType: Scalars['String']['input'];
  viewKey: Scalars['String']['input'];
  views: Array<Scalars['String']['input']>;
}

export interface ZsvShareResourceFromAccountInput {
  action: ActionInput;
  payload: ZsvShareResourceFromAccountPayload;
}

export interface ZsvShareResourceFromAccountPayload {
  accountUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  resourceUuids: Array<Array<Scalars['String']['input']>>;
  userGroupUuids?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface ZsvShareResourcePayload {
  accountUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  prevShareType?: InputMaybe<Scalars['String']['input']>;
  resourceUuids: Array<Array<Scalars['String']['input']>>;
  userGroupUuids?: InputMaybe<Array<Scalars['String']['input']>>;
}

export interface ZsvShareResourceToGroupInput {
  action: ActionInput;
  payload: ZsvShareResourcePayload;
}

export interface ZwatchAlarmActionsInput {
  actionType: Scalars['String']['input'];
  actionUuid: Scalars['String']['input'];
  alarmUuid?: InputMaybe<Scalars['String']['input']>;
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
