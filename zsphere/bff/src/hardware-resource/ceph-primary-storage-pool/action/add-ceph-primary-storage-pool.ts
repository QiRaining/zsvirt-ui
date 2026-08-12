import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  AddCephPrimaryStoragePoolAction,
  AddCephPrimaryStoragePoolResult
} from '@/api/zstack/AddCephPrimaryStoragePoolAction'
import { ActionService } from '@/base/action-service'
import { CephPrimaryStoragePoolType } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddCephPrimaryStoragePoolPayload {
  @Field(() => String)
  primaryStorageUuid: string

  @Field(() => String)
  poolName: string

  @Field(() => String, { nullable: true })
  aliasName?: string

  @Field(() => Boolean, { nullable: true })
  isCreate?: boolean

  @Field(() => CephPrimaryStoragePoolType)
  type: CephPrimaryStoragePoolType
}

@InputType()
class AddCephPrimaryStoragePoolInput {
  @Field(() => [AddCephPrimaryStoragePoolPayload])
  payload: AddCephPrimaryStoragePoolPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddCephPrimaryStoragePoolService extends ActionService {
  @Inject() addCephPrimaryStoragePoolAction: AddCephPrimaryStoragePoolAction

  @Mutation(() => ActionResult)
  addCephPrimaryStoragePool(@Args('input') input: AddCephPrimaryStoragePoolInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'CephPrimaryStoragePool', this.action(actionId))

    return { actionId }
  }

  action(actionId) {
    return async (payload: AddCephPrimaryStoragePoolPayload, taskId: string) => {
      const result: AddCephPrimaryStoragePoolResult =
        await this.addCephPrimaryStoragePoolAction.call(
          {
            ...payload
          },
          { actionId, taskId }
        )
      return {
        id: actionId,
        inventory: result.inventory
      }
    }
  }
}
