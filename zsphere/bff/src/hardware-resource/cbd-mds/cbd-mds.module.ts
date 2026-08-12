import { Module } from '@nestjs/common'

import { PrimaryStorageQueryService } from '../primary-storage/primary-storage-query/primary-storage-query.service'
import { CbdMdsActionModule } from './action/_module'
import { CbdMdsResolver } from './cbd-mds.resolver'
import { CbdMdsService } from './cbd-mds.service'

@Module({
  imports: [CbdMdsActionModule],
  providers: [CbdMdsService, CbdMdsResolver, PrimaryStorageQueryService]
})
export class CbdMdsModule {}
