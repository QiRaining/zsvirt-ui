import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddInstanceToMonitorGroupAction } from '@/api/zstack/AddInstanceToMonitorGroupAction'
import { ApplyMonitorTemplateToMonitorGroupAction } from '@/api/zstack/ApplyMonitorTemplateToMonitorGroupAction'
import {
  CreateMonitorGroupAction,
  CreateMonitorGroupResult
} from '@/api/zstack/CreateMonitorGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class GroupActionsInput {
  @Field(() => String, { nullable: true })
  groupUuid: string

  @Field(() => String)
  actionType: string

  @Field(() => String)
  actionUuid: string
}
@InputType()
export class CreateMonitorGroupPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => [String])
  instanceUuids: string[]

  @Field(() => String, { nullable: true })
  monitorTemplate: string

  @Field(() => String, { nullable: true })
  zwatchEndpoint: string

  @Field(() => [GroupActionsInput], { nullable: true })
  actions: GroupActionsInput[]
}

@InputType()
class CreateMonitorGroupInput {
  @Field(() => CreateMonitorGroupPayload)
  payload: CreateMonitorGroupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateMonitorGroupService extends ActionService {
  @Inject() createMonitorGroupAction: CreateMonitorGroupAction
  @Inject() addInstanceToMonitorGroupAction: AddInstanceToMonitorGroupAction
  @Inject()
  applyMonitorTemplateToMonitorGroupAction: ApplyMonitorTemplateToMonitorGroupAction

  @Mutation(() => ActionResult)
  createMonitorGroup(@Args('input') input: CreateMonitorGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'MonitorGroup',
      async (payload: CreateMonitorGroupPayload, taskId: string) => {
        const result: CreateMonitorGroupResult = await this.createMonitorGroupAction.call(
          { ...payload },
          { actionId, taskId }
        )
        // 注意先添加资源再应用报警模板
        if (result.inventory.uuid) {
          // 添加资源实例
          const tasks = []
          payload?.instanceUuids.map(instanceUuid => {
            tasks.push(
              this.addInstanceToMonitorGroupAction.call({
                instanceUuid,
                groupUuid: result.inventory.uuid
              })
            )
          })
          await Promise.all(tasks)

          // 应用报警模板
          if (payload?.monitorTemplate) {
            await this.applyMonitorTemplateToMonitorGroupAction.call({
              templateUuid: payload?.monitorTemplate,
              groupUuid: result.inventory.uuid
            })
          }
        }
        return {
          id: result.inventory.uuid,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
