import { Injectable, Inject } from '@nestjs/common'
import { uniq as _uniq } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetVmAttachableL3NetworkAction } from '@/api/zstack/GetVmAttachableL3NetworkAction'
import { GetVmNicAttachedNetworkServiceAction } from '@/api/zstack/GetVmNicAttachedNetworkServiceAction'
import { QueryPortGroupAction } from '@/api/zstack/QueryPortGroupAction'
import { ActionService } from '@/base/action-service'
import ZQL, { ZOp, ZQLAction } from '@/common/zql/index'
import {
  CheckMacAvailabilityParam,
  CheckVNicIpAvailabilityParam
} from '@/zsphere-resource/vm-nic/vm-nic.model'

@Injectable()
export class VmNicService extends ActionService {
  @Inject() getVmAttachableL3NetworkAction: GetVmAttachableL3NetworkAction
  @Inject()
  getVmNicAttachedNetworkServiceAction: GetVmNicAttachedNetworkServiceAction
  @Inject() zqlService: ZQLService
  @Inject() queryPortGroupAction: QueryPortGroupAction

  async getVmAttachableL3Network(param) {
    const { inventories } = await this.getVmAttachableL3NetworkAction.call(param)
    return inventories
  }

  getVmNicAttachedNetworkService(params: { vmNicUuid: string }) {
    return this.getVmNicAttachedNetworkServiceAction.call(params)
  }

  async checkMacAvailability(input: CheckMacAvailabilityParam) {
    const zql = {
      action: ZQLAction.COUNT,
      tableName: 'VmNic',
      condition: {
        mac: input.mac
      }
    }
    const res = await this.zqlService.call(ZQL.stringify(zql))
    return {
      available: res?.results?.[0]?.total === 0
    }
  }

  async checkVNicIpAvailability(input: CheckVNicIpAvailabilityParam) {
    const l3Uuids = []
    let duplicateIps = []
    let zql = ''

    if (input.l3NetworkUuid && input.ipVersion && input.ip) {
      zql = ZQL.stringify({
        tableName: 'UsedIp',
        condition: {
          'l3Network.l2Network.l3Network.uuid': input.l3NetworkUuid,
          ipVersion: input.ipVersion,
          ip: input.ip
        },
        returnWith: {
          total: true
        }
      })
    }

    if (input.vmNicUuids && input.ipVersion) {
      zql = ZQL.multStringify(
        input.vmNicUuids.map(vmNicUuid => ({
          tableName: 'UsedIp',
          condition: {
            vmNicUuid: {
              [ZOp.ne]: vmNicUuid
            },
            'l3Network.l2Network.l3Network.vmNic.uuid': vmNicUuid,
            ip: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'UsedIp.ip',
                  condition: {
                    vmNicUuid: vmNicUuid
                  }
                }
              }
            }
          }
        }))
      )
    }

    const res = await this.zqlService.call(zql)

    const usedIpList = []

    res?.results?.forEach(({ inventories }) => {
      usedIpList.push(...inventories)
    })

    usedIpList.forEach(usedIp => {
      l3Uuids.push(usedIp.l3NetworkUuid)
      duplicateIps = _uniq(duplicateIps.concat(usedIp.ip))
    })

    const l3NetworkRes = await this.queryPortGroupAction.call({
      conditions: [
        {
          key: 'uuid',
          op: ZOp.in,
          values: l3Uuids
        }
      ]
    })

    return {
      available: duplicateIps.length === 0,
      duplicateIps,
      l3Network: l3NetworkRes?.inventories ?? []
    }
  }
}
