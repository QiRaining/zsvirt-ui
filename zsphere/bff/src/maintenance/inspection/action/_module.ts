import { Module } from '@nestjs/common'

import { CubeModule } from '@/cube/cube.module'

import { InspectionResolver } from '../inspection.resolver'
import { InspectionService } from '../inspection.service'
import { CreateInspectionTaskAction } from './CreateInspectionTaskAction'
import ExtendsLongJob from './extends-longJob'
import { QueryInspectionTaskAction } from './QueryInspectionTaskAction'
import { QueryZQLAction } from './QueryZQLAction'
import { UpdateInspectionCronAction } from './UpdateInspectionCronAction'
import { UpdateInspectionTaskAction } from './UpdateInspectionTaskAction'
import { UpdateInspectionTaskReadStatusAction } from './UpdateInspectionTaskReadStatusAction'

@Module({
  imports: [CubeModule],
  providers: [
    QueryInspectionTaskAction,
    QueryZQLAction,
    CreateInspectionTaskAction,
    ExtendsLongJob,
    UpdateInspectionTaskAction,
    UpdateInspectionTaskReadStatusAction,
    UpdateInspectionCronAction,
    InspectionService,
    InspectionResolver
  ],
  exports: [QueryInspectionTaskAction, QueryZQLAction]
})
export class InspectionActionModule {}
