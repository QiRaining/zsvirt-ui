import { Inject } from '@nestjs/common'
import { InputType, Field, Mutation, Args } from '@nestjs/graphql'
import { reduce as _reduce } from 'lodash'

import { AttachDataVolumeToVmAction } from '@/api/zstack/AttachDataVolumeToVmAction'
import { AttachTagToResourcesAction } from '@/api/zstack/AttachTagToResourcesAction'
import { CreateDataVolumeFromVolumeTemplateAction } from '@/api/zstack/CreateDataVolumeFromVolumeTemplateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CreateDataVolumeFromVolumeTemplatePayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  imageUuid: string

  @Field(() => [String], { nullable: true })
  vmInstanceUuids?: string[]

  @Field(() => [String], { nullable: true })
  tagUuids?: string[]

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  primaryStorageUuid: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@InputType()
export class CreateDataVolumeFromVolumeTemplateInput {
  @Field(() => CreateDataVolumeFromVolumeTemplatePayload)
  payload: CreateDataVolumeFromVolumeTemplatePayload

  @Field(() => ActionInput)
  action: ActionInput
}

interface CreateDataVolumeFromVolumeTemplateTaskParam {
  name: string
  imageUuid: string
  description?: string
  primaryStorageUuid: string
  vmInstanceUuid?: string
  tagUuids?: string[]
  hostUuid?: string
  systemTags?: string[]
}

export class CreateDataVolumeFromVolumeTempalteService extends ActionService {
  @Inject()
  createDataVolumeFromVolumeTemplateAction: CreateDataVolumeFromVolumeTemplateAction
  @Inject() attachDataVolumeToVmAction: AttachDataVolumeToVmAction
  @Inject() attachTagToResourcesAction: AttachTagToResourcesAction

  @Mutation(() => ActionResult)
  createDataVolumeFromVolumeTemplate(
    @Args('input') input: CreateDataVolumeFromVolumeTemplateInput
  ) {
    const actionId = input.action.actionId

    const { volumeParams, attachDataVolumeToVmParam, tagParamList } = this.buildVolumeParams(
      input.payload
    )

    this.actionHelper(
      {
        ...input,
        payload: volumeParams
      },
      'Volume',
      async (payload: CreateDataVolumeFromVolumeTemplateTaskParam, taskId: string) => {
        const { inventory: volumeResp } = await this.createDataVolumeFromVolumeTemplateAction.call(
          payload,
          {
            actionId,
            taskId
          }
        )
        await Promise.all(
          attachDataVolumeToVmParam.map(async (param: AttachVolumeToVmTaskParam) => {
            await this.attachDataVolumeToVmAction.call(
              {
                vmInstanceUuid: param.vmInstanceUuid,
                volumeUuid: volumeResp.uuid
              },
              {
                actionId,
                taskId
              }
            )
          })
        )
        await Promise.all(
          tagParamList.map(async (param: AttachTagToVolumeParam) => {
            await this.attachTagToResourcesAction.call(
              {
                resourceUuids: [volumeResp.uuid],
                tagUuid: param.tagUuid
              },
              {
                actionId,
                taskId
              }
            )
          })
        )
        return {
          id: volumeResp.uuid
        }
      }
    )

    return { actionId }
  }

  buildVolumeParams(actionParam: CreateDataVolumeFromVolumeTemplatePayload): {
    volumeParams: CreateDataVolumeFromVolumeTemplateTaskParam[]
    attachDataVolumeToVmParam: AttachVolumeToVmTaskParam[]
    tagParamList: AttachTagToVolumeParam[]
  } {
    const volumeParams: CreateDataVolumeFromVolumeTemplateTaskParam[] = [
      {
        name: actionParam.name,
        description: actionParam.description,
        imageUuid: actionParam.imageUuid,
        hostUuid: actionParam.hostUuid,
        primaryStorageUuid: actionParam.primaryStorageUuid,
        systemTags: actionParam.systemTags
      }
    ]

    const attachDataVolumeToVmParam: AttachVolumeToVmTaskParam[] = []
    if (actionParam?.vmInstanceUuids && actionParam?.vmInstanceUuids?.length > 0) {
      actionParam?.vmInstanceUuids?.forEach(vmInstanceUuid => {
        attachDataVolumeToVmParam.push({
          vmInstanceUuid: vmInstanceUuid
        })
      })
    }

    const tagParamList: AttachTagToVolumeParam[] =
      actionParam?.tagUuids?.map(tagUuid => {
        return { tagUuid }
      }) ?? []

    return {
      volumeParams,
      attachDataVolumeToVmParam,
      tagParamList
    }
  }
}

export interface AttachVolumeToVmTaskParam {
  vmInstanceUuid: string
}

export interface AttachTagToVolumeParam {
  tagUuid: string
}
