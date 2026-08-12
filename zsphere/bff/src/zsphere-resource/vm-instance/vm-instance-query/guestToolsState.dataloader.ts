import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'

import { GuestToolsStateInfo } from '../vm-instance.model'

@Injectable()
export class GuestToolsStateDataloader extends SimpleDataloaderFactory<GuestToolsStateInfo>({
  tableName: 'GuestToolsState',
  getCondition: uuid => ({ vmInstanceUuid: uuid })
}) {}
