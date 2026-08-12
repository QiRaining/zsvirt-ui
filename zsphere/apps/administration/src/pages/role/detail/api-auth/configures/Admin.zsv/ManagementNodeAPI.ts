const api = (intl: any) => {
  return {
    IsReadyToGo: {
      name: 'IsReadyToGo',
      description: intl.formatMessage({ id: 'apiModel.api.IsReadyToGo', defaultMessage: 'IsReadyToGo' }),
      api: 'org.zstack.header.apimediator.APIIsReadyToGoMsg',
    },
  }
}

export default api
