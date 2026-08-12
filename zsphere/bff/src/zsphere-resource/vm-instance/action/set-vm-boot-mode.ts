import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { SetVmBootModeAction } from '@/api/zstack/SetVmBootModeAction'
import { UpdateSystemTagAction } from '@/api/zstack/UpdateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVmBootModePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  bootMode: string
}

@InputType()
class SetVmBootModeInput {
  @Field(() => [SetVmBootModePayload])
  payload: SetVmBootModePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmBootModeService extends ActionService {
  @Inject() action: SetVmBootModeAction
  @Inject() deleteTagAction: DeleteTagAction
  @Inject() updateSystemTagAction: UpdateSystemTagAction
  @Inject() createSystemTagAction: CreateSystemTagAction
  @Inject() querySystemTagAction: QuerySystemTagAction

  @Mutation(() => ActionResult)
  setVmBootMode(@Args('input') input: SetVmBootModeInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetVmBootModePayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: SetVmBootModePayload, taskId: string, actionId: string) {
    await this.action.call(payload, {
      actionId,
      taskId
    })

    //  ，去掉bootmode中的q35相关逻辑
    // const resp = await this.queryQ35SystemTag(payload)

    // if (resp?.inventories?.length === 0) {
    //   if (['UEFI', 'UEFI_WITH_CSM'].includes(payload.bootMode)) {
    //     await this.createQ35SystemTag(payload, actionId, taskId)
    //   }
    // } else {
    //   if (['UEFI', 'UEFI_WITH_CSM'].includes(payload.bootMode)) {
    //     await this.updateQ35SystemTag(resp, actionId, taskId)
    //   } else {
    //     await this.deleteQ35SystemTag(resp, actionId, taskId)
    //   }
    // }

    return {
      id: payload.uuid,
      fields: 'systemTag { bootMode }',
      inventory: {
        systemTag: {
          bootMode: payload.bootMode
        }
      }
    }
  }

  async queryQ35SystemTag(payload) {
    const params: IQueryAction = {
      fields: ['uuid'],
      conditions: [
        {
          key: 'resourceUuid',
          value: payload.uuid
        },
        {
          key: 'resourceType',
          value: 'VmInstanceVO'
        },
        {
          key: 'tag',
          op: Op.like,
          value: 'vmMachineType'
        }
      ]
    }
    return await this.querySystemTagAction.call(params)
  }

  async createQ35SystemTag(payload, actionId, taskId) {
    await this.createSystemTagAction.call(
      {
        resourceType: 'VmInstanceVO',
        resourceUuid: payload.uuid,
        tag: 'vmMachineType::q35'
      },
      { actionId, taskId }
    )
  }

  async updateQ35SystemTag(resp, actionId, taskId) {
    await this.updateSystemTagAction.call(
      {
        uuid: resp?.inventories?.[0]?.uuid,
        tag: 'vmMachineType::q35'
      },
      { actionId, taskId }
    )
  }

  async deleteQ35SystemTag(resp, actionId, taskId) {
    await this.deleteTagAction.call(
      {
        uuid: resp?.inventories?.[0]?.uuid
      },
      { actionId, taskId }
    )
  }
}
