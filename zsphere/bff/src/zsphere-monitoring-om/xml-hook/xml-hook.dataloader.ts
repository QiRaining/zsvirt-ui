import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'

@Injectable()
export class XmlHookDataloader extends SimpleDataloaderFactory({
  tableName: 'XmlHook'
}) {}
