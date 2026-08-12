import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteVmInstanceHaLevelAction } from '@/api/zstack/DeleteVmInstanceHaLevelAction'
import { SetVmInstanceHaLevelAction } from '@/api/zstack/SetVmInstanceHaLevelAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVmHaLevelPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  level: string
}

@InputType()
export class SetVmHaLevelInput {
  @Field(() => [SetVmHaLevelPayload])
  payload: SetVmHaLevelPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmHaLevelService extends ActionService {
  @Inject() setVmHaLevelAction: SetVmInstanceHaLevelAction
  @Inject() deleteVmInstanceHaLevelAction: DeleteVmInstanceHaLevelAction

  @Mutation(() => ActionResult)
  setVmHaLevel(@Args('input') input: SetVmHaLevelInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'VmInstance', async (payload: SetVmHaLevelPayload, taskId: string) => {
      return await this.actionFn(payload, taskId, actionId)
    })
    return { actionId }
  }

  async actionFn(payload: SetVmHaLevelPayload, taskId: string, actionId: string) {
    const { uuid, level } = payload
    if (level !== 'None') {
      await this.setVmHaLevelAction.call({ uuid, level }, { actionId, taskId })
    } else {
      await this.deleteVmInstanceHaLevelAction.call({ uuid }, { actionId, taskId })
    }
    return {
      id: payload.uuid,
      fields: 'vmHa { haLevel }',
      inventory: {
        vmHa: {
          haLevel: payload.level
        }
      }
    }
  }
}
