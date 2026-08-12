import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Condition as ICondition, Op } from '@/api/zstack/base/query-base'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { InstanceOfferingService } from '@/zsphere-resource/instance-offering/instance-offering.service'

@Injectable()
export class InstanceOfferingDataloader {
  @Inject() instanceOfferingService: InstanceOfferingService

  private instanceOfferingDataloader
  private instanceOfferingMap: any = {}

  constructor() {
    this.instanceOfferingDataloader = new DataLoader(this._query)
  }
  query(uuid, instanceOfferingUuid) {
    this.instanceOfferingMap[uuid] = {
      uuid,
      instanceOfferingUuid
    }
    return this.instanceOfferingDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const instanceOfferingUuids = uuids.map(
      uuid => this.instanceOfferingMap[uuid].instanceOfferingUuid
    )
    const params: IQueryAction = {
      conditions: [{ key: 'uuid', op: Op.in, values: instanceOfferingUuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.instanceOfferingService.query(params)
    const instanceOfferings = resp.list
    return uuids.map(uuid => {
      const instanceOffering = instanceOfferings.find(
        instanceOffering =>
          instanceOffering.uuid === this.instanceOfferingMap[uuid].instanceOfferingUuid
      )
      if (instanceOffering) {
        return instanceOffering
      } else {
        return null
      }
    })
  }
}
