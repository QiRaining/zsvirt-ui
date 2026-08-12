import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'

import { FlattenVmInstanceAction } from '@/api/zstack/FlattenVmInstanceAction'
import { SubmitLongJobAction } from '@/api/zstack/SubmitLongJobAction'
import { ActionService } from '@/base/action-service'
import { LongJobService } from '@/common/long-job/long-job.service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZsLongJob } from '@/model/zs-long-job.model'

@InputType()
class FlattenVmInstancePayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  full?: boolean
}

@InputType()
class FlattenVmInstanceInput {
  @Field(() => [FlattenVmInstancePayload])
  payload: FlattenVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class FlattenVmInstanceService extends ActionService {
  @Inject() flattenVmInstanceAction: FlattenVmInstanceAction
  @Inject() longJobService: LongJobService
  @Inject() submitLongJobAction: SubmitLongJobAction
  @InjectModel(ZsLongJob) protected zsLongJob: typeof ZsLongJob

  @Mutation(() => ActionResult)
  async flattenVmInstance(@Args('input') input: FlattenVmInstanceInput) {
    const { actionId, name: actionName } = input.action

    const { uuid, full } = input?.payload?.[0]
    this.longJobService.call(
      actionName,
      'APIFlattenVmInstanceMsg',
      JSON.stringify({ uuid, full }),
      actionId,
      'VmInstance'
    )
    return { actionId }
  }
}
