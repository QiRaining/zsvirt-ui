import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { BackupStorageService } from '@/hardware-resource/backup-storage/backup-storage.service'
import { CbdMdsService } from '@/hardware-resource/cbd-mds/cbd-mds.service'
import { CephMonService } from '@/hardware-resource/ceph-mon/ceph-mon.service'
import { CephPrimaryStoragePoolQueryService } from '@/hardware-resource/ceph-primary-storage-pool/ceph-primary-storage-pool-query/ceph-primary-storage-pool-query.service'
import { ClusterService } from '@/hardware-resource/cluster/cluster.service'
import { ConfigFileService } from '@/hardware-resource/config-file/config-file.service'
import { QueryExternalPrimaryStoragePoolService } from '@/hardware-resource/external-primary-storage-pool/external-primary-storage-pool-query/external-primary-storage-pool-query.service'
import { FiberChannelStorageQueryService } from '@/hardware-resource/fiber-channel-storage/fiber-channel-storage-query/fiber-channel-storage-query.service'
import { HostKernelInterfaceQueryService } from '@/hardware-resource/host-kernel-interface/query/host-kernel-interface-query.service'
import { HostQueryService } from '@/hardware-resource/host/query/host-query.service'
import { IscsiLunQueryService } from '@/hardware-resource/iscsi-lun/iscsi-lun-query/iscsi-lun-query.service'
import { IscsiServerQueryService } from '@/hardware-resource/iscsi-server/iscsi-server-query/iscsi-server-query.service'
import { L2NetworkService } from '@/hardware-resource/l2-network/l2.network.service'
import { NVMeLunQueryService } from '@/hardware-resource/nvme-lun/nvme-lun-query.service'
import { NvmeTargetQueryService } from '@/hardware-resource/nvme-storage/nvme-storage-query.service'
import { PciDeviceQueryService } from '@/hardware-resource/pci-device/pci-device-query/pci-device-query.service'
import { PhysicalNetworkBondService } from '@/hardware-resource/physical-network-bond/physical-network-bond.service'
import { PhysicalNetworkInterfaceService } from '@/hardware-resource/physical-network-interface/physical-network-interface.service'
import { PrimaryStorageQueryService } from '@/hardware-resource/primary-storage/primary-storage-query/primary-storage-query.service'
import { SeDeviceService } from '@/hardware-resource/se-device/se.device.service'
import { StorageAdapterService } from '@/hardware-resource/storage-adapter/storage-adapter.service'
import { UsbDeviceService } from '@/hardware-resource/usb-device/usb.device.service'
import { VGpuDeviceService } from '@/hardware-resource/vgpu-device/vgpu-device.service'
import { ZoneService } from '@/hardware-resource/zone/zone.service'
import { AuditService } from '@/maintenance/audit/audit.service'
import { MonitorGroupService } from '@/maintenance/monitor-group/monitor-group.service'
import { MonitorTemplateService } from '@/maintenance/monitor-template/monitor-template.service'
import { StackTemplateService } from '@/maintenance/resource-stack-template/stack-template.service'
import { ResourceStackService } from '@/maintenance/resource-stack/resource-stack.service'
import { AlarmHistoriesService } from '@/maintenance/zwatch-alarm-histories/zwatch-alarm-histories.service'
import { ZWatchAlarmQueryService } from '@/maintenance/zwatch-alarm/zwatch-alarm-query/zwatch-alarm-query.service'
import { EndpointQueryService } from '@/maintenance/zwatch-endpoint/query/query.service'
import { SNSDingTalkAtPersonQueryService } from '@/maintenance/zwatch-sns-dingtalk-at-person/query/query.service'
import { SNSFeiShuAtPersonQueryService } from '@/maintenance/zwatch-sns-feishu-at-person/query/query.service'
import { SNSTextTemplateService } from '@/maintenance/zwatch-sns-text-template/sns-text-template.service'
import { SNSWeComAtPersonQueryService } from '@/maintenance/zwatch-sns-wecom-at-person/query/query.service'
import { IpService } from '@/network-resource/l3-network/ip/ip.service'
import { QueryL3NetworkService } from '@/network-resource/l3-network/query/query.service'
import { VirtualRouterOfferingService } from '@/network-resource/virtual-router-offering/virtual-router-offering.service'
import { VRouterRouteTableService } from '@/network-resource/vrouter-route-table/vrouter-route-table.service'
import { VxlanPoolService } from '@/network-resource/vxlan-pool/vxlan-pool.service'
import { EipService } from '@/network-service/eip/eip.service'
import { PortMirrorService } from '@/network-service/port-mirror/port-mirror.service'
import { SecurityGroupService } from '@/network-service/security-group/security-group.service'
import { SlbOfferingQueryService } from '@/network-service/slb-offering/slb-offering-query/slb-offering-query.service'
import { AccessControlRuleQueryService } from '@/zsphere-administration/access-control-rule/query/access-control-rule.query.service'
import { AccessKeyService } from '@/zsphere-administration/accesskey-management/accesskey-management.service'
import { AccountQueryService } from '@/zsphere-administration/account/query'
import { EmailServerSettingService } from '@/zsphere-administration/email-server-setting/query/email-server-setting-query'
import { OperationLogService } from '@/zsphere-administration/operation-log/operation-log.service'
import { OwnerService } from '@/zsphere-administration/owner/owner.service'
import { SchedHistoryLogService } from '@/zsphere-administration/sched-history-log/sched-history-log.service'
import { SchedulerJobQueryService } from '@/zsphere-administration/scheduler-job/scheduler-job-query/scheduler-job-query.service'
import { SchedulerTriggerService } from '@/zsphere-administration/scheduler-trigger/scheduler-trigger.service'
import { SnmpManagementService } from '@/zsphere-administration/snmp-management/snmp-management-query/snmp-management-query.service'
import { SystemSchedulingTaskService } from '@/zsphere-administration/system-scheduling-task/system-scheduling-task.service'
import { TagService } from '@/zsphere-administration/tag/tag.service'
import { UserGroupQueryService } from '@/zsphere-administration/user-group/query/user-group-query.service'
import { ZsvRoleQueryService } from '@/zsphere-administration/zsv-role/query/zsv-role-query.service'
import { BackupDataQueryService } from '@/zsphere-data-protection/backup-data/backup-data-query/backup-data-query.service'
import { DatabaseBackupQueryService } from '@/zsphere-data-protection/backup-data/database-backup-query/database-backup-query.service'
import { SchedulerJobGroupQueryService } from '@/zsphere-data-protection/backup-job/scheduler-job-group-query/scheduler-job-group-query.service'
import { QueryLocalBackupStorageService } from '@/zsphere-data-protection/local-backup-storage/query/local-backup-storage-query'
import { QueryZSVBackupStorageService } from '@/zsphere-data-protection/zsv-backup-storage/query/zsv-backup-storage-query'
import { MigrationServiceService } from '@/zsphere-monitoring-om/migration-service/migration-service.service'
import { ResourceAttributeService } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.service'
import { BaremetalInstanceQueryService } from '@/zsphere-resource/baremetal/baremetal-instance/query/baremetal-instance-query.service'
import { PreconfigurationTemplateQueryService } from '@/zsphere-resource/baremetal/preconfiguration-template/query/query-preconfiguration-template'
import { BlockSnapshotService } from '@/zsphere-resource/block-snapshot/block-snapshot.service'
import { BlockVolumeService } from '@/zsphere-resource/block-volume/block-volume.service'
import { CdRomsService } from '@/zsphere-resource/cdroms/cdroms.service'
import { HostGroupService } from '@/zsphere-resource/host-group/host-group.service'
import { ImageQueryService } from '@/zsphere-resource/image/image-query/image-query.service'
import { InstanceOfferingService } from '@/zsphere-resource/instance-offering/instance-offering.service'
import { KmsProviderQueryService } from '@/zsphere-resource/kms-provider/kms-provider.service'
import { PciDeviceSpecService } from '@/zsphere-resource/pci-device-spec/pci-device-spec.service'
import { ZSVResourceSnapshotQueryService } from '@/zsphere-resource/resource-snapshot/resource-snapshot-query/zsv-snapshot-query.service'
import { SshKeyPairQueryService } from '@/zsphere-resource/ssh-key-pair/ssh-key-pair-query/ssh-key-pair-query.service'
import { VGpuDeviceSpecService } from '@/zsphere-resource/vgpu-device-spec/vgpu-device-spec.service'
import { VmGroupService } from '@/zsphere-resource/vm-group/vm-group.service'
import { VmInstanceQueryService } from '@/zsphere-resource/vm-instance/vm-instance-query/vm-instance-query.service'
import { QueryVmNicService } from '@/zsphere-resource/vm-nic/query/query.service'
import { VmSchedulingRuleService } from '@/zsphere-resource/vm-scheduling-rule/vm-scheduling-rule.service'
import { VmSpecQueryService } from '@/zsphere-resource/vm-spec/query/vm-spec-query.service'
import { VmTemplateService } from '@/zsphere-resource/vm-template/query/query.service'
import { VolumeQueryService } from '@/zsphere-resource/volume/volume-query/volume-query.service'
import { SecretResourcePoolQueryService } from '@/zstack-cloud-code/crypto-compliance/secret-resource-pool/query/secret-resource-pool.query.service'
import { SecretServerQueryService } from '@/zstack-cloud-code/crypto-compliance/secret-server/query/secret-server.query.service'
import { SecurityMachineQueryService } from '@/zstack-cloud-code/crypto-compliance/security-machine/query/security-machine.query.service'

import { ConditionCount, FuzzyQueryArgs, FuzzyQueryResponse } from './fuzzy-query.model'

@Resolver(() => ConditionCount)
export class FuzzyQueryResolver {
  @Inject() accessControlRuleQueryService: AccessControlRuleQueryService
  @Inject() accessKeyService: AccessKeyService
  @Inject() accountQueryService: AccountQueryService
  @Inject() alarmHistoriesService: AlarmHistoriesService
  @Inject() auditService: AuditService
  @Inject() backupDataQueryService: BackupDataQueryService
  @Inject() backupStorageService: BackupStorageService
  @Inject() baremetalInstanceQueryService: BaremetalInstanceQueryService
  @Inject() blockSnapshotService: BlockSnapshotService
  @Inject() blockVolumeService: BlockVolumeService
  @Inject() cbdMdsService: CbdMdsService
  @Inject() cdRomsService: CdRomsService
  @Inject() cephMonService: CephMonService
  @Inject()
  cephPrimaryStoragePoolQueryService: CephPrimaryStoragePoolQueryService
  @Inject() clusterService: ClusterService
  @Inject() configFileService: ConfigFileService
  @Inject() DatabaseBackupQueryService: DatabaseBackupQueryService
  @Inject() eipService: EipService
  @Inject() emailServerSettingService: EmailServerSettingService
  @Inject() endpointQueryService: EndpointQueryService
  @Inject() fiberChannelStorageQueryService: FiberChannelStorageQueryService
  @Inject() hostGroupService: HostGroupService
  @Inject() hostKernelInterfaceQueryService: HostKernelInterfaceQueryService
  @Inject() hostQueryService: HostQueryService
  @Inject() imageQueryService: ImageQueryService
  @Inject() instanceOfferingService: InstanceOfferingService
  @Inject() ipService: IpService
  @Inject() iscsiLunQueryService: IscsiLunQueryService
  @Inject() iscsiServerQueryService: IscsiServerQueryService
  @Inject() l2NetworkService: L2NetworkService
  @Inject() monitorGroupService: MonitorGroupService
  @Inject() monitorTemplateService: MonitorTemplateService
  @Inject() nVMeLunQueryService: NVMeLunQueryService
  @Inject() nvmeTargetQueryService: NvmeTargetQueryService
  @Inject() operationLogService: OperationLogService
  @Inject() ownerService: OwnerService
  @Inject() pciDeviceQueryService: PciDeviceQueryService
  @Inject() pciDeviceSpecService: PciDeviceSpecService
  @Inject() physicalNetworkBondService: PhysicalNetworkBondService
  @Inject() physicalNetworkInterfaceService: PhysicalNetworkInterfaceService
  @Inject() portMirrorService: PortMirrorService
  @Inject()
  preconfigurationTemplateQueryService: PreconfigurationTemplateQueryService
  @Inject() primaryStorageQueryService: PrimaryStorageQueryService
  @Inject()
  queryExternalPrimaryStoragePoolService: QueryExternalPrimaryStoragePoolService
  @Inject() queryL3NetworkService: QueryL3NetworkService
  @Inject() queryLocalBackupStorageService: QueryLocalBackupStorageService
  @Inject() queryVmNicService: QueryVmNicService
  @Inject() queryZSVBackupStorageService: QueryZSVBackupStorageService
  @Inject() resourceStackService: ResourceStackService
  @Inject() schedHistoryLogService: SchedHistoryLogService
  @Inject() schedulerJobGroupQueryService: SchedulerJobGroupQueryService
  @Inject() schedulerJobQueryService: SchedulerJobQueryService
  @Inject() schedulerTriggerService: SchedulerTriggerService
  @Inject() secretResourcePoolQueryService: SecretResourcePoolQueryService
  @Inject() secretServerQueryService: SecretServerQueryService
  @Inject() securityGroupService: SecurityGroupService
  @Inject() securityMachineQueryService: SecurityMachineQueryService
  @Inject() seDeviceService: SeDeviceService
  @Inject() slbOfferingQueryService: SlbOfferingQueryService
  @Inject() sNSTextTemplateService: SNSTextTemplateService
  @Inject() snmpManagementService: SnmpManagementService
  @Inject() snsDingTalkAtPersonQueryService: SNSDingTalkAtPersonQueryService
  @Inject() snsFeiShuAtPersonQueryService: SNSFeiShuAtPersonQueryService
  @Inject() snsWeComAtPersonQueryService: SNSWeComAtPersonQueryService
  @Inject() sshKeyPairQueryService: SshKeyPairQueryService
  @Inject() stackTemplateService: StackTemplateService
  @Inject() storageAdapterService: StorageAdapterService
  @Inject() systemSchedulingTaskService: SystemSchedulingTaskService
  @Inject() tagService: TagService
  @Inject() usbDeviceService: UsbDeviceService
  @Inject() userGroupQueryService: UserGroupQueryService
  @Inject() vGpuDeviceService: VGpuDeviceService
  @Inject() vGpuDeviceSpecService: VGpuDeviceSpecService
  @Inject() virtualRouterOfferingService: VirtualRouterOfferingService
  @Inject() vmGroupService: VmGroupService
  @Inject() vmInstanceQueryService: VmInstanceQueryService
  @Inject() vmSchedulingRuleService: VmSchedulingRuleService
  @Inject() vmTemplateService: VmTemplateService
  @Inject() volumeQueryService: VolumeQueryService
  @Inject() vRouterRouteTableService: VRouterRouteTableService
  @Inject() vxlanPoolService: VxlanPoolService
  @Inject() zsvBackupStorageService: QueryZSVBackupStorageService
  @Inject() zsvResourceSnapshotQueryService: ZSVResourceSnapshotQueryService
  @Inject() zsvRoleService: ZsvRoleQueryService
  @Inject() zwatchAlarmQueryService: ZWatchAlarmQueryService
  @Inject() zoneService: ZoneService
  @Inject() migrationServiceService: MigrationServiceService
  @Inject() resourceAttributeService: ResourceAttributeService
  @Inject() vmSpecQueryService: VmSpecQueryService
  @Inject() kmsProviderQueryService: KmsProviderQueryService

  @Query(() => FuzzyQueryResponse)
  async fuzzyQuery(@Args() queryArgs: FuzzyQueryArgs) {
    const { resourceType, resourceConditions, conditions, ...restArgs } = queryArgs

    const callList = resourceConditions.map(item => {
      const variables = {
        ...restArgs,
        conditions: [item, ...conditions],
        replyWithCount: true,
        limit: 1,
        start: 0
      } as any
      switch (resourceType) {
        case 'VmInstance':
          return this.vmInstanceQueryService.get(variables)
        case 'Volume':
          return this.volumeQueryService.queryList(variables)
        case 'BlockVolume':
          return this.blockVolumeService.query(variables)
        case 'Image':
          return this.imageQueryService.queryList(variables)
        case 'InstanceOffering':
          return this.instanceOfferingService.query(variables)
        case 'PciDeviceSpec':
          return this.pciDeviceSpecService.queryPciDeviceSpec(variables)
        case 'VGpuDeviceSpec':
          return this.vGpuDeviceSpecService.queryVGpuDeviceSpec(variables)
        case 'Snapshot':
          return this.zsvResourceSnapshotQueryService.queryList(variables)
        case 'VmGroup':
          return this.vmGroupService.queryList(variables)
        case 'HostGroup':
          return this.hostGroupService.queryList(variables)
        case 'VmSchedulingRule':
          return this.vmSchedulingRuleService.queryList(variables)
        case 'Zone':
          return this.zoneService.getZoneList(variables)
        case 'Cluster':
          return this.clusterService.clusterList(variables)
        case 'SshKeyPair':
          return this.sshKeyPairQueryService.queryList(variables)
        case 'Host':
          return this.hostQueryService.query(variables)
        case 'PrimaryStorage':
          return this.primaryStorageQueryService.query(variables)
        case 'CephPrimaryStoragePool':
          return this.cephPrimaryStoragePoolQueryService.queryList(variables)
        case 'VHostPrimaryStoragePool':
          return this.queryExternalPrimaryStoragePoolService.query(variables)
        case 'BackupStorage':
          return this.backupStorageService.queryList(variables)
        case 'SchedulerJobGroup':
          return this.schedulerJobGroupQueryService.queryList(variables)
        case 'AccessKey':
          return this.accessKeyService.query(variables)
        case 'AccessKeyThirdparty':
          return this.accessKeyService.queryThirdpartyList(variables)
        case 'CephMon':
          return this.cephMonService.queryMonsList(variables)
        case 'IscsiServer':
          return this.iscsiServerQueryService.queryList(variables)
        case 'FiberChannelStorage':
          return this.fiberChannelStorageQueryService.queryList(variables)
        case 'L2Network':
          return this.l2NetworkService.query(variables)
        case 'VxlanPool':
          return this.vxlanPoolService.query(variables)
        case 'L3Network':
          return this.queryL3NetworkService.query(variables)
        case 'VirtualRouterOffering':
          return this.virtualRouterOfferingService.queryList(variables)
        case 'PciDevice':
          return this.pciDeviceQueryService.get(variables)
        case 'VGpuDevice':
          return this.vGpuDeviceService.queryVGpuDevice(variables)
        case 'Usb':
          return this.usbDeviceService.query(variables)
        case 'Se':
          return this.seDeviceService.query(variables)
        case 'Tag':
          return this.tagService.query(variables)
        case 'SecurityGroup':
          return this.securityGroupService.query(variables)
        case 'Eip':
          return this.eipService.query(variables)
        case 'SlbOffering':
          return this.slbOfferingQueryService.queryList(variables)
        case 'PortMirror':
          return this.portMirrorService.getPortMirrorList(variables)
        case 'VRouterRouteTable':
          return this.vRouterRouteTableService.queryList(variables)
        case 'VRouterRouteEntry':
          return this.vRouterRouteTableService.queryVRouterRouteEntryList(variables)
        case 'Audit':
          return this.auditService.queryAuditList(variables)
        case 'OperationLog':
          return this.operationLogService.queryAction(variables)
        case 'Alarm':
          return this.zwatchAlarmQueryService.queryZWatchAlarm(variables)
        case 'AlarmHistory':
          return this.alarmHistoriesService.queryList(variables)
        case 'SchedulerJob':
          return this.schedulerJobQueryService.queryList(variables)
        case 'SchedulerTrigger':
          return this.schedulerTriggerService.schedulerTriggerList(variables)
        case 'VmNic':
          return this.queryVmNicService.query(variables)
        case 'LocalBackupStorage':
          return this.queryLocalBackupStorageService.query(variables)
        case 'LocalBackupData':
          return this.DatabaseBackupQueryService.queryList(variables)
        case 'CDRoms':
          return this.cdRomsService.query(variables)
        case 'IscsiLun':
          return this.iscsiLunQueryService.queryList(variables)
        case 'IpStatistic':
          return this.ipService.getL3NetworkIpStatistic(variables)
        case 'Vni':
          return this.vxlanPoolService.queryVniRange(variables)
        case 'MonitorTemplate':
          return this.monitorTemplateService.queryList(variables)
        case 'SNSTextTemplate':
          return this.sNSTextTemplateService.query(variables)
        case 'BaremetalInstance':
          return this.baremetalInstanceQueryService.query(variables)
        case 'PreconfigurationTemplate':
          return this.preconfigurationTemplateQueryService.queryList(variables)
        case 'stackTemplate':
          return this.stackTemplateService.query(variables)
        case 'emailServerSetting':
          return this.emailServerSettingService.query(variables)
        case 'Owner':
          return this.ownerService.queryOwner(variables)
        case 'SecretResourcePool':
          return this.secretResourcePoolQueryService.get(variables)
        case 'SecretServer':
          return this.secretServerQueryService.get(variables)
        case 'SecurityMachine':
          return this.securityMachineQueryService.get(variables)
        case 'ResourceStack':
        case 'Account':
          return this.accountQueryService.query(variables)
        case 'MonitorGroup':
          return this.monitorGroupService.monitorGroupList(variables)
        case 'EndPoint':
          return this.endpointQueryService.queryList(variables)
        case 'NvmeTarget':
          return this.nvmeTargetQueryService.queryList(variables)
        case 'NVMeLun':
          return this.nVMeLunQueryService.queryList(variables)
        case 'SchedHistoryLog':
          return this.schedHistoryLogService.query(variables)
        case 'PhysicalNetworkBond':
          return this.physicalNetworkInterfaceService.getInterfaceService(variables)
        case 'PhysicalNetworkInterface':
          return this.physicalNetworkInterfaceService.getInterfaceService(variables)
        case 'SystemSchedulingTask':
          return this.systemSchedulingTaskService.queryAction(variables)
        case 'BlockSnapshot':
          return this.blockSnapshotService.queryList(variables)
        case 'SnmpTrap':
          return this.snmpManagementService.getSnmpTrapReceiverList(variables)
        case 'AccessControlRule':
          return this.accessControlRuleQueryService.get(variables)
        case 'HostKernelInterface':
          return this.hostKernelInterfaceQueryService.get(variables)
        case 'SNSFeiShuAtPerson':
          return this.snsFeiShuAtPersonQueryService.queryList(variables)
        case 'SNSWeComAtPerson':
          return this.snsWeComAtPersonQueryService.queryList(variables)
        case 'SNSDingTalkAtPerson':
          return this.snsDingTalkAtPersonQueryService.queryList(variables)
        case 'ClusterDRS':
          return this.clusterService.clusterDRSList(variables)
        case 'SehedulingInformation':
          return this.clusterService.dRSAdviceList(variables)
        case 'VmTemplate':
          return this.vmTemplateService.query(variables)
        case 'ZSVBackupStorage':
          return this.zsvBackupStorageService.query(variables)
        case 'BackupData':
          return this.backupDataQueryService.queryList(variables)
        case 'ZSVRole':
          return this.zsvRoleService.get(variables)
        case 'UserGroup':
          return this.userGroupQueryService.get(variables)
        case 'StorageAdapter':
          return this.storageAdapterService.queryStorageAdapterList(variables)
        case 'IscsiTarget':
          return this.iscsiServerQueryService.queryIscsiTargetList(variables)
        case 'schedulingTask':
          return this.clusterService.queryDRSVmMigrationActivityList(variables)
        case 'ZbsMds':
          return this.cbdMdsService.queryMdsList(variables)
        case 'ResourceAttributeKey':
          return this.resourceAttributeService.queryKeyList(variables)
        case 'ResourceAttributeConstraint':
          return this.resourceAttributeService.queryConstraintList(variables)
        case 'ResourceAttributeValue':
          return this.resourceAttributeService.queryValueList(variables)
        case 'VmCustomSpecification':
          return this.vmSpecQueryService.query(variables)
        case 'GatewayVmInstance':
          return this.migrationServiceService.queryGatewayVmList(variables)
        case 'KmsProvider':
          return this.kmsProviderQueryService.queryList(variables)
        case 'ConfigFile':
          return this.configFileService.configFileList(variables)
        default:
          throw new Error(`no matched resourceType: ${resourceType}`)
      }
    })
    const res = await Promise.all(callList)
    const conditionCount = resourceConditions.map((item, index) => {
      const count = res[index]?.total || 0
      return {
        key: item.key,
        count
      }
    })
    return { conditionCount }
  }
}
