import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { Op } from '@/api/zstack/base/query-base'
// import { BaremetalChassisService } from './baremetal-chassis.service'
import { QueryBaremetalChassisAction } from '@/api/zstack/QueryBaremetalChassisAction'
import { QueryAction } from '@/common/model/action-query.model'

import { BaremetalChassis } from './baremetal-chassis.model'

@Injectable()
export class BaremetalChassisDataloader {
  @Inject() queryBaremetalChassisAction: QueryBaremetalChassisAction

  private baremetalChassisDataLoader: DataLoader<string, BaremetalChassis>

  private params: QueryAction = {}
  private baremetalChassisMap: any = {}

  constructor() {
    this.baremetalChassisDataLoader = new DataLoader(this._query)
  }

  query(uuid, ruleSetUuid, params: QueryAction = {}) {
    this.params = params

    this.baremetalChassisMap[uuid] = {
      uuid,
      ruleSetUuid
    }

    return this.baremetalChassisDataLoader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const ruleSetUuids = uuids.map(uuid => this.baremetalChassisMap[uuid].ruleSetUuid)

    const { conditions = [], ...rest } = this.params

    const params: QueryAction = {
      conditions: [{ key: 'uuid', op: Op.in, values: ruleSetUuids }, ...conditions],
      start: 0,
      limit: 1000,
      ...rest
    }

    const { inventories: list } = await this.queryBaremetalChassisAction.call(params)

    return uuids.map(
      uuid =>
        list.find(
          firewallRuleSet => firewallRuleSet.uuid === this.baremetalChassisMap[uuid].ruleSetUuid
        ) ?? null
    )
  }
}
