import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CheckScsiLunClusterStatusAction } from '@/api/zstack/CheckScsiLunClusterStatusAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CheckScsiLunClusterStatusPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { description: '集群UUID' })
  clusterUuid: string
}

@InputType()
class CheckScsiLunClusterStatusInput {
  @Field(() => [CheckScsiLunClusterStatusPayload])
  payload: CheckScsiLunClusterStatusPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CheckScsiLunClusterStatusService extends ActionService {
  @Inject() checkScsiLunClusterStatusAction: CheckScsiLunClusterStatusAction

  @Mutation(() => ActionResult)
  checkScsiLunClusterStatus(
    @Args('input')
    input: CheckScsiLunClusterStatusInput
  ) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'ScsiLun',
      async ({ uuid, ...rest }: CheckScsiLunClusterStatusPayload, taskId: string) => {
        await this.checkScsiLunClusterStatusAction.call(
          {
            uuid,
            ...rest
          },
          { actionId, taskId }
        )

        return {
          id: uuid
        }
      }
    )

    return { actionId }
  }
}
