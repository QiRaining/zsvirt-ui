import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DeleteL2NetworkAction } from '@/api/zstack/DeleteL2NetworkAction'
import { DeletePortGroupAction } from '@/api/zstack/DeletePortGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { l2NetworkType as L2NetworkType } from '../l2.network.model'

@InputType()
class DeleteL2NetworkInput {
  @Field(() => String)
  uuid: string

  @Field(() => L2NetworkType, {
    nullable: true,
    defaultValue: L2NetworkType.VirtualSwitch,
    description: '这里只用分布式交换机和端口组'
  })
  l2NetworkType?: L2NetworkType
}

@InputType()
export class DeleteL2NetworkActionInput {
  @Field(() => [DeleteL2NetworkInput])
  payload: DeleteL2NetworkInput[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteL2NetworkService extends ActionService {
  @Inject() deletePortGroupAction: DeletePortGroupAction
  @Inject() deleteL2NetworkAction: DeleteL2NetworkAction

  @Mutation(() => ActionResult)
  deleteL2Networks(@Args('input') input: DeleteL2NetworkActionInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'L2Network', async (payload: DeleteL2NetworkInput, taskId: string) => {
      const action = {
        actionId,
        taskId
      }

      const { uuid, l2NetworkType } = payload

      if (l2NetworkType === L2NetworkType.VirtualSwitch) {
        await this.deleteL2NetworkAction.call({ uuid }, action)
      }

      if (l2NetworkType === L2NetworkType.PortGroup) {
        await this.deletePortGroupAction.call({ uuid }, action)
      }

      return {
        id: payload.uuid,
        inventory: {
          actionType: 'delete',
          id: payload.uuid
        }
      }
    })
    return { actionId }
  }
}
