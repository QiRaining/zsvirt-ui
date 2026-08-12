import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Float } from '@nestjs/graphql'

import { UpdateGuestVmScriptAction } from '@/api/zstack/UpdateGuestVmScriptAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { ScriptEncodingType } from '../script-library.model'

@InputType()
class UpdateScriptPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  scriptContent?: string

  @Field(() => Float, { nullable: true })
  scriptTimeout?: number

  @Field(() => String, { nullable: true })
  renderParams?: string

  @Field(() => ScriptEncodingType, {
    nullable: true,
    description: '需要和scriptContent一起传参'
  })
  encodingType?: ScriptEncodingType
}

@InputType()
class UpdateScriptInput {
  @Field(() => [UpdateScriptPayload])
  payload: UpdateScriptPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateScriptService extends ActionService {
  @Inject() updateGuestVmScriptAction: UpdateGuestVmScriptAction

  @Mutation(() => ActionResult)
  updateScript(@Args('input') input: UpdateScriptInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Script', async (payload: UpdateScriptPayload, taskId: string) => {
      const { inventory } = await this.updateGuestVmScriptAction.call(
        {
          ...payload
        },
        { actionId, taskId }
      )

      return {
        id: payload?.uuid,
        fields: `name,description,scriptContent,renderParams,scriptTimeout,lastOpDate`,
        inventory
      }
    })
    return { actionId }
  }
}
