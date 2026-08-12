import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  DetachNvmeServerFromClusterAction,
  DetachNvmeServerFromClusterResult
} from '@/api/zstack/DetachNvmeServerFromClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DetachNvmeServerFromClusterPayload {
  @Field(() => String, { description: 'Nvme服务器的的UUID' })
  uuid: string

  @Field(() => String, { description: '	集群UUID' })
  clusterUuid: string
}

@InputType()
class DetachNvmeServerFromClusterInput {
  @Field(() => [DetachNvmeServerFromClusterPayload])
  payload: DetachNvmeServerFromClusterPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachNvmeServerFromClusterService extends ActionService {
  @Inject()
  detachNvmeServerFromClusterAction: DetachNvmeServerFromClusterAction

  @Mutation(() => ActionResult)
  detachNvmeServerFromClusters(
    @Args('input')
    input: DetachNvmeServerFromClusterInput
  ) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'NvmeServer',
      async ({ uuid, ...rest }: DetachNvmeServerFromClusterPayload, taskId: string) => {
        const result: DetachNvmeServerFromClusterResult =
          await this.detachNvmeServerFromClusterAction.call(
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
