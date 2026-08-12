import { Inject, Injectable } from '@nestjs/common'

import { conditionsToObject, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { ActionService } from '@/base/action-service'
import { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql'
import ZQL from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { UsedIpQueryType } from './used-ip.model'

@Injectable()
export class UsedIpService extends ActionService {
  @Inject() querySystemTagAction: QuerySystemTagAction

  @Inject() zqlService: ZQLService

  async query(params) {
    const conditions = []
    const { type } = params

    switch (type) {
      case UsedIpQueryType.CandidateVmNicForAttachEip:
        return this.queryVmNicIPForEip(params)
    }
    const zqlObject: ZqlObject = {
      tableName: 'UsedIp'
    }
    if (conditions.length > 0) {
      zqlObject.condition = {
        [ZOp.and]: [conditions]
      }
    }

    const {
      results: [{ inventories: list = [], total = 0 } = {}]
    } = await this.zqlService.call(
      ZQL.stringify(QueryConditionTranslator.mergeQueryAction(params, zqlObject))
    )

    return {
      list,
      total
    }
  }

  async getIpVersion(eipUuid: string) {
    const zqlObject: ZqlObject = {
      tableName: 'UsedIp',
      fields: ['ipVersion'],
      condition: {
        l3NetworkUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'vip',
              fields: ['l3NetworkUuid'],
              condition: {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'eip',
                      fields: ['vipUuid'],
                      condition: {
                        uuid: eipUuid
                      }
                    }
                  }
                }
              }
            }
          }
        },
        ip: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'vip',
              fields: ['ip'],
              condition: {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'eip',
                      fields: ['vipUuid'],
                      condition: {
                        uuid: eipUuid
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    const zql = ZQL.stringify(zqlObject)

    console.log('zql : ', zql)

    const {
      results: [{ inventories }]
    } = await this.zqlService.call(zql)

    return inventories?.[0]?.ipVersion
  }

  async queryVmNicIPForEip(params) {
    const { extraConditions } = params
    const conditionsMap = conditionsToObject(extraConditions)
    const vmInstanceUuid = conditionsMap['vmInstanceUuid']
    const eipUuid = conditionsMap['eipUuid']

    const ipVersion = await this.getIpVersion(eipUuid)

    const _zqlObject = {
      tableName: 'VmNic',
      fields: ['uuid'],
      condition: {
        vmInstanceUuid,
        uuid: {
          [ZOp.in]: {
            [ZOp.getapi]: {
              action: ZQLAction.GET_API,
              api: 'GetEipAttachableVmNics',
              output: 'inventories.uuid',
              condition: {
                vmUuid: vmInstanceUuid,
                eipUuid
              }
            }
          }
        }
      }
    }

    const zqlObject: ZqlObject = {
      tableName: 'UsedIp',
      condition: {
        ipVersion,
        vmNicUuid: {
          [ZOp.in]: {
            [ZOp.query]: _zqlObject
          }
        }
      }
    }
    const zql = ZQL.stringify(QueryConditionTranslator.mergeQueryAction(params, zqlObject))

    console.log('zql : ', zql)

    const {
      results: [{ inventories: usedIps = [], total = 0 }]
    } = await this.zqlService.call(zql)

    const { inventories = [] } = await this.querySystemTagAction.call({
      conditions: [
        {
          key: 'resourceUuid',
          op: Op.eq,
          value: eipUuid
        },
        {
          key: 'resourceType',
          op: Op.eq,
          value: 'VmInstanceVO'
        }
      ]
    })

    inventories.forEach((item: any) => {
      if (item?.tag.indexOf('staticIp::') > -1) {
        const l3NetworkUuid = item.tag.split('::')[1]

        usedIps.forEach(ip => {
          if (ip.l3NetworkUuid === l3NetworkUuid) {
            ip.isStatic = true
          }
        })
      }
    })

    return {
      list: usedIps,
      total
    }
  }
}
