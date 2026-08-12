import { Inject } from '@nestjs/common'
import { Int, Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { UpdateSystemTagAction } from '@/api/zstack/UpdateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CreatePSSystemTagPayload {
  @Field(() => String)
  resourceType: string

  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  tag: string
}

@InputType()
class CreatePSSystemTagInput {
  @Field(() => CreatePSSystemTagPayload)
  payload: CreatePSSystemTagPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
class DeletePSSystemTagPayload {
  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  oldTag: string
}

@InputType()
class DeletePSSystemTagInput {
  @Field(() => DeletePSSystemTagPayload)
  payload: DeletePSSystemTagPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
class UpdatePSSystemTagPayload {
  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  oldTag: string

  @Field(() => String)
  tag: string
}

@InputType()
class UpdatePSSystemTagInput {
  @Field(() => UpdatePSSystemTagPayload)
  payload: UpdatePSSystemTagPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdatePSSystemTagService extends ActionService {
  @Inject() createSystemTagAction: CreateSystemTagAction
  @Inject() deleteTagAction: DeleteTagAction
  @Inject() updateSystemTagAction: UpdateSystemTagAction
  @Inject() querySystemTagAction: QuerySystemTagAction

  @Mutation(() => ActionResult)
  createPSTag(@Args('input') input: CreatePSSystemTagInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: CreatePSSystemTagPayload, taskId: string) => {
        await this.createSystemTagAction.call({ ...payload }, { actionId, taskId })
        return {
          id: payload.resourceUuid
        }
      }
    )
    return { actionId }
  }

  @Mutation(() => ActionResult)
  async deletePSTag(@Args('input') input: DeletePSSystemTagInput) {
    const actionId = input.action.actionId
    const { resourceUuid, oldTag } = input.payload
    const uuid = await this.querySystemTags(resourceUuid, oldTag)
    this.actionHelper(input, 'PrimaryStorageVO', async (payload, taskId: string) => {
      await this.deleteTagAction.call({ uuid }, { actionId, taskId })
      return {
        id: payload.resourceUuid
      }
    })
    return { actionId }
  }

  @Mutation(() => ActionResult)
  async updatePSTag(@Args('input') input: UpdatePSSystemTagInput) {
    const actionId = input.action.actionId
    const { resourceUuid, oldTag, tag } = input.payload
    const uuid = await this.querySystemTags(resourceUuid, oldTag)
    this.actionHelper(input, 'PrimaryStorageVO', async (payload, taskId: string) => {
      await this.updateSystemTagAction.call({ uuid, tag }, { actionId, taskId })
      return {
        id: payload.resourceUuid
      }
    })
    return { actionId }
  }

  async querySystemTags(resourceUuid, oldTag) {
    const params = {
      conditions: [
        {
          key: 'resourceUuid',
          op: Op.eq,
          value: resourceUuid
        },
        {
          key: 'tag',
          op: Op.eq,
          value: oldTag
        }
      ]
    }
    const { inventories } = await this.querySystemTagAction.call(params)
    return inventories?.[0]?.uuid
  }
}
