import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'

import { AccessControlRule } from './access-control-rule.model'

@Injectable()
export class AccessControlRuleDataloader extends SimpleDataloaderFactory<AccessControlRule>({
  tableName: 'AccessControlRule'
}) {}
