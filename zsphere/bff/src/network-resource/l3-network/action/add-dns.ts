import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddDnsToL3NetworkAction } from '@/api/zstack/AddDnsToL3NetworkAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddDnsToL3NetworkPayload {
  @Field(() => String, { nullable: true })
  l3NetworkUuid: string

  @Field(() => String, { nullable: true })
  dns: string
}

@InputType()
class AddDnsToL3NetworkInput {
  @Field(() => [AddDnsToL3NetworkPayload])
  payload: AddDnsToL3NetworkPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddDnsToL3NetworkService extends ActionService {
  @Inject() addDnsToL3NetworkAction: AddDnsToL3NetworkAction

  @Mutation(() => ActionResult)
  addDnsToL3Network(@Args('input') input: AddDnsToL3NetworkInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: AddDnsToL3NetworkPayload, taskId: string) => {
      const { inventory } = await this.addDnsToL3NetworkAction.call(payload, {
        actionId,
        taskId
      })

      return {
        id: payload.l3NetworkUuid,
        fields: 'dns',
        inventory
      }
    }

    this.actionHelper(input, 'L3Network', actionFn)
    return { actionId }
  }
}
