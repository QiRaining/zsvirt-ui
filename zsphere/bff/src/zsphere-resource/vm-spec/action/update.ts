import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateVmCustomSpecificationAction } from '@/api/zstack/UpdateVmCustomSpecificationAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { DomainMode } from '../vm-spec.model'

@InputType()
export class UpdateVmCustomSpecificationPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => String, { nullable: true })
  rootPassword?: string

  @Field(() => Boolean, { nullable: true })
  generateSID?: boolean

  @Field(() => DomainMode, { nullable: true })
  domainMode?: DomainMode

  @Field(() => String, { nullable: true })
  domainName?: string

  @Field(() => String, { nullable: true })
  domainUsername?: string

  @Field(() => String, { nullable: true })
  domainPassword?: string

  @Field(() => String, { nullable: true })
  organization?: string
}

@InputType()
export class UpdateVmCustomSpecificationInput {
  @Field(() => UpdateVmCustomSpecificationPayload)
  payload: UpdateVmCustomSpecificationPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateVmCustomSpecificationService extends ActionService {
  @Inject()
  private updateVmCustomSpecificationAction: UpdateVmCustomSpecificationAction

  @Mutation(() => ActionResult)
  updateVmCustomSpecification(@Args('input') input: UpdateVmCustomSpecificationInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmCustomSpecification',
      async (payload: UpdateVmCustomSpecificationPayload, taskId: string) => {
        const result = await this.updateVmCustomSpecificationAction.call(payload, {
          actionId,
          taskId
        })
        return { id: result?.inventory?.uuid }
      }
    )
    return { actionId }
  }
}
