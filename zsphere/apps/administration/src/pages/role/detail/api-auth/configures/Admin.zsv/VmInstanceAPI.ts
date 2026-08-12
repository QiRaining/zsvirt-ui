const api = (intl: any) => {
  return {
    APIGetVmNumaMsg: {
      name: 'APIGetVmNumaMsg',
      description: intl.formatMessage({ id: 'apiModel.api.APIGetVmNumaMsg', defaultMessage: 'APIGetVmNumaMsg' }),
      api: 'org.zstack.header.vm.APIGetVmNumaMsg',
    },
    APIParseOvfMsg: {
      name: 'APIParseOvfMsg',
      description: intl.formatMessage({ id: 'apiModel.api.APIParseOvfMsg', defaultMessage: 'Parse OVF File' }),
      api: 'org.zstack.ovf.api.APIParseOvfMsg',
    },
    AddMdevDeviceSpecToVmInstance: {
      name: 'AddMdevDeviceSpecToVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.AddMdevDeviceSpecToVmInstance', defaultMessage: 'AddMdevDeviceSpecToVmInstance' }),
      api: 'org.zstack.pciDevice.specification.mdev.APIAddMdevDeviceSpecToVmInstanceMsg',
    },
    AddPciDeviceSpecToVmInstance: {
      name: 'AddPciDeviceSpecToVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.AddPciDeviceSpecToVmInstance', defaultMessage: 'AddPciDeviceSpecToVmInstance' }),
      api: 'org.zstack.pciDevice.specification.pci.APIAddPciDeviceSpecToVmInstanceMsg',
    },
    AttachDataVolumeToVm: {
      name: 'AttachDataVolumeToVm',
      description: intl.formatMessage({ id: 'apiModel.api.AttachDataVolumeToVm', defaultMessage: 'AttachDataVolumeToVm' }),
      api: 'org.zstack.header.volume.APIAttachDataVolumeToVmMsg',
    },
    AttachGuestToolsIsoToVm: {
      name: 'AttachGuestToolsIsoToVm',
      description: intl.formatMessage({ id: 'apiModel.api.AttachGuestToolsIsoToVm', defaultMessage: 'AttachGuestToolsIsoToVm' }),
      api: 'org.zstack.guesttools.APIAttachGuestToolsIsoToVmMsg',
    },
    AttachIsoToVmInstance: {
      name: 'AttachIsoToVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.AttachIsoToVmInstance', defaultMessage: 'AttachIsoToVmInstance' }),
      api: 'org.zstack.header.vm.APIAttachIsoToVmInstanceMsg',
    },
    AttachL3NetworkToVm: {
      name: 'AttachL3NetworkToVm',
      description: intl.formatMessage({ id: 'apiModel.api.AttachL3NetworkToVm', defaultMessage: 'AttachL3NetworkToVm' }),
      api: 'org.zstack.header.vm.APIAttachL3NetworkToVmMsg',
    },
    AttachL3NetworkToVmNic: {
      name: 'AttachL3NetworkToVmNic',
      description: intl.formatMessage({ id: 'apiModel.api.AttachL3NetworkToVmNic', defaultMessage: 'AttachL3NetworkToVmNic' }),
      api: 'org.zstack.header.vm.APIAttachL3NetworkToVmNicMsg',
    },
    AttachMdevDeviceToVm: {
      name: 'AttachMdevDeviceToVm',
      description: intl.formatMessage({ id: 'apiModel.api.AttachMdevDeviceToVm', defaultMessage: 'AttachMdevDeviceToVm' }),
      api: 'org.zstack.pciDevice.virtual.vfio_mdev.APIAttachMdevDeviceToVmMsg',
    },
    AttachSshKeyPairToVmInstance: {
      name: 'AttachSshKeyPairToVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.AttachSshKeyPairToVmInstance', defaultMessage: 'AttachSshKeyPairToVmInstance' }),
      api: 'org.zstack.header.sshkeypair.APIAttachSshKeyPairToVmInstanceMsg',
    },
    AttachVmNicToVm: {
      name: 'AttachVmNicToVm',
      description: intl.formatMessage({ id: 'apiModel.api.AttachVmNicToVm', defaultMessage: 'AttachVmNicToVm' }),
      api: 'org.zstack.header.vm.APIAttachVmNicToVmMsg',
    },
    BatchDeleteVolumeSnapshot: {
      name: 'BatchDeleteVolumeSnapshot',
      description: intl.formatMessage({ id: 'apiModel.api.BatchDeleteVolumeSnapshot', defaultMessage: 'BatchDeleteVolumeSnapshot' }),
      api: 'org.zstack.header.storage.snapshot.APIBatchDeleteVolumeSnapshotMsg',
    },
    BatchSyncVolumeSize: {
      name: 'BatchSyncVolumeSize',
      description: intl.formatMessage({ id: 'apiModel.api.BatchSyncVolumeSize', defaultMessage: 'BatchSyncVolumeSize' }),
      api: 'org.zstack.header.volume.APIBatchSyncVolumeSizeMsg',
    },
    CalculateImageHash: {
      name: 'CalculateImageHash',
      description: intl.formatMessage({ id: 'apiModel.api.CalculateImageHash', defaultMessage: 'CalculateImageHash' }),
      api: 'org.zstack.header.image.APICalculateImageHashMsg',
    },
    ChangeInstanceOffering: {
      name: 'ChangeInstanceOffering',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeInstanceOffering', defaultMessage: 'ChangeInstanceOffering' }),
      api: 'org.zstack.header.vm.APIChangeInstanceOfferingMsg',
    },
    ChangeVmImage: {
      name: 'ChangeVmImage',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeVmImage', defaultMessage: 'ChangeVmImage' }),
      api: 'org.zstack.header.vm.APIChangeVmImageMsg',
    },
    ChangeVmNicNetwork: {
      name: 'ChangeVmNicNetwork',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeVmNicNetwork', defaultMessage: 'ChangeVmNicNetwork' }),
      api: 'org.zstack.header.vm.APIChangeVmNicNetworkMsg',
    },
    ChangeVmNicSecurityPolicy: {
      name: 'ChangeVmNicSecurityPolicy',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeVmNicSecurityPolicy', defaultMessage: 'ChangeVmNicSecurityPolicy' }),
      api: 'org.zstack.network.securitygroup.APIChangeVmNicSecurityPolicyMsg',
    },
    ChangeVmNicState: {
      name: 'ChangeVmNicState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeVmNicState', defaultMessage: 'ChangeVmNicState' }),
      api: 'org.zstack.header.vm.APIChangeVmNicStateMsg',
    },
    ChangeVmNicType: {
      name: 'ChangeVmNicType',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeVmNicType', defaultMessage: 'ChangeVmNicType' }),
      api: 'org.zstack.header.sriov.APIChangeVmNicTypeMsg',
    },
    ChangeVmPassword: {
      name: 'ChangeVmPassword',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeVmPassword', defaultMessage: 'ChangeVmPassword' }),
      api: 'org.zstack.header.vm.APIChangeVmPasswordMsg',
    },
    ChangeVolumeState: {
      name: 'ChangeVolumeState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeVolumeState', defaultMessage: 'ChangeVolumeState' }),
      api: 'org.zstack.header.volume.APIChangeVolumeStateMsg',
    },
    CheckVolumeSnapshotGroupAvailability: {
      name: 'CheckVolumeSnapshotGroupAvailability',
      description: intl.formatMessage({ id: 'apiModel.api.CheckVolumeSnapshotGroupAvailability', defaultMessage: 'CheckVolumeSnapshotGroupAvailability' }),
      api: 'org.zstack.header.storage.snapshot.group.APICheckVolumeSnapshotGroupAvailabilityMsg',
    },
    CloneVmInstance: {
      name: 'CloneVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.CloneVmInstance', defaultMessage: 'CloneVmInstance' }),
      api: 'org.zstack.header.vm.APICloneVmInstanceMsg',
    },
    CreateDataVolume: {
      name: 'CreateDataVolume',
      description: intl.formatMessage({ id: 'apiModel.api.CreateDataVolume', defaultMessage: 'CreateDataVolume' }),
      api: 'org.zstack.header.volume.APICreateDataVolumeMsg',
    },
    CreateDataVolumeFromVolumeSnapshot: {
      name: 'CreateDataVolumeFromVolumeSnapshot',
      description: intl.formatMessage({ id: 'apiModel.api.CreateDataVolumeFromVolumeSnapshot', defaultMessage: 'CreateDataVolumeFromVolumeSnapshot' }),
      api: 'org.zstack.header.volume.APICreateDataVolumeFromVolumeSnapshotMsg',
    },
    CreateDataVolumeFromVolumeTemplate: {
      name: 'CreateDataVolumeFromVolumeTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.CreateDataVolumeFromVolumeTemplate', defaultMessage: 'CreateDataVolumeFromVolumeTemplate' }),
      api: 'org.zstack.header.volume.APICreateDataVolumeFromVolumeTemplateMsg',
    },
    CreateDataVolumeTemplateFromVolumeSnapshot: {
      name: 'CreateDataVolumeTemplateFromVolumeSnapshot',
      description: intl.formatMessage({ id: 'apiModel.api.CreateDataVolumeTemplateFromVolumeSnapshot', defaultMessage: 'CreateDataVolumeTemplateFromVolumeSnapshot' }),
      api: 'org.zstack.header.image.APICreateDataVolumeTemplateFromVolumeSnapshotMsg',
    },
    CreateDiskOffering: {
      name: 'CreateDiskOffering',
      description: intl.formatMessage({ id: 'apiModel.api.CreateDiskOffering', defaultMessage: 'CreateDiskOffering' }),
      api: 'org.zstack.header.configuration.APICreateDiskOfferingMsg',
    },
    CreateSshKeyPair: {
      name: 'CreateSshKeyPair',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSshKeyPair', defaultMessage: 'CreateSshKeyPair' }),
      api: 'org.zstack.header.sshkeypair.APICreateSshKeyPairMsg',
    },
    CreateVmCdRom: {
      name: 'CreateVmCdRom',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVmCdRom', defaultMessage: 'CreateVmCdRom' }),
      api: 'org.zstack.header.vm.cdrom.APICreateVmCdRomMsg',
    },
    CreateVmInstance: {
      name: 'CreateVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVmInstance', defaultMessage: 'CreateVmInstance' }),
      api: 'org.zstack.header.vm.APICreateVmInstanceMsg',
    },
    CreateVmInstanceFromOvfMsg: {
      name: 'CreateVmInstanceFromOvfMsg',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVmInstanceFromOvfMsg', defaultMessage: 'Import Virtual Machine' }),
      api: 'org.zstack.ovf.api.APICreateVmInstanceFromOvfMsg',
    },
    CreateVmInstanceFromVolume: {
      name: 'CreateVmInstanceFromVolume',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVmInstanceFromVolume', defaultMessage: 'CreateVmInstanceFromVolume' }),
      api: 'org.zstack.header.vm.APICreateVmInstanceFromVolumeMsg',
    },
    CreateVmInstanceFromVolumeSnapshot: {
      name: 'CreateVmInstanceFromVolumeSnapshot',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVmInstanceFromVolumeSnapshot', defaultMessage: 'CreateVmInstanceFromVolumeSnapshot' }),
      api: 'org.zstack.header.vm.APICreateVmInstanceFromVolumeSnapshotMsg',
    },
    CreateVmInstanceFromVolumeSnapshotGroup: {
      name: 'CreateVmInstanceFromVolumeSnapshotGroup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVmInstanceFromVolumeSnapshotGroup', defaultMessage: 'CreateVmInstanceFromVolumeSnapshotGroup' }),
      api: 'org.zstack.header.vm.APICreateVmInstanceFromVolumeSnapshotGroupMsg',
    },
    CreateVmNic: {
      name: 'CreateVmNic',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVmNic', defaultMessage: 'CreateVmNic' }),
      api: 'org.zstack.header.vm.APICreateVmNicMsg',
    },
    CreateVolumeSnapshot: {
      name: 'CreateVolumeSnapshot',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVolumeSnapshot', defaultMessage: 'CreateVolumeSnapshot' }),
      api: 'org.zstack.header.volume.APICreateVolumeSnapshotMsg',
    },
    CreateVolumeSnapshotGroup: {
      name: 'CreateVolumeSnapshotGroup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVolumeSnapshotGroup', defaultMessage: 'CreateVolumeSnapshotGroup' }),
      api: 'org.zstack.header.volume.APICreateVolumeSnapshotGroupMsg',
    },
    CreateVolumesSnapshot: {
      name: 'CreateVolumesSnapshot',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVolumesSnapshot', defaultMessage: 'CreateVolumesSnapshot' }),
      api: 'org.zstack.header.storage.snapshot.APICreateVolumesSnapshotMsg',
    },
    DeleteDataVolume: {
      name: 'DeleteDataVolume',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteDataVolume', defaultMessage: 'DeleteDataVolume' }),
      api: 'org.zstack.header.volume.APIDeleteDataVolumeMsg',
    },
    DeleteImagePackageMsg: {
      name: 'DeleteImagePackageMsg',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteImagePackageMsg', defaultMessage: 'DeleteImagePackageMsg' }),
      api: 'org.zstack.ovf.api.APIDeleteImagePackageMsg',
    },
    DeleteMdevDevice: {
      name: 'DeleteMdevDevice',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteMdevDevice', defaultMessage: 'DeleteMdevDevice' }),
      api: 'org.zstack.pciDevice.virtual.vfio_mdev.APIDeleteMdevDeviceMsg',
    },
    DeleteNicQoS: {
      name: 'DeleteNicQoS',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteNicQoS', defaultMessage: 'DeleteNicQoS' }),
      api: 'org.zstack.header.vm.APIDeleteNicQosMsg',
    },
    DeleteSshKeyPair: {
      name: 'DeleteSshKeyPair',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteSshKeyPair', defaultMessage: 'DeleteSshKeyPair' }),
      api: 'org.zstack.header.sshkeypair.APIDeleteSshKeyPairMsg',
    },
    DeleteVmBootMode: {
      name: 'DeleteVmBootMode',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVmBootMode', defaultMessage: 'DeleteVmBootMode' }),
      api: 'org.zstack.header.vm.APIDeleteVmBootModeMsg',
    },
    DeleteVmCdRom: {
      name: 'DeleteVmCdRom',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVmCdRom', defaultMessage: 'DeleteVmCdRom' }),
      api: 'org.zstack.header.vm.cdrom.APIDeleteVmCdRomMsg',
    },
    DeleteVmConsolePassword: {
      name: 'DeleteVmConsolePassword',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVmConsolePassword', defaultMessage: 'DeleteVmConsolePassword' }),
      api: 'org.zstack.header.vm.APIDeleteVmConsolePasswordMsg',
    },
    DeleteVmHostname: {
      name: 'DeleteVmHostname',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVmHostname', defaultMessage: 'DeleteVmHostname' }),
      api: 'org.zstack.header.vm.APIDeleteVmHostnameMsg',
    },
    DeleteVmInstanceHaLevel: {
      name: 'DeleteVmInstanceHaLevel',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVmInstanceHaLevel', defaultMessage: 'DeleteVmInstanceHaLevel' }),
      api: 'org.zstack.ha.APIDeleteVmInstanceHaLevelMsg',
    },
    DeleteVmNic: {
      name: 'DeleteVmNic',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVmNic', defaultMessage: 'DeleteVmNic' }),
      api: 'org.zstack.header.vm.APIDeleteVmNicMsg',
    },
    DeleteVmSshKey: {
      name: 'DeleteVmSshKey',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVmSshKey', defaultMessage: 'DeleteVmSshKey' }),
      api: 'org.zstack.header.vm.APIDeleteVmSshKeyMsg',
    },
    DeleteVmStaticIp: {
      name: 'DeleteVmStaticIp',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVmStaticIp', defaultMessage: 'DeleteVmStaticIp' }),
      api: 'org.zstack.header.vm.APIDeleteVmStaticIpMsg',
    },
    DeleteVmUserDefinedXml: {
      name: 'DeleteVmUserDefinedXml',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVmUserDefinedXml', defaultMessage: 'DeleteVmUserDefinedXml' }),
      api: 'org.zstack.header.vm.APIDeleteVmUserDefinedXmlMsg',
    },
    DeleteVmUserDefinedXmlHookScript: {
      name: 'DeleteVmUserDefinedXmlHookScript',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVmUserDefinedXmlHookScript', defaultMessage: 'DeleteVmUserDefinedXmlHookScript' }),
      api: 'org.zstack.header.vm.APIDeleteVmUserDefinedXmlHookScriptMsg',
    },
    DeleteVolumeQoS: {
      name: 'DeleteVolumeQoS',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVolumeQoS', defaultMessage: 'DeleteVolumeQoS' }),
      api: 'org.zstack.header.volume.APIDeleteVolumeQosMsg',
    },
    DeleteVolumeSnapshot: {
      name: 'DeleteVolumeSnapshot',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVolumeSnapshot', defaultMessage: 'DeleteVolumeSnapshot' }),
      api: 'org.zstack.header.storage.snapshot.APIDeleteVolumeSnapshotMsg',
    },
    DeleteVolumeSnapshotGroup: {
      name: 'DeleteVolumeSnapshotGroup',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVolumeSnapshotGroup', defaultMessage: 'DeleteVolumeSnapshotGroup' }),
      api: 'org.zstack.header.storage.snapshot.group.APIDeleteVolumeSnapshotGroupMsg',
    },
    DestroyVmInstance: {
      name: 'DestroyVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.DestroyVmInstance', defaultMessage: 'DestroyVmInstance' }),
      api: 'org.zstack.header.vm.APIDestroyVmInstanceMsg',
    },
    DetachDataVolumeFromVm: {
      name: 'DetachDataVolumeFromVm',
      description: intl.formatMessage({ id: 'apiModel.api.DetachDataVolumeFromVm', defaultMessage: 'DetachDataVolumeFromVm' }),
      api: 'org.zstack.header.volume.APIDetachDataVolumeFromVmMsg',
    },
    DetachIsoFromVmInstance: {
      name: 'DetachIsoFromVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.DetachIsoFromVmInstance', defaultMessage: 'DetachIsoFromVmInstance' }),
      api: 'org.zstack.header.vm.APIDetachIsoFromVmInstanceMsg',
    },
    DetachL3NetworkFromVm: {
      name: 'DetachL3NetworkFromVm',
      description: intl.formatMessage({ id: 'apiModel.api.DetachL3NetworkFromVm', defaultMessage: 'DetachL3NetworkFromVm' }),
      api: 'org.zstack.header.vm.APIDetachL3NetworkFromVmMsg',
    },
    DetachMdevDeviceFromVm: {
      name: 'DetachMdevDeviceFromVm',
      description: intl.formatMessage({ id: 'apiModel.api.DetachMdevDeviceFromVm', defaultMessage: 'DetachMdevDeviceFromVm' }),
      api: 'org.zstack.pciDevice.virtual.vfio_mdev.APIDetachMdevDeviceFromVmMsg',
    },
    DetachSshKeyPairFromVmInstance: {
      name: 'DetachSshKeyPairFromVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.DetachSshKeyPairFromVmInstance', defaultMessage: 'DetachSshKeyPairFromVmInstance' }),
      api: 'org.zstack.header.sshkeypair.APIDetachSshKeyPairFromVmInstanceMsg',
    },
    ExportVmOvaPackage: {
      name: 'ExportVmOvaPackage',
      description: intl.formatMessage({ id: 'apiModel.api.ExportVmOvaPackage', defaultMessage: 'ExportVmOvaPackage' }),
      api: 'org.zstack.ovf.api.APIExportVmOvaPackageMsg',
    },
    ExpungeDataVolume: {
      name: 'ExpungeDataVolume',
      description: intl.formatMessage({ id: 'apiModel.api.ExpungeDataVolume', defaultMessage: 'ExpungeDataVolume' }),
      api: 'org.zstack.header.volume.APIExpungeDataVolumeMsg',
    },
    ExpungeVmInstance: {
      name: 'ExpungeVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.ExpungeVmInstance', defaultMessage: 'ExpungeVmInstance' }),
      api: 'org.zstack.header.vm.APIExpungeVmInstanceMsg',
    },
    FlattenVmInstance: {
      name: 'FlattenVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.FlattenVmInstance', defaultMessage: 'FlattenVmInstance' }),
      api: 'org.zstack.header.vm.APIFlattenVmInstanceMsg',
    },
    FlattenVolume: {
      name: 'FlattenVolume',
      description: intl.formatMessage({ id: 'apiModel.api.FlattenVolume', defaultMessage: 'FlattenVolume' }),
      api: 'org.zstack.header.volume.APIFlattenVolumeMsg',
    },
    FstrimVm: {
      name: 'FstrimVm',
      description: intl.formatMessage({ id: 'apiModel.api.FstrimVm', defaultMessage: 'FstrimVm' }),
      api: 'org.zstack.header.vm.APIFstrimVmMsg',
    },
    GenerateSshKeyPair: {
      name: 'GenerateSshKeyPair',
      description: intl.formatMessage({ id: 'apiModel.api.GenerateSshKeyPair', defaultMessage: 'GenerateSshKeyPair' }),
      api: 'org.zstack.header.sshkeypair.APIGenerateSshKeyPairMsg',
    },
    GetCandidateImagesForCreatingVm: {
      name: 'GetCandidateImagesForCreatingVm',
      description: intl.formatMessage({ id: 'apiModel.api.GetCandidateImagesForCreatingVm', defaultMessage: 'GetCandidateImagesForCreatingVm' }),
      api: 'org.zstack.header.image.APIGetCandidateImagesForCreatingVmMsg',
    },
    GetCandidateIsoForAttachingVm: {
      name: 'GetCandidateIsoForAttachingVm',
      description: intl.formatMessage({ id: 'apiModel.api.GetCandidateIsoForAttachingVm', defaultMessage: 'GetCandidateIsoForAttachingVm' }),
      api: 'org.zstack.header.vm.APIGetCandidateIsoForAttachingVmMsg',
    },
    GetCandidateL3NetworksForChangeVmNicNetwork: {
      name: 'GetCandidateL3NetworksForChangeVmNicNetwork',
      description: intl.formatMessage({ id: 'apiModel.api.GetCandidateL3NetworksForChangeVmNicNetwork', defaultMessage: 'GetCandidateL3NetworksForChangeVmNicNetwork' }),
      api: 'org.zstack.header.vm.APIGetCandidateL3NetworksForChangeVmNicNetworkMsg',
    },
    GetCandidatePrimaryStoragesForCreatingVm: {
      name: 'GetCandidatePrimaryStoragesForCreatingVm',
      description: intl.formatMessage({ id: 'apiModel.api.GetCandidatePrimaryStoragesForCreatingVm', defaultMessage: 'GetCandidatePrimaryStoragesForCreatingVm' }),
      api: 'org.zstack.header.vm.APIGetCandidatePrimaryStoragesForCreatingVmMsg',
    },
    GetCandidateVmForAttachingIso: {
      name: 'GetCandidateVmForAttachingIso',
      description: intl.formatMessage({ id: 'apiModel.api.GetCandidateVmForAttachingIso', defaultMessage: 'GetCandidateVmForAttachingIso' }),
      api: 'org.zstack.header.vm.APIGetCandidateVmForAttachingIsoMsg',
    },
    GetCandidateZonesClustersHostsForCreatingVm: {
      name: 'GetCandidateZonesClustersHostsForCreatingVm',
      description: intl.formatMessage({ id: 'apiModel.api.GetCandidateZonesClustersHostsForCreatingVm', defaultMessage: 'GetCandidate Data CentersClustersHostsForCreatingVm' }),
      api: 'org.zstack.header.vm.APIGetCandidateZonesClustersHostsForCreatingVmMsg',
    },
    GetDataVolumeAttachableVm: {
      name: 'GetDataVolumeAttachableVm',
      description: intl.formatMessage({ id: 'apiModel.api.GetDataVolumeAttachableVm', defaultMessage: 'GetDataVolumeAttachableVm' }),
      api: 'org.zstack.header.volume.APIGetDataVolumeAttachableVmMsg',
    },
    GetImageCandidatesForVmToChange: {
      name: 'GetImageCandidatesForVmToChange',
      description: intl.formatMessage({ id: 'apiModel.api.GetImageCandidatesForVmToChange', defaultMessage: 'GetImageCandidatesForVmToChange' }),
      api: 'org.zstack.header.vm.APIGetImageCandidatesForVmToChangeMsg',
    },
    GetInterdependentL3NetworksBackupStorages: {
      name: 'GetInterdependentL3NetworksBackupStorages',
      description: intl.formatMessage({ id: 'apiModel.api.GetInterdependentL3NetworksBackupStorages', defaultMessage: 'GetInterdependentL3NetworksBackupStorages' }),
      api: 'org.zstack.header.vm.APIGetInterdependentL3NetworksBackupStoragesMsg',
    },
    GetInterdependentL3NetworksImages: {
      name: 'GetInterdependentL3NetworksImages',
      description: intl.formatMessage({ id: 'apiModel.api.GetInterdependentL3NetworksImages', defaultMessage: 'GetInterdependentL3NetworksImages' }),
      api: 'org.zstack.header.vm.APIGetInterdependentL3NetworksImagesMsg',
    },
    GetLatestGuestToolsForVm: {
      name: 'GetLatestGuestToolsForVm',
      description: intl.formatMessage({ id: 'apiModel.api.GetLatestGuestToolsForVm', defaultMessage: 'GetLatestGuestToolsForVm' }),
      api: 'org.zstack.guesttools.APIGetLatestGuestToolsForVmMsg',
    },
    GetMdevDeviceCandidates: {
      name: 'GetMdevDeviceCandidates',
      description: intl.formatMessage({ id: 'apiModel.api.GetMdevDeviceCandidates', defaultMessage: 'GetMdevDeviceCandidates' }),
      api: 'org.zstack.pciDevice.virtual.vfio_mdev.APIGetMdevDeviceCandidatesMsg',
    },
    GetMdevDeviceSpecCandidates: {
      name: 'GetMdevDeviceSpecCandidates',
      description: intl.formatMessage({ id: 'apiModel.api.GetMdevDeviceSpecCandidates', defaultMessage: 'GetMdevDeviceSpecCandidates' }),
      api: 'org.zstack.pciDevice.specification.mdev.APIGetMdevDeviceSpecCandidatesMsg',
    },
    GetMemorySnapshotGroupReference: {
      name: 'GetMemorySnapshotGroupReference',
      description: intl.formatMessage({ id: 'apiModel.api.GetMemorySnapshotGroupReference', defaultMessage: 'GetMemorySnapshotGroupReference' }),
      api: 'org.zstack.header.vm.APIGetMemorySnapshotGroupReferenceMsg',
    },
    GetNicQoS: {
      name: 'GetNicQoS',
      description: intl.formatMessage({ id: 'apiModel.api.GetNicQoS', defaultMessage: 'GetNicQoS' }),
      api: 'org.zstack.header.vm.APIGetNicQosMsg',
    },
    GetPciDeviceSpecCandidates: {
      name: 'GetPciDeviceSpecCandidates',
      description: intl.formatMessage({ id: 'apiModel.api.GetPciDeviceSpecCandidates', defaultMessage: 'GetPciDeviceSpecCandidates' }),
      api: 'org.zstack.pciDevice.specification.pci.APIGetPciDeviceSpecCandidatesMsg',
    },
    GetSpiceCertificates: {
      name: 'GetSpiceCertificates',
      description: intl.formatMessage({ id: 'apiModel.api.GetSpiceCertificates', defaultMessage: 'GetSpiceCertificates' }),
      api: 'org.zstack.header.vm.APIGetSpiceCertificatesMsg',
    },
    GetUploadImageJobDetails: {
      name: 'GetUploadImageJobDetails',
      description: intl.formatMessage({ id: 'apiModel.api.GetUploadImageJobDetails', defaultMessage: 'GetUploadImageJobDetails' }),
      api: 'org.zstack.header.image.APIGetUploadImageJobDetailsMsg',
    },
    GetVirtualizerInfo: {
      name: 'GetVirtualizerInfo',
      description: intl.formatMessage({ id: 'apiModel.api.GetVirtualizerInfo', defaultMessage: 'GetVirtualizerInfo' }),
      api: 'org.zstack.header.vm.APIGetVirtualizerInfoMsg',
    },
    GetVmAttachableDataVolume: {
      name: 'GetVmAttachableDataVolume',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmAttachableDataVolume', defaultMessage: 'GetVmAttachableDataVolume' }),
      api: 'org.zstack.header.vm.APIGetVmAttachableDataVolumeMsg',
    },
    GetVmAttachableL3Network: {
      name: 'GetVmAttachableL3Network',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmAttachableL3Network', defaultMessage: 'GetVmAttachableL3Network' }),
      api: 'org.zstack.header.vm.APIGetVmAttachableL3NetworkMsg',
    },
    GetVmBootOrder: {
      name: 'GetVmBootOrder',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmBootOrder', defaultMessage: 'GetVmBootOrder' }),
      api: 'org.zstack.header.vm.APIGetVmBootOrderMsg',
    },
    GetVmCapabilities: {
      name: 'GetVmCapabilities',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmCapabilities', defaultMessage: 'GetVmCapabilities' }),
      api: 'org.zstack.header.vm.APIGetVmCapabilitiesMsg',
    },
    GetVmConsoleAddress: {
      name: 'GetVmConsoleAddress',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmConsoleAddress', defaultMessage: 'GetVmConsoleAddress' }),
      api: 'org.zstack.header.vm.APIGetVmConsoleAddressMsg',
    },
    GetVmConsolePassword: {
      name: 'GetVmConsolePassword',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmConsolePassword', defaultMessage: 'GetVmConsolePassword' }),
      api: 'org.zstack.header.vm.APIGetVmConsolePasswordMsg',
    },
    GetVmDeviceAddress: {
      name: 'GetVmDeviceAddress',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmDeviceAddress', defaultMessage: 'GetVmDeviceAddress' }),
      api: 'org.zstack.header.vm.APIGetVmDeviceAddressMsg',
    },
    GetVmEmulatorPinningMsg: {
      name: 'GetVmEmulatorPinningMsg',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmEmulatorPinningMsg', defaultMessage: 'GetVmEmulatorPinningMsg' }),
      api: 'org.zstack.header.vm.APIGetVmEmulatorPinningMsg',
    },
    GetVmGuestToolsInfo: {
      name: 'GetVmGuestToolsInfo',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmGuestToolsInfo', defaultMessage: 'GetVmGuestToolsInfo' }),
      api: 'org.zstack.guesttools.APIGetVmGuestToolsInfoMsg',
    },
    GetVmHostname: {
      name: 'GetVmHostname',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmHostname', defaultMessage: 'GetVmHostname' }),
      api: 'org.zstack.header.vm.APIGetVmHostnameMsg',
    },
    GetVmInstanceFirstBootDevice: {
      name: 'GetVmInstanceFirstBootDevice',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmInstanceFirstBootDevice', defaultMessage: 'GetVmInstanceFirstBootDevice' }),
      api: 'org.zstack.header.vm.APIGetVmInstanceFirstBootDeviceMsg',
    },
    GetVmInstanceHaLevel: {
      name: 'GetVmInstanceHaLevel',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmInstanceHaLevel', defaultMessage: 'GetVmInstanceHaLevel' }),
      api: 'org.zstack.ha.APIGetVmInstanceHaLevelMsg',
    },
    GetVmMigrationCandidateHosts: {
      name: 'GetVmMigrationCandidateHosts',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmMigrationCandidateHosts', defaultMessage: 'GetVmMigrationCandidateHosts' }),
      api: 'org.zstack.header.vm.APIGetVmMigrationCandidateHostsMsg',
    },
    GetVmMonitorNumber: {
      name: 'GetVmMonitorNumber',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmMonitorNumber', defaultMessage: 'GetVmMonitorNumber' }),
      api: 'org.zstack.header.vm.APIGetVmMonitorNumberMsg',
    },
    GetVmNicAttachedNetworkService: {
      name: 'GetVmNicAttachedNetworkService',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmNicAttachedNetworkService', defaultMessage: 'GetVmNicAttachedNetworkService' }),
      api: 'org.zstack.header.vm.APIGetVmNicAttachedNetworkServiceMsg',
    },
    GetVmQga: {
      name: 'GetVmQga',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmQga', defaultMessage: 'GetVmQga' }),
      api: 'org.zstack.header.vm.APIGetVmQgaMsg',
    },
    GetVmRDP: {
      name: 'GetVmRDP',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmRDP', defaultMessage: 'GetVmRDP' }),
      api: 'org.zstack.header.vm.APIGetVmRDPMsg',
    },
    GetVmSshKey: {
      name: 'GetVmSshKey',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmSshKey', defaultMessage: 'GetVmSshKey' }),
      api: 'org.zstack.header.vm.APIGetVmSshKeyMsg',
    },
    GetVmStartingCandidateClustersHosts: {
      name: 'GetVmStartingCandidateClustersHosts',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmStartingCandidateClustersHosts', defaultMessage: 'GetVmStartingCandidateClustersHosts' }),
      api: 'org.zstack.header.vm.APIGetVmStartingCandidateClustersHostsMsg',
    },
    GetVmTask: {
      name: 'GetVmTask',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmTask', defaultMessage: 'GetVmTask' }),
      api: 'org.zstack.header.vm.APIGetVmTaskMsg',
    },
    GetVmUptime: {
      name: 'GetVmUptime',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmUptime', defaultMessage: 'GetVmUptime' }),
      api: 'org.zstack.header.vm.APIGetVmUptimeMsg',
    },
    GetVmXml: {
      name: 'GetVmXml',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmXml', defaultMessage: 'GetVmXml' }),
      api: 'org.zstack.header.vm.APIGetVmXmlMsg',
    },
    GetVmXmlHookScript: {
      name: 'GetVmXmlHookScript',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmXmlHookScript', defaultMessage: 'GetVmXmlHookScript' }),
      api: 'org.zstack.header.vm.APIGetVmXmlHookScriptMsg',
    },
    GetVmvNUMATopology: {
      name: 'GetVmvNUMATopology',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmvNUMATopology', defaultMessage: 'GetVmvNUMATopology' }),
      api: 'org.zstack.header.vm.APIGetVmvNUMATopologyMsg',
    },
    GetVolumeCapabilities: {
      name: 'GetVolumeCapabilities',
      description: intl.formatMessage({ id: 'apiModel.api.GetVolumeCapabilities', defaultMessage: 'GetVolumeCapabilities' }),
      api: 'org.zstack.header.volume.APIGetVolumeCapabilitiesMsg',
    },
    GetVolumeFormat: {
      name: 'GetVolumeFormat',
      description: intl.formatMessage({ id: 'apiModel.api.GetVolumeFormat', defaultMessage: 'GetVolumeFormat' }),
      api: 'org.zstack.header.volume.APIGetVolumeFormatMsg',
    },
    GetVolumeIoThreadPin: {
      name: 'GetVolumeIoThreadPin',
      description: intl.formatMessage({ id: 'apiModel.api.GetVolumeIoThreadPin', defaultMessage: 'GetVolumeIoThreadPin' }),
      api: 'org.zstack.header.volume.APIGetVolumeIoThreadPinMsg',
    },
    GetVolumeQoS: {
      name: 'GetVolumeQoS',
      description: intl.formatMessage({ id: 'apiModel.api.GetVolumeQoS', defaultMessage: 'GetVolumeQoS' }),
      api: 'org.zstack.header.volume.APIGetVolumeQosMsg',
    },
    GetVolumeSnapshotSize: {
      name: 'GetVolumeSnapshotSize',
      description: intl.formatMessage({ id: 'apiModel.api.GetVolumeSnapshotSize', defaultMessage: 'GetVolumeSnapshotSize' }),
      api: 'org.zstack.header.storage.snapshot.APIGetVolumeSnapshotSizeMsg',
    },
    IsVfNicAvailableInL3Network: {
      name: 'IsVfNicAvailableInL3Network',
      description: intl.formatMessage({ id: 'apiModel.api.IsVfNicAvailableInL3Network', defaultMessage: 'IsVfNicAvailableInL3Network' }),
      api: 'org.zstack.header.sriov.APIIsVfNicAvailableInL3NetworkMsg',
    },
    MigrateVm: {
      name: 'MigrateVm',
      description: intl.formatMessage({ id: 'apiModel.api.MigrateVm', defaultMessage: 'MigrateVm' }),
      api: 'org.zstack.header.vm.APIMigrateVmMsg',
    },
    PauseVmInstance: {
      name: 'PauseVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.PauseVmInstance', defaultMessage: 'PauseVmInstance' }),
      api: 'org.zstack.header.vm.APIPauseVmInstanceMsg',
    },
    QueryApplianceVm: {
      name: 'QueryApplianceVm',
      description: intl.formatMessage({ id: 'apiModel.api.QueryApplianceVm', defaultMessage: 'QueryApplianceVm' }),
      api: 'org.zstack.appliancevm.APIQueryApplianceVmMsg',
    },
    QueryDiskOffering: {
      name: 'QueryDiskOffering',
      description: intl.formatMessage({ id: 'apiModel.api.QueryDiskOffering', defaultMessage: 'QueryDiskOffering' }),
      api: 'org.zstack.header.configuration.APIQueryDiskOfferingMsg',
    },
    QueryEthernetVF: {
      name: 'QueryEthernetVF',
      description: intl.formatMessage({ id: 'apiModel.api.QueryEthernetVF', defaultMessage: 'QueryEthernetVF' }),
      api: 'org.zstack.pciDevice.virtual.sr_iov.APIQueryEthernetVFMsg',
    },
    QueryGuestToolsState: {
      name: 'QueryGuestToolsState',
      description: intl.formatMessage({ id: 'apiModel.api.QueryGuestToolsState', defaultMessage: 'QueryGuestToolsState' }),
      api: 'org.zstack.guesttools.APIQueryGuestToolsStateMsg',
    },
    QueryImagePackageMsg: {
      name: 'QueryImagePackageMsg',
      description: intl.formatMessage({ id: 'apiModel.api.QueryImagePackageMsg', defaultMessage: 'QueryImagePackage' }),
      api: 'org.zstack.ovf.api.APIQueryImagePackageMsg',
    },
    QueryInstanceOffering: {
      name: 'QueryInstanceOffering',
      description: intl.formatMessage({ id: 'apiModel.api.QueryInstanceOffering', defaultMessage: 'QueryInstanceOffering' }),
      api: 'org.zstack.header.configuration.APIQueryInstanceOfferingMsg',
    },
    QueryMdevDevice: {
      name: 'QueryMdevDevice',
      description: intl.formatMessage({ id: 'apiModel.api.QueryMdevDevice', defaultMessage: 'QueryMdevDevice' }),
      api: 'org.zstack.pciDevice.virtual.vfio_mdev.APIQueryMdevDeviceMsg',
    },
    QueryMdevDeviceSpec: {
      name: 'QueryMdevDeviceSpec',
      description: intl.formatMessage({ id: 'apiModel.api.QueryMdevDeviceSpec', defaultMessage: 'QueryMdevDeviceSpec' }),
      api: 'org.zstack.pciDevice.specification.mdev.APIQueryMdevDeviceSpecMsg',
    },
    QueryMttyDevice: {
      name: 'QueryMttyDevice',
      description: intl.formatMessage({ id: 'apiModel.api.QueryMttyDevice', defaultMessage: 'QueryMttyDevice' }),
      api: 'org.zstack.mttyDevice.APIQueryMttyDeviceMsg',
    },
    QueryPciDeviceSpec: {
      name: 'QueryPciDeviceSpec',
      description: intl.formatMessage({ id: 'apiModel.api.QueryPciDeviceSpec', defaultMessage: 'QueryPciDeviceSpec' }),
      api: 'org.zstack.pciDevice.specification.pci.APIQueryPciDeviceSpecMsg',
    },
    QueryShareableVolumeVmInstanceRef: {
      name: 'QueryShareableVolumeVmInstanceRef',
      description: intl.formatMessage({ id: 'apiModel.api.QueryShareableVolumeVmInstanceRef', defaultMessage: 'QueryShareableVolumeVmInstanceRef' }),
      api: 'org.zstack.mevoco.APIQueryShareableVolumeVmInstanceRefMsg',
    },
    QuerySshKeyPair: {
      name: 'QuerySshKeyPair',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySshKeyPair', defaultMessage: 'QuerySshKeyPair' }),
      api: 'org.zstack.header.sshkeypair.APIQuerySshKeyPairMsg',
    },
    QueryTemplatedVmInstance: {
      name: 'QueryTemplatedVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.QueryTemplatedVmInstance', defaultMessage: 'QueryTemplatedVmInstance' }),
      api: 'org.zstack.header.vm.APIQueryTemplatedVmInstanceMsg',
    },
    QueryVmCdRom: {
      name: 'QueryVmCdRom',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVmCdRom', defaultMessage: 'QueryVmCdRom' }),
      api: 'org.zstack.header.vm.cdrom.APIQueryVmCdRomMsg',
    },
    QueryVmInstance: {
      name: 'QueryVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVmInstance', defaultMessage: 'QueryVmInstance' }),
      api: 'org.zstack.header.vm.APIQueryVmInstanceMsg',
    },
    QueryVmInstanceDeviceAddressArchive: {
      name: 'QueryVmInstanceDeviceAddressArchive',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVmInstanceDeviceAddressArchive', defaultMessage: 'QueryVmInstanceDeviceAddressArchive' }),
      api: 'org.zstack.header.vm.devices.APIQueryVmInstanceResourceMetadataArchiveMsg',
    },
    QueryVmInstanceDeviceAddressGroup: {
      name: 'QueryVmInstanceDeviceAddressGroup',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVmInstanceDeviceAddressGroup', defaultMessage: 'QueryVmInstanceDeviceAddressGroup' }),
      api: 'org.zstack.header.vm.devices.APIQueryVmInstanceResourceMetadataGroupMsg',
    },
    QueryVmInstanceMdevDeviceSpecRef: {
      name: 'QueryVmInstanceMdevDeviceSpecRef',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVmInstanceMdevDeviceSpecRef', defaultMessage: 'QueryVmInstanceMdevDeviceSpecRef' }),
      api: 'org.zstack.pciDevice.specification.mdev.APIQueryVmInstanceMdevDeviceSpecRefMsg',
    },
    QueryVmInstancePciDeviceSpecRef: {
      name: 'QueryVmInstancePciDeviceSpecRef',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVmInstancePciDeviceSpecRef', defaultMessage: 'QueryVmInstancePciDeviceSpecRef' }),
      api: 'org.zstack.pciDevice.specification.pci.APIQueryVmInstancePciDeviceSpecRefMsg',
    },
    QueryVmNic: {
      name: 'QueryVmNic',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVmNic', defaultMessage: 'QueryVmNic' }),
      api: 'org.zstack.header.vm.APIQueryVmNicMsg',
    },
    QueryVmNicSecurityPolicy: {
      name: 'QueryVmNicSecurityPolicy',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVmNicSecurityPolicy', defaultMessage: 'QueryVmNicSecurityPolicy' }),
      api: 'org.zstack.network.securitygroup.APIQueryVmNicSecurityPolicyMsg',
    },
    QueryVmPriorityConfig: {
      name: 'QueryVmPriorityConfig',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVmPriorityConfig', defaultMessage: 'QueryVmPriorityConfig' }),
      api: 'org.zstack.header.vm.APIQueryVmPriorityConfigMsg',
    },
    QueryVmSchedHistory: {
      name: 'QueryVmSchedHistory',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVmSchedHistory', defaultMessage: 'QueryVmSchedHistory' }),
      api: 'org.zstack.header.vm.APIQueryVmSchedHistoryMsg',
    },
    QueryVolume: {
      name: 'QueryVolume',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVolume', defaultMessage: 'QueryVolume' }),
      api: 'org.zstack.header.volume.APIQueryVolumeMsg',
    },
    QueryVolumeSnapshot: {
      name: 'QueryVolumeSnapshot',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVolumeSnapshot', defaultMessage: 'QueryVolumeSnapshot' }),
      api: 'org.zstack.header.storage.snapshot.APIQueryVolumeSnapshotMsg',
    },
    QueryVolumeSnapshotGroup: {
      name: 'QueryVolumeSnapshotGroup',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVolumeSnapshotGroup', defaultMessage: 'QueryVolumeSnapshotGroup' }),
      api: 'org.zstack.header.storage.snapshot.group.APIQueryVolumeSnapshotGroupMsg',
    },
    QueryVolumeSnapshotTree: {
      name: 'QueryVolumeSnapshotTree',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVolumeSnapshotTree', defaultMessage: 'QueryVolumeSnapshotTree' }),
      api: 'org.zstack.header.storage.snapshot.APIQueryVolumeSnapshotTreeMsg',
    },
    RebootVmInstance: {
      name: 'RebootVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.RebootVmInstance', defaultMessage: 'RebootVmInstance' }),
      api: 'org.zstack.header.vm.APIRebootVmInstanceMsg',
    },
    RecoverDataVolume: {
      name: 'RecoverDataVolume',
      description: intl.formatMessage({ id: 'apiModel.api.RecoverDataVolume', defaultMessage: 'RecoverDataVolume' }),
      api: 'org.zstack.header.volume.APIRecoverDataVolumeMsg',
    },
    RecoverVmInstance: {
      name: 'RecoverVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.RecoverVmInstance', defaultMessage: 'RecoverVmInstance' }),
      api: 'org.zstack.header.vm.APIRecoverVmInstanceMsg',
    },
    ReimageVmInstance: {
      name: 'ReimageVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.ReimageVmInstance', defaultMessage: 'ReimageVmInstance' }),
      api: 'org.zstack.header.vm.APIReimageVmInstanceMsg',
    },
    RemoveMdevDeviceSpecFromVmInstance: {
      name: 'RemoveMdevDeviceSpecFromVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveMdevDeviceSpecFromVmInstance', defaultMessage: 'RemoveMdevDeviceSpecFromVmInstance' }),
      api: 'org.zstack.pciDevice.specification.mdev.APIRemoveMdevDeviceSpecFromVmInstanceMsg',
    },
    RemovePciDeviceSpecFromVmInstance: {
      name: 'RemovePciDeviceSpecFromVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.RemovePciDeviceSpecFromVmInstance', defaultMessage: 'RemovePciDeviceSpecFromVmInstance' }),
      api: 'org.zstack.pciDevice.specification.pci.APIRemovePciDeviceSpecFromVmInstanceMsg',
    },
    ResizeDataVolume: {
      name: 'ResizeDataVolume',
      description: intl.formatMessage({ id: 'apiModel.api.ResizeDataVolume', defaultMessage: 'ResizeDataVolume' }),
      api: 'org.zstack.header.volume.APIResizeDataVolumeMsg',
    },
    ResizeRootVolume: {
      name: 'ResizeRootVolume',
      description: intl.formatMessage({ id: 'apiModel.api.ResizeRootVolume', defaultMessage: 'ResizeRootVolume' }),
      api: 'org.zstack.header.volume.APIResizeRootVolumeMsg',
    },
    ResumeVmInstance: {
      name: 'ResumeVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.ResumeVmInstance', defaultMessage: 'ResumeVmInstance' }),
      api: 'org.zstack.header.vm.APIResumeVmInstanceMsg',
    },
    RevertVmFromSnapshotGroup: {
      name: 'RevertVmFromSnapshotGroup',
      description: intl.formatMessage({ id: 'apiModel.api.RevertVmFromSnapshotGroup', defaultMessage: 'RevertVmFromSnapshotGroup' }),
      api: 'org.zstack.header.storage.snapshot.group.APIRevertVmFromSnapshotGroupMsg',
    },
    RevertVolumeFromSnapshot: {
      name: 'RevertVolumeFromSnapshot',
      description: intl.formatMessage({ id: 'apiModel.api.RevertVolumeFromSnapshot', defaultMessage: 'RevertVolumeFromSnapshot' }),
      api: 'org.zstack.header.storage.snapshot.APIRevertVolumeFromSnapshotMsg',
    },
    SetImageSecurityLevel: {
      name: 'SetImageSecurityLevel',
      description: intl.formatMessage({ id: 'apiModel.api.SetImageSecurityLevel', defaultMessage: 'SetImageSecurityLevel' }),
      api: 'org.zstack.header.image.APISetImageSecurityLevelMsg',
    },
    SetNicQoS: {
      name: 'SetNicQoS',
      description: intl.formatMessage({ id: 'apiModel.api.SetNicQoS', defaultMessage: 'SetNicQoS' }),
      api: 'org.zstack.header.vm.APISetNicQosMsg',
    },
    SetVmBootMode: {
      name: 'SetVmBootMode',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmBootMode', defaultMessage: 'SetVmBootMode' }),
      api: 'org.zstack.header.vm.APISetVmBootModeMsg',
    },
    SetVmBootOrder: {
      name: 'SetVmBootOrder',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmBootOrder', defaultMessage: 'SetVmBootOrder' }),
      api: 'org.zstack.header.vm.APISetVmBootOrderMsg',
    },
    SetVmBootVolume: {
      name: 'SetVmBootVolume',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmBootVolume', defaultMessage: 'SetVmBootVolume' }),
      api: 'org.zstack.header.vm.APISetVmBootVolumeMsg',
    },
    SetVmCleanTraffic: {
      name: 'SetVmCleanTraffic',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmCleanTraffic', defaultMessage: 'SetVmCleanTraffic' }),
      api: 'org.zstack.header.vm.APISetVmCleanTrafficMsg',
    },
    SetVmClockTrack: {
      name: 'SetVmClockTrack',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmClockTrack', defaultMessage: 'SetVmClockTrack' }),
      api: 'org.zstack.header.vm.APISetVmClockTrackMsg',
    },
    SetVmConsoleMode: {
      name: 'SetVmConsoleMode',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmConsoleMode', defaultMessage: 'SetVmConsoleMode' }),
      api: 'org.zstack.header.vm.APISetVmConsoleModeMsg',
    },
    SetVmConsolePassword: {
      name: 'SetVmConsolePassword',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmConsolePassword', defaultMessage: 'SetVmConsolePassword' }),
      api: 'org.zstack.header.vm.APISetVmConsolePasswordMsg',
    },
    SetVmEmulatorPinningMsg: {
      name: 'SetVmEmulatorPinningMsg',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmEmulatorPinningMsg', defaultMessage: 'SetVmEmulatorPinningMsg' }),
      api: 'org.zstack.header.vm.APISetVmEmulatorPinningMsg',
    },
    SetVmHostname: {
      name: 'SetVmHostname',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmHostname', defaultMessage: 'SetVmHostname' }),
      api: 'org.zstack.header.vm.APISetVmHostnameMsg',
    },
    SetVmInstanceDefaultCdRom: {
      name: 'SetVmInstanceDefaultCdRom',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmInstanceDefaultCdRom', defaultMessage: 'SetVmInstanceDefaultCdRom' }),
      api: 'org.zstack.header.vm.cdrom.APISetVmInstanceDefaultCdRomMsg',
    },
    SetVmInstanceHaLevel: {
      name: 'SetVmInstanceHaLevel',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmInstanceHaLevel', defaultMessage: 'SetVmInstanceHaLevel' }),
      api: 'org.zstack.ha.APISetVmInstanceHaLevelMsg',
    },
    SetVmMonitorNumber: {
      name: 'SetVmMonitorNumber',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmMonitorNumber', defaultMessage: 'SetVmMonitorNumber' }),
      api: 'org.zstack.header.vm.APISetVmMonitorNumberMsg',
    },
    SetVmNicSecurityGroup: {
      name: 'SetVmNicSecurityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmNicSecurityGroup', defaultMessage: 'SetVmNicSecurityGroup' }),
      api: 'org.zstack.network.securitygroup.APISetVmNicSecurityGroupMsg',
    },
    SetVmNumaMsg: {
      name: 'SetVmNumaMsg',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmNumaMsg', defaultMessage: 'SetVmNumaMsg' }),
      api: 'org.zstack.header.vm.APISetVmNumaMsg',
    },
    SetVmQga: {
      name: 'SetVmQga',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmQga', defaultMessage: 'SetVmQga' }),
      api: 'org.zstack.header.vm.APISetVmQgaMsg',
    },
    SetVmQxlMemory: {
      name: 'SetVmQxlMemory',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmQxlMemory', defaultMessage: 'SetVmQxlMemory' }),
      api: 'org.zstack.header.vm.APISetVmQxlMemoryMsg',
    },
    SetVmRDP: {
      name: 'SetVmRDP',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmRDP', defaultMessage: 'SetVmRDP' }),
      api: 'org.zstack.header.vm.APISetVmRDPMsg',
    },
    SetVmSecurityLevel: {
      name: 'SetVmSecurityLevel',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmSecurityLevel', defaultMessage: 'SetVmSecurityLevel' }),
      api: 'org.zstack.header.vm.APISetVmSecurityLevelMsg',
    },
    SetVmSoundType: {
      name: 'SetVmSoundType',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmSoundType', defaultMessage: 'SetVmSoundType' }),
      api: 'org.zstack.header.vm.APISetVmSoundTypeMsg',
    },
    SetVmSshKey: {
      name: 'SetVmSshKey',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmSshKey', defaultMessage: 'SetVmSshKey' }),
      api: 'org.zstack.header.vm.APISetVmSshKeyMsg',
    },
    SetVmStaticIp: {
      name: 'SetVmStaticIp',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmStaticIp', defaultMessage: 'SetVmStaticIp' }),
      api: 'org.zstack.header.vm.APISetVmStaticIpMsg',
    },
    SetVmUserDefinedXml: {
      name: 'SetVmUserDefinedXml',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmUserDefinedXml', defaultMessage: 'SetVmUserDefinedXml' }),
      api: 'org.zstack.header.vm.APISetVmUserDefinedXmlMsg',
    },
    SetVmUserDefinedXmlHookScript: {
      name: 'SetVmUserDefinedXmlHookScript',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmUserDefinedXmlHookScript', defaultMessage: 'SetVmUserDefinedXmlHookScript' }),
      api: 'org.zstack.header.vm.APISetVmUserDefinedXmlHookScriptMsg',
    },
    SetVolumeIoThreadPin: {
      name: 'SetVolumeIoThreadPin',
      description: intl.formatMessage({ id: 'apiModel.api.SetVolumeIoThreadPin', defaultMessage: 'SetVolumeIoThreadPin' }),
      api: 'org.zstack.header.volume.APISetVolumeIoThreadPinMsg',
    },
    SetVolumeQoS: {
      name: 'SetVolumeQoS',
      description: intl.formatMessage({ id: 'apiModel.api.SetVolumeQoS', defaultMessage: 'SetVolumeQoS' }),
      api: 'org.zstack.header.volume.APISetVolumeQosMsg',
    },
    ShrinkSnapShot: {
      name: 'ShrinkSnapShot',
      description: intl.formatMessage({ id: 'apiModel.api.ShrinkSnapShot', defaultMessage: 'ShrinkSnapShot' }),
      api: 'org.zstack.header.storage.snapshot.APIShrinkVolumeSnapshotMsg',
    },
    StartVmInstance: {
      name: 'StartVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.StartVmInstance', defaultMessage: 'StartVmInstance' }),
      api: 'org.zstack.header.vm.APIStartVmInstanceMsg',
    },
    StopVmInstance: {
      name: 'StopVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.StopVmInstance', defaultMessage: 'StopVmInstance' }),
      api: 'org.zstack.header.vm.APIStopVmInstanceMsg',
    },
    SyncVmClock: {
      name: 'SyncVmClock',
      description: intl.formatMessage({ id: 'apiModel.api.SyncVmClock', defaultMessage: 'SyncVmClock' }),
      api: 'org.zstack.header.vm.APISyncVmClockMsg',
    },
    SyncVolumeSize: {
      name: 'SyncVolumeSize',
      description: intl.formatMessage({ id: 'apiModel.api.SyncVolumeSize', defaultMessage: 'SyncVolumeSize' }),
      api: 'org.zstack.header.volume.APISyncVolumeSizeMsg',
    },
    UndoSnapshotCreation: {
      name: 'UndoSnapshotCreation',
      description: intl.formatMessage({ id: 'apiModel.api.UndoSnapshotCreation', defaultMessage: 'UndoSnapshotCreation' }),
      api: 'org.zstack.header.volume.APIUndoSnapshotCreationMsg',
    },
    UngroupVolumeSnapshotGroup: {
      name: 'UngroupVolumeSnapshotGroup',
      description: intl.formatMessage({ id: 'apiModel.api.UngroupVolumeSnapshotGroup', defaultMessage: 'UngroupVolumeSnapshotGroup' }),
      api: 'org.zstack.header.storage.snapshot.group.APIUngroupVolumeSnapshotGroupMsg',
    },
    UpdateGuestToolsState: {
      name: 'UpdateGuestToolsState',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateGuestToolsState', defaultMessage: 'UpdateGuestToolsState' }),
      api: 'org.zstack.guesttools.APIUpdateGuestToolsStateMsg',
    },
    UpdatePriorityConfig: {
      name: 'UpdatePriorityConfig',
      description: intl.formatMessage({ id: 'apiModel.api.UpdatePriorityConfig', defaultMessage: 'UpdatePriorityConfig' }),
      api: 'org.zstack.header.vm.APIUpdatePriorityConfigMsg',
    },
    UpdateSshKeyPair: {
      name: 'UpdateSshKeyPair',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSshKeyPair', defaultMessage: 'UpdateSshKeyPair' }),
      api: 'org.zstack.header.sshkeypair.APIUpdateSshKeyPairMsg',
    },
    UpdateTemplatedVmInstance: {
      name: 'UpdateTemplatedVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateTemplatedVmInstance', defaultMessage: 'UpdateTemplatedVmInstance' }),
      api: 'org.zstack.header.vm.APIUpdateTemplatedVmInstanceMsg',
    },
    UpdateVmCdRom: {
      name: 'UpdateVmCdRom',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateVmCdRom', defaultMessage: 'UpdateVmCdRom' }),
      api: 'org.zstack.header.vm.cdrom.APIUpdateVmCdRomMsg',
    },
    UpdateVmInstance: {
      name: 'UpdateVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateVmInstance', defaultMessage: 'UpdateVmInstance' }),
      api: 'org.zstack.header.vm.APIUpdateVmInstanceMsg',
    },
    UpdateVmNetworkConfig: {
      name: 'UpdateVmNetworkConfig',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateVmNetworkConfig', defaultMessage: 'UpdateVmNetworkConfig' }),
      api: 'org.zstack.guesttools.APIUpdateVmNetworkConfigMsg',
    },
    UpdateVmNicDriver: {
      name: 'UpdateVmNicDriver',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateVmNicDriver', defaultMessage: 'UpdateVmNicDriver' }),
      api: 'org.zstack.header.vm.APIUpdateVmNicDriverMsg',
    },
    UpdateVmNicMac: {
      name: 'UpdateVmNicMac',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateVmNicMac', defaultMessage: 'UpdateVmNicMac' }),
      api: 'org.zstack.header.vm.APIUpdateVmNicMacMsg',
    },
    UpdateVmPriority: {
      name: 'UpdateVmPriority',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateVmPriority', defaultMessage: 'UpdateVmPriority' }),
      api: 'org.zstack.header.vm.APIUpdateVmPriorityMsg',
    },
    UpdateVolume: {
      name: 'UpdateVolume',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateVolume', defaultMessage: 'UpdateVolume' }),
      api: 'org.zstack.header.volume.APIUpdateVolumeMsg',
    },
    UpdateVolumeSnapshot: {
      name: 'UpdateVolumeSnapshot',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateVolumeSnapshot', defaultMessage: 'UpdateVolumeSnapshot' }),
      api: 'org.zstack.header.storage.snapshot.APIUpdateVolumeSnapshotMsg',
    },
    UpdateVolumeSnapshotGroup: {
      name: 'UpdateVolumeSnapshotGroup',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateVolumeSnapshotGroup', defaultMessage: 'UpdateVolumeSnapshotGroup' }),
      api: 'org.zstack.header.storage.snapshot.group.APIUpdateVolumeSnapshotGroupMsg',
    },
    ValidateVolumeSnapshotChain: {
      name: 'ValidateVolumeSnapshotChain',
      description: intl.formatMessage({ id: 'apiModel.api.ValidateVolumeSnapshotChain', defaultMessage: 'ValidateVolumeSnapshotChain' }),
      api: 'org.zstack.header.volume.APIValidateVolumeSnapshotChainMsg',
    },
  }
}

export default api
