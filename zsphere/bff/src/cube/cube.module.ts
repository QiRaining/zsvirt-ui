import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { BootstrapResolver, CubeResolver, SdsResolver } from './cube.resolver'
import { CubeService } from './cube.service'
import { GetSdsInfoAction } from './GetSdsVersionAction'

@Module({
  imports: [HttpModule],
  providers: [CubeResolver, CubeService, BootstrapResolver, GetSdsInfoAction, SdsResolver],
  exports: [CubeService]
})
export class CubeModule {}
