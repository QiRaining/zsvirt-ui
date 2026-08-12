import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AttachTagToResourcesAction } from '@/api/zstack/AttachTagToResourcesAction'
import { DetachTagFromResourcesAction } from '@/api/zstack/DetachTagFromResourcesAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class ManagementTagPayload {
  @Field(() => [String])
  removeTagUuids: string[]

  @Field(() => [String])
  addTagUuids: string[]

  @Field(() => [String])
  resourceUuids: any[]
}

@InputType()
class ManagementTagInput {
  @Field(() => [ManagementTagPayload])
  payload: ManagementTagPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ManagementTagService extends ActionService {
  @Inject() attachTagToResourcesAction: AttachTagToResourcesAction
  @Inject() detachTagFromResourcesAction: DetachTagFromResourcesAction

  @Mutation(() => ActionResult)
  managementTag(@Args('input') input: ManagementTagInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Tag',
      async (payload: ManagementTagPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: ManagementTagPayload, taskId: string, actionId: string) {
    const { addTagUuids, removeTagUuids, resourceUuids } = payload
    const tasks = addTagUuids
      .map(async tagUuid => {
        await this.attachTagToResourcesAction.call({ tagUuid, resourceUuids }, { actionId, taskId })
      })
      .concat(
        removeTagUuids.map(async tagUuid => {
          await this.detachTagFromResourcesAction.call(
            { tagUuid, resourceUuids },
            { actionId, taskId }
          )
        })
      )
    await Promise.all(tasks)
    return {
      id: resourceUuids?.[0]
    }
  }
}
