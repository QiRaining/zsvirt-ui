import { Inject, Injectable } from '@nestjs/common'

import { AttachUsbDeviceToVmAction } from '@/api/zstack/AttachUsbDeviceToVmAction'
import { QueryParam, conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { DetachUsbDeviceFromVmAction } from '@/api/zstack/DetachUsbDeviceFromVmAction'
import { GetUsbDeviceCandidatesForAttachingVmAction } from '@/api/zstack/GetUsbDeviceCandidatesForAttachingVmAction'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { QueryUsbDeviceAction } from '@/api/zstack/QueryUsbDeviceAction'
import { UpdateUsbDeviceAction } from '@/api/zstack/UpdateUsbDeviceAction'
import { ActionService } from '@/base/action-service'
import { ActionSendResp } from '@/common/model/action-send-resp.model'
import ZQL, { QueryConditionTranslator, ZOp } from '@/common/zql/index'

import { UpdateUsbInput, UsbDeviceQueryType } from './usb.device.model'
@Injectable()
export class UsbDeviceService extends ActionService {
  @Inject() queryUsbDeviceAction: QueryUsbDeviceAction
  @Inject() updateUsbDeviceAction: UpdateUsbDeviceAction
  @Inject() attachUsbDeviceToVmAction: AttachUsbDeviceToVmAction
  @Inject() detachUsbDeviceFromVmAction: DetachUsbDeviceFromVmAction
  @Inject()
  getUsbDeviceCandidatesForAttachingVmAction: GetUsbDeviceCandidatesForAttachingVmAction
  @Inject() queryHostAction: QueryHostAction
  @Inject() zqlService: ZQLService

  async query(param) {
    const { type = UsbDeviceQueryType.Normal, conditions = [], extraConditions } = param

    let extraZqlCondition

    switch (type) {
      case UsbDeviceQueryType.ZSVAttachableRedirectUsb:
        if (extraConditions) {
          const extraConditionsMap = conditionsToObject(extraConditions)
          const zoneUuid = extraConditionsMap['zoneUuid']
          extraZqlCondition = {
            [ZOp.and]: {
              state: '0',
              vmInstanceUuid: { [ZOp.is]: null },
              hostUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'host',
                    fields: ['uuid'],
                    condition: {
                      state: 'Enabled',
                      status: 'Connected',
                      zoneUuid
                    }
                  }
                }
              }
            }
          }
        }
        break
      case UsbDeviceQueryType.ZSVAttachablePassThroughUsb:
        if (extraConditions) {
          const extraConditionsMap = conditionsToObject(extraConditions)
          const hostUuid = extraConditionsMap['hostUuid']
          if (hostUuid) {
            extraZqlCondition = {
              [ZOp.and]: {
                state: '0',
                vmInstanceUuid: { [ZOp.is]: null },
                hostUuid: hostUuid
              }
            }
          } else {
            extraZqlCondition = {
              [ZOp.and]: {
                state: '0',
                vmInstanceUuid: { [ZOp.is]: null }
              }
            }
          }
        }
        break
      case UsbDeviceQueryType.ZSVRedirectUsb:
        if (extraConditions) {
          const extraConditionsMap = conditionsToObject(extraConditions)
          const zoneUuid = extraConditionsMap['zoneUuid']
          const hostUuid = extraConditionsMap['hostUuid']
          extraZqlCondition = {
            [ZOp.and]: {
              state: '0',
              hostUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'host',
                    fields: ['uuid'],
                    condition: {
                      state: 'Enabled',
                      status: 'Connected',
                      zoneUuid: zoneUuid,
                      uuid: { [ZOp.notIn]: [hostUuid] }
                    }
                  }
                }
              }
            }
          }
        }
        break
      case UsbDeviceQueryType.ZSVPassThroughUsb:
        if (extraConditions) {
          const extraConditionsMap = conditionsToObject(extraConditions)
          const hostUuid = extraConditionsMap['hostUuid']
          if (hostUuid) {
            extraZqlCondition = {
              [ZOp.and]: {
                state: '0',
                hostUuid: hostUuid
              }
            }
          } else {
            extraZqlCondition = {
              [ZOp.and]: {
                state: '0'
              }
            }
          }
        }
        break
    }

    const zqlCondition = QueryConditionTranslator.translate(conditions, extraZqlCondition)

    const zqlObject = {
      tableName: 'UsbDevice',
      condition: zqlCondition,
      returnWith: {
        total: true
      },
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start
    }
    const zql = ZQL.stringify(zqlObject)
    const usbResp = await this.zqlService.call(zql)
    return {
      list: usbResp.results[0].inventories,
      total: usbResp.results[0].total
    }
  }

  async queryHost(uuid: string): Promise<string> {
    const params: QueryParam = {
      conditions: [{ key: 'uuid', value: uuid }]
    }
    const { inventories } = await this.queryHostAction.call(params)
    return inventories?.[0]
  }

  async update({ uuids, ...params }: UpdateUsbInput): Promise<ActionSendResp> {
    try {
      await Promise.all(
        uuids.map(uuid => {
          this.updateUsbDeviceAction.call({
            uuid,
            ...params
          })
        })
      )
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: JSON.stringify(err)
      }
    }
  }
}
