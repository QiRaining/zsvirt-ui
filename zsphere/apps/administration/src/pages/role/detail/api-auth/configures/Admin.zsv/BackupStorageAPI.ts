const api = (intl: any) => {
  return {
    DeleteExportedImageFromBackupStorage: {
      name: 'DeleteExportedImageFromBackupStorage',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteExportedImageFromBackupStorage', defaultMessage: 'DeleteExportedImageFromBackupStorage' }),
      api: 'org.zstack.header.storage.backup.APIDeleteExportedImageFromBackupStorageMsg',
    },
    ExportImageFromBackupStorage: {
      name: 'ExportImageFromBackupStorage',
      description: intl.formatMessage({ id: 'apiModel.api.ExportImageFromBackupStorage', defaultMessage: 'ExportImageFromBackupStorage' }),
      api: 'org.zstack.header.storage.backup.APIExportImageFromBackupStorageMsg',
    },
    QueryBackupStorage: {
      name: 'QueryBackupStorage',
      description: intl.formatMessage({ id: 'apiModel.api.QueryBackupStorage', defaultMessage: 'QueryBackupStorage' }),
      api: 'org.zstack.header.storage.backup.APIQueryBackupStorageMsg',
    },
    QueryCephBackupStorage: {
      name: 'QueryCephBackupStorage',
      description: intl.formatMessage({ id: 'apiModel.api.QueryCephBackupStorage', defaultMessage: 'QueryCephBackupStorage' }),
      api: 'org.zstack.storage.ceph.backup.APIQueryCephBackupStorageMsg',
    },
    QueryImageStoreBackupStorage: {
      name: 'QueryImageStoreBackupStorage',
      description: intl.formatMessage({ id: 'apiModel.api.QueryImageStoreBackupStorage', defaultMessage: 'QueryImageStoreBackupStorage' }),
      api: 'org.zstack.storage.backup.imagestore.APIQueryImageStoreBackupStorageMsg',
    },
  }
}

export default api
