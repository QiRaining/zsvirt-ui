import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { DeleteBackupStorageAction } from '@/api/zstack/DeleteBackupStorageAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql/index'
@InputType()
class DeleteZSVBackupStoragePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteZSVBackupStorageInput {
  @Field(() => [DeleteZSVBackupStoragePayload])
  payload: DeleteZSVBackupStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteZSVBackupStorageService extends ActionService {
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() deleteTagAction: DeleteTagAction
  @Inject() deleteBackupStorageAction: DeleteBackupStorageAction
  @Inject() ZQLService: ZQLService

  @Mutation(() => ActionResult)
  deleteZSVBackupStorage(@Args('input') input: DeleteZSVBackupStorageInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: DeleteZSVBackupStoragePayload, taskId: string) => {
      const { uuid } = payload

      // 标记为备份服务器的有两个systemTag: ['allowbackup', 'onlybackup']
      // 'onlybackup': 纯备份服务器的时候在调用删除API DeleteBackupStorage 的时候会一并删除对应tag
      // 'allowbackup': 表示和镜像服务器共用。
      const zqlObject = {
        tableName: 'SystemTag',
        fields: ['uuid', 'tag'],
        condition: {
          resourceUuid: uuid,
          resourceType: 'ImageStoreBackupStorageVO',
          [ZOp.or]: [
            {
              tag: {
                [ZOp.like]: 'backup::network::cidr::' // 备份网络（备份服务器）
              }
            },
            {
              tag: 'allowbackup' // 备份服务器（由镜像服务器升级上来）
            }
          ]
        }
      }
      const zql = ZQL.stringify(zqlObject)

      const { results } = await this.ZQLService.call(zql)
      const tagInventories = _.get(results, ['0', 'inventories'], [])

      const tagUuids = []
      let hasAllowbackupTag = false
      for (const tag of tagInventories) {
        tagUuids.push(tag?.uuid)

        if (tag?.tag == 'allowbackup') {
          hasAllowbackupTag = true
        }
      }

      if (hasAllowbackupTag) {
        await Promise.all(
          _.map(tagUuids, tagUuid =>
            this.deleteTagAction.call(
              { uuid: tagUuid },
              {
                actionId,
                taskId
              }
            )
          )
        )
      } else {
        await this.deleteBackupStorageAction.call(
          { uuid },
          {
            actionId,
            taskId
          }
        )
      }

      return {
        id: actionId
      }
    }

    this.actionHelper(input, 'ZSVBackupStorage', actionFn)
    return { actionId }
  }
}
