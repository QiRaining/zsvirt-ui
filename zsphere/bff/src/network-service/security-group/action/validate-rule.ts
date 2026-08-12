import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, OmitType, ObjectType } from '@nestjs/graphql'

import { ValidateSecurityGroupRuleAction } from '@/api/zstack/ValidateSecurityGroupRuleAction'
import { ActionService } from '@/base/action-service'
import { SecurityGroupRuleProtocolType, SecurityGroupRuleType } from '@/common/enum'
import { ActionResult } from '@/common/model/action.model'

import { AddRuleParam } from './create'

@InputType()
class SecurityGroupRuleParam extends OmitType(AddRuleParam, ['type', 'protocol', 'state']) {
  @Field(() => String)
  securityGroupUuid: string

  @Field(() => SecurityGroupRuleType)
  type: SecurityGroupRuleType

  @Field(() => SecurityGroupRuleProtocolType)
  protocol: SecurityGroupRuleProtocolType

  @Field(() => String, { nullable: true })
  remoteSecurityGroupUuid?: string
}

@InputType()
class ValidateSecurityGroupRulePayload {
  @Field(() => [SecurityGroupRuleParam])
  rules: SecurityGroupRuleParam[]
}

@InputType()
export class ValidateSecurityGroupRuleInput {
  @Field(() => ValidateSecurityGroupRulePayload)
  payload: ValidateSecurityGroupRulePayload
}

@ObjectType()
export class ValidateSecurityGroupRuleOutput {
  @Field(() => Boolean)
  available: boolean

  @Field(() => String, { nullable: true })
  code?: string
}

export class ValidateSecurityGroupRuleService extends ActionService {
  @Inject() validateSecurityGroupRuleAction: ValidateSecurityGroupRuleAction

  @Mutation(() => [ValidateSecurityGroupRuleOutput])
  async validateSecurityGroupRule(@Args('input') input: ValidateSecurityGroupRuleInput) {
    try {
      const { payload } = input
      const result = await Promise.allSettled(
        payload.rules.map(rule => this.validateSecurityGroupRuleAction.call(rule))
      )

      const list = result.map((it: any) => {
        if (it?.value?.available) {
          return {
            available: true
          }
        }

        const reason = JSON.parse(it?.reason?.message || JSON.stringify({}))

        return {
          available: false,
          code: reason.code === 'SYS.1003' ? 'SG.1001' : reason.code
        }
      })

      return list
    } catch {
      return []
    }
  }
}
