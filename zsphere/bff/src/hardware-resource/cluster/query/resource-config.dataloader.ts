import { Injectable } from '@nestjs/common'

import { ResourceConfigDataloaderFactory } from '@/settings/resource-config/resource-config.dataloader'

@Injectable()
export class ResourceConfigNetworkHpDataloader extends ResourceConfigDataloaderFactory({
  category: 'premiumCluster',
  name: 'network.ovsdpdk'
}) {}
