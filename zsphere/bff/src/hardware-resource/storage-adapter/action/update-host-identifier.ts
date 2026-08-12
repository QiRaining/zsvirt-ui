import { Inject, Injectable } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateHostIscsiInitiatorNameAction } from '@/api/zstack/UpdateHostIscsiInitiatorNameAction'
import { UpdateHostNqnAction } from '@/api/zstack/UpdateHostNqnAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateHostIdentifierPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  type: string

  @Field(() => String)
  identifier: string
}

@InputType()
export class UpdateHostIdentifierInput {
  @Field(() => UpdateHostIdentifierPayload)
  payload: UpdateHostIdentifierPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@Injectable()
export class UpdateHostIdentifierService extends ActionService {
  @Inject()
  private updateHostIscsiInitiatorNameAction: UpdateHostIscsiInitiatorNameAction

  @Inject()
  private updateHostNqnAction: UpdateHostNqnAction

  @Mutation(() => ActionResult)
  updateHostIdentifier(@Args('input') input: UpdateHostIdentifierInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'StorageAdapter', async (payload, taskId) => {
      const { uuid, type, identifier } = payload
      if (type === 'iSCSI') {
        await this.updateHostIscsiInitiatorNameAction.call(
          { uuid, iscsiInitiatorName: identifier },
          {
            actionId,
            taskId
          }
        )
      } else if (type === 'NVMe') {
        await this.updateHostNqnAction.call(
          { uuid, nqn: identifier },
          {
            actionId,
            taskId
          }
        )
      }
      return { id: uuid }
    })
    return { actionId }
  }
}
