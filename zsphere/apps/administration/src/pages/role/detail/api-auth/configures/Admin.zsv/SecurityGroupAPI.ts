const api = (intl: any) => {
  return {
    AddSecurityGroupRule: {
      name: 'AddSecurityGroupRule',
      description: intl.formatMessage({ id: 'apiModel.api.AddSecurityGroupRule', defaultMessage: 'AddSecurityGroupRule' }),
      api: 'org.zstack.network.securitygroup.APIAddSecurityGroupRuleMsg',
    },
    AddVmNicToSecurityGroup: {
      name: 'AddVmNicToSecurityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.AddVmNicToSecurityGroup', defaultMessage: 'AddVmNicToSecurityGroup' }),
      api: 'org.zstack.network.securitygroup.APIAddVmNicToSecurityGroupMsg',
    },
    AttachSecurityGroupToL3Network: {
      name: 'AttachSecurityGroupToL3Network',
      description: intl.formatMessage({ id: 'apiModel.api.AttachSecurityGroupToL3Network', defaultMessage: 'AttachSecurityGroupToL3Network' }),
      api: 'org.zstack.network.securitygroup.APIAttachSecurityGroupToL3NetworkMsg',
    },
    ChangeSecurityGroupRule: {
      name: 'ChangeSecurityGroupRule',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeSecurityGroupRule', defaultMessage: 'ChangeSecurityGroupRule' }),
      api: 'org.zstack.network.securitygroup.APIChangeSecurityGroupRuleMsg',
    },
    ChangeSecurityGroupRuleState: {
      name: 'ChangeSecurityGroupRuleState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeSecurityGroupRuleState', defaultMessage: 'ChangeSecurityGroupRuleState' }),
      api: 'org.zstack.network.securitygroup.APIChangeSecurityGroupRuleStateMsg',
    },
    ChangeSecurityGroupState: {
      name: 'ChangeSecurityGroupState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeSecurityGroupState', defaultMessage: 'ChangeSecurityGroupState' }),
      api: 'org.zstack.network.securitygroup.APIChangeSecurityGroupStateMsg',
    },
    CreateSecurityGroup: {
      name: 'CreateSecurityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSecurityGroup', defaultMessage: 'CreateSecurityGroup' }),
      api: 'org.zstack.network.securitygroup.APICreateSecurityGroupMsg',
    },
    DeleteSecurityGroup: {
      name: 'DeleteSecurityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteSecurityGroup', defaultMessage: 'DeleteSecurityGroup' }),
      api: 'org.zstack.network.securitygroup.APIDeleteSecurityGroupMsg',
    },
    DeleteSecurityGroupRule: {
      name: 'DeleteSecurityGroupRule',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteSecurityGroupRule', defaultMessage: 'DeleteSecurityGroupRule' }),
      api: 'org.zstack.network.securitygroup.APIDeleteSecurityGroupRuleMsg',
    },
    DeleteVmNicFromSecurityGroup: {
      name: 'DeleteVmNicFromSecurityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteVmNicFromSecurityGroup', defaultMessage: 'DeleteVmNicFromSecurityGroup' }),
      api: 'org.zstack.network.securitygroup.APIDeleteVmNicFromSecurityGroupMsg',
    },
    DetachSecurityGroupFromL3Network: {
      name: 'DetachSecurityGroupFromL3Network',
      description: intl.formatMessage({ id: 'apiModel.api.DetachSecurityGroupFromL3Network', defaultMessage: 'DetachSecurityGroupFromL3Network' }),
      api: 'org.zstack.network.securitygroup.APIDetachSecurityGroupFromL3NetworkMsg',
    },
    GetCandidateVmNicForSecurityGroup: {
      name: 'GetCandidateVmNicForSecurityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.GetCandidateVmNicForSecurityGroup', defaultMessage: 'GetCandidateVmNicForSecurityGroup' }),
      api: 'org.zstack.network.securitygroup.APIGetCandidateVmNicForSecurityGroupMsg',
    },
    QuerySecurityGroup: {
      name: 'QuerySecurityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySecurityGroup', defaultMessage: 'QuerySecurityGroup' }),
      api: 'org.zstack.network.securitygroup.APIQuerySecurityGroupMsg',
    },
    QuerySecurityGroupRule: {
      name: 'QuerySecurityGroupRule',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySecurityGroupRule', defaultMessage: 'QuerySecurityGroupRule' }),
      api: 'org.zstack.network.securitygroup.APIQuerySecurityGroupRuleMsg',
    },
    QueryVmNicInSecurityGroup: {
      name: 'QueryVmNicInSecurityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.QueryVmNicInSecurityGroup', defaultMessage: 'QueryVmNicInSecurityGroup' }),
      api: 'org.zstack.network.securitygroup.APIQueryVmNicInSecurityGroupMsg',
    },
    UpdateSecurityGroup: {
      name: 'UpdateSecurityGroup',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSecurityGroup', defaultMessage: 'UpdateSecurityGroup' }),
      api: 'org.zstack.network.securitygroup.APIUpdateSecurityGroupMsg',
    },
    UpdateSecurityGroupRulePriority: {
      name: 'UpdateSecurityGroupRulePriority',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSecurityGroupRulePriority', defaultMessage: 'UpdateSecurityGroupRulePriority' }),
      api: 'org.zstack.network.securitygroup.APIUpdateSecurityGroupRulePriorityMsg',
    },
    ValidateSecurityGroupRule: {
      name: 'ValidateSecurityGroupRule',
      description: intl.formatMessage({ id: 'apiModel.api.ValidateSecurityGroupRule', defaultMessage: 'ValidateSecurityGroupRule' }),
      api: 'org.zstack.network.securitygroup.APIValidateSecurityGroupRuleMsg',
    },
  }
}

export default api
