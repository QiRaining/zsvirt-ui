import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class RemoveHaStickStragedyPayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String)
  clusterUuid: string
}

@InputType()
class RemoveHaStickStragedyActionInput {
  @Field(() => [RemoveHaStickStragedyPayload])
  payload: RemoveHaStickStragedyPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}
// 加上标签是关闭跨集群高可用。
export class RemoveHaStickStragedyService extends ActionService {
  @Inject() createSystemTagAction: CreateSystemTagAction

  @Mutation(() => ActionResult)
  removeHaStickStragedy(@Args('input') input: RemoveHaStickStragedyActionInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: RemoveHaStickStragedyPayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: RemoveHaStickStragedyPayload, taskId: string, actionId: string) {
    const _input = {
      resourceUuid: payload.vmInstanceUuid,
      resourceType: 'VmInstanceVO',
      tag: `resourceBindings::Cluster:${payload.clusterUuid}`
    }
    await this.createSystemTagAction.call(_input, { actionId, taskId })
    return {
      id: payload.vmInstanceUuid
    }
  }
}
