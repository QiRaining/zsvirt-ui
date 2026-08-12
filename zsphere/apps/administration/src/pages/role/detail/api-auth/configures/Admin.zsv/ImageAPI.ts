const api = (intl: any) => {
  return {
    AddImage: {
      name: 'AddImage',
      description: intl.formatMessage({ id: 'apiModel.api.AddImage', defaultMessage: 'AddImage' }),
      api: 'org.zstack.header.image.APIAddImageMsg',
    },
    ChangeImageState: {
      name: 'ChangeImageState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeImageState', defaultMessage: 'ChangeImageState' }),
      api: 'org.zstack.header.image.APIChangeImageStateMsg',
    },
    ConvertTemplatedVmInstanceToVmInstance: {
      name: 'ConvertTemplatedVmInstanceToVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.ConvertTemplatedVmInstanceToVmInstance', defaultMessage: 'ConvertTemplatedVmInstanceToVmInstance' }),
      api: 'org.zstack.header.vm.APIConvertTemplatedVmInstanceToVmInstanceMsg',
    },
    ConvertVmInstanceToTemplatedVmInstance: {
      name: 'ConvertVmInstanceToTemplatedVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.ConvertVmInstanceToTemplatedVmInstance', defaultMessage: 'ConvertVmInstanceToTemplatedVmInstance' }),
      api: 'org.zstack.header.vm.APIConvertVmInstanceToTemplatedVmInstanceMsg',
    },
    CreateDataVolumeTemplateFromVolume: {
      name: 'CreateDataVolumeTemplateFromVolume',
      description: intl.formatMessage({ id: 'apiModel.api.CreateDataVolumeTemplateFromVolume', defaultMessage: 'CreateDataVolumeTemplateFromVolume' }),
      api: 'org.zstack.header.image.APICreateDataVolumeTemplateFromVolumeMsg',
    },
    CreateRootVolumeTemplateFromRootVolume: {
      name: 'CreateRootVolumeTemplateFromRootVolume',
      description: intl.formatMessage({ id: 'apiModel.api.CreateRootVolumeTemplateFromRootVolume', defaultMessage: 'CreateRootVolumeTemplateFromRootVolume' }),
      api: 'org.zstack.header.image.APICreateRootVolumeTemplateFromRootVolumeMsg',
    },
    CreateRootVolumeTemplateFromVolumeSnapshot: {
      name: 'CreateRootVolumeTemplateFromVolumeSnapshot',
      description: intl.formatMessage({ id: 'apiModel.api.CreateRootVolumeTemplateFromVolumeSnapshot', defaultMessage: 'CreateRootVolumeTemplateFromVolumeSnapshot' }),
      api: 'org.zstack.header.image.APICreateRootVolumeTemplateFromVolumeSnapshotMsg',
    },
    CreateTemplatedVmInstanceFromVmInstance: {
      name: 'CreateTemplatedVmInstanceFromVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.CreateTemplatedVmInstanceFromVmInstance', defaultMessage: 'CreateTemplatedVmInstanceFromVmInstance' }),
      api: 'org.zstack.header.vm.APICreateTemplatedVmInstanceFromVmInstanceMsg',
    },
    CreateVmInstanceFromTemplatedVmInstance: {
      name: 'CreateVmInstanceFromTemplatedVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVmInstanceFromTemplatedVmInstance', defaultMessage: 'CreateVmInstanceFromTemplatedVmInstance' }),
      api: 'org.zstack.header.vm.APICreateVmInstanceFromTemplatedVmInstanceMsg',
    },
    DeleteImage: {
      name: 'DeleteImage',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteImage', defaultMessage: 'DeleteImage' }),
      api: 'org.zstack.header.image.APIDeleteImageMsg',
    },
    DeleteTemplatedVmInstance: {
      name: 'DeleteTemplatedVmInstance',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteTemplatedVmInstance', defaultMessage: 'DeleteTemplatedVmInstance' }),
      api: 'org.zstack.header.vm.APIDeleteTemplatedVmInstanceMsg',
    },
    ExpungeImage: {
      name: 'ExpungeImage',
      description: intl.formatMessage({ id: 'apiModel.api.ExpungeImage', defaultMessage: 'ExpungeImage' }),
      api: 'org.zstack.header.image.APIExpungeImageMsg',
    },
    GetCandidateBackupStorageForCreatingImage: {
      name: 'GetCandidateBackupStorageForCreatingImage',
      description: intl.formatMessage({ id: 'apiModel.api.GetCandidateBackupStorageForCreatingImage', defaultMessage: 'GetCandidate Image Storage ForCreatingImage' }),
      api: 'org.zstack.header.image.APIGetCandidateBackupStorageForCreatingImageMsg',
    },
    GetImageQga: {
      name: 'GetImageQga',
      description: intl.formatMessage({ id: 'apiModel.api.GetImageQga', defaultMessage: 'GetImageQga' }),
      api: 'org.zstack.header.image.APIGetImageQgaMsg',
    },
    GetImagesFromImageStoreBackupStorage: {
      name: 'GetImagesFromImageStoreBackupStorage',
      description: intl.formatMessage({ id: 'apiModel.api.GetImagesFromImageStoreBackupStorage', defaultMessage: 'GetImagesFromImageStoreBackupStorage' }),
      api: 'org.zstack.storage.backup.imagestore.APIGetImagesFromImageStoreBackupStorageMsg',
    },
    QueryImage: {
      name: 'QueryImage',
      description: intl.formatMessage({ id: 'apiModel.api.QueryImage', defaultMessage: 'QueryImage' }),
      api: 'org.zstack.header.image.APIQueryImageMsg',
    },
    RecoverImage: {
      name: 'RecoverImage',
      description: intl.formatMessage({ id: 'apiModel.api.RecoverImage', defaultMessage: 'RecoverImage' }),
      api: 'org.zstack.header.image.APIRecoverImageMsg',
    },
    SetImageBootMode: {
      name: 'SetImageBootMode',
      description: intl.formatMessage({ id: 'apiModel.api.SetImageBootMode', defaultMessage: 'SetImageBootMode' }),
      api: 'org.zstack.header.image.APISetImageBootModeMsg',
    },
    SetImageQga: {
      name: 'SetImageQga',
      description: intl.formatMessage({ id: 'apiModel.api.SetImageQga', defaultMessage: 'SetImageQga' }),
      api: 'org.zstack.header.image.APISetImageQgaMsg',
    },
    SyncImageSize: {
      name: 'SyncImageSize',
      description: intl.formatMessage({ id: 'apiModel.api.SyncImageSize', defaultMessage: 'SyncImageSize' }),
      api: 'org.zstack.header.image.APISyncImageSizeMsg',
    },
    UpdateImage: {
      name: 'UpdateImage',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateImage', defaultMessage: 'UpdateImage' }),
      api: 'org.zstack.header.image.APIUpdateImageMsg',
    },
    UpdateImagePackage: {
      name: 'UpdateImagePackage',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateImagePackage', defaultMessage: 'UpdateImagePackage' }),
      api: 'org.zstack.ovf.api.APIUpdateImagePackageMsg',
    },
  }
}

export default api
