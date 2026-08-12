import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateSystemTagAction, CreateSystemTagResult } from '@/api/zstack/CreateSystemTagAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdatePrimaryStorageThinProvisionPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  provisionUuid?: string

  @Field(() => String)
  value: string
}

@InputType()
class UpdatePrimaryStorageThinProvisionInput {
  @Field(() => UpdatePrimaryStorageThinProvisionPayload)
  payload: UpdatePrimaryStorageThinProvisionPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdatePrimaryStorageThinProvisionService extends ActionService {
  @Inject() deleteTagAction: DeleteTagAction
  @Inject() createSystemTagAction: CreateSystemTagAction

  @Mutation(() => ActionResult)
  updatePrimaryStorageThinProvision(@Args('input') input: UpdatePrimaryStorageThinProvisionInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: UpdatePrimaryStorageThinProvisionPayload, taskId: string) => {
        const { uuid, value, provisionUuid } = payload
        let result = {}
        if (!provisionUuid) {
          result = (await this.createSystemTagAction.call(
            {
              resourceType: 'PrimaryStorageVO',
              resourceUuid: uuid,
              tag: `primaryStorageVolumeProvisioningStrategy::${value}`
            },
            { actionId, taskId }
          )) as CreateSystemTagResult
        } else {
          result = await this.deleteTagAction.call(
            {
              uuid: provisionUuid
            },
            { actionId, taskId }
          )
        }
        return {
          id: payload.uuid,
          ...result
        }
      }
    )
    return { actionId }
  }
}
