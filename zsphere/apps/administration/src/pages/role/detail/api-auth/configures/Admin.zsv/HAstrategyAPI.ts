const api = (intl: any) => {
  return {
    UpdateHaStrategyCondition: {
      name: 'UpdateHaStrategyCondition',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateHaStrategyCondition', defaultMessage: 'UpdateHaStrategyCondition' }),
      api: 'org.zstack.ha.APIUpdateHaStrategyConditionMsg',
    },
  }
}

export default api
