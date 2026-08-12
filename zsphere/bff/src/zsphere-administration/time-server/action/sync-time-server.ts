import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { GraphQLScalarType } from 'graphql'

import { SyncChronyServersAction } from '@/api/zstack/SyncChronyServersAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

const AnyScalar = new GraphQLScalarType({
  name: 'Any',
  serialize: value => value
})

@InputType()
class SyncTimeServerInput {
  @Field(() => AnyScalar)
  payload: any

  @Field(() => ActionInput)
  action: ActionInput
}

export class SyncTimeServerService extends ActionService {
  @Inject() syncChronyServersAction: SyncChronyServersAction

  @Mutation(() => ActionResult)
  syncTimeServer(@Args('input') input: SyncTimeServerInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'TimeServer', async (payload: any, taskId: string) => {
      await this.syncChronyServersAction.call(payload, { actionId, taskId })
      return {
        id: actionId
      }
    })
    return { actionId }
  }
}
