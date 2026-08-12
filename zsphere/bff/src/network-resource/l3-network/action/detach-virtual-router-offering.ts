import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DetachVirtualRouterOfferingPayload {
  @Field(() => String, { nullable: true })
  l3NetworkUuid: string
}

@InputType()
class DetachVirtualRouterOfferingInput {
  @Field(() => DetachVirtualRouterOfferingPayload)
  payload: DetachVirtualRouterOfferingPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachVirtualRouterOfferingService extends ActionService {
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() deleteTagAction: DeleteTagAction

  @Mutation(() => ActionResult)
  detachVirtualRouterOffering(@Args('input') input: DetachVirtualRouterOfferingInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: DetachVirtualRouterOfferingPayload, taskId: string) => {
      const { inventories: systemTagList } = await this.querySystemTagAction.call({
        conditions: [{ key: 'resourceUuid', value: payload.l3NetworkUuid }]
      })
      if (systemTagList.length) {
        const _systemTag = systemTagList.find(({ tag }) => tag.includes('virtualRouterOffering::'))
        _systemTag &&
          (await this.deleteTagAction.call(
            { uuid: _systemTag.uuid },
            {
              actionId,
              taskId
            }
          ))
      }

      return {
        id: payload.l3NetworkUuid,
        fields: 'virtualRouterOffering',
        inventory: {
          virtualRouterOffering: null
        }
      }
    }

    this.actionHelper(input, 'L3Network', actionFn)
    return { actionId }
  }
}
