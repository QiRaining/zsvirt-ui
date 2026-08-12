import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation, registerEnumType } from '@nestjs/graphql'

import { ChangeHostStateAction } from '@/api/zstack/ChangeHostStateAction'
import { PowerOnHostAction } from '@/api/zstack/PowerOnHostAction'
import { PowerResetHostAction } from '@/api/zstack/PowerResetHostAction'
import { ShutdownHostAction } from '@/api/zstack/ShutdownHostAction'
import { ActionService } from '@/base/action-service'
import { HostState, HostStateEvent } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

export enum UpdateHostPowerStatus {
  PowerOn = 'PowerOn',
  PowerOff = 'PowerOff',
  PowerReboot = 'PowerReboot'
}

registerEnumType(UpdateHostPowerStatus, {
  name: 'UpdateHostPowerStatus'
})

@InputType()
class UpdateHostPowerStatusPayload {
  @Field(() => String)
  uuid: string

  @Field(() => UpdateHostPowerStatus)
  updateHostPowerStatus: UpdateHostPowerStatus

  @Field(() => Boolean, { nullable: true })
  enteringMaintenanceMode: boolean

  @Field(() => Boolean, { nullable: true })
  stopHost: boolean

  @Field(() => HostState, { nullable: true })
  state: HostState

  @Field(() => Boolean, { nullable: true })
  isManagementNode: boolean
}

@InputType()
class UpdateHostPowerStatusInput {
  @Field(() => [UpdateHostPowerStatusPayload])
  payload: UpdateHostPowerStatusPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateHostPowerStatusService extends ActionService {
  @Inject() powerOnHostAction: PowerOnHostAction
  @Inject() powerResetHostAction: PowerResetHostAction
  @Inject() shutdownHostAction: ShutdownHostAction
  @Inject() changeHostStateAction: ChangeHostStateAction

  @Mutation(() => ActionResult)
  updateHostPowerStatus(@Args('input') input: UpdateHostPowerStatusInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostVO',
      async (payload: UpdateHostPowerStatusPayload, taskId: string) => {
        const {
          uuid,
          updateHostPowerStatus,
          enteringMaintenanceMode,
          stopHost,
          state,
          isManagementNode
        } = payload

        let result: any = {}
        switch (updateHostPowerStatus) {
          case UpdateHostPowerStatus.PowerOn: {
            result = await this.powerOnHostAction.call(
              {
                uuid
              },
              { actionId, taskId }
            )
            break
          }
          case UpdateHostPowerStatus.PowerOff: {
            if (
              enteringMaintenanceMode &&
              //不是维护模式和预维护模式 才执行api
              ![HostState.Maintenance, HostState.PreMaintenance].includes(state)
            ) {
              await this.changeHostStateAction.call(
                {
                  uuid,
                  stateEvent: HostStateEvent.maintain
                },
                { actionId, taskId }
              )
            }

            result = await this.shutdownHostAction.call(
              {
                uuid,
                //stopHost 前端钩上 stopHost === false
                force: stopHost,
                returnEarly: !!isManagementNode
              },
              { actionId, taskId }
            )
            break
          }
          case UpdateHostPowerStatus.PowerReboot: {
            if (
              enteringMaintenanceMode &&
              //不是维护模式和预维护模式 才执行api
              ![HostState.Maintenance, HostState.PreMaintenance].includes(state)
            ) {
              await this.changeHostStateAction.call(
                {
                  uuid,
                  stateEvent: HostStateEvent.maintain
                },
                { actionId, taskId }
              )
            }

            result = await this.powerResetHostAction.call(
              {
                uuid,
                returnEarly: !!isManagementNode
              },
              { actionId, taskId }
            )
            break
          }
        }

        return {
          id: payload.uuid,
          fields: 'state',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
