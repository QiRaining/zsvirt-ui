import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { VmInstanceState } from '@/common/enum'
import ZQL, { ZOp } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { ResourceNode } from './resource-relations.model'

@Injectable()
export class ResoruceRelationsService {
  @Inject() zqlService: ZQLService

  async getRelationsByL2(l2NetworkUuid: string) {
    const zqlHostObj: ZqlObject = {
      tableName: 'host',
      fields: ['uuid', 'name', 'clusterUuid', 'managementIp', 'state', 'status', 'architecture'],
      condition: {
        clusterUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'l2NetworkClusterRef',
              fields: 'clusterUuid',
              condition: {
                l2NetworkUuid
              }
            }
          }
        },
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'l2networkhostref',
              fields: 'hostUuid',
              condition: {
                l2NetworkUuid
              }
            }
          }
        }
      },
      returnWith: {
        total: true
      }
    }

    const zqlClusterObj: ZqlObject = {
      tableName: 'cluster',
      fields: ['uuid', 'name', 'hypervisorType'],
      condition: {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'l2NetworkClusterRef',
              fields: 'clusterUuid',
              condition: {
                l2NetworkUuid
              }
            }
          }
        }
      },
      returnWith: {
        total: true
      }
    }

    const zqlL2Obj: ZqlObject = {
      tableName: 'L2Network',
      fields: ['uuid', 'name', 'virtualNetworkId', 'physicalInterface']
    }

    const zqlL3Obj: ZqlObject = {
      tableName: 'L3network',
      fields: ['uuid', 'name', 'l2NetworkUuid'],
      condition: {
        ['portGroup.vSwitchUuid']: l2NetworkUuid
      },
      returnWith: {
        total: true
      }
    }

    const zqlVmObj: ZqlObject = {
      tableName: 'vmInstance',
      fields: ['uuid', 'name', 'hostUuid', 'clusterUuid', 'state', 'rootVolumeUuid'],
      condition: {
        ['vmNics.l3Network.portGroup.vSwitchUuid']: l2NetworkUuid,
        state: {
          [ZOp.ne]: VmInstanceState.Destroyed
        },
        [ZOp.and]: [
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'TemplatedVmInstance',
                  fields: ['uuid']
                }
              }
            }
          },
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'TemplatedVmInstanceCache',
                  fields: ['cacheVmInstanceUuid']
                }
              }
            }
          }
        ]
      },
      returnWith: {
        total: true
      }
    }

    const zqlVmNicObj: ZqlObject = {
      tableName: 'vmNic',
      condition: {
        ['l3Network.portGroup.vSwitchUuid']: l2NetworkUuid
      }
    }

    const zqlLocalStorageRefObj: ZqlObject = {
      tableName: 'LocalStorageResourceRef',
      fields: 'hostUuid,resourceUuid',
      condition: {
        resourceType: 'VolumeVO'
      }
    }

    const zqlHostBondObj: ZqlObject = {
      tableName: 'HostNetworkBonding'
    }

    const zqlSystemInfoObj: ZqlObject = {
      tableName: 'SystemTag',
      fields: ['uuid', 'tag', 'resourceUuid'],
      condition: {
        [ZOp.or]: [
          {
            tag: {
              [ZOp.like]: 'systemSerialNumber'
            }
          },
          {
            tag: {
              [ZOp.like]: 'uplink'
            }
          }
        ]
      }
    }

    const zqlBaremetalChassisObj = {
      tableName: 'BaremetalChassis',
      fields: ['clusterUuid'],
      condition: {
        clusterUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'l2NetworkClusterRef',
              fields: 'clusterUuid',
              condition: {
                l2NetworkUuid
              }
            }
          }
        }
      }
    }

    const {
      results: [
        { inventories: baremetalChassisList = [] },
        { inventories: hostList = [], total: hostCount },
        { inventories: clusterList = [], total: clusterCount },
        { inventories: l2List = [] },
        { inventories: l3List = [], total: l3Count },
        { inventories: vmList = [], total: vmCount },
        { inventories: vmNicList = [] },
        { inventories: localStorageRefList = [] },
        { inventories: hostBondList = [] },
        { inventories: systemTagList = [] }
      ]
    } = await this.zqlService.call(
      ZQL.multStringify([
        zqlBaremetalChassisObj,
        zqlHostObj,
        zqlClusterObj,
        zqlL2Obj,
        zqlL3Obj,
        zqlVmObj,
        zqlVmNicObj,
        zqlLocalStorageRefObj,
        zqlHostBondObj,
        zqlSystemInfoObj
      ])
    )

    const baremetalChassisCount = _.countBy(baremetalChassisList, item => item.clusterUuid)

    const nodes: ResourceNode[] = []

    const currentL2 = l2List.find(l2 => l2.uuid === l2NetworkUuid)
    if (currentL2) {
      const relatedClusterIdList = clusterList.map(cluster => cluster.uuid)
      const relatedL3IdList = l3List.map(l3 => l3.uuid)
      const node: ResourceNode = {
        id: currentL2.uuid,
        title: currentL2.name,
        resourceType: 'l2',
        relations: {
          cluster: relatedClusterIdList,
          l3: relatedL3IdList
        }
      }
      const relatedHostBondList = hostBondList.filter(
        bond => bond.bondingName === currentL2.physicalInterface
      )
      const relatedL2SystemTag = systemTagList.find(
        tag => tag.resourceUuid === l2NetworkUuid && tag.tag.includes('uplink')
      )
      if (relatedL2SystemTag) {
        const splitTags = relatedL2SystemTag.tag.split('::')
        currentL2.bondingMode = splitTags[2]
        currentL2.xmitHashPolicy = splitTags[3]
      }

      node.detail = Object.assign({}, currentL2, {
        clusterCount,
        portGroupCount: l3Count,
        hostBondList: relatedHostBondList
      })
      nodes.push(node)
    }

    if (hostCount > 0) {
      hostList.forEach(host => {
        const node: ResourceNode = {
          id: host.uuid,
          title: host.name,
          resourceType: 'host',
          relations: {
            cluster: [host.clusterUuid],
            l2: [l2NetworkUuid]
          }
        }
        const relatedHostBondList = hostBondList.filter(
          bond => bond.hostUuid === host.uuid && bond.bondingName === currentL2.physicalInterface
        )
        const relatedSlaves = relatedHostBondList.map(bond => bond.slaves)
        const relatedHostNicList = _.sortBy(_.flatten(relatedSlaves), 'interfaceName')
        const relatedHostSystemTag = systemTagList.find(
          tag => tag.resourceUuid === host.uuid && tag.tag.includes('systemSerialNumber')
        )
        const systemSerialNumber = _.get(_.split(relatedHostSystemTag.tag, '::'), '1', null)
        node.detail = Object.assign({}, host, {
          hostNicList: relatedHostNicList,
          systemSerialNumber
        })
        nodes.push(node)
      })
    }
    if (clusterCount > 0) {
      clusterList.forEach(cluster => {
        const relatedHost = hostList.filter(host => host.clusterUuid === cluster.uuid)
        const relatedHostIdList = relatedHost.map(host => host.uuid)
        const node: ResourceNode = {
          id: cluster.uuid,
          title: cluster.name,
          resourceType: 'cluster',
          relations: {
            host: relatedHostIdList,
            l2: [l2NetworkUuid]
          }
        }
        node.detail = Object.assign({}, cluster, {
          baremetalChassisCount: baremetalChassisCount[cluster.uuid],
          hostCount: relatedHost.length
        })
        nodes.push(node)
      })
    }
    if (l3Count > 0) {
      l3List.forEach(l3 => {
        const relatedVmNicList = vmNicList.filter(vmNic => vmNic.l3NetworkUuid === l3.uuid)
        const relatedVmIdList = relatedVmNicList.map(vmNic => vmNic.vmInstanceUuid)
        const relatedVMList = vmList.filter(vm => relatedVmIdList.includes(vm.uuid))
        const node: ResourceNode = {
          id: l3.uuid,
          title: l3.name,
          resourceType: 'l3',
          relations: {
            l2: [l2NetworkUuid],
            vm: relatedVmIdList
          }
        }
        const originL2 = l2List.find(l2 => l2.uuid === l3.l2NetworkUuid)
        node.detail = Object.assign({}, l3, {
          vlanId: originL2?.virtualNetworkId,
          vmCount: relatedVMList.length
        })
        nodes.push(node)
      })
    }
    if (vmCount > 0) {
      vmList.forEach(vm => {
        const relatedVmNicList = vmNicList.filter(vmNic => vmNic.vmInstanceUuid === vm.uuid)
        const relatedL3IdList = relatedVmNicList.map(vmNic => vmNic.l3NetworkUuid)
        const relatedHostIdList = localStorageRefList
          .filter(ref => ref.resourceUuid === vm.rootVolumeUuid)
          .map(ref => ref.hostUuid)
        const node: ResourceNode = {
          id: vm.uuid,
          title: vm.name,
          resourceType: 'vm',
          relations: {
            host: relatedHostIdList,
            cluster: [vm.clusterUuid],
            l2: [l2NetworkUuid],
            l3: relatedL3IdList
          }
        }
        node.detail = Object.assign({}, vm, {
          vmNicList: relatedVmNicList
        })
        nodes.push(node)
      })
    }

    return { nodes, hostCount, clusterCount, l2Count: 1, l3Count, vmCount }
  }
}
