const api = (intl: any) => {
  return {
    LocalStorageGetVolumeMigratableHosts: {
      name: 'LocalStorageGetVolumeMigratableHosts',
      description: intl.formatMessage({ id: 'apiModel.api.LocalStorageGetVolumeMigratableHosts', defaultMessage: 'LocalStorageGetVolumeMigratableHosts' }),
      api: 'org.zstack.storage.primary.local.APILocalStorageGetVolumeMigratableHostsMsg',
    },
    LocalStorageMigrateVolume: {
      name: 'LocalStorageMigrateVolume',
      description: intl.formatMessage({ id: 'apiModel.api.LocalStorageMigrateVolume', defaultMessage: 'LocalStorageMigrateVolume' }),
      api: 'org.zstack.storage.primary.local.APILocalStorageMigrateVolumeMsg',
    },
    QueryLocalStorageResourceRef: {
      name: 'QueryLocalStorageResourceRef',
      description: intl.formatMessage({ id: 'apiModel.api.QueryLocalStorageResourceRef', defaultMessage: 'QueryLocalStorageResourceRef' }),
      api: 'org.zstack.storage.primary.local.APIQueryLocalStorageResourceRefMsg',
    },
    QueryPrimaryStorage: {
      name: 'QueryPrimaryStorage',
      description: intl.formatMessage({ id: 'apiModel.api.QueryPrimaryStorage', defaultMessage: 'QueryPrimaryStorage' }),
      api: 'org.zstack.header.storage.primary.APIQueryPrimaryStorageMsg',
    },
    QueryScsiLun: {
      name: 'QueryScsiLun',
      description: intl.formatMessage({ id: 'apiModel.api.QueryScsiLun', defaultMessage: 'QueryScsiLun' }),
      api: 'org.zstack.header.storageDevice.APIQueryScsiLunMsg',
    },
  }
}

export default api
