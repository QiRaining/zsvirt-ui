import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { ReconnectHostAction } from '@/api/zstack/ReconnectHostAction'
import { UpdateKVMHostAction, UpdateHostResult } from '@/api/zstack/UpdateKVMHostAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateKVMHostPayload {
  @Field(() => String)
  uuid: string

  @Field(() => Int, { nullable: true })
  sshPort: number

  @Field(() => String, { nullable: true })
  username: string

  @Field(() => String, { nullable: true })
  password: string

  @Field(() => String, { nullable: true })
  managementIp: string
}

@InputType()
class UpdateKVMHostInput {
  @Field(() => UpdateKVMHostPayload)
  payload: UpdateKVMHostPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateKVMHostService extends ActionService {
  @Inject() updateKVMHostAction: UpdateKVMHostAction
  @Inject() reconnectHostAction: ReconnectHostAction

  @Mutation(() => ActionResult)
  updateKVMHost(@Args('input') input: UpdateKVMHostInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'HostVO', async (payload: UpdateKVMHostPayload, taskId: string) => {
      const result: UpdateHostResult = await this.updateKVMHostAction.call(
        {
          ...payload
        },
        { actionId, taskId }
      )

      await this.reconnectHostAction.call({ uuid: payload.uuid }, { actionId, taskId })

      return {
        id: payload.uuid,
        inventory: result.inventory
      }
    })
    return { actionId }
  }
}
