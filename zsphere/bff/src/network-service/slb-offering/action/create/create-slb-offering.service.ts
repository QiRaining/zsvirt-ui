import { Injectable, Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Float } from '@nestjs/graphql'

import {
  CreateInstanceOfferingResult,
  CreateSlbOfferingAction
} from '@/api/zstack/CreateSlbOfferingAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CreateSlbOfferingPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  managementNetworkUuid: string

  @Field(() => String)
  imageUuid: string

  @Field(() => Float)
  cpuNum: number

  @Field(() => Float)
  memorySize: number

  @Field(() => String, { nullable: true })
  allocatorStrategy?: string

  @Field(() => Float, { nullable: true })
  sortKey?: number

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => String)
  zoneUuid: string
}

@InputType()
export class CreateSlbOfferingInput {
  @Field(() => [CreateSlbOfferingPayload])
  payload: CreateSlbOfferingPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

@Injectable()
export class CreateSlbOfferingService extends ActionService {
  @Inject() createSlbOfferingAction: CreateSlbOfferingAction

  @Mutation(() => ActionResult)
  createSlbOffering(@Args('input') input: CreateSlbOfferingInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SlbOffering',
      async (payload: CreateSlbOfferingPayload, taskId: string) => {
        const result: CreateInstanceOfferingResult = await this.createSlbOfferingAction.call(
          { ...payload },
          { actionId, taskId }
        )
        return {
          id: result.inventory.uuid,
          ...result
        }
      }
    )
    return { actionId }
  }
}
