import { Inject } from '@nestjs/common'
import { Args, Mutation, Field, InputType } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { serial } from '@/common/flow/flow-instance/flow-instance-chain'
import { ActionResult, ActionInput } from '@/common/model/action.model'
import { genUuid } from '@/utils'

import { CreateActionHandlerService } from '../action-handler.service'
import { AttachPrimaryStorageToClusterTaskService } from '../attach-primary-storage-to-cluster-task'
import { CreateSharedMountPointPrimaryStorageTaskService } from './create-shared-mount-point-task.service'
import { CreateSharedMountPointTaskHandlerService } from './task-handle.service'

@InputType()
export class CreateSharedMountPointPrimaryStorageInputParam {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String)
  url: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => [String], { nullable: true, description: '存储网络 | 挂载参数' })
  systemTags: [string]
}

@InputType()
export class CreateSharedMountPointPrimaryStorageInput {
  @Field(() => CreateSharedMountPointPrimaryStorageInputParam)
  payload: CreateSharedMountPointPrimaryStorageInputParam

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateSharedMountPointPrimaryStorageService extends ActionService {
  @Inject()
  private createActionHandlerService: CreateActionHandlerService
  @Inject()
  private createSharedMountPointTaskHandlerService: CreateSharedMountPointTaskHandlerService
  @Inject()
  private createSharedMountPointPrimaryStorageTaskService: CreateSharedMountPointPrimaryStorageTaskService
  @Inject()
  private attachPrimaryStorageToClusterTaskService: AttachPrimaryStorageToClusterTaskService

  @Mutation(() => ActionResult)
  async createSharedMountPointPrimaryStorage(
    @Args('input')
    input: CreateSharedMountPointPrimaryStorageInput
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
        service: CreateSharedMountPointPrimaryStorageTaskService.name,
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
      onSubTaskFinished: CreateSharedMountPointTaskHandlerService.name,
      onAllFinished: CreateActionHandlerService.name
    })

    this.flowManagerService.initServices({
      [CreateSharedMountPointPrimaryStorageTaskService.name]:
        this.createSharedMountPointPrimaryStorageTaskService,
      [AttachPrimaryStorageToClusterTaskService.name]:
        this.attachPrimaryStorageToClusterTaskService,
      [CreateSharedMountPointTaskHandlerService.name]:
        this.createSharedMountPointTaskHandlerService,
      [CreateActionHandlerService.name]: this.createActionHandlerService
    })

    await this.flowManagerService.run(flow, actionId, { allowAbort: true }).catch(error => {
      this.recordActionService.recordActionFailed(actionId)
      console.log(error)
    })

    return { actionId }
  }
}
