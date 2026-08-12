import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DiscoverExternalPrimaryStorageAction as TestConnectExternalPrimaryStorageAction } from '@/api/zstack/DiscoverExternalPrimaryStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { genUuid } from '@/utils'

@InputType()
export class TestConnectExternalPrimaryStoragePayload {
  @Field(() => String, { nullable: true, description: '存储标识（厂商名）' })
  identity?: string

  @Field(() => String, { nullable: true, description: '配置' })
  config?: string

  @Field(() => String, {
    description: '将配置信息拼接成一个 url, 比如：http://operator:password@203.0.113.5:80'
  })
  url: string
}

@InputType()
export class TestConnectExternalPrimaryStorageInput {
  @Field(() => TestConnectExternalPrimaryStoragePayload)
  payload: TestConnectExternalPrimaryStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class TestConnectExternalPrimaryStorageService extends ActionService {
  @Inject()
  private testConnectExternalPrimaryStorageAction: TestConnectExternalPrimaryStorageAction

  @Mutation(() => ActionResult)
  testConnectExternalPrimaryStorage(@Args('input') input: TestConnectExternalPrimaryStorageInput) {
    const actionId = input.action.actionId
    const apiId = genUuid()
    this.actionHelper(
      input,
      'ExternalPrimaryStorage',
      async (payload: TestConnectExternalPrimaryStoragePayload, taskId: string) => {
        try {
          await this.testConnectExternalPrimaryStorageAction.call(payload, {
            actionId,
            taskId,
            apiId
          })

          return {
            id: actionId,
            inventory: {
              success: true
            }
          }
        } catch (e) {
          await this.testConnectExternalPrimaryStorageAction.recordFailed(
            { success: false },
            {
              apiId
            }
          )

          throw {
            name: 'apiError',
            reason: {
              success: false
            }
          }
        }
      }
    )
    return { actionId }
  }
}
