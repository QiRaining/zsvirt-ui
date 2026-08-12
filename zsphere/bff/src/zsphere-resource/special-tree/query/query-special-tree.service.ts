import { Inject, Injectable } from '@nestjs/common'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetVmStartingCandidateClustersHostsAction } from '@/api/zstack/GetVmStartingCandidateClustersHostsAction'
import { ImageMediaType, ResourceTypeVO, VmInstanceState } from '@/common/enum'
import ZQL, { ZOp } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

export interface TreeSortParams {
  orderBy?: string
  orderDirection?: string
}

interface TreeSortOptions {
  orderBy: 'createDate' | 'name'
  orderDirection: 'asc' | 'desc'
}

const DEFAULT_TREE_SORT_PARAMS: TreeSortOptions = {
  orderBy: 'name',
  orderDirection: 'asc'
}

@Injectable()
export class QuerySpecialTreeService {
  @Inject() zqlService: ZQLService
  @Inject()
  getVmStartingCandidateClustersHosts: GetVmStartingCandidateClustersHostsAction

  private sortParams(params?: TreeSortParams): TreeSortOptions {
    const orderBy =
      params?.orderBy === 'createDate' || params?.orderBy === 'name'
        ? params.orderBy
        : DEFAULT_TREE_SORT_PARAMS.orderBy

    const orderDirection =
      params?.orderDirection === 'asc' || params?.orderDirection === 'desc'
        ? params.orderDirection
        : DEFAULT_TREE_SORT_PARAMS.orderDirection

    return { orderBy, orderDirection }
  }

  private sortTree<T extends { children?: T[]; createDate?: unknown; name?: unknown }>(
    list: T[],
    params?: TreeSortParams,
    collator = new Intl.Collator(undefined, { numeric: true })
  ): T[] {
    const { orderBy, orderDirection } = this.sortParams(params)
    const direction = orderDirection === 'asc' ? 1 : -1

    return [...list]
      .sort((lhs, rhs) => {
        if (orderBy === 'createDate') {
          const lhsTime = this.parseCreateDate(lhs?.createDate)
          const rhsTime = this.parseCreateDate(rhs?.createDate)

          if (lhsTime !== null && rhsTime !== null) {
            return (lhsTime - rhsTime) * direction
          }

          if (lhsTime !== null) {
            return -1
          }

          if (rhsTime !== null) {
            return 1
          }
        }

        const lhsValue = String(lhs?.[orderBy] ?? '')
        const rhsValue = String(rhs?.[orderBy] ?? '')

        return collator.compare(lhsValue, rhsValue) * direction
      })
      .map(node => {
        if (node.children?.length) {
          node.children = this.sortTree(node.children, params, collator)
        }

        return node
      })
  }

  private parseCreateDate(value: unknown): number | null {
    if (!value) {
      return null
    }

    if (typeof value === 'number') {
      return Number.isNaN(value) ? null : value
    }

    const rawTimestamp = Date.parse(String(value))
    if (!Number.isNaN(rawTimestamp)) {
      return rawTimestamp
    }

    const timestamp = Date.parse(String(value).replaceAll('-', '/'))

    return Number.isNaN(timestamp) ? null : timestamp
  }

  async queryList(params?: TreeSortParams) {
    const zqlObject = [
      {
        tableName: 'Zone',
        fields: ['name', 'uuid', 'createDate']
      },
      {
        tableName: 'Cluster',
        condition: { hypervisorType: { [ZOp.eq]: 'KVM' } },
        fields: ['name', 'uuid', 'zoneUuid', 'createDate']
      },
      {
        tableName: 'host',
        fields: ['name', 'uuid', 'clusterUuid', 'status', 'state', 'managementIp', 'createDate']
      },
      {
        tableName: 'VmInstance',
        fields: ['name', 'uuid', 'state', 'hostUuid', 'lastHostUuid', 'createDate'],
        condition: {
          state: { [ZOp.ne]: VmInstanceState.Destroyed },
          type: { [ZOp.ne]: 'TemplateVM' },
          [ZOp.and]: [
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.and]: {
                    [ZOp.query]: {
                      tableName: 'templatedVminstance',
                      fields: ['uuid']
                    }
                  }
                }
              }
            },
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.and]: {
                    [ZOp.query]: {
                      tableName: 'templatedVminstanceCache',
                      fields: ['cacheVmInstanceUuid']
                    }
                  }
                }
              }
            }
          ]
        }
      },
      {
        tableName: 'VmNic',
        fields: ['vmInstanceUuid', 'ip', 'mac']
      }
    ]

    const zql = ZQL.multStringify(zqlObject as ZqlObject[])
    const { results } = await this.zqlService.call(zql)
    const zones = _.get(results, ['0', 'inventories'], [])
    const clusters = _.get(results, ['1', 'inventories'], [])
    const hosts = _.get(results, ['2', 'inventories'], [])
    const vmInstances = _.get(results, ['3', 'inventories'], [])
    const vmNics = _.get(results, ['4', 'inventories'], [])

    return {
      list: this.sortTree(this.buildTree(zones, clusters, hosts, vmInstances, vmNics), params)
    }
  }

  buildTree(zoneList, clusterList, hostList, vmList, vmNicList) {
    const zoneLookup = {}
    for (const zone of zoneList) {
      zoneLookup[zone.uuid] = {
        ...zone,
        key: zone.uuid,
        title: zone.name,
        isLeaf: true,
        resourceTypeVO: ResourceTypeVO.ZoneVO,
        resourceType: 'zone',
        children: []
      }
    }

    const clusterLookup = {}
    for (const cluster of clusterList) {
      cluster.children = []
      cluster.key = cluster.uuid
      cluster.title = cluster.name
      cluster.isLeaf = true
      cluster.resourceType = 'cluster'
      cluster.resourceTypeVO = ResourceTypeVO.ClusterVO
      clusterLookup[cluster.uuid] = cluster
      if (zoneLookup[cluster.zoneUuid]) {
        zoneLookup[cluster.zoneUuid].children.push(cluster)
        zoneLookup[cluster.zoneUuid].isLeaf = false
      }
    }
    const chassisLookup = {}
    for (const host of hostList) {
      host.children = []
      host.key = host.uuid
      host.title = host.name
      host.isLeaf = true
      host.resourceTypeVO = ResourceTypeVO.HostVO
      host.resourceType = 'host'
      host.extraAttrib = [{ type: 'ip', value: host.managementIp }]
      chassisLookup[host.uuid] = host
      if (clusterLookup[host.clusterUuid]) {
        clusterLookup[host.clusterUuid].children.push(host)
        clusterLookup[host.clusterUuid].isLeaf = false
      }
    }
    const vmNicLookup = _.groupBy(vmNicList, 'vmInstanceUuid')
    for (const vm of vmList) {
      const hostUuid = vm?.hostUuid || vm?.lastHostUuid
      if (chassisLookup[hostUuid]) {
        const extraAttrib = []
        vmNicLookup[vm.uuid]?.forEach(({ ip, mac }) => {
          if (ip) {
            extraAttrib.push({ type: 'ip', value: ip })
          }
          if (mac) {
            extraAttrib.push({ type: 'mac', value: mac })
          }
        })
        chassisLookup[hostUuid].isLeaf = false
        chassisLookup[hostUuid].children.push({
          ...vm,
          key: vm.uuid,
          title: vm.name,
          isLeaf: true,
          extraAttrib,
          resourceTypeVO: ResourceTypeVO.VmInstanceVO,
          resourceType: 'vm'
        })
      }
    }
    return _.values(zoneLookup)
  }

  async queryNetworkList(params?: TreeSortParams) {
    const zqlObject = [
      {
        tableName: 'Zone',
        fields: ['name', 'uuid', 'createDate']
      },
      {
        tableName: 'l2network',
        condition: { type: { [ZOp.ne]: 'portGroup' } },
        fields: ['name', 'uuid', 'zoneUuid', 'type', 'createDate']
      },
      {
        tableName: 'PortGroup', // port group 除了表里信息，其他信息都是跟l3相关的
        fields: ['name', 'uuid', 'vSwitchUuid', 'zoneUuid', 'createDate']
      }
    ]

    const zql = ZQL.multStringify(zqlObject as ZqlObject[])
    const { results } = await this.zqlService.call(zql)
    const zones = _.get(results, ['0', 'inventories'], [])
    const l2s = _.get(results, ['1', 'inventories'], [])
    const portGroups = _.get(results, ['2', 'inventories'], [])

    const portGroupsUuids = portGroups.map(it => it.uuid)
    // 区分kernel网络
    const kernelZql = ZQL.stringify({
      tableName: 'HostKernelInterface',
      fields: ['uuid', 'l3NetworkUuid'],
      condition: { l3NetworkUuid: { [ZOp.in]: portGroupsUuids } },
      orderBy: 'createDate',
      orderDirection: 'desc'
    })
    const { results: kernelResults } = await this.zqlService.call(kernelZql)
    const kernels = kernelResults?.[0]?.inventories ?? []

    // 普通用户无权限获取分布式交换机的情况
    const orphanPortGroups = _.differenceWith(
      portGroups,
      l2s,
      (lhs: any, rhs: any) => lhs.vSwitchUuid === rhs.uuid
    )
    const orphanPortGroupMap = _.groupBy(orphanPortGroups, 'vSwitchUuid')
    const unauthorizedVSwitchUuids = Object.keys(orphanPortGroupMap)
    l2s.push(
      ...unauthorizedVSwitchUuids.map(uuid => {
        const name = uuid
        const zoneUuid = orphanPortGroupMap[uuid]?.[0]?.zoneUuid
        return { uuid, name, zoneUuid, type: 'virtualSwitch' }
      })
    )

    return { list: this.sortTree(this.buildNetworkTree(zones, l2s, portGroups, kernels), params) }
  }

  buildNetworkTree(zoneList, l2NetworkList, portGroups, kernels) {
    const zoneLookup = {}
    for (const zone of zoneList) {
      zoneLookup[zone.uuid] = {
        ...zone,
        key: zone.uuid,
        title: zone.name,
        isLeaf: true,
        resourceTypeVO: ResourceTypeVO.ZoneVO,
        resourceType: 'zone',
        children: []
      }
    }

    const l2NerworkLookup = {}
    for (const l2 of l2NetworkList) {
      l2.children = []
      l2.key = l2.uuid
      l2.title = l2.name
      l2.isLeaf = true
      l2.resourceType = 'l2-network'
      l2NerworkLookup[l2.uuid] = l2
      if (zoneLookup[l2.zoneUuid]) {
        zoneLookup[l2.zoneUuid].children.push(l2)
        zoneLookup[l2.zoneUuid].isLeaf = false
      }
    }
    // 区分kernel网络
    const l3UuidsInKernel: string[] = kernels.map(it => it.l3NetworkUuid)
    for (const port of portGroups) {
      if (l2NerworkLookup[port.vSwitchUuid]) {
        l2NerworkLookup[port.vSwitchUuid].isLeaf = false
        l2NerworkLookup[port.vSwitchUuid].children.push({
          ...port,
          key: port.uuid,
          title: port.name,
          isLeaf: true,
          resourceType: 'l3-network',
          iconType: l3UuidsInKernel.includes(port.uuid) ? 'kernel-portgroup' : undefined
        })
      }
    }

    return _.values(zoneLookup)
  }

  async queryDataStorageList(params?: TreeSortParams) {
    const zqlObject = [
      {
        tableName: 'Zone',
        fields: ['name', 'uuid', 'createDate']
      },
      {
        tableName: 'primaryStorage',
        fields: ['name', 'uuid', 'zoneUuid', 'state', 'status', 'createDate']
      }
    ]

    const zql = ZQL.multStringify(zqlObject as ZqlObject[])
    const { results } = await this.zqlService.call(zql)
    const zones = _.get(results, ['0', 'inventories'], [])
    const psList = _.get(results, ['1', 'inventories'], [])

    return { list: this.sortTree(this.buildDataStorageTree(zones, psList), params) }
  }

  buildDataStorageTree(zoneList, psList) {
    const zoneLookup = {}
    for (const zone of zoneList) {
      zoneLookup[zone.uuid] = {
        ...zone,
        key: zone.uuid,
        title: zone.name,
        isLeaf: true,
        resourceTypeVO: ResourceTypeVO.ZoneVO,
        resourceType: 'zone',
        children: []
      }
    }

    for (const ps of psList) {
      ps.children = []
      ps.key = ps.uuid
      ps.title = ps.name
      ps.isLeaf = true
      ps.resourceType = 'primary-storage'
      if (zoneLookup[ps.zoneUuid]) {
        zoneLookup[ps.zoneUuid].children.push(ps)
        zoneLookup[ps.zoneUuid].isLeaf = false
      }
    }
    return _.values(zoneLookup)
  }

  async queryTemplateVMList(params?: TreeSortParams) {
    const zqlObject = [
      {
        tableName: 'Zone',
        fields: ['name', 'uuid', 'createDate']
      },
      {
        tableName: 'backupstorage',
        fields: ['name', 'uuid', 'state', 'status', 'createDate'],
        condition: {
          __systemTag__: {
            [ZOp.notIn]: ['remote', 'onlybackup', 'aliyun', 'remotebackup']
          }
        }
      },
      {
        tableName: 'image',
        fields: ['name', 'uuid', 'state', 'status', 'mediaType', 'createDate'],
        condition: {
          system: 'false',
          __systemTag__: { [ZOp.ne]: 'remote' },
          status: { [ZOp.ne]: 'Deleted' }
        }
      },
      {
        tableName: 'BackupStorageZoneRef',
        fields: ['zoneUuid', 'backupStorageUuid'],
        orderBy: 'createDate',
        orderDirection: 'desc'
      },
      {
        tableName: 'ImageBackupStorageRef',
        fields: ['imageUuid', 'backupStorageUuid'],
        orderBy: 'createDate',
        orderDirection: 'desc'
      }
    ]

    const zql = ZQL.multStringify(zqlObject as ZqlObject[])
    const { results } = await this.zqlService.call(zql)
    const zones = _.get(results, ['0', 'inventories'], [])
    const bsList = _.get(results, ['1', 'inventories'], [])
    const imageList = _.get(results, ['2', 'inventories'], [])
    const bsZoneList = _.get(results, ['3', 'inventories'], [])
    const bsImageList = _.get(results, ['4', 'inventories'], [])

    return {
      list: this.sortTree(
        this.buildTemplateVMTree(zones, bsList, imageList, bsZoneList, bsImageList),
        params
      )
    }
  }

  buildTemplateVMTree(zoneList, bsList, imageList, bsZoneList, bsImageList) {
    const bsZoneMap = {} as { [key: string]: string }
    for (const zoneBs of bsZoneList) {
      bsZoneMap[zoneBs.backupStorageUuid] = zoneBs.zoneUuid
    }

    const bsImageMap = {} as { [key: string]: string }
    for (const imageBs of bsImageList) {
      bsImageMap[imageBs.imageUuid] = imageBs.backupStorageUuid
    }

    const zoneLookup = {}
    for (const zone of zoneList) {
      zoneLookup[zone.uuid] = {
        ...zone,
        key: zone.uuid,
        title: zone.name,
        isLeaf: true,
        resourceTypeVO: ResourceTypeVO.ZoneVO,
        resourceType: 'zone',
        children: []
      }
    }

    const bsLookup = {}
    for (const bs of bsList) {
      bs.children = []
      bs.key = bs.uuid
      bs.title = bs.name
      bs.isLeaf = true
      bs.resourceType = 'backup-storage'
      bsLookup[bs.uuid] = bs
      const zoneUuid = _.get(bsZoneMap, bs.uuid)
      if (!!zoneUuid && !!zoneLookup[zoneUuid]) {
        zoneLookup[zoneUuid].children.push(bs)
        zoneLookup[zoneUuid].isLeaf = false
      }
    }
    for (const image of imageList) {
      const bsUuid = _.get(bsImageMap, image.uuid)
      if (bsLookup[bsUuid]) {
        bsLookup[bsUuid].isLeaf = false
        bsLookup[bsUuid].children.push({
          ...image,
          key: image.uuid,
          title: image.name,
          isLeaf: true,
          iconType:
            image?.mediaType === ImageMediaType.DataVolumeTemplate ? 'hard-disk-image' : 'cd',
          resourceType: 'image'
        })
      }
    }

    return _.values(zoneLookup)
  }

  async queryVMDirectoryTreeList(params?: TreeSortParams) {
    const zqlObject = [
      {
        tableName: 'Zone',
        fields: ['name', 'uuid', 'createDate']
      },
      {
        tableName: 'directory',
        fields: ['name', 'uuid', 'zoneUuid', 'parentUuid', 'rootDirectoryUuid', 'createDate'],
        condition: { type: 'default' }
      },
      {
        tableName: 'resourceDirectoryRef',
        fields: ['directoryUuid', 'resourceUuid'],
        condition: { resourceType: 'VmInstanceVO' },
        orderBy: 'createDate',
        orderDirection: 'desc'
      },
      {
        tableName: 'VmInstance',
        fields: ['name', 'uuid', 'state', 'zoneUuid', 'createDate'],
        condition: {
          state: { [ZOp.ne]: VmInstanceState.Destroyed },
          type: { [ZOp.ne]: 'TemplateVM' },
          [ZOp.and]: [
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.and]: {
                    [ZOp.query]: {
                      tableName: 'templatedVminstance',
                      fields: ['uuid']
                    }
                  }
                }
              }
            },
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.and]: {
                    [ZOp.query]: {
                      tableName: 'templatedVminstanceCache',
                      fields: ['cacheVmInstanceUuid']
                    }
                  }
                }
              }
            }
          ]
        }
      },
      {
        tableName: 'VmNic',
        fields: ['vmInstanceUuid', 'ip', 'mac']
      }
    ]
    const zql = ZQL.multStringify(zqlObject as ZqlObject[])
    const { results } = await this.zqlService.call(zql)
    const zones = _.get(results, ['0', 'inventories'], [])
    const dirs = _.get(results, ['1', 'inventories'], [])
    const dirVmRefs = _.get(results, ['2', 'inventories'], [])
    const vms = _.get(results, ['3', 'inventories'], [])
    const vmNics = _.get(results, ['4', 'inventories'], [])

    return {
      list: this.sortTree(this.buildVMDirectoryTree(zones, dirs, dirVmRefs, vms, vmNics), params)
    }
  }

  list2tree(data, pid) {
    const result = []
    for (const node of data) {
      if (node.parentUuid === pid) {
        const children = this.list2tree(data, node.uuid)
        if (children.length) {
          node.children = children
          node.isLeaf = false
        } else {
          node.isLeaf = true
        }
        node.key = node.uuid
        node.title = node.name
        result.push(node)
      }
    }
    return result
  }

  buildVMDirectoryTree(zoneList, dirs, dirVmRefs, vms, vmNics) {
    const inGroupVmUuids = Array.from(new Set(dirVmRefs.map(t => t.resourceUuid)))
    const vmNicLookup = _.groupBy(vmNics, 'vmInstanceUuid')

    const zoneChildrenVMPart = vms.map(t => {
      const extraAttrib = []
      vmNicLookup[t.uuid]?.forEach(({ ip, mac }) => {
        if (ip) {
          extraAttrib.push({ type: 'ip', value: ip })
        }
        if (mac) {
          extraAttrib.push({ type: 'mac', value: mac })
        }
      })
      return {
        ...t,
        extraAttrib,
        resourceType: 'vm',
        parentUuid:
          inGroupVmUuids.indexOf(t.uuid) !== -1
            ? dirVmRefs.filter(ref => ref.resourceUuid === t.uuid)[0]?.directoryUuid
            : `-2${t.zoneUuid}`
      }
    })

    const zoneChildrenDirPart = dirs.map(t => ({
      ...t,
      resourceType: 'directory',
      parentUuid: t.parentUuid ? t.parentUuid : t.zoneUuid
    }))

    const zoneChildrenList = zoneChildrenVMPart.concat(zoneChildrenDirPart)

    const zoneLookup = {}
    for (const zone of zoneList) {
      const children = this.list2tree(
        zoneChildrenList
          .filter(t => t.zoneUuid === zone.uuid)
          .concat([
            {
              name: 'default',
              uuid: `-2${zone.uuid}`,
              zoneUuid: zone.uuid,
              parentUuid: zone.uuid,
              resourceType: 'directory'
            }
          ]),
        zone.uuid
      )
      zoneLookup[zone.uuid] = {
        ...zone,
        key: zone.uuid,
        title: zone.name,
        isLeaf: !children || !children.length,
        resourceTypeVO: ResourceTypeVO.ZoneVO,
        resourceType: 'zone',
        children
      }
    }

    return _.values(zoneLookup)
  }

  async queryVmSchedulingRuleTreeList(params?: TreeSortParams) {
    const zqlObject = [
      {
        tableName: 'Zone',
        fields: ['name', 'uuid', 'createDate']
      }
    ]

    const zql = ZQL.multStringify(zqlObject as ZqlObject[])
    const { results } = await this.zqlService.call(zql)
    const zones = _.get(results, ['0', 'inventories'], [])

    return { list: this.sortTree(this.buildVmSchedulingRuleTree(zones), params) }
  }

  buildVmSchedulingRuleTree(zoneList) {
    const zoneLookup = {}
    for (const zone of zoneList) {
      zoneLookup[zone.uuid] = {
        ...zone,
        key: zone.uuid,
        title: zone.name,
        isLeaf: true,
        resourceTypeVO: ResourceTypeVO.ZoneVO,
        resourceType: 'zone',
        iconType: 'building',
        children: []
      }
    }

    return _.values(zoneLookup)
  }

  //虚拟机模板
  async queryVmTemplateTreeList(params?: TreeSortParams) {
    const vmZql = ZQL.stringify({ tableName: 'vminstance', fields: ['uuid'] })
    const { results: vmResult } = await this.zqlService.call(vmZql)
    const vmUuids = vmResult?.[0]?.inventories?.map(it => it.uuid)

    const zqlObject = [
      {
        tableName: 'Zone',
        fields: ['name', 'uuid', 'createDate']
      },
      {
        tableName: 'VmInstance',
        fields: ['name', 'uuid', 'zoneUuid', 'createDate'],
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'TemplatedVmInstance',
                fields: ['uuid'],
                condition: { uuid: { [ZOp.in]: vmUuids } }
              }
            }
          }
        }
      }
    ]

    const zql = ZQL.multStringify(zqlObject as ZqlObject[])
    const { results } = await this.zqlService.call(zql)
    const zones = _.get(results, ['0', 'inventories'], [])
    const temps = _.get(results, ['1', 'inventories'], [])

    return { list: this.sortTree(this.buildVmTemplateTreeList(zones, temps), params) }
  }

  buildVmTemplateTreeList(zoneList, temps) {
    const zoneLookup = {}
    for (const zone of zoneList) {
      zoneLookup[zone.uuid] = {
        ...zone,
        key: zone.uuid,
        title: zone.name,
        isLeaf: true,
        resourceTypeVO: ResourceTypeVO.ZoneVO,
        resourceType: 'zone',
        children: []
      }
    }

    for (const tp of temps) {
      tp.children = []
      tp.key = tp.uuid
      tp.title = tp.name
      tp.isLeaf = true
      tp.resourceType = 'vm-template'
      if (zoneLookup[tp.zoneUuid]) {
        zoneLookup[tp.zoneUuid].children.push(tp)
        zoneLookup[tp.zoneUuid].isLeaf = false
      }
    }
    return _.values(zoneLookup)
  }

  async clusterAndHostsTreeListForTemplateConvertToVM(uuid) {
    const { hosts: hostForTemplate, clusters: clusterForTemplate } =
      await this.getVmStartingCandidateClustersHosts.call({ uuid })

    return {
      list: this.buildHostClusterTreeForTemplateConvertToVM(clusterForTemplate, hostForTemplate)
    }
  }

  buildHostClusterTreeForTemplateConvertToVM(clusters, hosts) {
    const clusterLookup = {}
    for (const cluster of clusters) {
      clusterLookup[cluster.uuid] = {
        ...cluster,
        key: cluster.uuid,
        title: cluster.name,
        isLeaf: true,
        resourceTypeVO: ResourceTypeVO.ClusterVO,
        resourceType: 'cluster',
        children: []
      }
    }

    for (const host of hosts) {
      host.children = []
      host.key = host.uuid
      host.title = host.name
      host.isLeaf = true
      host.resourceType = 'host'
      if (clusterLookup[host.clusterUuid]) {
        clusterLookup[host.clusterUuid].children.push(host)
        clusterLookup[host.clusterUuid].isLeaf = false
      }
    }

    return _.values(clusterLookup)
  }

  async queryL2NetworkList(params?: TreeSortParams) {
    const zqlObject = [
      {
        tableName: 'Zone',
        fields: ['name', 'uuid', 'createDate']
      },
      {
        tableName: 'l2network',
        condition: { type: { [ZOp.ne]: 'portGroup' } },
        fields: ['name', 'uuid', 'zoneUuid', 'type', 'createDate']
      }
    ]

    const zql = ZQL.multStringify(zqlObject as ZqlObject[])
    const { results } = await this.zqlService.call(zql)
    const zones = _.get(results, ['0', 'inventories'], [])
    const l2s = _.get(results, ['1', 'inventories'], [])

    return { list: this.sortTree(this.buildL2NetworkTree(zones, l2s), params) }
  }

  buildL2NetworkTree(zoneList, l2NetworkList) {
    const zoneLookup = {}
    for (const zone of zoneList) {
      zoneLookup[zone.uuid] = {
        ...zone,
        key: zone.uuid,
        title: zone.name,
        isLeaf: true,
        resourceTypeVO: ResourceTypeVO.ZoneVO,
        resourceType: 'zone',
        children: []
      }
    }

    for (const l2 of l2NetworkList) {
      l2.children = []
      l2.key = l2.uuid
      l2.title = l2.name
      l2.isLeaf = true
      l2.resourceType = 'l2-network'
      if (zoneLookup[l2.zoneUuid]) {
        zoneLookup[l2.zoneUuid].children.push(l2)
        zoneLookup[l2.zoneUuid].isLeaf = false
      }
    }
    return _.values(zoneLookup)
  }

  // 裸金属
  async queryBMTreeList(params?: TreeSortParams) {
    const zqlObject = [
      {
        tableName: 'Zone',
        fields: ['name', 'uuid', 'createDate']
      },
      {
        tableName: 'Cluster',
        fields: ['name', 'uuid', 'zoneUuid', 'createDate'],
        condition: {
          hypervisorType: { [ZOp.eq]: 'baremetal' },
          type: { [ZOp.eq]: 'baremetal' }
        }
      },
      {
        tableName: 'BaremetalChassis',
        fields: ['name', 'uuid', 'clusterUuid', 'status', 'state', 'createDate']
      },
      {
        tableName: 'BaremetalInstance',
        fields: ['name', 'uuid', 'state', 'status', 'chassisUuid', 'createDate'],
        condition: { state: { [ZOp.ne]: VmInstanceState.Destroyed } }
      }
    ]

    const zql = ZQL.multStringify(zqlObject as ZqlObject[])
    const { results } = await this.zqlService.call(zql)
    const zones = _.get(results, ['0', 'inventories'], [])
    const clusters = _.get(results, ['1', 'inventories'], [])
    const chassis = _.get(results, ['2', 'inventories'], [])
    const bmInstances = _.get(results, ['3', 'inventories'], [])

    return { list: this.sortTree(this.buildBMTree(zones, clusters, chassis, bmInstances), params) }
  }

  buildBMTree(zoneList, clusterList, chassisList, bmInstancesList) {
    const zoneLookup = {}
    for (const zone of zoneList) {
      zoneLookup[zone.uuid] = {
        ...zone,
        key: zone.uuid,
        title: zone.name,
        isLeaf: true,
        resourceTypeVO: ResourceTypeVO.ZoneVO,
        resourceType: 'zone',
        children: []
      }
    }

    const clusterLookup = {}
    for (const cluster of clusterList) {
      clusterLookup[cluster.uuid] = {
        ...cluster,
        key: cluster.uuid,
        title: cluster.name,
        isLeaf: true,
        resourceType: 'baremetal-cluster',
        resourceTypeVO: ResourceTypeVO.ClusterVO,
        children: []
      }
      if (zoneLookup[cluster.zoneUuid]) {
        zoneLookup[cluster.zoneUuid].children.push(clusterLookup[cluster.uuid])
        zoneLookup[cluster.zoneUuid].isLeaf = false
      }
    }
    const chassisLookup = {}
    for (const chassis of chassisList) {
      chassisLookup[chassis.uuid] = {
        ...chassis,
        key: chassis.uuid,
        title: chassis.name,
        isLeaf: true,
        resourceTypeVO: ResourceTypeVO.BareMetalChassisVO,
        resourceType: 'baremetal-chassis',
        children: []
      }
      if (clusterLookup[chassis.clusterUuid]) {
        clusterLookup[chassis.clusterUuid].children.push(chassisLookup[chassis.uuid])
        clusterLookup[chassis.clusterUuid].isLeaf = false
      }
    }
    for (const bm of bmInstancesList) {
      if (chassisLookup[bm.chassisUuid]) {
        chassisLookup[bm.chassisUuid].children.push({
          ...bm,
          key: bm.uuid,
          title: bm.name,
          isLeaf: true,
          resourceTypeVO: ResourceTypeVO.BareMetalInstanceVO,
          resourceType: 'baremetal-instance',
          extraAttrib: []
        })
        chassisLookup[bm.chassisUuid].isLeaf = false
      }
    }
    return _.values(zoneLookup)
  }
}
