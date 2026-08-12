const api = (intl: any) => {
  return {
    AddSchedulerJobGroupToSchedulerTrigger: {
      name: 'AddSchedulerJobGroupToSchedulerTrigger',
      description: intl.formatMessage({ id: 'apiModel.api.AddSchedulerJobGroupToSchedulerTrigger', defaultMessage: 'AddSchedulerJobGroupToSchedulerTrigger' }),
      api: 'org.zstack.scheduler.APIAddSchedulerJobGroupToSchedulerTriggerMsg',
    },
    AddSchedulerJobsToSchedulerJobGroup: {
      name: 'AddSchedulerJobsToSchedulerJobGroup',
      description: intl.formatMessage({ id: 'apiModel.api.AddSchedulerJobsToSchedulerJobGroup', defaultMessage: 'AddSchedulerJobsToSchedulerJobGroup' }),
      api: 'org.zstack.scheduler.APIAddSchedulerJobsToSchedulerJobGroupMsg',
    },
    CreateDataVolumeFromVolumeBackup: {
      name: 'CreateDataVolumeFromVolumeBackup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateDataVolumeFromVolumeBackup', defaultMessage: 'CreateDataVolumeFromVolumeBackup' }),
      api: 'org.zstack.header.storage.volume.backup.APICreateDataVolumeFromVolumeBackupMsg',
    },
    CreateDataVolumeTemplateFromVolumeBackup: {
      name: 'CreateDataVolumeTemplateFromVolumeBackup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateDataVolumeTemplateFromVolumeBackup', defaultMessage: 'CreateDataVolumeTemplateFromVolumeBackup' }),
      api: 'org.zstack.header.storage.volume.backup.APICreateDataVolumeTemplateFromVolumeBackupMsg',
    },
    CreateRootVolumeTemplateFromVolumeBackup: {
      name: 'CreateRootVolumeTemplateFromVolumeBackup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateRootVolumeTemplateFromVolumeBackup', defaultMessage: 'CreateRootVolumeTemplateFromVolumeBackup' }),
      api: 'org.zstack.header.storage.volume.backup.APICreateRootVolumeTemplateFromVolumeBackupMsg',
    },
    CreateSchedulerJobGroup: {
      name: 'CreateSchedulerJobGroup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSchedulerJobGroup', defaultMessage: 'CreateSchedulerJobGroup' }),
      api: 'org.zstack.scheduler.APICreateSchedulerJobGroupMsg',
    },
    CreateVmBackup: {
      name: 'CreateVmBackup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVmBackup', defaultMessage: 'CreateVmBackup' }),
      api: 'org.zstack.header.storage.volume.backup.APICreateVmBackupMsg',
    },
    CreateVmFromVmBackup: {
      name: 'CreateVmFromVmBackup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVmFromVmBackup', defaultMessage: 'CreateVmFromVmBackup' }),
      api: 'org.zstack.header.storage.volume.backup.APICreateVmFromVmBackupMsg',
    },
    CreateVmFromVolumeBackup: {
      name: 'CreateVmFromVolumeBackup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVmFromVolumeBackup', defaultMessage: 'CreateVmFromVolumeBackup' }),
      api: 'org.zstack.header.storage.volume.backup.APICreateVmFromVolumeBackupMsg',
    },
    CreateVolumeBackup: {
      name: 'CreateVolumeBackup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVolumeBackup', defaultMessage: 'CreateVolumeBackup' }),
      api: 'org.zstack.header.storage.volume.backup.APICreateVolumeBackupMsg',
    },
    DeleteSchedulerJobGroup: {
      name: 'DeleteSchedulerJobGroup',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteSchedulerJobGroup', defaultMessage: 'DeleteSchedulerJobGroup' }),
      api: 'org.zstack.scheduler.APIDeleteSchedulerJobGroupMsg',
    },
    DeleteVmBackup: {
      name: 'DeleteVmBackup',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVmBackup', defaultMessage: 'DeleteVmBackup' }),
      api: 'org.zstack.header.storage.volume.backup.APIDeleteVmBackupMsg',
    },
    DeleteVolumeBackup: {
      name: 'DeleteVolumeBackup',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVolumeBackup', defaultMessage: 'DeleteVolumeBackup' }),
      api: 'org.zstack.header.storage.volume.backup.APIDeleteVolumeBackupMsg',
    },
    QuerySchedulerJobGroup: {
      name: 'QuerySchedulerJobGroup',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySchedulerJobGroup', defaultMessage: 'QuerySchedulerJobGroup' }),
      api: 'org.zstack.scheduler.APIQuerySchedulerJobGroupMsg',
    },
    QueryVolumeBackup: {
      name: 'QueryVolumeBackup',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVolumeBackup', defaultMessage: 'QueryVolumeBackup' }),
      api: 'org.zstack.header.storage.volume.backup.APIQueryVolumeBackupMsg',
    },
    RecoverBackupFromImageStoreBackupStorage: {
      name: 'RecoverBackupFromImageStoreBackupStorage',
      description: intl.formatMessage({ id: 'apiModel.api.RecoverBackupFromImageStoreBackupStorage', defaultMessage: 'RecoverBackupFromImageStore Image Storage ' }),
      api: 'org.zstack.header.storage.volume.backup.APIRecoverBackupFromImageStoreBackupStorageMsg',
    },
    RecoverVmBackupFromImageStoreBackupStorage: {
      name: 'RecoverVmBackupFromImageStoreBackupStorage',
      description: intl.formatMessage({ id: 'apiModel.api.RecoverVmBackupFromImageStoreBackupStorage', defaultMessage: 'RecoverVmBackupFromImageStore Image Storage ' }),
      api: 'org.zstack.header.storage.volume.backup.APIRecoverVmBackupFromImageStoreBackupStorageMsg',
    },
    RemoveSchedulerJobGroupFromSchedulerTrigger: {
      name: 'RemoveSchedulerJobGroupFromSchedulerTrigger',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveSchedulerJobGroupFromSchedulerTrigger', defaultMessage: 'RemoveSchedulerJobGroupFromSchedulerTrigger' }),
      api: 'org.zstack.scheduler.APIRemoveSchedulerJobGroupFromSchedulerTriggerMsg',
    },
    RemoveSchedulerJobsFromSchedulerJobGroup: {
      name: 'RemoveSchedulerJobsFromSchedulerJobGroup',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveSchedulerJobsFromSchedulerJobGroup', defaultMessage: 'RemoveSchedulerJobsFromSchedulerJobGroup' }),
      api: 'org.zstack.scheduler.APIRemoveSchedulerJobsFromSchedulerJobGroupMsg',
    },
    RevertVmFromVmBackup: {
      name: 'RevertVmFromVmBackup',
      description: intl.formatMessage({ id: 'apiModel.api.RevertVmFromVmBackup', defaultMessage: 'RevertVmFromVmBackup' }),
      api: 'org.zstack.header.storage.volume.backup.APIRevertVmFromVmBackupMsg',
    },
    RevertVolumeFromVolumeBackup: {
      name: 'RevertVolumeFromVolumeBackup',
      description: intl.formatMessage({ id: 'apiModel.api.RevertVolumeFromVolumeBackup', defaultMessage: 'RevertVolumeFromVolumeBackup' }),
      api: 'org.zstack.header.storage.volume.backup.APIRevertVolumeFromVolumeBackupMsg',
    },
    SyncBackupFromImageStoreBackupStorage: {
      name: 'SyncBackupFromImageStoreBackupStorage',
      description: intl.formatMessage({ id: 'apiModel.api.SyncBackupFromImageStoreBackupStorage', defaultMessage: 'SyncBackupFromImageStore Image Storage ' }),
      api: 'org.zstack.header.storage.volume.backup.APISyncBackupFromImageStoreBackupStorageMsg',
    },
    SyncVmBackupFromImageStoreBackupStorage: {
      name: 'SyncVmBackupFromImageStoreBackupStorage',
      description: intl.formatMessage({ id: 'apiModel.api.SyncVmBackupFromImageStoreBackupStorage', defaultMessage: 'SyncVmBackupFromImageStore Image Storage ' }),
      api: 'org.zstack.header.storage.volume.backup.APISyncVmBackupFromImageStoreBackupStorageMsg',
    },
    UpdateSchedulerJobGroup: {
      name: 'UpdateSchedulerJobGroup',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSchedulerJobGroup', defaultMessage: 'UpdateSchedulerJobGroup' }),
      api: 'org.zstack.scheduler.APIUpdateSchedulerJobGroupMsg',
    },
  }
}

export default api
