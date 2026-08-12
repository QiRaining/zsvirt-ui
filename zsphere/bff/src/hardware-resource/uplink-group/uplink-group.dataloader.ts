import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'

import { UplinkGroup } from './uplink-group.model'

@Injectable()
export class UplinkGroupDataloader extends SimpleDataloaderFactory<UplinkGroup>({
  tableName: 'UplinkGroup'
}) {}
