import { Injectable, Inject } from '@nestjs/common'
import { find as _find, pick as _pick, reduce as _reduce, map as _map } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { UpdateGlobalConfigAction } from '@/api/zstack/UpdateGlobalConfigAction'
import { UpdateHaStrategyConditionAction } from '@/api/zstack/UpdateHaStrategyConditionAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp } from '@/common/zql/index'
import { HAStrategicPayload } from '@/settings/ha-strategic/ha-strategic.model'
import { HAStrategic } from '@/settings/ha-strategic/ha-strategic.model'

@Injectable()
export class HAStrategicService extends ActionService {
  @Inject() updateGlobalConfigAction: UpdateGlobalConfigAction
  @Inject() updateHaStrategyConditionAction: UpdateHaStrategyConditionAction
  @Inject() zqlService: ZQLService

  async queryHAStrategic(queryArgs: QueryAction) {
    const zqlCondition = [{ tableName: 'HaStrategyCondition', conditions: queryArgs?.conditions }]
    const zql = ZQL.multStringify(zqlCondition)
    const resp = await this.zqlService.call(zql)
    return { haStrategic: resp?.results?.[0]?.inventories }
  }

  async enableHAStrategic(input) {
    this.actionHelper(input, 'HAStrategic', async (payload: HAStrategicPayload, taskId: string) => {
      const actionId = input.action.actionId
      const { updateGlobalConfigPayload, haStrategic } = payload
      const haStrategicResultPro = haStrategic.map(async e => {
        const { state, uuid } = e
        return await this.updateHaStrategyConditionAction.call(
          { state, uuid },
          { actionId, taskId }
        )
      })
      const haStrategicResult = await Promise.all(haStrategicResultPro)
      let globalConfigResult = []
      let enableResult
      if (updateGlobalConfigPayload) {
        const index = updateGlobalConfigPayload.findIndex(e => e.name === 'enable')
        let enable: any
        if (index !== -1) {
          enable = updateGlobalConfigPayload[index]
          updateGlobalConfigPayload.splice(index, 1)
        }
        globalConfigResult = await Promise.all(
          updateGlobalConfigPayload.map(e => {
            return this.updateGlobalConfigAction.call(
              {
                ...e
              },
              { actionId, taskId }
            )
          })
        )
        if (enable) {
          enableResult = await this.updateGlobalConfigAction.call(enable, {
            actionId,
            taskId
          })
        }
      }
      return {
        id: actionId,
        inventory: { globalConfigResult, haStrategicResult, enableResult }
      }
    })
  }
}
