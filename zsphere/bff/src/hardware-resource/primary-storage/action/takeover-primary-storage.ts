import { Inject } from '@nestjs/common'
import { Args, Mutation, InputType, Field } from '@nestjs/graphql'

import { TakeoverPrimaryStorageAction } from '@/api/zstack/TakeoverPrimaryStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class TakeoverPrimaryStoragePayload {
  @Field(() => String)
  primaryStorageUuid: string

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  dryRun?: boolean
}

@InputType()
class TakeoverPrimaryStorageInput {
  @Field(() => TakeoverPrimaryStoragePayload)
  payload: TakeoverPrimaryStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class TakeoverPrimaryStorageService extends ActionService {
  @Inject() takeoverPrimaryStorageAction: TakeoverPrimaryStorageAction

  @Mutation(() => ActionResult)
  TakeoverPrimaryStorage(@Args('input') input: TakeoverPrimaryStorageInput): ActionResult {
    const { payload, action } = input
    const { actionId } = action
    const { primaryStorageUuid } = payload

    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (p: TakeoverPrimaryStoragePayload, taskId: string) => {
        if (p.dryRun) {
          // dryRun 模式：一致性检查
          // success=true 表示 UUID 不一致，允许接管
          // success=false + error.code=PS.1005 表示一致性检查通过
          // success=false + 其他错误码 表示检查失败
          try {
            const result = await this.takeoverPrimaryStorageAction.call(
              { uuid: p.primaryStorageUuid, dryRun: true },
              { actionId, taskId }
            )

            return {
              id: p.primaryStorageUuid,
              inventory: {
                actionType: 'checkConsistency',
                id: p.primaryStorageUuid,
                success: true,
                inventory: result.inventory
              }
            }
          } catch (error) {
            const errorCode = error?.error?.code
            return {
              id: p.primaryStorageUuid,
              inventory: {
                actionType: 'checkConsistency',
                id: p.primaryStorageUuid,
                success: false,
                errorCode
              }
            }
          }
        }

        // 实际接管
        await this.takeoverPrimaryStorageAction.call(
          { uuid: p.primaryStorageUuid, dryRun: false },
          { actionId, taskId }
        )

        return {
          id: p.primaryStorageUuid,
          inventory: {
            actionType: 'takeover',
            id: p.primaryStorageUuid
          }
        }
      }
    )

    return { actionId }
  }
}
