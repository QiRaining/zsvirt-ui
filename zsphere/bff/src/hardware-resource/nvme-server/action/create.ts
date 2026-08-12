import { Inject, Injectable } from '@nestjs/common'
import { Args, Field, Float, InputType, Mutation } from '@nestjs/graphql'

import { AddNvmeServerAction } from '@/api/zstack/AddNvmeServerAction'
import { AttachNvmeServerToClusterAction } from '@/api/zstack/AttachNvmeServerToClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { TransportType } from '../nvme-server.model'

@InputType()
class AddNvmeServerPayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  ip: string

  @Field(() => Float)
  port: number

  @Field(() => TransportType)
  transport: TransportType

  @Field(() => String, { nullable: true })
  clusterUuid?: string
}

@InputType()
class AddNvmeServerInput {
  @Field(() => AddNvmeServerPayload)
  payload: AddNvmeServerPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@Injectable()
export class AddNvmeServerService extends ActionService {
  @Inject() private addNvmeServerAction: AddNvmeServerAction
  @Inject()
  private attachNvmeServerToClusterAction: AttachNvmeServerToClusterAction

  @Mutation(() => ActionResult)
  addNvmeServer(@Args('input') input: AddNvmeServerInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'NvmeServer',
      async ({ clusterUuid, transport, ...payload }: AddNvmeServerPayload, taskId: string) => {
        const result = await this.addNvmeServerAction.call(
          {
            ...payload,
            transport: transport.toLocaleLowerCase()
          },
          { actionId, taskId }
        )

        if (clusterUuid) {
          await this.attachNvmeServerToClusterAction.call(
            {
              uuid: result?.inventory?.uuid,
              clusterUuid
            },
            { actionId, taskId }
          )
        }

        return {
          id: result?.inventory?.uuid
        }
      }
    )

    return { actionId }
  }
}
