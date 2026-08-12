import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  ChangePrimaryStorageStateAction,
  ChangePrimaryStorageStateResult
} from '@/api/zstack/ChangePrimaryStorageStateAction'
import { ActionService } from '@/base/action-service'
import { PrimaryStorageStateEvent } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class EnablePrimaryStoragePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class EnablePrimaryStorageInput {
  @Field(() => [EnablePrimaryStoragePayload])
  payload: EnablePrimaryStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class EnablePrimaryStorageService extends ActionService {
  @Inject() changePrimaryStorageStateAction: ChangePrimaryStorageStateAction

  @Mutation(() => ActionResult)
  enablePrimaryStorageList(@Args('input') input: EnablePrimaryStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: EnablePrimaryStoragePayload, taskId: string) => {
        const { uuid } = payload
        const result: ChangePrimaryStorageStateResult =
          await this.changePrimaryStorageStateAction.call(
            {
              uuid,
              stateEvent: PrimaryStorageStateEvent.enable
            },
            { actionId, taskId }
          )
        return {
          id: payload.uuid,
          fields: 'state,lastOpDate',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
