import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  AttachIscsiServerToClusterAction,
  AttachIscsiServerToClusterResult
} from '@/api/zstack/AttachIscsiServerToClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AttachIscsiServerToClusterPayload {
  @Field(() => String, { description: 'iSCSI服务器的的UUID' })
  uuid: string

  @Field(() => String, { description: '	集群UUID' })
  clusterUuid: string
}

@InputType()
class AttachIscsiServerToClusterInput {
  @Field(() => [AttachIscsiServerToClusterPayload])
  payload: AttachIscsiServerToClusterPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachIscsiServerToClusterService extends ActionService {
  @Inject() attachIscsiServerToClusterAction: AttachIscsiServerToClusterAction

  @Mutation(() => ActionResult)
  attachIscsiServerToClusters(
    @Args('input')
    input: AttachIscsiServerToClusterInput
  ) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'IscsiServer',
      async ({ uuid, ...rest }: AttachIscsiServerToClusterPayload, taskId: string) => {
        const result: AttachIscsiServerToClusterResult =
          await this.attachIscsiServerToClusterAction.call(
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
