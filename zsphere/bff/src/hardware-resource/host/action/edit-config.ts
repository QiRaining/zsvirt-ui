import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { UpdateHostAction } from '@/api/zstack/UpdateHostAction'
import { UpdateHostIommuStateAction } from '@/api/zstack/UpdateHostIommuStateAction'
import { ActionService } from '@/base/action-service'
import { State } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { SetSystemTagService, SystemTagActionType } from '@/common/system-tag/set-system-tag'

@InputType()
class EditHostConfigPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Boolean, { nullable: true })
  iommu?: boolean

  @Field(() => Boolean, { nullable: true })
  ept?: boolean
}

@InputType()
class EditHostConfigInput {
  @Field(() => EditHostConfigPayload)
  payload: EditHostConfigPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class EditHostConfigService extends ActionService {
  @Inject() updateHostAction: UpdateHostAction
  @Inject()
  createSystemTagAction: CreateSystemTagAction
  @Inject()
  deleteTagAction: DeleteTagAction
  @Inject() updateHostIommuStateAction: UpdateHostIommuStateAction
  @Inject() setSystemTagService: SetSystemTagService

  @Mutation(() => ActionResult)
  editHostConfig(@Args('input') input: EditHostConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'HostVO', async (payload: EditHostConfigPayload, taskId: string) => {
      const { uuid, iommu, ept, ...basicConfig } = payload
      const action = { actionId, taskId }

      if (!_.isEmpty(basicConfig)) {
        await this.updateHostAction.call(
          {
            uuid,
            ...basicConfig
          },
          action
        )
      }

      if (!_.isUndefined(iommu)) {
        if (iommu) {
          await this.updateHostIommuStateAction.call(
            {
              uuid,
              state: State.Enabled
            },
            { actionId, taskId }
          )
        } else {
          await this.updateHostIommuStateAction.call(
            {
              uuid,
              state: State.Disabled
            },
            { actionId, taskId }
          )
        }
      }

      if (!_.isUndefined(ept)) {
        if (ept) {
          // 开启EPT
          // 后端默认有pageTableExtensionDisabled的时候表示ept关闭了。
          await this.setSystemTagService.actionFn(
            {
              resourceUuid: uuid,
              originTag: `pageTableExtensionDisabled`,
              actionType: SystemTagActionType.Delete
            },
            taskId,
            actionId
          )
        } else {
          // 关闭EPT
          await this.setSystemTagService.actionFn(
            {
              resourceUuid: uuid,
              tag: `pageTableExtensionDisabled`,
              resourceType: 'HostVO',
              actionType: SystemTagActionType.Create
            },
            taskId,
            actionId
          )
        }
      }

      return {
        id: uuid
      }
    })
    return { actionId }
  }
}
