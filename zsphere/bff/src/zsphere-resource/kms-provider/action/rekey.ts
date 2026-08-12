import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { RekeyKeyProviderRefsAction } from '@/api/zstack/RekeyKeyProviderRefsAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL from '@/common/zql/index'

@InputType()
class RekeyKeyProviderRefsPayload {
  @Field(() => [String], { nullable: true })
  refIds?: string[]

  @Field(() => [String], { nullable: true })
  resourceUuids?: string[]

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => String, { nullable: true })
  providerUuid?: string

  @Field(() => Boolean, { nullable: true })
  rekeyAll?: boolean
}

@InputType()
class RekeyKeyProviderRefsInput {
  @Field(() => RekeyKeyProviderRefsPayload)
  payload!: RekeyKeyProviderRefsPayload

  @Field(() => ActionInput)
  action!: ActionInput
}

export class RekeyKeyProviderRefsService extends ActionService {
  @Inject() zqlService!: ZQLService
  @Inject() rekeyKeyProviderRefsAction!: RekeyKeyProviderRefsAction

  @Mutation(() => ActionResult)
  rekeyKeyProviderRefs(@Args('input') input: RekeyKeyProviderRefsInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'KmsProvider',
      async (payload: RekeyKeyProviderRefsPayload, taskId: string) => {
        let providerUuid = payload.providerUuid
        if (!providerUuid) {
          const zql = ZQL.stringify({
            tableName: 'GlobalConfig',
            condition: {
              name: 'default.keyProviderUuid',
              category: 'keyProvider'
            }
          })
          const { results } = await this.zqlService.call(zql)
          providerUuid = results?.[0]?.inventories?.[0]?.value as string
        }
        await this.rekeyKeyProviderRefsAction.call(
          { ...payload, providerUuid },
          { taskId, actionId }
        )
        return { id: providerUuid }
      }
    )
    return { actionId }
  }
}
