import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  AttachNvmeServerToClusterAction,
  AttachNvmeServerToClusterResult
} from '@/api/zstack/AttachNvmeServerToClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AttachNvmeServerToClusterPayload {
  @Field(() => String, { description: 'Nvme服务器的的UUID' })
  uuid: string

  @Field(() => String, { description: '	集群UUID' })
  clusterUuid: string
}

@InputType()
class AttachNvmeServerToClusterInput {
  @Field(() => [AttachNvmeServerToClusterPayload])
  payload: AttachNvmeServerToClusterPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachNvmeServerToClusterService extends ActionService {
  @Inject() attachNvmeServerToClusterAction: AttachNvmeServerToClusterAction

  @Mutation(() => ActionResult)
  attachNvmeServerToClusters(
    @Args('input')
    input: AttachNvmeServerToClusterInput
  ) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'NvmeServer',
      async ({ uuid, ...rest }: AttachNvmeServerToClusterPayload, taskId: string) => {
        const result: AttachNvmeServerToClusterResult =
          await this.attachNvmeServerToClusterAction.call(
            {
              uuid,
              ...rest
            },
            { actionId, taskId }
          )

        return {
          id: result.inventory.uuid,
          fields: 'NvmeClusterRefs',
          inventory: result.inventory
        }
      }
    )

    return { actionId }
  }
}
