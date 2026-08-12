import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { map as _map } from 'lodash'

import { MonitorGroupService } from '@/maintenance/monitor-group/monitor-group.service'

@Injectable()
export class MonitorGroupDataloader {
  @Inject() monitorGroupService: MonitorGroupService

  private monitorGroupDataloader
  private monitorGroupMap: any = {}

  constructor() {
    this.monitorGroupDataloader = new DataLoader(this._query)
  }

  query(uuid) {
    this.monitorGroupMap[uuid] = {
      uuid
    }
    return this.monitorGroupDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const { list } = await this.monitorGroupService.monitorGroupList({})
    return uuids.map(uuid => {
      let monitorGroup
      list.forEach(item => {
        const monitorUuids = _map(item, 'uuid')
        if (monitorUuids?.indexOf(uuid) > -1) {
          monitorGroup = item
        }
      })
      if (monitorGroup) {
        return monitorGroup
      } else {
        return null
      }
    })
  }
}
