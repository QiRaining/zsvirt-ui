import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Float } from '@nestjs/graphql'

import {
  CreateGuestVmScriptAction,
  CreateGuestVmScriptResult
} from '@/api/zstack/CreateGuestVmScriptAction'
import { ActionService } from '@/base/action-service'
import { ImagePlatform } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { ScriptEncodingType } from '../script-library.model'

@InputType()
export class CreateScriptPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => ImagePlatform)
  platform: ImagePlatform

  @Field(() => String)
  scriptType: string

  @Field(() => String)
  scriptContent: string

  @Field(() => Float, { nullable: true })
  scriptTimeout?: number

  @Field(() => String, { nullable: true })
  renderParams?: string

  @Field(() => ScriptEncodingType, { defaultValue: ScriptEncodingType.Base64 })
  encodingType: ScriptEncodingType
}

@InputType()
class CreateScriptInput {
  @Field(() => [CreateScriptPayload])
  payload: CreateScriptPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateScriptService extends ActionService {
  @Inject() createGuestVmScriptAction: CreateGuestVmScriptAction

  @Mutation(() => ActionResult)
  createScript(@Args('input') input: CreateScriptInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Script', async (payload: CreateScriptPayload, taskId: string) => {
      const result: CreateGuestVmScriptResult = await this.createGuestVmScriptAction.call(
        { ...payload },
        { actionId, taskId }
      )
      return {
        id: result.inventory.uuid,
        inventory: result.inventory
      }
    })
    return { actionId }
  }
}
