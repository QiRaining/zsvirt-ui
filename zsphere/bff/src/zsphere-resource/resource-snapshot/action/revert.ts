import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { RevertVmFromSnapshotGroupAction } from '@/api/zstack/RevertVmFromSnapshotGroupAction'
import { RevertVolumeFromSnapshotAction } from '@/api/zstack/RevertVolumeFromSnapshotAction'
import { StartVmInstanceAction } from '@/api/zstack/StartVmInstanceAction'
import { StopVmInstanceAction } from '@/api/zstack/StopVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult, ActionTaskState } from '@/common/model/action.model'

import { SnapshotType } from '../resource-snapshot.model'

@InputType()
class RevertVolumeFromSnapshotPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  vmUuid?: string

  @Field(() => SnapshotType)
  type: SnapshotType

  @Field(() => Boolean, { nullable: true })
  isStartVm?: boolean

  @Field(() => Boolean, { nullable: true })
  withMemory?: boolean
}

@InputType()
class RevertVolumeFromSnapshotInput {
  @Field(() => RevertVolumeFromSnapshotPayload)
  payload: RevertVolumeFromSnapshotPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class RevertVolumeFromSnapshotService extends ActionService {
  @Inject()
  singleAction: RevertVolumeFromSnapshotAction

  @Inject() startVmInstanceAction: StartVmInstanceAction

  @Inject() stopVmInstanceAction: StopVmInstanceAction

  @Inject()
  groupAction: RevertVmFromSnapshotGroupAction

  @Mutation(() => ActionResult)
  revertVolumeFromSnapshot(@Args('input') input: RevertVolumeFromSnapshotInput) {
    const actionId = input.action.actionId

    const resourceType =
      input.payload.type === SnapshotType.Single ? 'VolumeSnapshot' : 'VolumeSnapshotGroup'

    if (input.payload.withMemory) {
      this.pubSubService.response({
        sessionId: this.getSessionId(),
        actionId,
        state: ActionTaskState.running,
        type: resourceType,
        id: input.payload.uuid,
        listenerType: 'RevertVmFromSnapshotGroupWithMemory',
        inventory: JSON.stringify({ uuid: input.payload.vmUuid })
      })
    }

    const actionFn = async (payload: RevertVolumeFromSnapshotPayload, taskId: string) => {
      const { type, uuid, vmUuid, isStartVm, withMemory } = payload
      const action = type === SnapshotType.Single ? this.singleAction : this.groupAction

      const baseParams = { uuid: vmUuid }
      const params = withMemory ? { ...baseParams, stopHA: 'true', type: 'cold' } : baseParams
      await this.stopVmInstanceAction.call(params, { actionId, taskId })

      await action.call(
        {
          uuid
        },
        {
          actionId,
          taskId
        }
      )

      if (isStartVm) {
        const result = await this.startVmInstanceAction.call({ uuid: vmUuid }, { actionId, taskId })
        return {
          id: payload.uuid,
          fields:
            'state, vmNics { uuid, ip, type, mac, usedIps { uuid, ip, l3NetworkUuid }, l3NetworkUuid }',
          inventory: result.inventory
        }
      }

      return {
        id: payload.uuid
      }
    }

    this.actionHelper(input, resourceType, actionFn, {
      listenerType: input.payload.withMemory
        ? 'RevertVmFromSnapshotGroupWithMemory'
        : 'RevertVmFromSnapshotGroup'
    })
    return { actionId }
  }
}
