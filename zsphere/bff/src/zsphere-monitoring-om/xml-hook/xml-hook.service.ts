import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'

@Injectable()
export class XmlHookService {
  @Inject() zqlService: ZQLService

  async queryList(params: QueryAction) {
    console.log('xmlHookConditions===', params?.conditions)
    // vm区分zone, xmlHook不区分zone
    const xmlHookConditions = params?.conditions?.filter(it => it?.key !== 'zoneUuid')
    const zqlObject = {
      tableName: 'XmlHook',
      condition: QueryConditionTranslator.translate(xmlHookConditions),
      orderBy: params?.sortBy,
      orderDirection: params?.sortDirection,
      limit: params?.limit,
      offset: params?.start,
      returnWith: {
        total: true
      }
    }
    const {
      results: [{ inventories: xmlHookInventories = [], total }]
    } = await this.zqlService.call(ZQL.stringify(zqlObject))

    // 获取当前查询的所有的xmlHook关联的vmInstanceUuid
    const xmlHookUuids = xmlHookInventories?.map(e => e.uuid)
    const refZqlObject = {
      tableName: 'XmlHookVmInstanceRef',
      fields: ['vmInstanceUuid', 'xmlHookUuid'],
      condition: {
        xmlHookUuid: {
          [ZOp.in]: xmlHookUuids
        }
      }
    }
    const {
      results: [{ inventories: refInventories = [] }]
    } = await this.zqlService.call(ZQL.stringify(refZqlObject))

    // 过滤出当前zone的vm
    const vmZqlObject = {
      tableName: 'VmInstance',
      fields: ['uuid', 'zoneUuid'],
      condition: {
        uuid: {
          [ZOp.in]: refInventories?.map(it => it?.vmInstanceUuid)
        },
        zoneUuid: params?.conditions?.find(it => it?.key === 'zoneUuid')?.value
      }
    }
    const {
      results: [{ inventories: vmInventories = [] }]
    } = await this.zqlService.call(ZQL.stringify(vmZqlObject))
    const currentZoneVmUuids = vmInventories?.map(it => it?.uuid)

    // 把xmlHook关联上vm
    const groupList = _.groupBy(refInventories, 'xmlHookUuid')
    const list = []
    xmlHookInventories.forEach((item, index) => {
      const vmUuids = groupList?.[item?.uuid]
        ?.map(it => it?.vmInstanceUuid)
        ?.filter(vmInstanceUuid => currentZoneVmUuids?.includes(vmInstanceUuid))
      list[index] = { ...item, vmUuids }
    })

    return {
      list,
      total
    }
  }
}
