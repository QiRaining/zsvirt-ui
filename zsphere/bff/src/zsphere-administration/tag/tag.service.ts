import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import * as _ from 'lodash'

import { AttachTagToResourcesAction } from '@/api/zstack/AttachTagToResourcesAction'
import {
  Condition,
  conditionsToObject,
  extractAndRemoveExtraCondition,
  Op
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateTagAction } from '@/api/zstack/CreateTagAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { DetachTagFromResourcesAction } from '@/api/zstack/DetachTagFromResourcesAction'
import { QueryBareMetal2InstanceAction } from '@/api/zstack/QueryBareMetal2InstanceAction'
import { QueryBaremetalInstanceAction } from '@/api/zstack/QueryBaremetalInstanceAction'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { QueryMonitorGroupAction } from '@/api/zstack/QueryMonitorGroupAction'
import { QueryMonitorTemplateAction } from '@/api/zstack/QueryMonitorTemplateAction'
import { QueryTagAction } from '@/api/zstack/QueryTagAction'
import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import { QueryVolumeAction } from '@/api/zstack/QueryVolumeAction'
import { TagInventory } from '@/api/zstack/types'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { ZsSession } from '@/model/zs-session.model'

import {
  NoTagResourceResp,
  QueryTagArgs,
  TagQueryResp,
  TagQueryType,
  TagRelatedSummary
} from './tag.model'

@Injectable()
export class TagService extends ActionService {
  @Inject() queryTagAction: QueryTagAction
  @Inject() createTagAction: CreateTagAction
  @Inject() attachTagToResourcesAction: AttachTagToResourcesAction
  @Inject() detachTagFromResourcesAction: DetachTagFromResourcesAction
  @Inject() deleteTagAction: DeleteTagAction
  @Inject() zqlService: ZQLService
  @Inject() queryVmInstanceAction: QueryVmInstanceAction
  @Inject() queryVolumeAction: QueryVolumeAction
  @Inject() queryHostAction: QueryHostAction
  @Inject() queryBaremetalInstanceAction: QueryBaremetalInstanceAction
  @Inject() queryBareMetal2InstanceAction: QueryBareMetal2InstanceAction
  @Inject() queryMonitorGroupAction: QueryMonitorGroupAction
  @Inject() queryMonitorTemplateAction: QueryMonitorTemplateAction

  @InjectModel(ZsSession) private zsSessions: typeof ZsSession

  async query(params: QueryTagArgs): Promise<TagQueryResp> {
    const {
      type = TagQueryType.NORMAL,
      conditions,
      resourceType,
      resourceConditions,
      ...restParams
    } = params
    let _extrazqlCondition
    const _extrazqlConditionsAll = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'accountResourceRef',
            fields: 'resourceUuid',
            condition: {
              resourceType: 'TagPatternVO'
            }
          }
        }
      }
    }
    const sessionId = this.getSessionId()
    const accountRes = await this.getAccountUuid(sessionId)
    const conditionsMap = conditionsToObject(conditions)
    const hasAdmin = conditionsMap?.['owner']?.indexOf('admin') > -1
    const hasOther = conditionsMap?.['owner']?.indexOf('other') > -1
    const _op = hasOther ? ZOp.ne : ZOp.eq
    const _extrazqlConditionsFilter = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'accountResourceRef',
            fields: 'resourceUuid',
            condition: {
              resourceType: 'TagPatternVO',
              accountUuid: {
                [_op]: accountRes?.accountUuid || ''
              }
            }
          }
        }
      }
    }

    switch (type) {
      case TagQueryType.NORMAL:
        //所有者筛选项：选择两项或不选，都是展示全部标签，否则进行筛选
        if ((hasAdmin && hasOther) || (!hasAdmin && !hasOther)) {
          _extrazqlCondition = _extrazqlConditionsAll
        } else {
          _extrazqlCondition = _extrazqlConditionsFilter
        }
        break
      case TagQueryType.GetTagWhenCreateResource:
        _extrazqlCondition = _extrazqlConditionsFilter
        break
    }

    const resultCondition = params.conditions
    _.remove(resultCondition, cv => cv?.key === 'owner')
    const zqlCondition = this.buildZqlCondition(resultCondition, _extrazqlCondition)
    const tagParams = {
      conditions,
      ...restParams
    }
    if (restParams.sortBy === 'resourceCount') {
      tagParams.sortBy = undefined
      tagParams.sortDirection = undefined
    }
    const tagRes = await this.getTagList(tagParams, zqlCondition)
    const tagList = tagRes?.list || []
    const tagUuids = tagList.map(item => item.uuid)
    const resourceCountRes = await this.getResourceCount(tagUuids, resourceType, resourceConditions)
    const tagListWithCount = tagList.map((item, index) => {
      return {
        ...item,
        resourceCount: resourceCountRes[index]
      }
    })
    const result = {
      list: tagListWithCount,
      total: tagRes.total
    }

    if (restParams.sortBy === 'resourceCount') {
      result.list = _.orderBy(tagListWithCount, 'resourceCount', restParams.sortDirection || 'desc')
    }

    return result
  }

  async getTagList(param: QueryAction, zqlCondition: any) {
    const zql = ZQL.stringify({
      tableName: 'tagPattern',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      returnWith: {
        total: true
      },
      limit: param.limit,
      offset: param.start
    })
    const { results } = await this.zqlService.call(zql)

    const total = results?.[0]?.total ?? 0
    return {
      list: results?.[0]?.inventories,
      total
    }
  }

  async getResourceCount(
    tagUuids: string[],
    resourceType?: string,
    resourceConditions?: Condition[]
  ) {
    let resourceCondition: ZqlObject['condition']
    if (resourceType) {
      const conditions = resourceConditions || []
      switch (resourceType) {
        case 'VmInstance': {
          conditions.push({
            key: 'hypervisorType',
            op: Op.ne,
            value: 'ESX'
          })
          conditions.push({
            key: 'type',
            op: Op.eq,
            value: 'UserVM'
          })
          break
        }
      }
      resourceCondition = {
        resourceUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: resourceType,
              fields: 'uuid',
              condition: QueryConditionTranslator.translate(conditions)
            }
          }
        }
      }
    }
    const callList = tagUuids.map(item => {
      let condition: ZqlObject['condition'] = {
        tagPatternUuid: item
      }
      if (resourceCondition) {
        condition = {
          ...condition,
          ...resourceCondition
        }
      }
      const zql = ZQL.stringify({
        action: ZQLAction.COUNT,
        tableName: 'usertag',
        condition
      })
      return this.zqlService.call(zql)
    })
    const allTagRes = await Promise.all(callList)
    const countList = allTagRes.map(item => item.results?.[0]?.total || 0)
    return countList
  }

  buildZqlCondition(conditions: Condition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'ownerName',
      'ownerUuids'
    ])

    const specicalCondition = []

    if (_extraConditionMap['ownerUuids']) {
      specicalCondition.push({
        [ZOp.or]: [
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'accountResourceRef',
                  fields: 'resourceUuid',
                  condition: {
                    resourceType: 'TagPatternVO',
                    accountUuid: {
                      [ZOp.in]: _extraConditionMap.ownerUuids.values
                    }
                  }
                }
              }
            }
          }
        ]
      })
    }

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName'].value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'TagPatternVO')
      )
    }
    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async queryByUuid(uuid: string): Promise<TagInventory> {
    const params: QueryAction = {
      conditions: [{ key: 'uuid', value: uuid }]
    }

    const { inventories } = await this.queryTagAction.call(params)

    return inventories?.[0] ?? null
  }

  async queryByName(name: string): Promise<TagInventory> {
    const params: QueryAction = {
      conditions: [{ key: 'name', value: name }]
    }

    const { inventories } = await this.queryTagAction.call(params)

    return inventories?.[0] ?? null
  }

  async tagRelatedResource(uuid: string) {
    const countList: TagRelatedSummary = {
      vm: 0,
      host: 0,
      volume: 0,
      baremetalInstance: 0,
      baremetal2Instance: 0,
      monitorGroup: 0,
      monitorTemplate: 0
    }
    await Promise.all([
      this.queryVmInstanceAction
        .call({
          count: true,
          conditions: [
            {
              key: '__tagUuid__',
              value: uuid
            },
            {
              key: 'type',
              value: 'UserVm'
            }
          ]
        })
        .then(
          resp => {
            countList.vm = resp.total
          },
          () => {
            countList.vm = 0
          }
        ),
      this.queryBareMetal2InstanceAction
        .call({
          count: true,
          conditions: [
            {
              key: '__tagUuid__',
              value: uuid
            }
          ]
        })
        .then(
          resp => {
            countList.baremetal2Instance = resp.total
          },
          () => {
            countList.baremetal2Instance = 0
          }
        ),
      this.queryHostAction
        .call({
          count: true,
          conditions: [
            {
              key: '__tagUuid__',
              value: uuid
            }
          ]
        })
        .then(
          resp => {
            countList.host = resp.total
          },
          () => {
            countList.host = 0
          }
        ),
      this.queryVolumeAction
        .call({
          count: true,
          conditions: [
            {
              key: '__tagUuid__',
              value: uuid
            }
          ]
        })
        .then(
          resp => {
            countList.volume = resp.total
          },
          () => {
            countList.volume = 0
          }
        ),
      this.queryBaremetalInstanceAction
        .call({
          count: true,
          conditions: [
            {
              key: '__tagUuid__',
              value: uuid
            }
          ]
        })
        .then(
          resp => {
            countList.baremetalInstance = resp.total
          },
          () => {
            countList.baremetalInstance = 0
          }
        ),
      this.queryMonitorGroupAction
        .call({
          count: true,
          conditions: [
            {
              key: '__tagUuid__',
              value: uuid
            }
          ]
        })
        .then(
          resp => {
            countList.monitorGroup = resp.total
          },
          () => {
            countList.monitorGroup = 0
          }
        ),
      this.queryMonitorTemplateAction
        .call({
          count: true,
          conditions: [
            {
              key: '__tagUuid__',
              value: uuid
            }
          ]
        })
        .then(
          resp => {
            countList.monitorTemplate = resp.total
          },
          () => {
            countList.monitorTemplate = 0
          }
        )
    ])

    return countList
  }

  _getConditionsFromMyTagForAttach = params => {
    let currAccountCondition
    const currAccountTagUuidList = _.intersection(params.myUserTagUuidListArray)
    if (currAccountTagUuidList.length > 0) {
      currAccountCondition = currAccountTagUuidList
    } else {
      currAccountCondition = []
    }
    return currAccountCondition
  }

  _getConditionsBothTagForAttach = params => {
    let currAccountCondition = []
    let resourceOwnerCondition = []
    //绑定标签：多选时，需要求交集 目的是将都有的标签过滤掉
    const currAccountTagUuidList =
      params.myUserTagUuidListArray?.length === 1 && params.resourceUuidList?.length > 1
        ? []
        : _.intersection(params.myUserTagUuidListArray)
    const resourceOwnerTagUuidList = _.intersection(params.otherUserTagUuidListArray)
    if (currAccountTagUuidList.length > 0) {
      currAccountCondition = currAccountTagUuidList
    } else {
      currAccountCondition = []
    }
    if (
      _.uniq(params.ownerUuidList).length === 1 &&
      params.ownerUuidList[0] === params.currAccountUuid
    ) {
      resourceOwnerCondition = []
    } else {
      if (resourceOwnerTagUuidList.length > 0) {
        resourceOwnerCondition = resourceOwnerTagUuidList
      } else {
        resourceOwnerCondition = []
      }
    }
    return {
      currAccountCondition,
      resourceOwnerCondition
    }
  }

  _getConditionsForDetach(params) {
    let currAccountCondition = []
    let resourceOwnerCondition = []
    const currAccountTagUuidList = _.union(params.myUserTagUuidListArray)
    const resourceOwnerTagUuidList = _.union(params.otherUserTagUuidListArray)
    if (currAccountTagUuidList.length > 0) {
      currAccountCondition = currAccountTagUuidList
    } else {
      currAccountCondition = []
    }
    if (resourceOwnerTagUuidList.length > 0) {
      resourceOwnerCondition = resourceOwnerTagUuidList
    } else {
      resourceOwnerCondition = []
    }
    return {
      currAccountCondition,
      resourceOwnerCondition
    }
  }

  _getConditionsNormalAccountForDettach(params) {
    let currAccountCondition = []
    const currAccountTagUuidList = _.intersection(params.myUserTagUuidListArray)
    if (currAccountTagUuidList.length > 0) {
      currAccountCondition = currAccountTagUuidList
    } else {
      currAccountCondition = []
    }
    return currAccountCondition
  }

  _openDettachTagPanel = async params => {
    const paramObj = {
      showCreateButton: false,
      queryTypes: 'detach',
      currAccountCondition: [],
      resourceOwnerCondition: [],
      showTab: true,
      conditions: []
    }

    const obj = this._getConditionsForDetach(params)
    const currAccountCondition = obj.currAccountCondition
    const resourceOwnerCondition = obj.resourceOwnerCondition
    paramObj.currAccountCondition = currAccountCondition
    paramObj.resourceOwnerCondition = resourceOwnerCondition

    return paramObj
  }

  _openAttachTagPanel = async params => {
    const paramObj = {
      showCreateButton: true,
      currAccountUuid: '',
      currAccountCondition: [],
      resourceOwnerUuid: '',
      resourceOwnerCondition: [],
      showTab: true,
      conditions: []
    }

    let currAccountCondition
    let resourceOwnerCondition

    const isSameOwner = _.uniq(params.ownerUuidList).length === 1
    if (isSameOwner) {
      const obj = this._getConditionsBothTagForAttach(params)
      currAccountCondition = obj.currAccountCondition
      resourceOwnerCondition = obj.resourceOwnerCondition
    } else {
      currAccountCondition = this._getConditionsFromMyTagForAttach(params)
    }
    let resourceOwnerUuid = ''

    if (isSameOwner) {
      const ownerIsAdmin = params.ownerUuidList[0] === params.accountUuid
      if (ownerIsAdmin) {
        resourceOwnerUuid = ''
      } else {
        if (params.ownerType?.length === 1 && params.ownerType?.[0] === 'iam2Project') {
          resourceOwnerUuid = params.linkedAccountUuid?.[0]
        } else {
          resourceOwnerUuid = params.ownerUuidList[0]
        }
      }
    }
    paramObj.currAccountUuid = params.accountUuid
    paramObj.currAccountCondition = currAccountCondition
    paramObj.resourceOwnerUuid = resourceOwnerUuid
    paramObj.resourceOwnerCondition = resourceOwnerCondition
    paramObj.conditions = this._getConditionsFromMyTagForAttach(params)

    return paramObj
  }

  _getCondition = async (objParams, params) => {
    let conditionList = []
    if (params.showTabs === 'false') {
      conditionList = conditionList.concat(objParams.conditions)
    }
    if (params.currentTab === 'Admin') {
      conditionList = conditionList.concat(objParams.currAccountCondition)
    } else {
      conditionList = conditionList.concat(objParams.resourceOwnerCondition)
    }
    return conditionList
  }

  async _queryByAccount(param) {
    let _op = ZOp.eq
    if (param.type === 'my') {
      _op = ZOp.eq
    } else {
      _op = ZOp.ne
    }
    const zqlConditions = param.q
    const zqlObj = {
      tableName: 'tagPattern',
      condition: {
        [ZOp.and]: [
          {
            uuid: {
              [ZOp.notIn]: zqlConditions
            }
          },
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'accountResourceRef',
                  fields: 'resourceUuid',
                  condition: {
                    resourceType: 'TagPatternVO',
                    accountUuid: {
                      [_op]: param.accountUuid
                    }
                  }
                }
              }
            }
          }
        ]
      },
      returnWith: {
        total: true
      },
      orderBy: param.orderBy,
      orderDirection: param.orderDirection,
      limit: param.limit,
      offset: param.start
    }
    const zql = QueryConditionTranslator.mergeQueryAction({ conditions: param?.conditions }, zqlObj)
    const { results = [] } = await this.zqlService.call(ZQL.stringify(zql))

    if (results.length !== 0) {
      const { inventories = [], total = 0 } = results?.[0]
      return {
        list: inventories,
        total: total
      }
    } else {
      return {
        list: [],
        total: 0
      }
    }
  }
  async _query(param) {
    const zqlConditions = param.q
    const zqlObj = {
      tableName: 'tagPattern',
      condition: {
        uuid: {
          [ZOp.in]: zqlConditions
        }
      },
      returnWith: {
        total: true
      },
      orderBy: param.orderBy,
      orderDirection: param.orderDirection,
      limit: param.limit,
      offset: param.start
    }
    const zql = QueryConditionTranslator.mergeQueryAction({ conditions: param?.conditions }, zqlObj)
    const { results = [] } = await this.zqlService.call(ZQL.stringify(zql))
    if (results.length !== 0) {
      const { inventories = [], total = 0 } = results?.[0]
      return {
        list: inventories,
        total: total
      }
    } else {
      return {
        list: [],
        total: 0
      }
    }
  }
  async getAccountUuid(sessionId) {
    const session = await this.zsSessions.findOne({
      where: {
        sessionId
      }
    })
    return {
      accountUuid: session?.accountId
    }
  }
  async queryTagCandidate(uuids, tagType) {
    const sign = tagType === 'mine' ? ZOp.eq : ZOp.ne
    const sessionId = this.getSessionId()
    const session = await this.zsSessions.findOne({
      where: {
        sessionId
      }
    })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }
    const zqlObject = {
      tableName: 'usertag',
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        },
        tagPatternUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'accountResourceRef',
              fields: 'resourceUuid',
              condition: {
                resourceType: 'TagPatternVO',
                accountUuid: {
                  [sign]: session.accountId
                }
              }
            }
          }
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    const inventories = resp.results[0].inventories
    return uuids.map(uuid => {
      const tagList = inventories.filter(tag => tag.resourceUuid === uuid)
      if (tagList) {
        return tagList.map(item => item.tagPattern)
      } else {
        return []
      }
    })
  }

  async queryList(param): Promise<TagQueryResp> {
    const { type, extraConditions, conditions } = param
    const params = {
      currentTab: '',
      showTabs: true,
      myUserTagUuidListArray: [],
      resourceUuidList: '',
      ownerType: '',
      linkedAccountUuid: '',
      ownerUuidList: [],
      otherUserTagUuidListArray: []
    }
    const conditionsMap = conditionsToObject(extraConditions)
    params.showTabs = conditionsMap['showTabs']
    params.ownerType = conditionsMap['ownerType']
    params.linkedAccountUuid = conditionsMap['linkedAccountUuid']
    params.currentTab = conditionsMap['currentTab']
    params.resourceUuidList = conditionsMap['resourceUuidList']
    params.ownerUuidList = conditionsMap['ownerUuidList']
    const mineTag = await this.queryTagCandidate(params.resourceUuidList, 'mine')

    params.myUserTagUuidListArray = mineTag?.[0]?.map(cv => cv?.uuid)
    const othersTag = await this.queryTagCandidate(params.resourceUuidList, 'others')
    params.otherUserTagUuidListArray = othersTag?.[0]?.map(cv => cv?.uuid)

    const sessionId = this.getSessionId()
    const accountRes = await this.getAccountUuid(sessionId)
    params['accountUuid'] = accountRes?.accountUuid
    const getCurrAccountUuid = param => {
      if (!params.showTabs) {
        return param.accountUuid
      } else {
        if (params.currentTab === 'Admin') {
          return param.currAccountUuid
        } else {
          return param.resourceOwnerUuid
        }
      }
    }
    let tagRes = {
      list: [],
      total: 0
    }
    if (type === 'detach') {
      const objParams = await this._openDettachTagPanel(params)
      const condition = await this._getCondition(objParams, params)
      tagRes = await this._query({
        start: param.start,
        limit: param.limit,
        orderBy: param.sortBy,
        orderDirection: param.sortDirection,
        q: condition,
        conditions: conditions,
        replyWithCount: true
      })
    } else if (type === 'attach') {
      const objParams = await this._openAttachTagPanel(params)
      const condition = await this._getCondition(objParams, params)
      const accountUuid = getCurrAccountUuid(objParams)
      if (accountUuid !== '') {
        tagRes = await this._queryByAccount({
          start: param.start,
          limit: param.limit,
          q: condition,
          conditions: conditions,
          orderBy: param.sortBy,
          orderDirection: param.sortDirection,
          type: 'my',
          accountUuid: accountUuid,
          replyWithCount: true
        })
      }
    }

    const tagList = tagRes.list
    const tagUuids = tagList.map(item => item.uuid)
    const resourceCountRes = await this.getResourceCount(tagUuids)
    const tagListWithCount = tagList.map((item, index) => {
      return {
        ...item,
        resourceCount: resourceCountRes[index]
      }
    })
    const result = {
      list: tagListWithCount,
      total: tagRes.total
    }
    return result
  }

  // 查询指定资源没有绑定标签的数量
  async getNoTagResource(params: QueryTagArgs): Promise<NoTagResourceResp> {
    const { resourceType, resourceConditions } = params
    const conditions = resourceConditions || []

    //云主机目录特殊处理
    const specicalCondition = []

    const vmGroupCondition = _.remove(conditions, condition => condition.key === 'vmgroup')

    if (vmGroupCondition.length > 0) {
      const groupName = vmGroupCondition?.[0]?.value

      if (groupName === '-2') {
        //未分组
        specicalCondition.push({
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'resourceDirectoryRef',
                fields: ['resourceUuid']
              }
            }
          }
        })
      } else if (groupName !== '-1') {
        const dirZqlCondition = {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'resourceDirectoryRef',
                fields: ['resourceUuid'],
                condition: {
                  directoryUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'directory',
                        fields: ['uuid'],
                        condition: {
                          [ZOp.or]: [
                            {
                              groupName: {
                                [ZOp.exactLike]: `'${groupName}/%'`
                              }
                            },
                            {
                              groupName: {
                                [ZOp.eq]: groupName
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        specicalCondition.push(dirZqlCondition)
      }
    }

    switch (resourceType) {
      case 'VmInstance': {
        conditions.push({
          key: 'hypervisorType',
          op: Op.ne,
          value: 'ESX'
        })
        conditions.push({
          key: 'type',
          op: Op.eq,
          value: 'UserVM'
        })
        break
      }
    }

    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: resourceType,
      condition: {
        ...QueryConditionTranslator.translate(conditions, specicalCondition),
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'usertag',
              fields: 'resourceUuid'
            }
          }
        }
      }
    })

    const res = await this.zqlService.call(zql)
    const count = res?.results?.[0]?.total || 0
    return {
      resourceType,
      count
    }
  }

  // 查询指定资源的标签，根据标签被绑定次数排序。用于高级搜索的标签筛选。
  async queryByResource(params: QueryTagArgs) {
    const {
      conditions: originConditions = [],
      resourceType,
      resourceConditions: originResourceConditions = [],
      limit,
      start
    } = params
    const conditions = [...originConditions]
    const resourceConditions = [...originResourceConditions]

    //云主机目录特殊处理
    const specicalCondition = []

    const vmGroupCondition = _.remove(
      resourceConditions,
      resourceConditions => resourceConditions.key === 'vmgroup'
    )

    if (vmGroupCondition.length > 0) {
      const groupName = vmGroupCondition?.[0]?.value

      if (groupName === '-2') {
        //未分组
        specicalCondition.push({
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'resourceDirectoryRef',
                fields: ['resourceUuid']
              }
            }
          }
        })
      } else if (groupName !== '-1') {
        const dirZqlCondition = {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'resourceDirectoryRef',
                fields: ['resourceUuid'],
                condition: {
                  directoryUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'directory',
                        fields: ['uuid'],
                        condition: {
                          [ZOp.or]: [
                            {
                              groupName: {
                                [ZOp.exactLike]: `'${groupName}/%'`
                              }
                            },
                            {
                              groupName: {
                                [ZOp.eq]: groupName
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        specicalCondition.push(dirZqlCondition)
      }
    }

    // 判断管理员标签和租户标签
    const conditionsObj = conditionsToObject(originConditions)
    const ownerCondition: string[] = conditionsObj?.['owner']
    let ownerZQLObj = {}
    if (ownerCondition) {
      const accountCondition = {
        resourceType: 'TagPatternVO'
      }
      const sessionId = this.getSessionId()
      const accountRes = await this.getAccountUuid(sessionId)
      const accountUuid = accountRes?.accountUuid || ''
      const hasAdmin = ownerCondition.includes('admin')
      const hasOther = ownerCondition.includes('other')
      if (hasAdmin && !hasOther) {
        accountCondition['accountUuid'] = {
          [ZOp.eq]: accountUuid
        }
      } else if (!hasAdmin && hasOther) {
        accountCondition['accountUuid'] = {
          [ZOp.ne]: accountUuid
        }
      }

      ownerZQLObj = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'accountResourceRef',
              fields: 'resourceUuid',
              condition: accountCondition
            }
          }
        }
      }
      _.remove(conditions, item => item.key === 'owner')
    }

    switch (resourceType) {
      case 'VmInstance': {
        resourceConditions.push({
          key: 'hypervisorType',
          op: Op.ne,
          value: 'ESX'
        })
        resourceConditions.push({
          key: 'type',
          op: Op.eq,
          value: 'UserVM'
        })
        break
      }
    }
    // 先查询UserTag表，用groupBy搭配groupCount，可以得到排序后的标签数据
    // ZQLQuery zql = "count UserTag where resourceType='VmInstanceVO'
    // and resourceUuid in (qeury VmInstance.uuid where type=userVm)
    // and tagPatternUuid in (query TagPattern.uuid)
    // group by tagPatternUuid order by groupCount desc"
    const userTagZQL = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'UserTag',
      condition: {
        resourceType: {
          [ZOp.eq]: resourceType + 'VO'
        },
        resourceUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: resourceType,
              fields: 'uuid',
              condition: {
                ...QueryConditionTranslator.translate(resourceConditions, specicalCondition)
              }
            }
          }
        },
        tagPatternUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'TagPattern',
              fields: 'uuid',
              condition: {
                ...ownerZQLObj,
                ...QueryConditionTranslator.translate(conditions)
              }
            }
          }
        }
      },
      groupBy: 'tagPatternUuid',
      orderBy: 'groupCount',
      orderDirection: 'desc',
      limit,
      offset: start
    })

    const userTagRes = await this.zqlService.call(userTagZQL)
    const userTagResult = userTagRes?.results?.[0]
    const userTagCounts = userTagResult?.inventoryCounts || []
    const userTagLength = userTagCounts?.length || 0
    const userTagCountsMap = new Map<string, number>()

    let finalList = []

    if (userTagLength > 0) {
      userTagCounts.forEach((item: any) => {
        const uuid = item[0].tagPatternUuid
        const count = item[1]
        userTagCountsMap.set(uuid, count)
      })
      const tagPatternUuidList = Array.from(userTagCountsMap.keys())
      const tagPatternZQL = ZQL.stringify({
        action: ZQLAction.QUERY,
        tableName: 'TagPattern',
        condition: {
          uuid: {
            [ZOp.in]: tagPatternUuidList
          }
        }
      })
      const tagPatternRes = await this.zqlService.call(tagPatternZQL)
      const tagPatternResult = tagPatternRes?.results?.[0]
      const tagPatternList = tagPatternResult?.inventories

      const list = tagPatternUuidList.map(tagUuid => {
        const tagItem = tagPatternList.find(item => item.uuid === tagUuid)
        const resourceCount = userTagCountsMap.get(tagUuid)
        return {
          ...tagItem,
          resourceCount
        }
      })
      finalList = _.concat(finalList, list)
    }

    // 没有绑定资源的标签是不在UserTag表里的，所以剩余数据需要再从TagPattern里查
    // 用not in来查
    // ZQLQuery zql="query TagPattern.uuid where uuid not in (query UserTag.tagPatternUuid)"
    if (limit && userTagLength < limit) {
      const remainLimit = limit - userTagLength
      let remainOffest = 0
      const tagPatternUuidConditionQuery = {
        [ZOp.query]: {
          tableName: 'UserTag',
          fields: 'tagPatternUuid',
          condition: {
            resourceType: {
              [ZOp.eq]: resourceType + 'VO'
            },
            resourceUuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: resourceType,
                  fields: 'uuid',
                  condition: {
                    ...QueryConditionTranslator.translate(resourceConditions)
                  }
                }
              }
            }
          }
        }
      }
      // 如若上一步请求没有结果，则需要额外获取一次绑定资源的标签总数
      // ZQLQuery zql="count TagPattern where uuid in (query UserTag.tagPatternUuid where resourceType='VmInstanceVO')"
      if (userTagLength === 0) {
        const userTagTotalCondtion = ownerZQLObj['uuid']
          ? {
              uuid: {
                [ZOp.in]: tagPatternUuidConditionQuery,
                ...ownerZQLObj['uuid']
              }
            }
          : {
              uuid: {
                [ZOp.in]: tagPatternUuidConditionQuery
              }
            }
        const userTagTotalZQL = ZQL.stringify({
          action: ZQLAction.COUNT,
          tableName: 'TagPattern',
          condition: userTagTotalCondtion
        })
        const userTagTotalRes = await this.zqlService.call(userTagTotalZQL)
        const userTagTotalResult = userTagTotalRes?.results?.[0]
        const userTagTotal = userTagTotalResult?.total
        remainOffest = start > userTagTotal ? start - userTagTotal : 0
      }

      const remainTagPatternCondtion = ownerZQLObj['uuid']
        ? {
            uuid: {
              [ZOp.notIn]: tagPatternUuidConditionQuery,
              ...ownerZQLObj['uuid']
            }
          }
        : {
            uuid: {
              [ZOp.notIn]: tagPatternUuidConditionQuery
            }
          }
      const remainTagPatternZQL = ZQL.stringify({
        action: ZQLAction.QUERY,
        tableName: 'tagPattern',
        condition: {
          ...QueryConditionTranslator.translate(conditions),
          ...remainTagPatternCondtion
        },
        limit: remainLimit,
        offset: remainOffest
      })
      const remainTagPatternRes = await this.zqlService.call(remainTagPatternZQL)
      const remainTagPatternResult = remainTagPatternRes?.results?.[0]
      const remainTagPatternList = remainTagPatternResult?.inventories || []
      const list = remainTagPatternList.map(item => ({
        ...item,
        resourceCount: 0
      }))
      finalList = _.concat(finalList, list)
    }

    // 查询所有标签的总数
    const totalTagPatternZQL = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'tagPattern',
      condition: {
        ...ownerZQLObj,
        ...QueryConditionTranslator.translate(conditions)
      }
    })
    const totalTagPatternRes = await this.zqlService.call(totalTagPatternZQL)
    const finalTotal = totalTagPatternRes?.results?.[0]?.total || 0

    return {
      list: finalList,
      total: finalTotal
    }
  }
}
