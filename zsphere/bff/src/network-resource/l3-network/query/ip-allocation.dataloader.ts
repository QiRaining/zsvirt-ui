import { Injectable } from '@nestjs/common'

import { ResourceConfigDataloaderFactory } from '@/settings/resource-config/resource-config.dataloader'

@Injectable()
export class ResourceConfigIpAllocateStrategyDataloader extends ResourceConfigDataloaderFactory({
  category: 'l3Network',
  name: 'ipAllocateStrategy'
}) {}
