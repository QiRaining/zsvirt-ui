import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateVmCustomSpecificationAction } from '@/api/zstack/CreateVmCustomSpecificationAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { DomainMode, VmSpecPlatform } from '../vm-spec.model'

@InputType()
export class CreateVmCustomSpecificationPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => VmSpecPlatform)
  platform: VmSpecPlatform

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
export class CreateVmCustomSpecificationInput {
  @Field(() => CreateVmCustomSpecificationPayload)
  payload: CreateVmCustomSpecificationPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateVmCustomSpecificationService extends ActionService {
  @Inject()
  private createVmCustomSpecificationAction: CreateVmCustomSpecificationAction

  @Mutation(() => ActionResult)
  createVmCustomSpecification(@Args('input') input: CreateVmCustomSpecificationInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmCustomSpecification',
      async (payload: CreateVmCustomSpecificationPayload, taskId: string) => {
        const result = await this.createVmCustomSpecificationAction.call(payload, {
          actionId,
          taskId
        })
        return { id: result?.inventory?.uuid }
      }
    )
    return { actionId }
  }
}
