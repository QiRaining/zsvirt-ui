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
class UpdateCephTokenPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  token: string
}

@InputType()
class UpdateCephTokenInput {
  @Field(() => UpdateCephTokenPayload)
  payload: UpdateCephTokenPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateCephTokenService extends ActionService {
  @Inject() deleteTagAction: DeleteTagAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() updateSystemTagAction: UpdateSystemTagAction
  @Inject() createSystemTagAction: CreateSystemTagAction

  @Mutation(() => ActionResult)
  updateCephToken(@Args('input') input: UpdateCephTokenInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'PrimaryStorageVO', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: UpdateCephTokenPayload, taskId: string) => {
      const { uuid, token } = payload
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
            value: 'ceph::thirdPartyPlatform'
          }
        ]
      }
      const systemTagResp = await this.querySystemTagAction.call(params)
      let result = {}
      if (systemTagResp?.inventories?.length === 0) {
        if (token === '') {
          return { id: payload.uuid }
        }
        result = (await this.createSystemTagAction.call(
          {
            resourceType: 'PrimaryStorageVO',
            resourceUuid: uuid,
            tag: `ceph::thirdPartyPlatform::${token}`
          },
          { actionId, taskId }
        )) as CreateSystemTagResult
      } else {
        if (token === '') {
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
              tag: `ceph::thirdPartyPlatform::${token}`
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
