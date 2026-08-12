// @ts-nocheck
import { Module, Global } from "@nestjs/common";
import { TransModule } from "../../common/trans/trans.module";
import { AddTpmAction } from './AddTpmAction';
import { BackupNkpAction } from "./BackupNkpAction";
import { AckAlarmDataAction } from "./AckAlarmDataAction";
import { AckEventDataAction } from "./AckEventDataAction";
import { AddAccessControlRuleAction } from "./AddAccessControlRuleAction";
import { AddAccountToGroupAction } from "./AddAccountToGroupAction";
import { AddActionToAlarmAction } from "./AddActionToAlarmAction";
import { AddActionToEventSubscriptionAction } from "./AddActionToEventSubscriptionAction";
import { AddAliyunEbsBackupStorageAction } from "./AddAliyunEbsBackupStorageAction";
import { AddAliyunEbsPrimaryStorageAction } from "./AddAliyunEbsPrimaryStorageAction";
import { AddAliyunNasPrimaryStorageAction } from "./AddAliyunNasPrimaryStorageAction";
import { AddBlockPrimaryStorageAction } from "./AddBlockPrimaryStorageAction";
import { AddCCSCertificateAction } from "./AddCCSCertificateAction";
import { AddCephBackupStorageAction } from "./AddCephBackupStorageAction";
import { AddCephPrimaryStorageAction } from "./AddCephPrimaryStorageAction";
import { AddCephPrimaryStoragePoolAction } from "./AddCephPrimaryStoragePoolAction";
import { AddDnsToL3NetworkAction } from "./AddDnsToL3NetworkAction";
import { AddEmailAddressToSNSEmailEndpointAction } from "./AddEmailAddressToSNSEmailEndpointAction";
import { AddEventRuleTemplateAction } from "./AddEventRuleTemplateAction";
import { AddExternalPrimaryStorageAction } from "./AddExternalPrimaryStorageAction";
import { AddFlkSecSecurityMachineAction } from "./AddFlkSecSecurityMachineAction";
import { AddHostToHostSchedulingRuleGroupAction } from "./AddHostToHostSchedulingRuleGroupAction";
import { AddHybridKeySecretAction } from "./AddHybridKeySecretAction";
import { AddImageStoreBackupStorageAction } from "./AddImageStoreBackupStorageAction";
import { AddInfoSecSecurityMachineAction } from "./AddInfoSecSecurityMachineAction";
import { AddInstanceToMonitorGroupAction } from "./AddInstanceToMonitorGroupAction";
import { AddIpRangeAction } from "./AddIpRangeAction";
import { AddIpRangeByNetworkCidrAction } from "./AddIpRangeByNetworkCidrAction";
import { AddIpv6RangeAction } from "./AddIpv6RangeAction";
import { AddIpv6RangeByNetworkCidrAction } from "./AddIpv6RangeByNetworkCidrAction";
import { AddIscsiServerAction } from "./AddIscsiServerAction";
import { AddKVMHostAction } from "./AddKVMHostAction";
import { AddLdapServerAction } from "./AddLdapServerAction";
import { AddLocalPrimaryStorageAction } from "./AddLocalPrimaryStorageAction";
import { AddLogConfigurationAction } from "./AddLogConfigurationAction";
import { AddLogServerAction } from './AddLogServerAction';
import { AddMdevDeviceSpecToVmInstanceAction } from "./AddMdevDeviceSpecToVmInstanceAction";
import { AddMetricRuleTemplateAction } from "./AddMetricRuleTemplateAction";
import { AddMonToCephBackupStorageAction } from "./AddMonToCephBackupStorageAction";
import { AddMonToCephPrimaryStorageAction } from "./AddMonToCephPrimaryStorageAction";
import { AddNfsPrimaryStorageAction } from "./AddNfsPrimaryStorageAction";
import { AddNvmeServerAction } from "./AddNvmeServerAction";
import { AddPciDeviceSpecToVmInstanceAction } from "./AddPciDeviceSpecToVmInstanceAction";
import { AddPreconfigurationTemplateAction } from "./AddPreconfigurationTemplateAction";
import { AddResourcesToDirectoryAction } from "./AddResourcesToDirectoryAction";
import { AddSNSDingTalkAtPersonAction } from "./AddSNSDingTalkAtPersonAction";
import { AddSNSFeiShuAtPersonAction } from "./AddSNSFeiShuAtPersonAction";
import { AddSNSSmsReceiverAction } from "./AddSNSSmsReceiverAction";
import { AddSNSWeComAtPersonAction } from "./AddSNSWeComAtPersonAction";
import { AddSchedulerJobGroupToSchedulerTriggerAction } from "./AddSchedulerJobGroupToSchedulerTriggerAction";
import { AddSchedulerJobToSchedulerTriggerAction } from "./AddSchedulerJobToSchedulerTriggerAction";
import { AddSchedulerJobsToSchedulerJobGroupAction } from "./AddSchedulerJobsToSchedulerJobGroupAction";
import { AddSdnControllerAction } from "./AddSdnControllerAction";
import { AddSecurityGroupRuleAction } from "./AddSecurityGroupRuleAction";
import { AddSftpBackupStorageAction } from "./AddSftpBackupStorageAction";
import { AddSharedBlockGroupPrimaryStorageAction } from "./AddSharedBlockGroupPrimaryStorageAction";
import { AddSharedBlockToSharedBlockGroupAction } from "./AddSharedBlockToSharedBlockGroupAction";
import { AddSharedMountPointPrimaryStorageAction } from "./AddSharedMountPointPrimaryStorageAction";
import { AddStackTemplateAction } from "./AddStackTemplateAction";
import { AddStorageProtocolAction } from "./AddStorageProtocolAction";
import { AddThirdpartyPlatformAction } from "./AddThirdpartyPlatformAction";
import { AddVRouterRouteEntryAction } from "./AddVRouterRouteEntryAction";
import { AddVmNicToSecurityGroupAction } from "./AddVmNicToSecurityGroupAction";
import { AddVmToAffinityGroupAction } from "./AddVmToAffinityGroupAction";
import { AddVmToVmSchedulingRuleGroupAction } from "./AddVmToVmSchedulingRuleGroupAction";
import { AddXDragonHostAction } from "./AddXDragonHostAction";
import { AddZStoneAction } from "./AddZStoneAction";
import { AddZceXAction } from "./AddZceXAction";
import { AllocateHostResourceAction } from "./AllocateHostResourceAction";
import { ApplyDRSAdviceAction } from "./ApplyDRSAdviceAction";
import { ApplyMonitorTemplateToMonitorGroupAction } from "./ApplyMonitorTemplateToMonitorGroupAction";
import { ApplyTemplateConfigAction } from "./ApplyTemplateConfigAction";
import { AttachBackupStorageToZoneAction } from "./AttachBackupStorageToZoneAction";
import { AttachBareMetal2ProvisionNetworkToClusterAction } from "./AttachBareMetal2ProvisionNetworkToClusterAction";
import { AttachBaremetalPxeServerToClusterAction } from "./AttachBaremetalPxeServerToClusterAction";
import { AttachDataVolumeToVmAction } from "./AttachDataVolumeToVmAction";
import { AttachEipAction } from "./AttachEipAction";
import { AttachGuestToolsIsoToVmAction } from "./AttachGuestToolsIsoToVmAction";
import { AttachIscsiServerToClusterAction } from "./AttachIscsiServerToClusterAction";
import { AttachIsoToVmInstanceAction } from "./AttachIsoToVmInstanceAction";
import { AttachL2NetworkToClusterAction } from "./AttachL2NetworkToClusterAction";
import { AttachL2NetworkToHostAction } from "./AttachL2NetworkToHostAction";
import { AttachL3NetworkToVmAction } from "./AttachL3NetworkToVmAction";
import { AttachMdevDeviceToVmAction } from "./AttachMdevDeviceToVmAction";
import { AttachNetworkServiceToL3NetworkAction } from "./AttachNetworkServiceToL3NetworkAction";
import { AttachNvmeServerToClusterAction } from "./AttachNvmeServerToClusterAction";
import { AttachPciDeviceToVmAction } from "./AttachPciDeviceToVmAction";
import { AttachPriceTableToAccountAction } from "./AttachPriceTableToAccountAction";
import { AttachPrimaryStorageToClusterAction } from "./AttachPrimaryStorageToClusterAction";
import { AttachProvisionNicToBondingAction } from "./AttachProvisionNicToBondingAction";
import { AttachRoleToAccountAction } from "./AttachRoleToAccountAction";
import { AttachRoleToAccountGroupAction } from "./AttachRoleToAccountGroupAction";
import { AttachScsiLunToVmInstanceAction } from "./AttachScsiLunToVmInstanceAction";
import { AttachSecurityGroupToL3NetworkAction } from "./AttachSecurityGroupToL3NetworkAction";
import { AttachSshKeyPairToVmInstanceAction } from "./AttachSshKeyPairToVmInstanceAction";
import { AttachTagToResourcesAction } from "./AttachTagToResourcesAction";
import { AttachUsbDeviceToVmAction } from "./AttachUsbDeviceToVmAction";
import { AttachUserDefinedXmlHookScriptToVmAction } from "./AttachUserDefinedXmlHookScriptToVmAction";
import { AttachVRouterRouteTableToVRouterAction } from "./AttachVRouterRouteTableToVRouterAction";
import { BatchCreateHostKernelInterfaceAction } from "./BatchCreateHostKernelInterfaceAction";
import { BatchDeleteVolumeSnapshotAction } from "./BatchDeleteVolumeSnapshotAction";
import { CalculateImageHashAction } from "./CalculateImageHashAction";
import { CancelLongJobAction } from "./CancelLongJobAction";
import { ChangeAccessKeyStateAction } from "./ChangeAccessKeyStateAction";
import { ChangeAccountPriceTableBindingAction } from "./ChangeAccountPriceTableBindingAction";
import { ChangeAccountTypeAction } from "./ChangeAccountTypeAction";
import { ChangeActiveAlarmStateAction } from "./ChangeActiveAlarmStateAction";
import { ChangeAffinityGroupStateAction } from "./ChangeAffinityGroupStateAction";
import { ChangeAlarmStateAction } from "./ChangeAlarmStateAction";
import { ChangeBackupStorageStateAction } from "./ChangeBackupStorageStateAction";
import { ChangeBaremetalChassisStateAction } from "./ChangeBaremetalChassisStateAction";
import { ChangeClusterStateAction } from "./ChangeClusterStateAction";
import { ChangeDiskOfferingStateAction } from "./ChangeDiskOfferingStateAction";
import { ChangeEventSubscriptionStateAction } from "./ChangeEventSubscriptionStateAction";
import { ChangeHostNetworkInterfaceLldpModeAction } from "./ChangeHostNetworkInterfaceLldpModeAction";
import { ChangeHostStateAction } from "./ChangeHostStateAction";
import { ChangeImageStateAction } from "./ChangeImageStateAction";
import { ChangeInstanceOfferingAction } from "./ChangeInstanceOfferingAction";
import { ChangeInstanceOfferingStateAction } from "./ChangeInstanceOfferingStateAction";
import { ChangeL3NetworkDhcpIpAddressAction } from "./ChangeL3NetworkDhcpIpAddressAction";
import { ChangePortMirrorStateAction } from "./ChangePortMirrorStateAction";
import { ChangePreconfigurationTemplateStateAction } from "./ChangePreconfigurationTemplateStateAction";
import { ChangePrimaryStorageStateAction } from "./ChangePrimaryStorageStateAction";
import { ChangeResourceOwnerAction } from "./ChangeResourceOwnerAction";
import { ChangeSNSApplicationEndpointStateAction } from "./ChangeSNSApplicationEndpointStateAction";
import { ChangeSNSApplicationPlatformStateAction } from "./ChangeSNSApplicationPlatformStateAction";
import { ChangeSchedulerStateAction } from "./ChangeSchedulerStateAction";
import { ChangeSecurityGroupRuleAction } from "./ChangeSecurityGroupRuleAction";
import { ChangeSecurityGroupRuleStateAction } from "./ChangeSecurityGroupRuleStateAction";
import { ChangeSecurityGroupStateAction } from "./ChangeSecurityGroupStateAction";
import { ChangeSecurityMachineStateAction } from "./ChangeSecurityMachineStateAction";
import { ChangeVmImageAction } from "./ChangeVmImageAction";
import { ChangeVmNicNetworkAction } from "./ChangeVmNicNetworkAction";
import { ChangeVmNicSecurityPolicyAction } from "./ChangeVmNicSecurityPolicyAction";
import { ChangeVmNicStateAction } from "./ChangeVmNicStateAction";
import { ChangeVmNicTypeAction } from "./ChangeVmNicTypeAction";
import { ChangeVmPasswordAction } from "./ChangeVmPasswordAction";
import { ChangeVmSchedulingRuleStateAction } from "./ChangeVmSchedulingRuleStateAction";
import { ChangeVolumeStateAction } from "./ChangeVolumeStateAction";
import { ChangeZoneStateAction } from "./ChangeZoneStateAction";
import { CheckBaremetalChassisConfigFileAction } from "./CheckBaremetalChassisConfigFileAction";
import { CheckBatchDataIntegrityAction } from "./CheckBatchDataIntegrityAction";
import { CheckCephHealthStatusAction } from "./CheckCephHealthStatusAction";
import { CheckCephPluginAction } from "./CheckCephPluginAction";
import { CheckIpAvailabilityAction } from "./CheckIpAvailabilityAction";
import { CheckKVMHostConfigFileAction } from "./CheckKVMHostConfigFileAction";
import { CheckMemorySnapshotGroupConflictAction } from "./CheckMemorySnapshotGroupConflictAction";
import { CheckNetworkReachableAction } from "./CheckNetworkReachableAction";
import { CheckScsiLunClusterStatusAction } from "./CheckScsiLunClusterStatusAction";
import { CheckStackTemplateParametersAction } from "./CheckStackTemplateParametersAction";
import { CheckVolumeSnapshotGroupAvailabilityAction } from "./CheckVolumeSnapshotGroupAvailabilityAction";
import { CleanSoftwarePackageAction } from "./CleanSoftwarePackageAction";
import { CleanUpBareMetal2BondingAction } from "./CleanUpBareMetal2BondingAction";
import { CleanUpBaremetalChassisBondingAction } from "./CleanUpBaremetalChassisBondingAction";
import { CleanUpTrashOnBackupStorageAction } from "./CleanUpTrashOnBackupStorageAction";
import { CleanUpTrashOnPrimaryStorageAction } from "./CleanUpTrashOnPrimaryStorageAction";
import { CleanUpgradeSoftwarePackageAction } from "./CleanUpgradeSoftwarePackageAction";
import { CloneMonitorTemplateAction } from "./CloneMonitorTemplateAction";
import { CloneVmInstanceAction } from "./CloneVmInstanceAction";
import { ConvertTemplatedVmInstanceToVmInstanceAction } from "./ConvertTemplatedVmInstanceToVmInstanceAction";
import { ConvertVmInstanceToTemplatedVmInstanceAction } from "./ConvertVmInstanceToTemplatedVmInstanceAction";
import { CreateAccessKeyAction } from "./CreateAccessKeyAction";
import { CreateAccountAction } from "./CreateAccountAction";
import { CreateAccountGroupAction } from "./CreateAccountGroupAction";
import { CreateAffinityGroupAction } from "./CreateAffinityGroupAction";
import { CreateAiSiNoSecretResourcePoolAction } from "./CreateAiSiNoSecretResourcePoolAction";
import { CreateAlarmAction } from "./CreateAlarmAction";
import { CreateAliyunSmsSNSTextTemplateAction } from "./CreateAliyunSmsSNSTextTemplateAction";
import { CreateBareMetal2BondingAction } from "./CreateBareMetal2BondingAction";
import { CreateBaremetalBondingAction } from "./CreateBaremetalBondingAction";
import { CreateBaremetalChassisAction } from "./CreateBaremetalChassisAction";
import { CreateBaremetalInstanceAction } from "./CreateBaremetalInstanceAction";
import { CreateBaremetalPxeServerAction } from "./CreateBaremetalPxeServerAction";
import { CreateBlockVolumeAction } from "./CreateBlockVolumeAction";
import { CreateBondingAction } from "./CreateBondingAction";
import { CreateCasClientAction } from "./CreateCasClientAction";
import { CreateClusterAction } from "./CreateClusterAction";
import { CreateClusterDRSAction } from "./CreateClusterDRSAction";
import { CreateDataVolumeAction } from "./CreateDataVolumeAction";
import { CreateDataVolumeFromVolumeBackupAction } from "./CreateDataVolumeFromVolumeBackupAction";
import { CreateDataVolumeFromVolumeTemplateAction } from "./CreateDataVolumeFromVolumeTemplateAction";
import { CreateDataVolumeTemplateFromVolumeBackupAction } from "./CreateDataVolumeTemplateFromVolumeBackupAction";
import { CreateDirectoryAction } from "./CreateDirectoryAction";
import { CreateDiskOfferingAction } from "./CreateDiskOfferingAction";
import { CreateEipAction } from "./CreateEipAction";
import { CreateFlkSecSecretResourcePoolAction } from "./CreateFlkSecSecretResourcePoolAction";
import { CreateGuestVmScriptAction } from "./CreateGuestVmScriptAction";
import { CreateHaiTaiSecretResourcePoolAction } from "./CreateHaiTaiSecretResourcePoolAction";
import { CreateHostKernelInterfaceAction } from "./CreateHostKernelInterfaceAction";
import { CreateHostSchedulingRuleGroupAction } from "./CreateHostSchedulingRuleGroupAction";
import { CreateInfoSecSecretResourcePoolAction } from "./CreateInfoSecSecretResourcePoolAction";
import { CreateInstanceOfferingAction } from "./CreateInstanceOfferingAction";
import { CreateKmsAction } from "./CreateKmsAction";
import { CreateL2HardwareVxlanNetworkAction } from "./CreateL2HardwareVxlanNetworkAction";
import { CreateL2HardwareVxlanNetworkPoolAction } from "./CreateL2HardwareVxlanNetworkPoolAction";
import { CreateL2NoVlanNetworkAction } from "./CreateL2NoVlanNetworkAction";
import { CreateL2PortGroupAction } from "./CreateL2PortGroupAction";
import { CreateL2VirtualSwitchAction } from "./CreateL2VirtualSwitchAction";
import { CreateL2VlanNetworkAction } from "./CreateL2VlanNetworkAction";
import { CreateL2VxlanNetworkAction } from "./CreateL2VxlanNetworkAction";
import { CreateL2VxlanNetworkPoolAction } from "./CreateL2VxlanNetworkPoolAction";
import { CreateL3NetworkAction } from "./CreateL3NetworkAction";
import { CreateMonitorGroupAction } from "./CreateMonitorGroupAction";
import { CreateMonitorTemplateAction } from "./CreateMonitorTemplateAction";
import { CreateNkpAction } from "./CreateNkpAction";
import { CreateOAuthClientAction } from "./CreateOAuthClientAction";
import { CreatePortGroupAction } from "./CreatePortGroupAction";
import { CreatePortMirrorAction } from "./CreatePortMirrorAction";
import { CreatePortMirrorSessionAction } from "./CreatePortMirrorSessionAction";
import { CreateResourceAttributeKeyAction } from "./CreateResourceAttributeKeyAction";
import { CreateResourceAttributeValueAction } from "./CreateResourceAttributeValueAction";
import { CreateResourceStackAction } from "./CreateResourceStackAction";
import { CreateRoleAction } from "./CreateRoleAction";
import { CreateRootVolumeTemplateFromVolumeBackupAction } from "./CreateRootVolumeTemplateFromVolumeBackupAction";
import { CreateSNSAliyunSmsEndpointAction } from "./CreateSNSAliyunSmsEndpointAction";
import { CreateSNSDingTalkEndpointAction } from "./CreateSNSDingTalkEndpointAction";
import { CreateSNSEmailEndpointAction } from "./CreateSNSEmailEndpointAction";
import { CreateSNSEmailPlatformAction } from "./CreateSNSEmailPlatformAction";
import { CreateSNSFeiShuEndpointAction } from "./CreateSNSFeiShuEndpointAction";
import { CreateSNSHttpEndpointAction } from "./CreateSNSHttpEndpointAction";
import { CreateSNSMicrosoftTeamsEndpointAction } from "./CreateSNSMicrosoftTeamsEndpointAction";
import { CreateSNSSnmpEndpointAction } from "./CreateSNSSnmpEndpointAction";
import { CreateSNSSnmpPlatformAction } from "./CreateSNSSnmpPlatformAction";
import { CreateSNSTextTemplateAction } from "./CreateSNSTextTemplateAction";
import { CreateSNSTopicAction } from "./CreateSNSTopicAction";
import { CreateSNSWeComEndpointAction } from "./CreateSNSWeComEndpointAction";
import { CreateSchedulerJobAction } from "./CreateSchedulerJobAction";
import { CreateSchedulerJobGroupAction } from "./CreateSchedulerJobGroupAction";
import { CreateSchedulerTriggerAction } from "./CreateSchedulerTriggerAction";
import { CreateSecurityGroupAction } from "./CreateSecurityGroupAction";
import { CreateSlbOfferingAction } from "./CreateSlbOfferingAction";
import { CreateSnmpAgentAction } from "./CreateSnmpAgentAction";
import { CreateSshKeyPairAction } from "./CreateSshKeyPairAction";
import { CreateSystemTagAction } from "./CreateSystemTagAction";
import { CreateTagAction } from "./CreateTagAction";
import { CreateTemplatedVmInstanceFromVmInstanceAction } from "./CreateTemplatedVmInstanceFromVmInstanceAction";
import { CreateVRouterRouteTableAction } from "./CreateVRouterRouteTableAction";
import { CreateVirtualRouterOfferingAction } from "./CreateVirtualRouterOfferingAction";
import { CreateVmBackupAction } from "./CreateVmBackupAction";
import { CreateVmCdRomAction } from "./CreateVmCdRomAction";
import { CreateVmCustomSpecificationAction } from "./CreateVmCustomSpecificationAction";
import { CreateVmFromVmBackupAction } from "./CreateVmFromVmBackupAction";
import { CreateVmFromVolumeBackupAction } from "./CreateVmFromVolumeBackupAction";
import { CreateVmInstanceAction } from "./CreateVmInstanceAction";
import { CreateVmInstanceFromTemplatedVmInstanceAction } from "./CreateVmInstanceFromTemplatedVmInstanceAction";
import { CreateVmInstanceFromVolumeSnapshotGroupAction } from "./CreateVmInstanceFromVolumeSnapshotGroupAction";
import { CreateVmSchedulingRuleAction } from "./CreateVmSchedulingRuleAction";
import { CreateVmSchedulingRuleGroupAction } from "./CreateVmSchedulingRuleGroupAction";
import { CreateVmUserDefinedXmlHookScriptAction } from "./CreateVmUserDefinedXmlHookScriptAction";
import { CreateVniRangeAction } from "./CreateVniRangeAction";
import { CreateVolumeBackupAction } from "./CreateVolumeBackupAction";
import { CreateVolumeSnapshotAction } from "./CreateVolumeSnapshotAction";
import { CreateVolumeSnapshotGroupAction } from "./CreateVolumeSnapshotGroupAction";
import { CreateZceXAlertPlatformAction } from "./CreateZceXAlertPlatformAction";
import { CreateZoneAction } from "./CreateZoneAction";
import { DeleteAccessControlRuleAction } from "./DeleteAccessControlRuleAction";
import { DeleteAccessKeyAction } from "./DeleteAccessKeyAction";
import { DeleteAccountAction } from "./DeleteAccountAction";
import { DeleteAccountGroupAction } from "./DeleteAccountGroupAction";
import { DeleteAffinityGroupAction } from "./DeleteAffinityGroupAction";
import { DeleteAlarmAction } from "./DeleteAlarmAction";
import { DeleteBackupStorageAction } from "./DeleteBackupStorageAction";
import { DeleteBaremetalChassisAction } from "./DeleteBaremetalChassisAction";
import { DeleteBaremetalPxeServerAction } from "./DeleteBaremetalPxeServerAction";
import { DeleteBondingAction } from "./DeleteBondingAction";
import { DeleteCCSCertificateAction } from "./DeleteCCSCertificateAction";
import { DeleteCephPrimaryStoragePoolAction } from "./DeleteCephPrimaryStoragePoolAction";
import { DeleteClusterAction } from "./DeleteClusterAction";
import { DeleteDataVolumeAction } from "./DeleteDataVolumeAction";
import { DeleteDatabaseBackupAction } from "./DeleteDatabaseBackupAction";
import { DeleteDirectoryAction } from "./DeleteDirectoryAction";
import { DeleteDiskOfferingAction } from "./DeleteDiskOfferingAction";
import { DeleteEipAction } from "./DeleteEipAction";
import { DeleteEmailAddressOfSNSEmailEndpointAction } from "./DeleteEmailAddressOfSNSEmailEndpointAction";
import { DeleteEventRuleTemplateAction } from "./DeleteEventRuleTemplateAction";
import { DeleteExportedImageFromBackupStorageAction } from "./DeleteExportedImageFromBackupStorageAction";
import { DeleteGuestVmScriptAction } from "./DeleteGuestVmScriptAction";
import { DeleteHostAction } from "./DeleteHostAction";
import { DeleteHostKernelInterfaceAction } from "./DeleteHostKernelInterfaceAction";
import { DeleteHostSchedulingRuleGroupAction } from "./DeleteHostSchedulingRuleGroupAction";
import { DeleteHybridKeySecretAction } from "./DeleteHybridKeySecretAction";
import { DeleteImageAction } from "./DeleteImageAction";
import { DeleteImagePackageAction } from "./DeleteImagePackageAction";
import { DeleteInstanceOfferingAction } from "./DeleteInstanceOfferingAction";
import { DeleteIpRangeAction } from "./DeleteIpRangeAction";
import { DeleteIscsiServerAction } from "./DeleteIscsiServerAction";
import { DeleteKmsAction } from "./DeleteKmsAction";
import { DeleteL2NetworkAction } from "./DeleteL2NetworkAction";
import { DeleteL3NetworkAction } from "./DeleteL3NetworkAction";
import { DeleteLdapServerAction } from "./DeleteLdapServerAction";
import { DeleteLicenseAction } from "./DeleteLicenseAction";
import { DeleteLogConfigurationAction } from "./DeleteLogConfigurationAction";
import { DeleteLogServerAction } from './DeleteLogServerAction';
import { DeleteMdevDeviceAction } from "./DeleteMdevDeviceAction";
import { DeleteMetricRuleTemplateAction } from "./DeleteMetricRuleTemplateAction";
import { DeleteMonitorGroupAction } from "./DeleteMonitorGroupAction";
import { DeleteMonitorTemplateAction } from "./DeleteMonitorTemplateAction";
import { DeleteNicQosAction } from "./DeleteNicQosAction";
import { DeleteNkpAction } from "./DeleteNkpAction";
import { DeleteNvmeServerAction } from "./DeleteNvmeServerAction";
import { DeletePciDeviceAction } from "./DeletePciDeviceAction";
import { DeletePortGroupAction } from "./DeletePortGroupAction";
import { DeletePortMirrorAction } from "./DeletePortMirrorAction";
import { DeletePortMirrorSessionAction } from "./DeletePortMirrorSessionAction";
import { DeletePreconfigurationTemplateAction } from "./DeletePreconfigurationTemplateAction";
import { DeletePrimaryStorageAction } from "./DeletePrimaryStorageAction";
import { DeleteResourceAttributeKeyAction } from "./DeleteResourceAttributeKeyAction";
import { DeleteResourceAttributeValueAction } from "./DeleteResourceAttributeValueAction";
import { DeleteResourceConfigAction } from "./DeleteResourceConfigAction";
import { DeleteResourceStackAction } from "./DeleteResourceStackAction";
import { DeleteRoleAction } from "./DeleteRoleAction";
import { DeleteSNSApplicationEndpointAction } from "./DeleteSNSApplicationEndpointAction";
import { DeleteSNSApplicationPlatformAction } from "./DeleteSNSApplicationPlatformAction";
import { DeleteSNSTextTemplateAction } from "./DeleteSNSTextTemplateAction";
import { DeleteSNSTopicAction } from "./DeleteSNSTopicAction";
import { DeleteSSOClientAction } from "./DeleteSSOClientAction";
import { DeleteSchedulerJobAction } from "./DeleteSchedulerJobAction";
import { DeleteSchedulerJobGroupAction } from "./DeleteSchedulerJobGroupAction";
import { DeleteSchedulerTriggerAction } from "./DeleteSchedulerTriggerAction";
import { DeleteSecretResourcePoolAction } from "./DeleteSecretResourcePoolAction";
import { DeleteSecurityGroupAction } from "./DeleteSecurityGroupAction";
import { DeleteSecurityGroupRuleAction } from "./DeleteSecurityGroupRuleAction";
import { DeleteSecurityMachineAction } from "./DeleteSecurityMachineAction";
import { DeleteSshKeyPairAction } from "./DeleteSshKeyPairAction";
import { DeleteStackTemplateAction } from "./DeleteStackTemplateAction";
import { DeleteTagAction } from "./DeleteTagAction";
import { DeleteTemplatedVmInstanceAction } from "./DeleteTemplatedVmInstanceAction";
import { DeleteThirdpartyPlatformAction } from "./DeleteThirdpartyPlatformAction";
import { DeleteVRouterRouteEntryAction } from "./DeleteVRouterRouteEntryAction";
import { DeleteVRouterRouteTableAction } from "./DeleteVRouterRouteTableAction";
import { DeleteVipAction } from "./DeleteVipAction";
import { DeleteVmBackupAction } from "./DeleteVmBackupAction";
import { DeleteVmCdRomAction } from "./DeleteVmCdRomAction";
import { DeleteVmConsolePasswordAction } from "./DeleteVmConsolePasswordAction";
import { DeleteVmCustomSpecificationAction } from "./DeleteVmCustomSpecificationAction";
import { DeleteVmHostnameAction } from "./DeleteVmHostnameAction";
import { DeleteVmInstanceHaLevelAction } from "./DeleteVmInstanceHaLevelAction";
import { DeleteVmNicFromSecurityGroupAction } from "./DeleteVmNicFromSecurityGroupAction";
import { DeleteVmSchedulingRuleGroupAction } from "./DeleteVmSchedulingRuleGroupAction";
import { DeleteVmSshKeyAction } from "./DeleteVmSshKeyAction";
import { DeleteVmStaticIpAction } from "./DeleteVmStaticIpAction";
import { DeleteVniRangeAction } from "./DeleteVniRangeAction";
import { DeleteVolumeBackupAction } from "./DeleteVolumeBackupAction";
import { DeleteVolumeQosAction } from "./DeleteVolumeQosAction";
import { DeleteVolumeSnapshotGroupAction } from "./DeleteVolumeSnapshotGroupAction";
import { DeleteZceXAlertPlatformAction } from "./DeleteZceXAlertPlatformAction";
import { DeleteZoneAction } from "./DeleteZoneAction";
import { DestroyBaremetalInstanceAction } from "./DestroyBaremetalInstanceAction";
import { DestroyVmInstanceAction } from "./DestroyVmInstanceAction";
import { DetachBackupStorageFromZoneAction } from "./DetachBackupStorageFromZoneAction";
import { DetachBaremetalPxeServerFromClusterAction } from "./DetachBaremetalPxeServerFromClusterAction";
import { DetachDataVolumeFromVmAction } from "./DetachDataVolumeFromVmAction";
import { DetachEipAction } from "./DetachEipAction";
import { DetachGuestToolsIsoFromVmAction } from "./DetachGuestToolsIsoFromVmAction";
import { DetachHostFromHostSchedulingRuleGroupAction } from "./DetachHostFromHostSchedulingRuleGroupAction";
import { DetachIscsiServerFromClusterAction } from "./DetachIscsiServerFromClusterAction";
import { DetachIsoFromVmInstanceAction } from "./DetachIsoFromVmInstanceAction";
import { DetachL2NetworkFromClusterAction } from "./DetachL2NetworkFromClusterAction";
import { DetachL2NetworkFromHostAction } from "./DetachL2NetworkFromHostAction";
import { DetachL3NetworkFromVmAction } from "./DetachL3NetworkFromVmAction";
import { DetachMdevDeviceFromVmAction } from "./DetachMdevDeviceFromVmAction";
import { DetachNetworkServiceFromL3NetworkAction } from "./DetachNetworkServiceFromL3NetworkAction";
import { DetachNvmeServerFromClusterAction } from "./DetachNvmeServerFromClusterAction";
import { DetachPciDeviceFromVmAction } from "./DetachPciDeviceFromVmAction";
import { DetachPriceTableFromAccountAction } from "./DetachPriceTableFromAccountAction";
import { DetachPrimaryStorageFromClusterAction } from "./DetachPrimaryStorageFromClusterAction";
import { DetachProvisionNicFromBondingAction } from "./DetachProvisionNicFromBondingAction";
import { DetachRoleFromAccountAction } from "./DetachRoleFromAccountAction";
import { DetachRoleFromAccountGroupAction } from "./DetachRoleFromAccountGroupAction";
import { DetachScsiLunFromVmInstanceAction } from "./DetachScsiLunFromVmInstanceAction";
import { DetachSecurityGroupFromL3NetworkAction } from "./DetachSecurityGroupFromL3NetworkAction";
import { DetachSshKeyPairFromVmInstanceAction } from "./DetachSshKeyPairFromVmInstanceAction";
import { DetachTagFromResourcesAction } from "./DetachTagFromResourcesAction";
import { DetachUsbDeviceFromVmAction } from "./DetachUsbDeviceFromVmAction";
import { DetachUserDefinedXmlHookScriptFromVmAction } from "./DetachUserDefinedXmlHookScriptFromVmAction";
import { DetachVRouterRouteTableFromVRouterAction } from "./DetachVRouterRouteTableFromVRouterAction";
import { DetachVmFromVmSchedulingRuleGroupAction } from "./DetachVmFromVmSchedulingRuleGroupAction";
import { DiscoverExternalPrimaryStorageAction } from "./DiscoverExternalPrimaryStorageAction";
import { DiscoverStrangePrimaryStorageAction } from './DiscoverStrangePrimaryStorageAction';
import { DoLongjobAction } from "./DoLongjobAction";
import { ExecuteDRSSchedulingAction } from "./ExecuteDRSSchedulingAction";
import { ExecuteGuestVmScriptAction } from "./ExecuteGuestVmScriptAction";
import { ExportDatabaseBackupFromBackupStorageAction } from "./ExportDatabaseBackupFromBackupStorageAction";
import { ExportImageFromBackupStorageAction } from "./ExportImageFromBackupStorageAction";
import { ExportVmOvaPackageAction } from "./ExportVmOvaPackageAction";
import { ExpungeBaremetalInstanceAction } from "./ExpungeBaremetalInstanceAction";
import { ExpungeDataVolumeAction } from "./ExpungeDataVolumeAction";
import { ExpungeImageAction } from "./ExpungeImageAction";
import { ExpungeVmInstanceAction } from "./ExpungeVmInstanceAction";
import { ExpungeVmUserDefinedXmlHookScriptAction } from "./ExpungeVmUserDefinedXmlHookScriptAction";
import { FlattenVmInstanceAction } from "./FlattenVmInstanceAction";
import { FlattenVolumeAction } from "./FlattenVolumeAction";
import { GenerateMdevDevicesAction } from "./GenerateMdevDevicesAction";
import { GenerateSeMdevDevicesAction } from "./GenerateSeMdevDevicesAction";
import { GenerateSriovPciDevicesAction } from "./GenerateSriovPciDevicesAction";
import { GenerateSshKeyPairAction } from "./GenerateSshKeyPairAction";
import { GetAccessPathAction } from "./GetAccessPathAction";
import { GetAccountPriceTableRefAction } from "./GetAccountPriceTableRefAction";
import { GetAccountQuotaUsageAction } from "./GetAccountQuotaUsageAction";
import { GetActiveAlarmStatusAction } from "./GetActiveAlarmStatusAction";
import { GetAlarmDataAction } from "./GetAlarmDataAction";
import { GetAuditDataAction } from "./GetAuditDataAction";
import { GetAvailableTriggersAction } from "./GetAvailableTriggersAction";
import { GetBackupStorageForCreatingImageFromVolumeAction } from "./GetBackupStorageForCreatingImageFromVolumeAction";
import { GetBackupStorageTypesAction } from "./GetBackupStorageTypesAction";
import { GetBareMetal2SupportedBootModeAction } from "./GetBareMetal2SupportedBootModeAction";
import { GetBaremetalChassisPowerStatusAction } from "./GetBaremetalChassisPowerStatusAction";
import { GetBlockPrimaryStorageMetadataAction } from "./GetBlockPrimaryStorageMetadataAction";
import { GetCandidateHostKernelInterfacesAction } from "./GetCandidateHostKernelInterfacesAction";
import { GetCandidateInterfaceVlanIdsAction } from "./GetCandidateInterfaceVlanIdsAction";
import { GetCandidateL3NetworksForChangeVmNicNetworkAction } from "./GetCandidateL3NetworksForChangeVmNicNetworkAction";
import { GetCandidateNetworkBondingsAction } from "./GetCandidateNetworkBondingsAction";
import { GetCandidateNetworkInterfacesAction } from "./GetCandidateNetworkInterfacesAction";
import { GetCandidatePrimaryStoragesForCreatingVmAction } from "./GetCandidatePrimaryStoragesForCreatingVmAction";
import { GetCandidateVmNicForSecurityGroupAction } from "./GetCandidateVmNicForSecurityGroupAction";
import { GetCandidateVmNicsForPortMirrorAction } from "./GetCandidateVmNicsForPortMirrorAction";
import { GetCandidateZonesClustersHostsForCreatingVmAction } from "./GetCandidateZonesClustersHostsForCreatingVmAction";
import { GetChronyServersAction } from "./GetChronyServersAction";
import { GetClusterHostNetworkFactsAction } from "./GetClusterHostNetworkFactsAction";
import { GetCpuMemoryCapacityAction } from "./GetCpuMemoryCapacityAction";
import { GetCurrentTimeAction } from "./GetCurrentTimeAction";
import { GetDatabaseBackupFromImageStoreAction } from "./GetDatabaseBackupFromImageStoreAction";
import { GetDirectoryUsageAction } from "./GetDirectoryUsageAction";
import { GetEipAttachableVmNicsAction } from "./GetEipAttachableVmNicsAction";
import { GetEventDataAction } from "./GetEventDataAction";
import { GetFreeIpOfIpRangeAction } from "./GetFreeIpOfIpRangeAction";
import { GetFreeIpOfL3NetworkAction } from "./GetFreeIpOfL3NetworkAction";
import { GetGlobalConfigOptionsAction } from "./GetGlobalConfigOptionsAction";
import { GetHostAllocatorStrategiesAction } from "./GetHostAllocatorStrategiesAction";
import { GetHostBlockDevicesAction } from "./GetHostBlockDevicesAction";
import { GetHostIommuStateAction } from "./GetHostIommuStateAction";
import { GetHostIommuStatusAction } from "./GetHostIommuStatusAction";
import { GetHostMultipathTopologyAction } from "./GetHostMultipathTopologyAction";
import { GetHostNUMATopologyAction } from "./GetHostNUMATopologyAction";
import { GetHostNetworkFactsAction } from "./GetHostNetworkFactsAction";
import { GetHostNetworkInterfaceLldpAction } from "./GetHostNetworkInterfaceLldpAction";
import { GetHostSensorsAction } from "./GetHostSensorsAction";
import { GetHostWebSshUrlAction } from "./GetHostWebSshUrlAction";
import { GetHypervisorTypesAction } from "./GetHypervisorTypesAction";
import { GetImageQgaAction } from "./GetImageQgaAction";
import { GetInterdependentL3NetworksBackupStoragesAction } from "./GetInterdependentL3NetworksBackupStoragesAction";
import { GetInterdependentL3NetworksImagesAction } from "./GetInterdependentL3NetworksImagesAction";
import { GetInterfaceServiceTypeStatisticAction } from "./GetInterfaceServiceTypeStatisticAction";
import { GetIpAddressCapacityAction } from "./GetIpAddressCapacityAction";
import { GetKmsServerCertFromKmsAction } from './GetKmsServerCertFromKmsAction';
import { GetL3NetworkIpStatisticAction } from "./GetL3NetworkIpStatisticAction";
import { GetL3NetworkMtuAction } from "./GetL3NetworkMtuAction";
import { GetL3NetworkRouterInterfaceIpAction } from "./GetL3NetworkRouterInterfaceIpAction";
import { GetLatestGuestToolsForVmAction } from "./GetLatestGuestToolsForVmAction";
import { GetLdapEntryAction } from "./GetLdapEntryAction";
import { GetLicenseAddOnsAction } from "./GetLicenseAddOnsAction";
import { GetLicenseInfoAction } from "./GetLicenseInfoAction";
import { GetLicenseRecordsAction } from "./GetLicenseRecordsAction";
import { GetLicenseUKeyStatusAction } from "./GetLicenseUKeyStatusAction";
import { GetLocalStorageHostDiskCapacityAction } from "./GetLocalStorageHostDiskCapacityAction";
import { GetLogConfigurationAction } from "./GetLogConfigurationAction";
import { GetLoginCaptchaAction } from "./GetLoginCaptchaAction";
import { GetLoginProceduresAction } from "./GetLoginProceduresAction";
import { GetManagementNodeArchAction } from "./GetManagementNodeArchAction";
import { GetManagementNodeDirCapacityAction } from "./GetManagementNodeDirCapacityAction";
import { GetManagementNodesStatusAction } from "./GetManagementNodesStatusAction";
import { GetMdevDeviceCandidatesAction } from "./GetMdevDeviceCandidatesAction";
import { GetMdevDeviceSpecCandidatesAction } from "./GetMdevDeviceSpecCandidatesAction";
import { GetMemorySnapshotGroupReferenceAction } from "./GetMemorySnapshotGroupReferenceAction";
import { GetMetricDataAction } from "./GetMetricDataAction";
import { GetMetricLabelValueAction } from "./GetMetricLabelValueAction";
import { GetNicQosAction } from "./GetNicQosAction";
import { GetNodeRolesAction } from "./GetNodeRolesAction";
import { GetOAuthClientSecretAction } from "./GetOAuthClientSecretAction";
import { GetPciDeviceCandidatesForAttachingVmAction } from "./GetPciDeviceCandidatesForAttachingVmAction";
import { GetPciDeviceCandidatesForNewCreateVmAction } from "./GetPciDeviceCandidatesForNewCreateVmAction";
import { GetPciDeviceSpecCandidatesAction } from "./GetPciDeviceSpecCandidatesAction";
import { GetPhysicalMachineBlockDevicesAction } from "./GetPhysicalMachineBlockDevicesAction";
import { GetPlatformTimeZoneAction } from "./GetPlatformTimeZoneAction";
import { GetPortForwardingAttachableVmNicsAction } from "./GetPortForwardingAttachableVmNicsAction";
import { GetPrimaryStorageCandidatesForVmMigrationAction } from "./GetPrimaryStorageCandidatesForVmMigrationAction";
import { GetPrimaryStorageCandidatesForVolumeMigrationAction } from "./GetPrimaryStorageCandidatesForVolumeMigrationAction";
import { GetPrimaryStorageLicenseInfoAction } from "./GetPrimaryStorageLicenseInfoAction";
import { GetPrimaryStorageUsageReportAction } from "./GetPrimaryStorageUsageReportAction";
import { GetPrometheusMetricLabelValueAction } from "./GetPrometheusMetricLabelValueAction";
import { GetResourceAccountAction } from "./GetResourceAccountAction";
import { GetResourceConfigAction } from "./GetResourceConfigAction";
import { GetResourceFromResourceStackAction } from "./GetResourceFromResourceStackAction";
import { GetResourceNamesAction } from "./GetResourceNamesAction";
import { GetRolePolicyActionsAction } from "./GetRolePolicyActionsAction";
import { GetSchedulerExecutionReportAction } from "./GetSchedulerExecutionReportAction";
import { GetScsiLunCandidatesForAttachingVmAction } from "./GetScsiLunCandidatesForAttachingVmAction";
import { GetSharedBlockCandidateAction } from "./GetSharedBlockCandidateAction";
import { GetSignatureServerEncryptPublicKeyAction } from "./GetSignatureServerEncryptPublicKeyAction";
import { GetTaskProgressAction } from "./GetTaskProgressAction";
import { GetTaskProgressActionBase } from "./GetTaskProgressActionBase";
import { GetTrashOnBackupStorageAction } from "./GetTrashOnBackupStorageAction";
import { GetTrashOnPrimaryStorageAction } from "./GetTrashOnPrimaryStorageAction";
import { GetTwoFactorAuthenticationSecretAction } from "./GetTwoFactorAuthenticationSecretAction";
import { GetTwoFactorAuthenticationStateAction } from "./GetTwoFactorAuthenticationStateAction";
import { GetUploadSoftwarePackageJobDetailsAction } from "./GetUploadSoftwarePackageJobDetailsAction";
import { GetUsbDeviceCandidatesForAttachingVmAction } from "./GetUsbDeviceCandidatesForAttachingVmAction";
import { GetVersionAction } from "./GetVersionAction";
import { GetVirtualizerInfoAction } from "./GetVirtualizerInfoAction";
import { GetVmAttachableDataVolumeAction } from "./GetVmAttachableDataVolumeAction";
import { GetVmAttachableL3NetworkAction } from "./GetVmAttachableL3NetworkAction";
import { GetVmBootOrderAction } from "./GetVmBootOrderAction";
import { GetVmConsoleAddressAction } from "./GetVmConsoleAddressAction";
import { GetVmEmulatorPinningAction } from "./GetVmEmulatorPinningAction";
import { GetVmGuestToolsInfoAction } from "./GetVmGuestToolsInfoAction";
import { GetVmHostnameAction } from "./GetVmHostnameAction";
import { GetVmNicAttachedNetworkServiceAction } from "./GetVmNicAttachedNetworkServiceAction";
import { GetVmSchedulingRulesExecuteStateAction } from "./GetVmSchedulingRulesExecuteStateAction";
import { GetVmStartingCandidateClustersHostsAction } from "./GetVmStartingCandidateClustersHostsAction";
import { GetVmUptimeAction } from "./GetVmUptimeAction";
import { GetVmsCapabilitiesAction } from "./GetVmsCapabilitiesAction";
import { GetVmsSchedulingStateFromSchedulingRuleAction } from "./GetVmsSchedulingStateFromSchedulingRuleAction";
import { GetVmvNUMATopologyAction } from "./GetVmvNUMATopologyAction";
import { GetVolumeCapabilitiesAction } from "./GetVolumeCapabilitiesAction";
import { GetVolumeIoThreadPinAction } from "./GetVolumeIoThreadPinAction";
import { GetVolumeQosAction } from "./GetVolumeQosAction";
import { GetVolumeSnapshotSizeAction } from "./GetVolumeSnapshotSizeAction";
import { GetVpcVRouterNetworkServiceStateAction } from "./GetVpcVRouterNetworkServiceStateAction";
import { GetZMigrateGatewayVmInstancesAction } from './GetZMigrateGatewayVmInstancesAction';
import { GetZMigrateInfosAction } from './GetZMigrateInfosAction';
import { GetZStoneCapabilityAction } from "./GetZStoneCapabilityAction";
import { GetZWatchAlertHistogramAction } from "./GetZWatchAlertHistogramAction";
import { GetZceXCapabilityAction } from "./GetZceXCapabilityAction";
import { InspectBaremetalChassisAction } from "./InspectBaremetalChassisAction";
import { InstallSoftwarePackageAction } from "./InstallSoftwarePackageAction";
import { IsOpensourceVersionAction } from "./IsOpensourceVersionAction";
import { LocalStorageMigrateVolumeAction } from "./LocalStorageMigrateVolumeAction";
import { LocateHostNetworkInterfaceAction } from "./LocateHostNetworkInterfaceAction";
import { LocateLocalRaidPhysicalDriveAction } from "./LocateLocalRaidPhysicalDriveAction";
import { LogInAction } from "./LogInAction";
import { LogInByAccountAction } from "./LogInByAccountAction";
import { LogOutAction } from "./LogOutAction";
import { MountBlockDeviceAction } from "./MountBlockDeviceAction";
import { MoveDirectoryAction } from "./MoveDirectoryAction";
import { MoveResourcesToDirectoryAction } from "./MoveResourcesToDirectoryAction";
import { ParseNkpRestoreAction } from "./ParseNkpRestoreAction";
import { ParseOvfAction } from "./ParseOvfAction";
import { PauseVmInstanceAction } from "./PauseVmInstanceAction";
import { PowerOffBaremetalChassisAction } from "./PowerOffBaremetalChassisAction";
import { PowerOnBaremetalChassisAction } from "./PowerOnBaremetalChassisAction";
import { PowerOnHostAction } from "./PowerOnHostAction";
import { PowerResetBaremetalChassisAction } from "./PowerResetBaremetalChassisAction";
import { PowerResetHostAction } from "./PowerResetHostAction";
import { PreviewResourceStackAction } from "./PreviewResourceStackAction";
import { PrimaryStorageMigrateVolumeAction } from './PrimaryStorageMigrateVolumeAction';
import { QueryAccessControlRuleAction } from "./QueryAccessControlRuleAction";
import { QueryAccessKeyAction } from "./QueryAccessKeyAction";
import { QueryAccountAction } from "./QueryAccountAction";
import { QueryAccountResourceRefAction } from "./QueryAccountResourceRefAction";
import { QueryActiveAlarmTemplateAction } from "./QueryActiveAlarmTemplateAction";
import { QueryAddressPoolAction } from "./QueryAddressPoolAction";
import { QueryAffinityGroupAction } from "./QueryAffinityGroupAction";
import { QueryAlarmAction } from "./QueryAlarmAction";
import { QueryAlarmRecordAction } from "./QueryAlarmRecordAction";
import { QueryAliyunSmsSNSTextTemplateAction } from "./QueryAliyunSmsSNSTextTemplateAction";
import { QueryBackupStorageAction } from "./QueryBackupStorageAction";
import { QueryBareMetal2ChassisAction } from "./QueryBareMetal2ChassisAction";
import { QueryBareMetal2GatewayAction } from "./QueryBareMetal2GatewayAction";
import { QueryBareMetal2InstanceAction } from "./QueryBareMetal2InstanceAction";
import { QueryBareMetal2ProvisionNetworkAction } from "./QueryBareMetal2ProvisionNetworkAction";
import { QueryBaremetalChassisAction } from "./QueryBaremetalChassisAction";
import { QueryBaremetalInstanceAction } from "./QueryBaremetalInstanceAction";
import { QueryBaremetalPxeServerAction } from "./QueryBaremetalPxeServerAction";
import { QueryBlockVolumeAction } from "./QueryBlockVolumeAction";
import { QueryCCSCertificateAction } from "./QueryCCSCertificateAction";
import { QueryClusterAction } from "./QueryClusterAction";
import { QueryClusterDRSAction } from "./QueryClusterDRSAction";
import { QueryConsoleProxyAgentAction } from "./QueryConsoleProxyAgentAction";
import { QueryDRSAdviceAction } from "./QueryDRSAdviceAction";
import { QueryDRSVmMigrationActivityAction } from "./QueryDRSVmMigrationActivityAction";
import { QueryEipAction } from "./QueryEipAction";
import { QueryEventFromResourceStackAction } from "./QueryEventFromResourceStackAction";
import { QueryEventRecordAction } from "./QueryEventRecordAction";
import { QueryEventRuleTemplateAction } from "./QueryEventRuleTemplateAction";
import { QueryEventSubscriptionAction } from "./QueryEventSubscriptionAction";
import { QueryGlobalConfigAction } from "./QueryGlobalConfigAction";
import { QueryHostAction } from "./QueryHostAction";
import { QueryHostNetworkInterfaceAction } from "./QueryHostNetworkInterfaceAction";
import { QueryHostPhysicalMemoryAction } from "./QueryHostPhysicalMemoryAction";
import { QueryHybridKeySecretAction } from "./QueryHybridKeySecretAction";
import { QueryImageAction } from "./QueryImageAction";
import { QueryInstanceOfferingAction } from "./QueryInstanceOfferingAction";
import { QueryIscsiServerAction } from "./QueryIscsiServerAction";
import { QueryL2NetworkAction } from "./QueryL2NetworkAction";
import { QueryL2VxlanNetworkPoolAction } from "./QueryL2VxlanNetworkPoolAction";
import { QueryL3NetworkAction } from "./QueryL3NetworkAction";
import { QueryLdapServerAction } from "./QueryLdapServerAction";
import { QueryLogServerAction } from './QueryLogServerAction';
import { QueryLongJobAction } from "./QueryLongJobAction";
import { QueryLongJobActionBase } from "./QueryLongJobActionBase";
import { QueryManagementNodeAction } from "./QueryManagementNodeAction";
import { QueryMdevDeviceAction } from "./QueryMdevDeviceAction";
import { QueryMdevDeviceSpecAction } from "./QueryMdevDeviceSpecAction";
import { QueryMetricRuleTemplateAction } from "./QueryMetricRuleTemplateAction";
import { QueryMonitorGroupAction } from "./QueryMonitorGroupAction";
import { QueryMonitorGroupAlarmAction } from "./QueryMonitorGroupAlarmAction";
import { QueryMonitorGroupInstanceAction } from "./QueryMonitorGroupInstanceAction";
import { QueryMonitorGroupTemplateRefAction } from "./QueryMonitorGroupTemplateRefAction";
import { QueryMonitorTemplateAction } from "./QueryMonitorTemplateAction";
import { QueryNetworkServiceL3NetworkRefAction } from "./QueryNetworkServiceL3NetworkRefAction";
import { QueryNetworkServiceProviderAction } from "./QueryNetworkServiceProviderAction";
import { QueryPciDeviceAction } from "./QueryPciDeviceAction";
import { QueryPciDeviceSpecAction } from "./QueryPciDeviceSpecAction";
import { QueryPortGroupAction } from "./QueryPortGroupAction";
import { QueryPortMirrorAction } from "./QueryPortMirrorAction";
import { QueryPortMirrorSessionAction } from "./QueryPortMirrorSessionAction";
import { QueryPrimaryStorageAction } from "./QueryPrimaryStorageAction";
import { QueryResourceConfigAction } from "./QueryResourceConfigAction";
import { QueryResourceStackAction } from "./QueryResourceStackAction";
import { QuerySNSApplicationEndpointAction } from "./QuerySNSApplicationEndpointAction";
import { QuerySNSEmailAddressAction } from "./QuerySNSEmailAddressAction";
import { QuerySNSEmailPlatformAction } from "./QuerySNSEmailPlatformAction";
import { QuerySNSSmsEndpointAction } from "./QuerySNSSmsEndpointAction";
import { QuerySNSTextTemplateAction } from "./QuerySNSTextTemplateAction";
import { QuerySNSTopicSubscriberAction } from "./QuerySNSTopicSubscriberAction";
import { QuerySchedulerJobAction } from "./QuerySchedulerJobAction";
import { QuerySchedulerJobGroupAction } from "./QuerySchedulerJobGroupAction";
import { QuerySchedulerJobHistoryAction } from "./QuerySchedulerJobHistoryAction";
import { QuerySchedulerTriggerAction } from "./QuerySchedulerTriggerAction";
import { QuerySdnControllerAction } from "./QuerySdnControllerAction";
import { QuerySecretResourcePoolAction } from "./QuerySecretResourcePoolAction";
import { QuerySecurityGroupAction } from "./QuerySecurityGroupAction";
import { QuerySecurityMachineAction } from "./QuerySecurityMachineAction";
import { QueryShareableVolumeVmInstanceRefAction } from "./QueryShareableVolumeVmInstanceRefAction";
import { QuerySharedBlockAction } from "./QuerySharedBlockAction";
import { QuerySnmpAgentAction } from "./QuerySnmpAgentAction";
import { QueryStackTemplateAction } from "./QueryStackTemplateAction";
import { QuerySystemTagAction } from "./QuerySystemTagAction";
import { QueryTagAction } from "./QueryTagAction";
import { QueryThirdpartyPlatformAction } from "./QueryThirdpartyPlatformAction";
import { QueryTpmAction } from './QueryTpmAction';
import { QueryUsbDeviceAction } from "./QueryUsbDeviceAction";
import { QueryVRouterRouteEntryAction } from "./QueryVRouterRouteEntryAction";
import { QueryVRouterRouteTableAction } from "./QueryVRouterRouteTableAction";
import { QueryVipAction } from "./QueryVipAction";
import { QueryVirtualRouterOfferingAction } from "./QueryVirtualRouterOfferingAction";
import { QueryVirtualRouterVRouterRouteTableRefAction } from "./QueryVirtualRouterVRouterRouteTableRefAction";
import { QueryVmCdRomAction } from "./QueryVmCdRomAction";
import { QueryVmInstanceAction } from "./QueryVmInstanceAction";
import { QueryVmNicAction } from "./QueryVmNicAction";
import { QueryVmNicInSecurityGroupAction } from "./QueryVmNicInSecurityGroupAction";
import { QueryVniRangeAction } from "./QueryVniRangeAction";
import { QueryVolumeAction } from "./QueryVolumeAction";
import { QueryVolumeBackupAction } from "./QueryVolumeBackupAction";
import { QueryVolumeSnapshotAction } from "./QueryVolumeSnapshotAction";
import { QueryVolumeSnapshotGroupAction } from "./QueryVolumeSnapshotGroupAction";
import { QueryVolumeSnapshotTreeAction } from "./QueryVolumeSnapshotTreeAction";
import { QueryVpcHaGroupAction } from "./QueryVpcHaGroupAction";
import { QueryVpcRouterAction } from "./QueryVpcRouterAction";
import { QueryXskyBlockVolumeAction } from "./QueryXskyBlockVolumeAction";
import { QueryZStoneAction } from "./QueryZStoneAction";
import { QueryZceXAction } from "./QueryZceXAction";
import { QueryZceXThirdPartyPlatformAlertRefAction } from "./QueryZceXThirdPartyPlatformAlertRefAction";
import { QueryZoneAction } from "./QueryZoneAction";
import { RebootBaremetalInstanceAction } from "./RebootBaremetalInstanceAction";
import { RebootVmInstanceAction } from "./RebootVmInstanceAction";
import { ReclaimSpaceFromImageStoreAction } from "./ReclaimSpaceFromImageStoreAction";
import { ReconnectBackupStorageAction } from "./ReconnectBackupStorageAction";
import { ReconnectBaremetalPxeServerAction } from "./ReconnectBaremetalPxeServerAction";
import { ReconnectConsoleProxyAgentAction } from "./ReconnectConsoleProxyAgentAction";
import { ReconnectHostAction } from "./ReconnectHostAction";
import { ReconnectPrimaryStorageAction } from "./ReconnectPrimaryStorageAction";
import { RecoverBackupFromImageStoreBackupStorageAction } from "./RecoverBackupFromImageStoreBackupStorageAction";
import { RecoverBaremetalInstanceAction } from "./RecoverBaremetalInstanceAction";
import { RecoverDataVolumeAction } from "./RecoverDataVolumeAction";
import { RecoverDatabaseFromBackupAction } from "./RecoverDatabaseFromBackupAction";
import { RecoverImageAction } from "./RecoverImageAction";
import { RecoverVmBackupFromImageStoreBackupStorageAction } from "./RecoverVmBackupFromImageStoreBackupStorageAction";
import { RecoverVmInstanceAction } from "./RecoverVmInstanceAction";
import { RefreshCaptchaAction } from "./RefreshCaptchaAction";
import { RefreshFiberChannelStorageAction } from "./RefreshFiberChannelStorageAction";
import { RefreshIscsiServerAction } from "./RefreshIscsiServerAction";
import { RefreshNvmeServerAction } from "./RefreshNvmeServerAction";
import { RefreshNvmeTargetAction } from "./RefreshNvmeTargetAction";
import { RefreshSharedblockDeviceCapacityAction } from "./RefreshSharedblockDeviceCapacityAction";
import { RegisterVmInstanceFromMetadataAction } from './RegisterVmInstanceFromMetadataAction';
import { ReimageVmInstanceAction } from "./ReimageVmInstanceAction";
import { RekeyKeyProviderRefsAction } from "./RekeyKeyProviderRefsAction";
import { ReloadLicenseAction } from "./ReloadLicenseAction";
import { RemoveAccountFromGroupAction } from "./RemoveAccountFromGroupAction";
import { RemoveActionFromAlarmAction } from "./RemoveActionFromAlarmAction";
import { RemoveActionFromEventSubscriptionAction } from "./RemoveActionFromEventSubscriptionAction";
import { RemoveDnsFromL3NetworkAction } from "./RemoveDnsFromL3NetworkAction";
import { RemoveInstanceFromMonitorGroupAction } from "./RemoveInstanceFromMonitorGroupAction";
import { RemoveMdevDeviceSpecFromVmInstanceAction } from "./RemoveMdevDeviceSpecFromVmInstanceAction";
import { RemoveMonFromCephBackupStorageAction } from "./RemoveMonFromCephBackupStorageAction";
import { RemoveMonFromCephPrimaryStorageAction } from "./RemoveMonFromCephPrimaryStorageAction";
import { RemovePciDeviceSpecFromVmInstanceAction } from "./RemovePciDeviceSpecFromVmInstanceAction";
import { RemoveResourcesFromDirectoryAction } from "./RemoveResourcesFromDirectoryAction";
import { RemoveSNSDingTalkAtPersonAction } from "./RemoveSNSDingTalkAtPersonAction";
import { RemoveSNSFeiShuAtPersonAction } from "./RemoveSNSFeiShuAtPersonAction";
import { RemoveSNSSmsReceiverAction } from "./RemoveSNSSmsReceiverAction";
import { RemoveSNSWeComAtPersonAction } from "./RemoveSNSWeComAtPersonAction";
import { RemoveSchedulerJobFromSchedulerTriggerAction } from "./RemoveSchedulerJobFromSchedulerTriggerAction";
import { RemoveSchedulerJobGroupFromSchedulerTriggerAction } from "./RemoveSchedulerJobGroupFromSchedulerTriggerAction";
import { RemoveSchedulerJobsFromSchedulerJobGroupAction } from "./RemoveSchedulerJobsFromSchedulerJobGroupAction";
import { RemoveSdnControllerAction } from "./RemoveSdnControllerAction";
import { RemoveTpmAction } from './RemoveTpmAction';
import { RemoveVmFromAffinityGroupAction } from "./RemoveVmFromAffinityGroupAction";
import { RemoveVmSchedulingRuleAction } from "./RemoveVmSchedulingRuleAction";
import { RemoveZStoneAction } from "./RemoveZStoneAction";
import { RemoveZceXAction } from "./RemoveZceXAction";
import { RequestConsoleAccessAction } from "./RequestConsoleAccessAction";
import { ResetGlobalConfigAction } from "./ResetGlobalConfigAction";
import { ResetTemplateConfigAction } from "./ResetTemplateConfigAction";
import { ResizeDataVolumeAction } from "./ResizeDataVolumeAction";
import { ResizeRootVolumeAction } from "./ResizeRootVolumeAction";
import { RestoreNkpAction } from "./RestoreNkpAction";
import { ResumeLongJobAction } from "./ResumeLongJobAction";
import { ResumeVmInstanceAction } from "./ResumeVmInstanceAction";
import { RevertTemplateConfigAction } from "./RevertTemplateConfigAction";
import { RevertVmFromSnapshotGroupAction } from "./RevertVmFromSnapshotGroupAction";
import { RevertVmFromVmBackupAction } from "./RevertVmFromVmBackupAction";
import { RevertVolumeFromSnapshotAction } from "./RevertVolumeFromSnapshotAction";
import { RevertVolumeFromVolumeBackupAction } from "./RevertVolumeFromVolumeBackupAction";
import { RevokeMonitorTemplateFromMonitorGroupAction } from "./RevokeMonitorTemplateFromMonitorGroupAction";
import { RevokeResourceSharingAction } from "./RevokeResourceSharingAction";
import { RevokeResourceSharingToGroupAction } from "./RevokeResourceSharingToGroupAction";
import { RunSchedulerTriggerAction } from "./RunSchedulerTriggerAction";
import { SNSEmailTestConnectionAction } from "./SNSEmailTestConnectionAction";
import { SNSSnmpTestConnectionAction } from "./SNSSnmpTestConnectionAction";
import { ScanVmInstanceMetadataFromPrimaryStorageAction } from './ScanVmInstanceMetadataFromPrimaryStorageAction';
import { SecurityMachineDetectSyncAction } from "./SecurityMachineDetectSyncAction";
import { SecurityMachineEncryptAction } from "./SecurityMachineEncryptAction";
import { SetImageBootModeAction } from "./SetImageBootModeAction";
import { SetImageQgaAction } from "./SetImageQgaAction";
import { SetIpOnHostNetworkBondingAction } from "./SetIpOnHostNetworkBondingAction";
import { SetIpOnHostNetworkInterfaceAction } from "./SetIpOnHostNetworkInterfaceAction";
import { SetL3NetworkMtuAction } from "./SetL3NetworkMtuAction";
import { SetL3NetworkRouterInterfaceIpAction } from "./SetL3NetworkRouterInterfaceIpAction";
import { SetNicQosAction } from "./SetNicQosAction";
import { SetSecurityMachineKeyAction } from "./SetSecurityMachineKeyAction";
import { SetServiceTypeOnHostNetworkBondingAction } from "./SetServiceTypeOnHostNetworkBondingAction";
import { SetServiceTypeOnHostNetworkInterfaceAction } from "./SetServiceTypeOnHostNetworkInterfaceAction";
import { SetVmBootModeAction } from "./SetVmBootModeAction";
import { SetVmBootOrderAction } from "./SetVmBootOrderAction";
import { SetVmBootVolumeAction } from "./SetVmBootVolumeAction";
import { SetVmCleanTrafficAction } from "./SetVmCleanTrafficAction";
import { SetVmClockTrackAction } from "./SetVmClockTrackAction";
import { SetVmConsoleModeAction } from "./SetVmConsoleModeAction";
import { SetVmConsolePasswordAction } from "./SetVmConsolePasswordAction";
import { SetVmDnsAction } from "./SetVmDnsAction";
import { SetVmEmulatorPinningAction } from "./SetVmEmulatorPinningAction";
import { SetVmHostnameAction } from "./SetVmHostnameAction";
import { SetVmInstanceDefaultCdRomAction } from "./SetVmInstanceDefaultCdRomAction";
import { SetVmInstanceHaLevelAction } from "./SetVmInstanceHaLevelAction";
import { SetVmMonitorNumberAction } from "./SetVmMonitorNumberAction";
import { SetVmNicSecurityGroupAction } from "./SetVmNicSecurityGroupAction";
import { SetVmNumaAction } from "./SetVmNumaAction";
import { SetVmQgaAction } from "./SetVmQgaAction";
import { SetVmQxlMemoryAction } from "./SetVmQxlMemoryAction";
import { SetVmRDPAction } from "./SetVmRDPAction";
import { SetVmSshKeyAction } from "./SetVmSshKeyAction";
import { SetVmStaticIpAction } from "./SetVmStaticIpAction";
import { SetVmUsbRedirectAction } from "./SetVmUsbRedirectAction";
import { SetVolumeIoThreadPinAction } from "./SetVolumeIoThreadPinAction";
import { SetVolumeQosAction } from "./SetVolumeQosAction";
import { ShareResourceAction } from "./ShareResourceAction";
import { ShareResourceToGroupAction } from "./ShareResourceToGroupAction";
import { ShutdownHostAction } from "./ShutdownHostAction";
import { StartBaremetalInstanceAction } from "./StartBaremetalInstanceAction";
import { StartBaremetalPxeServerAction } from "./StartBaremetalPxeServerAction";
import { StartSnmpAgentAction } from "./StartSnmpAgentAction";
import { StartVmInstanceAction } from "./StartVmInstanceAction";
import { StopBaremetalInstanceAction } from "./StopBaremetalInstanceAction";
import { StopBaremetalPxeServerAction } from "./StopBaremetalPxeServerAction";
import { StopSnmpAgentAction } from "./StopSnmpAgentAction";
import { StopVmInstanceAction } from "./StopVmInstanceAction";
import { SubmitLongJobAction } from "./SubmitLongJobAction";
import { SubscribeEventAction } from "./SubscribeEventAction";
import { SubscribeSNSTopicAction } from "./SubscribeSNSTopicAction";
import { SyncAccountsFromLdapServerAction } from "./SyncAccountsFromLdapServerAction";
import { SyncBackupFromImageStoreBackupStorageAction } from "./SyncBackupFromImageStoreBackupStorageAction";
import { SyncChronyServersAction } from "./SyncChronyServersAction";
import { SyncDatabaseBackupAction } from "./SyncDatabaseBackupAction";
import { SyncDatabaseBackupFromImageStoreBackupStorageAction } from "./SyncDatabaseBackupFromImageStoreBackupStorageAction";
import { SyncImageFromImageStoreBackupStorageAction } from "./SyncImageFromImageStoreBackupStorageAction";
import { SyncImageSizeAction } from "./SyncImageSizeAction";
import { SyncVmBackupAction } from "./SyncVmBackupAction";
import { SyncVmBackupFromImageStoreBackupStorageAction } from "./SyncVmBackupFromImageStoreBackupStorageAction";
import { SyncVolumeBackupAction } from "./SyncVolumeBackupAction";
import { SyncVolumeSizeAction } from "./SyncVolumeSizeAction";
import { TakeVmConsoleScreenshotAction } from "./TakeVmConsoleScreenshotAction";
import { TakeoverPrimaryStorageAction } from './TakeoverPrimaryStorageAction';
import { UngenerateMdevDevicesAction } from "./UngenerateMdevDevicesAction";
import { UngenerateSriovPciDevicesAction } from "./UngenerateSriovPciDevicesAction";
import { UninstallSoftwarePackageAction } from "./UninstallSoftwarePackageAction";
import { UnsubscribeEventAction } from "./UnsubscribeEventAction";
import { UnsubscribeSNSTopicAction } from "./UnsubscribeSNSTopicAction";
import { UpdateAccessControlRuleAction } from "./UpdateAccessControlRuleAction";
import { UpdateAccountAction } from "./UpdateAccountAction";
import { UpdateAccountGroupAction } from "./UpdateAccountGroupAction";
import { UpdateActiveAlarmTemplateAction } from "./UpdateActiveAlarmTemplateAction";
import { UpdateAffinityGroupAction } from "./UpdateAffinityGroupAction";
import { UpdateAlarmAction } from "./UpdateAlarmAction";
import { UpdateAlarmDataAction } from "./UpdateAlarmDataAction";
import { UpdateAlarmLabelAction } from "./UpdateAlarmLabelAction";
import { UpdateAlertDataAckAction } from "./UpdateAlertDataAckAction";
import { UpdateAliyunEbsBackupStorageAction } from "./UpdateAliyunEbsBackupStorageAction";
import { UpdateAliyunSmsSNSTextTemplateAction } from "./UpdateAliyunSmsSNSTextTemplateAction";
import { UpdateAtPersonOfAtDingTalkEndpointAction } from "./UpdateAtPersonOfAtDingTalkEndpointAction";
import { UpdateAtPersonOfAtFeiShuEndpointAction } from "./UpdateAtPersonOfAtFeiShuEndpointAction";
import { UpdateAtPersonOfAtWeComEndpointAction } from "./UpdateAtPersonOfAtWeComEndpointAction";
import { UpdateBackupStorageAction } from "./UpdateBackupStorageAction";
import { UpdateBareMetal2InstanceAction } from "./UpdateBareMetal2InstanceAction";
import { UpdateBaremetalChassisAction } from "./UpdateBaremetalChassisAction";
import { UpdateBaremetalInstanceAction } from "./UpdateBaremetalInstanceAction";
import { UpdateBaremetalPxeServerAction } from "./UpdateBaremetalPxeServerAction";
import { UpdateBondingAction } from "./UpdateBondingAction";
import { UpdateCasClientAction } from "./UpdateCasClientAction";
import { UpdateCephBackupStorageMonAction } from "./UpdateCephBackupStorageMonAction";
import { UpdateCephPrimaryStorageMonAction } from "./UpdateCephPrimaryStorageMonAction";
import { UpdateCephPrimaryStoragePoolAction } from "./UpdateCephPrimaryStoragePoolAction";
import { UpdateChronyServersAction } from "./UpdateChronyServersAction";
import { UpdateClusterAction } from "./UpdateClusterAction";
import { UpdateClusterDRSAction } from "./UpdateClusterDRSAction";
import { UpdateConsoleProxyAgentAction } from "./UpdateConsoleProxyAgentAction";
import { UpdateDirectoryAction } from "./UpdateDirectoryAction";
import { UpdateDiskOfferingAction } from "./UpdateDiskOfferingAction";
import { UpdateEipAction } from "./UpdateEipAction";
import { UpdateEmailAddressOfSNSEmailEndpointAction } from "./UpdateEmailAddressOfSNSEmailEndpointAction";
import { UpdateEventDataAction } from "./UpdateEventDataAction";
import { UpdateEventRuleTemplateAction } from "./UpdateEventRuleTemplateAction";
import { UpdateExternalPrimaryStorageAction } from "./UpdateExternalPrimaryStorageAction";
import { UpdateFlkSecSecretResourcePoolAction } from "./UpdateFlkSecSecretResourcePoolAction";
import { UpdateGlobalConfigAction } from "./UpdateGlobalConfigAction";
import { UpdateGuestToolsStateAction } from "./UpdateGuestToolsStateAction";
import { UpdateGuestVmScriptAction } from "./UpdateGuestVmScriptAction";
import { UpdateHaStrategyConditionAction } from "./UpdateHaStrategyConditionAction";
import { UpdateHostAction } from "./UpdateHostAction";
import { UpdateHostIommuStateAction } from "./UpdateHostIommuStateAction";
import { UpdateHostIpmiAction } from "./UpdateHostIpmiAction";
import { UpdateHostIscsiInitiatorNameAction } from "./UpdateHostIscsiInitiatorNameAction";
import { UpdateHostKernelInterfaceAction } from "./UpdateHostKernelInterfaceAction";
import { UpdateHostNetworkInterfaceAction } from "./UpdateHostNetworkInterfaceAction";
import { UpdateHostNqnAction } from "./UpdateHostNqnAction";
import { UpdateHostSchedulingRuleGroupAction } from "./UpdateHostSchedulingRuleGroupAction";
import { UpdateHostnameAction } from "./UpdateHostnameAction";
import { UpdateHybridKeySecretAction } from "./UpdateHybridKeySecretAction";
import { UpdateImageAction } from "./UpdateImageAction";
import { UpdateImageStoreBackupStorageAction } from "./UpdateImageStoreBackupStorageAction";
import { UpdateInfoSecSecretResourcePoolAction } from "./UpdateInfoSecSecretResourcePoolAction";
import { UpdateInstanceOfferingAction } from "./UpdateInstanceOfferingAction";
import { UpdateIscsiServerAction } from "./UpdateIscsiServerAction";
import { UpdateKVMHostAction } from "./UpdateKVMHostAction";
import { UpdateKmsAction } from "./UpdateKmsAction";
import { UpdateL2NetworkAction } from "./UpdateL2NetworkAction";
import { UpdateL2NetworkVirtualNetworkIdAction } from "./UpdateL2NetworkVirtualNetworkIdAction";
import { UpdateL3NetworkAction } from "./UpdateL3NetworkAction";
import { UpdateLdapServerAction } from "./UpdateLdapServerAction";
import { UpdateLicenseAction } from "./UpdateLicenseAction";
import { UpdateLogConfigurationAction } from "./UpdateLogConfigurationAction";
import { UpdateLogServerAction } from './UpdateLogServerAction';
import { UpdateMdevDeviceAction } from "./UpdateMdevDeviceAction";
import { UpdateMdevDeviceSpecAction } from "./UpdateMdevDeviceSpecAction";
import { UpdateMetricRuleTemplateAction } from "./UpdateMetricRuleTemplateAction";
import { UpdateMonitorGroupAction } from "./UpdateMonitorGroupAction";
import { UpdateMonitorTemplateAction } from "./UpdateMonitorTemplateAction";
import { UpdateNkpAction } from "./UpdateNkpAction";
import { UpdateNvmeServerAction } from "./UpdateNvmeServerAction";
import { UpdateOAuthClientAction } from "./UpdateOAuthClientAction";
import { UpdatePciDeviceAction } from "./UpdatePciDeviceAction";
import { UpdatePciDeviceSpecAction } from "./UpdatePciDeviceSpecAction";
import { UpdatePortMirrorAction } from "./UpdatePortMirrorAction";
import { UpdatePreconfigurationTemplateAction } from "./UpdatePreconfigurationTemplateAction";
import { UpdatePrimaryStorageAction } from "./UpdatePrimaryStorageAction";
import { UpdateQuotaAction } from "./UpdateQuotaAction";
import { UpdateResourceAttributeKeyAction } from "./UpdateResourceAttributeKeyAction";
import { UpdateResourceConfigAction } from "./UpdateResourceConfigAction";
import { UpdateResourceConfigsAction } from "./UpdateResourceConfigsAction";
import { UpdateResourceStackAction } from "./UpdateResourceStackAction";
import { UpdateRoleAction } from "./UpdateRoleAction";
import { UpdateSNSApplicationEndpointAction } from "./UpdateSNSApplicationEndpointAction";
import { UpdateSNSApplicationPlatformAction } from "./UpdateSNSApplicationPlatformAction";
import { UpdateSNSDingTalkEndpointAction } from "./UpdateSNSDingTalkEndpointAction";
import { UpdateSNSFeiShuEndpointAction } from "./UpdateSNSFeiShuEndpointAction";
import { UpdateSNSSnmpPlatformAction } from "./UpdateSNSSnmpPlatformAction";
import { UpdateSNSTextTemplateAction } from "./UpdateSNSTextTemplateAction";
import { UpdateSNSTopicAction } from "./UpdateSNSTopicAction";
import { UpdateSNSWeComEndpointAction } from "./UpdateSNSWeComEndpointAction";
import { UpdateSSORedirectTemplateAction } from "./UpdateSSORedirectTemplateAction";
import { UpdateSchedulerJobAction } from "./UpdateSchedulerJobAction";
import { UpdateSchedulerJobGroupAction } from "./UpdateSchedulerJobGroupAction";
import { UpdateSchedulerTriggerAction } from "./UpdateSchedulerTriggerAction";
import { UpdateSdnControllerAction } from "./UpdateSdnControllerAction";
import { UpdateSecretResourcePoolAction } from "./UpdateSecretResourcePoolAction";
import { UpdateSecurityGroupAction } from "./UpdateSecurityGroupAction";
import { UpdateSecurityGroupRulePriorityAction } from "./UpdateSecurityGroupRulePriorityAction";
import { UpdateSecurityMachineAction } from "./UpdateSecurityMachineAction";
import { UpdateSftpBackupStorageAction } from "./UpdateSftpBackupStorageAction";
import { UpdateSnmpAgentAction } from "./UpdateSnmpAgentAction";
import { UpdateSshKeyPairAction } from "./UpdateSshKeyPairAction";
import { UpdateStackTemplateAction } from "./UpdateStackTemplateAction";
import { UpdateSubscribeEventAction } from "./UpdateSubscribeEventAction";
import { UpdateSystemTagAction } from "./UpdateSystemTagAction";
import { UpdateTagAction } from "./UpdateTagAction";
import { UpdateTemplateConfigAction } from "./UpdateTemplateConfigAction";
import { UpdateTemplatedVmInstanceAction } from "./UpdateTemplatedVmInstanceAction";
import { UpdateThirdpartyAlertsAction } from "./UpdateThirdpartyAlertsAction";
import { UpdateThirdpartyPlatformAction } from "./UpdateThirdpartyPlatformAction";
import { UpdateTpmAction } from './UpdateTpmAction';
import { UpdateUsbDeviceAction } from "./UpdateUsbDeviceAction";
import { UpdateVRouterRouteTableAction } from "./UpdateVRouterRouteTableAction";
import { UpdateVirtualRouterOfferingAction } from "./UpdateVirtualRouterOfferingAction";
import { UpdateVirtualSwitchUplinkBondingsAction } from "./UpdateVirtualSwitchUplinkBondingsAction";
import { UpdateVirtualSwitchUplinkGroupAction } from "./UpdateVirtualSwitchUplinkGroupAction";
import { UpdateVmCdRomAction } from "./UpdateVmCdRomAction";
import { UpdateVmCustomSpecificationAction } from "./UpdateVmCustomSpecificationAction";
import { UpdateVmInstanceAction } from "./UpdateVmInstanceAction";
import { UpdateVmNetworkConfigAction } from "./UpdateVmNetworkConfigAction";
import { UpdateVmNicDriverAction } from "./UpdateVmNicDriverAction";
import { UpdateVmNicMacAction } from "./UpdateVmNicMacAction";
import { UpdateVmPriorityAction } from "./UpdateVmPriorityAction";
import { UpdateVmSchedulingRuleAction } from "./UpdateVmSchedulingRuleAction";
import { UpdateVmSchedulingRuleGroupAction } from "./UpdateVmSchedulingRuleGroupAction";
import { UpdateVmUserDefinedXmlHookScriptAction } from "./UpdateVmUserDefinedXmlHookScriptAction";
import { UpdateVniRangeAction } from "./UpdateVniRangeAction";
import { UpdateVolumeAction } from "./UpdateVolumeAction";
import { UpdateVolumeSnapshotAction } from "./UpdateVolumeSnapshotAction";
import { UpdateVolumeSnapshotGroupAction } from "./UpdateVolumeSnapshotGroupAction";
import { UpdateXskyBlockVolumeAction } from "./UpdateXskyBlockVolumeAction";
import { UpdateZStoneClusterConfigAction } from "./UpdateZStoneClusterConfigAction";
import { UpdateZStoneHostConfigAction } from "./UpdateZStoneHostConfigAction";
import { UpdateZceXClusterConfigAction } from "./UpdateZceXClusterConfigAction";
import { UpdateZoneAction } from "./UpdateZoneAction";
import { UploadKmsClientCsrAction } from './UploadKmsClientCsrAction';
import { UploadKmsClientIdentityAction } from './UploadKmsClientIdentityAction';
import { UploadKmsClientSignedCertAction } from './UploadKmsClientSignedCertAction';
import { UploadKmsServerCertAction } from './UploadKmsServerCertAction';
import { ValidateClusterSupportDRSAction } from "./ValidateClusterSupportDRSAction";
import { ValidateDiskOfferingUserConfigAction } from "./ValidateDiskOfferingUserConfigAction";
import { ValidateInstanceOfferingUserConfigAction } from "./ValidateInstanceOfferingUserConfigAction";
import { ValidatePasswordAction } from "./ValidatePasswordAction";
import { ValidateSNSAliyunSmsEndpointAction } from "./ValidateSNSAliyunSmsEndpointAction";
import { ValidateSNSEmailPlatformAction } from "./ValidateSNSEmailPlatformAction";
import { ValidateSecurityGroupRuleAction } from "./ValidateSecurityGroupRuleAction";
import { ValidateSessionAction } from "./ValidateSessionAction";
import { ValidateSessionActionBase } from "./ValidateSessionActionBase";
import { ValidateVmSchedulingRuleAction } from "./ValidateVmSchedulingRuleAction";
import { WebhookCallbackService } from "./base/webhook-callback.service";
import { WebhookController } from "./base/webhook.controller";
import { ZSha2DemoteAction } from "./ZSha2DemoteAction";
import { ZceXTestConnectionAction } from "./ZceXTestConnectionAction"
import { CheckTelemetryUpdateAction } from "./CheckTelemetryUpdateAction";
import { GetTelemetryConsentAction } from "./GetTelemetryConsentAction";
import { GetTelemetrySettingsAction } from "./GetTelemetrySettingsAction";
import { UpdateTelemetryConsentAction } from "./UpdateTelemetryConsentAction";

@Global()
@Module({
  imports: [TransModule],
  providers: [
    WebhookCallbackService,
    CheckTelemetryUpdateAction,
    GetTelemetryConsentAction,
    GetTelemetrySettingsAction,
    UpdateTelemetryConsentAction,
    AckAlarmDataAction,
    AckEventDataAction,
    AddAccessControlRuleAction,
    AddAccountToGroupAction,
    AddActionToAlarmAction,
    AddActionToEventSubscriptionAction,
    AddAliyunEbsBackupStorageAction,
    AddAliyunEbsPrimaryStorageAction,
    AddAliyunNasPrimaryStorageAction,
    AddBlockPrimaryStorageAction,
    AddCCSCertificateAction,
    AddCephBackupStorageAction,
    AddCephPrimaryStorageAction,
    AddCephPrimaryStoragePoolAction,
    AddDnsToL3NetworkAction,
    AddEmailAddressToSNSEmailEndpointAction,
    AddEventRuleTemplateAction,
    AddExternalPrimaryStorageAction,
    AddFlkSecSecurityMachineAction,
    AddHostToHostSchedulingRuleGroupAction,
    AddHybridKeySecretAction,
    AddImageStoreBackupStorageAction,
    AddInfoSecSecurityMachineAction,
    AddInstanceToMonitorGroupAction,
    AddIpRangeAction,
    AddIpRangeByNetworkCidrAction,
    AddIpv6RangeAction,
    AddIpv6RangeByNetworkCidrAction,
    AddIscsiServerAction,
    AddKVMHostAction,
    AddLdapServerAction,
    AddLocalPrimaryStorageAction,
    AddLogConfigurationAction,
    AddLogServerAction,
    AddMdevDeviceSpecToVmInstanceAction,
    AddMetricRuleTemplateAction,
    AddMonToCephBackupStorageAction,
    AddMonToCephPrimaryStorageAction,
    AddNfsPrimaryStorageAction,
    AddNvmeServerAction,
    AddPciDeviceSpecToVmInstanceAction,
    AddPreconfigurationTemplateAction,
    AddResourcesToDirectoryAction,
    AddSNSDingTalkAtPersonAction,
    AddSNSFeiShuAtPersonAction,
    AddSNSSmsReceiverAction,
    AddSNSWeComAtPersonAction,
    AddSchedulerJobGroupToSchedulerTriggerAction,
    AddSchedulerJobToSchedulerTriggerAction,
    AddSchedulerJobsToSchedulerJobGroupAction,
    AddSdnControllerAction,
    AddSecurityGroupRuleAction,
    AddSftpBackupStorageAction,
    AddSharedBlockGroupPrimaryStorageAction,
    AddSharedBlockToSharedBlockGroupAction,
    AddSharedMountPointPrimaryStorageAction,
    AddStackTemplateAction,
    AddStorageProtocolAction,
    AddThirdpartyPlatformAction,
    AddTpmAction,
    AddVRouterRouteEntryAction,
    AddVmNicToSecurityGroupAction,
    AddVmToAffinityGroupAction,
    AddVmToVmSchedulingRuleGroupAction,
    AddXDragonHostAction,
    AddZStoneAction,
    AddZceXAction,
    AllocateHostResourceAction,
    ApplyDRSAdviceAction,
    ApplyMonitorTemplateToMonitorGroupAction,
    ApplyTemplateConfigAction,
    AttachBackupStorageToZoneAction,
    AttachBareMetal2ProvisionNetworkToClusterAction,
    AttachBaremetalPxeServerToClusterAction,
    AttachDataVolumeToVmAction,
    AttachEipAction,
    AttachGuestToolsIsoToVmAction,
    AttachIscsiServerToClusterAction,
    AttachIsoToVmInstanceAction,
    AttachL2NetworkToClusterAction,
    AttachL2NetworkToHostAction,
    AttachL3NetworkToVmAction,
    AttachMdevDeviceToVmAction,
    AttachNetworkServiceToL3NetworkAction,
    AttachNvmeServerToClusterAction,
    AttachPciDeviceToVmAction,
    AttachPriceTableToAccountAction,
    AttachPrimaryStorageToClusterAction,
    AttachProvisionNicToBondingAction,
    AttachRoleToAccountAction,
    AttachRoleToAccountGroupAction,
    AttachScsiLunToVmInstanceAction,
    AttachSecurityGroupToL3NetworkAction,
    AttachSshKeyPairToVmInstanceAction,
    AttachTagToResourcesAction,
    AttachUsbDeviceToVmAction,
    AttachUserDefinedXmlHookScriptToVmAction,
    AttachVRouterRouteTableToVRouterAction,
    BackupNkpAction,
    BatchCreateHostKernelInterfaceAction,
    BatchDeleteVolumeSnapshotAction,
    CalculateImageHashAction,
    CancelLongJobAction,
    ChangeAccessKeyStateAction,
    ChangeAccountPriceTableBindingAction,
    ChangeAccountTypeAction,
    ChangeActiveAlarmStateAction,
    ChangeAffinityGroupStateAction,
    ChangeAlarmStateAction,
    ChangeBackupStorageStateAction,
    ChangeBaremetalChassisStateAction,
    ChangeClusterStateAction,
    ChangeDiskOfferingStateAction,
    ChangeEventSubscriptionStateAction,
    ChangeHostNetworkInterfaceLldpModeAction,
    ChangeHostStateAction,
    ChangeImageStateAction,
    ChangeInstanceOfferingAction,
    ChangeInstanceOfferingStateAction,
    ChangeL3NetworkDhcpIpAddressAction,
    ChangePortMirrorStateAction,
    ChangePreconfigurationTemplateStateAction,
    ChangePrimaryStorageStateAction,
    ChangeResourceOwnerAction,
    ChangeSNSApplicationEndpointStateAction,
    ChangeSNSApplicationPlatformStateAction,
    ChangeSchedulerStateAction,
    ChangeSecurityGroupRuleAction,
    ChangeSecurityGroupRuleStateAction,
    ChangeSecurityGroupStateAction,
    ChangeSecurityMachineStateAction,
    ChangeVmImageAction,
    ChangeVmNicNetworkAction,
    ChangeVmNicSecurityPolicyAction,
    ChangeVmNicStateAction,
    ChangeVmNicTypeAction,
    ChangeVmPasswordAction,
    ChangeVmSchedulingRuleStateAction,
    ChangeVolumeStateAction,
    ChangeZoneStateAction,
    CheckBaremetalChassisConfigFileAction,
    CheckBatchDataIntegrityAction,
    CheckCephHealthStatusAction,
    CheckCephPluginAction,
    CheckIpAvailabilityAction,
    CheckKVMHostConfigFileAction,
    CheckMemorySnapshotGroupConflictAction,
    CheckNetworkReachableAction,
    CheckScsiLunClusterStatusAction,
    CheckStackTemplateParametersAction,
    CheckVolumeSnapshotGroupAvailabilityAction,
    CleanSoftwarePackageAction,
    CleanUpBareMetal2BondingAction,
    CleanUpBaremetalChassisBondingAction,
    CleanUpTrashOnBackupStorageAction,
    CleanUpTrashOnPrimaryStorageAction,
    CleanUpgradeSoftwarePackageAction,
    CloneMonitorTemplateAction,
    CloneVmInstanceAction,
    ConvertTemplatedVmInstanceToVmInstanceAction,
    ConvertVmInstanceToTemplatedVmInstanceAction,
    CreateAccessKeyAction,
    CreateAccountAction,
    CreateAccountGroupAction,
    CreateAffinityGroupAction,
    CreateAiSiNoSecretResourcePoolAction,
    CreateAlarmAction,
    CreateAliyunSmsSNSTextTemplateAction,
    CreateBareMetal2BondingAction,
    CreateBaremetalBondingAction,
    CreateBaremetalChassisAction,
    CreateBaremetalInstanceAction,
    CreateBaremetalPxeServerAction,
    CreateBlockVolumeAction,
    CreateBondingAction,
    CreateCasClientAction,
    CreateClusterAction,
    CreateClusterDRSAction,
    CreateDataVolumeAction,
    CreateDataVolumeFromVolumeBackupAction,
    CreateDataVolumeFromVolumeTemplateAction,
    CreateDataVolumeTemplateFromVolumeBackupAction,
    CreateDirectoryAction,
    CreateDiskOfferingAction,
    CreateEipAction,
    CreateFlkSecSecretResourcePoolAction,
    CreateGuestVmScriptAction,
    CreateHaiTaiSecretResourcePoolAction,
    CreateHostKernelInterfaceAction,
    CreateHostSchedulingRuleGroupAction,
    CreateInfoSecSecretResourcePoolAction,
    CreateInstanceOfferingAction,
    CreateKmsAction,
    CreateL2HardwareVxlanNetworkAction,
    CreateL2HardwareVxlanNetworkPoolAction,
    CreateL2NoVlanNetworkAction,
    CreateL2PortGroupAction,
    CreateL2VirtualSwitchAction,
    CreateL2VlanNetworkAction,
    CreateL2VxlanNetworkAction,
    CreateL2VxlanNetworkPoolAction,
    CreateL3NetworkAction,
    CreateMonitorGroupAction,
    CreateMonitorTemplateAction,
    CreateNkpAction,
    CreateOAuthClientAction,
    CreatePortGroupAction,
    CreatePortMirrorAction,
    CreatePortMirrorSessionAction,
    CreateResourceAttributeKeyAction,
    CreateResourceAttributeValueAction,
    CreateResourceStackAction,
    CreateRoleAction,
    CreateRootVolumeTemplateFromVolumeBackupAction,
    CreateSNSAliyunSmsEndpointAction,
    CreateSNSDingTalkEndpointAction,
    CreateSNSEmailEndpointAction,
    CreateSNSEmailPlatformAction,
    CreateSNSFeiShuEndpointAction,
    CreateSNSHttpEndpointAction,
    CreateSNSMicrosoftTeamsEndpointAction,
    CreateSNSSnmpEndpointAction,
    CreateSNSSnmpPlatformAction,
    CreateSNSTextTemplateAction,
    CreateSNSTopicAction,
    CreateSNSWeComEndpointAction,
    CreateSchedulerJobAction,
    CreateSchedulerJobGroupAction,
    CreateSchedulerTriggerAction,
    CreateSecurityGroupAction,
    CreateSlbOfferingAction,
    CreateSnmpAgentAction,
    CreateSshKeyPairAction,
    CreateSystemTagAction,
    CreateTagAction,
    CreateTemplatedVmInstanceFromVmInstanceAction,
    CreateVRouterRouteTableAction,
    CreateVirtualRouterOfferingAction,
    CreateVmBackupAction,
    CreateVmCdRomAction,
    CreateVmCustomSpecificationAction,
    CreateVmFromVmBackupAction,
    CreateVmFromVolumeBackupAction,
    CreateVmInstanceAction,
    CreateVmInstanceFromTemplatedVmInstanceAction,
    CreateVmInstanceFromVolumeSnapshotGroupAction,
    CreateVmSchedulingRuleAction,
    CreateVmSchedulingRuleGroupAction,
    CreateVmUserDefinedXmlHookScriptAction,
    CreateVniRangeAction,
    CreateVolumeBackupAction,
    CreateVolumeSnapshotAction,
    CreateVolumeSnapshotGroupAction,
    CreateZceXAlertPlatformAction,
    CreateZoneAction,
    DeleteAccessControlRuleAction,
    DeleteAccessKeyAction,
    DeleteAccountAction,
    DeleteAccountGroupAction,
    DeleteAffinityGroupAction,
    DeleteAlarmAction,
    DeleteBackupStorageAction,
    DeleteBaremetalChassisAction,
    DeleteBaremetalPxeServerAction,
    DeleteBondingAction,
    DeleteCCSCertificateAction,
    DeleteCephPrimaryStoragePoolAction,
    DeleteClusterAction,
    DeleteDataVolumeAction,
    DeleteDatabaseBackupAction,
    DeleteDirectoryAction,
    DeleteDiskOfferingAction,
    DeleteEipAction,
    DeleteEmailAddressOfSNSEmailEndpointAction,
    DeleteEventRuleTemplateAction,
    DeleteExportedImageFromBackupStorageAction,
    DeleteGuestVmScriptAction,
    DeleteHostAction,
    DeleteHostKernelInterfaceAction,
    DeleteHostSchedulingRuleGroupAction,
    DeleteHybridKeySecretAction,
    DeleteImageAction,
    DeleteImagePackageAction,
    DeleteInstanceOfferingAction,
    DeleteIpRangeAction,
    DeleteIscsiServerAction,
    DeleteKmsAction,
    DeleteL2NetworkAction,
    DeleteL3NetworkAction,
    DeleteLdapServerAction,
    DeleteLicenseAction,
    DeleteLogConfigurationAction,
    DeleteLogServerAction,
    DeleteMdevDeviceAction,
    DeleteMetricRuleTemplateAction,
    DeleteMonitorGroupAction,
    DeleteMonitorTemplateAction,
    DeleteNicQosAction,
    DeleteNkpAction,
    DeleteNvmeServerAction,
    DeletePciDeviceAction,
    DeletePortGroupAction,
    DeletePortMirrorAction,
    DeletePortMirrorSessionAction,
    DeletePreconfigurationTemplateAction,
    DeletePrimaryStorageAction,
    DeleteResourceAttributeKeyAction,
    DeleteResourceAttributeValueAction,
    DeleteResourceConfigAction,
    DeleteResourceStackAction,
    DeleteRoleAction,
    DeleteSNSApplicationEndpointAction,
    DeleteSNSApplicationPlatformAction,
    DeleteSNSTextTemplateAction,
    DeleteSNSTopicAction,
    DeleteSSOClientAction,
    DeleteSchedulerJobAction,
    DeleteSchedulerJobGroupAction,
    DeleteSchedulerTriggerAction,
    DeleteSecretResourcePoolAction,
    DeleteSecurityGroupAction,
    DeleteSecurityGroupRuleAction,
    DeleteSecurityMachineAction,
    DeleteSshKeyPairAction,
    DeleteStackTemplateAction,
    DeleteTagAction,
    DeleteTemplatedVmInstanceAction,
    DeleteThirdpartyPlatformAction,
    DeleteVRouterRouteEntryAction,
    DeleteVRouterRouteTableAction,
    DeleteVipAction,
    DeleteVmBackupAction,
    DeleteVmCdRomAction,
    DeleteVmConsolePasswordAction,
    DeleteVmCustomSpecificationAction,
    DeleteVmHostnameAction,
    DeleteVmInstanceHaLevelAction,
    DeleteVmNicFromSecurityGroupAction,
    DeleteVmSchedulingRuleGroupAction,
    DeleteVmSshKeyAction,
    DeleteVmStaticIpAction,
    DeleteVniRangeAction,
    DeleteVolumeBackupAction,
    DeleteVolumeQosAction,
    DeleteVolumeSnapshotGroupAction,
    DeleteZceXAlertPlatformAction,
    DeleteZoneAction,
    DestroyBaremetalInstanceAction,
    DestroyVmInstanceAction,
    DetachBackupStorageFromZoneAction,
    DetachBaremetalPxeServerFromClusterAction,
    DetachDataVolumeFromVmAction,
    DetachEipAction,
    DetachGuestToolsIsoFromVmAction,
    DetachHostFromHostSchedulingRuleGroupAction,
    DetachIscsiServerFromClusterAction,
    DetachIsoFromVmInstanceAction,
    DetachL2NetworkFromClusterAction,
    DetachL2NetworkFromHostAction,
    DetachL3NetworkFromVmAction,
    DetachMdevDeviceFromVmAction,
    DetachNetworkServiceFromL3NetworkAction,
    DetachNvmeServerFromClusterAction,
    DetachPciDeviceFromVmAction,
    DetachPriceTableFromAccountAction,
    DetachPrimaryStorageFromClusterAction,
    DetachProvisionNicFromBondingAction,
    DetachRoleFromAccountAction,
    DetachRoleFromAccountGroupAction,
    DetachScsiLunFromVmInstanceAction,
    DetachSecurityGroupFromL3NetworkAction,
    DetachSshKeyPairFromVmInstanceAction,
    DetachTagFromResourcesAction,
    DetachUsbDeviceFromVmAction,
    DetachUserDefinedXmlHookScriptFromVmAction,
    DetachVRouterRouteTableFromVRouterAction,
    DetachVmFromVmSchedulingRuleGroupAction,
    DiscoverExternalPrimaryStorageAction,
    DiscoverStrangePrimaryStorageAction,
    DoLongjobAction,
    ExecuteDRSSchedulingAction,
    ExecuteGuestVmScriptAction,
    ExportDatabaseBackupFromBackupStorageAction,
    ExportImageFromBackupStorageAction,
    ExportVmOvaPackageAction,
    ExpungeBaremetalInstanceAction,
    ExpungeDataVolumeAction,
    ExpungeImageAction,
    ExpungeVmInstanceAction,
    ExpungeVmUserDefinedXmlHookScriptAction,
    FlattenVmInstanceAction,
    FlattenVolumeAction,
    GenerateMdevDevicesAction,
    GenerateSeMdevDevicesAction,
    GenerateSriovPciDevicesAction,
    GenerateSshKeyPairAction,
    GetAccessPathAction,
    GetAccountPriceTableRefAction,
    GetAccountQuotaUsageAction,
    GetActiveAlarmStatusAction,
    GetAlarmDataAction,
    GetAuditDataAction,
    GetAvailableTriggersAction,
    GetBackupStorageForCreatingImageFromVolumeAction,
    GetBackupStorageTypesAction,
    GetBareMetal2SupportedBootModeAction,
    GetBaremetalChassisPowerStatusAction,
    GetBlockPrimaryStorageMetadataAction,
    GetCandidateHostKernelInterfacesAction,
    GetCandidateInterfaceVlanIdsAction,
    GetCandidateL3NetworksForChangeVmNicNetworkAction,
    GetCandidateNetworkBondingsAction,
    GetCandidateNetworkInterfacesAction,
    GetCandidatePrimaryStoragesForCreatingVmAction,
    GetCandidateVmNicForSecurityGroupAction,
    GetCandidateVmNicsForPortMirrorAction,
    GetCandidateZonesClustersHostsForCreatingVmAction,
    GetChronyServersAction,
    GetClusterHostNetworkFactsAction,
    GetCpuMemoryCapacityAction,
    GetCurrentTimeAction,
    GetDatabaseBackupFromImageStoreAction,
    GetDirectoryUsageAction,
    GetEipAttachableVmNicsAction,
    GetEventDataAction,
    GetFreeIpOfIpRangeAction,
    GetFreeIpOfL3NetworkAction,
    GetGlobalConfigOptionsAction,
    GetHostAllocatorStrategiesAction,
    GetHostBlockDevicesAction,
    GetHostIommuStateAction,
    GetHostIommuStatusAction,
    GetHostMultipathTopologyAction,
    GetHostNUMATopologyAction,
    GetHostNetworkFactsAction,
    GetHostNetworkInterfaceLldpAction,
    GetHostSensorsAction,
    GetHostWebSshUrlAction,
    GetHypervisorTypesAction,
    GetImageQgaAction,
    GetInterdependentL3NetworksBackupStoragesAction,
    GetInterdependentL3NetworksImagesAction,
    GetInterfaceServiceTypeStatisticAction,
    GetIpAddressCapacityAction,
    GetKmsServerCertFromKmsAction,
    GetL3NetworkIpStatisticAction,
    GetL3NetworkMtuAction,
    GetL3NetworkRouterInterfaceIpAction,
    GetLatestGuestToolsForVmAction,
    GetLdapEntryAction,
    GetLicenseAddOnsAction,
    GetLicenseInfoAction,
    GetLicenseRecordsAction,
    GetLicenseUKeyStatusAction,
    GetLocalStorageHostDiskCapacityAction,
    GetLogConfigurationAction,
    GetLoginCaptchaAction,
    GetLoginProceduresAction,
    GetManagementNodeArchAction,
    GetManagementNodeDirCapacityAction,
    GetManagementNodesStatusAction,
    GetMdevDeviceCandidatesAction,
    GetMdevDeviceSpecCandidatesAction,
    GetMemorySnapshotGroupReferenceAction,
    GetMetricDataAction,
    GetMetricLabelValueAction,
    GetNicQosAction,
    GetNodeRolesAction,
    GetOAuthClientSecretAction,
    GetPciDeviceCandidatesForAttachingVmAction,
    GetPciDeviceCandidatesForNewCreateVmAction,
    GetPciDeviceSpecCandidatesAction,
    GetPhysicalMachineBlockDevicesAction,
    GetPlatformTimeZoneAction,
    GetPortForwardingAttachableVmNicsAction,
    GetPrimaryStorageCandidatesForVmMigrationAction,
    GetPrimaryStorageCandidatesForVolumeMigrationAction,
    GetPrimaryStorageLicenseInfoAction,
    GetPrimaryStorageUsageReportAction,
    GetPrometheusMetricLabelValueAction,
    GetResourceAccountAction,
    GetResourceConfigAction,
    GetResourceFromResourceStackAction,
    GetResourceNamesAction,
    GetRolePolicyActionsAction,
    GetSchedulerExecutionReportAction,
    GetScsiLunCandidatesForAttachingVmAction,
    GetSharedBlockCandidateAction,
    GetSignatureServerEncryptPublicKeyAction,
    GetTaskProgressAction,
    GetTaskProgressActionBase,
    GetTrashOnBackupStorageAction,
    GetTrashOnPrimaryStorageAction,
    GetTwoFactorAuthenticationSecretAction,
    GetTwoFactorAuthenticationStateAction,
    GetUploadSoftwarePackageJobDetailsAction,
    GetUsbDeviceCandidatesForAttachingVmAction,
    GetVersionAction,
    GetVirtualizerInfoAction,
    GetVmAttachableDataVolumeAction,
    GetVmAttachableL3NetworkAction,
    GetVmBootOrderAction,
    GetVmConsoleAddressAction,
    GetVmEmulatorPinningAction,
    GetVmGuestToolsInfoAction,
    GetVmHostnameAction,
    GetVmNicAttachedNetworkServiceAction,
    GetVmSchedulingRulesExecuteStateAction,
    GetVmStartingCandidateClustersHostsAction,
    GetVmUptimeAction,
    GetVmsCapabilitiesAction,
    GetVmsSchedulingStateFromSchedulingRuleAction,
    GetVmvNUMATopologyAction,
    GetVolumeCapabilitiesAction,
    GetVolumeIoThreadPinAction,
    GetVolumeQosAction,
    GetVolumeSnapshotSizeAction,
    GetVpcVRouterNetworkServiceStateAction,
    GetZMigrateGatewayVmInstancesAction,
    GetZMigrateInfosAction,
    GetZStoneCapabilityAction,
    GetZWatchAlertHistogramAction,
    GetZceXCapabilityAction,
    InspectBaremetalChassisAction,
    InstallSoftwarePackageAction,
    IsOpensourceVersionAction,
    LocalStorageMigrateVolumeAction,
    LocateHostNetworkInterfaceAction,
    LocateLocalRaidPhysicalDriveAction,
    LogInAction,
    LogInByAccountAction,
    LogOutAction,
    MountBlockDeviceAction,
    MoveDirectoryAction,
    MoveResourcesToDirectoryAction,
    ParseNkpRestoreAction,
    ParseOvfAction,
    PauseVmInstanceAction,
    PowerOffBaremetalChassisAction,
    PowerOnBaremetalChassisAction,
    PowerOnHostAction,
    PowerResetBaremetalChassisAction,
    PowerResetHostAction,
    PreviewResourceStackAction,
    PrimaryStorageMigrateVolumeAction,
    QueryAccessControlRuleAction,
    QueryAccessKeyAction,
    QueryAccountAction,
    QueryAccountResourceRefAction,
    QueryActiveAlarmTemplateAction,
    QueryAddressPoolAction,
    QueryAffinityGroupAction,
    QueryAlarmAction,
    QueryAlarmRecordAction,
    QueryAliyunSmsSNSTextTemplateAction,
    QueryBackupStorageAction,
    QueryBareMetal2ChassisAction,
    QueryBareMetal2GatewayAction,
    QueryBareMetal2InstanceAction,
    QueryBareMetal2ProvisionNetworkAction,
    QueryBaremetalChassisAction,
    QueryBaremetalInstanceAction,
    QueryBaremetalPxeServerAction,
    QueryBlockVolumeAction,
    QueryCCSCertificateAction,
    QueryClusterAction,
    QueryClusterDRSAction,
    QueryConsoleProxyAgentAction,
    QueryDRSAdviceAction,
    QueryDRSVmMigrationActivityAction,
    QueryEipAction,
    QueryEventFromResourceStackAction,
    QueryEventRecordAction,
    QueryEventRuleTemplateAction,
    QueryEventSubscriptionAction,
    QueryGlobalConfigAction,
    QueryHostAction,
    QueryHostNetworkInterfaceAction,
    QueryHostPhysicalMemoryAction,
    QueryHybridKeySecretAction,
    QueryImageAction,
    QueryInstanceOfferingAction,
    QueryIscsiServerAction,
    QueryL2NetworkAction,
    QueryL2VxlanNetworkPoolAction,
    QueryL3NetworkAction,
    QueryLdapServerAction,
    QueryLogServerAction,
    QueryLongJobAction,
    QueryLongJobActionBase,
    QueryManagementNodeAction,
    QueryMdevDeviceAction,
    QueryMdevDeviceSpecAction,
    QueryMetricRuleTemplateAction,
    QueryMonitorGroupAction,
    QueryMonitorGroupAlarmAction,
    QueryMonitorGroupInstanceAction,
    QueryMonitorGroupTemplateRefAction,
    QueryMonitorTemplateAction,
    QueryNetworkServiceL3NetworkRefAction,
    QueryNetworkServiceProviderAction,
    QueryPciDeviceAction,
    QueryPciDeviceSpecAction,
    QueryPortGroupAction,
    QueryPortMirrorAction,
    QueryPortMirrorSessionAction,
    QueryPrimaryStorageAction,
    QueryResourceConfigAction,
    QueryResourceStackAction,
    QuerySNSApplicationEndpointAction,
    QuerySNSEmailAddressAction,
    QuerySNSEmailPlatformAction,
    QuerySNSSmsEndpointAction,
    QuerySNSTextTemplateAction,
    QuerySNSTopicSubscriberAction,
    QuerySchedulerJobAction,
    QuerySchedulerJobGroupAction,
    QuerySchedulerJobHistoryAction,
    QuerySchedulerTriggerAction,
    QuerySdnControllerAction,
    QuerySecretResourcePoolAction,
    QuerySecurityGroupAction,
    QuerySecurityMachineAction,
    QueryShareableVolumeVmInstanceRefAction,
    QuerySharedBlockAction,
    QuerySnmpAgentAction,
    QueryStackTemplateAction,
    QuerySystemTagAction,
    QueryTagAction,
    QueryThirdpartyPlatformAction,
    QueryTpmAction,
    QueryUsbDeviceAction,
    QueryVRouterRouteEntryAction,
    QueryVRouterRouteTableAction,
    QueryVipAction,
    QueryVirtualRouterOfferingAction,
    QueryVirtualRouterVRouterRouteTableRefAction,
    QueryVmCdRomAction,
    QueryVmInstanceAction,
    QueryVmNicAction,
    QueryVmNicInSecurityGroupAction,
    QueryVniRangeAction,
    QueryVolumeAction,
    QueryVolumeBackupAction,
    QueryVolumeSnapshotAction,
    QueryVolumeSnapshotGroupAction,
    QueryVolumeSnapshotTreeAction,
    QueryVpcHaGroupAction,
    QueryVpcRouterAction,
    QueryXskyBlockVolumeAction,
    QueryZStoneAction,
    QueryZceXAction,
    QueryZceXThirdPartyPlatformAlertRefAction,
    QueryZoneAction,
    RebootBaremetalInstanceAction,
    RebootVmInstanceAction,
    ReclaimSpaceFromImageStoreAction,
    ReconnectBackupStorageAction,
    ReconnectBaremetalPxeServerAction,
    ReconnectConsoleProxyAgentAction,
    ReconnectHostAction,
    ReconnectPrimaryStorageAction,
    RecoverBackupFromImageStoreBackupStorageAction,
    RecoverBaremetalInstanceAction,
    RecoverDataVolumeAction,
    RecoverDatabaseFromBackupAction,
    RecoverImageAction,
    RecoverVmBackupFromImageStoreBackupStorageAction,
    RecoverVmInstanceAction,
    RefreshCaptchaAction,
    RefreshFiberChannelStorageAction,
    RefreshIscsiServerAction,
    RefreshNvmeServerAction,
    RefreshNvmeTargetAction,
    RefreshSharedblockDeviceCapacityAction,
    RegisterVmInstanceFromMetadataAction,
    ReimageVmInstanceAction,
    RekeyKeyProviderRefsAction,
    ReloadLicenseAction,
    RemoveAccountFromGroupAction,
    RemoveActionFromAlarmAction,
    RemoveActionFromEventSubscriptionAction,
    RemoveDnsFromL3NetworkAction,
    RemoveInstanceFromMonitorGroupAction,
    RemoveMdevDeviceSpecFromVmInstanceAction,
    RemoveMonFromCephBackupStorageAction,
    RemoveMonFromCephPrimaryStorageAction,
    RemovePciDeviceSpecFromVmInstanceAction,
    RemoveResourcesFromDirectoryAction,
    RemoveSNSDingTalkAtPersonAction,
    RemoveSNSFeiShuAtPersonAction,
    RemoveSNSSmsReceiverAction,
    RemoveSNSWeComAtPersonAction,
    RemoveSchedulerJobFromSchedulerTriggerAction,
    RemoveSchedulerJobGroupFromSchedulerTriggerAction,
    RemoveSchedulerJobsFromSchedulerJobGroupAction,
    RemoveSdnControllerAction,
    RemoveTpmAction,
    RemoveVmFromAffinityGroupAction,
    RemoveVmSchedulingRuleAction,
    RemoveZStoneAction,
    RemoveZceXAction,
    RequestConsoleAccessAction,
    ResetGlobalConfigAction,
    ResetTemplateConfigAction,
    ResizeDataVolumeAction,
    ResizeRootVolumeAction,
    RestoreNkpAction,
    ResumeLongJobAction,
    ResumeVmInstanceAction,
    RevertTemplateConfigAction,
    RevertVmFromSnapshotGroupAction,
    RevertVmFromVmBackupAction,
    RevertVolumeFromSnapshotAction,
    RevertVolumeFromVolumeBackupAction,
    RevokeMonitorTemplateFromMonitorGroupAction,
    RevokeResourceSharingAction,
    RevokeResourceSharingToGroupAction,
    RunSchedulerTriggerAction,
    SNSEmailTestConnectionAction,
    SNSSnmpTestConnectionAction,
    ScanVmInstanceMetadataFromPrimaryStorageAction,
    SecurityMachineDetectSyncAction,
    SecurityMachineEncryptAction,
    SetImageBootModeAction,
    SetImageQgaAction,
    SetIpOnHostNetworkBondingAction,
    SetIpOnHostNetworkInterfaceAction,
    SetL3NetworkMtuAction,
    SetL3NetworkRouterInterfaceIpAction,
    SetNicQosAction,
    SetSecurityMachineKeyAction,
    SetServiceTypeOnHostNetworkBondingAction,
    SetServiceTypeOnHostNetworkInterfaceAction,
    SetVmBootModeAction,
    SetVmBootOrderAction,
    SetVmBootVolumeAction,
    SetVmCleanTrafficAction,
    SetVmClockTrackAction,
    SetVmConsoleModeAction,
    SetVmConsolePasswordAction,
    SetVmDnsAction,
    SetVmEmulatorPinningAction,
    SetVmHostnameAction,
    SetVmInstanceDefaultCdRomAction,
    SetVmInstanceHaLevelAction,
    SetVmMonitorNumberAction,
    SetVmNicSecurityGroupAction,
    SetVmNumaAction,
    SetVmQgaAction,
    SetVmQxlMemoryAction,
    SetVmRDPAction,
    SetVmSshKeyAction,
    SetVmStaticIpAction,
    SetVmUsbRedirectAction,
    SetVolumeIoThreadPinAction,
    SetVolumeQosAction,
    ShareResourceAction,
    ShareResourceToGroupAction,
    ShutdownHostAction,
    StartBaremetalInstanceAction,
    StartBaremetalPxeServerAction,
    StartSnmpAgentAction,
    StartVmInstanceAction,
    StopBaremetalInstanceAction,
    StopBaremetalPxeServerAction,
    StopSnmpAgentAction,
    StopVmInstanceAction,
    SubmitLongJobAction,
    SubscribeEventAction,
    SubscribeSNSTopicAction,
    SyncAccountsFromLdapServerAction,
    SyncBackupFromImageStoreBackupStorageAction,
    SyncChronyServersAction,
    SyncDatabaseBackupAction,
    SyncDatabaseBackupFromImageStoreBackupStorageAction,
    SyncImageFromImageStoreBackupStorageAction,
    SyncImageSizeAction,
    SyncVmBackupAction,
    SyncVmBackupFromImageStoreBackupStorageAction,
    SyncVolumeBackupAction,
    SyncVolumeSizeAction,
    TakeVmConsoleScreenshotAction,
    TakeoverPrimaryStorageAction,
    UngenerateMdevDevicesAction,
    UngenerateSriovPciDevicesAction,
    UninstallSoftwarePackageAction,
    UnsubscribeEventAction,
    UnsubscribeSNSTopicAction,
    UpdateAccessControlRuleAction,
    UpdateAccountAction,
    UpdateAccountGroupAction,
    UpdateActiveAlarmTemplateAction,
    UpdateAffinityGroupAction,
    UpdateAlarmAction,
    UpdateAlarmDataAction,
    UpdateAlarmLabelAction,
    UpdateAlertDataAckAction,
    UpdateAliyunEbsBackupStorageAction,
    UpdateAliyunSmsSNSTextTemplateAction,
    UpdateAtPersonOfAtDingTalkEndpointAction,
    UpdateAtPersonOfAtFeiShuEndpointAction,
    UpdateAtPersonOfAtWeComEndpointAction,
    UpdateBackupStorageAction,
    UpdateBareMetal2InstanceAction,
    UpdateBaremetalChassisAction,
    UpdateBaremetalInstanceAction,
    UpdateBaremetalPxeServerAction,
    UpdateBondingAction,
    UpdateCasClientAction,
    UpdateCephBackupStorageMonAction,
    UpdateCephPrimaryStorageMonAction,
    UpdateCephPrimaryStoragePoolAction,
    UpdateChronyServersAction,
    UpdateClusterAction,
    UpdateClusterDRSAction,
    UpdateConsoleProxyAgentAction,
    UpdateDirectoryAction,
    UpdateDiskOfferingAction,
    UpdateEipAction,
    UpdateEmailAddressOfSNSEmailEndpointAction,
    UpdateEventDataAction,
    UpdateEventRuleTemplateAction,
    UpdateExternalPrimaryStorageAction,
    UpdateFlkSecSecretResourcePoolAction,
    UpdateGlobalConfigAction,
    UpdateGuestToolsStateAction,
    UpdateGuestVmScriptAction,
    UpdateHaStrategyConditionAction,
    UpdateHostAction,
    UpdateHostIommuStateAction,
    UpdateHostIpmiAction,
    UpdateHostIscsiInitiatorNameAction,
    UpdateHostKernelInterfaceAction,
    UpdateHostNetworkInterfaceAction,
    UpdateHostNqnAction,
    UpdateHostSchedulingRuleGroupAction,
    UpdateHostnameAction,
    UpdateHybridKeySecretAction,
    UpdateImageAction,
    UpdateImageStoreBackupStorageAction,
    UpdateInfoSecSecretResourcePoolAction,
    UpdateInstanceOfferingAction,
    UpdateIscsiServerAction,
    UpdateKVMHostAction,
    UpdateKmsAction,
    UpdateL2NetworkAction,
    UpdateL2NetworkVirtualNetworkIdAction,
    UpdateL3NetworkAction,
    UpdateLdapServerAction,
    UpdateLicenseAction,
    UpdateLogConfigurationAction,
    UpdateLogServerAction,
    UpdateMdevDeviceAction,
    UpdateMdevDeviceSpecAction,
    UpdateMetricRuleTemplateAction,
    UpdateMonitorGroupAction,
    UpdateMonitorTemplateAction,
    UpdateNkpAction,
    UpdateNvmeServerAction,
    UpdateOAuthClientAction,
    UpdatePciDeviceAction,
    UpdatePciDeviceSpecAction,
    UpdatePortMirrorAction,
    UpdatePreconfigurationTemplateAction,
    UpdatePrimaryStorageAction,
    UpdateQuotaAction,
    UpdateResourceAttributeKeyAction,
    UpdateResourceConfigAction,
    UpdateResourceConfigsAction,
    UpdateResourceStackAction,
    UpdateRoleAction,
    UpdateSNSApplicationEndpointAction,
    UpdateSNSApplicationPlatformAction,
    UpdateSNSDingTalkEndpointAction,
    UpdateSNSFeiShuEndpointAction,
    UpdateSNSSnmpPlatformAction,
    UpdateSNSTextTemplateAction,
    UpdateSNSTopicAction,
    UpdateSNSWeComEndpointAction,
    UpdateSSORedirectTemplateAction,
    UpdateSchedulerJobAction,
    UpdateSchedulerJobGroupAction,
    UpdateSchedulerTriggerAction,
    UpdateSdnControllerAction,
    UpdateSecretResourcePoolAction,
    UpdateSecurityGroupAction,
    UpdateSecurityGroupRulePriorityAction,
    UpdateSecurityMachineAction,
    UpdateSftpBackupStorageAction,
    UpdateSnmpAgentAction,
    UpdateSshKeyPairAction,
    UpdateStackTemplateAction,
    UpdateSubscribeEventAction,
    UpdateSystemTagAction,
    UpdateTagAction,
    UpdateTemplateConfigAction,
    UpdateTemplatedVmInstanceAction,
    UpdateThirdpartyAlertsAction,
    UpdateThirdpartyPlatformAction,
    UpdateTpmAction,
    UpdateUsbDeviceAction,
    UpdateVRouterRouteTableAction,
    UpdateVirtualRouterOfferingAction,
    UpdateVirtualSwitchUplinkBondingsAction,
    UpdateVirtualSwitchUplinkGroupAction,
    UpdateVmCdRomAction,
    UpdateVmCustomSpecificationAction,
    UpdateVmInstanceAction,
    UpdateVmNetworkConfigAction,
    UpdateVmNicDriverAction,
    UpdateVmNicMacAction,
    UpdateVmPriorityAction,
    UpdateVmSchedulingRuleAction,
    UpdateVmSchedulingRuleGroupAction,
    UpdateVmUserDefinedXmlHookScriptAction,
    UpdateVniRangeAction,
    UpdateVolumeAction,
    UpdateVolumeSnapshotAction,
    UpdateVolumeSnapshotGroupAction,
    UpdateXskyBlockVolumeAction,
    UpdateZStoneClusterConfigAction,
    UpdateZStoneHostConfigAction,
    UpdateZceXClusterConfigAction,
    UpdateZoneAction,
    UploadKmsClientCsrAction,
    UploadKmsClientIdentityAction,
    UploadKmsClientSignedCertAction,
    UploadKmsServerCertAction,
    ValidateClusterSupportDRSAction,
    ValidateDiskOfferingUserConfigAction,
    ValidateInstanceOfferingUserConfigAction,
    ValidatePasswordAction,
    ValidateSNSAliyunSmsEndpointAction,
    ValidateSNSEmailPlatformAction,
    ValidateSecurityGroupRuleAction,
    ValidateSessionAction,
    ValidateSessionActionBase,
    ValidateVmSchedulingRuleAction,
    ZSha2DemoteAction,
    ZceXTestConnectionAction
  ],
  exports: [
    WebhookCallbackService,
    CheckTelemetryUpdateAction,
    GetTelemetryConsentAction,
    GetTelemetrySettingsAction,
    UpdateTelemetryConsentAction,
    AckAlarmDataAction,
    AckEventDataAction,
    AddAccessControlRuleAction,
    AddAccountToGroupAction,
    AddActionToAlarmAction,
    AddActionToEventSubscriptionAction,
    AddAliyunEbsBackupStorageAction,
    AddAliyunEbsPrimaryStorageAction,
    AddAliyunNasPrimaryStorageAction,
    AddBlockPrimaryStorageAction,
    AddCCSCertificateAction,
    AddCephBackupStorageAction,
    AddCephPrimaryStorageAction,
    AddCephPrimaryStoragePoolAction,
    AddDnsToL3NetworkAction,
    AddEmailAddressToSNSEmailEndpointAction,
    AddEventRuleTemplateAction,
    AddExternalPrimaryStorageAction,
    AddFlkSecSecurityMachineAction,
    AddHostToHostSchedulingRuleGroupAction,
    AddHybridKeySecretAction,
    AddImageStoreBackupStorageAction,
    AddInfoSecSecurityMachineAction,
    AddInstanceToMonitorGroupAction,
    AddIpRangeAction,
    AddIpRangeByNetworkCidrAction,
    AddIpv6RangeAction,
    AddIpv6RangeByNetworkCidrAction,
    AddIscsiServerAction,
    AddKVMHostAction,
    AddLdapServerAction,
    AddLocalPrimaryStorageAction,
    AddLogConfigurationAction,
    AddLogServerAction,
    AddMdevDeviceSpecToVmInstanceAction,
    AddMetricRuleTemplateAction,
    AddMonToCephBackupStorageAction,
    AddMonToCephPrimaryStorageAction,
    AddNfsPrimaryStorageAction,
    AddNvmeServerAction,
    AddPciDeviceSpecToVmInstanceAction,
    AddPreconfigurationTemplateAction,
    AddResourcesToDirectoryAction,
    AddSNSDingTalkAtPersonAction,
    AddSNSFeiShuAtPersonAction,
    AddSNSSmsReceiverAction,
    AddSNSWeComAtPersonAction,
    AddSchedulerJobGroupToSchedulerTriggerAction,
    AddSchedulerJobToSchedulerTriggerAction,
    AddSchedulerJobsToSchedulerJobGroupAction,
    AddSdnControllerAction,
    AddSecurityGroupRuleAction,
    AddSftpBackupStorageAction,
    AddSharedBlockGroupPrimaryStorageAction,
    AddSharedBlockToSharedBlockGroupAction,
    AddSharedMountPointPrimaryStorageAction,
    AddStackTemplateAction,
    AddStorageProtocolAction,
    AddThirdpartyPlatformAction,
    AddTpmAction,
    AddVRouterRouteEntryAction,
    AddVmNicToSecurityGroupAction,
    AddVmToAffinityGroupAction,
    AddVmToVmSchedulingRuleGroupAction,
    AddXDragonHostAction,
    AddZStoneAction,
    AddZceXAction,
    AllocateHostResourceAction,
    ApplyDRSAdviceAction,
    ApplyMonitorTemplateToMonitorGroupAction,
    ApplyTemplateConfigAction,
    AttachBackupStorageToZoneAction,
    AttachBareMetal2ProvisionNetworkToClusterAction,
    AttachBaremetalPxeServerToClusterAction,
    AttachDataVolumeToVmAction,
    AttachEipAction,
    AttachGuestToolsIsoToVmAction,
    AttachIscsiServerToClusterAction,
    AttachIsoToVmInstanceAction,
    AttachL2NetworkToClusterAction,
    AttachL2NetworkToHostAction,
    AttachL3NetworkToVmAction,
    AttachMdevDeviceToVmAction,
    AttachNetworkServiceToL3NetworkAction,
    AttachNvmeServerToClusterAction,
    AttachPciDeviceToVmAction,
    AttachPriceTableToAccountAction,
    AttachPrimaryStorageToClusterAction,
    AttachProvisionNicToBondingAction,
    AttachRoleToAccountAction,
    AttachRoleToAccountGroupAction,
    AttachScsiLunToVmInstanceAction,
    AttachSecurityGroupToL3NetworkAction,
    AttachSshKeyPairToVmInstanceAction,
    AttachTagToResourcesAction,
    AttachUsbDeviceToVmAction,
    AttachUserDefinedXmlHookScriptToVmAction,
    AttachVRouterRouteTableToVRouterAction,
    BackupNkpAction,
    BatchCreateHostKernelInterfaceAction,
    BatchDeleteVolumeSnapshotAction,
    CalculateImageHashAction,
    CancelLongJobAction,
    ChangeAccessKeyStateAction,
    ChangeAccountPriceTableBindingAction,
    ChangeAccountTypeAction,
    ChangeActiveAlarmStateAction,
    ChangeAffinityGroupStateAction,
    ChangeAlarmStateAction,
    ChangeBackupStorageStateAction,
    ChangeBaremetalChassisStateAction,
    ChangeClusterStateAction,
    ChangeDiskOfferingStateAction,
    ChangeEventSubscriptionStateAction,
    ChangeHostNetworkInterfaceLldpModeAction,
    ChangeHostStateAction,
    ChangeImageStateAction,
    ChangeInstanceOfferingAction,
    ChangeInstanceOfferingStateAction,
    ChangeL3NetworkDhcpIpAddressAction,
    ChangePortMirrorStateAction,
    ChangePreconfigurationTemplateStateAction,
    ChangePrimaryStorageStateAction,
    ChangeResourceOwnerAction,
    ChangeSNSApplicationEndpointStateAction,
    ChangeSNSApplicationPlatformStateAction,
    ChangeSchedulerStateAction,
    ChangeSecurityGroupRuleAction,
    ChangeSecurityGroupRuleStateAction,
    ChangeSecurityGroupStateAction,
    ChangeSecurityMachineStateAction,
    ChangeVmImageAction,
    ChangeVmNicNetworkAction,
    ChangeVmNicSecurityPolicyAction,
    ChangeVmNicStateAction,
    ChangeVmNicTypeAction,
    ChangeVmPasswordAction,
    ChangeVmSchedulingRuleStateAction,
    ChangeVolumeStateAction,
    ChangeZoneStateAction,
    CheckBaremetalChassisConfigFileAction,
    CheckBatchDataIntegrityAction,
    CheckCephHealthStatusAction,
    CheckCephPluginAction,
    CheckIpAvailabilityAction,
    CheckKVMHostConfigFileAction,
    CheckMemorySnapshotGroupConflictAction,
    CheckNetworkReachableAction,
    CheckScsiLunClusterStatusAction,
    CheckStackTemplateParametersAction,
    CheckVolumeSnapshotGroupAvailabilityAction,
    CleanSoftwarePackageAction,
    CleanUpBareMetal2BondingAction,
    CleanUpBaremetalChassisBondingAction,
    CleanUpTrashOnBackupStorageAction,
    CleanUpTrashOnPrimaryStorageAction,
    CleanUpgradeSoftwarePackageAction,
    CloneMonitorTemplateAction,
    CloneVmInstanceAction,
    ConvertTemplatedVmInstanceToVmInstanceAction,
    ConvertVmInstanceToTemplatedVmInstanceAction,
    CreateAccessKeyAction,
    CreateAccountAction,
    CreateAccountGroupAction,
    CreateAffinityGroupAction,
    CreateAiSiNoSecretResourcePoolAction,
    CreateAlarmAction,
    CreateAliyunSmsSNSTextTemplateAction,
    CreateBareMetal2BondingAction,
    CreateBaremetalBondingAction,
    CreateBaremetalChassisAction,
    CreateBaremetalInstanceAction,
    CreateBaremetalPxeServerAction,
    CreateBlockVolumeAction,
    CreateBondingAction,
    CreateCasClientAction,
    CreateClusterAction,
    CreateClusterDRSAction,
    CreateDataVolumeAction,
    CreateDataVolumeFromVolumeBackupAction,
    CreateDataVolumeFromVolumeTemplateAction,
    CreateDataVolumeTemplateFromVolumeBackupAction,
    CreateDirectoryAction,
    CreateDiskOfferingAction,
    CreateEipAction,
    CreateFlkSecSecretResourcePoolAction,
    CreateGuestVmScriptAction,
    CreateHaiTaiSecretResourcePoolAction,
    CreateHostKernelInterfaceAction,
    CreateHostSchedulingRuleGroupAction,
    CreateInfoSecSecretResourcePoolAction,
    CreateInstanceOfferingAction,
    CreateKmsAction,
    CreateL2HardwareVxlanNetworkAction,
    CreateL2HardwareVxlanNetworkPoolAction,
    CreateL2NoVlanNetworkAction,
    CreateL2PortGroupAction,
    CreateL2VirtualSwitchAction,
    CreateL2VlanNetworkAction,
    CreateL2VxlanNetworkAction,
    CreateL2VxlanNetworkPoolAction,
    CreateL3NetworkAction,
    CreateMonitorGroupAction,
    CreateMonitorTemplateAction,
    CreateNkpAction,
    CreateOAuthClientAction,
    CreatePortGroupAction,
    CreatePortMirrorAction,
    CreatePortMirrorSessionAction,
    CreateResourceAttributeKeyAction,
    CreateResourceAttributeValueAction,
    CreateResourceStackAction,
    CreateRoleAction,
    CreateRootVolumeTemplateFromVolumeBackupAction,
    CreateSNSAliyunSmsEndpointAction,
    CreateSNSDingTalkEndpointAction,
    CreateSNSEmailEndpointAction,
    CreateSNSEmailPlatformAction,
    CreateSNSFeiShuEndpointAction,
    CreateSNSHttpEndpointAction,
    CreateSNSMicrosoftTeamsEndpointAction,
    CreateSNSSnmpEndpointAction,
    CreateSNSSnmpPlatformAction,
    CreateSNSTextTemplateAction,
    CreateSNSTopicAction,
    CreateSNSWeComEndpointAction,
    CreateSchedulerJobAction,
    CreateSchedulerJobGroupAction,
    CreateSchedulerTriggerAction,
    CreateSecurityGroupAction,
    CreateSlbOfferingAction,
    CreateSnmpAgentAction,
    CreateSshKeyPairAction,
    CreateSystemTagAction,
    CreateTagAction,
    CreateTemplatedVmInstanceFromVmInstanceAction,
    CreateVRouterRouteTableAction,
    CreateVirtualRouterOfferingAction,
    CreateVmBackupAction,
    CreateVmCdRomAction,
    CreateVmCustomSpecificationAction,
    CreateVmFromVmBackupAction,
    CreateVmFromVolumeBackupAction,
    CreateVmInstanceAction,
    CreateVmInstanceFromTemplatedVmInstanceAction,
    CreateVmInstanceFromVolumeSnapshotGroupAction,
    CreateVmSchedulingRuleAction,
    CreateVmSchedulingRuleGroupAction,
    CreateVmUserDefinedXmlHookScriptAction,
    CreateVniRangeAction,
    CreateVolumeBackupAction,
    CreateVolumeSnapshotAction,
    CreateVolumeSnapshotGroupAction,
    CreateZceXAlertPlatformAction,
    CreateZoneAction,
    DeleteAccessControlRuleAction,
    DeleteAccessKeyAction,
    DeleteAccountAction,
    DeleteAccountGroupAction,
    DeleteAffinityGroupAction,
    DeleteAlarmAction,
    DeleteBackupStorageAction,
    DeleteBaremetalChassisAction,
    DeleteBaremetalPxeServerAction,
    DeleteBondingAction,
    DeleteCCSCertificateAction,
    DeleteCephPrimaryStoragePoolAction,
    DeleteClusterAction,
    DeleteDataVolumeAction,
    DeleteDatabaseBackupAction,
    DeleteDirectoryAction,
    DeleteDiskOfferingAction,
    DeleteEipAction,
    DeleteEmailAddressOfSNSEmailEndpointAction,
    DeleteEventRuleTemplateAction,
    DeleteExportedImageFromBackupStorageAction,
    DeleteGuestVmScriptAction,
    DeleteHostAction,
    DeleteHostKernelInterfaceAction,
    DeleteHostSchedulingRuleGroupAction,
    DeleteHybridKeySecretAction,
    DeleteImageAction,
    DeleteImagePackageAction,
    DeleteInstanceOfferingAction,
    DeleteIpRangeAction,
    DeleteIscsiServerAction,
    DeleteKmsAction,
    DeleteL2NetworkAction,
    DeleteL3NetworkAction,
    DeleteLdapServerAction,
    DeleteLicenseAction,
    DeleteLogConfigurationAction,
    DeleteLogServerAction,
    DeleteMdevDeviceAction,
    DeleteMetricRuleTemplateAction,
    DeleteMonitorGroupAction,
    DeleteMonitorTemplateAction,
    DeleteNicQosAction,
    DeleteNkpAction,
    DeleteNvmeServerAction,
    DeletePciDeviceAction,
    DeletePortGroupAction,
    DeletePortMirrorAction,
    DeletePortMirrorSessionAction,
    DeletePreconfigurationTemplateAction,
    DeletePrimaryStorageAction,
    DeleteResourceAttributeKeyAction,
    DeleteResourceAttributeValueAction,
    DeleteResourceConfigAction,
    DeleteResourceStackAction,
    DeleteRoleAction,
    DeleteSNSApplicationEndpointAction,
    DeleteSNSApplicationPlatformAction,
    DeleteSNSTextTemplateAction,
    DeleteSNSTopicAction,
    DeleteSSOClientAction,
    DeleteSchedulerJobAction,
    DeleteSchedulerJobGroupAction,
    DeleteSchedulerTriggerAction,
    DeleteSecretResourcePoolAction,
    DeleteSecurityGroupAction,
    DeleteSecurityGroupRuleAction,
    DeleteSecurityMachineAction,
    DeleteSshKeyPairAction,
    DeleteStackTemplateAction,
    DeleteTagAction,
    DeleteTemplatedVmInstanceAction,
    DeleteThirdpartyPlatformAction,
    DeleteVRouterRouteEntryAction,
    DeleteVRouterRouteTableAction,
    DeleteVipAction,
    DeleteVmBackupAction,
    DeleteVmCdRomAction,
    DeleteVmConsolePasswordAction,
    DeleteVmCustomSpecificationAction,
    DeleteVmHostnameAction,
    DeleteVmInstanceHaLevelAction,
    DeleteVmNicFromSecurityGroupAction,
    DeleteVmSchedulingRuleGroupAction,
    DeleteVmSshKeyAction,
    DeleteVmStaticIpAction,
    DeleteVniRangeAction,
    DeleteVolumeBackupAction,
    DeleteVolumeQosAction,
    DeleteVolumeSnapshotGroupAction,
    DeleteZceXAlertPlatformAction,
    DeleteZoneAction,
    DestroyBaremetalInstanceAction,
    DestroyVmInstanceAction,
    DetachBackupStorageFromZoneAction,
    DetachBaremetalPxeServerFromClusterAction,
    DetachDataVolumeFromVmAction,
    DetachEipAction,
    DetachGuestToolsIsoFromVmAction,
    DetachHostFromHostSchedulingRuleGroupAction,
    DetachIscsiServerFromClusterAction,
    DetachIsoFromVmInstanceAction,
    DetachL2NetworkFromClusterAction,
    DetachL2NetworkFromHostAction,
    DetachL3NetworkFromVmAction,
    DetachMdevDeviceFromVmAction,
    DetachNetworkServiceFromL3NetworkAction,
    DetachNvmeServerFromClusterAction,
    DetachPciDeviceFromVmAction,
    DetachPriceTableFromAccountAction,
    DetachPrimaryStorageFromClusterAction,
    DetachProvisionNicFromBondingAction,
    DetachRoleFromAccountAction,
    DetachRoleFromAccountGroupAction,
    DetachScsiLunFromVmInstanceAction,
    DetachSecurityGroupFromL3NetworkAction,
    DetachSshKeyPairFromVmInstanceAction,
    DetachTagFromResourcesAction,
    DetachUsbDeviceFromVmAction,
    DetachUserDefinedXmlHookScriptFromVmAction,
    DetachVRouterRouteTableFromVRouterAction,
    DetachVmFromVmSchedulingRuleGroupAction,
    DiscoverExternalPrimaryStorageAction,
    DiscoverStrangePrimaryStorageAction,
    DoLongjobAction,
    ExecuteDRSSchedulingAction,
    ExecuteGuestVmScriptAction,
    ExportDatabaseBackupFromBackupStorageAction,
    ExportImageFromBackupStorageAction,
    ExportVmOvaPackageAction,
    ExpungeBaremetalInstanceAction,
    ExpungeDataVolumeAction,
    ExpungeImageAction,
    ExpungeVmInstanceAction,
    ExpungeVmUserDefinedXmlHookScriptAction,
    FlattenVmInstanceAction,
    FlattenVolumeAction,
    GenerateMdevDevicesAction,
    GenerateSeMdevDevicesAction,
    GenerateSriovPciDevicesAction,
    GenerateSshKeyPairAction,
    GetAccessPathAction,
    GetAccountPriceTableRefAction,
    GetAccountQuotaUsageAction,
    GetActiveAlarmStatusAction,
    GetAlarmDataAction,
    GetAuditDataAction,
    GetAvailableTriggersAction,
    GetBackupStorageForCreatingImageFromVolumeAction,
    GetBackupStorageTypesAction,
    GetBareMetal2SupportedBootModeAction,
    GetBaremetalChassisPowerStatusAction,
    GetBlockPrimaryStorageMetadataAction,
    GetCandidateHostKernelInterfacesAction,
    GetCandidateInterfaceVlanIdsAction,
    GetCandidateL3NetworksForChangeVmNicNetworkAction,
    GetCandidateNetworkBondingsAction,
    GetCandidateNetworkInterfacesAction,
    GetCandidatePrimaryStoragesForCreatingVmAction,
    GetCandidateVmNicForSecurityGroupAction,
    GetCandidateVmNicsForPortMirrorAction,
    GetCandidateZonesClustersHostsForCreatingVmAction,
    GetChronyServersAction,
    GetClusterHostNetworkFactsAction,
    GetCpuMemoryCapacityAction,
    GetCurrentTimeAction,
    GetDatabaseBackupFromImageStoreAction,
    GetDirectoryUsageAction,
    GetEipAttachableVmNicsAction,
    GetEventDataAction,
    GetFreeIpOfIpRangeAction,
    GetFreeIpOfL3NetworkAction,
    GetGlobalConfigOptionsAction,
    GetHostAllocatorStrategiesAction,
    GetHostBlockDevicesAction,
    GetHostIommuStateAction,
    GetHostIommuStatusAction,
    GetHostMultipathTopologyAction,
    GetHostNUMATopologyAction,
    GetHostNetworkFactsAction,
    GetHostNetworkInterfaceLldpAction,
    GetHostSensorsAction,
    GetHostWebSshUrlAction,
    GetHypervisorTypesAction,
    GetImageQgaAction,
    GetInterdependentL3NetworksBackupStoragesAction,
    GetInterdependentL3NetworksImagesAction,
    GetInterfaceServiceTypeStatisticAction,
    GetIpAddressCapacityAction,
    GetKmsServerCertFromKmsAction,
    GetL3NetworkIpStatisticAction,
    GetL3NetworkMtuAction,
    GetL3NetworkRouterInterfaceIpAction,
    GetLatestGuestToolsForVmAction,
    GetLdapEntryAction,
    GetLicenseAddOnsAction,
    GetLicenseInfoAction,
    GetLicenseRecordsAction,
    GetLicenseUKeyStatusAction,
    GetLocalStorageHostDiskCapacityAction,
    GetLogConfigurationAction,
    GetLoginCaptchaAction,
    GetLoginProceduresAction,
    GetManagementNodeArchAction,
    GetManagementNodeDirCapacityAction,
    GetManagementNodesStatusAction,
    GetMdevDeviceCandidatesAction,
    GetMdevDeviceSpecCandidatesAction,
    GetMemorySnapshotGroupReferenceAction,
    GetMetricDataAction,
    GetMetricLabelValueAction,
    GetNicQosAction,
    GetNodeRolesAction,
    GetOAuthClientSecretAction,
    GetPciDeviceCandidatesForAttachingVmAction,
    GetPciDeviceCandidatesForNewCreateVmAction,
    GetPciDeviceSpecCandidatesAction,
    GetPhysicalMachineBlockDevicesAction,
    GetPlatformTimeZoneAction,
    GetPortForwardingAttachableVmNicsAction,
    GetPrimaryStorageCandidatesForVmMigrationAction,
    GetPrimaryStorageCandidatesForVolumeMigrationAction,
    GetPrimaryStorageLicenseInfoAction,
    GetPrimaryStorageUsageReportAction,
    GetPrometheusMetricLabelValueAction,
    GetResourceAccountAction,
    GetResourceConfigAction,
    GetResourceFromResourceStackAction,
    GetResourceNamesAction,
    GetRolePolicyActionsAction,
    GetSchedulerExecutionReportAction,
    GetScsiLunCandidatesForAttachingVmAction,
    GetSharedBlockCandidateAction,
    GetSignatureServerEncryptPublicKeyAction,
    GetTaskProgressAction,
    GetTaskProgressActionBase,
    GetTrashOnBackupStorageAction,
    GetTrashOnPrimaryStorageAction,
    GetTwoFactorAuthenticationSecretAction,
    GetTwoFactorAuthenticationStateAction,
    GetUploadSoftwarePackageJobDetailsAction,
    GetUsbDeviceCandidatesForAttachingVmAction,
    GetVersionAction,
    GetVirtualizerInfoAction,
    GetVmAttachableDataVolumeAction,
    GetVmAttachableL3NetworkAction,
    GetVmBootOrderAction,
    GetVmConsoleAddressAction,
    GetVmEmulatorPinningAction,
    GetVmGuestToolsInfoAction,
    GetVmHostnameAction,
    GetVmNicAttachedNetworkServiceAction,
    GetVmSchedulingRulesExecuteStateAction,
    GetVmStartingCandidateClustersHostsAction,
    GetVmUptimeAction,
    GetVmsCapabilitiesAction,
    GetVmsSchedulingStateFromSchedulingRuleAction,
    GetVmvNUMATopologyAction,
    GetVolumeCapabilitiesAction,
    GetVolumeIoThreadPinAction,
    GetVolumeQosAction,
    GetVolumeSnapshotSizeAction,
    GetVpcVRouterNetworkServiceStateAction,
    GetZMigrateGatewayVmInstancesAction,
    GetZMigrateInfosAction,
    GetZStoneCapabilityAction,
    GetZWatchAlertHistogramAction,
    GetZceXCapabilityAction,
    InspectBaremetalChassisAction,
    InstallSoftwarePackageAction,
    IsOpensourceVersionAction,
    LocalStorageMigrateVolumeAction,
    LocateHostNetworkInterfaceAction,
    LocateLocalRaidPhysicalDriveAction,
    LogInAction,
    LogInByAccountAction,
    LogOutAction,
    MountBlockDeviceAction,
    MoveDirectoryAction,
    MoveResourcesToDirectoryAction,
    ParseNkpRestoreAction,
    ParseOvfAction,
    PauseVmInstanceAction,
    PowerOffBaremetalChassisAction,
    PowerOnBaremetalChassisAction,
    PowerOnHostAction,
    PowerResetBaremetalChassisAction,
    PowerResetHostAction,
    PreviewResourceStackAction,
    PrimaryStorageMigrateVolumeAction,
    QueryAccessControlRuleAction,
    QueryAccessKeyAction,
    QueryAccountAction,
    QueryAccountResourceRefAction,
    QueryActiveAlarmTemplateAction,
    QueryAddressPoolAction,
    QueryAffinityGroupAction,
    QueryAlarmAction,
    QueryAlarmRecordAction,
    QueryAliyunSmsSNSTextTemplateAction,
    QueryBackupStorageAction,
    QueryBareMetal2ChassisAction,
    QueryBareMetal2GatewayAction,
    QueryBareMetal2InstanceAction,
    QueryBareMetal2ProvisionNetworkAction,
    QueryBaremetalChassisAction,
    QueryBaremetalInstanceAction,
    QueryBaremetalPxeServerAction,
    QueryBlockVolumeAction,
    QueryCCSCertificateAction,
    QueryClusterAction,
    QueryClusterDRSAction,
    QueryConsoleProxyAgentAction,
    QueryDRSAdviceAction,
    QueryDRSVmMigrationActivityAction,
    QueryEipAction,
    QueryEventFromResourceStackAction,
    QueryEventRecordAction,
    QueryEventRuleTemplateAction,
    QueryEventSubscriptionAction,
    QueryGlobalConfigAction,
    QueryHostAction,
    QueryHostNetworkInterfaceAction,
    QueryHostPhysicalMemoryAction,
    QueryHybridKeySecretAction,
    QueryImageAction,
    QueryInstanceOfferingAction,
    QueryIscsiServerAction,
    QueryL2NetworkAction,
    QueryL2VxlanNetworkPoolAction,
    QueryL3NetworkAction,
    QueryLdapServerAction,
    QueryLogServerAction,
    QueryLongJobAction,
    QueryLongJobActionBase,
    QueryManagementNodeAction,
    QueryMdevDeviceAction,
    QueryMdevDeviceSpecAction,
    QueryMetricRuleTemplateAction,
    QueryMonitorGroupAction,
    QueryMonitorGroupAlarmAction,
    QueryMonitorGroupInstanceAction,
    QueryMonitorGroupTemplateRefAction,
    QueryMonitorTemplateAction,
    QueryNetworkServiceL3NetworkRefAction,
    QueryNetworkServiceProviderAction,
    QueryPciDeviceAction,
    QueryPciDeviceSpecAction,
    QueryPortGroupAction,
    QueryPortMirrorAction,
    QueryPortMirrorSessionAction,
    QueryPrimaryStorageAction,
    QueryResourceConfigAction,
    QueryResourceStackAction,
    QuerySNSApplicationEndpointAction,
    QuerySNSEmailAddressAction,
    QuerySNSEmailPlatformAction,
    QuerySNSSmsEndpointAction,
    QuerySNSTextTemplateAction,
    QuerySNSTopicSubscriberAction,
    QuerySchedulerJobAction,
    QuerySchedulerJobGroupAction,
    QuerySchedulerJobHistoryAction,
    QuerySchedulerTriggerAction,
    QuerySdnControllerAction,
    QuerySecretResourcePoolAction,
    QuerySecurityGroupAction,
    QuerySecurityMachineAction,
    QueryShareableVolumeVmInstanceRefAction,
    QuerySharedBlockAction,
    QuerySnmpAgentAction,
    QueryStackTemplateAction,
    QuerySystemTagAction,
    QueryTagAction,
    QueryThirdpartyPlatformAction,
    QueryTpmAction,
    QueryUsbDeviceAction,
    QueryVRouterRouteEntryAction,
    QueryVRouterRouteTableAction,
    QueryVipAction,
    QueryVirtualRouterOfferingAction,
    QueryVirtualRouterVRouterRouteTableRefAction,
    QueryVmCdRomAction,
    QueryVmInstanceAction,
    QueryVmNicAction,
    QueryVmNicInSecurityGroupAction,
    QueryVniRangeAction,
    QueryVolumeAction,
    QueryVolumeBackupAction,
    QueryVolumeSnapshotAction,
    QueryVolumeSnapshotGroupAction,
    QueryVolumeSnapshotTreeAction,
    QueryVpcHaGroupAction,
    QueryVpcRouterAction,
    QueryXskyBlockVolumeAction,
    QueryZStoneAction,
    QueryZceXAction,
    QueryZceXThirdPartyPlatformAlertRefAction,
    QueryZoneAction,
    RebootBaremetalInstanceAction,
    RebootVmInstanceAction,
    ReclaimSpaceFromImageStoreAction,
    ReconnectBackupStorageAction,
    ReconnectBaremetalPxeServerAction,
    ReconnectConsoleProxyAgentAction,
    ReconnectHostAction,
    ReconnectPrimaryStorageAction,
    RecoverBackupFromImageStoreBackupStorageAction,
    RecoverBaremetalInstanceAction,
    RecoverDataVolumeAction,
    RecoverDatabaseFromBackupAction,
    RecoverImageAction,
    RecoverVmBackupFromImageStoreBackupStorageAction,
    RecoverVmInstanceAction,
    RefreshCaptchaAction,
    RefreshFiberChannelStorageAction,
    RefreshIscsiServerAction,
    RefreshNvmeServerAction,
    RefreshNvmeTargetAction,
    RefreshSharedblockDeviceCapacityAction,
    RegisterVmInstanceFromMetadataAction,
    ReimageVmInstanceAction,
    RekeyKeyProviderRefsAction,
    ReloadLicenseAction,
    RemoveAccountFromGroupAction,
    RemoveActionFromAlarmAction,
    RemoveActionFromEventSubscriptionAction,
    RemoveDnsFromL3NetworkAction,
    RemoveInstanceFromMonitorGroupAction,
    RemoveMdevDeviceSpecFromVmInstanceAction,
    RemoveMonFromCephBackupStorageAction,
    RemoveMonFromCephPrimaryStorageAction,
    RemovePciDeviceSpecFromVmInstanceAction,
    RemoveResourcesFromDirectoryAction,
    RemoveSNSDingTalkAtPersonAction,
    RemoveSNSFeiShuAtPersonAction,
    RemoveSNSSmsReceiverAction,
    RemoveSNSWeComAtPersonAction,
    RemoveSchedulerJobFromSchedulerTriggerAction,
    RemoveSchedulerJobGroupFromSchedulerTriggerAction,
    RemoveSchedulerJobsFromSchedulerJobGroupAction,
    RemoveSdnControllerAction,
    RemoveTpmAction,
    RemoveVmFromAffinityGroupAction,
    RemoveVmSchedulingRuleAction,
    RemoveZStoneAction,
    RemoveZceXAction,
    RequestConsoleAccessAction,
    ResetGlobalConfigAction,
    ResetTemplateConfigAction,
    ResizeDataVolumeAction,
    ResizeRootVolumeAction,
    RestoreNkpAction,
    ResumeLongJobAction,
    ResumeVmInstanceAction,
    RevertTemplateConfigAction,
    RevertVmFromSnapshotGroupAction,
    RevertVmFromVmBackupAction,
    RevertVolumeFromSnapshotAction,
    RevertVolumeFromVolumeBackupAction,
    RevokeMonitorTemplateFromMonitorGroupAction,
    RevokeResourceSharingAction,
    RevokeResourceSharingToGroupAction,
    RunSchedulerTriggerAction,
    SNSEmailTestConnectionAction,
    SNSSnmpTestConnectionAction,
    ScanVmInstanceMetadataFromPrimaryStorageAction,
    SecurityMachineDetectSyncAction,
    SecurityMachineEncryptAction,
    SetImageBootModeAction,
    SetImageQgaAction,
    SetIpOnHostNetworkBondingAction,
    SetIpOnHostNetworkInterfaceAction,
    SetL3NetworkMtuAction,
    SetL3NetworkRouterInterfaceIpAction,
    SetNicQosAction,
    SetSecurityMachineKeyAction,
    SetServiceTypeOnHostNetworkBondingAction,
    SetServiceTypeOnHostNetworkInterfaceAction,
    SetVmBootModeAction,
    SetVmBootOrderAction,
    SetVmBootVolumeAction,
    SetVmCleanTrafficAction,
    SetVmClockTrackAction,
    SetVmConsoleModeAction,
    SetVmConsolePasswordAction,
    SetVmDnsAction,
    SetVmEmulatorPinningAction,
    SetVmHostnameAction,
    SetVmInstanceDefaultCdRomAction,
    SetVmInstanceHaLevelAction,
    SetVmMonitorNumberAction,
    SetVmNicSecurityGroupAction,
    SetVmNumaAction,
    SetVmQgaAction,
    SetVmQxlMemoryAction,
    SetVmRDPAction,
    SetVmSshKeyAction,
    SetVmStaticIpAction,
    SetVmUsbRedirectAction,
    SetVolumeIoThreadPinAction,
    SetVolumeQosAction,
    ShareResourceAction,
    ShareResourceToGroupAction,
    ShutdownHostAction,
    StartBaremetalInstanceAction,
    StartBaremetalPxeServerAction,
    StartSnmpAgentAction,
    StartVmInstanceAction,
    StopBaremetalInstanceAction,
    StopBaremetalPxeServerAction,
    StopSnmpAgentAction,
    StopVmInstanceAction,
    SubmitLongJobAction,
    SubscribeEventAction,
    SubscribeSNSTopicAction,
    SyncAccountsFromLdapServerAction,
    SyncBackupFromImageStoreBackupStorageAction,
    SyncChronyServersAction,
    SyncDatabaseBackupAction,
    SyncDatabaseBackupFromImageStoreBackupStorageAction,
    SyncImageFromImageStoreBackupStorageAction,
    SyncImageSizeAction,
    SyncVmBackupAction,
    SyncVmBackupFromImageStoreBackupStorageAction,
    SyncVolumeBackupAction,
    SyncVolumeSizeAction,
    TakeVmConsoleScreenshotAction,
    TakeoverPrimaryStorageAction,
    UngenerateMdevDevicesAction,
    UngenerateSriovPciDevicesAction,
    UninstallSoftwarePackageAction,
    UnsubscribeEventAction,
    UnsubscribeSNSTopicAction,
    UpdateAccessControlRuleAction,
    UpdateAccountAction,
    UpdateAccountGroupAction,
    UpdateActiveAlarmTemplateAction,
    UpdateAffinityGroupAction,
    UpdateAlarmAction,
    UpdateAlarmDataAction,
    UpdateAlarmLabelAction,
    UpdateAlertDataAckAction,
    UpdateAliyunEbsBackupStorageAction,
    UpdateAliyunSmsSNSTextTemplateAction,
    UpdateAtPersonOfAtDingTalkEndpointAction,
    UpdateAtPersonOfAtFeiShuEndpointAction,
    UpdateAtPersonOfAtWeComEndpointAction,
    UpdateBackupStorageAction,
    UpdateBareMetal2InstanceAction,
    UpdateBaremetalChassisAction,
    UpdateBaremetalInstanceAction,
    UpdateBaremetalPxeServerAction,
    UpdateBondingAction,
    UpdateCasClientAction,
    UpdateCephBackupStorageMonAction,
    UpdateCephPrimaryStorageMonAction,
    UpdateCephPrimaryStoragePoolAction,
    UpdateChronyServersAction,
    UpdateClusterAction,
    UpdateClusterDRSAction,
    UpdateConsoleProxyAgentAction,
    UpdateDirectoryAction,
    UpdateDiskOfferingAction,
    UpdateEipAction,
    UpdateEmailAddressOfSNSEmailEndpointAction,
    UpdateEventDataAction,
    UpdateEventRuleTemplateAction,
    UpdateExternalPrimaryStorageAction,
    UpdateFlkSecSecretResourcePoolAction,
    UpdateGlobalConfigAction,
    UpdateGuestToolsStateAction,
    UpdateGuestVmScriptAction,
    UpdateHaStrategyConditionAction,
    UpdateHostAction,
    UpdateHostIommuStateAction,
    UpdateHostIpmiAction,
    UpdateHostIscsiInitiatorNameAction,
    UpdateHostKernelInterfaceAction,
    UpdateHostNetworkInterfaceAction,
    UpdateHostNqnAction,
    UpdateHostSchedulingRuleGroupAction,
    UpdateHostnameAction,
    UpdateHybridKeySecretAction,
    UpdateImageAction,
    UpdateImageStoreBackupStorageAction,
    UpdateInfoSecSecretResourcePoolAction,
    UpdateInstanceOfferingAction,
    UpdateIscsiServerAction,
    UpdateKVMHostAction,
    UpdateKmsAction,
    UpdateL2NetworkAction,
    UpdateL2NetworkVirtualNetworkIdAction,
    UpdateL3NetworkAction,
    UpdateLdapServerAction,
    UpdateLicenseAction,
    UpdateLogConfigurationAction,
    UpdateLogServerAction,
    UpdateMdevDeviceAction,
    UpdateMdevDeviceSpecAction,
    UpdateMetricRuleTemplateAction,
    UpdateMonitorGroupAction,
    UpdateMonitorTemplateAction,
    UpdateNkpAction,
    UpdateNvmeServerAction,
    UpdateOAuthClientAction,
    UpdatePciDeviceAction,
    UpdatePciDeviceSpecAction,
    UpdatePortMirrorAction,
    UpdatePreconfigurationTemplateAction,
    UpdatePrimaryStorageAction,
    UpdateQuotaAction,
    UpdateResourceAttributeKeyAction,
    UpdateResourceConfigAction,
    UpdateResourceConfigsAction,
    UpdateResourceStackAction,
    UpdateRoleAction,
    UpdateSNSApplicationEndpointAction,
    UpdateSNSApplicationPlatformAction,
    UpdateSNSDingTalkEndpointAction,
    UpdateSNSFeiShuEndpointAction,
    UpdateSNSSnmpPlatformAction,
    UpdateSNSTextTemplateAction,
    UpdateSNSTopicAction,
    UpdateSNSWeComEndpointAction,
    UpdateSSORedirectTemplateAction,
    UpdateSchedulerJobAction,
    UpdateSchedulerJobGroupAction,
    UpdateSchedulerTriggerAction,
    UpdateSdnControllerAction,
    UpdateSecretResourcePoolAction,
    UpdateSecurityGroupAction,
    UpdateSecurityGroupRulePriorityAction,
    UpdateSecurityMachineAction,
    UpdateSftpBackupStorageAction,
    UpdateSnmpAgentAction,
    UpdateSshKeyPairAction,
    UpdateStackTemplateAction,
    UpdateSubscribeEventAction,
    UpdateSystemTagAction,
    UpdateTagAction,
    UpdateTemplateConfigAction,
    UpdateTemplatedVmInstanceAction,
    UpdateThirdpartyAlertsAction,
    UpdateThirdpartyPlatformAction,
    UpdateTpmAction,
    UpdateUsbDeviceAction,
    UpdateVRouterRouteTableAction,
    UpdateVirtualRouterOfferingAction,
    UpdateVirtualSwitchUplinkBondingsAction,
    UpdateVirtualSwitchUplinkGroupAction,
    UpdateVmCdRomAction,
    UpdateVmCustomSpecificationAction,
    UpdateVmInstanceAction,
    UpdateVmNetworkConfigAction,
    UpdateVmNicDriverAction,
    UpdateVmNicMacAction,
    UpdateVmPriorityAction,
    UpdateVmSchedulingRuleAction,
    UpdateVmSchedulingRuleGroupAction,
    UpdateVmUserDefinedXmlHookScriptAction,
    UpdateVniRangeAction,
    UpdateVolumeAction,
    UpdateVolumeSnapshotAction,
    UpdateVolumeSnapshotGroupAction,
    UpdateXskyBlockVolumeAction,
    UpdateZStoneClusterConfigAction,
    UpdateZStoneHostConfigAction,
    UpdateZceXClusterConfigAction,
    UpdateZoneAction,
    UploadKmsClientCsrAction,
    UploadKmsClientIdentityAction,
    UploadKmsClientSignedCertAction,
    UploadKmsServerCertAction,
    ValidateClusterSupportDRSAction,
    ValidateDiskOfferingUserConfigAction,
    ValidateInstanceOfferingUserConfigAction,
    ValidatePasswordAction,
    ValidateSNSAliyunSmsEndpointAction,
    ValidateSNSEmailPlatformAction,
    ValidateSecurityGroupRuleAction,
    ValidateSessionAction,
    ValidateSessionActionBase,
    ValidateVmSchedulingRuleAction,
    ZSha2DemoteAction,
    ZceXTestConnectionAction
  ],
  controllers: [WebhookController],
})
export class ZStackApiModule {}
