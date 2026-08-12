import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'

import { NetworkServices } from '../l3-network.model'

@Injectable()
export class NetworkServiceDataloader extends SimpleDataloaderFactory<NetworkServices>({
  tableName: 'NetworkServiceL3NetworkRef',
  getCondition: uuid => ({ l3NetworkUuid: uuid }),
  result: 'inventories'
}) {}
