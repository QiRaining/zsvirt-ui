import { Module } from '@nestjs/common'

import { QuerySpecialTreeService } from './query/query-special-tree.service'
import { SpecialTreeResolver } from './special-tree.resolver'

@Module({
  providers: [QuerySpecialTreeService, SpecialTreeResolver]
})
export class SpecialTreeModule {}
