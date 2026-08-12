import { Injectable, Inject } from '@nestjs/common'

import { Op } from '@/api/zstack/base/query-base'
import {
  CheckBaremetalChassisConfigFileAction,
  CheckBaremetalChassisConfigFileActionParam
} from '@/api/zstack/CheckBaremetalChassisConfigFileAction'
import { GetBaremetalChassisPowerStatusAction } from '@/api/zstack/GetBaremetalChassisPowerStatusAction'
import { QueryBaremetalChassisAction } from '@/api/zstack/QueryBaremetalChassisAction'
import { QueryBaremetalInstanceAction } from '@/api/zstack/QueryBaremetalInstanceAction'
import { ActionService } from '@/base/action-service'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { ActionSendResp } from '@/common/model/action-send-resp.model'

import {
  BaremetalChassisDiskInfoQueryResp,
  BaremetalChassisNicInfoQueryResp,
  BaremetalChassisQueryResp
} from './baremetal-chassis.model'
import { formatPowerStatus } from './utils'

@Injectable()
export class BaremetalChassisService extends ActionService {
  @Inject() queryBaremetalChassisAction: QueryBaremetalChassisAction

  @Inject()
  checkBaremetalChassisConfigFileAction: CheckBaremetalChassisConfigFileAction

  @Inject()
  getBaremetalChassisPowerStatusAction: GetBaremetalChassisPowerStatusAction

  @Inject()
  queryBaremetalInstanceAction: QueryBaremetalInstanceAction

  async queryList(params: IQueryAction): Promise<BaremetalChassisQueryResp> {
    const { inventories: list, total } = await this.queryBaremetalChassisAction.call(params)

    const newList = await list.map(async ({ uuid, hardwareInfos, ...rest }) => {
      const powerStatus = await this.getBaremetalChassisPowerStatus(uuid)

      const {
        inventories: [baremetalInstance]
      } = await this.queryBaremetalInstanceAction.call({
        conditions: [
          {
            key: 'chassisUuid',
            op: Op.eq,
            value: uuid
          }
        ]
      })

      return {
        ...rest,
        uuid,
        powerStatus,
        hardwareInfos: hardwareInfos ?? [],
        baremetalInstance
      }
    })

    return {
      list: newList,
      total
    }
  }

  async getBaremetalChassisPowerStatus(uuid) {
    const { status } = await this.getBaremetalChassisPowerStatusAction.call({
      uuid
    })

    return formatPowerStatus(status)
  }

  async checkBaremetalChassisConfigFile(
    params: CheckBaremetalChassisConfigFileActionParam
  ): Promise<ActionSendResp> {
    try {
      await this.checkBaremetalChassisConfigFileAction.call(params)
      return { success: true }
    } catch (error) {
      return { error: error?.message ?? error, success: false }
    }
  }

  async queryHardware(params: IQueryAction, type: 'disk' | 'nic') {
    const { inventories } = await this.queryBaremetalChassisAction.call(params)

    const _inventories = inventories.map(({ hardwareInfos }) => {
      const result = hardwareInfos
        .filter(info => info.type === type)
        .flatMap(info => {
          try {
            const content = JSON.parse(info.content)

            if (content && typeof content === 'object' && !Array.isArray(content)) {
              return Object.values(content)
            }
            return Array.isArray(content) ? content : []
          } catch (error) {
            return []
          }
        })

      return result
    })

    const nicList = _inventories?.[0] || []

    const total = nicList.length

    const start = params?.start || 0
    const end = params?.limit ? start + params.limit : total
    const list = nicList.slice(start, end).map(val => ({ ...val }))

    return {
      list,
      total
    }
  }

  async queryDiskList(params: IQueryAction): Promise<BaremetalChassisDiskInfoQueryResp> {
    const { list, total } = await this.queryHardware(params, 'disk')

    return {
      list,
      total
    }
  }

  async queryNicList(params: IQueryAction): Promise<BaremetalChassisNicInfoQueryResp> {
    const { list, total } = await this.queryHardware(params, 'nic')

    return {
      list,
      total
    }
  }
}
