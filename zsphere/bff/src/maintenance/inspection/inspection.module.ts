import { Module } from '@nestjs/common'

import { CubeModule } from '@/cube/cube.module'

import { InspectionActionModule } from './action/_module'
import { InspectionController } from './inspection.controller'
import { InspectionItemResolver, InspectionResolver } from './inspection.resolver'
import { InspectionService } from './inspection.service'

@Module({
  imports: [InspectionActionModule, CubeModule],
  providers: [InspectionResolver, InspectionItemResolver, InspectionService],
  controllers: [InspectionController]
})
export class InspectionModule {}
