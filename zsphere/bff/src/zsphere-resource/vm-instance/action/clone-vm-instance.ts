import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation } from '@nestjs/graphql'

import { CloneVmInstanceAction, CloneVmInstanceResult } from '@/api/zstack/CloneVmInstanceAction'
import { ActionService } from '@/base/action-service'
import {
  ActionInput,
  ActionResult,
  ActionTaskResult,
  ActionTaskState
} from '@/common/model/action.model'
import { genUuid } from '@/utils'

import { ZSVNicConfig } from './zsv/create-instance'

const escapeSystemTagValue = (value: string) => value.replace(/::/g, '--')

const getCloneVmHostnameSystemTags = (hostname: string, count: number) => {
  const safeHostname = escapeSystemTagValue(hostname)
  return Array.from({ length: count }, (_, index) =>
    count === 1 ? `hostname::${safeHostname}` : `hostname::${safeHostname}-${index + 1}`
  )
}

@InputType()
class CloneVmInstancePayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => Int)
  count: number

  @Field(() => String)
  name: string

  @Field(() => [String], { nullable: true })
  names: string[]

  @Field(() => String, { nullable: true })
  strategy?: string

  @Field(() => String, { nullable: true })
  primaryStorageUuidForRootVolume?: string

  @Field(() => String, { nullable: true })
  primaryStorageUuidForDataVolume?: string

  @Field(() => Boolean, { nullable: true })
  full?: boolean

  @Field(() => [String], { defaultValue: [] })
  rootVolumeSystemTags?: any[]

  @Field(() => [String], { defaultValue: [] })
  dataVolumeSystemTags?: any[]

  @Field(() => [String], { defaultValue: [] })
  systemTags?: any[]

  @Field(() => Boolean, { nullable: true })
  resetTpm?: boolean

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => [ZSVNicConfig], { nullable: true })
  vmNicConfig?: ZSVNicConfig[]

  @Field(() => [String], { nullable: true })
  l3NetworkUuids?: string[]

  @Field(() => String, { nullable: true })
  defaultL3NetworkUuid?: string

  @Field(() => String, { nullable: true })
  vmNicParams?: string
}

@InputType()
class CloneVmInstanceInput {
  @Field(() => [CloneVmInstancePayload])
  payload: CloneVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CloneVmInstanceService extends ActionService {
  @Inject() cloneVmInstanceAction: CloneVmInstanceAction

  private appendNicSystemTags(payload: CloneVmInstancePayload) {
    const systemTags = payload.systemTags ?? []
    const l3NetworkUuids: string[] = []

    payload.vmNicConfig?.forEach(vmNic => {
      if (vmNic.systemTags) {
        systemTags.push(...vmNic.systemTags)
      }

      if (vmNic.l3NetworkUuid) {
        l3NetworkUuids.push(vmNic.l3NetworkUuid)
      }

      if (vmNic.customMac) {
        systemTags.push(`customMac::${vmNic.l3NetworkUuid}::${vmNic.customMac}`)
      }

      if (vmNic.staticIp) {
        systemTags.push(`staticIp::${vmNic.l3NetworkUuid}::${escapeSystemTagValue(vmNic.staticIp)}`)
      }

      if (vmNic.staticIpv6) {
        systemTags.push(
          `staticIp::${vmNic.l3NetworkUuid}::${escapeSystemTagValue(vmNic.staticIpv6)}`
        )
      }

      if (vmNic.ipv4Netmask) {
        systemTags.push(
          `ipv4Netmask::${vmNic.l3NetworkUuid}::${escapeSystemTagValue(vmNic.ipv4Netmask)}`
        )
      }

      if (vmNic.ipv6Prefix) {
        systemTags.push(`ipv6Prefix::${vmNic.l3NetworkUuid}::${vmNic.ipv6Prefix}`)
      }

      if (vmNic.ipv4Gateway) {
        systemTags.push(
          `ipv4Gateway::${vmNic.l3NetworkUuid}::${escapeSystemTagValue(vmNic.ipv4Gateway)}`
        )
      }

      if (vmNic.ipv6Gateway) {
        systemTags.push(
          `ipv6Gateway::${vmNic.l3NetworkUuid}::${escapeSystemTagValue(vmNic.ipv6Gateway)}`
        )
      }

      if (vmNic?.securityGroupList?.length > 0) {
        const { l3NetworkUuid, securityGroupList } = vmNic
        systemTags.push(`l3::${l3NetworkUuid}::SecurityGroupUuids::${securityGroupList.join(',')}`)
      }
    })

    payload.systemTags = systemTags

    if (l3NetworkUuids.length > 0) {
      payload.l3NetworkUuids = l3NetworkUuids
      payload.defaultL3NetworkUuid = payload.defaultL3NetworkUuid ?? l3NetworkUuids[0]
    }

    delete payload.vmNicConfig
  }

  @Mutation(() => ActionResult)
  async cloneVmInstance(@Args('input') input: CloneVmInstanceInput) {
    const {
      action: { actionId, name: actionName }
    } = input
    const payload = input?.payload?.[0]
    const count: number = payload.count
    const names: string[] = []
    if (count > 1) {
      for (let i = 1; i < count + 1; i++) {
        names.push(`${payload.name}-${i}`)
      }
    } else {
      names.push(payload.name)
    }
    delete payload.count
    payload.names = names
    if (payload.hostname) {
      payload.systemTags = [
        ...(payload.systemTags ?? []),
        ...getCloneVmHostnameSystemTags(payload.hostname, count)
      ]
      delete payload.hostname
    }
    this.appendNicSystemTags(payload)

    let errorCount = 0
    let flattenErrorCount = 0
    const fn = async () => {
      await this.recordActionService.recordActionStart(payload, actionId, actionName)
      const taskId = genUuid()
      await this.recordActionService.recordTaskStart(taskId, actionId)

      const _payload: ActionTaskResult = {
        sessionId: this.getSessionId(),
        actionId: actionId,
        state: ActionTaskState.success,
        type: 'VmInstance',
        id: payload.vmInstanceUuid
      }
      try {
        const result: CloneVmInstanceResult = await this.cloneVmInstanceAction.call(
          { ...payload },
          { actionId, taskId }
        )
        const errorList = result.result.inventories.filter(item => item?.error)
        const flattenErrorList = errorList?.filter(item => item?.error?.code === 'VOLUME.1001')
        errorCount = errorList?.length
        flattenErrorCount = flattenErrorList?.length
        if (errorCount) {
          await this.recordActionService.recordApiFailed(taskId)
          if (flattenErrorCount || errorCount < names.length) {
            _payload.state = ActionTaskState.exception
            await this.recordActionService.recordTaskException(taskId)
          } else {
            _payload.state = ActionTaskState.fail
            await this.recordActionService.recordTaskFailed(taskId)
            throw { error: errorList }
          }
        } else {
          await this.recordActionService.recordTaskSuccess(taskId)
        }
      } catch (error) {
        _payload.state = ActionTaskState.fail
        await this.recordActionService.recordApiFailed(taskId)
        await this.recordActionService.recordTaskFailed(taskId)
        throw error
      } finally {
        this.pubSubService.response(_payload)
      }
    }

    try {
      await fn()
      if (errorCount) {
        if (flattenErrorCount || errorCount < names.length) {
          await this.recordActionService.recordActionException(actionId)
        } else {
          await this.recordActionService.recordActionFailed(actionId)
        }
      } else {
        await this.recordActionService.recordActionSuccess(actionId)
      }
    } catch {
      await this.recordActionService.recordActionFailed(actionId)
    }

    return { actionId }
  }
}
