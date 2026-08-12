import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { get as _get, reduce as _reduce } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'

import { EndpointQueryService } from '../zwatch-endpoint/query/query.service'
import { OneClickAlarmTemplate, OneClickAlarm } from './one-click-alarm.model'
import { OneClickAlarmService } from './one-click-alarm.service'

interface Template {
  namespace: string
}
@Injectable()
export class OneClickAlarmDataloader {
  @Inject() oneClickAlarmService: OneClickAlarmService
  @Inject() endpointQueryService: EndpointQueryService

  private oneClickAlarmDataloader
  private templateMap: any = {}

  constructor() {
    this.oneClickAlarmDataloader = new DataLoader(this._query)
  }

  query(uuid, namespace) {
    this.templateMap[uuid] = {
      uuid,
      namespace
    }
    return this.oneClickAlarmDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const namespaces = uuids.map(uuid => this.templateMap[uuid].namespace)
    const resp = await this.oneClickAlarmService.getActiveAlarm(namespaces)

    //将actions字段里的actionUuid，转换成通知对象名称actionsName
    const templates = await Promise.all(
      resp.list.map(async cv => {
        const params = {
          conditions: [
            {
              key: 'topics.uuid',
              op: Op.in,
              values: cv?.actions?.map((cv: any) => cv.actionUuid)
            }
          ]
        }

        const result = await this.endpointQueryService.queryList(params)

        return {
          ...cv,
          actionsName: result.list.map(cv => cv.name),
          endPoint: result.list
        }
      })
    )
    return uuids.map(uuid => {
      const result = templates.filter(
        (template: Template) => template?.namespace === this.templateMap[uuid].namespace
      )
      return result
    })
  }
}
