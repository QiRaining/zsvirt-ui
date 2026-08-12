import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { AddResourcesToDirectoryAction } from '@/api/zstack/AddResourcesToDirectoryAction'
import { RemoveResourcesFromDirectoryAction } from '@/api/zstack/RemoveResourcesFromDirectoryAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class AddResourcesToDirectoryPayload {
  @Field(() => String)
  directoryUuid: string

  @Field(() => String)
  uuid: string

  @Field(() => String)
  originDirectoryUuid: string
}

@InputType()
export class AddResourcesToDirectoryInput {
  @Field(() => [AddResourcesToDirectoryPayload])
  payload: AddResourcesToDirectoryPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddResourcesToDirectoryService extends ActionService {
  @Inject() addResourcesToDirectoryAction: AddResourcesToDirectoryAction
  @Inject()
  removeResourcesFromDirectoryAction: RemoveResourcesFromDirectoryAction

  @Mutation(() => ActionResult)
  addResourcesToDirectory(@Args('input') input: AddResourcesToDirectoryInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: AddResourcesToDirectoryPayload, taskId) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: AddResourcesToDirectoryPayload, taskId: string, actionId: string) {
    const { directoryUuid, uuid, originDirectoryUuid } = payload

    if (originDirectoryUuid && ['-1', '-2'].indexOf(originDirectoryUuid) === -1) {
      await this.removeResourcesFromDirectoryAction.call(
        {
          resourceUuids: [uuid],
          directoryUuid: originDirectoryUuid
        },
        {
          actionId,
          taskId
        }
      )
    }

    //移动到‘未分组’、‘全部云主机’只用把资源从dir移除就好，其他的才需要再次添加
    if (['-1', '-2'].indexOf(payload.directoryUuid) === -1) {
      await this.addResourcesToDirectoryAction.call(
        {
          resourceUuids: [uuid],
          directoryUuid
        },
        {
          actionId,
          taskId
        }
      )
    }

    return {
      id: actionId
    }
  }
}
