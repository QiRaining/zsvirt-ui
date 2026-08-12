const api = (intl: any) => {
  return {
    QueryCluster: {
      name: 'QueryCluster',
      description: intl.formatMessage({ id: 'apiModel.api.QueryCluster', defaultMessage: 'QueryCluster' }),
      api: 'org.zstack.header.cluster.APIQueryClusterMsg',
    },
    QueryZone: {
      name: 'QueryZone',
      description: intl.formatMessage({ id: 'apiModel.api.QueryZone', defaultMessage: 'QueryZone' }),
      api: 'org.zstack.header.zone.APIQueryZoneMsg',
    },
  }
}

export default api
