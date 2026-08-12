import { Inject, Injectable } from '@nestjs/common'

import { Op, QueryParam } from '@/api/zstack/base/query-base'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'

const findTagValue = (list: any[], name: string) => {
  const target = list.find(item => item.tag.includes(`${name}::`))
  const value = target?.tag?.split(`${name}::`)[1]
  return value || ''
}

@Injectable()
export class PowerSupplyService {
  @Inject() querySystemTagAction: QuerySystemTagAction

  async getTags(hostUuid: string): Promise<any> {
    const systemTagParams: QueryParam = {
      conditions: [{ key: 'resourceUuid', op: Op.eq, value: hostUuid }],
      start: 0,
      limit: 1000
    }
    const { inventories: tagList = [] } = await this.querySystemTagAction.call(systemTagParams)
    const manufacturer = findTagValue(tagList, 'powerSupplyManufacturer')
    const model = findTagValue(tagList, 'powerSupplyModelName')
    const ratedPower = findTagValue(tagList, 'powerSupplyMaxPowerCapacity')
    return {
      manufacturer,
      model,
      ratedPower
    }
  }
}
