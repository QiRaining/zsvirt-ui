import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { CheckNetworkReachableAction } from '@/api/zstack/CheckNetworkReachableAction'
import { GetChronyServersAction } from '@/api/zstack/GetChronyServersAction'
import { ActionService } from '@/base/action-service'
import { HostState, HostStatus } from '@/common/enum'
import ZQL, { ZOp } from '@/common/zql/index'
import { Host } from '@/hardware-resource/host/host.model'
import { genUuid } from '@/utils'

import {
  QueryTimeServerReachableArgs,
  TimeServerNode,
  TimeServerRelation,
  TimeServerStatus
} from './time-server.model'
import { InternalTimeServerCandidate } from './time-server.model'

interface IServer {
  hostname: string
  status: string
}

interface IServerRes {
  servers: {
    internal: IServer
    external: IServer
  }[]
}

function mapValuesToArray<T>(map: Map<string, T>): T[] {
  const arr: T[] = []
  for (const value of map.values()) {
    arr.push(value)
  }
  return arr
}

function parseServerData(server: IServer) {
  const node: TimeServerNode = {
    id: genUuid(),
    hostname: server.hostname
  }
  switch (server.status) {
    case 'Connected': {
      node.status = TimeServerStatus.Connected
      break
    }
    case 'Disconnected': {
      node.status = TimeServerStatus.Disconnected
      break
    }
    default:
      node.status = TimeServerStatus.Unknown
  }
  return node
}

@Injectable()
export class TimeServerService extends ActionService {
  @Inject() getChronyServersAction: GetChronyServersAction
  @Inject() checkNetworkReachableAction: CheckNetworkReachableAction
  @Inject() zqlService: ZQLService

  async getTimeServers() {
    const { servers } = (await this.getChronyServersAction.call({})) as IServerRes
    // console.log('getChronyServersAction', servers)
    const internalMap = new Map<string, TimeServerNode>()
    const externalMap = new Map<string, TimeServerNode>()
    const relations: TimeServerRelation[] = []

    servers.forEach(server => {
      const { internal, external } = server
      let internalNode: TimeServerNode, externalNode: TimeServerNode
      if (internal) {
        if (internalMap.has(internal.hostname)) {
          internalNode = internalMap.get(internal.hostname)
        } else {
          internalNode = parseServerData(internal)
          internalMap.set(internal.hostname, internalNode)
        }
      }
      if (external) {
        if (externalMap.has(external.hostname)) {
          externalNode = externalMap.get(external.hostname)
        } else {
          externalNode = parseServerData(external)
          externalMap.set(external.hostname, externalNode)
        }
        // 同时存在代表内外共存
        if (internalNode && externalNode) {
          relations.push({
            source: externalNode.id,
            target: internalNode.id
          })
        }
      }
    })

    return {
      servers: {
        internal: mapValuesToArray(internalMap),
        external: mapValuesToArray(externalMap)
      },
      relations
    }
  }

  async getInternalTimeServerCandidates() {
    const zql = ZQL.multStringify([
      {
        tableName: 'Host',
        fields: ['managementIp'],
        condition: {
          hypervisorType: {
            [ZOp.notIn]: ['ESX', 'baremetal2']
          },
          state: {
            [ZOp.in]: [HostState.Enabled, HostState.Disabled]
          },
          status: {
            [ZOp.eq]: HostStatus.Connected
          }
        }
      },
      {
        tableName: 'ManagementNode',
        fields: ['hostName']
      }
    ])
    const res = await this.zqlService.call(zql)
    const hostList = _.get(res, 'results[0].inventories', []) as Pick<Host, 'managementIp'>[]
    const mnList = _.get(res, 'results[1].inventories', []) as {
      hostName: string
    }[]

    const servers: InternalTimeServerCandidate[] = []

    hostList.forEach(hostItem => {
      servers.push({
        hostname: hostItem.managementIp,
        isManagementNode: false
      })
    })

    mnList.forEach(mnItem => {
      const index = servers.findIndex(serverItem => mnItem.hostName === serverItem.hostname)
      if (index === -1) {
        servers.push({
          hostname: mnItem.hostName,
          isManagementNode: true
        })
      } else {
        servers[index].isManagementNode = true
      }
    })
    // 管理节点排在前面
    const sortedServers = _.orderBy(servers, 'isManagementNode', 'desc')

    return {
      servers: sortedServers
    }
  }

  async queryTimeServerReachable(args: QueryTimeServerReachableArgs) {
    const { internal: sourceHostnames, external: targetHostnames } = args
    const { results } = await this.checkNetworkReachableAction.call({
      sourceHostnames,
      targetHostnames
    })
    const servers = targetHostnames.map(hostname => {
      const reachable = results
        .filter(server => server.targetHostname === hostname)
        .every(server => server.status === TimeServerStatus.Connected)
      return {
        hostname,
        reachable
      }
    })
    return { servers }
  }
}
