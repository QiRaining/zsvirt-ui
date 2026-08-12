import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ZStackApiBase } from '@/api/zstack/base/zstack-api-base'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { genUuid } from '@/utils'

@InputType()
class OpenBaremetalInstanceConsolePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class OpenBaremetalInstanceConsoleInput {
  @Field(() => [OpenBaremetalInstanceConsolePayload])
  payload: OpenBaremetalInstanceConsolePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class OpenBaremetalInstanceConsoleService extends ActionService {
  @Inject()
  zstackApiBase: ZStackApiBase

  @Mutation(() => ActionResult)
  openBaremetalInstanceConsole(@Args('input') input: OpenBaremetalInstanceConsoleInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalInstance',
      async (payload: OpenBaremetalInstanceConsolePayload, taskId: string) => {
        const { uuid } = payload
        const apiRecord = await this.zstackApiBase.recordStart(
          { uuid },
          { actionId, taskId, apiId: genUuid() },
          'UI_OPEN_BAREMETAL_INSTANCE_CONFIG'
        )
        await this.zstackApiBase.recordSuccess({ success: true }, apiRecord)
        return {
          id: uuid
        }
      }
    )
    return { actionId }
  }
}
