import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation } from '@nestjs/graphql'

import { AddVmNicToSecurityGroupAction } from '@/api/zstack/AddVmNicToSecurityGroupAction'
import { AttachL3NetworkToVmAction } from '@/api/zstack/AttachL3NetworkToVmAction'
import { CleanUpBareMetal2BondingAction } from '@/api/zstack/CleanUpBareMetal2BondingAction'
import { CreateBareMetal2BondingAction } from '@/api/zstack/CreateBareMetal2BondingAction'
import { UpdateBareMetal2InstanceAction } from '@/api/zstack/UpdateBareMetal2InstanceAction'
import { UpdateVmInstanceAction } from '@/api/zstack/UpdateVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { NicType } from '../vm-nic.model'
import { UpdateVmNetworkConfigService } from './sync-network-config'

@InputType()
export class AttachL3NetworkToVmNicPayload {
  @Field(() => String, { description: '当前网卡的uuid' })
  vmInstanceUuid: string

  @Field(() => String, { description: '三层网的uuid' })
  l3NetworkUuid: string

  @Field(() => String, { description: 'ip4', nullable: true })
  staticIpv4: string

  @Field(() => String, { description: 'ip6', nullable: true })
  staticIpv6?: string

  @Field(() => String, { description: '自定义网卡MAC地址', nullable: true })
  customMac: string

  @Field(() => Boolean, { nullable: true })
  isDefault?: boolean

  @Field(() => Boolean, { nullable: true })
  isBaremetal2Instance?: boolean

  @Field(() => Boolean, { nullable: true })
  enableSRIOV?: boolean

  @Field(() => [String], { nullable: true, defaultValue: [] })
  securityGroupUuids?: string[]

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => NicType, { nullable: true })
  deviceType?: NicType

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => Int, { nullable: true })
  mode?: number

  @Field(() => Int, { nullable: true })
  multiQueueNum?: number

  @Field(() => String, { nullable: true })
  slaves?: string

  @Field(() => String, { nullable: true })
  chassisUuid?: string

  @Field(() => String, { nullable: true })
  vmNicParams?: string

  @Field(() => String, { nullable: true })
  driverType?: string
}

@InputType()
class AttachL3NetworkToVmNicInput {
  @Field(() => [AttachL3NetworkToVmNicPayload])
  payload: AttachL3NetworkToVmNicPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachL3NetworkToVmNicService extends ActionService {
  @Inject() attachL3NetworkToVmAction: AttachL3NetworkToVmAction
  @Inject() updateVmInstanceAction: UpdateVmInstanceAction
  @Inject() UpdateBareMetal2InstanceAction: UpdateBareMetal2InstanceAction
  @Inject() addVmNicToSecurityGroupAction: AddVmNicToSecurityGroupAction
  @Inject() createBareMetal2BondingAction: CreateBareMetal2BondingAction
  @Inject() cleanUpBareMetal2BondingAction: CleanUpBareMetal2BondingAction
  @Inject() updateVmNetworkConfigService: UpdateVmNetworkConfigService

  @Mutation(() => ActionResult)
  attachL3NetworkToVmNic(@Args('input') input: AttachL3NetworkToVmNicInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmNic',
      async (payload: AttachL3NetworkToVmNicPayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: AttachL3NetworkToVmNicPayload, taskId: string, actionId: string) {
    const {
      staticIpv4,
      staticIpv6,
      vmInstanceUuid,
      l3NetworkUuid,
      customMac,
      isDefault,
      enableSRIOV,
      isBaremetal2Instance,
      securityGroupUuids = [],
      chassisUuid,
      deviceType,
      driverType,
      name,
      mode,
      vmNicParams,
      slaves,
      systemTags = []
    } = payload

    if (staticIpv4) {
      systemTags.push(`staticIp::${l3NetworkUuid}::${staticIpv4}`)
    }
    if (staticIpv6) {
      systemTags.push(`staticIp::${l3NetworkUuid}::${staticIpv6.replace('::', '--')}`)
    }

    //
    if (customMac) {
      systemTags.push(`customMac::${l3NetworkUuid}::${customMac}`)
    }

    if (enableSRIOV) {
      systemTags.push('enableSRIOV')
    }

    if (securityGroupUuids.length > 0) {
      systemTags.push(`l3::${l3NetworkUuid}::SecurityGroupUuids::${securityGroupUuids.join(',')}`)
    }

    if (isBaremetal2Instance && deviceType === NicType.Bond) {
      // 后端（耀华）要求，create之前cleanUp一下
      await this.cleanUpBareMetal2BondingAction.call({ chassisUuid }, { actionId, taskId })

      await this.createBareMetal2BondingAction.call(
        {
          chassisUuid,
          name,
          mode,
          slaves
        },
        { actionId, taskId }
      )
    }

    let vmNics
    try {
      const { inventory } = await this.attachL3NetworkToVmAction.call(
        {
          vmInstanceUuid,
          l3NetworkUuid,
          vmNicParams,
          driverType,
          // staticIp,
          customMac,
          systemTags
        },
        {
          actionId,
          taskId
        }
      )

      vmNics = inventory.vmNics ?? []
    } catch (e) {
      if (isBaremetal2Instance && deviceType === NicType.Bond) {
        await this.cleanUpBareMetal2BondingAction.call({ chassisUuid }, { actionId, taskId })
      }
      throw e
    }

    const vmNicUuid = vmNics.find(vmNic => vmNic.l3NetworkUuid === l3NetworkUuid).uuid

    // // 网卡绑定安全组
    // if (securityGroupUuids.length > 0) {
    //   await Promise.all(
    //     securityGroupUuids.map(sgUuid =>
    //       this.addVmNicToSecurityGroupAction.call(
    //         {
    //           vmNicUuids: [vmNicUuid],
    //           securityGroupUuid: sgUuid
    //         },
    //         { actionId, taskId }
    //       )
    //     )
    //   )
    // }

    if (isDefault) {
      const updateFn = isBaremetal2Instance
        ? this.UpdateBareMetal2InstanceAction
        : this.updateVmInstanceAction
      await updateFn.call(
        {
          uuid: vmInstanceUuid,
          defaultL3NetworkUuid: l3NetworkUuid
        },
        {
          actionId,
          taskId
        }
      )
    }

    await this.updateVmNetworkConfigService.syncConfig(
      { vmInstanceUuid, l3NetworkUuid },
      {
        actionId,
        taskId
      }
    )

    return {
      id: payload.vmInstanceUuid,
      nicUuid: vmNicUuid
    }
  }
}
