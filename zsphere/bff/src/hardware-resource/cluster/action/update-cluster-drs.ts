import { Inject } from '@nestjs/common'
import { Mutation, Args, Int, InputType, Field } from '@nestjs/graphql'
import { remove as _remove } from 'lodash'

import { UpdateClusterDRSAction, UpdateClusterDRSResult } from '@/api/zstack/UpdateClusterDRSAction'
import { UpdateResourceConfigAction } from '@/api/zstack/UpdateResourceConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { UpdateGlobalConfigPayload as DrsGlobalConfig } from '@/settings/global-config/action/update-global-config'

import { ClusterResourceConfig } from './create'
import { ThresholdsInput } from './create-cluster-drs'

@InputType()
class UpdateClusterDRSPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String)
  automationLevel: string

  @Field(() => Boolean, { nullable: true })
  defaultEnable?: boolean

  @Field(() => Int)
  thresholdDuration: number

  @Field(() => [ThresholdsInput])
  thresholds: ThresholdsInput[]

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => [ClusterResourceConfig], {
    nullable: true,
    defaultValue: []
  })
  resourceConfigList?: DrsGlobalConfig[]
}

@InputType()
class UpdateClusterDRSInput {
  @Field(() => UpdateClusterDRSPayload)
  payload: UpdateClusterDRSPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateClusterDRSService extends ActionService {
  @Inject() updateClusterDRSAction: UpdateClusterDRSAction
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction

  @Mutation(() => ActionResult)
  updateClusterDRS(@Args('input') input: UpdateClusterDRSInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ClusterDRS',
      async (payload: UpdateClusterDRSPayload, taskId: string) => {
        try {
          const action = { actionId, taskId }

          const { resourceConfigList, clusterUuid, ...updateDrsPayload } = payload

          const enableDrsGlobalConfig = _remove(
            resourceConfigList,
            it => it.category === 'drs' && it.name === 'drs.enable'
          )

          if (enableDrsGlobalConfig[0]?.value === 'true') {
            await this.updateClusterDRSAction.call(
              {
                uuid: updateDrsPayload.uuid,
                state: 'Enabled'
              },
              action
            )
          }
          const result: UpdateClusterDRSResult = await this.updateClusterDRSAction.call(
            {
              ...updateDrsPayload
            },
            action
          )

          if (resourceConfigList.length > 0 && clusterUuid) {
            await this.updateGlobalConfig(resourceConfigList, clusterUuid, action)
          }

          return {
            id: actionId,
            fields: 'name, defaultEnable, automationLevel, thresholdDuration, thresholds',
            inventory: result.inventory
          }
        } catch (e) {
          console.log('e')
        }
      }
    )
    return { actionId }
  }

  updateGlobalConfig = async (
    globalConfigList,
    clusterUuid,
    action: {
      actionId: string
      taskId: string
    }
  ) => {
    await Promise.allSettled(
      globalConfigList.map(it =>
        this.updateResourceConfigAction.call({ ...it, resourceUuid: clusterUuid }, action)
      )
    )
  }
}
