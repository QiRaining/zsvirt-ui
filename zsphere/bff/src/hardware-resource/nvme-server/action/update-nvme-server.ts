import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateNvmeServerAction } from '@/api/zstack/UpdateNvmeServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateNvmeServerPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true, description: '启用状态' })
  name?: string
}

@InputType()
class UpdateNvmeServerInput {
  @Field(() => [UpdateNvmeServerPayload])
  payload: UpdateNvmeServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateNvmeServerService extends ActionService {
  @Inject() updateNvmeServerAction: UpdateNvmeServerAction

  @Mutation(() => ActionResult)
  updateNvmeServer(
    @Args('input')
    input: UpdateNvmeServerInput
  ) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'NvmeServer',
      async ({ uuid, ...rest }: UpdateNvmeServerPayload, taskId: string) => {
        const result = await this.updateNvmeServerAction.call(
          {
            uuid,
            ...rest
          },
          { actionId, taskId }
        )

        return {
          id: uuid,
          fields: 'state,name,lastOpDate',
          inventory: result.inventory
        }
      }
    )

    return { actionId }
  }
}
