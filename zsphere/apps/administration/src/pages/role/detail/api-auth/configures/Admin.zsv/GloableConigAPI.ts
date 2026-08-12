const api = (intl: any) => {
  return {
    DeleteResourceConfig: {
      name: 'DeleteResourceConfig',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteResourceConfig', defaultMessage: 'DeleteResourceConfig' }),
      api: 'org.zstack.resourceconfig.APIDeleteResourceConfigMsg',
    },
    GetResourceBindableConfig: {
      name: 'GetResourceBindableConfig',
      description: intl.formatMessage({ id: 'apiModel.api.GetResourceBindableConfig', defaultMessage: 'GetResourceBindableConfig' }),
      api: 'org.zstack.resourceconfig.APIGetResourceBindableConfigMsg',
    },
    GetResourceConfig: {
      name: 'GetResourceConfig',
      description: intl.formatMessage({ id: 'apiModel.api.GetResourceConfig', defaultMessage: 'GetResourceConfig' }),
      api: 'org.zstack.resourceconfig.APIGetResourceConfigMsg',
    },
    QueryGlobalConfig: {
      name: 'QueryGlobalConfig',
      description: intl.formatMessage({ id: 'apiModel.api.QueryGlobalConfig', defaultMessage: 'QueryGlobalConfig' }),
      api: 'org.zstack.core.config.APIQueryGlobalConfigMsg',
    },
    QueryResourceConfig: {
      name: 'QueryResourceConfig',
      description: intl.formatMessage({ id: 'apiModel.api.QueryResourceConfig', defaultMessage: 'QueryResourceConfig' }),
      api: 'org.zstack.resourceconfig.APIQueryResourceConfigMsg',
    },
    UpdateResourceConfig: {
      name: 'UpdateResourceConfig',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateResourceConfig', defaultMessage: 'UpdateResourceConfig' }),
      api: 'org.zstack.resourceconfig.APIUpdateResourceConfigMsg',
    },
  }
}

export default api
