import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'

import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { ZOp } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

@Injectable()
export class HybridKeySecretDataLoader {
  @Inject() zqlService: ZQLService

  private uesEndpointGetHybridKeySecretLoader

  constructor() {
    this.uesEndpointGetHybridKeySecretLoader = new DataLoader(this._useEndpointGetHybridKeySecret)
  }

  queryUesEndpointGetHybridKeySecret(uuid) {
    return this.uesEndpointGetHybridKeySecretLoader.load(uuid)
  }

  _useEndpointGetHybridKeySecret = async (uuids: string[]) => {
    //先拿endpointuuid查表systemTag，然后获取对应resourceUuid对应的tag属性为accessKey::xxxxx的一行，其中xxxx就是对应的accessKey的uuid
    //然后再拿accessKey 查表 HybridAccountVO
    const systemTagZqlObject: ZqlObject = {
      tableName: 'systemTag',
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        },
        tag: {
          [ZOp.like]: 'accesskey::'
        }
      }
    }
    const systemTagZql = ZQL.stringify(systemTagZqlObject)
    const { results: systemTagResultsTemp } = await this.zqlService.call(systemTagZql)
    const systemTagResults = systemTagResultsTemp?.[0]?.inventories

    const endPointAccessKeyMap = {}
    systemTagResults.forEach(item => {
      endPointAccessKeyMap[item.resourceUuid] = item.tag.split('::').pop()
    })

    const accountZqlObject: ZqlObject = {
      tableName: 'HybridAccount',
      condition: {
        uuid: {
          [ZOp.in]: Object.values(endPointAccessKeyMap)
        }
      }
    }
    const accountTagZql = ZQL.stringify(accountZqlObject)
    const { results: accountResultsTemp } = await this.zqlService.call(accountTagZql)
    const accountResults = accountResultsTemp?.[0]?.inventories

    return uuids.map(uuid => {
      return accountResults.find(item => item.uuid == endPointAccessKeyMap[uuid]) ?? {}
    })
  }
}
