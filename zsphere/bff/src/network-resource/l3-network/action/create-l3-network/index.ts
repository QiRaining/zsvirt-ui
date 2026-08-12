// 非flow创建
import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { Address6 } from 'ip-address'
import { pick as _pick } from 'lodash'

import { AddDnsToL3NetworkAction } from '@/api/zstack/AddDnsToL3NetworkAction'
import { AddIpRangeAction, AddIpRangeActionParam } from '@/api/zstack/AddIpRangeAction'
import {
  AddIpRangeByNetworkCidrAction,
  AddIpRangeByNetworkCidrActionParam
} from '@/api/zstack/AddIpRangeByNetworkCidrAction'
import { AddIpv6RangeAction, AddIpv6RangeActionParam } from '@/api/zstack/AddIpv6RangeAction'
import {
  AddIpv6RangeByNetworkCidrAction,
  AddIpv6RangeByNetworkCidrActionParam
} from '@/api/zstack/AddIpv6RangeByNetworkCidrAction'
import { AttachL3NetworkToVmAction } from '@/api/zstack/AttachL3NetworkToVmAction'
import {
  AttachNetworkServiceToL3NetworkAction,
  AttachNetworkServiceToL3NetworkActionParam
} from '@/api/zstack/AttachNetworkServiceToL3NetworkAction'
import { ActionInfo } from '@/api/zstack/base/types'
import { CreateL2PortGroupAction } from '@/api/zstack/CreateL2PortGroupAction'
import { CreateL3NetworkAction } from '@/api/zstack/CreateL3NetworkAction'
import { CreatePortGroupAction } from '@/api/zstack/CreatePortGroupAction'
import { QueryL2NetworkAction } from '@/api/zstack/QueryL2NetworkAction'
import { QueryNetworkServiceProviderAction } from '@/api/zstack/QueryNetworkServiceProviderAction'
import {
  SetL3NetworkRouterInterfaceIpAction,
  SetL3NetworkRouterInterfaceIpActionParam
} from '@/api/zstack/SetL3NetworkRouterInterfaceIpAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { CreateL3NetworkInputParam } from '../../l3-network.model'

type IAddIpRange = (AddIpRangeActionParam &
  AddIpRangeByNetworkCidrActionParam &
  AddIpv6RangeActionParam &
  AddIpv6RangeByNetworkCidrActionParam) & {
  ipVersion: 4 | 6 | 46
  dhcpIp?: string
}

@InputType()
export class CreateL3NetworkInput {
  @Field(() => CreateL3NetworkInputParam)
  payload: CreateL3NetworkInputParam

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateL3NetworkActionService extends ActionService {
  @Inject() createL3NetworkAction: CreateL3NetworkAction
  @Inject()
  queryNetworkServiceProviderAction: QueryNetworkServiceProviderAction
  @Inject() queryL2NetworkAction: QueryL2NetworkAction
  @Inject()
  attachNetworkServiceToL3NetworkAction: AttachNetworkServiceToL3NetworkAction
  @Inject()
  setL3NetworkRouterInterfaceIpAction: SetL3NetworkRouterInterfaceIpAction
  @Inject() attachL3NetworkToVmAction: AttachL3NetworkToVmAction
  @Inject() addIpRangeAction: AddIpRangeAction
  @Inject() addIpRangeByNetworkCidrAction: AddIpRangeByNetworkCidrAction
  @Inject() addIpv6RangeAction: AddIpv6RangeAction
  @Inject() addIpv6RangeByNetworkCidrAction: AddIpv6RangeByNetworkCidrAction
  @Inject() addDnsToL3NetworkAction: AddDnsToL3NetworkAction
  @Inject() createL2PortGroupAction: CreateL2PortGroupAction
  @Inject() createPortGroupAction: CreatePortGroupAction

  @Mutation(() => ActionResult)
  createL3Network(@Args('input') input: CreateL3NetworkInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: CreateL3NetworkInputParam, taskId: string) => {
      const taskInfoSetting = {
        actionId,
        taskId
      }

      const inventory = await this.create(payload, taskInfoSetting)

      return {
        id: inventory.uuid
      }
    }

    this.actionHelper(input, 'L3Network', actionFn)
    return { actionId }
  }

  create = async (payload: CreateL3NetworkInputParam, taskInfoSetting: ActionInfo) => {
    const {
      createL3NetworkParam,
      createPortGroupParam,
      addDnsParam,
      addIpRangeParam,
      attachNetworkServiceToL3NetworkParam,
      setInterfaceIpParam,
      attachVpcRouterParam
    } = this.buildL3NetworkParams(payload)

    const { inventory } = await this.createPortGroupAction.call(
      {
        ...createPortGroupParam,
        vSwitchUuid: payload.l2NetworkUuid,
        vlan: createPortGroupParam.vlan
      },
      taskInfoSetting
    )

    const l3NetworkUuid = inventory.uuid

    const taskList = []

    if (!createL3NetworkParam.system) {
      const attachParam = await this.getAttachServiceParam(
        attachNetworkServiceToL3NetworkParam,
        l3NetworkUuid
      )
      if (attachParam) {
        // vcenter网络有不需要挂载网络服务的网络
        await this.attachNetworkServiceToL3NetworkAction.call(
          // 先添加网络服务才能 成功添加dhcp服务
          attachParam,
          taskInfoSetting
        )
      }
    }

    if (createL3NetworkParam.enableIPAM ?? true) {
      taskList.push(this.addIpRange(addIpRangeParam, taskInfoSetting, l3NetworkUuid))
    }
    if (addDnsParam.dns) {
      taskList.push(
        this.addDnsToL3NetworkAction.call(
          {
            ...addDnsParam,
            l3NetworkUuid
          },
          taskInfoSetting
        )
      )
    }

    await Promise.all(taskList) // 添加完网络段之后才能加载路由器

    if (setInterfaceIpParam.routerInterfaceIp) {
      await this.setL3NetworkRouterInterfaceIpAction.call(
        {
          ...setInterfaceIpParam,
          l3NetworkUuid
        } as SetL3NetworkRouterInterfaceIpActionParam,
        taskInfoSetting
      )
    }

    if (attachVpcRouterParam.vmInstanceUuid) {
      await this.attachL3NetworkToVmAction.call(
        {
          ...attachVpcRouterParam,
          l3NetworkUuid
        },
        taskInfoSetting
      )
    }

    return inventory
  }

  getGatewayByCidr(cidr: string, ipVersion: 4 | 6): string {
    const getFromIpv4 = () => {
      const [network, subnet] = cidr.split('/')
      const subnetMask = Number(subnet)
      const subnetMaskInBits = (Math.pow(2, 32) - 1) << (32 - subnetMask)
      const networkAddress = network
        .split('.')
        .reduce((address, byte) => (address << 8) | parseInt(byte), 0)
      const firstIPAddress = (networkAddress & subnetMaskInBits) + 1
      return [
        (firstIPAddress >>> 24) & 0xff,
        (firstIPAddress >>> 16) & 0xff,
        (firstIPAddress >>> 8) & 0xff,
        firstIPAddress & 0xff
      ].join('.')
    }
    const getFromIpv6 = () => {
      const address = new Address6(cidr)
      const startAddress = BigInt('0x' + address.startAddress().canonicalForm().replace(/:/g, ''))
      const startInt = startAddress + BigInt(1)
      const gateway = Address6.fromBigInt(startInt).correctForm()
      return gateway
    }
    return ipVersion === 4 ? getFromIpv4() : getFromIpv6()
  }

  buildL3NetworkParams(actionParam: CreateL3NetworkInputParam) {
    const { hideDns = true } = actionParam
    const addDnsParam = {
      dns: actionParam.dns
    }
    // 手动输入再删除，也需要设置默认dns。
    // 若创建VPC网络未手动指定DNS，创建后DNS改为网关地址 #
    const isVpc = actionParam.showNetworkServiceType === 'Vpc'
    if (!addDnsParam.dns) {
      if (isVpc) {
        addDnsParam.dns = actionParam.gateway
          ? actionParam.gateway
          : this.getGatewayByCidr(actionParam.networkCidr, actionParam.ipVersion as 4 | 6)
      } else {
        // zsv 中如果用户不填写，默认不创建
        if (hideDns) {
          addDnsParam.dns = null
        } else {
          addDnsParam.dns = actionParam.ipVersion === 4 ? '223.5.5.5' : '240c::6666'
        }
      }
    }

    const setInterfaceIpParam = _pick(actionParam, ['routerInterfaceIp'])

    const attachVpcRouterParam = {
      vmInstanceUuid: actionParam.vpcVRouterUuid
    }

    const addIpRangeParam = _pick(actionParam, [
      'name',
      'ipVersion',
      'startIp',
      'endIp',
      'ipRangeType',
      'gateway',
      'addressMode',
      'prefixLen',
      'netmask',
      'dhcpIp',
      'networkCidr'
    ])

    const attachNetworkServiceToL3NetworkParam = _pick(actionParam, [
      'enableIPAM',
      'ipVersion',
      'showNetworkServiceType',
      'dhcpService',
      'l2NetworkUuid',
      'dns'
    ])

    const createL3NetworkParam = _pick(actionParam, [
      'name',
      'description',
      'type',
      'enableIPAM',
      'category',
      'ipVersion',
      'dnsDomain',
      'resourceUuid',
      'system',
      'systemTags',
      'userTags'
    ])

    const createPortGroupParam = _pick(actionParam, [
      'name',
      'description',
      'type',
      'enableIPAM',
      'category',
      'ipVersion',
      'dnsDomain',
      'resourceUuid',
      'system',
      'systemTags',
      'userTags',
      'vlan',
      'vlanMode'
    ])

    if (actionParam.ipAllocateStrategy) {
      const systemTags = createPortGroupParam.systemTags ?? []
      systemTags.push(
        `resourceConfig::l3Network::ipAllocateStrategy::${actionParam.ipAllocateStrategy}Strategy`
      )
      createPortGroupParam.systemTags = systemTags
    }

    return {
      addDnsParam,
      addIpRangeParam,
      attachNetworkServiceToL3NetworkParam,
      createL3NetworkParam,
      createPortGroupParam,
      setInterfaceIpParam,
      attachVpcRouterParam
    }
  }

  getAttachServiceParam = async (param, l3NetworkUuid) => {
    const { showNetworkServiceType, dhcpService, dns, l2NetworkUuid, enableIPAM = true } = param
    if (!['Flat', 'vrouter', 'VirtualRouter', 'Public', 'Vpc'].includes(showNetworkServiceType)) {
      return
    }

    const networkServices = {
      Flat: {},
      vrouter: {},
      VirtualRouter: {}, //arm云路由网络

      Public: {},
      Vpc: {}
    }
    const { inventories } = await this.queryNetworkServiceProviderAction.call({})

    const { inventories: l2NetworkList } = await this.queryL2NetworkAction.call({
      conditions: [{ key: 'uuid', value: l2NetworkUuid }]
    })

    const l2Network = l2NetworkList?.[0] ?? {}
    const isOvsDpdk = l2Network?.vSwitchType === 'OvsDpdk'

    inventories.forEach(({ uuid, type, networkServiceTypes }) => {
      switch (type) {
        case 'SecurityGroup': {
          // 云路由网络的网络服务=vcenter的vpc网络。并且不包括SecurityGroup
          if (showNetworkServiceType !== 'vcenterVpc') {
            for (const key of Object.keys(networkServices)) {
              networkServices[key][uuid] = networkServiceTypes
            }
            // ovsdpdk的二层网络，公有和扁平网络都不要SG的网络服务。
            if (isOvsDpdk) {
              Reflect.deleteProperty(networkServices.Public, uuid)
              Reflect.deleteProperty(networkServices.Flat, uuid)
            }
          }
          break
        }
        case 'vrouter': {
          networkServices.Flat[uuid] = ['LoadBalancer']
          networkServices.vrouter[uuid] = [
            'IPsec',
            'VRouterRoute',
            'CentralizedDNS',
            'VipQos',
            'SNAT',
            'LoadBalancer',
            'PortForwarding',
            'Eip',
            'DNS'
          ]

          networkServices.Vpc[uuid] = [
            'IPsec',
            'VRouterRoute',
            // 'CentralizedDNS',
            'VipQos',
            'SNAT',
            'PortForwarding',
            'Eip',
            'DNS',
            'LoadBalancer'
          ]
          if (!dns) {
            networkServices.Vpc[uuid].push('CentralizedDNS')
          }
          if (dhcpService && isOvsDpdk) {
            networkServices.Vpc[uuid].push('DHCP')
            networkServices.Flat[uuid].push('DHCP')
            networkServices.Public[uuid] = ['DHCP']
          }

          // ipam关闭的扁平网络只有SecurityGroup的安全组
          if (!enableIPAM) {
            Reflect.deleteProperty(networkServices.Flat, uuid)
          }

          break
        }
        case 'VirtualRouter': {
          networkServices.VirtualRouter[uuid] = [
            'SNAT',
            'LoadBalancer',
            'PortForwarding',
            'Eip',
            'DNS'
          ]

          break
        }
        case 'Flat': {
          if (dhcpService) {
            networkServices.Flat[uuid] = networkServiceTypes

            networkServices.Public[uuid] = ['Userdata', 'DHCP', 'HostRoute']
            networkServices.Vpc[uuid] = ['DHCP', 'Userdata']

            if (isOvsDpdk) {
              networkServices.Public[uuid] = ['HostRoute']
              networkServices.Flat[uuid] = ['HostRoute', 'DNS']
              Reflect.deleteProperty(networkServices.Vpc, uuid)
            }
          } else {
            networkServices.Public[uuid] = ['Userdata']
            networkServices.Flat[uuid] = ['Eip', 'Userdata']
            networkServices.Vpc[uuid] = ['Userdata']

            if (isOvsDpdk) {
              Reflect.deleteProperty(networkServices.Public, uuid)
              Reflect.deleteProperty(networkServices.Flat, uuid)
              Reflect.deleteProperty(networkServices.Vpc, uuid)
            }
          }
          networkServices.vrouter[uuid] = ['DHCP', 'Userdata']
          networkServices.VirtualRouter[uuid] = ['DHCP']

          if (!enableIPAM) {
            Reflect.deleteProperty(networkServices.Flat, uuid)
          }
        }
      }
    })

    const _param = {
      l3NetworkUuid,
      networkServices: networkServices[showNetworkServiceType]
    }
    return _param as AttachNetworkServiceToL3NetworkActionParam
  }

  addIpRange = async (input: Partial<IAddIpRange>, taskInfoSetting, l3NetworkUuid) => {
    const { ipVersion, dhcpIp, ...resInput } = input
    const { networkCidr } = resInput
    resInput.l3NetworkUuid = l3NetworkUuid
    resInput.name = networkCidr || `${resInput.startIp}-${resInput.endIp}`

    if (!resInput.gateway) {
      resInput.gateway = undefined
    } // gateway如果为空字符串会报错

    if (dhcpIp) {
      resInput.systemTags = [`flatNetwork::DhcpServer::${dhcpIp.replace('::', '--')}::ipUuid::null`]
    }
    if (ipVersion === 4) {
      return networkCidr
        ? this.addIpRangeByNetworkCidrAction.call(
            resInput as AddIpRangeByNetworkCidrActionParam,
            taskInfoSetting
          )
        : this.addIpRangeAction.call(resInput as AddIpRangeActionParam, taskInfoSetting)
    } else {
      return networkCidr
        ? this.addIpv6RangeByNetworkCidrAction.call(
            resInput as AddIpv6RangeByNetworkCidrActionParam,
            taskInfoSetting
          )
        : this.addIpv6RangeAction.call(resInput as AddIpv6RangeActionParam, taskInfoSetting)
    }
  }
}
