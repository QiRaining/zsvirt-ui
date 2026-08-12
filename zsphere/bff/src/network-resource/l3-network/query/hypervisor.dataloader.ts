import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'

@Injectable()
export class HypervisorDataloader extends SimpleDataloaderFactory({
  tableName: 'Host',
  getCondition: uuid => ({ ['cluster.l2Network.uuid']: uuid }),
  fields: ['uuid', 'name', 'hypervisorType'],
  result: 'inventories.[0].hypervisorType'
}) {}
