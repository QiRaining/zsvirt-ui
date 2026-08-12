import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { get as _get, reduce as _reduce } from 'lodash'

import { QueryParam } from '@/api/zstack/base/query-base'
import { Op, Condition as ICondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateL3NetworkAction } from '@/api/zstack/CreateL3NetworkAction'
import { DeleteL3NetworkAction } from '@/api/zstack/DeleteL3NetworkAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { GetL3NetworkMtuAction } from '@/api/zstack/GetL3NetworkMtuAction'
import { GetL3NetworkRouterInterfaceIpAction } from '@/api/zstack/GetL3NetworkRouterInterfaceIpAction'
import { GetResourceAccountAction } from '@/api/zstack/GetResourceAccountAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { QueryVirtualRouterOfferingAction } from '@/api/zstack/QueryVirtualRouterOfferingAction'
import { QueryVpcRouterAction } from '@/api/zstack/QueryVpcRouterAction'
import { RevokeResourceSharingAction } from '@/api/zstack/RevokeResourceSharingAction'
import { ShareResourceAction } from '@/api/zstack/ShareResourceAction'
import { SystemTagInventory } from '@/api/zstack/types'
import { ActionService } from '@/base/action-service'
import { MetricDataService } from '@/common/metric-data/metric-data.service'
import ZQL, { ZOp } from '@/common/zql/index'

@Injectable()
export class L3NetworkService extends ActionService {
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() deleteTagAction: DeleteTagAction
  @Inject() metricDataService: MetricDataService
  @Inject() getL3NetworkMtuAction: GetL3NetworkMtuAction
  @Inject()
  getL3NetworkRouterInterfaceIpAction: GetL3NetworkRouterInterfaceIpAction
  @Inject() getResourceAccountAction: GetResourceAccountAction
  @Inject() createL3NetworkAction: CreateL3NetworkAction
  @Inject() deleteL3NetworkAction: DeleteL3NetworkAction
  @Inject() shareResourceAction: ShareResourceAction
  @Inject() revokeResourceSharingAction: RevokeResourceSharingAction
  @Inject() queryVirtualRouterOfferingAction: QueryVirtualRouterOfferingAction
  @Inject() queryVpcRouterAction: QueryVpcRouterAction
  @Inject() zqlService: ZQLService
  private dhcpDataloader
  private vrouterOfferingLoader
  private enableSRIOVLoader
  private vpcVRouterLoader
  private vswtichLoader
  private portGroupLoader

  constructor() {
    super()
    this.dhcpDataloader = new DataLoader(this._getDHCPIP)
    this.vrouterOfferingLoader = new DataLoader(this._getVrouterOffering)
    this.enableSRIOVLoader = new DataLoader(this._getEnableSRIOV)
    this.vpcVRouterLoader = new DataLoader(this._getVpcVRouter)
    this.vswtichLoader = new DataLoader(this._getVswitch)
    this.portGroupLoader = new DataLoader(this._getPortGroup)
  }

  _getEnableSRIOV = async l2NetwrokUuids => {
    const condition = {
      key: 'tag',
      op: Op.like,
      value: 'enableSRIOV'
    }
    const l2EnableSRIOVList = await this.querySystemTagByResourceUuids(l2NetwrokUuids, condition)
    return l2NetwrokUuids.map(uuid => {
      const systemTag = l2EnableSRIOVList.find(_systemTag => _systemTag.resourceUuid === uuid)
      return systemTag?.tag.split('::')[1] === 'true' || false
    })
  }

  async getEnableSRIOV(l2NetworkUuid) {
    return this.enableSRIOVLoader.load(l2NetworkUuid)
  }

  _getVrouterOffering = async vrouterOfferingUuids => {
    const { inventories } = await this.queryVirtualRouterOfferingAction.call({
      conditions: [
        {
          key: 'uuid',
          op: Op.in,
          values: vrouterOfferingUuids
        }
      ]
    })
    return vrouterOfferingUuids.map(uuid => {
      return inventories.find(vr => vr.uuid === uuid)
    })
  }

  async getVrouterOffering(vrouterOfferingUuid = '') {
    return this.vrouterOfferingLoader.load(vrouterOfferingUuid)
  }

  _getVpcVRouter = async l3NetworkUuids => {
    return l3NetworkUuids.map(uuid => this.qeuryVpcVRouterByL3Uuid(uuid))
  }

  async getVpcVRouter(l3NetworkUuid = '') {
    return this.vpcVRouterLoader.load(l3NetworkUuid)
  }

  _getVswitch = async portGroupUuids => {
    const zqlObject = {
      tableName: 'L2VirtualSwitchNetwork',
      condition: {
        ['portGroups.uuid']: {
          [ZOp.in]: portGroupUuids
        }
      }
    }
    const resp = await this.zqlService.call(ZQL.stringify(zqlObject))
    const vswitchList = resp.results?.[0]?.inventories
    return portGroupUuids.map(uuid => {
      const vswitch = vswitchList.find(
        item => item?.portGroups.findIndex(group => group.uuid === uuid) > -1
      )
      return vswitch ?? null
    })
  }

  async getVswitch(portGroupUuid) {
    return this.vswtichLoader.load(portGroupUuid)
  }

  async getPortGroup(portGroupUuid) {
    return this.portGroupLoader.load(portGroupUuid)
  }

  _getPortGroup = async portGroupUuids => {
    const zql = ZQL.stringify({
      tableName: 'PortGroup'
    })

    const { results } = await this.zqlService.call(zql)
    const inventories = results[0]?.inventories ?? []

    const portGroupMap = _reduce(
      inventories,
      (obj, portGroup) => {
        if (!obj[portGroup.uuid]) {
          obj[portGroup.uuid] = portGroup
        }
        return obj
      },
      {}
    )

    return portGroupUuids.map(uuid => portGroupMap[uuid])
  }

  qeuryVpcVRouterByL3Uuid = async l3NetworkUuid => {
    const { inventories } = await this.queryVpcRouterAction.call({
      conditions: [
        {
          key: 'vmNics.l3Network.uuid',
          value: l3NetworkUuid
        },
        {
          key: 'applianceVmType',
          value: 'vpcvrouter'
        },
        {
          key: 'haStatus',
          op: Op.ne,
          value: 'Backup'
        }
      ]
    })
    return inventories?.[0]
  }

  async getL3NetworkMtu(l3NetworkUuid) {
    const param = {
      l3NetworkUuid
    }
    const data = await this.getL3NetworkMtuAction.call(param)
    return data.mtu
  }

  async querySystemTagByResourceUuids(
    resourceUuids: string[],
    condition?: ICondition
  ): Promise<SystemTagInventory[]> {
    const params: QueryParam = {
      conditions: [{ key: 'resourceUuid', op: Op.in, values: resourceUuids }]
    }
    condition && params.conditions.push(condition)
    const { inventories } = await this.querySystemTagAction.call(params)
    return inventories
  }

  async deleteSystemTagByResourceUuid(resourceUuid: string, systemTag: string) {
    const systemTagList = await this.querySystemTagByResourceUuids([resourceUuid])

    if (systemTagList.length) {
      const _systemTag = systemTagList.find(({ tag }) => tag.includes(systemTag))
      _systemTag && (await this.deleteTagAction.call({ uuid: _systemTag.uuid }))
    }
    return { success: true }
  }

  _getDHCPIP = async uuids => {
    const zql = ZQL.stringify({
      tableName: 'systemTag',
      fields: ['tag', 'resourceUuid'],
      condition: {
        resourceType: 'L3NetworkVO',
        resourceUuid: {
          [ZOp.in]: uuids
        },
        tag: {
          [ZOp.like]: 'DhcpServer'
        }
      }
    })
    const resp = await this.zqlService.call(zql)
    const tagList = _get(resp, ['results', 0, 'inventories'], [])
    return uuids.map(uuid => {
      const tags = tagList.filter(ele => ele?.resourceUuid === uuid)
      return tags.length > 0
        ? tags.reduce((acc, { tag }) => {
            const ip: string = tag.split('::')[2].replace('--', '::')
            ip.includes(':') ? (acc.ipv6 = ip) : (acc.ipv4 = ip)
            return acc
          }, {})
        : {}
    })
  }

  async getDhcpip(l3NetworkUuid) {
    return this.dhcpDataloader.load(l3NetworkUuid)
  }

  async getL3NetworkRouterInterfaceIp(l3NetworkUuid) {
    const param = {
      l3NetworkUuid
    }
    const data = await this.getL3NetworkRouterInterfaceIpAction.call(param)
    if (data.routerInterfaceIp) {
      return data.routerInterfaceIp
    }
    return ''
  }
}
