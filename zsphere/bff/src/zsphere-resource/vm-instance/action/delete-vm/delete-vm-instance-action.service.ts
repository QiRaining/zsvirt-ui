import { Inject, Injectable } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { Op, QueryParam } from '@/api/zstack/base/query-base'
import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { parallel, serial } from '@/common/flow/flow-instance/flow-instance-chain'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { genUuid } from '@/utils'
import { DeleteVmInstanceTaskService } from '@/zsphere-resource/vm-instance/action/delete-vm/delete-vm-task.service'
import { DeleteVolumeTaskService } from '@/zsphere-resource/vm-instance/action/delete-vm/delete-volume-task.service'

import { DeleteVmInstanceActionHandlerService } from './delete-vm-instance-action-handler-task.service'
import { DeleteVmInstanceTaskHandlerService } from './delete-vm-instance-task-handler-task.service'

@InputType()
class DeleteVmInstancePayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean)
  deleteVolume: boolean
}

@InputType()
class DeleteVmInstanceInput {
  @Field(() => [DeleteVmInstancePayload])
  payload: DeleteVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

@Injectable()
export class DeleteVmInstanceActionService extends ActionService {
  name = DeleteVmInstanceActionService.name

  @Inject() private queryVmInstanceAction: QueryVmInstanceAction
  @Inject() private deleteVmInstanceTaskService: DeleteVmInstanceTaskService
  @Inject() private deleteVolumeTaskService: DeleteVolumeTaskService
  @Inject()
  private deleteVmInstanceActionHandlerService: DeleteVmInstanceActionHandlerService
  @Inject()
  private deleteVmInstanceTaskHandlerService: DeleteVmInstanceTaskHandlerService

  @Mutation(() => ActionResult)
  async deleteVmInstance(
    @Args('input')
    input: DeleteVmInstanceInput
  ) {
    const actionId = input.action.actionId
    const uuids = input.payload.map(item => item.uuid)
    const deleteVolume = input.payload[0]?.deleteVolume
    const volumeMap = deleteVolume ? await this.getVmInstanceAttachedVolume(uuids) : {}

    this.recordActionService.recordActionStart(input.payload, actionId, input.action.name)
    const flow = parallel(
      uuids.map(uuid => {
        const taskId = genUuid()
        const info = {
          actionId: input.action.actionId,
          taskId,
          inventory: {
            actionType: 'delete',
            id: input.action.actionId
          }
        }
        this.recordActionService.recordTaskStart(taskId, actionId)
        return serial(
          [
            {
              service: DeleteVmInstanceTaskService.name,
              input: { param: { uuid }, info }
            },
            volumeMap[uuid]
              ? volumeMap[uuid].map(volumeUuid => ({
                  service: DeleteVolumeTaskService.name,
                  input: { param: { uuid: volumeUuid }, info }
                }))
              : []
          ],
          { info }
        )
      }),
      {
        onSubTaskFinished: DeleteVmInstanceTaskHandlerService.name,
        onAllFinished: DeleteVmInstanceActionHandlerService.name
      }
    )

    this.flowManagerService.initServices({
      [DeleteVolumeTaskService.name]: this.deleteVolumeTaskService,
      [DeleteVmInstanceTaskService.name]: this.deleteVmInstanceTaskService,
      [DeleteVmInstanceActionHandlerService.name]: this.deleteVmInstanceActionHandlerService,
      [DeleteVmInstanceTaskHandlerService.name]: this.deleteVmInstanceTaskHandlerService
    })

    await this.flowManagerService.run(flow, actionId, { allowAbort: true }).catch(error => {
      this.recordActionService.recordActionFailed(actionId)
      console.log(error)
    })
    return { actionId }
  }

  async getVmInstanceAttachedVolume(uuids: string[]) {
    const params: QueryParam = {
      conditions: [{ key: 'uuid', op: Op.in, values: uuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.queryVmInstanceAction.call(params)
    const map = {}
    resp.inventories.forEach(item => {
      map[item.uuid] = item.allVolumes
        .filter(volume => volume.type === 'Data')
        .map(volume => volume.uuid)
    })
    return map
  }
}

export interface AttachTagToVolumeParam {
  tagUuid: string
}
