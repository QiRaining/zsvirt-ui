import { Inject } from '@nestjs/common'
import { Mutation, Args, Int, InputType, Field } from '@nestjs/graphql'

import { CreateClusterDRSAction, CreateClusterDRSResult } from '@/api/zstack/CreateClusterDRSAction'
import { UpdateClusterDRSAction } from '@/api/zstack/UpdateClusterDRSAction'
import { UpdateResourceConfigAction } from '@/api/zstack/UpdateResourceConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { UpdateGlobalConfigPayload as DrsGlobalConfig } from '@/settings/global-config/action/update-global-config'

import { ClusterResourceConfig } from './create'

@InputType()
export class ThresholdsInput {
  @Field(() => String, { nullable: true })
  operator: string

  @Field(() => String, { nullable: true })
  thresholdName: string

  @Field(() => String, { nullable: true })
  thresholdValue: string
}

@InputType()
export class CreateClusterDRSPayload {
  @Field(() => String)
  clusterUuid: string

  @Field(() => String)
  name: string

  @Field(() => String)
  automationLevel: string

  @Field(() => Boolean, { nullable: true })
  defaultEnable?: boolean

  @Field(() => [ThresholdsInput])
  thresholds: ThresholdsInput[]

  @Field(() => Int)
  thresholdDuration: number

  @Field(() => [ClusterResourceConfig], {
    nullable: true,
    defaultValue: []
  })
  resourceConfigList?: DrsGlobalConfig[]

  @Field(() => String, { nullable: true })
  from?: string
}

@InputType()
class CreateClusterDRSInput {
  @Field(() => CreateClusterDRSPayload)
  payload: CreateClusterDRSPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateClusterDRSService extends ActionService {
  @Inject() createClusterDRSAction: CreateClusterDRSAction
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction
  @Inject() updateClusterDRSAction: UpdateClusterDRSAction

  @Mutation(() => ActionResult)
  createClusterDRS(@Args('input') input: CreateClusterDRSInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ClusterDRS',
      async (payload: CreateClusterDRSPayload, taskId: string) => {
        const action = { actionId, taskId }
        const { ...createDrsPayload } = payload

        const result: CreateClusterDRSResult = await this.createClusterDRSAction.call(
          createDrsPayload,
          action
        )

        await this.updateClusterDRSAction.call(
          {
            uuid: result.inventory.uuid,
            state: 'Enabled'
          },
          action
        )

        if (payload.resourceConfigList.length > 0) {
          await this.updateResourceConfig(payload.resourceConfigList, payload.clusterUuid, action)
        }
        return {
          id: actionId,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }

  updateResourceConfig = async (
    resourceConfigList,
    clusterUuid,
    action: {
      actionId: string
      taskId: string
    }
  ) => {
    await Promise.allSettled(
      resourceConfigList.map(it =>
        this.updateResourceConfigAction.call({ ...it, resourceUuid: clusterUuid }, action)
      )
    )
  }
}
