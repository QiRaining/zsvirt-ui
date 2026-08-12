import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { AddSchedulerJobToSchedulerTriggerAction } from '@/api/zstack/AddSchedulerJobToSchedulerTriggerAction'
import { QueryParam, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAccountAction } from '@/api/zstack/QueryAccountAction'
import { QuerySchedulerJobAction } from '@/api/zstack/QuerySchedulerJobAction'
import { QuerySchedulerJobHistoryAction } from '@/api/zstack/QuerySchedulerJobHistoryAction'
import { QuerySchedulerTriggerAction } from '@/api/zstack/QuerySchedulerTriggerAction'
import { QueryVolumeAction } from '@/api/zstack/QueryVolumeAction'
import { RemoveSchedulerJobFromSchedulerTriggerAction } from '@/api/zstack/RemoveSchedulerJobFromSchedulerTriggerAction'
import { UpdateSchedulerJobAction } from '@/api/zstack/UpdateSchedulerJobAction'
import { ActionService } from '@/base/action-service'

@Injectable()
export class SchedulerJobService extends ActionService {
  @Inject() querySchedulerJobAction: QuerySchedulerJobAction
  @Inject() updateSchedulerJobAction: UpdateSchedulerJobAction
  @Inject()
  addSchedulerJobToSchedulerTriggerAction: AddSchedulerJobToSchedulerTriggerAction
  @Inject()
  removeSchedulerJobFromSchedulerTriggerAction: RemoveSchedulerJobFromSchedulerTriggerAction
  @Inject() querySchedulerTriggerAction: QuerySchedulerTriggerAction
  @Inject() queryAccountAction: QueryAccountAction
  @Inject() queryVolumeAction: QueryVolumeAction
  @Inject() querySchedulerJobHistoryAction: QuerySchedulerJobHistoryAction
  @Inject() zqlService: ZQLService

  private schedulerTriggerDataloader
  private schedulerJobGroupDataloader
  private accountDataloader
  private volumeDataloader

  private schedulerTriggerMap: any = {}
  private schedulerJobGroupMap: any = {}
  private accountMap: any = {}
  private volumeMap: any = {}

  constructor() {
    super()
    this.schedulerTriggerDataloader = new DataLoader(this._getSchedulerTrigger)
    this.accountDataloader = new DataLoader(this._getAccount)
    this.volumeDataloader = new DataLoader(this._getVolume)
  }

  getSchedulerTrigger(uuid, schedulerTriggerUuid) {
    this.schedulerTriggerMap[uuid] = {
      uuid,
      schedulerTriggerUuid
    }
    return this.schedulerTriggerDataloader.load(uuid)
  }

  _getSchedulerTrigger = async (uuids: string[]) => {
    const schedulerTriggerUuids = uuids.map(
      uuid => this.schedulerTriggerMap[uuid].schedulerTriggerUuid
    )
    const params: QueryParam = {
      conditions: [{ key: 'uuid', values: schedulerTriggerUuids, op: Op.in }],
      start: 0,
      limit: 1000
    }
    const schedulerTriggerResp = await this.querySchedulerTriggerAction.call(params)
    const schedulerTriggers = schedulerTriggerResp.inventories
    return uuids.map(uuid => {
      const schedulerTrigger = schedulerTriggers.find(
        schedulerTrigger =>
          schedulerTrigger.uuid === this.schedulerTriggerMap[uuid].schedulerTriggerUuid
      )
      if (schedulerTrigger) {
        return schedulerTrigger
      } else {
        return null
      }
    })
  }

  getAccount(uuid, accountUuid) {
    this.accountMap[uuid] = {
      uuid,
      accountUuid
    }
    return this.accountDataloader.load(uuid)
  }

  _getAccount = async (uuids: string[]) => {
    const accountUuids = uuids.map(uuid => this.accountMap[uuid].accountUuid)
    const params: QueryParam = {
      conditions: [{ key: 'uuid', values: accountUuids, op: Op.in }],
      start: 0,
      limit: 1000
    }
    const accountResp = await this.queryAccountAction.call(params)
    const accounts = accountResp.inventories
    return uuids.map(uuid => {
      const account = accounts.find(account => account.uuid === this.accountMap[uuid].accountUuid)
      if (account) {
        return account
      } else {
        return null
      }
    })
  }

  getVolume(uuid, volumeUuid) {
    this.volumeMap[uuid] = {
      uuid,
      volumeUuid
    }
    return this.volumeDataloader.load(uuid)
  }

  _getVolume = async (uuids: string[]) => {
    const volumeUuids = uuids.map(uuid => this.volumeMap[uuid].volumeUuid)
    const params: QueryParam = {
      conditions: [{ key: 'uuid', values: volumeUuids, op: Op.in }],
      start: 0,
      limit: 1000
    }
    const volumeResp = await this.queryVolumeAction.call(params)
    const volumes = volumeResp.inventories
    return uuids.map(uuid => {
      const volume = volumes.find(volume => volume.uuid === this.volumeMap[uuid].volumeUuid)
      if (volume) {
        return volume
      } else {
        return null
      }
    })
  }
}
