import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { GetBaremetalChassisPowerStatusAction } from '@/api/zstack/GetBaremetalChassisPowerStatusAction'
import {
  InspectBaremetalChassisAction,
  InspectBaremetalChassisResult
} from '@/api/zstack/InspectBaremetalChassisAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { formatPowerStatus } from '../utils'

@InputType()
export class InspectBaremetalChassisPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class InspectBaremetalChassisInput {
  @Field(() => [InspectBaremetalChassisPayload])
  payload: Array<InspectBaremetalChassisPayload>

  @Field(() => ActionInput)
  action: ActionInput
}

export class InspectBaremetalChassisService extends ActionService {
  @Inject()
  inspectBaremetalChassisAction: InspectBaremetalChassisAction

  @Inject()
  getBaremetalChassisPowerStatusAction: GetBaremetalChassisPowerStatusAction

  @Mutation(() => ActionResult)
  inspectBaremetalChassis(@Args('input') input: InspectBaremetalChassisInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'BaremetalChassis',
      async ({ uuid, ...rest }: InspectBaremetalChassisPayload, taskId: string) => {
        const { inventory }: InspectBaremetalChassisResult =
          await this.inspectBaremetalChassisAction.call({ ...rest, uuid }, { actionId, taskId })

        const { status } = await this.getBaremetalChassisPowerStatusAction.call({
          uuid
        })

        return {
          id: uuid,
          fields:
            'name,description,ipmiAddress,ipmiPort,ipmiUsername,ipmiPassword,state,status,powerStatus',
          inventory: {
            ...inventory,
            powerStatus: formatPowerStatus(status)
          }
        }
      }
    )

    return { actionId }
  }
}
