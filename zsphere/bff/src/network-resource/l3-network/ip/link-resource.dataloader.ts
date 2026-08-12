import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'
import { ZQLAction } from '@/common/zql/index'

@Injectable()
export class VmCountDataloader extends SimpleDataloaderFactory({
  tableName: 'VmNic',
  getCondition: uuid => ({
    ['vmInstance.type']: 'UserVm',
    ['usedIp.ipRangeUuid']: uuid
  }),
  result: 'total',
  zqlAction: ZQLAction.COUNT
}) {}

@Injectable()
export class VRouterCountDataloader extends SimpleDataloaderFactory({
  tableName: 'VmNic',
  getCondition: uuid => ({
    ['vmInstance.type']: 'ApplianceVm',
    ['usedIp.ipRangeUuid']: uuid
  }),
  result: 'total',
  zqlAction: ZQLAction.COUNT
}) {}
