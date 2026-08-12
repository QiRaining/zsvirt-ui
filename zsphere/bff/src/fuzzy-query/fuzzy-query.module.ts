import { Module } from '@nestjs/common'

import { BackupStorageModule } from '@/hardware-resource/backup-storage/backup-storage.module'
import { BackupStorageService } from '@/hardware-resource/backup-storage/backup-storage.service'
import { CbdMdsModule } from '@/hardware-resource/cbd-mds/cbd-mds.module'
import { CbdMdsService } from '@/hardware-resource/cbd-mds/cbd-mds.service'
import { CephMonModule } from '@/hardware-resource/ceph-mon/ceph-mon.module'
import { CephMonService } from '@/hardware-resource/ceph-mon/ceph-mon.service'
import { CephPrimaryStoragePoolQueryService } from '@/hardware-resource/ceph-primary-storage-pool/ceph-primary-storage-pool-query/ceph-primary-storage-pool-query.service'
import { CephPrimaryStoragePoolModule } from '@/hardware-resource/ceph-primary-storage-pool/ceph-primary-storage-pool.module'
import { ClusterModule } from '@/hardware-resource/cluster/cluster.module'
import { ClusterService } from '@/hardware-resource/cluster/cluster.service'
import { ConfigFileModule } from '@/hardware-resource/config-file/config-file.module'
import { ConfigFileService } from '@/hardware-resource/config-file/config-file.service'
import { QueryExternalPrimaryStoragePoolService } from '@/hardware-resource/external-primary-storage-pool/external-primary-storage-pool-query/external-primary-storage-pool-query.service'
import { ExternalPrimaryStoragePoolModule } from '@/hardware-resource/external-primary-storage-pool/external-primary-storage-pool.module'
import { FiberChannelStorageQueryService } from '@/hardware-resource/fiber-channel-storage/fiber-channel-storage-query/fiber-channel-storage-query.service'
import { FiberChannelStorageModule } from '@/hardware-resource/fiber-channel-storage/fiber-channel-storage.module'
import { HostKernelInterfaceModule } from '@/hardware-resource/host-kernel-interface/host-kernel-interface.module'
import { HostModule } from '@/hardware-resource/host/host.module'
import { HostQueryService } from '@/hardware-resource/host/query/host-query.service'
import { IscsiLunQueryService } from '@/hardware-resource/iscsi-lun/iscsi-lun-query/iscsi-lun-query.service'
import { IscsiLunModule } from '@/hardware-resource/iscsi-lun/iscsi-lun.module'
import { IscsiServerQueryService } from '@/hardware-resource/iscsi-server/iscsi-server-query/iscsi-server-query.service'
import { IscsiServerModule } from '@/hardware-resource/iscsi-server/iscsi-server.module'
import { L2NetworkModule } from '@/hardware-resource/l2-network/l2.network.module'
import { L2NetworkService } from '@/hardware-resource/l2-network/l2.network.service'
import { NVMeLunModule } from '@/hardware-resource/nvme-lun/nvme-lun.module'
import { NvmeTargetModule } from '@/hardware-resource/nvme-storage/nvme-storage.module'
import { PciDeviceQueryService } from '@/hardware-resource/pci-device/pci-device-query/pci-device-query.service'
import { PciDevicModule } from '@/hardware-resource/pci-device/pci-device.module'
import { PhysicalNetworkBondModule } from '@/hardware-resource/physical-network-bond/physical-network-bond.module'
import { PhysicalNetworkInterfaceModule } from '@/hardware-resource/physical-network-interface/physical-network-interface.module'
import { PrimaryStorageQueryService } from '@/hardware-resource/primary-storage/primary-storage-query/primary-storage-query.service'
import { PrimaryStorageModule } from '@/hardware-resource/primary-storage/primary-storage.module'
import { SeDeviceModule } from '@/hardware-resource/se-device/se.device.module'
import { StorageAdapterModule } from '@/hardware-resource/storage-adapter/storage-adapter.module'
import { UsbDeviceModule } from '@/hardware-resource/usb-device/usb.device.module'
import { UsbDeviceService } from '@/hardware-resource/usb-device/usb.device.service'
import { VGpuDeviceModule } from '@/hardware-resource/vgpu-device/vgpu-device.module'
import { VGpuDeviceService } from '@/hardware-resource/vgpu-device/vgpu-device.service'
import { ZoneModule } from '@/hardware-resource/zone/zone.module'
import { ZoneService } from '@/hardware-resource/zone/zone.service'
import { AuditModule } from '@/maintenance/audit/audit.module'
import { AuditService } from '@/maintenance/audit/audit.service'
import { MonitorGroupModule } from '@/maintenance/monitor-group/monitor-group.module'
import { MonitorGroupService } from '@/maintenance/monitor-group/monitor-group.service'
import { MonitorTemplateService } from '@/maintenance/monitor-template/monitor-template.service'
import { StackTemplateService } from '@/maintenance/resource-stack-template/stack-template.service'
import { ResourceStackModule } from '@/maintenance/resource-stack/resource-stack.module'
import { AlarmHistoriesModule } from '@/maintenance/zwatch-alarm-histories/zwatch-alarm-histories.module'
import { AlarmHistoriesService } from '@/maintenance/zwatch-alarm-histories/zwatch-alarm-histories.service'
import { ZWatchAlarmQueryService } from '@/maintenance/zwatch-alarm/zwatch-alarm-query/zwatch-alarm-query.service'
import { ZWatchAlarmModule } from '@/maintenance/zwatch-alarm/zwatch.alarm.module'
import { EndpointQueryService } from '@/maintenance/zwatch-endpoint/query/query.service'
import { EndPointModule } from '@/maintenance/zwatch-endpoint/zwatch-endpoint.module'
import { SNSDingTalkAtPersonModule } from '@/maintenance/zwatch-sns-dingtalk-at-person/zwatch-sns-dingtalk-at-person.module'
import { SNSFeiShuAtPersonModule } from '@/maintenance/zwatch-sns-feishu-at-person/zwatch-sns-feishu-at-person.module'
import { SNSTextTemplateService } from '@/maintenance/zwatch-sns-text-template/sns-text-template.service'
import { SNSWeComAtPersonModule } from '@/maintenance/zwatch-sns-wecom-at-person/zwatch-sns-wecom-at-person.module'
import { L3NetworkActionModule } from '@/network-resource/l3-network/action/_module'
import { IpModule } from '@/network-resource/l3-network/ip/ip.module'
import { IpService } from '@/network-resource/l3-network/ip/ip.service'
import { QueryL3NetworkService as L3NetworkService } from '@/network-resource/l3-network/query/query.service'
import { VirtualRouterOfferingModule } from '@/network-resource/virtual-router-offering/virtual-router-offering.module'
import { VirtualRouterOfferingService } from '@/network-resource/virtual-router-offering/virtual-router-offering.service'
import { VRouterRouteTableModule } from '@/network-resource/vrouter-route-table/vrouter-route-table.module'
import { VRouterRouteTableService } from '@/network-resource/vrouter-route-table/vrouter-route-table.service'
import { VxlanPoolModule } from '@/network-resource/vxlan-pool/vxlan-pool.module'
import { VxlanPoolService } from '@/network-resource/vxlan-pool/vxlan-pool.service'
import { EipModule } from '@/network-service/eip/eip.module'
import { EipService } from '@/network-service/eip/eip.service'
import { PortMirrorModule } from '@/network-service/port-mirror/port-mirror.module'
import { PortMirrorService } from '@/network-service/port-mirror/port-mirror.service'
import { SecurityGroupModule } from '@/network-service/security-group/security-group.module'
import { SecurityGroupService } from '@/network-service/security-group/security-group.service'
import { SlbOfferingQueryService } from '@/network-service/slb-offering/slb-offering-query/slb-offering-query.service'
import { AccessControlRuleModule } from '@/zsphere-administration/access-control-rule/access-control-rule.module'
import { AccessKeyModule } from '@/zsphere-administration/accesskey-management/accesskey-management.module'
import { AccessKeyService } from '@/zsphere-administration/accesskey-management/accesskey-management.service'
import { AccountModule } from '@/zsphere-administration/account/account.module'
import { AccountQueryService } from '@/zsphere-administration/account/query'
import { EmailServerSettingService } from '@/zsphere-administration/email-server-setting/query/email-server-setting-query'
import { OperationLogModule } from '@/zsphere-administration/operation-log/operation-log.module'
import { OperationLogService } from '@/zsphere-administration/operation-log/operation-log.service'
import { OwnerService } from '@/zsphere-administration/owner/owner.service'
import { SchedHistoryLogService } from '@/zsphere-administration/sched-history-log/sched-history-log.service'
import { SchedulerJobQueryService } from '@/zsphere-administration/scheduler-job/scheduler-job-query/scheduler-job-query.service'
import { SchedulerJobModule } from '@/zsphere-administration/scheduler-job/scheduler-job.module'
import { SchedulerTriggerModule } from '@/zsphere-administration/scheduler-trigger/scheduler-trigger.module'
import { SchedulerTriggerService } from '@/zsphere-administration/scheduler-trigger/scheduler-trigger.service'
import { SnmpManagementModule } from '@/zsphere-administration/snmp-management/snmp-management.module'
import { SystemSchedulingTaskModule } from '@/zsphere-administration/system-scheduling-task/system-scheduling-task.module'
import { TagModule } from '@/zsphere-administration/tag/tag.module'
import { TagService } from '@/zsphere-administration/tag/tag.service'
import { UserGroupModule } from '@/zsphere-administration/user-group/user-group.module'
import { ZsvRoleModule } from '@/zsphere-administration/zsv-role/zsv-role.module'
import { BackupDataQueryService } from '@/zsphere-data-protection/backup-data/backup-data-query/backup-data-query.service'
import { BackupDataModule } from '@/zsphere-data-protection/backup-data/backup-data.module'
import { DatabaseBackupQueryService } from '@/zsphere-data-protection/backup-data/database-backup-query/database-backup-query.service'
import { SchedulerJobGroupQueryService } from '@/zsphere-data-protection/backup-job/scheduler-job-group-query/scheduler-job-group-query.service'
import { SchedulerJobGroupModule } from '@/zsphere-data-protection/backup-job/scheduler-job-group.module'
import { LocalBackupStorageModule } from '@/zsphere-data-protection/local-backup-storage/local-backup-storage.module'
import { QueryLocalBackupStorageService } from '@/zsphere-data-protection/local-backup-storage/query/local-backup-storage-query'
import { QueryZSVBackupStorageService } from '@/zsphere-data-protection/zsv-backup-storage/query/zsv-backup-storage-query'
import { ZSVBackupStorageModule } from '@/zsphere-data-protection/zsv-backup-storage/zsv-backup-storage.module'
import { MigrationServiceModule } from '@/zsphere-monitoring-om/migration-service/migration-service.module'
import { MigrationServiceService } from '@/zsphere-monitoring-om/migration-service/migration-service.service'
import { ResourceAttributeModule } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.module'
import { BaremetalInstanceQueryService } from '@/zsphere-resource/baremetal/baremetal-instance/query/baremetal-instance-query.service'
import { PreconfigurationTemplateQueryService } from '@/zsphere-resource/baremetal/preconfiguration-template/query/query-preconfiguration-template'
import { BlockSnapshotService } from '@/zsphere-resource/block-snapshot/block-snapshot.service'
import { BlockVolumeService } from '@/zsphere-resource/block-volume/block-volume.service'
import { CdRomsModule } from '@/zsphere-resource/cdroms/cdroms.module'
import { CdRomsService } from '@/zsphere-resource/cdroms/cdroms.service'
import { HostGroupModule } from '@/zsphere-resource/host-group/host-group.module'
import { HostGroupService } from '@/zsphere-resource/host-group/host-group.service'
import { ImageQueryService } from '@/zsphere-resource/image/image-query/image-query.service'
import { ImageModule } from '@/zsphere-resource/image/image.module'
import { InstanceOfferingModule } from '@/zsphere-resource/instance-offering/instance-offering.module'
import { InstanceOfferingService } from '@/zsphere-resource/instance-offering/instance-offering.service'
import { KmsProviderModule } from '@/zsphere-resource/kms-provider/kms-provider.module'
import { KmsProviderQueryService } from '@/zsphere-resource/kms-provider/kms-provider.service'
import { PciDeviceSpecModule } from '@/zsphere-resource/pci-device-spec/pci-device-spec.module'
import { PciDeviceSpecService } from '@/zsphere-resource/pci-device-spec/pci-device-spec.service'
import { ZSVResourceSnapshotQueryService } from '@/zsphere-resource/resource-snapshot/resource-snapshot-query/zsv-snapshot-query.service'
import { ResourcesnapshotModule } from '@/zsphere-resource/resource-snapshot/resource-snapshot.module'
import { SshKeyPairQueryService } from '@/zsphere-resource/ssh-key-pair/ssh-key-pair-query/ssh-key-pair-query.service'
import { SshKeyPairModule } from '@/zsphere-resource/ssh-key-pair/ssh-key-pair.module'
import { VGpuDeviceSpecModule } from '@/zsphere-resource/vgpu-device-spec/vgpu-device-spec.module'
import { VGpuDeviceSpecService } from '@/zsphere-resource/vgpu-device-spec/vgpu-device-spec.service'
import { VmGroupModule } from '@/zsphere-resource/vm-group/vm-group.module'
import { VmGroupService } from '@/zsphere-resource/vm-group/vm-group.service'
import { VmInstanceQueryService } from '@/zsphere-resource/vm-instance/vm-instance-query/vm-instance-query.service'
import { VmInstanceModule } from '@/zsphere-resource/vm-instance/vm-instance.module'
import { QueryVmNicService } from '@/zsphere-resource/vm-nic/query/query.service'
import { VmNicModule } from '@/zsphere-resource/vm-nic/vm-nic.module'
import { VmSchedulingRuleModule } from '@/zsphere-resource/vm-scheduling-rule/vm-scheduling-rule.module'
import { VmSchedulingRuleService } from '@/zsphere-resource/vm-scheduling-rule/vm-scheduling-rule.service'
import { VmSpecModule } from '@/zsphere-resource/vm-spec/vm-spec.module'
import { VmTemplateService } from '@/zsphere-resource/vm-template/query/query.service'
import { VmTemplateModule } from '@/zsphere-resource/vm-template/vm-template.module'
import { VolumeQueryService } from '@/zsphere-resource/volume/volume-query/volume-query.service'
import { VolumeModule } from '@/zsphere-resource/volume/volume.module'
import { SecretResourcePoolModule } from '@/zstack-cloud-code/crypto-compliance/secret-resource-pool/secret-resource-pool.module'
import { SecretServerModule } from '@/zstack-cloud-code/crypto-compliance/secret-server/secret-server.module'
import { SecurityMachineModule } from '@/zstack-cloud-code/crypto-compliance/security-machine/security-machine.module'

import { FuzzyQueryResolver } from './fuzzy-query.resolver'

@Module({
  imports: [
    AccessControlRuleModule,
    AccessKeyModule,
    AccountModule,
    AlarmHistoriesModule,
    AuditModule,
    BackupDataModule,
    BackupStorageModule,
    CbdMdsModule,
    CdRomsModule,
    CephMonModule,
    CephPrimaryStoragePoolModule,
    ConfigFileModule,
    ClusterModule,
    EipModule,
    EndPointModule,
    ExternalPrimaryStoragePoolModule,
    FiberChannelStorageModule,
    HostGroupModule,
    HostKernelInterfaceModule,
    HostModule,
    ImageModule,
    InstanceOfferingModule,
    IscsiLunModule,
    IscsiServerModule,
    IpModule,
    L2NetworkModule,
    L3NetworkActionModule,
    LocalBackupStorageModule,
    MonitorGroupModule,
    NvmeTargetModule,
    NVMeLunModule,
    OperationLogModule,
    PciDeviceSpecModule,
    PciDevicModule,
    PhysicalNetworkBondModule,
    PhysicalNetworkInterfaceModule,
    PortMirrorModule,
    PrimaryStorageModule,
    ResourcesnapshotModule,
    ResourceStackModule,
    SchedulerJobGroupModule,
    SchedulerJobModule,
    SchedulerTriggerModule,
    SecretResourcePoolModule,
    SecretServerModule,
    SecurityGroupModule,
    SecurityMachineModule,
    SeDeviceModule,
    SNSDingTalkAtPersonModule,
    SNSFeiShuAtPersonModule,
    SNSWeComAtPersonModule,
    SnmpManagementModule,
    SshKeyPairModule,
    StorageAdapterModule,
    SystemSchedulingTaskModule,
    TagModule,
    UsbDeviceModule,
    UserGroupModule,
    VGpuDeviceModule,
    VGpuDeviceSpecModule,
    VirtualRouterOfferingModule,
    VmGroupModule,
    VmInstanceModule,
    VmNicModule,
    VmSchedulingRuleModule,
    VmTemplateModule,
    VolumeModule,
    VRouterRouteTableModule,
    VxlanPoolModule,
    ZSVBackupStorageModule,
    ZsvRoleModule,
    ZWatchAlarmModule,
    ZoneModule,
    ExternalPrimaryStoragePoolModule,
    ResourceAttributeModule,
    MigrationServiceModule,
    VmSpecModule,
    KmsProviderModule,
    CbdMdsModule
  ],
  providers: [
    FuzzyQueryResolver,
    AccessKeyService,
    AccountQueryService,
    AlarmHistoriesService,
    AuditService,
    BackupDataQueryService,
    BackupStorageService,
    BaremetalInstanceQueryService,
    CdRomsService,
    BlockSnapshotService,
    BlockVolumeService,
    CbdMdsService,
    CephMonService,
    CephPrimaryStoragePoolQueryService,
    ClusterService,
    ConfigFileService,
    DatabaseBackupQueryService,
    EipService,
    EmailServerSettingService,
    EndpointQueryService,
    FiberChannelStorageQueryService,
    HostGroupService,
    HostQueryService,
    ImageQueryService,
    InstanceOfferingService,
    IscsiLunQueryService,
    IscsiServerQueryService,
    IpService,
    L2NetworkService,
    L3NetworkService,
    MonitorGroupService,
    MonitorTemplateService,
    OperationLogService,
    OwnerService,
    PciDeviceQueryService,
    PciDeviceSpecService,
    PortMirrorService,
    PreconfigurationTemplateQueryService,
    PrimaryStorageQueryService,
    QueryExternalPrimaryStoragePoolService,
    QueryLocalBackupStorageService,
    QueryVmNicService,
    QueryZSVBackupStorageService,
    SchedHistoryLogService,
    SchedulerJobGroupQueryService,
    SchedulerJobQueryService,
    SchedulerTriggerService,
    SecurityGroupService,
    SlbOfferingQueryService,
    SNSTextTemplateService,
    SshKeyPairQueryService,
    StackTemplateService,
    TagService,
    UsbDeviceService,
    VGpuDeviceService,
    VGpuDeviceSpecService,
    VirtualRouterOfferingService,
    VmGroupService,
    VmInstanceQueryService,
    VmSchedulingRuleService,
    VmTemplateService,
    VolumeQueryService,
    KmsProviderQueryService,
    VRouterRouteTableService,
    VxlanPoolService,
    ZSVResourceSnapshotQueryService,
    ZWatchAlarmQueryService,
    MigrationServiceService,
    ZoneService
  ]
})
export class FuzzyQueryModule {}
