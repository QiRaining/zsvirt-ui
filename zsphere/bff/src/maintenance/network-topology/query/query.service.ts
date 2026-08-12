import { Injectable, Inject } from '@nestjs/common'
import { isEmpty as _isEmpty, concat as _concat, cloneDeep } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryVpcRouterAction } from '@/api/zstack/QueryVpcRouterAction'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { ResourceAndRelationByTypeQuery, NetworkTopologyRelationQuery } from '../network.model'

const buildUuidInTable = (tableName: string, condition: any, zop: ZOp = ZOp.in) => {
  // 此处有坑，zql会莫名把query查询替换为uuidlist，所以需要冻结对象，防止被修改
  return Object.freeze({
    [zop]: {
      [ZOp.query]: {
        tableName,
        condition
      }
    }
  })
}

const VmUuidInVmInstance = buildUuidInTable('VmInstance.uuid', {
  type: {
    [ZOp.in]: ['UserVm', 'baremetal2']
  }
})
const VmUuidInVpcRouter = buildUuidInTable('ApplianceVm.uuid', {
  applianceVmType: 'vpcvrouter'
})
const VmUuidNotInVCenter = buildUuidInTable(
  'VmInstance.uuid',
  { ['cluster.type']: 'vmware' },
  ZOp.notIn
)

@Injectable()
export class NetworkTopologyQueryService {
  @Inject() zqlService: ZQLService
  @Inject() queryVpcRouterAction: QueryVpcRouterAction

  async queryList(params: IQueryAction) {
    const { type } = params
    switch (type) {
      case 'Vm':
      case 'Baremetal2Vm':
        params.conditions = params.conditions.concat([
          {
            key: 'type',
            op: Op.in,
            values: ['UserVm', 'baremetal2']
          }
        ])
        break
      case 'Vpc':
        params.conditions = params.conditions.concat([
          {
            key: 'type',
            value: 'L3VpcNetwork'
          }
        ])
        break
      case 'Public':
        params.conditions = params.conditions.concat([
          {
            key: 'category',
            value: 'Public'
          }
        ])
        break
      case 'Flat':
        params.conditions = params.conditions.concat([
          {
            key: 'category',
            value: 'Private'
          },
          {
            key: 'type',
            value: 'L3BasicNetwork'
          }
        ])
        break
    }

    const zqlCondition = QueryConditionTranslator.translate(params.conditions)
    let networkList = [],
      networkTotal = 0
    let vmList = [],
      vmTotal = 0

    if (!type || ['Vm', 'Baremetal2Vm'].includes(type)) {
      const vmCondition = this.addVmCondition(zqlCondition)
      const zqlObject = {
        tableName: 'VmInstance',
        condition: vmCondition,
        returnWith: {
          total: true
        }
      }

      const zql = ZQL.stringify(zqlObject)
      const { results } = await this.zqlService.call(zql)
      const list: any[] = results?.[0]?.inventories ?? []
      const total: number = results?.[0]?.total ?? 0
      vmList = list
      vmTotal = total
    }

    // VpcRouter 需要用 action QueryVpcRouterAction ，使用 VmInstance 表 会把 负载均衡的SLB vpcrouter query 出来
    // 这种是不显示的，queryVpcRouter 只显示普通VpcRouter和高可用组内的VpcRouter
    // novm 不显示云主机
    if (!type || ['VpcRouter', 'novm'].includes(type)) {
      const vpcRouterConditions = cloneDeep(params.conditions)
      vpcRouterConditions.push({
        key: 'state',
        value: 'Destroyed',
        op: Op.ne
      })
      const { inventories = [], total = 0 } = await this.queryVpcRouterAction.call({
        conditions: params.conditions
      })

      vmList.push(...inventories)
      vmTotal += total
    }

    if (!type || ['Flat', 'Vpc', 'Public', 'novm'].includes(type)) {
      const networkCondition = this.addNetworkCondition(zqlCondition)
      const zqlObject = {
        tableName: 'L3Network',
        condition: networkCondition,
        returnWith: {
          total: true
        }
      }

      const zql = ZQL.stringify(zqlObject)
      const { results } = await this.zqlService.call(zql)
      const list: any[] = results?.[0]?.inventories ?? []
      const total: number = results?.[0]?.total ?? 0
      networkList = list
      networkTotal = total
    }

    return {
      list: vmList.concat(networkList),
      total: vmTotal + networkTotal
    }
  }

  async getVmByL3NetworkUuid(uuid: string) {
    const { list, total } = await this.zqlQueryByTableName(
      'VmInstance',
      {
        ['vmNics.l3NetworkUuid']: uuid,
        type: {
          [ZOp.in]: ['UserVm', 'baremetal2']
        },
        state: {
          [ZOp.ne]: 'Destroyed'
        }
      },
      {}
    )

    return { total, list }
  }

  async queryResourceAndRelationByType({
    uuids,
    type,
    needInfo = false
  }: ResourceAndRelationByTypeQuery) {
    let nicZqlCondition, vmZqlCondition, l3ZqlCondition, nic2ZqlCondition // 额外查询路由器与网络的关系

    // 网络和直连云主机的关系
    const networkToDirectVmNicCondition = {
      ['vmInstance.uuid']: {
        ...VmUuidInVmInstance,
        ...VmUuidNotInVCenter
      },
      ['l3Network.uuid']: { [ZOp.in]: uuids }
    }
    const linkVpcRouterNic = buildUuidInTable('vmInstance.uuid', {
      uuid: {
        ...VmUuidInVpcRouter,
        ...VmUuidNotInVCenter
      },
      ['vmNics.l3NetworkUuid']: { [ZOp.in]: uuids }
    })

    switch (type) {
      // 高亮逻辑
      // 扁平网络：直连的云主机；
      case 'Flat': {
        nicZqlCondition = networkToDirectVmNicCondition
        vmZqlCondition = {
          uuid: {
            ...VmUuidInVmInstance,
            ...VmUuidNotInVCenter
          },
          ['vmNics.l3NetworkUuid']: { [ZOp.in]: uuids }
        }
        l3ZqlCondition = { uuid: { [ZOp.in]: uuids } }
        break
      }
      // VPC网络：直连的云主机、路由器，路由器直连的公网；
      case 'Vpc': {
        // VPC网络和直连的云主机的网卡(关系)
        nicZqlCondition = networkToDirectVmNicCondition
        // 直连云主机、路由器资源。
        vmZqlCondition = {
          [ZOp.or]: [{ uuid: VmUuidInVmInstance }, { uuid: VmUuidInVpcRouter }],
          uuid: VmUuidNotInVCenter,
          ['vmNics.l3NetworkUuid']: { [ZOp.in]: uuids }
        }
        // 路由器直连的公网的网卡(关系)
        nic2ZqlCondition = {
          // 查询相关联的所有路由器的网卡
          ['vmInstance.uuid']: linkVpcRouterNic,
          // 过滤出公网
          ['l3Network.uuid']: buildUuidInTable('l3Network.uuid', {
            category: 'Public'
          })
        }
        // 查询与路由器直连的公网和选择中的vpc网络 资源
        l3ZqlCondition = {
          [ZOp.or]: [
            { uuid: buildUuidInTable('VmNic.l3NetworkUuid', nic2ZqlCondition) },
            { uuid: { [ZOp.in]: uuids } }
          ]
        }
        break
      }
      // 公网：直连的云主机和路由器，路由器直连的vpc网络，vpc网络直连的云主机；
      case 'Public': {
        // 路由器与直连的vpc网络的网卡(关系)
        const nicVpcZqlCondition = {
          // 查询相关联的所有路由器的网卡(关系)
          ['vmInstance.uuid']: linkVpcRouterNic,
          // 过滤出vpc网络
          ['l3Network.uuid']: buildUuidInTable('l3Network.uuid', {
            type: 'L3VpcNetwork'
          })
        }
        // 直连的路由器和 路由器直连的vpc网络 网卡
        nic2ZqlCondition = {
          ['vmInstance.uuid']: linkVpcRouterNic,
          ['l3Network.uuid']: buildUuidInTable('l3Network.uuid', {
            [ZOp.or]: {
              type: 'L3VpcNetwork',
              uuid: { [ZOp.in]: uuids }
            }
          })
        }
        // 查询vpc网络和选中的公网 资源
        l3ZqlCondition = {
          [ZOp.or]: [
            {
              uuid: buildUuidInTable('VmNic.l3NetworkUuid', nicVpcZqlCondition)
            },
            { uuid: { [ZOp.in]: uuids } }
          ]
        }
        // 公网与直连云主机的网卡 以及 vpc网络直连的云主机的网卡(关系)
        nicZqlCondition = {
          ['vmInstance.uuid']: {
            ...VmUuidInVmInstance,
            ...VmUuidNotInVCenter
          },
          [ZOp.or]: [
            {
              ['l3Network.uuid']: buildUuidInTable('VmNic.l3NetworkUuid', nicVpcZqlCondition)
            },
            { ['l3Network.uuid']: { [ZOp.in]: uuids } }
          ]
        }
        // 直连云主机、路由器、 vpc网络直连的云主机 资源
        vmZqlCondition = {
          [ZOp.or]: [
            {
              [ZOp.and]: {
                [ZOp.or]: [{ uuid: VmUuidInVmInstance }, { uuid: VmUuidInVpcRouter }],
                ['vmNics.l3Network.uuid']: { [ZOp.in]: uuids }
              }
            },
            {
              [ZOp.and]: {
                uuid: VmUuidInVmInstance,
                ['vmNics.l3Network.uuid']: buildUuidInTable(
                  'VmNic.l3NetworkUuid',
                  nicVpcZqlCondition
                )
              }
            }
          ],
          uuid: VmUuidNotInVCenter
        }
        break
      }
      // 路由器：直连的公网和vpc网络，vpc网络直连的云主机；
      case 'VpcRouter': {
        // 路由器直连的公网和vpc网络的网卡(关系)
        nicZqlCondition = {
          ['l3Network.uuid']: buildUuidInTable('l3Network.uuid', {
            [ZOp.or]: [{ type: 'L3VpcNetwork' }, { category: 'Public' }]
          }),
          ['vmInstance.uuid']: { [ZOp.in]: uuids }
        }
        // 直连的公网和vpc网络
        l3ZqlCondition = {
          uuid: buildUuidInTable('VmNic.l3NetworkUuid', nicZqlCondition)
        }
        // vpc网络直连的云主机的网卡(关系)
        nic2ZqlCondition = {
          ['l3Network.uuid']: buildUuidInTable('VmNic.l3NetworkUuid', {
            ['vmInstance.uuid']: { [ZOp.in]: uuids },
            ['l3Network.uuid']: buildUuidInTable('l3Network.uuid', {
              type: 'L3VpcNetwork'
            })
          }),
          ['vmInstance.uuid']: {
            ...VmUuidInVmInstance,
            ...VmUuidNotInVCenter
          }
        }
        // vpc网络直连云主机和 选中的路由器
        vmZqlCondition = {
          [ZOp.or]: [
            {
              uuid: buildUuidInTable('VmNic.vmInstanceUuid', nic2ZqlCondition)
            },
            { uuid: { [ZOp.in]: uuids } }
          ]
        }
        break
      }
      // 云主机：直连的扁平网络、公网、vpc网络，vpc网络连接的路由器，路由器直连的公网
      case 'Vm':
      case 'Baremetal2Vm': {
        // 云主机：直连的扁平网络、公网、vpc网络 网卡(关系)
        nicZqlCondition = {
          ['vmInstance.uuid']: { [ZOp.in]: uuids },
          ['l3Network.uuid']: buildUuidInTable('l3Network.uuid', {
            system: false
          })
        }
        // vpc网络连接的路由器
        const nicVpcToRouterZqlCondition = {
          ['l3Network.uuid']: buildUuidInTable('VmNic.l3NetworkUuid', {
            ['vmInstance.uuid']: { [ZOp.in]: uuids },
            ['l3Network.uuid']: buildUuidInTable('l3Network.uuid', {
              type: 'L3VpcNetwork'
            })
          }),
          ['vmInstance.uuid']: {
            ...VmUuidInVpcRouter,
            ...VmUuidNotInVCenter
          }
        }
        // 路由器直连的公网
        const routerToPublicZqlCondition = {
          ['vmInstance.uuid']: buildUuidInTable('VmNic.vmInstanceUuid', nicVpcToRouterZqlCondition),
          ['l3Network.uuid']: buildUuidInTable('l3Network.uuid', {
            category: 'Public'
          })
        }
        nic2ZqlCondition = {
          [ZOp.or]: [
            { [ZOp.and]: routerToPublicZqlCondition },
            { [ZOp.and]: nicVpcToRouterZqlCondition }
          ]
        }
        // 路由器和选中的云主机 资源
        vmZqlCondition = {
          [ZOp.or]: [
            {
              uuid: buildUuidInTable('VmNic.vmInstanceUuid', nicVpcToRouterZqlCondition)
            },
            { uuid: { [ZOp.in]: uuids } }
          ]
        }
        l3ZqlCondition = {
          [ZOp.or]: [
            { uuid: buildUuidInTable('VmNic.l3NetworkUuid', nicZqlCondition) },
            {
              uuid: buildUuidInTable('VmNic.l3NetworkUuid', routerToPublicZqlCondition)
            }
          ]
        }
      }
    }

    let networkList = [],
      networkTotal = 0
    let vmList = [],
      vmTotal = 0
    let resourceList = []

    if (needInfo) {
      ;({ list: vmList, total: vmTotal } = await this.zqlQueryByTableName(
        'VmInstance',
        vmZqlCondition
      ))
      ;({ list: networkList, total: networkTotal } = await this.zqlQueryByTableName(
        'L3Network',
        l3ZqlCondition
      ))
      resourceList = vmList.concat(networkList)
    }

    let nicCondition = nicZqlCondition
    if (nic2ZqlCondition) {
      nicCondition = {
        [ZOp.or]: [{ [ZOp.and]: nicZqlCondition }, { [ZOp.and]: nic2ZqlCondition }]
      }
    }

    const zqlObject = {
      tableName: 'VmNic',
      condition: nicCondition
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const relationList: any[] = results?.[0]?.inventories ?? []

    if (!needInfo) {
      const uuidList = relationList.reduce((acc, cur) => {
        acc.push(cur.l3NetworkUuid)
        acc.push(cur.vmInstanceUuid)
        return acc
      }, uuids)
      resourceList = [...new Set(uuidList)].map(uuid => ({ uuid }))
    }

    return {
      resourceList,
      relationList,
      total: vmTotal + networkTotal
    }
  }

  async queryRelation({ vmUuids, l3NetworkUuids, zoneUuid }: NetworkTopologyRelationQuery) {
    let nicCondition: ZqlObject['condition'] = {
      [ZOp.or]: [
        {
          ['vmInstance.uuid']: VmUuidInVmInstance
        },
        {
          ['vmInstance.uuid']: VmUuidInVpcRouter
        }
      ],
      ['vmInstance.uuid']: VmUuidNotInVCenter,
      ['l3Network.system']: false
    }

    if (vmUuids) {
      nicCondition = {
        [ZOp.and]: {
          nicCondition,
          ['vmInstance.uuid']: {
            [ZOp.in]: vmUuids
          }
        }
      }
    }
    if (l3NetworkUuids) {
      nicCondition['l3Network.uuid'] = {
        [ZOp.in]: l3NetworkUuids
      }
    }
    if (zoneUuid) {
      nicCondition['l3Network.zoneUuid'] = zoneUuid
    }

    const { list, total } = await this.zqlQueryByTableName('VmNic', nicCondition)

    return {
      list,
      total
    }
  }

  async queryVRouterRelation(zoneUuid?: string) {
    const nicCondition = this.addVRouterVmNicCondition()
    if (zoneUuid) {
      nicCondition['l3Network.zoneUuid'] = zoneUuid
    }
    const { list, total } = await this.zqlQueryByTableName('VmNic', nicCondition, {})

    return {
      list,
      total
    }
  }

  addVRouterVmNicCondition = () => {
    return {
      ['vmInstance.uuid']: {
        ...VmUuidInVpcRouter,
        ...VmUuidNotInVCenter
      },
      ['l3Network.system']: false
    }
  }

  addVmCondition = (conditions: ZqlObject['condition']) => {
    // 只查询云主机
    const zstackCondition = {
      type: {
        [ZOp.in]: ['UserVm', 'baremetal2']
      },
      state: {
        [ZOp.ne]: 'Destroyed'
      },
      hypervisorType: {
        [ZOp.in]: ['KVM', 'baremetal2']
      }
    }
    return this.mergeZqlContion(conditions, zstackCondition)
  }

  addNetworkCondition = (conditions: ZqlObject['condition']) => {
    const zstackCondition = {
      uuid: buildUuidInTable('L3Network.uuid', { ['l2Network.cluster.type']: 'vmware' }, ZOp.notIn),
      category: {
        [ZOp.in]: ['Private', 'Public']
      }
    }
    return this.mergeZqlContion(conditions, zstackCondition)
  }

  mergeZqlContion = (conditions: ZqlObject['condition'], newconditions: ZqlObject['condition']) => {
    let zqlCondition = newconditions
    if (!_isEmpty(conditions)) {
      zqlCondition = {
        [ZOp.and]: _concat(conditions, newconditions)
      }
    }
    return zqlCondition
  }

  zqlQueryByTableName = async (tableName: string, condition, params = {} as any) => {
    const zqlObject = {
      tableName,
      condition,
      orderBy: params.sortBy,
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const list: any[] = results?.[0]?.inventories ?? []
    const total: number = results?.[0]?.total ?? 0
    return {
      list,
      total
    }
  }
}
