import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AttachVirtualRouterOfferingPayload {
  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => String)
  vRouterOfferingUuid: string
}

@InputType()
class AttachVirtualRouterOfferingInput {
  @Field(() => AttachVirtualRouterOfferingPayload)
  payload: AttachVirtualRouterOfferingPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachVirtualRouterOfferingService extends ActionService {
  @Inject() createSystemTagAction: CreateSystemTagAction

  @Mutation(() => ActionResult)
  attachVirtualRouterOffering(@Args('input') input: AttachVirtualRouterOfferingInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: AttachVirtualRouterOfferingPayload, taskId: string) => {
      const params = {
        resourceType: 'L3NetworkVO',
        resourceUuid: payload.l3NetworkUuid,
        tag: `virtualRouterOffering::${payload.vRouterOfferingUuid}`
      }
      await this.createSystemTagAction.call(params, {
        actionId,
        taskId
      })

      return {
        id: payload.l3NetworkUuid,
        fields: 'virtualRouterOffering',
        inventory: {
          virtualRouterOffering: {
            uuid: payload.vRouterOfferingUuid
          }
        }
      }
    }

    this.actionHelper(input, 'L3Network', actionFn)
    return { actionId }
  }
}
