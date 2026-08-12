import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { SetSystemTagPayload, SetSystemTagService } from '@/common/system-tag/set-system-tag'
import {
  UpdateResourceConfigPayload,
  UpdateResourceConfigService
} from '@/settings/resource-config/action/update-resource-config'

import { SetVmBIOSTrackPayload, SetVmBIOSTrackService } from './set-bios-sync'
import { SetVmClockTrackPayload, SetVmClockTrackService } from './set-time-sync'
import { SetVmBootModePayload, SetVmBootModeService } from './set-vm-boot-mode'
import { SetVmBootOrderPayload, SetVmBootOrderService } from './set-vm-bootorder'

@InputType()
class EditGuestToolConfigPayload {
  @Field(() => UpdateResourceConfigPayload, { nullable: true })
  updateResourceConfigPayload?: UpdateResourceConfigPayload

  @Field(() => SetVmClockTrackPayload, { nullable: true })
  setVmClockTrackPayload?: SetVmClockTrackPayload

  @Field(() => SetVmBootModePayload, { nullable: true })
  setVmBootModePayload?: SetVmBootModePayload

  @Field(() => SetVmBootOrderPayload, { nullable: true })
  setVmBootOrderPayload?: SetVmBootOrderPayload

  @Field(() => SetVmBIOSTrackPayload, { nullable: true })
  setVmBIOSTrackPayload?: SetVmBIOSTrackPayload

  @Field(() => SetSystemTagPayload, { nullable: true })
  setSystemTagPayload?: SetSystemTagPayload
}

@InputType()
class EditGuestToolConfigInput {
  @Field(() => [EditGuestToolConfigPayload])
  payload: EditGuestToolConfigPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class EditGuestToolConfigService extends ActionService {
  @Inject() updateResourceConfigService: UpdateResourceConfigService
  @Inject() setVmClockTrackService: SetVmClockTrackService
  @Inject() setVmBootModeService: SetVmBootModeService
  @Inject() setVmBootOrderService: SetVmBootOrderService
  @Inject() setVmBIOSTrackService: SetVmBIOSTrackService
  @Inject() setSystemTagService: SetSystemTagService

  @Mutation(() => ActionResult)
  editVmGuestToolConfig(@Args('input') input: EditGuestToolConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: EditGuestToolConfigPayload, taskId: string) => {
        const {
          setSystemTagPayload,
          setVmBIOSTrackPayload,
          updateResourceConfigPayload,
          setVmClockTrackPayload,
          setVmBootModePayload,
          setVmBootOrderPayload
        } = payload

        const tasks = []
        if (updateResourceConfigPayload) {
          tasks.push(
            this.updateResourceConfigService.actionFn(updateResourceConfigPayload, taskId, actionId)
          )
        }
        if (setVmClockTrackPayload) {
          tasks.push(this.setVmClockTrackService.actionFn(setVmClockTrackPayload, taskId, actionId))
        }
        if (setVmBootModePayload) {
          tasks.push(this.setVmBootModeService.actionFn(setVmBootModePayload, taskId, actionId))
        }
        if (setVmBootOrderPayload) {
          tasks.push(this.setVmBootOrderService.actionFn(setVmBootOrderPayload, taskId, actionId))
        }
        if (setVmBIOSTrackPayload) {
          tasks.push(this.setVmBIOSTrackService.actionFn(setVmBIOSTrackPayload, taskId, actionId))
        }
        if (setSystemTagPayload) {
          tasks.push(this.setSystemTagService.actionFn(setSystemTagPayload, taskId, actionId))
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
