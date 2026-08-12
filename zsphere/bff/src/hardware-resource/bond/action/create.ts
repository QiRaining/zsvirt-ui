import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { isEmpty, omit, pick } from 'lodash'

import { CreateBondingAction } from '@/api/zstack/CreateBondingAction'
import { GetHostNetworkFactsAction } from '@/api/zstack/GetHostNetworkFactsAction'
import { QueryHostNetworkInterfaceAction } from '@/api/zstack/QueryHostNetworkInterfaceAction'
import { SetIpOnHostNetworkBondingAction } from '@/api/zstack/SetIpOnHostNetworkBondingAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { IpConfigPayload } from './set-ip'

@InputType()
export class CreateBondPayload extends IpConfigPayload {
  @Field(() => String)
  bondingName: string

  @Field(() => [String], { nullable: true })
  slaveUuids?: string[]

  @Field(() => [String], { nullable: true })
  slaveNames?: string[]

  @Field(() => [String])
  hostUuids: string[]

  @Field(() => String, { nullable: true, defaultValue: 'LinuxBonding' })
  type: string

  @Field(() => String, { nullable: true })
  mode: string

  @Field(() => String, { nullable: true })
  xmitHashPolicy?: string
}

@InputType()
export class CreateBondInput {
  @Field(() => [CreateBondPayload])
  payload: CreateBondPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateBondService extends ActionService {
  @Inject() createAction: CreateBondingAction
  @Inject() setIpAction: SetIpOnHostNetworkBondingAction
  @Inject() queryHostNetworkInterfaceAction: QueryHostNetworkInterfaceAction
  @Inject() getHostNetworkFactsAction: GetHostNetworkFactsAction

  @Mutation(() => ActionResult)
  createBond(@Args('input') input: CreateBondInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Bond',
      async (payload: CreateBondPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: CreateBondPayload, taskId: string, actionId: string) {
    const ipKeyList = ['ipAddress', 'netmask', 'gateway', 'description'] as const
    const createPayload = omit(payload, ipKeyList) as Omit<
      CreateBondPayload,
      'ipAddress' | 'netmask' | 'gateway' | 'description'
    >
    const hostUuid = createPayload.hostUuids?.[0]

    const { inventory } = await this.createAction.call(createPayload, {
      actionId,
      taskId
    })

    const ipPayload = pick(payload, ipKeyList)
    if (!isEmpty(ipPayload)) {
      await this.setIpAction.call(
        {
          ...ipPayload,
          bondingUuid: inventory?.[0]?.uuid
        },
        {
          actionId,
          taskId
        }
      )
    }

    // 刷新bond数据。
    await this.getHostNetworkFactsAction.call(
      {
        hostUuid
      },
      {
        actionId,
        taskId
      }
    )

    return {
      id: inventory?.[0]?.uuid,
      inventory
    }
  }
}
