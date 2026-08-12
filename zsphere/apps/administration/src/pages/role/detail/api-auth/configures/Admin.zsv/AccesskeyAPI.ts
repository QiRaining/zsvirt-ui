const api = (intl: any) => {
  return {
    ChangeAccessKeyState: {
      name: 'ChangeAccessKeyState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeAccessKeyState', defaultMessage: 'ChangeAccessKeyState' }),
      api: 'org.zstack.accessKey.APIChangeAccessKeyStateMsg',
    },
    CreateAccessKey: {
      name: 'CreateAccessKey',
      description: intl.formatMessage({ id: 'apiModel.api.CreateAccessKey', defaultMessage: 'CreateAccessKey' }),
      api: 'org.zstack.accessKey.APICreateAccessKeyMsg',
    },
    DeleteAccessKey: {
      name: 'DeleteAccessKey',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteAccessKey', defaultMessage: 'DeleteAccessKey' }),
      api: 'org.zstack.accessKey.APIDeleteAccessKeyMsg',
    },
    QueryAccessKey: {
      name: 'QueryAccessKey',
      description: intl.formatMessage({ id: 'apiModel.api.QueryAccessKey', defaultMessage: 'QueryAccessKey' }),
      api: 'org.zstack.accessKey.APIQueryAccessKeyMsg',
    },
  }
}

export default api
