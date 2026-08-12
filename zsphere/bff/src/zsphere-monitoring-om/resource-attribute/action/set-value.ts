import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateResourceAttributeKeyAction } from '@/api/zstack/CreateResourceAttributeKeyAction'
import { CreateResourceAttributeValueAction } from '@/api/zstack/CreateResourceAttributeValueAction'
import { DeleteResourceAttributeValueAction } from '@/api/zstack/DeleteResourceAttributeValueAction'
import { UpdateResourceAttributeKeyAction } from '@/api/zstack/UpdateResourceAttributeKeyAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { CreateResourceAttributeKeyPayload } from './create-key'
import { UpdateResourceAttributeKeyPayload } from './update-key'

@InputType()
export class CreateResourceAttributeValuePayload {
  @Field(() => String)
  keyUuid: string

  @Field(() => String)
  value: string

  @Field(() => [String])
  resourceUuids: string[]
}

@InputType()
export class DeleteResourceAttributeValuePayload {
  @Field(() => String)
  keyUuid: string

  @Field(() => [String])
  resourceUuids: string[]
}

@InputType()
export class SetResourceAttributeValuePayload {
  @Field(() => [CreateResourceAttributeKeyPayload], { nullable: true })
  createResourceAttributeKeyPayload?: CreateResourceAttributeKeyPayload[]

  @Field(() => [UpdateResourceAttributeKeyPayload], { nullable: true })
  updateResourceAttributeKeyPayload?: UpdateResourceAttributeKeyPayload[]

  @Field(() => [CreateResourceAttributeValuePayload], { nullable: true })
  createResourceAttributeValuePayload?: CreateResourceAttributeValuePayload[]

  @Field(() => [DeleteResourceAttributeValuePayload], { nullable: true })
  deleteResourceAttributeValuePayload?: DeleteResourceAttributeValuePayload[]
}

@InputType()
export class SetResourceAttributeValueInput {
  @Field(() => SetResourceAttributeValuePayload)
  payload: SetResourceAttributeValuePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetResourceAttributeValueService extends ActionService {
  @Inject()
  private createResourceAttributeKeyAction: CreateResourceAttributeKeyAction
  @Inject()
  private updateResourceAttributeKeyAction: UpdateResourceAttributeKeyAction
  @Inject()
  private createResourceAttributeValueAction: CreateResourceAttributeValueAction
  @Inject()
  private deleteResourceAttributeValueAction: DeleteResourceAttributeValueAction

  @Mutation(() => ActionResult)
  setResourceAttributeValue(@Args('input') input: SetResourceAttributeValueInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ResourceAttributeValue',
      async (payload: SetResourceAttributeValuePayload, taskId: string) => {
        const keyTasks: Array<Promise<any>> = []
        if (payload.createResourceAttributeKeyPayload?.length) {
          keyTasks.push(
            ...payload.createResourceAttributeKeyPayload.map(item =>
              this.createResourceAttributeKeyAction.call(item, {
                actionId,
                taskId
              })
            )
          )
        }
        if (payload.updateResourceAttributeKeyPayload?.length) {
          keyTasks.push(
            ...payload.updateResourceAttributeKeyPayload.map(item =>
              this.updateResourceAttributeKeyAction.call(item, {
                actionId,
                taskId
              })
            )
          )
        }
        if (keyTasks.length) {
          await Promise.all(keyTasks)
        }
        if (payload.deleteResourceAttributeValuePayload?.length) {
          await Promise.all(
            payload.deleteResourceAttributeValuePayload.map(item =>
              this.deleteResourceAttributeValueAction.call(item, {
                actionId,
                taskId
              })
            )
          )
        }
        if (payload.createResourceAttributeValuePayload?.length) {
          await Promise.all(
            payload.createResourceAttributeValuePayload.map(item =>
              this.createResourceAttributeValueAction.call(item, {
                actionId,
                taskId
              })
            )
          )
        }
        return {
          id:
            payload.createResourceAttributeValuePayload?.[0]?.resourceUuids[0] ||
            payload.deleteResourceAttributeValuePayload?.[0]?.resourceUuids[0] ||
            ''
        }
      }
    )
    return { actionId }
  }
}
