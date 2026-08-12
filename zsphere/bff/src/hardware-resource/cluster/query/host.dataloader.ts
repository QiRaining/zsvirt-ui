import { Injectable } from '@nestjs/common'

import { SimpleDataloaderFactory } from '@/common/resource.dataloader'
import { Host } from '@/hardware-resource/host/host.model'

@Injectable()
export class HostDataloader2 extends SimpleDataloaderFactory<Host>({
  tableName: 'Host',
  getCondition: uuid => ({ ['uuid']: uuid })
}) {}
