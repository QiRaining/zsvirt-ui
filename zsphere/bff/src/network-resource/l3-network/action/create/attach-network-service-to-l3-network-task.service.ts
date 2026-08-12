import { Injectable, Inject } from '@nestjs/common'

import { AttachNetworkServiceToL3NetworkAction } from '@/api/zstack/AttachNetworkServiceToL3NetworkAction'
import { QueryNetworkServiceProviderAction } from '@/api/zstack/QueryNetworkServiceProviderAction'
import { FlowTaskBase } from '@/base/flow-task-base'

//  后续可以根据这个jira更改挂载网络服务的流程。
@Injectable()
export class AttachNetworkServiceToL3NetworkTaskService extends FlowTaskBase {
  @Inject()
  private attachNetworkServiceToL3NetworkAction: AttachNetworkServiceToL3NetworkAction
  @Inject()
  private queryNetworkServiceProviderAction: QueryNetworkServiceProviderAction

  async action(task) {
    const apiId = task.taskId
    const param: AttachNetworkServiceToL3NetworkParam = task.input.param
    const { showNetworkServiceType, dhcpService } = param
    if (!['Flat', 'vrouter', 'VirtualRouter', 'Public', 'Vpc'].includes(showNetworkServiceType)) {
      return
    }

    const rootTask = await this.flowInstanceService.getRootTask(task.mainJobId)

    const prevTask = await this.flowInstanceService.getPrevFromRoot(task.taskId, rootTask)

    const l3NetworkUuid = prevTask.result.inventory.uuid

    const networkServices = {
      Flat: {},
      vrouter: {},
      VirtualRouter: {}, //arm云路由网络
      Public: {},
      Vpc: {}
    }
    const { inventories } = await this.queryNetworkServiceProviderAction.call({})

    inventories.forEach(({ uuid, type, networkServiceTypes }) => {
      switch (type) {
        case 'SecurityGroup': {
          // 云路由网络的网络服务=vcenter的vpc/public网络。并且不包括SecurityGroup
          if (!['vcenterVpc', 'vcenterPublic'].includes(showNetworkServiceType)) {
            for (const key of Object.keys(networkServices)) {
              networkServices[key][uuid] = networkServiceTypes
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
            'CentralizedDNS',
            'VipQos',
            'SNAT',
            'PortForwarding',
            'Eip',
            'DNS',
            'LoadBalancer'
          ]

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

            networkServices.Public[uuid] = ['Userdata', 'DHCP']

            networkServices.Vpc[uuid] = ['DHCP', 'Userdata']
          } else {
            networkServices.Flat[uuid] = ['Eip']
          }
          networkServices.vrouter[uuid] = ['DHCP', 'Userdata']
          networkServices.VirtualRouter[uuid] = ['DHCP']
        }
      }
    })

    const _param = {
      l3NetworkUuid,
      networkServices: networkServices[showNetworkServiceType]
    }

    const rt = await this.attachNetworkServiceToL3NetworkAction.call(_param, {
      actionId: task.input.info.actionId,
      taskId: task.input.info.taskId,
      apiId
    })
    return rt
  }
}

export interface AttachNetworkServiceToL3NetworkParam {
  ipVersion: number
  showNetworkServiceType: string // 用于区别创建时的类型，判断应该挂载哪些网络服务
  dhcpService: boolean
}
