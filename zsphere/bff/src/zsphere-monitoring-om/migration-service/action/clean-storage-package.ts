import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { CleanSoftwarePackageAction } from '@/api/zstack/CleanSoftwarePackageAction'
import { UninstallSoftwarePackageAction } from '@/api/zstack/UninstallSoftwarePackageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CleanStoragePackagePayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean, { nullable: true })
  cleanStorageMode?: boolean
}

@InputType()
class CleanStoragePackageInput {
  @Field(() => CleanStoragePackagePayload)
  payload: CleanStoragePackagePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CleanStoragePackageService extends ActionService {
  @Inject() cleanSoftwarePackageAction: CleanSoftwarePackageAction
  @Inject() uninstallSoftwarePackageAction: UninstallSoftwarePackageAction
  @Mutation(() => ActionResult)
  cleanStoragePackage(@Args('input') input: CleanStoragePackageInput) {
    const actionId = input.action.actionId
    const { uuid, cleanStorageMode } = input.payload

    const actionFn = async (_: any, taskId: string) => {
      // 先执行卸载操作
      if (cleanStorageMode) {
        await this.uninstallSoftwarePackageAction.call(
          {
            uuid
          },
          {
            actionId,
            taskId
          }
        )
      }
      // 卸载成功后，再执行清理操作
      await this.cleanSoftwarePackageAction.call(
        {
          uuid
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

    this.actionHelper(input, 'MigrationService', actionFn)
    return { actionId }
  }
}
