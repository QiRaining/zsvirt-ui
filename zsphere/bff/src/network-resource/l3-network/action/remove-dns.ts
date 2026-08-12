import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RemoveDnsFromL3NetworkAction } from '@/api/zstack/RemoveDnsFromL3NetworkAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RemoveDnsFromL3NetworkPayload {
  @Field(() => String, { nullable: true })
  l3NetworkUuid: string

  @Field(() => String, { nullable: true })
  dns: string
}

@InputType()
class RemoveDnsFromL3NetworkInput {
  @Field(() => [RemoveDnsFromL3NetworkPayload])
  payload: RemoveDnsFromL3NetworkPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RemoveDnsFromL3NetworkService extends ActionService {
  @Inject() removeDnsFromL3NetworkAction: RemoveDnsFromL3NetworkAction

  @Mutation(() => ActionResult)
  removeDnsFromL3Network(@Args('input') input: RemoveDnsFromL3NetworkInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: RemoveDnsFromL3NetworkPayload, taskId: string) => {
      const { inventory } = await this.removeDnsFromL3NetworkAction.call(payload, {
        actionId,
        taskId
      })

      return {
        id: payload.l3NetworkUuid,
        fields: 'dns',
        inventory: {
          dns: inventory.dns || []
        }
      }
    }

    this.actionHelper(input, 'L3Network', actionFn)
    return { actionId }
  }
}
