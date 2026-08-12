import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import {
  AddStorageProtocolAction,
  AddStorageProtocolActionParam
} from '@/api/zstack/AddStorageProtocolAction'
import { AttachIscsiServerToClusterAction } from '@/api/zstack/AttachIscsiServerToClusterAction'
import {
  AttachPrimaryStorageToClusterAction,
  AttachPrimaryStorageToClusterResult
} from '@/api/zstack/AttachPrimaryStorageToClusterAction'
import { ActionInfo } from '@/api/zstack/base/types'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { DetachPrimaryStorageFromClusterAction } from '@/api/zstack/DetachPrimaryStorageFromClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import zql from '@/common/zql'

@InputType()
class AttachPrimaryStorageToClusterPayload {
  @Field(() => String)
  primaryStorageUuid: string

  @Field(() => String)
  clusterUuid: string

  @Field(() => String, {
    nullable: true,
    description: '主存储是expon时，需要传递协议 iSCSI 给后端'
  })
  outputProtocol?: string

  @Field(() => [String], {
    nullable: true,
    defaultValue: [],
    description:
      '; 因为sharedBlock绑定Cluster，需要Cluster绑定所有sharedBlock已绑定的iscsi服务。所以此iscsiServerUuids为：sharedBlock所有已绑定的iscsi，但Cluster还未绑定的iscsi'
  })
  iscsiServerUuids?: string[]
}

@InputType()
class AttachPrimaryStorageToClusterInput {
  @Field(() => [AttachPrimaryStorageToClusterPayload])
  payload: AttachPrimaryStorageToClusterPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachPrimaryStorageToClusterService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject()
  attachPrimaryStorageToClusterAction: AttachPrimaryStorageToClusterAction
  @Inject()
  detachPrimaryStorageFromClusterAction: DetachPrimaryStorageFromClusterAction

  @Inject() attachIscsiServerToClusterAction: AttachIscsiServerToClusterAction

  @Inject() createSystemTagAction: CreateSystemTagAction

  @Inject() addStorageProtocolAction: AddStorageProtocolAction

  @Mutation(() => ActionResult)
  attachPrimaryStorageToCluster(@Args('input') input: AttachPrimaryStorageToClusterInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: AttachPrimaryStorageToClusterPayload, taskId: string) => {
        const jobAttachIscsiServerUuids = []
        if (payload?.iscsiServerUuids?.length > 0) {
          const list =
            payload?.iscsiServerUuids.map(it => {
              return this.attachIscsiServerToClusterAction
                .call(
                  {
                    clusterUuid: payload?.clusterUuid,
                    uuid: it
                  },
                  { actionId, taskId }
                )
                .then(() => {
                  jobAttachIscsiServerUuids.push(it)
                })
            }) || []
          await Promise.allSettled(list)
        }

        const { outputProtocol, ...params } = payload

        const result: AttachPrimaryStorageToClusterResult =
          await this.attachPrimaryStorageToClusterAction.call(params, {
            actionId,
            taskId
          })

        await this.addStorageProtocol(
          {
            outputProtocol,
            uuid: params.primaryStorageUuid
          },
          { actionId, taskId }
        )

        // 这样的回滚写法会导致UI上 action 的状态显示不准，需等 冬晴完成对 action 的改造后补充
        // try {
        //   await this.addStorageProtocol({
        //     outputProtocol,
        //     uuid: params.primaryStorageUuid
        //   })
        // } catch (error) {
        //   await this.detachPrimaryStorageFromClusterAction.call({
        //     primaryStorageUuid: params.primaryStorageUuid,
        //     clusterUuid: params.clusterUuid
        //   })
        // }

        if (jobAttachIscsiServerUuids?.length < payload?.iscsiServerUuids?.length) {
          throw new Error('')
        }
        return {
          id: payload.primaryStorageUuid,
          fields: 'attachedClusterUuids',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }

  async addStorageProtocol(
    { uuid, outputProtocol }: AddStorageProtocolActionParam,
    info: ActionInfo = {}
  ) {
    if (!outputProtocol) {
      return
    }

    // vhost主存储加载bm2集群后，需要把iSCSI协议加到主存储中, 但协议只能添加一次，重复添加接口会报错，所以需要先查询下
    const { results = [] } = await this.zqlService.call(
      zql.stringify({
        tableName: 'PrimaryStorage',
        condition: {
          uuid
        }
      })
    )
    const outputProtocols = _.get(results, [
      '0',
      'inventories',
      '0',
      'outputProtocols' // 该字段后端zql没有提供，无法按需获取
    ])

    if (!outputProtocols?.includes('iSCSI')) {
      await this.addStorageProtocolAction.call(
        {
          uuid,
          outputProtocol
        },
        info
      )
    }
  }
}
