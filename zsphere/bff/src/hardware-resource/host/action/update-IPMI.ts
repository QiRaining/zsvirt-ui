import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation } from '@nestjs/graphql'

import { UpdateHostIpmiAction } from '@/api/zstack/UpdateHostIpmiAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { Decrypt } from '@/utils/aesCipher'

@InputType()
class UpdateHostIPMIPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  ipmiAddress: string

  @Field(() => Int, { nullable: true })
  ipmiPort: number

  @Field(() => String, { nullable: true })
  ipmiUsername: string

  @Field(() => String, { nullable: true })
  ipmiPassword: string
}

@InputType()
class UpdateHostIPMIInput {
  @Field(() => [UpdateHostIPMIPayload])
  payload: UpdateHostIPMIPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateHostIPMIService extends ActionService {
  @Inject() updateHostIpmiAction: UpdateHostIpmiAction

  @Mutation(() => ActionResult)
  updateHostIPMI(@Args('input') input: UpdateHostIPMIInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'HostVO', async (payload: UpdateHostIPMIPayload, taskId: string) => {
      const result = await this.updateHostIpmiAction.call(
        {
          ...payload,
          ipmiPassword: Decrypt(payload.ipmiPassword)
        },
        {
          actionId,
          taskId
        }
      )
      return {
        id: payload.uuid,
        inventory: result.hostIpmiInventory
      }
    })
    return { actionId }
  }
}
