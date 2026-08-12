import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField } from '@nestjs/graphql'

import { Sensor, QuerySensorArgs, QuerySensorResp } from './sensor.model'
import { SensorService } from './sensor.service'

@Resolver(() => Sensor)
export class SensorResolver {
  @Inject() sensorService: SensorService

  @Query(() => QuerySensorResp)
  async sensorList(@Args() args: QuerySensorArgs) {
    return this.sensorService.querySensorList(args)
  }

  @ResolveField()
  lastUpdateTime() {
    return new Date().getTime()
  }
}
