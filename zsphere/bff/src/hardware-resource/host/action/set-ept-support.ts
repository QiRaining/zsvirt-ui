import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class SetHostEptSupportPayload {
  @Field(() => String)
  uuid?: string

  @Field(() => String, { nullable: true })
  eptUuid?: string
}

@InputType()
class SetHostEptSupportInput {
  @Field(() => SetHostEptSupportPayload)
  payload: SetHostEptSupportPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetHostEptSupportService extends ActionService {
  @Inject()
  createSystemTagAction: CreateSystemTagAction
  @Inject()
  deleteTagAction: DeleteTagAction

  @Mutation(() => ActionResult)
  setHostEptSupport(@Args('input') input: SetHostEptSupportInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostVO',
      async (payload: SetHostEptSupportPayload, taskId: string) => {
        const { uuid, eptUuid } = payload
        if (eptUuid) {
          await this.deleteTagAction.call(
            {
              uuid: eptUuid
            },
            { actionId, taskId }
          )
        } else {
          await this.createSystemTagAction.call(
            {
              resourceUuid: uuid,
              tag: `pageTableExtensionDisabled`,
              resourceType: 'HostVO'
            },
            { actionId, taskId }
          )
        }
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
