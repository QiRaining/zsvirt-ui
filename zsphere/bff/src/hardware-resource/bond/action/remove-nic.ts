import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { pick } from 'lodash'

import { GetHostNetworkFactsAction } from '@/api/zstack/GetHostNetworkFactsAction'
import { UpdateBondingAction } from '@/api/zstack/UpdateBondingAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { IpConfigPayload } from './set-ip'

@InputType()
class RemoveNicPayload extends IpConfigPayload {
  @Field(() => String)
  uuid: string

  @Field(() => [String], { nullable: true })
  slaveUuids?: string[]

  @Field(() => String, { nullable: true, defaultValue: 'LinuxBonding' })
  type?: string

  @Field(() => String, { nullable: true })
  mode?: string

  @Field(() => String, { nullable: true })
  xmitHashPolicy?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string
}

@InputType()
export class RemoveNicInput {
  @Field(() => [RemoveNicPayload])
  payload: RemoveNicPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RemoveNicService extends ActionService {
  @Inject() updateAction: UpdateBondingAction
  @Inject() getHostNetworkFactsAction: GetHostNetworkFactsAction

  @Mutation(() => ActionResult)
  removeNic(@Args('input') input: RemoveNicInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Bond', async (payload: RemoveNicPayload, taskId: string) => {
      const updatePayload = pick(payload, [
        'uuid',
        'slaveUuids',
        'type',
        'mode',
        'xmitHashPolicy',
        'description'
      ])
      await this.updateAction.call(updatePayload, {
        actionId,
        taskId
      })

      if (payload.hostUuid) {
        await this.getHostNetworkFactsAction.call(
          {
            hostUuid: payload.hostUuid
          },
          {
            actionId,
            taskId
          }
        )
      }

      return {
        id: payload?.uuid
      }
    })
    return { actionId }
  }
}
