import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { AddKVMHostAction } from '@/api/zstack/AddKVMHostAction'
import { AttachTagToResourcesAction } from '@/api/zstack/AttachTagToResourcesAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { ExpandSdsAction } from './ExpandSdsAction'

@InputType()
class AddKVMHostFromScanPayload {
  @Field(() => String)
  username: string

  @Field(() => String)
  password: string

  @Field(() => Int, { nullable: true })
  sshPort: number

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  managementIp: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => [String], { nullable: true })
  tagUuids: string[]

  @Field(() => [String], { nullable: true })
  systemTags: string[]

  @Field(() => String, { nullable: true })
  monitorNodeIp: string

  @Field(() => String, { nullable: true })
  expandNodeIp: string

  @Field(() => String, { nullable: true })
  expandNodeUser: string

  @Field(() => String, { nullable: true })
  expandNodePassword: string

  @Field(() => String, { nullable: true })
  expandNodeHostname: string

  @Field(() => String, { nullable: true })
  poolUuid: string
}

@InputType()
class AddKVMHostFromScanInput {
  @Field(() => [AddKVMHostFromScanPayload])
  payload: AddKVMHostFromScanPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddKVMHostFromScanService extends ActionService {
  @Inject() addKVMHostAction: AddKVMHostAction
  @Inject() expandSdsAction: ExpandSdsAction
  @Inject() attachTagToResourcesAction: AttachTagToResourcesAction

  @Mutation(() => ActionResult)
  addKVMHostFromScan(@Args('input') input: AddKVMHostFromScanInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostVO',
      async (payload: AddKVMHostFromScanPayload, taskId: string) => {
        const {
          tagUuids = [],
          monitorNodeIp,
          expandNodeIp,
          expandNodeUser,
          expandNodePassword,
          expandNodeHostname,
          poolUuid,
          ...hostParams
        } = payload
        if (monitorNodeIp && expandNodeIp) {
          const expandParams = {
            monitorNodeIp,
            expandNodeIp,
            expandNodeUser,
            expandNodePassword,
            expandNodeHostname,
            poolUuid
          }
          await this.expandSdsAction.call(expandParams, { actionId, taskId })
        }
        const { inventory } = await this.addKVMHostAction.call(
          {
            ...hostParams
          },
          { actionId, taskId }
        )
        const hostUuid = inventory?.uuid
        if (hostUuid) {
          const task = tagUuids.map(tagUuid =>
            this.attachTagToResourcesAction.call({
              tagUuid,
              resourceUuids: [hostUuid]
            })
          )
          await Promise.all(task)
        }
        return {
          id: hostUuid,
          inventory
        }
      }
    )
    return { actionId }
  }
}
