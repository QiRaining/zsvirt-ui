import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { ChangeBaremetalChassisStateAction } from '@/api/zstack/ChangeBaremetalChassisStateAction'
import { PowerOffBaremetalChassisAction } from '@/api/zstack/PowerOffBaremetalChassisAction'
import { PowerOnBaremetalChassisAction } from '@/api/zstack/PowerOnBaremetalChassisAction'
import { PowerResetBaremetalChassisAction } from '@/api/zstack/PowerResetBaremetalChassisAction'
import {
  UpdateBaremetalChassisAction,
  UpdateBaremetalChassisResult
} from '@/api/zstack/UpdateBaremetalChassisAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { BaremetalChassisPowerStatusType } from '../baremetal-chassis.model'

@InputType()
export class UpdateBaremetalChassisPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  ipmiAddress?: string

  @Field(() => Int, { nullable: true })
  ipmiPort?: number

  @Field(() => String, { nullable: true })
  ipmiUsername?: string

  @Field(() => String, { nullable: true })
  ipmiPassword?: string

  @Field(() => String, { nullable: true })
  stateEvent?: string

  @Field(() => BaremetalChassisPowerStatusType, { nullable: true })
  powerStatus?: BaremetalChassisPowerStatusType
}

@InputType()
class UpdateBaremetalChassisInput {
  @Field(() => [UpdateBaremetalChassisPayload])
  payload: Array<UpdateBaremetalChassisPayload>

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateBaremetalChassisService extends ActionService {
  @Inject() updateBaremetalChassisAction: UpdateBaremetalChassisAction
  @Inject() powerOnBaremetalChassisAction: PowerOnBaremetalChassisAction
  @Inject() powerOffBaremetalChassisAction: PowerOffBaremetalChassisAction
  @Inject() powerResetBaremetalChassisAction: PowerResetBaremetalChassisAction
  @Inject()
  changeBaremetalChassisStateAction: ChangeBaremetalChassisStateAction

  @Mutation(() => ActionResult)
  updateBaremetalChassis(@Args('input') input: UpdateBaremetalChassisInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'BaremetalChassis',
      async (
        { uuid, powerStatus, stateEvent, ...params }: UpdateBaremetalChassisPayload,
        taskId: string
      ) => {
        const option = { actionId, taskId }

        if (stateEvent) {
          const { inventory } = await this.changeBaremetalChassisStateAction.call({
            uuid,
            stateEvent
          })

          return {
            id: uuid,
            fields: 'state,status',
            inventory
          }
        }

        if (powerStatus) {
          await this.changePowerStatus({ uuid, powerStatus }, option)

          return {
            id: uuid,
            fields: 'powerStatus',
            inventory: { powerStatus }
          }
        }

        const { inventory }: UpdateBaremetalChassisResult =
          await this.updateBaremetalChassisAction.call(
            {
              ...params,
              uuid
            },
            option
          )

        return {
          id: uuid,
          fields: 'name,description,ipmiAddress,ipmiPort,ipmiUsername,ipmiPassword',
          inventory
        }
      }
    )

    return { actionId }
  }

  async changePowerStatus(
    {
      uuid,
      powerStatus
    }: {
      uuid: string
      powerStatus: BaremetalChassisPowerStatusType
    },
    option: { actionId: string; taskId: string }
  ) {
    switch (powerStatus) {
      case BaremetalChassisPowerStatusType.PowerOn:
        await this.powerOnBaremetalChassisAction.call(
          {
            chassisUuid: uuid
          },
          option
        )
        break
      case BaremetalChassisPowerStatusType.PowerOff:
        await this.powerOffBaremetalChassisAction.call(
          {
            chassisUuid: uuid
          },
          option
        )
        break
      case BaremetalChassisPowerStatusType.Reboot:
        await this.powerResetBaremetalChassisAction.call(
          {
            chassisUuid: uuid
          },
          option
        )
        break
    }
  }
}
