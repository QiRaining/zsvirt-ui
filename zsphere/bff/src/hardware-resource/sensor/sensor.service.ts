import { Inject, Injectable } from '@nestjs/common'

import { GetHostSensorsAction } from '@/api/zstack/GetHostSensorsAction'

import { QuerySensorArgs } from './sensor.model'

const defaultSensorTypes = ['Temperature', 'Current', 'Voltage', 'Fan']

@Injectable()
export class SensorService {
  @Inject() private getHostSensorsAction: GetHostSensorsAction

  async querySensorList(params: QuerySensorArgs) {
    const uuid = params.conditions?.find(item => item.key === 'hostUuid')?.value
    const types = params.conditions?.find(item => item.key === 'type')?.values || defaultSensorTypes

    const { sensors = [] } = await this.getHostSensorsAction.call({ uuid })

    let list = sensors
    if (types) {
      list = list.filter(sensor => types.includes(sensor.type))
    }
    list = list.sort((a, b) => a.name.localeCompare(b.name))

    const total = list.length
    const start = params.start || 0
    const limit = params.limit || total
    list = list.slice(start, start + limit)

    return { list, total }
  }
}
