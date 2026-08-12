import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { CreateSystemTagAction, CreateSystemTagResult } from '@/api/zstack/CreateSystemTagAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { UpdateSystemTagAction, UpdateSystemTagResult } from '@/api/zstack/UpdateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateStorageNetworkCidrPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  cidr: string
}

@InputType()
class UpdateStorageNetworkCidrInput {
  @Field(() => UpdateStorageNetworkCidrPayload)
  payload: UpdateStorageNetworkCidrPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateStorageNetworkCidrService extends ActionService {
  @Inject() deleteTagAction: DeleteTagAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() updateSystemTagAction: UpdateSystemTagAction
  @Inject() createSystemTagAction: CreateSystemTagAction

  @Mutation(() => ActionResult)
  updateStorageNetworkCidr(@Args('input') input: UpdateStorageNetworkCidrInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'PrimaryStorageVO', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: UpdateStorageNetworkCidrPayload, taskId: string) => {
      const { uuid, cidr } = payload
      const params: IQueryAction = {
        fields: ['uuid'],
        conditions: [
          {
            key: 'resourceUuid',
            value: payload?.uuid
          },
          {
            key: 'resourceType',
            value: 'PrimaryStorageVO'
          },
          {
            key: 'tag',
            op: Op.like,
            value: 'primaryStorage::gateway::cidr'
          }
        ]
      }
      const systemTagResp = await this.querySystemTagAction.call(params)
      let result = {}
      if (systemTagResp?.inventories?.length === 0) {
        if (cidr === '') {
          return { id: payload.uuid }
        }
        result = (await this.createSystemTagAction.call(
          {
            resourceType: 'PrimaryStorageVO',
            resourceUuid: uuid,
            tag: `primaryStorage::gateway::cidr::${cidr}`
          },
          { actionId, taskId }
        )) as CreateSystemTagResult
      } else {
        if (cidr === '') {
          result = await this.deleteTagAction.call(
            {
              uuid: systemTagResp?.inventories?.[0]?.uuid
            },
            { actionId, taskId }
          )
        } else {
          result = (await this.updateSystemTagAction.call(
            {
              uuid: systemTagResp?.inventories?.[0]?.uuid,
              tag: `primaryStorage::gateway::cidr::${cidr}`
            },
            { actionId, taskId }
          )) as UpdateSystemTagResult
        }
      }
      return {
        id: payload.uuid,
        ...result
      }
    }
  }
}
