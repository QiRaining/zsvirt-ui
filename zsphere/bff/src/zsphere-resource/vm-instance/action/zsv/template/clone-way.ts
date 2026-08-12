import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { map as _map } from 'lodash'

import { AttachTagToResourcesAction } from '@/api/zstack/AttachTagToResourcesAction'
import {
  CreateTemplatedVmInstanceFromVmInstanceAction,
  CreateTemplatedVmInstanceFromVmInstanceResult
} from '@/api/zstack/CreateTemplatedVmInstanceFromVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CloneVmToTemplatePayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => [String], { nullable: true })
  tagUuids?: string[]

  @Field(() => [String], { defaultValue: [] })
  systemTags?: string[]
}

@InputType()
class CloneVmToTemplateInput {
  @Field(() => [CloneVmToTemplatePayload])
  payload: CloneVmToTemplatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CloneVmToTemplateService extends ActionService {
  @Inject()
  action: CreateTemplatedVmInstanceFromVmInstanceAction

  @Inject() attachTagToResourcesAction: AttachTagToResourcesAction

  @Mutation(() => ActionResult)
  async cloneVmToTemplate(@Args('input') input: CloneVmToTemplateInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: CloneVmToTemplatePayload, taskId: string) => {
        const { name, description, vmInstanceUuid, tagUuids, systemTags } = payload
        const result: CreateTemplatedVmInstanceFromVmInstanceResult = await this.action.call(
          { name, description, vmInstanceUuid, systemTags },
          { actionId, taskId }
        )

        if (result && result?.templatedVmInstanceInventory && tagUuids && tagUuids?.length > 0) {
          await Promise.all(
            _map(tagUuids, tagUuid =>
              this.attachTagToResourcesAction.call(
                {
                  tagUuid,
                  resourceUuids: [result?.templatedVmInstanceInventory?.uuid]
                },
                { actionId, taskId: actionId }
              )
            )
          )
        }

        return {
          id: payload.vmInstanceUuid,
          inventory: result.templatedVmInstanceInventory
        }
      }
    )
    return { actionId }
  }
}
