import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { ClusterQueryType } from '@/hardware-resource/cluster/cluster.model'
import { ClusterService } from '@/hardware-resource/cluster/cluster.service'
import { VmInstanceQueryService } from '@/zsphere-resource/vm-instance/vm-instance-query/vm-instance-query.service'
import { VmQueryType } from '@/zsphere-resource/vm-instance/vm-instance.model'

import { DirectoryQueryType, QueryDirArgs } from '../vm-directory-group.model'

@Injectable()
export class VMDirectoryQueryService {
  @Inject() zqlService: ZQLService
  @Inject() queryHostAction: QueryHostAction
  @Inject() queryVmInstanceAction: QueryVmInstanceAction
  @Inject() vmInstanceQueryService: VmInstanceQueryService
  @Inject() queryClusterService: ClusterService

  private getVMCountDataLoader

  constructor() {
    this.getVMCountDataLoader = new DataLoader(this._getVMCount)
  }

  //获取组对应的vm 数量
  getVMCount(group) {
    return this.getVMCountDataLoader.load(group)
  }

  _getVMCount = async (groups: any[]) => {
    const _groups = _.chunk(_.uniq(groups), 50)

    let resultList = []

    await Promise.all(
      _.map(_groups, async groups => {
        const zql = ZQL.multStringify(
          _.map(groups, group => {
            return {
              tableName: 'vminstance',
              action: ZQLAction.COUNT,
              condition: {
                state: { [ZOp.ne]: 'Destroyed' },
                hypervisorType:
                  group.type === 'default' ? { [ZOp.ne]: 'ESX' } : { [ZOp.eq]: 'ESX' },
                zoneUuid: group.zoneUuid,
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'resourceDirectoryRef ',
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
                                      [ZOp.exactLike]: `'${group.groupName}/%'`
                                    }
                                  },
                                  {
                                    groupName: {
                                      [ZOp.eq]: group.groupName
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
              },
              namedAs: group.groupName
            }
          })
        )

        const { results } = await this.zqlService.call(zql)
        resultList = resultList.concat(results)
      })
    )

    const vmGroupCountMap = _.reduce(
      resultList,
      (obj, it) => {
        obj[it.name] = _.get(it, ['total'], 0)
        return obj
      },
      {}
    )

    return groups.map(group => {
      return _.get(vmGroupCountMap, group.groupName, 0)
    })
  }

  async getGroupDir(params: QueryDirArgs) {
    const { conditions, type = DirectoryQueryType.Normal } = params

    const isNameQuery = conditions.filter(t => t.key === 'name').length !== 0
    const zoneUuid = conditions.filter(t => t.key === 'zoneUuid')?.[0].value

    const noGroupResult = await this.vmInstanceQueryService.get({
      count: true,
      type: VmQueryType.Normal,

      conditions: [
        {
          key: 'vmgroup',
          op: Op.eq,
          value: '-2'
        },
        { key: 'state', op: Op.ne, value: 'Destroyed' },
        ...conditions.filter(t => t.key !== 'name' && t.key !== 'type' && t.op !== 'like')
      ]
    })

    const allVmResult = await this.vmInstanceQueryService.get({
      count: true,
      type: VmQueryType.Normal,
      conditions: [
        { key: 'state', op: Op.ne, value: 'Destroyed' },
        ...conditions.filter(t => t.key !== 'name' && t.key !== 'type' && t.op !== 'like')
      ]
    })

    const _zqlCondition = QueryConditionTranslator.translate(
      conditions.concat([
        {
          key: 'type',
          op: Op.eq,
          value: 'default'
        }
      ])
    )

    const zqlObject = {
      tableName: 'directory',
      condition: _zqlCondition,
      orderBy: params.sortBy,
      orderDirection: 'desc',
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject as ZqlObject)

    const groupResp = await this.zqlService.call(zql)

    const groupInventories = groupResp?.results?.[0]?.inventories || []

    const zqllist = isNameQuery
      ? groupInventories.map(t => {
          return {
            ...t,
            zoneUuid: t.zoneUuid,

            title: t.groupName,
            name: t.title,
            parentUuid: '-1',
            count: 0,
            key: t.uuid,
            level: 1,
            groupName: t.groupName
          }
        })
      : groupInventories.map(t => {
          return {
            title: t.name,
            parentUuid: t.parentUuid || '-1',
            count: 0,
            name: t.title,
            zoneUuid: t.zoneUuid,
            key: t.uuid,
            groupName: t.groupName,
            level: t?.groupName?.split('/').length || 0,
            ...t
          }
        })

    return {
      //all和未分组
      //zoneUuid for zsv
      list: zqllist.concat([
        {
          title: 'noGroup',
          name: 'noGroup',
          key: '-2',
          uuid: '-2',
          zoneUuid: zoneUuid,
          count: noGroupResult?.total,
          level: 1,
          parentUuid: '-1',
          groupName: 'admin/noGroup'
        },
        {
          key: '-1',
          uuid: '-1',
          title: 'all',
          level: 0,
          zoneUuid: zoneUuid,

          groupName: 'all',
          count: allVmResult?.total,
          parentUuid: '',
          name: 'all'
        }
      ])
    }
  }

  async getGroupDirByUuid(params: QueryDirArgs) {
    const { conditions } = params
    //对于uuid 是-2开头的，需要单独处理，‘默认分组’是前端构造的

    const uuid = conditions.filter(t => t.key === 'uuid')[0]?.value

    if (uuid?.split('-2').length > 1) {
      return {
        list: [
          {
            key: uuid,
            title: 'default',
            level: null,
            name: 'default',
            parentUuid: null,
            zoneUuid: uuid?.split('-2')?.[1],
            uuid: uuid,
            groupName: 'default',
            __typename: 'VMGroupDirectory'
          }
        ],
        total: 1
      }
    }

    const _zqlCondition = QueryConditionTranslator.translate(conditions)

    const zqlObject = {
      tableName: 'directory',
      condition: _zqlCondition,
      orderBy: params.sortBy,
      orderDirection: 'desc',
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject as ZqlObject)

    const { results } = await this.zqlService.call(zql)
    const dir = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: dir.map(t => {
        return { ...t, key: t.uuid, title: t.name }
      }),
      total
    }
  }

  async getGroupDirTreeByUuid(params: QueryDirArgs) {
    const { conditions } = params

    const _zqlCondition = QueryConditionTranslator.translate(
      conditions.concat([
        {
          key: 'type',
          op: Op.eq,
          value: 'default'
        }
      ])
    )

    const zqlObject = {
      tableName: 'directory',
      condition: _zqlCondition,
      orderBy: params.sortBy,
      orderDirection: 'desc',
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject as ZqlObject)

    const { results: itemResults } = await this.zqlService.call(zql)

    const dir = itemResults?.[0]?.inventories?.[0] ?? {}

    const level = dir?.groupName?.split('/').length

    const finalZqlCondition = [
      {
        key: 'type',
        op: Op.eq,
        value: 'default'
      }
    ]

    let _finalZqlCondition = {}

    if (level === 1) {
      _finalZqlCondition = QueryConditionTranslator.translate(
        finalZqlCondition.concat([
          {
            key: 'rootDirectoryUuid',
            op: Op.eq,
            value: dir?.rootDirectoryUuid
          }
        ])
      )
    }

    if (level === 2) {
      _finalZqlCondition = QueryConditionTranslator.translate(
        finalZqlCondition.concat([
          {
            key: 'parentUuid',
            op: Op.eq,
            value: dir?.uuid
          }
        ])
      )
    }

    const finalZqlObject = {
      tableName: 'directory',
      condition: _finalZqlCondition,
      orderBy: params.sortBy,
      orderDirection: 'desc',
      returnWith: {
        total: true
      }
    }

    const { results } = await this.zqlService.call(ZQL.stringify(finalZqlObject as ZqlObject))
    const finalDir = results?.[0]?.inventories ?? {}
    const finalTotal = results?.[0]?.total ?? 0
    return {
      list: finalDir.map(t => {
        return { ...t, key: t.uuid, title: t.name }
      }),
      total: finalTotal
    }
  }

  async getGroupDirCount(params: QueryDirArgs) {
    const { conditions, type = DirectoryQueryType.Normal } = params

    const zqlObject = {
      tableName: 'directory',
      condition: QueryConditionTranslator.translate(conditions),
      orderBy: params.sortBy,
      orderDirection: 'desc',
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject as ZqlObject)

    const groupResp = await this.zqlService.call(zql)

    const groupInventories = groupResp?.results?.[0]?.inventories || []
    const total = groupResp?.results?.[0]?.total || 0

    return {
      //all和未分组
      list: groupInventories,
      total: total
    }
  }

  async getSubGroupDir(params: QueryDirArgs) {
    const { conditions, type = DirectoryQueryType.Normal } = params

    conditions.concat([
      {
        key: 'type',
        op: Op.eq,
        value: 'default'
      }
    ])

    const _zqlCondition = QueryConditionTranslator.translate(
      conditions?.filter(t => {
        if (t.key === 'parentUuid') {
          return !['-1', '-2'].includes(t.value)
        }
        return true
      })
    )

    const zqlObject = {
      tableName: 'directory',
      condition: _zqlCondition
    }

    const zql = ZQL.stringify(zqlObject as ZqlObject)

    const groupResp = await this.zqlService.call(zql)

    return {
      list: groupResp?.results?.[0]?.inventories?.map(t => ({
        ...t,
        title: t.groupName,
        key: t.uuid,
        groupName: t.groupName
      }))
    }
  }

  async getClusterDir(param: QueryDirArgs) {
    const { conditions, type = DirectoryQueryType.Normal } = param
    let queryByName

    if (conditions.filter(t => t.key === 'name' && t.op === 'like')) {
      queryByName = conditions.filter(t => t.key === 'name' && t.op === 'like')
    }

    const filterNameConditions = conditions.filter(t => t.key !== 'name' && t.op !== 'like')

    const _zqlCondition = QueryConditionTranslator.translate(filterNameConditions)

    const allVmResult = await this.vmInstanceQueryService.get({
      count: true,
      type: VmQueryType.Normal,
      conditions: [
        { key: 'state', op: Op.ne, value: 'Destroyed' },
        ...conditions.filter(t => t.key !== 'name' && t.key !== 'type' && t.op !== 'like')
      ]
    })

    let _extrazqlConditions

    const commonVMConditions = [
      { key: 'state', op: Op.ne, value: 'Destroyed' },
      {
        key: 'type',
        op: Op.eq,
        value: 'UserVM'
      }
    ]

    switch (type) {
      case DirectoryQueryType.Normal:
        _extrazqlConditions = [
          {
            key: 'hypervisorType',
            op: Op.ne,
            value: 'ESX'
          },
          ...commonVMConditions
        ]
        break
    }

    //查询集群的时候 每个节点的数字同样需要满足云主机的zoneuuid state条件
    const zqlObject = {
      tableName: 'cluster',
      condition: _zqlCondition,
      fields: ['name', 'uuid'],
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)

    const clusterResp = await this.zqlService.call(zql)

    const clusters = clusterResp.results[0].inventories

    //获取按集群的树结构·
    const getHostAndCountTask = clusters.map(async cluster => {
      const { inventories } = await this.queryHostAction.call({
        //count: true,
        conditions: [
          {
            key: 'cluster.uuid',
            value: cluster.uuid
          },
          ...queryByName
        ]
      })

      const { total: vmTotalByCluster } = await this.queryVmInstanceAction.call({
        count: true,
        conditions: [
          {
            key: 'cluster.uuid',
            value: cluster.uuid
          },
          ..._extrazqlConditions
        ]
      })

      const countVmTask = inventories.map(async t => {
        const { total: vmTotalByHost } = await this.vmInstanceQueryService.get({
          count: true,
          conditions: [
            {
              key: 'hostUuid',
              value: t.uuid
            },
            ..._extrazqlConditions
          ]
        })

        return {
          title: t.name,
          key: t.uuid,
          uuid: t.uuid,
          vmCount: vmTotalByHost,
          level: 2
        }
      })

      const vmCountResp = await Promise.all(countVmTask)

      return {
        key: cluster.uuid,
        uuid: cluster.uuid,
        title: cluster.name,
        vmCount: vmTotalByCluster,
        children: vmCountResp,
        level: 1
      }
    })

    const resq = (await Promise.all(getHostAndCountTask)) as any

    return {
      key: '-1',
      uuid: '-1',
      level: 0,
      title: 'all',
      children: queryByName.length !== 0 ? resq.filter(t => t.children?.length !== 0) : resq,
      expandedKeys: [...clusters.map(t => t.uuid), '-1'],
      vmCount: allVmResult.total
    }
  }
}
