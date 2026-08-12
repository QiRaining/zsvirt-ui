import { Inject, Injectable } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { groupBy, uniq, flatten, partition, compact } from 'lodash'
import { compact as _compact } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { UpdateVmNetworkConfigAction } from '@/api/zstack/UpdateVmNetworkConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql/index'
import { VmInstanceQueryService } from '@/zsphere-resource/vm-instance/vm-instance-query/vm-instance-query.service'

@InputType()
export class UpdateVmNetworkConfigPayload {
  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => String, { nullable: true })
  vmNicUuid: string

  @Field(() => String, { nullable: true })
  l3NetworkUuid: string
}

@InputType()
class UpdateVmNetworkConfigInput {
  @Field(() => [UpdateVmNetworkConfigPayload])
  payload: UpdateVmNetworkConfigPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

const _UPDATE_VM_NETWORK_CONFIG_TASK_KEY = '__updateVmNetworkConfigInfo__'

interface UpdateVmNetworkConfigTaskInfo {
  batchUpdateParams?: Array<{
    vmInstanceUuid: string
    vmNicUuids: string[]
    actionInfo?: any
    useDefaultNic?: boolean
  }>
}

@Injectable()
export class UpdateVmNetworkConfigService extends ActionService {
  @Inject() updateVmNetworkConfigAction: UpdateVmNetworkConfigAction
  @Inject() zqlService: ZQLService
  @Inject() vmInstanceQueryService: VmInstanceQueryService

  @Mutation(() => ActionResult)
  async updateVmNetworkConfig(@Args('input') input: UpdateVmNetworkConfigInput) {
    const actionId = input.action.actionId
    const fn = async (payload: UpdateVmNetworkConfigPayload, taskId: string) => {
      await this.syncConfig(payload, {
        actionId,
        taskId
      })
      return {
        id: payload.vmInstanceUuid
      }
    }

    this.actionHelper(input, 'VmNic', fn)
    return { actionId }
  }

  syncConfig = async (
    payload: NicPayload | NetworkPayload,
    actionConfig?: {
      actionId
      taskId
    }
  ) => {
    let { vmInstanceUuid } = payload
    if (!vmInstanceUuid) {
      const { vmNicUuid } = payload as NicPayload
      const zql = ZQL.stringify({
        tableName: 'VmNic',
        condition: {
          uuid: vmNicUuid
        },
        fields: ['vmInstanceUuid']
      })
      const resp = await this.zqlService.call(zql)
      vmInstanceUuid = resp?.results?.[0]?.inventories?.[0]?.vmInstanceUuid
    }

    const vmZql = ZQL.stringify({
      tableName: 'VmInstance',
      fields: ['state', 'platform', 'defaultL3NetworkUuid'],
      condition: { uuid: vmInstanceUuid }
    })
    const vmResp = await this.zqlService.call(vmZql)
    const vm = vmResp?.results?.[0]?.inventories?.[0]

    // 仅在Running状态下，下发配置同步
    if (vm?.state !== 'Running') {
      return
    }

    const zql = ZQL.stringify({
      tableName: 'GuestToolsState',
      condition: { vmInstanceUuid }
    })
    const guestResp = await this.zqlService.call(zql)
    const guestInfo = guestResp?.results?.[0]?.inventories?.[0]

    //
    if (['NotRunning', 'Running'].includes(guestInfo?.qgaState)) {
      let vmNicUuidList = _compact([
        (payload as NicPayload).vmNicUuid,
        (payload as NicPayload)?.defaultVmNicUuid
      ])
      if (!(payload as NicPayload).vmNicUuid) {
        const l3NetworkUuid = (payload as NetworkPayload).l3NetworkUuid

        const nicZql = ZQL.stringify({
          tableName: 'VmNic',
          condition: {
            vmInstanceUuid,
            l3NetworkUuid: l3NetworkUuid === '__default__' ? vm.defaultL3NetworkUuid : l3NetworkUuid
          },
          fields: ['uuid']
        })
        const resp = await this.zqlService.call(nicZql)
        vmNicUuidList = resp?.results?.[0]?.inventories?.map(item => item?.uuid)
      }

      const taskId = actionConfig?.taskId ?? this.context.currentTaskId
      const taskInfo = this.context.tasks?.get(taskId)?.[
        _UPDATE_VM_NETWORK_CONFIG_TASK_KEY
      ] as UpdateVmNetworkConfigTaskInfo

      if (taskInfo?.batchUpdateParams) {
        taskInfo?.batchUpdateParams.push({
          useDefaultNic: (payload as NetworkPayload).l3NetworkUuid === '__default__',
          vmInstanceUuid,
          vmNicUuids: vmNicUuidList ?? [],
          actionInfo: actionConfig
        })
      } else {
        await this.updateVmNetworkConfigAction.call(
          { vmInstanceUuid, vmNicUuids: vmNicUuidList },
          actionConfig
        )
      }
    }
  }

  setBatchUpdate(taskId?: string) {
    if (!taskId) {
      taskId = this.context.currentTaskId
    }
    const updateVmNetworkConfigTaskInfo: UpdateVmNetworkConfigTaskInfo = {
      batchUpdateParams: []
    }
    this.context.addTaskInfo(taskId, {
      [_UPDATE_VM_NETWORK_CONFIG_TASK_KEY]: updateVmNetworkConfigTaskInfo
    })
  }

  async batchUpdate(taskId?: string) {
    if (!taskId) {
      taskId = this.context.currentTaskId
    }
    const updateVmNetworkConfigTaskInfo: UpdateVmNetworkConfigTaskInfo | undefined =
      this.context.tasks.get(taskId)?.[_UPDATE_VM_NETWORK_CONFIG_TASK_KEY]
    if (!updateVmNetworkConfigTaskInfo?.batchUpdateParams?.length) {
      return
    }
    const tasks = Object.entries(
      groupBy(updateVmNetworkConfigTaskInfo.batchUpdateParams, 'vmInstanceUuid')
    ).map(async ([vmInstanceUuid, params]) => {
      const [defaultNicParams, vmNicUuidParams] = partition(params, 'useDefaultNic')
      const vmNicUuids = flatten(vmNicUuidParams.map(param => param.vmNicUuids))
      if (defaultNicParams.length) {
        const resp = await this.zqlService.call(
          ZQL.stringify({
            tableName: 'VmNic',
            fields: ['uuid'],
            condition: {
              vmInstanceUuid,
              l3NetworkUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'VmInstance',
                    fields: ['defaultL3NetworkUuid'],
                    condition: { uuid: vmInstanceUuid }
                  }
                }
              }
            }
          })
        )
        const defaultNicUuid = resp?.results?.[0]?.inventories?.map(item => item.uuid)
        if (defaultNicUuid?.length) {
          vmNicUuids.push(...defaultNicUuid)
        }
      }
      await this.updateVmNetworkConfigAction.call(
        { vmInstanceUuid, vmNicUuids: uniq(compact(vmNicUuids)) },
        { taskId, actionId: this.context.actionId }
      )
    })
    await Promise.all(tasks)
  }
}

interface NetworkPayload {
  vmInstanceUuid: string
  l3NetworkUuid: string
}
interface NicPayload {
  vmNicUuid: string
  defaultVmNicUuid?: string
  vmInstanceUuid?: string
}
