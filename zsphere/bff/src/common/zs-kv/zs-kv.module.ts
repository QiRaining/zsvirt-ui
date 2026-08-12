import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsKv } from '@/model/zs-kv.model'

import { ZsKvResolver } from './zs-kv.resolver'
import { ZsKvService } from './zs-kv.service'

@Module({
  imports: [SequelizeModule.forFeature([ZsKv])],
  providers: [ZsKvResolver, ZsKvService],
  exports: []
})
export class ZsKvModule {}
