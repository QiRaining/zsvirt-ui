import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'

import { Bond } from './bond.model'

@Injectable()
export class BondDataloader extends SimpleDataloaderFactory<Bond>({
  tableName: 'HostNetworkBonding'
}) {}
