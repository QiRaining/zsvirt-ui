const api = (intl: any) => {
  return {
    GetLicenseCapabilities: {
      name: 'GetLicenseCapabilities',
      description: intl.formatMessage({ id: 'apiModel.api.GetLicenseCapabilities', defaultMessage: 'GetLicenseCapabilities' }),
      api: 'org.zstack.license.APIGetLicenseCapabilitiesMsg',
    },
  }
}

export default api
