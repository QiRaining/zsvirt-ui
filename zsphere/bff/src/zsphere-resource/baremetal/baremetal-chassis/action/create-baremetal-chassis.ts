import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import {
  CreateBaremetalChassisAction,
  type CreateBaremetalChassisResult
} from '@/api/zstack/CreateBaremetalChassisAction'
import { ActionService } from '@/base/action-service'
import { LongJobService } from '@/common/long-job/long-job.service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CreateBaremetalChassisPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  ipmiAddress: string

  @Field(() => Int, { nullable: true })
  ipmiPort?: number

  @Field(() => String)
  ipmiUsername: string

  @Field(() => String)
  ipmiPassword: string

  @Field(() => String)
  clusterUuid: string

  @Field(() => Boolean)
  restartAfterAdding: boolean
}

@InputType()
class CreateBaremetalChassisInput {
  @Field(() => [CreateBaremetalChassisPayload])
  payload: Array<CreateBaremetalChassisPayload>

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
class BatchCreateBaremetalChassisPayload {
  @Field(() => String)
  baremetalChassisInfo: string
}

@InputType()
class BatchCreateBaremetalChassisInput {
  @Field(() => BatchCreateBaremetalChassisPayload)
  payload: BatchCreateBaremetalChassisPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateBaremetalChassisService extends ActionService {
  @Inject() createBaremetalChassisAction: CreateBaremetalChassisAction

  @Inject() longJobService: LongJobService

  @Mutation(() => ActionResult)
  createBaremetalChassis(@Args('input') input: CreateBaremetalChassisInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'BaremetalChassis',
      async ({ restartAfterAdding, ...payload }: CreateBaremetalChassisPayload, taskId: string) => {
        const { inventory }: CreateBaremetalChassisResult =
          await this.createBaremetalChassisAction.call(payload, {
            actionId,
            taskId
          })

        const uuid = inventory?.uuid

        return {
          id: uuid,
          fields: 'uuid',
          inventory: {
            uuid
          }
        }
      }
    )

    return { actionId }
  }

  @Mutation(() => ActionResult)
  batchCreateBaremetalChassis(@Args('input') input: BatchCreateBaremetalChassisInput) {
    const actionId = input.action.actionId

    const jobData = JSON.stringify(input.payload)

    this.longJobService.call(
      input.action.name,
      'APIBatchCreateBaremetalChassisMsg',
      jobData,
      actionId,
      'BaremetalChassis'
    )

    return { actionId }
  }
}
