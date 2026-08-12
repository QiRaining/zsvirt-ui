import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { UpdateAtPersonOfAtFeiShuEndpointAction } from '@/api/zstack/UpdateAtPersonOfAtFeiShuEndpointAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZQLAction } from '@/common/zql'
import ZQL from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

@InputType()
class UpdateSNSFeiShuAtPersonPayload {
  @Field(() => String, { description: '当前修改人员的 uuid' })
  uuid: string

  @Field(() => String, { nullable: true })
  userId?: string

  @Field(() => String)
  endpointUuid: string

  @Field(() => String, { nullable: true })
  remark?: string
}

@InputType()
class UpdateSNSFeiShuAtPersonInput {
  @Field(() => [UpdateSNSFeiShuAtPersonPayload])
  payload: UpdateSNSFeiShuAtPersonPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateSNSFeiShuAtPersonService extends ActionService {
  @Inject() updateAction: UpdateAtPersonOfAtFeiShuEndpointAction
  @Inject() zqlService: ZQLService

  @Mutation(() => ActionResult)
  updateSNSFeiShuAtPerson(@Args('input') input: UpdateSNSFeiShuAtPersonInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SNSFeiShuAtPerson',
      async (payload: UpdateSNSFeiShuAtPersonPayload, taskId: string) => {
        let params = _.cloneDeep(payload)

        try {
          const zqlObject: ZqlObject = {
            action: ZQLAction.COUNT,
            tableName: 'SNSFeiShuAtPerson',
            condition: {
              userId: payload.userId
            }
          }
          const zql = ZQL.stringify(zqlObject)
          const { results } = await this.zqlService.call(zql)
          const total = results?.[0]?.total ?? 0

          // userId没有改，不传递给后端，否则后端会做重复性校验，导致在只修改备注的场景下是失败的
          if (total > 0) {
            params = _.omit(params, ['userId'])
          }
        } catch (error) {}

        const resp = await this.updateAction.call(params, { actionId, taskId })

        return {
          id: payload.uuid,
          fields: 'remark,userId,createDate,lastOpDate',
          inventory: resp.inventory
        }
      },
      {
        listenerType: 'MutateSNSFeiShuAtPerson'
      }
    )
    return { actionId }
  }
}
