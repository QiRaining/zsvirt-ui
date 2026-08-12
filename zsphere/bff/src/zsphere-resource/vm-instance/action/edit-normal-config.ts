import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import {
  ManagementTagPayload,
  ManagementTagService
} from '@/zsphere-administration/tag/action/management-tag'

import { AttachVmToVmGroupPayload, AttachVmToVmGroupService } from './attach-vm-to-vm-group'
import { DetachVmFromVmGroupService, DetachVmFromVmGroupPayload } from './detach-vm-from-vm-group'
import { SetVmHostnameService, SetVmHostnamePayload } from './set-hostname'

@InputType()
class EditNormalConfigPayload {
  @Field(() => ManagementTagPayload, { nullable: true })
  managementTagPayload?: ManagementTagPayload

  @Field(() => DetachVmFromVmGroupPayload, { nullable: true })
  detachVmFromVmGroupPayload?: DetachVmFromVmGroupPayload

  @Field(() => AttachVmToVmGroupPayload, { nullable: true })
  attachVmToVmGroupPayload?: AttachVmToVmGroupPayload

  @Field(() => SetVmHostnamePayload, { nullable: true })
  setVmHostnamePayload?: SetVmHostnamePayload
}

@InputType()
class EditNormalConfigInput {
  @Field(() => [EditNormalConfigPayload])
  payload: EditNormalConfigPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class EditNormalConfigService extends ActionService {
  @Inject() managementTagService: ManagementTagService
  @Inject() detachVmFromVmGroupService: DetachVmFromVmGroupService
  @Inject() attachVmToVmGroupService: AttachVmToVmGroupService
  @Inject() setVmHostnameService: SetVmHostnameService

  @Mutation(() => ActionResult)
  editVmNormalConfig(@Args('input') input: EditNormalConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: EditNormalConfigPayload, taskId: string) => {
        const {
          managementTagPayload,
          detachVmFromVmGroupPayload,
          attachVmToVmGroupPayload,
          setVmHostnamePayload
        } = payload

        const tasks = []
        if (managementTagPayload) {
          tasks.push(this.managementTagService.actionFn(managementTagPayload, taskId, actionId))
        }
        if (detachVmFromVmGroupPayload) {
          tasks.push(
            this.detachVmFromVmGroupService.actionFn(detachVmFromVmGroupPayload, taskId, actionId)
          )
        }

        if (attachVmToVmGroupPayload) {
          tasks.push(
            this.attachVmToVmGroupService.actionFn(attachVmToVmGroupPayload, taskId, actionId)
          )
        }

        if (setVmHostnamePayload) {
          tasks.push(this.setVmHostnameService.actionFn(setVmHostnamePayload, taskId, actionId))
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
