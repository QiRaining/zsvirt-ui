import { Inject } from '@nestjs/common'
import { InputType, Field, Mutation, Args, Float, Int } from '@nestjs/graphql'
import * as _ from 'lodash'

import { AttachDataVolumeToVmAction } from '@/api/zstack/AttachDataVolumeToVmAction'
import { AttachTagToResourcesAction } from '@/api/zstack/AttachTagToResourcesAction'
import { Op } from '@/api/zstack/base/query-base'
import { CreateDataVolumeAction } from '@/api/zstack/CreateDataVolumeAction'
import { DeleteDataVolumeAction } from '@/api/zstack/DeleteDataVolumeAction'
import { ExpungeDataVolumeAction } from '@/api/zstack/ExpungeDataVolumeAction'
import { QueryVolumeAction } from '@/api/zstack/QueryVolumeAction'
import { ActionService } from '@/base/action-service'
import { VolumeStatus } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'
@InputType()
export class CreateDataVolumePayload {
  @Field(() => String)
  name: string

  @Field(() => [String], { nullable: true })
  diskOfferingUuids?: string

  @Field(() => Float, { nullable: true })
  diskSize?: number

  @Field(() => Int, { nullable: true })
  total?: number

  @Field(() => [String], { nullable: true })
  vmInstanceUuids?: string[]

  @Field(() => [String], { nullable: true })
  tagUuids?: string[]

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  primaryStorageUuid?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@InputType()
export class CreateDataVolumeInput {
  @Field(() => CreateDataVolumePayload)
  payload: CreateDataVolumePayload

  @Field(() => ActionInput)
  action: ActionInput
}

interface CreateDataVolumeTaskParam {
  name: string
  diskSize?: number
  diskOfferingUuid?: string
  description?: string
  primaryStorageUuid?: string
  systemTags?: string[]
}

export class CreateDataVolumeService extends ActionService {
  @Inject() createDataVolumeAction: CreateDataVolumeAction
  @Inject() attachDataVolumeToVmAction: AttachDataVolumeToVmAction
  @Inject() attachTagToResourcesAction: AttachTagToResourcesAction
  @Inject() queryVolumeAction: QueryVolumeAction
  @Inject() deleteDataVolumeAction: DeleteDataVolumeAction
  @Inject() expungeDataVolumeAction: ExpungeDataVolumeAction
  @Mutation(() => ActionResult)
  createDataVolume(@Args('input') input: CreateDataVolumeInput) {
    const actionId = input.action.actionId

    const { volumeParams, attachDataVolumeToVmParam, tagParamList } = this.buildVolumeParams(
      input.payload
    )

    this.actionHelper(
      {
        ...input,
        payload: volumeParams
      },
      'CreateVolume', // UI端会监听该ID
      async (payload: CreateDataVolumeTaskParam, taskId: string) => {
        const { inventory: volumeResp } = await this.createDataVolumeAction.call(payload, {
          actionId,
          taskId
        })

        const attachDataVolumeToVm = attachDataVolumeToVmParam.map(
          async (param: AttachVolumeToVmTaskParam) => {
            return this.attachDataVolumeToVmAction
              .call(
                {
                  vmInstanceUuid: param.vmInstanceUuid,
                  volumeUuid: volumeResp.uuid
                },
                {
                  actionId,
                  taskId
                }
              )
              .catch(async error => {
                //根据创建的云盘status状态，判断是否调用expungeDataVolumeAction接口。
                if (volumeResp?.status === VolumeStatus.NotInstantiated) {
                  await this.deleteDataVolumeAction.call(
                    { uuid: volumeResp.uuid },
                    { actionId, taskId }
                  )
                  await this.expungeDataVolumeAction.call(
                    { uuid: volumeResp.uuid },
                    { actionId, taskId }
                  )
                }

                return Promise.reject(error)
              })
          }
        )
        await Promise.all(attachDataVolumeToVm)

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

        let volumeResult = {
          uuid: volumeResp?.uuid
        }

        try {
          const result = await this.queryVolumeAction.call(
            {
              conditions: [
                {
                  key: 'uuid',
                  op: Op.eq,
                  value: volumeResp?.uuid
                }
              ]
            },
            {
              actionId,
              taskId
            }
          )

          volumeResult = _.assign(volumeResult, result?.inventories?.[0])
        } catch (error) {
          console.log(error)
        }

        return {
          id: volumeResp.uuid,
          inventory: volumeResult
        }
      }
    )

    return { actionId }
  }

  buildVolumeParams(actionParam: CreateDataVolumePayload): {
    volumeParams: CreateDataVolumeTaskParam[]
    attachDataVolumeToVmParam: AttachVolumeToVmTaskParam[]
    tagParamList: AttachTagToVolumeParam[]
  } {
    let volumeParams: CreateDataVolumeTaskParam[] = []
    if (actionParam?.diskOfferingUuids) {
      //选中已有的云盘规格
      volumeParams = _.reduce(
        actionParam.diskOfferingUuids,
        (arr, diskOfferingUuid, index) => {
          const param: CreateDataVolumeTaskParam = {
            name:
              actionParam.diskOfferingUuids.length === 1
                ? actionParam.name
                : `${actionParam.name}-${index + 1}`,
            diskOfferingUuid,
            description: actionParam.description,
            primaryStorageUuid: actionParam.primaryStorageUuid,
            systemTags: actionParam.systemTags
          }
          arr.push(param)
          return arr
        },
        []
      )
    } else {
      //自定义云盘规格
      _.forEach(Array(actionParam.total), (item, index) => {
        volumeParams.push({
          name: actionParam.total === 1 ? actionParam.name : `${actionParam.name}-${index + 1}`,
          diskSize: actionParam.diskSize,
          description: actionParam.description,
          primaryStorageUuid: actionParam.primaryStorageUuid,
          systemTags: actionParam.systemTags
        })
      })
    }

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
