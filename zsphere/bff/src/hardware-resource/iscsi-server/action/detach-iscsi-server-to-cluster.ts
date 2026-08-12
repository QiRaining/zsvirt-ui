import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  DetachIscsiServerFromClusterAction,
  DetachIscsiServerFromClusterResult
} from '@/api/zstack/DetachIscsiServerFromClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DetachIscsiServerFromClusterPayload {
  @Field(() => String, { description: 'iSCSI服务器的的UUID' })
  uuid: string

  @Field(() => String, { description: '	集群UUID' })
  clusterUuid: string
}

@InputType()
class DetachIscsiServerFromClusterInput {
  @Field(() => [DetachIscsiServerFromClusterPayload])
  payload: DetachIscsiServerFromClusterPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachIscsiServerFromClusterService extends ActionService {
  @Inject()
  detachIscsiServerFromClusterAction: DetachIscsiServerFromClusterAction

  @Mutation(() => ActionResult)
  detachIscsiServerFromClusters(
    @Args('input')
    input: DetachIscsiServerFromClusterInput
  ) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'IscsiServer',
      async ({ uuid, ...rest }: DetachIscsiServerFromClusterPayload, taskId: string) => {
        const result: DetachIscsiServerFromClusterResult =
          await this.detachIscsiServerFromClusterAction.call(
            {
              uuid,
              ...rest
            },
            { actionId, taskId }
          )
        return {
          id: result.inventory.uuid,
          fields: 'iscsiClusterRefs',
          inventory: result.inventory
        }
      }
    )

    return { actionId }
  }
}
