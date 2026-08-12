import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateSystemTagAction, CreateSystemTagResult } from '@/api/zstack/CreateSystemTagAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { ReconnectHostAction } from '@/api/zstack/ReconnectHostAction'
import { UpdateSystemTagAction, UpdateSystemTagResult } from '@/api/zstack/UpdateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql/index'

@InputType()
class UpdatePrimaryStorageCephxPayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean)
  cephx: boolean

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  cephxReconnect: boolean
}

@InputType()
class UpdatePrimaryStorageCephxInput {
  @Field(() => UpdatePrimaryStorageCephxPayload)
  payload: UpdatePrimaryStorageCephxPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdatePrimaryStorageCephxService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() reconnectHostAction: ReconnectHostAction
  @Inject() deleteTagAction: DeleteTagAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() updateSystemTagAction: UpdateSystemTagAction
  @Inject() createSystemTagAction: CreateSystemTagAction

  @Mutation(() => ActionResult)
  updatePrimaryStorageCephx(@Args('input') input: UpdatePrimaryStorageCephxInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'PrimaryStorageVO', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: UpdatePrimaryStorageCephxPayload, taskId: string) => {
      const { uuid, cephx, cephxReconnect } = payload
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
            op: Op.eq,
            value: 'ceph::nocephx'
          }
        ]
      }

      if (cephx) {
        await this.createSystemTagAction.call(
          {
            resourceType: 'PrimaryStorageVO',
            resourceUuid: uuid,
            tag: `ceph::nocephx`
          },
          {
            actionId,
            taskId
          }
        )
      } else {
        const resp = await this.querySystemTagAction.call(params)
        await this.deleteTagAction.call(
          {
            uuid: resp?.inventories?.[0]?.uuid
          },
          {
            actionId,
            taskId
          }
        )
      }

      if (cephxReconnect) {
        const zql = ZQL.stringify({
          tableName: 'host',
          fields: ['uuid'],
          condition: {
            clusterUuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'primaryStorageClusterRef',
                  fields: ['clusterUuid'],
                  condition: {
                    primaryStorageUuid: uuid
                  }
                }
              }
            }
          }
        })
        const hostResp = await this.zqlService.call(zql)
        const hostUuidList = _.map(_.get(hostResp, ['results', '0', 'inventories']), it => it.uuid)
        const tasks = []
        let p = null
        hostUuidList.forEach(uuid => {
          p = this.reconnectHostAction.call({
            uuid
          })
          tasks.push(p)
        })
        // 这里先不等待物理机重连，后续会加入物理机重连的反馈
        // await Promise.all(tasks)
        Promise.all(tasks)
        return {
          id: uuid
        }
      }

      return {
        id: uuid
      }
    }
  }
}
