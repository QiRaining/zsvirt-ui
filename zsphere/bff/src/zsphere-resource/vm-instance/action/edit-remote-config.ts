import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import {
  UpdateResourceConfigPayload,
  UpdateResourceConfigService
} from '@/settings/resource-config/action/update-resource-config'

import { ChangeVmPasswordPayload, ChangeVmPasswordService } from './change-vm-password'
import {
  DeleteVmConsolePasswordPayload,
  DeleteVmConsolePasswordService
} from './delete-console-password'
import { SetVmConsoleModePayload, SetVmConsoleModeService } from './set-consle-mode'
import { SetVmConsolePasswordPayload, SetVmConsolePasswordService } from './set-console-password'
import { SetVmSshKeyPayload, SetVmSshKeyService } from './set-ssk-key'
import { SetVmUsbRedirectPayload, SetVmUsbRedirectService } from './set-usb-redirect'
import { SetVmMonitorNumberPayload, SetVmMonitorNumberService } from './set-vm-monitor'

@InputType()
class EditRemoteConfigPayload {
  @Field(() => SetVmConsoleModePayload, { nullable: true })
  setVmConsoleModePayload?: SetVmConsoleModePayload

  @Field(() => SetVmMonitorNumberPayload, { nullable: true })
  setVmMonitorNumberPayload?: SetVmMonitorNumberPayload

  @Field(() => DeleteVmConsolePasswordPayload, { nullable: true })
  deleteVmConsolePasswordPayload?: DeleteVmConsolePasswordPayload

  // spice Streming
  @Field(() => UpdateResourceConfigPayload, { nullable: true })
  updateResourceConfigPayload?: UpdateResourceConfigPayload

  @Field(() => SetVmUsbRedirectPayload, { nullable: true })
  setVmUsbRedirectPayload?: SetVmUsbRedirectPayload

  @Field(() => SetVmConsolePasswordPayload, { nullable: true })
  setVmConsolePasswordPayload?: SetVmConsolePasswordPayload

  @Field(() => ChangeVmPasswordPayload, { nullable: true })
  changeVmPasswordPayload?: ChangeVmPasswordPayload

  @Field(() => SetVmSshKeyPayload, { nullable: true })
  setVmSshKeyPayload?: SetVmSshKeyPayload
}

@InputType()
class EditRemoteConfigInput {
  @Field(() => [EditRemoteConfigPayload])
  payload: EditRemoteConfigPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class EditRemoteConfigService extends ActionService {
  @Inject() setVmConsoleModeService: SetVmConsoleModeService
  @Inject() deleteVmConsolePasswordService: DeleteVmConsolePasswordService
  @Inject() setVmMonitorNumberService: SetVmMonitorNumberService
  @Inject() setVmUsbRedirectService: SetVmUsbRedirectService
  @Inject() setVmConsolePasswordService: SetVmConsolePasswordService
  @Inject() updateResourceConfigService: UpdateResourceConfigService
  @Inject() changeVmPasswordService: ChangeVmPasswordService
  @Inject() setVmSshKeyService: SetVmSshKeyService

  @Mutation(() => ActionResult)
  editVmRemoteConfig(@Args('input') input: EditRemoteConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: EditRemoteConfigPayload, taskId: string) => {
        const {
          setVmConsoleModePayload,
          deleteVmConsolePasswordPayload,
          setVmMonitorNumberPayload,
          updateResourceConfigPayload,
          setVmUsbRedirectPayload,
          setVmConsolePasswordPayload,
          changeVmPasswordPayload,
          setVmSshKeyPayload
        } = payload

        const tasks = []
        if (setVmConsoleModePayload) {
          tasks.push(
            this.setVmConsoleModeService.actionFn(setVmConsoleModePayload, taskId, actionId)
          )
        }
        if (deleteVmConsolePasswordPayload) {
          tasks.push(
            this.deleteVmConsolePasswordService.actionFn(
              deleteVmConsolePasswordPayload,
              taskId,
              actionId
            )
          )
        }
        if (updateResourceConfigPayload) {
          tasks.push(
            this.updateResourceConfigService.actionFn(updateResourceConfigPayload, taskId, actionId)
          )
        }
        if (setVmMonitorNumberPayload) {
          tasks.push(
            this.setVmMonitorNumberService.actionFn(setVmMonitorNumberPayload, taskId, actionId)
          )
        }
        if (setVmUsbRedirectPayload) {
          tasks.push(
            this.setVmUsbRedirectService.actionFn(setVmUsbRedirectPayload, taskId, actionId)
          )
        }
        if (setVmConsolePasswordPayload) {
          tasks.push(
            this.setVmConsolePasswordService.actionFn(setVmConsolePasswordPayload, taskId, actionId)
          )
        }
        if (changeVmPasswordPayload) {
          tasks.push(
            this.changeVmPasswordService.actionFn(changeVmPasswordPayload, taskId, actionId)
          )
        }
        if (setVmSshKeyPayload) {
          tasks.push(this.setVmSshKeyService.actionFn(setVmSshKeyPayload, taskId, actionId))
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
