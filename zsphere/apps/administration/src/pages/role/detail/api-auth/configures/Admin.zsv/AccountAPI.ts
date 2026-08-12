const api = (intl: any) => {
  return {
    AddAccountToGroup: {
      name: 'AddAccountToGroup',
      description: intl.formatMessage({ id: 'apiModel.api.AddAccountToGroup', defaultMessage: 'AddAccountToGroup' }),
      api: 'org.zstack.iam1.api.accounts.APIAddAccountToGroupMsg',
    },
    AttachRoleToAccountGroup: {
      name: 'AttachRoleToAccountGroup',
      description: intl.formatMessage({ id: 'apiModel.api.AttachRoleToAccountGroup', defaultMessage: 'AttachRoleToAccountGroup' }),
      api: 'org.zstack.iam1.api.accounts.APIAttachRoleToAccountGroupMsg',
    },
    CreateAccountGroup: {
      name: 'CreateAccountGroup',
      description: intl.formatMessage({ id: 'apiModel.api.CreateAccountGroup', defaultMessage: 'CreateAccountGroup' }),
      api: 'org.zstack.iam1.api.accounts.APICreateAccountGroupMsg',
    },
    CreateRole: {
      name: 'CreateRole',
      description: intl.formatMessage({ id: 'apiModel.api.CreateRole', defaultMessage: 'CreateRole' }),
      api: 'org.zstack.header.identity.role.api.APICreateRoleMsg',
    },
    DeleteAccount: {
      name: 'DeleteAccount',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteAccount', defaultMessage: 'DeleteAccount' }),
      api: 'org.zstack.header.identity.APIDeleteAccountMsg',
    },
    DeleteAccountGroup: {
      name: 'DeleteAccountGroup',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteAccountGroup', defaultMessage: 'DeleteAccountGroup' }),
      api: 'org.zstack.iam1.api.accounts.APIDeleteAccountGroupMsg',
    },
    DeleteRole: {
      name: 'DeleteRole',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteRole', defaultMessage: 'DeleteRole' }),
      api: 'org.zstack.header.identity.role.api.APIDeleteRoleMsg',
    },
    DetachRoleFromAccountGroup: {
      name: 'DetachRoleFromAccountGroup',
      description: intl.formatMessage({ id: 'apiModel.api.DetachRoleFromAccountGroup', defaultMessage: 'DetachRoleFromAccountGroup' }),
      api: 'org.zstack.iam1.api.accounts.APIDetachRoleFromAccountGroupMsg',
    },
    GetAccountGroupTree: {
      name: 'GetAccountGroupTree',
      description: intl.formatMessage({ id: 'apiModel.api.GetAccountGroupTree', defaultMessage: 'GetAccountGroupTree' }),
      api: 'org.zstack.iam1.api.accounts.APIGetAccountGroupTreeMsg',
    },
    GetAccountQuotaUsage: {
      name: 'GetAccountQuotaUsage',
      description: intl.formatMessage({ id: 'apiModel.api.GetAccountQuotaUsage', defaultMessage: 'GetAccountQuotaUsage' }),
      api: 'org.zstack.header.identity.APIGetAccountQuotaUsageMsg',
    },
    GetResourceEnsembleMembers: {
      name: 'GetResourceEnsembleMembers',
      description: intl.formatMessage({ id: 'apiModel.api.GetResourceEnsembleMembers', defaultMessage: 'GetResourceEnsembleMembers' }),
      api: 'org.zstack.iam1.api.ensemble.APIGetResourceEnsembleMembersMsg',
    },
    GetResourceInAccountGroup: {
      name: 'GetResourceInAccountGroup',
      description: intl.formatMessage({ id: 'apiModel.api.GetResourceInAccountGroup', defaultMessage: 'GetResourceInAccountGroup' }),
      api: 'org.zstack.iam1.api.accounts.APIGetResourceInAccountGroupMsg',
    },
    GetResourceSharing: {
      name: 'GetResourceSharing',
      description: intl.formatMessage({ id: 'apiModel.api.GetResourceSharing', defaultMessage: 'GetResourceSharing' }),
      api: 'org.zstack.iam1.api.ensemble.APIGetResourceSharingMsg',
    },
    GetRolePolicyActions: {
      name: 'GetRolePolicyActions',
      description: intl.formatMessage({ id: 'apiModel.api.GetRolePolicyActions', defaultMessage: 'GetRolePolicyActions' }),
      api: 'org.zstack.header.identity.role.api.APIGetRolePolicyActionsMsg',
    },
    GetRolesForAccountGroup: {
      name: 'GetRolesForAccountGroup',
      description: intl.formatMessage({ id: 'apiModel.api.GetRolesForAccountGroup', defaultMessage: 'GetRolesForAccountGroup' }),
      api: 'org.zstack.iam1.api.accounts.APIGetRolesForAccountGroupMsg',
    },
    GetTwoFactorAuthenticationSecret: {
      name: 'GetTwoFactorAuthenticationSecret',
      description: intl.formatMessage({ id: 'apiModel.api.GetTwoFactorAuthenticationSecret', defaultMessage: 'GetTwoFactorAuthenticationSecret' }),
      api: 'org.zstack.twoFactorAuthentication.APIGetTwoFactorAuthenticationSecretMsg',
    },
    GetTwoFactorAuthenticationState: {
      name: 'GetTwoFactorAuthenticationState',
      description: intl.formatMessage({ id: 'apiModel.api.GetTwoFactorAuthenticationState', defaultMessage: 'GetTwoFactorAuthenticationState' }),
      api: 'org.zstack.twoFactorAuthentication.APIGetTwoFactorAuthenticationStateMsg',
    },
    LogInByAccount: {
      name: 'LogInByAccount',
      description: intl.formatMessage({ id: 'apiModel.api.LogInByAccount', defaultMessage: 'LogInByAccount' }),
      api: 'org.zstack.header.identity.APILogInByAccountMsg',
    },
    LogOut: {
      name: 'LogOut',
      description: intl.formatMessage({ id: 'apiModel.api.LogOut', defaultMessage: 'LogOut' }),
      api: 'org.zstack.header.identity.APILogOutMsg',
    },
    MoveAccountGroup: {
      name: 'MoveAccountGroup',
      description: intl.formatMessage({ id: 'apiModel.api.MoveAccountGroup', defaultMessage: 'MoveAccountGroup' }),
      api: 'org.zstack.iam1.api.accounts.APIMoveAccountGroupMsg',
    },
    QueryAccount: {
      name: 'QueryAccount',
      description: intl.formatMessage({ id: 'apiModel.api.QueryAccount', defaultMessage: 'QueryAccount' }),
      api: 'org.zstack.header.identity.APIQueryAccountMsg',
    },
    QueryAccountGroup: {
      name: 'QueryAccountGroup',
      description: intl.formatMessage({ id: 'apiModel.api.QueryAccountGroup', defaultMessage: 'QueryAccountGroup' }),
      api: 'org.zstack.iam1.api.accounts.APIQueryAccountGroupMsg',
    },
    QueryAccountResourceRef: {
      name: 'QueryAccountResourceRef',
      description: intl.formatMessage({ id: 'apiModel.api.QueryAccountResourceRef', defaultMessage: 'QueryAccountResourceRef' }),
      api: 'org.zstack.header.identity.APIQueryAccountResourceRefMsg',
    },
    QueryQuota: {
      name: 'QueryQuota',
      description: intl.formatMessage({ id: 'apiModel.api.QueryQuota', defaultMessage: 'QueryQuota' }),
      api: 'org.zstack.header.identity.APIQueryQuotaMsg',
    },
    QueryRoleAccountRef: {
      name: 'QueryRoleAccountRef',
      description: intl.formatMessage({ id: 'apiModel.api.QueryRoleAccountRef', defaultMessage: 'QueryRoleAccountRef' }),
      api: 'org.zstack.header.identity.role.api.APIQueryRoleAccountRefMsg',
    },
    QueryThirdPartyAccountSourceBinding: {
      name: 'QueryThirdPartyAccountSourceBinding',
      description: intl.formatMessage({ id: 'apiModel.api.QueryThirdPartyAccountSourceBinding', defaultMessage: 'QueryThirdPartyAccountSourceBinding' }),
      api: 'org.zstack.identity.imports.api.APIQueryThirdPartyAccountSourceBindingMsg',
    },
    QueryTwoFactorAuthentication: {
      name: 'QueryTwoFactorAuthentication',
      description: intl.formatMessage({ id: 'apiModel.api.QueryTwoFactorAuthentication', defaultMessage: 'QueryTwoFactorAuthentication' }),
      api: 'org.zstack.twoFactorAuthentication.APIQueryTwoFactorAuthenticationMsg',
    },
    RefreshCaptcha: {
      name: 'RefreshCaptcha',
      description: intl.formatMessage({ id: 'apiModel.api.RefreshCaptcha', defaultMessage: 'RefreshCaptcha' }),
      api: 'org.zstack.core.captcha.APIRefreshCaptchaMsg',
    },
    RemoveAccountFromGroup: {
      name: 'RemoveAccountFromGroup',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveAccountFromGroup', defaultMessage: 'RemoveAccountFromGroup' }),
      api: 'org.zstack.iam1.api.accounts.APIRemoveAccountFromGroupMsg',
    },
    RenewSession: {
      name: 'RenewSession',
      description: intl.formatMessage({ id: 'apiModel.api.RenewSession', defaultMessage: 'RenewSession' }),
      api: 'org.zstack.header.identity.APIRenewSessionMsg',
    },
    RevokeResourceSharingToGroup: {
      name: 'RevokeResourceSharingToGroup',
      description: intl.formatMessage({ id: 'apiModel.api.RevokeResourceSharingToGroup', defaultMessage: 'RevokeResourceSharingToGroup' }),
      api: 'org.zstack.iam1.api.accounts.APIRevokeResourceSharingToGroupMsg',
    },
    ShareResourceToGroup: {
      name: 'ShareResourceToGroup',
      description: intl.formatMessage({ id: 'apiModel.api.ShareResourceToGroup', defaultMessage: 'ShareResourceToGroup' }),
      api: 'org.zstack.iam1.api.accounts.APIShareResourceToGroupMsg',
    },
    UpdateAccount: {
      name: 'UpdateAccount',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateAccount', defaultMessage: 'UpdateAccount' }),
      api: 'org.zstack.header.identity.APIUpdateAccountMsg',
    },
    UpdateAccountGroup: {
      name: 'UpdateAccountGroup',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateAccountGroup', defaultMessage: 'UpdateAccountGroup' }),
      api: 'org.zstack.iam1.api.accounts.APIUpdateAccountGroupMsg',
    },
    UpdateRole: {
      name: 'UpdateRole',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateRole', defaultMessage: 'UpdateRole' }),
      api: 'org.zstack.header.identity.role.api.APIUpdateRoleMsg',
    },
    ValidateSession: {
      name: 'ValidateSession',
      description: intl.formatMessage({ id: 'apiModel.api.ValidateSession', defaultMessage: 'ValidateSession' }),
      api: 'org.zstack.header.identity.APIValidateSessionMsg',
    },
  }
}

export default api
