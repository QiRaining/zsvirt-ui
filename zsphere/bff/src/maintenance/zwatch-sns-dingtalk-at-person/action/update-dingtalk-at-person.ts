import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { UpdateAtPersonOfAtDingTalkEndpointAction } from '@/api/zstack/UpdateAtPersonOfAtDingTalkEndpointAction'
import { ActionService } from '@/base/action-service'
import { Op } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZQLAction } from '@/common/zql'
import ZQL from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

@InputType()
class UpdateSNSDingTalkAtPersonPayload {
  @Field(() => String, { description: '当前修改人员的 uuid' })
  uuid: string

  @Field(() => String, { nullable: true })
  phoneNumber?: string

  @Field(() => String)
  endpointUuid: string

  @Field(() => String, { nullable: true })
  remark?: string
}

@InputType()
class UpdateSNSDingTalkAtPersonInput {
  @Field(() => [UpdateSNSDingTalkAtPersonPayload])
  payload: UpdateSNSDingTalkAtPersonPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateSNSDingTalkAtPersonService extends ActionService {
  @Inject() updateAction: UpdateAtPersonOfAtDingTalkEndpointAction
  @Inject() zqlService: ZQLService

  @Mutation(() => ActionResult)
  updateSNSDingTalkAtPerson(@Args('input') input: UpdateSNSDingTalkAtPersonInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'SNSDingTalkAtPerson',
      async (payload: UpdateSNSDingTalkAtPersonPayload, taskId: string) => {
        let params = _.cloneDeep(payload)

        try {
          const zqlObject: ZqlObject = {
            action: ZQLAction.COUNT,
            tableName: 'SNSDingTalkAtPerson',
            condition: {
              phoneNumber: payload.phoneNumber
            }
          }
          const zql = ZQL.stringify(zqlObject)
          const { results } = await this.zqlService.call(zql)
          const total = results?.[0]?.total ?? 0

          // 手机号没有改，不传递给后端，否则后端会做重复性校验，导致在只修改备注的场景下是失败的
          if (total > 0) {
            params = _.omit(params, ['phoneNumber'])
          }
        } catch (error) {}

        const resp = await this.updateAction.call(params, { actionId, taskId })

        return {
          id: payload.uuid,
          fields: 'remark,phoneNumber,createDate,lastOpDate',
          inventory: resp.inventory
        }
      },
      {
        listenerType: 'MutateSNSDingTalkAtPerson'
      }
    )
    return { actionId }
  }
}
