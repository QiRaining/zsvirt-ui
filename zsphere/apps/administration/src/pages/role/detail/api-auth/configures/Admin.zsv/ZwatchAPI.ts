const api = (intl: any) => {
  return {
    AckAlarmData: {
      name: 'AckAlarmData',
      description: intl.formatMessage({ id: 'apiModel.api.AckAlarmData', defaultMessage: 'AckAlarmData' }),
      api: 'org.zstack.zwatch.alarm.APIAckAlarmDataMsg',
    },
    AckAlertData: {
      name: 'AckAlertData',
      description: intl.formatMessage({ id: 'apiModel.api.AckAlertData', defaultMessage: 'AckAlertData' }),
      api: 'org.zstack.zwatch.alarm.APIAckAlertDataMsg',
    },
    AckEventData: {
      name: 'AckEventData',
      description: intl.formatMessage({ id: 'apiModel.api.AckEventData', defaultMessage: 'AckEventData' }),
      api: 'org.zstack.zwatch.alarm.APIAckEventDataMsg',
    },
    AddActionToAlarm: {
      name: 'AddActionToAlarm',
      description: intl.formatMessage({ id: 'apiModel.api.AddActionToAlarm', defaultMessage: 'AddActionToAlarm' }),
      api: 'org.zstack.zwatch.alarm.APIAddActionToAlarmMsg',
    },
    AddActionToEventSubscription: {
      name: 'AddActionToEventSubscription',
      description: intl.formatMessage({ id: 'apiModel.api.AddActionToEventSubscription', defaultMessage: 'AddActionToEventSubscription' }),
      api: 'org.zstack.zwatch.alarm.APIAddActionToEventSubscriptionMsg',
    },
    AddEmailAddressToSNSEmailEndpoint: {
      name: 'AddEmailAddressToSNSEmailEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.AddEmailAddressToSNSEmailEndpoint', defaultMessage: 'AddEmailAddressToSNSEmailEndpoint' }),
      api: 'org.zstack.sns.platform.email.APIAddEmailAddressToSNSEmailEndpointMsg',
    },
    AddEventRuleTemplate: {
      name: 'AddEventRuleTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.AddEventRuleTemplate', defaultMessage: 'AddEventRuleTemplate' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIAddEventRuleTemplateMsg',
    },
    AddInstanceToMonitorGroup: {
      name: 'AddInstanceToMonitorGroup',
      description: intl.formatMessage({ id: 'apiModel.api.AddInstanceToMonitorGroup', defaultMessage: 'AddInstanceToMonitorGroup' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIAddInstanceToMonitorGroupMsg',
    },
    AddLabelToAlarm: {
      name: 'AddLabelToAlarm',
      description: intl.formatMessage({ id: 'apiModel.api.AddLabelToAlarm', defaultMessage: 'AddLabelToAlarm' }),
      api: 'org.zstack.zwatch.alarm.APIAddLabelToAlarmMsg',
    },
    AddLabelToEventSubscription: {
      name: 'AddLabelToEventSubscription',
      description: intl.formatMessage({ id: 'apiModel.api.AddLabelToEventSubscription', defaultMessage: 'AddLabelToEventSubscription' }),
      api: 'org.zstack.zwatch.alarm.APIAddLabelToEventSubscriptionMsg',
    },
    AddMetricRuleTemplate: {
      name: 'AddMetricRuleTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.AddMetricRuleTemplate', defaultMessage: 'AddMetricRuleTemplate' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIAddMetricRuleTemplateMsg',
    },
    AddSNSDingTalkAtPerson: {
      name: 'AddSNSDingTalkAtPerson',
      description: intl.formatMessage({ id: 'apiModel.api.AddSNSDingTalkAtPerson', defaultMessage: 'AddSNSDingTalkAtPerson' }),
      api: 'org.zstack.sns.platform.dingtalk.APIAddSNSDingTalkAtPersonMsg',
    },
    AddSNSFeiShuAtPerson: {
      name: 'AddSNSFeiShuAtPerson',
      description: intl.formatMessage({ id: 'apiModel.api.AddSNSFeiShuAtPerson', defaultMessage: 'AddSNSFeiShuAtPerson' }),
      api: 'org.zstack.sns.platform.feishu.APIAddSNSFeiShuAtPersonMsg',
    },
    AddSNSSmsReceiver: {
      name: 'AddSNSSmsReceiver',
      description: intl.formatMessage({ id: 'apiModel.api.AddSNSSmsReceiver', defaultMessage: 'AddSNSSmsReceiver' }),
      api: 'org.zstack.sns.APIAddSNSSmsReceiverMsg',
    },
    AddSNSWeComAtPerson: {
      name: 'AddSNSWeComAtPerson',
      description: intl.formatMessage({ id: 'apiModel.api.AddSNSWeComAtPerson', defaultMessage: 'AddSNSWeComAtPerson' }),
      api: 'org.zstack.sns.platform.wecom.APIAddSNSWeComAtPersonMsg',
    },
    AddThirdpartyPlatform: {
      name: 'AddThirdpartyPlatform',
      description: intl.formatMessage({ id: 'apiModel.api.AddThirdpartyPlatform', defaultMessage: 'AddThirdpartyPlatform' }),
      api: 'org.zstack.zwatch.thirdparty.api.APIAddThirdpartyPlatformMsg',
    },
    ApplyMonitorTemplateToMonitorGroup: {
      name: 'ApplyMonitorTemplateToMonitorGroup',
      description: intl.formatMessage({ id: 'apiModel.api.ApplyMonitorTemplateToMonitorGroup', defaultMessage: 'ApplyMonitorTemplateToMonitorGroup' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIApplyMonitorTemplateToMonitorGroupMsg',
    },
    ChangeActiveAlarmState: {
      name: 'ChangeActiveAlarmState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeActiveAlarmState', defaultMessage: 'ChangeActiveAlarmState' }),
      api: 'org.zstack.zwatch.alarm.activealarm.api.APIChangeActiveAlarmStateMsg',
    },
    ChangeAlarmState: {
      name: 'ChangeAlarmState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeAlarmState', defaultMessage: 'ChangeAlarmState' }),
      api: 'org.zstack.zwatch.alarm.APIChangeAlarmStateMsg',
    },
    ChangeEventSubscriptionState: {
      name: 'ChangeEventSubscriptionState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeEventSubscriptionState', defaultMessage: 'ChangeEventSubscriptionState' }),
      api: 'org.zstack.zwatch.alarm.APIChangeEventSubscriptionStateMsg',
    },
    ChangeSNSApplicationEndpointState: {
      name: 'ChangeSNSApplicationEndpointState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeSNSApplicationEndpointState', defaultMessage: 'ChangeSNSApplicationEndpointState' }),
      api: 'org.zstack.sns.APIChangeSNSApplicationEndpointStateMsg',
    },
    ChangeSNSApplicationPlatformState: {
      name: 'ChangeSNSApplicationPlatformState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeSNSApplicationPlatformState', defaultMessage: 'ChangeSNSApplicationPlatformState' }),
      api: 'org.zstack.sns.APIChangeSNSApplicationPlatformStateMsg',
    },
    ChangeSNSTopicState: {
      name: 'ChangeSNSTopicState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeSNSTopicState', defaultMessage: 'ChangeSNSTopicState' }),
      api: 'org.zstack.sns.APIChangeSNSTopicStateMsg',
    },
    CloneMonitorTemplate: {
      name: 'CloneMonitorTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.CloneMonitorTemplate', defaultMessage: 'CloneMonitorTemplate' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APICloneMonitorTemplateMsg',
    },
    CreateAlarm: {
      name: 'CreateAlarm',
      description: intl.formatMessage({ id: 'apiModel.api.CreateAlarm', defaultMessage: 'CreateAlarm' }),
      api: 'org.zstack.zwatch.alarm.APICreateAlarmMsg',
    },
    CreateAliyunSmsSNSTextTemplate: {
      name: 'CreateAliyunSmsSNSTextTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.CreateAliyunSmsSNSTextTemplate', defaultMessage: 'CreateAliyunSmsSNSTextTemplate' }),
      api: 'org.zstack.zwatch.alarm.sns.template.aliyunsms.APICreateAliyunSmsSNSTextTemplateMsg',
    },
    CreateMetricDataHttpReceiver: {
      name: 'CreateMetricDataHttpReceiver',
      description: intl.formatMessage({ id: 'apiModel.api.CreateMetricDataHttpReceiver', defaultMessage: 'CreateMetricDataHttpReceiver' }),
      api: 'org.zstack.zwatch.api.APICreateMetricDataHttpReceiverMsg',
    },
    CreateMetricTemplate: {
      name: 'CreateMetricTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.CreateMetricTemplate', defaultMessage: 'CreateMetricTemplate' }),
      api: 'org.zstack.zwatch.api.APICreateMetricTemplateMsg',
    },
    CreateMonitorGroup: {
      name: 'CreateMonitorGroup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateMonitorGroup', defaultMessage: 'CreateMonitorGroup' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APICreateMonitorGroupMsg',
    },
    CreateMonitorTemplate: {
      name: 'CreateMonitorTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.CreateMonitorTemplate', defaultMessage: 'CreateMonitorTemplate' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APICreateMonitorTemplateMsg',
    },
    CreateSNSDingTalkEndpoint: {
      name: 'CreateSNSDingTalkEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSNSDingTalkEndpoint', defaultMessage: 'CreateSNSDingTalkEndpoint' }),
      api: 'org.zstack.sns.platform.dingtalk.APICreateSNSDingTalkEndpointMsg',
    },
    CreateSNSEmailEndpoint: {
      name: 'CreateSNSEmailEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSNSEmailEndpoint', defaultMessage: 'CreateSNSEmailEndpoint' }),
      api: 'org.zstack.sns.platform.email.APICreateSNSEmailEndpointMsg',
    },
    CreateSNSEmailPlatform: {
      name: 'CreateSNSEmailPlatform',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSNSEmailPlatform', defaultMessage: 'CreateSNSEmailPlatform' }),
      api: 'org.zstack.sns.platform.email.APICreateSNSEmailPlatformMsg',
    },
    CreateSNSFeiShuEndpoint: {
      name: 'CreateSNSFeiShuEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSNSFeiShuEndpoint', defaultMessage: 'CreateSNSFeiShuEndpoint' }),
      api: 'org.zstack.sns.platform.feishu.APICreateSNSFeiShuEndpointMsg',
    },
    CreateSNSHttpEndpoint: {
      name: 'CreateSNSHttpEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSNSHttpEndpoint', defaultMessage: 'CreateSNSHttpEndpoint' }),
      api: 'org.zstack.sns.platform.http.APICreateSNSHttpEndpointMsg',
    },
    CreateSNSMicrosoftTeamsEndpoint: {
      name: 'CreateSNSMicrosoftTeamsEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSNSMicrosoftTeamsEndpoint', defaultMessage: 'CreateSNSMicrosoftTeamsEndpoint' }),
      api: 'org.zstack.sns.platform.microsoftteams.APICreateSNSMicrosoftTeamsEndpointMsg',
    },
    CreateSNSSnmpEndpoint: {
      name: 'CreateSNSSnmpEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSNSSnmpEndpoint', defaultMessage: 'CreateSNSSnmpEndpoint' }),
      api: 'org.zstack.sns.platform.snmp.APICreateSNSSnmpEndpointMsg',
    },
    CreateSNSSnmpPlatform: {
      name: 'CreateSNSSnmpPlatform',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSNSSnmpPlatform', defaultMessage: 'CreateSNSSnmpPlatform' }),
      api: 'org.zstack.sns.platform.snmp.APICreateSNSSnmpPlatformMsg',
    },
    CreateSNSTextTemplate: {
      name: 'CreateSNSTextTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSNSTextTemplate', defaultMessage: 'CreateSNSTextTemplate' }),
      api: 'org.zstack.zwatch.alarm.sns.APICreateSNSTextTemplateMsg',
    },
    CreateSNSTopic: {
      name: 'CreateSNSTopic',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSNSTopic', defaultMessage: 'CreateSNSTopic' }),
      api: 'org.zstack.sns.APICreateSNSTopicMsg',
    },
    CreateSNSWeComEndpoint: {
      name: 'CreateSNSWeComEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSNSWeComEndpoint', defaultMessage: 'CreateSNSWeComEndpoint' }),
      api: 'org.zstack.sns.platform.wecom.APICreateSNSWeComEndpointMsg',
    },
    DeleteAlarm: {
      name: 'DeleteAlarm',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteAlarm', defaultMessage: 'DeleteAlarm' }),
      api: 'org.zstack.zwatch.alarm.APIDeleteAlarmMsg',
    },
    DeleteEmailAddressOfSNSEmailEndpoint: {
      name: 'DeleteEmailAddressOfSNSEmailEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteEmailAddressOfSNSEmailEndpoint', defaultMessage: 'DeleteEmailAddressOfSNSEmailEndpoint' }),
      api: 'org.zstack.sns.platform.email.APIDeleteEmailAddressOfSNSEmailEndpointMsg',
    },
    DeleteEventRuleTemplate: {
      name: 'DeleteEventRuleTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteEventRuleTemplate', defaultMessage: 'DeleteEventRuleTemplate' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIDeleteEventRuleTemplateMsg',
    },
    DeleteMetricData: {
      name: 'DeleteMetricData',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteMetricData', defaultMessage: 'DeleteMetricData' }),
      api: 'org.zstack.zwatch.api.APIDeleteMetricDataMsg',
    },
    DeleteMetricDataHttpReceiver: {
      name: 'DeleteMetricDataHttpReceiver',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteMetricDataHttpReceiver', defaultMessage: 'DeleteMetricDataHttpReceiver' }),
      api: 'org.zstack.zwatch.api.APIDeleteMetricDataHttpReceiverMsg',
    },
    DeleteMetricRuleTemplate: {
      name: 'DeleteMetricRuleTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteMetricRuleTemplate', defaultMessage: 'DeleteMetricRuleTemplate' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIDeleteMetricRuleTemplateMsg',
    },
    DeleteMetricTemplate: {
      name: 'DeleteMetricTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteMetricTemplate', defaultMessage: 'DeleteMetricTemplate' }),
      api: 'org.zstack.zwatch.api.APIDeleteMetricTemplateMsg',
    },
    DeleteMonitorGroup: {
      name: 'DeleteMonitorGroup',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteMonitorGroup', defaultMessage: 'DeleteMonitorGroup' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIDeleteMonitorGroupMsg',
    },
    DeleteMonitorTemplate: {
      name: 'DeleteMonitorTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteMonitorTemplate', defaultMessage: 'DeleteMonitorTemplate' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIDeleteMonitorTemplateMsg',
    },
    DeleteSNSApplicationEndpoint: {
      name: 'DeleteSNSApplicationEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteSNSApplicationEndpoint', defaultMessage: 'DeleteSNSApplicationEndpoint' }),
      api: 'org.zstack.sns.APIDeleteSNSApplicationEndpointMsg',
    },
    DeleteSNSApplicationPlatform: {
      name: 'DeleteSNSApplicationPlatform',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteSNSApplicationPlatform', defaultMessage: 'DeleteSNSApplicationPlatform' }),
      api: 'org.zstack.sns.APIDeleteSNSApplicationPlatformMsg',
    },
    DeleteSNSTextTemplate: {
      name: 'DeleteSNSTextTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteSNSTextTemplate', defaultMessage: 'DeleteSNSTextTemplate' }),
      api: 'org.zstack.zwatch.alarm.sns.APIDeleteSNSTextTemplateMsg',
    },
    DeleteSNSTopic: {
      name: 'DeleteSNSTopic',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteSNSTopic', defaultMessage: 'DeleteSNSTopic' }),
      api: 'org.zstack.sns.APIDeleteSNSTopicMsg',
    },
    DeleteThirdpartyPlatform: {
      name: 'DeleteThirdpartyPlatform',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteThirdpartyPlatform', defaultMessage: 'DeleteThirdpartyPlatform' }),
      api: 'org.zstack.zwatch.thirdparty.api.APIDeleteThirdpartyPlatformMsg',
    },
    GetActiveAlarmStatus: {
      name: 'GetActiveAlarmStatus',
      description: intl.formatMessage({ id: 'apiModel.api.GetActiveAlarmStatus', defaultMessage: 'GetActiveAlarmStatus' }),
      api: 'org.zstack.zwatch.alarm.activealarm.api.APIGetActiveAlarmStatusMsg',
    },
    GetAllEventMetadata: {
      name: 'GetAllEventMetadata',
      description: intl.formatMessage({ id: 'apiModel.api.GetAllEventMetadata', defaultMessage: 'GetAllEventMetadata' }),
      api: 'org.zstack.zwatch.api.APIGetAllEventMetadataMsg',
    },
    GetAllMetricMetadata: {
      name: 'GetAllMetricMetadata',
      description: intl.formatMessage({ id: 'apiModel.api.GetAllMetricMetadata', defaultMessage: 'GetAllMetricMetadata' }),
      api: 'org.zstack.zwatch.api.APIGetAllMetricMetadataMsg',
    },
    GetAuditData: {
      name: 'GetAuditData',
      description: intl.formatMessage({ id: 'apiModel.api.GetAuditData', defaultMessage: 'GetAuditData' }),
      api: 'org.zstack.zwatch.api.APIGetAuditDataMsg',
    },
    GetManagementNodeDirCapacity: {
      name: 'GetManagementNodeDirCapacity',
      description: intl.formatMessage({ id: 'apiModel.api.GetManagementNodeDirCapacity', defaultMessage: 'GetManagementNodeDirCapacity' }),
      api: 'org.zstack.zwatch.api.APIGetManagementNodeDirCapacityMsg',
    },
    GetMetricData: {
      name: 'GetMetricData',
      description: intl.formatMessage({ id: 'apiModel.api.GetMetricData', defaultMessage: 'GetMetricData' }),
      api: 'org.zstack.zwatch.api.APIGetMetricDataMsg',
    },
    GetMetricLabelValue: {
      name: 'GetMetricLabelValue',
      description: intl.formatMessage({ id: 'apiModel.api.GetMetricLabelValue', defaultMessage: 'GetMetricLabelValue' }),
      api: 'org.zstack.zwatch.api.APIGetMetricLabelValueMsg',
    },
    GetTextTemplateArg: {
      name: 'GetTextTemplateArg',
      description: intl.formatMessage({ id: 'apiModel.api.GetTextTemplateArg', defaultMessage: 'GetTextTemplateArg' }),
      api: 'org.zstack.zwatch.alarm.APIGetTextTemplateArgMsg',
    },
    GetZWatchAlertHistogram: {
      name: 'GetZWatchAlertHistogram',
      description: intl.formatMessage({ id: 'apiModel.api.GetZWatchAlertHistogram', defaultMessage: 'GetZWatchAlertHistogram' }),
      api: 'org.zstack.zwatch.api.APIGetZWatchAlertHistogramMsg',
    },
    PutMetricData: {
      name: 'PutMetricData',
      description: intl.formatMessage({ id: 'apiModel.api.PutMetricData', defaultMessage: 'PutMetricData' }),
      api: 'org.zstack.zwatch.api.APIPutMetricDataMsg',
    },
    QueryActiveAlarm: {
      name: 'QueryActiveAlarm',
      description: intl.formatMessage({ id: 'apiModel.api.QueryActiveAlarm', defaultMessage: 'QueryActiveAlarm' }),
      api: 'org.zstack.zwatch.alarm.activealarm.api.APIQueryActiveAlarmMsg',
    },
    QueryActiveAlarmTemplate: {
      name: 'QueryActiveAlarmTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.QueryActiveAlarmTemplate', defaultMessage: 'QueryActiveAlarmTemplate' }),
      api: 'org.zstack.zwatch.alarm.activealarm.api.APIQueryActiveAlarmTemplateMsg',
    },
    QueryAlarm: {
      name: 'QueryAlarm',
      description: intl.formatMessage({ id: 'apiModel.api.QueryAlarm', defaultMessage: 'QueryAlarm' }),
      api: 'org.zstack.zwatch.alarm.APIQueryAlarmMsg',
    },
    QueryAlarmRecord: {
      name: 'QueryAlarmRecord',
      description: intl.formatMessage({ id: 'apiModel.api.QueryAlarmRecord', defaultMessage: 'QueryAlarmRecord' }),
      api: 'org.zstack.zwatch.api.APIQueryAlarmRecordMsg',
    },
    QueryAlertDataAck: {
      name: 'QueryAlertDataAck',
      description: intl.formatMessage({ id: 'apiModel.api.QueryAlertDataAck', defaultMessage: 'QueryAlertDataAck' }),
      api: 'org.zstack.zwatch.alarm.APIQueryAlertDataAckMsg',
    },
    QueryAliyunSmsSNSTextTemplate: {
      name: 'QueryAliyunSmsSNSTextTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.QueryAliyunSmsSNSTextTemplate', defaultMessage: 'QueryAliyunSmsSNSTextTemplate' }),
      api: 'org.zstack.zwatch.alarm.sns.template.aliyunsms.APIQueryAliyunSmsSNSTextTemplateMsg',
    },
    QueryEventRecord: {
      name: 'QueryEventRecord',
      description: intl.formatMessage({ id: 'apiModel.api.QueryEventRecord', defaultMessage: 'QueryEventRecord' }),
      api: 'org.zstack.zwatch.api.APIQueryEventRecordMsg',
    },
    QueryEventRuleTemplate: {
      name: 'QueryEventRuleTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.QueryEventRuleTemplate', defaultMessage: 'QueryEventRuleTemplate' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIQueryEventRuleTemplateMsg',
    },
    QueryEventSubscription: {
      name: 'QueryEventSubscription',
      description: intl.formatMessage({ id: 'apiModel.api.QueryEventSubscription', defaultMessage: 'QueryEventSubscription' }),
      api: 'org.zstack.zwatch.alarm.APIQueryEventSubscriptionMsg',
    },
    QueryMetricDataHttpReceiver: {
      name: 'QueryMetricDataHttpReceiver',
      description: intl.formatMessage({ id: 'apiModel.api.QueryMetricDataHttpReceiver', defaultMessage: 'QueryMetricDataHttpReceiver' }),
      api: 'org.zstack.zwatch.api.APIQueryMetricDataHttpReceiverMsg',
    },
    QueryMetricRuleTemplate: {
      name: 'QueryMetricRuleTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.QueryMetricRuleTemplate', defaultMessage: 'QueryMetricRuleTemplate' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIQueryMetricRuleTemplateMsg',
    },
    QueryMetricTemplate: {
      name: 'QueryMetricTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.QueryMetricTemplate', defaultMessage: 'QueryMetricTemplate' }),
      api: 'org.zstack.zwatch.api.APIQueryMetricTemplateMsg',
    },
    QueryMonitorGroup: {
      name: 'QueryMonitorGroup',
      description: intl.formatMessage({ id: 'apiModel.api.QueryMonitorGroup', defaultMessage: 'QueryMonitorGroup' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIQueryMonitorGroupMsg',
    },
    QueryMonitorGroupAlarm: {
      name: 'QueryMonitorGroupAlarm',
      description: intl.formatMessage({ id: 'apiModel.api.QueryMonitorGroupAlarm', defaultMessage: 'QueryMonitorGroupAlarm' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIQueryMonitorGroupAlarmMsg',
    },
    QueryMonitorGroupEventSubscription: {
      name: 'QueryMonitorGroupEventSubscription',
      description: intl.formatMessage({ id: 'apiModel.api.QueryMonitorGroupEventSubscription', defaultMessage: 'QueryMonitorGroupEventSubscription' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIQueryMonitorGroupEventSubscriptionMsg',
    },
    QueryMonitorGroupInstance: {
      name: 'QueryMonitorGroupInstance',
      description: intl.formatMessage({ id: 'apiModel.api.QueryMonitorGroupInstance', defaultMessage: 'QueryMonitorGroupInstance' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIQueryMonitorGroupInstanceMsg',
    },
    QueryMonitorGroupTemplateRef: {
      name: 'QueryMonitorGroupTemplateRef',
      description: intl.formatMessage({ id: 'apiModel.api.QueryMonitorGroupTemplateRef', defaultMessage: 'QueryMonitorGroupTemplateRef' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIQueryMonitorGroupTemplateRefMsg',
    },
    QueryMonitorTemplate: {
      name: 'QueryMonitorTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.QueryMonitorTemplate', defaultMessage: 'QueryMonitorTemplate' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIQueryMonitorTemplateMsg',
    },
    QuerySNSApplicationEndpoint: {
      name: 'QuerySNSApplicationEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSApplicationEndpoint', defaultMessage: 'QuerySNSApplicationEndpoint' }),
      api: 'org.zstack.sns.APIQuerySNSApplicationEndpointMsg',
    },
    QuerySNSApplicationPlatform: {
      name: 'QuerySNSApplicationPlatform',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSApplicationPlatform', defaultMessage: 'QuerySNSApplicationPlatform' }),
      api: 'org.zstack.sns.APIQuerySNSApplicationPlatformMsg',
    },
    QuerySNSDingTalkAtPerson: {
      name: 'QuerySNSDingTalkAtPerson',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSDingTalkAtPerson', defaultMessage: 'QuerySNSDingTalkAtPerson' }),
      api: 'org.zstack.sns.platform.dingtalk.APIQuerySNSDingTalkAtPersonMsg',
    },
    QuerySNSDingTalkEndpoint: {
      name: 'QuerySNSDingTalkEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSDingTalkEndpoint', defaultMessage: 'QuerySNSDingTalkEndpoint' }),
      api: 'org.zstack.sns.platform.dingtalk.APIQuerySNSDingTalkEndpointMsg',
    },
    QuerySNSEmailAddress: {
      name: 'QuerySNSEmailAddress',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSEmailAddress', defaultMessage: 'QuerySNSEmailAddress' }),
      api: 'org.zstack.sns.platform.email.APIQuerySNSEmailAddressMsg',
    },
    QuerySNSEmailEndpoint: {
      name: 'QuerySNSEmailEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSEmailEndpoint', defaultMessage: 'QuerySNSEmailEndpoint' }),
      api: 'org.zstack.sns.platform.email.APIQuerySNSEmailEndpointMsg',
    },
    QuerySNSEmailPlatform: {
      name: 'QuerySNSEmailPlatform',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSEmailPlatform', defaultMessage: 'QuerySNSEmailPlatform' }),
      api: 'org.zstack.sns.platform.email.APIQuerySNSEmailPlatformMsg',
    },
    QuerySNSEndpointThirdpartyAlertHistory: {
      name: 'QuerySNSEndpointThirdpartyAlertHistory',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSEndpointThirdpartyAlertHistory', defaultMessage: 'QuerySNSEndpointThirdpartyAlertHistory' }),
      api: 'org.zstack.zwatch.thirdparty.api.APIQuerySNSEndpointThirdpartyAlertHistoryMsg',
    },
    QuerySNSFeiShuAtPerson: {
      name: 'QuerySNSFeiShuAtPerson',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSFeiShuAtPerson', defaultMessage: 'QuerySNSFeiShuAtPerson' }),
      api: 'org.zstack.sns.platform.feishu.APIQuerySNSFeiShuAtPersonMsg',
    },
    QuerySNSFeiShuEndpoint: {
      name: 'QuerySNSFeiShuEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSFeiShuEndpoint', defaultMessage: 'QuerySNSFeiShuEndpoint' }),
      api: 'org.zstack.sns.platform.feishu.APIQuerySNSFeiShuEndpointMsg',
    },
    QuerySNSHttpEndpoint: {
      name: 'QuerySNSHttpEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSHttpEndpoint', defaultMessage: 'QuerySNSHttpEndpoint' }),
      api: 'org.zstack.sns.platform.http.APIQuerySNSHttpEndpointMsg',
    },
    QuerySNSMicrosoftTeamsEndpoint: {
      name: 'QuerySNSMicrosoftTeamsEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSMicrosoftTeamsEndpoint', defaultMessage: 'QuerySNSMicrosoftTeamsEndpoint' }),
      api: 'org.zstack.sns.platform.microsoftteams.APIQuerySNSMicrosoftTeamsEndpointMsg',
    },
    QuerySNSSmsEndpoint: {
      name: 'QuerySNSSmsEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSSmsEndpoint', defaultMessage: 'QuerySNSSmsEndpoint' }),
      api: 'org.zstack.sns.APIQuerySNSSmsEndpointMsg',
    },
    QuerySNSSnmpPlatform: {
      name: 'QuerySNSSnmpPlatform',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSSnmpPlatform', defaultMessage: 'QuerySNSSnmpPlatform' }),
      api: 'org.zstack.sns.platform.snmp.APIQuerySNSSnmpPlatformMsg',
    },
    QuerySNSTextTemplate: {
      name: 'QuerySNSTextTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSTextTemplate', defaultMessage: 'QuerySNSTextTemplate' }),
      api: 'org.zstack.zwatch.alarm.sns.APIQuerySNSTextTemplateMsg',
    },
    QuerySNSTopic: {
      name: 'QuerySNSTopic',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSTopic', defaultMessage: 'QuerySNSTopic' }),
      api: 'org.zstack.sns.APIQuerySNSTopicMsg',
    },
    QuerySNSTopicSubscriber: {
      name: 'QuerySNSTopicSubscriber',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSTopicSubscriber', defaultMessage: 'QuerySNSTopicSubscriber' }),
      api: 'org.zstack.sns.APIQuerySNSTopicSubscriberMsg',
    },
    QuerySNSWeComAtPerson: {
      name: 'QuerySNSWeComAtPerson',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSWeComAtPerson', defaultMessage: 'QuerySNSWeComAtPerson' }),
      api: 'org.zstack.sns.platform.wecom.APIQuerySNSWeComAtPersonMsg',
    },
    QuerySNSWeComEndpoint: {
      name: 'QuerySNSWeComEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySNSWeComEndpoint', defaultMessage: 'QuerySNSWeComEndpoint' }),
      api: 'org.zstack.sns.platform.wecom.APIQuerySNSWeComEndpointMsg',
    },
    QueryThirdpartyAlert: {
      name: 'QueryThirdpartyAlert',
      description: intl.formatMessage({ id: 'apiModel.api.QueryThirdpartyAlert', defaultMessage: 'QueryThirdpartyAlert' }),
      api: 'org.zstack.zwatch.thirdparty.api.APIQueryThirdpartyAlertMsg',
    },
    QueryThirdpartyPlatform: {
      name: 'QueryThirdpartyPlatform',
      description: intl.formatMessage({ id: 'apiModel.api.QueryThirdpartyPlatform', defaultMessage: 'QueryThirdpartyPlatform' }),
      api: 'org.zstack.zwatch.thirdparty.api.APIQueryThirdpartyPlatformMsg',
    },
    RemoveActionFromAlarm: {
      name: 'RemoveActionFromAlarm',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveActionFromAlarm', defaultMessage: 'RemoveActionFromAlarm' }),
      api: 'org.zstack.zwatch.alarm.APIRemoveActionFromAlarmMsg',
    },
    RemoveActionFromEventSubscription: {
      name: 'RemoveActionFromEventSubscription',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveActionFromEventSubscription', defaultMessage: 'RemoveActionFromEventSubscription' }),
      api: 'org.zstack.zwatch.alarm.APIRemoveActionFromEventSubscriptionMsg',
    },
    RemoveInstanceFromMonitorGroup: {
      name: 'RemoveInstanceFromMonitorGroup',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveInstanceFromMonitorGroup', defaultMessage: 'RemoveInstanceFromMonitorGroup' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIRemoveInstanceFromMonitorGroupMsg',
    },
    RemoveLabelFromAlarm: {
      name: 'RemoveLabelFromAlarm',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveLabelFromAlarm', defaultMessage: 'RemoveLabelFromAlarm' }),
      api: 'org.zstack.zwatch.alarm.APIRemoveLabelFromAlarmMsg',
    },
    RemoveLabelFromEventSubscription: {
      name: 'RemoveLabelFromEventSubscription',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveLabelFromEventSubscription', defaultMessage: 'RemoveLabelFromEventSubscription' }),
      api: 'org.zstack.zwatch.alarm.APIRemoveLabelFromEventSubscriptionMsg',
    },
    RemoveSNSDingTalkAtPerson: {
      name: 'RemoveSNSDingTalkAtPerson',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveSNSDingTalkAtPerson', defaultMessage: 'RemoveSNSDingTalkAtPerson' }),
      api: 'org.zstack.sns.platform.dingtalk.APIRemoveSNSDingTalkAtPersonMsg',
    },
    RemoveSNSFeiShuAtPerson: {
      name: 'RemoveSNSFeiShuAtPerson',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveSNSFeiShuAtPerson', defaultMessage: 'RemoveSNSFeiShuAtPerson' }),
      api: 'org.zstack.sns.platform.feishu.APIRemoveSNSFeiShuAtPersonMsg',
    },
    RemoveSNSSmsReceiver: {
      name: 'RemoveSNSSmsReceiver',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveSNSSmsReceiver', defaultMessage: 'RemoveSNSSmsReceiver' }),
      api: 'org.zstack.sns.APIRemoveSNSSmsReceiverMsg',
    },
    RemoveSNSWeComAtPerson: {
      name: 'RemoveSNSWeComAtPerson',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveSNSWeComAtPerson', defaultMessage: 'RemoveSNSWeComAtPerson' }),
      api: 'org.zstack.sns.platform.wecom.APIRemoveSNSWeComAtPersonMsg',
    },
    RevokeMonitorTemplateFromMonitorGroup: {
      name: 'RevokeMonitorTemplateFromMonitorGroup',
      description: intl.formatMessage({ id: 'apiModel.api.RevokeMonitorTemplateFromMonitorGroup', defaultMessage: 'RevokeMonitorTemplateFromMonitorGroup' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIRevokeMonitorTemplateFromMonitorGroupMsg',
    },
    SNSDingTalkTestConnection: {
      name: 'SNSDingTalkTestConnection',
      description: intl.formatMessage({ id: 'apiModel.api.SNSDingTalkTestConnection', defaultMessage: 'SNSDingTalkTestConnection' }),
      api: 'org.zstack.sns.platform.dingtalk.APISNSDingTalkTestConnectionMsg',
    },
    SNSFeiShuTestConnection: {
      name: 'SNSFeiShuTestConnection',
      description: intl.formatMessage({ id: 'apiModel.api.SNSFeiShuTestConnection', defaultMessage: 'SNSFeiShuTestConnection' }),
      api: 'org.zstack.sns.platform.feishu.APISNSFeiShuTestConnectionMsg',
    },
    SNSMicrosoftTeamsTestConnection: {
      name: 'SNSMicrosoftTeamsTestConnection',
      description: intl.formatMessage({ id: 'apiModel.api.SNSMicrosoftTeamsTestConnection', defaultMessage: 'SNSMicrosoftTeamsTestConnection' }),
      api: 'org.zstack.sns.platform.microsoftteams.APISNSMicrosoftTeamsTestConnectionMsg',
    },
    SNSWeComTestConnection: {
      name: 'SNSWeComTestConnection',
      description: intl.formatMessage({ id: 'apiModel.api.SNSWeComTestConnection', defaultMessage: 'SNSWeComTestConnection' }),
      api: 'org.zstack.sns.platform.wecom.APISNSWeComTestConnectionMsg',
    },
    SubscribeEvent: {
      name: 'SubscribeEvent',
      description: intl.formatMessage({ id: 'apiModel.api.SubscribeEvent', defaultMessage: 'SubscribeEvent' }),
      api: 'org.zstack.zwatch.alarm.APISubscribeEventMsg',
    },
    SubscribeSNSTopic: {
      name: 'SubscribeSNSTopic',
      description: intl.formatMessage({ id: 'apiModel.api.SubscribeSNSTopic', defaultMessage: 'SubscribeSNSTopic' }),
      api: 'org.zstack.sns.APISubscribeSNSTopicMsg',
    },
    UnsubscribeEvent: {
      name: 'UnsubscribeEvent',
      description: intl.formatMessage({ id: 'apiModel.api.UnsubscribeEvent', defaultMessage: 'UnsubscribeEvent' }),
      api: 'org.zstack.zwatch.alarm.APIUnsubscribeEventMsg',
    },
    UnsubscribeSNSTopic: {
      name: 'UnsubscribeSNSTopic',
      description: intl.formatMessage({ id: 'apiModel.api.UnsubscribeSNSTopic', defaultMessage: 'UnsubscribeSNSTopic' }),
      api: 'org.zstack.sns.APIUnsubscribeSNSTopicMsg',
    },
    UpdateActiveAlarmTemplate: {
      name: 'UpdateActiveAlarmTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateActiveAlarmTemplate', defaultMessage: 'UpdateActiveAlarmTemplate' }),
      api: 'org.zstack.zwatch.alarm.activealarm.api.APIUpdateActiveAlarmTemplateMsg',
    },
    UpdateAlarm: {
      name: 'UpdateAlarm',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateAlarm', defaultMessage: 'UpdateAlarm' }),
      api: 'org.zstack.zwatch.alarm.APIUpdateAlarmMsg',
    },
    UpdateAlarmData: {
      name: 'UpdateAlarmData',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateAlarmData', defaultMessage: 'UpdateAlarmData' }),
      api: 'org.zstack.zwatch.api.APIUpdateAlarmDataMsg',
    },
    UpdateAlarmLabel: {
      name: 'UpdateAlarmLabel',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateAlarmLabel', defaultMessage: 'UpdateAlarmLabel' }),
      api: 'org.zstack.zwatch.alarm.APIUpdateAlarmLabelMsg',
    },
    UpdateAlertDataAck: {
      name: 'UpdateAlertDataAck',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateAlertDataAck', defaultMessage: 'UpdateAlertDataAck' }),
      api: 'org.zstack.zwatch.alarm.APIUpdateAlertDataAckMsg',
    },
    UpdateAliyunSmsSNSTextTemplate: {
      name: 'UpdateAliyunSmsSNSTextTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateAliyunSmsSNSTextTemplate', defaultMessage: 'UpdateAliyunSmsSNSTextTemplate' }),
      api: 'org.zstack.zwatch.alarm.sns.template.aliyunsms.APIUpdateAliyunSmsSNSTextTemplateMsg',
    },
    UpdateAtPersonOfAtDingTalkEndpoint: {
      name: 'UpdateAtPersonOfAtDingTalkEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateAtPersonOfAtDingTalkEndpoint', defaultMessage: 'UpdateAtPersonOfAtDingTalkEndpoint' }),
      api: 'org.zstack.sns.platform.dingtalk.APIUpdateAtPersonOfAtDingTalkEndpointMsg',
    },
    UpdateAtPersonOfAtFeiShuEndpoint: {
      name: 'UpdateAtPersonOfAtFeiShuEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateAtPersonOfAtFeiShuEndpoint', defaultMessage: 'UpdateAtPersonOfAtFeiShuEndpoint' }),
      api: 'org.zstack.sns.platform.feishu.APIUpdateAtPersonOfAtFeiShuEndpointMsg',
    },
    UpdateAtPersonOfAtWeComEndpoint: {
      name: 'UpdateAtPersonOfAtWeComEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateAtPersonOfAtWeComEndpoint', defaultMessage: 'UpdateAtPersonOfAtWeComEndpoint' }),
      api: 'org.zstack.sns.platform.wecom.APIUpdateAtPersonOfAtWeComEndpointMsg',
    },
    UpdateEmailAddressOfSNSEmailEndpoint: {
      name: 'UpdateEmailAddressOfSNSEmailEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateEmailAddressOfSNSEmailEndpoint', defaultMessage: 'UpdateEmailAddressOfSNSEmailEndpoint' }),
      api: 'org.zstack.sns.platform.email.APIUpdateEmailAddressOfSNSEmailEndpointMsg',
    },
    UpdateEventData: {
      name: 'UpdateEventData',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateEventData', defaultMessage: 'UpdateEventData' }),
      api: 'org.zstack.zwatch.api.APIUpdateEventDataMsg',
    },
    UpdateEventRuleTemplate: {
      name: 'UpdateEventRuleTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateEventRuleTemplate', defaultMessage: 'UpdateEventRuleTemplate' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIUpdateEventRuleTemplateMsg',
    },
    UpdateEventSubscriptionLabel: {
      name: 'UpdateEventSubscriptionLabel',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateEventSubscriptionLabel', defaultMessage: 'UpdateEventSubscriptionLabel' }),
      api: 'org.zstack.zwatch.alarm.APIUpdateEventSubscriptionLabelMsg',
    },
    UpdateMetricRuleTemplate: {
      name: 'UpdateMetricRuleTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateMetricRuleTemplate', defaultMessage: 'UpdateMetricRuleTemplate' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIUpdateMetricRuleTemplateMsg',
    },
    UpdateMonitorGroup: {
      name: 'UpdateMonitorGroup',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateMonitorGroup', defaultMessage: 'UpdateMonitorGroup' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIUpdateMonitorGroupMsg',
    },
    UpdateMonitorTemplate: {
      name: 'UpdateMonitorTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateMonitorTemplate', defaultMessage: 'UpdateMonitorTemplate' }),
      api: 'org.zstack.zwatch.monitorgroup.api.APIUpdateMonitorTemplateMsg',
    },
    UpdateSNSApplicationEndpoint: {
      name: 'UpdateSNSApplicationEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSNSApplicationEndpoint', defaultMessage: 'UpdateSNSApplicationEndpoint' }),
      api: 'org.zstack.sns.APIUpdateSNSApplicationEndpointMsg',
    },
    UpdateSNSApplicationPlatform: {
      name: 'UpdateSNSApplicationPlatform',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSNSApplicationPlatform', defaultMessage: 'UpdateSNSApplicationPlatform' }),
      api: 'org.zstack.sns.APIUpdateSNSApplicationPlatformMsg',
    },
    UpdateSNSDingTalkEndpoint: {
      name: 'UpdateSNSDingTalkEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSNSDingTalkEndpoint', defaultMessage: 'UpdateSNSDingTalkEndpoint' }),
      api: 'org.zstack.sns.platform.dingtalk.APIUpdateSNSDingTalkEndpointMsg',
    },
    UpdateSNSFeiShuEndpoint: {
      name: 'UpdateSNSFeiShuEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSNSFeiShuEndpoint', defaultMessage: 'UpdateSNSFeiShuEndpoint' }),
      api: 'org.zstack.sns.platform.feishu.APIUpdateSNSFeiShuEndpointMsg',
    },
    UpdateSNSHttpEndpoint: {
      name: 'UpdateSNSHttpEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSNSHttpEndpoint', defaultMessage: 'UpdateSNSHttpEndpoint' }),
      api: 'org.zstack.sns.platform.http.APIUpdateSNSHttpEndpointMsg',
    },
    UpdateSNSMicrosoftTeamsEndpoint: {
      name: 'UpdateSNSMicrosoftTeamsEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSNSMicrosoftTeamsEndpoint', defaultMessage: 'UpdateSNSMicrosoftTeamsEndpoint' }),
      api: 'org.zstack.sns.platform.microsoftteams.APIUpdateSNSMicrosoftTeamsEndpointMsg',
    },
    UpdateSNSSnmpPlatform: {
      name: 'UpdateSNSSnmpPlatform',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSNSSnmpPlatform', defaultMessage: 'UpdateSNSSnmpPlatform' }),
      api: 'org.zstack.sns.platform.snmp.APIUpdateSNSSnmpPlatformMsg',
    },
    UpdateSNSTextTemplate: {
      name: 'UpdateSNSTextTemplate',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSNSTextTemplate', defaultMessage: 'UpdateSNSTextTemplate' }),
      api: 'org.zstack.zwatch.alarm.sns.APIUpdateSNSTextTemplateMsg',
    },
    UpdateSNSTopic: {
      name: 'UpdateSNSTopic',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSNSTopic', defaultMessage: 'UpdateSNSTopic' }),
      api: 'org.zstack.sns.APIUpdateSNSTopicMsg',
    },
    UpdateSNSWeComEndpoint: {
      name: 'UpdateSNSWeComEndpoint',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSNSWeComEndpoint', defaultMessage: 'UpdateSNSWeComEndpoint' }),
      api: 'org.zstack.sns.platform.wecom.APIUpdateSNSWeComEndpointMsg',
    },
    UpdateSubscribeEvent: {
      name: 'UpdateSubscribeEvent',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSubscribeEvent', defaultMessage: 'UpdateSubscribeEvent' }),
      api: 'org.zstack.zwatch.alarm.APIUpdateSubscribeEventMsg',
    },
    UpdateThirdpartyAlerts: {
      name: 'UpdateThirdpartyAlerts',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateThirdpartyAlerts', defaultMessage: 'UpdateThirdpartyAlerts' }),
      api: 'org.zstack.zwatch.thirdparty.api.APIUpdateThirdpartyAlertsMsg',
    },
    UpdateThirdpartyPlatform: {
      name: 'UpdateThirdpartyPlatform',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateThirdpartyPlatform', defaultMessage: 'UpdateThirdpartyPlatform' }),
      api: 'org.zstack.zwatch.thirdparty.api.APIUpdateThirdpartyPlatformMsg',
    },
    ValidateSNSEmailPlatform: {
      name: 'ValidateSNSEmailPlatform',
      description: intl.formatMessage({ id: 'apiModel.api.ValidateSNSEmailPlatform', defaultMessage: 'ValidateSNSEmailPlatform' }),
      api: 'org.zstack.sns.platform.email.APIValidateSNSEmailPlatformMsg',
    },
  }
}

export default api
