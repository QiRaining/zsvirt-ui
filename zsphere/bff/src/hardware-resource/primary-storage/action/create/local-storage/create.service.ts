import { Inject } from '@nestjs/common'
import { Args, Mutation, Field, InputType } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { serial } from '@/common/flow/flow-instance/flow-instance-chain'
import { ActionResult, ActionInput } from '@/common/model/action.model'
import { genUuid } from '@/utils'

import { CreateActionHandlerService } from '../action-handler.service'
import { AttachPrimaryStorageToClusterTaskService } from '../attach-primary-storage-to-cluster-task'
import { CreateLocalStoragePrimaryStorageTaskService } from './create-local-storage-task.service'
import { CreateLocalTaskHandlerService } from './task-handle.service'

@InputType()
export class CreateLocalPrimaryStorageInputParam {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  url: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => [String], { nullable: true })
  systemTags: [string]
}

@InputType()
export class CreateLocalPrimaryStorageInput {
  @Field(() => CreateLocalPrimaryStorageInputParam)
  payload: CreateLocalPrimaryStorageInputParam

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateLocalStoragePrimaryStorageService extends ActionService {
  @Inject()
  private createActionHandlerService: CreateActionHandlerService
  @Inject()
  private createLocalTaskHandlerService: CreateLocalTaskHandlerService
  @Inject()
  private createLocalStoragePrimaryStorageTaskService: CreateLocalStoragePrimaryStorageTaskService
  @Inject()
  private attachPrimaryStorageToClusterTaskService: AttachPrimaryStorageToClusterTaskService

  @Mutation(() => ActionResult)
  async createLocalStoragePrimaryStorage(
    @Args('input')
    input: CreateLocalPrimaryStorageInput
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
        service: CreateLocalStoragePrimaryStorageTaskService.name,
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
      onSubTaskFinished: CreateLocalTaskHandlerService.name,
      onAllFinished: CreateActionHandlerService.name
    })

    this.flowManagerService.initServices({
      [CreateLocalStoragePrimaryStorageTaskService.name]:
        this.createLocalStoragePrimaryStorageTaskService,
      [AttachPrimaryStorageToClusterTaskService.name]:
        this.attachPrimaryStorageToClusterTaskService,
      [CreateLocalTaskHandlerService.name]: this.createLocalTaskHandlerService,
      [CreateActionHandlerService.name]: this.createActionHandlerService
    })

    await this.flowManagerService.run(flow, actionId, { allowAbort: true }).catch(error => {
      this.recordActionService.recordActionFailed(actionId)
      console.log(error)
    })

    return { actionId }
  }
}
