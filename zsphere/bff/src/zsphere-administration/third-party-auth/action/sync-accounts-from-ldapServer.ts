import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SyncAccountsFromLdapServerAction } from '@/api/zstack/SyncAccountsFromLdapServerAction'
import { ActionService } from '@/base/action-service'
import { LongJobService } from '@/common/long-job/long-job.service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class SyncAccountsFromLdapServerPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class SyncAccountsFromLdapServerInput {
  @Field(() => SyncAccountsFromLdapServerPayload)
  payload: SyncAccountsFromLdapServerPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class SyncAccountsFromLdapServerService extends ActionService {
  @Inject() longJobService: LongJobService
  @Inject() syncAccountsFromLdapServerAction: SyncAccountsFromLdapServerAction

  @Mutation(() => ActionResult)
  async syncAccountsFromLdapServer(@Args('input') input: SyncAccountsFromLdapServerInput) {
    const actionId = input.action.actionId

    const jobData = JSON.stringify({ uuid: input.payload.uuid })

    await this.longJobService.call(
      input.action.name,
      'APISyncAccountsFromLdapServerMsg',
      jobData,
      actionId,
      'ThirdPartyAuthVO'
    )

    return { actionId }
  }
}
