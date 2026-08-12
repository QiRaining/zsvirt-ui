import { Inject, Injectable } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import { find as _find } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetZMigrateGatewayVmInstancesAction } from '@/api/zstack/GetZMigrateGatewayVmInstancesAction'
import ZQL, { ZOp, ZQLAction } from '@/common/zql/index'
import { ZsSession } from '@/model/zs-session.model'

@Injectable()
export class SearchResourceService {
  @Inject()
  zqlService: ZQLService
  @Inject() getZMigrateGatewayVmInstancesAction: GetZMigrateGatewayVmInstancesAction
  @Inject(CONTEXT) private readonly context
  @InjectModel(ZsSession) private zsSession: typeof ZsSession

  protected getSessionId(req?: any): string {
    const _req = req ?? this.context.req
    return _req.headers['x-session-id']
  }

  protected getZsSession() {
    return this.zsSession
  }

  search = async (keyword, zonUuid) => {
    const sessionId = this.getSessionId()
    const session = await this.getZsSession().findOne({
      where: {
        sessionId
      }
    })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }
    const LIMIT = 100000

    const defaultZqlObject = {
      action: ZQLAction.SEARCH,
      keyword: keyword
    }

    const zqlObject = !zonUuid
      ? defaultZqlObject
      : {
          ...defaultZqlObject,
          restrictBy: {
            'zone.uuid': {
              [ZOp.eq]: zonUuid
            }
          }
        }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)

    let {
      results: [{ total = 0 }]
    } = resp
    const {
      results: [{ inventories: list = [] }]
    } = resp

    // IP 反查虚拟机：当关键词像 IP 地址时，通过 vmNics.ip 反查虚拟机并合并到结果
    const isIpLike = /^[\d.]+$/.test(keyword) && keyword.includes('.')
    if (isIpLike) {
      const vmByIpZqlObject: any = {
        action: ZQLAction.QUERY,
        tableName: 'vmInstance',
        fields: ['uuid', 'name'],
        condition: {
          'vmNics.ip': {
            [ZOp.like]: keyword
          }
        },
        limit: LIMIT
      }

      if (zonUuid) {
        vmByIpZqlObject.condition['zone.uuid'] = {
          [ZOp.eq]: zonUuid
        }
      }

      const vmByIpZql = ZQL.stringify(vmByIpZqlObject)
      const vmByIpResp = await this.zqlService.call(vmByIpZql)
      const vmByIpList = vmByIpResp?.results?.[0]?.inventories ?? []

      const existingUuids = new Set(list.map(item => item.uuid))
      for (const vm of vmByIpList) {
        if (!existingUuids.has(vm.uuid)) {
          list.push({
            resourceName: vm.name,
            resourceType: 'VmInstanceVO',
            uuid: vm.uuid
          })
          total += 1
          existingUuids.add(vm.uuid)
        }
      }
    }

    // 二次处理
    const resList = []
    const hideList = [
      'ESXHostVO', // 前端没有单独展示的页面
      'VpcFirewallRuleTemplateVO', // 前端没有单独展示的页面
      'VpcFirewallIpSetTemplateVO', // 前端没有单独展示的页面
      'StackTemplateVO', //资源栈模板 暂不需要支持
      'PreconfigurationTemplateVO'
    ]

    const zqlObjects = []

    // zone的查询
    zqlObjects.push({
      tableName: 'zone',
      fields: ['uuid', 'name'],
      condition: {
        [ZOp.or]: {
          name: {
            [ZOp.like]: keyword
          },
          uuid: keyword
        }
      },
      limit: LIMIT,
      namedAs: 'zoneList'
    })

    // 需要反查的资源
    // ClusterVO 需要区分普通集群和裸金属集群
    if (_find(list, { resourceType: 'ClusterVO' })) {
      zqlObjects.push({
        tableName: 'cluster',
        fields: ['uuid', 'hypervisorType'],
        limit: LIMIT,
        namedAs: 'clusterList'
      })
    }
    // VmInstanceVO 有多种子类型，需要全部查出，后续可优化
    if (_find(list, { resourceType: 'VmInstanceVO' })) {
      zqlObjects.push({
        tableName: 'vmInstance',
        fields: ['uuid', 'hypervisorType'],
        limit: LIMIT,
        namedAs: 'vmInstanceList'
      })
    }
    // VolumeVO 查询所有 vCenter 相关
    if (_find(list, { resourceType: 'VolumeVO' })) {
      zqlObjects.push({
        tableName: 'volume',
        fields: ['uuid', 'format', 'type'],
        condition: {
          type: 'Data'
        },
        limit: LIMIT,
        namedAs: 'volumeList'
      })
    }
    // ImageVO 有3种子类型，需要全部拉取
    if (_find(list, { resourceType: 'ImageVO' })) {
      zqlObjects.push({
        tableName: 'image',
        fields: ['uuid', 'type', 'system', 'format'],
        limit: LIMIT,
        namedAs: 'imageList'
      })
    }
    // AffinityGroupVO 用户设定亲和组
    // if (_find(list, { resourceType: 'AffinityGroupVO' })) {
    //   zqlObjects.push({
    //     tableName: 'affinityGroup',
    //     fields: ['uuid'],
    //     condition: {
    //       appliance: 'CUSTOMER'
    //     },
    //     limit: LIMIT,
    //     namedAs: 'affinityGroupList'
    //   })
    // }
    if (
      _find(list, { resourceType: 'L2NetworkVO' }) ||
      _find(list, { resourceType: 'L2VlanNetworkVO' }) ||
      _find(list, { resourceType: 'L2VirtualSwitchNetworkVO' })
    ) {
      zqlObjects.push({
        tableName: 'l2network',
        fields: ['uuid'],
        condition: {
          'cluster.type': 'vmware'
        },
        limit: LIMIT,
        namedAs: 'l2NetworkVCenterList'
      })
    }
    // L3NetworkVO 三层网络
    if (_find(list, { resourceType: 'L3NetworkVO' })) {
      zqlObjects.push({
        tableName: 'L3Network',
        fields: ['uuid'],
        condition: {
          'l2Network.cluster.type': 'vmware'
        },
        limit: LIMIT,
        namedAs: 'vmwareL3NetworkList'
      })
      zqlObjects.push({
        tableName: 'L3Network',
        fields: ['uuid'],
        condition: {
          system: false,
          category: 'Private',
          type: 'L3BasicNetwork',
          'l2Network.cluster.type': 'zstack'
        },
        limit: LIMIT,
        namedAs: 'flatL3NetworkList'
      })
      zqlObjects.push({
        tableName: 'L3Network',
        fields: ['uuid'],
        condition: {
          category: 'public',
          'l2Network.cluster.type': 'zstack'
        },
        limit: LIMIT,
        namedAs: 'publicL3NetworkList'
      })
      zqlObjects.push({
        tableName: 'L3Network',
        fields: ['uuid'],
        condition: {
          system: false,
          category: 'Private',
          type: 'L3VpcNetwork',
          'l2Network.cluster.type': 'zstack'
        },
        limit: LIMIT,
        namedAs: 'vpcL3NetworkList'
      })
      zqlObjects.push({
        tableName: 'L3Network',
        fields: ['uuid'],
        condition: {
          system: true,
          category: 'System',
          type: 'L3BasicNetwork',
          __systemTag__: {
            [ZOp.ne]: 'mirrorNetwork'
          },
          'l2Network.cluster.type': 'zstack'
        },
        limit: LIMIT,
        namedAs: 'manageL3NetworkList'
      })
      zqlObjects.push({
        tableName: 'L3Network',
        fields: ['uuid'],
        condition: {
          system: true,
          category: 'System',
          type: 'L3BasicNetwork',
          __systemTag__: 'mirrorNetwork',
          'l2Network.cluster.type': 'zstack'
        },
        limit: LIMIT,
        namedAs: 'flowL3NetworkList'
      })
    }

    // 查询报警器中文名
    const alarmResults = list.filter(
      item => item.resourceType === 'AlarmVO' || item.resourceType === 'EventSubscriptionVO'
    )
    if (alarmResults.length) {
      zqlObjects.push({
        tableName: 'SystemTag',
        fields: ['resourceUuid', 'tag'],
        condition: {
          resourceUuid: {
            [ZOp.in]: alarmResults.map(item => item.uuid)
          },
          tag: {
            [ZOp.like]: 'name::cn::'
          }
        },
        limit: LIMIT,
        namedAs: 'alarmZhNameList'
      })
    }

    const zqlResourceResp: any = {}

    if (zqlObjects.length > 0) {
      const zqlResource = ZQL.multStringify(zqlObjects)
      const { results: zqlResourceRespResult } = await this.zqlService.call(zqlResource)

      zqlResourceRespResult.forEach(item => {
        zqlResourceResp[item.name] = item.inventories || []
      })
    }

    // 获取迁移网关虚拟机 UUID 列表，用于搜索结果分类
    let gatewayVmUuids = new Set<string>()
    if (_find(list, { resourceType: 'VmInstanceVO' })) {
      try {
        const result = await this.getZMigrateGatewayVmInstancesAction.call({})
        gatewayVmUuids = new Set((result?.gatewayVmInstances ?? []).map(vm => vm.uuid))
      } catch {
        // 获取迁移网关虚拟机列表失败时不影响正常搜索
      }
    }

    zqlResourceResp?.zoneList?.forEach(zone => {
      resList.push({
        resourceName: zone?.name,
        resourceType: 'ZoneVO',
        uuid: zone?.uuid
      })
    })

    // 过滤 vcenter
    list.forEach(item => {
      if (hideList.includes(item.resourceType)) {
        total -= 1
      } else if (item.resourceType === 'ClusterVO') {
        // 区分普通集群和裸金属集群
        if (
          _find(zqlResourceResp?.clusterList, {
            uuid: item.uuid,
            hypervisorType: 'baremetal'
          })
        ) {
          resList.push({
            ...item,
            resourceType: 'BaremetalClusterVO'
          })
        } else {
          resList.push(item)
        }
      } else if (item.resourceType === 'VmInstanceVO') {
        if (
          _find(zqlResourceResp?.vmInstanceList, {
            uuid: item.uuid,
            hypervisorType: 'ESX'
          })
        ) {
          resList.push({
            ...item,
            resourceType: 'VCenterVmInstanceVO'
          })
        } else if (gatewayVmUuids.has(item.uuid)) {
          resList.push({
            ...item,
            resourceType: 'GatewayVmInstanceVO'
          })
        } else {
          resList.push(item)
        }
      } else if (item.resourceType === 'VolumeVO') {
        if (
          _find(zqlResourceResp?.volumeList, {
            uuid: item.uuid,
            format: 'vmtx'
          })
        ) {
          resList.push({
            ...item,
            resourceType: 'VCenterVolumeVO'
          })
        } else if (
          _find(zqlResourceResp?.volumeList, {
            uuid: item.uuid
          })
        ) {
          resList.push(item)
        } else {
          total -= 1
        }
      } else if (item.resourceType === 'ImageVO') {
        if (_find(zqlResourceResp?.imageList, { uuid: item.uuid, system: true })) {
          resList.push({
            ...item,
            resourceType: 'VRouterImageVO'
          })
        } else if (_find(zqlResourceResp?.imageList, { uuid: item.uuid, format: 'vmtx' })) {
          resList.push({
            ...item,
            resourceType: 'VCenterImageVO'
          })
        } else {
          resList.push(item)
        }
      } else if (item.resourceType === 'AffinityGroupVO') {
        if (_find(zqlResourceResp?.affinityGroupList, { uuid: item.uuid })) {
          resList.push(item)
        } else {
          total -= 1
        }
      } else if (item.resourceType === 'L2NetworkVO' || item.resourceType === 'L2VlanNetworkVO') {
        if (_find(zqlResourceResp?.l2NetworkVCenterList, { uuid: item.uuid })) {
          total -= 1
        } else {
          resList.push(item)
        }
      } else if (item.resourceType === 'L3NetworkVO' || item.resourceType === 'PortGroupVO') {
        if (_find(zqlResourceResp?.vmwareL3NetworkList, { uuid: item.uuid })) {
          resList.push({
            ...item,
            resourceType: 'VCenterL3NetworkVO'
          })
        } else if (_find(zqlResourceResp?.flatL3NetworkList, { uuid: item.uuid })) {
          resList.push({
            ...item,
            resourceType: 'FlatL3NetworkVO'
          })
        } else if (_find(zqlResourceResp?.publicL3NetworkList, { uuid: item.uuid })) {
          resList.push({
            ...item,
            resourceType: 'PublicL3NetworkVO'
          })
        } else if (_find(zqlResourceResp?.vpcL3NetworkList, { uuid: item.uuid })) {
          resList.push({
            ...item,
            resourceType: 'VpcL3NetworkVO'
          })
        } else if (_find(zqlResourceResp?.manageL3NetworkList, { uuid: item.uuid })) {
          resList.push({
            ...item,
            resourceType: 'ManageL3NetworkVO'
          })
        } else if (_find(zqlResourceResp?.flowL3NetworkList, { uuid: item.uuid })) {
          resList.push({
            ...item,
            resourceType: 'FlowL3NetworkVO'
          })
        } else if (item.resourceType === 'PortGroupVO') {
          resList.push({
            ...item,
            resourceType: 'L3NetworkVO'
          })
        } else {
          resList.push(item)
        }
      } else if (item.resourceType === 'AlarmVO' || item.resourceType === 'EventSubscriptionVO') {
        const tag = _find(zqlResourceResp?.alarmZhNameList, {
          resourceUuid: item.uuid
        })?.tag
        if (tag) {
          resList.push({
            ...item,
            resourceZhName: tag.split('name::cn::')[1]
          })
        } else {
          resList.push(item)
        }
      } else {
        resList.push(item)
      }
    })

    // 按 uuid 去重，避免共享资源在搜索结果中出现多次
    const uniqueResList = [...new Map(resList.map(item => [item.uuid, item])).values()]

    return {
      list: uniqueResList,
      total: total - (resList.length - uniqueResList.length)
    }
  }
}
