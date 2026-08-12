import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { CleanUpgradeSoftwarePackageAction } from '@/api/zstack/CleanUpgradeSoftwarePackageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CleanUpgradeSoftwarePackagePayload {
  @Field(() => String, { description: 'SoftwarePackage UUID' })
  uuid: string

  @Field(() => String, { nullable: true, description: '删除模式' })
  deleteMode?: string
}

@InputType()
class CleanUpgradeSoftwarePackageInput {
  @Field(() => [CleanUpgradeSoftwarePackagePayload])
  payload: CleanUpgradeSoftwarePackagePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CleanUpgradeSoftwarePackageService extends ActionService {
  @Inject() cleanUpgradeSoftwarePackageAction: CleanUpgradeSoftwarePackageAction

  @Mutation(() => ActionResult)
  cleanUpgradeSoftwarePackage(@Args('input') input: CleanUpgradeSoftwarePackageInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'MigrationService',
      async (payload: CleanUpgradeSoftwarePackagePayload, taskId: string) => {
        await this.cleanUpgradeSoftwarePackageAction.call(
          {
            uuid: payload.uuid,
            deleteMode: payload.deleteMode
          },
          {
            actionId,
            taskId
          }
        )

        return {
          id: actionId
        }
      }
    )

    return { actionId }
  }
}
