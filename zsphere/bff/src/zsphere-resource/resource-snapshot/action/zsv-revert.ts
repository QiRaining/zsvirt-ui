import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { RevertVolumeFromSnapshotAction } from '@/api/zstack/RevertVolumeFromSnapshotAction'
import { StartVmInstanceAction } from '@/api/zstack/StartVmInstanceAction'
import { StopVmInstanceAction } from '@/api/zstack/StopVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { SnapshotType } from '../resource-snapshot.model'

@InputType()
class ZSVRevertVolumeFromSnapshotPayload {
  @Field(() => [String])
  uuids: string[]

  @Field(() => String, { nullable: true })
  vmUuid?: string

  @Field(() => SnapshotType)
  type: SnapshotType

  @Field(() => Boolean, { nullable: true })
  isStartVm?: boolean

  @Field(() => Boolean, { nullable: true })
  isStopVm?: boolean

  @Field(() => Boolean, { nullable: true })
  withMemory?: boolean
}

@InputType()
class ZSVRevertVolumeFromSnapshotInput {
  @Field(() => [ZSVRevertVolumeFromSnapshotPayload])
  payload: ZSVRevertVolumeFromSnapshotPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ZSVRevertVolumeFromSnapshotService extends ActionService {
  @Inject()
  singleAction: RevertVolumeFromSnapshotAction

  @Inject() startVmInstanceAction: StartVmInstanceAction

  @Inject() stopVmInstanceAction: StopVmInstanceAction

  @Mutation(() => ActionResult)
  zsvRevertVolumeFromSnapshot(@Args('input') input: ZSVRevertVolumeFromSnapshotInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: ZSVRevertVolumeFromSnapshotPayload, taskId: string) => {
      const { type, uuids, vmUuid, isStartVm, isStopVm } = payload

      if (isStopVm) {
        await this.stopVmInstanceAction.call({ uuid: vmUuid }, { actionId, taskId })
      }

      const task = []
      if (type === SnapshotType.Single) {
        uuids.forEach(uuid => {
          task.push(
            this.singleAction.call(
              {
                uuid
              },
              {
                actionId,
                taskId
              }
            )
          )
        })
        if (task?.length) {
          await Promise.all(task)
        }
      }

      if (isStartVm) {
        const result = await this.startVmInstanceAction.call({ uuid: vmUuid }, { actionId, taskId })
        return {
          id: actionId,
          fields:
            'state, vmNics { uuid, ip, type, mac, usedIps { uuid, ip, l3NetworkUuid }, l3NetworkUuid }',
          inventory: result.inventory
        }
      }

      return {
        id: actionId
      }
    }

    this.actionHelper(
      input,
      input.payload.type === SnapshotType.Single ? 'VolumeSnapshot' : 'VolumeSnapshotGroup',
      actionFn
    )
    return { actionId }
  }
}
