const api = (intl: any) => {
  return {
    AttachTagToResources: {
      name: 'AttachTagToResources',
      description: intl.formatMessage({ id: 'apiModel.api.AttachTagToResources', defaultMessage: 'AttachTagToResources' }),
      api: 'org.zstack.tag2.APIAttachTagToResourcesMsg',
    },
    CreateSystemTag: {
      name: 'CreateSystemTag',
      description: intl.formatMessage({ id: 'apiModel.api.CreateSystemTag', defaultMessage: 'CreateSystemTag' }),
      api: 'org.zstack.header.tag.APICreateSystemTagMsg',
    },
    CreateTag: {
      name: 'CreateTag',
      description: intl.formatMessage({ id: 'apiModel.api.CreateTag', defaultMessage: 'CreateTag' }),
      api: 'org.zstack.tag2.APICreateTagMsg',
    },
    DeleteTag: {
      name: 'DeleteTag',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteTag', defaultMessage: 'DeleteTag' }),
      api: 'org.zstack.header.tag.APIDeleteTagMsg',
    },
    DetachTagFromResources: {
      name: 'DetachTagFromResources',
      description: intl.formatMessage({ id: 'apiModel.api.DetachTagFromResources', defaultMessage: 'DetachTagFromResources' }),
      api: 'org.zstack.tag2.APIDetachTagFromResourcesMsg',
    },
    QuerySystemTag: {
      name: 'QuerySystemTag',
      description: intl.formatMessage({ id: 'apiModel.api.QuerySystemTag', defaultMessage: 'QuerySystemTag' }),
      api: 'org.zstack.header.tag.APIQuerySystemTagMsg',
    },
    QueryTag: {
      name: 'QueryTag',
      description: intl.formatMessage({ id: 'apiModel.api.QueryTag', defaultMessage: 'QueryTag' }),
      api: 'org.zstack.tag2.APIQueryTagMsg',
    },
    QueryUserTag: {
      name: 'QueryUserTag',
      description: intl.formatMessage({ id: 'apiModel.api.QueryUserTag', defaultMessage: 'QueryUserTag' }),
      api: 'org.zstack.header.tag.APIQueryUserTagMsg',
    },
    UpdateSystemTag: {
      name: 'UpdateSystemTag',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateSystemTag', defaultMessage: 'UpdateSystemTag' }),
      api: 'org.zstack.header.tag.APIUpdateSystemTagMsg',
    },
    UpdateTag: {
      name: 'UpdateTag',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateTag', defaultMessage: 'UpdateTag' }),
      api: 'org.zstack.tag2.APIUpdateTagMsg',
    },
  }
}

export default api
