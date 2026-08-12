import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import {
  UpdateAccountThirdPartyAuthPayload,
  UpdateAccountThirdPartyAuthService
} from './update-account-third-party-auth'

@InputType()
class EditAccountThirdPartyAuthConfigPayload {
  @Field(() => UpdateAccountThirdPartyAuthPayload, { nullable: true })
  updateOAuthClientPayload?: UpdateAccountThirdPartyAuthPayload
}

@InputType()
class EditAccountThirdPartyAuthConfigInput {
  @Field(() => EditAccountThirdPartyAuthConfigPayload)
  payload: EditAccountThirdPartyAuthConfigPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class EditAccountThirdPartyAuthConfigService extends ActionService {
  @Inject()
  updateAccountThirdPartyAuthService: UpdateAccountThirdPartyAuthService

  @Mutation(() => ActionResult)
  editAccountThirdPartyAuthConfig(@Args('input') input: EditAccountThirdPartyAuthConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'AccountThirdPartyAuthVO',
      async (payload: EditAccountThirdPartyAuthConfigPayload, taskId: string) => {
        const { updateOAuthClientPayload } = payload
        if (updateOAuthClientPayload) {
          await this.updateAccountThirdPartyAuthService.actionFn(
            updateOAuthClientPayload,
            taskId,
            actionId
          )
        }
        return {
          id: actionId
        }
      }
    )
    return { actionId }
  }
}
