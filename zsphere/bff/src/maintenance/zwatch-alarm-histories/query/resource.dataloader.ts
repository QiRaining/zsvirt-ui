import { Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'

import { ResourceLoader } from '@/common/resource.dataloader'

export const NamespaceToResource = {
  'ZStack/License': 'primarystorage',
  'ZStack/VM': 'vminstance',
  'ZStack/BaremetalVM': 'BaremetalInstance',
  'ZStack/LoadBalancer': 'loadBalancerListener',
  'ZStack/VRouter': 'vminstance',
  'ZStack/Image': 'image',
  'ZStack/BackupStorage': 'backupstorage',
  'ZStack/DisasterRecoveryStorage': 'backupstorage',
  'ZStack/Scheduler': 'schedulerjobgroup',
  'ZStack/Host': 'host',
  'ZStack/L3Network': 'l3network',
  'ZStack/Volume': 'volume',
  'ZStack/VIP': 'vip',
  'ZStack/PrimaryStorage': 'primarystorage',
  'ZStack/Baremetal2VM': 'baremetal2Instance',
  'ZStack/CdpTask': 'cdpTask',
  'ZStack/Cluster': 'cluster'
}

@Injectable()
export class ResourceNameloader extends ResourceLoader {
  private resourceNameloader
  private namespaceMap = {}

  constructor() {
    super()
    this.resourceNameloader = new DataLoader(this._query)
  }

  query(uuid, namespace) {
    this.namespaceMap[uuid] = namespace
    return this.resourceNameloader.load(uuid)
  }

  _query = this.useQuery({
    tableName: uuid => NamespaceToResource[this.namespaceMap[uuid]],
    fields: ['name']
  })
}

@Injectable()
export class IsVcenterResourceLoader extends ResourceLoader {
  private resourceNameloader
  private namespaceMap = {}

  constructor() {
    super()
    this.resourceNameloader = new DataLoader(this._query)
  }

  query(uuid, namespace) {
    this.namespaceMap[uuid] = namespace
    return this.resourceNameloader.load(uuid)
  }

  _query = this.useQuery({
    tableName: uuid => NamespaceToResource[this.namespaceMap[uuid]],
    fields: ['name'],
    getCondition: uuid => {
      // type = VCenter 判断为vcenter资源
      // hypervisorType = ESX 判断为vcenter资源
      const typeList = ['backupstorage', 'primarystorage']
      const hypervisorTypeList = ['host', 'cluster']
      const resourceType = NamespaceToResource[this.namespaceMap[uuid]]

      if (typeList.includes(resourceType)) {
        return {
          uuid,
          type: 'VCenter'
        }
      } else if (hypervisorTypeList.includes(resourceType)) {
        return {
          uuid,
          hypervisorType: 'ESX'
        }
      }
      return { uuid }
    },
    result: 'inventories.[0].name'
  })
}
