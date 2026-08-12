import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'

@Injectable()
export class VmGroupDataloader extends SimpleDataloaderFactory({
  tableName: 'VmSchedulingRuleGroup'
}) {}
