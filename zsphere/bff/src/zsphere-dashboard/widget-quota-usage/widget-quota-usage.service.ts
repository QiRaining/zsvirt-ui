import { Inject, Injectable } from '@nestjs/common'
import { uniqBy as _uniqBy, pick as _pick } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  GetAccountQuotaUsageAction,
  GetAccountQuotaUsageResult
} from '@/api/zstack/GetAccountQuotaUsageAction'

@Injectable()
export class WidgetQuotaUsageService {
  @Inject()
  zqlService: ZQLService
  @Inject()
  getAccountQuotaUsageAction: GetAccountQuotaUsageAction

  async getQuota(accountUuid: string) {
    // todo:根据type判断运营管理员，调用对应api
    const result: GetAccountQuotaUsageResult = await this.getAccountQuotaUsageAction.call({
      uuid: accountUuid
    })
    const dataMap = {
      computing: [
        'vm.totalNum',
        'vm.num',
        'vm.cpuNum',
        'vm.memorySize',
        'gpu.num',
        'affinitygroup.num',
        'pci.num'
      ],
      storage: ['image.num', 'image.size', 'volume.data.num', 'volume.capacity'],
      network: [
        'vxlan.num',
        'l3.num',
        'securityGroup.num',
        'vip.num',
        'eip.num',
        'portForwarding.num',
        'loadBalancer.num',
        'listener.num'
      ],
      other: [
        'snapshot.volume.num',
        'volume.backup.num',
        'volume.backup.size',
        'scheduler.num',
        'scheduler.trigger.num',
        'zwatch.alarm.num',
        'zwatch.event.num',
        'sns.endpoint.num',
        'tag2.tag.num'
      ]
    }
    return {
      computing: result.usages.filter(e => dataMap.computing.includes(e.name)),
      storage: result.usages.filter(e => dataMap.storage.includes(e.name)),
      network: result.usages.filter(e => dataMap.network.includes(e.name)),
      other: result.usages.filter(e => dataMap.other.includes(e.name))
    }
  }
}
