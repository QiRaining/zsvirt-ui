const api = (intl: any) => {
  return {
    AddSchedulerJobToSchedulerTrigger: {
      name: 'AddSchedulerJobToSchedulerTrigger',
      description: intl.formatMessage({ id: 'apiModel.api.AddSchedulerJobToSchedulerTrigger', defaultMessage: 'AddSchedulerJobToSchedulerTrigger' }),
      api: 'org.zstack.scheduler.APIAddSchedulerJobToSchedulerTriggerMsg',
    },
    ChangeSchedulerState: {
      name: 'ChangeSchedulerState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeSchedulerState', defaultMessage: 'ChangeSchedulerState' }),
      api: 'org.zstack.scheduler.APIChangeSchedulerStateMsg',
    },
    CreateSchedulerJob: {
      name: 'CreateSchedulerJob',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSchedulerJob', defaultMessage: 'CreateSchedulerJob' }),
      api: 'org.zstack.scheduler.APICreateSchedulerJobMsg',
    },
    CreateSchedulerTrigger: {
      name: 'CreateSchedulerTrigger',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSchedulerTrigger', defaultMessage: 'CreateSchedulerTrigger' }),
      api: 'org.zstack.scheduler.APICreateSchedulerTriggerMsg',
    },
    DeleteSchedulerJob: {
      name: 'DeleteSchedulerJob',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteSchedulerJob', defaultMessage: 'DeleteSchedulerJob' }),
      api: 'org.zstack.scheduler.APIDeleteSchedulerJobMsg',
    },
    DeleteSchedulerTrigger: {
      name: 'DeleteSchedulerTrigger',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteSchedulerTrigger', defaultMessage: 'DeleteSchedulerTrigger' }),
      api: 'org.zstack.scheduler.APIDeleteSchedulerTriggerMsg',
    },
    GetAvailableTriggers: {
      name: 'GetAvailableTriggers',
      description: intl.formatMessage({ id: 'apiModel.api.GetAvailableTriggers', defaultMessage: 'GetAvailableTriggers' }),
      api: 'org.zstack.scheduler.APIGetAvailableTriggersMsg',
    },
    GetNoTriggerSchedulerJobs: {
      name: 'GetNoTriggerSchedulerJobs',
      description: intl.formatMessage({ id: 'apiModel.api.GetNoTriggerSchedulerJobs', defaultMessage: 'GetNoTriggerSchedulerJobs' }),
      api: 'org.zstack.scheduler.APIGetNoTriggerSchedulerJobsMsg',
    },
    GetSchedulerExecutionReport: {
      name: 'GetSchedulerExecutionReport',
      description: intl.formatMessage({ id: 'apiModel.api.GetSchedulerExecutionReport', defaultMessage: 'GetSchedulerExecutionReport' }),
      api: 'org.zstack.scheduler.APIGetSchedulerExecutionReportMsg',
    },
    QuerySchedulerJob: {
      name: 'QuerySchedulerJob',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySchedulerJob', defaultMessage: 'QuerySchedulerJob' }),
      api: 'org.zstack.scheduler.APIQuerySchedulerJobMsg',
    },
    QuerySchedulerJobHistory: {
      name: 'QuerySchedulerJobHistory',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySchedulerJobHistory', defaultMessage: 'QuerySchedulerJobHistory' }),
      api: 'org.zstack.scheduler.APIQuerySchedulerJobHistoryMsg',
    },
    QuerySchedulerTrigger: {
      name: 'QuerySchedulerTrigger',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySchedulerTrigger', defaultMessage: 'QuerySchedulerTrigger' }),
      api: 'org.zstack.scheduler.APIQuerySchedulerTriggerMsg',
    },
    RemoveSchedulerJobFromSchedulerTrigger: {
      name: 'RemoveSchedulerJobFromSchedulerTrigger',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveSchedulerJobFromSchedulerTrigger', defaultMessage: 'RemoveSchedulerJobFromSchedulerTrigger' }),
      api: 'org.zstack.scheduler.APIRemoveSchedulerJobFromSchedulerTriggerMsg',
    },
    RunSchedulerTrigger: {
      name: 'RunSchedulerTrigger',
      description: intl.formatMessage({ id: 'apiModel.api.RunSchedulerTrigger', defaultMessage: 'RunSchedulerTrigger' }),
      api: 'org.zstack.scheduler.APIRunSchedulerTriggerMsg',
    },
    UpdateSchedulerJob: {
      name: 'UpdateSchedulerJob',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSchedulerJob', defaultMessage: 'UpdateSchedulerJob' }),
      api: 'org.zstack.scheduler.APIUpdateSchedulerJobMsg',
    },
    UpdateSchedulerTrigger: {
      name: 'UpdateSchedulerTrigger',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSchedulerTrigger', defaultMessage: 'UpdateSchedulerTrigger' }),
      api: 'org.zstack.scheduler.APIUpdateSchedulerTriggerMsg',
    },
  }
}

export default api
