import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AttachL2NetworkToHostAction } from '@/api/zstack/AttachL2NetworkToHostAction'
import { CreateBondingAction } from '@/api/zstack/CreateBondingAction'
import { GetHostNetworkFactsAction } from '@/api/zstack/GetHostNetworkFactsAction'
import { UpdateBondingAction } from '@/api/zstack/UpdateBondingAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class AttachL2NetworkToHostPayload {
  @Field(() => String)
  l2NetworkUuid: string

  @Field(() => String)
  hostUuid: string

  @Field(() => String)
  mode: string

  @Field(() => String, { nullable: true, defaultValue: 'LinuxBonding' })
  type: string

  @Field(() => String)
  bondingName: string

  @Field(() => [String])
  slaveUuids: string[]

  @Field(() => String, { nullable: true })
  xmitHashPolicy?: string

  @Field(() => String, { nullable: true })
  bondingUuid?: string
}

@InputType()
class AttachL2NetworkToHostInput {
  @Field(() => AttachL2NetworkToHostPayload)
  payload: AttachL2NetworkToHostPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachL2NetworkToHostService extends ActionService {
  @Inject()
  attachL2NetworkToHostAction: AttachL2NetworkToHostAction
  @Inject()
  createBondingAction: CreateBondingAction
  @Inject()
  updateBondingAction: UpdateBondingAction
  @Inject()
  getHostNetworkFactsAction: GetHostNetworkFactsAction

  @Mutation(() => ActionResult)
  attachL2NetworkToHost(@Args('input') input: AttachL2NetworkToHostInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Host',
      async (payload: AttachL2NetworkToHostPayload, taskId: string) => {
        await this.action(payload, { actionId, taskId })

        return {
          id: actionId
        }
      }
    )
    return { actionId }
  }

  async action(
    payload: AttachL2NetworkToHostPayload,
    { actionId, taskId }: { taskId: string; actionId: string }
  ) {
    const {
      hostUuid,
      l2NetworkUuid,
      bondingName,
      bondingUuid,
      mode,
      xmitHashPolicy,
      slaveUuids,
      type
    } = payload
    if (bondingUuid) {
      await this.updateBondingAction.call(
        {
          uuid: bondingUuid,
          slaveUuids: slaveUuids,
          mode: mode,
          xmitHashPolicy: xmitHashPolicy
        },
        { actionId, taskId }
      )
    } else {
      await this.createBondingAction.call(
        {
          bondingName,
          mode,
          slaveUuids,
          xmitHashPolicy,
          hostUuids: [hostUuid],
          type
        },
        { actionId, taskId }
      )
    }
    await this.attachL2NetworkToHostAction.call(
      {
        hostUuid,
        l2NetworkUuid
      },
      { actionId, taskId }
    )
    await this.getHostNetworkFactsAction.call(
      {
        hostUuid
      },
      { actionId, taskId }
    )
  }
}
