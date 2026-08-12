import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetHaStickStragedyPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class SetHaStickStragedyActionInput {
  @Field(() => [SetHaStickStragedyPayload])
  payload: SetHaStickStragedyPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}
// 移除标签是打开跨集群高可用。
export class SetHaStickStragedyService extends ActionService {
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() deleteTagAction: DeleteTagAction

  @Mutation(() => ActionResult)
  setHaStickStragedy(@Args('input') input: SetHaStickStragedyActionInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetHaStickStragedyPayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: SetHaStickStragedyPayload, taskId: string, actionId: string) {
    const params = {
      conditions: [{ key: 'resourceUuid', value: payload.uuid }]
    }
    const { inventories: systemTagList } = await this.querySystemTagAction.call(params)
    if (systemTagList.length) {
      const _systemTag = systemTagList.find(({ tag }) => tag.includes('resourceBindings::Cluster:'))
      _systemTag &&
        (await this.deleteTagAction.call({ uuid: _systemTag.uuid }, { actionId, taskId }))
    }

    return {
      id: payload.uuid
    }
  }
}
