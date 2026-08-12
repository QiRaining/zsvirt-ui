const api = (intl: any) => {
  return {
    RequestConsoleAccess: {
      name: 'RequestConsoleAccess',
      description: intl.formatMessage({ id: 'apiModel.api.RequestConsoleAccess', defaultMessage: 'RequestConsoleAccess' }),
      api: 'org.zstack.header.console.APIRequestConsoleAccessMsg',
    },
  }
}

export default api
