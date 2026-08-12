import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RefreshNvmeServerAction } from '@/api/zstack/RefreshNvmeServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RefreshNvmeServerPayload {
  @Field(() => String, { description: 'Nvme服务器的的UUID' })
  uuid: string
}

@InputType()
class RefreshNvmeServerInput {
  @Field(() => [RefreshNvmeServerPayload])
  payload: RefreshNvmeServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RefreshNvmeServerService extends ActionService {
  @Inject() refreshNvmeServerAction: RefreshNvmeServerAction

  @Mutation(() => ActionResult)
  refreshNvmeServer(
    @Args('input')
    input: RefreshNvmeServerInput
  ) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'NvmeServer',
      async ({ uuid, ...rest }: RefreshNvmeServerPayload, taskId: string) => {
        await this.refreshNvmeServerAction.call(
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
