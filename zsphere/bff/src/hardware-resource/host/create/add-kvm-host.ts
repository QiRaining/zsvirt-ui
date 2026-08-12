import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { AddKVMHostAction } from '@/api/zstack/AddKVMHostAction'
import { AttachTagToResourcesAction } from '@/api/zstack/AttachTagToResourcesAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddKVMHostPayload {
  @Field(() => String)
  username: string

  @Field(() => String)
  password: string

  @Field(() => Int, { nullable: true })
  sshPort: number

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  managementIp: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => [String], { nullable: true })
  tagUuids: string[]

  @Field(() => [String], { nullable: true })
  systemTags: string[]
}

@InputType()
class AddKVMHostInput {
  @Field(() => [AddKVMHostPayload])
  payload: AddKVMHostPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddKVMHostService extends ActionService {
  @Inject() addKVMHostAction: AddKVMHostAction
  @Inject() attachTagToResourcesAction: AttachTagToResourcesAction

  @Mutation(() => ActionResult)
  addKvmHost(@Args('input') input: AddKVMHostInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'HostVO', async (payload: AddKVMHostPayload, taskId: string) => {
      const { tagUuids = [], ...hostParams } = payload
      const { inventory } = await this.addKVMHostAction.call(
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
