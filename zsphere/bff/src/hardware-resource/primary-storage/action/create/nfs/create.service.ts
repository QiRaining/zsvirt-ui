import { Inject } from '@nestjs/common'
import { Args, Mutation, Field, InputType } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { serial } from '@/common/flow/flow-instance/flow-instance-chain'
import { ActionResult, ActionInput } from '@/common/model/action.model'
import { genUuid } from '@/utils'

import { CreateActionHandlerService } from '../action-handler.service'
import { AttachPrimaryStorageToClusterTaskService } from '../attach-primary-storage-to-cluster-task'
import { CreateNFSPrimaryStorageTaskService } from './create-nfs-task.service'
import { CreateNFSTaskHandlerService } from './task-handle.service'

@InputType()
export class CreateNFSPrimaryStorageInputParam {
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
export class CreateNFSPrimaryStorageInput {
  @Field(() => CreateNFSPrimaryStorageInputParam)
  payload: CreateNFSPrimaryStorageInputParam

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateNFSPrimaryStorageService extends ActionService {
  @Inject()
  private createActionHandlerService: CreateActionHandlerService
  @Inject()
  private createNFSTaskHandlerService: CreateNFSTaskHandlerService
  @Inject()
  private createNFSPrimaryStorageTaskService: CreateNFSPrimaryStorageTaskService
  @Inject()
  private attachPrimaryStorageToClusterTaskService: AttachPrimaryStorageToClusterTaskService

  @Mutation(() => ActionResult)
  async createNfsPrimaryStorage(
    @Args('input')
    input: CreateNFSPrimaryStorageInput
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
        service: CreateNFSPrimaryStorageTaskService.name,
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
      onSubTaskFinished: CreateNFSTaskHandlerService.name,
      onAllFinished: CreateActionHandlerService.name
    })

    this.flowManagerService.initServices({
      [CreateNFSPrimaryStorageTaskService.name]: this.createNFSPrimaryStorageTaskService,
      [AttachPrimaryStorageToClusterTaskService.name]:
        this.attachPrimaryStorageToClusterTaskService,
      [CreateNFSTaskHandlerService.name]: this.createNFSTaskHandlerService,
      [CreateActionHandlerService.name]: this.createActionHandlerService
    })

    await this.flowManagerService.run(flow, actionId, { allowAbort: true }).catch(error => {
      this.recordActionService.recordActionFailed(actionId)
      console.log(error)
    })

    return { actionId }
  }
}
