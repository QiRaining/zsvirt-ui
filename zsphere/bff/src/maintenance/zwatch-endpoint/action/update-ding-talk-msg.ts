import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import { AddSNSDingTalkAtPersonAction } from '@/api/zstack/AddSNSDingTalkAtPersonAction'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { RemoveSNSDingTalkAtPersonAction } from '@/api/zstack/RemoveSNSDingTalkAtPersonAction'
import { UpdateSNSDingTalkEndpointAction } from '@/api/zstack/UpdateSNSDingTalkEndpointAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { AtPersonInput } from './create-feishu-endpoint'

@InputType()
class UpdateDingTalkMsgPayload {
  @Field(() => String, { description: '当前通知对象的 uuid' })
  uuid: string

  @Field(() => String, { description: '修改后的密钥', nullable: true })
  secret?: string

  @Field(() => String, { nullable: true })
  url?: string

  @Field(() => Boolean, {
    nullable: true,
    description: `提示群成员：@所有人 / @指定人 / 无
                  true => @所有人，
                  false => @指定人或者无，
                  当 atPersonList 为空时，则为无，否则为@指定人`
  })
  atAll?: boolean

  @Field(() => [AtPersonInput], {
    nullable: true,
    description: '即将被添加的@人员'
  })
  atPersonList?: AtPersonInput[]
}

@InputType()
class UpdateDingTalkMsgInput {
  @Field(() => UpdateDingTalkMsgPayload)
  payload: UpdateDingTalkMsgPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateDingTalkMsgService extends ActionService {
  @Inject() updateAction: UpdateSNSDingTalkEndpointAction
  @Inject() removeAtPersonAction: RemoveSNSDingTalkAtPersonAction
  @Inject() addAtPersonAction: AddSNSDingTalkAtPersonAction
  @Inject() zqlService: ZQLService

  @Mutation(() => ActionResult)
  updateDingTalkMsg(@Args('input') input: UpdateDingTalkMsgInput) {
    const { actionId } = input.action

    this.actionHelper(
      input,
      'DingTalkEndPoint',
      async (payload: UpdateDingTalkMsgPayload, taskId: string) => {
        const { atPersonList, ...params } = payload

        /**
         * 若修改了提示群成员，此时需要删掉所有人，否则 atPersonList 还会返回数据到 ui，导致 ui 渲染出错，
         * 因为 ui 上渲染提示群成员的类型是 无 的逻辑是依据 atPersonList 为空且 atAll 为 false
         *
         * 1. 指定人改成无时，atAll = false, atPersonLis = []
         * 2. 指定人改成所有人时，atAll = true
         */
        if (payload.hasOwnProperty('atAll')) {
          const willBeRemovedAtPersonList = await this.getWillBeRemovedAtPersonList(payload.uuid)

          if (willBeRemovedAtPersonList) {
            await Promise.all(
              willBeRemovedAtPersonList.map(({ phoneNumber }) =>
                this.removeAtPersonAction.call(
                  {
                    phoneNumber,
                    endpointUuid: payload.uuid
                  },
                  { actionId, taskId }
                )
              )
            )
          }

          if (atPersonList?.length) {
            await Promise.all(
              atPersonList.map(item =>
                this.addAtPersonAction.call(
                  {
                    remark: item.remark,
                    phoneNumber: item.phoneNumber,
                    endpointUuid: payload.uuid
                  },
                  { actionId, taskId }
                )
              )
            )
          }
        }

        const resp = await this.updateAction.call(params, {
          actionId,
          taskId
        })

        return {
          id: resp.inventory.uuid,
          inventory: {
            ...resp.inventory,
            atPersonListCount: (resp.inventory as any).atPersonList?.length
          },
          fields: 'secret,atAll,atPersonListCount,lastOpDate'
        }
      }
    )
    return { actionId }
  }

  async getWillBeRemovedAtPersonList(endpointUuid: string): Promise<{ phoneNumber: string }[]> {
    try {
      const zqlObject: ZqlObject = {
        tableName: 'SNSDingTalkAtPerson',
        fields: ['phoneNumber'],
        condition: {
          endpointUuid
        }
      }
      const zql = ZQL.stringify(zqlObject)

      const { results } = await this.zqlService.call(zql)
      return results?.[0]?.inventories ?? []
    } catch (error) {}
  }
}
