import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { StartVmInstanceAction, StartVmInstanceResult } from '@/api/zstack/StartVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class StartVmInstancePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class StartVmInstanceInput {
  @Field(() => [StartVmInstancePayload])
  payload: StartVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class StartVmInstanceService extends ActionService {
  @Inject() startVmInstanceAction: StartVmInstanceAction

  @Mutation(() => ActionResult)
  startVmInstance(@Args('input') input: StartVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: StartVmInstancePayload, taskId: string) => {
        const { uuid } = payload
        const result: StartVmInstanceResult = await this.startVmInstanceAction.call(
          { uuid },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          fields:
            'state, vmNics { uuid, ip, type, mac, usedIps { uuid, ip, l3NetworkUuid }, l3NetworkUuid }',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
