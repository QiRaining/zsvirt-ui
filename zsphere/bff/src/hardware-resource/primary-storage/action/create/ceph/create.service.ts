import { Inject } from '@nestjs/common'
import { Args, Mutation, Field, InputType } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { serial } from '@/common/flow/flow-instance/flow-instance-chain'
import { ActionResult, ActionInput } from '@/common/model/action.model'
import { genUuid } from '@/utils'

import { CreateActionHandlerService } from '../action-handler.service'
import { AttachPrimaryStorageToClusterTaskService } from '../attach-primary-storage-to-cluster-task'
import { CreateCephPrimaryStorageTaskService } from './create-ceph-task.service'
import { CreateCephTaskHandlerService } from './task-handle.service'

@InputType()
export class CreateCephPrimaryStorageInputParam {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => [String])
  monUrls: string[]

  @Field(() => String, { nullable: true })
  rootVolumePoolName: string

  @Field(() => String, { nullable: true })
  dataVolumePoolName: string

  @Field(() => String, { nullable: true })
  imageCachePoolName: string

  @Field(() => [String], {
    nullable: true,
    description: '存储网络 | 关闭 Cephx'
  })
  systemTags: [string]
}

@InputType()
export class CreateCephPrimaryStorageInput {
  @Field(() => CreateCephPrimaryStorageInputParam)
  payload: CreateCephPrimaryStorageInputParam

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateCephPrimaryStorageService extends ActionService {
  @Inject()
  private createActionHandlerService: CreateActionHandlerService
  @Inject()
  private createCephTaskHandlerService: CreateCephTaskHandlerService
  @Inject()
  private createCephPrimaryStorageTaskService: CreateCephPrimaryStorageTaskService
  @Inject()
  private attachPrimaryStorageToClusterTaskService: AttachPrimaryStorageToClusterTaskService

  @Mutation(() => ActionResult)
  async createCephPrimaryStorage(
    @Args('input')
    input: CreateCephPrimaryStorageInput
  ) {
    const actionId = input.action.actionId
    const taskId = genUuid()
    const info = {
      actionId: input.action.actionId,
      taskId
    }

    const genInput = param => {
      return {
        param,
        info
      }
    }
    const taskList = [
      {
        service: CreateCephPrimaryStorageTaskService.name,
        input: genInput(input.payload)
      }
    ]

    this.recordActionService.recordActionStart(input.payload, actionId, input.action.name)
    this.recordActionService.recordTaskStart(taskId, actionId)

    input.payload?.clusterUuid &&
      taskList.push({
        service: AttachPrimaryStorageToClusterTaskService.name,
        input: genInput(input.payload)
      })

    const flow = serial(taskList, {
      info,
      onSubTaskFinished: CreateCephTaskHandlerService.name,
      onAllFinished: CreateActionHandlerService.name
    })

    this.flowManagerService.initServices({
      [CreateCephPrimaryStorageTaskService.name]: this.createCephPrimaryStorageTaskService,
      [AttachPrimaryStorageToClusterTaskService.name]:
        this.attachPrimaryStorageToClusterTaskService,
      [CreateCephTaskHandlerService.name]: this.createCephTaskHandlerService,
      [CreateActionHandlerService.name]: this.createActionHandlerService
    })

    await this.flowManagerService.run(flow, actionId, { allowAbort: true }).catch(error => {
      this.recordActionService.recordActionFailed(actionId)
      console.log(error)
    })

    return { actionId }
  }
}
