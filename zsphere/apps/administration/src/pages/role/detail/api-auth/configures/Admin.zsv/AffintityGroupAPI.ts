const api = (intl: any) => {
  return {
    AddVmToAffinityGroup: {
      name: 'AddVmToAffinityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.AddVmToAffinityGroup', defaultMessage: 'AddVmToAffinityGroup' }),
      api: 'org.zstack.header.affinitygroup.APIAddVmToAffinityGroupMsg',
    },
    AddVmToVmSchedulingRuleGroup: {
      name: 'AddVmToVmSchedulingRuleGroup',
      description: intl.formatMessage({ id: 'apiModel.api.AddVmToVmSchedulingRuleGroup', defaultMessage: 'AddVmToVmSchedulingRuleGroup' }),
      api: 'org.zstack.header.vmscheduling.APIAddVmToVmSchedulingRuleGroupMsg',
    },
    ChangeAffinityGroupState: {
      name: 'ChangeAffinityGroupState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeAffinityGroupState', defaultMessage: 'ChangeAffinityGroupState' }),
      api: 'org.zstack.header.affinitygroup.APIChangeAffinityGroupStateMsg',
    },
    ChangeVmSchedulingRuleState: {
      name: 'ChangeVmSchedulingRuleState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeVmSchedulingRuleState', defaultMessage: 'ChangeVmSchedulingRuleState' }),
      api: 'org.zstack.header.vmscheduling.APIChangeVmSchedulingRuleStateMsg',
    },
    CreateAffinityGroup: {
      name: 'CreateAffinityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateAffinityGroup', defaultMessage: 'CreateAffinityGroup' }),
      api: 'org.zstack.header.affinitygroup.APICreateAffinityGroupMsg',
    },
    CreateVmSchedulingRule: {
      name: 'CreateVmSchedulingRule',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVmSchedulingRule', defaultMessage: 'CreateVmSchedulingRule' }),
      api: 'org.zstack.header.vmscheduling.APICreateVmSchedulingRuleMsg',
    },
    CreateVmSchedulingRuleGroup: {
      name: 'CreateVmSchedulingRuleGroup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateVmSchedulingRuleGroup', defaultMessage: 'CreateVmSchedulingRuleGroup' }),
      api: 'org.zstack.header.vmscheduling.APICreateVmSchedulingRuleGroupMsg',
    },
    DeleteAffinityGroup: {
      name: 'DeleteAffinityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteAffinityGroup', defaultMessage: 'DeleteAffinityGroup' }),
      api: 'org.zstack.header.affinitygroup.APIDeleteAffinityGroupMsg',
    },
    DeleteVmSchedulingRuleGroup: {
      name: 'DeleteVmSchedulingRuleGroup',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVmSchedulingRuleGroup', defaultMessage: 'DeleteVmSchedulingRuleGroup' }),
      api: 'org.zstack.header.vmscheduling.APIDeleteVmSchedulingRuleGroupMsg',
    },
    DetachVmFromVmSchedulingRuleGroup: {
      name: 'DetachVmFromVmSchedulingRuleGroup',
      description: intl.formatMessage({ id: 'apiModel.api.DetachVmFromVmSchedulingRuleGroup', defaultMessage: 'DetachVmFromVmSchedulingRuleGroup' }),
      api: 'org.zstack.header.vmscheduling.APIDetachVmFromVmSchedulingRuleGroupMsg',
    },
    GetCandidateAffinityGroupForAttachingVm: {
      name: 'GetCandidateAffinityGroupForAttachingVm',
      description: intl.formatMessage({ id: 'apiModel.api.GetCandidateAffinityGroupForAttachingVm', defaultMessage: 'GetCandidateAffinityGroupForAttachingVm' }),
      api: 'org.zstack.header.affinitygroup.APIGetCandidateAffinityGroupForAttachingVmMsg',
    },
    GetCandidateAffinityGroupForCreatingVm: {
      name: 'GetCandidateAffinityGroupForCreatingVm',
      description: intl.formatMessage({ id: 'apiModel.api.GetCandidateAffinityGroupForCreatingVm', defaultMessage: 'GetCandidateAffinityGroupForCreatingVm' }),
      api: 'org.zstack.header.affinitygroup.APIGetCandidateAffinityGroupForCreatingVmMsg',
    },
    GetCandidateVMForAttachingAffinityGroup: {
      name: 'GetCandidateVMForAttachingAffinityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.GetCandidateVMForAttachingAffinityGroup', defaultMessage: 'GetCandidateVMForAttachingAffinityGroup' }),
      api: 'org.zstack.header.affinitygroup.APIGetCandidateVMForAttachingAffinityGroupMsg',
    },
    GetVmSchedulingRulesExecuteState: {
      name: 'GetVmSchedulingRulesExecuteState',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmSchedulingRulesExecuteState', defaultMessage: 'GetVmSchedulingRulesExecuteState' }),
      api: 'org.zstack.header.vmscheduling.APIGetVmSchedulingRulesExecuteStateMsg',
    },
    GetVmsSchedulingStateFromSchedulingRule: {
      name: 'GetVmsSchedulingStateFromSchedulingRule',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmsSchedulingStateFromSchedulingRule', defaultMessage: 'GetVmsSchedulingStateFromSchedulingRule' }),
      api: 'org.zstack.header.vmscheduling.APIGetVmsSchedulingStateFromSchedulingRuleMsg',
    },
    ListVmSchedulingRulesFromExecuteState: {
      name: 'ListVmSchedulingRulesFromExecuteState',
      description: intl.formatMessage({ id: 'apiModel.api.ListVmSchedulingRulesFromExecuteState', defaultMessage: 'ListVmSchedulingRulesFromExecuteState' }),
      api: 'org.zstack.header.vmscheduling.APIListVmSchedulingRulesFromExecuteStateMsg',
    },
    ListVmsFromSchedulingState: {
      name: 'ListVmsFromSchedulingState',
      description: intl.formatMessage({ id: 'apiModel.api.ListVmsFromSchedulingState', defaultMessage: 'ListVmsFromSchedulingState' }),
      api: 'org.zstack.header.vmscheduling.APIListVmsFromSchedulingStateMsg',
    },
    QueryAffinityGroup: {
      name: 'QueryAffinityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.QueryAffinityGroup', defaultMessage: 'QueryAffinityGroup' }),
      api: 'org.zstack.header.affinitygroup.APIQueryAffinityGroupMsg',
    },
    QueryHostSchedulingRuleGroup: {
      name: 'QueryHostSchedulingRuleGroup',
      description: intl.formatMessage({ id: 'apiModel.api.QueryHostSchedulingRuleGroup', defaultMessage: 'QueryHostSchedulingRuleGroup' }),
      api: 'org.zstack.header.vmscheduling.APIQueryHostSchedulingRuleGroupMsg',
    },
    QueryVmSchedulingRule: {
      name: 'QueryVmSchedulingRule',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVmSchedulingRule', defaultMessage: 'QueryVmSchedulingRule' }),
      api: 'org.zstack.header.vmscheduling.APIQueryVmSchedulingRuleMsg',
    },
    QueryVmSchedulingRuleGroup: {
      name: 'QueryVmSchedulingRuleGroup',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVmSchedulingRuleGroup', defaultMessage: 'QueryVmSchedulingRuleGroup' }),
      api: 'org.zstack.header.vmscheduling.APIQueryVmSchedulingRuleGroupMsg',
    },
    RemoveVmFromAffinityGroup: {
      name: 'RemoveVmFromAffinityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveVmFromAffinityGroup', defaultMessage: 'RemoveVmFromAffinityGroup' }),
      api: 'org.zstack.header.affinitygroup.APIRemoveVmFromAffinityGroupMsg',
    },
    RemoveVmSchedulingRule: {
      name: 'RemoveVmSchedulingRule',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveVmSchedulingRule', defaultMessage: 'RemoveVmSchedulingRule' }),
      api: 'org.zstack.header.vmscheduling.APIRemoveVmSchedulingRuleMsg',
    },
    UpdateAffinityGroup: {
      name: 'UpdateAffinityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateAffinityGroup', defaultMessage: 'UpdateAffinityGroup' }),
      api: 'org.zstack.header.affinitygroup.APIUpdateAffinityGroupMsg',
    },
    UpdateVmSchedulingRule: {
      name: 'UpdateVmSchedulingRule',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateVmSchedulingRule', defaultMessage: 'UpdateVmSchedulingRule' }),
      api: 'org.zstack.header.vmscheduling.APIUpdateVmSchedulingRuleMsg',
    },
    UpdateVmSchedulingRuleGroup: {
      name: 'UpdateVmSchedulingRuleGroup',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateVmSchedulingRuleGroup', defaultMessage: 'UpdateVmSchedulingRuleGroup' }),
      api: 'org.zstack.header.vmscheduling.APIUpdateVmSchedulingRuleGroupMsg',
    },
    ValidateVmSchedulingRule: {
      name: 'ValidateVmSchedulingRule',
      description: intl.formatMessage({ id: 'apiModel.api.ValidateVmSchedulingRule', defaultMessage: 'ValidateVmSchedulingRule' }),
      api: 'org.zstack.header.vmscheduling.APIValidateVmSchedulingRuleMsg',
    },
  }
}

export default api
