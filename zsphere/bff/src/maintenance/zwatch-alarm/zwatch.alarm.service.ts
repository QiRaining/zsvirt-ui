import { Injectable, Inject } from '@nestjs/common'

import { ChangeAlarmStateAction } from '@/api/zstack/ChangeAlarmStateAction'
import { DeleteAlarmAction } from '@/api/zstack/DeleteAlarmAction'
import { GetMetricLabelValueAction } from '@/api/zstack/GetMetricLabelValueAction'
import { GetPrometheusMetricLabelValueAction } from '@/api/zstack/GetPrometheusMetricLabelValueAction'
import { ActionService } from '@/base/action-service'

import { ZWatchAlarmQueryService } from './zwatch-alarm-query/zwatch-alarm-query.service'

@Injectable()
export class ZWatchAlarmService extends ActionService {
  @Inject() deleteAlarmAction: DeleteAlarmAction
  @Inject() zwatchAlarmQueryService: ZWatchAlarmQueryService
  @Inject() changeAlarmStateAction: ChangeAlarmStateAction
  @Inject() getMetricLabelValueAction: GetMetricLabelValueAction
  @Inject()
  getPrometheusMetricLabelValueAction: GetPrometheusMetricLabelValueAction

  async queryZwatchAlarm(params) {
    return await this.zwatchAlarmQueryService.queryZWatchAlarm(params)
  }

  async queryMetricLabelList(params) {
    // getPrometheusMetricLabelValueAction 接口无法多 labelName 分组，所以做一个限定
    // getMetricLabelValueAction 接口在某些场景下，获取不全
    if (params?.labelNames?.length === 1) {
      const labelName = params?.labelNames?.[0]
      const res = await this.getPrometheusMetricLabelValueAction.call(params)
      const {
        labelValues: { [labelName]: labels = [] }
      } = res ?? {}
      return {
        labels: labels.map(item => {
          return { [labelName]: item }
        })
      }
    }
    return await this.getMetricLabelValueAction.call(params)
  }
}
