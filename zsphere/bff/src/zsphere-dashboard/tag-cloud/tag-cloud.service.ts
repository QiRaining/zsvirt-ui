import { Injectable, Inject } from '@nestjs/common'
import { groupBy as _groupBy, forEach as _forEach } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { ZOp } from '@/common/zql/index'

import { QueryTagCloudArgs } from './tag-cloud.model'

@Injectable()
export class TagCloudService {
  @Inject()
  zqlService: ZQLService

  queryTagCloudInfo = async (args: QueryTagCloudArgs) => {
    const { resourceType, zoneUuid, hypervisorType } = args
    let zqlResourceQuery = {}
    const operator = hypervisorType === 'kvm' ? ZOp.ne : ZOp.eq
    switch (resourceType) {
      case 'VmInstanceVO':
        const condition = zoneUuid
          ? {
              zoneUuid,
              hypervisorType: {
                [operator]: 'ESX'
              }
            }
          : {
              hypervisorType: {
                [operator]: 'ESX'
              }
            }
        zqlResourceQuery = {
          [ZOp.query]: {
            tableName: 'vminstance',
            fields: ['uuid'],
            condition
          }
        }
        break
    }
    const zqlObject = {
      tableName: 'usertag',
      condition: {
        resourceUuid: {
          [ZOp.in]: zqlResourceQuery
        }
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const list = _groupBy(results?.[0]?.inventories ?? [], 'tagPatternUuid')
    const tagList = []
    _forEach(list, (value, key) => {
      tagList.push({
        uuid: key,
        value: value.length,
        name: value[0].tagPattern.name
      })
    })
    return tagList
  }
}
