import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import {
  UpdateResourceConfigPayload,
  UpdateResourceConfigService
} from '@/settings/resource-config/action/update-resource-config'

import {
  RemoveHaStickStragedyPayload,
  RemoveHaStickStragedyService
} from './remove-hastickstragedy'
import { SetVmEmulatorPinPayload, SetVmEmulatorPinService } from './set-emulator-pin'
import { SetHaStickStragedyPayload, SetHaStickStragedyService } from './set-hastickstragedy'
import { SetVmCleanTrafficService, SetVmCleanTrafficPayload } from './set-vm-anti-spoofing'

@InputType()
class EditOtherConfigPayload {
  // 网络防欺诈
  @Field(() => SetVmCleanTrafficPayload, { nullable: true })
  setVmCleanTrafficPayload?: SetVmCleanTrafficPayload

  @Field(() => SetHaStickStragedyPayload, { nullable: true })
  setHaStickStragedyPayload?: SetHaStickStragedyPayload

  @Field(() => RemoveHaStickStragedyPayload, { nullable: true })
  removeHaStickStragedyPayload?: RemoveHaStickStragedyPayload

  // spice Streming
  @Field(() => [UpdateResourceConfigPayload], { nullable: true })
  updateResourceConfigPayload?: UpdateResourceConfigPayload[]

  @Field(() => SetVmEmulatorPinPayload, { nullable: true })
  setVmEmulatorPinPayload?: SetVmEmulatorPinPayload
}

@InputType()
class EditOtherConfigInput {
  @Field(() => [EditOtherConfigPayload])
  payload: EditOtherConfigPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class EditOtherConfigService extends ActionService {
  @Inject() setVmCleanTrafficService: SetVmCleanTrafficService
  @Inject() setHaStickStragedyService: SetHaStickStragedyService
  @Inject() setVmEmulatorPinService: SetVmEmulatorPinService
  @Inject() updateResourceConfigService: UpdateResourceConfigService
  @Inject() removeHaStickStragedyService: RemoveHaStickStragedyService

  @Mutation(() => ActionResult)
  editVmOtherConfig(@Args('input') input: EditOtherConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: EditOtherConfigPayload, taskId: string) => {
        const {
          setVmCleanTrafficPayload,
          setHaStickStragedyPayload,
          updateResourceConfigPayload,
          setVmEmulatorPinPayload,
          removeHaStickStragedyPayload
        } = payload

        let tasks = []
        if (setVmCleanTrafficPayload) {
          tasks.push(
            this.setVmCleanTrafficService.actionFn(setVmCleanTrafficPayload, taskId, actionId)
          )
        }
        if (updateResourceConfigPayload?.length) {
          tasks = tasks.concat(
            updateResourceConfigPayload.map(payload =>
              this.updateResourceConfigService.actionFn(payload, taskId, actionId)
            )
          )
        }
        if (setHaStickStragedyPayload) {
          tasks.push(
            this.setHaStickStragedyService.actionFn(setHaStickStragedyPayload, taskId, actionId)
          )
        }
        if (removeHaStickStragedyPayload) {
          tasks.push(
            this.removeHaStickStragedyService.actionFn(
              removeHaStickStragedyPayload,
              taskId,
              actionId
            )
          )
        }
        if (setVmEmulatorPinPayload) {
          tasks.push(
            this.setVmEmulatorPinService.actionFn(setVmEmulatorPinPayload, taskId, actionId)
          )
        }

        if (tasks?.length) {
          await Promise.all(tasks)
        }
        return {
          id: actionId
        }
      }
    )
    return { actionId }
  }
}
