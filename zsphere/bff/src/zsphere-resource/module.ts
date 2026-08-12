import { Module } from '@nestjs/common'

import { BaremetalModule } from './baremetal/baremetal.module'
import { SpecialTreeModule } from './special-tree/special-tree.module'

@Module({
  imports: [BaremetalModule, SpecialTreeModule]
})
export class ResourceModule {}
