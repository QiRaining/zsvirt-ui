import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, registerEnumType } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { UpdateSystemTagAction } from '@/api/zstack/UpdateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

export enum SystemTagActionType {
  Delete = 'Delete',
  Update = 'Update',
  Create = 'Create'
}

registerEnumType(SystemTagActionType, {
  name: 'SystemTagActionType'
})

@InputType()
export class SetSystemTagPayload {
  @Field(() => String, { nullable: true })
  tag?: string

  @Field(() => String, { nullable: true })
  originTag?: string

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => SystemTagActionType, {
    nullable: true,
    defaultValue: SystemTagActionType.Update
  })
  actionType?: SystemTagActionType
}

@InputType()
class SetSystemTagInput {
  @Field(() => [SetSystemTagPayload])
  payload: SetSystemTagPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetSystemTagService extends ActionService {
  @Inject() createSystemTagAction: CreateSystemTagAction
  @Inject() updateSystemTagAction: UpdateSystemTagAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() deleteTagAction: DeleteTagAction

  @Mutation(() => ActionResult)
  setSystemTag(@Args('input') input: SetSystemTagInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SystemTag',
      async (payload: SetSystemTagPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: SetSystemTagPayload, taskId: string, actionId) {
    const { tag, originTag, resourceUuid, actionType, resourceType } = payload
    if (actionType === SystemTagActionType.Create) {
      await this.createSystemTagAction.call(
        { resourceUuid, tag, resourceType },
        { taskId, actionId }
      )
    } else {
      const resp = await this.querySystemTagAction.call({
        conditions: [
          {
            key: 'resourceUuid',
            op: Op.eq,
            value: resourceUuid
          },
          {
            key: 'tag',
            op: Op.like,
            value: originTag
          }
        ]
      })
      const tagUuid = resp.inventories?.[0]?.uuid
      switch (actionType) {
        case SystemTagActionType.Delete:
          await this.deleteTagAction.call({ uuid: tagUuid }, { taskId, actionId })
          break

        case SystemTagActionType.Update:
          if (tagUuid) {
            await this.updateSystemTagAction.call({ uuid: tagUuid, tag }, { taskId, actionId })
          } else {
            await this.createSystemTagAction.call(
              { resourceUuid, tag, resourceType },
              { taskId, actionId }
            )
          }
          break

        default:
          break
      }
    }
    return {
      id: actionId
    }
  }
}
