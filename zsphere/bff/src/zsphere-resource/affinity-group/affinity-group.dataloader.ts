import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'

@Injectable()
export class AffinityGroupDataloader extends SimpleDataloaderFactory({
  tableName: 'AffinityGroup'
}) {}
