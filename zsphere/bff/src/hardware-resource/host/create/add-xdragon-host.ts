import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int, Float } from '@nestjs/graphql'

import { AddXDragonHostAction } from '@/api/zstack/AddXDragonHostAction'
import { AttachTagToResourcesAction } from '@/api/zstack/AttachTagToResourcesAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddXDragonHostPayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  username: string

  @Field(() => String)
  password: string

  @Field(() => String, { nullable: true })
  managementIp: string

  @Field(() => Int, { nullable: true })
  sshPort: number

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => Float, { nullable: true })
  cpuNum: number

  @Field(() => Float, { nullable: true })
  cpuSockets: number

  @Field(() => Float, { nullable: true })
  totalPhysicalMemory: number

  @Field(() => [String], { nullable: true })
  tagUuids: string[]

  @Field(() => [String], { nullable: true })
  systemTags: string[]
}

@InputType()
class AddXDragonHostInput {
  @Field(() => [AddXDragonHostPayload])
  payload: AddXDragonHostPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddXDragonHostService extends ActionService {
  @Inject() addXDragonHostAction: AddXDragonHostAction
  @Inject() attachTagToResourcesAction: AttachTagToResourcesAction

  @Mutation(() => ActionResult)
  addXDragonHost(@Args('input') input: AddXDragonHostInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'HostVO', async (payload: AddXDragonHostPayload, taskId: string) => {
      const { tagUuids = [], ...hostParams } = payload
      const { inventory } = await this.addXDragonHostAction.call(
        {
          ...hostParams
        },
        { actionId, taskId }
      )
      const hostUuid = inventory?.uuid
      if (hostUuid) {
        const task = tagUuids.map(tagUuid =>
          this.attachTagToResourcesAction.call({
            tagUuid,
            resourceUuids: [hostUuid]
          })
        )
        await Promise.all(task)
      }
      return {
        id: hostUuid,
        inventory
      }
    })
    return { actionId }
  }
}
