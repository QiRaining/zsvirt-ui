import { Inject } from '@nestjs/common'
import { Args, Mutation, Field, InputType } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { serial } from '@/common/flow/flow-instance/flow-instance-chain'
import { ActionResult, ActionInput } from '@/common/model/action.model'
import { genUuid } from '@/utils'

import { CreateActionHandlerService } from '../action-handler.service'
import { AttachPrimaryStorageToClusterTaskService } from '../attach-primary-storage-to-cluster-task'
import { CreateSharedBlockGroupPrimaryStorageTaskService } from './create-shared-block-group-task.service'
import { CreateSharedBlockGroupTaskHandlerService } from './task-handle.service'

@InputType()
export class CreateSharedBlockGroupPrimaryStorageInputParam {
  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => [String])
  diskUuids: string[]

  @Field(() => [String], {
    nullable: true,
    description: '存储网络 | 厚置备 | 清理块设备'
  })
  systemTags: [string]

  @Field(() => String, {
    nullable: true,
    description: '资源UUID（保留UUID模式时传入vg name，重置UUID模式时不传）'
  })
  resourceUuid?: string
}

@InputType()
export class CreateSharedBlockGroupPrimaryStorageInput {
  @Field(() => CreateSharedBlockGroupPrimaryStorageInputParam)
  payload: CreateSharedBlockGroupPrimaryStorageInputParam

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateSharedBlockGroupPrimaryStorageService extends ActionService {
  @Inject()
  private createActionHandlerService: CreateActionHandlerService
  @Inject()
  private createSharedBlockGroupTaskHandlerService: CreateSharedBlockGroupTaskHandlerService
  @Inject()
  private createSharedBlockGroupPrimaryStorageTaskService: CreateSharedBlockGroupPrimaryStorageTaskService
  @Inject()
  private attachPrimaryStorageToClusterTaskService: AttachPrimaryStorageToClusterTaskService

  @Mutation(() => ActionResult)
  async createSharedBlockGroupPrimaryStorage(
    @Args('input')
    input: CreateSharedBlockGroupPrimaryStorageInput
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
        service: CreateSharedBlockGroupPrimaryStorageTaskService.name,
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
      onSubTaskFinished: CreateSharedBlockGroupTaskHandlerService.name,
      onAllFinished: CreateActionHandlerService.name
    })

    this.flowManagerService.initServices({
      [CreateSharedBlockGroupPrimaryStorageTaskService.name]:
        this.createSharedBlockGroupPrimaryStorageTaskService,
      [AttachPrimaryStorageToClusterTaskService.name]:
        this.attachPrimaryStorageToClusterTaskService,
      [CreateSharedBlockGroupTaskHandlerService.name]:
        this.createSharedBlockGroupTaskHandlerService,
      [CreateActionHandlerService.name]: this.createActionHandlerService
    })

    await this.flowManagerService.run(flow, actionId, { allowAbort: true }).catch(error => {
      this.recordActionService.recordActionFailed(actionId)
      console.log(error)
    })

    return { actionId }
  }
}
